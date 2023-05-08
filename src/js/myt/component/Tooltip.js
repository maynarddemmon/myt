(pkg => {
    let tooltipView;
    
    const JSClass = JS.Class,
        G = pkg.global,
        GlobalMouse = G.mouse,
        GlobalWindowResize = G.windowResize,
        
        math = Math,
        mathMin = math.min,
        mathMax = math.max,
        mathRound = math.round,
        
        tooltipDomId = 'tooltipDiv',
        
        /*  Clears the tooltip timer. */
        clearCheckTipTimer = ttView => {
            if (ttView.__checkTID) {
                clearTimeout(ttView.__checkTID);
                delete ttView.__checkTID;
            }
        },
        
        /*  Checks if the last mouse position is inside the tip's parent. If not inside the tip 
            will also get hidden.
            @returns {boolean} false if the tip got hidden, true otherwise. */
        checkInTooltip = ttView => {
            if (ttView.tooltip) {
                const pos = ttView._lastPos;
                if (ttView.tooltip.parent.containsPoint(pos.x, pos.y)) return true;
            }
            ttView.hideTip();
            return false;
        },
        
        /** A base class for tooltip classes.
            
            Attributes:
                tooltip:object The tooltip configuration assigned to this tooltip when the mouse 
                    has moved over a view with TooltipMixin.
                tipDelay:number The time in millis to wait before showing the tooltip.
                tipHideDelay:number The time in millis to wait before hiding the tooltip.
            
            Private Attributes:
                __checkTID:number The timer ID used internally for delaying when the tip gets shown.
            
            @class */
        BaseTooltip = pkg.BaseTooltip = new JSClass('BaseTooltip', pkg.View, {
            include: [pkg.RootView],
            
            
            // Class Methods and Attributes ////////////////////////////////////
            extend: {
                /** The default length of time in millis before the tip is shown. */
                TIP_DELAY: 500,
                
                /** The default length of time in millis before the tip is hidden. */
                TIP_HIDE_DELAY: 100
            },
            
            
            // Life Cycle //////////////////////////////////////////////////////
            initNode: function(parent, attrs) {
                this.tipDelay = this.nextTipDelay = BaseTooltip.TIP_DELAY;
                this.tipHideDelay = BaseTooltip.TIP_HIDE_DELAY;
                
                attrs.visible ??= false;
                
                this.callSuper(parent, attrs);
            },
            
            
            // Accessors ///////////////////////////////////////////////////////
            /** Sets the tooltip info that will be displayed. 
                @param v {Object} The object has the following keys:
                    parent:myt.View The view to show the tip for.
                    text:string The tip text.
                    tipalign:string Tip alignment, 'left' or 'right'.
                    tipvalign:string Tip vertical alignment, 'above' or 'below'.
                @returns {undefined} */
            setTooltip: function(v) {
                if (this.inited) {
                    this.tooltip = v;
                    if (v) {
                        this.attachToDom(GlobalMouse, '__hndl_mousemove', 'mousemove', true);
                        this.attachToDom(v.parent, 'hideTip', 'mousedown', true);
                        this.attachToDom(v.parent, 'hideTip', 'mouseup', true);
                    }
                }
            },
            
            
            // Methods /////////////////////////////////////////////////////////
            /** @private
                @param {!Object} event The event object.
                @returns {undefined} */
            __hndl_mousemove: function(event) {
                const self = this;
                self._lastPos = pkg.MouseObservable.getMouseFromEvent(event);
                if (checkInTooltip(self)) {
                    clearCheckTipTimer(self);
                    self.__checkTID = setTimeout(
                        () => {
                            delete self.__checkTID;
                            
                            // If the mouse rests in the tooltip's parent, show the tooltip.
                            if (checkInTooltip(self)) self.showTip();
                        },
                        self.nextTipDelay
                    );
                }
            },
            
            /** Called when the tip will be hidden.
                @param {!Object} event The event object.
                @returns {boolean} */
            hideTip: function(event) {
                clearCheckTipTimer(this);
                
                const ttp = this.tooltip.parent;
                this.detachFromDom(ttp, 'hideTip', 'mousedown', true);
                this.detachFromDom(ttp, 'hideTip', 'mouseup', true);
                this.detachFromDom(GlobalMouse, '__hndl_mousemove', 'mousemove', true);
                
                this.nextTipDelay = this.tipDelay;
                this.setVisible(false);
                
                // Don't consume mouse event since we just want to close the tip as a side effect 
                // of the user action. The typical case for this is the user clicking on a button 
                // while the tooltip for that button is shown.
                return true;
            },
            
            /** Called when the tip will be shown.
                @returns {undefined} */
            showTip: function() {
                // Don't show tooltips while doing drag and drop since tooltips are distracting 
                // while this is going on.
                if (!G.dragManager.getDragView()) {
                    this.nextTipDelay = this.tipHideDelay;
                    this.bringToFront();
                    this.setVisible(true);
                }
            }
        }),
        
        /** An implementation of a tooltip.
            
            Attributes:
                edgeSize:number the thickness of the "edge" of the tip background.
                edgeColor:string The color used for the edge.
                shadowSize:number The thickness of the shadow.
                shadowColor:string The color of the shadow.
                insetH:number The horizontal inset of the text from the edge.
                insetV:number The vertical inset of the text from the edge.
                tipBgColor:string The color to use for the tip background.
                tipTextColor:string The color to use for the tip text.
            
            @class */
        Tooltip = pkg.Tooltip = new JSClass('Tooltip', BaseTooltip, {
            // Class Methods and Attributes ////////////////////////////////////
            extend: {
                EDGE_SIZE: 0,
                EDGE_COLOR: '#444',
                SHADOW_SIZE: 2,
                SHADOW_COLOR: '#00000033', // Extra nums are opacity
                HORIZONTAL_INSET: 6,
                VERTICAL_INSET: 3,
                TIP_BG_COLOR: '#444',
                TIP_TEXT_COLOR: '#eee'
            },
            
            
            // Life Cycle //////////////////////////////////////////////////////
            initNode: function(parent, attrs) {
                attrs.edgeSize ??= Tooltip.EDGE_SIZE;
                attrs.edgeColor ??= Tooltip.EDGE_COLOR;
                attrs.shadowSize ??= Tooltip.SHADOW_SIZE;
                attrs.shadowColor ??= Tooltip.SHADOW_COLOR;
                attrs.insetH ??= Tooltip.HORIZONTAL_INSET;
                attrs.insetV ??= Tooltip.VERTICAL_INSET;
                attrs.tipBgColor ??= Tooltip.TIP_BG_COLOR;
                attrs.tipTextColor ??= Tooltip.TIP_TEXT_COLOR;
                
                this.callSuper(parent, attrs);
                
                new pkg.Text(this, {
                    name:'_tipText', fontSize:'12px',
                    x:this.insetH, y:this.insetV,
                    textColor:this.tipTextColor,
                    whiteSpace:'inherit'
                });
            },
            
            
            // Accessors ///////////////////////////////////////////////////////
            setEdgeSize: function(v) {this.edgeSize = v;},
            setEdgeColor: function(v) {this.edgeColor = v;},
            setShadowSize: function(v) {this.shadowSize = v;},
            setShadowColor: function(v) {this.shadowColor = v;},
            setInsetH: function(v) {this.insetH = v;},
            setInsetV: function(v) {this.insetV = v;},
            setTipBgColor: function(v) {this.tipBgColor = v;},
            setTipTextColor: function(v) {this.tipTextColor = v;},
            
            
            // Methods /////////////////////////////////////////////////////////
            /** @override myt.BaseTooltip. */
            showTip: function() {
                const self = this,
                    tt = self.tooltip,
                    txt = tt.text,
                    ttp = tt.parent,
                    tipText = self._tipText,
                    edgeSize = self.edgeSize,
                    shadowSize = self.shadowSize;
                
                // Size tip text and size it to fit within the maximum text width.
                if (tipText.text !== txt) tipText.setText(txt);
                tipText.setWidth('auto');
                const tipTextWidth = mathMin(tipText.measureNoWrapWidth(), tt.maxTextWidth),
                    tipWidth = tipTextWidth + 2*tipText.x,
                    tipExtentX = tipWidth + 2*edgeSize;
                tipText.setWidth(tipTextWidth);
                tipText.sizeViewToDom();
                
                // Determine position
                const parentPos = ttp.getPagePosition(),
                    tipHeight = tipText.height + 2*tipText.y,
                    tipExtentY = tipHeight + 2*edgeSize,
                    tipY = parentPos.y - tipExtentY + (tt.tipvalign === 'below' ? ttp.height + tipExtentY : 0);
                let tipX = parentPos.x;
                switch (tt.tipalign) {
                    case 'right':
                        tipX -= tipExtentX;
                        // Fall through
                    case 'farright':
                        tipX += ttp.width;
                        break;
                    case 'farleft':
                        tipX -= tipExtentX;
                        break;
                    default: // left
                }
                
                // Apply values and prevent out-of-bounds
                self.setX(mathRound(mathMin(mathMax(tipX, 0), GlobalWindowResize.getWidth() - tipExtentX)));
                self.setY(mathRound(mathMin(mathMax(tipY, 0), GlobalWindowResize.getHeight() - tipExtentY)));
                self.setWidth(tipWidth);
                self.setHeight(tipHeight);
                self.setBgColor(self.tipBgColor);
                self.setBorder([edgeSize, 'solid', self.edgeColor]);
                self.setBoxShadow([shadowSize, shadowSize, shadowSize, self.shadowColor]);
                
                self.callSuper();
            }
        }),
        
        /** A mixin that adds tooltip support to a view.
            
            Requires:
                myt.MouseOver
            
            Events:
                tooltip:string
                tipAlign:string
                tipValign:string
                tipClass:JS.Class
            
            Attributes:
                tooltip:string The tip text to display.
                tipAlign:string The horizontal alignment of the tooltip relative to the view the 
                    tip is being shown for. Supported values are 'left', 'farleft', 'right' and 
                    'farright'. Defaults to 'left'.
                tipValign:string The vertical alignment of the tooltip relative to the view the 
                    tip is being shown for. Supported values are 'above' and 'below'. Defaults 
                    to 'above'.
                maxTextWidth:number The maximum width of the tooltip text.
                tipClass:JS.Class The class to use to instantiate the tooltip.
            
            @class */
        TooltipMixin = pkg.TooltipMixin = new JS.Module('TooltipMixin', {
            // Class Methods and Attributes ////////////////////////////////////
            extend: {
                /** The default class to use for tooltip views. If a project wants to use a special 
                    tip class everywhere it should override this. */
                TIP_CLASS: Tooltip,
                MAX_TEXT_WIDTH: 280
            },
            
            
            // Accessors ///////////////////////////////////////////////////////
            setTooltip: function(v) {
                // Supresses the myt.View tooltip behavior.
                this.callSuper('');
                
                this.set('tooltip', v, true);
            },
            getTooltip: function() {return this.tooltip;},
            setTipAlign: function(v) {this.set('tipAlign', v, true);},
            setTipValign: function(v) {this.set('tipValign', v, true);},
            setMaxTextWidth: function(v) {this.set('maxTextWidth', v, true);},
            setTipClass: function(v) {this.set('tipClass', v, true);},
            
            
            // Methods /////////////////////////////////////////////////////////
            /** @overrides myt.MouseOver. */
            doSmoothMouseOver: function(isOver) {
                const self = this,
                    tooltip = self.getTooltip();
                
                self.callSuper(isOver);
                
                if (isOver && tooltip) {
                    // Use configured class or default if none defined.
                    const tipClass = self.tipClass ?? TooltipMixin.TIP_CLASS;
                    
                    // Destroy tip if it's not the correct class.
                    if (tooltipView && !(tooltipView instanceof tipClass)) {
                        tooltipView.destroy();
                        tooltipView = null;
                    }
                    
                    // Create new instance.
                    if (!tooltipView) {
                        // Create tooltip div if necessary
                        let elem = document.getElementById(tooltipDomId);
                        if (!elem) {
                            elem = pkg.DomElementProxy.createElement('div', {position:'absolute'});
                            
                            // Make the div a child of the body element so it can be in front of 
                            // pretty much anything in the document.
                            pkg.getElement().appendChild(elem);
                        }
                        tooltipView = new tipClass(elem, {domId:tooltipDomId});
                    }
                    
                    tooltipView.setTooltip({
                        parent:self, 
                        text:tooltip, 
                        tipalign:self.tipAlign, 
                        tipvalign:self.tipValign,
                        maxTextWidth:self.maxTextWidth || TooltipMixin.MAX_TEXT_WIDTH
                    });
                }
            }
        });
})(myt);

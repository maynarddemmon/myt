(pkg => {
    /*  Tracks how many ModalPanel instances are currently open. */
    let openModalPanelCount = 0;
    
    const JSClass = JS.Class,
        
        {View, SizeToParent, RootView, theme} = pkg,
        
        /** A dimmer that can be placed on another myt.View to obscure the subviews of that view.
            
            Attributes:
                restoreFocus:boolean when true focus will be sent back to the view that had focus 
                    before the dimmer was shown when the dimmer is hidden. Defaults to true.
                prevFocus:myt.View or dom element. The thing to set focus on when the dimmer is 
                    hidden if restoreFocus is true.
            
            @class */
        Dimmer = pkg.Dimmer = new JSClass('Dimmer', View, {
            include: [SizeToParent],
            
            
            // Life Cycle //////////////////////////////////////////////////////
            /** @overrides myt.View */
            initNode: function(parent, attrs) {
                const self = this;
                
                self.restoreFocus = true;
                
                attrs.focusable = attrs.focusCage = true;
                
                attrs.percentOfParentWidth ??= 100;
                attrs.percentOfParentHeight ??= 100;
                attrs.visible ??= false;
                attrs.ignoreLayout ??= true;
                
                self.callSuper(parent, attrs);
                
                self.overlay = new View(self, {
                    ignorePlacement:true, 
                    opacity:theme.DimmerOpacity,
                    bgColor:theme.DimmerColor,
                    percentOfParentWidth:100,
                    percentOfParentHeight:100
                }, [SizeToParent]);
                
                // Eat mouse events
                for (const eventName of ['mouseover','mouseout','mousedown','mouseup','click','dblclick','mousemove']) {
                    self.attachDomObserver(self, 'eatMouseEvent', eventName);
                }
                
                RootView.setupCaptureDrop(self);
            },
            
            /** @overrides myt.View */
            destroy: function() {
                RootView.teardownCaptureDrop(this);
                this.callSuper();
            },
            
            
            // Accessors ///////////////////////////////////////////////////////
            setRestoreFocus: function(v) {this.restoreFocus = v;},
            
            
            // Methods /////////////////////////////////////////////////////////
            /** A handler for mouse events that does nothing and prevents propogation.
                @param {!Object} event
                @return boolean True so that the dom event gets eaten. */
            eatMouseEvent: pkg.TRUE_FUNC, // event => true,
            
            /** Shows the dimmer and remembers the focus location.
                @returns {void} */
            show: function() {
                const self = this,
                    globalFocus = pkg.global.focus;
                self.prevFocus = globalFocus.focusedView ?? globalFocus.focusedDom;
                
                self.makeHighestZIndex();
                
                // Prevent focus traversing
                if (self.focusable) self.focus();
                
                self.setVisible(true);
            },
            
            /** Hides the dimmer and restores focus if necessary.
                @param {boolean} [ignoreRestoreFocus] - When true focus will not be restored.
                @returns {void} */
            hide: function(ignoreRestoreFocus) {
                const self = this;
                if (self.visible) {
                    self.setVisible(false);
                    
                    if (!ignoreRestoreFocus && self.restoreFocus) self.prevFocus?.focus();
                }
            }
        }),
        
        /** An myt.Dimmer that also provides a content panel.
            
            Attributes:
                content:myt.View The content view placed inside the dimmer.
                sizingStrategy:string Determines how the content view is positioned relative to the 
                    bounds of the dimmer. Supported values are:
                        children: The content will be sized to fit the children it contains. The 
                            content will be positioned in the center and middle of the dimmer. This 
                            is the default sizingStrategy
                        parent: The content will be sized to the bounds of the dimmer.
                        basic: The content will not be sized in any way. It will be positioned in 
                            the center and middle of the dimmer.
                        none: The content will not be sized or positioned in any way.
                marginTop:number The margin above the content when the sizingStrategy is "parent". 
                    Defaults to 40 if not provided.
                marginLeft:number The margin on the left side of the content when the 
                    sizingStrategy is "parent". Defaults to 40 if not provided.
                marginBottom:number The margin below the content when the sizingStrategy is 
                    "parent". Defaults to 40 if not provided.
                marginRight:number The margin on the right side of the content when the 
                    sizingStrategy is "parent". Defaults to 40 if not provided.
                paddingX:number The internal horizontal padding when the sizingStrategy is 
                    "children". Defaults to 20 if not provided.
                paddingY:number The internal vertical padding when the sizingStrategy is 
                    "children". Defaults to 15 if not provided.
                
            @class */
        ModalPanel = pkg.ModalPanel = new JSClass('ModalPanel', Dimmer, {
            // Class Methods and Attributes ////////////////////////////////////
            extend: {
                getOpenModalPanelCount: () => openModalPanelCount,
                
                hasOpenModalPanels: () => openModalPanelCount > 0
            },
            
            
            // Life Cycle //////////////////////////////////////////////////////
            initNode: function(parent, attrs) {
                const self = this,
                    viewAttrs = {name:'content', ignorePlacement:true},
                    centeredViewAttrs = {...viewAttrs, align:'center', valign:'middle'};
                
                self.defaultPlacement = 'content';
                
                attrs.sizingStrategy ??= 'children';
                
                // Used for parent sizing strategy
                attrs.marginTop ??= theme.ModalPanelMarginTop;
                attrs.marginLeft ??= theme.ModalPanelMarginLeft;
                attrs.marginBottom ??= theme.ModalPanelMarginBottom;
                attrs.marginRight ??= theme.ModalPanelMarginRight;
                
                // Used for "children" sizing strategy
                attrs.paddingX ??= theme.ModalPanelPaddingX;
                attrs.paddingY ??= theme.ModalPanelPaddingY;
                
                self.callSuper(parent, attrs);
                
                switch (self.sizingStrategy) {
                    case 'children':
                        new pkg.SizeToChildren(new View(self, centeredViewAttrs), {
                            name:'sizeToChildren', axis:'both',
                            paddingX:self.paddingX, 
                            paddingY:self.paddingY
                        });
                        break;
                    case 'parent':
                        new View(self, {
                            ...viewAttrs, 
                            x:self.marginLeft,
                            y:self.marginTop,
                            percentOfParentWidthOffset:-self.marginLeft - self.marginRight,
                            percentOfParentHeightOffset:-self.marginTop - self.marginBottom,
                            percentOfParentWidth:100,
                            percentOfParentHeight:100
                        }, [SizeToParent]);
                        break;
                    case 'basic':
                        new View(self, centeredViewAttrs);
                        break;
                    case 'none':
                    default:
                        new View(self, viewAttrs);
                }
            },
            
            
            // Accessors ///////////////////////////////////////////////////////
            setSizingStrategy: function(v) {this.sizingStrategy = v;},
            
            setMarginTop: function(v) {this.marginTop = v;},
            setMarginLeft: function(v) {this.marginLeft = v;},
            setMarginBottom: function(v) {this.marginBottom = v;},
            setMarginRight: function(v) {this.marginRight = v;},
            
            setPaddingX: function(v) {this.paddingX = v;},
            setPaddingY: function(v) {this.paddingY = v;},
            
            
            // Methods /////////////////////////////////////////////////////////
            /** @overrides myt.Dimmer */
            show: function() {
                this.callSuper();
                openModalPanelCount++;
            },
            
            /** @overrides myt.Dimmer */
            hide: function(ignoreRestoreFocus) {
                this.callSuper(ignoreRestoreFocus);
                openModalPanelCount = Math.max(0, openModalPanelCount - 1);
            }
        });
})(myt);

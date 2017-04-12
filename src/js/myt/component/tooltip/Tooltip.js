/** An implementation of a tooltip.
    
    Events:
        None
    
    Attributes:
        edgeWidth:number the width of the "edge" of the tip background.
        pointerInset:number The inset of the "pointer" from the left/right 
            edge of the tip.
        insetH:number The horizontal inset of the text from the edge.
        insetTop:number The top inset of the text from the edge.
        insetBottom:number The bottom inset of the text from the edge.
        shadowWidth:number The width of the shadow.
        maxTextWidth:number The maximum width for the text view in the tooltip.
        tipBgColor:string The color to use for the tip background.
        edgeColor:string The color used for the edge.
        shadowColor:string The color of the shadow.
    
    Private Attributes:
        __tipWidth:number The width of the tip text view.
*/
myt.Tooltip = new JS.Class('Tooltip', myt.BaseTooltip, {
    // Class Methods and Attributes ////////////////////////////////////////////
    extend: {
        DEFAULT_POINTER_WIDTH:7,
        DEFAULT_POINTER_HEIGHT:4,
        DEFAULT_EDGE_WIDTH:1,
        DEFAULT_POINTER_INSET:2,
        DEFAULT_HORIZONTAL_INSET:4,
        DEFAULT_TOP_INSET:2,
        DEFAULT_BOTTOM_INSET:3,
        DEFAULT_SHADOW_WIDTH:2,
        DEFAULT_MAX_TEXT_WIDTH:280,
        DEFAULT_TIP_BG_COLOR:'#dddddd',
        DEFAULT_EDGE_COLOR:'#666666',
        DEFAULT_SHADOW_COLOR:'#000000'
    },
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    initNode: function(parent, attrs) {
        var self = this,
            M = myt,
            T = M.Tooltip;
        if (attrs.pointerWidth == null) attrs.pointerWidth = T.DEFAULT_POINTER_WIDTH;
        if (attrs.pointerHeight == null) attrs.pointerHeight = T.DEFAULT_POINTER_HEIGHT;
        if (attrs.edgeWidth == null) attrs.edgeWidth = T.DEFAULT_EDGE_WIDTH;
        if (attrs.pointerInset == null) attrs.pointerInset = T.DEFAULT_POINTER_INSET;
        if (attrs.insetH == null) attrs.insetH = T.DEFAULT_HORIZONTAL_INSET;
        if (attrs.insetTop == null) attrs.insetTop = T.DEFAULT_TOP_INSET;
        if (attrs.insetBottom == null) attrs.insetBottom = T.DEFAULT_BOTTOM_INSET;
        if (attrs.shadowWidth == null) attrs.shadowWidth = T.DEFAULT_SHADOW_WIDTH;
        if (attrs.maxTextWidth == null) attrs.maxTextWidth = T.DEFAULT_MAX_TEXT_WIDTH;
        if (attrs.tipBgColor == null) attrs.tipBgColor = T.DEFAULT_TIP_BG_COLOR;
        if (attrs.edgeColor == null) attrs.edgeColor = T.DEFAULT_EDGE_COLOR;
        if (attrs.shadowColor == null) attrs.shadowColor = T.DEFAULT_SHADOW_COLOR;
        
        self.__tipWidth = 0;
        
        self.callSuper(parent, attrs);
        
        new M.Canvas(self, {
            name:'_bg', percentOfParentWidth:100, percentOfParentHeight:100
        }, [M.SizeToParent]);
        new M.Text(self, {
            name:'_tipText', fontSize:'12px',
            x:self.edgeWidth + self.insetH, whiteSpace:'inherit'
        });
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setPointerWidth: function(v) {this.pointerWidth = v;},
    setPointerHeight: function(v) {this.pointerHeight = v;},
    setEdgeWidth: function(v) {this.edgeWidth = v;},
    setPointerInset: function(v) {this.pointerInset = v;},
    setInsetH: function(v) {this.insetH = v;},
    setInsetTop: function(v) {this.insetTop = v;},
    setInsetBottom: function(v) {this.insetBottom = v;},
    setShadowWidth: function(v) {this.shadowWidth = v;},
    setMaxTextWidth: function(v) {this.maxTextWidth = v;},
    setTipBgColor: function(v) {this.tipBgColor = v;},
    setEdgeColor: function(v) {this.edgeColor = v;},
    setShadowColor: function(v) {this.shadowColor = v;},
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** @overrides myt.BaseTooltip. */
    showTip: function() {
        var self = this,
            tt = self.tooltip,
            txt = tt.text,
            ttp = tt.parent,
            tipText = self._tipText,
            insetTop = self.insetTop,
            shadowWidth = self.shadowWidth;
        
        // Set tip text
        if (tipText.text !== txt) tipText.setText(txt);
        
        // Get floating boundary
        var gwr = myt.global.windowResize,
            bounds = {x:0, y:0, width:gwr.getWidth(), height:gwr.getHeight()},
            boundsXOffset = 0, boundsYOffset = 0;
        
        // Get position of parent
        var parentPos = ttp.getPagePosition(),
            tipX = parentPos.x,
            tipParentY = parentPos.y;
        
        // Determine X position
        tipText.setWidth('auto');
        var tipTextWidth = Math.min(tipText.measureNoWrapWidth(), self.maxTextWidth),
            pointerX = tipText.x;
        self.__tipWidth = 2 * pointerX + tipTextWidth;
        tipText.setWidth(tipTextWidth);
        tipText.sizeViewToDom();
        
        if (tt.tipalign === 'right') {
            tipX += ttp.width - self.__tipWidth;
            pointerX += tipText.width - self.pointerInset - self.pointerWidth;
        } else {
            pointerX += self.pointerInset;
        }
        
        // Prevent out-of-bounds to the left
        var diff;
        if (boundsXOffset > tipX) {
            diff = boundsXOffset - tipX;
            tipX += diff;
            pointerX -= diff;
        }
        
        // Prevent out-of-bounds to the right
        if (tipX + self.__tipWidth > boundsXOffset + bounds.width) {
            diff = (tipX + self.__tipWidth) - (boundsXOffset + bounds.width);
            tipX -= diff;
            pointerX += diff;
        }
        
        // Determine Y position
        var tipHeight = 2*self.edgeWidth + insetTop + self.insetBottom + tipText.height + self.pointerHeight,
            tipParentHeight = ttp.height,
            pointerOnTop, tipY;
        switch (tt.tipvalign) {
            case "below":
                tipY = tipParentY + tipParentHeight;
                pointerOnTop = true;
                
                if (tipY + tipHeight > boundsYOffset + bounds.height) {
                    tipY = tipParentY - tipHeight;
                    pointerOnTop = false;
                }
                break;
            
            case "above":
            default:
                tipY = tipParentY - tipHeight;
                pointerOnTop = false;
                
                if (boundsYOffset > tipY) {
                    tipY = tipParentY + tipParentHeight;
                    pointerOnTop = true;
                }
                break;
        }
        
        // Apply values
        self.setX(Math.round(tipX));
        self.setY(Math.round(tipY));
        tipText.setY(insetTop + self.edgeWidth + (pointerOnTop ? self.pointerHeight : 0));
        
        self.setWidth(self.__tipWidth + shadowWidth);
        self.setHeight(tipHeight + shadowWidth);
        
        self.__redraw(pointerX, pointerOnTop);
        
        self.callSuper();
    },
    
    /** @private */
    __redraw: function(pointerX, pointerOnTop) {
        var self = this,
            canvas = self._bg,
            right = self.__tipWidth,
            top = pointerOnTop ? self.pointerHeight : 0,
            bottom = 2*self.edgeWidth + self.insetTop + self.insetBottom + self._tipText.height + top,
            pointerWidth = self.pointerWidth,
            pointerXCtr = pointerX + pointerWidth / 2,
            pointerXRt = pointerX + pointerWidth,
            pointerHeight = self.pointerHeight,
            shadowWidth = self.shadowWidth,
            edgeWidth = self.edgeWidth,
            lineTo = canvas.lineTo.bind(canvas);
        
        canvas.clear();
        
        // Draw Shadow
        canvas.beginPath();
        canvas.moveTo(shadowWidth, top + shadowWidth);
        lineTo(right + shadowWidth, top + shadowWidth);
        lineTo(right + shadowWidth, bottom + shadowWidth);
        lineTo(shadowWidth, bottom + shadowWidth);
        canvas.closePath();
        canvas.setGlobalAlpha(0.3);
        canvas.setFillStyle(self.shadowColor);
        canvas.fill();
        
        canvas.setGlobalAlpha(1);
        
        // Draw Edge
        canvas.beginPath();
        canvas.moveTo(0, top);
        
        if (pointerOnTop) {
            lineTo(pointerX, top);
            lineTo(pointerXCtr, top - pointerHeight);
            lineTo(pointerXRt, top);
        }
        
        lineTo(right, top);
        lineTo(right, bottom);
        
        if (!pointerOnTop) {
            lineTo(pointerXRt, bottom);
            lineTo(pointerXCtr, bottom + pointerHeight);
            lineTo(pointerX, bottom);
        }
        
        lineTo(0, bottom);
        canvas.closePath();
        canvas.setFillStyle(self.edgeColor);
        canvas.fill();
        
        // Draw Fill
        right -= edgeWidth;
        top += edgeWidth;
        bottom -= edgeWidth;
        
        canvas.beginPath();
        canvas.moveTo(edgeWidth, top);
        
        if (pointerOnTop) {
            lineTo(pointerX, top);
            lineTo(pointerXCtr, top - pointerHeight);
            lineTo(pointerXRt, top);
        }
        
        lineTo(right, top);
        lineTo(right, bottom);
        
        if (!pointerOnTop) {
            lineTo(pointerXRt, bottom);
            lineTo(pointerXCtr, bottom + pointerHeight);
            lineTo(pointerX, bottom);
        }
        
        lineTo(edgeWidth, bottom);
        canvas.closePath();
        canvas.setFillStyle(self.tipBgColor);
        canvas.fill();
    }
});

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
        var T = myt.Tooltip;
        if (attrs.pointerWidth === undefined) attrs.pointerWidth = T.DEFAULT_POINTER_WIDTH;
        if (attrs.pointerHeight === undefined) attrs.pointerHeight = T.DEFAULT_POINTER_HEIGHT;
        if (attrs.edgeWidth === undefined) attrs.edgeWidth = T.DEFAULT_EDGE_WIDTH;
        if (attrs.pointerInset === undefined) attrs.pointerInset = T.DEFAULT_POINTER_INSET;
        if (attrs.insetH === undefined) attrs.insetH = T.DEFAULT_HORIZONTAL_INSET;
        if (attrs.insetTop === undefined) attrs.insetTop = T.DEFAULT_TOP_INSET;
        if (attrs.insetBottom === undefined) attrs.insetBottom = T.DEFAULT_BOTTOM_INSET;
        if (attrs.shadowWidth === undefined) attrs.shadowWidth = T.DEFAULT_SHADOW_WIDTH;
        if (attrs.maxTextWidth === undefined) attrs.maxTextWidth = T.DEFAULT_MAX_TEXT_WIDTH;
        if (attrs.tipBgColor === undefined) attrs.tipBgColor = T.DEFAULT_TIP_BG_COLOR;
        if (attrs.edgeColor === undefined) attrs.edgeColor = T.DEFAULT_EDGE_COLOR;
        if (attrs.shadowColor === undefined) attrs.shadowColor = T.DEFAULT_SHADOW_COLOR;
        
        this.__tipWidth = 0;
        
        this.callSuper(parent, attrs);
    },
    
    /** @overrides myt.Node */
    doAfterAdoption: function() {
        this.callSuper();
        
        new myt.Canvas(this, {
            name:'_bg', percentOfParentWidth:100, percentOfParentHeight:100
        }, [myt.SizeToParent]);
        new myt.Text(this, {
            name:'_tipText', domClass:'mytTooltipText',
            x:this.edgeWidth + this.insetH, whiteSpace:'inherit'
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
        var tt = this.tooltip,
            ttp = tt.parent,
            tipText = this._tipText;
        
        // Set tip text
        if (tipText.text !== tt.text) tipText.setText(tt.text);
        
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
        var tipTextWidth = Math.min(tipText.measureNoWrapWidth(), this.maxTextWidth);
        this.__tipWidth = 2 * tipText.x + tipTextWidth;
        tipText.setWidth(tipTextWidth);
        tipText.sizeViewToDom();
        var pointerX = tipText.x + this.pointerInset;
        
        var alignRight = tt.tipalign === 'right';
        if (alignRight) {
            tipX += ttp.width - this.__tipWidth;
            pointerX = tipText.x + tipText.width - this.pointerInset - this.pointerWidth;
        }
        
        // Prevent out-of-bounds to the left
        var diff;
        if (boundsXOffset > tipX) {
            diff = boundsXOffset - tipX;
            tipX += diff;
            pointerX -= diff;
        }
        
        // Prevent out-of-bounds to the right
        if (tipX + this.__tipWidth > boundsXOffset + bounds.width) {
            diff = (tipX + this.__tipWidth) - (boundsXOffset + bounds.width);
            tipX -= diff;
            pointerX += diff;
        }
        
        // Determine Y position
        var tipHeight = 2*this.edgeWidth + this.insetTop + this.insetBottom + tipText.height + this.pointerHeight,
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
        this.setX(Math.round(tipX));
        this.setY(Math.round(tipY));
        tipText.setY(this.insetTop + this.edgeWidth + (pointerOnTop ? this.pointerHeight : 0));
        
        this.setWidth(this.__tipWidth + this.shadowWidth);
        this.setHeight(tipHeight + this.shadowWidth);
        
        this.__redraw(pointerX, pointerOnTop);
        
        this.callSuper();
    },
    
    /** @private */
    __redraw: function(pointerX, pointerOnTop) {
        var tt = this.tooltip,
            tipText = this._tipText;
        
        // Calculate bounds
        var left = 0,
            right = this.__tipWidth,
            top = pointerOnTop ? this.pointerHeight : 0,
            bottom = 2*this.edgeWidth + this.insetTop + this.insetBottom + tipText.height + top,
            canvas = this._bg,
            pointerWidth = this.pointerWidth,
            pointerHeight = this.pointerHeight;
        
        canvas.clear();
        
        // Draw Shadow
        var shadowWidth = this.shadowWidth;
        canvas.beginPath();
        canvas.moveTo(left + shadowWidth, top + shadowWidth);
        canvas.lineTo(right + shadowWidth, top + shadowWidth);
        canvas.lineTo(right + shadowWidth, bottom + shadowWidth);
        canvas.lineTo(left + shadowWidth, bottom + shadowWidth);
        canvas.closePath();
        canvas.setGlobalAlpha(0.3);
        canvas.setFillStyle(this.shadowColor);
        canvas.fill();
        
        canvas.setGlobalAlpha(1);
        
        // Draw Edge
        canvas.beginPath();
        canvas.moveTo(left, top);
        
        if (pointerOnTop) {
            canvas.lineTo(left + pointerX, top);
            canvas.lineTo(left + pointerX + (pointerWidth / 2), top - pointerHeight);
            canvas.lineTo(left + pointerX + pointerWidth, top);
        }
        
        canvas.lineTo(right, top);
        canvas.lineTo(right, bottom);
        
        if (!pointerOnTop) {
            canvas.lineTo(left + pointerX + pointerWidth, bottom);
            canvas.lineTo(left + pointerX + (pointerWidth / 2), bottom + pointerHeight);
            canvas.lineTo(left + pointerX, bottom);
        }
        
        canvas.lineTo(left, bottom);
        canvas.closePath();
        canvas.setFillStyle(this.edgeColor);
        canvas.fill();
        
        // Draw Fill
        var edgeWidth = this.edgeWidth;
        left += edgeWidth;
        right -= edgeWidth;
        top += edgeWidth;
        bottom -= edgeWidth;
        
        canvas.beginPath();
        canvas.moveTo(left, top);
        
        if (pointerOnTop) {
            canvas.lineTo(left + pointerX - edgeWidth, top);
            canvas.lineTo(left + pointerX + (pointerWidth / 2) - edgeWidth, top - pointerHeight);
            canvas.lineTo(left + pointerX + pointerWidth - edgeWidth, top);
        }
        
        canvas.lineTo(right, top);
        canvas.lineTo(right, bottom);
        
        if (!pointerOnTop) {
            canvas.lineTo(left + pointerX + pointerWidth - edgeWidth, bottom);
            canvas.lineTo(left + pointerX + (pointerWidth / 2) - edgeWidth, bottom + pointerHeight);
            canvas.lineTo(left + pointerX - edgeWidth, bottom);
        }
        
        canvas.lineTo(left, bottom);
        canvas.closePath();
        canvas.setFillStyle(this.tipBgColor);
        canvas.fill();
    }
});

/** An implementation of a tooltip. */
myt.Tooltip = new JS.Class('Tooltip', myt.BaseTooltip, {
    // Life Cycle //////////////////////////////////////////////////////////////
    initNode: function(parent, attrs) {
        this.pointerWidth = 7;
        this.pointerHeight = 4;
        this.borderWidth = 1;
        
        // The inset of the "pointer" from the left/right edge of the tip.
        this.pointerInset = 2;
        
        // The horizontal inset of the text from the border.
        this.insetH = 2;
        
        // The top inset of the text from the border.
        this.insetTop = 0;
        
        // The bottom inset of the text from the border.
        this.insetBottom = 1;
        
        // The width of the shadow.
        this.shadowWidth = 2;
        
        // The maximum width for the text view in the tooltip
        this.maxTextWidth = 280;
        
        // The color to use for the tip background.
        this.tipBgColor = '#ffffcc';
        
        // The width of the tip text view.
        this._tipWidth = 0;
        
        this.callSuper(parent, attrs);
    },
    
    /** @overrides myt.Node */
    doAfterAdoption: function() {
        this.callSuper();
        
        new myt.Canvas(this, {
            name:'_bg', percentOfParentWidth:100, percentOfParentHeight:100
        }, [myt.SizeToParent]);
        new myt.Text(this, {name:'_tipText', x:this.borderWidth + this.insetH, whiteSpace:'inherit'});
    },
    
    
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
        this._tipWidth = 2 * tipText.x + tipTextWidth;
        tipText.setWidth(tipTextWidth);
        tipText.sizeViewToDom();
        var pointerX = tipText.x + this.pointerInset;
        
        var alignRight = tt.tipalign === 'right';
        if (alignRight) {
            tipX += ttp.width - this._tipWidth;
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
        if (tipX + this._tipWidth > boundsXOffset + bounds.width) {
            diff = (tipX + this._tipWidth) - (boundsXOffset + bounds.width);
            tipX -= diff;
            pointerX += diff;
        }
        
        // Determine Y position
        var tipHeight = 2*this.borderWidth + this.insetTop + this.insetBottom + tipText.height + this.pointerHeight,
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
        tipText.setY(this.insetTop + this.borderWidth + (pointerOnTop ? this.pointerHeight : 0));
        
        this.setWidth(this._tipWidth + this.shadowWidth);
        this.setHeight(tipHeight + this.shadowWidth);
        
        this._redraw(pointerX, pointerOnTop);
        
        this.callSuper();
    },
    
    _redraw: function(pointerX, pointerOnTop) {
        var tt = this.tooltip,
            tipText = this._tipText;
        
        // Calculate bounds
        var left = 0,
            right = this._tipWidth,
            top = pointerOnTop ? this.pointerHeight : 0,
            bottom = 2*this.borderWidth + this.insetTop + this.insetBottom + tipText.height + top,
            canvas = this._bg;
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
        canvas.setFillStyle(this.getShadowColor());
        canvas.fill();
        
        canvas.setGlobalAlpha(1);
        
        // Draw Border
        canvas.beginPath();
        canvas.moveTo(left, top);
        
        if (pointerOnTop) {
            canvas.lineTo(left + pointerX, top);
            canvas.lineTo(left + pointerX + (this.pointerWidth / 2), top - this.pointerHeight);
            canvas.lineTo(left + pointerX + this.pointerWidth, top);
        }
        
        canvas.lineTo(right, top);
        canvas.lineTo(right, bottom);
        
        if (!pointerOnTop) {
            canvas.lineTo(left + pointerX + this.pointerWidth, bottom);
            canvas.lineTo(left + pointerX + (this.pointerWidth / 2), bottom + this.pointerHeight);
            canvas.lineTo(left + pointerX, bottom);
        }
        
        canvas.lineTo(left, bottom);
        canvas.closePath();
        canvas.setFillStyle(this.getBorderColor());
        canvas.fill();
        
        // Draw Fill
        var borderWidth = this.borderWidth;
        left += borderWidth;
        right -= borderWidth;
        top += borderWidth;
        bottom -= borderWidth;
        
        canvas.beginPath();
        canvas.moveTo(left, top);
        
        if (pointerOnTop) {
            canvas.lineTo(left + pointerX - borderWidth, top);
            canvas.lineTo(left + pointerX + (this.pointerWidth / 2) - borderWidth, top - this.pointerHeight);
            canvas.lineTo(left + pointerX + this.pointerWidth - borderWidth, top);
        }
        
        canvas.lineTo(right, top);
        canvas.lineTo(right, bottom);
        
        if (!pointerOnTop) {
            canvas.lineTo(left + pointerX + this.pointerWidth - borderWidth, bottom);
            canvas.lineTo(left + pointerX + (this.pointerWidth / 2) - borderWidth, bottom + this.pointerHeight);
            canvas.lineTo(left + pointerX - borderWidth, bottom);
        }
        
        canvas.lineTo(left, bottom);
        canvas.closePath();
        canvas.setFillStyle(this.getBgColor());
        canvas.fill();
    },
    
    getBorderColor: function() {
        return '#666666';
    },
    
    getBgColor: function() {
        return this.tipBgColor !== null ? this.tipBgColor : '#cccccc';
    },
    
    getShadowColor: function() {
        return '#000000';
    }
});

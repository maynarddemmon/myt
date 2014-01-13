/** Draws a tab into an myt.Canvas. */
myt.TabDrawingMethod = new JS.Class('TabDrawingMethod', myt.DrawingMethod, {
    // Class Methods and Attributes ////////////////////////////////////////////
    extend: {
        DEFAULT_RADIUS:6
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** @overrides myt.DrawingMethod */
    draw: function(canvas, config) {
        var b = config.bounds, x = b.x, y = b.y, w = b.w, h = b.h;
        
        canvas.clear();
        
        if (w == 0 || h == 0) return;
        
        var inset = config.edgeSize, twiceInset = 2 * inset,
            rTL = 0, rTR = 0, rBL = 0, rBR = 0,
            irTL = 0, irTR = 0, irBL = 0, irBR = 0,
            r = config.cornerRadius === undefined ? myt.TabDrawingMethod.DEFAULT_RADIUS : config.cornerRadius,
            ir = r - inset,
            x2 = x + inset, y2 = y + inset, 
            w2 = w - twiceInset, h2 = h - twiceInset,
            selected = config.selected;
        
        switch (config.location) {
            case 'top':
                rTL = rTR = r;
                irTL = irTR = r;
                if (selected) h2 += inset;
                break;
            case 'right':
                rBR = rTR = r;
                irBR = irTR = r;
                if (selected) {
                    x2 -= inset;
                    w2 += inset;
                }
                break;
            case 'bottom':
                rBL = rBR = r;
                irBL = irBR = r;
                if (selected) {
                    y2 -= inset;
                    h2 += inset;
                }
                break;
            case 'left':
                rTL = rBL = r;
                irTL = irBL = r;
                if (selected) w2 += inset;
                break;
        }
        
        // Border
        if (inset > 0) {
            canvas.beginPath();
            myt.DrawingUtil.drawPartiallyRoundedRect(canvas, rTL, rTR, rBL, rBR, x, y, w, h);
            canvas.closePath();
            canvas.setFillStyle(config.edgeColor);
            canvas.fill();
        }
        
        // Fill
        canvas.beginPath();
        myt.DrawingUtil.drawPartiallyRoundedRect(canvas, irTL, irTR, irBL, irBR, x2, y2, w2, h2);
        canvas.closePath();
        canvas.setFillStyle(config.fillColor);
        canvas.fill();
    }
});

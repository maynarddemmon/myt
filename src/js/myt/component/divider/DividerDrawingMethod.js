/** Draws a divider into an myt.Canvas. */
myt.DividerDrawingMethod = new JS.Class('DividerDrawingMethod', myt.DrawingMethod, {
    // Methods /////////////////////////////////////////////////////////////////
    /** @overrides myt.DrawingMethod */
    draw: function(canvas, config) {
        var b = config.bounds, x = b.x, y = b.y, w = b.w, h = b.h, 
            inset = config.inset, fillColor, bumpColor, grd, bumpSize, bumpLength;
        
        canvas.clear();
        
        if (w == 0 || h == 0) return;
        
        // background
        switch (config.state) {
            case 'hover':
                fillColor = config.hoverFillColor || '#d8d8d8';
                bumpColor = config.hoverBumpColor || '#e8e8e8';
                break;
            case 'active':
                fillColor = config.activeFillColor || '#b8b8b8';
                bumpColor = config.activeBumpColor || '#c8c8c8';
                break;
            case 'ready':
                fillColor = config.focused ? (config.focusedFillColor || '#d8d8d8') : (config.readyFillColor || '#cccccc');
                bumpColor = config.focused ? (config.focusedBumpColor || '#e8e8e8') : (config.readyBumpColor || '#dddddd');
                break;
            case 'disabled':
                fillColor = config.readyFillColor || '#cccccc';
                bumpColor = config.readyBumpColor || '#dddddd';
                break;
        }
        
        if (config.axis === 'y') {
            y += inset;
            h -= 2 * inset;
            grd = canvas.createLinearGradient(x, y, x + w, y);
        } else {
            x += inset;
            w -= 2 * inset;
            bumpSize = w / 2;
            grd = canvas.createLinearGradient(x, y, x, y + h);
        }
        
        canvas.beginPath();
        canvas.rect(x, y, w, h);
        canvas.closePath();
        
        grd.addColorStop(0, config.readyFillColor || '#cccccc');
        grd.addColorStop(0.5, fillColor);
        grd.addColorStop(1, config.readyFillColor || '#cccccc');
        canvas.setFillStyle(grd);
        
        canvas.fill();
        
        // Bumps
        canvas.setFillStyle(bumpColor);
        if (config.axis === 'y') {
            bumpSize = h / 2;
            bumpLength = Math.max(3 * bumpSize, config.bumpMaxLength || 14);
            x = x + (w - bumpLength) / 2;
            y = y + bumpSize / 2;
            
            myt.DrawingUtil.drawRoundedRect(canvas, bumpSize / 2, 0, x, y, bumpLength, bumpSize);
        } else {
            bumpSize = w / 2;
            bumpLength = Math.max(3 * bumpSize, config.bumpMaxLength || 14);
            y = y + (h - bumpLength) / 2;
            x = x + bumpSize / 2;
            
            myt.DrawingUtil.drawRoundedRect(canvas, bumpSize / 2, 0, x, y, bumpSize, bumpLength);
        }
        canvas.fill();
    }
});

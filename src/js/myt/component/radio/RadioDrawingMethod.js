/** Draws a radio button into an myt.Canvas. */
myt.RadioDrawingMethod = new JS.Class('RadioDrawingMethod', myt.DrawingMethod, {
    // Methods /////////////////////////////////////////////////////////////////
    /** @overrides myt.DrawingMethod */
    draw: function(canvas, config) {
        // Setup default if not provided
        if (config.shadowColor === undefined) config.shadowColor = 'rgba(0, 0, 0, 0.3)';
        if (config.focusedShadowColor === undefined) config.focusedShadowColor = 'rgba(0, 0, 0, 0.5)';
        if (config.shadowOffsetX === undefined) config.shadowOffsetX = 0;
        if (config.shadowOffsetY === undefined) config.shadowOffsetY = 1;
        if (config.shadowBlur === undefined) config.shadowBlur = 2;
        
        var b = config.bounds, x = b.x, y = b.y, w = b.w, h = b.h;
        
        canvas.clear();
        
        if (w == 0 || h == 0) return;
        
        var inset = config.edgeSize,
            radius = w / 2,
            twoPi = Math.PI * 2,
            radius2 = radius - inset,
            dotRadius = (radius2 / 2) - 1,
            centerX = x + radius,
            centerY = y + radius;
        
        // Border and shadow
        canvas.save();
        canvas.setShadowOffsetX(config.shadowOffsetX);
        canvas.setShadowOffsetY(config.shadowOffsetY);
        canvas.setShadowBlur(config.shadowBlur * (config.focused ? 2 : 1));
        canvas.setShadowColor(config.focused ? config.focusedShadowColor : config.shadowColor);
        
        canvas.beginPath();
        canvas.arc(centerX, centerY, radius, 0, twoPi);
        canvas.closePath();
        canvas.setFillStyle(config.edgeColor);
        canvas.fill();
        canvas.restore();
        
        // Fill
        canvas.beginPath();
        canvas.arc(centerX, centerY, radius2, 0, twoPi);
        canvas.closePath();
        var darkColor = (myt.Color.makeColorFromHexString(config.fillColor)).multiply(5/6);
        var grd = canvas.createLinearGradient(x, y, x, y + w);
        grd.addColorStop(0, config.fillColor);
        grd.addColorStop(1, darkColor.getHtmlHexString());
        canvas.setFillStyle(grd);
        canvas.fill();
        
        // Checkmark
        if (config.checked) {
            canvas.beginPath();
            canvas.arc(centerX, centerY, dotRadius, 0, twoPi);
            canvas.closePath();
            canvas.setFillStyle(config.checkedColor);
            canvas.fill();
        }
    }
});

/** Encapsulates drawing into a myt.Canvas object. Contains a repository
    of DrawingMethod instances that can be accessed by class name. */
myt.CheckboxDrawingMethod = new JS.Class('CheckboxDrawingMethod', myt.DrawingMethod, {
    // Methods /////////////////////////////////////////////////////////////////
    /** @overrides myt.DrawingMethod */
    draw: function(canvas, config) {
        // Setup default if not provided
        if (config.borderSize === undefined) config.borderSize = 0.5;
        if (config.checkmarkColor === undefined) config.checkmarkColor = '#666666';
        if (config.borderColor === undefined) config.borderColor = '#333333';
        if (config.shadowColor === undefined) config.shadowColor = 'rgba(0, 0, 0, 0.3)';
        if (config.focusedShadowColor === undefined) config.focusedShadowColor = 'rgba(0, 0, 0, 0.5)';
        if (config.shadowOffsetX === undefined) config.shadowOffsetX = 0;
        if (config.shadowOffsetY === undefined) config.shadowOffsetY = 1;
        if (config.shadowBlur === undefined) config.shadowBlur = 2;
        if (config.radius === undefined) config.radius = 4;
        
        var state = config.state,
            bounds = config.bounds,
            radius = config.radius,
            x = bounds.x, y = bounds.y,
            w = bounds.w, h = bounds.h;
        
        canvas.clear();
        
        if (w == 0 || h == 0) return;
        
        var inset = config.borderSize,
            x2 = x + inset, y2 = y + inset,
            w2 = w - 2*inset, h2 = h - 2*inset;
        
        // Border and shadow
        canvas.save();
        canvas.setShadowOffsetX(config.shadowOffsetX);
        canvas.setShadowOffsetY(config.shadowOffsetY);
        canvas.setShadowBlur(config.shadowBlur * (config.focused ? 2 : 1));
        canvas.setShadowColor(config.focused ? config.focusedShadowColor : config.shadowColor);
        
        myt.DrawingUtil.drawRoundedRect(canvas, radius, 0, x, y, w, h);
        canvas.setFillStyle(config.borderColor);
        canvas.fill();
        canvas.restore();
        
        // Fill
        myt.DrawingUtil.drawRoundedRect(canvas, radius - inset, 0, x2, y2, w2, h2);
        var darkColor = (myt.Color.makeColorFromHexString(config.fillColor)).multiply(5/6);
        var grd = canvas.createLinearGradient(x2, y2, x2, y2 + w2);
        grd.addColorStop(0, config.fillColor);
        grd.addColorStop(1, darkColor.getHtmlHexString());
        canvas.setFillStyle(grd);
        canvas.fill();
        
        // Checkmark
        if (config.checked) {
            var path = new myt.Path([
                x2 + 2, y2 + 1/2 * h2,
                x2 + 1/2 * w2, y2 + h2 - 2,
                x + w + 3, y,
                x2 + 1/2 * w2, y2 + h2 - 6,
                x2 + 5, y2 + 1/2 * h2 - 2
            ]);
            path.drawInto(canvas);
            canvas.setFillStyle(config.checkmarkColor);
            canvas.fill();
        }
    }
});

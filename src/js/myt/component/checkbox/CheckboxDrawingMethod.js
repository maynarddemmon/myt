/** Draws a checkbox into an myt.Canvas. */
myt.CheckboxDrawingMethod = new JS.Class('CheckboxDrawingMethod', myt.DrawingMethod, {
    // Constructor /////////////////////////////////////////////////////////////
    initialize: function() {
        this.__getTemplate = myt.memoize(this.__getTemplate);
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** @overrides myt.DrawingMethod */
    draw: function(canvas, config) {
        canvas.clear();
        canvas.drawImage(this.__getTemplate(config), 0, 0);
    },
    
    /** @private */
    __getTemplate: function(config) {
        var b = config.bounds, x = b.x, y = b.y, w = b.w, h = b.h;
        var shadowBlur         = config.shadowBlur == null ? 2 : config.shadowBlur,
            shadowOffsetX      = config.shadowOffsetX == null ? 0 : config.shadowOffsetX,
            shadowOffsetY      = config.shadowOffsetY == null ? 1 : config.shadowOffsetY,
            radius             = config.radius == null ? 4 : config.radius,
            shadowColor        = config.shadowColor == null ? 'rgba(0, 0, 0, 0.3)' : config.shadowColor,
            focusedShadowColor = config.focusedShadowColor == null ? 'rgba(0, 0, 0, 0.5)' : config.focusedShadowColor,
            fillColor          = config.fillColor,
            focused            = config.focused,
            inset              = config.edgeSize,
            x2 = x + inset, 
            y2 = y + inset,
            w2 = w - 2*inset,
            h2 = h - 2*inset,
            darkColor = (myt.Color.makeColorFromHexString(fillColor)).multiply(5/6),
            DU = myt.DrawingUtil;
        
        var canvas = new myt.Canvas(myt.global.roots.getRoots()[0], {
            width:x + w + shadowOffsetX + shadowBlur, 
            height:y + h + shadowOffsetY + shadowBlur, 
            visible:false, 
            ignoreLayout:true, 
            ignorePlacement:true
        });
        var grd = canvas.createLinearGradient(x2, y2, x2, y2 + w2);
        
        // Border and shadow
        canvas.save();
        canvas.setShadowOffsetX(shadowOffsetX);
        canvas.setShadowOffsetY(shadowOffsetY);
        canvas.setShadowBlur(shadowBlur * (focused ? 2 : 1));
        canvas.setShadowColor(focused ? focusedShadowColor : shadowColor);
        
        DU.drawRoundedRect(canvas, radius, 0, x, y, w, h);
        canvas.setFillStyle(config.edgeColor);
        canvas.fill();
        canvas.restore();
        
        // Fill
        DU.drawRoundedRect(canvas, radius - inset, 0, x2, y2, w2, h2);
        grd.addColorStop(0, fillColor);
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
            canvas.setFillStyle(config.checkedColor);
            canvas.fill();
        }
        
        var retval = canvas.__canvas;
        canvas.destroy();
        return retval;
    }
});

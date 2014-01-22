/** Draws a radio button into an myt.Canvas. */
myt.RadioDrawingMethod = new JS.Class('RadioDrawingMethod', myt.DrawingMethod, {
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
        var b = config.bounds, x = b.x, y = b.y, w = b.w, h = b.h,
            shadowBlur         = config.shadowBlur == null ? 2 : config.shadowBlur,
            shadowOffsetX      = config.shadowOffsetX == null ? 0 : config.shadowOffsetX,
            shadowOffsetY      = config.shadowOffsetY == null ? 1 : config.shadowOffsetY,
            shadowColor        = config.shadowColor == null ? 'rgba(0, 0, 0, 0.3)' : config.shadowColor,
            focusedShadowColor = config.focusedShadowColor == null ? 'rgba(0, 0, 0, 0.5)' : config.focusedShadowColor,
            fillColor          = config.fillColor,
            focused            = config.focused,
            inset              = config.edgeSize,
            radius = w / 2,
            radius2 = radius - inset,
            dotRadius = (radius2 / 2) - 1,
            centerX = x + radius,
            centerY = y + radius,
            darkColor = (myt.Color.makeColorFromHexString(fillColor)).multiply(5/6);
        
        var canvas = new myt.Canvas(myt.global.roots.getRoots()[0], {
            width:x + w + shadowOffsetX + shadowBlur, 
            height:y + h + shadowOffsetY + shadowBlur, 
            visible:false, 
            ignoreLayout:true, 
            ignorePlacement:true
        });
        var grd = canvas.createLinearGradient(x, y, x, y + w);
        
        // Border and shadow
        canvas.save();
        canvas.setShadowOffsetX(shadowOffsetX);
        canvas.setShadowOffsetY(shadowOffsetY);
        canvas.setShadowBlur(shadowBlur * (focused ? 2 : 1));
        canvas.setShadowColor(focused ? focusedShadowColor : shadowColor);
        
        canvas.beginPath();
        canvas.circle(centerX, centerY, radius);
        canvas.closePath();
        canvas.setFillStyle(config.edgeColor);
        canvas.fill();
        canvas.restore();
        
        // Fill
        canvas.beginPath();
        canvas.circle(centerX, centerY, radius2);
        canvas.closePath();
        grd.addColorStop(0, fillColor);
        grd.addColorStop(1, darkColor.getHtmlHexString());
        canvas.setFillStyle(grd);
        canvas.fill();
        
        // Checkmark
        if (config.checked) {
            canvas.beginPath();
            canvas.circle(centerX, centerY, dotRadius);
            canvas.closePath();
            canvas.setFillStyle(config.checkedColor);
            canvas.fill();
        }
        
        var retval = canvas.__canvas;
        canvas.destroy();
        return retval;
    }
});

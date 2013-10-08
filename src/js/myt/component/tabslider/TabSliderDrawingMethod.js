/** Draws a tab slider into an myt.Canvas. */
myt.TabSliderDrawingMethod = new JS.Class('TabSliderDrawingMethod', myt.DrawingMethod, {
    // Methods /////////////////////////////////////////////////////////////////
    /** @overrides myt.DrawingMethod */
    draw: function(canvas, config) {
        var b = config.bounds, x = b.x, y = b.y, w = b.w, h = b.h;
        
        canvas.clear();
        
        if (w == 0 || h == 0) return;
        
        var inset = config.edgeSize, twiceInset = 2 * inset;
        
        // Border
        if (inset > 0) {
            canvas.beginPath();
            canvas.rect(x, y, w, h);
            canvas.closePath();
            canvas.setFillStyle(config.edgeColor);
            canvas.fill();
        }
        
        // Fill
        canvas.beginPath();
        canvas.rect(x + inset, y + inset, w - twiceInset, h - twiceInset);
        canvas.closePath();
        canvas.setFillStyle(config.fillColor);
        canvas.fill();
    }
});

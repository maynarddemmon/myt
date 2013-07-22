/** An myt.Button that makes use of an myt.DrawingMethod to display itself.
    
    Attributes:
        drawingMethodClassname:string the name of the class to draw with.
        drawingMethod:myt.DrawingMethod the instance to draw with. Obtained
            by resolving the drawingMethodClassname. This attribute should be
            treated as read only.
        drawBounds:object the bounds for drawing within.
*/
myt.DrawButton = new JS.Class('DrawButton', myt.Canvas, {
    include: [myt.Button],
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    initNode: function(parent, attrs) {
        this.drawBounds = {x:0, y:0, w:0, h:0};
        
        this.callSuper(parent, attrs);
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setDrawingMethodClassname: function(v) {
        if (this.drawingMethodClassname === v) return;
        this.drawingMethodClassname = v;
        
        this.setDrawingMethod(myt.DrawingMethod.get(v));
    },
    
    setDrawingMethod: function(v) {
        if (this.drawingMethod === v) return;
        this.drawingMethod = v;
        // No event needed
        if (this.inited) this.updateUI();
    },
    
    /** Gets the bounds used by the DrawingMethod to draw within. By default
        this returns the bounds of this view.
        @returns an object with x, y, w and h properties. */
    getDrawBounds: function() {
        var bounds = this.drawBounds;
        bounds.w = this.width;
        bounds.h = this.height;
        return bounds;
    },
    
    getDrawConfig: function(state) {
        return {state:state, focused:this.focused, bounds:this.getDrawBounds()};
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** @overrides myt.Button */
    drawDisabledState: function() {
        this.setOpacity(myt.Button.DEFAULT_DISABLED_OPACITY);
        this.redraw('disabled');
    },
    
    /** @overrides myt.Button */
    drawHoverState: function() {
        this.setOpacity(1);
        this.redraw('hover');
    },
    
    /** @overrides myt.Button */
    drawActiveState: function() {
        this.setOpacity(1);
        this.redraw('active');
    },
    
    /** @overrides myt.Button */
    drawReadyState: function() {
        this.setOpacity(1);
        this.redraw('ready');
    },
    
    redraw: function(state) {
        // Used if redrawing for focus changes
        if (state === undefined) state = this._lastState;
        this._lastState = state;
        
        var dm = this.drawingMethod;
        if (dm) dm.draw(this, this.getDrawConfig(state));
    }
});

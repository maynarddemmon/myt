/** An myt.Button that makes use of an myt.DrawingMethod to display itself.
    
    Attributes:
        drawingMethodClassname:string the name of the class to draw with.
        drawingMethod:myt.DrawingMethod the instance to draw with. Obtained
            by resolving the drawingMethodClassname. This attribute should be
            treated as read only.
*/
myt.DrawButton = new JS.Class('DrawButton', myt.Canvas, {
    include: [myt.Button],
    
    
    // Class Methods and Attributes ////////////////////////////////////////////
    extend: {
        DRAWING_CONFIG_DISABLED: {state:'disabled'},
        DRAWING_CONFIG_HOVER: {state:'hover'},
        DRAWING_CONFIG_ACTIVE: {state:'active'},
        DRAWING_CONFIG_READY: {state:'ready'}
    },
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    initNode: function(parent, attrs) {
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
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** @overrides myt.Button */
    drawDisabledState: function() {
        this.setOpacity(myt.Button.DEFAULT_DISABLED_OPACITY);
        this._redraw(myt.DrawButton.DRAWING_CONFIG_DISABLED);
    },
    
    /** @overrides myt.Button */
    drawHoverState: function() {
        this.setOpacity(1);
        this._redraw(myt.DrawButton.DRAWING_CONFIG_HOVER);
    },
    
    /** @overrides myt.Button */
    drawActiveState: function() {
        this.setOpacity(1);
        this._redraw(myt.DrawButton.DRAWING_CONFIG_ACTIVE);
    },
    
    /** @overrides myt.Button */
    drawReadyState: function() {
        this.setOpacity(1);
        this._redraw(myt.DrawButton.DRAWING_CONFIG_READY);
    },
    
    _redraw: function(config) {
        var dm = this.drawingMethod;
        if (dm) dm.draw(this, config);
    }
});

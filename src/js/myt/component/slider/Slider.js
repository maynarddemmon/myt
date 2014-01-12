/** A slider component.
    
    Private Attributes:
        __lockSync:boolean Used internally to prevent infinite loops.
*/
myt.Slider = new JS.Class('Slider', myt.BaseSlider, {
    include: [myt.BoundedValueComponent],
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    doAfterAdoption: function() {
        new this.thumbClass(this, {name:'thumb'});
        
        this.callSuper();
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setValue: function(v) {
        this.callSuper(v);
        
        // Sync position of thumb
        if (this.inited && !this.__lockSync) this._syncThumbToValue(this.thumb, this.getValue());
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** Should only be called by myt.SliderThumbMixin.
        @private */
    _syncValueToThumb: function(thumb) {
        this.__lockSync = true;
        
        this.setValue(this.convertPixelsToValue(
            this.axis === 'x' ? thumb.x + thumb.width / 2 : thumb.y + thumb.height / 2
        ));
        
        // Update thumb position since value may have been adjusted
        this._syncThumbToValue(thumb, this.getValue());
        
        this.__lockSync = false;
    },
    
    _nudge: function(thumb, up) {
        this.setValue(this.getValue() + this.nudgeAmount * (up ? 1 : -1));
    },
    
    getMinPixelValueForThumb: function(thumb) {
        return this.convertValueToPixels(this.minValue);
    },
    
    getMaxPixelValueForThumb: function(thumb) {
        return this.convertValueToPixels(this.maxValue);
    }
});

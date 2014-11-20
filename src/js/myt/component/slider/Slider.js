/** A slider component.
    
    Events:
        None
    
    Attributes:
        None
    
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
    /** @overrides */
    setValue: function(v) {
        this.callSuper(v);
        
        // Sync position of thumb
        if (this.inited && !this.__lockSync) this._syncThumbToValue(this.thumb, this.getValue());
    },
    
    /** Update the thumb position if the width changes.
        @overrides */
    setWidth: function(v, supressEvent) {
        var existing = this.width;
        this.callSuper(v, supressEvent);
        if (this.inited && this.axis === 'x' && this.width !== existing) this._syncThumbToValue(this.thumb, this.getValue());
    },
    
    /** Update the thumb position if the height changes.
        @overrides */
    setHeight: function(v, supressEvent) {
        var existing = this.height;
        this.callSuper(v, supressEvent);
        if (this.inited && this.axis === 'y' && this.height !== existing) this._syncThumbToValue(this.thumb, this.getValue());
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** Should only be called by myt.SliderThumbMixin.
        @private */
    _syncValueToThumb: function(thumb) {
        if (this.inited && !this.__lockSync) {
            this.__lockSync = true;
            
            this.setValue(this.convertPixelsToValue(
                this.axis === 'x' ? thumb.x + thumb.width / 2 : thumb.y + thumb.height / 2
            ));
            
            // Update thumb position since value may have been adjusted
            this._syncThumbToValue(thumb, this.getValue());
            
            this.__lockSync = false;
        }
    },
    
    /** @overrides myt.BaseSlider */
    _nudge: function(thumb, up) {
        this.setValue(this.getValue() + this.nudgeAmount * (up ? 1 : -1));
    },
    
    /** Should only be called by myt.SliderThumbMixin.
        @private */
    getMinPixelValueForThumb: function(thumb) {
        return this.convertValueToPixels(this.minValue);
    },
    
    /** Should only be called by myt.SliderThumbMixin.
        @private */
    getMaxPixelValueForThumb: function(thumb) {
        return this.convertValueToPixels(this.maxValue);
    }
});

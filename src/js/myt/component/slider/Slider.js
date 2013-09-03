/** A slider component.
    
    Attributes:
        _lockSync:boolean Used internally to prevent infinite loops.
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
        if (this.inited && !this._lockSync) this._syncThumbToValue(this.thumb);
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    _syncThumbToValue: function(thumb) {
        var value = this.convertValueToPixels(this.getValue());
        if (this.axis === 'x') {
            thumb.setX(value - thumb.width / 2);
        } else {
            thumb.setY(value - thumb.height / 2);
        }
    },
    
    _syncValueToThumb: function(thumb) {
        this._lockSync = true;
        
        this.setValue(this.convertPixelsToValue(
            this.axis === 'x' ? thumb.x + thumb.width / 2 : thumb.y + thumb.height / 2
        ));
        
        // Update thumb position since value may have been adjusted
        this._syncThumbToValue(thumb);
        
        this._lockSync = false;
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

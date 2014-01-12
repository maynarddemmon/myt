/** A slider component that support two thumbs.
    
    Private Attributes:
        __lockSync:boolean Used internally to prevent infinite loops.
*/
myt.RangeSlider = new JS.Class('RangeSlider', myt.BaseSlider, {
    include: [myt.BoundedRangeComponent],
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides myt.BaseSlider */
    initNode: function(parent, attrs) {
        if (attrs.rangeFillClass === undefined) attrs.rangeFillClass = myt.SimpleSliderRangeFill;
        
        this.callSuper(parent, attrs);
    },
    
    doAfterAdoption: function() {
        new this.rangeFillClass(this, {name:'rangeFill'});
        new this.thumbClass(this, {name:'thumbLower'});
        new this.thumbClass(this, {name:'thumbUpper'});
        
        this.callSuper();
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setRangeFillClass: function(v) {this.rangeFillClass = v;},
    
    setValue: function(v) {
        this.callSuper(v);
        
        if (this.inited) {
            // Sync position of thumb
            if (!this.__lockSync) {
                v = this.getValue();
                this._syncThumbToValue(this.thumbLower, v);
                this._syncThumbToValue(this.thumbUpper, v);
            }
            
            this._syncRangeFillToValue();
        }
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    _syncRangeFillToValue: function() {
        var rangeFill = this.rangeFill, value = this.getValue(),
            lowerPx = this.convertValueToPixels(value.lower),
            extent = this.convertValueToPixels(value.upper) - lowerPx;
        if (this.axis === 'x') {
            rangeFill.setX(lowerPx);
            rangeFill.setWidth(extent);
        } else {
            rangeFill.setY(lowerPx);
            rangeFill.setHeight(extent);
        }
    },
    
    _syncThumbToValue: function(thumb, value) {
        this.callSuper(thumb, thumb.name === 'thumbLower' ? value.lower : value.upper);
    },
    
    _syncValueToThumb: function(thumb) {
        this.__lockSync = true;
        
        var converted = this.convertPixelsToValue(
            this.axis === 'x' ? thumb.x + thumb.width / 2 : thumb.y + thumb.height / 2
        );
        
        var value = this.getValueCopy();
        if (thumb.name === 'thumbLower') {
            value.lower = converted;
        } else {
            value.upper = converted;
        }
        this.setValue(value);
        
        // Update thumb position since value may have been adjusted
        value = this.getValue();
        if (this.thumbLower) this._syncThumbToValue(this.thumbLower, value);
        if (this.thumbUpper) this._syncThumbToValue(this.thumbUpper, value);
        
        this.__lockSync = false;
    },
    
    _nudge: function(thumb, up) {
        var value = this.getValueCopy(),
            adj = this.nudgeAmount * (up ? 1 : -1);
        if (thumb.name === 'thumbLower') {
            value.lower += adj;
            if (value.lower > value.upper) value.lower = value.upper;
        } else {
            value.upper += adj;
            if (value.lower > value.upper) value.upper = value.lower;
        }
        this.setValue(value);
    },
    
    getMinPixelValueForThumb: function(thumb) {
        return this.convertValueToPixels(
            thumb.name === 'thumbLower' ? this.minValue : this.getValue().lower
        );
    },
    
    getMaxPixelValueForThumb: function(thumb) {
        return this.convertValueToPixels(
            thumb.name === 'thumbLower' ? this.getValue().upper : this.maxValue
        );
    }
});

/** A slider component that support two thumbs.
    
    Attributes:
        _lockSync:boolean Used internally to prevent infinite loops.
*/
myt.RangeSlider = new JS.Class('RangeSlider', myt.BaseSlider, {
    include: [myt.BoundedRangeComponent],
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides myt.Checkbox */
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
            if (!this._lockSync) {
                this._syncThumbToValue(this.thumbLower);
                this._syncThumbToValue(this.thumbUpper);
            }
            
            this._syncRangeFillToValue();
        }
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    _syncRangeFillToValue: function() {
        var rangeFill = this.rangeFill, value = this.getValue(),
            lowerPx = this.convertValueToPixels(value.lower),
            upperPx = this.convertValueToPixels(value.upper);
        if (this.axis === 'x') {
            rangeFill.setX(lowerPx);
            rangeFill.setWidth(upperPx - lowerPx);
        } else {
            rangeFill.setY(lowerPx);
            rangeFill.setHeight(upperPx - lowerPx);
        }
    },
    
    _syncThumbToValue: function(thumb) {
        var value = this.getValue();
        value = this.convertValueToPixels(thumb.name === 'thumbLower' ? value.lower : value.upper);
        
        if (this.axis === 'x') {
            thumb.setX(value - thumb.width / 2);
        } else {
            thumb.setY(value - thumb.height / 2);
        }
    },
    
    _syncValueToThumb: function(thumb) {
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
        if (this.thumbLower) this._syncThumbToValue(this.thumbLower);
        if (this.thumbUpper) this._syncThumbToValue(this.thumbUpper);
    },
    
    _nudge: function(thumb, up) {
        var value = this.getValueCopy();
        var adj = this.nudgeAmount * (up ? 1 : -1);
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
        if (thumb.name === 'thumbLower') {
            return this.convertValueToPixels(this.minValue);
        } else {
            return this.convertValueToPixels(this.getValue().lower);
        }
    },
    
    getMaxPixelValueForThumb: function(thumb) {
        if (thumb.name === 'thumbLower') {
            return this.convertValueToPixels(this.getValue().upper);
        } else {
            return this.convertValueToPixels(this.maxValue);
        }
    }
});

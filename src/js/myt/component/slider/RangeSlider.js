/** A slider component that support two thumbs.
    
    Events:
        None
    
    Attributes:
        rangeFillClass:JS.Class The class used to instantiate the rangeFill
    
    Private Attributes:
        __lockSync:boolean Used internally to prevent infinite loops.
    
    @class
*/
myt.RangeSlider = new JS.Class('RangeSlider', myt.BaseSlider, {
    include: [myt.BoundedRangeComponent],
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides myt.BaseSlider */
    initNode: function(parent, attrs) {
        if (attrs.rangeFillClass == null) attrs.rangeFillClass = myt.SimpleSliderRangeFill;
        
        this.callSuper(parent, attrs);
        
        new this.rangeFillClass(this, {name:'rangeFill'});
        new this.thumbClass(this, {name:'thumbLower'});
        new this.thumbClass(this, {name:'thumbUpper'});
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setRangeFillClass: function(v) {this.rangeFillClass = v;},
    
    /** @overrides */
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
    
    /** @overrides
        Update the thumb position if the width changes. */
    setWidth: function(v, supressEvent) {
        const existing = this.width;
        this.callSuper(v, supressEvent);
        if (this.inited && this.axis === 'x' && this.width !== existing) {
            const value = this.getValue();
            this._syncThumbToValue(this.thumbLower, value);
            this._syncThumbToValue(this.thumbUpper, value);
        }
    },
    
    /** @overrides
        Update the thumb position if the height changes. */
    setHeight: function(v, supressEvent) {
        const existing = this.height;
        this.callSuper(v, supressEvent);
        if (this.inited && this.axis === 'y' && this.height !== existing) {
            const value = this.getValue();
            this._syncThumbToValue(this.thumbLower, value);
            this._syncThumbToValue(this.thumbUpper, value);
        }
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** Should only be called by myt.SimpleSliderRangeFill.
        @private
        @returns {undefined} */
    _syncRangeFillToValue: function() {
        const rangeFill = this.rangeFill, value = this.getValue(),
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
    
    /** @overrides myt.BaseSlider */
    _syncThumbToValue: function(thumb, value) {
        this.callSuper(thumb, thumb.name === 'thumbLower' ? value.lower : value.upper);
    },
    
    /** Should only be called by myt.SliderThumbMixin.
        @private
        @param {!Object} thumb
        @returns {undefined} */
    _syncValueToThumb: function(thumb) {
        if (this.inited && !this.__lockSync) {
            this.__lockSync = true;
            
            const converted = this.convertPixelsToValue(
                this.axis === 'x' ? thumb.x + thumb.width / 2 : thumb.y + thumb.height / 2
            );
            
            let value = this.getValueCopy();
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
        }
    },
    
    /** @overrides myt.BaseSlider */
    _nudge: function(thumb, up) {
        const value = this.getValueCopy(),
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
    
    /** Should only be called by myt.SliderThumbMixin.
        @private
        @param {!Object} thumb
        @returns {number} */
    getMinPixelValueForThumb: function(thumb) {
        return this.convertValueToPixels(
            thumb.name === 'thumbLower' ? this.minValue : this.getValue().lower
        );
    },
    
    /** Should only be called by myt.SliderThumbMixin.
        @private
        @param {!Object} thumb
        @returns {number} */
    getMaxPixelValueForThumb: function(thumb) {
        return this.convertValueToPixels(
            thumb.name === 'thumbLower' ? this.getValue().upper : this.maxValue
        );
    }
});

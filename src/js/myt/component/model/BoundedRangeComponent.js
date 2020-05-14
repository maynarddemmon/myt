/** A numeric value component that stays within an upper and lower value and
    where the value is a range. */
myt.BoundedRangeComponent = new JS.Module('BoundedRangeComponent', {
    include: [myt.BoundedValueComponent, myt.RangeComponent],
    
    // Life Cycle //////////////////////////////////////////////////////////////
    initNode: function(parent, attrs) {
        if (!attrs.valueFilter) {
            const self = this;
            attrs.valueFilter = function(v) {
                if (v) {
                    const max = self.maxValue,
                        min = self.minValue;
                    if (max != null && v.upper > max) v.upper = max;
                    if (min != null && v.lower < min) v.lower = min;
                }
                return v;
            };
        }
        
        this.callSuper(parent, attrs);
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    /** @overrides myt.ValueComponent */
    setValue: function(v) {
        if (this.snapToInt && v != null) {
            if (v.lower != null && !isNaN(v.lower)) v.lower = Math.round(v.lower);
            if (v.upper != null && !isNaN(v.upper)) v.upper = Math.round(v.upper);
        }
        this.callSuper(v);
    }
});

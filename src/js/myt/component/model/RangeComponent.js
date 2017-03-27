/** A value that consists of an upper and lower value. The lower value must
    be less than or equal to the upper value. The value object that must be
    passed into setValue and returned from getValue is an object of the
    form: {lower:number, upper:number}. */
myt.RangeComponent = new JS.Module('RangeComponent', {
    include: [myt.ValueComponent],
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setLowerValue: function(v) {
        this.setValue({
            lower:v, 
            upper:(this.value && this.value.upper !== undefined) ? this.value.upper : v
        });
    },
    
    getLowerValue: function() {
        return this.value ? this.value.lower : undefined;
    },
    
    setUpperValue: function(v) {
        this.setValue({
            lower:(this.value && this.value.lower !== undefined) ? this.value.lower : v,
            upper:v
        });
    },
    
    getUpperValue: function() {
        return this.value ? this.value.upper : undefined;
    },
    
    setValue: function(v) {
        if (v) {
            var existing = this.value,
                existingLower = existing ? existing.lower : undefined,
                existingUpper = existing ? existing.upper : undefined;
            
            if (this.valueFilter) v = this.valueFilter(v);
            
            // Do nothing if value is identical
            if (v.lower === existingLower && v.upper === existingUpper) return;
            
            // Assign upper to lower if no lower was provided.
            if (v.lower === undefined) v.lower = v.upper;
            
            // Assign lower to upper if no upper was provided.
            if (v.upper === undefined) v.upper = v.lower;
            
            // Swap lower and upper if they are in the wrong order
            if (v.lower !== undefined && v.upper !== undefined && v.lower > v.upper) {
                var temp = v.lower;
                v.lower = v.upper;
                v.upper = temp;
            }
            
            this.value = v;
            if (this.inited) {
                this.fireEvent('value', this.getValue());
                if (v.lower !== existingLower) this.fireEvent('lowerValue', v.lower);
                if (v.upper !== existingUpper) this.fireEvent('upperValue', v.upper);
            }
        } else {
            this.callSuper(v);
        }
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    getValueCopy: function() {
        var v = this.value;
        return {lower:v.lower, upper:v.upper};
    }
});

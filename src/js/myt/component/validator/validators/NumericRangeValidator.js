/** Tests that adBinary value is between min and max. */
myt.NumericRangeValidator = new JS.Class('NumericRangeValidator', myt.Validator, {
    // Constructor /////////////////////////////////////////////////////////////
    /** @overrides myt.Validator
        @param min:number The minimum value.
        @param max:number The maximum value. */
    initialize: function(id, min, max) {
        this.callSuper(id);
        
        this.min = min;
        this.max = max;
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** @overrides myt.Validator */
    isValid: function(value, config, errorMessages) {
        // Treat empty values as valid.
        if (value === "") return true;
        
        // Must be a number
        var numericValue = Number(value), min = this.min, max = this.max;
        if (isNaN(numericValue)) {
            if (errorMessages) errorMessages.push("Value is not a number.");
            return false;
        }
        
        // Test min
        if (min !== undefined && min > numericValue) {
            if (errorMessages) errorMessages.push('Value must not be less than ' + min + '.');
            return false;
        }
        
        // Test max
        if (max !== undefined && max < numericValue) {
            if (errorMessages) errorMessages.push('Value must not be greater than ' + max + '.');
            return false;
        }
        
        return true;
    }
});

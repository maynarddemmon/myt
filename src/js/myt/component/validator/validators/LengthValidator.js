/** Tests that the value has a length between min and max. */
myt.LengthValidator = new JS.Class('LengthValidator', myt.Validator, {
    // Constructor /////////////////////////////////////////////////////////////
    /** @overrides myt.Validator
        @param min:number The minimum length value.
        @param max:number The maximum length value. */
    initialize: function(id, min, max) {
        this.callSuper(id);
        
        this.min = min;
        this.max = max;
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** @overrides myt.Validator */
    isValid: function(value, config, errorMessages) {
        var len = value ? value.length : 0,
            min = this.min,
            max = this.max;
        
        // Test min
        if (min !== undefined && min > len) {
            if (errorMessages) errorMessages.push('Value must not be less than ' + min + '.');
            return false;
        }
        
        // Test max
        if (max !== undefined && max < len) {
            if (errorMessages) errorMessages.push('Value must not be greater than ' + max + '.');
            return false;
        }
        
        return true;
    }
});

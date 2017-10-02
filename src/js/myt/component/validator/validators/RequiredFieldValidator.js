/** Tests that a value is not null, undefined or empty. */
myt.RequiredFieldValidator = new JS.Class('RequiredFieldValidator', myt.Validator, {
    // Methods /////////////////////////////////////////////////////////////////
    /** @overrides myt.Validator */
    isValid: function(value, config, errorMessages) {
        if (value == null || value === '' || (typeof value === 'string' && value.trim() === '')) {
            if (errorMessages) errorMessages.push("This value is required.");
            return false;
        }
        
        return true;
    }
});

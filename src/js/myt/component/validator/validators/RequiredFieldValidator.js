/** Tests that a value exists. */
myt.RequiredFieldValidator = new JS.Class('RequiredFieldValidator', myt.Validator, {
    // Methods /////////////////////////////////////////////////////////////////
    /** @overrides myt.Validator */
    isValid: function(value, config, errorMessages) {
        if (!value) {
            if (errorMessages) errorMessages.push("This value is required.");
            return false;
        }
        
        return true;
    }
});

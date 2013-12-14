/** Verifies that a value is JSON. */
myt.JSONValidator = new JS.Class('JSONValidator', myt.Validator, {
    // Methods /////////////////////////////////////////////////////////////////
    /** @overrides myt.Validator */
    isValid: function(value, config, errorMessages) {
        try {
            JSON.parse(value);
            return true;
        } catch(e) {
            if (errorMessages) errorMessages.push(e);
            return false;
        }
    }
});

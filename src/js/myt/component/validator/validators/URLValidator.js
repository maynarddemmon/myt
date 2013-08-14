/** Verifies that a value is in the form of a URL. */
myt.URLValidator = new JS.Class('URLValidator', myt.Validator, {
    // Methods /////////////////////////////////////////////////////////////////
    /** @overrides myt.Validator */
    isValid: function(value, config, errorMessages) {
        var uri = new myt.URI(value);
        if (uri.toString() !== value) {
            if (errorMessages) errorMessages.push("Not a valid URL.");
            return false;
        }
        return true;
    }
});

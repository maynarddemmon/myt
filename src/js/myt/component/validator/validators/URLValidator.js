/** Verifies that a value is in the form of a URL. */
myt.URLValidator = new JS.Class('URLValidator', myt.Validator, {
    // Constructor /////////////////////////////////////////////////////////////
    /** @overrides myt.Validator
        @param originalRawQuery:boolean if true this prevents the query from
            being normalized. */
    initialize: function(id, originalRawQuery) {
        this.callSuper(id);
        this.originalRawQuery = originalRawQuery;
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** @overrides myt.Validator */
    isValid: function(value, config, errorMessages) {
        var uri = new myt.URI(value);
        if (uri.toString(this.originalRawQuery) !== value) {
            if (errorMessages) errorMessages.push("Not a valid URL.");
            return false;
        }
        return true;
    }
});

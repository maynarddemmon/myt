/** Pulls the current value from another form field if the provided value
    is undefined, null or empty string.
    
    Attributes:
        otherField:myt.FormElement The form element to pull the current 
            value from.
    
    @class */
myt.UseOtherFieldIfEmptyValueProcessor = new JS.Class('UseOtherFieldIfEmptyValueProcessor', myt.ValueProcessor, {
    // Constructor /////////////////////////////////////////////////////////////
    /** @overrides myt.ValueProcessor
        @param {string} id - The ideally unique ID for a processor instance.
        @param {boolean} [runForDefault]
        @param {boolean} [runForRollback]
        @param {boolean} [runForCurrent]
        @param {!Object} [otherField] - The myt.FormElement to pull the value from.
        @returns {undefined} */
    initialize: function(id, runForDefault, runForRollback, runForCurrent, otherField) {
        this.callSuper(id, runForDefault, runForRollback, runForCurrent);
        
        this.otherField = otherField;
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** @overrides */
    process: function(v) {
        return (v == null || v === "") ? this.otherField.getValue() : v;
    }
});

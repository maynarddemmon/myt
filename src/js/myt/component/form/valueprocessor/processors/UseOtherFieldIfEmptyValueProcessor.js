/** Pulls the current value from another form field if the provided value
    is undefined, null or empty string.
    
    Attributes:
        otherField:myt.FormElement The form element to pull the current 
            value from.
*/
myt.UseOtherFieldIfEmptyValueProcessor = new JS.Class('UseOtherFieldIfEmptyValueProcessor', myt.ValueProcessor, {
    // Constructor /////////////////////////////////////////////////////////////
    /** @overrides myt.ValueProcessor
        @param otherField:myt.FormElement The form field to pull the 
            value from. */
    initialize: function(id, runForDefault, runForRollback, runForCurrent, otherField) {
        this.callSuper(id, runForDefault, runForRollback, runForCurrent);
        
        this.otherField = otherField;
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** @overrides myt.ValueProcessor */
    process: function(v) {
        return (v == null || v === "") ? this.otherField.getValue() : v;
    }
});

/** Tests that the value from two fields are equal. */
myt.EqualFieldsValidator = new JS.Class('EqualFieldsValidator', myt.Validator, {
    // Constructor /////////////////////////////////////////////////////////////
    /** @overrides myt.Validator
        @param fieldA the first form field to compare.
        @param fieldB the second form field to compare. */
    initialize: function(id, fieldA, fieldB) {
        this.callSuper(id);
        
        this.fieldA = fieldA;
        this.fieldB = fieldB;
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** @overrides myt.Validator */
    isValid: function(value, config, errorMessages) {
        if (value && fieldA.getValue() === fieldB.getValue()) return true;
        
        if (errorMessages) errorMessages.push('Field "' + this.fieldA.key + '" must be equal to field "' + this.fieldB.key + '".');
        return false;
    }
});

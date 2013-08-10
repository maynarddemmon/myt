/** Tests that the value differs from the form rollback value by more than
    just case. */
myt.EqualsIgnoreCaseValidator = new JS.Class('EqualsIgnoreCaseValidator', myt.Validator, {
    // Methods /////////////////////////////////////////////////////////////////
    /** @overrides myt.Validator */
    isValid: function(value, config, errorMessages) {
        var rbv = config.form.getRollbackValue();
        if (value && rbv && value.toLowerCase() === rbv.toLowerCase()) {
            if (errorMessages) errorMessages.push("Value must differ by more than just case.");
            return false;
        }
        
        return true;
    }
});

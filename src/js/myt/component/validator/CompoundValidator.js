/** A Validator composed from multiple Validators.
    
    Attributes:
        _validators:array the array of myt.Validators that compose 
            this Validator.
*/
myt.CompoundValidator = new JS.Class('CompoundValidator', myt.Validator, {
    // Constructor /////////////////////////////////////////////////////////////
    /** Creates a new CompoundValidator for the ID and 0 or more Validators
        provided.
        @param arguments:args ever argument after the first must be a
            Validator or a Validator ID from the myt.global.validators
            registry.*/
    initialize: function(id) {
        this.callSuper(id);
        
        var args = Array.prototype.slice.call(arguments);
        args.shift();
        
        // Make sure each arg is an myt.Validator
        var i = args.length, validator;
        while (i) {
            validator = args[--i];
            if (!(validator instanceof myt.Validator)) {
                validator = args[i] = myt.global.validators.getValidator(validator);
                if (!validator) args.splice(i, 1);
            }
        }
        
        this._validators = args;
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** Add a Validator to this CompoundValidator.
        @param validator:myt.Validator
        @returns void */
    addValidator: function(validator) {
        if (!(validator instanceof myt.Validator)) {
            validator = myt.global.validators.getValidator(validator);
        }
        
        if (validator) this._validators.push(validator);
    },
    
    /** @overrides myt.Validator */
    isValid: function(value, config, errorMessages) {
        var isValid = true, 
            validators = this._validators, 
            len = validators.length, 
            i = 0;
        for (; len > i; ++i) {
            isValid = validators[i].isValid(value, config, errorMessages) && isValid;
        }
        return isValid;
    }
});

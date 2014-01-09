/** A Validator composed from multiple Validators.
    
    Events:
        None
    
    Attributes:
        None
    
    Private Attributes:
        __v:array The array of myt.Validators that compose 
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
            if (typeof validator === 'string') {
                args[i] = validator = myt.global.validators.getValidator(validator);
                if (!validator) args.splice(i, 1);
            }
        }
        
        this.__v = args;
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** Add a Validator to this CompoundValidator.
        @param validator:myt.Validator|string The validator to add or a string
            used to lookup a validator in the validator repository.
        @returns void */
    addValidator: function(v) {
        if (typeof v === 'string') v = myt.global.validators.getValidator(v);
        if (v) this.__v.push(v);
    },
    
    /** @overrides myt.Validator */
    isValid: function(value, config, errorMessages) {
        var isValid = true, validators = this.__v, len = validators.length, i = 0;
        for (; len > i;) isValid = validators[i++].isValid(value, config, errorMessages) && isValid;
        return isValid;
    }
});

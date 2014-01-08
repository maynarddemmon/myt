/** Stores myt.Validators by ID.
    
    Events:
        validatorAdded:myt.Validator Fired when a validator is added to
            this registry.
        validatorRemoved:myt.Validator Fired when a validator is removed
            from this registry.
    
    Attributes:
        None
    
    Private Attributes:
        __validators:Object a map of myt.Validators by ID.
*/
new JS.Singleton('GlobalValidatorRegistry', {
    include: [myt.Observable],
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    initialize: function() {
        this.__validators = {};
        myt.global.register('validators', this);
        
        // Register a few common Validators
        this.register(new myt.RequiredFieldValidator('required'));
        this.register(new myt.EqualsIgnoreCaseValidator('equalsIgnoreCase'));
        this.register(new myt.URLValidator('url'));
        this.register(new myt.JSONValidator('json'));
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    /** Gets a Validator for the ID.
        @param id:string the ID of the Validator to get.
        @returns an myt.Validator or undefined if not found. */
    getValidator: function(id) {
        return this.__validators[id];
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** Adds a Validator to this registry.
        @param validator:myt.Validator the Validator to add.
        @returns void */
    register: function(validator) {
        if (validator) {
            var id = validator.id;
            if (id) {
                this.__validators[id] = validator;
                this.fireNewEvent('validatorAdded', validator);
            } else {
                myt.dumpStack("No ID on validator");
            }
        } else {
            myt.dumpStack("No validator provided to register.");
        }
    },
    
    /** Removes a Validator from this registery.
        @param validator:myt.Validator the Validator to remove.
        @returns boolean true if removal succeeds, false otherwise. */
    unregister: function(validator) {
        if (validator) {
            var id = validator.id;
            if (id) {
                validator = this.getValidator(id);
                if (validator) {
                    delete this.__validators[id];
                    this.fireNewEvent('validatorRemoved', validator);
                    return true;
                }
            } else {
                myt.dumpStack("No ID on validator");
            }
        } else {
            myt.dumpStack("No validator provided to unregister.");
        }
        return false;
    }
});

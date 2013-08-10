/** Stores myt.Validators by ID.
    
    Attributes:
        _validators:Object a map of myt.Validators by ID.
*/
new JS.Singleton('GlobalValidatorRegistry', {
    include: [myt.Observable],
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    initialize: function() {
        this._validators = {};
        myt.global.register('validators', this);
        
        // Register a few common Validators
        this.register(new myt.RequiredFieldValidator('required'));
        this.register(new myt.EqualsIgnoreCaseValidator('equalsIgnoreCase'));
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    /** Gets a Validator for the ID.
        @param id:string the ID of the Validator to get.
        @returns an myt.Validator or undefined if not found. */
    getValidator: function(id) {
        return this._validators[id];
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** Adds a Validator to this registry.
        @param validator:myt.Validator the Validator to add.
        @returns void */
    register: function(validator) {
        if (validator) {
            var id = validator.id;
            if (id) {
                this._validators[id] = validator;
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
                    delete this._validators[id];
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

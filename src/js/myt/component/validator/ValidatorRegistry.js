/** Stores myt.Validators by ID so they can be used in multiple
    places easily.
    
    Events:
        validatorAdded:myt.Validator Fired when a validator is added to
            this registry.
        validatorRemoved:myt.Validator Fired when a validator is removed
            from this registry.
    
    Attributes:
        None
    
    Private Attributes:
        __c:object A map of myt.Validators by ID.
*/
new JS.Singleton('GlobalValidatorRegistry', {
    include: [myt.Observable],
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    initialize: function() {
        this.__c = {};
        
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
        return this.__c[id];
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** Adds a Validator to this registry.
        @param validator:myt.Validator the Validator to add.
        @returns void */
    register: function(validator) {
        if (validator) {
            var id = validator.id;
            if (id) {
                this.__c[id] = validator;
                this.fireNewEvent('validatorAdded', validator);
            } else {
                myt.dumpStack("No ID");
            }
        } else {
            myt.dumpStack("No validator");
        }
    },
    
    /** Removes a Validator from this registery.
        @param validator:myt.Validator the Validator to remove.
        @returns boolean true if removal succeeds, false otherwise. */
    unregister: function(validator) {
        if (validator) {
            var id = validator.id;
            if (id) {
                // Make sure it's in the repository.
                validator = this.getValidator(id);
                
                if (validator) {
                    delete this.__c[id];
                    this.fireNewEvent('validatorRemoved', validator);
                    return true;
                }
            } else {
                myt.dumpStack("No ID");
            }
        } else {
            myt.dumpStack("No validator");
        }
        return false;
    }
});

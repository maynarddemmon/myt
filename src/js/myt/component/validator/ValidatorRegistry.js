/** Stores myt.Validators by ID so they can be used in multiple
    places easily.
    
    Events:
        None
    
    Attributes:
        None
    
    Private Attributes:
        __c:object A map of myt.Validators by ID.
*/
new JS.Singleton('GlobalValidatorRegistry', {
    // Life Cycle //////////////////////////////////////////////////////////////
    initialize: function() {
        var self = this,
            m = myt;
        
        self.__c = {};
        
        m.global.register('validators', self);
        
        // Register a few common Validators
        self.register(new m.RequiredFieldValidator('required'));
        self.register(new m.EqualsIgnoreCaseValidator('equalsIgnoreCase'));
        self.register(new m.URLValidator('url'));
        self.register(new m.JSONValidator('json'));
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
        @param identifiable:myt.Validator the Validator to add.
        @returns void */
    register: function(identifiable) {
        if (identifiable) {
            var id = identifiable.id;
            if (id) {
                this.__c[id] = identifiable;
            } else {
                myt.dumpStack("No ID");
            }
        } else {
            myt.dumpStack("No validator");
        }
    },
    
    /** Removes a Validator from this registery.
        @param identifiable:myt.Validator the Validator to remove.
        @returns void */
    unregister: function(identifiable) {
        if (identifiable) {
            var id = identifiable.id;
            if (id) {
                // Make sure it's in the repository then delete.
                if (this.getValidator(id)) delete this.__c[id];
            } else {
                myt.dumpStack("No ID");
            }
        } else {
            myt.dumpStack("No validator");
        }
    }
});

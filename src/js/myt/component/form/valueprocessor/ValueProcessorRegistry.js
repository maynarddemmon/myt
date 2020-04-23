/** Stores myt.ValueProcessors by ID so they can be used in multiple
    places easily.
    
    Events:
        None
    
    Attributes:
        None
    
    Private Attributes:
        __c:object A map of myt.ValueProcessors by ID.
*/
new JS.Singleton('GlobalValueProcessorRegistry', {
    // Life Cycle //////////////////////////////////////////////////////////////
    initialize: function() {
        var self = this,
            m = myt;
        
        self.__c = {};
        
        m.global.register('valueProcessors', self);
        
        // Register a few common ValueProcessors
        self.register(new m.UndefinedValueProcessor('undefToEmpty', true, true, true, ''));
        self.register(new m.ToNumberValueProcessor('toNumber', true, true, true));
        self.register(new m.TrimValueProcessor('trimLeft', true, true, true, 'left'));
        self.register(new m.TrimValueProcessor('trimRight', true, true, true, 'right'));
        self.register(new m.TrimValueProcessor('trimBoth', true, true, true, 'both'));
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    /** Gets a ValueProcessor for the ID.
        @param id:string the ID of the ValueProcessor to get.
        @returns an myt.ValueProcessor or undefined if not found. */
    getValueProcessor: function(id) {
        return this.__c[id];
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** Adds a ValueProcessor to this registry.
        @param identifiable:myt.ValueProcessor the ValueProcessor to add.
        @returns {undefined} */
    register: function(identifiable) {
        if (identifiable) {
            var id = identifiable.id;
            if (id) {
                this.__c[id] = identifiable;
            } else {
                myt.dumpStack("No ID");
            }
        } else {
            myt.dumpStack("No processor");
        }
    },
    
    /** Removes a ValueProcessor from this registery.
        @param identifiable:myt.ValueProcessor the ValueProcessor to remove.
        @returns {undefined} */
    unregister: function(identifiable) {
        if (identifiable) {
            var id = identifiable.id;
            if (id) {
                // Make sure it's in the repository and then delete
                if (this.getValueProcessor(id)) delete this.__c[id];
            } else {
                myt.dumpStack("No ID");
            }
        } else {
            myt.dumpStack("No processor");
        }
    }
});

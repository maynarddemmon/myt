/** Stores myt.ValueProcessors by ID so they can be used in multiple
    places easily.
    
    Events:
        processorAdded:myt.ValueProcessor Fired when a processor is registered
            with the registry.
        processorRemoved:myt.ValueProcessor Fired when a processor is 
            unregistered from the registry.
    
    Attributes:
        None
    
    Private Attributes:
        __c:object A map of myt.ValueProcessors by ID.
*/
new JS.Singleton('GlobalValueProcessorRegistry', {
    include: [myt.Observable],
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    initialize: function() {
        this.__c = {};
        
        var m = myt;
        m.global.register('valueProcessors', this);
        
        // Register a few common ValueProcessors
        this.register(new m.UndefinedValueProcessor('undefToEmpty', true, true, true, ''));
        this.register(new m.ToNumberValueProcessor('toNumber', true, true, true));
        this.register(new m.TrimValueProcessor('trimLeft', true, true, true, 'left'));
        this.register(new m.TrimValueProcessor('trimRight', true, true, true, 'right'));
        this.register(new m.TrimValueProcessor('trimBoth', true, true, true, 'both'));
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
        @param processor:myt.ValueProcessor the ValueProcessor to add.
        @returns void */
    register: function(processor) {
        if (processor) {
            var id = processor.id;
            if (id) {
                this.__c[id] = processor;
                this.fireEvent('processorAdded', processor);
            } else {
                myt.dumpStack("No ID");
            }
        } else {
            myt.dumpStack("No processor");
        }
    },
    
    /** Removes a ValueProcessor from this registery.
        @param processor:myt.ValueProcessor the ValueProcessor to remove.
        @returns boolean true if removal succeeds, false otherwise. */
    unregister: function(processor) {
        if (processor) {
            var id = processor.id;
            if (id) {
                // Make sure it's in the repository.
                processor = this.getValueProcessor(id);
                
                if (processor) {
                    delete this.__c[id];
                    this.fireEvent('processorRemoved', processor);
                    return true;
                }
            } else {
                myt.dumpStack("No ID");
            }
        } else {
            myt.dumpStack("No processor");
        }
        return false;
    }
});

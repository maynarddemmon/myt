/** Stores myt.ValueProcessors by ID.
    
    Attributes:
        _processors:Object a map of myt.ValueProcessors by ID.
*/
new JS.Singleton('GlobalValueProcessorRegistry', {
    include: [myt.Observable],
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    initialize: function() {
        this._processors = {};
        myt.global.register('valueProcessors', this);
        
        // Register a few common ValueProcessors
        this.register(new myt.UndefinedValueProcessor('undefToEmpty', true, true, true, ''));
        this.register(new myt.ToNumberValueProcessor('toNumber', true, true, true));
        this.register(new myt.TrimValueProcessor('trimLeft', true, true, true, 'left'));
        this.register(new myt.TrimValueProcessor('trimRight', true, true, true, 'right'));
        this.register(new myt.TrimValueProcessor('trimBoth', true, true, true, 'both'));
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    /** Gets a ValueProcessor for the ID.
        @param id:string the ID of the ValueProcessor to get.
        @returns an myt.ValueProcessor or undefined if not found. */
    getValueProcessor: function(id) {
        return this._processors[id];
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** Adds a ValueProcessor to this registry.
        @param processor:myt.ValueProcessor the ValueProcessor to add.
        @returns void */
    register: function(processor) {
        if (processor) {
            var id = processor.id;
            if (id) {
                this._processors[id] = processor;
                this.fireNewEvent('processorAdded', processor);
            } else {
                myt.dumpStack("No ID on processor");
            }
        } else {
            myt.dumpStack("No processor provided to register.");
        }
    },
    
    /** Removes a ValueProcessor from this registery.
        @param processor:myt.ValueProcessor the ValueProcessor to remove.
        @returns boolean true if removal succeeds, false otherwise. */
    unregister: function(processor) {
        if (processor) {
            var id = processor.id;
            if (id) {
                processor = this.getValueProcessor(id);
                if (processor) {
                    delete this._processors[id];
                    this.fireNewEvent('processorRemoved', processor);
                    return true;
                }
            } else {
                myt.dumpStack("No ID on processor");
            }
        } else {
            myt.dumpStack("No processor provided to unregister.");
        }
        return false;
    }
});

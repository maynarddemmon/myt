/** Creates instances using a template class and an array of data items.
    
    Events:
        None
    
    Attributes:
        template:JS.Class The template to replicate for each entry in the
            data set.
        data:array The data to replicate the template for.
    
    Private Attributes:
        __pool:myt.TrackActivesPool The pool that holds the myt.Replicable
            instances.
*/
myt.Replicator = new JS.Class('Replicator', myt.Node, {
    // Class Methods and Attributes ////////////////////////////////////////////
    extend: {
        SORT_FUNCTION: function(a, b) {
            return a.replicationIndex - b.replicationIndex;
        }
    },
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides myt.Node */
    initNode: function(parent, attrs) {
        this.callSuper(parent, attrs);
        
        this.__setupPool();
        this.doReplication();
    },
    
    /** @overrides myt.Node */
    destroyAfterOrphaning: function() {
        this.__destroyOldPool();
        this.callSuper();
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setTemplate: function(v) {
        // Make sure template class is an myt.Replicable
        this.template = v.includes(myt.Replicable) ? v : null;
        if (!this.template) myt.dumpStack("Template not an myt.Replicable");
        
        if (this.inited) {
            this.__setupPool();
            this.doReplication();
        }
    },
    
    setData: function(v) {
        this.data = v;
        if (this.inited) this.doReplication();
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** @private */
    __setupPool: function() {
        this.__destroyOldPool();
        
        // Create new pool
        var template = this.template;
        if (template) this.__pool = new myt.TrackActivesPool(template, this.parent);
    },
    
    /** @private */
    __destroyOldPool: function() {
        // Destroy old pool and instances.
        var pool = this.__pool;
        if (pool) {
            // Lock layouts before modifying instances
            var layouts = this.parent.getLayouts();
            this.__lockLayouts(layouts);
            
            pool.putActives();
            pool.destroyPooledInstances();
            
            this.__unlockLayouts(layouts, false);
            
            pool.destroy();
        }
    },
    
    /** Performs replication.
        @returns void */
    doReplication: function() {
        var pool = this.__pool;
        if (pool) {
            // Lock layouts before modifying instances
            var layouts = this.parent.getLayouts();
            this.__lockLayouts(layouts);
            
            // Walk actives comparing against data
            var data = this.data, dataLen = data ? data.length : 0,
                actives = pool.getActives(), activesLen = actives.length,
                i = activesLen, active,
                replicationIndex, unused = [],
                sortFunc = myt.Replicator.SORT_FUNCTION;
            
            actives.sort(sortFunc);
            
            while (i) {
                active = actives[--i];
                replicationIndex = active.replicationIndex;
                if (replicationIndex >= dataLen ||
                    !active.alreadyHasReplicationData(data[replicationIndex], replicationIndex)
                ) {
                    unused[replicationIndex] = active;
                }
            }
            
            // Put away all unused actives
            i = unused.length;
            while (i) {
                active = unused[--i];
                if (active) pool.putInstance(active);
            }
            
            // Replicate on unused data and data that was beyond the length
            // of the actives list
            for (i = 0; dataLen > i; ++i) {
                if (i >= activesLen || unused[i] != null) pool.getInstance().replicate(data[i], i);
            }
            
            // Sort layout subviews so the layout reflects the data list order.
            i = layouts.length;
            while (i) layouts[--i].sortSubviews(sortFunc);
            
            this.__unlockLayouts(layouts, true);
        }
    },
    
    // FIXME: Make this a mixin?
    /** Sends a message to each active myt.Replicable.
        @param key:string the name of the message
        @param value:* the value of the message.
        @returns void */
    notify: function(key, value) {
        var pool = this.__pool;
        if (pool) {
            var actives = pool.getActives(), i = actives.length;
            while (i) actives[--i].notify(key, value);
        }
    },
    
    /** @private */
    __lockLayouts: function(layouts) {
        var i = layouts.length;
        while (i) layouts[--i].incrementLockedCounter();
    },
    
    /** @private */
    __unlockLayouts: function(layouts, update) {
        var i = layouts.length, layout;
        while (i) {
            layout = layouts[--i];
            layout.decrementLockedCounter();
            if (update) layout.update();
        }
    }
});

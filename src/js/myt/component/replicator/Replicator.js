/** Creates instances using a template class and an array of data items.
    
    Attributes:
        template:JS.Class The template to replicate for each entry in the
            data set.
        data:array The data to replicate the template for.
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
        
        this._setupPool();
        this.doReplication();
    },
    
    /** @overrides myt.Node */
    destroyAfterOrphaning: function() {
        this._destroyOldPool();
        this.callSuper();
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setTemplate: function(v) {
        this.template = v.includes(myt.Replicable) ? v : null;
        if (!this.template) myt.dumpStack("Template not an myt.Replicable");
        
        if (this.inited) {
            this._setupPool();
            this.doReplication();
        }
    },
    
    setData: function(v) {
        this.data = v;
        if (this.inited) this.doReplication();
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    _setupPool: function() {
        this._destroyOldPool();
        
        // Create new pool
        var template = this.template;
        if (template) this.__pool = new myt.TrackActivesPool(template, this.parent);
    },
    
    _destroyOldPool: function() {
        // Destroy old pool and instances.
        var pool = this.__pool;
        if (pool) {
            // Lock layouts before modifying instances
            var layouts = this.parent.getLayouts();
            this._lockLayouts(layouts);
            
            pool.putActives();
            pool.destroyPooledInstances();
            
            this._unlockLayouts(layouts, false);
            
            pool.destroy();
        }
    },
    
    doReplication: function() {
        var pool = this.__pool;
        if (pool) {
            // Lock layouts before modifying instances
            var layouts = this.parent.getLayouts();
            this._lockLayouts(layouts);
            
            // Walk actives comparing against data
            var data = this.data, dataLen = data ? data.length : 0,
                actives = pool.getActives(), activesLen = actives.length,
                i = activesLen, active,
                replicationIndex, unused = [];
            
            actives.sort(myt.Replicator.SORT_FUNCTION);
            
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
            this._sortLayouts(layouts, myt.Replicator.SORT_FUNCTION);
            
            this._unlockLayouts(layouts, true);
        }
    },
    
    _lockLayouts: function(layouts) {
        var i = layouts.length;
        while (i) layouts[--i].incrementLockedCounter();
    },
    
    _unlockLayouts: function(layouts, update) {
        var i = layouts.length, layout;
        while (i) {
            layout = layouts[--i];
            layout.decrementLockedCounter();
            if (update) layout.update();
        }
    },
    
    _sortLayouts: function(layouts, sortFunc) {
        var i = layouts.length;
        while (i) layouts[--i].sortSubviews(sortFunc);
    }
});

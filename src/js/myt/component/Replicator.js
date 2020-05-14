((pkg) => {
    const sortFunction = (a, b) => a.replicationIndex - b.replicationIndex,
        
        /*  @param {!Array} layouts
            @returns {undefined} */
        lockLayouts = (layouts) => {
            let i = layouts.length;
            while (i) layouts[--i].incrementLockedCounter();
        },
        
        /*  @param {!Array} layouts
            @param {boolean} update
            @returns {undefined} */
        unlockLayouts = (layouts, update) => {
            let i = layouts.length,
                layout;
            while (i) {
                layout = layouts[--i];
                layout.decrementLockedCounter();
                if (update) layout.update();
            }
        },
        
        /*  @param {!Object} replicator
            @returns {undefined} */
        setupPool = (replicator) => {
            destroyOldPool(replicator);
            
            // Create new pool
            const template = replicator.template;
            if (template) replicator.__pool = new pkg.TrackActivesPool(template, replicator.parent);
        },
        
        /*  @param {!Object} replicator
            @returns {undefined} */
        destroyOldPool = (replicator) => {
            // Destroy old pool and instances.
            const pool = replicator.__pool;
            if (pool) {
                // Lock layouts before modifying instances
                const layouts = replicator.parent.getLayouts();
                lockLayouts(layouts);
                
                pool.putActives();
                pool.destroyPooledInstances();
                
                unlockLayouts(layouts, false);
                
                pool.destroy();
            }
        };
    
    /** Objects that can be replicated should include this mixin and implemment
        the replicate method. The myt.Reusable mixin is also included and the
        clean method should also be implemented. The methods replicate and clean
        should perform setup and teardown of the object respectively.
        
        Events:
            None
        
        Attributes:
            replicationData:* The data provided during replication.
            replicationIndex:number The replication index provided 
                during replication.
        
        @class */
    pkg.Replicable = new JS.Module('Replicable', {
        include: [pkg.Reusable],
        
        
        // Methods /////////////////////////////////////////////////////////////
        /** Called to configure the replicable object with data. Subclasses should
            call super.
            @param {?Object} data - The data being replicated for this instance.
            @param {number} idx - The index of the data in the replicated list.
            @returns {undefined} */
        replicate: function(data, idx) {
            this.replicationData = data;
            this.replicationIndex = idx;
        },
        
        // FIXME: Make this a mixin?
        /** Notifies this object that something happened.
            @param {string} key - The name of the message
            @param {*} value - The value of the message.
            @returns {undefined} */
        notify: function(key, value) {},
        
        /** @overrides myt.Reusable
            Subclasses should call super. */
        clean: function() {
            this.replicationData = null;
            this.replicationIndex = -1;
        },
        
        /** Called by an myt.Replicator to check if this replicable needs to be
            updated or not.
            @param {!Object} data - The data being replicated for this instance.
            @param {number} idx - The index of the data in the replicated list.
            @returns {boolean} - True if the provided data is already set on this
                replicable, false otherwise. */
        alreadyHasReplicationData: function(data, idx) {
            // FIXME: Use deepEquals on replicationData?
            return idx === this.replicationIndex && data === this.replicationData;
        }
    });

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
        
        @class */
    pkg.Replicator = new JS.Class('Replicator', pkg.Node, {
        // Life Cycle //////////////////////////////////////////////////////////
        /** @overrides */
        initNode: function(parent, attrs) {
            this.callSuper(parent, attrs);
            
            setupPool(this);
            this.doReplication();
        },
        
        /** @overrides */
        destroyAfterOrphaning: function() {
            destroyOldPool(this);
            this.callSuper();
        },
        
        
        // Accessors ///////////////////////////////////////////////////////////
        setTemplate: function(v) {
            // Make sure template class is an myt.Replicable
            this.template = v.includes(pkg.Replicable) ? v : null;
            if (!this.template) pkg.dumpStack("Template not an myt.Replicable");
            
            if (this.inited) {
                setupPool(this);
                this.doReplication();
            }
        },
        
        setData: function(v) {
            this.data = v;
            if (this.inited) this.doReplication();
        },
        
        
        // Methods /////////////////////////////////////////////////////////////
        /** Performs replication.
            @returns {undefined} */
        doReplication: function() {
            const pool = this.__pool;
            let layouts;
            if (pool) {
                // Lock layouts before modifying instances
                layouts = this.parent.getLayouts();
                lockLayouts(layouts);
                
                // Walk actives comparing against data
                const data = this.data, 
                    dataLen = data ? data.length : 0,
                    actives = pool.getActives(), 
                    activesLen = actives.length, 
                    unused = [];
                let i = activesLen, 
                    active,
                    replicationIndex;
                
                actives.sort(sortFunction);
                
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
                while (i) layouts[--i].sortSubviews(sortFunction);
                
                unlockLayouts(layouts, true);
            }
        },
        
        // FIXME: Make this a mixin?
        /** Sends a message to each active myt.Replicable.
            @param {string} key - The name of the message
            @param {*} value - The value of the message.
            @returns {undefined} */
        notify: function(key, value) {
            const pool = this.__pool;
            if (pool) {
                const actives = pool.getActives();
                let i = actives.length;
                while (i) actives[--i].notify(key, value);
            }
        }
    });
})(myt);

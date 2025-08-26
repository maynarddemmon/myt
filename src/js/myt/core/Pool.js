(pkg => {
    const JSClass = JS.Class,
        
        NOOP = pkg.NOOP,
        
        consoleWarn = console.warn,
        
        /*  Get the object pool.
            @param {boolean} lazy - If true a pool will be lazily instantiated.
            @returns {!Object} */
        getObjPool = (abstractPool, lazy) => lazy ? abstractPool.__op ??= [] : abstractPool.__op,
        
        /*  Get the active objects array.
            @param {boolean} lazy - If true a list will be lazily instantiated.
            @returns {!Array} */
        getActiveObjArray = (trackActivesPool, lazy) => lazy ? trackActivesPool.__actives ??= [] : trackActivesPool.__actives,
        
        /** Implements an object pool. Subclasses must, at a minimum, implement the 
            createInstance method.
            
            Private Attributes:
                __op:array The array of objects stored in the pool.
            
            @class */
        AbstractPool = new JSClass('AbstractPool', {
            include: [pkg.Destructible],
            
            
            // Constructor /////////////////////////////////////////////////////
            /*  No initialize since it would do nothing. Subclasses must not
                call super during initialization. */
            
            
            // Life Cycle //////////////////////////////////////////////////////
            /** @overrides myt.Destructible */
            destroy: function() {
                const objPool = getObjPool(this);
                if (objPool) objPool.length = 0;
                
                this.callSuper();
            },
            
            
            // Methods /////////////////////////////////////////////////////////
            /** Get an instance from the pool.
                @param {?Object} [attrs] - The attributes used to initialize the instance if and
                    existing instance can't be pulled from the Pool.
                @returns {!Object} */
            getInstance: function(attrs) {
                return getObjPool(this, true).pop() ?? this.createInstance(attrs);
            },
            
            /** Creates a new object that can be stored in the pool. The default implementation 
                does nothing.
                @returns {?Object} */
            createInstance: NOOP,
            
            /** Puts the object back in the pool. The object will be "cleaned" before it is stored.
                @param {!Object} obj - The object to put in the pool.
                @returns {void} */
            putInstance: function(obj) {
                getObjPool(this, true).push(this.cleanInstance(obj));
            },
            
            /** Cleans the object in preparation for putting it back in the pool. The default 
                implementation calls the clean method on the object if it is a function. Otherwise 
                it does nothing.
                @param {!Object} obj - The object to be cleaned.
                @returns {!Object} - The cleaned object. */
            cleanInstance: obj => {
                if (typeof obj.clean === 'function') obj.clean();
                return obj;
            },
            
            /** Calls the destroy method on all object stored in the pool if they have a 
                destroy function.
                @returns {void} */
            destroyPooledInstances: function() {
                const objPool = getObjPool(this);
                if (objPool) {
                    let i = objPool.length;
                    while (i) {
                        const obj = objPool[--i];
                        if (typeof obj.destroy === 'function') obj.destroy();
                    }
                    objPool.length = 0;
                }
            }
        }),
        
        /** An implementation of an myt.AbstractPool.
            
            Attributes:
                instanceClass:JS.Class (initializer only) the class to use for new instances. 
                    Defaults to Object.
                instanceParent:myt.Node (initializer only) The node to create new instances on.
            
            @class */
        SimplePool = pkg.SimplePool = new JSClass('SimplePool', AbstractPool, {
            // Constructor /////////////////////////////////////////////////////
            /** @overrides myt.AbstractPool
                Create a new myt.SimplePool
                @param {!Function} instanceClass - The JS.Class to create instances from.
                @param {?Object} [instanceParent] - The place to create instances on. When 
                    instanceClass is an myt.Node this will be the node parent.
                @returns {void} */
            initialize: function(instanceClass, instanceParent) {
                this.instanceClass = instanceClass;
                this.instanceParent = instanceParent;
            },
            
            
            // Methods /////////////////////////////////////////////////////////
            /** @overrides myt.AbstractPool
                Creates an instance of this Pool's instanceClass and passes in this Pool's
                instanceParent, if it exists, as the first argument to the instance.
                @param {?Object} [attrs] - The attributes used to initialize the instance.
                @returns {?Object} - The new instance. */
            createInstance: function(attrs) {
                const {instanceClass, instanceParent} = this;
                return instanceParent ? new instanceClass(instanceParent, attrs) : new instanceClass();
            }
        }),
        
        /** A myt.SimplePoolTracks that tracks which objects are "active". An "active" object is 
            one that has been obtained by the getInstance method and is thus in use.
            
            Private Attributes:
                __actives:array an array of active instances.
            
            @class */
        TrackActivesPool = pkg.TrackActivesPool = new JSClass('TrackActivesPool', SimplePool, {
            // Life Cycle //////////////////////////////////////////////////////
            /** @overrides myt.Destructible */
            destroy: function() {
                const actives = getActiveObjArray(this);
                if (actives) actives.length = 0;
                
                this.callSuper();
            },
            
            
            // Methods /////////////////////////////////////////////////////////
            /** @overrides myt.AbstractPool */
            getInstance: function(attrs) {
                const instance = this.callSuper(attrs);
                getActiveObjArray(this, true).push(instance);
                return instance;
            },
            
            /** @overrides myt.AbstractPool */
            putInstance: function(obj) {
                const actives = getActiveObjArray(this);
                let warningType;
                if (actives) {
                    const idx = actives.indexOf(obj);
                    if (idx > -1) {
                        actives.splice(idx, 1);
                        this.callSuper(obj);
                        return;
                    }
                    warningType = 'inactive';
                } else {
                    warningType = 'missing';
                }
                consoleWarn('Tried to put a ' + warningType + ' instance', obj, this);
            },
            
            /** Gets an array of the active instances.
                @param {?Function} [filterFunc] - If provided filters the results.
                @returns {!Array} */
            getActives: function(filterFunc) {
                const actives = getActiveObjArray(this);
                if (actives) {
                    if (filterFunc) {
                        const retval = [],
                            len = actives.length;
                        for (let i = 0; len > i;) {
                            const active = actives[i++];
                            if (filterFunc.call(this, active)) retval.push(active);
                        }
                        return retval;
                    }
                    return actives.slice();
                }
                return [];
            },
            
            /** Puts all the active instances back in the pool.
                @returns {void} */
            putActives: function() {
                const actives = getActiveObjArray(this);
                if (actives) {
                    let i = actives.length;
                    while (i) this.putInstance(actives[--i]);
                }
            }
        });
    
    /** A pool that tracks which objects are "active" and stores objects of different classes in 
        different internal TrackActivesPools.
        
        Private Attributes:
            __pbk:object Stores TrackActivesPools by key.
            __pbCN:object Stores TrackActivesPools by the display name of the instance classes.
        
        @class */
    pkg.TrackActivesMultiPool = new JSClass('TrackActivesMultiPool', AbstractPool, {
        // Constructor /////////////////////////////////////////////////////////
        /** @overrides myt.AbstractPool */
        initialize: function(instanceClassesByKey, instanceParent) {
            const poolsByClassName = this.__pbCN = {},
                poolsByKey = this.__pbk = {};
            for (const key in instanceClassesByKey) {
                const klass = instanceClassesByKey[key];
                poolsByKey[key] = poolsByClassName[klass.__displayName] = new TrackActivesPool(klass, instanceParent);
            }
        },
        
        
        // Life Cycle //////////////////////////////////////////////////////////
        destroy: function() {
            const poolsByKey = this.__pbk;
            for (const key in poolsByKey) poolsByKey[key].destroy();
            
            this.callSuper();
        },
        
        
        // Methods /////////////////////////////////////////////////////////////
        /** @overrides myt.AbstractPool */
        getInstance: function(key, attrs) {
            const pool = this.__pbk[key];
            if (pool) {
                return pool.getInstance(attrs);
            } else {
                consoleWarn('No pool for key', key);
            }
        },
        
        /** @overrides myt.AbstractPool */
        putInstance: function(obj) {
            const pool = this.__pbCN[obj.klass.__displayName];
            if (pool) {
                pool.putInstance(obj);
            } else {
                consoleWarn('No pool for obj', obj);
            }
        },
        
        /** @overrides myt.AbstractPool */
        destroyPooledInstances: function() {
            const poolsByKey = this.__pbk;
            for (const key in poolsByKey) poolsByKey[key].destroyPooledInstances();
        },
        
        /** Gets the active instances across all TrackActivesPools contained herein. This mimics
            part of the TrackActivesPools API so a TrackActivesMultiPool can be treated like
            a TrackActivesPool.
            @param {?Function} [filterFunc] - If provided filters the results.
            @returns {!Array} */
        getActives: function(filterFunc) {
            let actives = [];
            const poolsByKey = this.__pbk;
            for (const key in poolsByKey) actives.push(...poolsByKey[key].getActives(filterFunc));
            return actives;
        },
        
        /** Puts all active instances, across all TrackActivesPools contained herein, back in
            their respective Pools. This mimics part of the TrackActivesPools API so a 
            TrackActivesMultiPool can be treated like a TrackActivesPool. */
        putActives: function() {
            const poolsByKey = this.__pbk;
            for (const key in poolsByKey) poolsByKey[key].putActives();
        }
    });
    
    /** Objects that can be used in an myt.AbstractPool should use this mixin and implement the 
        "clean" method.
        
        @class */
    pkg.Reusable = new JS.Module('Reusable', {
        // Methods /////////////////////////////////////////////////////////////
        /** Puts this object back into a default state suitable for storage in an myt.AbstractPool
            @returns {void} */
        clean: NOOP
    });
})(myt);

(pkg => {
    const JSClass = JS.Class,
        JSModule = JS.Module,
        
        /*  Get the object pool.
            @private
            @param {boolean} lazy - If true a pool will be lazily instantiated.
            @returns {!Object} */
        getObjPool = (abstractPool, lazy) => lazy ? abstractPool.__op || (abstractPool.__op = []) : abstractPool.__op,
        
        /*  Get the active objects array.
            @private
            @param {boolean} lazy - If true a list will be lazily instantiated.
            @returns {!Array} */
        getActiveObjArray = (trackActivesPool, lazy) => lazy ? trackActivesPool.__actives || (trackActivesPool.__actives = []) : trackActivesPool.__actives,
        
        makeInstance = (parent, instanceClass, attrs) => parent ? new instanceClass(parent, attrs) : new instanceClass(),
        
        destroyObjectPool = objPool => {
            if (objPool) {
                let i = objPool.length;
                while (i) {
                    const obj = objPool[--i];
                    if (typeof obj.destroy === 'function') obj.destroy();
                }
            }
        },
        
        /** Implements an object pool. Subclasses must at a minimum implement 
            the createInstance method.
            
            Private Attributes:
                __op:array The array of objects stored in the pool.
            
            @class */
        AbstractPool = new JSClass('AbstractPool', {
            include: [pkg.Destructible],
            
            
            // Constructor /////////////////////////////////////////////////////
            /** Initialize does nothing.
                @returns {undefined} */
            initialize: () => {},
            
            
            // Life Cycle //////////////////////////////////////////////////////
            /** @overrides myt.Destructible */
            destroy: function() {
                const objPool = getObjPool(this);
                if (objPool) objPool.length = 0;
                
                this.callSuper();
            },
            
            
            // Methods /////////////////////////////////////////////////////////
            /** Get an instance from the pool.
                The arguments passed in will be passed to the createInstance 
                method. Note: these have no effect if an object already exists 
                in the pool.
                @returns {!Object} */
            getInstance: function() {
                const objPool = getObjPool(this, true);
                return objPool.length ? objPool.pop() : this.createInstance.apply(this, arguments);
            },
            
            /** Creates a new object that can be stored in the pool. 
                The default implementation does nothing.
                @returns {?Object} */
            createInstance: () => null,
            
            /** Puts the object back in the pool. The object will be "cleaned"
                before it is stored.
                @param {!Object} obj - The object to put in the pool.
                @returns {undefined} */
            putInstance: function(obj) {
                getObjPool(this, true).push(this.cleanInstance(obj));
            },
            
            /** Cleans the object in preparation for putting it back in the 
                pool. The default implementation calls the clean method on 
                the object if it is a function. Otherwise it does nothing.
                @param {!Object} obj - The object to be cleaned.
                @returns {!Object} - The cleaned object. */
            cleanInstance: obj => {
                if (typeof obj.clean === 'function') obj.clean();
                return obj;
            },
            
            /** Calls the destroy method on all object stored in the pool if 
                they have a destroy function.
                @returns {undefined} */
            destroyPooledInstances: function() {
                destroyObjectPool(getObjPool(this));
            }
        }),
        
        /** An implementation of an myt.AbstractPool.
            
            Attributes:
                instanceClass:JS.Class (initializer only) the class to use 
                    for new instances. Defaults to Object.
                instanceParent:myt.Node (initializer only) The node to create 
                    new instances on.
            
            @class */
        SimplePool = pkg.SimplePool = new JSClass('SimplePool', AbstractPool, {
            // Constructor /////////////////////////////////////////////////////
            /** Create a new myt.SimplePool
                @param {!Function} instanceClass - The JS.Class to create 
                    instances from.
                @param {?Object} [instanceParent] - The place to create 
                    instances on. When instanceClass is an myt.Node this 
                    will be the node parent.
                @returns {undefined} */
            initialize: function(instanceClass, instanceParent) {
                this.callSuper();
                
                this.instanceClass = instanceClass || Object;
                this.instanceParent = instanceParent;
            },
            
            
            // Methods /////////////////////////////////////////////////////////
            /** @overrides myt.AbstractPool
                Creates an instance of this.instanceClass and passes in 
                this.instanceParent as the first argument if it exists.
                arguments[0]:object (optional) the attrs to be passed to a 
                created myt.Node.
                @returns {?Object} */
            createInstance: function() {
                return makeInstance(this.instanceParent, this.instanceClass, arguments[0]);
            }
        }),
        
        /** Tracks which objects are "active". An "active" object is one that 
            has been obtained by the getInstance method.
            
            Private Attributes:
                __actives:array an array of active instances.
            
            @class */
        TrackActives = new JSModule('TrackActives', {
            // Life Cycle //////////////////////////////////////////////////////
            /** @overrides myt.Destructible */
            destroy: function() {
                const actives = getActiveObjArray(this);
                if (actives) actives.length = 0;
                
                this.callSuper();
            },
            
            
            // Methods /////////////////////////////////////////////////////////
            /** @overrides myt.AbstractPool */
            getInstance: function() {
                const instance = this.callSuper();
                getActiveObjArray(this, true).push(instance);
                return instance;
            },
            
            /** @overrides myt.AbstractPool */
            putInstance: function(obj) {
                const actives = getActiveObjArray(this);
                let warningType;
                if (actives) {
                    let i = actives.length;
                    while (i) {
                        if (actives[--i] === obj) {
                            actives.splice(i, 1);
                            this.callSuper(obj);
                            return;
                        }
                    }
                    warningType = 'inactive';
                } else {
                    warningType = 'missing';
                }
                console.warn('Tried to put a ' + warningType + ' instance', obj, this);
            },
            
            /** Gets an array of the active instances.
                @param {?Function} [filterFunc] - If provided filters the 
                    results.
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
                    return actives.concat();
                }
                return [];
            },
            
            /** Puts all the active instances back in the pool.
                @returns {undefined} */
            putActives: function() {
                const actives = getActiveObjArray(this);
                if (actives) {
                    let i = actives.length;
                    while (i) this.putInstance(actives[--i]);
                }
            }
        }),
        
        /** An myt.SimplePool that tracks which objects are "active".
            
            @class */
        TrackActivesPool = pkg.TrackActivesPool = new JSClass('TrackActivesPool', SimplePool, {
            include: [TrackActives]
        });
    

    /** A pool that tracks which objects are "active" and stores objects of
        different classes in different internal TrackActivesPools.
        
        Private Attributes:
            __pbk:object Stores TrackActivesPools by key.
        
        @class */
    pkg.TrackActivesMultiPool = new JSClass('TrackActivesMultiPool', AbstractPool, {
        // Constructor /////////////////////////////////////////////////////////
        initialize: function(instanceClassesByKey, instanceParent) {
            this.callSuper();
            
            this.instanceClassesByKey = instanceClassesByKey;
            
            const poolsByClassName = this._poolsByClassName = {},
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
        getInstance: function() {
            const key = arguments[0],
                pool = this.__pbk[key];
            if (pool) {
                return pool.getInstance(arguments);
            } else {
                console.warn('No pool for key', key);
            }
        },
        
        putInstance: function(obj) {
            const pool = this._poolsByClassName[obj.klass.__displayName];
            if (pool) {
                pool.putInstance(obj);
            } else {
                console.warn('No pool for obj', obj);
            }
        },
        
        destroyPooledInstances: function() {
            const poolsByKey = this.__pbk;
            for (const key in poolsByKey) poolsByKey[key].destroyPooledInstances();
        },
        
        getActives: function(filterFunc) {
            let actives = [];
            const poolsByKey = this.__pbk;
            for (const key in poolsByKey) actives = actives.concat(poolsByKey[key].getActives(filterFunc));
            return actives;
        },
        
        putActives: function() {
            const poolsByKey = this.__pbk;
            for (const key in poolsByKey) poolsByKey[key].putActives();
        }
    });
    
    /** Objects that can be used in an myt.AbstractPool should use this mixin 
        and implement the "clean" method.
        
        @class */
    pkg.Reusable = new JSModule('Reusable', {
        // Methods /////////////////////////////////////////////////////////////
        /** Puts this object back into a default state suitable for storage in
            an myt.AbstractPool
            @returns {undefined} */
        clean: () => {}
    });
})(myt);

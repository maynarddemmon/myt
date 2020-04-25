/** Implements an object pool. Subclasses must at a minimum implement the 
    createInstance method.
    
    Events:
        None
    
    Attributes:
        None
    
    Private Attributes:
        __op:array The array of objects stored in the pool.
    
    @class */
myt.AbstractPool = new JS.Class('AbstractPool', {
    include: [myt.Destructible],
    
    
    // Constructor /////////////////////////////////////////////////////////////
    /** Initialize does nothing.
        @returns {undefined} */
    initialize: function() {},
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides myt.Destructible */
    destroy: function() {
        var objPool = this.__getObjPool();
        if (objPool) objPool.length = 0;
        
        this.callSuper();
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** Get the object pool.
        @private
        @param {boolean} lazy - If true a pool will be lazily instantiated.
        @returns {!Object} */
    __getObjPool: function(lazy) {
        return lazy ? this.__op || (this.__op = []) : this.__op;
    },
    
    /** Get an instance from the pool.
        The arguments passed in will be passed to the createInstance method.
        Note: these have no effect if an object already exists in the pool.
        @returns {!Object} */
    getInstance: function() {
        var objPool = this.__getObjPool(true);
        return objPool.length ? objPool.pop() : this.createInstance.apply(this, arguments);
    },
    
    /** Creates a new object that can be stored in the pool. The default
        implementation does nothing.
        @returns {?Object} */
    createInstance: function() {
        return null;
    },
    
    /** Puts the object back in the pool. The object will be "cleaned"
        before it is stored.
        @param {!Object} obj - The object to put in the pool.
        @returns {undefined} */
    putInstance: function(obj) {
        this.__getObjPool(true).push(this.cleanInstance(obj));
    },
    
    /** Cleans the object in preparation for putting it back in the pool. The
        default implementation calls the clean method on the object if it is
        a myt.Reusable. Otherwise it does nothing.
        @param {!Object} obj - The object to be cleaned.
        @returns {!Object} - The cleaned object. */
    cleanInstance: function(obj) {
        if (typeof obj.clean === 'function') obj.clean();
        return obj;
    },
    
    /** Calls the destroy method on all object stored in the pool if they
        have a destroy function.
        @returns {undefined} */
    destroyPooledInstances: function() {
        var objPool = this.__getObjPool();
        if (objPool) {
            var i = objPool.length, obj;
            while (i) {
                obj = objPool[--i];
                if (typeof obj.destroy === 'function') obj.destroy();
            }
        }
    }
});

/** An implementation of an object pool. Subclasses must implement the
    createInstance method.
    
    Attributes:
        __objPool:array The array of object stored in the pool.
*/
myt.AbstractPool = new JS.Class('AbstractPool', {
    include: [myt.Destructible],
    
    
    // Constructor /////////////////////////////////////////////////////////////
    /** Initialize does nothing. */
    initialize: function() {},
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides myt.Destructible */
    destroy: function() {
        var objPool = this.__objPool;
        if (objPool) objPool.length = 0;
        
        this.callSuper();
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** Get an instance from the pool.
        @param arguments:arguments (optional) arguments to be passed to the
            createInstance method. Note: these have no effect if an object
            already exists in the pool.
        @returns object */
    getInstance: function() {
        var objPool = this.__objPool;
        if (!objPool) objPool = this.__objPool = [];
        
        return objPool.length ? objPool.pop() : this.createInstance.apply(this, arguments);
    },
    
    /** Creates a new object that can be stored in the pool. The default
        implementation does nothing. */
    createInstance: function() {
        return null;
    },
    
    /** Puts the object back in the pool. The object will be "cleaned"
        before it is stored.
        @param obj:object the object to put in the pool.
        @returns void */
    putInstance: function(obj) {
        var objPool = this.__objPool;
        if (!objPool) objPool = this.__objPool = [];
        
        objPool.push(this.cleanInstance(obj));
    },
    
    /** Cleans the object in preparation for putting it back in the pool. The
        default implementation calls the clean method on the object if it is
        a myt.Reusable. Otherwise it does nothing.
        @param obj:object the object to be cleaned.
        @returns object the cleaned object. */
    cleanInstance: function(obj) {
        if (typeof obj.clean === 'function') obj.clean();
        return obj;
    },
    
    /** Calls the destroy method on all object stored in the pool if they
        have a destroy function.
        @returns void */
    destroyPooledInstances: function() {
        var objPool = this.__objPool;
        if (objPool) {
            var i = objPool.length, obj;
            while (i) {
                obj = objPool[--i];
                if (typeof obj.destroy === 'function') obj.destroy();
            }
        }
    }
});

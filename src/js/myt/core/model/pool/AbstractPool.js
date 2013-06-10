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
        
        if (objPool.length) {
            return objPool.pop();
        } else {
            return this.createInstance.apply(this, arguments);
        }
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
        if (typeof obj.isA === 'function' && obj.isA(myt.Reusable)) obj.clean();
        return obj;
    }
});

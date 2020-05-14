/** An implementation of an myt.AbstractPool.
    
    Events
        None
    
    Attributes:
        instanceClass:JS.Class (initializer only) the class to use for 
            new instances. Defaults to Object.
        instanceParent:myt.Node (initializer only) The node to create new
            instances on.
    
    @class */
myt.SimplePool = new JS.Class('SimplePool', myt.AbstractPool, {
    // Constructor /////////////////////////////////////////////////////////////
    /** Create a new myt.SimplePool
        @param {!Function} instanceClass - The JS.Class to create instances from.
        @param {?Object} [instanceParent] - The place to create instances 
            on. When instanceClass is an myt.Node this will be the node parent.
        @returns {undefined} */
    initialize: function(instanceClass, instanceParent) {
        this.callSuper();
        
        this.instanceClass = instanceClass || Object;
        this.instanceParent = instanceParent;
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** @overrides myt.AbstractPool
        Creates an instance of this.instanceClass and passes in 
        this.instanceParent as the first argument if it exists.
        arguments[0]:object (optional) the attrs to be passed to a created myt.Node.
        @returns {?Object} */
    createInstance: function() {
        // If we ever need full arguments with new, see:
        // http://stackoverflow.com/questions/1606797/use-of-apply-with-new-operator-is-this-possible
        const parent = this.instanceParent, 
            instanceClass = this.instanceClass;
        return parent ? new instanceClass(parent, arguments[0]) : new instanceClass();
    }
});

/** An implementation of an myt.AbstractPool.
    
    Attributes:
        instanceClass:JS.Class the class to use for new instances.
        instanceParent:myt.Node
*/
myt.SimplePool = new JS.Class('SimplePool', myt.AbstractPool, {
    // Constructor /////////////////////////////////////////////////////////////
    /** Create a new myt.SimplePool
        @param instanceClass:JS.Class the class to create instances from.
        @param instanceParent:object (optional) the place to create instances 
            on. When instanceClass is an myt.Node this will be the node parent.
        @returns void */
    initialize: function(instanceClass, instanceParent) {
        this.callSuper();
        
        this.instanceClass = instanceClass || Object;
        this.instanceParent = instanceParent;
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** @overrides myt.AbstractPool
        Creates an instance of this.instanceClass and passes in 
        this.instanceParent as the first argument if it exists. */
    createInstance: function() {
        var parent = this.instanceParent;
        if (parent) {
            return new this.instanceClass(parent);
        } else {
            return new this.instanceClass();
        }
    }
});

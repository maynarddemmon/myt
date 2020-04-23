((pkg) => {
    var globalRootViewRegistry,
        
        /** Holds an array of RootViews. */
        roots = [];
    
    /** Provides events when a new myt.RootView is created or destroyed.
        Registered in myt.global as 'roots'.
        
        Events:
            rootAdded:RootView Fired when a RootView is added. The value is the 
                RootView added.
            rootRemoved:RootView Fired when a RootView is removed. The value is the 
                RootView removed.
        
        Attributes:
            None
    */
    new JS.Singleton('GlobalRootViewRegistry', {
        include: [pkg.Observable],
        
        
        // Life Cycle //////////////////////////////////////////////////////////
        initialize: function() {
            pkg.global.register('roots', globalRootViewRegistry = this);
        },
        
        
        // Accessors ///////////////////////////////////////////////////////////
        /** Gets the list of global root views.
            @returns array of RootViews. */
        getRoots: () => roots,
        
        
        // Methods /////////////////////////////////////////////////////////////
        /** Add a rootable to the global list of root views.
            @param r:RootView the RootView to add.
            @returns {undefined} */
        addRoot: (r) => {
            roots.push(r);
            globalRootViewRegistry.fireEvent('rootAdded', r);
        },
        
        /** Remove a rootable from the global list of root views.
            @param r:RootView the RootView to remove.
            @returns {undefined} */
        removeRoot: (r) => {
            var i = roots.length,
                root;
            while(i) {
                root = roots[--i];
                if (root === r) {
                    roots.splice(i, 1);
                    globalRootViewRegistry.fireEvent('rootRemoved', root);
                    break;
                }
            }
        }
    });
})(myt);

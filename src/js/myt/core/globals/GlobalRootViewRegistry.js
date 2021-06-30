((pkg) => {
    let globalRootViewRegistry;
        
    /* Holds an array of RootViews. */
    const roots = [];
    
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
            @returns {!Array} of RootViews. */
        getRoots: () => roots,
        
        
        // Methods /////////////////////////////////////////////////////////////
        /** Add a rootable to the global list of root views.
            @param {!Object} r - The RootView to add.
            @returns {undefined} */
        addRoot: (r) => {
            roots.push(r);
            globalRootViewRegistry.fireEvent('rootAdded', r);
        },
        
        /** Remove a rootable from the global list of root views.
            @param {!Object} rootToRemove - The RootView to remove.
            @returns {undefined} */
        removeRoot: rootToRemove => {
            let i = roots.length;
            while (i) {
                const root = roots[--i];
                if (root === rootToRemove) {
                    roots.splice(i, 1);
                    globalRootViewRegistry.fireEvent('rootRemoved', root);
                    break;
                }
            }
        }
    });
})(myt);

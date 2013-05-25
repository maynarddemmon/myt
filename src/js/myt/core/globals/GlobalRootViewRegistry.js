/** Provides events when a new myt.RootView is created or destroyed.
    Registered in myt.global as 'roots'. 
    
    Events:
        rootAdded:RootView Fired when a RootView is added. The value is the 
            RootView added.
        rootRemoved:RootView Fired when a RootView is removed. The value is the 
            RootView removed.
    
    Attributes:
        _roots:array Holds an array of RootViews.
*/
new JS.Singleton('GlobalRootViewRegistry', {
    include: [myt.Observable],
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    initialize: function() {
        this._roots = [];
        myt.global.register('roots', this);
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    /** Gets the list of global root views.
        @returns array of RootViews. */
    getRoots: function() {
        return this._roots;
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** Add a rootable to the global list of root views.
        @param r:RootView the RootView to add.
        @returns void */
    addRoot: function(r) {
        this._roots.push(r);
        this.fireNewEvent('rootAdded', r);
    },
    
    /** Remove a rootable from the global list of root views.
        @param r:RootView the RootView to remove.
        @returns void */
    removeRoot: function(r) {
        var roots = this._roots;
        var i = roots.length;
        while(i) {
            root = roots[--i];
            if (root === r) {
                roots.splice(i, 1);
                this.fireNewEvent('rootRemoved', root);
                break;
            }
        }
    }
});

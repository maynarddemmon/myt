/** Allows a view to act as a "root" for a view hierarchy. A "root" view is 
    backed by a dom element from the page rather than a dom element created 
    by the view. */
myt.RootView = new JS.Module('RootView', {
    // Life Cycle //////////////////////////////////////////////////////////////
    initNode: function(parent, attrs) {
        this.callSuper(parent, attrs);
        
        myt.global.roots.addRoot(this);
    },
    
    /** @overrides myt.View */
    createOurDomElement: function(parent) {
        // A root view has a dom element provided as the parent. We use
        // that dom element as our domElement.
        return parent;
    },
    
    /** @overrides myt.View */
    destroyAfterOrphaning: function() {
        myt.global.roots.removeRoot(this);
        this.removeDomElement();
        this.callSuper();
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    /** @overrides myt.Node */
    setParent: function(parent) {
        // RootView views don't have a parent.
        this.callSuper(undefined);
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** @overrides myt.View */
    bringToFront: function() {
        // Attempt to manipulate dom above root node.
        var parentNode = this.domElement.parentNode;
        if (this.domElement === parentNode.lastChild) return;
        var removedElem = parentNode.removeChild(this.domElement);
        if (removedElem) parentNode.appendChild(removedElem);
    },
    
    /** @overrides myt.View */
    sendToBack: function() {
        // Attempt to manipulate dom above root node.
        var parentNode = this.domElement.parentNode;
        if (this.domElement === parentNode.firstChild) return;
        var removedElem = parentNode.removeChild(this.domElement);
        if (removedElem) parentNode.insertBefore(removedElem, parentNode.firstChild);
    },
    
    /** @overrides myt.View */
    sendBehind: function(otherRootView) {
        // Attempt to manipulate dom above root node.
        var de = this.domElement;
        var otherDe = otherRootView.domElement;
        var parentNode = de.parentNode;
        if (otherDe.parentNode !== parentNode) return;
        var removedElem = parentNode.removeChild(de);
        if (removedElem) parentNode.insertBefore(removedElem, otherDe);
    },
    
    /** @overrides myt.View */
    sendInFrontOf: function(otherRootView) {
        // Attempt to manipulate dom above root node.
        if (otherRootView.domElement.parentNode !== this.domElement.parentNode) return;
        this.sendBehind(otherRootView);
        otherRootView.sendBehind(this);
    }
});

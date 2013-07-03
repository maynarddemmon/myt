/** Allows a view to act as a "root" for a view hierarchy. A "root" view is 
    backed by a dom element from the page rather than a dom element created 
    by the view.
    
    Attributes:
        keepDomElementWhenDestroyed:boolean Indicates the dom element backing 
            this view must not be destroyed when this view is destroyed. 
            Defaults to undefined which is equivalent to false.
*/
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
        if (!this.keepDomElementWhenDestroyed) this.removeDomElement();
        this.callSuper();
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setKeepDomElementWhenDestroyed: function(keepDomElementWhenDestroyed) {
        this.keepDomElementWhenDestroyed = keepDomElementWhenDestroyed;
    },
    
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
        var de = this.domElement,
            otherDe = otherRootView.domElement,
            parentNode = de.parentNode;
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

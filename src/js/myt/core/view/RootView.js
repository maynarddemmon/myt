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
        
        // Establish a stacking context
        this.setZIndex(0);
        
        // Set a css class to allow scoping of CSS rules
        this.addDomClass('myt');
        
        myt.global.roots.addRoot(this);
        
        // Prevent default drag/drop behavior
        // DUPE: Similar code exists in myt.Dimmer.
        var cdf = this.__captureDrop = function(event) {event.preventDefault();},
            de = this.domElement;
        myt.addEventListener(de, 'drop', cdf);
        myt.addEventListener(de, 'dragover', cdf);
    },
    
    /** @overrides myt.View */
    createOurDomElement: function(parent) {
        // A root view has a dom element provided as the parent. We use
        // that dom element as our domElement.
        return parent;
    },
    
    /** @overrides myt.View */
    destroyAfterOrphaning: function() {
        // Cleanup dom listeners for drag/drop.
        // DUPE: Similar code exists in myt.Dimmer.
        var de = this.domElement, cdf = this.__captureDrop;
        myt.removeEventListener(de, 'drop', cdf);
        myt.removeEventListener(de, 'dragover', cdf);
        
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
        // A root view doesn't have a parent view.
        this.callSuper(undefined);
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** @overrides myt.View */
    bringToFront: function() {
        // Attempt to manipulate dom above root node.
        var parentNode = this.domElement.parentNode;
        if (this.domElement !== parentNode.lastChild) {
            var removedElem = parentNode.removeChild(this.domElement);
            if (removedElem) parentNode.appendChild(removedElem);
        }
    },
    
    /** @overrides myt.View */
    sendToBack: function() {
        // Attempt to manipulate dom above root node.
        var parentNode = this.domElement.parentNode;
        if (this.domElement !== parentNode.firstChild) {
            var removedElem = parentNode.removeChild(this.domElement);
            if (removedElem) parentNode.insertBefore(removedElem, parentNode.firstChild);
        }
    },
    
    /** @overrides myt.View */
    sendBehind: function(otherRootView) {
        // Attempt to manipulate dom above root node.
        var de = this.domElement,
            otherDe = otherRootView.domElement,
            parentNode = de.parentNode;
        if (otherDe.parentNode === parentNode) {
            var removedElem = parentNode.removeChild(de);
            if (removedElem) parentNode.insertBefore(removedElem, otherDe);
        }
    },
    
    /** @overrides myt.View */
    sendInFrontOf: function(otherRootView) {
        // Attempt to manipulate dom above root node.
        if (otherRootView.domElement.parentNode === this.domElement.parentNode) {
            this.sendBehind(otherRootView);
            otherRootView.sendBehind(this);
        }
    }
});

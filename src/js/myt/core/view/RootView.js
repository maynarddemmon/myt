/** Allows a view to act as a "root" for a view hierarchy. A "root" view is 
    backed by a dom element from the page rather than a dom element created 
    by the view.
    
    Attributes:
        keepDomElementWhenDestroyed:boolean Indicates the dom element backing 
            this view must not be destroyed when this view is destroyed. 
            Defaults to undefined which is equivalent to false.
*/
myt.RootView = new JS.Module('RootView', {
    // Class Methods and Attributes ////////////////////////////////////////////
    extend: {
        /** Prevents default drag/drop behavior.
            @param v:myt.View the view to supress default dragover and drop on.
            @returns void */
        setupCaptureDrop: function(v) {
            var cdf = v.__captureDrop = function(event) {event.preventDefault();},
                de = v.domElement;
            myt.addEventListener(de, 'drop', cdf);
            myt.addEventListener(de, 'dragover', cdf);
        },
        
        /** Cleanup dom listeners for drag/drop.
            @param v:myt.View the view that had supressed default dragover 
                and drop on.
            @returns void */
        teardownCaptureDrop: function(v) {
            var de = v.domElement, cdf = v.__captureDrop;
            myt.removeEventListener(de, 'drop', cdf);
            myt.removeEventListener(de, 'dragover', cdf);
        }
    },
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    initNode: function(parent, attrs) {
        this.callSuper(parent, attrs);
        
        // Establish a stacking context
        this.setZIndex(0);
        
        // Set a css class to allow scoping of CSS rules
        this.addDomClass('myt');
        
        myt.global.roots.addRoot(this);
        
        myt.RootView.setupCaptureDrop(this);
    },
    
    /** @overrides myt.View */
    createOurDomElement: function(parent) {
        // If not parent is provided create a new dom element
        if (!parent) {
            parent = this.callSuper(parent);
            myt.getElement().appendChild(parent);
        }
        
        // A root view has a dom element provided as the parent. We use
        // that dom element as our domElement.
        return parent;
    },
    
    /** @overrides myt.View */
    destroyAfterOrphaning: function() {
        myt.RootView.teardownCaptureDrop(this);
        
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
        var de = this.domElement, parentNode = de.parentNode;
        if (de !== parentNode.lastChild) {
            var removedElem = parentNode.removeChild(de);
            if (removedElem) parentNode.appendChild(removedElem);
        }
    },
    
    /** @overrides myt.View */
    sendToBack: function() {
        // Attempt to manipulate dom above root node.
        var de = this.domElement, parentNode = de.parentNode;
        if (de !== parentNode.firstChild) {
            var removedElem = parentNode.removeChild(de);
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

(pkg => {
    const 
        {addEventListener, removeEventListener, global:{roots}} = pkg,
        
        /** Allows a view to act as a "root" for a view hierarchy. A "root" view is backed by a 
            dom element from the page rather than a dom element created by the view.
            
            Attributes:
                keepDomElementWhenDestroyed:boolean Indicates the dom element backing this view 
                    must not be destroyed when this view is destroyed. Defaults to undefined which 
                    is equivalent to false.
            
            @class */
        RootView = pkg.RootView = new JS.Module('RootView', {
            // Class Methods and Attributes ////////////////////////////////////
            extend: {
                /** Prevents default drag/drop behavior.
                    @param {!Obect} view - The myt.View the view to suppress default dragover and 
                        drop on.
                    @returns {undefined} */
                setupCaptureDrop: view => {
                    const ide = view.getIDE(),
                        cdf = view.__captureDrop = event => {event.preventDefault();};
                    addEventListener(ide, 'drop', cdf);
                    addEventListener(ide, 'dragover', cdf);
                },
                
                /** Cleanup dom listeners for drag/drop.
                    @param {!Obect} view - The myt.View the view that had suppressed default 
                        dragover and drop on.
                    @returns {undefined} */
                teardownCaptureDrop: view => {
                    const ide = view.getIDE(), 
                        cdf = view.__captureDrop;
                    removeEventListener(ide, 'drop', cdf);
                    removeEventListener(ide, 'dragover', cdf);
                }
            },
            
            
            // Life Cycle //////////////////////////////////////////////////////
            initNode: function(parent, attrs) {
                this.callSuper(parent, attrs);
                
                // Establish a stacking context
                this.setZIndex(0);
                
                // Set a css class to allow scoping of CSS rules
                this.addDomClass('myt');
                
                roots.addRoot(this);
                
                RootView.setupCaptureDrop(this);
            },
            
            /** @overrides myt.View */
            createOurDomElement: function(parent) {
                // If no parent is provided create a new dom element
                if (!parent) {
                    parent = this.callSuper(parent);
                    pkg.getElement().appendChild(parent);
                }
                
                // A root view has a dom element provided as the parent. We use that as 
                // our dom element.
                return parent;
            },
            
            /** @overrides myt.View */
            destroy: function() {
                RootView.teardownCaptureDrop(this);
                
                roots.removeRoot(this);
                if (!this.keepDomElementWhenDestroyed) this.removeDomElement();
                this.callSuper();
            },
            
            
            // Accessors ///////////////////////////////////////////////////////
            setKeepDomElementWhenDestroyed: function(keepDomElementWhenDestroyed) {
                this.keepDomElementWhenDestroyed = keepDomElementWhenDestroyed;
            },
            
            /** @overrides myt.Node */
            setParent: parent => {/* A root view has no parent view so do nothing. */},
            
            
            // Methods /////////////////////////////////////////////////////////
            /** @overrides myt.View */
            bringToFront: function() {
                // Attempt to manipulate dom above root node.
                const ide = this.getIDE(),
                    parentNode = ide.parentNode;
                if (ide !== parentNode.lastChild) {
                    const removedElem = parentNode.removeChild(ide);
                    if (removedElem) parentNode.appendChild(removedElem);
                }
            },
            
            /** @overrides myt.View */
            sendToBack: function() {
                // Attempt to manipulate dom above root node.
                const ide = this.getIDE(),
                    parentNode = ide.parentNode;
                if (ide !== parentNode.firstChild) {
                    const removedElem = parentNode.removeChild(ide);
                    if (removedElem) parentNode.insertBefore(removedElem, parentNode.firstChild);
                }
            },
            
            /** @overrides myt.View */
            sendBehind: function(otherRootView) {
                // Attempt to manipulate dom above root node.
                const ide = this.getIDE(),
                    otherIde = otherRootView.getIDE(),
                    parentNode = ide.parentNode;
                if (otherIde.parentNode === parentNode) {
                    const removedElem = parentNode.removeChild(ide);
                    if (removedElem) parentNode.insertBefore(removedElem, otherIde);
                }
            },
            
            /** @overrides myt.View */
            sendInFrontOf: function(otherRootView) {
                // Attempt to manipulate dom above root node.
                if (otherRootView.getIDE().parentNode === this.getIDE().parentNode) {
                    this.sendBehind(otherRootView);
                    otherRootView.sendBehind(this);
                }
            }
        });
})(myt);

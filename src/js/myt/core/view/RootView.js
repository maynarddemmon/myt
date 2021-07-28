((pkg) => {
    const roots = pkg.global.roots,
        
        /** Allows a view to act as a "root" for a view hierarchy. A "root" 
            view is backed by a dom element from the page rather than a dom 
            element created by the view.
            
            Attributes:
                keepDomElementWhenDestroyed:boolean Indicates the dom element 
                    backing this view must not be destroyed when this view is 
                    destroyed. Defaults to undefined which is equivalent 
                    to false.
            
            @class */
        RootView = pkg.RootView = new JS.Module('RootView', {
            // Class Methods and Attributes ////////////////////////////////////
            extend: {
                /** Prevents default drag/drop behavior.
                    @param {!Obect} v - The myt.View the view to supress 
                        default dragover and drop on.
                    @returns {undefined} */
                setupCaptureDrop: function(v) {
                    const cdf = v.__captureDrop = event => {event.preventDefault();},
                        ide = v.getInnerDomElement();
                    pkg.addEventListener(ide, 'drop', cdf);
                    pkg.addEventListener(ide, 'dragover', cdf);
                },
                
                /** Cleanup dom listeners for drag/drop.
                    @param {!Obect} v - The myt.View the view that had 
                        supressed default dragover  and drop on.
                    @returns {undefined} */
                teardownCaptureDrop: function(v) {
                    const ide = v.getInnerDomElement(), 
                        cdf = v.__captureDrop;
                    pkg.removeEventListener(ide, 'drop', cdf);
                    pkg.removeEventListener(ide, 'dragover', cdf);
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
                
                // A root view has a dom element provided as the parent. We use
                // that as our dom element.
                return parent;
            },
            
            /** @overrides myt.View */
            destroyAfterOrphaning: function() {
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
            setParent: function(parent) {
                // A root view doesn't have a parent view.
                this.callSuper(undefined);
            },
            
            
            // Methods /////////////////////////////////////////////////////////
            /** @overrides myt.View */
            bringToFront: function() {
                // Attempt to manipulate dom above root node.
                const ide = this.getInnerDomElement(),
                    parentNode = ide.parentNode;
                if (ide !== parentNode.lastChild) {
                    const removedElem = parentNode.removeChild(ide);
                    if (removedElem) parentNode.appendChild(removedElem);
                }
            },
            
            /** @overrides myt.View */
            sendToBack: function() {
                // Attempt to manipulate dom above root node.
                const ide = this.getInnerDomElement(),
                    parentNode = ide.parentNode;
                if (ide !== parentNode.firstChild) {
                    const removedElem = parentNode.removeChild(ide);
                    if (removedElem) parentNode.insertBefore(removedElem, parentNode.firstChild);
                }
            },
            
            /** @overrides myt.View */
            sendBehind: function(otherRootView) {
                // Attempt to manipulate dom above root node.
                const ide = this.getInnerDomElement(),
                    otherIde = otherRootView.getInnerDomElement(),
                    parentNode = ide.parentNode;
                if (otherIde.parentNode === parentNode) {
                    const removedElem = parentNode.removeChild(ide);
                    if (removedElem) parentNode.insertBefore(removedElem, otherIde);
                }
            },
            
            /** @overrides myt.View */
            sendInFrontOf: function(otherRootView) {
                // Attempt to manipulate dom above root node.
                if (otherRootView.getInnerDomElement().parentNode === this.getInnerDomElement().parentNode) {
                    this.sendBehind(otherRootView);
                    otherRootView.sendBehind(this);
                }
            }
        });
})(myt);

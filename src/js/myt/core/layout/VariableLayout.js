/** An extension of ConstantLayout that allows for variation based on the
    index and subview. An updateSubview method is provided that can be
    overriden to provide variable behavior.
    
    Events:
        collapseParent:boolean
        reverse:boolean
    
    Attributes:
        collapseParent:boolean If true the updateParent method will be called.
            The updateParent method will typically resize the parent to fit
            the newly layed out child views. Defaults to false.
        reverse:boolean If true the layout will position the items in the
            opposite order. For example, right to left instead of left to right.
            Defaults to false.
*/
myt.VariableLayout = new JS.Class('VariableLayout', myt.ConstantLayout, {
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides myt.Node */
    initNode: function(parent, attrs) {
        this.collapseParent = this.reverse = false;
        
        this.callSuper(parent, attrs);
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setCollapseParent: function(v) {
        if (this.collapseParent !== v) {
            this.collapseParent = v;
            if (this.inited) {
                this.fireEvent('collapseParent', v);
                this.update();
            }
        }
    },
    
    setReverse: function(v) {
        if (this.reverse !== v) {
            this.reverse = v;
            if (this.inited) {
                this.fireEvent('reverse', v);
                this.update();
            }
        }
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** @overrides myt.ConstantLayout */
    update: function() {
        if (this.canUpdate()) {
            // Prevent inadvertent loops
            this.incrementLockedCounter();
            
            this.doBeforeUpdate();
            
            var setterName = this.setterName, value = this.targetValue,
                svs = this.subviews, len = svs.length, i, sv, count = 0;
            
            if (this.reverse) {
                i = len;
                while(i) {
                    sv = svs[--i];
                    if (this.skipSubview(sv)) continue;
                    value = this.updateSubview(++count, sv, setterName, value);
                }
            } else {
                i = 0;
                while(len > i) {
                    sv = svs[i++];
                    if (this.skipSubview(sv)) continue;
                    value = this.updateSubview(++count, sv, setterName, value);
                }
            }
            
            this.doAfterUpdate();
            
            if (this.collapseParent && !this.parent.isBeingDestroyed) {
                this.updateParent(setterName, value);
            }
            
            this.decrementLockedCounter();
        }
    },
    
    /** Called by update before any processing is done. Gives subviews a
        chance to do any special setup before update is processed.
        @returns void */
    doBeforeUpdate: function() {
        // Subclasses to implement as needed.
    },
    
    /** Called by update after any processing is done but before the optional
        collapsing of parent is done. Gives subviews a chance to do any 
        special teardown after update is processed.
        @returns void */
    doAfterUpdate: function() {
        // Subclasses to implement as needed.
    },
    
    /** @overrides myt.Layout
        Provides a default implementation that calls update when the
        visibility of a subview changes. */
    startMonitoringSubview: function(sv) {
        this.attachTo(sv, 'update', 'visible');
    },
    
    /** @overrides myt.Layout
        Provides a default implementation that calls update when the
        visibility of a subview changes. */
    stopMonitoringSubview: function(sv) {
        this.detachFrom(sv, 'update', 'visible');
    },
    
    /** Called for each subview in the layout.
        @param count:int the number of subviews that have been layed out
            including the current one. i.e. count will be 1 for the first
            subview layed out.
        @param sv:View the subview being layed out.
        @param setterName:string the name of the setter method to call.
        @param value:* the layout value.
        @returns the value to use for the next subview. */
    updateSubview: function(count, sv, setterName, value) {
        sv[setterName](value);
        return value;
    },
    
    /** Called for each subview in the layout to determine if the view should
        be positioned or not. The default implementation returns true if the 
        subview is not visible.
        @param sv:View The subview to test.
        @returns true if the subview should be skipped during layout updates.*/
    skipSubview: function(sv) {
        return !sv.visible;
    },
    
    /** Called if the collapseParent attribute is true. Subclasses should 
        implement this if they want to modify the parent view.
        @param setterName:string the name of the setter method to call on
            the parent.
        @param value:* the value to set on the parent.
        @returns void */
    updateParent: function(setterName, value) {
        // Subclasses to implement as needed.
    }
});

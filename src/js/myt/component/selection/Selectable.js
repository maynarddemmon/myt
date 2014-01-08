/** Makes an object selectable.
    
    Events:
        selected:boolean
    
    Attributes:
        selected:boolean Indicates the object is selected.
*/
myt.Selectable = new JS.Module('Selectable', {
    // Accessors ///////////////////////////////////////////////////////////////
    setSelected: function(v) {
        if (this.selected !== v) {
            this.selected = v;
            if (this.inited && this.fireNewEvent) this.fireNewEvent('selected', v);
        }
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** Checks if this object is selected. */
    isSelected: function() {
        return this.selected ? true : false;
    },
    
    /** Checks if the provided myt.SelectionManager can select this object.
        Returns true by default.
        @returns boolean */
    canSelect: function(selectionManager) {
        return true;
    },
    
    /** Checks if the provided myt.SelectionManager can deselect this object.
        Returns true by default.
        @returns boolean */
    canDeselect: function(selectionManager) {
        return true;
    }
});

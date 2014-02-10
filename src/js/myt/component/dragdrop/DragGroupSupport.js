/** Adds drag group support to drag and drop related classes.
    
    Events:
        None
    
    Attributes:
        None
    
    Private Attributes:
        __dragGroups:object The keys are the set of drag groups this view
            supports. By default the special drag group of '*' which accepts
            all drag groups is defined.
        __acceptAny:boolean The precalculated return value for the
            acceptAnyDragGroup method.
*/
myt.DragGroupSupport = new JS.Module('DragGroupSupport', {
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides */
    initNode: function(parent, attrs) {
        this.__dragGroups = {'*':true};
        this.__acceptAny = true;
        
        this.callSuper(parent, attrs);
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setDragGroups: function(v) {
        var newDragGroups = {};
        for (var dragGroup in v) newDragGroups[dragGroup] = true;
        this.__dragGroups = newDragGroups;
        this.__acceptAny = newDragGroups.hasOwnProperty('*');
    },
    
    getDragGroups: function() {
        return this.__dragGroups;
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** Adds the provided dragGroup to the dragGroups.
        @param dragGroup:string The drag group to add.
        @returns void */
    addDragGroup: function(dragGroup) {
        if (dragGroup) {
            this.__dragGroups[dragGroup] = true;
            if (dragGroup === '*') this.__acceptAny = true;
        }
    },
    
    /** Removes the provided dragGroup from the dragGroups.
        @param dragGroup:string The drag group to remove.
        @returns void */
    removeDragGroup: function(dragGroup) {
        if (dragGroup) {
            delete this.__dragGroups[dragGroup];
            if (dragGroup === '*') this.__acceptAny = false;
        }
    },
    
    /** Determines if this drop target will accept drops from any drag group.
        @returns boolean: True if any drag group will be accepted, false
            otherwise. */
    acceptAnyDragGroup: function() {
        return this.__acceptAny;
    }
});

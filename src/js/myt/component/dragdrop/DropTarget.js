/** Makes an myt.View support having myt.Dropable views dropped on it.
    
    Events:
        None
    
    Attributes:
        dragGroups:object The keys are the set of drag groups this drop target
            supports. By default the special drag group of '*' which accepts
            all drag groups is defined.
*/
myt.DropTarget = new JS.Module('DropTarget', {
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides */
    initNode: function(parent, attrs) {
        this.dragGroups = {'*':true};
        
        this.callSuper(parent, attrs);
        
        myt.global.dragManager.registerDropTarget(this);
    },
    
    /** @overrides */
    destroyAfterOrphaning: function() {
        myt.global.dragManager.unregisterDropTarget(this);
        
        this.callSuper();
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setDragGroups: function(v) {
        var newDragGroups = {};
        for (var dragGroup in v) newDragGroups[dragGroup] = true;
        this.dragGroups = newDragGroups;
    },
    
    getDragGroups: function() {
        return this.dragGroups;
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** Adds the provided dragGroup to the dragGroups.
        @param dragGroup:string The drag group to add.
        @returns void */
    addDragGroup: function(dragGroup) {
        if (dragGroup) this.dragGroups[dragGroup] = true;
    },
    
    /** Removes the provided dragGroup from the dragGroups.
        @param dragGroup:string The drag group to remove.
        @returns void */
    removeDragGroup: function(dragGroup) {
        if (dragGroup) delete this.dragGroups[dragGroup];
    },
    
    /** Determines if this drop target will accept drops from any drag group.
        @returns boolean: True if any drag group will be accepted, false
            otherwise. */
    acceptAnyDragGroup: function() {
        return this.dragGroups.hasOwnProperty('*');
    },
    
    /** Called by myt.GlobalDragManager when a dropable is dragged over this
        target. Gives this drop target a chance to reject a drop regardless
        of drop group. The default implementation returns true.
        @param dropable:myt.Dropable The dropable being dragged.
        @returns boolean: True if the drop will be allowed, false otherwise. */
    willAcceptDrop: function(dropable) {
        return true;
    },
    
    /** Called by myt.GlobalDragManager when a dropable starts being dragged
        that has a matching drag group.
        @param dropable:myt.Dropable The dropable being dragged.
        @returns void */
    notifyDragStart: function(dropable) {},
    
    /** Called by myt.GlobalDragManager when a dropable stops being dragged
        that has a matching drag group.
        @param dropable:myt.Dropable The dropable no longer being dragged.
        @returns void */
    notifyDragStop: function(dropable) {},
    
    /** Called by myt.GlobalDragManager when a dropable is dragged over this
        view and has a matching drag group.
        @param dropable:myt.Dropable The dropable being dragged over this view.
        @returns void */
    notifyDragEnter: function(dropable) {},
    
    /** Called by myt.GlobalDragManager when a dropable is dragged out of this
        view and has a matching drag group.
        @param dropable:myt.Dropable The dropable being dragged out of 
            this view.
        @returns void */
    notifyDragLeave: function(dropable) {},
    
    /** Called by myt.GlobalDragManager when a dropable is dropped onto this
        view and has a matching drag group.
        @param dropable:myt.Dropable The dropable being dropped onto this view.
        @returns void */
    notifyDrop: function(dropable) {}
});

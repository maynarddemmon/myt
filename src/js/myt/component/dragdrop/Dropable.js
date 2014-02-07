/** Makes an myt.View drag and dropable via the mouse.
    
    Events:
        None
    
    Attributes:
        dragGroups:object The keys are the set of drag groups this dropable
            supports. By default a drag group of 'all' is defined.
*/
myt.Dropable = new JS.Module('Dropable', {
    include: [myt.Draggable],
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides myt.View */
    initNode: function(parent, attrs) {
        this.dragGroups = {all:true};
        
        this.callSuper(parent, attrs);
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
    
    /** @overrides myt.Draggable */
    startDrag: function(event) {
        this.callSuper(event);
        myt.global.dragManager.startDrag(this);
    },
    
    /** @overrides myt.Draggable */
    updateDrag: function(event) {
        myt.global.dragManager.updateDrag(event, this);
        this.callSuper(event);
    },
    
    /** @overrides myt.Draggable */
    stopDrag: function(event) {
        myt.global.dragManager.stopDrag(event, this);
        this.callSuper(event);
    },
    
    /** Called by myt.GlobalDragManager when this view is dragged over a drop
        target.
        @param dropTarget:myt.DropTarget The target that was dragged over.
        @returns void */
    notifyDragEnter: function(dropTarget) {},
    
    /** Called by myt.GlobalDragManager when this view is dragged out of a drop
        target.
        @param dropTarget:myt.DropTarget The target that was dragged out of.
        @returns void */
    notifyDragLeave: function(dropTarget) {},
    
    /** Called by myt.GlobalDragManager when this view is dropped on a drop
        target.
        @param dropTarget:myt.DropTarget The target that was dropped on. Will
            be undefined if this dropable was dropped on no drop target.
        @returns void */
    notifyDrop: function(dropTarget) {}
});

/** Makes an myt.View drag and dropable via the mouse.
    
    Events:
        None
    
    Attributes:
        dropped:boolean Indicates this dropable was just dropped.
        dropFailed:boolean Indicates this dropable was just dropped outside
            of a drop target.
        dropTarget:myt.DropTarget The drop target this dropable is currently
            over.
        dragGroups:object The keys are the set of drag groups this dropable
            supports.
*/
myt.Dropable = new JS.Module('Dropable', {
    include: [myt.Draggable],
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides myt.View */
    initNode: function(parent, attrs) {
        this.dragGroups = {};
        
        this.callSuper(parent, attrs);
    },
    
    // Accessors ///////////////////////////////////////////////////////////////
    setDropTarget: function(v) {this.dropTarget = v;},
    setDropped: function(v) {this.dropped = v;},
    setDropFailed: function(v) {this.dropFailed = v;},
    
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
        this.setDropped(false);
        this.setDropFailed(false);
        
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
        
        if (this.dropFailed) this.notifyDropFailed();
    },
    
    /** Called by myt.GlobalDragManager when this view is dragged over a drop
        target.
        @param dropTarget:myt.DropTarget The target that was dragged over.
        @returns void */
    notifyDragEnter: function(dropTarget) {
        this.setDropTarget(dropTarget);
    },
    
    /** Called by myt.GlobalDragManager when this view is dragged out of a drop
        target.
        @param dropTarget:myt.DropTarget The target that was dragged out of.
        @returns void */
    notifyDragLeave: function(dropTarget) {
        this.setDropTarget();
    },
    
    /** Called by myt.GlobalDragManager when this view is dropped on a drop
        target.
        @param dropTarget:myt.DropTarget The target that was dropped on. Will
            be undefined if this dropable was dropped on no drop target.
        @returns void */
    notifyDrop: function(dropTarget) {
        this.setDropped(true);
        
        if (!this.dropTarget) this.setDropFailed(true);
    },
    
    /** Called after dragging stops and the drop failed. The default
        implementation does nothing.
        @returns void */
    notifyDropFailed: function() {}
});

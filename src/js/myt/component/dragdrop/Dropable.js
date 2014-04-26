/** Makes an myt.View drag and dropable via the mouse.
    
    Events:
        None
    
    Attributes:
        dropped:boolean Indicates this dropable was just dropped.
        dropFailed:boolean Indicates this dropable was just dropped outside
            of a drop target.
        dropTarget:myt.DropTarget The drop target this dropable is currently
            over.
*/
myt.Dropable = new JS.Module('Dropable', {
    include: [myt.Draggable, myt.DragGroupSupport],
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setDropTarget: function(v) {this.dropTarget = v;},
    setDropped: function(v) {this.dropped = v;},
    setDropFailed: function(v) {this.dropFailed = v;},
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** Called by myt.GlobalDragManager when a dropable is dragged over a
        target. Gives this dropable a chance to reject a drop regardless
        of drag group. The default implementation returns true.
        @param dropTarget:myt.DropTarget The drop target dragged over.
        @returns boolean: True if the drop will be allowed, false otherwise. */
    willPermitDrop: function(dropTarget) {
        return true;
    },
    
    /** @overrides myt.Draggable */
    startDrag: function(event) {
        this.setDropped(false);
        this.setDropFailed(false);
        
        myt.global.dragManager.startDrag(this);
        this.callSuper(event);
    },
    
    /** @overrides myt.Draggable */
    updateDrag: function(event) {
        myt.global.dragManager.updateDrag(event, this);
        this.callSuper(event);
    },
    
    /** @overrides myt.Draggable */
    stopDrag: function(event, isAbort) {
        myt.global.dragManager.stopDrag(event, this, isAbort);
        this.callSuper(event, isAbort);
        
        if (isAbort) {
            this.notifyDropAborted();
        } else if (this.dropFailed) {
            this.notifyDropFailed();
        }
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
    
    /** Called by myt.GlobalDragManager when this view is dropped.
        @param dropTarget:myt.DropTarget The target that was dropped on. Will
            be undefined if this dropable was dropped on no drop target.
        @param isAbort:boolean Indicates if the drop was the result of an
            abort or a normal drop.
        @returns void */
    notifyDrop: function(dropTarget, isAbort) {
        this.setDropped(true);
        
        if (!this.dropTarget) this.setDropFailed(true);
    },
    
    /** Called after dragging stops and the drop failed. The default
        implementation does nothing.
        @returns void */
    notifyDropFailed: function() {},
    
    /** Called after dragging stops and the drop was aborted. The default
        implementation does nothing.
        @returns void */
    notifyDropAborted: function() {}
});

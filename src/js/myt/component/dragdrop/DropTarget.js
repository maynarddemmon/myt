/** Makes an myt.View support having myt.Dropable views dropped on it.
    
    Events:
        None
    
    Attributes:
        None
*/
myt.DropTarget = new JS.Module('DropTarget', {
    include: [myt.DragGroupSupport],
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides */
    initNode: function(parent, attrs) {
        this.callSuper(parent, attrs);
        
        myt.global.dragManager.registerDropTarget(this);
    },
    
    /** @overrides */
    destroyAfterOrphaning: function() {
        myt.global.dragManager.unregisterDropTarget(this);
        
        this.callSuper();
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** Called by myt.GlobalDragManager when a dropable is dragged over this
        target. Gives this drop target a chance to reject a drop regardless
        of drag group. The default implementation returns true if the view
        is not disabled.
        @param dropable:myt.Dropable The dropable being dragged.
        @returns boolean: True if the drop will be allowed, false otherwise. */
    willAcceptDrop: function(dropable) {
        // Handle the common case of a disabled component.
        if (this.disabled) return false;
        
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

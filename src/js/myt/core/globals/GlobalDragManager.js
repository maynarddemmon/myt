/** Provides global drag and drop functionality.
    
    Events:
        dragLeave:myt.DropTarget Fired when a myt.Dropable is dragged out of
            the drop target.
        dragEnter:myt.DropTarget Fired when a myt.Dropable is dragged over
            the drop target.
        startDrag:object Fired when a drag starts. Value is the object
            being dragged.
        stopDrag:object Fired when a drag ends. Value is the object 
            that is no longer being dragged.
        drop:object Fired when a drag ends over a drop target. The value is
            an array containing the dropable at index 0 and the drop target
            at index 1.
    
    Attributes:
        dragView:myt.View The view currently being dragged.
        overView:myt.View The view currently being dragged over.
        dropTargets:array The list of myt.DropTargets currently registered
            for notification when drag and drop events occur.
        autoScrollers:array The list of myt.AutoScrollers currently registered
            for notification when drags start and stop.
*/
new JS.Singleton('GlobalDragManager', {
    include: [myt.Observable],
    
    
    // Constructor /////////////////////////////////////////////////////////////
    initialize: function() {
        this.dropTargets = [];
        this.autoScrollers = [];
        
        myt.global.register('dragManager', this);
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setDragView: function(v) {
        var cur = this.dragView;
        if (cur !== v) {
            this.dragView = v;
            
            var isStart = !!v, targets, i, dv, funcName, eventName;
            
            if (isStart) {
                dv = v;
                funcName = 'notifyDragStart';
                eventName = 'startDrag';
            } else {
                dv = cur;
                funcName = 'notifyDragStop';
                eventName = 'stopDrag';
            }
            
            targets = this.__filterList(dv, this.dropTargets);
            i = targets.length;
            while (i) targets[--i][funcName](dv);
            
            targets = this.__filterList(dv, this.autoScrollers);
            i = targets.length;
            while (i) targets[--i][funcName](dv);
            
            this.fireEvent(eventName, v);
        }
    },
    
    setOverView: function(v) {
        var cur = this.overView;
        if (cur !== v) {
            var dv = this.dragView;
            if (cur) {
                cur.notifyDragLeave(dv);
                if (!dv.destroyed) dv.notifyDragLeave(cur);
                this.fireEvent('dragLeave', cur);
            }
            
            this.overView = v;
            
            if (v) {
                v.notifyDragEnter(dv);
                if (!dv.destroyed) dv.notifyDragEnter(v);
                this.fireEvent('dragEnter', cur);
            }
        }
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** Registers the provided auto scroller to receive notifications.
        @param autoScroller:myt.AutoScroller The auto scroller to register.
        @returns void */
    registerAutoScroller: function(autoScroller) {
        this.autoScrollers.push(autoScroller);
    },
    
    /** Unregisters the provided auto scroller.
        @param autoScroller:myt.AutoScroller The auto scroller to unregister.
        @returns void */
    unregisterAutoScroller: function(autoScroller) {
        var autoScrollers = this.autoScrollers, i = autoScrollers.length;
        while (i) {
            if (autoScrollers[--i] === autoScroller) {
                autoScrollers.splice(i, 1);
                break;
            }
        }
    },
    
    /** Registers the provided drop target to receive notifications.
        @param dropTarget:myt.DropTarget The drop target to register.
        @returns void */
    registerDropTarget: function(dropTarget) {
        this.dropTargets.push(dropTarget);
    },
    
    /** Unregisters the provided drop target.
        @param dropTarget:myt.DropTarget The drop target to unregister.
        @returns void */
    unregisterDropTarget: function(dropTarget) {
        var dropTargets = this.dropTargets, i = dropTargets.length;
        while (i) {
            if (dropTargets[--i] === dropTarget) {
                dropTargets.splice(i, 1);
                break;
            }
        }
    },
    
    /** Called by a myt.Dropable when a drag starts.
        @param dropable:myt.Dropable The dropable that started the drag.
        @returns void */
    startDrag: function(dropable) {
        this.setDragView(dropable);
    },
    
    /** Called by a myt.Dropable when a drag stops.
        @param event:event The mouse event that triggered the stop drag.
        @param dropable:myt.Dropable The dropable that stopped being dragged.
        @returns void */
    stopDrag: function(event, dropable, isAbort) {
        var overView = this.overView;
        dropable.notifyDropped(overView, isAbort);
        if (overView && !isAbort) overView.notifyDrop(dropable);
        
        this.setOverView();
        this.setDragView();
        
        if (overView && !isAbort) this.fireEvent('drop', [dropable, overView]);
    },
    
    /** Called by a myt.Dropable during dragging.
        @param event:event The mousemove event for the drag update.
        @param dropable:myt.Dropable The dropable that is being dragged.
        @returns void */
    updateDrag: function(event, dropable) {
        // Get the frontmost myt.DropTarget that is registered with this 
        // manager and is under the current mouse location and has a 
        // matching drag group.
        var topDropTarget,
            dropTargets = this.__filterList(dropable, this.dropTargets);
            i = dropTargets.length;
        
        if (i > 0) {
            var domMouseEvent = event.value,
                mouseX = domMouseEvent.pageX,
                mouseY = domMouseEvent.pageY,
                dropTarget;
            
            while (i) {
                dropTarget = dropTargets[--i];
                if (dropTarget.willAcceptDrop(dropable) &&
                    dropable.willPermitDrop(dropTarget) &&
                    dropTarget.isPointVisible(mouseX, mouseY) && 
                    (!topDropTarget || dropTarget.isInFrontOf(topDropTarget))
                ) {
                    topDropTarget = dropTarget;
                }
            }
        }
        
        this.setOverView(topDropTarget);
    },
    
    /** Filters the provided array of myt.DragGroupSupport items for the
        provided dropable.
        @private
        @param dropable:myt.Dropable The dropable to filter for.
        @returns array: An array of the matching list items. */
    __filterList: function(dropable, list) {
        var retval;
        
        if (dropable.destroyed) {
            retval = [];
        } else {
            if (dropable.acceptAnyDragGroup()) {
                retval = list;
            } else {
                retval = [];
                
                var dragGroups = dropable.getDragGroups(),
                    i = list.length, 
                    item, targetGroups, dragGroup;
                while (i) {
                    item = list[--i];
                    if (item.acceptAnyDragGroup()) {
                        retval.push(item);
                    } else {
                        targetGroups = item.getDragGroups();
                        for (dragGroup in dragGroups) {
                            if (targetGroups[dragGroup]) {
                                retval.push(item);
                                break;
                            }
                        }
                    }
                }
            }
        }
        
        return retval;
    }
});

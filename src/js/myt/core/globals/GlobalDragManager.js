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
            
            var isStart = !!v, targets, i, dt, funcName, eventName;
            
            if (isStart) {
                dt = v;
                funcName = 'notifyDragStart';
                eventName = 'startDrag';
            } else {
                dt = cur;
                funcName = 'notifyDragStop';
                eventName = 'stopDrag';
            }
            
            targets = this.getDropTargetsForDragGroups(dt.getDragGroups());
            i = targets.length;
            while (i) targets[--i][funcName](dt);
            
            targets = this.getAutoScrollersForDragGroups(dt.getDragGroups());
            i = targets.length;
            while (i) targets[--i][funcName](dt);
            
            this.fireNewEvent(eventName, v);
        }
    },
    
    setOverView: function(v) {
        var cur = this.overView;
        if (cur !== v) {
            var dv = this.dragView;
            if (cur) {
                cur.notifyDragLeave(dv);
                dv.notifyDragLeave(cur);
                this.fireNewEvent('dragLeave', cur);
            }
            
            this.overView = v;
            
            if (v) {
                v.notifyDragEnter(dv);
                dv.notifyDragEnter(v);
                this.fireNewEvent('dragEnter', cur);
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
    
    /** Gets an array of myt.AutoScrollers that have any of the provided
        drag groups.
        @param dragGroups:object The set of dragGroups to match against.
        @returns array: An array of the matching auto scrollers. */
    getAutoScrollersForDragGroups: function(dragGroups) {
        retval = [];
        var autoScrollers = this.autoScrollers, i = autoScrollers.length, 
            autoScroller, targetGroups, dragGroup;
        while (i) {
            autoScroller = autoScrollers[--i];
            if (autoScroller.acceptAnyDragGroup()) {
                retval.push(autoScroller);
            } else {
                targetGroups = autoScroller.getDragGroups();
                for (dragGroup in dragGroups) {
                    if (targetGroups[dragGroup]) {
                        retval.push(autoScroller);
                        break;
                    }
                }
            }
        }
        return retval;
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
    
    /** Gets an array of myt.DropTargets that have any of the provided
        drag groups.
        @param dragGroups:object The set of dragGroups to match against.
        @returns array: An array of the matching drop targets. */
    getDropTargetsForDragGroups: function(dragGroups) {
        retval = [];
        var dropTargets = this.dropTargets, i = dropTargets.length, 
            dropTarget, targetGroups, dragGroup;
        while (i) {
            dropTarget = dropTargets[--i];
            if (dropTarget.acceptAnyDragGroup()) {
                retval.push(dropTarget);
            } else {
                targetGroups = dropTarget.getDragGroups();
                for (dragGroup in dragGroups) {
                    if (targetGroups[dragGroup]) {
                        retval.push(dropTarget);
                        break;
                    }
                }
            }
        }
        return retval;
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
    stopDrag: function(event, dropable) {
        var overView = this.overView;
        dropable.notifyDrop(overView);
        if (overView) overView.notifyDrop(dropable);
        
        this.setOverView();
        this.setDragView();
        
        if (overView) this.fireNewEvent('drop', [dropable, overView]);
    },
    
    /** Called by a myt.Dropable during dragging.
        @param event:event The mousemove event for the drag update.
        @param dropable:myt.Dropable The dropable that is being dragged.
        @returns void */
    updateDrag: function(event, dropable) {
        this.setOverView(this.getViewUnderMouse(event, dropable));
    },
    
    /** Gets the frontmost myt.DropTarget that is registered with this manager 
        and is under the current mouse location and has a matching drag group.
        @param event:event the mouse event to search with.
        @param dropable:myt.Dropable The dropable that is being dragged.
        @returns myt.DropTarget: The drop target or undefined if none found. */
    getViewUnderMouse: function(event, dropable) {
        var topDropTarget,
            dropTargets = this.getDropTargetsForDragGroups(dropable.getDragGroups()),
            i = dropTargets.length;
        
        if (i > 0) {
            var domMouseEvent = event.value,
                mouseX = domMouseEvent.pageX,
                mouseY = domMouseEvent.pageY,
                dropTarget;
            
            while (i) {
                dropTarget = dropTargets[--i];
                if (dropTarget.containsPoint(mouseX, mouseY) && 
                    dropTarget.willAcceptDrop(dropable) &&
                    (!topDropTarget || dropTarget.isInFrontOf(topDropTarget))
                ) {
                    topDropTarget = dropTarget;
                }
            }
        }
        
        return topDropTarget;
    }
});

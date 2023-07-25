(pkg => {
    let fireGlobalDragManagerEvent,
        
        /*  The view currently being dragged. */
        dragView,
        
        /*  The view currently being dragged over. */
        overView;
        
    const
        /*  The list of myt.AutoScrollers currently registered for notification when drags start 
            and stop. */
        autoScrollers = [],
        
        /*  The list of myt.DropTargets currently registered for notification when drag and drop 
            events occur. */
        dropTargets = [],
        
        setOverView = v => {
            const existingOverView = overView;
            if (existingOverView !== v) {
                if (existingOverView) {
                    existingOverView.notifyDragLeave(dragView);
                    if (!dragView.destroyed) dragView.notifyDragLeaving(existingOverView);
                    fireGlobalDragManagerEvent('dragLeave', existingOverView);
                }
                
                overView = v;
                
                if (v) {
                    v.notifyDragEnter(dragView);
                    if (!dragView.destroyed) dragView.notifyDragEntering(v);
                    fireGlobalDragManagerEvent('dragEnter', existingOverView);
                }
            }
        },
        
        setDragView = v => {
            let existingDragView = dragView;
            if (existingDragView !== v) {
                dragView = v;
                
                if (v) {
                    existingDragView = v;
                    
                    for (const target of filterList(existingDragView, dropTargets)) {
                        target.notifyDragStart(existingDragView);
                    }
                    for (const target of filterList(existingDragView, autoScrollers)) {
                        target.notifyAutoScrollerDragStart(existingDragView);
                    }
                    fireGlobalDragManagerEvent('startDrag', v);
                } else {
                    for (const target of filterList(existingDragView, dropTargets)) {
                        target.notifyDragStop(existingDragView);
                    }
                    for (const target of filterList(existingDragView, autoScrollers)) {
                        target.notifyAutoScrollerDragStop(existingDragView);
                    }
                    fireGlobalDragManagerEvent('stopDrag', v);
                }
            }
        },
        
        /*  Filters the provided array of myt.DragGroupSupport items for the provided myt.Dropable. 
            Returns an array of the matching list items.
            @param {!Object} dropable
            @param {!Array} list
            @returns {!Array} */
        filterList = (dropable, list) => {
            if (dropable.destroyed) {
                return [];
            } else if (dropable.isAnyDragGroup()) {
                // Dropable can be anything in the list will accept it.
                return list;
            } else {
                const retval = [],
                    dragGroups = dropable.getDragGroups();
                let i = list.length;
                while (i) {
                    const item = list[--i];
                    if (item.isAnyDropGroup()) {
                        // List item will is any drop group so all Dropables are valid.
                        retval.push(item);
                    } else {
                        const targetGroups = item.getDropGroups();
                        for (const dragGroup in dragGroups) {
                            if (targetGroups[dragGroup]) {
                                retval.push(item);
                                break;
                            }
                        }
                    }
                }
                return retval;
            }
        };
    
    /** Provides global drag and drop functionality.
        
        Events:
            dragLeave:myt.DropTarget Fired when a myt.Dropable is dragged out of the drop target.
            dragEnter:myt.DropTarget Fired when a myt.Dropable is dragged over the drop target.
            startDrag:object Fired when a drag starts. Value is the object being dragged.
            stopDrag:object Fired when a drag ends. Value is the object that is no longer 
                being dragged.
            drop:object Fired when a drag ends over a drop target. The value is an array containing 
                the dropable at index 0 and the drop target at index 1.
        
        @class */
    new JS.Singleton('GlobalDragManager', {
        include: [pkg.Observable],
        
        
        // Constructor /////////////////////////////////////////////////////////
        initialize: function() {
            pkg.global.register('dragManager', this);
            fireGlobalDragManagerEvent = this.fireEvent.bind(this);
        },
        
        
        // Accessors ///////////////////////////////////////////////////////////
        getDragView: () => dragView,
        
        
        // Methods /////////////////////////////////////////////////////////////
        /** Registers the provided auto scroller to receive notifications.
            @param {!Object} autoScroller - The myt.AutoScroller to register.
            @returns {undefined} */
        registerAutoScroller: autoScroller => {
            autoScrollers.push(autoScroller);
        },
        
        /** Unregisters the provided auto scroller.
            @param {!Object} autoScroller - The myt.AutoScroller to unregister.
            @returns {undefined} */
        unregisterAutoScroller: autoScroller => {
            const idx = autoScrollers.indexOf(autoScroller);
            if (idx > -1) autoScrollers.splice(idx, 1);
        },
        
        /** Registers the provided drop target to receive notifications.
            @param {!Object} dropTarget - The myt.DropTarget to register.
            @returns {undefined} */
        registerDropTarget: dropTarget => {
            dropTargets.push(dropTarget);
        },
        
        /** Unregisters the provided drop target.
            @param {!Object} dropTarget - The myt.DropTarget to unregister.
            @returns {undefined} */
        unregisterDropTarget: dropTarget => {
            const idx = dropTargets.indexOf(dropTarget);
            if (idx > -1) dropTargets.splice(idx, 1);
        },
        
        /** Called by a myt.Dropable when a drag starts.
            @param {!Object} dropable - The myt.Dropable that started the drag.
            @returns {undefined} */
        startDrag: dropable => {
            setDragView(dropable);
        },
        
        /** Called by a myt.Dropable when a drag stops.
            @param {!Object} event -The mouse event that triggered the stop drag.
            @param {!Object} dropable - The myt.Dropable that stopped being dragged.
            @param {boolean} isAbort
            @returns {undefined} */
        stopDrag: (event, dropable, isAbort) => {
            dropable.notifyDropped(overView, isAbort);
            if (!isAbort) overView?.notifyDrop(dropable);
            
            setOverView();
            setDragView();
            
            if (overView && !isAbort) fireGlobalDragManagerEvent('drop', [dropable, overView]);
        },
        
        /** Called by a myt.Dropable during dragging.
            @param {!Object} event - The mousemove event for the drag update.
            @param {!Object} dropable - The myt.Dropable that is being dragged.
            @returns {undefined} */
        updateDrag: (event, dropable) => {
            // Get the frontmost myt.DropTarget that is registered with this manager and is under 
            // the current mouse location and has a matching drag group.
            const filteredDropTargets = filterList(dropable, dropTargets);
            let i = filteredDropTargets.length,
                topDropTarget;
            
            if (i > 0) {
                const {pageX:mouseX, pageY:mouseY} = event.value;
                while (i) {
                    const dropTarget = filteredDropTargets[--i];
                    if (dropTarget.willAcceptDrop(dropable) &&
                        dropable.willPermitDrop(dropTarget) &&
                        dropTarget.isPointVisible(mouseX, mouseY) && 
                        (!topDropTarget || dropTarget.isInFrontOf(topDropTarget))
                    ) {
                        topDropTarget = dropTarget;
                    }
                }
            }
            
            setOverView(topDropTarget);
        }
    });
})(myt);

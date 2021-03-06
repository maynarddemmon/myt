((pkg) => {
    let globalDragManager,
        
        /* The view currently being dragged. */
        dragView,
        
        /* The view currently being dragged over. */
        overView;
        
    const
        /* The list of myt.AutoScrollers currently registered for notification
            when drags start and stop. */
        autoScrollers = [],
        
        /* The list of myt.DropTargets currently registered for notification 
            when drag and drop events occur. */
        dropTargets = [],
        
        setOverView = (v) => {
            const existingOverView = overView;
            if (existingOverView !== v) {
                if (existingOverView) {
                    existingOverView.notifyDragLeave(dragView);
                    if (!dragView.destroyed) dragView.notifyDragLeave(existingOverView);
                    globalDragManager.fireEvent('dragLeave', existingOverView);
                }
                
                overView = v;
                
                if (v) {
                    v.notifyDragEnter(dragView);
                    if (!dragView.destroyed) dragView.notifyDragEnter(v);
                    globalDragManager.fireEvent('dragEnter', existingOverView);
                }
            }
        },
        
        setDragView = (v) => {
            let existingDragView = dragView,
                funcName, 
                eventName,
                targets,
                i;
            if (existingDragView !== v) {
                dragView = v;
                
                if (!!v) {
                    existingDragView = v;
                    funcName = 'notifyDragStart';
                    eventName = 'startDrag';
                } else {
                    funcName = 'notifyDragStop';
                    eventName = 'stopDrag';
                }
                
                targets = filterList(existingDragView, dropTargets);
                i = targets.length;
                while (i) targets[--i][funcName](existingDragView);
                
                targets = filterList(existingDragView, autoScrollers);
                i = targets.length;
                while (i) targets[--i][funcName](existingDragView);
                
                globalDragManager.fireEvent(eventName, v);
            }
        },
        
        /*  Filters the provided array of myt.DragGroupSupport items for the
            provided myt.Dropable. Returns an array of the matching list
            items.
            @param {!Object} dropable
            @param {!Array} list
            @returns {!Array} */
        filterList = (dropable, list) => {
            let retval;
            
            if (dropable.destroyed) {
                retval = [];
            } else {
                if (dropable.acceptAnyDragGroup()) {
                    retval = list;
                } else {
                    retval = [];
                    
                    const dragGroups = dropable.getDragGroups();
                    let i = list.length, 
                        item, 
                        targetGroups, 
                        dragGroup;
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
        };
    
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
        
        @class
    */
    new JS.Singleton('GlobalDragManager', {
        include: [pkg.Observable],
        
        
        // Constructor /////////////////////////////////////////////////////////
        initialize: function() {
            pkg.global.register('dragManager', globalDragManager = this);
        },
        
        
        // Accessors ///////////////////////////////////////////////////////////
        getDragView: () => dragView,
        
        
        // Methods /////////////////////////////////////////////////////////////
        /** Registers the provided auto scroller to receive notifications.
            @param {!Object} autoScroller - The myt.AutoScroller to register.
            @returns {undefined} */
        registerAutoScroller: (autoScroller) => {
            autoScrollers.push(autoScroller);
        },
        
        /** Unregisters the provided auto scroller.
            @param {!Object} autoScroller - The myt.AutoScroller to unregister.
            @returns {undefined} */
        unregisterAutoScroller: (autoScroller) => {
            let i = autoScrollers.length;
            while (i) {
                if (autoScrollers[--i] === autoScroller) {
                    autoScrollers.splice(i, 1);
                    break;
                }
            }
        },
        
        /** Registers the provided drop target to receive notifications.
            @param {!Object} dropTarget - The myt.DropTarget to register.
            @returns {undefined} */
        registerDropTarget: (dropTarget) => {
            dropTargets.push(dropTarget);
        },
        
        /** Unregisters the provided drop target.
            @param {!Object} dropTarget - The myt.DropTarget to unregister.
            @returns {undefined} */
        unregisterDropTarget: (dropTarget) => {
            let i = dropTargets.length;
            while (i) {
                if (dropTargets[--i] === dropTarget) {
                    dropTargets.splice(i, 1);
                    break;
                }
            }
        },
        
        /** Called by a myt.Dropable when a drag starts.
            @param {!Object} dropable - The myt.Dropable that started the drag.
            @returns {undefined} */
        startDrag: (dropable) => {
            setDragView(dropable);
        },
        
        /** Called by a myt.Dropable when a drag stops.
            @param {!Object} event -The mouse event that triggered the stop drag.
            @param {!Object} dropable - The myt.Dropable that stopped being dragged.
            @param {boolean} isAbort
            @returns {undefined} */
        stopDrag: (event, dropable, isAbort) => {
            dropable.notifyDropped(overView, isAbort);
            if (overView && !isAbort) overView.notifyDrop(dropable);
            
            setOverView();
            setDragView();
            
            if (overView && !isAbort) globalDragManager.fireEvent('drop', [dropable, overView]);
        },
        
        /** Called by a myt.Dropable during dragging.
            @param {!Object} event - The mousemove event for the drag update.
            @param {!Object} dropable - The myt.Dropable that is being dragged.
            @returns {undefined} */
        updateDrag: (event, dropable) => {
            // Get the frontmost myt.DropTarget that is registered with this 
            // manager and is under the current mouse location and has a 
            // matching drag group.
            const filteredDropTargets = filterList(dropable, dropTargets);
            let i = filteredDropTargets.length,
                topDropTarget;
            
            if (i > 0) {
                const domMouseEvent = event.value,
                    mouseX = domMouseEvent.pageX,
                    mouseY = domMouseEvent.pageY;
                
                while (i) {
                    let dropTarget = filteredDropTargets[--i];
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

((pkg) => {
    let 
        /*  The global lock counter. Any value greater than zero sets the 
            global lock. */
        globalLockCount = 0,
        
        /* The global layout locked status. */
        globalLock = false;
    
    const JSClass = JS.Class,
        
        /* A list of layouts to be updated once the global lock is released. */
        deferredLayouts = [],
        
        /*  Called to set/unset the global lock. Updates all the currently 
            deferred layouts. */
        setGlobalLock = (v) => {
            if (globalLock !== v) {
                globalLock = v;
                
                if (!v) {
                    let i = deferredLayouts.length, 
                        layout;
                    while (i) {
                        layout = deferredLayouts[--i];
                        layout.__deferredLayout = false;
                        layout.update();
                    }
                    deferredLayouts.length = 0;
                }
            }
        },
        
        /*  Adds a Layout to the list of layouts that will get updated when the
            global lock is released.
                param layout:myt.Layout the layout to defer an update for.
        */
        deferLayoutUpdate = (layout) => {
            // Don't add a layout that is already deferred.
            if (!layout.__deferredLayout) {
                deferredLayouts.push(layout);
                layout.__deferredLayout = true;
            }
        },
        
        /* Implements moveSubviewBefore and moveSubviewAfter for Layout. */
        moveSubview = (layout, sv, target, after) => {
            const curIdx = layout.getSubviewIndex(sv),
                svs = layout.subviews;
            if (curIdx >= 0) {
                let targetIdx = layout.getSubviewIndex(target);
                
                // Remove from current index
                svs.splice(curIdx, 1);
                
                if (targetIdx >= 0) {
                    // Move before or after the target
                    if (curIdx < targetIdx) --targetIdx;
                    svs.splice(targetIdx + (after ? 1 : 0), 0, sv);
                } else if (after) {
                    // Make last since target was not found
                    svs.push(sv);
                } else {
                    // Make first since target was not found
                    svs.unshift(sv);
                }
            }
        },
        
        /** A layout controls the positioning of views within a parent view.
            
            Events:
                None
            
            Attributes:
                locked:boolean When true, the layout will not update.
                lockedCounter:number Counter created by myt.ThresholdCounter.
            
            Private Attributes:
                subviews:array An array of Views managed by this layout.
                __deferredLayout:boolean Marks a layout as deferred if the global
                    layout lock is true during a call to 'canUpdate' on the layout.
            
            @class */
        Layout = pkg.Layout = new JSClass('Layout', pkg.Node, {
            // Class Methods and Attributes ////////////////////////////////////
            extend: {
                /** Increments the global lock that prevents all layouts 
                    from updating.
                    @returns {undefined} */
                incrementGlobalLock: () => {
                    if (++globalLockCount === 1) setGlobalLock(true);
                },
                
                /** Decrements the global lock that prevents all layouts 
                    from updating.
                    @returns {undefined} */
                decrementGlobalLock: () => {
                    if (globalLockCount > 0 && --globalLockCount === 0) setGlobalLock(false);
                }
            },
            
            
            // Life Cycle //////////////////////////////////////////////////////
            /** @overrides */
            initNode: function(parent, attrs) {
                this.subviews = [];
                
                // Start the layout in the locked state.
                this.locked = true;
                this.lockedCounter = 1;
                
                // Remember how initial locking state should be set
                const initiallyLocked = attrs.locked === true;
                delete attrs.locked;
                
                this.callSuper(parent, attrs);
                
                // Unlock if initial locking state calls for it.
                if (!initiallyLocked) this.decrementLockedCounter();
                
                this.update();
            },
            
            /** @overrides */
            destroyAfterOrphaning: function() {
                this.callSuper();
                this.subviews.length = 0;
            },
            
            
            // Accessors ///////////////////////////////////////////////////////
            /** @overrides */
            setParent: function(parent) {
                if (this.parent !== parent) {
                    // Lock during parent change so that old parent is not updated by
                    // the calls to removeSubview and addSubview.
                    const wasNotLocked = !this.locked;
                    if (wasNotLocked) this.locked = true;
                    
                    // Stop monitoring parent
                    let svs, i, len;
                    if (this.parent) {
                        svs = this.subviews;
                        i = svs.length;
                        while (i) this.removeSubview(svs[--i]);
                        
                        this.detachFrom(this.parent, '__handleParentSubviewAddedEvent', 'subviewAdded');
                        this.detachFrom(this.parent, '__handleParentSubviewRemovedEvent', 'subviewRemoved');
                    }
                    
                    this.callSuper(parent);
                    
                    // Start monitoring new parent
                    if (this.parent) {
                        svs = this.parent.getSubviews();
                        for (i = 0, len = svs.length; len > i; ++i) this.addSubview(svs[i]);
                        
                        this.attachTo(this.parent, '__handleParentSubviewAddedEvent', 'subviewAdded');
                        this.attachTo(this.parent, '__handleParentSubviewRemovedEvent', 'subviewRemoved');
                    }
                    
                    // Clear temporary lock and update if this happened after initialization.
                    if (wasNotLocked) {
                        this.locked = false;
                        if (this.inited && this.parent) this.update();
                    }
                }
            },
            
            
            // Methods /////////////////////////////////////////////////////////
            /** Checks if the layout is locked or not. Should be called by the
                "update" method of each layout to check if it is OK to do the update.
                If myt.Layout.locked is true (the global layout lock) then a deferred
                layout update will be setup for this Layout. Once the global lock is
                unlocked this Layout's 'update' method will be invoked.
                @returns {boolean} true if not locked, false otherwise. */
            canUpdate: function() {
                if (globalLock) {
                    deferLayoutUpdate(this);
                    return false;
                }
                return !this.locked;
            },
            
            /** Updates the layout. Subclasses should call canUpdate to check lock 
                state before trying to do anything.
                @returns {undefined} */
            update: () => {},
            
            // Subview Methods //
            /** Checks if this Layout has the provided View in the subviews array.
                @param {?Object} sv - The myt.View to check for.
                @returns true if the subview is found, false otherwise. */
            hasSubview: function(sv) {
                return this.getSubviewIndex(sv) !== -1;
            },
            
            /** Gets the index of the provided View in the subviews array.
                @param {?Object} sv - The myt.View to check for.
                @returns {number} - The index of the subview or -1 if not found. */
            getSubviewIndex: function(sv) {
                return this.subviews.indexOf(sv);
            },
            
            /** Adds the provided View to the subviews array of this Layout.
                @param {?Object} sv - The myt.View to add to this layout.
                @returns {undefined} */
            addSubview: function(sv) {
                if (!this.ignore(sv)) {
                    this.subviews.push(sv);
                    this.startMonitoringSubview(sv);
                    if (!this.locked) this.update();
                }
            },
            
            /** Subclasses should implement this method to start listening to
                events from the subview that should trigger the update method.
                @param {?Object} sv - The myt.View to start monitoring for changes.
                @returns {undefined} */
            startMonitoringSubview: (sv) => {},
            
            /** Calls startMonitoringSubview for all views. Used by Layout 
                implementations when a change occurs to the layout that requires
                refreshing all the subview monitoring.
                @returns {undefined} */
            startMonitoringAllSubviews: function() {
                const svs = this.subviews;
                let i = svs.length;
                while (i) this.startMonitoringSubview(svs[--i]);
            },
            
            /** Removes the provided View from the subviews array of this Layout.
                @param {?Object} sv - The myt.View to remove from this layout.
                @returns the index of the removed subview or -1 if not removed. */
            removeSubview: function(sv) {
                if (this.ignore(sv)) return -1;
                
                const idx = this.getSubviewIndex(sv);
                if (idx !== -1) {
                    this.stopMonitoringSubview(sv);
                    this.subviews.splice(idx, 1);
                    if (!this.locked) this.update();
                }
                return idx;
            },
            
            /** Subclasses should implement this method to stop listening to
                events from the subview that would trigger the update method. This
                should remove all listeners that were setup in startMonitoringSubview.
                @param {?Object} sv - The myt.View to stop monitoring for changes.
                @returns {undefined} */
            stopMonitoringSubview: (sv) => {},
            
            /** Calls stopMonitoringSubview for all views. Used by Layout 
                implementations when a change occurs to the layout that requires
                refreshing all the subview monitoring.
                @returns {undefined} */
            stopMonitoringAllSubviews: function() {
                const svs = this.subviews;
                let i = svs.length;
                while (i) this.stopMonitoringSubview(svs[--i]);
            },
            
            /** Checks if a subview can be added to this Layout or not. The default 
                implementation returns the 'ignoreLayout' attributes of the subview.
                @param {?Object} sv - The myt.View to check.
                @returns {boolean} true means the subview will be skipped, false
                    otherwise. */
            ignore: (sv) => sv.ignoreLayout,
            
            /** If our parent adds a new subview we should add it.
                @private
                @param {!Object} event
                @returns {undefined} */
            __handleParentSubviewAddedEvent: function(event) {
                if (event.value.parent === this.parent) this.addSubview(event.value);
            },
            
            /** If our parent removes a subview we should remove it.
                @private
                @param {!Object} event
                @returns {undefined} */
            __handleParentSubviewRemovedEvent: function(event) {
                if (event.value.parent === this.parent) this.removeSubview(event.value);
            },
            
            // Subview ordering //
            /** Sorts the subviews array according to the provided sort function.
                @param {?Function} sortFunc - The sort function to sort the subviews with.
                @returns {undefined} */
            sortSubviews: function(sortFunc) {
                this.subviews.sort(sortFunc);
            },
            
            /** Moves the subview before the target subview in the order the subviews
                are layed out. If no target subview is provided, or it isn't in the
                layout the subview will be moved to the front of the list.
                @param {?Object} sv
                @param {?Object} target
                @returns {undefined} */
            moveSubviewBefore: function(sv, target) {
                moveSubview(this, sv, target, false);
            },
            
            /** Moves the subview after the target subview in the order the subviews
                are layed out. If no target subview is provided, or it isn't in the
                layout the subview will be moved to the back of the list.
                @param {?Object} sv
                @param {?Object} target
                @returns {undefined} */
            moveSubviewAfter: function(sv, target) {
                moveSubview(this, sv, target, true);
            }
        });
    
    /* Create locked counter functions for the myt.Layout class. */
    pkg.createFixedThresholdCounter(Layout, 1, 'locked');
    
    /** A layout that sets the target attribute name to the target value for 
        each subview.
        
        Events:
            targetAttrName:string
            targetValue:*
        
        Attributes:
            targetAttrName:string the name of the attribute to set on each subview.
            targetValue:* the value to set the attribute to.
            setterName:string the name of the setter method to call on the subview
                for the targetAttrName. This value is updated when
                setTargetAttrName is called.
        
        @class */
    pkg.ConstantLayout = new JSClass('ConstantLayout', Layout, {
        // Accessors ///////////////////////////////////////////////////////////
        setTargetAttrName: function(v) {
            if (this.targetAttrName !== v) {
                this.targetAttrName = v;
                this.setterName = pkg.AccessorSupport.generateSetterName(v);
                if (this.inited) {
                    this.fireEvent('targetAttrName', v);
                    this.update();
                }
            }
        },
        
        setTargetValue: function(v) {
            if (this.targetValue !== v) {
                this.targetValue = v;
                if (this.inited) {
                    this.fireEvent('targetValue', v);
                    this.update();
                }
            }
        },
        
        
        // Methods /////////////////////////////////////////////////////////////
        /** @overrides */
        update: function() {
            if (this.canUpdate()) {
                const setterName = this.setterName, 
                    value = this.targetValue, 
                    svs = this.subviews, 
                    len = svs.length; 
                for (let i = 0; len > i;) {
                    const setter = svs[i++][setterName];
                    if (setter) setter(value);
                }
            }
        }
    });
    
    /** An extension of ConstantLayout that allows for variation based on the
        index and subview. An updateSubview method is provided that can be
        overriden to provide variable behavior.
        
        Events:
            collapseParent:boolean
            reverse:boolean
        
        Attributes:
            collapseParent:boolean If true the updateParent method will be called.
                The updateParent method will typically resize the parent to fit
                the newly layed out child views. Defaults to false.
            reverse:boolean If true the layout will position the items in the
                opposite order. For example, right to left instead of left to right.
                Defaults to false.
        
        @class */
    pkg.VariableLayout = new JSClass('VariableLayout', pkg.ConstantLayout, {
        // Life Cycle //////////////////////////////////////////////////////////
        /** @overrides */
        initNode: function(parent, attrs) {
            this.collapseParent = this.reverse = false;
            
            this.callSuper(parent, attrs);
        },
        
        
        // Accessors ///////////////////////////////////////////////////////////
        setCollapseParent: function(v) {
            if (this.collapseParent !== v) {
                this.collapseParent = v;
                if (this.inited) {
                    this.fireEvent('collapseParent', v);
                    this.update();
                }
            }
        },
        
        setReverse: function(v) {
            if (this.reverse !== v) {
                this.reverse = v;
                if (this.inited) {
                    this.fireEvent('reverse', v);
                    this.update();
                }
            }
        },
        
        
        // Methods /////////////////////////////////////////////////////////////
        /** @overrides */
        update: function() {
            if (this.canUpdate()) {
                // Prevent inadvertent loops
                this.incrementLockedCounter();
                
                this.doBeforeUpdate();
                
                const setterName = this.setterName, 
                    svs = this.subviews, 
                    len = svs.length;
                let value = this.targetValue,
                    i, 
                    sv, 
                    count = 0;
                
                if (this.reverse) {
                    i = len;
                    while (i) {
                        sv = svs[--i];
                        if (this.skipSubview(sv)) continue;
                        value = this.updateSubview(++count, sv, setterName, value);
                    }
                } else {
                    i = 0;
                    while (len > i) {
                        sv = svs[i++];
                        if (this.skipSubview(sv)) continue;
                        value = this.updateSubview(++count, sv, setterName, value);
                    }
                }
                
                this.doAfterUpdate();
                
                if (this.collapseParent && !this.parent.isBeingDestroyed) {
                    this.updateParent(setterName, value);
                }
                
                this.decrementLockedCounter();
            }
        },
        
        /** Called by update before any processing is done. Gives subviews a
            chance to do any special setup before update is processed.
            @returns {undefined} */
        doBeforeUpdate: () => {
            // Subclasses to implement as needed.
        },
        
        /** Called by update after any processing is done but before the optional
            collapsing of parent is done. Gives subviews a chance to do any 
            special teardown after update is processed.
            @returns {undefined} */
        doAfterUpdate: () => {
            // Subclasses to implement as needed.
        },
        
        /** Provides a default implementation that calls update when the
            visibility of a subview changes.
            @overrides myt.Layout
            @param {?Object} sv
            @returns {undefined} */
        startMonitoringSubview: function(sv) {
            this.attachTo(sv, 'update', 'visible');
        },
        
        /** Provides a default implementation that calls update when the
            visibility of a subview changes.
            @overrides myt.Layout
            @param {?Object} sv
            @returns {undefined} */
        stopMonitoringSubview: function(sv) {
            this.detachFrom(sv, 'update', 'visible');
        },
        
        /** Called for each subview in the layout.
            @param {number} count - The number of subviews that have been layed out
                including the current one. i.e. count will be 1 for the first
                subview layed out.
            @param {!Object} sv - The sub myt.View being layed out.
            @param {string} setterName - The name of the setter method to call.
            @param {*} value - The layout value.
            @returns {*} - The value to use for the next subview. */
        updateSubview: (count, sv, setterName, value) => {
            sv[setterName](value);
            return value;
        },
        
        /** Called for each subview in the layout to determine if the view should
            be positioned or not. The default implementation returns true if the 
            subview is not visible.
            @param {?Object} sv - The sub myt.View to test.
            @returns {boolean} true if the subview should be skipped during layout updates.*/
        skipSubview: (sv) => !sv.visible,
        
        /** Called if the collapseParent attribute is true. Subclasses should 
            implement this if they want to modify the parent view.
            @param {string} setterName - The name of the setter method to call on
                the parent.
            @param {*} value - The value to set on the parent.
            @returns {undefined} */
        updateParent: (setterName, value) => {
            // Subclasses to implement as needed.
        }
    });
})(myt);

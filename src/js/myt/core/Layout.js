(pkg => {
    let 
        /*  The global lock counter. Any value greater than zero sets the 
            global lock. */
        globalLockCount = 0,
        
        /*  The global layout locked status. */
        globalLock = false;
    
    const JSClass = JS.Class,
        
        /*  A list of layouts to be updated once the global lock 
            is released. */
        deferredLayouts = [],
        
        /*  Called to set/unset the global lock. Updates all the currently 
            deferred layouts. */
        setGlobalLock = v => {
            if (globalLock !== v) {
                globalLock = v;
                
                if (!v) {
                    let i = deferredLayouts.length;
                    while (i) {
                        const layout = deferredLayouts[--i];
                        layout.__deferredLayout = false;
                        layout.update();
                    }
                    deferredLayouts.length = 0;
                }
            }
        },
        
        /*  Adds a Layout to the list of layouts that will get updated when 
            the global lock is released.
                param layout:myt.Layout the layout to defer an update for. */
        deferLayoutUpdate = layout => {
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
        
        setAndUpdate = (layout, attrName, value) => {
            if (layout[attrName] !== value) {
                layout[attrName] = value;
                if (layout.inited) {
                    layout.fireEvent(attrName, value);
                    layout.update();
                }
            }
        },
        
        /** A layout controls the positioning of views within a parent view.
            
            Attributes:
                locked:boolean When true, the layout will not update.
                lockedCounter:number Counter created by myt.ThresholdCounter.
            
            Private Attributes:
                subviews:array An array of Views managed by this layout.
                __deferredLayout:boolean Marks a layout as deferred if the 
                    global layout lock is true during a call to 'canUpdate' 
                    on the layout.
            
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
                const curParent = this.parent;
                if (curParent !== parent) {
                    // Lock during parent change so that old parent is not 
                    // updated by the calls to removeSubview and addSubview.
                    const wasNotLocked = !this.locked;
                    if (wasNotLocked) this.locked = true;
                    
                    // Stop monitoring parent
                    let svs,
                        i,
                        len;
                    if (curParent) {
                        svs = this.subviews;
                        i = svs.length;
                        while (i) this.removeSubview(svs[--i]);
                        
                        this.detachFrom(curParent, '__hndlPSAV', 'subviewAdded');
                        this.detachFrom(curParent, '__hndlPSRV', 'subviewRemoved');
                    }
                    
                    this.callSuper(parent);
                    parent = this.parent;
                    
                    // Start monitoring new parent
                    if (parent) {
                        svs = parent.getSubviews();
                        for (i = 0, len = svs.length; len > i;) this.addSubview(svs[i++]);
                        
                        this.attachTo(parent, '__hndlPSAV', 'subviewAdded');
                        this.attachTo(parent, '__hndlPSRV', 'subviewRemoved');
                    }
                    
                    // Clear temporary lock and update if this happened 
                    // after initialization.
                    if (wasNotLocked) {
                        this.locked = false;
                        if (this.inited && parent) this.update();
                    }
                }
            },
            
            
            // Methods /////////////////////////////////////////////////////////
            /** Checks if the layout is locked or not. Should be called by the
                "update" method of each layout to check if it is OK to do the 
                update. If myt.Layout.locked is true (the global layout lock) 
                then a deferred layout update will be setup for this Layout. 
                Once the global lock is unlocked this Layout's 'update' method 
                will be invoked.
                @returns {boolean} true if not locked, false otherwise. */
            canUpdate: function() {
                if (globalLock) {
                    deferLayoutUpdate(this);
                    return false;
                }
                return !this.locked;
            },
            
            /** Updates the layout. Subclasses should call canUpdate to check 
                lock state before trying to do anything.
                @returns {undefined} */
            update: () => {},
            
            // Subview Methods //
            /** Checks if this Layout has the provided View in the subviews 
                array.
                @param {?Object} sv - The myt.View to check for.
                @returns true if the subview is found, false otherwise. */
            hasSubview: function(sv) {
                return this.getSubviewIndex(sv) !== -1;
            },
            
            /** Gets the index of the provided View in the subviews array.
                @param {?Object} sv - The myt.View to check for.
                @returns {number} - The index of the subview or -1 if not 
                    found. */
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
                @param {?Object} sv - The myt.View to start monitoring for 
                    changes.
                @returns {undefined} */
            startMonitoringSubview: sv => {},
            
            /** Calls startMonitoringSubview for all views. Used by Layout 
                implementations when a change occurs to the layout that 
                requires refreshing all the subview monitoring.
                @returns {undefined} */
            startMonitoringAllSubviews: function() {
                const svs = this.subviews;
                let i = svs.length;
                while (i) this.startMonitoringSubview(svs[--i]);
            },
            
            /** Removes the provided View from the subviews array of this 
                Layout.
                @param {?Object} sv - The myt.View to remove from this layout.
                @returns the index of the removed subview or -1 if 
                    not removed. */
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
                events from the subview that would trigger the update method. 
                This should remove all listeners that were setup in 
                startMonitoringSubview.
                @param {?Object} sv - The myt.View to stop monitoring for 
                    changes.
                @returns {undefined} */
            stopMonitoringSubview: sv => {},
            
            /** Calls stopMonitoringSubview for all views. Used by Layout 
                implementations when a change occurs to the layout that 
                requires refreshing all the subview monitoring.
                @returns {undefined} */
            stopMonitoringAllSubviews: function() {
                const svs = this.subviews;
                let i = svs.length;
                while (i) this.stopMonitoringSubview(svs[--i]);
            },
            
            /** Checks if a subview can be added to this Layout or not. The 
                default implementation returns the 'ignoreLayout' attributes 
                of the subview.
                @param {?Object} sv - The myt.View to check.
                @returns {boolean} true means the subview will be skipped, 
                    false otherwise. */
            ignore: sv => sv.ignoreLayout,
            
            /** If our parent adds a new subview we should add it.
                @private
                @param {!Object} event
                @returns {undefined} */
            __hndlPSAV: function(event) {
                if (event.value.parent === this.parent) this.addSubview(event.value);
            },
            
            /** If our parent removes a subview we should remove it.
                @private
                @param {!Object} event
                @returns {undefined} */
            __hndlPSRV: function(event) {
                if (event.value.parent === this.parent) this.removeSubview(event.value);
            },
            
            // Subview ordering //
            /** Sorts the subviews array according to the provided sort 
                function.
                @param {?Function} sortFunc - The sort function to sort the 
                    subviews with.
                @returns {undefined} */
            sortSubviews: function(sortFunc) {
                this.subviews.sort(sortFunc);
            },
            
            /** Moves the subview before the target subview in the order the 
                subviews are layed out. If no target subview is provided, or 
                it isn't in the layout the subview will be moved to the front 
                of the list.
                @param {?Object} sv
                @param {?Object} target
                @returns {undefined} */
            moveSubviewBefore: function(sv, target) {
                moveSubview(this, sv, target, false);
            },
            
            /** Moves the subview after the target subview in the order the 
                subviews are layed out. If no target subview is provided, or 
                it isn't in the layout the subview will be moved to the back 
                of the list.
                @param {?Object} sv
                @param {?Object} target
                @returns {undefined} */
            moveSubviewAfter: function(sv, target) {
                moveSubview(this, sv, target, true);
            }
        }),
        
        /** A layout that sets the target attribute name to the target value 
            for each subview.
            
            Events:
                targetAttrName:string
                targetValue:*
            
            Attributes:
                targetAttrName:string the name of the attribute to set on each 
                    subview.
                targetValue:* the value to set the attribute to.
                setterName:string the name of the setter method to call on 
                    the subview for the targetAttrName. This value is updated 
                    when setTargetAttrName is called.
            
            @class */
        ConstantLayout = pkg.ConstantLayout = new JSClass('ConstantLayout', Layout, {
            // Accessors ///////////////////////////////////////////////////////
            setTargetAttrName: function(v) {
                this.setterName = pkg.AccessorSupport.generateSetterName(v);
                setAndUpdate(this, 'targetAttrName', v);
            },
            
            setTargetValue: function(v) {setAndUpdate(this, 'targetValue', v);},
            
            
            // Methods /////////////////////////////////////////////////////////
            /** @overrides */
            update: function() {
                if (this.canUpdate()) {
                    const setterName = this.setterName, 
                        value = this.targetValue, 
                        svs = this.subviews, 
                        len = svs.length; 
                    if (setterName) for (let i = 0; len > i;) svs[i++][setterName](value);
                }
            }
        }),
        
        /** An extension of ConstantLayout that allows for variation based on 
            the index and subview. An updateSubview method is provided that 
            can be overriden to provide variable behavior.
            
            Events:
                collapseParent:boolean
                reverse:boolean
            
            Attributes:
                collapseParent:boolean If true the updateParent method will be 
                    called. The updateParent method will typically resize the 
                    parent to fit the newly layed out child views. Defaults 
                    to false.
                reverse:boolean If true the layout will position the items in 
                    the opposite order. For example, right to left instead of 
                    left to right. Defaults to false.
            
            @class */
        VariableLayout = pkg.VariableLayout = new JSClass('VariableLayout', ConstantLayout, {
            // Life Cycle //////////////////////////////////////////////////////
            /** @overrides */
            initNode: function(parent, attrs) {
                this.collapseParent = this.reverse = false;
                
                this.callSuper(parent, attrs);
            },
            
            
            // Accessors ///////////////////////////////////////////////////////
            setCollapseParent: function(v) {setAndUpdate(this, 'collapseParent', v);},
            setReverse: function(v) {setAndUpdate(this, 'reverse', v);},
            
            
            // Methods /////////////////////////////////////////////////////////
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
                        count = 0;
                    
                    if (this.reverse) {
                        i = len;
                        while (i) {
                            const sv = svs[--i];
                            if (this.skipSubview(sv)) continue;
                            value = this.updateSubview(++count, sv, setterName, value);
                        }
                    } else {
                        i = 0;
                        while (len > i) {
                            const sv = svs[i++];
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
            
            /** Called by update before any processing is done. Gives subviews 
                a chance to do any special setup before update is processed.
                @returns {undefined} */
            doBeforeUpdate: () => {/* Subclasses to implement as needed. */},
            
            /** Called by update after any processing is done but before the 
                optional collapsing of parent is done. Gives subviews a chance 
                to do any special teardown after update is processed.
                @returns {undefined} */
            doAfterUpdate: () => {/* Subclasses to implement as needed. */},
            
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
                @param {number} count - The number of subviews that have been 
                    layed out including the current one. i.e. count will be 1 
                    for the first subview layed out.
                @param {!Object} sv - The sub myt.View being layed out.
                @param {string} setterName - The name of the setter method 
                    to call.
                @param {*} value - The layout value.
                @returns {*} - The value to use for the next subview. */
            updateSubview: (count, sv, setterName, value) => {
                sv[setterName](value);
                return value;
            },
            
            /** Called for each subview in the layout to determine if the view 
                should be positioned or not. The default implementation returns 
                true if the subview is not visible.
                @param {?Object} sv - The sub myt.View to test.
                @returns {boolean} true if the subview should be skipped during 
                    layout updates. */
            skipSubview: sv => !sv.visible,
            
            /** Called if the collapseParent attribute is true. Subclasses 
                should implement this if they want to modify the parent view.
                @param {string} setterName - The name of the setter method to 
                    call on the parent.
                @param {*} value - The value to set on the parent.
                @returns {undefined} */
            updateParent: (setterName, value) => {/* Subclasses to implement as needed. */}
        }),
        
        /** An extension of VariableLayout that positions views along an axis 
            using an inset, outset and spacing value.
            
            Events:
                spacing:number
                outset:number
            
            Attributes:
                axis:string The orientation of the layout. An alias 
                    for setTargetAttrName.
                inset:number Padding before the first subview that gets 
                    positioned. An alias for setTargetValue.
                spacing:number Spacing between each subview.
                outset:number Padding at the end of the layout. Only gets 
                    used if collapseParent is true.
                noAddSubviewOptimization:boolean Turns the optimization to 
                    suppress layout updates when a subview is added off/on. 
                    Defaults to undefined which is equivalent to false and 
                    thus leaves the optimization on.
            
            @class */
        SpacedLayout = pkg.SpacedLayout = new JSClass('SpacedLayout', VariableLayout, {
            // Life Cycle //////////////////////////////////////////////////////
            /** @overrides myt.VariableLayout */
            initNode: function(parent, attrs) {
                const self = this;
                
                self.targetAttrName = self.axis = 'x';
                self.setterName = 'setX';
                self.measureAttrName = 'boundsWidth';
                self.measureAttrBaseName = 'width';
                self.parentSetterName = 'setWidth';
                self.targetValue = self.spacing = self.inset = self.outset = 0;
                
                self.callSuper(parent, attrs);
            },
            
            
            // Accessors ///////////////////////////////////////////////////////
            /** @overrides myt.ConstantLayout */
            setTargetAttrName: function(v) {
                if (this.targetAttrName !== v) {
                    const isY = v === 'y',
                        inited = this.inited;
                    if (inited) this.stopMonitoringAllSubviews();
                    this.measureAttrName = isY ? 'boundsHeight' : 'boundsWidth';
                    this.measureAttrBaseName = isY ? 'height' : 'width';
                    this.parentSetterName = isY ? 'setHeight' : 'setWidth';
                    if (inited) this.startMonitoringAllSubviews();
                    this.callSuper(v);
                }
            },
            
            setNoAddSubviewOptimization: function(v) {this.noAddSubviewOptimization = v;},
            setAxis: function(v) {this.setTargetAttrName(this.axis = v);},
            setInset: function(v) {this.setTargetValue(this.inset = v);},
            
            setSpacing: function(v) {setAndUpdate(this, 'spacing', v);},
            setOutset: function(v) {setAndUpdate(this, 'outset', v);},
            
            
            // Methods /////////////////////////////////////////////////////////
            /** @overrides myt.Layout */
            addSubview: function(sv) {
                // OPTIMIZATION: Skip the update call that happens during 
                // subview add. The boundsWidth/boundsHeight events will be 
                // fired immediately after and are a more appropriate time to 
                // do the update.
                const isLocked = this.locked; // Remember original locked state.
                if (!this.noAddSubviewOptimization) this.locked = true; // Lock the layout so no updates occur.
                this.callSuper(sv);
                this.locked = isLocked; // Restore original locked state.
            },
            
            /** @overrides myt.VariableLayout */
            startMonitoringSubview: function(sv) {
                this.attachTo(sv, 'update', this.measureAttrName);
                this.callSuper(sv);
            },
            
            /** @overrides myt.VariableLayout */
            stopMonitoringSubview: function(sv) {
                this.detachFrom(sv, 'update', this.measureAttrName);
                this.callSuper(sv);
            },
            
            /** @overrides myt.ConstantLayout */
            updateSubview: function(count, sv, setterName, value) {
                const size = sv[this.measureAttrName];
                sv[setterName](value + (size - sv[this.measureAttrBaseName])/2.0); // Adj for transform
                return value + size + this.spacing;
            },
            
            /** @overrides myt.VariableLayout */
            updateParent: function(setterName, value) {
                this.parent[this.parentSetterName](value + this.outset - this.spacing);
            }
        });
    
    /** An extension of SpacedLayout that resizes one or more views to fill 
        in any remaining space. The resizable subviews should not have a 
        transform applied to it. The non-resized views may have transforms 
        applied to them.
        
        @class */
    pkg.ResizeLayout = new JSClass('ResizeLayout', SpacedLayout, {
        // Accessors ///////////////////////////////////////////////////////////
        /** @overrides myt.VariableLayout */
        setCollapseParent: v => {/* collapseParent attribute is unused in ResizeLayout. */},
        
        /** @overrides myt.SpacedLayout */
        setTargetAttrName: function(v) {
            if (this.targetAttrName !== v) {
                if (this.inited) {
                    const isX = v === 'x';
                    this.stopMonitoringParent(isX ? 'height' : 'width');
                    this.startMonitoringParent(isX ? 'width' : 'height');
                }
                
                this.callSuper(v);
            }
        },
        
        /** @overrides myt.Layout */
        setParent: function(parent) {
            if (this.parent !== parent) {
                const dim = this.targetAttrName === 'x' ? 'width' : 'height';
                if (this.parent) this.stopMonitoringParent(dim);
                
                this.callSuper(parent);
                
                if (this.parent) this.startMonitoringParent(dim);
            }
        },
        
        
        // Methods /////////////////////////////////////////////////////////////
        /** Called when monitoring of width/height should start on our parent.
            @param {string} attrName - The name of the attribute to 
                start monitoring.
            @returns {undefined} */
        startMonitoringParent: function(attrName) {
            this.attachTo(this.parent, 'update', attrName);
        },
        
        /** Called when monitoring of width/height should stop on our parent.
            @param {string} attrName - The name of the attribute to 
                stop monitoring.
            @returns {undefined} */
        stopMonitoringParent: function(attrName) {
            this.detachFrom(this.parent, 'update', attrName);
        },
        
        /** @overrides myt.VariableLayout */
        doBeforeUpdate: function() {
            // Get size to fill
            const measureAttrName = this.measureAttrName,
                measureAttrBaseName = this.measureAttrBaseName,
                svs = this.subviews;
            
            // Calculate minimum required size
            let remainder = this.parent[measureAttrBaseName] - this.targetValue - this.outset,
                i = svs.length, 
                count = 0, 
                resizeSum = 0;
            while (i) {
                const sv = svs[--i];
                if (this.skipSubview(sv)) continue;
                ++count;
                if (sv.layoutHint > 0) {
                    resizeSum += sv.layoutHint;
                } else {
                    remainder -= sv[measureAttrName];
                }
            }
            
            if (count !== 0) {
                remainder -= (count - 1) * this.spacing;
                
                // Store for update
                this.remainder = remainder;
                this.resizeSum = resizeSum;
                this.scalingFactor = remainder / resizeSum;
                this.resizeSumUsed = this.remainderUsed = 0;
                this.measureSetter = measureAttrName === 'boundsWidth' ? 'setWidth' : 'setHeight';
            }
        },
        
        /** @overrides myt.SpacedLayout */
        updateSubview: function(count, sv, setterName, value) {
            const hint = sv.layoutHint;
            if (hint > 0) {
                this.resizeSumUsed += hint;
                
                const size = this.resizeSum === this.resizeSumUsed ? 
                    this.remainder - this.remainderUsed : 
                    Math.round(hint * this.scalingFactor);
                
                this.remainderUsed += size;
                sv[this.measureSetter](size);
            }
            return this.callSuper(count, sv, setterName, value);
        },
        
        /** @overrides myt.SpacedLayout */
        startMonitoringSubview: function(sv) {
            // Don't monitor width/height of the "stretchy" subviews since this
            // layout changes them.
            if (!(sv.layoutHint > 0)) this.attachTo(sv, 'update', this.measureAttrName);
            this.attachTo(sv, 'update', 'visible');
        },
        
        /** @overrides myt.SpacedLayout */
        stopMonitoringSubview: function(sv) {
            // Don't monitor width/height of the "stretchy" subviews since this
            // layout changes them.
            if (!(sv.layoutHint > 0)) this.detachFrom(sv, 'update', this.measureAttrName);
            this.detachFrom(sv, 'update', 'visible');
        },
        
        /** @overrides myt.SpacedLayout */
        updateParent: (setterName, value) => {/* No resizing of parent since this view expands to fill the parent. */}
    });

    /** An extension of VariableLayout that also aligns each view vertically
        or horizontally.
        
        Events:
            align:string
        
        Attributes:
            align:string Determines which way the views are aligned. Allowed
                values are 'left', 'center', 'right' and 'top', 'middle', 
                'bottom'. Defaults to 'middle'.
        
        @class */
    pkg.AlignedLayout = new JSClass('AlignedLayout', VariableLayout, {
        // Life Cycle //////////////////////////////////////////////////////////
        /** @overrides myt.VariableLayout */
        initNode: function(parent, attrs) {
            const self = this;
            
            self.align = 'middle';
            self.targetAttrName = 'y';
            self.setterName = 'setY';
            self.measureAttrName = 'boundsHeight';
            self.measureAttrBaseName = 'height';
            self.parentSetterName = 'setHeight';
            self.targetValue = 0;
            
            self.callSuper(parent, attrs);
        },
        
        
        // Accessors ///////////////////////////////////////////////////////////
        /** @overrides myt.ConstantLayout */
        setTargetAttrName: function(v) {
            if (this.targetAttrName !== v) {
                const isY = v === 'y',
                    inited = this.inited;
                if (inited) this.stopMonitoringAllSubviews();
                this.measureAttrName = isY ? 'boundsHeight' : 'boundsWidth';
                this.measureAttrBaseName = isY ? 'height' : 'width';
                this.parentSetterName = isY ? 'setHeight' : 'setWidth';
                if (inited) this.startMonitoringAllSubviews();
                this.callSuper(v);
            }
        },
        
        setAlign: function(v) {
            if (this.align !== v) {
                this.align = v;
                
                // Update orientation but don't trigger an update since we
                // already call update at the end of this setter.
                const isLocked = this.locked;
                this.locked = true;
                this.setTargetAttrName((v === 'middle' || v === 'bottom' || v === 'top') ? 'y' : 'x');
                this.locked = isLocked;
                
                if (this.inited) {
                    this.fireEvent('align', v);
                    this.update();
                }
            }
        },
        
        
        // Methods /////////////////////////////////////////////////////////////
        /** @overrides myt.VariableLayout */
        startMonitoringSubview: function(sv) {
            this.attachTo(sv, 'update', this.measureAttrName);
            this.callSuper(sv);
        },
        
        /** @overrides myt.VariableLayout */
        stopMonitoringSubview: function(sv) {
            this.detachFrom(sv, 'update', this.measureAttrName);
            this.callSuper(sv);
        },
        
        /** Determine the maximum subview width/height according to the axis.
            @overrides myt.VariableLayout */
        doBeforeUpdate: function() {
            const measureAttrName = this.measureAttrName, 
                svs = this.subviews;
            let value = 0, 
                sv, 
                i = svs.length;
            while (i) {
                sv = svs[--i];
                if (this.skipSubview(sv)) continue;
                value = value > sv[measureAttrName] ? value : sv[measureAttrName];
            }
            
            this.setTargetValue(value);
        },
        
        /** @overrides myt.VariableLayout */
        updateSubview: function(count, sv, setterName, value) {
            switch (this.align) {
                case 'center': case 'middle':
                    sv[setterName]((value - sv[this.measureAttrName]) / 2);
                    break;
                case 'right': case 'bottom':
                    sv[setterName](value - sv[this.measureAttrName]);
                    break;
                default:
                    sv[setterName](0);
            }
            return value;
        },
        
        /** @overrides myt.VariableLayout */
        updateParent: function(setterName, value) {
            this.parent[this.parentSetterName](value);
        }
    });
    
    /** An extension of VariableLayout that positions views along an axis using
        an inset, outset and spacing value. Views will be wrapped when they
        overflow the available space.
        
        Supported Layout Hints:
            break:string Will force the subview to start a new line/column.
        
        @class */
    pkg.WrappingLayout = new JSClass('WrappingLayout', VariableLayout, {
        // Life Cycle //////////////////////////////////////////////////////////
        /** @overrides myt.VariableLayout */
        initNode: function(parent, attrs) {
            const self = this;
            
            self.targetAttrName = self.axis = 'x';
            self.setterName = 'setX';
            self.otherSetterName = 'setY';
            self.measureAttrName = 'boundsWidth';
            self.measureAttrBaseName = 'width';
            self.otherMeasureAttrName = 'boundsHeight';
            self.otherMeasureAttrBaseName = 'height';
            self.parentSetterName = 'setHeight';
            self.targetValue = self.spacing = self.inset = self.outset = self.lineSpacing = self.lineInset = self.lineOutset = 0;
            
            self.callSuper(parent, attrs);
        },
        
        
        // Accessors ///////////////////////////////////////////////////////////
        /** @overrides myt.ConstantLayout */
        setTargetAttrName: function(v) {
            if (this.targetAttrName !== v) {
                const isY = v === 'y',
                    inited = this.inited;
                
                if (inited) this.stopMonitoringAllSubviews();
                
                this.measureAttrName = isY ? 'boundsHeight' : 'boundsWidth';
                const mabn = this.measureAttrBaseName = isY ? 'height' : 'width';
                this.otherMeasureAttrName = isY ? 'boundsWidth' : 'boundsHeight';
                const omabn = this.otherMeasureAttrBaseName = isY ? 'width' : 'height';
                this.parentSetterName = isY ? 'setWidth' : 'setHeight';
                this.otherSetterName = isY ? 'setX' : 'setY';
                
                if (inited) {
                    this.startMonitoringAllSubviews();
                    this.stopMonitoringParent(omabn);
                    this.startMonitoringParent(mabn);
                }
                this.callSuper(v);
            }
        },
        
        /** @overrides myt.Layout */
        setParent: function(parent) {
            if (this.parent !== parent) {
                const isY = this.targetAttrName === 'y';
                if (this.parent) this.stopMonitoringParent(isY ? 'height' : 'width');
                this.callSuper(parent);
                if (this.parent) this.startMonitoringParent(isY ? 'height' : 'width');
            }
        },
        
        setAxis: function(v) {this.setTargetAttrName(this.axis = v);},
        setInset: function(v) {this.setTargetValue(this.inset = v);},
        
        setSpacing: function(v) {setAndUpdate(this, 'spacing', v);},
        setOutset: function(v) {setAndUpdate(this, 'outset', v);},
        setLineSpacing: function(v) {setAndUpdate(this, 'lineSpacing', v);},
        setLineInset: function(v) {setAndUpdate(this, 'lineInset', v);},
        setLineOutset: function(v) {setAndUpdate(this, 'lineOutset', v);},
        
        
        // Methods /////////////////////////////////////////////////////////////
        /** Called when monitoring of width/height should start on our parent.
            @param {string} measureAttrName - The name of the attribute to 
                start monitoring.
            @returns {undefined} */
        startMonitoringParent: function(measureAttrName) {
            this.attachTo(this.parent, 'update', measureAttrName);
        },
        
        /** Called when monitoring of width/height should stop on our parent.
            @param {string} measureAttrName - The name of the attribute to 
                stop monitoring.
            @returns {undefined} */
        stopMonitoringParent: function(measureAttrName) {
            this.detachFrom(this.parent, 'update', measureAttrName);
        },
        
        /** @overrides myt.Layout */
        startMonitoringSubview: function(sv) {
            this.attachTo(sv, 'update', this.measureAttrName);
            this.attachTo(sv, 'update', this.otherMeasureAttrName);
            this.callSuper(sv);
        },
        
        /** @overrides myt.Layout */
        stopMonitoringSubview: function(sv) {
            this.detachFrom(sv, 'update', this.measureAttrName);
            this.detachFrom(sv, 'update', this.otherMeasureAttrName);
            this.callSuper(sv);
        },
        
        
        /** @overrides myt.VariableLayout */
        doBeforeUpdate: function() {
            // The number of lines layed out.
            this.lineCount = 1;
            
            // The maximum size achieved by any line.
            this.maxSize = 0;
            
            // Track the maximum size of a line. Used to determine how much to
            // update linePos by when wrapping occurs.
            this.lineSize = 0;
            
            // The position for each subview in a line. Gets updated for each 
            // new line of subviews.
            this.linePos = this.lineInset;
            
            // The size of the parent view. Needed to determine when to wrap. 
            // The outset is already subtracted as a performance optimization.
            this.parentSizeLessOutset = this.parent[this.measureAttrName] - this.outset;
        },
        
        /** @overrides myt.ConstantLayout */
        updateSubview: function(count, sv, setterName, value) {
            const size = sv[this.measureAttrName],
                otherSize = sv[this.otherMeasureAttrName];
            
            if (value + size > this.parentSizeLessOutset || sv.layoutHint === 'break') {
                // Check for overflow
                value = this.targetValue; // Reset to inset.
                this.linePos += this.lineSize + this.lineSpacing;
                this.lineSize = otherSize;
                
                ++this.lineCount;
            } else if (otherSize > this.lineSize) {
                // Update line size if this subview is larger
                this.lineSize = otherSize;
            }
            
            sv[this.otherSetterName](this.linePos + (otherSize - sv[this.otherMeasureAttrBaseName])/2.0); // adj is for transform
            sv[setterName](value + (size - sv[this.measureAttrBaseName])/2.0); // adj is for transform
            
            // Track max size achieved during layout.
            this.maxSize = Math.max(this.maxSize, value + size + this.outset);
            
            return value + size + this.spacing;
        },
        
        /** @overrides myt.VariableLayout */
        updateParent: function(setterName, value) {
            // Collapse in the other direction
            this.parent[this.parentSetterName](this.linePos + this.lineSize + this.lineOutset);
        }
    });
    
    /* Create locked counter functions for the myt.Layout class. */
    pkg.createFixedThresholdCounter(Layout, 1, 'locked');
})(myt);

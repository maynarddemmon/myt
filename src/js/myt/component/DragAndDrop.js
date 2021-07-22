((pkg) => {
    const JSModule = JS.Module,
        G = pkg.global,
        dragManager = G.dragManager,
        globalMouse = G.mouse,
        Draggable = pkg.Draggable,
        
        defAttr = pkg.AccessorSupport.defAttr,
        
        /*  @param {!Object} autoScroller
            @param {string} dir - The direction to scroll.
            @param {number} amt - The amount to scroll.
            @returns {undefined} */
        doAutoScrollAdj = (autoScroller, dir, amt) => {
            if (autoScroller['__isAuto' + dir]) {
                autoScroller.getInnerDomElement()[dir === 'scrollUp' || dir === 'scrollDown' ? 'scrollTop' : 'scrollLeft'] += amt * autoScroller['__amount' + dir];
                
                autoScroller['__timerIdAuto' + dir] = setTimeout(() => {
                    doAutoScrollAdj(autoScroller, dir, amt);
                }, autoScroller.scrollFrequency);
            }
        },
        
        /*  @param {!Object} autoScroller
            @param {number} percent - The percent of scroll acceleration to use.
            @returns {number} */
        calculateAmount = (autoScroller, percent) => Math.round(autoScroller.scrollAmount * (1 + autoScroller.scrollAcceleration * percent)),
        
        /*  @param {!Object} autoScroller
            @returns {undefined} */
        resetVScroll = autoScroller => {
            autoScroller.__isAutoscrollUp = autoScroller.__isAutoscrollDown = false;
            autoScroller.__timerIdAutoscrollUp = autoScroller.__timerIdAutoscrollDown = null;
        },
        
        /*  @param {!Object} autoScroller
            @returns {undefined} */
        resetHScroll = autoScroller => {
            autoScroller.__isAutoscrollLeft = autoScroller.__isAutoscrollRight = false;
            autoScroller.__timerIdAutoscrollLeft = autoScroller.__timerIdAutoscrollRight = null;
        },
        
        /* Adds drag group support to drag and drop related classes.
            
            Private Attributes:
                __dragGroups:object The keys are the set of drag groups this view
                    supports. By default the special drag group of '*' which accepts
                    all drag groups is defined.
                __acceptAny:boolean The precalculated return value for the
                    acceptAnyDragGroup method. */
        DragGroupSupport = pkg.DragGroupSupport = new JSModule('DragGroupSupport', {
            // Life Cycle //////////////////////////////////////////////////////
            /** @overrides */
            initNode: function(parent, attrs) {
                this.__dragGroups = {'*':true};
                this.__acceptAny = true;
                
                this.callSuper(parent, attrs);
            },
            
            
            // Accessors ///////////////////////////////////////////////////////
            setDragGroups: function(v) {
                const newDragGroups = this.__dragGroups = {};
                for (const dragGroup in v) newDragGroups[dragGroup] = true;
                this.__acceptAny = newDragGroups.hasOwnProperty('*');
            },
            
            getDragGroups: function() {
                return this.__dragGroups;
            },
            
            
            // Methods /////////////////////////////////////////////////////////
            /** Adds the provided dragGroup to the dragGroups.
                @param dragGroup:string The drag group to add.
                @returns {undefined} */
            addDragGroup: function(dragGroup) {
                if (dragGroup) {
                    this.__dragGroups[dragGroup] = true;
                    if (dragGroup === '*') this.__acceptAny = true;
                }
            },
            
            /** Removes the provided dragGroup from the dragGroups.
                @param dragGroup:string The drag group to remove.
                @returns {undefined} */
            removeDragGroup: function(dragGroup) {
                if (dragGroup) {
                    delete this.__dragGroups[dragGroup];
                    if (dragGroup === '*') this.__acceptAny = false;
                }
            },
            
            /** Determines if this drop target will accept drops from any drag group.
                @returns boolean: True if any drag group will be accepted, false otherwise. */
            acceptAnyDragGroup: function() {
                return this.__acceptAny;
            }
        });
    
    /** Makes an myt.View support being a source for myt.Dropable instances. Makes
        use of myt.Draggable for handling drag initiation but this view is not
        actually draggable.
        
        Attributes:
            dropParent:myt.View The view to make the myt.Dropable instances in.
                Defaults to the myt.RootView that contains this drop source.
            dropClass:JS.Class The myt.Dropable class that gets created in the
                default implementation of makeDropable.
            dropClassAttrs:object The attrs to use when making the dropClass instance.
            dropable:mytDropable (read only) The dropable that was most 
                recently created. Once the dropable has been dropped this will
                be set to null. */
    pkg.DropSource = new JSModule('DropSource', {
        include: [Draggable],
        
        
        // Life Cycle //////////////////////////////////////////////////////////
        /** @overrides */
        initNode: function(parent, attrs) {
            defAttr(attrs, 'distanceBeforeDrag', 2);
            defAttr(attrs, 'dropParent', parent.getRoot());
            
            this.callSuper(parent, attrs);
        },
        
        
        // Accessors ///////////////////////////////////////////////////////////
        setDropClass: function(v) {this.dropClass = pkg.resolveClassname(v);},
        setDropClassAttrs: function(v) {this.dropClassAttrs = v;},
        setDropParent: function(v) {this.dropParent = v;},
        
        
        // Methods /////////////////////////////////////////////////////////////
        /** @overrides myt.Draggable */
        startDrag: function(event) {
            const dropable = this.dropable = this.makeDropable();
            
            // Emulate mouse down on the dropable
            if (dropable) {
                // Remember distance and set to zero so a drag will begin for sure.
                const origDistance = dropable.distanceBeforeDrag;
                dropable.distanceBeforeDrag = 0;
                
                dropable.doMouseDown(event); // Execute MouseDownMixin
                dropable.__doMouseDown(event); // Execute Draggable
                
                // Restore distance
                dropable.distanceBeforeDrag = origDistance;
            }
        },
        
        /** @overrides myt.MouseDown */
        doMouseUp: function(event) {
            this.callSuper(event);
            
            // Emulate mouse up on the dropable
            const dropable = this.dropable;
            if (dropable) {
                dropable.__doMouseUp(event);
                dropable.doMouseUp(event);
                this.dropable = null;
            }
        },
        
        /** Called by startDrag to make a dropable.
            @returns myt.Dropable or undefined if one can't be created. */
        makeDropable: function() {
            const dropClass = this.dropClass,
                dropParent = this.dropParent;
            if (dropClass && dropParent) {
                const pos = pkg.DomElementProxy.getPagePosition(this.getInnerDomElement(), dropParent.getInnerDomElement()),
                attrs = Object.assign({}, this.dropClassAttrs);
                attrs.x = pos.x || 0;
                attrs.y = pos.y || 0;
                return new dropClass(dropParent, attrs);
            }
        },
    });
    
    /** Makes an myt.View support having myt.Dropable views dropped on it. */
    pkg.DropTarget = new JSModule('DropTarget', {
        include: [DragGroupSupport],
        
        
        // Life Cycle //////////////////////////////////////////////////////////
        /** @overrides */
        initNode: function(parent, attrs) {
            this.callSuper(parent, attrs);
            
            dragManager.registerDropTarget(this);
        },
        
        /** @overrides */
        destroyAfterOrphaning: function() {
            dragManager.unregisterDropTarget(this);
            
            this.callSuper();
        },
        
        
        // Methods /////////////////////////////////////////////////////////////
        /** Called by myt.GlobalDragManager when a dropable is dragged over this
            target. Gives this drop target a chance to reject a drop regardless
            of drag group. The default implementation returns true if the view
            is not disabled.
            @param dropable:myt.Dropable The dropable being dragged.
            @returns boolean: True if the drop will be allowed, false otherwise. */
        willAcceptDrop: function(dropable) {
            // Components must be visible and not disabled to accept a drop.
            return !this.disabled && this.isVisible();
        },
        
        /** Called by myt.GlobalDragManager when a dropable starts being dragged
            that has a matching drag group.
            @param dropable:myt.Dropable The dropable being dragged.
            @returns {undefined} */
        notifyDragStart: dropable => {},
        
        /** Called by myt.GlobalDragManager when a dropable stops being dragged
            that has a matching drag group.
            @param dropable:myt.Dropable The dropable no longer being dragged.
            @returns {undefined} */
        notifyDragStop: dropable => {},
        
        /** Called by myt.GlobalDragManager when a dropable is dragged over this
            view and has a matching drag group.
            @param dropable:myt.Dropable The dropable being dragged over this view.
            @returns {undefined} */
        notifyDragEnter: dropable => {},
        
        /** Called by myt.GlobalDragManager when a dropable is dragged out of this
            view and has a matching drag group.
            @param dropable:myt.Dropable The dropable being dragged out of 
                this view.
            @returns {undefined} */
        notifyDragLeave: dropable => {},
        
        /** Called by myt.GlobalDragManager when a dropable is dropped onto this
            view and has a matching drag group.
            @param dropable:myt.Dropable The dropable being dropped onto this view.
            @returns {undefined} */
        notifyDrop: dropable => {}
    });
    
    /** Makes an myt.View drag and dropable via the mouse.
        
        Attributes:
            dropped:boolean Indicates this dropable was just dropped.
            dropFailed:boolean Indicates this dropable was just dropped outside
                of a drop target.
            dropTarget:myt.DropTarget The drop target this dropable is 
                currently over. */
    pkg.Dropable = new JSModule('Dropable', {
        include: [Draggable, DragGroupSupport],
        
        
        // Accessors ///////////////////////////////////////////////////////////
        setDropTarget: function(v) {this.dropTarget = v;},
        setDropped: function(v) {this.dropped = v;},
        setDropFailed: function(v) {this.dropFailed = v;},
        
        
        // Methods /////////////////////////////////////////////////////////////
        /** Called by myt.GlobalDragManager when a dropable is dragged over a
            target. Gives this dropable a chance to reject a drop regardless
            of drag group. The default implementation returns true.
            @param dropTarget:myt.DropTarget The drop target dragged over.
            @returns boolean: True if the drop will be allowed, false otherwise. */
        willPermitDrop: dropTarget => true,
        
        /** @overrides myt.Draggable */
        startDrag: function(event) {
            this.setDropped(false);
            this.setDropFailed(false);
            
            dragManager.startDrag(this);
            this.callSuper(event);
        },
        
        /** @overrides myt.Draggable */
        updateDrag: function(event) {
            dragManager.updateDrag(event, this);
            this.callSuper(event);
        },
        
        /** @overrides myt.Draggable */
        stopDrag: function(event, isAbort) {
            dragManager.stopDrag(event, this, isAbort);
            this.callSuper(event, isAbort);
            
            if (isAbort) {
                this.notifyDropAborted();
            } else if (this.dropFailed) {
                this.notifyDropFailed();
            }
        },
        
        /** Called by myt.GlobalDragManager when this view is dragged over a drop target.
            @param dropTarget:myt.DropTarget The target that was dragged over.
            @returns {undefined} */
        notifyDragEnter: function(dropTarget) {
            this.setDropTarget(dropTarget);
        },
        
        /** Called by myt.GlobalDragManager when this view is dragged out of a drop target.
            @param dropTarget:myt.DropTarget The target that was dragged out of.
            @returns {undefined} */
        notifyDragLeave: function(dropTarget) {
            this.setDropTarget();
        },
        
        /** Called by myt.GlobalDragManager when this view is dropped.
            @param dropTarget:myt.DropTarget The target that was dropped on. Will
                be undefined if this dropable was dropped on no drop target.
            @param isAbort:boolean Indicates if the drop was the result of an
                abort or a normal drop.
            @returns {undefined} */
        notifyDropped: function(dropTarget, isAbort) {
            this.setDropped(true);
            
            if (!this.dropTarget) this.setDropFailed(true);
        },
        
        /** Called after dragging stops and the drop failed. The default
            implementation does nothing.
            @returns {undefined} */
        notifyDropFailed: () => {},
        
        /** Called after dragging stops and the drop was aborted. The default
            implementation does nothing.
            @returns {undefined} */
        notifyDropAborted: () => {}
    });
    
    /** Makes an myt.View auto scroll during drag and drop.
        
        Attributes:
            scrollBorder:number The thickness of the auto scroll border. Defaults
                to 40 pixels.
            scrollFrequency:number The time between autoscroll adjustments.
                Defaults to 50 millis.
            scrollAmount:number The number of pixels to adjust by each time.
                Defaults to 2 pixels.
            scrollAcceleration:number The amount to increase scrolling by as the
                mouse gets closer to the edge of the view. Setting this to 0 will
                result in no acceleration. Defaults to 7.
        
        Private Attributes:
            __amountscrollUp:number
            __amountscrollDown:number
            __amountscrollLeft:number
            __amountscrollRight:number
            __isAutoscrollUp:boolean
            __timerIdAutoscrollUp:number
            __isAutoscrollDown:boolean
            __timerIdAutoscrollDown:number
            __isAutoscrollLeft:boolean
            __timerIdAutoscrollLeft:number
            __isAutoscrollRight:boolean
            __timerIdAutoscrollRight:number
    */
    pkg.AutoScroller = new JSModule('AutoScroller', {
        include: [DragGroupSupport],
        
        
        // Life Cycle //////////////////////////////////////////////////////////
        /** @overrides */
        initNode: function(parent, attrs) {
            this.scrollBorder = 40;
            this.scrollFrequency = 50;
            this.scrollAmount = 2;
            this.scrollAcceleration = 7;
            
            defAttr(attrs, 'overflow', 'auto');
            
            this.callSuper(parent, attrs);
            
            dragManager.registerAutoScroller(this);
        },
        
        /** @overrides */
        destroyAfterOrphaning: function() {
            dragManager.unregisterAutoScroller(this);
            
            this.callSuper();
        },
        
        
        // Accessors ///////////////////////////////////////////////////////////
        setScrollBorder: function(v) {this.scrollBorder = v;},
        setScrollFrequency: function(v) {this.scrollFrequency = v;},
        setScrollAmount: function(v) {this.scrollAmount = v;},
        setScrollAcceleration: function(v) {this.scrollAcceleration = v;},
        
        
        // Methods /////////////////////////////////////////////////////////////
        /** Called by myt.GlobalDragManager when a dropable starts being dragged
            that has a matching drag group.
            @param {!Object} dropable - The myt.Dropable being dragged.
            @returns {undefined} */
        notifyDragStart: function(dropable) {
            const de = this.getInnerDomElement();
            if (de.scrollHeight > de.clientHeight || de.scrollWidth > de.clientWidth) {
                this.attachToDom(globalMouse, '__handleMouseMove', 'mousemove', true);
            }
        },
        
        /** Called by myt.GlobalDragManager when a dropable stops being dragged
            that has a matching drag group.
            @param {!Object} dropable - The myt.Dropable no longer being dragged.
            @returns {undefined} */
        notifyDragStop: function(dropable) {
            this.detachFromDom(globalMouse, '__handleMouseMove', 'mousemove', true);
            
            resetVScroll(this);
            resetHScroll(this);
        },
        
        /** @private
            @param {!Object} event
            @returns {undefined} */
        __handleMouseMove: function(event) {
            const self = this,
                mousePos = event.value;
            let mouseX = mousePos.pageX, 
                mouseY = mousePos.pageY;
            
            if (self.containsPoint(mouseX, mouseY)) {
                const pos = self.getPagePosition(), 
                    scrollBorder = self.scrollBorder;
                
                mouseX -= pos.x;
                mouseY -= pos.y;
                
                if (mouseY < scrollBorder) {
                    self.__isAutoscrollUp = true;
                    self.__amountscrollUp = calculateAmount(self, (scrollBorder - mouseY) / scrollBorder);
                    if (!self.__timerIdAutoscrollUp) doAutoScrollAdj(self, 'scrollUp', -1);
                } else if (self.height - mouseY < scrollBorder) {
                    self.__isAutoscrollDown = true;
                    self.__amountscrollDown = calculateAmount(self, (scrollBorder - (self.height - mouseY)) / scrollBorder);
                    if (!self.__timerIdAutoscrollDown) doAutoScrollAdj(self, 'scrollDown', 1);
                } else {
                    resetVScroll(self);
                }
                
                if (mouseX < scrollBorder) {
                    self.__isAutoscrollLeft = true;
                    self.__amountscrollLeft = calculateAmount(self, (scrollBorder - mouseX) / scrollBorder);
                    if (!self.__timerIdAutoscrollLeft) doAutoScrollAdj(self, 'scrollLeft', -1);
                } else if (self.width - mouseX < scrollBorder) {
                    self.__isAutoscrollRight = true;
                    self.__amountscrollRight = calculateAmount(self, (scrollBorder - (self.width - mouseX)) / scrollBorder);
                    if (!self.__timerIdAutoscrollRight) doAutoScrollAdj(self, 'scrollRight', 1);
                } else {
                    resetHScroll(self);
                }
            } else {
                resetVScroll(self);
                resetHScroll(self);
            }
        }
    });
})(myt);

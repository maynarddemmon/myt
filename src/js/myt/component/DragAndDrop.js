(pkg => {
    const JSModule = JS.Module,
    
        {dragManager, mouse:globalMouse} = pkg.global,
        
        Draggable = pkg.Draggable,
        
        ANY_GROUP = '*',
        
        /*  @param {!Object} autoScroller
            @param {!string} lessDir
            @param {!string} moreDir
            @returns {undefined} */
        resetScroll = (autoScroller, lessDir, moreDir) => {
            [lessDir, moreDir].forEach(dir => {
                autoScroller['__is' + dir] = false;
                autoScroller['__tmrId' + dir] = null;
            });
        },
        
        /*  @param {!Object} autoScroller
            @returns {undefined} */
        resetVScroll = autoScroller => {resetScroll(autoScroller, 'Up', 'Down');},
        
        /*  @param {!Object} autoScroller
            @returns {undefined} */
        resetHScroll = autoScroller => {resetScroll(autoScroller, 'Left', 'Right');},
        
        /** Adds drag group and drop group support to drag and drop related classes. Drag groups
            are used to mark the thing being dragged around. Drop groups are used to mark the
            things that can accept a thing dropped on them.
            
            Private Attributes:
                __dgs:object The keys are the set of drag groups this view supports. By default the 
                    special drag group of '*' which accepts all drag groups is defined.
                __anyDG:boolean The precalculated return value for the acceptAnyDragGroup method.
                __drpgs:object The keys are the set of drop groups this view supports. By default 
                    the special drop group of '*' which accepts all drop groups is defined.
                __anyDRPG:boolean The precalculated return value for the acceptAnyDropGroup method.
            
            @class */
        DragGroupSupport = pkg.DragGroupSupport = new JSModule('DragGroupSupport', {
            // Life Cycle //////////////////////////////////////////////////////
            /** @overrides */
            initNode: function(parent, attrs) {
                this.__dgs = {'*':true};
                this.__drpgs = {'*':true};
                this.__anyDG = this.__anyDRPG = true;
                
                this.callSuper(parent, attrs);
            },
            
            
            // Accessors ///////////////////////////////////////////////////////
            setDragGroups: function(v) {
                const newDragGroups = this.__dgs = {};
                for (const dragGroup in v) newDragGroups[dragGroup] = true;
                this.__anyDG = newDragGroups.hasOwnProperty(ANY_GROUP);
            },
            
            getDragGroups: function() {
                return this.__dgs;
            },
            
            setDropGroups: function(v) {
                const newDropGroups = this.__drpgs = {};
                for (const dropGroup in v) newDropGroups[dropGroup] = true;
                this.__anyDRPG = newDropGroups.hasOwnProperty(ANY_GROUP);
            },
            
            getDropGroups: function() {
                return this.__drpgs;
            },
            
            
            // Methods /////////////////////////////////////////////////////////
            /** Adds the provided dragGroup to the dragGroups.
                @param dragGroup:string The drag group to add.
                @returns {undefined} */
            addDragGroup: function(dragGroup) {
                if (dragGroup) {
                    this.__dgs[dragGroup] = true;
                    if (dragGroup === ANY_GROUP) this.__anyDG = true;
                }
            },
            
            /** Removes the provided dragGroup from the dragGroups.
                @param dragGroup:string The drag group to remove.
                @returns {undefined} */
            removeDragGroup: function(dragGroup) {
                if (dragGroup) {
                    delete this.__dgs[dragGroup];
                    if (dragGroup === ANY_GROUP) this.__anyDG = false;
                }
            },
            
            /** Determines if this drop target will accept drops from any drag group.
                @returns boolean: True if any drag group will be accepted, false otherwise. */
            isAnyDragGroup: function() {
                return this.__anyDG;
            },
            
            /** Adds the provided dropGroup to the dropGroups.
                @param dropGroup:string The droup group to add.
                @returns {undefined} */
            addDropGroup: function(dropGroup) {
                if (dropGroup) {
                    this.__drpgs[dropGroup] = true;
                    if (dropGroup === ANY_GROUP) this.__anyDRPG = true;
                }
            },
            
            /** Removes the provided dropGroup from the dropGroups.
                @param dropGroup:string The drop group to remove.
                @returns {undefined} */
            removeDropGroup: function(dropGroup) {
                if (dropGroup) {
                    delete this.__drpgs[dropGroup];
                    if (dropGroup === ANY_GROUP) this.__anyDRPG = false;
                }
            },
            
            /** Determines if this drop target will accept drops from any drop group.
                @returns boolean: True if any drop group will be accepted, false otherwise. */
            isAnyDropGroup: function() {
                return this.__anyDRPG;
            }
        });
    
    /** Makes an myt.View support being a source for myt.Dropable instances. Makes use of 
        myt.Draggable for handling drag initiation but this view is not actually draggable.
        
        Attributes:
            dropParent:myt.View The view to make the myt.Dropable instances in. Defaults to the 
                myt.RootView that contains this drop source.
            dropClass:JS.Class The myt.Dropable class that gets created in the default 
                implementation of makeDropable.
            dropClassAttrs:object The attrs to use when making the dropClass instance.
            dropable:mytDropable (read only) The dropable that was most recently created. Once the 
                dropable has been dropped this will be set to null.
        
        @class */
    pkg.DropSource = new JSModule('DropSource', {
        include: [Draggable],
        
        
        // Life Cycle //////////////////////////////////////////////////////////
        /** @overrides */
        initNode: function(parent, attrs) {
            attrs.distanceBeforeDrag ??= 2;
            attrs.dropParent ??= parent.getRoot();
            
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
                const pos = pkg.DomElementProxy.getRelativePosition(this.getIDE(), dropParent.getIDE());
                return new dropClass(dropParent, {...this.dropClassAttrs, x:pos.x ?? 0, y:pos.y ?? 0});
            }
        }
    });
    
    /** Makes an myt.View support having myt.Dropable views dropped on it.
        
        @class */
    pkg.DropTarget = new JSModule('DropTarget', {
        include: [DragGroupSupport],
        
        
        // Life Cycle //////////////////////////////////////////////////////////
        /** @overrides */
        initNode: function(parent, attrs) {
            this.callSuper(parent, attrs);
            
            dragManager.registerDropTarget(this);
        },
        
        /** @overrides */
        destroy: function() {
            dragManager.unregisterDropTarget(this);
            
            this.callSuper();
        },
        
        
        // Methods /////////////////////////////////////////////////////////////
        /** Called by myt.GlobalDragManager when a dropable is dragged over this target. Gives this 
            drop target a chance to reject a drop regardless of drag group. The default 
            implementation returns true if the view is not disabled.
            @param dropable:myt.Dropable The dropable being dragged.
            @returns boolean: True if the drop will be allowed, false otherwise. */
        willAcceptDrop: function(dropable) {
            // Components must be visible and not disabled to accept a drop.
            return !this.disabled && this.isVisible();
        },
        
        /** Called by myt.GlobalDragManager when a dropable starts being dragged that has a 
            matching drag group.
            @param dropable:myt.Dropable The dropable being dragged.
            @returns {undefined} */
        notifyDragStart: dropable => {},
        
        /** Called by myt.GlobalDragManager when a dropable stops being dragged that has a 
            matching drag group.
            @param dropable:myt.Dropable The dropable no longer being dragged.
            @returns {undefined} */
        notifyDragStop: dropable => {},
        
        /** Called by myt.GlobalDragManager when a dropable is dragged over this view and has a 
            matching drag group.
            @param dropable:myt.Dropable The dropable being dragged over this view.
            @returns {undefined} */
        notifyDragEnter: dropable => {},
        
        /** Called by myt.GlobalDragManager when a dropable is dragged out of this view and has a 
            matching drag group.
            @param dropable:myt.Dropable The dropable being dragged out of this view.
            @returns {undefined} */
        notifyDragLeave: dropable => {},
        
        /** Called by myt.GlobalDragManager when a dropable is dropped onto this view and has a 
            matching drag group.
            @param dropable:myt.Dropable The dropable being dropped onto this view.
            @returns {undefined} */
        notifyDrop: dropable => {}
    });
    
    /** Makes an myt.View drag and dropable via the mouse.
        
        Attributes:
            dropped:boolean Indicates this dropable was just dropped.
            dropFailed:boolean Indicates this dropable was just dropped outside of a drop target.
            dropTarget:myt.DropTarget The drop target this dropable is currently over.
        
        @class */
    pkg.Dropable = new JSModule('Dropable', {
        include: [Draggable, DragGroupSupport],
        
        
        // Accessors ///////////////////////////////////////////////////////////
        setDropTarget: function(v) {this.dropTarget = v;},
        setDropped: function(v) {this.dropped = v;},
        setDropFailed: function(v) {this.dropFailed = v;},
        
        
        // Methods /////////////////////////////////////////////////////////////
        /** Called by myt.GlobalDragManager when a dropable is dragged over a target. Gives this 
            dropable a chance to reject a drop regardless of drag group. The default implementation 
            returns true.
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
        notifyDragEntering: function(dropTarget) {
            this.setDropTarget(dropTarget);
        },
        
        /** Called by myt.GlobalDragManager when this view is dragged out of a drop target.
            @param dropTarget:myt.DropTarget The target that was dragged out of.
            @returns {undefined} */
        notifyDragLeaving: function(dropTarget) {
            this.setDropTarget();
        },
        
        /** Called by myt.GlobalDragManager when this view is dropped.
            @param dropTarget:myt.DropTarget The target that was dropped on. Will be undefined if 
                this dropable was dropped on no drop target.
            @param isAbort:boolean Indicates if the drop was the result of an abort or a 
                normal drop.
            @returns {undefined} */
        notifyDropped: function(dropTarget, isAbort) {
            this.setDropped(true);
            
            if (!this.dropTarget) this.setDropFailed(true);
        },
        
        /** Called after dragging stops and the drop failed. The default implementation 
            does nothing.
            @returns {undefined} */
        notifyDropFailed: () => {},
        
        /** Called after dragging stops and the drop was aborted. The default implementation 
            does nothing.
            @returns {undefined} */
        notifyDropAborted: () => {}
    });
    
    /** Makes an myt.View auto scroll during drag and drop.
        
        Attributes:
            scrollBorder:number The thickness of the auto scroll border. Defaults to 40 pixels.
            scrollFrequency:number The time between autoscroll adjustments. Defaults to 50 millis.
            scrollAmount:number The number of pixels to adjust by each time. Defaults to 2 pixels.
            scrollAcceleration:number The amount to increase scrolling by as the mouse gets closer 
                to the edge of the view. Setting this to 0 will result in no acceleration. 
                Defaults to 7.
        
        Private Attributes:
            __amtUp:number
            __amtDown:number
            __amtLeft:number
            __amtRight:number
            __isUp:boolean
            __tmrIdUp:number
            __isDown:boolean
            __tmrIdDown:number
            __isLeft:boolean
            __tmrIdLeft:number
            __isRight:boolean
            __tmrIdRight:number
        
        @class */
    pkg.AutoScroller = new JSModule('AutoScroller', {
        include: [DragGroupSupport],
        
        
        // Life Cycle //////////////////////////////////////////////////////////
        /** @overrides */
        initNode: function(parent, attrs) {
            this.scrollBorder = 40;
            this.scrollFrequency = 50;
            this.scrollAmount = 2;
            this.scrollAcceleration = 7;
            
            attrs.overflow ??= 'auto';
            
            this.callSuper(parent, attrs);
            
            dragManager.registerAutoScroller(this);
        },
        
        /** @overrides */
        destroy: function() {
            dragManager.unregisterAutoScroller(this);
            
            this.callSuper();
        },
        
        
        // Accessors ///////////////////////////////////////////////////////////
        setScrollBorder: function(v) {this.scrollBorder = Math.max(1, v);},
        setScrollFrequency: function(v) {this.scrollFrequency = v;},
        setScrollAmount: function(v) {this.scrollAmount = v;},
        setScrollAcceleration: function(v) {this.scrollAcceleration = v;},
        
        
        // Methods /////////////////////////////////////////////////////////////
        /** Called by myt.GlobalDragManager when a dropable starts being dragged that has a 
            matching drag group.
            @param {!Object} dropable - The myt.Dropable being dragged.
            @returns {undefined} */
        notifyAutoScrollerDragStart: function(dropable) {
            const ide = this.getIDE();
            if (ide.scrollHeight > ide.clientHeight || ide.scrollWidth > ide.clientWidth) {
                this.attachToDom(globalMouse, '__hndlMove', 'mousemove', true);
            }
        },
        
        /** Called by myt.GlobalDragManager when a dropable stops being dragged that has a 
            matching drag group.
            @param {!Object} dropable - The myt.Dropable no longer being dragged.
            @returns {undefined} */
        notifyAutoScrollerDragStop: function(dropable) {
            this.detachFromDom(globalMouse, '__hndlMove', 'mousemove', true);
            
            resetVScroll(this);
            resetHScroll(this);
        },
        
        /** Handles global mouse movement.
            @private
            @param {!Object} event
            @returns {undefined} */
        __hndlMove: function(event) {
            const self = this;
            
            let {pageX:mouseX, pageY:mouseY} = event.value;
            if (self.containsPoint(mouseX, mouseY)) {
                const pos = self.getPagePosition(), 
                    scrollBorder = self.scrollBorder,
                    calculateAmount = percent => Math.round(self.scrollAmount * (1 + self.scrollAcceleration * percent)),
                    doAutoScrollAdj = (dir, amt) => {
                        if (self['__is' + dir]) {
                            self.getIDE()['scroll' + (dir === 'Up' || dir === 'Down' ? 'Top' : 'Left')] += amt * self['__amt' + dir];
                            self['__tmrId' + dir] = setTimeout(() => {doAutoScrollAdj(dir, amt);}, self.scrollFrequency);
                        }
                    };
                
                mouseX -= pos.x;
                mouseY -= pos.y;
                
                if (mouseY < scrollBorder) {
                    self.__isUp = true;
                    self.__amtUp = calculateAmount(1 - mouseY / scrollBorder);
                    if (!self.__tmrIdUp) doAutoScrollAdj('Up', -1);
                } else if (self.height - mouseY < scrollBorder) {
                    self.__isDown = true;
                    self.__amtDown = calculateAmount(1 - (self.height - mouseY) / scrollBorder);
                    if (!self.__tmrIdDown) doAutoScrollAdj('Down', 1);
                } else {
                    resetVScroll(self);
                }
                
                if (mouseX < scrollBorder) {
                    self.__isLeft = true;
                    self.__amtLeft = calculateAmount(1 - mouseX / scrollBorder);
                    if (!self.__tmrIdLeft) doAutoScrollAdj('Left', -1);
                } else if (self.width - mouseX < scrollBorder) {
                    self.__isRight = true;
                    self.__amtRight = calculateAmount(1 - (self.width - mouseX) / scrollBorder);
                    if (!self.__tmrIdRight) doAutoScrollAdj('Right', 1);
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

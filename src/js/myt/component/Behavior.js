((pkg) => {
    const JSModule = JS.Module,
        G = pkg.global,
        GlobalMouse = G.mouse,
        GlobalKeys = G.keys,
        GlobalIdle = G.idle,
        
        getKeyCodeFromEvent = event => pkg.KeyObservable.getKeyCodeFromEvent(event),
        getMouseFromEvent = event => pkg.MouseObservable.getMouseFromEvent(event);
    
    /** Adds the capability for an myt.View to be "activated". A doActivated 
        method is added that gets called when the view is "activated".
        
        @class */
    pkg.Activateable = new JSModule('Activateable', {
        // Methods /////////////////////////////////////////////////////////////
        /** Called when this view should be activated.
            @returns {undefined} */
        doActivated: () => {/* Subclasses to implement as needed. */}
    });
    
    /** Adds an udpateUI method that should be called to update the UI. Various
        mixins will rely on the updateUI method to trigger visual updates.
        
        @class */
    pkg.UpdateableUI = new JSModule('UpdateableUI', {
        // Life Cycle //////////////////////////////////////////////////////////
        /** @overrides */
        initNode: function(parent, attrs) {
            this.callSuper(parent, attrs);
            
            // Call updateUI one time after initialization is complete to give
            // this View a chance to update itself.
            this.updateUI();
        },
        
        
        // Methods /////////////////////////////////////////////////////////////
        /** Updates the UI whenever a change occurs that requires a visual 
            update. Subclasses should implement this as needed.
            @returns {undefined} */
        updateUI: () => {/* Subclasses to implement as needed. */}
    });
    
    /** Adds the capability to be "disabled" to an myt.Node. When an myt.Node is 
        disabled the user should typically not be able to interact with it.
        
        When disabled becomes true an attempt will be made to give away the 
        focus using myt.FocusObservable's giveAwayFocus method.
        
        Events:
            disabled:boolean Fired when the disabled attribute is modified
                via setDisabled.
        
        Attributes:
            disabled:boolean Indicates that this component is disabled.
        
        @class */
    pkg.Disableable = new JSModule('Disableable', {
        // Life Cycle //////////////////////////////////////////////////////////
        /** @overrides */
        initNode: function(parent, attrs) {
            if (attrs.disabled == null) attrs.disabled = false;
            
            this.callSuper(parent, attrs);
        },
        
        
        // Accessors ///////////////////////////////////////////////////////////
        setDisabled: function(v) {
            if (this.disabled !== v) {
                this.disabled = v;
                if (this.inited) this.fireEvent('disabled', v);
                
                this.doDisabled();
            }
        },
        
        
        // Methods /////////////////////////////////////////////////////////////
        /** Called after the disabled attribute is set. Default behavior 
            attempts to give away focus and calls the updateUI method of 
            myt.UpdateableUI if it is defined.
            @returns {undefined} */
        doDisabled: function() {
            if (this.inited) {
                // Give away focus if we become disabled and this instance is
                // a FocusObservable
                if (this.disabled && this.giveAwayFocus) this.giveAwayFocus();
                if (this.updateUI) this.updateUI();
            }
        }
    });
    
    /** Provides keyboard handling to "activate" the component when a key is 
        pressed down or released up. By default, when a keyup event occurs for
        an activation key and this view is not disabled, the 'doActivated' 
        method will get called.
        
        Requires: myt.Activateable, myt.Disableable, myt.KeyObservable and 
            myt.FocusObservable super mixins.
        
        Attributes:
            activationKeys:array of chars The keys that when keyed down will
                activate this component. Note: The value is not copied so
                modification of the array outside the scope of this object will
                effect behavior.
            activateKeyDown:number the keycode of the activation key that is
                currently down. This will be -1 when no key is down.
            repeatKeyDown:boolean Indicates if doActivationKeyDown will be 
                called for repeated keydown events or not. Defaults to false.
        
        @class */
    pkg.KeyActivation = new JSModule('KeyActivation', {
        // Class Methods and Attributes ////////////////////////////////////////
        extend: {
            /** The default activation keys are enter (13) and spacebar (32). */
            DEFAULT_ACTIVATION_KEYS: [13,32]
        },
        
        
        // Life Cycle //////////////////////////////////////////////////////////
        /** @overrides */
        initNode: function(parent, attrs) {
            const self = this;
            
            self.activateKeyDown = -1;
            
            if (attrs.activationKeys == null) attrs.activationKeys = pkg.KeyActivation.DEFAULT_ACTIVATION_KEYS;
            
            self.callSuper(parent, attrs);
            
            self.attachToDom(self, '__handleKeyDown', 'keydown');
            self.attachToDom(self, '__handleKeyPress', 'keypress');
            self.attachToDom(self, '__handleKeyUp', 'keyup');
            self.attachToDom(self, '__doDomBlur', 'blur');
        },
        
        
        // Accessors ///////////////////////////////////////////////////////////
        setActivationKeys: function(v) {this.activationKeys = v;},
        setRepeatKeyDown: function(v) {this.repeatKeyDown = v;},
        
        
        // Methods /////////////////////////////////////////////////////////////
        /** @private
            @param {!Object} event
            @returns {undefined} */
        __handleKeyDown: function(event) {
            if (!this.disabled) {
                if (this.activateKeyDown === -1 || this.repeatKeyDown) {
                    const keyCode = getKeyCodeFromEvent(event),
                        keys = this.activationKeys;
                    let i = keys.length;
                    while (i) {
                        if (keyCode === keys[--i]) {
                            if (this.activateKeyDown === keyCode) {
                                this.doActivationKeyDown(keyCode, true);
                            } else {
                                this.activateKeyDown = keyCode;
                                this.doActivationKeyDown(keyCode, false);
                            }
                            event.value.preventDefault();
                            return;
                        }
                    }
                }
            }
        },
        
        /** @private
            @param {!Object} event
            @returns {undefined} */
        __handleKeyPress: function(event) {
            if (!this.disabled) {
                const keyCode = getKeyCodeFromEvent(event);
                if (this.activateKeyDown === keyCode) {
                    const keys = this.activationKeys;
                    let i = keys.length;
                    while (i) {
                        if (keyCode === keys[--i]) {
                            event.value.preventDefault();
                            return;
                        }
                    }
                }
            }
        },
        
        /** @private
            @param {!Object} event
            @returns {undefined} */
        __handleKeyUp: function(event) {
            if (!this.disabled) {
                const keyCode = getKeyCodeFromEvent(event);
                if (this.activateKeyDown === keyCode) {
                    const keys = this.activationKeys;
                    let i = keys.length;
                    while (i) {
                        if (keyCode === keys[--i]) {
                            this.activateKeyDown = -1;
                            this.doActivationKeyUp(keyCode);
                            event.value.preventDefault();
                            return;
                        }
                    }
                }
            }
        },
        
        /** @private
            @param {!Object} event
            @returns {undefined} */
        __doDomBlur: function(event) {
            if (!this.disabled) {
                const keyThatWasDown = this.activateKeyDown;
                if (keyThatWasDown !== -1) {
                    this.activateKeyDown = -1;
                    this.doActivationKeyAborted(keyThatWasDown);
                }
            }
        },
        
        /** Called when an activation key is pressed down. Default 
            implementation does nothing.
            @param key:number the keycode that is down.
            @param isRepeat:boolean Indicates if this is a key repeat event 
                or not.
            @returns {undefined} */
        doActivationKeyDown: (key, isRepeat) => {/* Subclasses to implement as needed. */},
        
        /** Called when an activation key is release up. This executes the
            'doActivated' method by default. 
            @param key:number the keycode that is up.
            @returns {undefined} */
        doActivationKeyUp: function(key) {
            this.doActivated();
        },
        
        /** Called when focus is lost while an activation key is down. Default 
            implementation does nothing.
            @param key:number the keycode that is down.
            @returns {undefined} */
        doActivationKeyAborted: key => {/* Subclasses to implement as needed. */}
    });
    
    /** Provides a 'mouseOver' attribute that tracks mouse over/out state. Also
        provides a mechanism to smoothe over/out events so only one call to
        'doSmoothMouseOver' occurs per idle event.
        
        Requires myt.Disableable and myt.MouseObservable super mixins.
        
        Attributes:
            mouseOver:boolean Indicates if the mouse is over this view or not.
        
        Private Attributes:
            __attachedToOverIdle:boolean Used by the code that smoothes out
                mouseover events. Indicates that we are registered with the
                idle event.
            __lastOverIdleValue:boolean Used by the code that smoothes out
                mouseover events. Stores the last mouseOver value.
            __disabledOver:boolean Tracks mouse over/out state while a view is
                disabled. This allows correct restoration of mouseOver state if
                a view becomes enabled while the mouse is already over it.
        
        @class */
    pkg.MouseOver = new JSModule('MouseOver', {
        // Life Cycle //////////////////////////////////////////////////////////
        /** @overrides */
        initNode: function(parent, attrs) {
            if (attrs.mouseOver == null) attrs.mouseOver = false;
            
            this.callSuper(parent, attrs);
            
            this.attachToDom(this, 'doMouseOver', 'mouseover');
            this.attachToDom(this, 'doMouseOut', 'mouseout');
        },
        
        
        // Accessors ///////////////////////////////////////////////////////////
        setMouseOver: function(v) {
            if (this.mouseOver !== v) {
                this.mouseOver = v;
                // No event needed
                
                // Smooth out over/out events by delaying until the next 
                // idle event.
                if (this.inited && !this.__attachedToOverIdle) {
                    this.__attachedToOverIdle = true;
                    this.attachTo(GlobalIdle, '__doMouseOverOnIdle', 'idle');
                }
            }
        },
        
        /** @overrides myt.Disableable */
        setDisabled: function(v) {
            this.callSuper(v);
            
            if (this.disabled) {
                // When disabling make sure exposed mouseOver is not true. This 
                // helps prevent unwanted behavior of a disabled view such as a
                // disabled button looking like it is moused over.
                if (this.mouseOver) {
                    this.__disabledOver = true;
                    this.setMouseOver(false);
                }
            } else {
                // Restore exposed mouse over state when enabling
                if (this.__disabledOver) this.setMouseOver(true);
            }
        },
        
        
        // Methods /////////////////////////////////////////////////////////////
        /** @private
            @returns {undefined} */
        __doMouseOverOnIdle: function() {
            this.detachFrom(GlobalIdle, '__doMouseOverOnIdle', 'idle');
            this.__attachedToOverIdle = false;
            
            // Only call doSmoothOver if the over/out state has changed since 
            // the last time it was called.
            const isOver = this.mouseOver;
            if (this.__lastOverIdleValue !== isOver) {
                this.__lastOverIdleValue = isOver;
                this.doSmoothMouseOver(isOver);
            }
        },
        
        /** Called when mouseOver state changes. This method is called after
            an event filtering process has reduced frequent over/out events
            originating from the dom.
            @param {boolean} isOver
            @returns {undefined} */
        doSmoothMouseOver: function(isOver) {
            if (this.inited && this.updateUI) this.updateUI();
        },
        
        /** Called when the mouse is over this view. Subclasses must call super.
            @param {!Object} event
            @returns {undefined} */
        doMouseOver: function(event) {
            this.__disabledOver = true;
            
            if (!this.disabled) this.setMouseOver(true);
        },
        
        /** Called when the mouse leaves this view. Subclasses must call super.
            @param {!Object} event
            @returns {undefined} */
        doMouseOut: function(event) {
            this.__disabledOver = false;
            
            if (!this.disabled) this.setMouseOver(false);
        }
    });
    
    /** Provides a 'mouseDown' attribute that tracks mouse up/down state.
        
        Requires: myt.MouseOver, myt.Disableable, myt.MouseObservable super 
            mixins.
        
        Suggested: myt.UpdateableUI and myt.Activateable super mixins.
        
        Attributes:
            mouseDown:boolean Indicates if the mouse is down or not.
        
        @class */
    pkg.MouseDown = new JSModule('MouseDown', {
        // Life Cycle //////////////////////////////////////////////////////////
        /** @overrides */
        initNode: function(parent, attrs) {
            if (attrs.mouseDown == null) attrs.mouseDown = false;
            
            this.callSuper(parent, attrs);
            
            this.attachToDom(this, 'doMouseDown', 'mousedown');
            this.attachToDom(this, 'doMouseUp', 'mouseup');
        },
        
        
        // Accessors ///////////////////////////////////////////////////////////
        setMouseDown: function(v) {
            if (this.mouseDown !== v) {
                this.mouseDown = v;
                // No event needed
                if (this.inited) {
                    if (v && this.isFocusable()) this.focus(true);
                    if (this.updateUI) this.updateUI();
                }
            }
        },
        
        /** @overrides myt.Disableable */
        setDisabled: function(v) {
            // When about to disable the view make sure mouseDown is not true. 
            // This helps prevent unwanted activation of a disabled view.
            if (v && this.mouseDown) this.setMouseDown(false);
            
            this.callSuper(v);
        },
        
        
        // Methods /////////////////////////////////////////////////////////////
        /** @overrides myt.MouseOver */
        doMouseOver: function(event) {
            this.callSuper(event);
            if (this.mouseDown) this.detachFromDom(GlobalMouse, 'doMouseUp', 'mouseup', true);
        },
        
        /** @overrides myt.MouseOver */
        doMouseOut: function(event) {
            this.callSuper(event);
            
            // Wait for a mouse up anywhere if the user moves the mouse out of 
            // the view while the mouse is still down. This allows the user to 
            // move the mouse in and out of the view with the view still 
            // behaving as moused down.
            if (!this.disabled && this.mouseDown) this.attachToDom(GlobalMouse, 'doMouseUp', 'mouseup', true);
        },
        
        /** Called when the mouse is down on this view. Subclasses must call super.
            @param {!Object} event
            @returns {undefined} */
        doMouseDown: function(event) {
            if (!this.disabled) this.setMouseDown(true);
        },
        
        /** Called when the mouse is up on this view. Subclasses must call super.
            @param {!Object} event
            @returns {undefined} */
        doMouseUp: function(event) {
            // Cleanup global mouse listener since the mouseUp occurred outside
            // the view.
            if (!this.mouseOver) this.detachFromDom(GlobalMouse, 'doMouseUp', 'mouseup', true);
            
            if (!this.disabled && this.mouseDown) {
                this.setMouseDown(false);
                
                // Only do mouseUpInside if the mouse is actually over the view.
                // This means the user can mouse down on a view, move the mouse
                // out and then mouse up and not "activate" the view.
                if (this.mouseOver) this.doMouseUpInside(event);
            }
        },
        
        /** Called when the mouse is up and we are still over the view. Executes
            the 'doActivated' method by default.
            @param {!Object} event
            @returns {undefined} */
        doMouseUpInside: function(event) {
            if (this.doActivated) this.doActivated();
        }
    });
    
    /** Provides both MouseOver and MouseDown mixins as a single mixin.
        
        @class */
    pkg.MouseOverAndDown = new JSModule('MouseOverAndDown', {
        include: [pkg.MouseOver, pkg.MouseDown]
    });
    
    /** Makes an myt.View draggable via the mouse.
        
        Also supresses context menus since the mouse down to open it causes bad
        behavior since a mouseup event is not always fired.
        
        Events:
            isDragging:boolean Fired when the isDragging attribute is modified
                via setIsDragging.
        
        Attributes:
            allowAbort:boolean Allows a drag to be aborted by the user by
                pressing the 'esc' key. Defaults to undefined which is 
                equivalent to false.
            isDraggable:boolean Configures the view to be draggable or not. The 
                default value is true.
            distanceBeforeDrag:number The distance, in pixels, before a mouse 
                down and drag is considered a drag action. Defaults to 0.
            isDragging:boolean Indicates that this view is currently 
                being dragged.
            draggableAllowBubble:boolean Determines if mousedown and mouseup
                dom events handled by this component will bubble or not. 
                Defaults to true.
            dragOffsetX:number The x amount to offset the position during 
                dragging. Defaults to 0.
            dragOffsetY:number The y amount to offset the position during 
                dragging. Defaults to 0.
            dragInitX:number Stores initial mouse x position during dragging.
            dragInitY:number Stores initial mouse y position during dragging.
            centerOnMouse:boolean If true this draggable will update the 
                dragInitX and dragInitY to keep the view centered on the mouse. 
                Defaults to undefined which is equivalent to false.
        
        Private Attributes:
            __lastMousePosition:object The last position of the mouse during
                dragging.
        
        @class */
    pkg.Draggable = new JSModule('Draggable', {
        // Life Cycle //////////////////////////////////////////////////////////
        /** @overrides myt.View */
        initNode: function(parent, attrs) {
            const self = this;
            let isDraggable = true;
            
            self.isDraggable = self.isDragging = false;
            self.draggableAllowBubble = true;
            self.distanceBeforeDrag = self.dragOffsetX = self.dragOffsetY = 0;
            
            // Will be set after init since the draggable subview probably
            // doesn't exist yet.
            if (attrs.isDraggable != null) {
                isDraggable = attrs.isDraggable;
                delete attrs.isDraggable;
            }
            
            self.callSuper(parent, attrs);
            
            self.setIsDraggable(isDraggable);
        },
        
        
        // Accessors ///////////////////////////////////////////////////////////
        setIsDraggable: function(v) {
            const self = this;
            if (self.isDraggable !== v) {
                self.isDraggable = v;
                // No event needed.
                
                let func;
                if (v) {
                    func = self.attachToDom;
                } else if (self.inited) {
                    func = self.detachFromDom;
                }
                
                if (func) {
                    const dragviews = self.getDragViews();
                    let i = dragviews.length;
                    while (i) {
                        const dragview = dragviews[--i];
                        func.call(self, dragview, '__doMouseDown', 'mousedown');
                        func.call(self, dragview, '__doContextMenu', 'contextmenu');
                    }
                }
            }
        },
        
        setIsDragging: function(v) {
            this.set('isDragging', v, true);
        },
        
        setDragOffsetX: function(v, supressUpdate) {
            if (this.dragOffsetX !== v) {
                this.dragOffsetX = v;
                if (this.inited && this.isDragging && !supressUpdate) this.reRequestDragPosition();
            }
        },
        
        setDragOffsetY: function(v, supressUpdate) {
            if (this.dragOffsetY !== v) {
                this.dragOffsetY = v;
                if (this.inited && this.isDragging && !supressUpdate) this.reRequestDragPosition();
            }
        },
        
        setDistanceBeforeDrag: function(v) {this.distanceBeforeDrag = v;},
        setDraggableAllowBubble: function(v) {this.draggableAllowBubble = v;},
        setCenterOnMouse: function(v) {this.centerOnMouse = v;},
        setAllowAbort: function(v) {this.allowAbort = v;},
        
        
        // Methods /////////////////////////////////////////////////////////////
        /** @returns {!Array} - An array of views that can be moused down on to 
            start the drag. Subclasses should override this to return an 
            appropriate list of views. By default this view is returned thus 
            making the entire view capable of starting a drag. */
        getDragViews: function() {
            return [this];
        },
        
        /** @private
            @param {!Object} event
            @returns {undefined} */
        __doContextMenu: event => {
            // Do nothing so the context menu event is supressed.
        },
        
        /** @private
            @param {!Object} event
            @returns {undefined} */
        __doMouseDown: function(event) {
            const self = this,
                pos = getMouseFromEvent(event),
                de = self.getOuterDomElement();
            self.dragInitX = pos.x - de.offsetLeft;
            self.dragInitY = pos.y - de.offsetTop;
            
            self.attachToDom(GlobalMouse, '__doMouseUp', 'mouseup', true);
            if (self.distanceBeforeDrag > 0) {
                self.attachToDom(GlobalMouse, '__doDragCheck', 'mousemove', true);
            } else {
                self.startDrag(event);
            }
            
            event.value.preventDefault();
            return self.draggableAllowBubble;
        },
        
        /** @private
            @param {!Object} event
            @returns {undefined} */
        __doMouseUp: function(event) {
            if (this.isDragging) {
                this.stopDrag(event, false);
            } else {
                this.detachFromDom(GlobalMouse, '__doMouseUp', 'mouseup', true);
                this.detachFromDom(GlobalMouse, '__doDragCheck', 'mousemove', true);
            }
            return this.draggableAllowBubble;
        },
        
        /** @private
            @param {!Object} event
            @returns {undefined} */
        __watchForAbort: function(event) {
            if (event.value === 27) this.stopDrag(event, true);
        },
        
        /** @private
            @param {!Object} event
            @returns {undefined} */
        __doDragCheck: function(event) {
            const self = this,
                pos = getMouseFromEvent(event),
                distance = pkg.Geometry.measureDistance(pos.x, pos.y, self.dragInitX + self.x, self.dragInitY + self.y);
            if (distance >= self.distanceBeforeDrag) {
                self.detachFromDom(pkg.global.mouse, '__doDragCheck', 'mousemove', true);
                self.startDrag(event);
            }
        },
        
        /** Active until stopDrag is called. The view position will be bound
            to the mouse position. Subclasses typically call this onmousedown 
            for subviews that allow dragging the view.
            @param {!Object} event - The event the mouse event when the 
                drag started.
            @returns {undefined} */
        startDrag: function(event) {
            const self = this;
            
            if (self.centerOnMouse) {
                self.syncTo(self, '__updateDragInitX', 'width');
                self.syncTo(self, '__updateDragInitY', 'height');
            }
            
            if (self.allowAbort) self.attachTo(GlobalKeys, '__watchForAbort', 'keyup');
            
            self.setIsDragging(true);
            self.attachToDom(GlobalMouse, 'updateDrag', 'mousemove', true);
            self.updateDrag(event);
        },
        
        /** Called on every mousemove event while dragging.
            @param {!Object} event
            @returns {undefined} */
        updateDrag: function(event) {
            this.__lastMousePosition = getMouseFromEvent(event);
            this.reRequestDragPosition();
        },
        
        /** @private
            @param {!Object} event
            @returns {undefined} */
        __updateDragInitX: function(event) {
            this.dragInitX = this.width / 2 * (this.scaleX || 1);
        },
        
        /** @private
            @param {!Object} event
            @returns {undefined} */
        __updateDragInitY: function(event) {
            this.dragInitY = this.height / 2 * (this.scaleY || 1);
        },
        
        /** Stop the drag. (see startDrag for more details)
            @param {!Object} event - The event that ended the drag.
            @param {boolean} isAbort - Indicates if the drag ended normally 
                or was aborted.
            @returns {undefined} */
        stopDrag: function(event, isAbort) {
            const self = this;
            self.detachFromDom(GlobalMouse, '__doMouseUp', 'mouseup', true);
            self.detachFromDom(GlobalMouse, 'updateDrag', 'mousemove', true);
            if (self.centerOnMouse) {
                self.detachFrom(self, '__updateDragInitX', 'width');
                self.detachFrom(self, '__updateDragInitY', 'height');
            }
            if (self.allowAbort) self.detachFrom(GlobalKeys, '__watchForAbort', 'keyup');
            self.setIsDragging(false);
        },
        
        /** Repositions the view to the provided values. The default 
            implementation is to directly set x and y. Subclasses should 
            override this method when it is necessary to constrain the position.
            @param {number} x - the new x position.
            @param {number} y - the new y position.
            @returns {undefined} */
        requestDragPosition: function(x, y) {
            if (!this.disabled) {
                this.setX(x);
                this.setY(y);
            }
        },
        
        reRequestDragPosition: function() {
            const self = this,
                pos = self.__lastMousePosition;
            self.requestDragPosition(
                pos.x - self.dragInitX + self.dragOffsetX, 
                pos.y - self.dragInitY + self.dragOffsetY
            );
        }
    });
})(myt);

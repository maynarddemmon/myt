/** Makes an myt.View draggable via the mouse.
    
    Also supresses context menus since the mouse down to open it causes bad
    behavior since a mouseup event is not always fired.
    
    Events:
        isDragging:boolean Fired when the isDragging attribute is modified
            via setIsDragging.
    
    Attributes:
        allowAbort:boolean Allows a drag to be aborted by the user by
            pressing the 'esc' key. Defaults to undefined which is equivalent
            to false.
        isDraggable:boolean Configures the view to be draggable or not. The 
            default value is true.
        distanceBeforeDrag:number The distance, in pixels, before a mouse 
            down and drag is considered a drag action. Defaults to 0.
        isDragging:boolean Indicates that this view is currently being dragged.
        draggableAllowBubble:boolean Determines if mousedown and mouseup
            dom events handled by this component will bubble or not. Defaults
            to true.
        dragOffsetX:number The x amount to offset the position during dragging.
            Defaults to 0.
        dragOffsetY:number The y amount to offset the position during dragging.
            Defaults to 0.
        dragInitX:number Stores initial mouse x position during dragging.
        dragInitY:number Stores initial mouse y position during dragging.
        centerOnMouse:boolean If true this draggable will update the dragInitX
            and dragInitY to keep the view centered on the mouse. Defaults
            to undefined which is equivalent to false.
    
    Private Attributes:
        __lastMousePosition:object The last position of the mouse during
            dragging.
*/
myt.Draggable = new JS.Module('Draggable', {
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides myt.View */
    initNode: function(parent, attrs) {
        var self = this,
            isDraggable = true;
        
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
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setIsDraggable: function(v) {
        var self = this,
            func,
            dragviews,
            dragview,
            i;
        if (self.isDraggable !== v) {
            self.isDraggable = v;
            // No event needed.
            
            if (v) {
                func = self.attachToDom;
            } else if (self.inited) {
                func = self.detachFromDom;
            }
            
            if (func) {
                dragviews = self.getDragViews();
                i = dragviews.length;
                while (i) {
                    dragview = dragviews[--i];
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
            if (this.inited && this.isDragging && !supressUpdate) this.__requestDragPosition();
        }
    },
    
    setDragOffsetY: function(v, supressUpdate) {
        if (this.dragOffsetY !== v) {
            this.dragOffsetY = v;
            if (this.inited && this.isDragging && !supressUpdate) this.__requestDragPosition();
        }
    },
    
    setDistanceBeforeDrag: function(v) {this.distanceBeforeDrag = v;},
    setDraggableAllowBubble: function(v) {this.draggableAllowBubble = v;},
    setCenterOnMouse: function(v) {this.centerOnMouse = v;},
    setAllowAbort: function(v) {this.allowAbort = v;},
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** @returns an array of views that can be moused down on to start the
        drag. Subclasses should override this to return an appropriate list
        of views. By default this view is returned thus making the entire
        view capable of starting a drag. */
    getDragViews: function() {
        return [this];
    },
    
    /** @private
        @param {!Object} event
        @returns {undefined} */
    __doContextMenu: function(event) {
        // Do nothing so the context menu event is supressed.
    },
    
    /** @private
        @param {!Object} event
        @returns {undefined} */
    __doMouseDown: function(event) {
        var self = this,
            pos = myt.MouseObservable.getMouseFromEvent(event),
            gm = myt.global.mouse,
            de = self.getOuterDomElement();
        self.dragInitX = pos.x - de.offsetLeft;
        self.dragInitY = pos.y - de.offsetTop;
        
        self.attachToDom(gm, '__doMouseUp', 'mouseup', true);
        if (self.distanceBeforeDrag > 0) {
            self.attachToDom(gm, '__doDragCheck', 'mousemove', true);
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
            var gm = myt.global.mouse;
            this.detachFromDom(gm, '__doMouseUp', 'mouseup', true);
            this.detachFromDom(gm, '__doDragCheck', 'mousemove', true);
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
        var self = this,
            M = myt,
            pos = M.MouseObservable.getMouseFromEvent(event),
            distance = M.Geometry.measureDistance(pos.x, pos.y, self.dragInitX + self.x, self.dragInitY + self.y);
        if (distance >= self.distanceBeforeDrag) {
            self.detachFromDom(M.global.mouse, '__doDragCheck', 'mousemove', true);
            self.startDrag(event);
        }
    },
    
    /** Active until stopDrag is called. The view position will be bound
        to the mouse position. Subclasses typically call this onmousedown for
        subviews that allow dragging the view.
        @param {!Object} event - The event the mouse event when the drag started.
        @returns {undefined} */
    startDrag: function(event) {
        var self = this,
            g = myt.global;
        
        if (self.centerOnMouse) {
            self.syncTo(self, '__updateDragInitX', 'width');
            self.syncTo(self, '__updateDragInitY', 'height');
        }
        
        if (self.allowAbort) self.attachTo(g.keys, '__watchForAbort', 'keyup');
        
        self.setIsDragging(true);
        self.attachToDom(g.mouse, 'updateDrag', 'mousemove', true);
        self.updateDrag(event);
    },
    
    /** Called on every mousemove event while dragging.
        @param {!Object} event
        @returns {undefined} */
    updateDrag: function(event) {
        this.__lastMousePosition = myt.MouseObservable.getMouseFromEvent(event);
        this.__requestDragPosition();
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
    
    /** @private
        @returns {undefined} */
    __requestDragPosition: function() {
        var self = this,
            pos = self.__lastMousePosition;
        self.requestDragPosition(
            pos.x - self.dragInitX + self.dragOffsetX, 
            pos.y - self.dragInitY + self.dragOffsetY
        );
    },
    
    /** Stop the drag. (see startDrag for more details)
        @param {!Object} event - The event that ended the drag.
        @param {boolean} isAbort - Indicates if the drag ended normally or was
            aborted.
        @returns {undefined} */
    stopDrag: function(event, isAbort) {
        var self = this,
            g = myt.global,
            gm = g.mouse;
        self.detachFromDom(gm, '__doMouseUp', 'mouseup', true);
        self.detachFromDom(gm, 'updateDrag', 'mousemove', true);
        if (self.centerOnMouse) {
            self.detachFrom(self, '__updateDragInitX', 'width');
            self.detachFrom(self, '__updateDragInitY', 'height');
        }
        if (self.allowAbort) self.detachFrom(g.keys, '__watchForAbort', 'keyup');
        self.setIsDragging(false);
    },
    
    /** Repositions the view to the provided values. The default implementation
        is to directly set x and y. Subclasses should override this method
        when it is necessary to constrain the position.
        @param {number} x - the new x position.
        @param {number} y - the new y position.
        @returns {undefined} */
    requestDragPosition: function(x, y) {
        if (!this.disabled) {
            this.setX(x);
            this.setY(y);
        }
    }
});

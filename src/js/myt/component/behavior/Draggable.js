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
        this.isDraggable = this.isDragging = false;
        this.draggableAllowBubble = true;
        this.distanceBeforeDrag = this.dragOffsetX = this.dragOffsetY = 0;
        
        // Will be set after init since the draggable subview probably
        // doesn't exist yet.
        var isDraggable = true;
        if (attrs.isDraggable !== undefined) {
            isDraggable = attrs.isDraggable;
            delete attrs.isDraggable;
        }
        
        this.callSuper(parent, attrs);
        
        this.setIsDraggable(isDraggable);
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setIsDraggable: function(v) {
        if (this.isDraggable !== v) {
            this.isDraggable = v;
            // No event needed.
            
            var func;
            if (v) {
                func = this.attachToDom;
            } else if (this.inited) {
                func = this.detachFromDom;
            }
            
            if (func) {
                var dvs = this.getDragViews(), dragview, i = dvs.length;
                while (i) {
                    dragview = dvs[--i];
                    func.call(this, dragview, '__doMouseDown', 'mousedown');
                    func.call(this, dragview, '__doContextMenu', 'contextmenu');
                }
            }
        }
    },
    
    setIsDragging: function(v) {
        if (this.isDragging !== v) {
            this.isDragging = v;
            if (this.inited) this.fireNewEvent('isDragging', v);
        }
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
    
    /** @private */
    __doContextMenu: function(event) {
        // Do nothing so the context menu event is supressed.
    },
    
    /** @private */
    __doMouseDown: function(event) {
        var pos = myt.MouseObservable.getMouseFromEvent(event);
        this.dragInitX = pos.x - this.x;
        this.dragInitY = pos.y - this.y;
        
        var gm = myt.global.mouse;
        this.attachToDom(gm, '__doMouseUp', 'mouseup', true);
        if (this.distanceBeforeDrag > 0) {
            this.attachToDom(gm, '__doDragCheck', 'mousemove', true);
        } else {
            this.startDrag(event);
        }
        
        event.value.preventDefault();
        return this.draggableAllowBubble;
    },
    
    /** @private */
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
    
    /** @private */
    __watchForAbort: function(event) {
        if (event.value === 27) this.stopDrag(event, true);
    },
    
    /** @private */
    __doDragCheck: function(event) {
        var pos = myt.MouseObservable.getMouseFromEvent(event),
            distance = myt.Geometry.measureDistance(pos.x, pos.y, this.dragInitX + this.x, this.dragInitY + this.y);
        if (distance >= this.distanceBeforeDrag) {
            this.detachFromDom(myt.global.mouse, '__doDragCheck', 'mousemove', true);
            this.startDrag(event);
        }
    },
    
    /** Active until stopDrag is called. The view position will be bound
        to the mouse position. Subclasses typically call this onmousedown for
        subviews that allow dragging the view.
        @param event:event The event the mouse event when the drag started.
        @returns void */
    startDrag: function(event) {
        if (this.centerOnMouse) {
            this.syncTo(this, '__updateDragInitX', 'width');
            this.syncTo(this, '__updateDragInitY', 'height');
        }
        
        var g = myt.global;
        if (this.allowAbort) this.attachTo(g.keys, '__watchForAbort', 'keyup');
        
        this.setIsDragging(true);
        this.attachToDom(g.mouse, 'updateDrag', 'mousemove', true);
        this.updateDrag(event);
    },
    
    /** Called on every mousemove event while dragging.
        @returns void */
    updateDrag: function(event) {
        this.__lastMousePosition = myt.MouseObservable.getMouseFromEvent(event);
        this.__requestDragPosition();
    },
    
    /** @private */
    __updateDragInitX: function(event) {
        this.dragInitX = this.width / 2 * (this.scaleX || 1);
    },
    
    /** @private */
    __updateDragInitY: function(event) {
        this.dragInitY = this.height / 2 * (this.scaleY || 1);
    },
    
    /** @private */
    __requestDragPosition: function() {
        var pos = this.__lastMousePosition;
        this.requestDragPosition(
            pos.x - this.dragInitX + this.dragOffsetX, 
            pos.y - this.dragInitY + this.dragOffsetY
        );
    },
    
    /** Stop the drag. (see startDrag for more details)
        @param event:object The event that ended the drag.
        @param isAbort:boolean Indicates if the drag ended normally or was
            aborted.
        @returns void */
    stopDrag: function(event, isAbort) {
        var g = myt.global, gm = g.mouse;
        this.detachFromDom(gm, '__doMouseUp', 'mouseup', true);
        this.detachFromDom(gm, 'updateDrag', 'mousemove', true);
        if (this.centerOnMouse) {
            this.detachFrom(this, '__updateDragInitX', 'width');
            this.detachFrom(this, '__updateDragInitY', 'height');
        }
        if (this.allowAbort) this.detachFrom(g.keys, '__watchForAbort', 'keyup');
        this.setIsDragging(false);
    },
    
    /** Repositions the view to the provided values. The default implementation
        is to directly set x and y. Subclasses should override this method
        when it is necessary to constrain the position.
        @param x:number the new x position.
        @param y:number the new y position.
        @returns void */
    requestDragPosition: function(x, y) {
        if (!this.disabled) {
            this.setX(x);
            this.setY(y);
        }
    }
});

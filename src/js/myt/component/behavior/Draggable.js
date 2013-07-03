/** Makes a View draggable.
    
    Attributes:
        isDraggable: (boolean) Configures the view to be draggable or not. The 
            default value is true.
        distanceBeforeDrag: (number) The distance, in pixels, before a mouse down 
            and drag is considered a drag action.
        isDragging: (boolean) Indicates that this view is currently being dragged.
        _dragInitX: (number) Stores initial mouse x position during dragging.
        _dragInitY: (number) Stores initial mouse y position during dragging. */
myt.Draggable = new JS.Module('Draggable', {
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides */
    initNode: function(parent, attrs) {
        this.isDraggable = this.isDragging = false;
        this.distanceBeforeDrag = 2;
        
        if (attrs.isDraggable === undefined) attrs.isDraggable = true;
        
        this.callSuper(parent, attrs);
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setIsDraggable: function(v) {
        if (this.isDraggable === v) return;
        this.isDraggable = v;
        // No event needed.
        
        var func;
        if (v) {
            func = this.attachToDom;
        } else if (this.inited) {
            func = this.detachFromDom;
        }
        
        if (func) {
            var dvs = this.getDragViews(), i = dvs.length;
            while(i) func.call(this, dvs[--i], '__doMouseDown', 'mousedown');
        }
    },
    
    setIsDragging: function(v) {
        if (this.isDragging === v) return;
        this.isDragging = v;
        if (this.inited) this.fireNewEvent('isDragging', v);
    },
    
    setDistanceBeforeDrag: function(v) {
        this.distanceBeforeDrag = v;
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** @returns an array of views that can be moused down on to start the
        drag. Subclasses should override this to return an appropriate list
        of views. By default this view is returned thus making the entire
        view capable of starting a drag. */
    getDragViews: function() {
        return [this];
    },
    
    __doMouseDown: function(event) {
        var pos = myt.MouseObservable.getMouseFromEvent(event);
        this._dragInitX = pos.x - this.x;
        this._dragInitY = pos.y - this.y;
        
        var gm = myt.global.mouse;
        this.attachToDom(gm, '__doMouseUp', 'mouseup', true);
        this.attachToDom(gm, '__doDragCheck', 'mousemove', true);
        
        event.value.preventDefault();
        return true;
    },
    
    __doMouseUp: function(event) {
        if (this.isDragging) {
            this.stopDrag(event);
        } else {
            var gm = myt.global.mouse;
            this.detachFromDom(gm, '__doMouseUp', 'mouseup', true);
            this.detachFromDom(gm, '__doDragCheck', 'mousemove', true);
        }
        return true;
    },
    
    __doDragCheck: function(event) {
        var pos = myt.MouseObservable.getMouseFromEvent(event);
        var distance = myt.Geometry.measureDistance(pos.x, pos.y, this._dragInitX + this.x, this._dragInitY + this.y);
        if (distance >= this.distanceBeforeDrag) {
            this.detachFromDom(myt.global.mouse, '__doDragCheck', 'mousemove', true);
            this.startDrag();
        }
    },
    
    /** Active until stopDrag is called. The view position will be bound
        to the mouse position. Subclasses typically call this onmousedown for
        subviews that allow dragging the view.
        @returns void */
    startDrag: function() {
        this.setIsDragging(true);
        this.attachToDom(myt.global.mouse, '__updateDrag', 'mousemove', true);
        myt.global.dragManager.startDrag(this);
    },
    
    /** Called on every mousemove event while dragging.
        @returns void */
    __updateDrag: function(event) {
        var pos = myt.MouseObservable.getMouseFromEvent(event);
        this.requestDragPosition(pos.x - this._dragInitX, pos.y - this._dragInitY);
    },
    
    /** Stop the drag. (see startDrag for more details)
        @returns void */
    stopDrag: function(event) {
        var g = myt.global;
        g.dragManager.stopDrag(event);
        var gm = g.mouse;
        this.detachFromDom(gm, '__doMouseUp', 'mouseup', true);
        this.detachFromDom(gm, '__updateDrag', 'mousemove', true);
        this.setIsDragging(false);
    },
    
    /** Repositions the view to the provided values. The default implementation
        is to directly set x and y. Subclasses should override this method
        when it is necessary to constrain the position.
        @param x:number the new x position.
        @param y:number the new y position.
        @returns void */
    requestDragPosition: function(x, y) {
        this.setX(x);
        this.setY(y);
    }
});

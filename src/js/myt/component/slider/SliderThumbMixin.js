/** Provides Slider thumb functionality. */
myt.SliderThumbMixin = new JS.Module('SliderThumbMixin', {
    include: [myt.Draggable],
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides myt.Checkbox */
    initNode: function(parent, attrs) {
        if (attrs.width === undefined) attrs.width = parent.thumbWidth;
        if (attrs.height === undefined) attrs.height = parent.thumbHeight;
        
        this.callSuper(parent, attrs);
        
        if (parent.axis === 'x') {
            this.setY(parent.thumbOffset);
        } else {
            this.setX(parent.thumbOffset);
        }
        
        this.syncTo(parent, 'setDisabled', 'disabled');
        
        parent._syncThumbToValue(this);
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setDisabled: function(v) {
        // Adapt to event from syncTo
        if (typeof v === 'object') v = v.value;
        
        this.callSuper(v);
    },
    
    setFocused: function(v) {
        this.callSuper(v);
        if (v) this.setStyleProperty('zIndex', this.parent.getHighestZIndex() + 1);
    },
    
    setX: function(v) {
        if (this.x === v) return;
        this.callSuper(v);
        
        var parent = this.parent;
        if (parent.axis === 'x') {
            parent._lockSync = true;
            parent._syncValueToThumb(this);
            parent._lockSync = false;
        }
    },
    
    setY: function(v) {
        if (this.y === v) return;
        this.callSuper(v);
        
        var parent = this.parent;
        if (parent.axis === 'y') {
            parent._lockSync = true;
            parent._syncValueToThumb(this);
            parent._lockSync = false;
        }
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    requestDragPosition: function(x, y) {
        if (this.disabled) return;
        
        var parent = this.parent;
        
        var minPx = parent.getMinPixelValueForThumb(this);
        var maxPx = parent.getMaxPixelValueForThumb(this);
        if (parent.axis === 'x') {
            var halfWidth = this.width / 2;
            this.setX(Math.min(Math.max(x, minPx - halfWidth), maxPx - halfWidth));
        } else {
            var halfHeight = this.height / 2;
            this.setY(Math.min(Math.max(y, minPx - halfHeight), maxPx - halfHeight));
        }
    },
    
    __handleKeyDown: function(event) {
        var parent = this.parent;
        
        if (!this.disabled) {
            switch (myt.KeyObservable.getKeyCodeFromEvent(event)) {
                case 37: // Left
                    parent.nudgeValueLeft(this);
                    break;
                case 38: // Up
                    parent.nudgeValueUp(this);
                    break;
                case 39: // Right
                    parent.nudgeValueRight(this);
                    break;
                case 40: // Down
                    parent.nudgeValueDown(this);
                    break;
            }
        }
        
        this.callSuper(event);
    }
});

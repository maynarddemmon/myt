/** Provides a 'mouseDown' attribute that tracks mouse up/down state.
    
    Requires: myt.MouseOver, myt.Disableable, myt.MouseObservable super mixins.
    
    Suggested: myt.UpdateableUI and myt.Activateable super mixins.
    
    Events:
        None
    
    Attributes:
        mouseDown:boolean Indicates if the mouse is down or not. */
myt.MouseDown = new JS.Module('MouseDown', {
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides */
    initNode: function(parent, attrs) {
        if (attrs.mouseDown == null) attrs.mouseDown = false;
        
        this.callSuper(parent, attrs);
        
        this.attachToDom(this, 'doMouseDown', 'mousedown');
        this.attachToDom(this, 'doMouseUp', 'mouseup');
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
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
        // When about to disable the view make sure mouseDown is not true. This 
        // helps prevent unwanted activation of a disabled view.
        if (v && this.mouseDown) this.setMouseDown(false);
        
        this.callSuper(v);
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** @overrides myt.MouseOver */
    doMouseOver: function(event) {
        this.callSuper(event);
        if (this.mouseDown) this.detachFromDom(myt.global.mouse, 'doMouseUp', 'mouseup', true);
    },
    
    /** @overrides myt.MouseOver */
    doMouseOut: function(event) {
        this.callSuper(event);
        
        // Wait for a mouse up anywhere if the user moves the mouse out of the
        // view while the mouse is still down. This allows the user to move
        // the mouse in and out of the view with the view still behaving 
        // as moused down.
        if (!this.disabled && this.mouseDown) this.attachToDom(myt.global.mouse, 'doMouseUp', 'mouseup', true);
    },
    
    /** Called when the mouse is down on this view. Subclasses must call super.
        @returns void */
    doMouseDown: function(event) {
        if (!this.disabled) this.setMouseDown(true);
    },
    
    /** Called when the mouse is up on this view. Subclasses must call super.
        @returns void */
    doMouseUp: function(event) {
        // Cleanup global mouse listener since the mouseUp occurred outside
        // the view.
        if (!this.mouseOver) this.detachFromDom(myt.global.mouse, 'doMouseUp', 'mouseup', true);
        
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
        @returns void */
    doMouseUpInside: function(event) {
        if (this.doActivated) this.doActivated();
    }
});

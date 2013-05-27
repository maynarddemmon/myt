/** Provides a 'mouseDown' attribute that tracks mouse up/down state.
    
    Requires: myt.Activateable, myt.MouseOver, myt.Disableable and 
        myt.MouseObservable super mixins.
    
    Attributes:
        mouseDown:boolean */
myt.MouseDown = new JS.Module('MouseDown', {
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides */
    initNode: function(parent, attrs) {
        if (attrs.mouseDown === undefined) attrs.mouseDown = false;
        
        this.callSuper(parent, attrs);
        
        this.attachToDom(this, 'doMouseDown', 'mousedown');
        this.attachToDom(this, 'doMouseUp', 'mouseup');
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setMouseDown: function(v) {
        if (this.mouseDown === v) return;
        this.mouseDown = v;
        // No event needed
        if (this.inited) {
            if (this.isFocusable()) this.focus(true);
            this.updateUI();
        }
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
        if (!this.disabled && this.mouseDown) {
            this.attachToDom(myt.global.mouse, 'doMouseUp', 'mouseup', true);
        }
    },
    
    /** Called when the mouse is down on this view. Subclasses must call super.
        @returns void */
    doMouseDown: function(event) {
        if (!this.disabled) this.setMouseDown(true);
    },
    
    /** Called when the mouse is up on this view. Subclasses must call super.
        @returns void */
    doMouseUp: function(event) {
        if (!this.mouseOver) this.detachFromDom(myt.global.mouse, 'doMouseUp', 'mouseup', true);
        
        if (!this.disabled && this.mouseDown) {
            this.setMouseDown(false);
            if (this.mouseOver) this.doMouseUpInside(event);
        }
    },
    
    /** Called when the mouse is up and we are still over the view. Executes
        the 'doActivated' method by default.
        @returns void */
    doMouseUpInside: function(event) {
        this.doActivated();
    }
});

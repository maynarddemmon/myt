/** Provides a 'mouseDown' attribute that tracks mouse up/down state.
    
    Requires MouseOver, Disableable and MouseObservable super mixins.
    
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
        if (this.inited) this.updateUI();
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** @overrides myt.MouseOver */
    doMouseOver: function(e) {
        this.callSuper(e);
        if (this.mouseDown) this.detachFromDom(myt.global.mouse, 'doMouseUp', 'mouseup', true);
    },
    
    /** @overrides myt.MouseOver */
    doMouseOut: function(e) {
        this.callSuper(e);
        if (!this.disabled && this.mouseDown) {
            this.attachToDom(myt.global.mouse, 'doMouseUp', 'mouseup', true);
        }
    },
    
    /** Called when the mouse is down on this view. Subclasses must call super.
        @returns void */
    doMouseDown: function(e) {
        if (!this.disabled) this.setMouseDown(true);
    },
    
    /** Called when the mouse is up on this view. Subclasses must call super.
        @returns void */
    doMouseUp: function(e) {
        if (!this.mouseOver) this.detachFromDom(myt.global.mouse, 'doMouseUp', 'mouseup', true);
        
        if (!this.disabled && this.mouseDown) {
            this.setMouseDown(false);
            if (this.mouseOver) this.doMouseUpInside(e);
        }
    },
    
    /** Called when the mouse is up and we are still over the view.
        @returns void */
    doMouseUpInside: function(e) {}
});

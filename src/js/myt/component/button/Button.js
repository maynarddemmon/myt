/** Provides button functionality to an myt.View. Most of the functionality 
    comes from the mixins included by this mixin. This mixin resolves issues 
    that arise when the various mixins are used together.
    
    By default myt.Button instances are focusable.
    
    Events:
        None
    
    Attributes:
        None
    
    Private Attributes:
        __restoreCursor:string The cursor to restore to when the button is
            no longer disabled.
*/
myt.Button = new JS.Module('Button', {
    include: [
        myt.Activateable, 
        myt.UpdateableUI, 
        myt.Disableable, 
        myt.MouseOverAndDown, 
        myt.KeyActivation
    ],
    
    
    // Class Methods and Attributes ////////////////////////////////////////////
    extend: {
        DEFAULT_FOCUS_SHADOW_PROPERTY_VALUE: [0, 0, 7, '#666666'],
        DEFAULT_DISABLED_OPACITY: 0.5
    },
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides */
    initNode: function(parent, attrs) {
        if (attrs.focusable == null) attrs.focusable = true;
        if (attrs.cursor == null) attrs.cursor = 'pointer';
        
        this.callSuper(parent, attrs);
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    /** @overrides myt.FocusObservable */
    setFocused: function(v) {
        var self = this,
            existing = self.focused;
        self.callSuper(v);
        if (self.inited && self.focused !== existing) self.updateUI();
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** @overrides myt.KeyActivation. */
    doActivationKeyDown: function(key, isRepeat) {
        // Prevent unnecessary UI updates when the activation key is repeating.
        if (!isRepeat) this.updateUI();
    },
    
    /** @overrides myt.KeyActivation. */
    doActivationKeyUp: function(key) {
        this.callSuper(key);
        this.updateUI();
    },
    
    /** @overrides myt.KeyActivation. */
    doActivationKeyAborted: function(key) {
        this.callSuper(key);
        this.updateUI();
    },
    
    /** @overrides myt.UpdateableUI. */
    updateUI: function() {
        var self = this;
        
        if (self.disabled) {
            // Remember the cursor to change back to, but don't re-remember
            // if we're already remembering one.
            if (self.__restoreCursor == null) self.__restoreCursor = self.cursor;
            self.setCursor('not-allowed');
            self.drawDisabledState();
        } else {
            var rc = self.__restoreCursor;
            if (rc) {
                self.setCursor(rc);
                self.__restoreCursor = null;
            }
            
            if (self.activateKeyDown !== -1 || self.mouseDown) {
                self.drawActiveState();
            } else if (self.focused) {
                self.drawFocusedState();
            } else if (self.mouseOver) {
                self.drawHoverState();
            } else {
                self.drawReadyState();
            }
        }
    },
    
    /** Draw the UI when the component is in the disabled state.
        @returns void */
    drawDisabledState: function() {
        // Subclasses to implement as needed.
    },
    
    /** Draw the UI when the component has focus. The default implementation
        calls drawHoverState.
        @returns void */
    drawFocusedState: function() {
        this.drawHoverState();
    },
    
    /** Draw the UI when the component is on the verge of being interacted 
        with. For mouse interactions this corresponds to the over state.
        @returns void */
    drawHoverState: function() {
        // Subclasses to implement as needed.
    },
    
    /** Draw the UI when the component has a pending activation. For mouse
        interactions this corresponds to the down state.
        @returns void */
    drawActiveState: function() {
        // Subclasses to implement as needed.
    },
    
    /** Draw the UI when the component is ready to be interacted with. For
        mouse interactions this corresponds to the enabled state when the
        mouse is not over the component.
        @returns void */
    drawReadyState: function() {
        // Subclasses to implement as needed.
    },
    
    /** @overrides myt.FocusObservable */
    showFocusEmbellishment: function() {
        this.hideDefaultFocusEmbellishment();
        this.setBoxShadow(myt.Button.DEFAULT_FOCUS_SHADOW_PROPERTY_VALUE);
    },
    
    /** @overrides myt.FocusObservable */
    hideFocusEmbellishment: function() {
        this.hideDefaultFocusEmbellishment();
        this.setBoxShadow();
    }
});

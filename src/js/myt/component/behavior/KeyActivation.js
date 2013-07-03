/** This mixin provides keyboard handling to "activate" the component when a 
    key is pressed down or up. By default, when a keyup event occurs for
    an activation key and this view is not disabled, the 'doActivated' method
    will get called.
    
    Requires: myt.Disableable, myt.KeyObservable and 
        myt.FocusObservable super mixins.
    
    Attributes:
        activateKeyDown:number the keycode of the activation key that is
            currently down. This will be -1 when no key is down.
*/
myt.KeyActivation = new JS.Module('KeyActivation', {
    // Class Methods and Attributes ////////////////////////////////////////////
    extend: {
        /** The default activation keys are enter (13) and spacebar (32). */
        DEFAULT_ACTIVATION_KEYS: [13,32]
    },
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides */
    initNode: function(parent, attrs) {
        this.activateKeyDown = -1;
        
        if (attrs.activationKeys === undefined) {
            attrs.activationKeys = myt.KeyActivation.DEFAULT_ACTIVATION_KEYS;
        }
        
        this.callSuper(parent, attrs);
        
        this.attachToDom(this, '__handleKeyDown', 'keydown');
        this.attachToDom(this, '__handleKeyPress', 'keypress');
        this.attachToDom(this, '__handleKeyUp', 'keyup');
        this.attachToDom(this, 'doDomBlur', 'blur');
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    /** Set the activation keys.
        @param v:array an array of keycodes. The values are not copied so
            modification of the array outside the scope of this object will
            effect behavior.
        @returns void */
    setActivationKeys: function(v) {
        if (this.activationKeys === v) return;
        this.activationKeys = v;
        // No event needed
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    __handleKeyDown: function(event) {
        if (this.disabled) return;
        
        if (this.activateKeyDown === -1) {
            var keyCode = myt.KeyObservable.getKeyCodeFromEvent(event),
                keys = this.activationKeys, i = keys.length;
            while (i) {
                if (keyCode === keys[--i]) {
                    this.activateKeyDown = keyCode;
                    this.doActivationKeyDown(keyCode);
                    event.value.preventDefault();
                    return;
                }
            }
        }
    },
    
    __handleKeyPress: function(event) {
        if (this.disabled) return;
        
        var keyCode = myt.KeyObservable.getKeyCodeFromEvent(event);
        if (this.activateKeyDown === keyCode) {
            var keys = this.activationKeys, i = keys.length;
            while (i) {
                if (keyCode === keys[--i]) {
                    event.value.preventDefault();
                    return;
                }
            }
        }
    },
    
    __handleKeyUp: function(event) {
        if (this.disabled) return;
        
        var keyCode = myt.KeyObservable.getKeyCodeFromEvent(event);
        if (this.activateKeyDown === keyCode) {
            var keys = this.activationKeys, i = keys.length;
            while (i) {
                if (keyCode === keys[--i]) {
                    this.activateKeyDown = -1;
                    this.doActivationKeyUp(keyCode);
                    event.value.preventDefault();
                    return;
                }
            }
        }
    },
    
    /** Called when a dom blur event occurs.
        @returns void */
    doDomBlur: function(event) {
        if (this.disabled) return;
        
        if (this.activateKeyDown !== -1) {
            var keyThatWasDown = this.activateKeyDown;
            this.activateKeyDown = -1;
            this.doActivationKeyAborted(keyThatWasDown);
        }
    },
    
    /** Called when an activation key is pressed down.
        @param key:number the keycode that is down.
        @returns void */
    doActivationKeyDown: function(key) {},
    
    /** Called when an activation key is release up. This executes the
        'doActivated' method by default. 
        @param key:number the keycode that is up.
        @returns void */
    doActivationKeyUp: function(key) {
        this.doActivated();
    },
    
    /** Called when focus is lost while an activation key is down.
        @param key:number the keycode that is down.
        @returns void */
    doActivationKeyAborted: function(key) {}
});

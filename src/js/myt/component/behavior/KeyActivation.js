/** Provides keyboard handling to "activate" the component when a key is 
    pressed down or released up. By default, when a keyup event occurs for
    an activation key and this view is not disabled, the 'doActivated' method
    will get called.
    
    Requires: myt.Activateable, myt.Disableable, myt.KeyObservable and 
        myt.FocusObservable super mixins.
    
    Events:
        None
    
    Attributes:
        activationKeys:array of chars The keys that when keyed down will
            activate this component. Note: The value is not copied so
            modification of the array outside the scope of this object will
            effect behavior.
        activateKeyDown:number the keycode of the activation key that is
            currently down. This will be -1 when no key is down.
        repeatKeyDown:boolean Indicates if doActivationKeyDown will be called
            for repeated keydown events or not. Defaults to false.
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
        const self = this;
        
        self.activateKeyDown = -1;
        
        if (attrs.activationKeys == null) attrs.activationKeys = myt.KeyActivation.DEFAULT_ACTIVATION_KEYS;
        
        self.callSuper(parent, attrs);
        
        self.attachToDom(self, '__handleKeyDown', 'keydown');
        self.attachToDom(self, '__handleKeyPress', 'keypress');
        self.attachToDom(self, '__handleKeyUp', 'keyup');
        self.attachToDom(self, '__doDomBlur', 'blur');
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setActivationKeys: function(v) {this.activationKeys = v;},
    setRepeatKeyDown: function(v) {this.repeatKeyDown = v;},
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** @private
        @param {!Object} event
        @returns {undefined} */
    __handleKeyDown: function(event) {
        if (!this.disabled) {
            if (this.activateKeyDown === -1 || this.repeatKeyDown) {
                const keyCode = myt.KeyObservable.getKeyCodeFromEvent(event),
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
            const keyCode = myt.KeyObservable.getKeyCodeFromEvent(event);
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
            const keyCode = myt.KeyObservable.getKeyCodeFromEvent(event);
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
    
    /** Called when an activation key is pressed down. Default implementation
        does nothing.
        @param key:number the keycode that is down.
        @param isRepeat:boolean Indicates if this is a key repeat event or not.
        @returns {undefined} */
    doActivationKeyDown: function(key, isRepeat) {
        // Subclasses to implement as needed.
    },
    
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
    doActivationKeyAborted: function(key) {
        // Subclasses to implement as needed.
    }
});

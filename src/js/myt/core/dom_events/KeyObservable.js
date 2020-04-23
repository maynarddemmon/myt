/** Generates Key Events and passes them on to one or more event observers.
    Requires myt.DomObservable as a super mixin. */
myt.KeyObservable = new JS.Module('KeyObservable', {
    // Class Methods and Attributes ////////////////////////////////////////////
    extend: {
        /** A map of supported key event types. */
        EVENT_TYPES:{
            keypress:true,
            keydown:true,
            keyup:true
        },
        
        /** The common key event that gets reused. */
        EVENT:{source:null, type:null, value:null},
        
        /** Gets the key code from the provided key event.
            @param {!Object} event
            @returns {number} The keycode from the event. */
        getKeyCodeFromEvent: function(event) {
            var domEvent = event.value, 
                keyCode = domEvent.keyCode;
            return keyCode || domEvent.charCode;
        }
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** @overrides myt.DomObservable */
    createDomMethodRef: function(domObserver, methodName, type) {
        return this.createStandardDomMethodRef(domObserver, methodName, type, myt.KeyObservable) || 
            this.callSuper(domObserver, methodName, type);
    }
});

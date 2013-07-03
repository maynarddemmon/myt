/** Generates Key Events and passes them on to one or more event observers.
    Requires myt.DomObservable as a super mixin. */
myt.KeyObservable = new JS.Module('KeyObservable', {
    // Class Methods and Attributes ////////////////////////////////////////////
    extend: {
        /** A map of supported key event types. */
        KEY_EVENT_TYPES:{
            keypress:true,
            keydown:true,
            keyup:true
        },
        
        /** The common key event that gets reused. */
        KEY_EVENT:{source:null, type:null, value:null},
        
        /** Gets the key code from the provided key event.
            @param event:event
            @returns number The keycode from the event. */
        getKeyCodeFromEvent: function(event) {
            var domEvent = event.value, keyCode = domEvent.keyCode;
            if (keyCode) {
                return keyCode;
            } else {
                return domEvent.charCode;
            }
        }
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** @overrides myt.DomObservable */
    createDomMethodRef: function(domObserver, methodName, type) {
        if (myt.KeyObservable.KEY_EVENT_TYPES[type]) {
            var self = this;
            return function(domEvent) {
                if (!domEvent) var domEvent = window.event;
                
                // Configure common key event.
                var event = myt.KeyObservable.KEY_EVENT;
                event.source = self;
                event.type = domEvent.type;
                event.value = domEvent;
                
                var allowBubble = domObserver[methodName](event);
                if (!allowBubble) {
                    domEvent.cancelBubble = true;
                    if (domEvent.stopPropagation) domEvent.stopPropagation();
                }
                
                event.source = undefined;
            };
        } else {
            return this.callSuper(domObserver, methodName, type);
        }
    }
});

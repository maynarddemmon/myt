/** Generates input events and passes them on to one or more event observers.
    Requires myt.DomObservable as a super mixin. */
myt.InputObservable = new JS.Module('InputObservable', {
    // Class Methods and Attributes ////////////////////////////////////////////
    extend: {
        /** A map of supported input event types. */
        INPUT_EVENT_TYPES:{
            input:true,
            select:true,
            change:true
        },
        
        /** The common change/select event that gets reused. */
        INPUT_EVENT:{source:null, type:null, value:null}
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** @overrides myt.DomObservable */
    createDomMethodRef: function(domObserver, methodName, type) {
        if (myt.InputObservable.INPUT_EVENT_TYPES[type]) {
            var self = this;
            return function(domEvent) {
                if (!domEvent) var domEvent = window.event;
                
                // Configure common input event.
                var event = myt.InputObservable.INPUT_EVENT;
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

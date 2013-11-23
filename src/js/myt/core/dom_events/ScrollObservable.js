/** Generates Scroll Events and passes them on to one or more event observers.
    Requires myt.DomObservable as a super mixin. */
myt.ScrollObservable = new JS.Module('ScrollObservable', {
    // Class Methods and Attributes ////////////////////////////////////////////
    extend: {
        /** The common scroll event that gets reused. */
        SCROLL_EVENT:{source:null, type:null, value:null},
        
        /** Gets the scrollLeft and scrollTop from the event.
            @param event:event
            @returns object with an x and y key each containing a number. */
        getScrollFromEvent: function(event) {
            var domEvent = event.value,
                target = domEvent.target || domEvent.srcElement;
            return {x: target.scrollLeft, y: target.scrollTop};
        }
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** @overrides myt.DomObservable */
    createDomMethodRef: function(domObserver, methodName, type) {
        if (type === 'scroll') {
            var self = this;
            return function(domEvent) {
                if (!domEvent) var domEvent = window.event;
                
                // Configure common key event.
                var event = myt.ScrollObservable.SCROLL_EVENT;
                event.source = self;
                event.type = domEvent.type;
                event.value = domEvent;
                
                var allowPropogation = domObserver[methodName](event);
                if (!allowPropogation) {
                    if (domEvent.stopPropagation) domEvent.stopPropagation();
                }
                
                event.source = undefined;
            };
        } else {
            return this.callSuper(domObserver, methodName, type);
        }
    }
});

/** Generates Scroll Events and passes them on to one or more event observers.
    Requires myt.DomObservable as a super mixin. */
myt.ScrollObservable = new JS.Module('ScrollObservable', {
    // Class Methods and Attributes ////////////////////////////////////////////
    extend: {
        /** A map of supported scroll event types. */
        EVENT_TYPES:{
            scroll:true
        },
        
        /** The common scroll event that gets reused. */
        EVENT:{source:null, type:null, value:null},
        
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
        return this.createStandardDomMethodRef(domObserver, methodName, type, myt.ScrollObservable) || 
            this.callSuper(domObserver, methodName, type);
    }
});

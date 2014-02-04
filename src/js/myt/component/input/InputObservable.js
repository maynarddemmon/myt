/** Generates input events and passes them on to one or more event observers.
    Requires myt.DomObservable as a super mixin. */
myt.InputObservable = new JS.Module('InputObservable', {
    // Class Methods and Attributes ////////////////////////////////////////////
    extend: {
        /** A map of supported input event types. */
        EVENT_TYPES:{
            input:true,
            select:true,
            change:true
        },
        
        /** The common change/select event that gets reused. */
        EVENT:{source:null, type:null, value:null}
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** @overrides myt.DomObservable */
    createDomMethodRef: function(domObserver, methodName, type) {
        return this.createStandardDomMethodRef(domObserver, methodName, type, myt.InputObservable) || 
            this.callSuper(domObserver, methodName, type);
    }
});

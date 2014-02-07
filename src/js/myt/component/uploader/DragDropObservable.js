/** Generates drag and drop events and passes them on to one or more event 
    observers.
    Requires myt.DomObservable as a super mixin. */
myt.DragDropObservable = new JS.Module('DragDropObservable', {
    // Class Methods and Attributes ////////////////////////////////////////////
    extend: {
        /** A map of supported drag and drop event types. */
        EVENT_TYPES:{
            dragleave:true,
            dragenter:true,
            dragover:true,
            drop:true
        },
        
        /** The common drag and drop event that gets reused. */
        EVENT:{source:null, type:null, value:null}
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** @overrides myt.DomObservable */
    createDomMethodRef: function(domObserver, methodName, type) {
        return this.createStandardDomMethodRef(domObserver, methodName, type, myt.DragDropObservable, true) || 
            this.callSuper(domObserver, methodName, type);
    }
});

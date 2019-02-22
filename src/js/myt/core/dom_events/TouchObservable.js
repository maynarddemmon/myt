/** Generates Touch Events and passes them on to one or more event observers.
    
    Requires: myt.DomObservable super mixin.
*/
myt.TouchObservable = new JS.Module('TouchObservable', {
    // Class Methods and Attributes ////////////////////////////////////////////
    extend: {
        /** A map of supported touch event types. */
        EVENT_TYPES:{
            touchstart:true,
            touchend:true,
            touchmove:true,
            touchcancel:true
        },
        
        /** The common touch event that gets reused. */
        EVENT:{source:null, type:null, value:null}
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** @overrides myt.DomObservable */
    createDomMethodRef: function(domObserver, methodName, type) {
        return this.createStandardDomMethodRef(domObserver, methodName, type, myt.TouchObservable, false) || 
            this.callSuper(domObserver, methodName, type);
    }
});

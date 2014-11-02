/** Generates Mouse Events and passes them on to one or more event observers.
    Also provides the capability to capture contextmenu events and mouse
    wheel events.
    
    Requires: myt.DomObservable super mixin.
*/
myt.MouseObservable = new JS.Module('MouseObservable', {
    // Class Methods and Attributes ////////////////////////////////////////////
    extend: {
        /** A map of supported mouse event types. */
        EVENT_TYPES:{
            mouseover:true,
            mouseout:true,
            mousedown:true,
            mouseup:true,
            click:true,
            dblclick:true,
            mousemove:true,
            contextmenu:true,
            wheel:true
        },
        
        /** The common mouse event that gets reused. */
        EVENT:{source:null, type:null, value:null},
        
        /** Gets the mouse coordinates from the provided event.
            @param event
            @returns object: An object with 'x' and 'y' keys containing the
                x and y mouse position. */
        getMouseFromEvent: function(event) {
            var domEvent = event.value;
            return {x:domEvent.pageX, y:domEvent.pageY};
        },
        
        getMouseFromEventRelativeToView: function(event, view) {
            var viewPos = view.getPagePosition(),
                pos = this.getMouseFromEvent(event);
            pos.x -= viewPos.x;
            pos.y -= viewPos.y;
            return pos;
        }
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** @overrides myt.DomObservable */
    createDomMethodRef: function(domObserver, methodName, type) {
        return this.createStandardDomMethodRef(domObserver, methodName, type, myt.MouseObservable, true) || 
            this.callSuper(domObserver, methodName, type);
    }
});

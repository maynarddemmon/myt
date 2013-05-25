/** Generates Mouse Events and passes them on to one or more event observers.
    Requires myt.DomObservable as a super mixin. */
myt.MouseObservable = new JS.Module('MouseObservable', {
    // Class Methods and Attributes ////////////////////////////////////////////
    extend: {
        /** A map of supported mouse event types. */
        MOUSE_EVENT_TYPES:{
            mouseover:true,
            mouseout:true,
            mousedown:true,
            mouseup:true,
            click:true,
            dblclick:true,
            mousemove:true
        },
        
        /** The common mouse event that gets reused. */
        MOUSE_EVENT:{source:null, type:null, value:null},
        
        /** Gets the mouse coordinate(s) from the provided event.
            @param event
            @param coord:String (Optional) the coordinate to get. 'x', 'y' or 
                'both'. If not provided, 'both' is assumed.
            @returns number or object with 'x' and 'y' keys if 'both' 
                was provided. */
        getMouseFromEvent: function(event, coord) {
            var domEvent = event.value;
            if (coord === 'x') {
                return domEvent.pageX;
            } else if (coord === 'y') {
                return domEvent.pageY;
            } else {
                return {x:domEvent.pageX, y:domEvent.pageY};
            }
        }
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** @overrides myt.DomObservable */
    createDomMethodRef: function(domObserver, methodName, type) {
        if (myt.MouseObservable.MOUSE_EVENT_TYPES[type]) {
            var self = this;
            return function(e) {
                if (!domEvent) var domEvent = window.event;
                
                // Configure common mouse event.
                var event = myt.MouseObservable.MOUSE_EVENT;
                event.source = self;
                event.type = domEvent.type;
                event.value = domEvent;
                
                var allowBubble = domObserver[methodName](event);
                if (!allowBubble) {
                    domEvent.cancelBubble = true;
                    if (domEvent.stopPropagation) domEvent.stopPropagation();
                    
                    // Also prevent default behavior
                    domEvent.preventDefault();
                }
                
                event.source = undefined;
            };
        } else {
            return this.callSuper(domObserver, methodName, type);
        }
    }
});

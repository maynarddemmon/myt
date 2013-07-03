/** Provides global drag and drop functionality.
    
    Events:
        startDrag:object Fired when a drag starts. Value is the object
            being dragged.
        stopDrag:object Fired when a drag ends to the topmost view under the
            mouse that is registered for a stopDrag event. Value is the object 
            that is no longer being dragged.
*/
// TODO: this is very bound up with mouse events. Should find a way to make it
// more flexible.
new JS.Singleton('GlobalDragManager', {
    include: [myt.Observable],
    
    
    // Constructor /////////////////////////////////////////////////////////////
    initialize: function() {
        myt.global.register('dragManager', this);
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** Called by a myt.Draggable when a drag starts. */
    startDrag: function(payload) {
        if (this.payloadStack === undefined) this.payloadStack = [];
        this.payloadStack.push(payload);
        this.fireNewEvent('startDrag', payload);
    },
    
    /** Called by a myt.Draggable when a drag stops.
        @param evt:event the mouse event that triggered the stop drag.
        @returns void */
    stopDrag: function(e) {
        var targets = this.getViewUnderMouse(e);
        this.fireNewEvent('stopDrag', this.payloadStack.pop(), targets);
    },
    
    /** Gets an array containing the frontmost observer that is registered for 
        stopDrag events and is under the current mouse location.
        @param event:event the mouse event to search with.
        @returns array where index 0 is the method to call and index 1 is
            the observer. This array is suitable to be passed into the
            'fireNewEvent' method of an Observable. */
    getViewUnderMouse: function(event) {
        var observersUnderMouse = [];
        
        var domMouseEvent = event.value,
            mouseX = domMouseEvent.pageX,
            mouseY = domMouseEvent.pageY,
            observers = this.getObservers('stopDrag'),
            observer, prevObserver;
        for (var i = 0, len = observers.length; len > i; i += 2) {
            observer = observers[i + 1];
            if (observer.containsPoint(mouseX, mouseY)) {
                if (!prevObserver || observer.isInFrontOf(prevObserver)) {
                    observersUnderMouse[0] = observers[i];
                    observersUnderMouse[1] = observer;
                    prevObserver = observer;
                }
            }
        }
        
        return observersUnderMouse;
    }
});

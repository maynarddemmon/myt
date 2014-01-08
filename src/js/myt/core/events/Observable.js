/** Apply this mixin to any Object that needs to fire events.
    
    Attributes:
        None
    
    Private Attributes:
        __observersByType: (Object) Stores arrays of observers and method names 
            by Event type
        __activeEventTypes: (Object) Stores event types that have currently 
            been fired from this Observable. If an event type is "active" it 
            will not be fired again. This provides protection against infinite 
            event loops. */
myt.Observable = new JS.Module('Observable', {
    // Methods /////////////////////////////////////////////////////////////////
    /** Adds the provided observer to the list of event recipients for the 
        provided event type.
        @returns boolean true if the observer was successfully attached, 
            false otherwise. */
    attachObserver: function(observer, methodName, type) {
        if (observer && methodName && type) {
            this.getObservers(type).push(methodName, observer);
            return true;
        }
        return false;
    },
    
    /** Removes the provided observer from the list of observers for
        the provided Event type.
        @returns boolean true if the observer was successfully detached, 
            false otherwise. */
    detachObserver: function(observer, methodName, type) {
        if (observer && methodName && type) {
            var observersByType = this.__observersByType;
            if (observersByType) {
                var observers = observersByType[type];
                if (observers) {
                    // Remove all instances of the observer and methodName 
                    // combination.
                    var retval = false, i = observers.length;
                    while (i) {
                        // Ensures we decrement twice. First with --i, then 
                        // with i-- since the part after && may not be executed.
                        --i;
                        if (observer === observers[i--] && methodName === observers[i]) {
                            observers.splice(i, 2); // <- Detach Activity that detachAllObservers cares about.
                            retval = true;
                        }
                    }
                    return retval;
                }
            }
        }
        return false;
    },
    
    /** Removes all observers from this Observable.
        @returns void */
    detachAllObservers: function() {
        var observersByType = this.__observersByType;
        if (observersByType) {
            var observers, observer, methodName, i, type;
            for (type in observersByType) {
                observers = observersByType[type];
                i = observers.length;
                while (i) {
                    observer = observers[--i];
                    methodName = observers[--i];
                    
                    // If an observer is registered more than once the list may 
                    // get shortened by observer.detachFrom. If so, just 
                    // continue decrementing downwards.
                    if (observer == null || methodName == null) continue;
                    
                    if (typeof observer.detachFrom !== 'function' || 
                        !observer.detachFrom(this, methodName, type)
                    ) {
                        // Observer may not have a detachFrom function or 
                        // observer may not have attached via Observer.attachTo
                        // so do default detach activity as implemented in 
                        // Observable.detachObserver
                        observers.splice(i, 2);
                    }
                }
            }
        }
    },
    
    /** Gets an array of observers and method names for the provided type.
        The array is structured as:
            [methodName1, observerObj1, methodName2, observerObj2,...].
        @returns an array of observers. */
    getObservers: function(type) {
        // Lazy instantiate observers array.
        var observersByType = this.__observersByType;
        if (!observersByType) observersByType = this.__observersByType = {};
        var observers = observersByType[type];
        if (!observers) observers = observersByType[type] = [];
        return observers;
    },
    
    /** Checks if any observers exist for the provided event type.
        @returns true if any exist, false otherwise. */
    hasObservers: function(type) {
        var observersByType = this.__observersByType;
        if (!observersByType) return false;
        var observers = observersByType[type];
        return observers && observers.length > 0;
    },
    
    /** Sends the provided Event to all observers for the provided event's type.
        The named method is called on each observer in the order they were 
        registered. If the called method returns true the Event is considerd 
        "consumed" and will not be sent to any other observers. Consuming an 
        event should be used when more than one observer may be listening for 
        an Event but only one observer needs to handle the Event.
        @param event: the event to fire.
        @param observers:array (Optional) if provided the event will
            be sent to this specific list of observers and no others.
        @return void */
    fireEvent: function(event, observers) {
        if (event && event.source === this) {
            observers = this.__determineObservers(event.type, observers);
            if (observers) this.__fireEvent(event, observers);
        }
    },
    
    /** Generates a new event from the provided type and value and fires it
        to the provided observers or the registered observers.
        @param type:String the event type to fire.
        @param value:* the value to set on the event.
        @param observers:array (Optional) if provided the event will
            be sent to this specific list of observers and no others.
        @returns void */
    fireNewEvent: function(type, value, observers) {
        observers = this.__determineObservers(type, observers);
        if (observers) this.__fireEvent(this.createEvent(type, value), observers);
    },
    
    /** Private method to determine which array of observers to use.
        @return array or null if no suitable observers exist. */
    __determineObservers: function(type, observers) {
        if (observers) {
            return observers;
        } else if (this.hasObservers(type)) {
            return this.__observersByType[type];
        }
        return null;
    },
    
    /** Creates a new event with the provided type and value and using this
        Observable as the source.
        @param type:string the event type.
        @param value:* the event value.
        @returns an event object consisting of source, type and value. */
    createEvent: function(type, value) {
        return {source:this, type:type, value:value};
    },
    
    /** Private method to actually fire the event.
        @param event:Object the event to fire.
        @param observers:array an array of method names and contexts to invoke
            providing the event as the sole argument.
        @returns void */
    __fireEvent: function(event, observers) {
        var type = event.type;
        
        // Prevent "active" events from being fired again
        var activeEventTypes = this.__activeEventTypes;
        if (!activeEventTypes) activeEventTypes = this.__activeEventTypes = {};
        if (activeEventTypes[type] === true) {
            myt.dumpStack("Attempt to refire active event: " + type);
            return;
        }
        
        // Mark event type as "active"
        activeEventTypes[type] = true;
        
        // Walk through observers backwards so that if the observer is
        // detached by the event handler the index won't get messed up.
        // FIXME: If necessary we could queue up detachObserver calls that 
        // come in during iteration or make some sort of adjustment to 'i'.
        var i = observers.length, observer, methodName;
        while (i) {
            observer = observers[--i]
            methodName = observers[--i];
            
            // Sometimes the list gets shortened by the method we called so
            // just continue decrementing downwards.
            if (observer == null || methodName == null) continue;
            
            // Stop firing the event if it was "consumed".
            try {
                if (typeof methodName === 'function') {
                    if (methodName.call(observer, event)) break;
                } else {
                    if (observer[methodName](event)) break;
                }
            } catch (err) {
                myt.dumpStack(err);
            }
        }
        
        // Mark event type as "inactive"
        activeEventTypes[type] = false;
    }
});

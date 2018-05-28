/** Apply this mixin to any Object that needs to fire events.
    
    Attributes:
        None
    
    Private Attributes:
        __obsbt:object Stores arrays of myt.Observers and method names 
            by event type
        __aet:object Stores active event type strings. An event type is active
            if it has been fired from this Observable as part of the current 
            call stack. If an event type is "active" it will not be fired 
            again. This provides protection against infinite event loops.
*/
myt.Observable = new JS.Module('Observable', {
    // Methods /////////////////////////////////////////////////////////////////
    /** Adds the observer to the list of event recipients for the event type.
        @param observer:myt.Observer The observer that will observe this
            observable. If methodName is a function this object will be the
            context for the function when it is called.
        @param methodName:string|function The name of the method to call, or
            a function, on the observer when the event fires.
        @param type:string The name of the event the observer will listen to.
        @returns boolean true if the observer was successfully attached, 
            false otherwise. */
    attachObserver: function(observer, methodName, type) {
        if (observer && methodName && type) {
            this.getObservers(type).push(methodName, observer);
            return true;
        }
        return false;
    },
    
    /** Removes the observer from the list of observers for the event type.
        @param observer:myt.Observer The observer that will no longer be
            observing this observable.
        @param methodName:string|function The name of the method that was
            to be called or the function to be called.
        @param type:string The name of the event the observer will no longer
            be listening to.
        @returns boolean true if the observer was successfully detached, 
            false otherwise. */
    detachObserver: function(observer, methodName, type) {
        if (observer && methodName && type) {
            var observersByType = this.__obsbt;
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
        var observersByType = this.__obsbt;
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
                    if (observer && methodName) {
                        if (typeof observer.detachFrom !== 'function' || 
                            !observer.detachFrom(this, methodName, type)
                        ) {
                            // Observer may not have a detachFrom function or 
                            // observer may not have attached via 
                            // Observer.attachTo so do default detach activity 
                            // as implemented in Observable.detachObserver
                            observers.splice(i, 2);
                        }
                    }
                }
            }
        }
    },
    
    /** Gets an array of observers and method names for the provided type.
        The array is structured as:
            [methodName1, observerObj1, methodName2, observerObj2,...].
        @param type:string The name of the event to get observers for.
        @returns array: The observers of the event. */
    getObservers: function(type) {
        var observersByType = this.__obsbt || (this.__obsbt = {});
        return observersByType[type] || (observersByType[type] = []);
    },
    
    /** Checks if any observers exist for the provided event type.
        @param type:string The name of the event to check.
        @returns boolean: True if any exist, false otherwise. */
    hasObservers: function(type) {
        var observersByType = this.__obsbt;
        if (!observersByType) return false;
        var observers = observersByType[type];
        return observers && observers.length > 0;
    },
    
    /** Creates a new event with the type and value and using this as 
        the source.
        @param type:string The event type.
        @param value:* The event value.
        @returns An event object consisting of source, type and value. */
    createEvent: function(type, value) {
        return {source:this, type:type, value:value}; // Inlined in this.fireEvent
    },
    
    /** Generates a new event from the provided type and value and fires it
        to the provided observers or the registered observers.
        @param type:string The event type to fire.
        @param value:* The value to set on the event.
        @param observers:array (Optional) If provided the event will
            be sent to this specific list of observers and no others.
        @returns void */
    fireEvent: function(type, value, observers) {
        // Determine observers to use
        var self = this;
        observers = observers || (self.hasObservers(type) ? self.__obsbt[type] : null);
        
        // Fire event
        if (observers) {
            // Prevent "active" events from being fired again
            var event = {source:self, type:type, value:value}, // Inlined from this.createEvent
                activeEventTypes = self.__aet || (self.__aet = {});
            if (activeEventTypes[type] === true) {
                myt.global.error.notifyError('eventLoop', "Attempt to refire active event: " + type);
            } else {
                // Mark event type as "active"
                activeEventTypes[type] = true;
                
                // Walk through observers backwards so that if the observer is
                // detached by the event handler the index won't get messed up.
                // FIXME: If necessary we could queue up detachObserver calls that 
                // come in during iteration or make some sort of adjustment to 'i'.
                var i = observers.length,
                    observer,
                    methodName;
                while (i) {
                    observer = observers[--i];
                    methodName = observers[--i];
                    
                    // Sometimes the list gets shortened by the method we called so
                    // just continue decrementing downwards.
                    if (observer && methodName) {
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
                }
                
                // Mark event type as "inactive"
                activeEventTypes[type] = false;
            }
        }
    }
});

/** Generates Dom Events and passes them on to one or more event observers.
    Requires myt.DomElementProxy be included when this mixin is included.
    
    Events:
        None
    
    Attributes:
        None
    
    Private Attributes:
        __dobsbt:object Stores arrays of myt.DomObservers and method names 
            by event type.
*/
myt.DomObservable = new JS.Module('DomObservable', {
    // Methods /////////////////////////////////////////////////////////////////
    /** Adds the observer to the list of event recipients for the event type.
        @param domObserver:myt.DomObserver The observer that will be notified
            when a dom event occurs.
        @param methodName:string The method name to call on the dom observer.
        @param type:string The type of dom event to register for.
        @param capture:boolean (optional) Indicates if the event registration
            is during capture or bubble phase. Defaults to false, bubble phase.
        @returns boolean True if the observer was successfully registered, 
            false otherwise.*/
    attachDomObserver: function(domObserver, methodName, type, capture, passive) {
        if (domObserver && methodName && type) {
            capture = !!capture;
            
            var methodRef = this.createDomMethodRef(domObserver, methodName, type);
            if (methodRef) {
                var domObserversByType = this.__dobsbt || (this.__dobsbt = {});
                
                // Lazy instantiate dom observers array for type and insert observer.
                var domObservers = domObserversByType[type];
                if (!domObservers) {
                    // Create list with observer
                    domObserversByType[type] = [domObserver, methodName, methodRef, capture];
                } else {
                    // Add dom observer to the end of the list
                    domObservers.push(domObserver, methodName, methodRef, capture);
                }
                
                myt.addEventListener(this.getInnerDomElement(), type, methodRef, capture, passive);
                
                return true;
            }
        }
        return false;
    },
    
    /** Creates a function that will handle the dom event when it is fired
        by the browser. Must be implemented by the object this mixin is 
        applied to.
        @param domObserver:myt.DomObserver the observer that must be notified
            when the dom event fires.
        @param methodName:string the name of the function to pass the event to.
        @param type:string the type of the event to fire.
        @returns a function to handle the dom event or null if the event
            is not supported. */
    createDomMethodRef: (domObserver, methodName, type) => null,
    
    /** Used by the createDomMethodRef implementations of submixins of 
        myt.DomObservable to implement the standard methodRef.
        @param domObserver:myt.DomObserver the observer that must be notified
            when the dom event fires.
        @param methodName:string the name of the function to pass the event to.
        @param type:string the type of the event to fire.
        @param observableClass:JS.Class The class that has the common event.
        @param preventDefault:boolean (Optional) If true the default behavior
            of the domEvent will be prevented.
        @returns a function to handle the dom event or undefined if the event
            will not be handled. */
    createStandardDomMethodRef: function(domObserver, methodName, type, observableClass, preventDefault) {
        if (observableClass.EVENT_TYPES[type]) {
            var self = this, 
                event = observableClass.EVENT;
            return (domEvent) => {
                if (!domEvent) var domEvent = window.event;
                
                event.source = self;
                event.type = domEvent.type;
                event.value = domEvent;
                
                var allowBubble = domObserver[methodName](event);
                if (!allowBubble) {
                    domEvent.cancelBubble = true;
                    if (domEvent.stopPropagation) domEvent.stopPropagation();
                    
                    if (preventDefault) domEvent.preventDefault();
                }
                
                event.source = undefined;
            };
        }
    },
    
    /** Removes the observer from the list of dom observers for the event type.
        @param domObserver:myt.DomObserver The dom observer to unregister.
        @param methodName:string The method name to unregister for.
        @param type:string The dom event type to unregister for.
        @param capture:boolean (optional) The event phase to unregister for.
            Defaults to false if not provided.
        @returns boolean True if the observer was successfully unregistered, 
            false otherwise.*/
    detachDomObserver: function(domObserver, methodName, type, capture) {
        if (domObserver && methodName && type) {
            capture = !!capture;
            
            var domObserversByType = this.__dobsbt;
            if (domObserversByType) {
                var domObservers = domObserversByType[type];
                if (domObservers) {
                    // Remove dom observer
                    var retval = false, 
                        domElement = this.getInnerDomElement(), 
                        i = domObservers.length;
                    while (i) {
                        i -= 4;
                        if (domObserver === domObservers[i] && 
                            methodName === domObservers[i + 1] && 
                            capture === domObservers[i + 3]
                        ) {
                            if (domElement) myt.removeEventListener(domElement, type, domObservers[i + 2], capture);
                            domObservers.splice(i, 4);
                            retval = true;
                        }
                    }
                    return retval;
                }
            }
        }
        return false;
    },
    
    /** Detaches all dom observers from this DomObservable.
        @returns void */
    detachAllDomObservers: function() {
        var domElement = this.getInnerDomElement();
        if (domElement) {
            var domObserversByType = this.__dobsbt;
            if (domObserversByType) {
                var domObservers, methodRef, capture, i, type;
                for (type in domObserversByType) {
                    domObservers = domObserversByType[type];
                    i = domObservers.length;
                    while (i) {
                        capture = domObservers[--i];
                        methodRef = domObservers[--i];
                        i -= 2; // methodName and domObserver
                        myt.removeEventListener(domElement, type, methodRef, capture);
                    }
                    domObservers.length = 0;
                }
            }
        }
    }
});

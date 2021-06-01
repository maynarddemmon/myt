/** Generates Dom Events and passes them on to one or more event observers.
    Requires myt.DomElementProxy be included when this mixin is included.
    
    Events:
        None
    
    Attributes:
        None
    
    Private Attributes:
        __dobsbt:object Stores arrays of myt.DomObservers and method names 
            by event type.
    
    @class */
myt.DomObservable = new JS.Module('DomObservable', {
    // Methods /////////////////////////////////////////////////////////////////
    /** Adds the observer to the list of event recipients for the event type.
        @param {!Object} domObserver - The myt.DomObserver that will be notified
            when a dom event occurs.
        @param {string} methodName - The method name to call on the dom observer.
        @param {string} type - The type of dom event to register for.
        @param {boolean} [capture] - Indicates if the event registration
            is during capture or bubble phase. Defaults to false, bubble phase.
        @param {boolean} [passive]
        @returns {boolean} - True if the observer was successfully registered, 
            false otherwise.*/
    attachDomObserver: function(domObserver, methodName, type, capture, passive) {
        if (domObserver && methodName && type) {
            capture = !!capture;
            
            const methodRef = this.createDomMethodRef(domObserver, methodName, type);
            if (methodRef) {
                const domObserversByType = this.__dobsbt || (this.__dobsbt = {});
                
                // Lazy instantiate dom observers array for type and insert observer.
                const domObservers = domObserversByType[type];
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
        @param {!Object} domObserver - The myt.DomObserver that must be notified
            when the dom event fires.
        @param {string} methodName - the name of the function to pass the event to.
        @param {string} type - the type of the event to fire.
        @returns {?Function} - A function to handle the dom event or null if 
            the event is not supported. */
    createDomMethodRef: (domObserver, methodName, type) => null,
    
    /** Used by the createDomMethodRef implementations of submixins of 
        myt.DomObservable to implement the standard methodRef.
        @param {!Object} domObserver - The myt.DomObserver that must be notified
            when the dom event fires.
        @param {string} methodName - The name of the function to pass the event to.
        @param {string} type - The type of the event to fire.
        @param {!Function} observableClass - The JS.Class that has the common event.
        @param {boolean} [preventDefault] - If true the default behavior
            of the domEvent will be prevented.
        @returns {?Function} - A function to handle the dom event or undefined 
            if the event will not be handled. */
    createStandardDomMethodRef: function(domObserver, methodName, type, observableClass, preventDefault) {
        if (observableClass.EVENT_TYPES[type]) {
            const self = this, 
                event = observableClass.EVENT;
            return (domEvent) => {
                if (!domEvent) domEvent = window.event;
                
                event.source = self;
                event.type = domEvent.type;
                event.value = domEvent;
                
                const allowBubble = domObserver[methodName](event);
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
        @param {!Object} domObserver - The myt.DomObserver to unregister.
        @param {string} methodName - The method name to unregister for.
        @param {string} type - The dom event type to unregister for.
        @param {boolean} [capture] - The event phase to unregister for.
            Defaults to false if not provided.
        @returns {boolean} - True if the observer was successfully unregistered, 
            false otherwise.*/
    detachDomObserver: function(domObserver, methodName, type, capture) {
        if (domObserver && methodName && type) {
            capture = !!capture;
            
            const domObserversByType = this.__dobsbt;
            if (domObserversByType) {
                const domObservers = domObserversByType[type];
                if (domObservers) {
                    // Remove dom observer
                    const domElement = this.getInnerDomElement();
                    let retval = false,  
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
        @returns {undefined} */
    detachAllDomObservers: function() {
        const domElement = this.getInnerDomElement();
        if (domElement) {
            const domObserversByType = this.__dobsbt;
            if (domObserversByType) {
                for (const type in domObserversByType) {
                    const domObservers = domObserversByType[type];
                    let i = domObservers.length;
                    while (i) {
                        const capture = domObservers[--i],
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

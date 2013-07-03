/** Generates Dom Events and passes them on to one or more event observers.
    Requires DomElementProxy be included when this mixin is included.
    
    Attributes:
        __domObserversByType: (Object) Stores arrays of dom observers and 
            method names by event type */
myt.DomObservable = new JS.Module('DomObservable', {
    // Methods /////////////////////////////////////////////////////////////////
    /** Adds the observer to the list of event recipients for the event type. 
        @returns boolean True if the observer was successfully registered, 
            false otherwise.*/
    attachDomObserver: function(domObserver, methodName, type, capture) {
        if (!domObserver || !methodName || !type) return false;
        capture = !!capture;
        
        var methodRef = this.createDomMethodRef(domObserver, methodName, type);
        if (!methodRef) return false;
        
        // Lazy instantiate __domObserversByType map.
        var domObserversByType = this.__domObserversByType;
        if (!domObserversByType) domObserversByType = this.__domObserversByType = {};
        
        // Lazy instantiate dom observers array for type and insert observer.
        var domObservers = domObserversByType[type];
        if (!domObservers) {
            // Create list with observer
            domObserversByType[type] = [domObserver, methodName, methodRef, capture];
        } else {
            // Add dom observer to the end of the list
            domObservers.push(domObserver);
            domObservers.push(methodName);
            domObservers.push(methodRef);
            domObservers.push(capture);
        }
        
        myt.addEventListener(this.domElement, type, methodRef, capture);
        
        return true;
    },
    
    /** Creates a function that will handle the dom event when it is fired
        by the browser. Must be implemented by the object this mixin is 
        applied to.
        @param domObserver:DomObserver the observer that must be notified
            when the dom event fires.
        @param methodName:string the name of the function to pass the event to.
        @param type:string the type of the event to fire.
        @returns a function to handle the dom event or null if the event
            is not supported. */
    createDomMethodRef: function(domObserver, methodName, type) {
        return null;
    },
    
    /** Removes the observer from the list of dom observers for the event type. 
        @returns boolean True if the observer was successfully unregistered, 
            false otherwise.*/
    detachDomObserver: function(domObserver, methodName, type, capture) {
        if (!domObserver || !methodName || !type) return false;
        capture = !!capture;
        
        var domObserversByType = this.__domObserversByType;
        if (!domObserversByType) return false;
        var domObservers = domObserversByType[type];
        if (!domObservers) return false;
        
        // Remove dom observer
        var retval = false, domElement = this.domElement, i = domObservers.length;
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
    },
    
    /** Detaches all dom observers from this DomObservable.
        @returns void */
    detachAllDomObservers: function() {
        var domElement = this.domElement;
        if (!domElement) return;
        
        var domObserversByType = this.__domObserversByType;
        if (!domObserversByType) return;
        
        var domObservers, methodRef, capture, i;
        for (var type in domObserversByType) {
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
});

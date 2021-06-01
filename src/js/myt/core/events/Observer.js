/** Provides a mechanism to remember which Observables this instance has 
    registered itself with. This can be useful when we need to cleanup the 
    instance later.
    
    When this module is used registration and unregistration must be done 
    using the methods below. Otherwise, it is possible for the relationship 
    between observer and observable to be broken.
    
    Events:
        None
    
    Attributes:
        None
    
    Private Attributes:
        __obt:object Stores arrays of Observables by event type
        __methodNameCounter:int Used to create unique method names when a
            callback should only be called once.
        __DO_ONCE_*:function The names used for methods that only get run
            one time. */
myt.Observer = new JS.Module('Observer', {
    // Methods /////////////////////////////////////////////////////////////////
    /** Does the same thing as this.attachTo and also immediately calls the
        method with an event containing the attributes value. If 'once' is
        true no attachment will occur which means this probably isn't the
        correct method to use in that situation.
        @param observable:myt.Observable the Observable to attach to.
        @param methodName:string the method name on this instance to execute.
        @param eventType:string the event type to attach for.
        @param attrName:string (optional: the eventType will be used if not
            provided) the name of the attribute on the Observable
            to pull the value from.
        @param once:boolean (optional) if true  this Observer will detach
            from the Observable after the event is handled once.
        @returns {undefined} */
    syncTo: function(observable, methodName, eventType, attrName, once) {
        if (attrName === undefined) attrName = eventType;
        try {
            this[methodName](observable.createEvent(eventType, observable.get(attrName)));
        } catch (err) {
            myt.dumpStack(err);
        }
        
        // Providing a true value for once means we'll never actually attach.
        if (once) return;
        
        this.attachTo(observable, methodName, eventType, once);
    },
    
    /** Checks if this Observer is attached to the provided observable for
        the methodName and eventType.
        @param observable:myt.Observable the Observable to check with.
        @param methodName:string the method name on this instance to execute.
        @param eventType:string the event type to check for.
        @returns true if attached, false otherwise. */
    isAttachedTo: function(observable, methodName, eventType) {
        if (observable && methodName && eventType) {
            const observablesByType = this.__obt;
            if (observablesByType) {
                const observables = observablesByType[eventType];
                if (observables) {
                    let i = observables.length;
                    while (i) {
                        // Ensures we decrement twice. First with --i, then 
                        // with i-- since the part after && may not be executed.
                        --i;
                        if (observable === observables[i--] && methodName === observables[i]) return true;
                    }
                }
            }
        }
        return false;
    },
    
    /** Gets an array of observables and method names for the provided type.
        The array is structured as:
            [methodName1, observableObj1, methodName2, observableObj2,...].
        @param eventType:string the event type to check for.
        @returns an array of observables. */
    getObservables: function(eventType) {
        const observablesByType = this.__obt || (this.__obt = {});
        return observablesByType[eventType] || (observablesByType[eventType] = []);
    },
    
    /** Checks if any observables exist for the provided event type.
        @param eventType:string the event type to check for.
        @returns true if any exist, false otherwise. */
    hasObservables: function(eventType) {
        const observablesByType = this.__obt;
        if (!observablesByType) return false;
        const observables = observablesByType[eventType];
        return observables && observables.length > 0;
    },
    
    /** Registers this Observer with the provided Observable
        for the provided eventType.
        @param observable:myt.Observable the Observable to attach to.
        @param methodName:string the method name on this instance to execute.
        @param eventType:string the event type to attach for.
        @param once:boolean (optional) if true  this Observer will detach
            from the Observable after the event is handled once.
        @returns boolean true if the observable was successfully registered, 
            false otherwise. */
    attachTo: function(observable, methodName, eventType, once) {
        if (observable && methodName && eventType) {
            const observables = this.getObservables(eventType);
            
            // Setup wrapper method when 'once' is true.
            if (once) {
                const self = this, 
                    origMethodName = methodName;
                
                // Generate one time method name.
                if (this.__methodNameCounter === undefined) this.__methodNameCounter = 0;
                methodName = '__DO_ONCE_' + this.__methodNameCounter++;
                
                // Setup wrapper method that will do the detachFrom.
                this[methodName] = event => {
                    self.detachFrom(observable, methodName, eventType);
                    delete self[methodName];
                    return self[origMethodName](event);
                };
            }
            
            // Register this observer with the observable
            if (observable.attachObserver(this, methodName, eventType)) {
                observables.push(methodName, observable);
                return true;
            }
        }
        return false;
    },
    
    /** Unregisters this Observer from the provided Observable
        for the provided eventType.
        @param observable:myt.Observable the Observable to attach to.
        @param methodName:string the method name on this instance to execute.
        @param eventType:string the event type to attach for.
        @returns boolean true if one or more detachments occurred, false 
            otherwise. */
    detachFrom: function(observable, methodName, eventType) {
        if (observable && methodName && eventType) {
            // No need to unregister if observable array doesn't exist.
            const observablesByType = this.__obt;
            if (observablesByType) {
                const observables = observablesByType[eventType];
                if (observables) {
                    // Remove all instances of this observer/methodName/eventType 
                    // from the observable
                    let retval = false, 
                        i = observables.length;
                    while (i) {
                        --i;
                        if (observable === observables[i--] && methodName === observables[i]) {
                            if (observable.detachObserver(this, methodName, eventType)) {
                                observables.splice(i, 2);
                                retval = true;
                            }
                        }
                    }
                    
                    // Source wasn't found
                    return retval;
                }
            }
        }
        return false;
    },
    
    /** Tries to detach this Observer from all Observables it
        is attached to.
        @returns {undefined} */
    detachFromAllObservables: function() {
        const observablesByType = this.__obt;
        if (observablesByType) {
            for (const eventType in observablesByType) {
                const observables = observablesByType[eventType];
                let i = observables.length;
                while (i) observables[--i].detachObserver(this, observables[--i], eventType);
                observables.length = 0;
            }
        }
    }
});

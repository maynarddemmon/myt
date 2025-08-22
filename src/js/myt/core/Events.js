(pkg => {
    const JSModule = JS.Module,
        
        consoleLog = console.log,
        
        dumpStack = pkg.dumpStack;
    
    /** Apply this mixin to any Object that needs to fire events.
        
        Private Attributes:
            __obsbt:object Stores arrays of myt.Observers and method names by event type
            __aet:Object Stores active event type strings. An event type is active if it has been 
                fired from this Observable as part of the current call stack. If an event type 
                is "active" it will not be fired again. This provides protection against infinite 
                event loops.
        
        @class */
    pkg.Observable = new JSModule('Observable', {
        // Methods /////////////////////////////////////////////////////////////
        /** Adds the observer to the list of event recipients for the event type.
            @param observer:myt.Observer The observer that will observe this observable. If 
                methodName is a function this object will be the context for the function when it 
                is called.
            @param methodName:string|function The name of the method to call, or a function, on 
                the observer when the event fires.
            @param type:string The name of the event the observer will listen to.
            @returns boolean true if the observer was successfully attached, false otherwise. */
        attachObserver: function(observer, methodName, type) {
            if (observer && methodName && type) {
                this.getObservers(type).push(methodName, observer);
                return true;
            }
            return false;
        },
        
        /** Removes the observer from the list of observers for the event type.
            @param observer:myt.Observer The observer that will no longer be observing 
                this observable.
            @param methodName:string|function The name of the method that was to be called or the 
                function to be called.
            @param type:string The name of the event the observer will no longer be listening to.
            @returns boolean true if the observer was successfully detached, false otherwise. */
        detachObserver: function(observer, methodName, type) {
            if (observer && methodName && type) {
                const observersByType = this.__obsbt;
                if (observersByType) {
                    const observers = observersByType[type];
                    if (observers) {
                        // Remove all instances of the observer and methodName combination.
                        let retval = false,
                            i = observers.length;
                        while (i >= 2) {
                            const obs = observers[--i],
                                method = observers[--i];
                            if (observer === obs && methodName === method) {
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
            @returns {void} */
        detachAllObservers: function() {
            const observersByType = this.__obsbt;
            if (observersByType) {
                for (const type in observersByType) {
                    const observers = observersByType[type];
                    let i = observers.length;
                    while (i >= 2) {
                        const observer = observers[--i],
                            methodName = observers[--i];
                        // If an observer is registered more than once the list may get shortened 
                        // by observer.detachFrom. If so, just continue decrementing downwards.
                        if (observer && methodName) {
                            if (typeof observer.detachFrom !== 'function' || 
                                !observer.detachFrom(this, methodName, type)
                            ) {
                                // Observer may not have a detachFrom function or the observer may 
                                // not have attached via Observer.attachTo so do the default detach 
                                // activity as implemented in Observable.detachObserver
                                observers.splice(i, 2);
                            }
                        }
                    }
                }
            }
        },
        
        /** Gets an array of observers and method names for the provided type. The array is 
            structured as:
                [methodName1, observerObj1, methodName2, observerObj2,...].
            @param type:string The name of the event to get observers for.
            @returns array: The observers of the event. */
        getObservers: function(type) {
            const observersByType = this.__obsbt ??= {};
            return observersByType[type] ??= [];
        },
        
        /** Checks if any observers exist for the provided event type.
            @param type:string The name of the event to check.
            @returns boolean: True if any exist, false otherwise. */
        hasObservers: function(type) {
            const observersByType = this.__obsbt;
            return observersByType ? observersByType[type]?.length > 0 : false;
        },
        
        /** Creates a new event with the type and value and using this as the source.
            @param type:string The event type.
            @param value:* The event value.
            @returns An event object consisting of source, type and value. */
        createEvent: function(type, value) {
            return {source:this, type:type, value:value}; // Inlined in this.fireEvent
        },
        
        /** Generates a new event from the provided type and value and fires it to the provided 
            observers or the registered observers.
            @param type:string The event type to fire.
            @param value:* The value to set on the event.
            @param observers:array (Optional) If provided the event will be sent to this specific 
                list of observers and no others.
            @returns {void} */
        fireEvent: function(type, value, observers) {
            // Determine observers to use but avoid using getObservers since that lazy instantiates 
            // __obsbt and fireEvent will get called predominantly when no observers were
            // passed into this function.
            const self = this;
            if (observers == null) {
                const observersByType = self.__obsbt;
                if (observersByType) observers = observersByType[type];
            }
            
            // Fire event
            if (observers) {
                // Prevent "active" events from being fired again which usually indicates an
                // infinite loop has occurred.
                const event = {source:self, type:type, value:value}, // Inlined from this.createEvent
                    activeEventTypes = self.__aet ??= {};
                if (activeEventTypes[type]) {
                    pkg.global.error.notify(
                        'warn', 'eventLoop', 'Abort refiring event:' + type, null, {
                            observable:self,
                            type:type,
                            value:value
                        }
                    );
                } else {
                    // Mark event type as "active"
                    activeEventTypes[type] = true;
                    
                    // Walk through observers backwards so that if the observer is detached by the 
                    // event handler the index won't get messed up.
                    // FIXME: If necessary we could queue up detachObserver calls that come in 
                    // during iteration or make some sort of adjustment to 'i'.
                    let i = observers.length;
                    while (i >= 2) {
                        const observer = observers[--i],
                            methodName = observers[--i];
                        // Sometimes the list gets shortened as a side effect of the method we 
                        // called thus resulting in a nullish observer and methodName. In that case 
                        // just continue decrementing downwards.
                        if (observer && methodName) {
                            // Stop firing the event if it was "consumed". An event is considered
                            // consumed if the invoked function returns true.
                            try {
                                if (typeof methodName === 'function') {
                                    if (methodName.call(observer, event)) break;
                                } else {
                                    if (observer[methodName]?.(event)) break;
                                }
                            } catch (err) {
                                dumpStack(err);
                                consoleLog('Additional context', methodName, observer);
                            }
                        }
                    }
                    
                    // Mark event type as "inactive"
                    activeEventTypes[type] = false;
                }
            }
        }
    });
    
    /** Provides a mechanism to remember which Observables this instance has registered itself 
        with. This can be useful when we need to cleanup the instance later.
        
        When this module is used registration and unregistration must be done using the methods 
        below. Otherwise, it is possible for the relationship between observer and observable to 
        be broken.
        
        This mixin also provides the ability to apply and release constraints.
        
        Private Attributes:
            __obt:object Stores arrays of Observables by event type
            __methodNameCounter:int Used to create unique method names when a callback should only 
                be called once.
            __DO_ONCE_*:function The names used for methods that only get run one time.
            __cbmn:object Holds arrays of constraints by method name.
        
        @class */
    pkg.Observer = new JSModule('Observer', {
        // Methods /////////////////////////////////////////////////////////////
        /** Extracts the value from an "event like" object if encountered. Otherwise it returns 
            the provided eventOrValue.
            @param {*} v The candidate event or value to get the value from. An event like value 
                is a non-null Object with a truthy "type" property.
            @returns {*} the provided event or the event's value if found. */
        valueFromEvent: v => v && typeof v === 'object' && v.type ? v.value : v,
        
        /** Does the same thing as this.attachTo and also immediately calls the method with an 
            event containing the attributes value. If 'once' is true no attachment will occur 
            which means this probably isn't the correct method to use in that situation.
            @param observable:myt.Observable the Observable to attach to.
            @param methodName:string the method name on this instance to execute.
            @param eventType:string the event type to attach for.
            @param attrName:string (optional: the eventType will be used if not provided) the name 
                of the attribute on the Observable to pull the value from.
            @param once:boolean (optional) if true  this Observer will detach from the Observable 
                after the event is handled once.
            @returns {void} */
        syncTo: function(observable, methodName, eventType, attrName, once) {
            attrName ??= eventType;
            try {
                this[methodName](observable.createEvent(eventType, observable.get(attrName)));
            } catch (err) {
                dumpStack(err);
            }
            
            // Providing a true value for once means we will never actually attach.
            if (!once) this.attachTo(observable, methodName, eventType, once);
        },
        
        /** Checks if this Observer is attached to the provided observable for the methodName 
            and eventType.
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
                        while (i >= 2) {
                            const obs = observables[--i],
                                method = observables[--i];
                            if (observable === obs && methodName === method) return true;
                        }
                    }
                }
            }
            return false;
        },
        
        /** Gets an array of observables and method names for the provided type. The array is 
            structured as:
                [methodName1, observableObj1, methodName2, observableObj2,...].
            @param eventType:string the event type to check for.
            @returns an array of observables. */
        getObservables: function(eventType) {
            const observablesByType = this.__obt ??= {};
            return observablesByType[eventType] ??= [];
        },
        
        /** Checks if any observables exist for the provided event type.
            @param eventType:string the event type to check for.
            @returns true if any exist, false otherwise. */
        hasObservables: function(eventType) {
            const observablesByType = this.__obt;
            return observablesByType ? observablesByType[eventType]?.length > 0 : false;
        },
        
        /** Registers this Observer with the provided Observable for the provided eventType.
            @param observable:myt.Observable the Observable to attach to.
            @param methodName:string the method name on this instance to execute.
            @param eventType:string the event type to attach for.
            @param once:boolean (optional) if true  this Observer will detach from the Observable 
                after the event is handled once.
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
                    this.__methodNameCounter ??= 0;
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
        
        /** Unregisters this Observer from the provided Observable for the provided eventType.
            @param observable:myt.Observable the Observable to attach to.
            @param methodName:string the method name on this instance to execute.
            @param eventType:string the event type to attach for.
            @returns boolean true if one or more detachments occurred, false otherwise. */
        detachFrom: function(observable, methodName, eventType) {
            if (observable && methodName && eventType) {
                // No need to unregister if observable array doesn't exist.
                const observablesByType = this.__obt;
                if (observablesByType) {
                    const observables = observablesByType[eventType];
                    if (observables) {
                        // Remove all instances of this observer/methodName/eventType from 
                        // the observable
                        let retval = false,
                            i = observables.length;
                        while (i >= 2) {
                            const obs = observables[--i],
                                method = observables[--i];
                            if (observable === obs && methodName === method) {
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
        
        /** Tries to detach this Observer from all Observables it is attached to.
            @returns {void} */
        detachFromAllObservables: function() {
            const observablesByType = this.__obt;
            if (observablesByType) {
                for (const [eventType, observables] of Object.entries(observablesByType)) {
                    let i = observables.length;
                    while (i >= 2) {
                        const observable = observables[--i],
                            methodName = observables[--i];
                        observable.detachObserver(this, methodName, eventType);
                    }
                    observables.length = 0;
                }
            }
        },
        
        // Constraints
        /** Creates a constraint. The method will be executed on this object whenever any of the 
            provided observables fire the indicated event type.
            @param {string} methodName - The name of the method to call on this object.
            @param {?Array} observables - An array of observable/type pairs. An observer will 
                attach to each observable for the event type.
            @returns {void} */
        constrain: function(methodName, observables) {
            if (methodName && observables) {
                // Make sure an even number of observable/type was provided
                const len = observables.length;
                if (len % 2 !== 0) {
                    consoleLog('Observables uneven', this);
                } else {
                    // Lazy instantiate constraints array.
                    const constraints = this.__cbmn ??= {},
                        constraint = constraints[methodName] ??= [];
                    
                    // Don't allow a constraint to be clobbered.
                    if (constraint.length > 0) {
                        consoleLog('Constraint exists for ' + methodName + ' on', this);
                    } else {
                        for (let i = 0; i < len;) {
                            const observable = observables[i++],
                                type = observables[i++];
                            if (observable && type) {
                                this.attachTo(observable, methodName, type);
                                constraint.push(observable, type);
                            }
                        }
                        
                        // Call constraint method once so it can "sync" the constraint
                        try {
                            this[methodName]();
                        } catch (err) {
                            dumpStack(err);
                        }
                    }
                }
            }
        },
        
        /** Removes a constraint.
            @param {string} methodName
            @returns {void} */
        releaseConstraint: function(methodName) {
            if (methodName) {
                // No need to remove if the constraint is already empty.
                const constraints = this.__cbmn;
                if (constraints) {
                    const constraint = constraints[methodName];
                    if (constraint) {
                        let i = constraint.length;
                        while (i >= 2) {
                            const type = constraint[i--],
                                observable = constraint[i--];
                            this.detachFrom(observable, methodName, type);
                        }
                        constraint.length = 0;
                    }
                }
            }
        },
        
        /** Removes all constraints.
            @returns {void} */
        releaseAllConstraints: function() {
            const constraints = this.__cbmn;
            if (constraints) {
                for (const methodName in constraints) this.releaseConstraint(methodName);
            }
        }
    });
})(myt);

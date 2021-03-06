/** Provides a mechanism to remember which DomObservables this DomObserver has 
    attached itself to. This is useful when the instance is being destroyed
    to automatically cleanup the observer/observable relationships.
    
    When this mixin is used attachment and detachment should be done 
    using the 'attachToDom' and 'detachFromDom' methods of this mixin. If this 
    is not done, it is possible for the relationship between observer and 
    observable to become broken.
    
    Events:
        None
    
    Attributes:
        None
    
    Private Attributes:
        __dobt: (Object) Holds arrays of DomObservables by event type.
    
    @class */
myt.DomObserver = new JS.Module('DomObserver', {
    // Methods /////////////////////////////////////////////////////////////////
    /** Attaches this DomObserver to the provided DomObservable for the 
        provided type.
        @param {!Object} observable
        @param {string} methodName
        @param {string} type
        @param {boolean} [capture]
        @param {boolean} [passive]
        @returns {undefined} */
    attachToDom: function(observable, methodName, type, capture, passive) {
        if (observable && methodName && type) {
            capture = !!capture;
            
            // Lazy instantiate __dobt map.
            const observablesByType = this.__dobt || (this.__dobt = {}),
                observables = observablesByType[type] || (observablesByType[type] = []);
            
            // Attach this DomObserver to the DomObservable
            if (observable.attachDomObserver(this, methodName, type, capture, passive)) {
                observables.push(capture, methodName, observable);
            }
        }
    },
    
    /** Detaches this DomObserver from the DomObservable for the event type.
        @param {!Object} observable
        @param {string} methodName
        @param {string} type
        @param {boolean} [capture]
        @returns {boolean} - True if detachment succeeded, false otherwise. */
    detachFromDom: function(observable, methodName, type, capture) {
        if (observable && methodName && type) {
            capture = !!capture;
            
            // No need to detach if observable array doesn't exist.
            const observablesByType = this.__dobt;
            if (observablesByType) {
                const observables = observablesByType[type];
                if (observables) {
                    // Remove all instances of this observer/methodName/type/capture 
                    // from the observable
                    let retval = false, 
                        i = observables.length;
                    while (i) {
                        i -= 3;
                        if (observable === observables[i + 2] && 
                            methodName === observables[i + 1] && 
                            capture === observables[i]
                        ) {
                            if (observable.detachDomObserver(this, methodName, type, capture)) {
                                observables.splice(i, 3);
                                retval = true;
                            }
                        }
                    }
                    
                    // Observable wasn't found
                    return retval;
                }
            }
        }
        return false;
    },
    
    /** Detaches this DomObserver from all DomObservables it is attached to.
        @returns {undefined} */
    detachFromAllDomSources: function() {
        const observablesByType = this.__dobt;
        if (observablesByType) {
            let type,
                observables,
                i;
            for (type in observablesByType) {
                observables = observablesByType[type];
                i = observables.length;
                while (i) observables[--i].detachDomObserver(this, observables[--i], type, observables[--i]);
                observables.length = 0;
            }
        }
    }
});

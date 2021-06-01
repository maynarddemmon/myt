/** Provides the ability to apply and release constraints.
    
    Events:
        None
    
    Attributes:
        None
    
    Private Attributes:
        __cbmn:object Holds arrays of constraints by method name.
    
    @class */
myt.Constrainable = new JS.Module('Constrainable', {
    include: [myt.Observer],
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** Creates a constraint. The method will be executed on this object
        whenever any of the provided observables fire the indicated event type.
        @param {string} methodName - The name of the method to call on this object.
        @param {?Array} observables - An array of observable/type pairs. An observer
            will attach to each observable for the event type.
        @returns {undefined} */
    constrain: function(methodName, observables) {
        if (methodName && observables) {
            // Make sure an even number of observable/type was provided
            const len = observables.length;
            if (len % 2 !== 0) {
                console.log("Observables not even.", this);
            } else {
                // Lazy instantiate constraints array.
                const constraints = this.__cbmn || (this.__cbmn = {}),
                    constraint = constraints[methodName] || (constraints[methodName] = []);
                
                // Don't allow a constraint to be clobbered.
                if (constraint.length > 0) {
                    console.log("Constraint already exists for " + methodName + " on " + this);
                } else {
                    for (let i = 0; len !== i;) {
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
                        myt.dumpStack(err);
                    }
                }
            }
        }
    },
    
    /** Removes a constraint.
        @param {string} methodName
        @returns {undefined} */
    releaseConstraint: function(methodName) {
        if (methodName) {
            // No need to remove if the constraint is already empty.
            const constraints = this.__cbmn;
            if (constraints) {
                const constraint = constraints[methodName];
                if (constraint) {
                    let i = constraint.length;
                    while (i) {
                        const type = constraint[--i],
                            observable = constraint[--i];
                        this.detachFrom(observable, methodName, type);
                    }
                    constraint.length = 0;
                }
            }
        }
    },
    
    /** Removes all constraints.
        @returns {undefined} */
    releaseAllConstraints: function() {
        const constraints = this.__cbmn;
        if (constraints) {
            for (const methodName in constraints) this.releaseConstraint(methodName);
        }
    }
});

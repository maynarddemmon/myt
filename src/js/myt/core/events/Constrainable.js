/** Provides the ability to apply and release constraints.
    
    Events:
        None
    
    Attributes:
        None
    
    Private Attributes:
        __cbmn:object Holds arrays of constraints by method name.
*/
myt.Constrainable = new JS.Module('Constrainable', {
    include: [myt.Observer],
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** Creates a constraint. The method will be executed on this object
        whenever any of the provided observables fire the indicated event type.
        @param methodName:String The name of the method to call on this object.
        @param observables:array An array of observable/type pairs. An observer
            will attach to each observable for the event type.
        @returns void */
    constrain: function(methodName, observables) {
        if (methodName && observables) {
            // Make sure an even number of observable/type was provided
            var len = observables.length;
            if (len % 2 !== 0) {
                console.log("Observables was not even.", this);
                return;
            }
            
            // Lazy instantiate constraints array.
            var constraints = this.__cbmn || (this.__cbmn = {}),
                constraint = constraints[methodName] || (constraints[methodName] = []);
            
            // Don't allow a constraint to be clobbered.
            if (constraint.length > 0) {
                console.log("Constraint already exists for " + methodName + " on " + this);
                return;
            }
            
            var observable, type, i = 0;
            for (; len !== i;) {
                observable = observables[i++];
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
    },
    
    /** Removes a constraint.
        @returns void */
    releaseConstraint: function(methodName) {
        if (methodName) {
            // No need to remove if the constraint is already empty.
            var constraints = this.__cbmn;
            if (constraints) {
                var constraint = constraints[methodName];
                if (constraint) {
                    var i = constraint.length, 
                        type, 
                        observable;
                    while (i) {
                        type = constraint[--i];
                        observable = constraint[--i];
                        this.detachFrom(observable, methodName, type);
                    }
                    constraint.length = 0;
                }
            }
        }
    },
    
    /** Removes all constraints.
        @returns void */
    releaseAllConstraints: function() {
        var constraints = this.__cbmn,
            methodName;
        if (constraints) {
            for (methodName in constraints) this.releaseConstraint(methodName);
        }
    }
});

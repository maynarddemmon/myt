/** Provides the ability to apply and release constraints.
    
    Attributes:
        __constraintsByMethodName: (Object) Holds arrays of constraints by 
            method name */
myt.Constrainable = new JS.Module('Constrainable', {
    include: [myt.Observer],
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** Creates a constraint. The method will be executed on this object
        whenever any of the provided observables fire the indicated event type.
        @param methodName:String The name of the method to call on this object.
        @param observables:array An array of observable/type pairs. An observer
            will attach to each observable for the event type.
        @returns void */
    applyConstraint: function(methodName, observables) {
        if (!methodName || !observables) return;
        
        // Make sure an even number of observable/type was provided
        var len = observables.length;
        if (len % 2 !== 0) {
            console.log("Observables was not even.", this);
            return;
        }
        
        // Lazy instantiate constraints array.
        var constraints = this.__constraintsByMethodName;
        if (!constraints) constraints = this.__constraintsByMethodName = {};
        var constraint = constraints[methodName];
        if (!constraint) constraint = constraints[methodName] = [];
        
        // Don't allow a constraint to be clobbered.
        if (constraint.length > 0) {
            console.log("Constraint already exists for " + methodName + " on " + this);
            return;
        }
        
        var observable, type;
        for (var i = 0; len !== i;) {
            observable = observables[i++];
            type = observables[i++];
            if (!observable || !type) continue;
            this.attachTo(observable, methodName, type);
            constraint.push(observable);
            constraint.push(type);
        }
        
        // Call constraint method once so it can "sync" the constraint
        try {
            this[methodName]();
        } catch (err) {
            console.error(err.stack || err.stacktrace);
        }
    },
    
    /** Removes a constraint.
        @returns void */
    releaseConstraint: function(methodName) {
        if (!methodName) return;
        
        // No need to remove if the constraint is already empty.
        var constraints = this.__constraintsByMethodName;
        if (!constraints) return;
        var constraint = constraints[methodName];
        if (!constraint) return;
        var len = constraint.length;
        if (len === 0) return;
        
        var observable, type;
        for (var i = len - 1; i >= 1; i -= 2) {
            observable = constraint[i - 1];
            type = constraint[i];
            this.detachFrom(observable, methodName, type);
        }
        constraint.length = 0;
    },
    
    /** Removes all constraints.
        @returns void */
    releaseAllConstraints: function() {
        var constraints = this.__constraintsByMethodName;
        if (!constraints) return;
        
        for (var methodName in constraints) this.releaseConstraint(methodName);
    }
});

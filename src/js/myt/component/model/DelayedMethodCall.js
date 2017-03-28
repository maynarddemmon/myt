/** A method that gets called a provided number of millis later. Multiple
    method calls will get collapsed into a single call if they occur before
    the method is executed. */
myt.DelayedMethodCall = new JS.Class('DelayedMethodCall', {
    // Class Methods and Attributes ////////////////////////////////////////////
    extend: {
        /** Mixes DelayedMethodCall functionality onto the provided scope.
            @param scope:Observable|Class|Module the scope to mix onto.
            @param millis:number the time to delay the call by.
            @param methodName:string the name of the method to call after the
                delay.
            @returns boolean True if creation succeeded, false otherwise. */
        createDelayedMethodCall: function(scope, millis, methodName) {
            var genNameFunc = myt.AccessorSupport.generateName,
                delayedMethodName = genNameFunc('delayed', methodName),
                timerId = genNameFunc('timer', methodName),
                isModuleOrClass = typeof scope === 'function' || scope instanceof JS.Module;
            
            // Prevent clobbering
            if ((isModuleOrClass ? scope.instanceMethod(delayedMethodName) : scope[delayedMethodName]) !== undefined) {
                console.warn("Can't clobber existing property during setup of delayed method function.", delayedMethodName, scope);
                return false;
            }
            if ((isModuleOrClass ? scope.instanceMethod(timerId) : scope[timerId]) !== undefined) {
                console.warn("Can't clobber existing property during setup of delayed method timer ID.", timerId, scope);
                return false;
            }
            
            // Define the "module".
            var mod = {};
            
            /** Calls the method after a delay. Resets the delay timer if
                this method is called again before the timer has finished.
                @returns void */
            mod[delayedMethodName] = function() {
                var self = this,
                    timerId = self[timerId];
                if (timerId) {
                    clearTimeout(timerId);
                    delete self[timerId];
                }
                
                self[timerId] = setTimeout(
                    function() {
                        self[methodName].apply(self);
                        delete self[timerId];
                    },
                    millis
                );
            };
            
            // Mixin in the "module"
            if (isModuleOrClass) {
                scope.include(mod);
            } else {
                scope.extend(mod);
            }
            
            return true;
        }
    }
});

/** Create default functions for the DelayedMethodCall class. By default
    the method is 'execute' and the delay is 0 millis. */
myt.DelayedMethodCall.createDelayedMethodCall(
    myt.DelayedMethodCall, 0, 'execute'
);

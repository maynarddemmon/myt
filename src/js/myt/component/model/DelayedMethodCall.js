/** A method that gets called a provided number of millis later. Multiple
    method calls will get collapsed into a single call if they occur before
    the method is executed. */
myt.DelayedMethodCall = new JS.Class('DelayedMethodCall', {
    // Class Methods and Attributes ////////////////////////////////////////////
    extend: {
        createDelayedMethodCall: function(scope, millis, methodName) {
            var genNameFunc = myt.AccessorSupport.generateName;
            var delayedMethodName = genNameFunc('delayed', methodName);
            var timerName = genNameFunc('timer', methodName);
            var callbackName = genNameFunc('callback', methodName);
            
            var isModuleOrClass = typeof scope === 'function' || scope instanceof JS.Module;
            
            // Prevent clobbering
            if ((isModuleOrClass ? scope.instanceMethod(delayedMethodName) : scope[delayedMethodName]) !== undefined) {
                console.warn("Can't clobber existing property during setup of delayed method function.", delayedMethodName, scope);
                return false;
            }
            if ((isModuleOrClass ? scope.instanceMethod(timerName) : scope[timerName]) !== undefined) {
                console.warn("Can't clobber existing property during setup of delayed method timer reference.", timerName, scope);
                return false;
            }
            if ((isModuleOrClass ? scope.instanceMethod(callbackName) : scope[callbackName]) !== undefined) {
                console.warn("Can't clobber existing property during setup of delayed method callback reference.", callbackName, scope);
                return false;
            }
            
            // Define the "module".
            var mod = {};
            
            mod[delayedMethodName] = function() {
                var callback = this[callbackName];
                if (!callback) callback = this[callbackName] = new myt.Callback(methodName, this);
                
                var timer = this[timerName];
                if (timer) {
                    timer.reset(callback, millis);
                } else {
                    this[timerName] = new myt.Timer(callback, millis);
                }
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

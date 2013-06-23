/** A counter that can be incremented and decremented and will update an
    'exceeded' attribute when a threshold is crossed. */
myt.ThresholdCounter = new JS.Class('ThresholdCounter', {
    include: [myt.AccessorSupport, myt.Destructible, myt.Observable],
    
    // Class Methods and Attributes ////////////////////////////////////////////
    extend: {
        /** Mixes ThresholdCounter functionality onto the provided scope.
            @param scope:Observable|Class|Module the scope to mix onto.
            @param exceededAttrName:string the name of the boolean attribute
                that will indicate if the threshold is exceeded or not.
            @param counterAttrName:string (Optional) the name of the number
                attribute that will get adjusted up and down. If not provided
                the 'exceeded' attribute name will be used with 'Counter'
                appended to it. For example if the exceeded
                attribute was 'locked' this would be 'lockedCounter'.
            @param thresholdAttrName:string (Optional) the name of the number
                attribute that determines when we are exceeded or not. If not 
                provided the 'exceeded' attribute name will be used with 
                'Threshold' appended to it. For example if the exceeded
                attribute was 'locked' this would be 'lockedThreshold'.
            @returns boolean True if creation succeeded, false otherwise. */
        createThresholdCounter: function(scope, exceededAttrName, counterAttrName, thresholdAttrName) {
            var genNameFunc = myt.AccessorSupport.generateName;
            counterAttrName = counterAttrName || genNameFunc('counter', exceededAttrName);
            thresholdAttrName = thresholdAttrName || genNameFunc('threshold', exceededAttrName);
            
            var incrName = genNameFunc(counterAttrName, 'increment');
            var decrName = genNameFunc(counterAttrName, 'decrement');
            var thresholdSetterName = myt.AccessorSupport.generateSetterName(thresholdAttrName);
            
            var isModuleOrClass = typeof scope === 'function' || scope instanceof JS.Module;
            
            // Prevent clobbering
            if ((isModuleOrClass ? scope.instanceMethod(incrName) : scope[incrName]) !== undefined) {
                console.warn("Can't clobber existing property during setup of ThresholdCounter increment function.", incrName, scope);
                return false;
            }
            if ((isModuleOrClass ? scope.instanceMethod(decrName) : scope[decrName]) !== undefined) {
                console.warn("Can't clobber existing property during setup of ThresholdCounter decrement function.", decrName, scope);
                return false;
            }
            if ((isModuleOrClass ? scope.instanceMethod(thresholdSetterName) : scope[thresholdSetterName]) !== undefined) {
                console.warn("Can't clobber existing property during setup of ThresholdCounter threshold setter function.", thresholdSetterName, scope);
                return false;
            }
            
            // Define the "module".
            var mod = {};
            
            /** Increments the counter attribute on the scope object by the 
                provided value or 1 if no value was provided.
                @param amount:number (Optional) the amount to increment the 
                    counter by. If not provided, 1 will be used.
                @returns void */
            mod[incrName] = function(amount) {
                if (amount == null) amount = 1;
                var curValue = this[counterAttrName];
                var value = curValue + amount;
                
                // Counters must be non-negative.
                if (0 > value) {
                    console.warn("Attempt to decrement a counter below 0.", this, counterAttrName, amount);
                    value = 0;
                }
                
                if (curValue !== value) {
                    this[counterAttrName] = value;
                    this.fireNewEvent(counterAttrName, value);
                    this.set(exceededAttrName, value >= this[thresholdAttrName]); // Check threshold
                }
            };
            
            /** Decrements the counter attribute on the scope object by the 
                provided value or 1 if no value was provided.
                @param amount:number (Optional) the amount to increment the 
                    counter by. If not provided, 1 will be used.
                @returns void */
            mod[decrName] = function(amount) {
                if (amount == null) amount = 1;
                this[incrName](-amount);
            };
            
            /** Sets the threshold attribute and performs a threshold check.
                @returns void */
            mod[thresholdSetterName] = function(v) {
                if (this[thresholdAttrName] === v) return;
                this[thresholdAttrName] = v;
                this.fireNewEvent(thresholdAttrName, v);
                this.set(exceededAttrName, this[counterAttrName] >= v); // Check threshold
            };
            
            // Mixin in the "module"
            if (isModuleOrClass) {
                scope.include(mod);
            } else {
                scope.extend(mod);
            }
            
            return true;
        },
        
        /** Set initial value and threshold on a ThresholdCounter instance.
            This also executes a 'check' so the 'exceeded' attribute will have
            the correct value.
            @returns void */
        initializeThresholdCounter: function(
            scope, initialValue, thresholdValue, exceededAttrName, counterAttrName, thresholdAttrName
        ) {
            var genNameFunc = myt.AccessorSupport.generateName;
            counterAttrName = counterAttrName || genNameFunc('counter', exceededAttrName);
            thresholdAttrName = thresholdAttrName || genNameFunc('threshold', exceededAttrName);
            
            scope[counterAttrName] = initialValue;
            scope[thresholdAttrName] = thresholdValue;
            scope.set(exceededAttrName, initialValue >= thresholdValue); // Check threshold
        },
        
        /** Mixes ThresholdCounter functionality with a fixed threshold onto 
            the provided scope.
            @param scope:Observable|Class|Module the scope to mix onto.
            @param thresholdValue:number the fixed threshold value.
            @param exceededAttrName:string the name of the boolean attribute
                that will indicate if the threshold is exceeded or not.
            @param counterAttrName:string (Optional) the name of the number
                attribute that will get adjusted up and down. If not provided
                the 'exceeded' attribute name will be used with 'Counter'
                appended to it. For example if the exceeded
                attribute was 'locked' this would be 'lockedCounter'.
            @returns boolean True if creation succeeded, false otherwise. */
        createFixedThresholdCounter: function(scope, thresholdValue, exceededAttrName, counterAttrName) {
            var genNameFunc = myt.AccessorSupport.generateName;
            counterAttrName = counterAttrName || genNameFunc('counter', exceededAttrName);
            
            var incrName = genNameFunc(counterAttrName, 'increment');
            var decrName = genNameFunc(counterAttrName, 'decrement');
            
            var isModuleOrClass = typeof scope === 'function' || scope instanceof JS.Module;
            
            // Prevent clobbering
            if ((isModuleOrClass ? scope.instanceMethod(incrName) : scope[incrName]) !== undefined) {
                console.warn("Can't clobber existing property during setup of ThresholdCounter increment function.", incrName, scope);
                return false;
            }
            if ((isModuleOrClass ? scope.instanceMethod(decrName) : scope[decrName]) !== undefined) {
                console.warn("Can't clobber existing property during setup of ThresholdCounter decrement function.", decrName, scope);
                return false;
            }
            
            // Define the "module".
            var mod = {};
            
            /** Increments the counter attribute on the scope object by 1.
                @returns void */
            mod[incrName] = function() {
                var value = this[counterAttrName] + 1;
                this[counterAttrName] = value;
                this.fireNewEvent(counterAttrName, value);
                if (value === thresholdValue) this.set(exceededAttrName, true);
            };
            
            /** Decrements the counter attribute on the scope object by 1.
                @returns void */
            mod[decrName] = function() {
                var curValue = this[counterAttrName];
                if (curValue === 0) return;
                var value = curValue - 1;
                this[counterAttrName] = value;
                this.fireNewEvent(counterAttrName, value);
                if (curValue === thresholdValue) this.set(exceededAttrName, false);
            };
            
            // Mixin in the "module"
            if (isModuleOrClass) {
                scope.include(mod);
            } else {
                scope.extend(mod);
            }
            
            return true;
        },
        
        /** Set initial value on a ThresholdCounter instance.
            This also executes a 'check' so the 'exceeded' attribute will have
            the correct value.
            @returns void */
        initializeFixedThresholdCounter: function(
            scope, initialValue, thresholdValue, exceededAttrName, counterAttrName
        ) {
            counterAttrName = counterAttrName || myt.AccessorSupport.generateName('counter', exceededAttrName);
            
            scope[counterAttrName] = initialValue;
            scope.set(exceededAttrName, initialValue >= thresholdValue);
        }
    },
    
    
    // Constructor /////////////////////////////////////////////////////////////
    initialize: function(initialValue, thresholdValue) {
        myt.ThresholdCounter.initializeThresholdCounter(
            this, initialValue, thresholdValue, 'exceeded', 'counter', 'threshold'
        );
    },
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides myt.Destructible */
    destroy: function() {
        this.detachAllObservers();
        this.callSuper();
    }
});

/** Create default counter functions for the ThresholdCounter class. */
myt.ThresholdCounter.createThresholdCounter(
    myt.ThresholdCounter, 'exceeded', 'counter', 'threshold'
);

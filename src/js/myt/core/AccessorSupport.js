(pkg => {
    const consoleLog = console.log,
        
        GETTER_NAMES = new Map(), // Caches getter names.
        SETTER_NAMES = new Map(), // Caches setter names.
        
        generateName = (attrName, prefix) => prefix + (attrName[0] ?? '').toUpperCase() + attrName.slice(1),
        generateSetterName = attrName => SETTER_NAMES.get(attrName) ?? (SETTER_NAMES.set(attrName, generateName(attrName, 'set')), SETTER_NAMES.get(attrName)),
        generateGetterName = attrName => GETTER_NAMES.get(attrName) ?? (GETTER_NAMES.set(attrName, generateName(attrName, 'get')), GETTER_NAMES.get(attrName)),
        
        doNormalSetters = (self, attrs) => {
            let canFireEvent;
            for (const attrName in attrs) {
                // Optimization: Inlined self.set for performance.
                const value = attrs[attrName],
                    setterName = generateSetterName(attrName);
                if (setterName in self) {
                    // Call a defined setter function.
                    self[setterName](value);
                } else if (self[attrName] !== value) {
                    // Generic Setter
                    self[attrName] = value;
                    if (canFireEvent ??= self.inited !== false && self.fireEvent) self.fireEvent(attrName, value); // !== false allows this to work with non-nodes.
                }
            }
        },
        
        createGetterFunction = (target, attrName) => {
            const getterName = generateGetterName(attrName);
            if (target[getterName]) consoleLog('Overwriting getter', getterName);
            target[getterName] = function() {return this[attrName];};
        },
        
        createSetterFunction = (target, attrName) => {
            const setterName = generateSetterName(attrName);
            if (target[setterName]) consoleLog('Overwriting setter', setterName);
            target[setterName] = function(v) {
                if (this[attrName] !== v) {
                    this[attrName] = v;
                    if (this.inited) this.fireEvent(attrName, v);
                }
            };
        };
    
    /** Provides support for getter and setter functions on an object.
        
        Attributes:
            earlyAttrs:array An array of attribute names that will be set first.
            lateAttrs:array An array of attribute names that will be set last.
        
        @class */
    pkg.AccessorSupport = new JS.Module('AccessorSupport', {
        // Class Methods and Attributes ////////////////////////////////////////
        extend: {
            /** Generate a setter name for an attribute.
                @returns {string} */
            generateSetterName: generateSetterName,
            
            /** Generate a getter name for an attribute.
                @returns {string} */
            generateGetterName: generateGetterName,
            
            /** Generates a method name by capitalizing the attrName and prepending the prefix.
                @returns {string} */
            generateName: generateName,
            
            /** Creates a standard setter function for the provided attrName on the target. This 
                assumes the target is an myt.Observable.
                @param {!Object} target
                @param {string} attrName
                @returns {undefined} */
            createSetterFunction: createSetterFunction,
            
            /** Creates a standard getter function for the provided attrName on the target.
                @param {!Object} target
                @param {string} attrName
                @returns {undefined} */
            createGetterFunction: createGetterFunction,
            
            createSetterMixin: (propNames, alsoGetters) => {
                const mixin = {};
                for (const propName of propNames) {
                    createSetterFunction(mixin, propName);
                    if (alsoGetters) createGetterFunction(mixin, propName);
                }
                return mixin;
            }
        },
        
        
        // Methods /////////////////////////////////////////////////////////////
        appendToEarlyAttrs: function() {(this.earlyAttrs ??= []).push(...arguments);},
        prependToEarlyAttrs: function() {(this.earlyAttrs ??= []).unshift(...arguments);},
        appendToLateAttrs: function() {(this.lateAttrs ??= []).push(...arguments);},
        prependToLateAttrs: function() {(this.lateAttrs ??= []).unshift(...arguments);},
        
        /** Used to quickly extract and set attributes from the attrs object passed to 
            an initializer.
            @param {?Array} attrNames - An array of attribute names.
            @param {?Object} attrs - The attrs Object to extract values from.
            @returns {undefined}. */
        quickSet: function(attrNames, attrs) {
            if (attrNames) {
                for (const attrName of attrNames) {
                    this[attrName] = attrs[attrName];
                    delete attrs[attrName];
                }
            }
        },
        
        /** Calls a setter function for each attribute in the provided map.
            @param {?Object} attrs - A map of attributes to set.
            @returns {undefined}. */
        callSetters: function(attrs) {
            const self = this,
                earlyAttrs = self.earlyAttrs,
                lateAttrs = self.lateAttrs;
            if (earlyAttrs || lateAttrs) {
                // 01% case is when early or later attrs exist.
                
                // Make a shallow copy of attrs since we will be deleting entries from it and we
                // can't guarantee that it won't be reused.
                const attrsCopy = {...attrs};
                
                // Do early setters
                if (earlyAttrs) {
                    const len = earlyAttrs.length;
                    for (let i = 0; i < len;) {
                        const attrName = earlyAttrs[i++];
                        if (attrName in attrsCopy) {
                            self.set(attrName, attrsCopy[attrName]);
                            delete attrsCopy[attrName];
                        }
                    }
                }
                
                // Extract late setters for later execution
                let extractedLateAttrs;
                if (lateAttrs) {
                    extractedLateAttrs = [];
                    const len = lateAttrs.length;
                    for (let i = 0; i < len;) {
                        const attrName = lateAttrs[i++];
                        if (attrName in attrsCopy) {
                            extractedLateAttrs.push(attrName, attrsCopy[attrName]);
                            delete attrsCopy[attrName];
                        }
                    }
                }
                
                doNormalSetters(self, attrsCopy);
                
                // Do late setters
                if (extractedLateAttrs) {
                    const len = extractedLateAttrs.length;
                    for (let i = 0; i < len;) self.set(extractedLateAttrs[i++], extractedLateAttrs[i++]);
                }
            } else {
                // 99% case is just do normal setters.
                doNormalSetters(self, attrs);
            }
        },
        
        /** A generic getter function that can be called to get a value from this object. Will 
            defer to a defined getter if it exists.
            @param {string} attrName - The name of the attribute to get.
            @returns {*} - The attribute value. */
        get: function(attrName) {
            const getterName = generateGetterName(attrName);
            return (typeof this[getterName] === 'function') ? this[getterName]() : this[attrName];
        },
        
        /** A generic setter function that can be called to set a value on this object. Will defer 
            to a defined setter if it exists. The implementation assumes this object is an 
            Observable so it will have a 'fireEvent' method.
            @param {string} attrName - The name of the attribute to set.
            @param {*} v -The value to set.
            @param {boolean} [skipSetter] - If true no attempt will be made to invoke a setter 
                function. Useful when you want to invoke standard setter behavior. Defaults to 
                undefined which is equivalent to false.
            @returns {undefined} */
        set: function(attrName, v, skipSetter) {
            const self = this;
            
            if (!skipSetter) {
                // Try to call a defined setter function.
                const setterName = generateSetterName(attrName);
                if (typeof self[setterName] === 'function') return self[setterName](v);
            }
            
            // Generic Setter
            if (self[attrName] !== v) {
                self[attrName] = v;
                if (self.inited !== false) self?.fireEvent(attrName, v); // !== false allows this to work with non-nodes.
            }
        }
    });
})(myt);

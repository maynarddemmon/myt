((pkg) => {
    const
        /* Caches getter names. */
        GETTER_NAMES = {},
    
        /* Caches setter names. */
        SETTER_NAMES = {},
        
        generateName = (attrName, prefix) => prefix + attrName.substring(0,1).toUpperCase() + attrName.substring(1),
        generateSetterName = (attrName) => SETTER_NAMES[attrName] || (SETTER_NAMES[attrName] = generateName(attrName, 'set')),
        generateGetterName = (attrName) => GETTER_NAMES[attrName] || (GETTER_NAMES[attrName] = generateName(attrName, 'get'));
    
    /** Provides support for getter and setter functions on an object.
        
        Events:
            None
        
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
            
            /** Generates a method name by capitalizing the attrName and
                prepending the prefix.
                @returns {string} */
            generateName: generateName,
            
            /** Creates a standard setter function for the provided attrName on the
                target. This assumes the target is an myt.Observable.
                @param {!Object} target
                @param {string} attrName
                @returns {undefined} */
            createSetterFunction: (target, attrName) => {
                const setterName = generateSetterName(attrName);
                if (target[setterName]) console.log("Overwriting setter", setterName);
                target[setterName] = (v) => {
                    if (target[attrName] !== v) {
                        target[attrName] = v;
                        if (target.inited) target.fireEvent(attrName, v);
                    }
                };
            },
            
            /** Creates a standard getter function for the provided attrName on the
                target.
                @param {!Object} target
                @param {string} attrName
                @returns {undefined} */
            createGetterFunction: (target, attrName) => {
                const getterName = generateGetterName(attrName);
                if (target[getterName]) console.log("Overwriting getter", getterName);
                target[getterName] = () => target[attrName];
            }
        },
        
        
        // Methods /////////////////////////////////////////////////////////////
        appendToEarlyAttrs: function() {Array.prototype.push.apply(this.earlyAttrs || (this.earlyAttrs = []), arguments);},
        prependToEarlyAttrs: function() {Array.prototype.unshift.apply(this.earlyAttrs || (this.earlyAttrs = []), arguments);},
        appendToLateAttrs: function() {Array.prototype.push.apply(this.lateAttrs || (this.lateAttrs = []), arguments);},
        prependToLateAttrs: function() {Array.prototype.unshift.apply(this.lateAttrs || (this.lateAttrs = []), arguments);},
        
        /** Used to quickly extract and set attributes from the attrs object
            passed to an initializer.
            @param {?Array} attrNames - An array of attribute names.
            @param {?Object} attrs - The attrs Object to extract values from.
            @returns {undefined}. */
        quickSet: function(attrNames, attrs) {
            (attrNames || []).forEach((attrName) => {
                this[attrName] = attrs[attrName];
                delete attrs[attrName];
            });
        },
        
        /** Calls a setter function for each attribute in the provided map.
            @param {?Object} attrs - A map of attributes to set.
            @returns {undefined}. */
        callSetters: function(attrs) {
            const self = this,
                earlyAttrs = self.earlyAttrs,
                lateAttrs = self.lateAttrs;
            let attrName, 
                extractedLateAttrs, 
                i, 
                len;
            if (earlyAttrs || lateAttrs) {
                // Make a shallow copy of attrs since we can't guarantee that
                // attrs won't be reused
                const copyOfAttrs = {};
                for (attrName in attrs) copyOfAttrs[attrName] = attrs[attrName];
                attrs = copyOfAttrs;
                
                // Do early setters
                if (earlyAttrs) {
                    i = 0;
                    len = earlyAttrs.length;
                    while (len > i) {
                        attrName = earlyAttrs[i++];
                        if (attrName in attrs) {
                            self.set(attrName, attrs[attrName]);
                            delete attrs[attrName];
                        }
                    }
                }
                
                // Extract late setters for later execution
                if (lateAttrs) {
                    extractedLateAttrs = [];
                    i = 0;
                    len = lateAttrs.length;
                    while (len > i) {
                        attrName = lateAttrs[i++];
                        if (attrName in attrs) {
                            extractedLateAttrs.push(attrName, attrs[attrName]);
                            delete attrs[attrName];
                        }
                    }
                }
            }
            
            // Do normal setters
            for (attrName in attrs) self.set(attrName, attrs[attrName]);
            
            // Do late setters
            if (extractedLateAttrs) {
                i = 0;
                len = extractedLateAttrs.length;
                while (len > i) self.set(extractedLateAttrs[i++], extractedLateAttrs[i++]);
            }
        },
        
        /** A generic getter function that can be called to get a value from this
            object. Will defer to a defined getter if it exists.
            @param {string} attrName - The name of the attribute to get.
            @returns {*} - The attribute value. */
        get: function(attrName) {
            const getterName = generateGetterName(attrName);
            return this[getterName] ? this[getterName]() : this[attrName];
        },
        
        /** A generic setter function that can be called to set a value on this
            object. Will defer to a defined setter if it exists. The implementation
            assumes this object is an Observable so it will have a 'fireEvent'
            method.
            @param {string} attrName - The name of the attribute to set.
            @param {*} v -The value to set.
            @param {boolean} [skipSetter] - If true no attempt will be made to
                invoke a setter function. Useful when you want to invoke standard 
                setter behavior. Defaults to undefined which is equivalent to false.
            @returns {undefined} */
        set: function(attrName, v, skipSetter) {
            const self = this;
            let setterName;
            
            if (!skipSetter) {
                setterName = generateSetterName(attrName);
                if (self[setterName]) return self[setterName](v);
            }
            
            if (self[attrName] !== v) {
                self[attrName] = v;
                if (self.inited !== false && self.fireEvent) self.fireEvent(attrName, v); // !== false allows this to work with non-nodes.
            }
        }
    });
})(myt);

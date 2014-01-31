/** Provides support for getter and setter functions on an object. */
myt.AccessorSupport = new JS.Module('AccessorSupport', {
    // Class Methods and Attributes ////////////////////////////////////////////
    extend: {
        /** Generate a setter name for an attribute.
            @returns string */
        generateSetterName: function(attrName) {
            return this.SETTER_NAMES[attrName] || (this.SETTER_NAMES[attrName] = this.generateName(attrName, 'set'));
        },
        
        /** Generate a getter name for an attribute.
            @returns string */
        generateGetterName: function(attrName) {
            return this.GETTER_NAMES[attrName] || (this.GETTER_NAMES[attrName] = this.generateName(attrName, 'get'));
        },
        
        /** Generates a method name by capitalizing the attrName and
            prepending the prefix.
            @returns string */
        generateName: function(attrName, prefix) {
            return prefix + attrName.substring(0,1).toUpperCase() + attrName.substring(1);
        },
        
        /** Creates a standard setter function for the provided attrName on the
            target. This assumes the target is an myt.Observable.
            @returns void */
        createSetterFunction: function(target, attrName) {
            var setterName = this.generateSetterName(attrName);
            if (target[setterName]) console.log("Overwriting setter", setterName);
            target[setterName] = function(v) {
                if (target[attrName] !== v) {
                    target[attrName] = v;
                    if (target.inited) target.fireNewEvent(attrName, v);
                }
            };
        },
        
        /** Creates a standard getter function for the provided attrName on the
            target.
            @returns void */
        createGetterFunction: function(target, attrName) {
            var getterName = this.generateGetterName(attrName);
            if (target[getterName]) console.log("Overwriting getter", getterName);
            target[getterName] = function() {
                return target[attrName];
            };
        },
        
        /** Caches getter names. */
        GETTER_NAMES:{},
        
        /** Caches setter names. */
        SETTER_NAMES:{}
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** Calls a setter function for each attribute in the provided map.
        @param attrs:object a map of attributes to set.
        @returns void. */
    callSetters: function(attrs) {
        for (var attrName in attrs) this.set(attrName, attrs[attrName]);
    },
    
    /** A generic getter function that can be called to get a value from this
        object. Will defer to a defined getter if it exists.
        @param attrName:string The name of the attribute to get.
        @returns the attribute value. */
    get: function(attrName) {
        var getterName = myt.AccessorSupport.generateGetterName(attrName);
        return this[getterName] ? this[getterName]() : this[attrName];
    },
    
    /** A generic setter function that can be called to set a value on this
        object. Will defer to a defined setter if it exists. The implementation
        assumes this object is an Observable so it will have a 'fireNewEvent'
        method.
        @param attrName:string The name of the attribute to set.
        @param v:* The value to set.
        @returns void */
    set: function(attrName, v) {
        var setterName = myt.AccessorSupport.generateSetterName(attrName);
        if (this[setterName]) {
            this[setterName](v);
        } else if (this[attrName] !== v) {
            this[attrName] = v;
            if (this.inited !== false && this.fireNewEvent) this.fireNewEvent(attrName, v); // !== false allows this to work with non-nodes.
        }
    },
    
    /** Checks if an attribute is not null or undefined.
        @param attrName:string The name of the attribute to check.
        @returns true if the attribute value is not null or undefined. */
    has: function(attrName) {
        return this.get(attrName) != null;
    },
    
    /** Checks if an attribute is exactly true.
        @param attrName:string The name of the attribute to check.
        @returns true if the attribute value is === true. */
    is: function(attrName) {
        return this.get(attrName) === true;
    },
    
    /** Checks if an attribute is not exactly true. Note: this is not the same
        as testing exactly false.
        @param attrName:string The name of the attribute to check.
        @returns true if the attribute value is !== true. */
    isNot: function(attrName) {
        return this.get(attrName) !== true;
    }
});

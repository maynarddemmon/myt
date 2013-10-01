/** Provides support for getter and setter functions on an object. */
myt.AccessorSupport = new JS.Module('AccessorSupport', {
    // Class Methods and Attributes ////////////////////////////////////////////
    extend: {
        /** Generate a setter name for an attribute.
            @returns string */
        generateSetterName: function(attrName) {
            var setterName = this.SETTER_NAMES[attrName];
            if (setterName === undefined) {
                this.SETTER_NAMES[attrName] = setterName = this.generateName(attrName, 'set');
            }
            return setterName;
        },
        
        /** Generate a getter name for an attribute.
            @returns string */
        generateGetterName: function(attrName) {
            var getterName = this.GETTER_NAMES[attrName];
            if (getterName === undefined) {
                this.GETTER_NAMES[attrName] = getterName = this.generateName(attrName, 'get');
            }
            return getterName;
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
            if (target[setterName]) console.log("warning overwriting setter", setterName);
            target[setterName] = function(v) {
                if (target[attrName] === v) return;
                target[attrName] = v;
                if (target.inited) target.fireNewEvent(attrName, v);
            };
        },
        
        /** Creates a standard getter function for the provided attrName on the
            target.
            @returns void */
        createGetterFunction: function(target, attrName) {
            var getterName = this.generateGetterName(attrName);
            if (target[getterName]) console.log("warning overwriting getter", getterName);
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
        @returns the attribute value. */
    get: function(attrName) {
        var getterName = myt.AccessorSupport.generateGetterName(attrName);
        if (this[getterName]) {
            return this[getterName]();
        } else {
            return this[attrName];
        }
    },
    
    /** A generic setter function that can be called to set a value on this
        object. Will defer to a defined setter if it exists. The implementation
        assumes this object is an Observable so it will have a 'fireNewEvent'
        method.
        @returns void */
    set: function(attrName, v) {
        var setterName = myt.AccessorSupport.generateSetterName(attrName);
        if (this[setterName]) {
            this[setterName](v);
        } else {
            if (this[attrName] === v) return;
            this[attrName] = v;
            if ((this.inited || this.inited === undefined) && this.fireNewEvent) { // undefined check is for useage with non Nodes.
                this.fireNewEvent(attrName, v);
            }
        }
    },
    
    /** @returns true if the attribute value is not null or undefined. */
    has: function(attrName) {
        return this.get(attrName) != null;
    },
    
    /** Checks if an attribute is exactly true.
        @returns true if the attribute value is === true. */
    is: function(attrName) {
        return this.get(attrName) === true;
    },
    
    /** Checks if an attribute is not exactly true. Note: this is not the same
        as testing exactly false.
        @returns true if the attribute value is !== true. */
    isNot: function(attrName) {
        return this.get(attrName) !== true;
    }
});

(exports => {
    const 
        /*  Gets an array of JS.Methods for the provided method name.
            @param {string} name - The name of the method to lookup.
            @returns {!Array} An array of JS.Methods from the ancestors chain. */
        lookup = (module, name) => {
            const cached = module.__mct__.get(name);
            if (cached) return cached.slice();
            
            // Get the ancestor classes array
            const methods = [],
                cachedAncestors = module.__anc__;
            if (cachedAncestors) {
                const len = cachedAncestors.length;
                for (let i = 0; i < len;) {
                    const fns = cachedAncestors[i++].__fns__;
                    if (fns.has(name)) methods.push(fns.get(name));
                }
            } else {
                const ancestors = module.__anc__ = [],
                    walk = theModule => {
                        const includes = theModule.__inc__,
                            len = includes.length;
                        for (let i = 0; i < len;) walk(includes[i++]);
                        if (!ancestors.includes(theModule)) {
                            ancestors.push(theModule);
                            const fns = theModule.__fns__;
                            if (fns.has(name)) methods.push(fns.get(name));
                        }
                    };
                walk(module);
            }
            module.__mct__.set(name, methods.slice());
            return methods;
        },
        
        compile = (method, hostModule) => {
            const callable = method.callable;
            return method.__hs ? function(...args) {
                const existing = this.callSuper,
                    methods = lookup(hostModule, method.name);
                let stackIndex = methods.length - 1;
                if (stackIndex === 0) {
                    if (existing) delete this.callSuper;
                } else {
                    const argsLen = args.length,
                        _super = this.callSuper = (...superArgs) => {
                            for (let i = superArgs.length; i < argsLen;) superArgs[i] = args[i++];
                            if (--stackIndex === 0) delete this.callSuper;
                            const returnValue = methods[stackIndex].callable.call(this, ...superArgs);
                            this.callSuper = _super;
                            stackIndex++;
                            return returnValue;
                        };
                }
                const returnValue = callable.call(this, ...args);
                if (existing) {
                    this.callSuper = existing;
                } else {
                    delete this.callSuper;
                }
                return returnValue;
            } : callable;
        },
        
        resolveModule = (module, hostModule) => {
            hostModule = hostModule ?? module;
            
            if (hostModule === module) {
                module.__anc__ = null;
                module.__mct__ = new Map();
                const dep = module.__dep__;
                for (let i = dep.length; i > 0;) resolveModule(dep[--i]);
            }
            
            const target = hostModule.__tgt__,
                inc = module.__inc__,
                len = inc.length;
            for (let i = 0; i < len;) resolveModule(inc[i++], hostModule);
            
            for (const [key, method] of module.__fns__) {
                const compiled = method instanceof Method ? compile(method, hostModule) : method;
                if (target[key] !== compiled) target[key] = compiled;
            }
        },
        
        eigenFunc = target => target.__meta__ ?? (target.__meta__ = new Module(null, null, target)).include(target.klass, true),
        
        makeClass = parent => {
            const constructor = function(...args) {return this.initialize(...args) ?? this;};
            constructor.prototype = Object.create(parent.prototype);
            return constructor;
        },
        
        createMethod = (module, name, callable) => callable?.__fns__ || typeof callable !== 'function' ? callable : new Method(module, name, callable),
        
        Method = makeClass(Object),
        Module = exports.Module = makeClass(Object);
    
    Method.prototype.initialize = function(module, name, callable) {
        this.module = module;
        this.name = name;
        this.callable = callable;
        
        // Indicates if this Method has a super call or not.
        this.__hs = callable.toString().includes('callSuper');
    };
    
    const moduleProto = Module.prototype;
    moduleProto.initialize = function(name, methods, target) {
        this.__inc__ = [];
        this.__dep__ = [];
        this.__fns__ = new Map();
        this.__mct__ = new Map();
        this.__tgt__ = target;
        
        if (name) this.__displayName = name;
        
        this.include(methods, true);
    };
    /*  Mixes a module into this module.
        @param {!Function} module - The JS.Module to mix in.
        @param {boolean} [noResolve]
        @returns {!Function) this JS.Module. */
    moduleProto.include = function(module, noResolve) {
        if (module) {
            if (module.__fns__) {
                this.__inc__.push(module);
                module.__dep__.push(this);
            } else {
                const extend = module.extend,
                    include = module.include;
                if (extend && (extend.__fns__ || typeof extend !== 'function')) this.extend(extend);
                if (include && (include.__fns__ || typeof include !== 'function')) {
                    const len = include.length;
                    for (let i = 0; i < len;) this.include(include[i++], true);
                }
                
                for (const field of Object.getOwnPropertyNames(module)) {
                    // ES6 Class compatibility: Every prototype has a constructor; it is never a 
                    // mixin method.
                    if (field === 'constructor') continue;
                    
                    // ES6 Class compatibility: Accessors are only read when enumerable, which 
                    // preserves the historical behavior for object literals. Reading a 
                    // non-enumerable accessor would invoke a native class getter against the 
                    // prototype itself.
                    const descriptor = Object.getOwnPropertyDescriptor(module, field);
                    if ((descriptor.get || descriptor.set) && !descriptor.enumerable) continue;
                    
                    const value = module[field];
                    if ((field !== 'extend' && field !== 'include') || (!value.__fns__ && typeof value === 'function')) {
                        // Adds a single named method to a JS.Class/JS.Module. If you’re modifying 
                        // a class, the method instantly becomes available in instances of the 
                        // class, and in its subclasses.
                        if (this.__fns__.has(field)) {
                            // Handles the case where the new function would clobber an existing 
                            // one. This can occur by using Module.extend twice with the same named
                            // function. By turning it into a formal Module it gets put into the
                            // ancestor chain and thus callSuper will work as expected.
                            console.warn('JS.Module already has field: "' + field + '" auto generating a JS.Module from the field for inclusion.');
                            this.include(new Module('Auto_' + field, {[field]:value}), false);
                        } else {
                            this.__fns__.set(field, createMethod(this, field, value));
                        }
                    }
                }
            }
            if (noResolve !== true) resolveModule(this);
        }
        return this;
    };
    /*  Checks if this module includes the provided Module.
        @param {!Function} module - The module to check for.
        @returns {boolean} True if the module is included, otherwise false. */
    moduleProto.includes = function(module) {
        if (module === this) return true;
        const inc = this.__inc__, 
            len = inc.length;
        for (let i = 0; i < len;) {
            if (inc[i++].includes(module)) return true;
        }
        return false;
    };
    /*  Extracts a single named method from a Module.
        @param {string} name - The name of the method to extract.
        @return {!Function) The extracted JS.Method. */
    moduleProto.instanceMethod = function(name) {
        return lookup(this, name).pop();
    };
    
    const Kernel = new Module('Kernel', {
        extend: function(module) {
            eigenFunc(this).include(module);
        },
        /** Checks if this object includes, extends or is the provided Module.
            @param {!Function} module - The JS.Module module to check for.
            @returns {boolean} */
        isA: function(module) {
            return (typeof module === 'function' && this instanceof module) || eigenFunc(this).includes(module);
        }
    });
    
    const Class = exports.Class = makeClass(Module),
        classProto = Class.prototype;
    classProto.initialize = function(name, parent, methods) {
        if (typeof parent !== 'function') {
            methods = parent;
            parent  = Object;
        }
        
        Module.prototype.initialize.call(this, name);
        
        const klass = makeClass(parent);
        
        // The klass extends from this.
        for (const field in this) {
            if (klass[field] !== this[field] && !Object.hasOwn(klass, field)) klass[field] = this[field];
        }
        
        klass.prototype.constructor = klass.prototype.klass = klass;
        eigenFunc(klass).include(parent.__meta__);
        klass.__tgt__ = klass.prototype;
        
        const parentModule = parent === Object ? {} : (parent.__fns__ ? parent : new Module(null, parent.prototype));
        klass.include(Kernel, true).include(parentModule, true).include(methods, true);
        
        resolveModule(klass);
        
        return klass;
    };
    
    const classify = (klass, parent) => {
        klass.__inc__ = [];
        klass.__dep__ = [];
        const proto = klass.__tgt__ = klass.prototype,
            methods = klass.__fns__ = new Map();
        
        for (const field of Object.keys(proto)) methods.set(field, createMethod(klass, field, proto[field]));
        proto.constructor = proto.klass = klass;
        
        // The klass extends from Class.prototype.
        for (const field in classProto) {
            if (klass[field] !== classProto[field] && !Object.hasOwn(klass, field)) klass[field] = classProto[field];
        }
        
        klass.include(parent);
        klass.constructor = klass.klass = Class;
    };
    classify(Method, Kernel);
    classify(Module, Kernel);
    classify(Class,  Module);
    
    resolveModule(eigenFunc(Method));
    resolveModule(eigenFunc(Module));
    eigenFunc(Class).include(Module.__meta__);
    
    /** Create a single instance of a "private" class. */
    exports.Singleton = new Class('Singleton', {
        initialize: (name, parent, methods) => new (new Class(name, parent, methods))
    });
})(globalThis.JS ?? (globalThis.JS = {}));

(global => {
    /*
     * http://github.com/maynarddemmon/myt
     * Maynard Demmon <maynarddemmon@gmail.com>
     * @copyright Copyright (c) 2012-2023 Maynard Demmon and contributors
     * Tym: A simple javascript framework for use in NodeJS
     * Version: 20240721.2035
     * MIT License
     * 
     * Parts of the Software incorporates code from the following open-source projects:
     * * JS.Class, (c) 2007-2012 James Coglan and contributors (MIT License)
     */
    
    let 
        // Used to generate globally unique IDs.
        GUID_COUNTER = 0,
        
        // The current locale for the user.
        currentLocale;
    
    const consoleWarn = console.warn,
        
        math = Math,
        {abs:mathAbs, min:mathMin, max:mathMax, pow:mathPow} = math,
        
        isArray = Array.isArray,
        
        // Start:I18N //
        // The default locale for I18N.
        defaultLocale = 'en-US',
        
        // The localization dictionaries for I18N
        dictionaries = {},
        
        // Matches plural replacements of the form: {{plural:$<index>|<singular>|<plural>}}
        I18N_PLURAL_REGEX = /\{\{plural:\$(\d+)\|([^|]+)\|([^}]+)\}\}/g,
        
        // Matches numeric placeholders such as $0, $1, etc.
        I18N_NUMERIC_ARG_REGEX = /\$(\d+)/g,
        // End:I18N //
        
        /*  Creates a memoized version of the provided function.
            @param {!Function} func - The function to memoize.
            @param {Function} [keyResolver] - Optional function to generate custom keys. Defaults 
                to JSON.stringify.
            @param {number} [cacheLimit] - Optional maximum size of the cache. Defaults 
                to unlimited.
            @returns {!Function} - The memoized function. */
        memoize = (func, keyResolver=JSON.stringify, cacheLimit=Infinity) => {
            const cache = new Map();
            return (...args) => {
                const key = keyResolver(args);
                if (cache.has(key)) return cache.get(key);
                
                const result = func(...args);
                cache.set(key, result);
                
                if (cache.size > cacheLimit) {
                    const firstKey = cache.keys().next().value;
                    cache.delete(firstKey);
                }
                return result;
            };
        },
        
        /*  Generates a globally unique id, (GUID).
            @returns {number} */
        generateGuid = () => ++GUID_COUNTER,
        
        /*  Test if two values are deeply equal to each other. Handles primitives, Dates, Objects
            and Arrays. Tracks Objects it has seen to prevent stack overflows from cycles. */
        deepEqual = (a, b, seenA=new WeakMap()) => {
            // First do a quick reference check and tests primitives.
            if (a !== b) {
                // Make Dates something easy to compare.
                const aIsDate = a instanceof Date,
                    bIsDate = b instanceof Date;
                if (aIsDate || bIsDate) {
                    if (aIsDate && bIsDate) {
                        const timeA = a.getTime(),
                            timeB = b.getTime();
                        return timeA === timeB || (isNaN(timeA) && isNaN(timeB));
                    }
                    return false;
                }
                
                // Treat NaNs as equivalent
                if (Number.isNaN(a) && Number.isNaN(b)) return true;
                
                // Ensure we're now dealing with two Objects (or Arrays).
                if (a === null || b === null || typeof a !== 'object' || typeof b !== 'object') return false;
                
                // Prevent cycles
                if (seenA.get(a) === b) return true;
                seenA.set(a, b);
                
                // Quick check for Array vs Object.
                const isArrA = isArray(a),
                    isArrB = isArray(b);
                if (isArrA !== isArrB) return false;
                
                // Check Arrays
                if (isArrA) {
                    const lenA = a.length;
                    if (lenA !== b.length) return false;
                    for (let i = 0; i < lenA; i++) {
                        if (!deepEqual(a[i], b[i], seenA)) return false;
                    }
                    return true;
                }
                
                // Check Objects
                const keysA = Object.keys(a),
                    keysB = Object.keys(b);
                if (keysA.length !== keysB.length) return false;
                for (const key of keysA) {
                    if (!Object.hasOwn(b, key)) return false;
                    if (!deepEqual(a[key], b[key], seenA)) return false;
                }
            }
            return true;
        },
        
        CURLY_BRACES_WITH_ESCAPES_REGEX = /\\([{}])|\{([^{}]+)\}/g,
        CSV_OBJECT_REGEX = /(,|\r?\n|\r|^)(?:"((?:\\.|""|[^\\"])*)"|([^,"\r\n]*))/g,
        CSV_UNESCAPE_REGEX = /[\\"](.)/g,
        
        tym = global.tym = {
            /** A version number based on the time this distribution of tym was created. */
            version:202609072223, // <<< BUILD_VERSION_THIS
            
            generateGuid,
            
            TRUE_FUNC: () => true,
            FALSE_FUNC: () => false,
            NOOP: () => {},
            
            
            // Object Utility Functions ////////////////////////////////////////
            /** Takes a '.' separated string such as "foo.bar.baz" and resolves it into the value 
                found at that location relative to a starting scope. If no scope is provided global 
                scope is used.
                @param {string|?Array} objName - The name to resolve or an array of path parts in 
                    descending order.
                @param {?Object} [scope] - The scope to resolve from. If not provided global scope 
                    is used.
                @returns {?Object} The referenced object or undefined if resolution failed. */
            resolveName: (objName, scope) => {
                if (!objName || objName.length === 0) return undefined;
                
                scope = scope ?? globalThis;
                
                const origScope = scope,
                    parts = isArray(objName) ? objName : objName.split('.'), 
                    len = parts.length;
                for (let i = 0; i < len; i++) {
                    scope = scope[parts[i]];
                    if (scope == null && i < len - 1) {
                        consoleWarn('resolveName failed for', objName, 'at part', i, parts[i], origScope);
                        return undefined;
                    }
                }
                return scope;
            },
            
            /** Resolves a provided string into a JS.Class object. If a non-string value is 
                provided it is verified to be a JS.Class object.
                @param {*} value - The value to resolve and/or verify.
                @returns {?Function} - A JS.Class or null if the string could not be resolved or 
                    the value was not a JS.Class object. */
            resolveClassname: value => {
                if (typeof value === 'string') value = tym.resolveName(value);
                
                // Make sure what we found is really a JS.Class otherwise return null.
                return (value && typeof value.isA === 'function' && value.isA(JS.Class)) ? value : null;
            },
            
            /** Set a value deep into an Object tree creating any missing objects as needed.
                @param {?Object} root - The Object to set the value on. If falsy no action will
                    be taken.
                @param {string|?Array} path - The path into the Object structure. Either an array 
                    of names or a string with "." delimiters between names. If not falsy nothing 
                    will be set.
                @param {*} [value] - The value to set. If not provided undefined will be used.
                @returns {*} - The value that was set or undefined if the operation failed. And yes,
                    this means determining the success of setting undefined might be confusing. */
            setDeepValue: (root, path, value) => {
                if (root && path) {
                    const keys = isArray(path) ? path : String(path ?? '').split('.'),
                        len  = keys.length - 1;
                    let curr = root;
                    for (let i = 0; i < len; i++) {
                        const key = keys[i];
                        curr[key] ??= {};
                        curr = curr[key];
                    }
                    return curr[keys[len]] = value;
                }
            },
            
            stableStringify: obj => JSON.stringify(obj, (key_ignored, value) => {
                /* Only re-order plain objects; leave arrays and primitives untouched.
                   This works because iteration order is insertion order of String based keys.
                   Note: you can't have both a numeric and string key in an Object that serializes
                   to the same value, eg. 2 and "2" can't both exist. */
                if (value && typeof value === 'object' && !isArray(value)) {
                    const sorted = {};
                    for (const key of Object.keys(value).sort()) sorted[key] = value[key];
                    return sorted;
                }
                return value;
            }),
            
            
            // Equality Tests //////////////////////////////////////////////////
            /** Tests if two floats are essentially equal to each other.
                @param {number} a - A float
                @param {number} b - A float
                @param {number} [epsilon] - The percent of difference of the smaller magnitude 
                    number allowed between a and b. Defaults to 0.000001 if not provided.
                @returns {boolean} true if equal, false otherwise. */
            areFloatsEqual: (a, b, epsilon) => {
                const absA = mathAbs(a),
                    absB = mathAbs(b);
                return mathAbs(a - b) <= (absA > absB ? absB : absA) * (epsilon == null ? 0.000001 : mathAbs(epsilon));
            },
            
            /** Tests if two Arrays are shallowly equal.
                @param {?Array} a
                @param {?Array} b
                @returns {boolean} */
            areArraysEqual: (a, b) => {
                // First do a quick reference check and tests primitives.
                if (a !== b) {
                    // Ensure we're now dealing with two Objects (or Arrays).
                    if (a === null || b === null || typeof a !== 'object' || typeof b !== 'object') return false;
                    
                    let i = a.length;
                    if (i !== b.length) return false;
                    
                    while (i) {
                        if (a[--i] !== b[i]) return false;
                    }
                }
                return true;
            },
            
            /** Tests if two objects are shallowly equal.
                @param {?Object} a
                @param {?Object} b
                @returns {boolean} */
            shallowEqual: (a, b) => {
                // First do a quick reference check and tests primitives.
                if (a !== b) {
                    // Ensure we're now dealing with two Objects (or Arrays).
                    if (a === null || b === null || typeof a !== 'object' || typeof b !== 'object') return false;
                    
                    // Quick test using key counts.
                    const keysA = Object.keys(a),
                        keysB = Object.keys(b);
                    if (keysA.length !== keysB.length) return false;
                    
                    // Shallow compare values for each key
                    for (const key of keysA) {
                        if (a[key] !== b[key]) return false;
                    }
                }
                return true;
            },
            
            deepEqual,
            
            
            // Random numbers //////////////////////////////////////////////////
            /** Generates a random number between 0 (inclusive) and 1 (exclusive)
                @param {?Function} [func] - A distribution function for the random numbers. The 
                    function should map a number between 0 and 1 to another number between 0 
                    (inclusive) and 1 (exclusive). If not provided a flat distribution will be 
                    used. Example functions:
                        - function(v) {return v * v;} will skew the value towards 0.
                        - function(v) {return 0.9999999999 - v * v;} will skew the value towards a 
                          value very close to 1.
                @returns {number} a random number between 0 and almost 1. */
            getRandom: func => {
                const v = math.random();
                // Min and max is to correct for badly behaved skew functions.
                return func ? mathMax(0, mathMin(func(v), 0.9999999999)) : v;
            },
            
            /** @returns a random number between min (inclusive) and max (exclusive).
                @param {number} min - the minimum value returned.
                @param {number} max - the maximum value returned.
                @param {?Function} [func] - A distribution function. See tym.getRandom for more.
                @returns {number} a number between min and max. */
            getRandomArbitrary: (min, max, func) => {
                const actualMin = mathMin(min, max);
                return tym.getRandom(func) * (mathMax(min, max) - actualMin) + actualMin;
            },
            
            /** Generates a random integer between min (inclusive) and max (inclusive).
                @param {number} min - the minimum value returned.
                @param {number} max - the maximum value returned.
                @param {?Function} [func] - A distribution function. See tym.getRandom for more.
                @returns {number} a number between min and max. */
            getRandomInt: (min, max, func) => {
                const actualMin = mathMin(min, max);
                return math.floor(tym.getRandom(func) * (mathMax(min, max) - actualMin + 1) + actualMin);
            },
            
            
            // Sort Utility ////////////////////////////////////////////////////
            /** Checks if the provided array is sorted according to the provided comparator function.
                @param {!Array} arr - The array to check.
                @param {!Function} comparatorFunc - The comparator function to use for sorting checks.
                @returns {boolean} - True if the array is sorted, false otherwise. */
            isSorted: (arr, comparatorFunc) => {
                const len = arr.length;
                for (let i = 1; i < len; i++) {
                    if (comparatorFunc(arr[i - 1], arr[i]) > 0) return false;
                }
                return true;
            },
            
            /** Chains together N comparator functions into a new comparator function such that 
                calls each in order of descending priority.
                @param {...!Function} comparatorFunctions - The comparator functions to call.
                @returns {!Function} - The new composite comparator function. */
            chainSortFunc: (...comparatorFunctions) => {
                return (a, b) => {
                    for (const comparatorFunc of comparatorFunctions) {
                        const retval = comparatorFunc(a, b);
                        if (retval !== 0) return retval;
                    }
                    return 0;
                };
            },
            
            /** Gets an alphanumeric sort function for sorting Objects by a named property or
                Arrays by an index. Object property values that are falsy are coerced to "" if 
                fixNonStrings is false.
                @param {string|number} propName - The name of the property to sort by or an index
                    if the things being sorted are Arrays.
                @param {boolean} ascending
                @param {boolean} caseInsensitive
                @param {boolean} fixNonStrings When true non-string values will be converted to 
                    strings by concatenating them with "".
                @returns {!Function} */
            getAlphaObjSortFunc: memoize((propName, ascending, caseInsensitive, fixNonStrings) => {
                const order = ascending ? 1 : -1,
                    locale = tym.I18N.getLocale(),
                    options = {sensitivity:caseInsensitive ? 'accent' : 'variant'};
                return (a, b) => {
                    a = a[propName];
                    b = b[propName];
                    if (fixNonStrings) {
                        // Fix non-string values
                        if (typeof a !== 'string') a = '' + a;
                        if (typeof b !== 'string') b = '' + b;
                    } else {
                        // Otherwise, only fix falsy values, typically null or undefined.
                        a = a || '';
                        b = b || '';
                    }
                    return a.localeCompare(b, locale, options) * order;
                };
            }),
            
            /** Gets a numeric sort function for sorting Objects by a named property. Object 
                property values that are falsy are coerced to 0.
                @param {string} propName
                @param {boolean} ascending
                @returns {!Function} */
            getNumericObjSortFunc: memoize((propName, ascending) => {
                const order = ascending ? 1 : -1;
                return (a, b) => {
                    // Fix falsy values, typically null or undefined.
                    a = a[propName] || 0;
                    b = b[propName] || 0;
                    return (a - b) * order;
                };
            }),
            
            
            // String Utility Functions ////////////////////////////////////////
            /** Creates a non-secure hash of a string.
                @param {string} s - The string to hash.
                @returns {number} */
            hash: s => s.split('').reduce((a, b) => {a = ((a << 5) - a) + b.charCodeAt(0); return a&a;}, 0),
            
            /** Gets the file extension from a file name.
                @param {string} fileName - The filename to extract the extension from.
                @returns {string} - The file extension, or null if a falsy fileName argument was 
                    provided. */
            getExtension: fileName => {
                if (fileName) {
                    const parts = fileName.split('.');
                    return parts.length > 1 ? parts.pop() : null;
                } else {
                    return null;
                }
            },
            
            /** Truncates the beginning of a string, replacing everything before a matched substring 
                (and the substring itself) with an ellipsis string. Checks each entry in matches, in 
                order, against str and truncates at the first one found.
                @param {string} str - The string to truncate.
                @param {string|?Array} [matches] - A substring, or array of substrings, to search for 
                    within str. The array is checked in order; the first entry that is found in str 
                    (via indexOf) determines where the string is cut. Defaults to an empty array, 
                    in which case no match is possible.
                @param {string} [ellipsisStr] - The string prepended to the truncated result. 
                    Defaults to '…'.
                @returns {string} - The portion of str after the matched substring, prefixed with 
                    ellipsisStr, or the original str unchanged if none of the matches were found. */
            leftTruncate: (str, matches=[], ellipsisStr='…') => {
                for (const match of isArray(matches) ? matches : [matches]) {
                    const idx = str.indexOf(match);
                    if (idx !== -1) return ellipsisStr + str.slice(idx + match.length);
                }
                return str;
            },
            
            /** Truncates the middle of a string, keeping a fixed number of characters from the start 
                and end and replacing the removed middle portion with an ellipsis string. If text is 
                already short enough to fit within the prefix/suffix/ellipsis budget, it is returned 
                unchanged.
                @param {string} text - The string to truncate. If not a string, an empty string is 
                    returned.
                @param {number} [prefixCharCount] - The number of characters to keep from the start 
                    of text. Defaults to 10.
                @param {number} [suffixCharCount] - The number of characters to keep from the end of 
                    text. Defaults to 10.
                @param {string} [ellipsisStr] - The string inserted between the kept prefix and suffix 
                    in place of the removed middle. Defaults to '…', which is treated as taking up 3 
                    characters when checking whether truncation is needed (rather than its actual 
                    length of 1).
                @returns {string} - The truncated string, or the original text if it is short enough 
                    to not require truncation, or '' if text is not a string. */
            middleTruncate: (text, prefixCharCount=10, suffixCharCount=10, ellipsisStr='…') => {
                if (typeof text !== 'string') return '';
                const ellipsisLen = ellipsisStr === '…' ? 3 : ellipsisStr.length;
                if (text.length <= prefixCharCount + suffixCharCount + ellipsisLen) return text;
                return text.slice(0, prefixCharCount) + ellipsisStr + text.slice(text.length - suffixCharCount);
            },
            
            /** Format a number between 0 and 1 as a percentage.
                @param {number} num The number to convert.
                @param {number} [fixed] The number of decimal places to use during formatting. If 
                    the percentage is a whole number no decimal places will be used. For example,
                    0.55781 -> 55.78% and 0.55 -> 55%
                @returns {string} */
            formatAsPercentage: (num, fixed=2) => {
                switch (typeof num) {
                    case 'number': {
                        fixed = mathMin(16, mathMax(0, fixed));
                        const percent = math.round(mathMax(0, mathMin(1, num)) * mathPow(10, 2+fixed)) / mathPow(10, fixed);
                        return (percent % 1 === 0 ? percent : percent.toFixed(fixed)) + '%';
                    } case 'string':
                        // Assume a string passed to this function is already correctly formatted 
                        // so pass it through unchanged.
                        return num;
                    default:
                        consoleWarn('formatAsPercentage expects a number');
                        return num;
                }
            },
            
            /** Replace data by key into a string template where the template uses {key} to 
                indicate where the replacement occurs. The \ character can be used to escape
                curly braces that should not be treated as a replacement target.
                @param {string} template - The template to do replacements on and return. If not
                    provided or falsy, empty string will be returned.
                @param {!Object= data - The data to use for replacements in the template.
                @returns {string} - The interpolated string. */
            interpolateString: (template, data={}) => {
                return template ? template.replace(
                    CURLY_BRACES_WITH_ESCAPES_REGEX,
                    (match, escapedChar, key) => {
                        // If we encounter \{ or \}, `escapedChar` is "{" or "}", so return it.
                        if (escapedChar) return escapedChar;
                        
                        // Otherwise it was a real {key}—replace if found, or leave "{key}" intact.
                        return tym.resolveName(key, data) ?? match;
                        //return key in data ? tym.resolveName(key, data) : match;
                    }
                ) : '';
            },
            
            /** Convert a number to a string of a minimum length. Zero or more of a padding 
                character are prepended to achieve the minimum length.
                @param {number} num - The number to format.
                @param {number} length - The minimum length of the formatted return string.
                @param {string} [padChar] - The character to left pad with. Defaults to the 
                    string "0".
                @param {number} [base] - The base for the formatted number. Defaults to base 10.
                @returns {string} - The formatted number. */
            leftPadNumber: (num, length, padChar='0', base=10) => {
                const numStr = num.toString(base);
                return padChar.repeat(mathMax(length - numStr.length, 0)) + numStr;
            },
            
            /** Remove HTML markup from the provided string.
                @param {string} str - The string to remove the markup from.
                @param {?Objet} [cfg] - Provides additional information about how to do the
                    conversion. The only supported config parameter is the boolean
                    brToLineFeed which converts <br> tags to \n characters.
                @returns {string} - The string with markup removed or empty string if something
                    falsy was provided. */
            removeMarkup: (str, cfg) => {
                if (!str) return '';
                if (cfg?.brToLineFeed) str = str.replace(/<br\s*\/?>/gi, '\n');
                return str.replace(/<\/?[^>]+(>|$)/g, '');
            },
            
            escapeMarkup: (() => {
                const REGEX = new RegExp('[&<>"\']', 'g'),
                    MAP = {
                        '&':'&amp;',
                        '<':'&lt;',
                        '>':'&gt;',
                        '"':'&quot;',
                        "'":'&#039;'
                    },
                    MATCH_FUNC = match => MAP[match];
                return str => str.replace(REGEX, MATCH_FUNC);
            })(),
            
            
            // Function Utility Functions //////////////////////////////////////
            /** Memoize a function.
                @param {!Function} func - The function to memoize
                @returns {!Function} - The memoized function. */
            memoize,
            
            /** Creates a debounced function that delays invoking the provided function until after
                the specified wait time has elapsed since the last time it was invoked.
                @param {!Function} func - The function to debounce.
                @param {number} [wait] - The number of milliseconds to delay.
                @param {boolean} [immediate=false] - Whether to invoke the function immediately on the leading edge.
                @returns {!Function} - A debounced version of the provided function. */
            debounce: (func, wait, immediate=false) => {
                let timeout;
                return function(...args) {
                    const context = this,
                        later = () => {
                            timeout = null;
                            if (!immediate) func.apply(context, args);
                        },
                        callNow = immediate && !timeout;
                    clearTimeout(timeout);
                    timeout = setTimeout(later, wait);
                    if (callNow) func.apply(context, args);
                };
            },
            
            
            // Misc ////////////////////////////////////////////////////////////
            dataURIToBlob: dataURI => {
                const idx = dataURI.indexOf(','),
                    mimeStr = dataURI.slice(0, idx).split(':')[1].split(';')[0];
                let data = dataURI.slice(idx + 1);
                if (mimeStr.startsWith('text/')) {
                    data = decodeURIComponent(data);
                } else {
                    const binStr = atob(data);
                    let i = binStr.length;
                    const intArr = new Uint8Array(i);
                    while (i) intArr[--i] = binStr.charCodeAt(i);
                    data = intArr;
                }
                return new Blob([data], {type:mimeStr});
            },
            
            /** Mixes threshold counter functionality with a fixed threshold onto the provided 
                scope. A threshold is exceeded when the counter value equals the threshold value.
                @param {!Object|!Function} scope - Either an tym.Observable, JS.Class or JS.Module 
                    to mix onto.
                @param {number} thresholdValue - The fixed threshold value.
                @param {string} exceededAttrName - The name of the boolean attribute that will 
                    indicate if the threshold is exceeded or not.
                @param {string} [counterAttrName] - The name of the number attribute that will get 
                    adjusted up and down. If not provided the 'exceeded' attribute name will be 
                    used with 'Counter' appended to it. For example if the exceeded attribute was 
                    'locked' this would be 'lockedCounter'.
                @returns {boolean} - True if creation succeeded, false otherwise. */
            createFixedThresholdCounter: (scope, thresholdValue, exceededAttrName, counterAttrName) => {
                const genNameFunc = tym.AccessorSupport.generateName,
                    isModuleOrClass = typeof scope === 'function' || scope instanceof JS.Module,
                    mod = {};
                counterAttrName = counterAttrName || genNameFunc('counter', exceededAttrName);
                
                const incrName = genNameFunc(counterAttrName, 'increment'),
                    decrName = genNameFunc(counterAttrName, 'decrement');
                
                // Prevent clobbering
                if ((isModuleOrClass ? scope.instanceMethod(incrName) : scope[incrName]) !== undefined) {
                    consoleWarn('Increment: Abort clobber', incrName, scope);
                    return false;
                }
                if ((isModuleOrClass ? scope.instanceMethod(decrName) : scope[decrName]) !== undefined) {
                    consoleWarn('Decrement: Abort clobber', decrName, scope);
                    return false;
                }
                
                // Define the "module".
                /** Increments the counter attribute on the scope object by 1.
                    @returns {void} */
                mod[incrName] = function() {
                    const value = this[counterAttrName] + 1;
                    this[counterAttrName] = value;
                    this.fireEvent(counterAttrName, value);
                    if (value === thresholdValue) this.set(exceededAttrName, true);
                };
                
                /** Decrements the counter attribute on the scope object by 1.
                    @returns {void} */
                mod[decrName] = function() {
                    const curValue = this[counterAttrName];
                    if (curValue === 0) return;
                    const value = curValue - 1;
                    this[counterAttrName] = value;
                    this.fireEvent(counterAttrName, value);
                    if (curValue === thresholdValue) this.set(exceededAttrName, false);
                };
                
                // Mixin in the "module"
                scope[isModuleOrClass ? 'include' : 'extend'](mod);
                
                return true;
            },
            
            
            // CSV /////////////////////////////////////////////////////////////
            /** Converts a CSV string to an array of arrays or an array of objects.
                Code from: https://gist.github.com/plbowers/7560ae793613ee839151624182133159
                @param {string} [strData]
                @param {boolean} [header] - If true each row will be converted to an object with 
                    keys based on the first row being treated as an array of header strings.
                @returns {!Array} An array of arrays or an array of objects if the header param 
                    is true. */
            csvStringToArray: (strData, header) => {
                if (!strData) return [];
                
                const arrData = [[]];
                let arrMatches;
                while (arrMatches = CSV_OBJECT_REGEX.exec(strData)) {
                    if (arrMatches[1].length && arrMatches[1] !== ',') arrData.push([]);
                    arrData[arrData.length - 1].push(arrMatches[2] ? arrMatches[2].replace(CSV_UNESCAPE_REGEX, '$1') : arrMatches[3]);
                }
                
                if (header) {
                    const headerData = arrData.shift();
                    return arrData.map(row => {
                        let i = 0;
                        return headerData.reduce((acc, key) => {acc[key] = row[i++]; return acc;}, {});
                    });
                } else {
                    return arrData;
                }
            },
            
            /** Prepare a CSV data URI according to RFC 4180.
                @param {?Array} rows
                @param {?Array} [headerNames]
                @returns {string} */
            prepareCSVDataURI: (rows, headerNames) => {
                const prepareRow = row => {
                        if (row && isArray(row)) {
                            const colAccum = [],
                                len = row.length;
                            for (let i = 0, col; len > i; i++) {
                                col = row[i];
                                
                                // All columns must have a value.
                                col = col == null ? '' : col.toString();
                                
                                // " are escaped as ""
                                col = col.replace(/"/g, '""');
                                
                                // If the column contains reserved characters it must be wrapped in 
                                // double quotes.
                                if (col.search(/("|,|\n)/g) >= 0) col = '"' + col + '"';
                                
                                colAccum.push(col);
                            }
                            return colAccum.join(',');
                        } else {
                            consoleWarn('Unexpected row', row);
                            return null;
                        }
                    },
                    rowAccum = [];
                
                if (headerNames) {
                    const row = prepareRow(headerNames);
                    if (row) rowAccum.push(row);
                }
                
                if (rows) {
                    if (isArray(rows)) {
                        const len = rows.length;
                        for (let i = 0; len > i; i++) {
                            const row = prepareRow(rows[i]);
                            if (row) rowAccum.push(row);
                        }
                    } else {
                        consoleWarn('Rows were not an array');
                    }
                }
                
                return tym.encodeCSVDataURI(rowAccum.join('\r\n'), headerNames);
            },
            
            encodeCSVDataURI: (csvData, headerNames) => {
                const header = headerNames == null ? '' : ';header=' + (headerNames ? 'present' : 'absent');
                return 'data:text/csv;charset=utf-8' + 
                    header + ',' + 
                    encodeURIComponent(csvData);
            },
            
            
            // String Processing ///////////////////////////////////////////////
            toNameCase: (nameStr, individualFields) => {
                if (!nameStr) return '';
                
                // Split names on regex whitespace, dash or apostrophe, workaround for
                // Javascript regex word boundary \b splitting on unicode characters
                // http://stackoverflow.com/questions/5311618/javascript-regular-expression-problem-with-b-and-international-characters
                nameStr = nameStr.trim().toLowerCase().split(/([\s\-'’"“”().,/])/).reduce(
                    (accumulator, token) => accumulator + (token[0] ?? '').toUpperCase() + token.slice(1), ''
                );
                
                // Name case Mcs and Macs
                // Exclude names with 1-2 letters after prefix like Mack, Macky, Mace
                // Exclude names ending in a,c,i,o, or j are typically Polish or Italian
                if (
                    /\bMac[A-Za-z]{2,}[^aciozj]\b/.test(nameStr) || /\bMc/.test(nameStr)
                ) {
                    nameStr = nameStr.replace(
                        /\b(Ma?c)([A-Za-z]+)/,
                        (x, y, z) => y + (z[0] ?? '').toUpperCase() + z.slice(1)
                    );
                    
                    // Now correct for "Mac" exceptions
                    nameStr = nameStr
                        .replace(/\bMacEvicius\b/, 'Macevicius')
                        .replace(/\bMacHado\b/, 'Machado')
                        .replace(/\bMacHar\b/, 'Machar')
                        .replace(/\bMacHin\b/, 'Machin')
                        .replace(/\bMacHlin\b/, 'Machlin')
                        .replace(/\bMacIas\b/, 'Macias')
                        .replace(/\bMacIulis\b/, 'Maciulis')
                        .replace(/\bMacKie\b/, 'Mackie')
                        .replace(/\bMacKle\b/, 'Mackle')
                        .replace(/\bMacKlin\b/, 'Macklin')
                        .replace(/\bMacQuarie\b/, 'Macquarie')
                        .replace(/\bMacOmber\b/, 'Macomber')
                        .replace(/\bMacIn\b/, 'Macin')
                        .replace(/\bMacKintosh\b/, 'Mackintosh')
                        .replace(/\bMacKen\b/, 'Macken')
                        .replace(/\bMacHen\b/, 'Machen')
                        .replace(/\bMacHiel\b/, 'Machiel')
                        .replace(/\bMacIol\b/, 'Maciol')
                        .replace(/\bMacKell\b/, 'Mackell')
                        .replace(/\bMacKlem\b/, 'Macklem')
                        .replace(/\bMacKrell\b/, 'Mackrell')
                        .replace(/\bMacLin\b/, 'Maclin')
                        .replace(/\bMacKey\b/, 'Mackey')
                        .replace(/\bMacKley\b/, 'Mackley')
                        .replace(/\bMacHell\b/, 'Machell')
                        .replace(/\bMacHon\b/, 'Machon')
                        .replace(/\bMacAyla\b/, 'Macayla');
                }
                
                // And correct Mac exceptions otherwise missed
                nameStr = nameStr
                    .replace(/\bMacmurdo/, 'MacMurdo')
                    .replace(/\bMacisaac/, 'MacIsaac')
                    
                    // Fixes for "son (daughter) of" etc. in various languages.
                    .replace(/\bAl(?=\s+\w)\b/g,  'al')     // al Arabic or forename Al.
                    .replace(/\bAp\b/g,           'ap')     // ap Welsh.
                    .replace(/\bBen(?=\s+\w)\b/g, 'ben')    // ben Hebrew or forename Ben.
                    .replace(/\bDell([ae])\b/g,   'dell$1') // della and delle Italian.
                    .replace(/\bD([aeiu])\b/g,    'd$1')    // da, de, di Italian; du French.
                    .replace(/\bDe([lr])\b/g,     'de$1')   // del Italian; der Dutch/Flemish.
                    .replace(/\bEl\b/g,           'el')     // el Greek
                    .replace(/\bLa\b/g,           'la')     // la French
                    .replace(/\bLe(?=\s+\w)\b/g,  'le')     // le French
                    .replace(/\bLo\b/g,           'lo')     // lo Italian
                    .replace(/\bVan(?=\s+\w)\b/g, 'van')    // van German or forename Van.
                    .replace(/\bVon\b/g,          'von')    // von Dutch/Flemish
                    .replace(/\bD['’]/g,          'd\'')    // d’Orsay
                    
                    // Fixes for roman numeral names, e.g. Henry VIII
                    .replace(/\b(?:\d{4}|(?:[IVX])(?:X{0,3}I{0,3}|X{0,2}VI{0,3}|X{0,2}I?[VX]))$/i, v => v.toUpperCase())
                    
                    // Nation of Islam 2X, 3X, etc. names
                    .replace(/\b[0-9](x)\b/, v => v.toUpperCase())
                    
                    // Somewhat arbitrary rule where two letter combos not containing vowels should be capitalized
                    // fixes /JJ Abrams/ and /JD Salinger/
                    // With some exceptions
                    .replace(/(?:^|\s)[bcdfghjklmnpqrstvwxzBCDFGHJKLMNPQRSTVWXZ]{2}\s/, v => v.toUpperCase())
                    .replace(/\bMR\.?\b/, 'Mr')
                    .replace(/\bMS\.?\b/, 'Ms')
                    .replace(/\bDR\.?\b/, 'Dr')
                    .replace(/\bST\.?\b/, 'St')
                    .replace(/\bJR\.?\b/, 'Jr')
                    .replace(/\bSR\.?\b/, 'Sr')
                    .replace(/\bLT\.?\b/, 'Lt')
                    
                    // lowercase words
                    .replace(/\bThe\b/g, 'the')
                    .replace(/\bOf\b/g, 'of')
                    .replace(/\bAnd\b/g, 'and')
                    .replace(/\bY\b(?!\.)/g, 'y')
                    
                    // strip extra spaces
                    .replace(/\s{2,}/g, ' ');
                
                // Check if we should force the first character to caps
                if (individualFields) {
                    // First character may be lowercase
                    return nameStr;
                } else {
                    // Force first character to be uppercase
                    return (nameStr[0] ?? '').toUpperCase() + nameStr.slice(1);
                }
            },
            
            
            // I18N ////////////////////////////////////////////////////////////
            I18N: {
                setLocale: locale => {
                    currentLocale = locale;
                },
                
                // Get the current locale, detect one if missing.
                getLocale: () => currentLocale,
                
                addDictionary: (dictionary, locale) => {
                    dictionaries[locale] = Object.assign(dictionaries[locale] ?? {}, dictionary);
                },
                setDictionary: (dictionary, locale) => {
                    dictionaries[locale] = dictionary ?? {};
                },
                
                // Lookup translation for a key with optional arguments for substitutions.
                get: (key, ...args) => {
                    const locale = currentLocale ?? (currentLocale = defaultLocale.split('-')[0].toLowerCase()),
                        value = (dictionaries[locale] ?? dictionaries[defaultLocale] ?? {})[key];
                    if (value != null) {
                        if (args.length > 0) {
                            return value.replaceAll(
                                // Process each {{plural:$n|single|multiple}} replacement
                                I18N_PLURAL_REGEX, (m, p1, p2, p3) => (p2 && p3) ? (args[parseInt(p1)] == 1 ? p2 : p3) : ''
                            ).replaceAll(
                                // Process $n replacement for every arg
                                I18N_NUMERIC_ARG_REGEX, (m, idx) => args[idx]
                            );
                        }
                        return value;
                    }
                    return key;
                }
            }
        };
})(globalThis);

module.exports = {JS:globalThis.JS, tym:globalThis.tym};


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
                @returns {void} */
            createSetterFunction: createSetterFunction,
            
            /** Creates a standard getter function for the provided attrName on the target.
                @param {!Object} target
                @param {string} attrName
                @returns {void} */
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
        appendToEarlyAttrs: function(...args) {(this.earlyAttrs ??= []).push(...args);},
        prependToEarlyAttrs: function(...args) {(this.earlyAttrs ??= []).unshift(...args);},
        appendToLateAttrs: function(...args) {(this.lateAttrs ??= []).push(...args);},
        prependToLateAttrs: function(...args) {(this.lateAttrs ??= []).unshift(...args);},
        
        /** Used to quickly extract and set attributes from the attrs object passed to 
            an initializer.
            @param {?Array} attrNames - An array of attribute names.
            @param {?Object} attrs - The attrs Object to extract values from.
            @returns {void} */
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
            @returns {void} */
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
            @returns {void} */
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
})(tym);


/** Provides a destroy method that can be used as part of an Object creation and destruction 
    lifecycle. When an object is "destroyed" it will have a "destroyed" attribute with a value 
    of true.
    
    Attributes:
        destroyed:boolean Set to true when the object is in the "destroyed" state, 
            undefinded otherwise.
    
    @class */
tym.Destructible = new JS.Module('Destructible', {
    // Methods /////////////////////////////////////////////////////////////////
    /** Destroys this Object. Subclasses must call super.
        @returns {void} */
    destroy: function() {
        const self = this;
        if (self.destroyed) {
            console.warn('Already destroyed');
        } else {
            // OPTIMIZATION: Improve garbage collection for JS.Class
            const meta = self.__meta__;
            if (meta) for (const key of Object.keys(meta)) meta[key] = null;
            
            for (const key of Object.keys(self)) self[key] = null;
            
            self.destroyed = true;
        }
    }
});


(pkg => {
    const JSModule = JS.Module,
        
        consoleLog = console.log,
        
        dumpStack = pkg.dumpStack;
    
    /** Apply this mixin to any Object that needs to fire events.
        
        Private Attributes:
            __obsbt:object Stores arrays of myt.Observers and method names by event type
            __aet:Object Stores active event type strings. An event type is active if it has been 
                fired from this Observable as part of the current call stack. If an event type 
                is "active" it will not be fired again. This provides protection against infinite 
                event loops.
        
        @class */
    pkg.Observable = new JSModule('Observable', {
        // Methods /////////////////////////////////////////////////////////////
        /** Adds the observer to the list of event recipients for the event type.
            @param observer:myt.Observer The observer that will observe this observable. If 
                methodName is a function this object will be the context for the function when it 
                is called.
            @param methodName:string|function The name of the method to call, or a function, on 
                the observer when the event fires.
            @param type:string The name of the event the observer will listen to.
            @returns boolean true if the observer was successfully attached, false otherwise. */
        attachObserver: function(observer, methodName, type) {
            if (observer && methodName && type) {
                this.getObservers(type).push(methodName, observer);
                return true;
            }
            return false;
        },
        
        /** Removes the observer from the list of observers for the event type.
            @param observer:myt.Observer The observer that will no longer be observing 
                this observable.
            @param methodName:string|function The name of the method that was to be called or the 
                function to be called.
            @param type:string The name of the event the observer will no longer be listening to.
            @returns boolean true if the observer was successfully detached, false otherwise. */
        detachObserver: function(observer, methodName, type) {
            if (observer && methodName && type) {
                const observersByType = this.__obsbt;
                if (observersByType) {
                    const observers = observersByType[type];
                    if (observers) {
                        // Remove all instances of the observer and methodName combination.
                        let retval = false,
                            i = observers.length;
                        while (i >= 2) {
                            const obs = observers[--i],
                                method = observers[--i];
                            if (observer === obs && methodName === method) {
                                observers.splice(i, 2); // <- Detach Activity that detachAllObservers cares about.
                                retval = true;
                            }
                        }
                        return retval;
                    }
                }
            }
            return false;
        },
        
        /** Removes all observers from this Observable.
            @returns {void} */
        detachAllObservers: function() {
            const observersByType = this.__obsbt;
            if (observersByType) {
                for (const type in observersByType) {
                    const observers = observersByType[type];
                    let i = observers.length;
                    while (i >= 2) {
                        const observer = observers[--i],
                            methodName = observers[--i];
                        // If an observer is registered more than once the list may get shortened 
                        // by observer.detachFrom. If so, just continue decrementing downwards.
                        if (observer && methodName) {
                            if (typeof observer.detachFrom !== 'function' || 
                                !observer.detachFrom(this, methodName, type)
                            ) {
                                // Observer may not have a detachFrom function or the observer may 
                                // not have attached via Observer.attachTo so do the default detach 
                                // activity as implemented in Observable.detachObserver
                                observers.splice(i, 2);
                            }
                        }
                    }
                }
            }
        },
        
        /** Gets an array of observers and method names for the provided type. The array is 
            structured as:
                [methodName1, observerObj1, methodName2, observerObj2,...].
            @param type:string The name of the event to get observers for.
            @returns array: The observers of the event. */
        getObservers: function(type) {
            const observersByType = this.__obsbt ??= {};
            return observersByType[type] ??= [];
        },
        
        /** Checks if any observers exist for the provided event type.
            @param type:string The name of the event to check.
            @returns boolean: True if any exist, false otherwise. */
        hasObservers: function(type) {
            const observersByType = this.__obsbt;
            return observersByType ? observersByType[type]?.length > 0 : false;
        },
        
        /** Creates a new event with the type and value and using this as the source.
            @param type:string The event type.
            @param value:* The event value.
            @returns An event object consisting of source, type and value. */
        createEvent: function(type, value) {
            return {source:this, type:type, value:value}; // Inlined in this.fireEvent
        },
        
        /** Generates a new event from the provided type and value and fires it to the provided 
            observers or the registered observers.
            @param type:string The event type to fire.
            @param value:* The value to set on the event.
            @param observers:array (Optional) If provided the event will be sent to this specific 
                list of observers and no others.
            @returns {void} */
        fireEvent: function(type, value, observers) {
            // Determine observers to use but avoid using getObservers since that lazy instantiates 
            // __obsbt and fireEvent will get called predominantly when no observers were
            // passed into this function.
            const self = this;
            if (observers == null) {
                const observersByType = self.__obsbt;
                if (observersByType) observers = observersByType[type];
            }
            
            // Fire event
            if (observers) {
                // Prevent "active" events from being fired again which usually indicates an
                // infinite loop has occurred.
                const event = {source:self, type:type, value:value}, // Inlined from this.createEvent
                    activeEventTypes = self.__aet ??= {};
                if (activeEventTypes[type]) {
                    pkg.global.error.notify(
                        'warn', 'eventLoop', 'Abort refiring event:' + type, null, {
                            observable:self,
                            type:type,
                            value:value
                        }
                    );
                } else {
                    // Mark event type as "active"
                    activeEventTypes[type] = true;
                    
                    // Walk through observers backwards so that if the observer is detached by the 
                    // event handler the index won't get messed up.
                    // FIXME: If necessary we could queue up detachObserver calls that come in 
                    // during iteration or make some sort of adjustment to 'i'.
                    let i = observers.length;
                    while (i >= 2) {
                        const observer = observers[--i],
                            methodName = observers[--i];
                        // Sometimes the list gets shortened as a side effect of the method we 
                        // called thus resulting in a nullish observer and methodName. In that case 
                        // just continue decrementing downwards.
                        if (observer && methodName) {
                            // Stop firing the event if it was "consumed". An event is considered
                            // consumed if the invoked function returns true.
                            try {
                                if (typeof methodName === 'function') {
                                    if (methodName.call(observer, event)) break;
                                } else {
                                    if (observer[methodName]?.(event)) break;
                                }
                            } catch (err) {
                                dumpStack(err);
                                consoleLog('Additional context', methodName, observer);
                            }
                        }
                    }
                    
                    // Mark event type as "inactive"
                    activeEventTypes[type] = false;
                }
            }
        }
    });
    
    /** Provides a mechanism to remember which Observables this instance has registered itself 
        with. This can be useful when we need to cleanup the instance later.
        
        When this module is used registration and unregistration must be done using the methods 
        below. Otherwise, it is possible for the relationship between observer and observable to 
        be broken.
        
        This mixin also provides the ability to apply and release constraints.
        
        Private Attributes:
            __obt:object Stores arrays of Observables by event type
            __methodNameCounter:int Used to create unique method names when a callback should only 
                be called once.
            __DO_ONCE_*:function The names used for methods that only get run one time.
            __cbmn:object Holds arrays of constraints by method name.
        
        @class */
    pkg.Observer = new JSModule('Observer', {
        // Methods /////////////////////////////////////////////////////////////
        /** Extracts the value from an "event like" object if encountered. Otherwise it returns 
            the provided eventOrValue.
            @param {*} v The candidate event or value to get the value from. An event like value 
                is a non-null Object with a truthy "type" property.
            @returns {*} the provided event or the event's value if found. */
        valueFromEvent: v => v?.type ? v.value : v,
        
        /** Does the same thing as this.attachTo and also immediately calls the method with an 
            event containing the attributes value. If 'once' is true no attachment will occur 
            which means this probably isn't the correct method to use in that situation.
            @param observable:myt.Observable the Observable to attach to.
            @param methodName:string the method name on this instance to execute.
            @param eventType:string the event type to attach for.
            @param attrName:string (optional: the eventType will be used if not provided) the name 
                of the attribute on the Observable to pull the value from.
            @param once:boolean (optional) if true  this Observer will detach from the Observable 
                after the event is handled once.
            @returns {void} */
        syncTo: function(observable, methodName, eventType, attrName, once) {
            attrName ??= eventType;
            try {
                this[methodName](observable.createEvent(eventType, observable.get(attrName)));
            } catch (err) {
                dumpStack(err);
            }
            
            // Providing a true value for once means we will never actually attach.
            if (!once) this.attachTo(observable, methodName, eventType, once);
        },
        
        /** Checks if this Observer is attached to the provided observable for the methodName 
            and eventType.
            @param observable:myt.Observable the Observable to check with.
            @param methodName:string the method name on this instance to execute.
            @param eventType:string the event type to check for.
            @returns true if attached, false otherwise. */
        isAttachedTo: function(observable, methodName, eventType) {
            if (observable && methodName && eventType) {
                const observablesByType = this.__obt;
                if (observablesByType) {
                    const observables = observablesByType[eventType];
                    if (observables) {
                        let i = observables.length;
                        while (i >= 2) {
                            const obs = observables[--i],
                                method = observables[--i];
                            if (observable === obs && methodName === method) return true;
                        }
                    }
                }
            }
            return false;
        },
        
        /** Gets an array of observables and method names for the provided type. The array is 
            structured as:
                [methodName1, observableObj1, methodName2, observableObj2,...].
            @param eventType:string the event type to check for.
            @returns an array of observables. */
        getObservables: function(eventType) {
            const observablesByType = this.__obt ??= {};
            return observablesByType[eventType] ??= [];
        },
        
        /** Gets all the Observables this Observer is attached to regardless of event type.
            @param filterFunc:function (optional) If provided it will be called for each 
                methodName/observable/eventType attachment and only those for which it returns a 
                truthy value will be included. Called as filterFunc(observable, methodName, 
                eventType).
            @param accumulator:Set|Array (optional) If provided, Observables will be added to it 
                and it will be returned rather than a new Set. Anything with an "add" function is 
                filled using that, otherwise "push" is used. Note that a Set accumulator will 
                contain each Observable only once while an Array accumulator will contain one entry 
                per matching attachment, so an Observable attached to for several event types will 
                appear more than once.
            @returns {!Set|!Array} the accumulator if one was provided, otherwise a new Set of 
                myt.Observable instances. */
        getAllObservables: function(filterFunc, accumulator) {
            const retval = accumulator ?? new Set(),
                // Duck type the accumulator so Sets, Arrays, subclasses and custom collectors all work.
                add = typeof retval.add === 'function' ? retval.add : retval.push,
                observablesByType = this.__obt;
            if (observablesByType) {
                for (const [eventType, observables] of Object.entries(observablesByType)) {
                    for (let i = 0, len = observables.length; i < len;) {
                        const methodName = observables[i++],
                            observable = observables[i++];
                        if (!filterFunc || filterFunc(observable, methodName, eventType)) {
                            add.call(retval, observable);
                        }
                    }
                }
            }
            return retval;
        },
        
        /** Checks if any observables exist for the provided event type.
            @param eventType:string the event type to check for.
            @returns true if any exist, false otherwise. */
        hasObservables: function(eventType) {
            const observablesByType = this.__obt;
            return observablesByType ? observablesByType[eventType]?.length > 0 : false;
        },
        
        /** Registers this Observer with the provided Observable for the provided eventType.
            @param observable:myt.Observable the Observable to attach to.
            @param methodName:string the method name on this instance to execute.
            @param eventType:string the event type to attach for.
            @param once:boolean (optional) if true  this Observer will detach from the Observable 
                after the event is handled once.
            @returns boolean true if the observable was successfully registered, 
                false otherwise. */
        attachTo: function(observable, methodName, eventType, once) {
            if (observable && methodName && eventType) {
                const observables = this.getObservables(eventType);
                
                // Setup wrapper method when 'once' is true.
                if (once) {
                    const self = this, 
                        origMethodName = methodName;
                    
                    // Generate one time method name.
                    this.__methodNameCounter ??= 0;
                    methodName = '__DO_ONCE_' + this.__methodNameCounter++;
                    
                    // Setup wrapper method that will do the detachFrom.
                    this[methodName] = event => {
                        self.detachFrom(observable, methodName, eventType);
                        delete self[methodName];
                        return self[origMethodName](event);
                    };
                }
                
                // Register this observer with the observable
                if (observable.attachObserver(this, methodName, eventType)) {
                    observables.push(methodName, observable);
                    return true;
                }
            }
            return false;
        },
        
        /** Unregisters this Observer from the provided Observable for the provided eventType.
            @param observable:myt.Observable the Observable to attach to.
            @param methodName:string the method name on this instance to execute.
            @param eventType:string the event type to attach for.
            @returns boolean true if one or more detachments occurred, false otherwise. */
        detachFrom: function(observable, methodName, eventType) {
            if (observable && methodName && eventType) {
                // No need to unregister if observable array doesn't exist.
                const observablesByType = this.__obt;
                if (observablesByType) {
                    const observables = observablesByType[eventType];
                    if (observables) {
                        // Remove all instances of this observer/methodName/eventType from 
                        // the observable
                        let retval = false,
                            i = observables.length;
                        while (i >= 2) {
                            const obs = observables[--i],
                                method = observables[--i];
                            if (observable === obs && methodName === method) {
                                if (observable.detachObserver(this, methodName, eventType)) {
                                    observables.splice(i, 2);
                                    retval = true;
                                }
                            }
                        }
                        
                        // Source wasn't found
                        return retval;
                    }
                }
            }
            return false;
        },
        
        /** Tries to detach this Observer from all Observables it is attached to.
            @returns {void} */
        detachFromAllObservables: function() {
            const observablesByType = this.__obt;
            if (observablesByType) {
                for (const [eventType, observables] of Object.entries(observablesByType)) {
                    let i = observables.length;
                    while (i >= 2) {
                        const observable = observables[--i],
                            methodName = observables[--i];
                        observable.detachObserver(this, methodName, eventType);
                    }
                    observables.length = 0;
                }
            }
        },
        
        // Constraints
        /** Creates a constraint. The method will be executed on this object whenever any of the 
            provided observables fire the indicated event type.
            @param {string} methodName - The name of the method to call on this object.
            @param {?Array} observables - An array of observable/type pairs. An observer will 
                attach to each observable for the event type.
            @returns {void} */
        constrain: function(methodName, observables) {
            if (methodName && observables) {
                // Make sure an even number of observable/type was provided
                const len = observables.length;
                if (len % 2 !== 0) {
                    consoleLog('Observables uneven', this);
                } else {
                    // Lazy instantiate constraints array.
                    const constraints = this.__cbmn ??= {},
                        constraint = constraints[methodName] ??= [];
                    
                    // Don't allow a constraint to be clobbered.
                    if (constraint.length > 0) {
                        consoleLog('Constraint exists for ' + methodName + ' on', this);
                    } else {
                        for (let i = 0; i < len;) {
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
                            dumpStack(err);
                        }
                    }
                }
            }
        },
        
        /** Removes a constraint.
            @param {string} methodName
            @returns {void} */
        releaseConstraint: function(methodName) {
            if (methodName) {
                // No need to remove if the constraint is already empty.
                const constraints = this.__cbmn;
                if (constraints) {
                    const constraint = constraints[methodName];
                    if (constraint) {
                        let i = constraint.length;
                        while (i >= 2) {
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
            @returns {void} */
        releaseAllConstraints: function() {
            const constraints = this.__cbmn;
            if (constraints) {
                for (const methodName in constraints) this.releaseConstraint(methodName);
            }
        }
    });
})(tym);


(pkg => {
    const JSClass = JS.Class,
        
        NOOP = pkg.NOOP,
        
        consoleWarn = console.warn,
        
        /*  Common mixins for Eventable and Node. */
        includedMixins = [pkg.AccessorSupport, pkg.Destructible, pkg.Observable, pkg.Observer],
        
        /*  Common initializer for Eventable and Node. */
        initializer = (self, mixins) => {
            // Apply the instance mixins if provided.
            if (mixins) {
                const len = mixins.length;
                for (let i = 0, mixin; len > i;) {
                    if (mixin = mixins[i++]) {
                        self.extend(mixin);
                    } else {
                        consoleWarn('Missing mixin in', self.klass.__displayName);
                    }
                }
            }
            
            // Mark the instance not initialized yet since the init or initNode function still
            // needs to be called before initialization is complete.
            self.inited = false;
        },
        
        /*  The value that indicates default placement should be used. */
        DEFAULT_PLACEMENT = '*',
        
        /*  Get the closest ancestor of the provided Node or the Node itself for which the matcher 
            function returns true. Returns a Node or undefined if no match is found.
                param node:tym.Node the Node to start searching from.
                param matcher:function the function to test for matching Nodes with. */
        getMatchingAncestorOrSelf = (node, matcherFunc) => {
            if (matcherFunc) {
                while (node) {
                    if (matcherFunc(node)) return node;
                    node = node.parent;
                }
            }
        },
        
        /*  Get the youngest ancestor of the provided Node for which the matcher function returns 
            true. Returns a Node or undefined if no match is found.
                param node:tym.Node the Node to start searching from. This Node is not tested, but 
                    its parent is.
                param matcher:function the function to test for matching Nodes with. */
        getMatchingAncestor = (node, matcherFunc) => getMatchingAncestorOrSelf(node ? node.parent : null, matcherFunc),
        
        /*  Adds a named reference to a subnode.
                param node:Node the node to add the name reference to.
                param nodeToAdd:Node the node to add the name reference for. */
        addNameRef = (node, nodeToAdd) => {
            const name = nodeToAdd.name;
            if (node[name] === undefined) {
                node[name] = nodeToAdd;
            } else {
                consoleWarn('Name in use', name);
            }
        },
        
        /*  Removes a named reference to a subnode.
                param node:Node the node to remove the name reference from.
                param nodeToRemove:Node the node to remove the name reference for. */
        removeNameRef = (node, nodeToRemove) => {
            const name = nodeToRemove.name;
            if (node[name] === nodeToRemove) {
                delete node[name];
            } else {
                consoleWarn('Name not in use', name);
            }
        },
        
        /*  Lazy instantiate the references store on a scope object.
            @returns {!Object} */
        getRefs = scope => scope.__REFS ??= {};
        
    /** An object that provides accessors, events and simple lifecycle management. Useful as a 
        light weight alternative to tym.Node when parent child relationships are not needed.
        
        Attributes:
            inited:boolean Set to true after this Eventable has completed initialization.
        
        @class */
    pkg.Eventable = new JSClass('Eventable', {
        include: includedMixins,
        
        
        // Constructor /////////////////////////////////////////////////////////
        /** The standard JSClass initializer function.
            @param {?Object} [attrs] - A map of attribute names and values.
            @param {?Array} [mixins] - A list of mixins to be added onto the new instance.
            @returns {void} */
        initialize: function(attrs, mixins) {
            initializer(this, mixins);
            this.init(attrs ?? {});
        },
        
        
        // Life Cycle //////////////////////////////////////////////////////////
        /** Called during initialization. Calls setter methods and lastly, sets inited to true. 
            Subclasses must callSuper.
            @param {?Object} attrs - A map of attribute names and values.
            @returns {void} */
        init: function(attrs) {
            this.callSetters(attrs);
            this.inited = true;
        },
        
        /** @overrides tym.Destructible. */
        destroy: function() {
            this.releaseAllConstraints();
            this.detachFromAllObservables();
            this.detachAllObservers();
            
            this.callSuper();
        }
    });
    
    /** A single node within a tree data structure. A node has zero or one parent node and zero or 
        more child nodes. If a node has no parent it is a 'root' node. If a node has no child nodes 
        it is a 'leaf' node. Parent nodes and parent of parents, etc. are referred to as ancestors. 
        Child nodes and children of children, etc. are referred to as descendants.
        
        Lifecycle management is also provided via the 'initNode', 'destroy' and 
        'destroyAfterOrphaning' methods.
        
        Events:
            parent:tym.Node Fired when the parent is set.
        
        Attributes:
            inited:boolean Set to true after this Node has completed initializing.
            parent:tym.Node The parent of this Node.
            name:string The name of this node. Used to reference this Node from its parent Node.
            isBeingDestroyed:boolean Indicates that this node is in the process of being destroyed. 
                Set to true at the beginning of the destroy lifecycle phase. Undefined before that.
            placement:string The name of the subnode of this Node to add nodes to when setParent is 
                called on the subnode. Placement can be nested using '.' For example 'foo.bar'. The 
                special value of '*' means use the default placement. For example 'foo.*' means 
                place in the foo subnode and then in the default placement for foo.
            defaultPlacement:string The name of the subnode to add nodes to when no placement is 
                specified. Defaults to undefined which means add subnodes directly to this node.
            ignorePlacement:boolean If set to true placement will not be processed for this Node 
                when it is added to a parent Node.
        
        Private Attributes:
            __animPool:array An tym.TrackActivesPool used by the 'animate' method.
            subnodes:array The array of child nodes for this node. Should be accessed through the 
                getSubnodes method.
        
        @class */
    pkg.Node = new JSClass('Node', {
        include: includedMixins,
        
        
        // Class Methods and Attributes ////////////////////////////////////////
        extend: {
            getMatchingAncestorOrSelf,
            getMatchingAncestor,
            DEFAULT_PLACEMENT
        },
        
        
        // Constructor /////////////////////////////////////////////////////////
        /** The standard JSClass initializer function. Subclasses should not override this function.
            @param {?Object} [parent] - The tym.Node (or dom element for RootViews) that will be 
                set as the parent of this tym.Node.
            @param {?Object} [attrs] - A map of attribute names and values.
            @param {?Array} [mixins] - A list of mixins to be added onto the new instance.
            @returns {void} */
        initialize: function(parent, attrs, mixins) {
            initializer(this, mixins);
            this.initNode(parent, attrs ?? {});
        },
        
        
        // Life Cycle //////////////////////////////////////////////////////////
        /** Called during initialization. Sets initial state for life cycle attrs, calls setter 
            methods, sets parent and lastly, sets inited to true. Subclasses must callSuper.
            @param {?Object} [parent] - The tym.Node (or dom element for RootViews) the parent of 
                this Node.
            @param {?Object} attrs - A map of attribute names and values.
            @returns {void} */
        initNode: function(parent, attrs) {
            this.callSetters(attrs);
            this.setParent(parent);
            this.inited = true;
        },
        
        /** @overrides tym.Destructible. */
        destroy: function() {
            const self = this,
                subs = self.subnodes;
            
            // Allows descendants to know destruction is in process
            self.isBeingDestroyed = true;
            
            // Destroy subnodes depth first
            if (subs) {
                for (let i = subs.length; i > 0;) subs[--i].destroy();
            }
            
            if (self.parent) self.setParent();
            
            self.releaseAllConstraints();
            self.detachFromAllObservables();
            self.detachAllObservers();
            
            self.destroyAfterOrphaning();
            
            self.callSuper();
        },
        
        /** Provides a hook for subclasses to do destruction of their internals. This method is 
            called after the parent has been unset. Subclasses must call super.
            @returns {void} */
        destroyAfterOrphaning: NOOP, // () => {/* Subclasses to implement as needed. */},
        
        
        // Structural Accessors ////////////////////////////////////////////////
        setPlacement: function(v) {this.placement = v;},
        setDefaultPlacement: function(v) {this.defaultPlacement = v;},
        setIgnorePlacement: function(v) {this.ignorePlacement = v;},
        
        /** Sets the provided Node as the new parent of this Node. This is the most direct method 
            to do reparenting.
            @param {?Object} newParent
            @returns {void} */
        setParent: function(newParent) {
            const self = this;
            
            // Use placement if indicated
            if (newParent && !self.ignorePlacement) {
                const placement = self.placement ?? newParent.defaultPlacement;
                if (placement) newParent = newParent.determinePlacement(placement, self);
            }
            
            if (self.parent !== newParent) {
                // Abort if the new parent is in the destroyed life-cycle state.
                if (newParent?.destroyed) return;
                
                // Remove ourselves from our existing parent if we have one.
                const curParent = self.parent;
                if (curParent) {
                    const idx = curParent.getSubnodes().indexOf(self);
                    if (idx > -1) {
                        if (self.name) removeNameRef(curParent, self);
                        curParent.subnodes.splice(idx, 1);
                        curParent.subnodeRemoved(self);
                    }
                }
                
                self.parent = newParent;
                
                // Add ourselves to our new parent
                if (newParent) {
                    newParent.getSubnodes().push(self);
                    if (self.name) addNameRef(newParent, self);
                    newParent.subnodeAdded(self);
                }
                
                // Fire an event
                if (self.inited) self.fireEvent('parent', newParent);
            }
        },
        
        /** The 'name' of a Node allows it to be referenced by name from its parent node. For 
            example a Node named 'foo' that is a child of a Node stored in the variable 'bar' 
            would be referenced like this: bar.foo or bar['foo'].
            @param {string} name
            @returns {void} */
        setName: function(name) {
            if (this.name !== name) {
                // Remove "name" reference from parent.
                const p = this.parent;
                if (p && this.name) removeNameRef(p, this);
                
                this.name = name;
                
                // Add "name" reference to parent.
                if (p && name) addNameRef(p, this);
            }
        },
        
        
        // Methods /////////////////////////////////////////////////////////////
        /** Called from setParent to determine where to insert a subnode in the node hierarchy. 
            Subclasses will not typically override this method, but if they do, they probably won't 
            need to call super.
            @param {string} placement - The placement path to use.
            @param {!Object} subnode - The sub tym.Node being placed.
            @returns {!Object} - The Node to place a subnode into. */
        determinePlacement: function(placement, subnode) {
            // Parse "active" placement and remaining placement.
            let idx = placement.indexOf('.'),
                remainder;
            if (idx >= 0) {
                remainder = placement.slice(idx + 1);
                placement = placement.slice(0, idx);
            }
            
            // Evaluate placement of '*' as defaultPlacement.
            if (placement === DEFAULT_PLACEMENT) {
                placement = this.defaultPlacement;
                
                // Default placement may be compound and thus require splitting
                if (placement) {
                    idx = placement.indexOf('.');
                    if (idx >= 0) {
                        remainder = placement.slice(idx + 1) + (remainder ? '.' + remainder : '');
                        placement = placement.slice(0, idx);
                    }
                }
                
                // It's possible that a placement of '*' comes out here if a Node has its 
                // defaultPlacement set to '*'. This should result in a null loc when the code 
                // below runs which will end up returning 'this'.
            }
            
            const loc = this[placement];
            return loc ? (remainder ? loc.determinePlacement(remainder, subnode) : loc) : this;
        },
        
        
        // Tree Methods //
        /** Gets the root Node for this Node. The root Node is the oldest ancestor or self that 
            has no parent.
            @returns {!Object} - The root tym.Node. */
        getRoot: function() {
            return this.parent?.getRoot() ?? this;
        },
        
        /** Checks if this Node is a root Node.
            @returns {boolean} */
        isRoot: function() {
            return this.parent == null;
        },
        
        /** Tests if this Node is a descendant of the provided Node or is the node itself.
            @param {!Object} node - The tym.Node to check for descent from.
            @returns {boolean} */
        isDescendantOf: function(node) {
            const self = this;
            if (node) {
                if (node === self) return true;
                if (self.parent) {
                    // Optimization: use the dom element contains function if both nodes are 
                    // DomElementProxy instances.
                    if (self.getIDE && node.getIDE) return node.getIDE().contains(self.getIDE());
                    return self.parent.isDescendantOf(node);
                }
            }
            return false;
        },
        
        /** Tests if this Node is an ancestor of the provided Node or is the node itself.
            @param {!Object} node - The tym.Node to check for.
            @returns {boolean} */
        isAncestorOf: function(node) {
            return node ? node.isDescendantOf(this) : false;
        },
        
        /** Gets the youngest common ancestor of this Node and the provided Node.
            @param {!Object} node - The tym.Node to look for a common ancestor with.
            @returns {?Object} The youngest common Node or undefined if none exists. */
        getLeastCommonAncestor: function(node) {
            while (node) {
                if (this.isDescendantOf(node)) return node;
                node = node.parent;
            }
        },
        
        /** Find the youngest ancestor Node that is an instance of the class.
            @param {?Function} klass - The Class to search for.
            @returns {?Object} - The tym.Node or undefined if no klass is provided or match found. */
        searchAncestorsForClass: function(klass) {
            if (klass) return this.searchAncestors(node => node instanceof klass);
        },
        
        /** Find the youngest ancestor Node that includes the JS.Module.
            @param {?Object} jsmodule - The JS.Module to search for.
            @returns {?Object} - The tym.Node or undefined if no klass is provided or match found. */
        searchAncestorsForModule: function(jsmodule) {
            if (jsmodule) return this.searchAncestors(node => node.isA(jsmodule));
        },
        
        /** Get the youngest ancestor of this Node for which the matcher function returns true. 
            This is a simple wrapper around tym.Node.getMatchingAncestor(this, matcherFunc).
            @param {!Function} matcherFunc - The function to test for matching Nodes with.
            @returns {?Object} - The tym.Node or undefined if no match is found. */
        searchAncestors: function(matcherFunc) {
            return getMatchingAncestor(this, matcherFunc);
        },
        
        /** Get the youngest ancestor of this Node or the Node itself for which the matcher function 
            returns true. This is a simple wrapper around tym.Node.getMatchingAncestorOrSelf(this, matcherFunc).
            @param {!Function} matcherFunc - The function to test for matching Nodes with.
            @returns {?Object} - The tym.Node or undefined if no match is found. */
        searchAncestorsOrSelf: function(matcherFunc) {
            return getMatchingAncestorOrSelf(this, matcherFunc);
        },
        
        /** Gets an array of ancestor nodes including the node itself. The oldest ancestor will be 
            at the end of the list and the node will be at the front of the list.
            @returns {!Array} - The array of ancestor nodes. */
        getAncestors: function() {
            const ancestors = [];
            let node = this;
            while (node) {
                ancestors.push(node);
                node = node.parent;
            }
            return ancestors;
        },
        
        
        // Subnode Methods //
        /** Gets the subnodes for this Node and does lazy instantiation of the subnodes array.
            @returns {!Array} - An array of subnodes. */
        getSubnodes: function() {
            return this.subnodes ??= [];
        },
        
        /** Called when a subnode is added to this node. Provides a hook for subclasses. No need for
            subclasses to call super. Do not call this method to add a subnode. Instead call setParent.
            @param {!Object} node - The sub tym.Node that was added.
            @returns {void} */
        subnodeAdded: NOOP, // node => {},
        
        /** Called when a subnode is removed from this node. Provides a hook for subclasses. No need
            for subclasses to call super. Do not call this method to remove a subnode. Instead 
            call setParent.
            @param {!Object} node - The sub tym.Node that was removed.
            @returns {void} */
        subnodeRemoved: NOOP, // node => {},
        
        
        // Reference Store //
        /*  Use the reference store to hold values in this Node without cluttering up the
            Node's namespace. */
        
        /** Add a reference under a provided name.
            @param {string} name - The name to store the value under.
            @param {*} ref - The value to store.
            @returns {*} */
        addRef: function(name, ref) {
            return getRefs(this)[name] = ref;
        },
        
        /** Get a reference stored under a provided name.
            @param {string} name - The name to get the value for.
            @returns {*} */
        getRef: function(name) {
            return getRefs(this)[name];
        },
        
        /** Remove a reference stored under the provided name and return whatever was stored
            under that name.
            @param {string} name - The name to remove the value for.
            @returns {*} */
        removeRef: function(name) {
            const refs = getRefs(this),
                retval = refs[name];
            delete refs[name];
            return retval;
        }
    });
})(tym);


(pkg => {
    const {Class:JSClass, Module:JSModule} = JS,
        
        NOOP = pkg.NOOP,
        
        consoleWarn = console.warn,
        
        /*  Get the object pool.
            @param {boolean} lazy - If true a pool will be lazily instantiated.
            @returns {!Object} */
        getObjPool = (abstractPool, lazy) => lazy ? abstractPool.__op ??= [] : abstractPool.__op,
        
        /*  Get the active objects array.
            @param {boolean} lazy - If true a list will be lazily instantiated.
            @returns {!Array} */
        getActiveObjArray = (trackActivesPool, lazy) => lazy ? trackActivesPool.__actives ??= [] : trackActivesPool.__actives,
        
        makeInstance = (parent, instanceClass, attrs) => parent ? new instanceClass(parent, attrs) : new instanceClass(),
        
        destroyObjectPool = objPool => {
            if (objPool) {
                let i = objPool.length;
                while (i) {
                    const obj = objPool[--i];
                    if (typeof obj.destroy === 'function') obj.destroy();
                }
                objPool.length = 0;
            }
        },
        
        /** Implements an object pool. Subclasses must at a minimum implement the 
            createInstance method.
            
            Private Attributes:
                __op:array The array of objects stored in the pool.
            
            @class */
        AbstractPool = new JSClass('AbstractPool', {
            include: [pkg.Destructible],
            
            
            // Constructor /////////////////////////////////////////////////////
            /** Initialize does nothing.
                @returns {void} */
            initialize: () => {},
            
            
            // Life Cycle //////////////////////////////////////////////////////
            /** @overrides tym.Destructible */
            destroy: function() {
                const objPool = getObjPool(this);
                if (objPool) objPool.length = 0;
                
                this.callSuper();
            },
            
            
            // Methods /////////////////////////////////////////////////////////
            /** Get an instance from the pool.
                The arguments passed in will be passed to the createInstance method. Note: these 
                have no effect if an object already exists in the pool.
                @returns {!Object} */
            getInstance: function() {
                const objPool = getObjPool(this, true);
                return objPool.length ? objPool.pop() : this.createInstance.apply(this, arguments);
            },
            
            /** Creates a new object that can be stored in the pool. The default implementation 
                does nothing.
                @returns {?Object} */
            createInstance: NOOP,
            
            /** Puts the object back in the pool. The object will be "cleaned" before it is stored.
                @param {!Object} obj - The object to put in the pool.
                @returns {void} */
            putInstance: function(obj) {
                getObjPool(this, true).push(this.cleanInstance(obj));
            },
            
            /** Cleans the object in preparation for putting it back in the pool. The default 
                implementation calls the clean method on the object if it is a function. Otherwise 
                it does nothing.
                @param {!Object} obj - The object to be cleaned.
                @returns {!Object} - The cleaned object. */
            cleanInstance: obj => {
                if (typeof obj.clean === 'function') obj.clean();
                return obj;
            },
            
            /** Calls the destroy method on all object stored in the pool if they have a 
                destroy function.
                @returns {void} */
            destroyPooledInstances: function() {
                destroyObjectPool(getObjPool(this));
            }
        }),
        
        /** An implementation of an tym.AbstractPool.
            
            Attributes:
                instanceClass:JS.Class (initializer only) the class to use for new instances. 
                    Defaults to Object.
                instanceParent:tym.Node (initializer only) The node to create new instances on.
            
            @class */
        SimplePool = pkg.SimplePool = new JSClass('SimplePool', AbstractPool, {
            // Constructor /////////////////////////////////////////////////////
            /** Create a new tym.SimplePool
                @param {!Function} instanceClass - The JS.Class to create instances from.
                @param {?Object} [instanceParent] - The place to create instances on. When 
                    instanceClass is an tym.Node this will be the node parent.
                @returns {void} */
            initialize: function(instanceClass, instanceParent) {
                this.callSuper();
                
                this.instanceClass = instanceClass ?? Object;
                this.instanceParent = instanceParent;
            },
            
            
            // Methods /////////////////////////////////////////////////////////
            /** @overrides tym.AbstractPool
                Creates an instance of this.instanceClass and passes in this.instanceParent as the 
                first argument if it exists.
                arguments[0]:object (optional) the attrs to be passed to a 
                created tym.Node.
                @returns {?Object} */
            createInstance: function() {
                return makeInstance(this.instanceParent, this.instanceClass, arguments[0]);
            }
        }),
        
        /** Tracks which objects are "active". An "active" object is one that has been obtained by 
            the getInstance method.
            
            Private Attributes:
                __actives:array an array of active instances.
            
            @class */
        TrackActives = new JSModule('TrackActives', {
            // Life Cycle //////////////////////////////////////////////////////
            /** @overrides tym.Destructible */
            destroy: function() {
                const actives = getActiveObjArray(this);
                if (actives) actives.length = 0;
                
                this.callSuper();
            },
            
            
            // Methods /////////////////////////////////////////////////////////
            /** @overrides tym.AbstractPool */
            getInstance: function() {
                const instance = this.callSuper();
                getActiveObjArray(this, true).push(instance);
                return instance;
            },
            
            /** @overrides tym.AbstractPool */
            putInstance: function(obj) {
                const actives = getActiveObjArray(this);
                let warningType;
                if (actives) {
                    const idx = actives.indexOf(obj);
                    if (idx > -1) {
                        actives.splice(idx, 1);
                        this.callSuper(obj);
                        return;
                    }
                    warningType = 'inactive';
                } else {
                    warningType = 'missing';
                }
                consoleWarn('Tried to put a ' + warningType + ' instance', obj, this);
            },
            
            /** Gets an array of the active instances.
                @param {?Function} [filterFunc] - If provided filters the results.
                @returns {!Array} */
            getActives: function(filterFunc) {
                const actives = getActiveObjArray(this);
                if (actives) {
                    if (filterFunc) {
                        const retval = [],
                            len = actives.length;
                        for (let i = 0; len > i;) {
                            const active = actives[i++];
                            if (filterFunc.call(this, active)) retval.push(active);
                        }
                        return retval;
                    }
                    return actives.slice();
                }
                return [];
            },
            
            /** Puts all the active instances back in the pool.
                @returns {void} */
            putActives: function() {
                const actives = getActiveObjArray(this);
                if (actives) {
                    let i = actives.length;
                    while (i) this.putInstance(actives[--i]);
                }
            }
        }),
        
        /** An tym.SimplePool that tracks which objects are "active".
            
            @class */
        TrackActivesPool = pkg.TrackActivesPool = new JSClass('TrackActivesPool', SimplePool, {
            include: [TrackActives]
        });
    
    /** A pool that tracks which objects are "active" and stores objects of different classes in 
        different internal TrackActivesPools.
        
        Private Attributes:
            __pbk:object Stores TrackActivesPools by key.
        
        @class */
    pkg.TrackActivesMultiPool = new JSClass('TrackActivesMultiPool', AbstractPool, {
        // Constructor /////////////////////////////////////////////////////////
        initialize: function(instanceClassesByKey, instanceParent) {
            this.callSuper();
            
            this.instanceClassesByKey = instanceClassesByKey;
            
            const poolsByClassName = this._poolsByClassName = {},
                poolsByKey = this.__pbk = {};
            for (const key in instanceClassesByKey) {
                const klass = instanceClassesByKey[key];
                poolsByKey[key] = poolsByClassName[klass.__displayName] = new TrackActivesPool(klass, instanceParent);
            }
        },
        
        
        // Life Cycle //////////////////////////////////////////////////////////
        destroy: function() {
            const poolsByKey = this.__pbk;
            for (const key in poolsByKey) poolsByKey[key].destroy();
            
            this.callSuper();
        },
        
        
        // Methods /////////////////////////////////////////////////////////////
        getInstance: function() {
            const key = arguments[0],
                pool = this.__pbk[key];
            if (pool) {
                return pool.getInstance(arguments);
            } else {
                consoleWarn('No pool for key', key);
            }
        },
        
        putInstance: function(obj) {
            const pool = this._poolsByClassName[obj.klass.__displayName];
            if (pool) {
                pool.putInstance(obj);
            } else {
                consoleWarn('No pool for obj', obj);
            }
        },
        
        destroyPooledInstances: function() {
            const poolsByKey = this.__pbk;
            for (const key in poolsByKey) poolsByKey[key].destroyPooledInstances();
        },
        
        getActives: function(filterFunc) {
            let actives = [];
            const poolsByKey = this.__pbk;
            for (const key in poolsByKey) actives.push(...poolsByKey[key].getActives(filterFunc));
            return actives;
        },
        
        putActives: function() {
            const poolsByKey = this.__pbk;
            for (const key in poolsByKey) poolsByKey[key].putActives();
        }
    });
    
    /** Objects that can be used in an tym.AbstractPool should use this mixin and implement the 
        "clean" method.
        
        @class */
    pkg.Reusable = new JSModule('Reusable', {
        // Methods /////////////////////////////////////////////////////////////
        /** Puts this object back into a default state suitable for storage in an tym.AbstractPool
            @returns {void} */
        clean: NOOP
    });
})(tym);


/** Provides a dependency target that pulls in all of the tym package. */
tym.all = true;

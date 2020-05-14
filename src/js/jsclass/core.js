((exports) => {
    const extendObj = (destination, source) => {
            if (destination && source) {
                for (let field in source) {
                    if (destination[field] !== source[field] && !destination.hasOwnProperty(field)) {
                        destination[field] = source[field];
                    }
                }
            }
            return destination;
        },
        
        makeClass = (parent) => {
            const constructor = function() {
                    const init = this.initialize;
                    return init ? init.apply(this, arguments) || this : this;
                },
                bridge = function() {};
            bridge.prototype = (parent || Object).prototype;
            constructor.prototype = new bridge();
            return constructor;
        },
        
        /*  Gets the ancestor classes array.
            @param {?Array} [list] - An array of ancestors that will have
                ancestor classes pushed onto. If not provided a new array will
                be created.
            @returns {!Array} */
        ancestorClasses = (module, list) => {
            const cachable = !list,
                inc = module.__inc__,
                n = inc.length;
            let i = 0;
            list = list || [];
            
            if (cachable && module.__anc__) return module.__anc__.slice();
            
            for (; i < n;) ancestorClasses(inc[i++], list);
            
            if (list.indexOf(module) < 0) list.push(module);
            
            if (cachable) module.__anc__ = list.slice();
            return list;
        },
        
        /*  Gets an array of JS.Methods for the provided method name.
            @param {string} name - The name of the method to lookup.
            @returns {!Array} An array of JS.Methods from the ancestors chain. */
        lookup = (module, name) => {
            const cached = module.__mct__[name];
            if (cached) return cached.slice();
            
            const ancestors = ancestorClasses(module), 
                n = ancestors.length,
                methods = [];
            let fns, 
                i = 0;
            for (; i < n;) {
                fns = ancestors[i++].__fns__;
                if (fns.hasOwnProperty(name)) methods.push(fns[name]);
            }
            module.__mct__[name] = methods.slice();
            return methods;
        },
        
        resolveModule = (module, host) => {
            host = host || module;
            const target = host.__tgt__,
                inc = module.__inc__,
                fns = module.__fns__;
            let i, 
                n, 
                key, 
                method, 
                compiled;
            
            if (host === module) {
                module.__anc__ = null;
                module.__mct__ = {};
                i = module.__dep__.length;
                while (i) resolveModule(module.__dep__[--i]);
            }
            
            if (target) {
                for (i = 0, n = inc.length; i < n;) resolveModule(inc[i++], host);
                
                for (key in fns) {
                    // Compile method
                    method = fns[key],
                    compiled = method instanceof Method ? compile(method, host) : method;
                    
                    if (target[key] !== compiled) target[key] = compiled;
                }
            }
        },
        
        compile = (method, environment) => {
            const callable = method.callable,
                keywordCallSuper = Method.keywordCallSuper,
                superFunc = method._hasSuper && keywordCallSuper ? keywordCallSuper : null;
            
            return superFunc === null ? callable : function() {
                const existing = this.callSuper,
                    doSuper = !existing || existing.__kwd__;
                let prevValue, 
                    prevOwn, 
                    kwd,
                    returnValue;
              
                if (doSuper) {
                    prevValue = existing;
                    prevOwn = this.hasOwnProperty('callSuper');
                    kwd = this.callSuper = superFunc(method, environment, this, arguments);
                    if (kwd) kwd.__kwd__ = true;
                }
                
                returnValue = callable.apply(this, arguments);
                
                if (doSuper) {
                    if (prevOwn) {
                        this.callSuper = prevValue;
                    } else {
                        delete this.callSuper;
                    }
                }
                
                return returnValue;
            };
        },
        
        eigenFunc = (target) => {
            let meta = target.__meta__;
            if (meta) return meta;
            meta = target.__meta__ = new Module('', null, {_target:target});
            return meta.include(target.klass, {_resolve: false});
        },
        
        ignore = (value) => typeof value !== 'function' || (value.__fns__ && value.__inc__),
        Method = exports.Method = makeClass(),
        createMethod = (module, name, callable) => (callable && callable.__inc__ && callable.__fns__) || typeof callable !== 'function' ? callable : new Method(module, name, callable),
        Module = exports.Module = makeClass();
    
    extendObj(Method.prototype, {
        initialize: function(module, name, callable) {
            this.module = module;
            this.name = name;
            this.callable = callable;
            this._hasSuper = typeof callable === 'function' && callable.toString().indexOf('callSuper') !== -1;
        },
        
        call: function(...args) {
            return this.callable(...args);
        },
        
        apply: function(receiver, args) {
            return this.callable.apply(receiver, args);
        }
    });
    
    extendObj(Module.prototype, {
        initialize: function(name, methods, options) {
            this.__inc__ = [];
            this.__dep__ = [];
            this.__fns__ = {};
            this.__tgt__ = (options || {})._target;
            this.__anc__ = null;
            this.__mct__ = {};
            
            this.__displayName = name;
            
            this.include(methods, {_resolve:false});
        },
        
        /** Adds a single named method to a JS.Class/JS.Module. If you’re modifying 
            a class, the method instantly becomes available in instances of the 
            class, and in its subclasses.
            @param {string} name - The name of the method to add.
            @param {!Function} callable - The method implementation.
            @param {?Object} [options]
            @returns {undefined} */
        define: function(name, callable, options) {
            this.__fns__[name] = createMethod(this, name, callable);
            if ((options || {})._resolve !== false) resolveModule(this);
        },
        
        /** Mixes in a module to this module.
            @param {!Function} module - The JS.Module to mix in.
            @param {?Object} [options]
            @returns {!Function) this JS.Module. */
        include: function(module, options) {
            if (module) {
                options = options || {};
                const extend  = module.extend,
                    include = module.include;
                let field, 
                    value, 
                    mixins, 
                    i, 
                    n, 
                    resolveFalse;
                
                if (module.__fns__ && module.__inc__) {
                    this.__inc__.push(module);
                    module.__dep__.push(this);
                } else {
                    resolveFalse = {_resolve:false};
                    if (ignore(extend)) {
                        mixins = [].concat(extend);
                        for (i = 0, n = mixins.length; i < n;) this.extend(mixins[i++]);
                    }
                    if (ignore(include)) {
                        mixins = [].concat(include);
                        for (i = 0, n = mixins.length; i < n;) this.include(mixins[i++], resolveFalse);
                    }
                    for (field in module) {
                        if (module.hasOwnProperty(field)) {
                            value = module[field];
                            if ((field === 'extend' || field === 'include') && ignore(value)) continue;
                            this.define(field, value, resolveFalse);
                        }
                    }
                }
                
                if (options._resolve !== false) resolveModule(this);
            }
            return this;
        },
        
        /** Checks if this module includes the provided module.
            @param {!Function} module - The module to check for.
            @returns {boolean} True if the module is included, otherwise false. */
        includes: function(module) {
            if (module === this) return true;
            
            const inc = this.__inc__, 
                n = inc.length;
            for (let i = 0; i < n;) {
                if (inc[i++].includes(module)) return true;
            }
            return false;
        },
        
        /** Extracts a single named method from a module.
            @param {string} name - The name of the method to extract.
            @return {!Function) The extracted JS.Method. */
        instanceMethod: function(name) {
            return lookup(this, name).pop();
        }
    });
    
    const Kernel = new Module('Kernel', {
        equals: function(other) {
            return this === other;
        },
        
        extend: function(module, options) {
            if (module) eigenFunc(this).include(module, {_resolve:(options || {})._resolve});
            return this;
        },
        
        /** Checks if this object includes, extends or is the provided module.
            @param {!Function} module - The JS.Module module to check for.
            @returns {boolean} */
        isA: function(module) {
            return (typeof module === 'function' && this instanceof module) || eigenFunc(this).includes(module);
        }
    });
    
    const Class = exports.Class = makeClass(Module);
    extendObj(Class.prototype, {
        initialize: function(name, parent, methods, options) {
            if (typeof parent !== 'function') {
                options = methods;
                methods = parent;
                parent  = Object;
            }
            
            Module.prototype.initialize.call(this, name);
            
            const resolve = (options || {})._resolve,
                resolveFalse = {_resolve:false},
                klass = makeClass(parent);
            let parentModule;
            extendObj(klass, this);
            klass.prototype.constructor = klass.prototype.klass = klass;
            eigenFunc(klass).include(parent.__meta__, {_resolve:resolve});
            klass.__tgt__ = klass.prototype;
            
            parentModule = parent === Object ? {} : (parent.__fns__ ? parent : new Module(parent.prototype, resolveFalse));
            klass.include(Kernel, resolveFalse).include(parentModule, resolveFalse).include(methods, resolveFalse);
            
            if (resolve !== false) resolveModule(klass);
            
            return klass;
        }
    });
    
    const classify = (klass, parent) => {
        klass.__inc__ = [];
        klass.__dep__ = [];
        const proto = klass.prototype,
            methods = {};
        for (let field in proto) {
            if (proto.hasOwnProperty(field)) methods[field] = createMethod(klass, field, proto[field]);
        }
        klass.__fns__ = methods;
        klass.__tgt__ = proto;
        
        proto.constructor = proto.klass = klass;
        
        extendObj(klass, Class.prototype);
        klass.include(parent);
        
        klass.constructor = klass.klass = Class;
    };
    classify(Method, Kernel);
    classify(Module, Kernel);
    classify(Class,  Module);
    
    resolveModule(eigenFunc(Method));
    resolveModule(eigenFunc(Module));
    eigenFunc(Class).include(Module.__meta__);
    
    // Must come after classification.
    Method.keywordCallSuper = (method, env, receiver, args) => {
        const methods = lookup(env, method.name),
            params = Array.from(args);
        let stackIndex = methods.length - 1,
            _super;
        
        if (stackIndex === 0) return undefined;
        
        return _super = (...theArgs) => {
            let i = theArgs.length,
                returnValue;
            while (i) params[--i] = theArgs[i];
            
            stackIndex--;
            if (stackIndex === 0) delete receiver.callSuper;
            returnValue = methods[stackIndex].apply(receiver, params);
            receiver.callSuper = _super;
            stackIndex++;
            
            return returnValue;
        };
    };
    
    /** Create a single instance of a "private" class. */
    exports.Singleton = new Class('Singleton', {
        initialize: (name, parent, methods) => new (new Class(name, parent, methods))
    });
})(global.JS || (global.JS = {}));
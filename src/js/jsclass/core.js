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
                for (const field of Object.keys(module)) {
                    const value = module[field];
                    if ((field !== 'extend' && field !== 'include') || (!value.__fns__ && typeof value === 'function')) {
                        // Adds a single named method to a JS.Class/JS.Module. If you’re modifying a 
                        // class, the method instantly becomes available in instances of the class, 
                        // and in its subclasses.
                        if (this.__fns__.has(field)) {
                            // Handles the case where the new function would clobber an existing one.
                            // This can occur by using Module.extend twice with the same named
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
        
        const parentModule = parent === Object ? {} : (parent.__fns__ ? parent : new Module(parent.prototype, true));
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
})(global.JS = {});
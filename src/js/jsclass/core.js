(exports => {
    const 
        /*  Gets an array of JS.Methods for the provided method name.
            @param {string} name - The name of the method to lookup.
            @returns {!Array} An array of JS.Methods from the ancestors chain. */
        lookup = (module, name) => {
            const cached = module.__mct__[name];
            if (cached) return cached.slice();
            
            // Get the ancestor classes array
            let ancestors;
            const cachedAncestors = module.__anc__;
            if (cachedAncestors) {
                ancestors = cachedAncestors.slice();
            } else {
                ancestors = [];
                const walk = theModule => {
                    const includes = theModule.__inc__,
                        len = includes.length;
                    for (let i = 0; i < len;) walk(includes[i++]);
                    if (!ancestors.includes(theModule)) ancestors.push(theModule);
                };
                walk(module);
                module.__anc__ = ancestors.slice();
            }
            
            const len = ancestors.length,
                methods = [];
            for (let i = 0; i < len;) {
                const fns = ancestors[i++].__fns__;
                if (fns.hasOwnProperty(name)) methods.push(fns[name]);
            }
            module.__mct__[name] = methods.slice();
            return methods;
        },
        
        compile = (method, environment) => {
            const callable = method.callable;
            return method.__hs ? 
                function() {
                    const existing = this.callSuper,
                        prevOwn = this.hasOwnProperty('callSuper'),
                        methods = lookup(environment, method.name);
                    let stackIndex = methods.length - 1;
                    if (stackIndex === 0) {
                        delete this.callSuper;
                    } else {
                        const params = Array.from(arguments),
                            _super = this.callSuper = (...theArgs) => {
                                let i = theArgs.length;
                                while (i) params[--i] = theArgs[i];
                                
                                if (--stackIndex === 0) delete this.callSuper;
                                const returnValue = methods[stackIndex].callable.apply(this, params);
                                this.callSuper = _super;
                                stackIndex++;
                                
                                return returnValue;
                            };
                    }
                    
                    const returnValue = callable.apply(this, arguments);
                    
                    if (prevOwn) {
                        this.callSuper = existing;
                    } else {
                        delete this.callSuper;
                    }
                    
                    return returnValue;
                } : callable;
        },
        
        resolveModule = (module, host) => {
            host = host ?? module;
            
            if (host === module) {
                module.__anc__ = null;
                module.__mct__ = {};
                let i = module.__dep__.length;
                while (i) resolveModule(module.__dep__[--i]);
            }
            
            const target = host.__tgt__;
            if (target) {
                const inc = module.__inc__,
                    fns = module.__fns__,
                    len = inc.length;
                for (let i = 0; i < len;) resolveModule(inc[i++], host);
                
                for (const key in fns) {
                    // Compile method
                    const method = fns[key],
                        compiled = method instanceof Method ? compile(method, host) : method;
                    
                    if (target[key] !== compiled) target[key] = compiled;
                }
            }
        },
        
        eigenFunc = target => target.__meta__ ? target.__meta__ : (target.__meta__ = new Module('', null, {_target:target})).include(target.klass, {_rslv:false}),
        ignore = value => typeof value !== 'function' || (value.__fns__ && value.__inc__),
        
        makeClass = parent => {
            const constructor = function() {
                    return this.initialize ? this.initialize.apply(this, arguments) ?? this : this;
                },
                bridge = function() {};
            bridge.prototype = (parent ?? Object).prototype;
            constructor.prototype = new bridge();
            return constructor;
        },
        
        createMethod = (module, name, callable) => (callable && callable.__inc__ && callable.__fns__) || typeof callable !== 'function' ? callable : new Method(module, name, callable),
        
        Method = makeClass(),
        Module = exports.Module = makeClass();
    
    Method.prototype.initialize = function(module, name, callable) {
        this.module = module;
        this.name = name;
        this.callable = callable;
        
        // Indicates if this Method has a super call or not.
        this.__hs = callable.toString().includes('callSuper');
    };
    
    const moduleProto = Module.prototype;
    moduleProto.initialize = function(name, methods, options) {
        this.__inc__ = [];
        this.__dep__ = [];
        this.__fns__ = {};
        this.__tgt__ = (options ?? {})._target;
        //this.__anc__ = null;
        this.__mct__ = {};
        
        this.__displayName = name;
        
        this.include(methods, {_rslv:false});
    };
    /*  Mixes a module into this module.
        @param {!Function} module - The JS.Module to mix in.
        @param {?Object} [options]
        @returns {!Function) this JS.Module. */
    moduleProto.include = function(module, options) {
        if (module) {
            if (module.__fns__ && module.__inc__) {
                this.__inc__.push(module);
                module.__dep__.push(this);
            } else {
                const extend  = module.extend,
                    include = module.include;
                if (extend && ignore(extend)) this.extend(extend);
                if (include && ignore(include)) {
                    const len = include.length,
                        resolveFalse = {_rslv:false};
                    for (let i = 0; i < len;) this.include(include[i++], resolveFalse);
                }
                for (const field of Object.keys(module)) {
                    const value = module[field];
                    if ((field === 'extend' || field === 'include') && ignore(value)) continue;
                    
                    // Adds a single named method to a JS.Class/JS.Module. If you’re 
                    // modifying a class, the method instantly becomes available in 
                    // instances of the class, and in its subclasses.
                    this.__fns__[field] = createMethod(this, field, value);
                }
            }
            
            if ((options ?? {})._rslv !== false) resolveModule(this);
        }
        return this;
    };
    /*  Checks if this module includes the provided module.
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
    /*  Extracts a single named method from a module.
        @param {string} name - The name of the method to extract.
        @return {!Function) The extracted JS.Method. */
    moduleProto.instanceMethod = function(name) {
        return lookup(this, name).pop();
    };
    
    const Kernel = new Module('Kernel', {
        extend: function(module, options) {
            if (module) eigenFunc(this).include(module, {_rslv:(options ?? {})._rslv});
            return this;
        },
        
        /** Checks if this object includes, extends or is the provided module.
            @param {!Function} module - The JS.Module module to check for.
            @returns {boolean} */
        isA: function(module) {
            return (typeof module === 'function' && this instanceof module) || eigenFunc(this).includes(module);
        }
    });
    
    const Class = exports.Class = makeClass(Module),
        classProto = Class.prototype;
    classProto.initialize = function(name, parent, methods, options) {
        if (typeof parent !== 'function') {
            options = methods;
            methods = parent;
            parent  = Object;
        }
        
        Module.prototype.initialize.call(this, name);
        
        const resolve = (options ?? {})._rslv,
            resolveFalse = {_rslv:false},
            klass = makeClass(parent);
        
        // The klass extends from this.
        for (const field in this) {
            if (klass[field] !== this[field] && !klass.hasOwnProperty(field)) klass[field] = this[field];
        }
        
        klass.prototype.constructor = klass.prototype.klass = klass;
        eigenFunc(klass).include(parent.__meta__, {_rslv:resolve});
        klass.__tgt__ = klass.prototype;
        
        const parentModule = parent === Object ? {} : (parent.__fns__ ? parent : new Module(parent.prototype, resolveFalse));
        klass.include(Kernel, resolveFalse).include(parentModule, resolveFalse).include(methods, resolveFalse);
        
        if (resolve !== false) resolveModule(klass);
        
        return klass;
    };
    
    const classify = (klass, parent) => {
        klass.__inc__ = [];
        klass.__dep__ = [];
        const proto = klass.__tgt__ = klass.prototype,
            methods = klass.__fns__ = {};
            
        for (const field of Object.keys(proto)) methods[field] = createMethod(klass, field, proto[field]);
        proto.constructor = proto.klass = klass;
        
        // The klass extends from Class.prototype.
        for (const field in classProto) {
            if (klass[field] !== classProto[field] && !klass.hasOwnProperty(field)) klass[field] = classProto[field];
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
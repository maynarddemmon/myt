((exports) => {
    exports.extend = function(destination, source, overwrite) {
        if (destination && source) {
            for (var field in source) {
                if (destination[field] !== source[field] && (overwrite || !destination.hasOwnProperty(field))) {
                    destination[field] = source[field];
                }
            }
        }
        return destination;
    };
      
    exports.makeClass = function(parent) {
        var constructor = function() {
            var init = this.initialize;
            return init ? init.apply(this, arguments) || this : this;
        };
        
        var bridge = function() {};
        bridge.prototype = (parent || Object).prototype;
        constructor.prototype = new bridge();
        
        return constructor;
    };
    
    exports.Method = exports.makeClass();
    exports.extend(exports.Method.prototype, {
      initialize: function(module, name, callable) {
        this.module = module;
        this.name = name;
        this.callable = callable;
        this._hasSuper = typeof callable === 'function' && callable.toString().indexOf('callSuper') !== -1;
      },
    
      call: function() {
        return this.callable.call.apply(this.callable, arguments);
      },
    
      apply: function(receiver, args) {
        return this.callable.apply(receiver, args);
      },
    
      compile: function(environment) {
        var method = this,
            callable = method.callable,
            keywordCallSuper = exports.Method.keywordCallSuper,
            superFunc = method._hasSuper && keywordCallSuper ? keywordCallSuper : null;
        
        return superFunc === null ? callable : function() {
          var prevValue, prevOwn, 
            existing = this.callSuper,
            doSuper = !existing || existing.__kwd__;
          
          if (doSuper) {
            prevValue = existing;
            prevOwn = this.hasOwnProperty('callSuper');
            var kwd = this.callSuper = superFunc(method, environment, this, arguments);
            if (kwd) kwd.__kwd__ = true;
          }
          
          var returnValue = callable.apply(this, arguments);
          
          if (doSuper) {
            if (prevOwn) {
              this.callSuper = prevValue;
            } else {
              delete this.callSuper;
            }
          }
          
          return returnValue;
        };
      }
    });
    
    exports.Method.create = function(module, name, callable) {
      return (callable && callable.__inc__ && callable.__fns__) || typeof callable !== 'function' ? callable : new this(module, name, callable);
    };
    
    exports.Method.compile = function(method, environment) {
      return method instanceof this ? method.compile(environment) : method;
    };
    
    exports.Module = exports.makeClass();
    exports.extend(exports.Module.prototype, {
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
        this.__fns__[name] = exports.Method.create(this, name, callable);
        if ((options || {})._resolve !== false) this.resolve();
      },
    
      /** Mixes in a module to this module.
          @param {!Function} module - The JS.Module to mix in.
          @param {?Object} [options]
          @returns {!Function) this JS.Module. */
      include: function(module, options) {
        if (module) {
          options = options || {};
          var extend  = module.extend,
              include = module.include,
              extended, field, value, mixins, i, n, resolveFalse;
          
          if (module.__fns__ && module.__inc__) {
            this.__inc__.push(module);
            module.__dep__.push(this);
            
            if (extended = options._extended) {
              // Meta programming hook: Called when a subclass is created of 
              // this module
              if (typeof module.extended === 'function') module.extended(extended);
            } else {
              // Meta programming hook: If you include() a module that has a 
              // singleton method called includedBy, that method will be called.
              if (typeof module.includedBy === 'function') module.includedBy(this);
            }
          } else {
            resolveFalse = {_resolve:false};
            if (this._ignore(extend)) {
              mixins = [].concat(extend);
              for (i = 0, n = mixins.length; i < n;) this.extend(mixins[i++]);
            }
            if (this._ignore(include)) {
              mixins = [].concat(include);
              for (i = 0, n = mixins.length; i < n;) this.include(mixins[i++], resolveFalse);
            }
            for (field in module) {
              if (module.hasOwnProperty(field)) {
                value = module[field];
                if ((field === 'extend' || field === 'include') && this._ignore(value)) continue;
                this.define(field, value, resolveFalse);
              }
            }
          }
          
          if (options._resolve !== false) this.resolve();
        }
        return this;
      },
    
      /** @private
          @param {*} value
          @returns {boolean} */
      _ignore: function(value) {
        return typeof value !== 'function' || (value.__fns__ && value.__inc__);
      },
    
      resolve: function(host) {
        host = host || this;
        var target = host.__tgt__,
            inc = this.__inc__,
            fns = this.__fns__,
            i, n, key, compiled;
        
        if (host === this) {
          this.__anc__ = null;
          this.__mct__ = {};
          i = this.__dep__.length;
          while (i) this.__dep__[--i].resolve();
        }
    
        if (target) {
          for (i = 0, n = inc.length; i < n;) inc[i++].resolve(host);
          
          for (key in fns) {
            compiled = exports.Method.compile(fns[key], host);
            if (target[key] !== compiled) target[key] = compiled;
          }
        }
      },
    
      /** Gets the ancestor classes array.
          @param {?Array} [list] - An array of ancestors that will have
            ancestor classes pushed onto. If not provided a new array will
            be created.
          @returns {!Array} */
      ancestors: function(list) {
        var cachable = !list,
            inc = this.__inc__;
        list = list || [];
        
        if (cachable && this.__anc__) return this.__anc__.slice();
        
        for (var i = 0, n = inc.length; i < n;) inc[i++].ancestors(list);
        
        if (list.indexOf(this) < 0) list.push(this);
        
        if (cachable) this.__anc__ = list.slice();
        return list;
      },
    
      /** Gets an array of JS.Methods for the provided method name.
          @param {string} name - The name of the method to lookup.
          @returns {!Array} An array of JS.Methods from the ancestors chain. */
      lookup: function(name) {
        var cached = this.__mct__[name];
        if (cached) return cached.slice();
        
        var ancestors = this.ancestors(), 
          n = ancestors.length,
          methods = [], fns, i = 0;
        for (; i < n;) {
          fns = ancestors[i++].__fns__;
          if (fns.hasOwnProperty(name)) methods.push(fns[name]);
        }
        this.__mct__[name] = methods.slice();
        return methods;
      },
    
      /** Checks if this module includes the provided module.
          @param {!Function} module - The module to check for.
          @returns {boolean} True if the module is included, otherwise false. */
      includes: function(module) {
        if (module === this) return true;
        
        var inc = this.__inc__, n = inc.length, i = 0;
        for (; i < n;) {
          if (inc[i++].includes(module)) return true;
        }
        return false;
      },
    
      /** Extracts a single named method from a module.
          @param {string} name - The name of the method to extract.
          @return {!Function) The extracted JS.Method. */
      instanceMethod: function(name) {
        return this.lookup(name).pop();
      }
    });
    
    exports.Kernel = new exports.Module('Kernel', {
      __eigen__: function() {
        var meta = this.__meta__;
        if (meta) return meta;
        meta = this.__meta__ = new exports.Module('', null, {_target: this});
        return meta.include(this.klass, {_resolve: false});
      },
    
      equals: function(other) {
        return this === other;
      },
    
      extend: function(module, options) {
        if (module) this.__eigen__().include(module, {_extended:this, _resolve:(options || {})._resolve});
        return this;
      },
    
      /** Checks if this object includes, extends or is the provided module.
          @param {!Function} module - The JS.Module module to check for.
          @returns {boolean} */
      isA: function(module) {
        return (typeof module === 'function' && this instanceof module) || this.__eigen__().includes(module);
      },
    
      method: function(name) {
        var cache = this.__mct__ || (this.__mct__ = {}),
            value = cache[name],
            field = this[name];
        
        if (typeof field !== 'function') return field;
        if (value && field === value._value) return value._bound;
        
        var bound = field.bind(this);
        cache[name] = {_value:field, _bound:bound};
        return bound;
      }
    });
    
    exports.Class = exports.makeClass(exports.Module);
    exports.extend(exports.Class.prototype, {
      initialize: function(name, parent, methods, options) {
        if (typeof parent !== 'function') {
          options = methods;
          methods = parent;
          parent  = Object;
        }
        
        exports.Module.prototype.initialize.call(this, name);
        
        var resolve = (options || {})._resolve,
          resolveFalse = {_resolve:false},
          klass = exports.makeClass(parent);
        exports.extend(klass, this);
        klass.prototype.constructor = klass.prototype.klass = klass;
        klass.__eigen__().include(parent.__meta__, {_resolve:resolve});
        klass.__tgt__ = klass.prototype;
        
        var parentModule = parent === Object ? {} : (parent.__fns__ ? parent : new exports.Module(parent.prototype, resolveFalse));
        klass.include(exports.Kernel, resolveFalse).include(parentModule, resolveFalse).include(methods, resolveFalse);
         
        if (resolve !== false) klass.resolve();
        
        // Meta programming hook: If a class has a class method called inheritedBy() 
        // it will be called whenever you create a subclass of it
        if (typeof parent.inheritedBy === 'function') parent.inheritedBy(klass);
        
        return klass;
      }
    });
    
    (function() {
      var JS_METHOD = exports.Method, 
        JS_KERNEL = exports.Kernel, 
        JS_CLASS = exports.Class, 
        JS_MODULE = exports.Module,
        classify = function(klass, parent) {
          klass.__inc__ = [];
          klass.__dep__ = [];
          var proto = klass.prototype,
            methods = {}, 
            field;
          for (field in proto) {
            if (proto.hasOwnProperty(field)) methods[field] = JS_METHOD.create(klass, field, proto[field]);
          }
          klass.__fns__ = methods;
          klass.__tgt__ = proto;
          
          proto.constructor = proto.klass = klass;
          
          exports.extend(klass, JS_CLASS.prototype);
          klass.include(parent);
          
          klass.constructor = klass.klass = JS_CLASS;
        };
      classify(JS_METHOD, JS_KERNEL);
      classify(JS_MODULE, JS_KERNEL);
      classify(JS_CLASS,  JS_MODULE);
      
      var eigen = JS_KERNEL.instanceMethod('__eigen__');
      eigen.call(JS_METHOD).resolve();
      eigen.call(JS_MODULE).resolve();
      eigen.call(JS_CLASS).include(JS_MODULE.__meta__);
    })();
    
    // Must come after classification.
    exports.Method.keywordCallSuper = function(method, env, receiver, args) {
      var methods = env.lookup(method.name),
          stackIndex = methods.length - 1,
          params = Array.prototype.slice.call(args);
      
      if (stackIndex === 0) return undefined;
      
      var _super = function() {
        var i = arguments.length;
        while (i) params[--i] = arguments[i];
        
        stackIndex--;
        if (stackIndex === 0) delete receiver.callSuper;
        var returnValue = methods[stackIndex].apply(receiver, params);
        receiver.callSuper = _super;
        stackIndex++;
        
        return returnValue;
      };
      
      return _super;
    };
    
    /** Create a single instance of a "private" class. */
    exports.Singleton = new exports.Class('Singleton', {
      initialize: function(name, parent, methods) {
        return new (new exports.Class(name, parent, methods));
      }
    });
})(global.JS || (global.JS = {}));
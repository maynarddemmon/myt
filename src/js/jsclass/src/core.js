JS = {
  extend: function(destination, source, overwrite) {
    if (destination && source) {
      for (var field in source) {
        if (destination[field] !== source[field] && (overwrite || !destination.hasOwnProperty(field))) {
          destination[field] = source[field];
        }
      }
    }
    return destination;
  },
  
  makeClass: function(parent) {
    var constructor = function() {
      var init = this.initialize;
      return init ? init.apply(this, arguments) || this : this;
    };
    
    var bridge = function() {};
    bridge.prototype = (parent || Object).prototype;
    constructor.prototype = new bridge();
    
    return constructor;
  }
};

JS.Method = JS.makeClass();
JS.extend(JS.Method.prototype, {
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
        keywordCallSuper = JS.Method.keywordCallSuper,
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

JS.Method.create = function(module, name, callable) {
  return (callable && callable.__inc__ && callable.__fns__) || typeof callable !== 'function' ? callable : new this(module, name, callable);
};

JS.Method.compile = function(method, environment) {
  return method instanceof this ? method.compile(environment) : method;
};

JS.Module = JS.makeClass();
JS.extend(JS.Module.prototype, {
  initialize: function(name, methods, options) {
    this.__inc__ = [];
    this.__dep__ = [];
    this.__fns__ = {};
    this.__tgt__ = (options || {})._target;
    this.__anc__ = null;
    this.__mct__ = {};
    
    this.include(methods, {_resolve:false});
  },

  /** Adds a single named method to a JS.Class/JS.Module. If you’re modifying 
      a class, the method instantly becomes available in instances of the 
      class, and in its subclasses.
      @param name:string The name of the method to add.
      @param callable:function The method implementation.
      @param options:object (optional)
      @returns void */
  define: function(name, callable, options) {
    this.__fns__[name] = JS.Method.create(this, name, callable);
    if ((options || {})._resolve !== false) this.resolve();
  },

  /** Mixes in a module to this module.
      @param module:JS.Module The module to mix in.
      @param options:object (optional)
      @returns JS.Module this module. */
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
          if (typeof module.extended === 'function') module.extended(extended);
        } else {
          if (typeof module.included === 'function') module.included(this);
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

  /** @private */
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
        compiled = JS.Method.compile(fns[key], host);
        if (target[key] !== compiled) target[key] = compiled;
      }
    }
  },

  /** Gets the ancestor classes array.
      @param list:array (optional) An array of ancestors that will have
        ancestor classes pushed onto. If not provided a new array will
        be created.
      @return array */
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
      @param name:string The name of the method to lookup.
      @return array An array of JS.Methods from the ancestors chain. */
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
      @param module:JS.Module The module to check for.
      @return boolean True if the module is included, otherwise false. */
  includes: function(module) {
    if (module === this) return true;
    
    var inc = this.__inc__, n = inc.length, i = 0;
    for (; i < n;) {
      if (inc[i++].includes(module)) return true;
    }
    return false;
  },

  /** Extracts a single named method from a module.
      @param name:string The name of the method to extract.
      @return JS.Method The extracted method. */
  instanceMethod: function(name) {
    return this.lookup(name).pop();
  }
});

JS.Kernel = new JS.Module('Kernel', {
  __eigen__: function() {
    var meta = this.__meta__;
    if (meta) return meta;
    meta = this.__meta__ = new JS.Module('', null, {_target: this});
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
      @param module:JS.Module The module to check for.
      @return boolean */
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

JS.Class = JS.makeClass(JS.Module);
JS.extend(JS.Class.prototype, {
  initialize: function(name, parent, methods, options) {
    if (typeof parent !== 'function') {
      options = methods;
      methods = parent;
      parent  = Object;
    }
    
    JS.Module.prototype.initialize.call(this);
    
    var resolve = (options || {})._resolve,
      resolveFalse = {_resolve:false},
      klass = JS.makeClass(parent);
    klass.__displayName = name;
    JS.extend(klass, this);
    klass.prototype.constructor = klass.prototype.klass = klass;
    klass.__eigen__().include(parent.__meta__, {_resolve:resolve});
    klass.__tgt__ = klass.prototype;
    
    var parentModule = parent === Object ? {} : (parent.__fns__ ? parent : new JS.Module(parent.prototype, resolveFalse));
    klass.include(JS.Kernel, resolveFalse).include(parentModule, resolveFalse).include(methods, resolveFalse);
     
    if (resolve !== false) klass.resolve();
    if (typeof parent.inherited === 'function') parent.inherited(klass);
    
    return klass;
  }
});

(function() {
  var JS_METHOD = JS.Method, JS_KERNEL = JS.Kernel, 
    JS_CLASS = JS.Class, JS_MODULE = JS.Module,
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
      
      JS.extend(klass, JS_CLASS.prototype);
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
JS.Method.keywordCallSuper = function(method, env, receiver, args) {
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
JS.Singleton = new JS.Class('Singleton', {
  initialize: function(name, parent, methods) {
    return new (new JS.Class(name, parent, methods));
  }
});
JS = {
  extend: function(destination, source, overwrite) {
    if (destination && source) {
      for (var field in source) {
        if (destination[field] !== source[field]) {
          if (overwrite || !destination.hasOwnProperty(field)) {
            destination[field] = source[field];
          }
        }
      }
    }
    return destination;
  },
  
  makeClass: function(parent) {
    parent = parent || Object;
    
    var constructor = function() {
      var init = this.initialize;
      return init ? init.apply(this, arguments) || this : this;
    };
    
    var bridge = function() {};
    bridge.prototype = parent.prototype;
    constructor.prototype = new bridge();
    
    return constructor;
  }
};

JS.Method = JS.makeClass();

JS.extend(JS.Method.prototype, {
  initialize: function(module, name, callable) {
    this.module   = module;
    this.name     = name;
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
  if (callable && callable.__inc__ && callable.__fns__) return callable;

  return (typeof callable !== 'function') ? callable : new this(module, name, callable);
};

JS.Method.compile = function(method, environment) {
  return (method instanceof this) ? method.compile(environment) : method;
};

JS.Module = JS.makeClass();

JS.extend(JS.Module.prototype, {
  initialize: function(name, methods, options) {
    if (typeof name !== 'string') {
      options = arguments[1];
      methods = arguments[0];
      name    = undefined;
    }
    options = options || {};

    this.__inc__ = [];
    this.__dep__ = [];
    this.__fns__ = {};
    this.__tgt__ = options._target;
    this.__anc__ = null;
    this.__mct__ = {};

    this.include(methods, {_resolve: false});
  },

  define: function(name, callable, options) {
    var resolve = (options || {})._resolve;

    this.__fns__[name] = JS.Method.create(this, name, callable);
    if (resolve !== false) this.resolve();
  },

  include: function(module, options) {
    if (!module) return this;

    var options = options || {},
        resolve = options._resolve !== false,
        extend  = module.extend,
        include = module.include,
        extended, field, value, mixins, i, n;

    if (module.__fns__ && module.__inc__) {
      this.__inc__.push(module);
      if ((module.__dep__ || {}).push) module.__dep__.push(this);

      if (extended = options._extended) {
        if (typeof module.extended === 'function') module.extended(extended);
      } else {
        if (typeof module.included === 'function') module.included(this);
      }
    } else {
      if (this.shouldIgnore('extend', extend)) {
        mixins = [].concat(extend);
        for (i = 0, n = mixins.length; i < n;) this.extend(mixins[i++]);
      }
      if (this.shouldIgnore('include', include)) {
        mixins = [].concat(include);
        for (i = 0, n = mixins.length; i < n;) this.include(mixins[i++], {_resolve: false});
      }
      for (field in module) {
        if (module.hasOwnProperty(field)) {
          value = module[field];
          if (this.shouldIgnore(field, value)) continue;
          this.define(field, value, {_resolve: false});
        }
      }
    }

    if (resolve) this.resolve();
    return this;
  },

  resolve: function(host) {
    var host   = host || this,
        target = host.__tgt__,
        inc    = this.__inc__,
        fns    = this.__fns__,
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

  shouldIgnore: function(field, value) {
    return (field === 'extend' || field === 'include') &&
           (typeof value !== 'function' || (value.__fns__ && value.__inc__));
  },

  ancestors: function(list) {
    var cachable = !list,
        list     = list || [],
        inc      = this.__inc__;

    if (cachable && this.__anc__) return this.__anc__.slice();

    for (var i = 0, n = inc.length; i < n;) inc[i++].ancestors(list);

    if (list.indexOf(this) < 0) list.push(this);

    if (cachable) this.__anc__ = list.slice();
    return list;
  },

  lookup: function(name) {
    var cached = this.__mct__[name];
    if (cached && cached.slice) return cached.slice();

    var ancestors = this.ancestors(),
        methods   = [],
        fns;

    for (var i = 0, n = ancestors.length; i < n;) {
      fns = ancestors[i++].__fns__;
      if (fns.hasOwnProperty(name)) methods.push(fns[name]);
    }
    this.__mct__[name] = methods.slice();
    return methods;
  },

  includes: function(module) {
    if (module === this) return true;

    var inc = this.__inc__;

    for (var i = 0, n = inc.length; i < n;) {
      if (inc[i++].includes(module)) return true;
    }
    return false;
  },

  instanceMethod: function(name) {
    return this.lookup(name).pop();
  }
});

JS.Kernel = new JS.Module('Kernel', {
  __eigen__: function() {
    if (this.__meta__) return this.__meta__;
    this.__meta__ = new JS.Module('', null, {_target: this});
    return this.__meta__.include(this.klass, {_resolve: false});
  },

  equals: function(other) {
    return this === other;
  },

  extend: function(module, options) {
    var resolve = (options || {})._resolve;
    this.__eigen__().include(module, {_extended: this, _resolve: resolve});
    return this;
  },

  isA: function(module) {
    return (typeof module === 'function' && this instanceof module) ||
           this.__eigen__().includes(module);
  },

  method: function(name) {
    var cache = this.__mct__ = this.__mct__ || {},
        value = cache[name],
        field = this[name];

    if (typeof field !== 'function') return field;
    if (value && field === value._value) return value._bound;

    var bound = field.bind(this);
    cache[name] = {_value: field, _bound: bound};
    return bound;
  }
});

JS.Class = JS.makeClass(JS.Module);

JS.extend(JS.Class.prototype, {
  initialize: function(name, parent, methods, options) {
    if (typeof name !== 'string') {
      options = arguments[2];
      methods = arguments[1];
      parent  = arguments[0];
      name    = undefined;
    }
    if (typeof parent !== 'function') {
      options = methods;
      methods = parent;
      parent  = Object;
    }
    JS.Module.prototype.initialize.call(this, name);
    options = options || {};

    var klass = JS.makeClass(parent);
    klass.__displayName = name;
    JS.extend(klass, this);

    klass.prototype.constructor = klass.prototype.klass = klass;

    klass.__eigen__().include(parent.__meta__, {_resolve: options._resolve});

    klass.__tgt__ = klass.prototype;

    var parentModule = (parent === Object)
                     ? {}
                     : (parent.__fns__ ? parent : new JS.Module(parent.prototype, {_resolve: false}));

    klass.include(JS.Kernel,    {_resolve: false})
         .include(parentModule, {_resolve: false})
         .include(methods,      {_resolve: false});

    if (options._resolve !== false) klass.resolve();

    if (typeof parent.inherited === 'function') parent.inherited(klass);

    return klass;
  }
});

(function() {
  var classify = function(klass, parent) {
    klass.__inc__ = [];
    klass.__dep__ = [];
    var proto = klass.prototype,
      methods = {}, 
      field;
    for (field in proto) {
      if (proto.hasOwnProperty(field)) {
        methods[field] = JS.Method.create(klass, field, proto[field]);
      }
    }
    klass.__fns__ = methods;
    klass.__tgt__ = proto;
    
    proto.constructor = proto.klass = klass;
    
    JS.extend(klass, JS.Class.prototype);
    klass.include(parent);
    
    klass.constructor = klass.klass = JS.Class;
  };
  classify(JS.Method, JS.Kernel);
  classify(JS.Module, JS.Kernel);
  classify(JS.Class,  JS.Module);

  var eigen = JS.Kernel.instanceMethod('__eigen__');
  eigen.call(JS.Method).resolve();
  eigen.call(JS.Module).resolve();
  eigen.call(JS.Class).include(JS.Module.__meta__);
})();

JS.Method.keywordCallSuper = function(method, env, receiver, args) {
  var methods    = env.lookup(method.name),
      stackIndex = methods.length - 1,
      params     = Array.prototype.slice.call(args);

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

JS.Singleton = new JS.Class('Singleton', {
  initialize: function(name, parent, methods) {
    return new (new JS.Class(name, parent, methods));
  }
});
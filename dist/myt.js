/** Based on browser detection from: http://www.quirksmode.org/js/detect.html
    
    Events:
        none
    
    Attributes:
        browser:string The browser name.
        version:number The browser version number.
        os:string The operating system.
*/
BrowserDetect = (() => {
    var versionSearchString,
        
        searchString = (data) => {
            var dataItem, i = data.length;
            while (i) {
                dataItem = data[--i];
                versionSearchString = dataItem.ver || dataItem.id;
                if ((dataItem.str && dataItem.str.indexOf(dataItem.sub) >= 0) || dataItem.prop) return dataItem.id;
            }
        },
        
        searchVersion = (dataString) => {
            var index = dataString.indexOf(versionSearchString);
            if (index >= 0) return parseFloat(dataString.substring(index + versionSearchString.length + 1));
        },
        
        userAgent = navigator.userAgent, 
        platform = navigator.platform, 
        unknown = 'UNKNOWN',
        
        exports = {
            browser:searchString([
                {prop:window.opera,                   id:"Opera",    ver:"Version"},
                {str:navigator.vendor, sub:"Apple",   id:"Safari",   ver:"Version"},
                {str:userAgent,        sub:"Firefox", id:"Firefox"},
                {str:userAgent,        sub:"Chrome",  id:"Chrome"},
                {str:userAgent,        sub:"MSIE",    id:"Explorer", ver:"MSIE"}
            ]) || unknown,
            
            version:searchVersion(userAgent) || searchVersion(navigator.appVersion) || unknown,
            
            os:searchString([
                {str:userAgent, sub:"iPhone", id:"iPhone/iPod"},
                {str:platform,  sub:"Linux",  id:"Linux"},
                {str:platform,  sub:"Mac",    id:"Mac"},
                {str:platform,  sub:"Win",    id:"Windows"}
            ]) || unknown
        },
        dom,
        pre;
    
    switch (exports.browser) {
        case 'Chrome': case 'Safari': dom = 'WebKit'; break;
        case 'Explorer': dom = 'MS'; break;
        case 'Firefox': dom = 'Moz'; break;
        case 'Opera': dom = 'O'; break;
        default: dom = unknown; break;
    }
    pre = dom.toLowerCase();
    
    exports.prefix = {
        dom:dom,
        lowercase:pre,
        css:'-' + pre + '-',
        js:pre[0].toUpperCase() + pre.substr(1)
    };
    
    return exports;
})();


/** Formats a date using a pattern.
  * Implementation from: https://github.com/jacwright/date.format
  * 
  * Copyright (c) 2005 Jacob Wright
  *
  * Permission is hereby granted, free of charge, to any person obtaining a copy
  * of this software and associated documentation files (the "Software"), to deal
  * in the Software without restriction, including without limitation the rights
  * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  * copies of the Software, and to permit persons to whom the Software is
  * furnished to do so, subject to the following conditions:
  *
  * The above copyright notice and this permission notice shall be included in
  * all copies or substantial portions of the Software.
  *
  * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
  * THE SOFTWARE
  */
Date.prototype.format = Date.prototype.format || (function() {
    Date.shortMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    Date.longMonths = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    Date.shortDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    Date.longDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    // defining patterns
    var replaceChars = {
        // Day
        d: function() {return (this.getDate() < 10 ? '0' : '') + this.getDate();},
        D: function() {return Date.shortDays[this.getDay()];},
        j: function() {return this.getDate();},
        l: function() {return Date.longDays[this.getDay()];},
        N: function() {return (this.getDay() == 0 ? 7 : this.getDay());},
        S: function() {return (this.getDate() % 10 == 1 && this.getDate() != 11 ? 'st' : (this.getDate() % 10 == 2 && this.getDate() != 12 ? 'nd' : (this.getDate() % 10 == 3 && this.getDate() != 13 ? 'rd' : 'th')));},
        w: function() {return this.getDay();},
        z: function() {var d = new Date(this.getFullYear(),0,1); return Math.ceil((this - d) / 86400000);}, // Fixed now
        // Week
        W: function() {
            var target = new Date(this.valueOf());
            var dayNr = (this.getDay() + 6) % 7;
            target.setDate(target.getDate() - dayNr + 3);
            var firstThursday = target.valueOf();
            target.setMonth(0, 1);
            if (target.getDay() !== 4) {
                target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
            }
            var retVal = 1 + Math.ceil((firstThursday - target) / 604800000);
            return (retVal < 10 ? '0' + retVal : retVal);
        },
        // Month
        F: function() {return Date.longMonths[this.getMonth()];},
        m: function() {return (this.getMonth() < 9 ? '0' : '') + (this.getMonth() + 1);},
        M: function() {return Date.shortMonths[this.getMonth()];},
        n: function() {return this.getMonth() + 1;},
        t: function() {
            var year = this.getFullYear(), nextMonth = this.getMonth() + 1;
            if (nextMonth === 12) {
                year = year++;
                nextMonth = 0;
            }
            return new Date(year, nextMonth, 0).getDate();
        },
        // Year
        L: function() {var year = this.getFullYear(); return (year % 400 == 0 || (year % 100 != 0 && year % 4 == 0));}, // Fixed now
        o: function() {var d  = new Date(this.valueOf());  d.setDate(d.getDate() - ((this.getDay() + 6) % 7) + 3); return d.getFullYear();}, //Fixed now
        Y: function() {return this.getFullYear();},
        y: function() {return ('' + this.getFullYear()).substr(2);},
        // Time
        a: function() {return this.getHours() < 12 ? 'am' : 'pm';},
        A: function() {return this.getHours() < 12 ? 'AM' : 'PM';},
        B: function() {return Math.floor((((this.getUTCHours() + 1) % 24) + this.getUTCMinutes() / 60 + this.getUTCSeconds() / 3600) * 1000 / 24);}, // Fixed now
        g: function() {return this.getHours() % 12 || 12;},
        G: function() {return this.getHours();},
        h: function() {return ((this.getHours() % 12 || 12) < 10 ? '0' : '') + (this.getHours() % 12 || 12);},
        H: function() {return (this.getHours() < 10 ? '0' : '') + this.getHours();},
        i: function() {return (this.getMinutes() < 10 ? '0' : '') + this.getMinutes();},
        s: function() {return (this.getSeconds() < 10 ? '0' : '') + this.getSeconds();},
        u: function() {var m = this.getMilliseconds(); return (m < 10 ? '00' : (m < 100 ? '0' : '')) + m;},
        // Timezone
        e: function() {return /\((.*)\)/.exec(new Date().toString())[1];},
        I: function() {
            var DST = null;
                for (var i = 0; i < 12; ++i) {
                    var d = new Date(this.getFullYear(), i, 1);
                    var offset = d.getTimezoneOffset();
                    if (DST === null) {
                        DST = offset;
                    } else if (offset < DST) {
                        DST = offset; break;
                    } else if (offset > DST) {
                        break;
                    }
                }
                return (this.getTimezoneOffset() == DST) | 0;
            },
        O: function() {return (-this.getTimezoneOffset() < 0 ? '-' : '+') + (Math.abs(this.getTimezoneOffset() / 60) < 10 ? '0' : '') + Math.floor(Math.abs(this.getTimezoneOffset() / 60)) + (Math.abs(this.getTimezoneOffset() % 60) == 0 ? '00' : ((Math.abs(this.getTimezoneOffset() % 60) < 10 ? '0' : '')) + (Math.abs(this.getTimezoneOffset() % 60)));},
        P: function() {return (-this.getTimezoneOffset() < 0 ? '-' : '+') + (Math.abs(this.getTimezoneOffset() / 60) < 10 ? '0' : '') + Math.floor(Math.abs(this.getTimezoneOffset() / 60)) + ':' + (Math.abs(this.getTimezoneOffset() % 60) == 0 ? '00' : ((Math.abs(this.getTimezoneOffset() % 60) < 10 ? '0' : '')) + (Math.abs(this.getTimezoneOffset() % 60)));},
        T: function() {return Intl.DateTimeFormat().resolvedOptions().timeZone;},
        Z: function() {return -this.getTimezoneOffset() * 60;},
        // Full Date/Time
        c: function() {return this.format("Y-m-d\\TH:i:sP");},
        r: function() {return this.toString();},
        U: function() {return this.getTime() / 1000;}
    };

    return function(format) {
        var date = this;
        return format.replace(/(\\?)(.)/g, function(_, esc, chr) {
            return (esc === '' && replaceChars[chr]) ? replaceChars[chr].call(date) : chr;
        });
    };
})();


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
    
    this.__displayName = name;
    
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
    
    JS.Module.prototype.initialize.call(this, name);
    
    var resolve = (options || {})._resolve,
      resolveFalse = {_resolve:false},
      klass = JS.makeClass(parent);
    JS.extend(klass, this);
    klass.prototype.constructor = klass.prototype.klass = klass;
    klass.__eigen__().include(parent.__meta__, {_resolve:resolve});
    klass.__tgt__ = klass.prototype;
    
    var parentModule = parent === Object ? {} : (parent.__fns__ ? parent : new JS.Module(parent.prototype, resolveFalse));
    klass.include(JS.Kernel, resolveFalse).include(parentModule, resolveFalse).include(methods, resolveFalse);
     
    if (resolve !== false) klass.resolve();
    
    // Meta programming hook: If a class has a class method called inheritedBy() 
    // it will be called whenever you create a subclass of it
    if (typeof parent.inheritedBy === 'function') parent.inheritedBy(klass);
    
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

/**
 * http://github.com/maynarddemmon/myt
 * Maynard Demmon <maynarddemmon@gmail.com.
 * @copyright Copyright (c) 2012-2018 Maynard Demmon and contributors
 * Myt: A simple javascript UI framework
 * Version: 20170326.2144
 * MIT License
 * 
 * Parts of the Software incorporates code from the following open-source projects:
 * * JS.Class, (c) 2007-2012 James Coglan and contributors (MIT License)
 * * Easing Functions, (c) 2001 Robert Penner (BSD License)
 * * jQuery Easing v1.3, (c) 2008 George McGinley Smith (BSD License)
 * * jQuery Cookie Plugin v1.3.1, (c) 2013 Klaus Hartl (MIT License)
 * * parseUri 1.2.2, (c) Steven Levithan <stevenlevithan.com> (MIT License)
 * * Spin.js 1.3.0 (c) 2011-2013 Felix Gnass (the MIT license)
 * * date.format Date:03/10/15, Copyright (c) 2005 Jacob Wright https://github.com/jacwright/date.format
 * * k-d Tree JavaScript - v1.0 (c) Mircea Pricop <pricop@ubilabs.net>,
 *                                  Martin Kleppe <kleppe@ubilabs.net>,
 *                                  Ubilabs http://ubilabs.net (MIT License)
 */
myt = {
    /** A version number based on the time this distribution of myt was
        created. */
    version:20191105.1227,
    
    /** The root path to image assets for the myt package. MYT_IMAGE_ROOT
        should be set by the page that includes this script. */
    IMAGE_ROOT: global.MYT_IMAGE_ROOT || '',
    
    /** Used to generate globally unique IDs. */
    __GUID_COUNTER: 0,
    
    /** Generates a globally unique id, (GUID).
        @return number */
    generateGuid: () => ++myt.__GUID_COUNTER,
    
    /*  Event listener code Adapted from: http://javascript.about.com/library/bllisten.htm
        A more robust solution can be found here: http://msdn.microsoft.com/en-us/magazine/ff728624.aspx */
    /** Adds an event listener to a dom element. 
        @param elem:DomElement the dom element to listen to.
        @param type:string the name of the event to listen to.
        @param callback:function the callback function that will be
            registered for the event.
        @param capture:boolean (optional) indicates if the listener is 
            registered during the capture phase or bubble phase.
        @returns void */
    addEventListener: (() => {
        if (window.addEventListener) {
            return (elem, type, callback, capture, passive) => {
                elem.addEventListener(type, callback, {
                    capture:capture || false,
                    passive:passive || false
                });
            };
        } else {
            return (elem, type, callback) => {
                var prop = type + callback;
                elem['e' + prop] = callback;
                elem[prop] = () => {elem['e' + prop](window.event);}
                elem.attachEvent('on' + type, elem[prop]);
            };
        }
    })(),
    removeEventListener: (() => {
        if (window.addEventListener) {
            return (elem, type, callback, capture) => {
                elem.removeEventListener(type, callback, capture || false);
            };
        } else {
            return (elem, type, callback) => {
                var prop = type + callback;
                elem.detachEvent('on' + type, elem[prop]);
                elem[prop] = null;
                elem["e" + prop] = null;
            };
        }
    })(),
    
    /** Takes a '.' separated string such as "foo.bar.baz" and resolves it
        into the value found at that location relative to a starting scope.
        If no scope is provided global scope is used.
        @param objName:string|array The name to resolve or an array of path
            parts in descending order.
        @param scope:Object (optional) The scope to resolve from. If not
            provided global scope is used.
        @returns The referenced object or undefined if resolution failed. */
    resolveName: (objName, scope) => {
        if (!objName || objName.length === 0) return undefined;
        
        var scope = scope || global,
            parts = Array.isArray(objName) ? objName : objName.split("."),
            i = 0, len = parts.length;
        for (; i < len; ++i) {
            scope = scope[parts[i]];
            if (scope === undefined) {
                console.warn("resolveName failed for:", objName, "at part:", i, parts[i]);
                return undefined;
            }
        }
        return scope;
    },
    
    /** Resolves a provided string into a JS.Class object. If a non-string 
        value is provided it is verified to be a JS.Class object.
        @param value:string:* The value to resolve and/or verify.
        @returns a JS.Class object or null if the string could not be resolved
            or the value was not a JS.Class object. */
    resolveClassname: (value) => {
        if (typeof value === 'string') value = myt.resolveName(value);
        
        // Make sure what we found is really a JS.Class otherwise return null.
        return (value && typeof value.isA === 'function' && value.isA(JS.Class)) ? value : null;
    },
    
    /** Gets the file extension from a file name.
        @param fileName:string The filename to extract the extension from.
        @returns a string of the file extension or null if a falsy fileName
            argument was provided. */
    getExtension: function(fileName) {
        return fileName ? fileName.split('.')[1] : null;
    },
    
    // Text Templating
    /** Populates a text "template" with 1 or more arguments. The
        template consists of a string with text interspersed with 
        curly-braced indices. The arguments are replaced in order one at
        a time into the template. For example:
        
            myt.fillTextTemplate("{0}/{2}/{1} hey {0}", 1, 2, 3) 
            will return "1/3/2 hey 1".
        
        @param (first arg):string The template to use.
        @param (remaining args):(coerced to string) The parameters for the
            template.
        @returns A populated string. */
    fillTextTemplate: function() {
        var params = Array.prototype.slice.call(arguments),
            template = params.shift();
        
        if (template == null) return '';
        
        var param, i = 0, len = params.length;
        for (; len > i; ++i) {
            param = params[i];
            template = template.split("{" + i + "}").join(param == null ? '' : param);
        }
        return template;
    },
    
    /** Generates the text for an "a href" html element that when clicked on
        executes a provided callback method name. To resolve the callback
        method name, an ancestor search is performed on the dom starting with
        the link element. The first myt managed dom element encountered is
        used as the scope for the method.
        @param text:string the text to put inside the link.
        @param callbackMethodName:string the name of the method to execute.
        @param attrs:object (optional) a map of additional attributes that
            will be inserted into the tag.
        @param data:object (optional) Data that will be serialized as JSON
            and provided to the link handler.
        @returns void */
    generateLink: (text, callbackMethodName, attrs, data) => {
        var optAttrs = '';
        if (attrs) {
            for (var name in attrs) optAttrs += ' ' + name + '="' + attrs[name] + '"';
        }
        
        return myt.fillTextTemplate(
            '<a href="#" onclick=\'myt.__handleGeneratedLink(this, "{0}", &apos;{3}&apos;); return false;\'{2}>{1}</a>', 
            callbackMethodName, text, optAttrs, JSON.stringify(data)
        );
    },
    
    /** See myt.generateLink for documentation.
        @private
        @returns void */
    __handleGeneratedLink: (elem, callbackMethodName, data) => {
        var model;
        while (elem) {
            model = elem.model;
            if (model) {
                var value;
                try {
                    if (data) value = JSON.parse(data);
                } catch(e) {
                    myt.dumpStack(e);
                }
                
                model[callbackMethodName].call(model, value);
                break;
            }
            elem = elem.parentNode;
        }
    },
    
    /** Dynamically load a script into the dom.
        @param src:string the URL to the script file.
        @param callback:function (optional) A function that will be called
            when the script loads.
        @param noCacheBust:boolean (optional) If true, not cacheBust query
            param will be added. Defaults to undefined which is equivalent
            to false.
        @returns The created script element or null if the script has already
            been loaded. */
    loadScript: function(src, callback, noCacheBust) {
        // Prevent reloading the same script
        var loadedScripts = this._loadedScripts || (this._loadedScripts = {});
        if (loadedScripts[src]) {
            console.warn("script already loaded for src", src);
            return null;
        } else {
            loadedScripts[src] = true;
            
            var s = document.createElement('script');
            s.type = 'text/javascript';
            s.async = false;
            
            if (callback) {
                var r = false;
                s.onload = s.onreadystatechange = function() {
                    if (!r && (!this.readyState || this.readyState === 'complete')) {
                        // Prevent refiring callback
                        r = true;
                        
                        // Prevent later events from this script for example
                        // if the src is changed.
                        s.onload = s.onreadystatechange = null;
                        
                        callback();
                    }
                };
            }
            
            // Must set src AFTER adding onreadystatechange listener otherwise
            // we’ll miss the loaded event for cached scripts
            s.src = src + (noCacheBust ? '' : (src.indexOf('?') !== -1 ? '&' : '?') + 'cacheBust=' + Date.now());
            
            this.getElement('head').appendChild(s);
            
            return s;
        }
    },
    
    /** Used to wrap the first function with the second function. The first
        function is exposed as this.callSuper within the wrapper function.
        @param fn:function the function to wrap.
        @param wrapperFn:function the wrapper function.
        @returns a wrapped function. */
    wrapFunction: function(fn, wrapperFn) {
        return function() {
            // Store existing callSuper function so we can put it back later.
            var oldSuper = this.callSuper;
            
            // Assign new callSuper and execute wrapperFn
            this.callSuper = fn;
            var retval = wrapperFn.apply(this, arguments);
            
            // Restore existing callSuper or delete new callSuper
            if (oldSuper !== undefined) {
                this.callSuper = oldSuper;
            } else {
                delete this.callSuper;
            }
            
            return retval;
        };
    },
    
    /** A wrapper on myt.global.error.notify
        @param err:Error/string The error or message to dump stack for.
        @param type:string (optional) The type of console message to write.
            Allowed values are 'error', 'warn', 'log' and 'debug'. Defaults to
            'error'.
        @returns void */
    dumpStack: (err, type) => {
        var msg;
        if (typeof err === 'string') {
            msg = err;
            err = null;
        }
        myt.global.error.notify(type || 'error', null, msg, err);
    },
    
    // Random numbers
    /** @returns a random number between 0 (inclusive) and 1 (exclusive)
        @param func:function (optional) a distribution function for the
            random numbers. The function should map a number between 0 and 1
            to another number between 0 (inclusive) and 1 (exclusive). If not 
            provided a flat distribution will be used. Example functions:
                - function(v) {return v * v;} will skew the value towards 0.
                - function(v) {return 0.9999999999 - v * v;} will skew the 
                  value towards a value very close to 1.
        @returns number: a random number between 0 and almost 1. */
    getRandom: (func) => {
        var v = Math.random();
        if (func) {
            v = func(v);
            
            // Correct for badly behaved skew functions.
            if (v >= 1) {
                v = 0.9999999999;
            } else if (v < 0) {
                v = 0;
            }
        }
        return v;
    },
    
    /** @returns a random number between min (inclusive) and max (exclusive).
        @param min:number the minimum value returned.
        @param max:number the maximum value returned.
        @param func:function a skew function. See myt.getRandom for more info.
        @returns number: between min and max. */
    getRandomArbitrary: (min, max, func) => {
        if (min > max) {
            var tmp = min;
            min = max;
            max = tmp;
        }
        return myt.getRandom(func) * (max - min) + min;
    },
    
    /** @returns a random integer between min (inclusive) and max (inclusive)
        @param min:number the minimum value returned.
        @param max:number the maximum value returned.
        @param func:function a skew function. See myt.getRandom for more info.
        @returns number: an integer between min and max. */
    getRandomInt: (min, max, func) => {
        if (min > max) {
            var tmp = min;
            min = max;
            max = tmp;
        }
        return Math.floor(myt.getRandom(func) * (max - min + 1) + min);
    },
    
    // Equality
    /** Tests if two floats are essentially equal to each other.
        @param a:float
        @param b:float
        @param epsilon:float (optional) the percent of difference allowed
            between a and b. Defaults to 0.000001 if not provided.
        @return true if equal, false otherwise. */
    areFloatsEqual: (a, b, epsilon) => {
        var A = Math.abs(a), B = Math.abs(b);
        epsilon = epsilon ? Math.abs(epsilon) : 0.000001;
        return Math.abs(a - b) <= (A > B ? B : A) * epsilon;
    },
    
    /** Tests if two array are equal. For a more complete deep equal
        implementation use underscore.js */
    areArraysEqual: (a, b) => {
        if (a !== b) {
            if (a == null || b == null) return false;
            var i = a.length;
            if (i !== b.length) return false;
            
            while (i) {
                if (a[--i] !== b[i]) return false;
            }
        }
        return true;
    },
    
    /** Tests if two objects are shallowly equal. */
    areObjectsEqual: (a, b) => {
        if (a !== b) {
            if (a == null || b == null) return false;
            for (var key in a) if (a[key] !== b[key]) return false;
            for (key in b) if (a[key] !== b[key]) return false;
        }
        return true;
    },
    
    // DOM
    /** Gets the dom element of the provided tagname and index.
        @param tagname:string (optional) the name of the tag to search for.
            Defaults to 'body' if not provided
        @param index:int (optional) the index of the tag to get. Defaults to
            0 if not provided.
        @returns a dom element or undefined if none exist. */
    getElement: (tagname, index) => document.getElementsByTagName(tagname || 'body')[index > 0 ? index : 0],
    
    // CSS
    loadCSSFonts: fontUrls => {
        (fontUrls || []).forEach(fontUrl => {
            var link = document.createElement("link");
            link.appendChild(document.createTextNode("")); // Webkit workaround
            link.rel = 'stylesheet';
            link.href = fontUrl;
            document.head.appendChild(link);
        });
    },
    
    createStylesheet: () => {
        var style = document.createElement("style");
        style.appendChild(document.createTextNode("")); // Webkit workaround
        document.head.appendChild(style);
        return style.sheet;
    },
    
    addCSSRule: (sheet, selector, rules, index) => {
        if ("insertRule" in sheet) {
            sheet.insertRule(selector + "{" + rules + "}", index);
        } else if("addRule" in sheet) {
            sheet.addRule(selector, rules, index);
        }
    },
    
    removeCSSRules: (sheet) => {
        var i = sheet.cssRules.length;
        while (i) {
            i--;
            if ("deleteRule" in sheet) {
                sheet.deleteRule(i);
            } else if ("removeRule" in sheet) {
                sheet.removeRule(i);
            }
        }
    },
    
    createInputPlaceholderCSSRule: (view, color, fontFamily) => {
        // Make sure the view has a dom ID for rule targeting
        var M = myt,
            domId = view.getOuterDomElement().id || (view.getOuterDomElement().id = 'id' + M.generateGuid()),
            sheet = view.__sheet,
            rules = [];
        
        // Clear existing sheet if it exists or create a new sheet
        if (sheet) {
            M.removeCSSRules(sheet);
        } else {
            sheet = view.__sheet = M.createStylesheet();
        }
        
        // Write rules
        if (color) rules.push('color:' + color);
        if (fontFamily) rules.push('font-family:' + fontFamily);
        rules = rules.join('; ');
        
        switch (BrowserDetect.browser) {
            case 'Chrome':
            case 'Safari':
                M.addCSSRule(sheet, '#' + domId + '::-webkit-input-placeholder', rules, 0);
                break;
            case 'Firefox':
                M.addCSSRule(sheet, '#' + domId + ':-moz-placeholder', 'opacity:1; ' + rules, 0);
                M.addCSSRule(sheet, '#' + domId + '::-moz-placeholder', 'opacity:1; ' + rules, 0);
                break;
            case 'Explorer':
                M.addCSSRule(sheet, '#' + domId + ':-ms-input-placeholder', rules, 0);
                break;
        }
    },
    
    // Misc
    /** Memoize a function.
        @param f:function The function to memoize
        @returns function: The memoized function. */
    memoize: (f) => {
        return function() {
            var hash = JSON.stringify(arguments),
                cache = f.__cache || (f.__cache = {});
            return (hash in cache) ? cache[hash] : cache[hash] = f.apply(this, arguments);
        };
    },
    
    /** Copies properties from the source objects to the target object.
        @param targetObj:object The object that properties will be copied into.
        @param sourceObj:object The object that properties will be copied from.
        @param arguments... Additional arguments beyond the second will also
            be used as source objects and copied in order from left to right.
        @param mappingFunction:function (optional) If the last argument is a 
            function it will be used to copy values from the source to the
            target. The function will be passed three values, the key, the 
            target and the source. The mapping function should copy the
            source value into the target value if so desired.
        @returns The target object. */
    extend: function(targetObj, sourceObj) {
        var iterable = targetObj, 
            result = iterable,
            args = arguments, argsLength = args.length, argsIndex = 0,
            key, mappingFunc, ownIndex, ownKeys, length;
        
        if (iterable) {
            if (argsLength > 2 && typeof args[argsLength - 1] === 'function') mappingFunc = args[--argsLength];
            
            while (++argsIndex < argsLength) {
                iterable = args[argsIndex];
                
                if (iterable) {
                    ownIndex = -1;
                    ownKeys = Object.keys(iterable);
                    length = ownKeys ? ownKeys.length : 0;
                    
                    while (++ownIndex < length) {
                        key = ownKeys[ownIndex];
                        if (mappingFunc) {
                            mappingFunc(key, result, iterable);
                        } else {
                            result[key] = iterable[key];
                        }
                    }
                }
            }
        }
        return result
    },
    
    promise: function() {
        var promise = {
            args:arguments,
            
            next:function(nextFunc) {
                if (promise.kept) {
                    // Execute next immediately since the promise has
                    // already been kept
                    nextFunc.apply(null, promise.args);
                } else {
                    // Store the next function so it can be called later once
                    // the promise is kept
                    promise._nextFunc = nextFunc;
                }
                return promise;
            },
            
            keep:function() {
                promise.kept = true;
                
                // If a next function exists then execute it since now the
                // promise has been kept.
                if (promise._nextFunc) promise._nextFunc.apply(null, promise.args);
                
                return promise;
            }
        };
        return promise;
    },
    
    /** Returns a function that wraps the provided function and that, as long 
        as it continues to be invoked, will not invoke the wrapped function. 
        The wrapped function will be called after the returned function stops 
        being called for "wait" milliseconds. If "immediate" is passed, the
        wrapped function will be invoked on the leading edge instead of 
        the trailing edge.
        @param func:function The function to wrap.
        @param wait:number (optional) The time in millis to delay invocation by.
            If not provided 0 is used.
        @param immediate:boolean (optional) If true the function will be
            invoked immediately and then the wait time will be used to block
            subsequent calls. */
    debounce: function(func, wait, immediate) {
        var timeout;
        return function() {
            var context = this,
                args = arguments,
                later = function() {
                    timeout = null;
                    if (!immediate) func.apply(context, args);
                },
                callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(context, args);
        };
    }
};


((pkg) => {
    var pluses = /\+/g,
        
        /** Function to return a raw cookie name/value. */
        raw = (s) => s,
        
        /** Function to return a URI decoded cookie name/value. */
        decoded = (s) => decodeURIComponent(s.replace(pluses, ' ')),
        
        /** Function to convert a stored cookie value into a value that can
            be returned. */
        converted = (s, useJson) => {
            if (s.indexOf('"') === 0) {
                // This is a quoted cookie as according to RFC2068, unescape
                s = s.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, '\\');
            }
            
            try {
                return useJson ? JSON.parse(s) : s;
            } catch(er) {}
        },
        
        /** Browser cookie utility functions.
            
            Ported from:
                jQuery Cookie Plugin v1.3.1
                https://github.com/carhartl/jquery-cookie
                Copyright 2013 Klaus Hartl
                Released under the MIT license
        */
        Cookie = pkg.Cookie = {
            // Attributes //////////////////////////////////////////////////////
            /** Default cookie properties and settings. */
            defaults: {
                raw:false, // If true, don't use encodeURIComponent/decodeURIComponent
                json:false // If true, do JSON stringify and parse
            },
            
            
            // Methods /////////////////////////////////////////////////////////
            /** Reads a cookie.
                @param key:string the name of the cookie to read.
                @param options:object options that determine how the cookie is read
                    and/or parsed. Supported options are:
                        raw:boolean If true the cookie key and value will be used as is.
                            Otherwise decodeURIComponent will be used.
                        json:boolean If true JSON.parse will be used to parse the
                            cookie value before it is returned.
                @returns The cookie value string or a parsed cookie value. */
            read: (key, options) => {
                options = pkg.extend({}, Cookie.defaults, options);
                
                var decodeFunc = options.raw ? raw : decoded,
                    useJson = options.json,
                    cookies = document.cookie.split('; '),
                    result = key ? undefined : {},
                    parts, 
                    name, 
                    cookie, 
                    i = 0, 
                    len = cookies.length;
                for (; i < len;) {
                    parts = cookies[i++].split('=');
                    name = decodeFunc(parts.shift());
                    cookie = decodeFunc(parts.join('='));
                    
                    if (key && key === name) {
                        result = converted(cookie, useJson);
                        break;
                    }
                    
                    if (!key) result[name] = converted(cookie, useJson);
                }
                
                return result;
            },
            
            /** Stores a cookie.
                @param key:string the name of the cookie to store.
                @param value:* the value to store.
                @param options:object options that determine how the cookie is
                    written and stored. Supported options are:
                        expires:number the number of days until the cookie expires.
                        path:string the path scope for the cookie.
                        domain:string the domain scope for the cookie.
                        secure:boolean the cookie must be secure.
                        raw:boolean If true the cookie key and value will be used as is.
                            Otherwise encodeURIComponent will be used.
                        json:boolean If true JSON.stringify will be used to encode
                            the cookie value.
                @returns void */
            write: (key, value, options) => {
                options = pkg.extend({}, Cookie.defaults, options);
                
                if (typeof options.expires === 'number') {
                    var days = options.expires,
                        t = options.expires = new Date();
                    t.setDate(t.getDate() + days);
                }
                
                value = options.json ? JSON.stringify(value) : String(value);
                
                return (document.cookie = [
                    options.raw ? key : encodeURIComponent(key),
                    '=',
                    options.raw ? value : encodeURIComponent(value),
                    options.expires ? '; expires=' + options.expires.toUTCString() : '', // use expires attribute, max-age is not supported by IE
                    options.path    ? '; path=' + options.path : '',
                    options.domain  ? '; domain=' + options.domain : '',
                    options.secure  ? '; secure' : ''
                ].join(''));
            },
            
            /** Removes a stored cookie by setting it's expires option to -1 days.
                @param key:string the name of the cookie to remove.
                @param options:object options used to read/write the cookie.
                @returns true if a cookie was removed, false otherwise. */
            remove: (key, options) => {
                if (Cookie.read(key, options) !== undefined) {
                    // Must not alter options, thus extending a fresh object.
                    Cookie.write(key, '', pkg.extend({}, options, {expires: -1}));
                    return true;
                }
                return false;
            }
        };
})(myt);


((pkg) => {
    var localStorage = global.localStorage,
        
        getStoreId = (storeId) => storeId = storeId || 'myt',
        
        doFunc = (func, delay, timerKey) => {
            if (delay > 0) {
                var timerIdKey = '__timerId_' + timerKey,
                    timerId = LocalStorage[timerIdKey];
                if (timerId) clearTimeout(timerId);
                
                LocalStorage[timerIdKey] = setTimeout(() => {
                    func();
                    delete LocalStorage[timerIdKey];
                }, delay);
            } else {
                func();
            }
        },
        
        /** Browser local storage utility functions.
            
            The Data methods utilize a single JSON object to store multiple values
            under a single local storage item.
        */
        LocalStorage = pkg.LocalStorage = {
            /** Check if data has been stored under the key and storage id.
                @param key:string the key to look for.
                @param storeId:string (optional) id of the data store to look in. If
                    not provided the default "myt" storeId will be used.
                @returns boolean false if an undefined or null value is found,
                    otherwise true. */
            hasDatum: (key, storeId) => {
                if (key) {
                    var data = LocalStorage.getItem(getStoreId(storeId));
                    if (data) {
                        try {
                            return JSON.parse(data)[key] != null;
                        } catch (e) {
                            console.error(e);
                            return false;
                        }
                    }
                }
                return false;
            },
            
            /** Get the data stored under the key and storage id.
                @param key:string the key to get data for.
                @param storeId:string (optional) id of the data store to get data for.
                    If not provided the default "myt" storeId will be used.
                @returns the value of the data or undefined if not found. */
            getDatum: (key, storeId) => {
                if (key) {
                    var data = LocalStorage.getItem(getStoreId(storeId));
                    if (data) {
                        try {
                            data = JSON.parse(data);
                            if (typeof data === 'object') return data[key];
                        } catch (e) {
                            console.error(e);
                        }
                    }
                }
            },
            
            /** Sets a single entry in a data store.
                @param key:string The key to store the value under.
                @param value:* The value to store.
                @param storeId:string (optional) id of the data store to put data in.
                    If not provided the default "myt" storeId will be used.
                @param delay:number (optional) A number of millis to wait before
                    actually storing the data. This can be useful to prevent excessive
                    numbers of writes when a value will be set a large number of times
                    over a short time interval. For example, when saving the position
                    of a UI control as it is being repositioned or a value the user
                    is typing.
                @returns void */
            setDatum: (key, value, storeId, delay) => {
                storeId = getStoreId(storeId);
                doFunc(() => {
                    var data = LocalStorage.getData(storeId);
                    data[key] = value;
                    LocalStorage.setItem(storeId, JSON.stringify(data));
                }, delay, storeId + '___' + key);
            },
            
            /** Removes a single entry in a data store.
                @param key:string The key to remove the entry for.
                @param storeId:string (optional) id of the data store to remove data 
                    from. If not provided the default "myt" storeId will be used.
                @param delay:number (optional) A number of millis to wait before
                    actually removing the data.
                @returns void */
            removeDatum: (key, storeId, delay) => {
                storeId = getStoreId(storeId);
                doFunc(() => {
                    var data = LocalStorage.getData(storeId);
                    delete data[key];
                    LocalStorage.setItem(storeId, JSON.stringify(data));
                }, delay, storeId + '___' + key);
            },
            
            /** Check if data has been stored under the storage id.
                @param storeId:string (optional) id of the data store to look in. If
                    not provided the default "myt" storeId will be used.
                @returns boolean false if an undefined or null value is found,
                    otherwise true. */
            hasData: (storeId) => LocalStorage.getItem(getStoreId(storeId)) != null,
            
            /** Get the data store stored under storage id.
                @param storeId:string (optional) id of the data store to get data for.
                    If not provided the default "myt" storeId will be used.
                @returns the store object. */
            getData: (storeId) => {
                var data = LocalStorage.getItem(getStoreId(storeId));
                if (data) {
                    try {
                        return JSON.parse(data);
                    } catch (e) {
                        console.error(e);
                    }
                }
                return {};
            },
            
            /** Store data under the storage id. This replaces an entire data store
                with the new data object.
                @param data:object (optional) The data object to store under the 
                    storage id.
                @param storeId:string (optional) id of the data store to put data in.
                    If not provided the default "myt" storeId will be used.
                @param delay:number (optional) A number of millis to wait before
                    actually storing the data. This can be useful to prevent excessive
                    numbers of writes when a value will be set a large number of times
                    over a short time interval. For example, when saving the position
                    of a UI control as it is being repositioned or a value the user
                    is typing.
                @returns boolean true if the data is of type object false otherwise. */
            setData: (data, storeId, delay) => {
                storeId = getStoreId(storeId);
                
                if (data == null) data = {};
                
                if (typeof data === 'object') {
                    doFunc(() => {LocalStorage.setItem(storeId, JSON.stringify(data));}, delay, storeId);
                    return true;
                }
                
                return false;
            },
            
            /** Removes a data store.
                @param storeId:string (optional) id of the data store to remove. If 
                    not provided the default "myt" storeId will be used.
                @param delay:number (optional) A number of millis to wait before
                    actually removing the data.
                @returns void */
            removeData: (storeId, delay) => {
                storeId = getStoreId(storeId);
                doFunc(() => {LocalStorage.removeItem(storeId);}, delay, storeId);
            },
            
            // wrapper functions on localStorage
            /** @returns The number of data items stored in the Storage object. */
            getLength: () => localStorage.length,
            
            /** @param n:integer The index of the key name to retrieve.
                @returns The name of the nth key in the storage. */
            getKey: (n) => localStorage.key(n),
            
            /** @param key:string The name of the storage entry to return.
                @returns The value of the storage entry or null if not found. */
            getItem: (key) => localStorage.getItem(key),
            
            /** Stores the value under the key. If a value already exists for
                the key the value will be replaced with the new value.
                @param key:string The key to store the value under.
                @param value:* The value to store.
                @returns void */
            setItem: (key, value) => {
                localStorage.setItem(key, value);
            },
            
            /** Removes the storage entry for the key.
                @param key:string The key to remove.
                @returns void */
            removeItem: (key) => {
                localStorage.removeItem(key);
            },
            
            /** Removes all storage entries.
                @returns void */
            clear: () => {
                localStorage.clear();
            },
            
            // Aliases for better API compatibility with some libraries.
            /** An alias for getItem. */
            get: (key) => LocalStorage.getItem(key),
            
            /** An alias for setItem. */
            set: (key, value) => {
                LocalStorage.setItem(key, value);
            },
            
            /** An alias for removeItem. */
            remove: (key) => {
                LocalStorage.removeItem(key);
            },
            
            /** An alias for clear. */
            clearAll: () => {
                LocalStorage.clear();
            }
        };
})(myt);


((pkg) => {
    var queryParser = /(?:^|&)([^&=]*)=?([^&]*)/g,
        strictParser = /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
        looseParser = /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/;
    
    /** Models a URI and provides parsing of strings into URIs.
        
        Makes use of:
            parseUri 1.2.2
            (c) Steven Levithan <stevenlevithan.com>
            MIT License
            See: http://blog.stevenlevithan.com/archives/parseuri
            
        When more complex URI parsing is needed, perhaps try URI.js which can be
        found at: http://medialize.github.io/URI.js/
    */
    pkg.URI = new JS.Class('URI', {
        // Constructor /////////////////////////////////////////////////////////
        initialize: function(str, loose) {
            if (str) this.parse(str, loose);
        },
        
        
        // Attributes and Setters/Getters //////////////////////////////////////
        setSource: function(v) {this.source = v;},
        setProtocol: function(v) {this.protocol = v;},
        setAuthority: function(v) {this.authority = v;},
        setUserInfo: function(v) {this.userInfo = v;},
        setUser: function(v) {this.user = v;},
        setPassword: function(v) {this.password = v;},
        setHost: function(v) {this.host = v;},
        setPort: function(v) {this.port = v;},
        setRelative: function(v) {this.relative = v;},
        setPath: function(v) {this.path = v;},
        setDirectory: function(v) {this.directory = v;},
        setFile: function(v) {this.file = v;},
        setQuery: function(v) {this.query = v;},
        setAnchor: function(v) {this.anchor = v;},
        
        
        // Methods /////////////////////////////////////////////////////////////
        parse: function(str, loose) {
            // match order: "source", "protocol", "authority", "userInfo", "user",
            //              "password", "host", "port", "relative", "path", 
            //              "directory", "file", "query", "anchor".
            var self = this,
                m = (loose ? looseParser : strictParser).exec(str);
            
            self.setSource(m[0] || "");
            
            self.setProtocol(m[1] || "");
            self.setAuthority(m[2] || "");
            self.setUserInfo(m[3] || "");
            self.setUser(m[4] || "");
            self.setPassword(m[5] || "");
            self.setHost(m[6] || "");
            self.setPort(m[7] || "");
            self.setRelative(m[8] || "");
            self.setPath(m[9] || "");
            self.setDirectory(m[10] || "");
            self.setFile(m[11] || "");
            self.setQuery(m[12] || "");
            self.setAnchor(m[13] || "");
            
            // Parse the query into pairs
            self.queryPairs = {};
            self.query.replace(queryParser, ($0, $1, $2) => {
                if ($1) self.queryPairs[$1] = $2;
            });
        },
        
        /** Unescape a query param value. */
        decodeQueryParam: function(v) {
            v = decodeURIComponent(v);
            return v.replace('+', ' ');
        },
        
        getQuery: function() {
            var pairs = this.queryPairs,
                parts = [],
                key,
                s;
            for (key in pairs) parts.push(key + '=' + encodeURIComponent(this.getQueryParam(key)));
            s = parts.join('&');
            return s.length > 0 ? '?' + s : s;
        },
        
        getQueryParam: function(name) {
            var v = this.queryPairs[name];
            return v == null ? undefined : this.decodeQueryParam(v);
        },
        
        getPathParts: function(allowEmpties) {
            var parts = this.path.split('/');
            
            if (!allowEmpties) {
                var i = parts.length;
                while (i) if (parts[--i].length === 0) parts.splice(i, 1);
            }
            
            return parts;
        },
        
        toString: function(originalRawQuery) {
            var self = this,
                protocol = self.protocol,
                host = self.host,
                userInfo = self.userInfo,
                port = self.port,
                path = self.path,
                query = originalRawQuery ? (self.query ? '?' + self.query : '') : self.getQuery(),
                anchor = self.anchor,
                s = '';
            
            if (protocol) s += protocol + '://';
            if (userInfo && host) s += userInfo + '@';
            
            if (host) {
                s += host;
                if (port) s += ':' + port;
            }
            
            if (path) {
                s += path;
            } else if (host && (query || anchor)) {
                s += '/';
            }
            
            if (query) s += query;
            if (anchor) s += '#' + anchor;
            
            return s;
        }
    });
})(myt);


((pkg) => {
    /** Provides common geometry related functions. */
    var Geometry = pkg.Geometry = {
        // Methods /////////////////////////////////////////////////////////////////
        /** Get the closest point on a line to a given point.
            @param Ax:number The x-coordinate of the first point that defines 
                the line.
            @param Ay:number The y-coordinate of the first point that defines 
                the line.
            @param Bx:number The x-coordinate of the second point that defines 
                the line.
            @param By:number The y-coordinate of the second point that defines 
                the line.
            @param Px:number The x-coordinate of the point.
            @param Py:number The y-coordinate of the point.
            @returns object: A position object with x and y properties. */
        getClosestPointOnALineToAPoint: (Ax, Ay, Bx, By, Px, Py) => {
            var APx = Px - Ax,
                APy = Py - Ay,
                ABx = Bx - Ax,
                ABy = By - Ay,
                magAB2 = ABx * ABx + ABy * ABy,
                ABdotAP = ABx * APx + ABy * APy,
                t = ABdotAP / magAB2;
            return {x:Ax + ABx * t, y:Ay + ABy * t};
        },
        
        /** Get the closest point on a segment to a given point.
            @param Ax:number The x-coordinate of the first endpoint that defines 
                the segment.
            @param Ay:number The y-coordinate of the first endpoint that defines 
                the segment.
            @param Bx:number The x-coordinate of the second endpoint that defines 
                the segment.
            @param By:number The y-coordinate of the second endpoint that defines 
                the segment.
            @param Px:number The x-coordinate of the point.
            @param Py:number The y-coordinate of the point.
            @returns object: A position object with x and y properties. */
        getClosestPointOnASegmentToAPoint: (Ax, Ay, Bx, By, Px, Py) => {
            var APx = Px - Ax,
                APy = Py - Ay,
                ABx = Bx - Ax,
                ABy = By - Ay,
                magAB2 = ABx * ABx + ABy * ABy,
                ABdotAP = ABx * APx + ABy * APy,
                t = ABdotAP / magAB2;
            if (t < 0) return {x:Ax, y:Ay};
            if (t > 1) return {x:Bx, y:By};
            return {x:Ax + ABx * t, y:Ay + ABy * t};
        },
        
        /** Tests if the provided point is inside this path.
            @param x:number the x coordinate to test.
            @param y:number the y coordinate to test.
            @param boundingBox:object a bounding box object that bounds the path.
            @param path:array an array of points where the index 0,2,4,... are
                the x values and index 1,3,5,... are the y values.
            
            Alternate params:
            @param x:object A point object with x and y properties.
            
            @return true if inside, false otherwise. */
        isPointInPath: (x, y, boundingBox, path) => {
            if (typeof x === 'object') {
                path = boundingBox;
                boundingBox = y;
                y = x.y;
                x = x.x;
            }
            
            // First test bounding box
            if (Geometry.rectContainsPoint(x, y, boundingBox)) {
                // Test using Jordan Curve Theorem
                var len = path.length;
                
                // Must at least be a triangle to have an inside.
                if (len >= 6) {
                    var c = false, 
                        x1 = path[0], 
                        y1 = path[1], 
                        x2, 
                        y2;
                    while (len) {
                        y2 = path[--len];
                        x2 = path[--len];
                        if (((y2 > y) !== (y1 > y)) && (x < (x1 - x2) * (y - y2) / (y1 - y2) + x2)) c = !c;
                        x1 = x2;
                        y1 = y2;
                    }
                    return c;
                }
            }
            return false;
        },
        
        /** Checks if the provided point is inside or on the edge of the provided 
            rectangle.
            @param pX:number the x coordinate of the point to test.
            @param pY:number the y coordinate of the point to test.
            @param rX:number the x coordinate of the rectangle.
            @param rY:number the y coordinate of the rectangle.
            @param rW:number the width of the rectangle.
            @param rH:number the height of the rectangle.
            
            Alternate Params:
            @param pX:object a point object with properties x and y.
            @param rX:object a rect object with properties x, y, width and height.
            
            @returns boolean True if the point is inside or on the rectangle. */
        rectContainsPoint: (pX, pY, rX, rY, rW, rH) => {
            if (typeof pX === 'object') {
                rH = rW;
                rW = rY;
                rY = rX;
                rX = pY;
                pY = pX.y;
                pX = pX.x;
            }
            
            if (typeof rX === 'object') {
                rH = rX.height;
                rW = rX.width;
                rY = rX.y;
                rX = rX.x;
            }
            
            return pX >= rX && pY >= rY && pX <= rX + rW && pY <= rY + rH;
        },
        
        /** Checks if the provided point lies inside or on the edge of the
            provided circle.
            @param pX:number the x coordinate of the point to test.
            @param pY:number the y coordinate of the point to test.
            @param cX:number the x coordinate of the center of the circle.
            @param cY:number the y coordinate of the center of the circle.
            @param cR:number the radius of the circle.
            @return boolean True if the point is inside or on the circle. */
        circleContainsPoint: (pX, pY, cX, cY, cR) => Geometry.measureDistance(pX, pY, cX, cY, true) <= cR * cR,
        
        /** Measure the distance between two points.
            @param x1:number the x position of the first point.
            @param y1:number the y position of the first point.
            @param x2:number the x position of the second point.
            @param y2:number the y position of the second point.
            @param squared:boolean (optional) If true, the squared distance will
                be returned.
            @returns number the distance between the two points. */
        measureDistance: (x1, y1, x2, y2, squared) => {
            var diffX = x2 - x1, 
                diffY = y2 - y1, 
                diffSquared = diffX * diffX + diffY * diffY;
            return squared ? diffSquared : Math.sqrt(diffSquared);
        },
        
        /** Convert radians to degrees.
            @param deg:number degrees.
            @returns number: radians. */
        degreesToRadians: (deg) => deg * Math.PI / 180,
        
        /** Convert degrees to radians.
            @param rad:number radians.
            @returns number: degrees. */
        radiansToDegrees: (rad) => rad * 180 / Math.PI,
        
        // Geometry on a sphere
        /** Checks if the provided lat/lng point lies inside or on the edge of the
            provided circle.
            @param pLat:number the latitude of the point to test.
            @param pLng:number the longitude of the point to test.
            @param cLat:number the latitude of the center of the circle.
            @param cLng:number the longitude of the center of the circle.
            @param cR:number the radius of the circle in kilometers.
            @param sphereRadius:number (optional) the radius of the sphere the
                measurement is being taken on in kilometers. If not provided the
                radius of the earth is used.
            @return boolean True if the point is inside or on the circle. */
        circleContainsLatLng: (pLat, pLng, cLat, cLng, cR, sphereRadius) => Geometry.measureLatLngDistance(pLat, pLng, cLat, cLng, sphereRadius) <= cR,
        
        /** Measures the distance between two points on a sphere using latitude
            and longitude.
            @param lat1:number the latitude of the first point.
            @param lng1:number the longitude of the first point.
            @param lat2:number the latitude of the second point.
            @param lng2:number the longitude of the second point.
            @param sphereRadius:number (optional) the radius of the sphere the
                measurement is being taken on in kilometers. If not provided the
                radius of the earth is used.
            @returns number the distance between the points in kilometers. */
        measureLatLngDistance: (lat1, lng1, lat2, lng2, sphereRadius) => {
            // Taken from: http://www.movable-type.co.uk/scripts/latlong.html
            if (sphereRadius === undefined) sphereRadius = 6371; // kilometers for earth
            lat1 = Geometry.degreesToRadians(lat1);
            lng1 = Geometry.degreesToRadians(lng1);
            lat2 = Geometry.degreesToRadians(lat2);
            lng2 = Geometry.degreesToRadians(lng2);
            return sphereRadius * Math.acos(
                Math.sin(lat1) * Math.sin(lat2) + 
                Math.cos(lat1) * Math.cos(lat2) * Math.cos(lng2 - lng1)
            );
        },
        
        /** Convert from polar to cartesian coordinates.
            @param radius:number The radius of the point to convert relative to
                the circle.
            @param degrees:number The angle coordinate of the point to convert.
            @param cx:number (optional) The x coordinate of the center of the 
                circle.
            @param cy:number (optional) The y coordinate of the center of the 
                circle.
            @returns array where index 0 is the x coordinate and index 1 is the
                y coordinate. */
        polarToCartesian: (radius, degrees, cx, cy) => {
            if (cx == null) cx = 0;
            if (cy == null) cy = 0;
            degrees = degrees % 360;
            
            var x, y, radians;
            if (degrees === 0) {
                x = radius;
                y = 0;
            } else if (degrees === 90) {
                x = 0;
                y = radius;
            } else if (degrees === 180) {
                x = -radius;
                y = 0;
            } else if (degrees === 270) {
                x = 0;
                y = -radius;
            } else {
                radians = Geometry.degreesToRadians(degrees);
                x = radius * Math.cos(radians);
                y = radius * Math.sin(radians);
            }
            
            return [cx + x, cy + y];
        },
        
        /** Convert from cartesian to polar coordinates.
            @param x:number The x coordinate to transform.
            @param y:number The y coordinate to transform.
            @param cx:number (optional) The x coordinate of the center of the
                circle.
            @param cy:number (optional) The y coordinate of the center of the
                circle.
            @param useRadians:boolean (optional) If true the angle returned will
                be in radians otherwise it will be degrees.
            @return array where index 0 is the radius and index 1 is angle
                in degrees (or radians if userRadians is true). */
        cartesianToPolar: (x, y, cx, cy, useRadians) => {
            if (cx == null) cx = 0;
            if (cy == null) cy = 0;
            
            var diffX = x - cx,
                diffY = y - cy,
                radius = Math.sqrt(diffX*diffX + diffY*diffY),
                radians = Math.atan2(diffY, diffX);
            if (radians < 0) radians += 2 * Math.PI;
            return [radius, useRadians ? radians : Geometry.radiansToDegrees(radians)];
        }
    };
})(myt);


/** Apply this mixin to any Object that needs to fire events.
    
    Attributes:
        None
    
    Private Attributes:
        __obsbt:object Stores arrays of myt.Observers and method names 
            by event type
        __aet:object Stores active event type strings. An event type is active
            if it has been fired from this Observable as part of the current 
            call stack. If an event type is "active" it will not be fired 
            again. This provides protection against infinite event loops.
*/
myt.Observable = new JS.Module('Observable', {
    // Methods /////////////////////////////////////////////////////////////////
    /** Adds the observer to the list of event recipients for the event type.
        @param observer:myt.Observer The observer that will observe this
            observable. If methodName is a function this object will be the
            context for the function when it is called.
        @param methodName:string|function The name of the method to call, or
            a function, on the observer when the event fires.
        @param type:string The name of the event the observer will listen to.
        @returns boolean true if the observer was successfully attached, 
            false otherwise. */
    attachObserver: function(observer, methodName, type) {
        if (observer && methodName && type) {
            this.getObservers(type).push(methodName, observer);
            return true;
        }
        return false;
    },
    
    /** Removes the observer from the list of observers for the event type.
        @param observer:myt.Observer The observer that will no longer be
            observing this observable.
        @param methodName:string|function The name of the method that was
            to be called or the function to be called.
        @param type:string The name of the event the observer will no longer
            be listening to.
        @returns boolean true if the observer was successfully detached, 
            false otherwise. */
    detachObserver: function(observer, methodName, type) {
        if (observer && methodName && type) {
            var observersByType = this.__obsbt;
            if (observersByType) {
                var observers = observersByType[type];
                if (observers) {
                    // Remove all instances of the observer and methodName 
                    // combination.
                    var retval = false, i = observers.length;
                    while (i) {
                        // Ensures we decrement twice. First with --i, then 
                        // with i-- since the part after && may not be executed.
                        --i;
                        if (observer === observers[i--] && methodName === observers[i]) {
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
        @returns void */
    detachAllObservers: function() {
        var observersByType = this.__obsbt;
        if (observersByType) {
            var observers, observer, methodName, i, type;
            for (type in observersByType) {
                observers = observersByType[type];
                i = observers.length;
                while (i) {
                    observer = observers[--i];
                    methodName = observers[--i];
                    
                    // If an observer is registered more than once the list may 
                    // get shortened by observer.detachFrom. If so, just 
                    // continue decrementing downwards.
                    if (observer && methodName) {
                        if (typeof observer.detachFrom !== 'function' || 
                            !observer.detachFrom(this, methodName, type)
                        ) {
                            // Observer may not have a detachFrom function or 
                            // observer may not have attached via 
                            // Observer.attachTo so do default detach activity 
                            // as implemented in Observable.detachObserver
                            observers.splice(i, 2);
                        }
                    }
                }
            }
        }
    },
    
    /** Gets an array of observers and method names for the provided type.
        The array is structured as:
            [methodName1, observerObj1, methodName2, observerObj2,...].
        @param type:string The name of the event to get observers for.
        @returns array: The observers of the event. */
    getObservers: function(type) {
        var observersByType = this.__obsbt || (this.__obsbt = {});
        return observersByType[type] || (observersByType[type] = []);
    },
    
    /** Checks if any observers exist for the provided event type.
        @param type:string The name of the event to check.
        @returns boolean: True if any exist, false otherwise. */
    hasObservers: function(type) {
        var observersByType = this.__obsbt;
        if (!observersByType) return false;
        var observers = observersByType[type];
        return observers && observers.length > 0;
    },
    
    /** Creates a new event with the type and value and using this as 
        the source.
        @param type:string The event type.
        @param value:* The event value.
        @returns An event object consisting of source, type and value. */
    createEvent: function(type, value) {
        return {source:this, type:type, value:value}; // Inlined in this.fireEvent
    },
    
    isFiringEvent: function(type) {
        return (this.__aet || (this.__aet = {}))[type];
    },
    
    /** Generates a new event from the provided type and value and fires it
        to the provided observers or the registered observers.
        @param type:string The event type to fire.
        @param value:* The value to set on the event.
        @param observers:array (Optional) If provided the event will
            be sent to this specific list of observers and no others.
        @returns void */
    fireEvent: function(type, value, observers) {
        // Determine observers to use
        var self = this;
        observers = observers || (self.hasObservers(type) ? self.__obsbt[type] : null);
        
        // Fire event
        if (observers) {
            // Prevent "active" events from being fired again
            var event = {source:self, type:type, value:value}, // Inlined from this.createEvent
                activeEventTypes = self.__aet || (self.__aet = {});
            if (activeEventTypes[type] === true) {
                myt.global.error.notifyWarn('eventLoop', "Attempt to refire active event: " + type);
            } else {
                // Mark event type as "active"
                activeEventTypes[type] = true;
                
                // Walk through observers backwards so that if the observer is
                // detached by the event handler the index won't get messed up.
                // FIXME: If necessary we could queue up detachObserver calls that 
                // come in during iteration or make some sort of adjustment to 'i'.
                var i = observers.length,
                    observer,
                    methodName;
                while (i) {
                    observer = observers[--i];
                    methodName = observers[--i];
                    
                    // Sometimes the list gets shortened by the method we called so
                    // just continue decrementing downwards.
                    if (observer && methodName) {
                        // Stop firing the event if it was "consumed".
                        try {
                            if (typeof methodName === 'function') {
                                if (methodName.call(observer, event)) break;
                            } else {
                                if (observer[methodName](event)) break;
                            }
                        } catch (err) {
                            myt.dumpStack(err);
                        }
                    }
                }
                
                // Mark event type as "inactive"
                activeEventTypes[type] = false;
            }
        }
    }
});


/** Provides a mechanism to remember which Observables this instance has 
    registered itself with. This can be useful when we need to cleanup the 
    instance later.
    
    When this module is used registration and unregistration must be done 
    using the methods below. Otherwise, it is possible for the relationship 
    between observer and observable to be broken.
    
    Events:
        None
    
    Attributes:
        None
    
    Private Attributes:
        __obt:object Stores arrays of Observables by event type
        __methodNameCounter:int Used to create unique method names when a
            callback should only be called once.
        __DO_ONCE_*:function The names used for methods that only get run
            one time. */
myt.Observer = new JS.Module('Observer', {
    // Methods /////////////////////////////////////////////////////////////////
    /** Does the same thing as this.attachTo and also immediately calls the
        method with an event containing the attributes value. If 'once' is
        true no attachment will occur which means this probably isn't the
        correct method to use in that situation.
        @param observable:myt.Observable the Observable to attach to.
        @param methodName:string the method name on this instance to execute.
        @param eventType:string the event type to attach for.
        @param attrName:string (optional: the eventType will be used if not
            provided) the name of the attribute on the Observable
            to pull the value from.
        @param once:boolean (optional) if true  this Observer will detach
            from the Observable after the event is handled once.
        @returns void */
    syncTo: function(observable, methodName, eventType, attrName, once) {
        if (attrName === undefined) attrName = eventType;
        try {
            this[methodName](observable.createEvent(eventType, observable.get(attrName)));
        } catch (err) {
            myt.dumpStack(err);
        }
        
        // Providing a true value for once means we'll never actually attach.
        if (once) return;
        
        this.attachTo(observable, methodName, eventType, once);
    },
    
    /** Checks if this Observer is attached to the provided observable for
        the methodName and eventType.
        @param observable:myt.Observable the Observable to check with.
        @param methodName:string the method name on this instance to execute.
        @param eventType:string the event type to check for.
        @returns true if attached, false otherwise. */
    isAttachedTo: function(observable, methodName, eventType) {
        if (observable && methodName && eventType) {
            var observablesByType = this.__obt;
            if (observablesByType) {
                var observables = observablesByType[eventType];
                if (observables) {
                    var i = observables.length;
                    while (i) {
                        // Ensures we decrement twice. First with --i, then 
                        // with i-- since the part after && may not be executed.
                        --i;
                        if (observable === observables[i--] && methodName === observables[i]) return true;
                    }
                }
            }
        }
        return false;
    },
    
    /** Gets an array of observables and method names for the provided type.
        The array is structured as:
            [methodName1, observableObj1, methodName2, observableObj2,...].
        @param eventType:string the event type to check for.
        @returns an array of observables. */
    getObservables: function(eventType) {
        var observablesByType = this.__obt || (this.__obt = {});
        return observablesByType[eventType] || (observablesByType[eventType] = []);
    },
    
    /** Checks if any observables exist for the provided event type.
        @param eventType:string the event type to check for.
        @returns true if any exist, false otherwise. */
    hasObservables: function(eventType) {
        var observablesByType = this.__obt;
        if (!observablesByType) return false;
        var observables = observablesByType[eventType];
        return observables && observables.length > 0;
    },
    
    /** Registers this Observer with the provided Observable
        for the provided eventType.
        @param observable:myt.Observable the Observable to attach to.
        @param methodName:string the method name on this instance to execute.
        @param eventType:string the event type to attach for.
        @param once:boolean (optional) if true  this Observer will detach
            from the Observable after the event is handled once.
        @returns boolean true if the observable was successfully registered, 
            false otherwise. */
    attachTo: function(observable, methodName, eventType, once) {
        if (observable && methodName && eventType) {
            var observables = this.getObservables(eventType);
            
            // Setup wrapper method when 'once' is true.
            if (once) {
                var self = this, origMethodName = methodName;
                
                // Generate one time method name.
                if (this.__methodNameCounter === undefined) this.__methodNameCounter = 0;
                methodName = '__DO_ONCE_' + this.__methodNameCounter++;
                
                // Setup wrapper method that will do the detachFrom.
                this[methodName] = function(event) {
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
    
    /** Unregisters this Observer from the provided Observable
        for the provided eventType.
        @param observable:myt.Observable the Observable to attach to.
        @param methodName:string the method name on this instance to execute.
        @param eventType:string the event type to attach for.
        @returns boolean true if one or more detachments occurred, false 
            otherwise. */
    detachFrom: function(observable, methodName, eventType) {
        if (observable && methodName && eventType) {
            // No need to unregister if observable array doesn't exist.
            var observablesByType = this.__obt;
            if (observablesByType) {
                var observables = observablesByType[eventType];
                if (observables) {
                    // Remove all instances of this observer/methodName/eventType 
                    // from the observable
                    var retval = false, i = observables.length;
                    while (i) {
                        --i;
                        if (observable === observables[i--] && methodName === observables[i]) {
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
    
    /** Tries to detach this Observer from all Observables it
        is attached to.
        @returns void */
    detachFromAllObservables: function() {
        var observablesByType = this.__obt;
        if (observablesByType) {
            var observables, i, eventType;
            for (eventType in observablesByType) {
                observables = observablesByType[eventType];
                i = observables.length;
                while (i) observables[--i].detachObserver(this, observables[--i], eventType);
                observables.length = 0;
            }
        }
    }
});


/** Provides the ability to apply and release constraints.
    
    Events:
        None
    
    Attributes:
        None
    
    Private Attributes:
        __cbmn:object Holds arrays of constraints by method name.
*/
myt.Constrainable = new JS.Module('Constrainable', {
    include: [myt.Observer],
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** Creates a constraint. The method will be executed on this object
        whenever any of the provided observables fire the indicated event type.
        @param methodName:String The name of the method to call on this object.
        @param observables:array An array of observable/type pairs. An observer
            will attach to each observable for the event type.
        @returns void */
    applyConstraint: function(methodName, observables) {
        if (methodName && observables) {
            // Make sure an even number of observable/type was provided
            var len = observables.length;
            if (len % 2 !== 0) {
                console.log("Observables was not even.", this);
                return;
            }
            
            // Lazy instantiate constraints array.
            var constraints = this.__cbmn || (this.__cbmn = {});
            var constraint = constraints[methodName] || (constraints[methodName] = []);
            
            // Don't allow a constraint to be clobbered.
            if (constraint.length > 0) {
                console.log("Constraint already exists for " + methodName + " on " + this);
                return;
            }
            
            var observable, type, i = 0;
            for (; len !== i;) {
                observable = observables[i++];
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
                myt.dumpStack(err);
            }
        }
    },
    
    /** Removes a constraint.
        @returns void */
    releaseConstraint: function(methodName) {
        if (methodName) {
            // No need to remove if the constraint is already empty.
            var constraints = this.__cbmn;
            if (constraints) {
                var constraint = constraints[methodName];
                if (constraint) {
                    var i = constraint.length, type, observable;
                    while (i) {
                        type = constraint[--i];
                        observable = constraint[--i];
                        this.detachFrom(observable, methodName, type);
                    }
                    constraint.length = 0;
                }
            }
        }
    },
    
    /** Removes all constraints.
        @returns void */
    releaseAllConstraints: function() {
        var constraints = this.__cbmn;
        if (constraints) {
            for (var methodName in constraints) this.releaseConstraint(methodName);
        }
    }
});


/** Holds references to "global" objects. Fires events when these globals
    are registered and unregistered.
    
    Events:
        register<key>:object Fired when an object is stored under the key.
        unregister<key>:object Fired when an object is removed from the key.
*/
myt.global = new JS.Singleton('Global', {
    include: [myt.Observable],
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** Registers the provided global under the key. Fires a register<key>
        event. If a global is already registered under the key the existing
        global is unregistered first.
        @returns void */
    register: function(key, v) {
        if (this.hasOwnProperty(key)) {
            console.log("Warning: myt.global key in use: ", key);
            this.unregister(key);
        }
        this[key] = v;
        this.fireEvent('register' + key, v);
    },
    
    /** Unegisters the global for the provided key. Fires an unregister<key>
        event if the key exists.
        @returns void */
    unregister: function(key) {
        if (this.hasOwnProperty(key)) {
            var v = this[key];
            delete this[key];
            this.fireEvent('unregister' + key, v);
        } else {
            console.log("Warning: myt.global key not in use: ", key);
        }
    }
});


/** Provides global error events and console logging.
    
    Events:
        Error specific events are broadcast. Here is a list of known error
        types.
            eventLoop: Fired by myt.Observable when an infinite event loop
                would occur.
    
    Attributes:
        stackTraceLimit:int Sets the size for stack traces.
        consoleLogging:boolean Turns logging to the console on and off.
*/
new JS.Singleton('GlobalError', {
    include: [myt.Observable],
    
    
    // Constructor /////////////////////////////////////////////////////////////
    initialize: function() {
        this.setStackTraceLimit(50);
        this.setConsoleLogging(true);
        myt.global.register('error', this);
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setConsoleLogging: function(v) {this.consoleLogging = v;},
    setStackTraceLimit: function(v) {Error.stackTraceLimit = this.stackTraceLimit = v;},
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** A wrapper on this.notify where consoleFuncName is 'error'. */
    notifyError: function(type, msg, err) {this.notify('error', type, msg, err);},
    
    /** A wrapper on this.notify where consoleFuncName is 'warn'. */
    notifyWarn: function(type, msg, err) {this.notify('warn', type, msg, err);},
    
    /** A wrapper on this.notify where consoleFuncName is 'log'. */
    notifyMsg: function(type, msg, err) {this.notify('log', type, msg, err);},
    
    /** A wrapper on this.notify where consoleFuncName is 'debug'. */
    notifyDebug: function(type, msg, err) {this.notify('debug', type, msg, err);},
    
    /** Broadcasts that an error has occurred and also logs the error to the
        console if so configured.
        @param consoleFuncName:string (optional) The name of the function to 
            call on the console. Standard values are:'error', 'warn', 'log'
            and 'debug'. If not provided no console logging will occur 
            regardless of the value of this.consoleLogging.
        @param evenType:string (optional) The type of the event that will be 
            broadcast. If not provided 'error' will be used.
        @param msg:* (optional) Usually a string, this is additional information
            that will be provided in the value object of the broadcast event.
        @param err:Error (optional) A javascript error object from which a
            stacktrace will be taken. If not provided a stacktrace will be
            automatically generated.
        @private */
    notify: function(consoleFuncName, eventType, msg, err) {
        // Generate Stacktrace
        if (!err) err = new Error(msg || eventType);
        var stacktrace = err.stack || err.stacktrace;
        
        this.fireEvent(eventType || 'error', {msg:msg, stacktrace:stacktrace});
        if (this.consoleLogging && consoleFuncName) console[consoleFuncName](stacktrace);
    }
});


/** Provides a dom element for this instance. Also assigns a reference to this
    DomElementProxy to a property named "model" on the dom element.
    
    Events:
        None
    
    Attributes:
        domElement:domElement the dom element hidden we are a proxy for.
        deStyle:object a shortcut reference to the style attribute of 
            the dom element.
*/
myt.DomElementProxy = new JS.Module('DomElementProxy', {
    // Class Methods ///////////////////////////////////////////////////////////
    extend: {
        /** Creates a new dom element.
            @param tagname:string the name of the element to create.
            @param styles:object (optional) a map of style keys and values to 
                add to the style property of the new element.
            @param props:object (optional) a map of keys and values to add to 
                the new element.
            @returns the created element. */
        createDomElement: function(tagname, styles, props) {
            var de = document.createElement(tagname), key;
            if (props) for (key in props) de[key] = props[key];
            if (styles) for (key in styles) de.style[key] = styles[key];
            return de;
        },
        
        /** Gets the computed style for a dom element.
            @param elem:dom element the dom element to get the style for.
            @returns object the style object. */
        getComputedStyle: function(elem) {
            // getComputedStyle is IE's proprietary way.
            var g = global;
            return g.getComputedStyle ? g.getComputedStyle(elem, '') : elem.currentStyle;
        },
        
        /** Tests if a dom element is visible or not.
            @param elem:DomElement the element to check visibility for.
            @returns boolean True if visible, false otherwise. */
        isDomElementVisible: function(elem) {
            // Special Case: hidden input elements should be considered not visible.
            if (elem.nodeName === 'INPUT' && elem.type === 'hidden') return false;
            
            var style;
            while (elem) {
                if (elem === document) return true;
                
                style = this.getComputedStyle(elem);
                if (style.display === 'none' || style.visibility === 'hidden') break;
                
                elem = elem.parentNode;
            }
            return false;
        },
        
        /** Gets the z-index of a dom element relative to an ancestor dom
            element.
            @returns int */
        getZIndexRelativeToAncestor: function(elem, ancestor) {
            if (elem && ancestor) {
                var ancestors = this.getAncestorArray(elem, ancestor),
                    i = ancestors.length - 1, style, zIdx, isAuto;
                
                while (i) {
                    style = this.getComputedStyle(ancestors[--i]);
                    zIdx = style.zIndex;
                    isAuto = zIdx === 'auto';
                    
                    if (i !== 0 && isAuto && parseInt(style.opacity, 10) === 1) {
                        continue;
                    } else {
                        return isAuto ? 0 : parseInt(zIdx, 10);
                    }
                }
            }
            return 0;
        },
        
        /** Gets an array of ancestor dom elements including the element
            itself.
            @param elem:DomElement the element to start from.
            @param ancestor:DomElement (optional) The dom element to stop
                getting ancestors at.
            @returns an array of ancestor dom elements. */
        getAncestorArray: function(elem, ancestor) {
            var ancestors = [];
            while (elem) {
                ancestors.push(elem);
                if (elem === ancestor) break;
                elem = elem.parentNode;
            }
            return ancestors;
        },
        
        /** Gets the z-index of the dom element or, if it does not define a 
            stacking context, the highest z-index of any of the dom element's 
            descendants.
            @param elem:DomElement
            @returns int */
        getHighestZIndex: function(elem) {
            // See https://developer.mozilla.org/en-US/docs/Web/Guide/CSS/Understanding_z_index/The_stacking_context
            var style = this.getComputedStyle(elem),
                zIdx = style.zIndex, 
                isAuto = zIdx === 'auto';
            if (isAuto && parseInt(style.opacity, 10) === 1) {
                // No new stacking context.
                zIdx = 0;
                var children = elem.childNodes, i = children.length, child;
                while (i) {
                    child = children[--i];
                    if (child.nodeType === 1) zIdx = Math.max(zIdx, this.getHighestZIndex(child));
                }
            } else {
                zIdx = isAuto ? 0 : parseInt(zIdx, 10);
            }
            return zIdx;
        },
        
        /** Gets the x and y position of the dom element relative to the 
            ancestor dom element or the page. Transforms are not supported.
            Use getTruePagePosition if you need support for transforms.
            @param elem:domElement The dom element to get the position for.
            @param ancestorElem:domElement (optional) An ancestor dom element
                that if encountered will halt the page position calculation
                thus giving the position of elem relative to ancestorElem.
            @returns object with 'x' and 'y' keys or null if an error has
                occurred. */
        getPagePosition: function(elem, ancestorElem) {
            if (!elem) return null;
            
            var x = 0, y = 0, s,
                borderMultiplier = BrowserDetect.browser === 'Firefox' ? 2 : 1; // I have no idea why firefox needs it twice, but it does.
            
            // elem.nodeName !== "BODY" test prevents looking at the body
            // which causes problems when the document is scrolled on webkit.
            while (elem && elem.nodeName !== "BODY" && elem !== ancestorElem) {
                x += elem.offsetLeft;
                y += elem.offsetTop;
                elem = elem.offsetParent;
                if (elem && elem.nodeName !== "BODY") {
                    s = this.getComputedStyle(elem);
                    x += borderMultiplier * parseInt(s.borderLeftWidth, 10) - elem.scrollLeft;
                    y += borderMultiplier * parseInt(s.borderTopWidth, 10) - elem.scrollTop;
                }
            }
            
            return {x:x, y:y};
        },
        
        /** Gets the x and y position of the dom element relative to the page
            with support for transforms.
            @param elem:domElement The dom element to get the position for.
            @returns object with 'x' and 'y' keys or null if an error has
                occurred. */
        getTruePagePosition: function(elem) {
            if (!elem) return null;
            var pos = $(elem).offset();
            return {x:pos.left, y:pos.top};
        },
        
        /** Generates a dom event on a dom element. Adapted from:
                http://stackoverflow.com/questions/6157929/how-to-simulate-mouse-click-using-javascript
            @param elem:domElement the element to simulate the event on.
            @param eventName:string the name of the dom event to generate.
            @param customOpts:Object (optional) a map of options that will
                be added onto the dom event object.
            @returns void */
        simulateDomEvent: function(elem, eventName, customOpts) {
            if (elem) {
                var opts = {
                    pointerX:0, pointerY:0, button:0,
                    ctrlKey:false, altKey:false, shiftKey:false, metaKey:false,
                    bubbles:true, cancelable:true
                };
                
                if (customOpts) {
                    for (var p in customOpts) opts[p] = customOpts[p];
                }
                
                var eventType,
                    eventMatchers = {
                        'HTMLEvents': /^(?:load|unload|abort|error|select|change|submit|reset|focus|blur|resize|scroll)$/,
                        'MouseEvents': /^(?:click|dblclick|mouse(?:down|up|over|move|out))$/
                    };
                for (var name in eventMatchers) {
                    if (eventMatchers[name].test(eventName)) {eventType = name; break;}
                }
                if (!eventType) throw new SyntaxError('Only HTMLEvent and MouseEvent interfaces supported');
                
                var domEvent;
                if (document.createEvent) {
                    domEvent = document.createEvent(eventType);
                    if (eventType === 'HTMLEvents') {
                        domEvent.initEvent(eventName, opts.bubbles, opts.cancelable);
                    } else {
                        domEvent.initMouseEvent(
                            eventName, opts.bubbles, opts.cancelable, document.defaultView,
                            opts.button, opts.pointerX, opts.pointerY, opts.pointerX, opts.pointerY,
                            opts.ctrlKey, opts.altKey, opts.shiftKey, opts.metaKey, 
                            opts.button, null
                        );
                    }
                    elem.dispatchEvent(domEvent);
                } else {
                    opts.clientX = opts.pointerX;
                    opts.clientY = opts.pointerY;
                    domEvent = document.createEventObject();
                    for (var key in opts) domEvent[key] = opts[key];
                    elem.fireEvent('on' + eventName, domEvent);
                }
            }
        }
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    getInnerDomElement: function() {
        return this.domElement;
    },
    
    getOuterDomElement: function() {
        return this.__outerElem;
    },
    
    getInnerDomStyle: function() {
        return this.deStyle;
    },
    
    getOuterDomStyle: function() {
        return this.__outerStyle;
    },
    
    /** Sets the dom element(s) to the provided one. */
    setDomElement: function(v) {
        // Support an inner and outer dom element if an array of elements is
        // provided.
        var outerElem, innerElem;
        if (Array.isArray(v)) {
            outerElem = v[0];
            innerElem = v[1];
        } else {
            outerElem = innerElem = v;
        }
        
        this.domElement = innerElem;
        this.__outerElem = outerElem;
        
        // Store a reference to domElement.style since it is accessed often.
        this.deStyle = innerElem.style;
        this.__outerStyle = outerElem.style;
        
        // Setup a reference from the domElement to this model. This will allow
        // access to the model from code that uses JQuery or some other
        // mechanism to select dom elements.
        innerElem.model = outerElem.model = this;
    },
    
    /** Removes this DomElementProxy's dom element from its parent node.
        @returns void */
    removeDomElement: function() {
        var de = this.getOuterDomElement();
        de.parentNode.removeChild(de);
    },
    
    /** Called when this DomElementProxy is destroyed.
        @returns void */
    disposeOfDomElement: function() {
        delete this.domElement.model;
        delete this.deStyle;
        delete this.domElement;
        
        delete this.__outerElem.model;
        delete this.__outerStyle;
        delete this.__outerElem;
    },
    
    /** Sets the dom "class" attribute on the dom element.
        @param v:string the dom class name.
        @returns void */
    setDomClass: function(v) {
        this.domElement.className = this.domClass = v;
    },
    
    /** Adds a dom "class" to the existing dom classes on the dom element.
        @param v:string the dom class to add.
        @returns void */
    addDomClass: function(v) {
        var existing = this.domElement.className;
        this.setDomClass((existing ? existing + ' ' : '') + v);
    },
    
    /** Removes a dom "class" from the dom element.
        @param v:string the dom class to remove.
        @returns void */
    removeDomClass: function(v) {
        var existing = this.domElement.className;
        if (existing) {
            var parts = existing.split(' '), i = parts.length;
            while (i) {
                if (parts[--i] === v) parts.splice(i, 1);
            }
            this.setDomClass(parts.join(' '));
        }
    },
    
    /** Clears the dom "class".
        @returns void */
    clearDomClass: function() {
        this.setDomClass('');
    },
    
    /** Sets the dom "id" attribute on the dom element.
        @param v:string the dom id name.
        @returns void */
    setDomId: function(v) {
        this.domElement.id = this.domId = v;
    },
    
    /** Set the z-index of the dom element.
        @param v:number the z-index to set.
        @returns void */
    setZIndex: function(v) {
        this.deStyle.zIndex = v;
    },
    
    /** Set an arbitrary CSS style on the dom element.
        @param propertyName:string the name of the CSS property to set.
        @param v:* the value to set.
        @returns void */
    setStyleProperty: function(propertyName, v) {
        this.deStyle[propertyName] = v;
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** Gets the x and y position of the underlying dom element relative to
        the page. Transforms are not supported.
        @returns object with 'x' and 'y' keys or null if no dom element exists
            for this proxy. */
    getPagePosition: function() {
        return myt.DomElementProxy.getPagePosition(this.domElement);
    },
    
    /** Gets the x and y position of the underlying dom element relative 
        to the page with support for transforms.
        @returns object with 'x' and 'y' keys or null if no dom element exists
            for this proxy. */
    getTruePagePosition: function() {
        return myt.DomElementProxy.getTruePagePosition(this.domElement);
    },
    
    /** Generates a dom event on this proxy's dom element.
        @param eventName:string the name of the dom event to generate.
        @param customOpts:Object (optional) a map of options that will
            be added onto the dom event object.
        @returns void */
    simulateDomEvent: function(eventName, customOpts) {
        myt.DomElementProxy.simulateDomEvent(this.domElement, eventName, customOpts);
    },
    
    /** Gets the highest z-index of the dom element.
        @returns int */
    getHighestZIndex: function() {
        return myt.DomElementProxy.getHighestZIndex(this.domElement);
    },
    
    /** Gets the highest z-index of any of the descendant dom elements of
        the domElement of this DomElementProxy.
        @param skipChild:domElement (optional) A dom element to skip over
            when determining the z-index.
        @returns number */
    getHighestChildZIndex: function(skipChild) {
        var DEP = myt.DomElementProxy, 
            children = this.domElement.childNodes, i = children.length, child, 
            zIdx = 0;
        while (i) {
            child = children[--i];
            if (child.nodeType === 1 && child !== skipChild) zIdx = Math.max(zIdx, DEP.getHighestZIndex(child));
        }
        return zIdx;
    },
    
    /** Makes this dom element proxy the one with the highest z-index 
        relative to its sibling dom elements.
        @returns void */
    makeHighestZIndex: function() {
        this.setZIndex(this.parent.getHighestChildZIndex(this.domElement) + 1);
    }
});


/** Generates Dom Events and passes them on to one or more event observers.
    Requires myt.DomElementProxy be included when this mixin is included.
    
    Events:
        None
    
    Attributes:
        None
    
    Private Attributes:
        __dobsbt:object Stores arrays of myt.DomObservers and method names 
            by event type.
*/
myt.DomObservable = new JS.Module('DomObservable', {
    // Methods /////////////////////////////////////////////////////////////////
    /** Adds the observer to the list of event recipients for the event type.
        @param domObserver:myt.DomObserver The observer that will be notified
            when a dom event occurs.
        @param methodName:string The method name to call on the dom observer.
        @param type:string The type of dom event to register for.
        @param capture:boolean (optional) Indicates if the event registration
            is during capture or bubble phase. Defaults to false, bubble phase.
        @returns boolean True if the observer was successfully registered, 
            false otherwise.*/
    attachDomObserver: function(domObserver, methodName, type, capture, passive) {
        if (domObserver && methodName && type) {
            capture = !!capture;
            
            var methodRef = this.createDomMethodRef(domObserver, methodName, type);
            if (methodRef) {
                var domObserversByType = this.__dobsbt || (this.__dobsbt = {});
                
                // Lazy instantiate dom observers array for type and insert observer.
                var domObservers = domObserversByType[type];
                if (!domObservers) {
                    // Create list with observer
                    domObserversByType[type] = [domObserver, methodName, methodRef, capture];
                } else {
                    // Add dom observer to the end of the list
                    domObservers.push(domObserver, methodName, methodRef, capture);
                }
                
                myt.addEventListener(this.getInnerDomElement(), type, methodRef, capture, passive);
                
                return true;
            }
        }
        return false;
    },
    
    /** Creates a function that will handle the dom event when it is fired
        by the browser. Must be implemented by the object this mixin is 
        applied to.
        @param domObserver:myt.DomObserver the observer that must be notified
            when the dom event fires.
        @param methodName:string the name of the function to pass the event to.
        @param type:string the type of the event to fire.
        @returns a function to handle the dom event or null if the event
            is not supported. */
    createDomMethodRef: function(domObserver, methodName, type) {
        return null;
    },
    
    /** Used by the createDomMethodRef implementations of submixins of 
        myt.DomObservable to implement the standard methodRef.
        @param domObserver:myt.DomObserver the observer that must be notified
            when the dom event fires.
        @param methodName:string the name of the function to pass the event to.
        @param type:string the type of the event to fire.
        @param observableClass:JS.Class The class that has the common event.
        @param preventDefault:boolean (Optional) If true the default behavior
            of the domEvent will be prevented.
        @returns a function to handle the dom event or undefined if the event
            will not be handled. */
    createStandardDomMethodRef: function(domObserver, methodName, type, observableClass, preventDefault) {
        if (observableClass.EVENT_TYPES[type]) {
            var self = this, 
                event = observableClass.EVENT;
            return function(domEvent) {
                if (!domEvent) var domEvent = window.event;
                
                event.source = self;
                event.type = domEvent.type;
                event.value = domEvent;
                
                var allowBubble = domObserver[methodName](event);
                if (!allowBubble) {
                    domEvent.cancelBubble = true;
                    if (domEvent.stopPropagation) domEvent.stopPropagation();
                    
                    if (preventDefault) domEvent.preventDefault();
                }
                
                event.source = undefined;
            };
        }
    },
    
    /** Removes the observer from the list of dom observers for the event type.
        @param domObserver:myt.DomObserver The dom observer to unregister.
        @param methodName:string The method name to unregister for.
        @param type:string The dom event type to unregister for.
        @param capture:boolean (optional) The event phase to unregister for.
            Defaults to false if not provided.
        @returns boolean True if the observer was successfully unregistered, 
            false otherwise.*/
    detachDomObserver: function(domObserver, methodName, type, capture) {
        if (domObserver && methodName && type) {
            capture = !!capture;
            
            var domObserversByType = this.__dobsbt;
            if (domObserversByType) {
                var domObservers = domObserversByType[type];
                if (domObservers) {
                    // Remove dom observer
                    var retval = false, 
                        domElement = this.getInnerDomElement(), 
                        i = domObservers.length;
                    while (i) {
                        i -= 4;
                        if (domObserver === domObservers[i] && 
                            methodName === domObservers[i + 1] && 
                            capture === domObservers[i + 3]
                        ) {
                            if (domElement) myt.removeEventListener(domElement, type, domObservers[i + 2], capture);
                            domObservers.splice(i, 4);
                            retval = true;
                        }
                    }
                    return retval;
                }
            }
        }
        return false;
    },
    
    /** Detaches all dom observers from this DomObservable.
        @returns void */
    detachAllDomObservers: function() {
        var domElement = this.getInnerDomElement();
        if (domElement) {
            var domObserversByType = this.__dobsbt;
            if (domObserversByType) {
                var domObservers, methodRef, capture, i, type;
                for (type in domObserversByType) {
                    domObservers = domObserversByType[type];
                    i = domObservers.length;
                    while (i) {
                        capture = domObservers[--i];
                        methodRef = domObservers[--i];
                        i -= 2; // methodName and domObserver
                        myt.removeEventListener(domElement, type, methodRef, capture);
                    }
                    domObservers.length = 0;
                }
            }
        }
    }
});


/** Provides a mechanism to remember which DomObservables this DomObserver has 
    attached itself to. This is useful when the instance is being destroyed
    to automatically cleanup the observer/observable relationships.
    
    When this mixin is used attachment and detachment should be done 
    using the 'attachToDom' and 'detachFromDom' methods of this mixin. If this 
    is not done, it is possible for the relationship between observer and 
    observable to become broken.
    
    Events:
        None
    
    Attributes:
        None
    
    Private Attributes:
        __dobt: (Object) Holds arrays of DomObservables by event type.
*/
myt.DomObserver = new JS.Module('DomObserver', {
    // Methods /////////////////////////////////////////////////////////////////
    /** Attaches this DomObserver to the provided DomObservable for the 
        provided type.
        @returns void */
    attachToDom: function(observable, methodName, type, capture, passive) {
        if (observable && methodName && type) {
            capture = !!capture;
            
            // Lazy instantiate __dobt map.
            var observablesByType = this.__dobt || (this.__dobt = {});
            var observables = observablesByType[type] || (observablesByType[type] = []);
            
            // Attach this DomObserver to the DomObservable
            if (observable.attachDomObserver(this, methodName, type, capture, passive)) {
                observables.push(capture, methodName, observable);
            }
        }
    },
    
    /** Detaches this DomObserver from the DomObservable for the event type.
        @returns boolean True if detachment succeeded, false otherwise. */
    detachFromDom: function(observable, methodName, type, capture) {
        if (observable && methodName && type) {
            capture = !!capture;
            
            // No need to detach if observable array doesn't exist.
            var observablesByType = this.__dobt;
            if (observablesByType) {
                var observables = observablesByType[type];
                if (observables) {
                    // Remove all instances of this observer/methodName/type/capture 
                    // from the observable
                    var retval = false, i = observables.length;
                    while (i) {
                        i -= 3;
                        if (observable === observables[i + 2] && 
                            methodName === observables[i + 1] && 
                            capture === observables[i]
                        ) {
                            if (observable.detachDomObserver(this, methodName, type, capture)) {
                                observables.splice(i, 3);
                                retval = true;
                            }
                        }
                    }
                    
                    // Observable wasn't found
                    return retval;
                }
            }
        }
        return false;
    },
    
    /** Detaches this DomObserver from all DomObservables it is attached to.
        @returns void */
    detachFromAllDomSources: function() {
        var observablesByType = this.__dobt;
        if (observablesByType) {
            var observables, i, type;
            for (type in observablesByType) {
                observables = observablesByType[type];
                i = observables.length;
                while (i) observables[--i].detachDomObserver(this, observables[--i], type, observables[--i]);
                observables.length = 0;
            }
        }
    }
});


/** Generates Key Events and passes them on to one or more event observers.
    Requires myt.DomObservable as a super mixin. */
myt.KeyObservable = new JS.Module('KeyObservable', {
    // Class Methods and Attributes ////////////////////////////////////////////
    extend: {
        /** A map of supported key event types. */
        EVENT_TYPES:{
            keypress:true,
            keydown:true,
            keyup:true
        },
        
        /** The common key event that gets reused. */
        EVENT:{source:null, type:null, value:null},
        
        /** Gets the key code from the provided key event.
            @param event:event
            @returns number The keycode from the event. */
        getKeyCodeFromEvent: function(event) {
            var domEvent = event.value, 
                keyCode = domEvent.keyCode;
            return keyCode || domEvent.charCode;
        }
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** @overrides myt.DomObservable */
    createDomMethodRef: function(domObserver, methodName, type) {
        return this.createStandardDomMethodRef(domObserver, methodName, type, myt.KeyObservable) || 
            this.callSuper(domObserver, methodName, type);
    }
});


/** Tracks focus and provides global focus events. Registered with myt.global 
    as 'focus'.
    
    Events:
        focused:View Fired when the focused view changes. The event value is
            the newly focused view.
    
    Attributes:
        lastTraversalWasForward:boolean indicates if the last traversal was
            in the forward direction or not. If false this implies the last
            traversal was in the backward direction. This value is initalized
            to true.
        focusedView:View the view that currently has focus.
        prevFocusedView:View the view that previously had focus.
        focusedDom:DomElement holds the dom element that has focus when the
            focus has traversed into a non myt managed area of the dom.
*/
/* Dom element types reference:
    ELEMENT_NODE                :1
    ATTRIBUTE_NODE              :2
    TEXT_NODE                   :3
    CDATA_SECTION_NODE          :4
    ENTITY_REFERENCE_NODE       :5
    ENTITY_NODE                 :6
    PROCESSING_INSTRUCTION_NODE :7
    COMMENT_NODE                :8
    DOCUMENT_NODE               :9
    DOCUMENT_TYPE_NODE          :10
    DOCUMENT_FRAGMENT_NODE      :11
    NOTATION_NODE               :12 */
new JS.Singleton('GlobalFocus', {
    include: [myt.Observable],
    
    
    // Constructor /////////////////////////////////////////////////////////////
    initialize: function() {
        this.lastTraversalWasForward = true;
        
        myt.global.register('focus', this);
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    /** Sets the currently focused view. */
    setFocusedView: function(v) {
        if (this.focusedView !== v) {
            this.prevFocusedView = this.focusedView; // Remember previous focus
            this.focusedView = v;
            if (v) this.focusedDom = null; // Wipe this since we have actual focus now.
            this.fireEvent('focused', v);
        }
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** Called by a FocusObservable when it has received focus.
        @param focusable:FocusObservable the view that received focus.
        @returns void. */
    notifyFocus: function(focusable) {
        if (this.focusedView !== focusable) this.setFocusedView(focusable);
    },
    
    /** Called by a FocusObservable when it has lost focus.
        @param focusable:FocusObservable the view that lost focus.
        @returns void. */
    notifyBlur: function(focusable) {
        if (this.focusedView === focusable) this.setFocusedView(null);
    },
    
    /** Clears the current focus.
        @returns void */
    clear: function() {
        if (this.focusedView) {
            this.focusedView.blur();
        } else if (this.focusedDom) {
            this.focusedDom.blur();
            this.focusedDom = null;
        }
    },
    
    // Focus Traversal //
    /** Move focus to the next focusable element.
        @param ignoreFocusTrap:boolean If true focus traps will be skipped over.
        @returns void */
    next: function(ignoreFocusTrap) {
        var next = this._traverse(true, ignoreFocusTrap);
        if (next) next.focus();
    },
    
    /** Move focus to the previous focusable element.
        @param ignoreFocusTrap:boolean If true focus traps will be skipped over.
        @returns void */
    prev: function(ignoreFocusTrap) {
        var prev = this._traverse(false, ignoreFocusTrap);
        if (prev) prev.focus();
    },
    
    /** Traverse forward or backward from the currently focused view.
        @param isForward:boolean indicates forward or backward dom traversal.
        @param ignoreFocusTrap:boolean indicates if focus traps should be
            skipped over or not.
        @returns the new view to give focus to, or null if there is no view
            to focus on or an unmanaged dom element will receive focus. */
    _traverse: function(isForward, ignoreFocusTrap) {
        this.lastTraversalWasForward = isForward;
        
        // Determine root element and starting element for traversal.
        var activeElem = document.activeElement, 
            rootElem = document.body,
            startElem = rootElem,
            elem = startElem,
            model, progModel,
            focusFuncName = isForward ? 'getNextFocus' : 'getPrevFocus';
        
        if (activeElem) {
            elem = startElem = activeElem;
            model = startElem.model;
            if (!model) model = this.findModelForDomElement(startElem);
            if (model) {
                var focusTrap = model.getFocusTrap(ignoreFocusTrap);
                if (focusTrap) rootElem = focusTrap.domElement;
            }
        }
        
        // Traverse
        while (elem) {
            if (elem.model && elem.model[focusFuncName] &&
                (progModel = elem.model[focusFuncName]())
            ) {
                // Programatic traverse
                elem = progModel.domElement;
            } else if (isForward) {
                // Dom traverse forward
                if (elem.firstChild) {
                    elem = elem.firstChild;
                } else if (elem === rootElem) {
                    return startElem.model; // TODO: why?
                } else if (elem.nextSibling) {
                    elem = elem.nextSibling;
                } else {
                    // Jump up and maybe over since we're at a local
                    // deepest last child.
                    while (elem) {
                        elem = elem.parentNode;
                        
                        if (elem === rootElem) {
                            break; // TODO: why?
                        } else if (elem.nextSibling) {
                            elem = elem.nextSibling;
                            break;
                        }
                    }
                }
            } else {
                // Dom traverse backward
                if (elem === rootElem) {
                    elem = this.__getDeepestDescendant(rootElem);
                } else if (elem.previousSibling) {
                    elem = this.__getDeepestDescendant(elem.previousSibling);
                } else {
                    elem = elem.parentNode;
                }
            }
            
            // If we've looped back around return the starting element.
            if (elem === startElem) return startElem.model;
            
            // Check that the element is focusable and return it if it is.
            if (elem.nodeType === 1) {
                model = elem.model;
                if (model && model instanceof myt.View) {
                    if (model.isFocusable()) return model;
                } else {
                    var nodeName = elem.nodeName;
                    if (nodeName === 'A' || nodeName === 'AREA' || 
                        nodeName === 'INPUT' || nodeName === 'TEXTAREA' || 
                        nodeName === 'SELECT' || nodeName === 'BUTTON'
                    ) {
                        if (!elem.disabled && !isNaN(elem.tabIndex) && 
                            myt.DomElementProxy.isDomElementVisible(elem)
                        ) {
                            // Make sure the dom element isn't inside a maskFocus
                            model = this.findModelForDomElement(elem);
                            if (model && model.searchAncestorsOrSelf(function(n) {return n.maskFocus === true;})) {
                                // Is a masked dom element so ignore.
                            } else {
                                elem.focus();
                                this.focusedDom = elem;
                                return null;
                            }
                        }
                    }
                }
            }
        }
        
        return null;
    },
    
    /** Finds the closest model for the provided dom element.
        @param elem:domElement to element to start looking from.
        @returns myt.View or null if not found.
        @private */
    findModelForDomElement: function(elem) {
        var model;
        while (elem) {
            model = elem.model;
            if (model && model instanceof myt.View) return model;
            elem = elem.parentNode;
        }
        return null;
    },
    
    /** Gets the deepest dom element that is a descendant of the provided
        dom element or the element itself.
        @param elem:domElement The dom element to search downward from.
        @returns a dom element.
        @private */
    __getDeepestDescendant: function(elem) {
        while (elem.lastChild) elem = elem.lastChild;
        return elem;
    }
});


/** Provides global keyboard events. Registered with myt.global as 'keys'.
    
    Also works with GlobalFocus to navigate the focus hierarchy when the 
    focus traversal keys are used.
    
    Events:
        keydown:number fired when a key is pressed down. The value is the
            keycode of the key pressed down.
        keypress:number fired when a key is pressed. The value is the
            keycode of the key pressed.
        keyup:number fired when a key is released up. The value is the
            keycode of the key released up.
    
    Private Attributes:
        __keysDown:object A map of keycodes of the keys currently pressed down.
    
    Keycodes:
        backspace          8
        tab                9
        enter             13
        shift             16
        ctrl              17
        alt               18
        pause/break       19
        caps lock         20
        escape            27
        spacebar          32
        page up           33
        page down         34
        end               35
        home              36
        left arrow        37
        up arrow          38
        right arrow       39
        down arrow        40
        insert            45
        delete            46
        0                 48
        1                 49
        2                 50
        3                 51
        4                 52
        5                 53
        6                 54
        7                 55
        8                 56
        9                 57
        a                 65
        b                 66
        c                 67
        d                 68
        e                 69
        f                 70
        g                 71
        h                 72
        i                 73
        j                 74
        k                 75
        l                 76
        m                 77
        n                 78
        o                 79
        p                 80
        q                 81
        r                 82
        s                 83
        t                 84
        u                 85
        v                 86
        w                 87
        x                 88
        y                 89
        z                 90
        left window key   91
        right window key  92
        select key        93
        numpad 0          96
        numpad 1          97
        numpad 2          98
        numpad 3          99
        numpad 4         100
        numpad 5         101
        numpad 6         102
        numpad 7         103
        numpad 8         104
        numpad 9         105
        multiply         106
        add              107
        subtract         109
        decimal point    110
        divide           111
        f1               112
        f2               113
        f3               114
        f4               115
        f5               116
        f6               117
        f7               118
        f8               119
        f9               120
        f10              121
        f11              122
        f12              123
        num lock         144
        scroll lock      145
        semi-colon       186
        equal sign       187
        comma            188
        dash             189
        period           190
        forward slash    191
        grave accent     192
        open bracket     219
        back slash       220
        close braket     221
        single quote     222
*/
new JS.Singleton('GlobalKeys', {
    include: [
        myt.DomElementProxy, 
        myt.DomObservable,
        myt.DomObserver,
        myt.KeyObservable,
        myt.Observable,
        myt.Observer
    ],
    
    
    // Constructor /////////////////////////////////////////////////////////////
    initialize: function() {
        // Constants
        var self = this,
            G = myt.global,
            isFirefox = BrowserDetect.browser === 'Firefox';
        self.KEYCODE_TAB = 9;
        self.KEYCODE_SHIFT = 16;
        self.KEYCODE_CONTROL = 17;
        self.KEYCODE_ALT = 18;
        self.KEYCODE_Z = 90;
        self.KEYCODE_COMMAND = isFirefox ? 224 : 91;
        self.KEYCODE_RIGHT_COMMAND = isFirefox ? 224 : 93;
        
        self.setDomElement(document);
        self.attachTo(G.focus, '__handleFocused', 'focused');
        self.__keysDown = {};
        self.__listenToDocument();
        
        G.register('keys', self);
        
        // Clear keys down when the window loses focus. This is necessary when
        // using keyboard shortcusts to switch apps since that will leave
        // a key in the down state even though it may no longer be when the
        // focus is returned to the page.
        global.onblur = () => {self.__keysDown = {};};
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** Tests if a key is currently pressed down or not.
        @param keyCode:number the key to test.
        @returns true if the key is down, false otherwise. */
    isKeyDown: function(keyCode) {
        return !!this.__keysDown[keyCode];
    },
    
    /** Tests if the 'shift' key is down. */
    isShiftKeyDown: function() {return this.isKeyDown(this.KEYCODE_SHIFT);},
    
    /** Tests if the 'control' key is down. */
    isControlKeyDown: function() {return this.isKeyDown(this.KEYCODE_CONTROL);},
    
    /** Tests if the 'alt' key is down. */
    isAltKeyDown: function() {return this.isKeyDown(this.KEYCODE_ALT);},
    
    /** Tests if the 'command' key is down. */
    isCommandKeyDown: function() {
        return this.isKeyDown(this.KEYCODE_COMMAND) || this.isKeyDown(this.KEYCODE_RIGHT_COMMAND);
    },
    
    /** Tests if the platform specific "accelerator" key is down. */
    isAcceleratorKeyDown: function() {
        return BrowserDetect.os === 'Mac' ? this.isCommandKeyDown() : this.isControlKeyDown();
    },
    
    /** @private */
    __handleFocused: function(event) {
        var self = this,
            focused = event.value;
        if (focused) {
            // unlisten to document
            self.detachFromDom(self, '__handleKeyDown', 'keydown');
            self.detachFromDom(self, '__handleKeyPress', 'keypress');
            self.detachFromDom(self, '__handleKeyUp', 'keyup');
            
            self.attachToDom(focused, '__handleKeyDown', 'keydown');
            self.attachToDom(focused, '__handleKeyPress', 'keypress');
            self.attachToDom(focused, '__handleKeyUp', 'keyup');
        } else {
            var prevFocused = myt.global.focus.prevFocusedView;
            if (prevFocused) {
                self.detachFromDom(prevFocused, '__handleKeyDown', 'keydown');
                self.detachFromDom(prevFocused, '__handleKeyPress', 'keypress');
                self.detachFromDom(prevFocused, '__handleKeyUp', 'keyup');
            }
            
            self.__listenToDocument();
        }
    },
    
    /** @private */
    __listenToDocument: function() {
        var self = this;
        self.attachToDom(self, '__handleKeyDown', 'keydown');
        self.attachToDom(self, '__handleKeyPress', 'keypress');
        self.attachToDom(self, '__handleKeyUp', 'keyup');
    },
    
    /** @private */
    __handleKeyDown: function(event) {
        var self = this,
            keyCode = myt.KeyObservable.getKeyCodeFromEvent(event),
            domEvent = event.value;
        if (self.__shouldPreventDefault(keyCode, domEvent.target)) domEvent.preventDefault();
        
        // Keyup events do not fire when command key is down so fire a keyup
        // event immediately. Not an issue for other meta keys: shift, ctrl 
        // and option.
        if (self.isCommandKeyDown() && keyCode !== self.KEYCODE_SHIFT && keyCode !== self.KEYCODE_CONTROL && keyCode !== self.KEYCODE_ALT) {
            self.fireEvent('keydown', keyCode);
            self.fireEvent('keyup', keyCode);
        } else {
            self.__keysDown[keyCode] = true;
            
            // Check for 'tab' key and do focus traversal.
            if (keyCode === self.KEYCODE_TAB) {
                var ift = self.ignoreFocusTrap(),
                    gf = myt.global.focus;
                if (self.isShiftKeyDown()) {
                    gf.prev(ift);
                } else {
                    gf.next(ift);
                }
            }
            
            self.fireEvent('keydown', keyCode);
        }
    },
    
    ignoreFocusTrap: function() {
        return this.isAltKeyDown();
    },
    
    /** @private */
    __handleKeyPress: function(event) {
        var keyCode = myt.KeyObservable.getKeyCodeFromEvent(event);
        this.fireEvent('keypress', keyCode);
    },
    
    /** @private */
    __handleKeyUp: function(event) {
        var keyCode = myt.KeyObservable.getKeyCodeFromEvent(event),
            domEvent = event.value;
        if (this.__shouldPreventDefault(keyCode, domEvent.target)) domEvent.preventDefault();
        this.__keysDown[keyCode] = false;
        this.fireEvent('keyup', keyCode);
    },
    
    /** @private */
    __shouldPreventDefault: function(keyCode, targetElem) {
        switch (keyCode) {
            case 8: // Backspace
                // Catch backspace since it navigates the history. Allow it to
                // go through for text input elements though.
                var nodeName = targetElem.nodeName;
                if (nodeName === 'TEXTAREA' || 
                    (nodeName === 'INPUT' && (targetElem.type === 'text' || targetElem.type === 'password')) ||
                    (nodeName === 'DIV' && targetElem.contentEditable === 'true' && targetElem.firstChild)
                ) return false;
                
                return true;
                
            case 9: // Tab
                // Tab navigation is handled by the framework.
                return true;
        }
        return false;
    }
});


/** Generates Touch Events and passes them on to one or more event observers.
    
    Requires: myt.DomObservable super mixin.
*/
myt.TouchObservable = new JS.Module('TouchObservable', {
    // Class Methods and Attributes ////////////////////////////////////////////
    extend: {
        /** A map of supported touch event types. */
        EVENT_TYPES:{
            touchstart:true,
            touchend:true,
            touchmove:true,
            touchcancel:true
        },
        
        /** The common touch event that gets reused. */
        EVENT:{source:null, type:null, value:null}
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** @overrides myt.DomObservable */
    createDomMethodRef: function(domObserver, methodName, type) {
        return this.createStandardDomMethodRef(domObserver, methodName, type, myt.TouchObservable, false) || 
            this.callSuper(domObserver, methodName, type);
    }
});


/** Provides global touch events by listening to touch events on the the
    document. Registered with myt.global as 'touch'. */
new JS.Singleton('GlobalTouch', {
    include: [myt.DomElementProxy, myt.DomObservable, myt.TouchObservable],
    
    
    // Constructor /////////////////////////////////////////////////////////////
    initialize: function() {
        this.setDomElement(document);
        
        myt.global.register('touch', this);
    }
});


/** Adds support for flex box child behavior to a myt.View.
    
    Events:
        flexGrow
        flexShrink
        alignSelf
    
    Attributes:
        flexGrow
        flexShrink
        alignSelf
*/
myt.FlexBoxChildSupport = new JS.Module('FlexBoxChildSupport', {
    // Accessors ///////////////////////////////////////////////////////////////
    /** @overrides */
    setParent: function(v) {
        var self = this,
            oldParentIsFlexBox = self.isChildOfFlexBox();
        
        self.callSuper(v);
        
        self._isChildOfFlexBox = self.parent && self.parent.isA(myt.FlexBoxSupport);
        
        // When reparenting from a flexbox parent to a non-flexbox parent we
        // may need to resync the dom to the model.
        if (self.inited && oldParentIsFlexBox && !self.isChildOfFlexBox()) self._syncDomToModel();
    },
    
    /** @private */
    _syncDomToModel: function() {
        var self = this,
            s = self.getOuterDomStyle();
        if (s.width !== 'auto') s.width = self.width + 'px';
        if (s.height !== 'auto') s.height = self.height + 'px';
        self.syncInnerToOuter();
    },
    
    /** @overrides
        Keep outer dom element's width in sync with the inner dom element. */
    setWidth: function(v, supressEvent) {
        if (v == null || v === '') {
            this.getOuterDomStyle().width = '';
            this.__syncModelToOuterBoundsWidth();
        } else {
            this.callSuper(v, supressEvent);
        }
        this.__syncInnerWidthToOuterWidth();
    },
    
    /** @overrides
        Keep outer dom element's height in sync with the inner dom element. */
    setHeight: function(v, supressEvent) {
        if (v == null || v === '') {
            this.getOuterDomStyle().height = '';
            this.__syncModelToOuterBoundsHeight();
        } else {
            this.callSuper(v, supressEvent);
        }
        this.__syncInnerHeightToOuterHeight();
    },
    
    // Flex Box Attrs
    setFlexGrow: function(v) {
        if (this.flexGrow !== v) {
            this.getOuterDomStyle().flexGrow = this.flexGrow = v;
            if (this.inited) {
                this.fireEvent('flexGrow', v);
                if (this.parent && this.parent.__syncSubviews) {
                    this.parent.__syncSubviews();
                }
            }
        }
    },
    
    setFlexShrink: function(v) {
        if (this.flexShrink !== v) {
            this.getOuterDomStyle().flexShrink = this.flexShrink = v;
            if (this.inited) {
                this.fireEvent('flexShrink', v);
                if (this.parent && this.parent.__syncSubviews) {
                    this.parent.__syncSubviews();
                }
            }
        }
    },
    
    setAlignSelf: function(v) {
        if (this.alignSelf !== v) {
            this.alignSelf = v;
            
            // Alias common unexpected values when assigning to the dom
            var domValue = v;
            switch (domValue) {
                case 'start':
                    domValue = 'flex-start';
                    break;
                case 'end':
                    domValue = 'flex-end';
                    break;
            }
            this.getOuterDomStyle().alignSelf = domValue;
            
            if (this.inited) this.fireEvent('alignSelf', v);
        }
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    isChildOfFlexBox: function() {
        return this._isChildOfFlexBox;
    },
    
    syncModelToOuterBounds: function() {
        var de = this.getOuterDomElement();
        this.__syncModelToOuterBoundsWidth(de);
        this.__syncModelToOuterBoundsHeight(de);
    },
    
    /** @private */
    __syncModelToOuterBoundsWidth: function(de) {
        var ids = this.getInnerDomStyle();
        if (!de) de = this.getOuterDomElement();
        if (ids.width === 'auto') {
            // We're sizing to our contents so first sync the outer dom style 
            // so we can read the correct client size below.
            this.getOuterDomStyle().width = 'auto';
        } else {
            // We're using a fixed size so first sync the inner dom style
            // to the outer dom style.
            this.__setInnerWidth(de.clientWidth);
        }
        this.fireEvent('width', this.width = de.clientWidth);
    },
    
    /** @private */
    __syncModelToOuterBoundsHeight: function(de) {
        var ids = this.getInnerDomStyle();
        if (!de) de = this.getOuterDomElement();
        if (ids.height === 'auto') {
            // We're sizing to our contents so first sync the outer dom style 
            // so we can read the correct client size below.
            this.getOuterDomStyle().height = 'auto';
        } else {
            // We're using a fixed size so first sync the inner dom style
            // to the outer dom style.
            this.__setInnerHeight(de.clientHeight);
        }
        this.fireEvent('height', this.height = de.clientHeight);
    },
    
    syncInnerToOuter: function() {
        this.__syncInnerWidthToOuterWidth();
        this.__syncInnerHeightToOuterHeight();
    },
    
    /** @private */
    __syncInnerWidthToOuterWidth: function() {
        // Don't clobber auto sizing
        if (this.getInnerDomStyle().width !== 'auto') {
            this.__setInnerWidth(this.getOuterDomElement().clientWidth);
        }
    },
    
    /** @private */
    __syncInnerHeightToOuterHeight: function() {
        // Don't clobber auto sizing
        if (this.getInnerDomStyle().height !== 'auto') {
            this.__setInnerHeight(this.getOuterDomElement().clientHeight);
        }
    },
    
    /** @private */
    __setInnerWidth: function(v) {
        this.getInnerDomStyle().width = v + 'px';
    },
    
    /** @private */
    __setInnerHeight: function(v) {
        this.getInnerDomStyle().height = v + 'px';
    },
    
    /** @overrides */
    createOurDomElement: function(parent) {
        var outerElem = this.callSuper(parent);
        
        // We need an inner dom element that is position relative to mask the
        // flex box behavior for descendants of this flex box child.
        var innerElem = document.createElement('div');
        innerElem.style.position = 'relative';
        outerElem.appendChild(innerElem);
        
        return [outerElem, innerElem];
    }
});


/** Provides support for getter and setter functions on an object.
    
    Events:
        None
    
    Attributes:
        earlyAttrs:array An array of attribute names that will be set first.
        lateAttrs:array An array of attribute names that will be set last.
*/
myt.AccessorSupport = new JS.Module('AccessorSupport', {
    // Class Methods and Attributes ////////////////////////////////////////////
    extend: {
        /** Caches getter names. */
        GETTER_NAMES:{},
        
        /** Caches setter names. */
        SETTER_NAMES:{},
        
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
                    if (target.inited) target.fireEvent(attrName, v);
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
        }
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    appendToEarlyAttrs: function() {Array.prototype.push.apply(this.earlyAttrs || (this.earlyAttrs = []), arguments);},
    prependToEarlyAttrs: function() {Array.prototype.unshift.apply(this.earlyAttrs || (this.earlyAttrs = []), arguments);},
    appendToLateAttrs: function() {Array.prototype.push.apply(this.lateAttrs || (this.lateAttrs = []), arguments);},
    prependToLateAttrs: function() {Array.prototype.unshift.apply(this.lateAttrs || (this.lateAttrs = []), arguments);},
    
    /** Calls a setter function for each attribute in the provided map.
        @param attrs:object a map of attributes to set.
        @returns void. */
    callSetters: function(attrs) {
        var self = this,
            earlyAttrs = self.earlyAttrs,
            lateAttrs = self.lateAttrs,
            attrName, extractedLateAttrs, i, len;
        if (earlyAttrs || lateAttrs) {
            // Make a shallow copy of attrs since we can't guarantee that
            // attrs won't be reused
            var copyOfAttrs = {};
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
        @param attrName:string The name of the attribute to get.
        @returns the attribute value. */
    get: function(attrName) {
        var getterName = myt.AccessorSupport.generateGetterName(attrName);
        return this[getterName] ? this[getterName]() : this[attrName];
    },
    
    /** A generic setter function that can be called to set a value on this
        object. Will defer to a defined setter if it exists. The implementation
        assumes this object is an Observable so it will have a 'fireEvent'
        method.
        @param attrName:string The name of the attribute to set.
        @param v:* The value to set.
        @param skipSetter:boolean (optional) If true no attempt will be made to
            invoke a setter function. Useful when you want to invoke standard 
            setter behavior. Defaults to undefined which is equivalent to false.
        @returns void */
    set: function(attrName, v, skipSetter) {
        var self = this,
            setterName;
        
        if (!skipSetter) {
            setterName = myt.AccessorSupport.generateSetterName(attrName);
            if (self[setterName]) return self[setterName](v);
        }
        
        if (self[attrName] !== v) {
            self[attrName] = v;
            if (self.inited !== false && self.fireEvent) self.fireEvent(attrName, v); // !== false allows this to work with non-nodes.
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


/** Provides a destroy method that can be used as part of an Object creation
    and destruction lifecycle. When an object is "destroyed" it will have
    a 'destroyed' attribute with a value of true.
    
    Events:
        None
    
    Attributes:
        destroyed:boolean Set to true when the object is in the "destroyed"
            state, undefinded otherwise.
*/
myt.Destructible = new JS.Module('Destructible', {
    // Methods /////////////////////////////////////////////////////////////////
    /** Destroys this Object. Subclasses must call super.
        @returns void */
    destroy: function() {
        // See http://perfectionkills.com/understanding-delete/ for details
        // on how delete works. This is why we use Object.keys below since it
        // avoids iterating over many of the properties that are not deletable.
        var self = this,
            keys, i,
            meta = self.__meta__;
        
        if (self.destroyed) {
            console.warn('No destroying the destroyed.');
            return;
        }
        
        // OPTIMIZATION: Improve garbage collection for JS.Class
        if (meta) {
            keys = Object.keys(meta);
            i = keys.length;
            while (i) delete meta[keys[--i]];
        }
        
        keys = Object.keys(self);
        i = keys.length;
        while (i) delete self[keys[--i]];
        
        self.destroyed = true;
    }
});


/** Objects that can be used in an myt.AbstractPool should use this mixin and 
    implement the "clean" method. */
myt.Reusable = new JS.Module('Reusable', {
    // Methods /////////////////////////////////////////////////////////////////
    /** Puts this object back into a default state suitable for storage in
        an myt.AbstractPool
        @returns void */
    clean: function() {}
});


/** Implements an object pool. Subclasses must at a minimum implement the 
    createInstance method.
    
    Events:
        None
    
    Attributes:
        None
    
    Private Attributes:
        __op:array The array of objects stored in the pool.
*/
myt.AbstractPool = new JS.Class('AbstractPool', {
    include: [myt.Destructible],
    
    
    // Constructor /////////////////////////////////////////////////////////////
    /** Initialize does nothing. */
    initialize: function() {},
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides myt.Destructible */
    destroy: function() {
        var objPool = this.__getObjPool();
        if (objPool) objPool.length = 0;
        
        this.callSuper();
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** Get the object pool.
        @param lazy:boolean If true a pool will be lazily instantiated.
        @private */
    __getObjPool: function(lazy) {
        return lazy ? this.__op || (this.__op = []) : this.__op;
    },
    
    /** Get an instance from the pool.
        @param arguments:arguments (optional) arguments to be passed to the
            createInstance method. Note: these have no effect if an object
            already exists in the pool.
        @returns object */
    getInstance: function() {
        var objPool = this.__getObjPool(true);
        return objPool.length ? objPool.pop() : this.createInstance.apply(this, arguments);
    },
    
    /** Creates a new object that can be stored in the pool. The default
        implementation does nothing. */
    createInstance: function() {
        return null;
    },
    
    /** Puts the object back in the pool. The object will be "cleaned"
        before it is stored.
        @param obj:object the object to put in the pool.
        @returns void */
    putInstance: function(obj) {
        this.__getObjPool(true).push(this.cleanInstance(obj));
    },
    
    /** Cleans the object in preparation for putting it back in the pool. The
        default implementation calls the clean method on the object if it is
        a myt.Reusable. Otherwise it does nothing.
        @param obj:object the object to be cleaned.
        @returns object the cleaned object. */
    cleanInstance: function(obj) {
        if (typeof obj.clean === 'function') obj.clean();
        return obj;
    },
    
    /** Calls the destroy method on all object stored in the pool if they
        have a destroy function.
        @returns void */
    destroyPooledInstances: function() {
        var objPool = this.__getObjPool();
        if (objPool) {
            var i = objPool.length, obj;
            while (i) {
                obj = objPool[--i];
                if (typeof obj.destroy === 'function') obj.destroy();
            }
        }
    }
});


/** An implementation of an myt.AbstractPool.
    
    Events
        None
    
    Attributes:
        instanceClass:JS.Class (initializer only) the class to use for 
            new instances. Defaults to Object.
        instanceParent:myt.Node (initializer only) The node to create new
            instances on.
*/
myt.SimplePool = new JS.Class('SimplePool', myt.AbstractPool, {
    // Constructor /////////////////////////////////////////////////////////////
    /** Create a new myt.SimplePool
        @param instanceClass:JS.Class the class to create instances from.
        @param instanceParent:object (optional) The place to create instances 
            on. When instanceClass is an myt.Node this will be the node parent.
        @returns void */
    initialize: function(instanceClass, instanceParent) {
        this.callSuper();
        
        this.instanceClass = instanceClass || Object;
        this.instanceParent = instanceParent;
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** @overrides myt.AbstractPool
        Creates an instance of this.instanceClass and passes in 
        this.instanceParent as the first argument if it exists.
        @param arguments[0]:object (optional) the attrs to be passed to a
            created myt.Node. */
    createInstance: function() {
        // If we ever need full arguments with new, see:
        // http://stackoverflow.com/questions/1606797/use-of-apply-with-new-operator-is-this-possible
        var parent = this.instanceParent, instanceClass = this.instanceClass;
        return parent ? new instanceClass(parent, arguments[0]) : new instanceClass();
    }
});


/** An myt.SimplePool that tracks which objects are "active". An "active"
    object is one that has been obtained by the getInstance method.
    
    Events:
        None
    
    Attributes:
        None
    
    Private Attributes:
        __actives:array an array of active instances.
*/
myt.TrackActivesPool = new JS.Class('TrackActivesPool', myt.SimplePool, {
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides myt.Destructible */
    destroy: function() {
        var actives = this.__getActives();
        if (actives) actives.length = 0;
        
        this.callSuper();
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** Get the active objects array.
        @param lazy:boolean If true a list will be lazily instantiated.
        @private */
    __getActives: function(lazy) {
        return lazy ? this.__actives || (this.__actives = []) : this.__actives;
    },
    
    /** @overrides myt.AbstractPool */
    getInstance: function() {
        var instance = this.callSuper();
        this.__getActives(true).push(instance);
        return instance;
    },
    
    /** @overrides myt.AbstractPool */
    putInstance: function(obj) {
        var actives = this.__getActives(),
            i,
            warningType;
        if (actives) {
            i = actives.length;
            while (i) {
                if (actives[--i] === obj) {
                    actives.splice(i, 1);
                    this.callSuper(obj);
                    return;
                }
            }
            warningType = "non-active";
        } else {
            warningType = "non-existant";
        }
        console.warn("Attempt to put a " + warningType + " instance.", obj, this);
    },
    
    /** Gets an array of the active instances.
        @param filterFunc:function (optional) If provided filters the
            results.
        @returns array */
    getActives: function(filterFunc) {
        var actives = this.__getActives();
        if (actives) {
            if (filterFunc) {
                var retval = [],
                    len = actives.length,
                    i = 0,
                    active;
                for (; len > i;) {
                    active = actives[i++];
                    if (filterFunc.call(this, active)) retval.push(active);
                }
                return retval;
            }
            return actives.concat();
        }
        return [];
    },
    
    /** Puts all the active instances back in the pool.
        @returns void */
    putActives: function() {
        var actives = this.__getActives();
        if (actives) {
            var i = actives.length;
            while (i) this.putInstance(actives[--i]);
        }
    }
});


/** A single node within a tree data structure. A node has zero or one parent 
    node and zero or more child nodes. If a node has no parent it is a 'root' 
    node. If a node has no child nodes it is a 'leaf' node. Parent nodes and 
    parent of parents, etc. are referred to as ancestors. Child nodes and 
    children of children, etc. are referred to as descendants.
    
    Lifecycle management is also provided via the 'initNode', 'doBeforeAdoption',
    'doAfterAdoption', 'destroy', 'destroyBeforeOrphaning' and
    'destroyAfterOrphaning' methods.
    
    Events:
        parent:myt.Node Fired when the parent is set.
    
    Attributes:
        inited:boolean Set to true after this Node has completed initializing.
        parent:myt.Node The parent of this Node.
        name:string The name of this node. Used to reference this Node from
            its parent Node.
        isBeingDestroyed:boolean Indicates that this node is in the process
            of being destroyed. Set to true at the beginning of the destroy
            lifecycle phase. Undefined before that.
        placement:string The name of the subnode of this Node to add nodes to 
            when setParent is called on the subnode. Placement can be nested 
            using '.' For example 'foo.bar'. The special value of '*' means 
            use the default placement. For example 'foo.*' means place in the 
            foo subnode and then in the default placement for foo.
        defaultPlacement:string The name of the subnode to add nodes to when 
            no placement is specified. Defaults to undefined which means add
            subnodes directly to this node.
        ignorePlacement:boolean If set to true placement will not be processed 
            for this Node when it is added to a parent Node.
    
    Private Attributes:
        __animPool:array An myt.TrackActivesPool used by the 'animate' method.
        subnodes:array The array of child nodes for this node. Should be
            accessed through the getSubnodes method.
*/
myt.Node = new JS.Class('Node', {
    include: [myt.AccessorSupport, myt.Destructible, myt.Observable, myt.Constrainable],
    
    
    // Class Methods and Attributes ////////////////////////////////////////////
    extend: {
        /** Get the closest ancestor of the provided Node or the Node itself for 
            which the matcher function returns true.
            @param n:myt.Node the Node to start searching from.
            @param matcher:function the function to test for matching Nodes with.
            @returns Node or null if no match is found. */
        getMatchingAncestorOrSelf: function(n, matcherFunc) {
            if (matcherFunc) {
                while (n) {
                    if (matcherFunc(n)) return n;
                    n = n.parent;
                }
            }
            return null;
        },
        
        /** Get the youngest ancestor of the provided Node for which the 
            matcher function returns true.
            @param n:myt.Node the Node to start searching from. This Node is not
                tested, but its parent is.
            @param matcher:function the function to test for matching Nodes with.
            @returns Node or null if no match is found. */
        getMatchingAncestor: function(n, matcherFunc) {
            return this.getMatchingAncestorOrSelf(n ? n.parent : null, matcherFunc);
        }
    },
    
    
    // Constructor /////////////////////////////////////////////////////////////
    /** The standard JSClass initializer function. Subclasses should not
        override this function.
        @param parent:Node (or dom element for RootViews) (Optional) the parent 
            of this Node.
        @param attrs:object (Optional) A map of attribute names and values.
        @param mixins:array (Optional) a list of mixins to be added onto
            the new instance.
        @returns void */
    initialize: function(parent, attrs, mixins) {
        var self = this;
        if (mixins) {
            for (var i = 0, len = mixins.length, mixin; len > i;) {
                if (mixin = mixins[i++]) {
                    self.extend(mixin);
                } else {
                    console.warn("Missing mixin in:" + self.klass.__displayName);
                }
            }
        }
        
        self.inited = false;
        self.initNode(parent, attrs || {});
    },
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    /** Called during initialization. Sets initial state for life cycle attrs,
        calls setter methods, sets parent and lastly, sets inited to true.
        Subclasses must callSuper.
        @param parent:Node (or dom element for RootViews) the parent of 
            this Node.
        @param attrs:object A map of attribute names and values.
        @returns void */
    initNode: function(parent, attrs) {
        var self = this;
        self.callSetters(attrs);
        
        self.doBeforeAdoption();
        self.setParent(parent);
        self.doAfterAdoption();
        
        self.inited = true;
    },
    
    /** Provides a hook for subclasses to do things before this Node has its
        parent assigned. This would be the ideal place to create subviews
        so as to avoid unnecessary dom reflows. However, text size can't
        be measured until insertion into the DOM so you may want to use
        doAfterAdoption for creating subviews since it will give you less
        trouble though it will be slower.
        @returns void */
    doBeforeAdoption: function() {},
    
    /** Provides a hook for subclasses to do things after this Node has its
        parent assigned.
        @returns void */
    doAfterAdoption: function() {},
    
    /** @overrides myt.Destructible. */
    destroy: function() {
        var self = this,
            subs = self.subnodes,
            i;
        
        // Allows descendants to know destruction is in process
        self.isBeingDestroyed = true;
        
        // Destroy subnodes depth first
        if (subs) {
            i = subs.length;
            while (i) subs[--i].destroy();
        }
        
        if (self.__animPool) {
            self.stopActiveAnimators();
            self.__animPool.destroy();
        }
        
        self.destroyBeforeOrphaning();
        if (self.parent) self.setParent(null);
        self.destroyAfterOrphaning();
        
        self.callSuper();
    },
    
    /** Provides a hook for subclasses to do destruction of their internals.
        This method is called after subnodes have been destroyed but before
        the parent has been unset.
        Subclasses should call super.
        @returns void */
    destroyBeforeOrphaning: function() {},
    
    /** Provides a hook for subclasses to do destruction of their internals.
        This method is called after the parent has been unset.
        Subclasses must call super.
        @returns void */
    destroyAfterOrphaning: function() {
        this.releaseAllConstraints();
        this.detachFromAllObservables();
        this.detachAllObservers();
    },
    
    
    // Structural Accessors ////////////////////////////////////////////////////
    setPlacement: function(v) {this.placement = v;},
    setDefaultPlacement: function(v) {this.defaultPlacement = v;},
    setIgnorePlacement: function(v) {this.ignorePlacement = v;},
    
    /** Sets the provided Node as the new parent of this Node. This is the
        most direct method to do reparenting. You can also use the addSubnode
        method but it's just a wrapper around this setter. */
    setParent: function(newParent) {
        var self = this;
        
        // Use placement if indicated
        if (newParent && !self.ignorePlacement) {
            var placement = self.placement || newParent.defaultPlacement;
            if (placement) newParent = newParent.determinePlacement(placement, self);
        }
        
        if (self.parent !== newParent) {
            // Abort if the new parent is in the destroyed life-cycle state.
            if (newParent && newParent.destroyed) return;
            
            // Remove ourselves from our existing parent if we have one.
            var curParent = self.parent;
            if (curParent) {
                var idx = curParent.getSubnodeIndex(self);
                if (idx !== -1) {
                    if (self.name) curParent.__removeNameRef(self);
                    curParent.subnodes.splice(idx, 1);
                    curParent.subnodeRemoved(self);
                }
            }
            
            self.parent = newParent;
            
            // Add ourselves to our new parent
            if (newParent) {
                newParent.getSubnodes().push(self);
                if (self.name) newParent.__addNameRef(self);
                newParent.subnodeAdded(self);
            }
            
            // Fire an event
            if (self.inited) self.fireEvent('parent', newParent);
        }
    },
    
    /** The 'name' of a Node allows it to be referenced by name from its
        parent node. For example a Node named 'foo' that is a child of a
        Node stored in the var 'bar' would be referenced like this: bar.foo or
        bar['foo']. */
    setName: function(name) {
        var self = this;
        
        if (self.name !== name) {
            // Remove "name" reference from parent.
            var p = self.parent;
            if (p && self.name) p.__removeNameRef(self);
            
            self.name = name;
            
            // Add "name" reference to parent.
            if (p && name) p.__addNameRef(self);
        }
    },
    
    /** Gets the subnodes for this Node and does lazy instantiation of the 
        subnodes array if no child Nodes exist.
        @returns array of subnodes. */
    getSubnodes: function() {
        return this.subnodes || (this.subnodes = []);
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** Called from setParent to determine where to insert a subnode in the node
        hierarchy. Subclasses will not typically override this method, but if
        they do, they probably won't need to call super.
        @param placement:string the placement path to use.
        @param subnode:myt.Node the subnode being placed.
        @returns the Node to place a subnode into. */
    determinePlacement: function(placement, subnode) {
        // Parse "active" placement and remaining placement.
        var idx = placement.indexOf('.'), remainder, loc;
        if (idx !== -1) {
            remainder = placement.substring(idx + 1);
            placement = placement.substring(0, idx);
        }
        
        // Evaluate placement of '*' as defaultPlacement.
        if (placement === '*') {
            placement = this.defaultPlacement;
            
            // Default placement may be compound and thus require splitting
            if (placement) {
                idx = placement.indexOf('.');
                if (idx !== -1) {
                    remainder = placement.substring(idx + 1) + (remainder ? '.' + remainder : '');
                    placement = placement.substring(0, idx);
                }
            }
            
            // It's possible that a placement of '*' comes out here if a
            // Node has its defaultPlacement set to '*'. This should result
            // in a null loc when the code below runs which will end up
            // returning 'this'.
        }
        
        loc = this[placement];
        return loc ? (remainder ? loc.determinePlacement(remainder, subnode) : loc) : this;
    },
    
    /** Adds a named reference to a subnode.
        @param node:Node the node to add the name reference for.
        @returns void */
    __addNameRef: function(node) {
        var name = node.name;
        if (this[name] === undefined) {
            this[name] = node;
        } else {
            console.log("Name in use:" + name);
        }
    },
    
    /** Removes a named reference to a subnode.
        @param node:Node the node to remove the name reference for.
        @returns void */
    __removeNameRef: function(node) {
        var name = node.name;
        if (this[name] === node) {
            delete this[name];
        } else {
            console.log("Name not in use:" + name);
        }
    },
    
    // Tree Methods //
    /** Gets the root Node for this Node. The root Node is the oldest
        ancestor or self that has no parent.
        @returns Node */
    getRoot: function() {
        return this.parent ? this.parent.getRoot() : this;
    },
    
    /** Checks if this Node is a root Node.
        @returns boolean */
    isRoot: function() {
        return this.parent == null;
    },
    
    /** Tests if this Node is a descendant of the provided Node or is the
        node itself.
        @returns boolean */
    isDescendantOf: function(node) {
        var self = this;
        
        if (node) {
            if (node === self) return true;
            if (self.parent) {
                // Optimization: use the dom element contains function if 
                // both nodes are DomElementProxy instances.
                if (self.domElement && node.domElement) return node.domElement.contains(self.domElement);
                return self.parent.isDescendantOf(node);
            }
        }
        return false;
    },
    
    /** Tests if this Node is an ancestor of the provided Node or is the
        node itself.
        @param node:Node the node to check for.
        @returns boolean */
    isAncestorOf: function(node) {
        return node ? node.isDescendantOf(this) : false;
    },
    
    /** Gets the youngest common ancestor of this node and the provided node.
        @param node:myt.Node The node to look for a common ancestor with.
        @returns The youngest common Node or null if none exists. */
    getLeastCommonAncestor: function(node) {
        while (node) {
            if (this.isDescendantOf(node)) return node;
            node = node.parent;
        }
        return null;
    },
    
    /** Find the youngest ancestor Node that is an instance of the class.
        @param klass the Class to search for.
        @returns Node or null if no klass is provided or match found. */
    searchAncestorsForClass: function(klass) {
        return klass ? this.searchAncestors(function(n) {return n instanceof klass;}) : null;
    },
    
    /** Get the youngest ancestor of this Node for which the matcher function 
        returns true. This is a simple wrapper around 
        myt.Node.getMatchingAncestor(this, matcherFunc).
        @param matcherFunc:function the function to test for matching 
            Nodes with.
        @returns Node or null if no match is found. */
    searchAncestors: function(matcherFunc) {
        return myt.Node.getMatchingAncestor(this, matcherFunc);
    },
    
    /** Get the youngest ancestor of this Node or the Node itself for which 
        the matcher function returns true. This is a simple wrapper around 
        myt.Node.getMatchingAncestorOrSelf(this, matcherFunc).
        @param matcherFunc:function the function to test for matching 
            Nodes with.
        @returns Node or null if no match is found. */
    searchAncestorsOrSelf: function(matcherFunc) {
        return myt.Node.getMatchingAncestorOrSelf(this, matcherFunc);
    },
    
    /** Gets an array of ancestor nodes including the node itself.
        @returns array: The array of ancestor nodes. */
    getAncestors: function() {
        var ancestors = [], node = this;
        while (node) {
            ancestors.push(node);
            node = node.parent;
        }
        return ancestors;
    },
    
    // Subnode Methods //
    /** Checks if this Node has the provided Node in the subnodes array.
        @param node:Node the subnode to check for.
        @returns true if the subnode is found, false otherwise. */
    hasSubnode: function(node) {
        return this.getSubnodeIndex(node) !== -1;
    },
    
    /** Gets the index of the provided Node in the subnodes array.
        @param node:Node the subnode to get the index for.
        @returns the index of the subnode or -1 if not found. */
    getSubnodeIndex: function(node) {
        return this.getSubnodes().indexOf(node);
    },
    
    /** A convienence method to make a Node a child of this Node. The
        standard way to do this is to call the setParent method on the
        prospective child Node.
        @param node:Node the subnode to add.
        @returns void */
    addSubnode: function(node) {
        node.setParent(this);
    },
    
    /** A convienence method to make a Node no longer a child of this Node. The
        standard way to do this is to call the setParent method with a value
        of null on the child Node.
        @param node:Node the subnode to remove.
        @returns the removed Node or null if removal failed. */
    removeSubnode: function(node) {
        if (node.parent !== this) return null;
        node.setParent(null);
        return node;
    },
    
    /** Called when a subnode is added to this node. Provides a hook for
        subclasses. No need for subclasses to call super. Do not call this
        method to add a subnode. Instead call addSubnode or setParent.
        @param node:Node the subnode that was added.
        @returns void */
    subnodeAdded: function(node) {},
    
    /** Called when a subnode is removed from this node. Provides a hook for
        subclasses. No need for subclasses to call super. Do not call this
        method to remove a subnode. Instead call removeSubnode or setParent.
        @param node:Node the subnode that was removed.
        @returns void */
    subnodeRemoved: function(node) {},
    
    // Animation
    /** A wrapper on Node.animate that will only animate one time and that 
        provides a streamlined list of the most commonly used arguments.
        @param attribute:string/object the name of the attribute to animate. If
            an object is provided it should be the only argument and its keys
            should be the params of this method. This provides a more concise
            way of passing in sparse optional parameters.
        @param to:number the target value to animate to.
        @param from:number the target value to animate from. (optional)
        @param duration:number (optional)
        @param easingFunction:function (optional)
        @returns The Animator being run. */
    animateOnce: function(attribute, to, from, duration, easingFunction) {
        return this.animate(attribute, to, from, false, null, duration, false, 1, easingFunction);
    },
    
    /** Animates an attribute using the provided parameters.
        @param attribute:string/object the name of the attribute to animate. If
            an object is provided it should be the only argument and its keys
            should be the params of this method. This provides a more concise
            way of passing in sparse optional parameters.
        @param to:number the target value to animate to.
        @param from:number the target value to animate from. (optional)
        @param relative:boolean (optional)
        @param callback:function (optional)
        @param duration:number (optional)
        @param reverse:boolean (optional)
        @param repeat:number (optional)
        @param easingFunction:function (optional)
        @returns The Animator being run. */
    animate: function(attribute, to, from, relative, callback, duration, reverse, repeat, easingFunction) {
        var animPool = this.__getAnimPool(),
            anim = animPool.getInstance({ignorePlacement:true}); // ignorePlacement ensures the animator is directly attached to this node
        
        if (typeof attribute === 'object') {
            // Handle a single map argument if provided
            callback = attribute.callback;
            delete attribute.callback;
            anim.callSetters(attribute);
        } else {
            // Handle individual arguments
            anim.attribute = attribute;
            anim.setTo(to);
            anim.setFrom(from);
            if (duration != null) anim.duration = duration;
            if (relative != null) anim.relative = relative;
            if (repeat != null) anim.repeat = repeat;
            if (reverse != null) anim.setReverse(reverse);
            if (easingFunction != null) anim.setEasingFunction(easingFunction);
        }
        
        // Release the animation when it completes.
        anim.next(function(success) {animPool.putInstance(anim);});
        if (callback) anim.next(callback);
        
        anim.setRunning(true);
        return anim;
    },
    
    /** Gets an array of the currently running animators that were created
        by calls to the animate method.
        @param filterFunc:function/string (optional) a function that filters
            which animations get stopped. The filter should return true for 
            functions to be included. If the provided values is a string it will
            be used as a matching attribute name.
        @returns an array of active animators. */
    getActiveAnimators: function(filterFunc) {
        if (typeof filterFunc === 'string') {
            var attrName = filterFunc;
            filterFunc = function(anim) {return anim.attribute === attrName;};
        }
        return this.__getAnimPool().getActives(filterFunc);
    },
    
    /** Stops all active animations.
        @param filterFunc:function/string (optional) a function that filters 
            which animations get stopped. The filter should return true for 
            functions to be stopped. If the provided values is a string it will
            be used as a matching attribute name.
        @param executeCallbacks:boolean (optional) if true animator 
            callbacks will be executed if they exist.
        @returns void */
    stopActiveAnimators: function(filterFunc, executeCallbacks=false) {
        var activeAnims = this.getActiveAnimators(filterFunc),
            i = activeAnims.length,
            anim,
            animPool;
        if (i > 0) {
            animPool = this.__getAnimPool();
            while (i) {
                anim = activeAnims[--i];
                anim.reset(executeCallbacks);
                if (!executeCallbacks) animPool.putInstance(anim);
            }
        }
    },
    
    /** Gets the animation pool if it exists, or lazy instantiates it first
        if necessary.
        @private
        @returns myt.TrackActivesPool */
    __getAnimPool: function() {
        return this.__animPool || (this.__animPool = new myt.TrackActivesPool(myt.Animator, this));
    },
    
    // Timing and Delay
    /** A convienence method to execute a method once on idle.
        @param methodName:string The name of the method to execute on
            this object.
        @returns void */
    doOnceOnIdle: function(methodName) {
        this.attachTo(myt.global.idle, methodName, 'idle', true);
    }
});


/** A counter that can be incremented and decremented and will update an
    'exceeded' attribute when a threshold is crossed. */
myt.ThresholdCounter = new JS.Class('ThresholdCounter', {
    include: [myt.AccessorSupport, myt.Destructible, myt.Observable],
    
    // Class Methods and Attributes ////////////////////////////////////////////
    extend: {
        /** Mixes ThresholdCounter functionality onto the provided scope.
            @param scope:Observable|Class|Module the scope to mix onto.
            @param exceededAttrName:string the name of the boolean attribute
                that will indicate if the threshold is exceeded or not.
            @param counterAttrName:string (Optional) the name of the number
                attribute that will get adjusted up and down. If not provided
                the 'exceeded' attribute name will be used with 'Counter'
                appended to it. For example if the exceeded
                attribute was 'locked' this would be 'lockedCounter'.
            @param thresholdAttrName:string (Optional) the name of the number
                attribute that determines when we are exceeded or not. If not 
                provided the 'exceeded' attribute name will be used with 
                'Threshold' appended to it. For example if the exceeded
                attribute was 'locked' this would be 'lockedThreshold'.
            @returns boolean True if creation succeeded, false otherwise. */
        createThresholdCounter: function(scope, exceededAttrName, counterAttrName, thresholdAttrName) {
            var genNameFunc = myt.AccessorSupport.generateName;
            counterAttrName = counterAttrName || genNameFunc('counter', exceededAttrName);
            thresholdAttrName = thresholdAttrName || genNameFunc('threshold', exceededAttrName);
            
            var incrName = genNameFunc(counterAttrName, 'increment'),
                decrName = genNameFunc(counterAttrName, 'decrement'),
                thresholdSetterName = myt.AccessorSupport.generateSetterName(thresholdAttrName),
                isModuleOrClass = typeof scope === 'function' || scope instanceof JS.Module;
            
            // Prevent clobbering
            if ((isModuleOrClass ? scope.instanceMethod(incrName) : scope[incrName]) !== undefined) {
                console.warn("Can't clobber existing property during setup of ThresholdCounter increment function.", incrName, scope);
                return false;
            }
            if ((isModuleOrClass ? scope.instanceMethod(decrName) : scope[decrName]) !== undefined) {
                console.warn("Can't clobber existing property during setup of ThresholdCounter decrement function.", decrName, scope);
                return false;
            }
            if ((isModuleOrClass ? scope.instanceMethod(thresholdSetterName) : scope[thresholdSetterName]) !== undefined) {
                console.warn("Can't clobber existing property during setup of ThresholdCounter threshold setter function.", thresholdSetterName, scope);
                return false;
            }
            
            // Define the "module".
            var mod = {};
            
            /** Increments the counter attribute on the scope object by the 
                provided value or 1 if no value was provided.
                @param amount:number (Optional) the amount to increment the 
                    counter by. If not provided, 1 will be used.
                @returns void */
            mod[incrName] = function(amount) {
                if (amount == null) amount = 1;
                var curValue = this[counterAttrName],
                    value = curValue + amount;
                
                // Counters must be non-negative.
                if (0 > value) {
                    console.warn("Attempt to decrement a counter below 0.", this, counterAttrName, amount);
                    value = 0;
                }
                
                if (curValue !== value) {
                    this[counterAttrName] = value;
                    this.fireEvent(counterAttrName, value);
                    this.set(exceededAttrName, value >= this[thresholdAttrName]); // Check threshold
                }
            };
            
            /** Decrements the counter attribute on the scope object by the 
                provided value or 1 if no value was provided.
                @param amount:number (Optional) the amount to increment the 
                    counter by. If not provided, 1 will be used.
                @returns void */
            mod[decrName] = function(amount) {
                if (amount == null) amount = 1;
                this[incrName](-amount);
            };
            
            /** Sets the threshold attribute and performs a threshold check.
                @returns void */
            mod[thresholdSetterName] = function(v) {
                if (this[thresholdAttrName] === v) return;
                this[thresholdAttrName] = v;
                this.fireEvent(thresholdAttrName, v);
                this.set(exceededAttrName, this[counterAttrName] >= v); // Check threshold
            };
            
            // Mixin in the "module"
            if (isModuleOrClass) {
                scope.include(mod);
            } else {
                scope.extend(mod);
            }
            
            return true;
        },
        
        /** Set initial value and threshold on a ThresholdCounter instance.
            This also executes a 'check' so the 'exceeded' attribute will have
            the correct value.
            @returns void */
        initializeThresholdCounter: function(
            scope, initialValue, thresholdValue, exceededAttrName, counterAttrName, thresholdAttrName
        ) {
            var genNameFunc = myt.AccessorSupport.generateName;
            counterAttrName = counterAttrName || genNameFunc('counter', exceededAttrName);
            thresholdAttrName = thresholdAttrName || genNameFunc('threshold', exceededAttrName);
            
            scope[counterAttrName] = initialValue;
            scope[thresholdAttrName] = thresholdValue;
            scope.set(exceededAttrName, initialValue >= thresholdValue); // Check threshold
        },
        
        /** Mixes ThresholdCounter functionality with a fixed threshold onto 
            the provided scope.
            @param scope:Observable|Class|Module the scope to mix onto.
            @param thresholdValue:number the fixed threshold value.
            @param exceededAttrName:string the name of the boolean attribute
                that will indicate if the threshold is exceeded or not.
            @param counterAttrName:string (Optional) the name of the number
                attribute that will get adjusted up and down. If not provided
                the 'exceeded' attribute name will be used with 'Counter'
                appended to it. For example if the exceeded
                attribute was 'locked' this would be 'lockedCounter'.
            @returns boolean True if creation succeeded, false otherwise. */
        createFixedThresholdCounter: function(scope, thresholdValue, exceededAttrName, counterAttrName) {
            var genNameFunc = myt.AccessorSupport.generateName;
            counterAttrName = counterAttrName || genNameFunc('counter', exceededAttrName);
            
            var incrName = genNameFunc(counterAttrName, 'increment'),
                decrName = genNameFunc(counterAttrName, 'decrement'),
                isModuleOrClass = typeof scope === 'function' || scope instanceof JS.Module;
            
            // Prevent clobbering
            if ((isModuleOrClass ? scope.instanceMethod(incrName) : scope[incrName]) !== undefined) {
                console.warn("Can't clobber existing property during setup of ThresholdCounter increment function.", incrName, scope);
                return false;
            }
            if ((isModuleOrClass ? scope.instanceMethod(decrName) : scope[decrName]) !== undefined) {
                console.warn("Can't clobber existing property during setup of ThresholdCounter decrement function.", decrName, scope);
                return false;
            }
            
            // Define the "module".
            var mod = {};
            
            /** Increments the counter attribute on the scope object by 1.
                @returns void */
            mod[incrName] = function() {
                var value = this[counterAttrName] + 1;
                this[counterAttrName] = value;
                this.fireEvent(counterAttrName, value);
                if (value === thresholdValue) this.set(exceededAttrName, true);
            };
            
            /** Decrements the counter attribute on the scope object by 1.
                @returns void */
            mod[decrName] = function() {
                var curValue = this[counterAttrName];
                if (curValue === 0) return;
                var value = curValue - 1;
                this[counterAttrName] = value;
                this.fireEvent(counterAttrName, value);
                if (curValue === thresholdValue) this.set(exceededAttrName, false);
            };
            
            // Mixin in the "module"
            if (isModuleOrClass) {
                scope.include(mod);
            } else {
                scope.extend(mod);
            }
            
            return true;
        },
        
        /** Set initial value on a ThresholdCounter instance.
            This also executes a 'check' so the 'exceeded' attribute will have
            the correct value.
            @returns void */
        initializeFixedThresholdCounter: function(
            scope, initialValue, thresholdValue, exceededAttrName, counterAttrName
        ) {
            counterAttrName = counterAttrName || myt.AccessorSupport.generateName('counter', exceededAttrName);
            
            scope[counterAttrName] = initialValue;
            scope.set(exceededAttrName, initialValue >= thresholdValue);
        }
    },
    
    
    // Constructor /////////////////////////////////////////////////////////////
    initialize: function(initialValue, thresholdValue) {
        myt.ThresholdCounter.initializeThresholdCounter(
            this, initialValue, thresholdValue, 'exceeded', 'counter', 'threshold'
        );
    },
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides myt.Destructible */
    destroy: function() {
        this.detachAllObservers();
        this.callSuper();
    }
});

/** Create default counter functions for the ThresholdCounter class. */
myt.ThresholdCounter.createThresholdCounter(
    myt.ThresholdCounter, 'exceeded', 'counter', 'threshold'
);


/** A layout controls the positioning of views within a parent view.
    
    Events:
        None
    
    Attributes:
        locked:boolean When true, the layout will not update.
        lockedCounter:number Counter created by myt.ThresholdCounter.
    
    Private Attributes:
        subviews:array An array of Views managed by this layout.
        __deferredLayout:boolean Marks a layout as deferred if the global
            layout lock, myt.Layout.locked, is true during a call to 
            'canUpdate' on the layout.
*/
myt.Layout = new JS.Class('Layout', myt.Node, {
    // Class Methods ///////////////////////////////////////////////////////////
    extend: {
        deferredLayouts: [],
        
        /** Increments the global lock that prevents all layouts from updating.
            @returns void */
        incrementGlobalLock: function() {
            var L = myt.Layout;
            if (L._lockCount === undefined) L._lockCount = 0;
            
            L._lockCount++;
            if (L._lockCount === 1) L.__setLocked(true);
        },
        
        /** Decrements the global lock that prevents all layouts from updating.
            @returns void */
        decrementGlobalLock: function() {
            var L = myt.Layout;
            if (L._lockCount === undefined) L._lockCount = 0;
            
            if (L._lockCount !== 0) {
                L._lockCount--;
                if (L._lockCount === 0) L.__setLocked(false);
            }
        },
        
        /** Adds a layout to a list of layouts that will get updated when the
            global lock is no longer locked.
            @param layout:myt.Layout the layout to defer an update for.
            @returns void */
        deferLayoutUpdate: function(layout) {
            // Don't add a layout that is already deferred.
            if (!layout.__deferredLayout) {
                myt.Layout.deferredLayouts.push(layout);
                layout.__deferredLayout = true;
            }
        },
        
        /** Called to set/unset the global lock. Updates all the currently 
            deferred layouts.
            @private */
        __setLocked: function(v) {
            var L = myt.Layout;
            if (L.locked === v) return;
            L.locked = v;
            
            if (!v) {
                var layouts = L.deferredLayouts, i = layouts.length, layout;
                while (i) {
                    layout = layouts[--i];
                    layout.__deferredLayout = false;
                    layout.update();
                }
                layouts.length = 0;
            }
        }
    },
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides myt.Node */
    initNode: function(parent, attrs) {
        this.subviews = [];
        
        // Start the layout in the locked state.
        this.locked = true;
        this.lockedCounter = 1;
        
        // Remember how initial locking state should be set
        var initiallyLocked = attrs.locked === true;
        delete attrs.locked;
        
        this.callSuper(parent, attrs);
        
        // Unlock if initial locking state calls for it.
        if (!initiallyLocked) this.decrementLockedCounter();
        
        this.update();
    },
    
    /** @overrides myt.Node */
    destroyAfterOrphaning: function() {
        this.callSuper();
        this.subviews.length = 0;
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    /** @overrides myt.Node */
    setParent: function(parent) {
        if (this.parent !== parent) {
            // Lock during parent change so that old parent is not updated by
            // the calls to removeSubview and addSubview.
            var wasNotLocked = !this.locked;
            if (wasNotLocked) this.locked = true;
            
            // Stop monitoring parent
            var svs, i, len;
            if (this.parent) {
                svs = this.subviews;
                i = svs.length;
                while (i) this.removeSubview(svs[--i]);
                
                this.detachFrom(this.parent, '__handleParentSubviewAddedEvent', 'subviewAdded');
                this.detachFrom(this.parent, '__handleParentSubviewRemovedEvent', 'subviewRemoved');
            }
            
            this.callSuper(parent);
            
            // Start monitoring new parent
            if (this.parent) {
                svs = this.parent.getSubviews();
                for (i = 0, len = svs.length; len > i; ++i) this.addSubview(svs[i]);
                
                this.attachTo(this.parent, '__handleParentSubviewAddedEvent', 'subviewAdded');
                this.attachTo(this.parent, '__handleParentSubviewRemovedEvent', 'subviewRemoved');
            }
            
            // Clear temporary lock and update if this happened after initialization.
            if (wasNotLocked) {
                this.locked = false;
                if (this.inited && this.parent) this.update();
            }
        }
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** Checks if the layout is locked or not. Should be called by the
        "update" method of each layout to check if it is OK to do the update.
        If myt.Layout.locked is true (the global layout lock) then a deferred
        layout update will be setup for this Layout. Once the global lock is
        unlocked this Layout's 'update' method will be invoked.
        @returns true if not locked, false otherwise. */
    canUpdate: function() {
        if (myt.Layout.locked) {
            myt.Layout.deferLayoutUpdate(this);
            return false;
        }
        return !this.locked;
    },
    
    /** Updates the layout. Subclasses should call canUpdate to check lock 
        state before trying to do anything.
        @returns void */
    update: function() {},
    
    // Subview Methods //
    /** Checks if this Layout has the provided View in the subviews array.
        @param sv:View the view to check for.
        @returns true if the subview is found, false otherwise. */
    hasSubview: function(sv) {
        return this.getSubviewIndex(sv) !== -1;
    },
    
    /** Gets the index of the provided View in the subviews array.
        @param sv:View the view to check for.
        @returns the index of the subview or -1 if not found. */
    getSubviewIndex: function(sv) {
        return this.subviews.indexOf(sv);
    },
    
    /** Adds the provided View to the subviews array of this Layout.
        @param sv:View the view to add to this layout.
        @returns void */
    addSubview: function(sv) {
        if (this.ignore(sv)) return;
        
        this.subviews.push(sv);
        this.startMonitoringSubview(sv);
        if (!this.locked) this.update();
    },
    
    /** Subclasses should implement this method to start listening to
        events from the subview that should trigger the update method.
        @param sv:View the view to start monitoring for changes.
        @returns void */
    startMonitoringSubview: function(sv) {},
    
    /** Calls startMonitoringSubview for all views. Used by Layout 
        implementations when a change occurs to the layout that requires
        refreshing all the subview monitoring.
        @returns void */
    startMonitoringAllSubviews: function() {
        var svs = this.subviews, i = svs.length;
        while (i) this.startMonitoringSubview(svs[--i]);
    },
    
    /** Removes the provided View from the subviews array of this Layout.
        @param sv:View the view to remove from this layout.
        @returns the index of the removed subview or -1 if not removed. */
    removeSubview: function(sv) {
        if (this.ignore(sv)) return -1;
        
        var idx = this.getSubviewIndex(sv);
        if (idx !== -1) {
            this.stopMonitoringSubview(sv);
            this.subviews.splice(idx, 1);
            if (!this.locked) this.update();
        }
        return idx;
    },
    
    /** Subclasses should implement this method to stop listening to
        events from the subview that would trigger the update method. This
        should remove all listeners that were setup in startMonitoringSubview.
        @param sv:View the view to stop monitoring for changes.
        @returns void */
    stopMonitoringSubview: function(sv) {},
    
    /** Calls stopMonitoringSubview for all views. Used by Layout 
        implementations when a change occurs to the layout that requires
        refreshing all the subview monitoring.
        @returns void */
    stopMonitoringAllSubviews: function() {
        var svs = this.subviews, i = svs.length;
        while (i) this.stopMonitoringSubview(svs[--i]);
    },
    
    /** Checks if a subview can be added to this Layout or not. The default 
        implementation returns the 'ignoreLayout' attributes of the subview.
        @param sv:myt.View the view to check.
        @returns boolean true means the subview will be skipped, false
            otherwise. */
    ignore: function(sv) {
        return sv.ignoreLayout;
    },
    
    /** If our parent adds a new subview we should add it.
        @private */
    __handleParentSubviewAddedEvent: function(event) {
        var v = event.value;
        if (v.parent === this.parent) this.addSubview(v);
    },
    
    /** If our parent removes a subview we should remove it.
        @private */
    __handleParentSubviewRemovedEvent: function(event) {
        var v = event.value;
        if (v.parent === this.parent) this.removeSubview(v);
    },
    
    // Subview ordering //
    /** Sorts the subviews array according to the provided sort function.
        @param sortFunc:function the sort function to sort the subviews with.
        @returns void */
    sortSubviews: function(sortFunc) {
        this.subviews.sort(sortFunc);
    },
    
    /** Moves the subview before the target subview in the order the subviews
        are layed out. If no target subview is provided, or it isn't in the
        layout the subview will be moved to the front of the list.
        @returns void */
    moveSubviewBefore: function(sv, target) {
        this.__moveSubview(sv, target, false);
    },
    
    /** Moves the subview after the target subview in the order the subviews
        are layed out. If no target subview is provided, or it isn't in the
        layout the subview will be moved to the back of the list.
        @returns void */
    moveSubviewAfter: function(sv, target) {
        this.__moveSubview(sv, target, true);
    },
    
    /** Implements moveSubviewBefore and moveSubviewAfter.
        @private */
    __moveSubview: function(sv, target, after) {
        var curIdx = this.getSubviewIndex(sv);
        if (curIdx >= 0) {
            var svs = this.subviews,
                targetIdx = this.getSubviewIndex(target);
            svs.splice(curIdx, 1);
            if (targetIdx >= 0) {
                if (curIdx < targetIdx) --targetIdx;
                svs.splice(targetIdx + (after ? 1 : 0), 0, sv);
            } else {
                // Make first or last since target was not found
                if (after) {
                    svs.push(sv);
                } else {
                    svs.unshift(sv);
                }
            }
        }
    }
});

/** Create locked counter functions for the myt.Layout class. */
myt.ThresholdCounter.createFixedThresholdCounter(myt.Layout, 1, 'locked');


/** Generates Mouse Events and passes them on to one or more event observers.
    Also provides the capability to capture contextmenu events and mouse
    wheel events.
    
    Requires: myt.DomObservable super mixin.
*/
myt.MouseObservable = new JS.Module('MouseObservable', {
    // Class Methods and Attributes ////////////////////////////////////////////
    extend: {
        /** A map of supported mouse event types. */
        EVENT_TYPES:{
            mouseover:true,
            mouseout:true,
            mousedown:true,
            mouseup:true,
            click:true,
            dblclick:true,
            mousemove:true,
            contextmenu:true,
            wheel:true
        },
        
        /** The common mouse event that gets reused. */
        EVENT:{source:null, type:null, value:null},
        
        /** Gets the mouse coordinates from the provided event.
            @param event
            @returns object: An object with 'x' and 'y' keys containing the
                x and y mouse position. */
        getMouseFromEvent: function(event) {
            var domEvent = event.value;
            return {x:domEvent.pageX, y:domEvent.pageY};
        },
        
        getMouseFromEventRelativeToView: function(event, view) {
            var viewPos = view.getPagePosition(),
                pos = this.getMouseFromEvent(event);
            pos.x -= viewPos.x;
            pos.y -= viewPos.y;
            return pos;
        }
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** @overrides myt.DomObservable */
    createDomMethodRef: function(domObserver, methodName, type) {
        return this.createStandardDomMethodRef(domObserver, methodName, type, myt.MouseObservable, true) || 
            this.callSuper(domObserver, methodName, type);
    }
});


/** Generates focus and blur events and passes them on to one or more 
    event observers. Also provides focus related events to a view. When a view
    is focused or blurred, myt.global.focus will be notified via the
    'notifyFocus' and 'notifyBlur' methods.
    
    Requires myt.DomObservable as a super mixin.
    
    Events:
        focused:object Fired when this view gets focus. The value is this view.
        focus:object Fired when this view gets focus. The value is a dom
            focus event.
        blur:object Fired when this view loses focus. The value is a dom
            focus event.
    
    Attributes:
        focused:boolean Indicates if this view has focus or not.
        focusable:boolean Indicates if this view can have focus or not.
        focusEmbellishment:boolean Indicates if the focus embellishment should
            be shown for this view or not when it has focus.
    
    Virtual Methods:
        getNextFocus() Implement this method to return the next view that 
            should have focus. If null is returned or the method is not 
            implemented, normal dom traversal will occur.
        getPrevFocus() Implement this method to return the prev view that 
            should have focus. If null is returned or the method is not 
            implemented, normal dom traversal will occur.
*/
// TODO: fire focus and blur events rather than a focused event?
// FIXME: should we give away focus when we become not visible?
myt.FocusObservable = new JS.Module('FocusObservable', {
    // Class Methods and Attributes ////////////////////////////////////////////
    extend: {
        /** A map of supported focus event types. */
        EVENT_TYPES:{
            focus:true,
            blur:true
        },
        
        /** The common focus/blur event that gets reused. */
        EVENT:{source:null, type:null, value:null}
    },
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides myt.Node */
    initNode: function(parent, attrs) {
        this.focusable = false;
        this.focusEmbellishment = true;
        
        this.callSuper(parent, attrs);
    },
    
    /** @overrides myt.View */
    destroyBeforeOrphaning: function() {
        this.giveAwayFocus();
        this.callSuper();
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setFocused: function(v) {
        if (this.focused !== v) {
            this.focused = v;
            if (this.inited) {
                this.fireEvent('focused', v);
                var gf = myt.global.focus;
                if (v) {
                    gf.notifyFocus(this);
                } else {
                    gf.notifyBlur(this);
                }
            }
        }
    },
    
    setFocusable: function(v) {
        var self = this;
        
        if (self.focusable !== v) {
            var wasFocusable = self.focusable;
            self.focusable = v;
            
            if (v) {
                self.getInnerDomElement().tabIndex = 0; // Make focusable. -1 is programtic only
                self.attachToDom(self, '__doFocus', 'focus');
                self.attachToDom(self, '__doBlur', 'blur');
            } else if (wasFocusable) {
                self.getInnerDomElement().removeAttribute('tabIndex'); // Make unfocusable
                self.detachFromDom(self, '__doFocus', 'focus');
                self.detachFromDom(self, '__doBlur', 'blur');
            }
            
            if (self.inited) self.fireEvent('focusable', v);
        }
    },
    
    setFocusEmbellishment: function(v) {
        if (this.focusEmbellishment !== v) {
            this.focusEmbellishment = v;
            if (this.focused) {
                if (v) {
                    this.showFocusEmbellishment();
                } else {
                    this.hideFocusEmbellishment();
                }
            }
        }
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** Gives the focus to the next focusable element or, if nothing else
        is focusable, blurs away from this element.
        @returns void */
    giveAwayFocus: function() {
        if (this.focused) {
            // Try to go to next focusable element.
            myt.global.focus.next();
            
            // If focus loops around to ourself make sure we don't keep it.
            if (this.focused) this.blur();
        }
    },
    
    /** Tests if this view is in a state where it can receive focus.
        @returns boolean True if this view is visible, enabled, focusable and
            not focus masked, false otherwise. */
    isFocusable: function() {
        return this.focusable && !this.disabled && this.isVisible() && 
            this.searchAncestorsOrSelf(function(n) {return n.maskFocus === true;}) === null;
    },
    
    /** Calling this method will set focus onto this view if it is focusable.
        @param noScroll:boolean (optional) if true is provided no auto-scrolling
            will occur when focus is set.
        @returns void */
    focus: function(noScroll) {
        if (this.isFocusable()) this.getInnerDomElement().focus({preventScroll:noScroll});
    },
    
    /** Removes the focus from this view. Do not call this method directly.
        @private
        @returns void */
    blur: function() {
        this.getInnerDomElement().blur();
    },
    
    /** @private */
    __doFocus: function(event) {
        if (!this.focused) {
            this.setFocused(true);
            this.doFocus();
        }
    },
    
    /** @private */
    __doBlur: function(event) {
        if (this.focused) {
            this.doBlur();
            this.setFocused(false);
        }
    },
    
    doFocus: function() {
        if (this.focusEmbellishment) {
            this.showFocusEmbellishment();
        } else {
            this.hideFocusEmbellishment();
        }
    },
    
    doBlur: function() {
        if (this.focusEmbellishment) this.hideFocusEmbellishment();
    },
    
    showFocusEmbellishment: function() {
        // IE
        this.getInnerDomElement().hideFocus = false;
        
        // Mozilla and Webkit
        var s = this.getInnerDomStyle();
        s.outlineWidth = 'thin';
        s.outlineColor = '#88bbff';
        s.outlineStyle = 'solid';
        s.outlineOffset = '0px';
    },
    
    hideFocusEmbellishment: function() {
        this.hideDefaultFocusEmbellishment();
    },
    
    /** Hides the browser's default focus embellishment. */
    hideDefaultFocusEmbellishment: function() {
        // IE
        this.getInnerDomElement().hideFocus = true;
        
        // Mozilla and Webkit
        this.getInnerDomStyle().outlineStyle = 'none';
    },
    
    /** @overrides myt.DomObservable */
    createDomMethodRef: function(domObserver, methodName, type) {
        if (myt.FocusObservable.EVENT_TYPES[type]) {
            var self = this;
            return function(domEvent) {
                if (!domEvent) var domEvent = window.event;
                
                // OPTIMIZATION: prevent extra focus events under special 
                // circumstances. See myt.VariableLayout for more detail.
                if (self._ignoreFocus) {
                    domEvent.cancelBubble = true;
                    if (domEvent.stopPropagation) domEvent.stopPropagation();
                    domEvent.preventDefault();
                    return;
                }
                
                // Configure common focus event.
                var event = myt.FocusObservable.EVENT;
                event.source = self;
                event.type = domEvent.type;
                event.value = domEvent;
                
                var allowBubble = domObserver[methodName](event);
                if (!allowBubble) {
                    domEvent.cancelBubble = true;
                    if (domEvent.stopPropagation) domEvent.stopPropagation();
                }
                
                event.source = undefined;
            };
        }
        
        return this.callSuper(domObserver, methodName, type);
    }
});


/** Generates Scroll Events and passes them on to one or more event observers.
    Requires myt.DomObservable as a super mixin. */
myt.ScrollObservable = new JS.Module('ScrollObservable', {
    // Class Methods and Attributes ////////////////////////////////////////////
    extend: {
        /** A map of supported scroll event types. */
        EVENT_TYPES:{
            scroll:true
        },
        
        /** The common scroll event that gets reused. */
        EVENT:{source:null, type:null, value:null},
        
        /** Gets the scrollLeft and scrollTop from the event.
            @param event:event
            @returns object with an x and y key each containing a number. */
        getScrollFromEvent: function(event) {
            var domEvent = event.value,
                target = domEvent.target || domEvent.srcElement;
            return {x: target.scrollLeft, y: target.scrollTop};
        }
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** @overrides myt.DomObservable */
    createDomMethodRef: function(domObserver, methodName, type) {
        return this.createStandardDomMethodRef(domObserver, methodName, type, myt.ScrollObservable) || 
            this.callSuper(domObserver, methodName, type);
    }
});


/** A Node that can be viewed. Instances of view are typically backed by
    an absolutely positioned div element.
    
    Events:
        domClass:string Fired when the domClass setter is called.
        domId:string Fired when the domId setter is called.
        align:string
        alignOffset:number
        valign:string
        valignOffset:number
        x:number
        y:number
        width:number (supressable)
        height:number (supressable)
        boundsWidth:number Fired when the bounds width of the view changes.
        boundsHeight:number Fired when the bounds height of the view changes.
        textColor:string
        bgColor:string
        opacity:number
        overflow:string
        visible:boolean
        cursor:string
        subviewAdded:myt.View Fired when a subview is added to this view.
        subviewRemoved:myt.View Fired when a subview is removed from this view.
        layoutAdded:myt.Layout Fired when a layout is added to this view.
        layoutRemoved:myt.Layout Fired when a layout is removed from this view.
    
    Attributes:
        tagName:string Determines the name of the DOM element to create for
            this instance. This is not a normal attribute. It is only used
            during initialization and it will be deleted from the attrs object
            upon use. If no tagName is provided "div" will be used.
        focusTrap:boolean Determines if focus traversal can move above this view
            or not. The default is undefined which is equivalent to false. Can 
            be ignored using a key modifier. The key modifier is 
            typically 'option'.
        focusCage:boolean Determines if focus traversal can move above this view
            or not. The default is undefined which is equivalent to false. This
            is the same as focusTrap except it can't be ignored using a 
            key modifier.
        maskFocus:boolean Prevents focus from traversing into this view or any
            of its subviews. The default is undefined which is equivalent 
            to false.
        ignoreLayout:boolean Determines if this view should be included in 
            layouts or not. Default is undefined which is equivalent to false.
        layoutHint:* A value that indicates this view is treated as "special" 
            by the layout. The interpretation of this value is up to the 
            layout managing the view.
        align:string Aligns the view horizontally within its parent. 
            Supported values are: 'left', 'center', 'right' and ''. 
            The default is undefined which is equivalent to ''.
        alignOffset:number A pixel offset to use when aligning a view.
        valign:string Aligns the view vertically within its parent. 
            Supported values are: 'top', 'middle', 'bottom' and ''. 
            The default is undefined which is equivalent to ''.
        valignOffset:number A pixel offset to use when valigning a view.
        x:number The x-position of this view in pixels. Defaults to 0.
        y:number The y-position of this view in pixels. Defaults to 0.
        width:number The width of this view in pixels. Defaults to 0.
        height:number the height of this view in pixels. Defaults to 0.
        boundsWidth:number (read only) The actual bounds of the view in the
            x-dimension. This value is in pixels relative to the RootView and
            thus compensates for rotation and scaling.
        boundsHeight:number (read only) The actual bounds of the view in the
            y-dimension. This value is in pixels relative to the RootView and
            thus compensates for rotation and scaling.
        textColor:string The color used for text. Will be inherited by 
            descendant views if they don't themselves set textColor or if 
            they set textColor to 'inherit'. Defaults to undefined which is
            equivalent to 'inherit'.
        bgColor:string The background color of this view. Use a value of 
            'transparent' to make this view transparent. Defaults 
            to 'transparent'.
        opacity:number The opacity of this view. The value should be a number 
            between 0 and 1. Defaults to 1.
        overflow:string Determines how descendant content overflows the bounds.
            Allowed values: 'visible', 'hidden', 'scroll', 'auto', 'autoy',
            'autox' and 'inherit'. Defaults to undefined which is equivalent 
            to 'visible'.
        visible:boolean Makes this view visible or not. The default value is 
            true which means visbility is inherited from the parent view.
        cursor:string Determines what cursor to show when moused over the view.
            Allowed values: 'auto', 'move', 'no-drop', 'col-resize', 
            'all-scroll', 'pointer', 'not-allowed', 'row-resize', 'crosshair', 
            'progress', 'e-resize', 'ne-resize', 'default', 'text', 'n-resize', 
            'nw-resize', 'help', 'vertical-text', 's-resize', 'se-resize', 
            'inherit', 'wait', 'w-resize', 'sw-resize'. Defaults to undefined 
            which is equivalent to 'auto'.
        pointerEvents:string Determines if this view responds to pointer events
            or not. Supported values: 'none', 'auto' and 'inherit'. Defaults 
            to undefined which is equivalent to 'auto'.
        outlineWidth:number The width of the CSS outline. If a value equivalent
            to false is provided 0 will be used.
        outlineStyle:string The CSS outline style. If null or undefined is 
            provided 'none' will be used. Supported values: 'none', 'dotted', 
            'dashed', 'solid', 'double', 'groove', 'ridge', 'inset', 
            'outset', 'inherit'.
        outlineColor:string Sets the color of the CSS outline. If null or 
            undefined is provided '#000000' will be used.
        borderWidth:number The width of the CSS border. If a value equivalent 
            to false is provided 0 will be used.
        borderStyle:string The CSS border style. If null or undefined is 
            provided 'none' will be used. Supported values: 'none', 'dotted', 
            'dashed', 'solid', 'double', 'groove', 'ridge', 'inset', 
            'outset', 'inherit'.
        borderColor:string Sets the color of the CSS border. If null or 
            undefined is provided '#000000' will be used.
        tooltip:string Sets a tooltip for this view. The basic implementation
            uses domElement.title. For a richer tooltip display use the
            myt.TooltipMixin.
    
    Private Attributes:
        subviews:array The array of child myt.Views for this view. Should 
            be accessed through the getSubviews method.
        layouts:array The array of child myt.Layouts for this view. Should
            be accessed through the getLayouts method.
*/
myt.View = new JS.Class('View', myt.Node, {
    include: [
        myt.DomElementProxy, 
        myt.DomObservable, 
        myt.DomObserver, 
        myt.ScrollObservable, 
        myt.FocusObservable, 
        myt.KeyObservable, 
        myt.MouseObservable
    ],
    
    
    // Class Methods and Attributes ////////////////////////////////////////////
    extend: {
        /** Preserves focus and scroll position during dom updates. Focus can 
            get lost in webkit when an element is removed from the dom.
            viewBeingRemoved:myt.View
            wrapperFunc:function a function to execute that manipulates the
                dom in some way, typically a remove followed by an insert.
            @returns void */
        retainFocusDuringDomUpdate: function(viewBeingRemoved, wrappedFunc) {
            var restoreFocus = myt.global.focus.focusedView, 
                elem = viewBeingRemoved.getInnerDomElement(), 
                restoreScrollTop, 
                restoreScrollLeft;
            if (restoreFocus === viewBeingRemoved || (restoreFocus && restoreFocus.isDescendantOf(viewBeingRemoved))) {
                restoreFocus._ignoreFocus = true;
            }
            
            // Also maintain scrollTop/scrollLeft since those also
            // get reset when a dom element is removed. Note: descendant
            // elements with scroll positions won't get maintained.
            restoreScrollTop = elem.scrollTop;
            restoreScrollLeft = elem.scrollLeft;
            
            wrappedFunc.call();
            
            if (restoreFocus) {
                restoreFocus._ignoreFocus = false;
                restoreFocus.focus(true);
            }
            
            // Restore scrollTop/scrollLeft
            elem.scrollTop = restoreScrollTop;
            elem.scrollLeft = restoreScrollLeft;
        }
    },
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides myt.Node */
    initNode: function(parent, attrs) {
        var self = this;
        
        self.x = self.y = self.width = self.height = 0;
        self.opacity = 1;
        self.visible = true;
        
        self.tagName = attrs.tagName;
        if (self.tagName) delete attrs.tagName;
        self.setDomElement(self.createOurDomElement(parent));
        
        // Necessary since x and y of 0 won't update deStyle so this gets
        // things initialized correctly. Without this RootViews will have
        // an incorrect initial position for x or y of 0.
        var s = self.getOuterDomStyle();
        s.left = s.top = '0px';
        
        self.callSuper(parent, attrs);
        
        // Set default bgcolor afterwards if still undefined. This allows 
        // BaseInputText to override the default for input:text via attrs.
        if (self.bgColor === undefined) self.bgColor = 'transparent';
    },
    
    /** Creates the dom element we will be a proxy for. Called during View
        initialization. Gives subclasses a change to change how the view is
        backed. This implementation also looks for a this.tagName property
        which it will use as the name for the dom element that gets created.
        If no this.tagName property is found "div" will be used.
        @param parent:dom element The dom element that will be the parent
            of the newly created dom element.
        @returns a dom element */
    createOurDomElement: function(parent) {
        var elem = document.createElement(this.tagName || 'div');
        elem.style.position = 'absolute';
        
        // Make dom elements easier to location via selectors
        var klass = this.klass;
        elem.className = klass.__cssClassName || (klass.__cssClassName = 'myt-' + klass.__displayName.split('.').join('-'));
        
        return elem;
    },
    
    /** @overrides myt.Node 
        Subclasses should call super if they don't call __updateBounds. The call
        to super should probably occur at the end of the overridden method. */
    doAfterAdoption: function() {
        // Must be done after domElement is inserted so that calls to
        // getBoundingClientRect will work.
        this.__updateBounds(this.width, this.height);
    },
    
    /** @overrides myt.Node */
    destroyAfterOrphaning: function() {
        var self = this;
        
        self.callSuper();
        
        self.detachFromAllDomSources();
        self.detachAllDomObservers();
        self.disposeOfDomElement();
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    /** @overrides myt.Node */
    setParent: function(parent) {
        var self = this;
        
        if (self.parent !== parent) {
            if (self.inited) {
                self.__teardownAlignConstraint();
                self.__teardownValignConstraint();
            }
            self.callSuper(parent);
            if (self.align) self.__setupAlignConstraint();
            if (self.valign) self.__setupValignConstraint();
        }
    },
    
    /** Does lazy instantiation of the subviews array. */
    getSubviews: function() {
        return this.subviews || (this.subviews = []);
    },
    
    /** Gets the views that are our siblings.
        @returns array of myt.View or undefined if this view is orphaned. */
    getSiblingViews: function() {
        if (this.parent) {
            // Get a copy of the subviews since we will modify it and do not
            // want to modify the original array.
            var svs = this.parent.getSubviews().concat(),
                i = svs.length;
            
            // Remove ourselves from the subviews since we only want siblings.
            while (i) {
                if (svs[--i] === this) {
                    svs.splice(i, 1);
                    break;
                }
            }
            
            return svs;
        }
    },
    
    // Focus Attributes //
    setFocusTrap: function(v) {this.focusTrap = v;},
    setFocusCage: function(v) {this.focusCage = v;},
    setMaskFocus: function(v) {this.maskFocus = v;},
    
    // Layout Attributes //
    setLayoutHint: function(v) {this.layoutHint = v;},
    
    /** Does lazy instantiation of the layouts array. */
    getLayouts: function() {
        return this.layouts || (this.layouts = []);
    },
    
    setIgnoreLayout: function(v) {
        var self = this;
        
        if (self.ignoreLayout !== v) {
            // Add or remove ourselves from any layouts on our parent.
            var ready = self.inited && self.parent, layouts, i;
            if (v) {
                if (ready) {
                    layouts = self.parent.getLayouts();
                    i = layouts.length;
                    while (i) layouts[--i].removeSubview(self);
                }
                self.ignoreLayout = v;
            } else {
                self.ignoreLayout = v;
                if (ready) {
                    layouts = self.parent.getLayouts();
                    i = layouts.length;
                    while (i) layouts[--i].addSubview(self);
                }
            }
        }
    },
    
    // Dom Selector Attributes //
    /** @overrides myt.DomElementProxy */
    setDomClass: function(v) {
        if (this.domClass !== v) {
            this.callSuper(v);
            if (this.inited) this.fireEvent('domClass', v);
        }
    },
    
    /** @overrides myt.DomElementProxy */
    setDomId: function(v) {
        if (this.domId !== v) {
            this.callSuper(v);
            if (this.inited) this.fireEvent('domId', v);
        }
    },
    
    // Alignment Attributes //
    setAlignOffset: function(v) {
        if (this.alignOffset !== v) {
            this.alignOffset = v;
            if (this.inited) this.fireEvent('alignOffset', v);
            if (this.parent && this.align === 'left') this.setX(v);
        }
    },
    
    setAlign: function(v) {
        if (this.align !== v) {
            if (this.inited) this.__teardownAlignConstraint();
            this.align = v;
            if (this.inited) {
                this.fireEvent('align', v);
                this.__setupAlignConstraint();
            }
        }
    },
    
    /** @private */
    __teardownAlignConstraint: function() {
        switch (this.align) {
            case 'center': this.releaseConstraint('__doAlignCenter'); break;
            case 'right': this.releaseConstraint('__doAlignRight'); break;
            case 'left':
            default: // Do nothing
        }
    },
    
    /** @private */
    __setupAlignConstraint: function() {
        var parent = this.parent;
        if (parent) {
            switch (this.align) {
                case 'center':
                    this.applyConstraint('__doAlignCenter', [this, 'width', this, 'alignOffset', parent, 'width']);
                    break;
                case 'right':
                    this.applyConstraint('__doAlignRight', [this, 'width', this, 'alignOffset', parent, 'width']);
                    break;
                case 'left':
                    this.setX(this.alignOffset || 0);
                    break;
                default: // Do nothing
            }
        }
    },
    
    /** @private */
    __doAlignCenter: function(event) {
        this.setX(Math.round((this.parent.width - this.width) / 2) + (this.alignOffset || 0));
    },
    
    /** @private */
    __doAlignRight: function(event) {
        this.setX(this.parent.width - this.width - (this.alignOffset || 0));
    },
    
    setValignOffset: function(v) {
        if (this.valignOffset !== v) {
            this.valignOffset = v;
            if (this.inited) this.fireEvent('valignOffset', v);
            if (this.parent && this.valign === 'top') this.setY(v);
        }
    },
    
    setValign: function(v) {
        if (this.valign !== v) {
            if (this.inited) this.__teardownValignConstraint();
            this.valign = v;
            if (this.inited) {
                this.fireEvent('valign', v);
                this.__setupValignConstraint();
            }
        }
    },
    
    /** @private */
    __teardownValignConstraint: function() {
        switch (this.valign) {
            case 'middle': this.releaseConstraint('__doValignMiddle'); break;
            case 'bottom': this.releaseConstraint('__doValignBottom'); break;
            case 'top':
            default: // Do nothing
        }
    },
    
    /** @private */
    __setupValignConstraint: function() {
        var parent = this.parent;
        if (parent) {
            switch (this.valign) {
                case 'middle':
                    this.applyConstraint('__doValignMiddle', [this, 'height', this, 'valignOffset', parent, 'height']);
                    break;
                case 'bottom':
                    this.applyConstraint('__doValignBottom', [this, 'height', this, 'valignOffset', parent, 'height']);
                    break;
                case 'top':
                    this.setY(this.valignOffset || 0);
                    break;
                default: // Do nothing
            }
        }
    },
    
    /** @private */
    __doValignMiddle: function(event) {
        this.setY(Math.round((this.parent.height - this.height) / 2) + (this.valignOffset || 0));
    },
    
    /** @private */
    __doValignBottom: function(event) {
        this.setY(this.parent.height - this.height - (this.valignOffset || 0));
    },
    
    // Visual Attributes //
    setX: function(v) {
        if (this.x !== v) {
            this.x = v;
            if (this.visible) this.getOuterDomStyle().left = v + 'px';
            if (this.inited) this.fireEvent('x', v);
        }
    },
    
    setY: function(v) {
        if (this.y !== v) {
            this.y = v;
            if (this.visible) this.getOuterDomStyle().top = v + 'px';
            if (this.inited) this.fireEvent('y', v);
        }
    },
    
    setWidth: function(v, supressEvent) {
        // Dom elements don't support negative width
        if (0 > v) v = 0;
        
        if (this.width !== v) {
            this.width = v;
            this.getOuterDomStyle().width = v + 'px';
            if (this.inited) {
                this.__updateBounds(v, this.height);
                if (!supressEvent) this.fireEvent('width', v);
            }
        }
    },
    
    setHeight: function(v, supressEvent) {
        // Dom elements don't support negative height
        if (0 > v) v = 0;
        
        if (this.height !== v) {
            this.height = v;
            this.getOuterDomStyle().height = v + 'px';
            if (this.inited) {
                this.__updateBounds(this.width, v);
                if (!supressEvent) this.fireEvent('height', v);
            }
        }
    },
    
    setTextColor: function(v) {
        if (this.textColor !== v) {
            this.textColor = v;
            this.getOuterDomStyle().color = v || 'inherit';
            if (this.inited) this.fireEvent('textColor', v);
        }
    },
    
    setBgColor: function(v) {
        if (this.bgColor !== v) {
            this.getOuterDomStyle().backgroundColor = this.bgColor = v;
            if (this.inited) this.fireEvent('bgColor', v);
        }
    },
    
    setOpacity: function(v) {
        if (this.opacity !== v) {
            this.getOuterDomStyle().opacity = this.opacity = v;
            if (this.inited) this.fireEvent('opacity', v);
        }
    },
    
    setOverflow: function(v) {
        var existing = this.overflow;
        if (existing !== v) {
            this.overflow = v;
            
            var s = this.getInnerDomStyle();
            if (v === 'autox') {
                s.overflowX = 'auto';
                s.overflowY = 'hidden';
            } else if (v === 'autoy') {
                s.overflowY = 'auto';
                s.overflowX = 'hidden';
            } else {
                if (existing === 'autox' || existing === 'autoy') s.overflowX = s.overflowY = null;
                s.overflow = v || 'visible';
            }
            
            if (this.inited) this.fireEvent('overflow', v);
        }
    },
    
    setVisible: function(v) {
        var self = this;
        if (self.visible !== v) {
            self.visible = v;
            
            var s = self.getOuterDomStyle();
            s.visibility = v ? 'inherit' : 'hidden';
            
            // Move invisible elements to a very negative location so they won't
            // effect scrollable area. Ideally we could use display:none but we
            // can't because that makes measuring bounds not work.
            s.left = v ? self.x + 'px' : '-100000px';
            s.top = v ? self.y + 'px' : '-100000px';
            
            if (self.inited) self.fireEvent('visible', v);
        }
    },
    
    setPointerEvents: function(v) {
        if (this.pointerEvents !== v) {
            this.pointerEvents = v;
            this.getOuterDomStyle().pointerEvents = v || 'auto';
            if (this.inited) this.fireEvent('pointerEvents', v);
        }
    },
    
    setCursor: function(v) {
        if (this.cursor !== v) {
            this.cursor = v;
            this.getOuterDomStyle().cursor = v || 'auto';
            if (this.inited) this.fireEvent('cursor', v);
        }
    },
    
    /** Updates the boundsWidth and boundsHeight attributes.
        @private
        @param w:number the boundsWidth to set.
        @param h:number the boundsHeight to set.
        @returns void */
    __updateBounds: function(w, h) {
        if (this.boundsWidth !== w) {
            this.boundsWidth = w;
            this.fireEvent('boundsWidth', w);
        }
        
        if (this.boundsHeight !== h) {
            this.boundsHeight = h;
            this.fireEvent('boundsHeight', h);
        }
    },
    
    // Outlines
    /** Sets outlineWidth, outlineStyle and outlineColor via a single 
        array. If a value equivalent to false is provided the outline 
        will be supressed.
        @param v:array where index 0 is outlineWidth, index 1 is outline 
            style and index 2 is outlineColor.
        @returns void */
    setOutline: function(v) {
        v = v || [];
        this.setOutlineWidth(v[0]);
        this.setOutlineStyle(v[1]);
        this.setOutlineColor(v[2]);
    },
    
    setOutlineWidth: function(v) {
        this.outlineWidth = v || 0;
        this.getOuterDomStyle().outlineWidth = this.outlineWidth + 'px';
    },
    
    setOutlineStyle: function(v) {
        this.getOuterDomStyle().outlineStyle = this.outlineStyle = v || 'none';
    },
    
    setOutlineColor: function(v) {
        this.getOuterDomStyle().outlineColor = this.outlineColor = v || '#000000';
    },
    
    // Borders
    /** Sets borderWidth, borderStyle and borderColor via a single 
        array. If a value equivalent to false is provided the border 
        will be supressed.
        @param v:array where index 0 is borderWidth, index 1 is border 
            style and index 2 is borderColor.
        @returns void */
    setBorder: function(v) {
        v = v || [];
        this.setBorderWidth(v[0]);
        this.setBorderStyle(v[1]);
        this.setBorderColor(v[2]);
    },
    
    setBorderWidth: function(v) {
        this.borderWidth = v || 0;
        this.getOuterDomStyle().borderWidth = this.borderWidth + 'px';
    },
    
    setBorderStyle: function(v) {
        this.getOuterDomStyle().borderStyle = this.borderStyle = v || 'none';
    },
    
    setBorderColor: function(v) {
        this.getOuterDomStyle().borderColor = this.borderColor = v || '#000000';
    },
    
    // Edge treatements
    /** A convienence method to set rounded corners on an element.
        @param radius:number the radius of the corners.
        @returns void */
    setRoundedCorners: function(radius) {
        this.getOuterDomStyle().borderRadius = radius + 'px';
    },
    
    /** A convienence method to round the top left corner.
        @param radius:number the radius of the corner.
        @returns void */
    setRoundedTopLeftCorner: function(radius) {
        this.setRoundedCorner(radius, 'TopLeft');
    },
    
    /** A convienence method to round the top right corner.
        @param radius:number the radius of the corner.
        @returns void */
    setRoundedTopRightCorner: function(radius) {
        this.setRoundedCorner(radius, 'TopRight');
    },
    
    /** A convienence method to round the bottom left corner.
        @param radius:number the radius of the corner.
        @returns void */
    setRoundedBottomLeftCorner: function(radius) {
        this.setRoundedCorner(radius, 'BottomLeft');
    },
    
    /** A convienence method to round the bottom right corner.
        @param radius:number the radius of the corner.
        @returns void */
    setRoundedBottomRightCorner: function(radius) {
        this.setRoundedCorner(radius, 'BottomRight');
    },
    
    /** A convienence method to set a single rounded corner on an element.
        @param radius:number the radius of the corner.
        @param corner:string One of 'TopLeft', 'TopRight', 'BottomLeft' or
            'BottomRight'.
        @returns void */
    setRoundedCorner: function(radius, corner) {
        this.getOuterDomStyle()['border' + corner + 'Radius'] = radius + 'px';
    },
    
    /** Sets the CSS boxShadow property.
        @param v:array where index 0 is the horizontal shadow offset,
            index 1 is the vertical shadow offset, index 2 is the blur amount,
            and index 3 is the color.
        @returns void */
    setBoxShadow: function(v) {
        if (v) {
            var hShadow = v[0] || 0,
                vShadow = v[1] || 0,
                blur = v[2] || 7,
                color = v[3] || '#000000';
            v = hShadow + 'px ' + vShadow + 'px ' + blur + 'px ' + color;
        } else {
            v = 'none';
        }
        this.getOuterDomStyle().boxShadow = v;
    },
    
    /** Sets the CSS liner-gradient or radial-gradient property. Setting this
        property will take the place of any bgColor used in the view.
        @param v:array where:
            index 0: is the gradient type: linear or radial
            index 1: is the geometry of the gradient.
                radial: The value "cover" / "farthest-corner" or 
                    "contain" / "closest-side"
                linear: A number will be interpreted as the degrees or a
                    string must be one of: top, top right, right, bottom right,
                        bottom, bottom left, left, top left
            index 3+: Are the color stops which must be a valid CSS color. If
                the first and second color stops will default to the textColor
                and bgColor properties of this view if not provided. Use of the
                rgba(0-255,0-255,0-255,0-1) syntax is a good way to designate 
                colors since it will let you use an opacity. For a more 
                comprehensive description of how to specify color stops see: 
                https://developer.mozilla.org/en-US/docs/Web/CSS/linear-gradient
        @returns void */
    setGradient: function(v) {
        var self = this,
            ods = self.getOuterDomStyle();
        if (v) {
            // Determine type
            var type = v[0];
            if (type === 'linear' || type === 'radial') {
                v.shift();
            } else {
                type = 'linear';
            }
            
            // Determine geometry of the gradient
            var geometry = v[0];
            if (type === 'radial') {
                if (geometry !== undefined) {
                    if (geometry === 'cover' || geometry === 'farthest-corner') {
                        geometry = 'farthest-corner';
                    } else {
                        geometry = 'closest-side';
                    }
                    v.shift();
                } else {
                    geometry = 'closest-side';
                }
                geometry = 'circle ' + geometry;
            } else {
                if (typeof geometry === 'number') {
                    geometry = geometry + 'deg';
                    v.shift();
                } else if (geometry) {
                    geometry = 'to ' + geometry;
                    v.shift();
                } else {
                    geometry = '0deg';
                }
            }
            
            // Use colors that may have already been configured if less
            // than 2 color stops are provided
            function pushColor(color) {
                v.push(color && color !== 'inherit' ? color : 'transparent');
            };
            if (v.length < 2) pushColor(self.textColor);
            if (v.length < 2) pushColor(self.bgColor);
            
            ods.background = type + '-gradient(' + geometry + ',' + v.join(',') + ')';
        } else {
            ods.background = 'none';
        }
        
        // Wipe the bgColor property since setting style.background replaces 
        // the bgColor.
        self.bgColor = undefined;
    },
    
    /** Sets the tooltip.
        @param v:string
        @return void */
    setTooltip: function(v) {
        if (this.tooltip !== v) {
            this.tooltip = this.getOuterDomElement().title = v;
            if (this.inited) this.fireEvent('tooltip', v);
        }
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** Checks if this view is visible and each view in the parent chain to
        the RootView is also visible. Dom elements are not explicitly
        checked. If you need to check that use myt.DomElementProxy.isDomElementVisible.
        @returns true if this view is visible, false otherwise. */
    isVisible: function() {
        return this.searchAncestorsOrSelf((v) => !v.visible) === null;
    },
    
    /** Finds the youngest ancestor (or self) that is a focusTrap or focusCage.
        @param ignoreFocusTrap:boolean indicates focusTraps should be
            ignored.
        @returns a View with focusTrap set to true or null if not found. */
    getFocusTrap: function(ignoreFocusTrap) {
        return this.searchAncestorsOrSelf((v) => v.focusCage || (v.focusTrap && !ignoreFocusTrap));
    },
    
    /** @overrides myt.Node
        Calls this.subviewAdded if the added subnode is a myt.View. 
        @fires subviewAdded event with the provided Node if it's a View. 
        @fires layoutAdded event with the provided node if it's a Layout. */
    subnodeAdded: function(node) {
        if (node instanceof myt.View) {
            this.getInnerDomElement().appendChild(node.getOuterDomElement());
            this.getSubviews().push(node);
            this.fireEvent('subviewAdded', node);
            this.subviewAdded(node);
        } else if (node instanceof myt.Layout) {
            this.getLayouts().push(node);
            this.fireEvent('layoutAdded', node);
            this.layoutAdded(node);
        }
    },
    
    /** @overrides myt.Node
        Calls this.subviewRemoved if the remove subnode is a myt.View.
        @fires subviewRemoved event with the provided Node if it's a View
            and removal succeeds. 
        @fires layoutRemoved event with the provided Node if it's a Layout
            and removal succeeds. */
    subnodeRemoved: function(node) {
        var idx;
        if (node instanceof myt.View) {
            idx = this.getSubviewIndex(node);
            if (idx !== -1) {
                this.fireEvent('subviewRemoved', node);
                node.removeDomElement();
                this.subviews.splice(idx, 1);
                this.subviewRemoved(node);
            }
        } else if (node instanceof myt.Layout) {
            idx = this.getLayoutIndex(node);
            if (idx !== -1) {
                this.fireEvent('layoutRemoved', node);
                this.layouts.splice(idx, 1);
                this.layoutRemoved(node);
            }
        }
    },
    
    // Subviews //
    /** Checks if this View has the provided View in the subviews array.
        @param sv:View the view to look for.
        @returns true if the subview is found, false otherwise. */
    hasSubview: function(sv) {
        return this.getSubviewIndex(sv) !== -1;
    },
    
    /** Gets the index of the provided View in the subviews array.
        @param sv:View the view to look for.
        @returns the index of the subview or -1 if not found. */
    getSubviewIndex: function(sv) {
        return this.getSubviews().indexOf(sv);
    },
    
    /** Called when a View is added to this View. Do not call this method to 
        add a View. Instead call addSubnode or setParent.
        @param sv:View the view that was added.
        @returns void */
    subviewAdded: function(sv) {},
    
    /** Called when a View is removed from this View. Do not call this method 
        to remove a View. Instead call removeSubnode or setParent.
        @param sv:View the view that was removed.
        @returns void */
    subviewRemoved: function(sv) {},
    
    /** Gets the next sibling view based on lexical ordering of dom elements.
        @returns myt.View: The next sibling view or null if none exists. */
    getNextSibling: function() {
        if (this.parent) {
            var nextDomElement = this.getOuterDomElement().nextElementSibling;
            if (nextDomElement) return nextDomElement.model;
        }
        return null;
    },
    
    /** Gets the previous sibling view.
        @returns myt.View: The previous sibling view or null if none exists. */
    getPrevSibling: function() {
        if (this.parent) {
            var prevDomElement = this.getOuterDomElement().previousElementSibling;
            if (prevDomElement) return prevDomElement.model;
        }
        return null;
    },
    
    // Layouts //
    /** Checks if this View has the provided Layout in the layouts array.
        @param layout:Layout the layout to look for.
        @returns true if the layout is found, false otherwise. */
    hasLayout: function(layout) {
        return this.getLayoutIndex(layout) !== -1;
    },
    
    /** Gets the index of the provided Layout in the layouts array.
        @param layout:Layout the layout to look for.
        @returns the index of the layout or -1 if not found. */
    getLayoutIndex: function(layout) {
        return this.getLayouts().indexOf(layout);
    },
    
    /** Called when a Layout is added to this View. Do not call this method to 
        add a Layout. Instead call addSubnode or setParent.
        @param layout:Layout the layout that was added.
        @returns void */
    layoutAdded: function(layout) {},
    
    /** Called when a Layout is removed from this View. Do not call this 
        method to remove a Layout. Instead call removeSubnode or setParent.
        @param layout:Layout the layout that was removed.
        @returns void */
    layoutRemoved: function(layout) {},
    
    // Dom-Ordering //
    /** Test if the provided view is behind this view. The view to test can
        be anywhere in the document.
        @param view:myt.View the view to check.
        @param checkZIndex:boolean (optional) If true z-index will first be
            used to check if the view is behind or not.
        @returns boolean: true if the view is behind this view, 
            false otherwise. */
    isBehind: function(view, checkZIndex) {
        return this.__comparePosition(view, false, checkZIndex);
    },
    
    /** Test if the provided view is front of this view. The view to test can
        be anywhere in the document.
        @param view:myt.View the view to check.
        @param checkZIndex:boolean (optional) If true z-index will first be
            used to check if the view is in front or not.
        @returns boolean: true if the view is in front of this view, 
            false otherwise. */
    isInFrontOf: function(view, checkZIndex) {
        return this.__comparePosition(view, true, checkZIndex);
    },
    
    /** Implements isBehind and isInFrontOf methods.
        @private
        @param front:boolean indicates if this is the isInFrontOf test or not.
        @returns boolean */
    __comparePosition: function(view, front, checkZIndex) {
        if (view && typeof view === 'object') {
            if (checkZIndex) {
                var commonAncestor = this.getLeastCommonAncestor(view);
                if (commonAncestor) {
                    var commonAncestorElem = commonAncestor.getInnerDomElement(),
                        DEP = myt.DomElementProxy,
                        zIdx = DEP.getZIndexRelativeToAncestor(this.getOuterDomElement(), commonAncestorElem),
                        otherZIdx = DEP.getZIndexRelativeToAncestor(view.getOuterDomElement(), commonAncestorElem);
                    
                    // Reverse comparison order
                    if (front) {
                        zIdx *= -1;
                        otherZIdx *= -1;
                    }
                    
                    if (zIdx < otherZIdx) {
                        return true;
                    } else if (otherZIdx < zIdx) {
                        return false;
                    }
                    // Fall through to dom comparison since z-indices are equal.
                }
            }
            
            // DOCUMENT_POSITION_DISCONNECTED 1
            // DOCUMENT_POSITION_PRECEDING 2
            // DOCUMENT_POSITION_FOLLOWING 4
            // DOCUMENT_POSITION_CONTAINS 8
            // DOCUMENT_POSITION_CONTAINED_BY 16
            // DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC 32
            var rel = this.getOuterDomElement().compareDocumentPosition(view.getOuterDomElement());
            return front ? rel === 2 || rel === 10 : rel === 4 || rel === 20;
        } else {
            return false;
        }
    },
    
    /** Brings this view to the front. */
    bringToFront: function() {
        this.parent.bringSubviewToFront(this);
    },
    
    /** Sends this view to the back. */
    sendToBack: function() {
        this.parent.sendSubviewToBack(this);
    },
    
    /** Sends this view behind the provided sibling view. */
    sendBehind: function(sv) {
        this.parent.sendSubviewBehind(this, sv);
    },
    
    /** Sends this view in front of the provided sibling view. */
    sendInFrontOf: function(sv) {
        this.parent.sendSubviewInFrontOf(this, sv);
    },
    
    /** Sends the provided subview to the back.
        @param sv:View the subview of this view to bring to front.
        @returns void */
    bringSubviewToFront: function(sv) {
        if (sv && sv.parent === this) {
            var innerElem = this.getInnerDomElement();
            if (sv.getOuterDomElement() !== innerElem.lastChild) {
                myt.View.retainFocusDuringDomUpdate(sv, () => {
                    innerElem.appendChild(sv.getOuterDomElement());
                });
            }
        }
    },
    
    /** Sends the provided subview to the back.
        @param sv:View the subview of this view to send to back.
        @returns void */
    sendSubviewToBack: function(sv) {
        if (sv && sv.parent === this) {
            var innerElem = this.getInnerDomElement();
            if (sv.getOuterDomElement() !== innerElem.firstChild) {
                myt.View.retainFocusDuringDomUpdate(sv, () => {
                    innerElem.insertBefore(sv.getOuterDomElement(), innerElem.firstChild);
                });
            }
        }
    },
    
    /** Sends the subview behind the existing subview.
        @param sv:View the subview to send behind the existing view.
        @param existing:View the subview to send the other subview behind.
        @returns void */
    sendSubviewBehind: function(sv, existing) {
        if (sv && existing && sv.parent === this && existing.parent === this) {
            var innerElem = this.getInnerDomElement();
            myt.View.retainFocusDuringDomUpdate(sv, () => {
                innerElem.insertBefore(sv.getOuterDomElement(), existing.getOuterDomElement());
            });
        }
    },
    
    /** Sends the subview in front of the existing subview.
        @param sv:View the subview to send in front of the existing view.
        @param existing:View the subview to send the other subview in front of.
        @returns void */
    sendSubviewInFrontOf: function(sv, existing) {
        if (sv && existing && sv.parent === this && existing.parent === this) {
            this.sendSubviewBehind(sv, existing);
            this.sendSubviewBehind(existing, sv);
        }
    },
    
    /** Sorts the subviews array according to the provided sort function.
        Also rearranges the dom elements so that focus navigation and z
        ordering get updated.
        @param sortFunc:function the sort function to sort the subviews with.
        @returns void */
    sortSubviews: function(sortFunc) {
        // Sort subviews
        var self = this,
            svs = self.getSubviews();
        svs.sort(sortFunc);
        
        // Rearrange dom to match new sort order.
        myt.View.retainFocusDuringDomUpdate(self, () => {
            var len = svs.length,
                i = 0,
                outerElem = self.getOuterDomElement(),
                innerElem = self.getInnerDomElement(),
                nextDe = outerElem.nextSibling,
                parentElem = outerElem.parentNode;
            // Remove this dom element from the dom
            if (parentElem) parentElem.removeChild(outerElem);
            
            // Copy the dom elements in the correct order to a document
            // fragment and then add that fragment back to the dom.
            var fragment = document.createDocumentFragment();
            for (; len > i;) fragment.appendChild(svs[i++].getOuterDomElement());
            innerElem.appendChild(fragment);
            
            // Put this dom element back in the dom
            if (parentElem) parentElem.insertBefore(outerElem, nextDe);
        });
    },
    
    // Hit Testing //
    /** Checks if the provided location is inside this view or not.
        @param locX:number the x position to test.
        @param locY:number the y position to test.
        @param referenceFrameDomElem:dom_element (optional) The dom element
            the locX and locY are relative to. If not provided the page is
            assumed.
        @returns boolean True if the location is inside this view, false 
            if not. */
    containsPoint: function(locX, locY, referenceFrameDomElem) {
        var outerElem = this.getOuterDomElement();
        if (!outerElem) return false;
        
        var pos = myt.DomElementProxy.getPagePosition(outerElem, referenceFrameDomElem);
        return myt.Geometry.rectContainsPoint(locX, locY, pos.x, pos.y, this.width, this.height);
    },
    
    /** Checks if the provided location is visible on this view and is not
        masked by the bounding box of the view or any of its ancestor views.
        @returns boolean: true if visible, false otherwise. */
    isPointVisible: function(locX, locY) {
        var pos = this.getTruePagePosition();
        this.calculateEffectiveScale();
        return this.__isPointVisible(locX - pos.x, locY - pos.y);
    },
    
    /** @private */
    __isPointVisible: function(x, y) {
        var effectiveScale = this.__effectiveScale,
            ode = this.getOuterDomElement();
        
        if (myt.Geometry.rectContainsPoint(x, y, 0, 0, ode.offsetWidth * effectiveScale, ode.offsetHeight * effectiveScale)) {
            var p = this.parent;
            if (p) {
                var de = p.getOuterDomElement(), 
                    pScale = p.__effectiveScale;
                return p.__isPointVisible(x + (ode.offsetLeft - de.scrollLeft) * pScale, y + (ode.offsetTop - de.scrollTop) * pScale);
            }
            return true;
        }
        return false;
    },
    
    calculateEffectiveScale: function() {
        var ancestors = this.getAncestors(), i = ancestors.length, ancestor,
            effectiveScale = 1;
        while (i) {
            ancestor = ancestors[--i];
            effectiveScale *= ancestor.scaleX || 1;
            ancestor.__effectiveScale = effectiveScale;
        }
    },
    
    getEffectiveScale: function() {
        this.calculateEffectiveScale();
        return this.__effectiveScale;
    },
    
    /** Used by myt.Animator to determine if an attribute is a color attribute
        or not. */
    isColorAttr: function(attrName) {
        return attrName === 'bgColor' || attrName === 'textColor';
    }
});


/** Adds support for flex box to a myt.View.
    
    Events:
        flexDirection
        flexWrap
        justifyContent
        alignItems
        alignContent
    
    Attributes:
        flexDirection
        flexWrap
        justifyContent
        alignItems
        alignContent
*/
myt.FlexBoxSupport = new JS.Module('FlexBoxSupport', {
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides */
    initNode: function(parent, attrs) {
        this.callSuper(parent, attrs);
        this.__syncSubviews();
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    /** @overrides */
    setWidth: function(v, supressEvent) {
        this.callSuper(v, supressEvent);
        if (this.inited) this.__syncSubviews();
    },
    
    /** @overrides */
    setHeight: function(v, supressEvent) {
        this.callSuper(v, supressEvent);
        if (this.inited) this.__syncSubviews();
    },
    
    setFlexDirection: function(v) {
        if (this.flexDirection !== v) {
            this.flexDirection = v;
            
            // Alias common unexpected values when assigning to the dom
            var domValue = v;
            switch (domValue) {
                case 'rowReverse':
                    domValue = 'row-reverse';
                    break;
                case 'columnReverse':
                    domValue = 'column-reverse';
                    break;
            }
            this.getInnerDomStyle().flexDirection = domValue;
            
            if (this.inited) {
                this.fireEvent('flexDirection', v);
                this.__syncSubviews();
            }
        }
    },
    
    setFlexWrap: function(v) {
        if (this.flexWrap !== v) {
            this.flexWrap = v;
            
            // Alias common unexpected values when assigning to the dom
            var domValue = v;
            switch (domValue) {
                case 'wrapReverse':
                case 'reverse':
                    domValue = 'wrap-reverse';
                    break;
            }
            this.getInnerDomStyle().flexWrap = domValue;
            
            
            if (this.inited) {
                this.fireEvent('flexWrap', v);
                this.__syncSubviews();
            }
        }
    },
    
    setJustifyContent: function(v) {
        if (this.justifyContent !== v) {
            this.justifyContent = v;
            
            // Alias common unexpected values when assigning to the dom
            var domValue = v;
            switch (domValue) {
                case 'start':
                    domValue = 'flex-start';
                    break;
                case 'end':
                    domValue = 'flex-end';
                    break;
                case 'spaceBetween':
                case 'between':
                    domValue = 'space-between';
                    break;
                case 'spaceAround':
                case 'around':
                    domValue = 'space-around';
                    break;
                case 'spaceEvenly':
                case 'evenly':
                    domValue = 'space-evenly';
                    break;
            }
            this.getInnerDomStyle().justifyContent = domValue;
            
            if (this.inited) {
                this.fireEvent('justifyContent', v);
                this.__syncSubviews();
            }
        }
    },
    
    setAlignItems: function(v) {
        if (this.alignItems !== v) {
            this.alignItems = v;
            
            // Alias common unexpected values when assigning to the dom
            var domValue = v;
            switch (domValue) {
                case 'start':
                    domValue = 'flex-start';
                    break;
                case 'end':
                    domValue = 'flex-end';
                    break;
            }
            this.getInnerDomStyle().alignItems = domValue;
            
            if (this.inited) {
                this.fireEvent('alignItems', v);
                this.__syncSubviews();
            }
        }
    },
    
    setAlignContent: function(v) {
        if (this.alignContent !== v) {
            this.alignContent = v;
            
            // Alias common unexpected values when assigning to the dom
            var domValue = v;
            switch (domValue) {
                case 'start':
                    domValue = 'flex-start';
                    break;
                case 'end':
                    domValue = 'flex-end';
                    break;
                case 'spaceBetween':
                case 'between':
                    domValue = 'space-between';
                    break;
                case 'spaceAround':
                case 'around':
                    domValue = 'space-around';
                    break;
            }
            this.getInnerDomStyle().alignContent = domValue;
            
            if (this.inited) {
                this.fireEvent('alignContent', v);
                this.__syncSubviews();
            }
        }
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** @overrides */
    createOurDomElement: function(parent) {
        var elements = this.callSuper(parent),
            innerElem;
        if (Array.isArray(elements)) {
            innerElem = elements[1];
        } else {
            innerElem = elements;
        }
        innerElem.style.display = 'flex';
        return elements;
    },
    
    /** @overrides myt.View
        Allow the child views to be managed by the flex box.*/
    subviewAdded: function(sv) {
        if (sv && !sv.ignoreFlex) {
            sv.getOuterDomStyle().position = '';
            if (this.inited) this.__syncSubviews();
        }
    },
    
    /** @private */
    __syncSubviews: function() {
        var svs = this.getSubviews();
        svs.forEach(sv => this.__syncSubview(sv));
    },
    
    /** @private */
    __syncSubview: function(sv) {
        if (sv && sv.syncInnerToOuter && !sv.ignoreFlex) {
            sv.syncInnerToOuter();
            sv.syncModelToOuterBounds();
        }
    },
    
    /** @overrides myt.View
        Allow the child views to be managed by the flex box.*/
    subviewRemoved: function(sv) {
        if (sv && !sv.destroyed && !sv.ignoreFlex) sv.getOuterDomStyle().position = 'absolute';
    }
});


/** A base class for flex box views. */
myt.FlexBox = new JS.Class('FlexBox', myt.View, {
    include: [myt.FlexBoxSupport]
});


/** Adds CSS3 transform support to a View.
    
    Events:
        transformOrigin:string
        rotation:number
        scaleX:number
        scaleY:number
        skewX:number
        skewY:number
    
    Attributes:
        transformOrigin:string The origin point for transforms.
        rotation:number The rotation in degrees.
        scale:number (write only) Sets the scale for the view in both the x 
            and y dimension to the same value. A value of 1 is no scaling, 
            0.5 is 50%, 2 is 200%, etc. Note: The setters for scaleX and 
            scaleY are not called.
        scaleX:number The scale for the view in the x-dimension. A value of 1 
            is no scaling, 0.5 is 50%, 2 is 200%, etc.
        scaleY:number The scale for the view in the y-dimension. A value of 1 
            is no scaling, 0.5 is 50%, 2 is 200%, etc.
        skewX:number Sets the horizontal skew in degrees.
        skewY:number Sets the vertical skew in degrees.
*/
myt.TransformSupport = new JS.Module('TransformSupport', {
    // Class Methods ///////////////////////////////////////////////////////////
    extend: {
        /** Sets the 'transformOrigin' style property of the provided
            style property map.
            @param s:Object the style map to modify.
            @param v:string the transformOrigin to set.
            @returns void */
        setTransformOrigin: function(s, v) {
            s.transformOrigin = v || '50% 50% 0';
        },
        
        /** Adds an entry to the 'transform' style property of the provided
            style property map.
            @param s:Object the style map to modify.
            @param type:string the type of transform: 'rotate', 'scaleX', 
                'scaleY', 'skewX', 'skewY'.
            @param v:string the style value to set.
            @returns void */
        addTransform: function(s, type, v) {
            var cur = this.removeTransform(s, type);
            s.transform = cur + (cur.length === 0 ? '' : ' ') + type + '(' + v + ')';
        },
        
        /** Removes an entry from the 'transform' style property of the provided
            style property map.
            @param s:Object the style map to modify.
            @param type:string the type of transform: 'rotate', 'scaleX', 
                'scaleY', 'skewX', 'skewY'.
            @returns string: the new transform value after the removal has been
                applied. */
        removeTransform: function(s, type) {
            var value = s.transform;
            
            if (!value || value.length === 0) return '';
            
            var parts = value.split(' '),
                i = parts.length;
            while (i) {
                if (parts[--i].indexOf(type) === 0) {
                    parts.splice(i, 1);
                    break;
                }
            }
            
            return s.transform = parts.join(' ');
        },
        
        /** Gets the total scaling being applied to an element. Walks up the
            ancestor chain multiplying the scaleX and scaleY.
            @param elem:myt.View the view to calculate scaling for.
            @returns object containing 'scaleX' and 'scaleY' numbers. */
        getEffectiveScale: function(elem) {
            var scaleX = 1, scaleY = 1;
            while (elem) {
                if (elem.scaleX != null) scaleX *= elem.scaleX;
                if (elem.scaleY != null) scaleY *= elem.scaleY;
                elem = elem.parent;
            }
            return {scaleX:scaleX, scaleY:scaleY};
        }
    },
    
    // Accessors ///////////////////////////////////////////////////////////////
    setTransformOrigin: function(v) {
        if (this.transformOrigin !== v) {
            this.transformOrigin = v;
            myt.TransformSupport.setTransformOrigin(this.getOuterDomStyle(), v);
            if (this.inited) {
                this.__updateBounds(this.width, this.height);
                this.fireEvent('transformOrigin', v);
            }
        }
    },
    
    setRotation: function(v) {
        if (this.rotation !== v) {
            this.rotation = v;
            myt.TransformSupport.addTransform(this.getOuterDomStyle(), 'rotate', (v || 0) + 'deg');
            if (this.inited) {
                this.__updateBounds(this.width, this.height);
                this.fireEvent('rotation', v);
            }
        }
    },
    
    setScale: function(v) {
        var doUpdateX = this.scaleX !== v;
        if (doUpdateX) this.__applyScale('scaleX', this.scaleX = v);
        
        var doUpdateY = this.scaleY !== v;
        if (doUpdateY) this.__applyScale('scaleY', this.scaleY = v);
        
        if (this.inited) {
            if (doUpdateX || doUpdateY) this.__updateBounds(this.width, this.height);
            if (doUpdateX) this.fireEvent('scaleX', v);
            if (doUpdateY) this.fireEvent('scaleY', v);
        }
    },
    
    setScaleX: function(v) {
        if (this.scaleX !== v) {
            this.__applyScale('scaleX', this.scaleX = v);
            if (this.inited) {
                this.__updateBounds(this.width, this.height);
                this.fireEvent('scaleX', v);
            }
        }
    },
    
    setScaleY: function(v) {
        if (this.scaleY !== v) {
            this.__applyScale('scaleY', this.scaleY = v);
            if (this.inited) {
                this.__updateBounds(this.width, this.height);
                this.fireEvent('scaleY', v);
            }
        }
    },
    
    /** @private */
    __applyScale: function(axis, v) {
        if (v == null) {
            myt.TransformSupport.removeTransform(this.getOuterDomStyle(), axis);
        } else {
            myt.TransformSupport.addTransform(this.getOuterDomStyle(), axis, v || 1); // Also converts 0 to 1.
        }
    },
    
    setSkewX: function(v) {
        if (this.skewX !== v) {
            this.skewX = v;
            myt.TransformSupport.addTransform(this.getOuterDomStyle(), 'skewX', v || 0);
            if (this.inited) {
                this.__updateBounds(this.width, this.height);
                this.fireEvent('skewX', v);
            }
        }
    },
    
    setSkewY: function(v) {
        if (this.skewY !== v) {
            this.skewY = v;
            myt.TransformSupport.addTransform(this.getOuterDomStyle(), 'skewY', v || 0);
            if (this.inited) {
                this.__updateBounds(this.width, this.height);
                this.fireEvent('skewY', v);
            }
        }
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** @overrides myt.View
        @private */
    __updateBounds: function(w, h) {
        var r = this.rotation,
            sx = this.scaleX,
            sy = this.scaleY,
            notScaled = false;
        if ((sx === undefined || sx === 1) && (sy === undefined || sy === 1)) notScaled = true;
        
        if (notScaled && (r === undefined || r === 0 || r === 180)) {
            // Do nothing
        } else if (notScaled && (r === 90 || r === 270)) {
            w = this.height;
            h = this.width;
        } else {
            var b = this.getOuterDomElement().getBoundingClientRect();
            w = b.width;
            h = b.height;
        }
        
        this.callSuper(w, h);
    }
});


/** A mixin that sizes the view to the width and height of the dom element.
    
    Events:
        None
    
    Attributes:
        width:number:string If a number the behavior is defined by the
            superclass. If a string value of 'auto' is provided sizing to
            the dom will occur. Using 'auto' allows the original SizeToDom
            behavior to be restored after an explicit width has been set.
        height:number:string If a number the behavior is defined by the
            superclass. If a string value of 'auto' is provided sizing to
            the dom will occur. Using 'auto' allows the original SizeToDom
            behavior to be restored after an explicit height has been set.
    
    Private Attributes:
        __hasSetWidth:boolean Indicates the an explicit width has been set
            so that should be used rather than sizing to the dom element.
        __hasSetHeight:boolean Indicates the an explicit height has been set
            so that should be used rather than sizing to the dom element.
*/
myt.SizeToDom = new JS.Module('SizeToDom', {
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides myt.View 
        Subclasses should call super. */
    doAfterAdoption: function() {
        this.sizeViewToDom();
        this.callSuper();
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    /** @overrides myt.View */
    setWidth: function(v, supressEvent) {
        if (v === 'auto') {
            this.__hasSetWidth = false;
            this.getOuterDomStyle().width = 'auto';
            this.sizeViewToDom();
        } else {
            this.__hasSetWidth = true;
            this.callSuper(v, supressEvent);
        }
    },
    
    /** @overrides myt.View */
    setHeight: function(v, supressEvent) {
        if (v === 'auto') {
            this.__hasSetHeight = false;
            this.getOuterDomStyle().height = 'auto';
            this.sizeViewToDom();
        } else {
            this.__hasSetHeight = true;
            this.callSuper(v, supressEvent);
        }
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** Call this method after any change to the width or height of the dom
        element would have occurred.
        @returns void */
    sizeViewToDom: function() {
        var self = this,
            de,
            scaling;
        
        if (!self.__hasSetWidth) {
            de = self.getOuterDomElement();
            var w = de.offsetWidth;
            
            // Bounding rect doesn't factor in scaling so we need to calculate
            // this ourselves.
            scaling = myt.TransformSupport.getEffectiveScale(self);
            w /= scaling.scaleX;
            
            // Circumvent setter
            if (self.width !== w) {
                self.width = w;
                if (self.inited) self.__updateBounds(w, self.height);
                self.fireEvent('width', w);
            }
        }
        
        if (!self.__hasSetHeight) {
            if (!de) de = self.getOuterDomElement();
            var h = de.offsetHeight;
            
            // Bounding rect doesn't factor in scaling so we need to calculate
            // this ourselves.
            if (!scaling) scaling = myt.TransformSupport.getEffectiveScale(self);
            h /= scaling.scaleY;
            
            // Circumvent setter
            if (self.height !== h) {
                self.height = h;
                if (self.inited) self.__updateBounds(self.width, h);
                self.fireEvent('height', h);
            }
        }
    }
});


/** Adds support for text display to a View.
    
    Requires:
        myt.SizeToDom super mixin.
    
    Events:
        text:string
        textOverflow:string
        textAlign:string
        whiteSpace:string
        wordWrap:string
        textIndent:string
        textTransform:string
        textDecoration:string
        lineHeight:string
        letterSpacing:string
        wordSpacing:string
        fontFamily:string
        fontStyle:string
        fontVariant:string
        fontWeight:string
        fontSize:string
    
    Attributes:
        text:string|event(string) The text to be displayed. The value will 
            be assigned to the inner html of the div.
        textOverflow:string How text will be treated when it overflows the
            bounds. Supported values: 'ellipsis', 'clip', 'inherit'.
        textAlign:string How text will be aligned within the bounds. Supported 
            values: 'left', 'right', 'center', 'justify', 'inherit'.
        whiteSpace:string How white space is handled. Supported values: 
            'normal', 'nowrap', 'pre', 'pre-line', 'pre-wrap', 'inherit'.
        wordWrap:string How line wrapping is done. Supported 
            values: 'break-word', 'normal'.
        textIndent:string How text gets indented. Supported values: '20px', 
            '10%', 'inherit'.
        textTransform:string Transformation performed on the text during
            display. Supported values: 'none', 'capitalize', 'uppercase', 
            'lowercase', 'inherit'.
        textDecoration:string Visual decoration to the text. Supported 
            values: 'none', 'underline', 'overline', 'line-through', 
            'blink', 'inherit'.
        lineHeight:string The height of individual lines of text. Supported 
            values: 'normal', '1.5', '22px', '150%', 'inherit'.
        letterSpacing:string Spacing between letters. Supported values: 
            'normal', '3px', 'inherit'.
        wordSpacing:string Spacing between words. Supported values: 
            'normal', '3px', 'inherit'.
        fontFamily:string The name of a font to use. The value will be 
            assigned to the font family CSS parameter.
        fontStyle:string Styling applied to the text. Supported values: 
            'normal', 'italic', 'oblique', 'inherit'.
        fontVariant:string The font variant. Supported values: 'normal', 
            'small-caps', 'inherit'.
        fontWeight:string The font weight. Supported values: 'normal', 'bold', 
            'bolder', 'lighter', '100-900', 'inherit'.
        fontSize:string The size of the font. Supported values: 'normal, 
            '14px', '14pt', 'xx-small', 'x-small', 'small', 'medium', 'large', 
            'x-large', 'xx-large', 'smaller', 'larger', '75%', 'inherit'.
        userUnselectable:boolean If set to true the CSS property user-select 
            will be set to 'none' thus making text selection not work.
            Furthermore, the cursor will be set to the default so it no longer
            appears as an i-beam.
*/
myt.TextSupport = new JS.Module('TextSupport', {
    // Accessors ///////////////////////////////////////////////////////////////
    /** @overrides myt.View */
    setWidth: function(v, supressEvent) {
        this.callSuper(v, supressEvent);
        
        // Height can change with width change when wrapping occurs.
        if (v !== 'auto') {
            var ws = this.whiteSpace;
            if (ws === 'normal' || ws === 'pre-line' || ws === 'pre-wrap') {
                this.sizeViewToDom();
            }
        }
    },
    
    setText: function(v) {
        if (!v) v = '';
        if (typeof v === 'object') v = v.value;
        
        if (this.text !== v) {
            // Use innerHTML rather than textContent since this allows us to
            // embed formatting markup.
            this.getInnerDomElement().innerHTML = this.text = v;
            if (this.inited) {
                this.fireEvent('text', v);
                this.sizeViewToDom();
            }
        }
    },
    
    // Text Attributes
    setTextOverflow: function(v) {
        if (this.textOverflow !== v) {
            this.textOverflow = v;
            this.getInnerDomStyle().textOverflow = v || 'inherit';
            if (this.inited) this.fireEvent('textOverflow', v);
        }
    },
    
    setTextAlign: function(v) {
        if (this.textAlign !== v) {
            this.textAlign = v;
            this.getInnerDomStyle().textAlign = v || 'inherit';
            if (this.inited) this.fireEvent('textAlign', v);
        }
    },
    
    setWhiteSpace: function(v) {this.__s(v, 'whiteSpace');},
    setWordWrap: function(v) {this.__s(v, 'wordWrap', 'normal');},
    setTextIndent: function(v) {this.__s(v, 'textIndent');},
    setTextTransform: function(v) {this.__s(v, 'textTransform');},
    setTextDecoration: function(v) {this.__s(v, 'textDecoration');},
    setLineHeight: function(v) {this.__s(v, 'lineHeight');},
    setLetterSpacing: function(v) {this.__s(v, 'letterSpacing');},
    setWordSpacing: function(v) {this.__s(v, 'wordSpacing');},
    
    // Font Attributes
    setFontFamily: function(v) {this.__s(v, 'fontFamily');},
    setFontStyle: function(v) {this.__s(v, 'fontStyle');},
    setFontVariant: function(v) {this.__s(v, 'fontVariant');},
    setFontWeight: function(v) {this.__s(v, 'fontWeight');},
    setFontSize: function(v) {this.__s(v, 'fontSize');},
    
    /** A private setter function that provides a common implementation for
        most of this setters in this mixin.
        @private */
    __s: function(v, attrName, defaultValue) {
        if (this[attrName] !== v) {
            this[attrName] = v;
            this.getInnerDomStyle()[attrName] = v || defaultValue || 'inherit';
            if (this.inited) {
                this.fireEvent(attrName, v);
                this.sizeViewToDom();
            }
        }
    },
    
    setUserUnselectable: function(v) {
        if (this.userUnselectable !== v) {
            this.userUnselectable = v;
            this[v ? 'addDomClass' : 'removeDomClass']('mytUnselectable');
            this.setCursor(v ? 'default' : 'text');
            if (this.inited) this.fireEvent('userUnselectable', v);
        }
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** Configures the attributes for this Text so that an ellipsis will be
        displayed. To actually see an ellipsis, an explicit width should be
        set on the Text so that overflow will occur.
        @returns void */
    enableEllipsis: function() {
        this.setWhiteSpace('nowrap');
        this.setOverflow('hidden');
        this.setTextOverflow('ellipsis');
    },
    
    /** Turns ellipsis off by setting overflow to 'visible'. Other CSS
        related changes for ellipsis are not undone such as whiteSpace and
        textOverflow.
        @returns void */
    disableEllipsis: function() {
        this.setOverflow('visible');
    },
    
    /** Turns on a text shadow.
        @param x:number (optional) The x offset in pixels of the shadow.
            Defaults to 0 if not provided.
        @param y:number (optional) The y offset in pixels of the shadow.
            Defaults to 0 if not provided.
        @param blur:number (optional) The bluriness in pixels of the shadow.
            Defaults to 2 if not provided.
        @param color:color_string (optional) The color of the shadow. Defaults
            to '#000000' if not provided.
        @param extraStrength:number (optional) The number of times to render 
            the shadow to give the shadow extra opacity.
        @returns void */
    showTextShadow: function(x, y, blur, color, extraStrength) {
        var shadow = (x || 0) + 'px ' + 
            (y || 0) + 'px ' + 
            (blur != null ? blur : 2) + 'px ' + 
            (color || '#000000');
            
        if (extraStrength > 0) {
            var value = [shadow];
            while (extraStrength--) value.push(shadow);
            shadow = value.join(',');
        }
        
        this.getInnerDomStyle().textShadow = shadow;
    },
    
    /** Turns off a text shadow.
        @returns void */
    hideTextShadow: function() {
        this.getInnerDomStyle().textShadow = 'none';
    }
});


/** Displays text content.
    
    Performance Note: If you set the bgColor of a text element it will render
    about 10% faster than if the background is set to 'transparent'. */
myt.Text = new JS.Class('Text', myt.View, {
    include: [myt.SizeToDom, myt.TextSupport],
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides myt.View */
    initNode: function(parent, attrs) {
        if (attrs.whiteSpace == null) attrs.whiteSpace = 'nowrap';
        if (attrs.userUnselectable == null) attrs.userUnselectable = true;
        
        this.callSuper(parent, attrs);
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** Measures the width of this element as if the wrapping was set 
        to 'nowrap'. The dom element is manipulated directly so that no 
        events get fired.
        @returns number the unwrapped width of this text view. */
    measureNoWrapWidth: function() {
        if (this.whiteSpace === 'nowrap') return this.width;
        
        // Temporarily set wrapping to 'nowrap', take measurement and
        // then restore wrapping.
        var s = this.deStyle,
            oldValue = s.whiteSpace;
        s.whiteSpace = 'nowrap';
        var measuredWidth = this.getOuterDomElement().offsetWidth;
        s.whiteSpace = oldValue;
        return measuredWidth;
    }
});


/** Adds support for image display to a View.
    
    Events:
        imageUrl:string
        imageSize:string
        imageRepeat:string
        imagePosition:string
        imageAttachment:string
        calculateNaturalSize:boolean
        naturalWidth:number
        naturalHeight:number
        useNaturalSize:boolean
        imageLoadingError:boolean
    
    Attributes:
        imageUrl:string The URL to load the image data from.
        imageSize:string Determines the size of the image. Allowed values
            are: 'auto', 'cover', 'contain', absolute ('20px 10px') and 
            percentage ('100% 50%').
        imageRepeat:string Determines if an image is repeated or not.
            Allowed values: 'repeat', 'repeat-x', 'repeat-y', 'no-repeat', 
            'inherit'. Defaults to 'no-repeat'.
        imagePosition:string Determines where an image is positioned.
        imageAttachment:string Determines how an image is attached to the view.
            Allowed values are: 'scroll', 'fixed', 'inherit'. The default
            value is 'scroll'.
        calculateNaturalSize:boolean Determines if the natural size should be 
            automatically calculated or not. Defaults to undefined which is
            equivalent to false.
        naturalWidth:number The natural width of the image. Only set if
            calculateNaturalWidth is true.
        naturalHeight:number The natural height of the image. Only set if
            calculateNaturalWidth is true.
        useNaturalSize:boolean If true this image view will be sized to the
            naturalWidth and naturalHeight and calculateNaturalSize will be
            set to true.
        imageLoadingError:boolean Gets set to true when an error occurs
            loading the image. The image will be loaded whenever the
            calculateNaturalSize attribute is set to true.
*/
myt.ImageSupport = new JS.Module('ImageSupport', {
    // Class Methods ///////////////////////////////////////////////////////////
    extend: {
        /** Stores widths and heights of images by URL so we don't have to
            reload them to get sizes. */
        SIZE_CACHE:{},
        
        /** Tracks requests to get the width and height of an image. Used to
            prevent multiple requests being made for the same image URL. */
        OPEN_SIZE_QUERIES:{}
    },
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides myt.Node */
    initNode: function(parent, attrs) {
        if (attrs.imageRepeat == null) attrs.imageRepeat = 'no-repeat';
        if (attrs.imageAttachment == null) attrs.imageAttachment = 'scroll';
        
        this.callSuper(parent, attrs);
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setImageUrl: function(v) {
        if (this.imageUrl !== v) {
            this.imageUrl = v;
            this.deStyle.backgroundImage = v ? 'url("' + v + '")' : 'none';
            if (this.inited) {
                this.fireEvent('imageUrl', v);
                this.setNaturalWidth(undefined);
                this.setNaturalHeight(undefined);
                
                // Collapse size if no url and we are using natural size
                if (!v && this.useNaturalSize) {
                    this.setWidth(0);
                    this.setHeight(0);
                }
            }
            this.__calculateNaturalSize();
        }
    },
    
    setImageLoadingError: function(v) {this.set('imageLoadingError', v, true);},
    
    setImageSize: function(v) {
        if (this.imageSize !== v) {
            this.imageSize = v;
            this.deStyle.backgroundSize = v || 'auto';
            if (this.inited) this.fireEvent('imageSize', v);
        }
    },
    
    setImageRepeat: function(v) {
        if (this.imageRepeat !== v) {
            this.deStyle.backgroundRepeat = this.imageRepeat = v;
            if (this.inited) this.fireEvent('imageRepeat', v);
        }
    },
    
    setImagePosition: function(v) {
        if (this.imagePosition !== v) {
            this.deStyle.backgroundPosition = this.imagePosition = v;
            if (this.inited) this.fireEvent('imagePosition', v);
        }
    },
    
    setImageAttachment: function(v) {
        if (this.imageAttachment !== v) {
            this.deStyle.backgroundAttachment = this.imageAttachment = v;
            if (this.inited) this.fireEvent('imageAttachment', v);
        }
    },
    
    setCalculateNaturalSize: function(v) {
        if (this.calculateNaturalSize !== v) {
            this.calculateNaturalSize = v;
            if (this.inited) this.fireEvent('calculateNaturalSize', v);
            this.__calculateNaturalSize();
        }
    },
    
    setNaturalWidth: function(v) {
        if (this.naturalWidth !== v) {
            this.naturalWidth = v;
            if (this.inited) this.fireEvent('naturalWidth', v);
            if (this.useNaturalSize && v) this.setWidth(v);
        }
    },
    
    setNaturalHeight: function(v) {
        if (this.naturalHeight !== v) {
            this.naturalHeight = v;
            if (this.inited) this.fireEvent('naturalHeight', v);
            if (this.useNaturalSize && v) this.setHeight(v);
        }
    },
    
    setUseNaturalSize: function(v) {
        if (this.useNaturalSize !== v) {
            this.useNaturalSize = v;
            if (this.inited) this.fireEvent('useNaturalSize', v);
            
            // Sync width and height
            if (v) {
                if (this.naturalWidth) this.setWidth(this.naturalWidth);
                if (this.naturalHeight) this.setHeight(this.naturalHeight);
            }
            
            // Turn on calculation of natural size if we're going to use
            // natural size.
            if (v && !this.calculateNaturalSize) this.setCalculateNaturalSize(true);
        }
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** Loads an image to measure its size.
        @private
        @returns void */
    __calculateNaturalSize: function() {
        var imgUrl = this.imageUrl;
        if (this.calculateNaturalSize && imgUrl) {
            var sizeCache = myt.ImageSupport.SIZE_CACHE,
                cachedSize = sizeCache[imgUrl];
            if (cachedSize) {
                // Cache hit
                this.setNaturalWidth(cachedSize.width);
                this.setNaturalHeight(cachedSize.height);
            } else {
                // Cache miss
                var openQueryCache = myt.ImageSupport.OPEN_SIZE_QUERIES,
                    openQuery = openQueryCache[imgUrl];
                if (!openQuery) {
                    // Lazy instantiate the open query array.
                    openQueryCache[imgUrl] = openQuery = [];
                    
                    // Start a size query
                    var img = new Image();
                    img.onerror = function(err) {
                        // Notify all ImageSupport instances that are waiting
                        // for a natural size that an error has occurred.
                        var openQueries = openQueryCache[imgUrl];
                        if (openQueries) {
                            var i = openQueries.length;
                            while (i) openQueries[--i].setImageLoadingError(true);
                            
                            // Cleanup
                            openQueries.length = 0;
                            delete openQueryCache[imgUrl];
                        }
                    };
                    img.onload = function() {
                        var w = this.width, h = this.height;
                        
                        // Notify all ImageSupport instances that are waiting
                        // for a natural size.
                        var openQueries = openQueryCache[imgUrl];
                        if (openQueries) {
                            var i = openQueries.length, imageSupportInstance;
                            while (i) {
                                imageSupportInstance = openQueries[--i];
                                if (imageSupportInstance.imageUrl === imgUrl) {
                                    imageSupportInstance.setNaturalWidth(w);
                                    imageSupportInstance.setNaturalHeight(h);
                                }
                            }
                            
                            // Cleanup
                            openQueries.length = 0;
                            delete openQueryCache[imgUrl];
                        }
                        
                        // Store size in cache.
                        sizeCache[imgUrl] = {width:w, height:h};
                    };
                    img.src = imgUrl;
                }
                
                openQuery.push(this);
            }
        }
    }
});


/** A view that displays an image. By default useNaturalSize is set to true
    so the Image will take on the size of the image data. */
myt.Image = new JS.Class('Image', myt.View, {
    include: [myt.ImageSupport],
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides myt.View */
    initNode: function(parent, attrs) {
        if (attrs.useNaturalSize == null) attrs.useNaturalSize = true;
        
        this.callSuper(parent, attrs);
    }
});


/** Displays HTML markup and resizes the view to fit the markup.
    
    Attributes:
        html:string The HTML to insert into the view.
*/
myt.Markup = new JS.Class('Markup', myt.View, {
    include: [myt.SizeToDom],
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setHtml: function(v) {
        var self = this;
        if (self.html !== v) {
            self.getInnerDomElement().innerHTML = self.html = v;
            if (self.inited) {
                self.fireEvent('html', v);
                self.sizeViewToDom();
            }
        }
    }
});


/** A view for an iframe. This component also listens to global mousedown/up
    events and turns off point-events so that the iframe will interfere
    less with mouse behavior in the parent document.
    
    Events:
        src:string
    
    Attributes:
        src:string The URL to an HTML document to load into the iframe.
    
    Private Attributes:
        __restorePointerEvents:string The value of pointerEvents before a
            mousedown occurs. Used as part of turning off pointer-events
            so that the iframe messes less with mouse behavior in the 
            parent document.
*/
myt.Frame = new JS.Class('Frame', myt.View, {
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides myt.View */
    initNode: function(parent, attrs) {
        if (attrs.tagName == null) attrs.tagName = 'iframe';
        
        this.callSuper(parent, attrs);
        
        var gm = myt.global.mouse;
        this.attachToDom(gm, '__doMouseDown', 'mousedown', true);
        this.attachToDom(gm, '__doMouseUp', 'mouseup', true);
    },
    
    /** @overrides myt.View */
    createOurDomElement: function(parent) {
        var elements = this.callSuper(parent),
            innerElem;
        if (Array.isArray(elements)) {
            innerElem = elements[1];
        } else {
            innerElem = elements;
        }
        innerElem.style.border = '0px';
        return elements;
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setSrc: function(v) {
        if (this.src !== v) {
            this.src = this.getInnerDomElement().src = v;
            if (this.inited) this.fireEvent('src', v);
        }
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** @private */
    __doMouseDown: function(event) {
        this.__restorePointerEvents = this.pointerEvents;
        this.setPointerEvents('none');
        return true;
    },
    
    /** @private */
    __doMouseUp: function(event) {
        this.setPointerEvents(this.__restorePointerEvents);
        return true;
    }
});


/** A variation of myt.SizeToDom that sizes the view to the width of the 
    dom element only.
    
    Events:
        None
    
    Attributes:
        width:number:string If a number the behavior is defined by the
            superclass. If a string value of 'auto' is provided sizing to
            the dom will occur. Using 'auto' allows the original SizeToDom
            behavior to be restored after an explicit width has been set.
    
    Private Attributes:
        __hasSetWidth:boolean Indicates the an explicit width has been set
            so that should be used rather than sizing to the dom element.
*/
myt.SizeWidthToDom = new JS.Module('SizeWidthToDom', {
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides myt.View 
        Subclasses should call super. */
    doAfterAdoption: function() {
        this.sizeViewToDom();
        this.callSuper();
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    /** @overrides myt.View */
    setWidth: function(v, supressEvent) {
        if (v === 'auto') {
            this.__hasSetWidth = false;
            this.deStyle.width = 'auto';
            this.sizeViewToDom();
        } else {
            this.__hasSetWidth = true;
            this.callSuper(v, supressEvent);
        }
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** Call this method after any change to the width of the dom
        element would have occurred.
        @returns void */
    sizeViewToDom: function() {
        if (!this.__hasSetWidth) {
            // Bounding rect doesn't factor in scaling so we need to calculate
            // this ourselves.
            var scaling = myt.TransformSupport.getEffectiveScale(this);
            
            var w = this.getOuterDomElement().offsetWidth / scaling.scaleX;
            
            // Circumvent setter
            if (this.width !== w) {
                this.width = w;
                if (this.inited) this.__updateBounds(w, this.height);
                this.fireEvent('width', w);
            }
        }
    }
});


/** A variation of myt.SizeToDom that sizes the view to the height of the 
    dom element only.
    
    Events:
        None
    
    Attributes:
        height:number:string If a number the behavior is defined by the
            superclass. If a string value of 'auto' is provided sizing to
            the dom will occur. Using 'auto' allows the original SizeToDom
            behavior to be restored after an explicit height has been set.
    
    Private Attributes:
        __hasSetHeight:boolean Indicates the an explicit height has been set
            so that should be used rather than sizing to the dom element.
*/
myt.SizeHeightToDom = new JS.Module('SizeHeightToDom', {
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides myt.View 
        Subclasses should call super. */
    doAfterAdoption: function() {
        this.sizeViewToDom();
        this.callSuper();
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    /** @overrides myt.View */
    setHeight: function(v, supressEvent) {
        if (v === 'auto') {
            this.__hasSetHeight = false;
            this.deStyle.height = 'auto';
            this.sizeViewToDom();
        } else {
            this.__hasSetHeight = true;
            this.callSuper(v, supressEvent);
        }
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** Call this method after any change to the height of the dom
        element would have occurred.
        @returns void */
    sizeViewToDom: function() {
        if (!this.__hasSetHeight) {
            // Bounding rect doesn't factor in scaling so we need to calculate
            // this ourselves.
            var scaling = myt.TransformSupport.getEffectiveScale(this);
            
            var h = this.getOuterDomElement().offsetHeight / scaling.scaleY;
            
            // Circumvent setter
            if (this.height !== h) {
                this.height = h;
                if (this.inited) this.__updateBounds(this.width, h);
                this.fireEvent('height', h);
            }
        }
    }
});


/** A mixin that sizes a view to a percentage of its parent view.
    
    This is the inverse of a layout since the child is responsible for sizing
    itself to the parent rather than in a layout where the layout positions
    and sizes the children.
    
    Events:
        percentOfParentWidthOffset:number
        percentOfParentHeightOffset:number
        percentOfParentWidth:number
        percentOfParentHeight:number
        
    Attributes:
        percentOfParentWidthOffset:number An additional offset used to adjust
            the width of the parent. Defaults to undefined which is
            equivalent to 0.
        percentOfParentHeightOffset:number An additional offset used to adjust
            the height of the parent. Defaults to undefined which is
            equivalent to 0.
        percentOfParentWidth:number The percent of the parent views width
            to size this views width to. Should be a number between 0 and 100 
            or a negative value which means don't do resizing. Defaults to 
            undefined which is equivalent to a negative value.
        percentOfParentHeight:number The percent of the parent views height
            to size this views height to. Should be a number between 0 and 100 
            or a negative value which means don't do resizing. Defaults to 
            undefined which is equivalent to a negative value.
*/
myt.SizeToParent = new JS.Module('SizeToParent', {
    // Accessors ///////////////////////////////////////////////////////////////
    /** @overrides myt.View */
    setParent: function(parent) {
        if (this.parent !== parent) {
            if (this.inited) {
                this.__teardownPercentOfParentWidthConstraint();
                this.__teardownPercentOfParentHeightConstraint();
            }
            this.callSuper(parent);
            this.__setupPercentOfParentWidthConstraint();
            this.__setupPercentOfParentHeightConstraint();
        }
    },
    
    setPercentOfParentWidthOffset: function(v) {
        if (this.percentOfParentWidthOffset !== v) {
            this.percentOfParentWidthOffset = v;
            if (this.inited) {
                this.fireEvent('percentOfParentWidthOffset', v);
                this.__doPercentOfParentWidth();
            }
        }
    },
    
    setPercentOfParentWidth: function(v) {
        if (this.percentOfParentWidth !== v) {
            if (this.inited) this.__teardownPercentOfParentWidthConstraint();
            this.percentOfParentWidth = v;
            if (this.inited) this.fireEvent('percentOfParentWidth', v);
            this.__setupPercentOfParentWidthConstraint();
        }
    },
    
    setPercentOfParentHeightOffset: function(v) {
        if (this.percentOfParentHeightOffset !== v) {
            this.percentOfParentHeightOffset = v;
            if (this.inited) {
                this.fireEvent('percentOfParentHeightOffset', v);
                this.__doPercentOfParentHeight();
            }
        }
    },
    
    setPercentOfParentHeight: function(v) {
        if (this.percentOfParentHeight !== v) {
            if (this.inited) this.__teardownPercentOfParentHeightConstraint();
            this.percentOfParentHeight = v;
            if (this.inited) this.fireEvent('percentOfParentHeight', v);
            this.__setupPercentOfParentHeightConstraint();
        }
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** @private */
    __teardownPercentOfParentWidthConstraint: function() {
        if (this.percentOfParentWidth >= 0) this.detachFrom(this.parent, '__doPercentOfParentWidth', 'width');
    },
    
    /** @private */
    __setupPercentOfParentWidthConstraint: function() {
        var p = this.parent;
        if (p && this.percentOfParentWidth >= 0) this.syncTo(p, '__doPercentOfParentWidth', 'width');
    },
    
    /** @private */
    __doPercentOfParentWidth: function(event) {
        this.setWidth((this.percentOfParentWidthOffset || 0) + Math.round(this.parent.width * (this.percentOfParentWidth / 100)));
        // Force width event if not inited yet so that align constraint
        // in myt.View will work.
        if (!this.inited) this.fireEvent('width', this.width);
    },
    
    /** @private */
    __teardownPercentOfParentHeightConstraint: function() {
        if (this.percentOfParentHeight >= 0) this.detachFrom(this.parent, '__doPercentOfParentHeight', 'height');
    },
    
    /** @private */
    __setupPercentOfParentHeightConstraint: function() {
        var p = this.parent;
        if (p && this.percentOfParentHeight >= 0) this.syncTo(p, '__doPercentOfParentHeight', 'height');
    },
    
    /** @private */
    __doPercentOfParentHeight: function(event) {
        this.setHeight((this.percentOfParentHeightOffset || 0) + Math.round(this.parent.height * (this.percentOfParentHeight / 100)));
        // Force height event if not inited yet so that valign constraint
        // in myt.View will work.
        if (!this.inited) this.fireEvent('height', this.height);
    }
});


/** Provides events when a new myt.RootView is created or destroyed.
    Registered in myt.global as 'roots'.
    
    Events:
        rootAdded:RootView Fired when a RootView is added. The value is the 
            RootView added.
        rootRemoved:RootView Fired when a RootView is removed. The value is the 
            RootView removed.
    
    Attributes:
        None
    
    Private Attributes:
        __roots:array Holds an array of RootViews.
*/
new JS.Singleton('GlobalRootViewRegistry', {
    include: [myt.Observable],
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    initialize: function() {
        this.__roots = [];
        myt.global.register('roots', this);
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    /** Gets the list of global root views.
        @returns array of RootViews. */
    getRoots: function() {
        return this.__roots;
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** Add a rootable to the global list of root views.
        @param r:RootView the RootView to add.
        @returns void */
    addRoot: function(r) {
        this.__roots.push(r);
        this.fireEvent('rootAdded', r);
    },
    
    /** Remove a rootable from the global list of root views.
        @param r:RootView the RootView to remove.
        @returns void */
    removeRoot: function(r) {
        var roots = this.__roots, i = roots.length, root;
        while(i) {
            root = roots[--i];
            if (root === r) {
                roots.splice(i, 1);
                this.fireEvent('rootRemoved', root);
                break;
            }
        }
    }
});


/** Allows a view to act as a "root" for a view hierarchy. A "root" view is 
    backed by a dom element from the page rather than a dom element created 
    by the view.
    
    Events:
        None
    
    Attributes:
        keepDomElementWhenDestroyed:boolean Indicates the dom element backing 
            this view must not be destroyed when this view is destroyed. 
            Defaults to undefined which is equivalent to false.
*/
myt.RootView = new JS.Module('RootView', {
    // Class Methods and Attributes ////////////////////////////////////////////
    extend: {
        /** Prevents default drag/drop behavior.
            @param v:myt.View the view to supress default dragover and drop on.
            @returns void */
        setupCaptureDrop: function(v) {
            var cdf = v.__captureDrop = function(event) {event.preventDefault();},
                de = v.domElement;
            myt.addEventListener(de, 'drop', cdf);
            myt.addEventListener(de, 'dragover', cdf);
        },
        
        /** Cleanup dom listeners for drag/drop.
            @param v:myt.View the view that had supressed default dragover 
                and drop on.
            @returns void */
        teardownCaptureDrop: function(v) {
            var de = v.domElement, cdf = v.__captureDrop;
            myt.removeEventListener(de, 'drop', cdf);
            myt.removeEventListener(de, 'dragover', cdf);
        }
    },
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    initNode: function(parent, attrs) {
        this.callSuper(parent, attrs);
        
        // Establish a stacking context
        this.setZIndex(0);
        
        // Set a css class to allow scoping of CSS rules
        this.addDomClass('myt');
        
        myt.global.roots.addRoot(this);
        
        myt.RootView.setupCaptureDrop(this);
    },
    
    /** @overrides myt.View */
    createOurDomElement: function(parent) {
        // If no parent is provided create a new dom element
        if (!parent) {
            parent = this.callSuper(parent);
            myt.getElement().appendChild(parent);
        }
        
        // A root view has a dom element provided as the parent. We use
        // that dom element as our domElement.
        return parent;
    },
    
    /** @overrides myt.View */
    destroyAfterOrphaning: function() {
        myt.RootView.teardownCaptureDrop(this);
        
        myt.global.roots.removeRoot(this);
        if (!this.keepDomElementWhenDestroyed) this.removeDomElement();
        this.callSuper();
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setKeepDomElementWhenDestroyed: function(keepDomElementWhenDestroyed) {
        this.keepDomElementWhenDestroyed = keepDomElementWhenDestroyed;
    },
    
    /** @overrides myt.Node */
    setParent: function(parent) {
        // A root view doesn't have a parent view.
        this.callSuper(undefined);
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** @overrides myt.View */
    bringToFront: function() {
        // Attempt to manipulate dom above root node.
        var de = this.domElement, parentNode = de.parentNode;
        if (de !== parentNode.lastChild) {
            var removedElem = parentNode.removeChild(de);
            if (removedElem) parentNode.appendChild(removedElem);
        }
    },
    
    /** @overrides myt.View */
    sendToBack: function() {
        // Attempt to manipulate dom above root node.
        var de = this.domElement, parentNode = de.parentNode;
        if (de !== parentNode.firstChild) {
            var removedElem = parentNode.removeChild(de);
            if (removedElem) parentNode.insertBefore(removedElem, parentNode.firstChild);
        }
    },
    
    /** @overrides myt.View */
    sendBehind: function(otherRootView) {
        // Attempt to manipulate dom above root node.
        var de = this.domElement,
            otherDe = otherRootView.domElement,
            parentNode = de.parentNode;
        if (otherDe.parentNode === parentNode) {
            var removedElem = parentNode.removeChild(de);
            if (removedElem) parentNode.insertBefore(removedElem, otherDe);
        }
    },
    
    /** @overrides myt.View */
    sendInFrontOf: function(otherRootView) {
        // Attempt to manipulate dom above root node.
        if (otherRootView.domElement.parentNode === this.domElement.parentNode) {
            this.sendBehind(otherRootView);
            otherRootView.sendBehind(this);
        }
    }
});


/** Provides events when the window is resized. Registered with myt.global
    as 'windowResize'.
    
    Events:
        resize:object Fired when the browser window is resized. The type
            is 'resize' and the value is an object containing:
                w:number the new window width.
                h:number the new window height.
    
    Attributes:
        None
    
    Private Attributes:
        __windowInnerWidth:number The inner width of the browser window.
        __windowInnerHeight:number The inner height of the browser window.
*/
new JS.Singleton('GlobalWindowResize', {
    include: [myt.Observable],
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    initialize: function() {
        var self = this;
        
        myt.addEventListener(window, 'resize', function(domEvent) {self.__handleEvent(domEvent);});
        
        myt.global.register('windowResize', self);
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    /** Gets the window's innerWidth.
        @returns the current width of the window. */
    getWidth: function() {
        return this.__windowInnerWidth || (this.__windowInnerWidth = window.innerWidth);
    },
    
    /** Gets the window's innerHeight.
        @returns the current height of the window. */
    getHeight: function() {
        return this.__windowInnerHeight || (this.__windowInnerHeight = window.innerHeight);
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** Handles the window resize event and broadcasts it to the observers.
        @private
        @param domEvent:object the window resize dom event.
        @returns void */
    __handleEvent: function(domEvent) {
        this.fireEvent('resize', {
            w:this.__windowInnerWidth = window.innerWidth,
            h:this.__windowInnerHeight = window.innerHeight
        });
    }
});


/** A mixin that sizes a RootView to the window width, height or both.
    
    Events:
        None
    
    Attributes:
        resizeDimension:string The dimension to resize in. Supported values
            are 'width', 'height' and 'both'. Defaults to 'both'.
        minWidth:number the minimum width below which this view will not 
            resize its width. Defaults to 0.
        minWidth:number the minimum height below which this view will not
            resize its height. Defaults to 0.
*/
myt.SizeToWindow = new JS.Module('SizeToWindow', {
    include: [myt.RootView],
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides */
    initNode: function(parent, attrs) {
        this.minWidth = this.minHeight = 0;
        if (attrs.resizeDimension == null) attrs.resizeDimension = 'both';
        
        this.attachTo(myt.global.windowResize, '__handleResize', 'resize');
        this.callSuper(parent, attrs);
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setResizeDimension: function(v) {
        if (this.resizeDimension !== v) {
            this.resizeDimension = v;
            this.__handleResize();
        }
    },
    
    setMinWidth: function(v) {
        if (this.minWidth !== v) {
            this.minWidth = v;
            this.__handleResize();
        }
    },
    
    setMinHeight: function(v) {
        if (this.minHeight !== v) {
            this.minHeight = v;
            this.__handleResize();
        }
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** @private */
    __handleResize: function(event) {
        var WR = myt.global.windowResize,
            dim = this.resizeDimension;
        if (dim === 'width' || dim === 'both') this.setWidth(Math.max(this.minWidth, WR.getWidth()));
        if (dim === 'height' || dim === 'both') this.setHeight(Math.max(this.minHeight, WR.getHeight()));
    }
});


/** A mixin that sizes a RootView to the window width. */
myt.SizeToWindowWidth = new JS.Module('SizeToWindowWidth', {
    include: [myt.SizeToWindow],
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides myt.SizeToWindow */
    initNode: function(parent, attrs) {
        if (attrs.resizeDimension == null) attrs.resizeDimension = 'width';
        
        this.callSuper(parent, attrs);
    }
});


/** A mixin that sizes a RootView to the window height. */
myt.SizeToWindowHeight = new JS.Module('SizeToWindowHeight', {
    include: [myt.SizeToWindow],
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides myt.SizeToWindow */
    initNode: function(parent, attrs) {
        if (attrs.resizeDimension == null) attrs.resizeDimension = 'height';
        
        this.callSuper(parent, attrs);
    }
});


/** Provides idle events. Registered with myt.global as 'idle'.
    
    Events:
        idle:object Fired when a browser idle event occurs. The event value is
            an object containing:
                delta: The time in millis since the last idle evnet.
                time: The time in millis of this idle event.
    
    Attributes:
        running:boolean Indicates if idle events are currently being fired
            or not.
        lastTime:number The millis of the last idle event fired.
    
    Private Attributes:
        __timerId:number The ID of the last idle event in the browser.
        __doIdle:function The function that gets executed on idle.
        __event:object The idle event object that gets reused.
*/
new JS.Singleton('GlobalIdle', {
    include: [myt.Observable],
    
    
    // Constructor /////////////////////////////////////////////////////////////
    initialize: function() {
        this.running = false;
        
        var vendor, vendors = ['webkit','moz','ms','o'], win = window;
        for (var i = 0; i < vendors.length && !win.requestAnimationFrame; ++i) {
            vendor = vendors[i];
            win.requestAnimationFrame = win[vendor + 'RequestAnimationFrame'];
            win.cancelAnimationFrame = win[vendor + 'CancelAnimationFrame'] || win[vendor + 'CancelRequestAnimationFrame'];
        }
        
        // Setup callback function
        var self = this;
        this.__event = {};
        this.__doIdle = function doIdle(time) {
            self.__timerId = win.requestAnimationFrame(doIdle);
            var lastTime = self.lastTime;
            if (lastTime !== -1) {
                time = Math.round(time);
                var event = self.__event;
                event.delta = time - lastTime;
                event.time = time;
                self.fireEvent('idle', event);
            }
            self.lastTime = time;
        };
        
        myt.global.register('idle', this);
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** @overrides myt.Observable */
    attachObserver: function(observer, methodName, type) {
        var retval = this.callSuper(observer, methodName, type);
        
        // Start firing idle events
        if (!this.running && this.hasObservers('idle')) {
            this.running = true;
            this.lastTime = -1;
            this.__timerId = window.requestAnimationFrame(this.__doIdle);
        }
        
        return retval;
    },
    
    /** @overrides myt.Observable */
    detachObserver: function(observer, methodName, type) {
        var retval = this.callSuper(observer, methodName, type);
        
        // Stop firing idle events
        if (this.running && !this.hasObservers('idle')) {
            window.cancelAnimationFrame(this.__timerId);
            this.running = false;
        }
        
        return retval;
    }
});


((pkg) => {
    var getTarget = (animator) => animator.target || animator.parent,
        
        isColorAttr = (animator) => {
            var target = getTarget(animator);
            animator.__isColorAnim = (target && typeof target.isColorAttr === 'function') ? target.isColorAttr(animator.attribute) : undefined;
        },
        
        getColorValue = (from, to, motionValue, relative, value) => {
            var Color = pkg.Color,
                fromColor = Color.makeColorFromHexString(from),
                toColor = Color.makeColorFromHexString(to),
                colorObj = relative ? Color.makeColorFromHexString(value) : fromColor;
            colorObj.setRed(colorObj.red + ((toColor.red - fromColor.red) * motionValue));
            colorObj.setGreen(colorObj.green + ((toColor.green - fromColor.green) * motionValue));
            colorObj.setBlue(colorObj.blue + ((toColor.blue - fromColor.blue) * motionValue));
            return colorObj.getHtmlHexString();
        },
        
        updateTarget = (animator, target, progress, oldProgress) => {
            var relative = animator.relative,
                duration = animator.duration,
                attr = animator.attribute,
                progressPercent = Math.max(0, progress / duration), 
                oldProgressPercent = Math.max(0, oldProgress / duration);
            
            // Determine what "from" to use if none was provided.
            if (animator.from == null) {
                animator.__temporaryFrom = true;
                animator.from = relative ? (animator.__isColorAnim ? '#000000' : 0) : target.get(attr);
            }
            
            var motionValue = animator.easingFunction(progressPercent) - (relative ? animator.easingFunction(oldProgressPercent) : 0),
                value = relative ? target.get(attr) : animator.from,
                to = animator.to;
            
            target.set(attr, animator.__isColorAnim ? getColorValue(animator.from, to, motionValue, relative, value) : value + ((to - animator.from) * motionValue));
        },
        
        reset = (animator) => {
            animator.__temporaryFrom = false;
            animator.__loopCount = animator.reverse ? animator.repeat - 1 : 0;
            animator.__progress = animator.reverse ? animator.duration : 0;
        },
        
        advance = (animator, timeDiff) => {
            if (animator.running && !animator.paused) {
                var reverse = animator.reverse, 
                    duration = animator.duration, 
                    repeat = animator.repeat;
                
                // An animation in reverse is like time going backward.
                if (reverse) timeDiff = timeDiff * -1;
                
                // Determine how much time to move forward by.
                var oldProgress = animator.__progress;
                animator.__progress += timeDiff;
                
                // Check for overage
                var remainderTime = 0;
                if (animator.__progress > duration) {
                    remainderTime = animator.__progress - duration;
                    animator.__progress = duration;
                    
                    // Increment loop count and halt looping if necessary
                    if (++animator.__loopCount === repeat) remainderTime = 0;
                } else if (0 > animator.__progress) {
                    // Reverse case
                    remainderTime = -animator.__progress; // Flip reverse time back to forward time
                    animator.__progress = 0;
                    
                    // Decrement loop count and halt looping if necessary
                    if (0 > --animator.__loopCount && repeat > 0) remainderTime = 0;
                }
                
                var target = getTarget(animator);
                if (target) {
                    updateTarget(animator, target, animator.__progress, oldProgress);
                    
                    if (
                        (!reverse && animator.__loopCount === repeat) || // Forward check
                        (reverse && 0 > animator.__loopCount && repeat > 0) // Reverse check
                    ) {
                        // Stop animation since loop count exceeded repeat count.
                        animator.setRunning(false);
                        if (animator.callback) animator.callback.call(animator, true);
                    } else if (remainderTime > 0) {
                        // Advance again if time is remaining. This occurs when
                        // the timeDiff provided was greater than the animation
                        // duration and the animation loops.
                        animator.fireEvent('repeat', animator.__loopCount);
                        animator.__progress = reverse ? duration : 0;
                        advance(animator, remainderTime);
                    }
                } else {
                    console.log("No target found for animator.", animator);
                    animator.setRunning(false);
                    if (animator.callback) animator.callback.call(animator, false);
                }
            }
        },
        
        /** Changes the value of an attribute on a target over time.
            
            Events:
                running:boolean Fired when the animation starts or stops.
                paused:boolean Fired when the animation is paused or unpaused.
                reverse:boolean
                easingFunction:function
                from:number
                to:number
                repeat:Fired when the animation repeats. The value is the current
                    loop count.
                
            Attributes:
                attribute:string The attribute to animate.
                target:object The object to animate the attribute on. The default is 
                    the parent of this node.
                from:number The starting value of the attribute. If not specified the 
                    current value on the target will be used.
                to:number The ending value of the attribute.
                duration:number The length of time the animation will run in millis.
                    The default value is 1000.
                easingFunction:string/function Controls the rate of animation.
                    string: See http://easings.net/ for more info. One of the following:
                        linear, 
                        easeInQuad, easeOutQuad, easeInOutQuad(default), 
                        easeInCubic, easeOutCubic, easeInOutCubic, 
                        easeInQuart, easeOutQuart, easeInOutQuart, 
                        easeInQuint, easeOutQuint, easeInOutQuint, 
                        easeInSine, easeOutSine, easeInOutSine,
                        easeInExpo ,easeOutExpo, easeInOutExpo, 
                        easeInCirc, easeOutCirc, easeInOutCirc,
                        easeInElastic ,easeOutElastic, easeInOutElastic, 
                        easeInBack, easeOutBack, easeInOutBack, 
                        easeInBounce, easeOutBounce, easeInOutBounce
                    
                    function: A function that determines the rate of change of the 
                        attribute. The arguments to the easing function are:
                        t: Animation progress in millis
                        c: Value change (to - from)
                        d: Animation duration in millis
                relative:boolean Determines if the animated value is set on the target 
                    (false), or added to the exiting value on the target (true). Note
                    that this means the difference between the from and to values
                    will be "added" to the existing value on the target. The default 
                    value is false.
                repeat:number The number of times to repeat the animation. If negative 
                    the animation will repeat forever. The default value is 1.
                reverse:boolean If true, the animation is run in reverse.
                running:boolean Indicates if the animation is currently running. The 
                    default value is false.
                paused:boolean Indicates if the animation is temporarily paused. The 
                    default value is false.
                callback:function A function that gets called when the animation
                    completes. A boolean value is passed into the function and will be
                    true if the animation completed successfully or false if not.
            
            Private Attributes:
                __loopCount:number the loop currently being run.
                __progress:number the number of millis currently used during the
                    current animation loop.
                __temporaryFrom:boolean Indicates no "from" was set on the animator so 
                    we will have to generate one when needed. We want to reset back to 
                    undefined after the animation completes so that subsequent calls 
                    to start the animation will behave the same.
                __isColorAnim:boolean Indicates this animator is animating a
                    color attribute.
        */
        Animator = pkg.Animator = new JS.Class('Animator', pkg.Node, {
            include: [pkg.Reusable],
            
            
            // Class Methods and Attributes ////////////////////////////////////
            extend: {
                easingFunctions: {
                    linear:t => t,
                    easeInQuad:t => t*t,
                    easeOutQuad:t => -t*(t-2),
                    easeInOutQuad:t => (t/=0.5) < 1 ? 0.5*t*t : -0.5 * ((--t)*(t-2) - 1),
                    easeInCubic:t => t*t*t,
                    easeOutCubic:t => ((t=t-1)*t*t + 1),
                    easeInOutCubic:t => (t/=0.5) < 1 ? 0.5*t*t*t : 1 /2*((t-=2)*t*t + 2),
                    easeInQuart:t => t*t*t*t,
                    easeOutQuart:t => -((t=t-1)*t*t*t - 1),
                    easeInOutQuart:t => (t/=0.5) < 1 ? 0.5*t*t*t*t : -0.5 * ((t-=2)*t*t*t - 2),
                    easeInQuint:t => t*t*t*t*t,
                    easeOutQuint:t => ((t=t-1)*t*t*t*t + 1),
                    easeInOutQuint:t => (t/=0.5) < 1 ? 0.5*t*t*t*t*t : 0.5*((t-=2)*t*t*t*t + 2),
                    easeInSine:t => -Math.cos(t * (Math.PI/2)) + 1,
                    easeOutSine:t => Math.sin(t * (Math.PI/2)),
                    easeInOutSine:t => -0.5 * (Math.cos(Math.PI*t) - 1),
                    easeInExpo:t => (t==0)? 0: Math.pow(2, 10 * (t - 1)),
                    easeOutExpo:t => (t==1)? 1: (-Math.pow(2, -10 * t) + 1),
                    easeInCirc:t => -(Math.sqrt(1 - t*t) - 1),
                    easeOutCirc:t => Math.sqrt(1 - (t=t-1)*t),
                    easeInOutCirc:t => (t/=0.5) < 1? -0.5 * (Math.sqrt(1 - t*t) - 1): 0.5 * (Math.sqrt(1 - (t-=2)*t) + 1),
                    easeInOutExpo:t => {
                        if (t==0) return 0;
                        if (t==1) return 1;
                        if ((t/=0.5) < 1) return 0.5 * Math.pow(2, 10 * (t - 1));
                        return 0.5 * (-Math.pow(2, -10 * --t) + 2);
                    },
                    easeInElastic:t => {
                        var s=1.70158, p=0, a=1;
                        if (t==0) return 0;
                        if (t==1) return 1;
                        if (!p) p=0.3;
                        if (a < 1) {
                            a=1; var s=p/4;
                        } else {
                            var s = p/(2*Math.PI) * Math.asin (1/a);
                        }
                        return -(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*1-s)*(2*Math.PI)/p));
                    },
                    easeOutElastic:t => {
                        var s=1.70158, p=0, a=1;
                        if (t==0) return 0;
                        if (t==1) return 1;
                        if (!p) p=1*0.3;
                        if (a < 1) {
                            a=1;
                            s=p/4;
                        } else {
                            s = p/(2*Math.PI) * Math.asin(1/a);
                        }
                        return a*Math.pow(2,-10*t) * Math.sin((t*1-s)*(2*Math.PI)/p) + 1;
                    },
                    easeInOutElastic:t => {
                        var s=1.70158, p=0, a=1;
                        if (t==0) return 0;
                        if ((t/=0.5)==2) return 1;
                        if (!p) p=(0.3*1.5);
                        if (a < 1) {
                            a=1;
                            s=p/4;
                        } else {
                            var s = p/(2*Math.PI) * Math.asin(1/a);
                        }
                        if (t < 1) return -.5*(a*Math.pow(2,10*(t-=1)) * Math.sin((t*1-s)*(2*Math.PI)/p));
                        return a*Math.pow(2,-10*(t-=1)) * Math.sin((t*1-s)*(2*Math.PI)/p)*0.5 + 1;
                    },
                    easeInBack:(t, s=1.70158) => (t/=1)*t*((s+1)*t - s),
                    easeOutBack:(t, s=1.70158) => ((t=t/1-1)*t*((s+1)*t + s) + 1),
                    easeInOutBack:(t, s=1.70158) => {
                        if ((t/=0.5) < 1) return 0.5*(t*t*(((s*=(1.525))+1)*t - s));
                        return 0.5*((t-=2)*t*(((s*=(1.525))+1)*t + s) + 2);
                    },
                    easeInBounce:t => 1 - Animator.easingFunctions.easeOutBounce(1-t),
                    easeOutBounce:t => {
                        if (t < (1/2.75)) {
                            return (7.5625*t*t);
                        } else if (t < (2/2.75)) {
                            return (7.5625*(t-=(1.5/2.75))*t + 0.75);
                        } else if (t < (2.5/2.75)) {
                            return (7.5625*(t-=(2.25/2.75))*t + 0.9375);
                        }
                        return (7.5625*(t-=(2.625/2.75))*t + .984375);
                    },
                    easeInOutBounce:t => {
                        if (t < 0.5) return Animator.easingFunctions.easeInBounce(t*2) * 0.5;
                        return Animator.easingFunctions.easeOutBounce(t*2-1) * 0.5 + 0.5;
                    }
                }
            },
            
            
            // Life Cycle //////////////////////////////////////////////////////
            /** @overrides myt.Node */
            initNode: function(parent, attrs) {
                var self = this;
                
                self.duration = 1000;
                self.relative = self.reverse = self.running = self.paused = false;
                self.repeat = 1;
                self.easingFunction = Animator.DEFAULT_EASING_FUNCTION;
                
                self.callSuper(parent, attrs);
                
                reset(self);
            },
            
            
            // Accessors ///////////////////////////////////////////////////////
            setRunning: function(v) {
                var self = this;
                
                if (self.running !== v) {
                    self.running = v;
                    if (self.inited) self.fireEvent('running', v);
                    
                    if (!self.paused) {
                        if (v) {
                            isColorAttr(self);
                        } else {
                            if (self.__temporaryFrom) self.from = undefined;
                            reset(self);
                        }
                        self[v ? 'attachTo' : 'detachFrom'](pkg.global.idle, '__updateAnim', 'idle');
                    }
                }
            },
            
            setPaused: function(v) {
                var self = this;
                
                if (self.paused !== v) {
                    self.paused = v;
                    if (self.inited) self.fireEvent('paused', v);
                    if (self.running) self[v ? 'detachFrom' : 'attachTo'](pkg.global.idle, '__updateAnim', 'idle');
                }
            },
            
            setReverse: function(v) {
                var self = this;
                
                if (self.reverse !== v) {
                    self.reverse = v;
                    if (self.inited) self.fireEvent('reverse', v);
                    if (!self.running) reset(self);
                }
            },
            
            setEasingFunction: function(v) {
                // Lookup easing function if a string is provided.
                if (typeof v === 'string') v = Animator.easingFunctions[v];
                
                // Use default if invalid
                if (!v) v = Animator.DEFAULT_EASING_FUNCTION;
                
                if (this.easingFunction !== v) {
                    this.easingFunction = v;
                    if (this.inited) this.fireEvent('easingFunction', v);
                }
            },
            
            setFrom: function(v) {
                if (this.from !== v) {
                    this.from = v;
                    if (this.inited) this.fireEvent('from', v);
                }
            },
            
            setTo: function(v) {
                if (this.to !== v) {
                    this.to = v;
                    if (this.inited) this.fireEvent('to', v);
                }
            },
            
            setCallback: function(v) {this.callback = v;},
            
            
            // Methods /////////////////////////////////////////////////////////
            /** A convienence method to set the callback to run when the animator
                stops running. If a callback already exists the provided callback
                will be executed after the existing one.
                @param callback:function the function to run.
                @param replace:boolean (optional) if true the existing callback will 
                    be replaced with the new callback.
                @returns void */
            next: function(callback, replace) {
                var existingCallback = this.callback;
                if (existingCallback && !replace) {
                    var anim = this;
                    this.setCallback(function(success) {
                        existingCallback.call(anim, success);
                        callback.call(anim, success);
                    });
                } else {
                    this.setCallback(callback);
                }
            },
            
            /** Puts the animator back to an initial configured state.
                @param executeCallback:boolean (optional) if true the callback, if
                    it exists, will be executed.
                @returns void */
            reset: function(executeCallback) {
                var self = this;
                
                reset(self);
                
                self.setRunning(false);
                self.setPaused(false);
                
                if (executeCallback && self.callback) self.callback.call(self, false);
            },
            
            /** @overrides myt.Reusable */
            clean: function() {
                var self = this;
                
                self.to = self.from = self.attribute = self.callback = undefined;
                self.duration = 1000;
                self.relative = self.reverse = false;
                self.repeat = 1;
                self.easingFunction = Animator.DEFAULT_EASING_FUNCTION;
                
                self.reset(false);
            },
            
            /** @private */
            __updateAnim: function(idleEvent) {
                advance(this, idleEvent.value.delta);
            }
        });
    
    /** Setup the default easing function. */
    Animator.DEFAULT_EASING_FUNCTION = Animator.easingFunctions.easeInOutQuad;
})(myt);


/** An implementation of a finite state machine.
    
    Events:
        start + transition name: Fired when a transition starts.
        start: Fired when a transition starts after the named start event.
        leave + state name: Fired when a state is left.
        leave: Fired when a state is left after the named leave event.
        enter + state name: Fired when a state is entered.
        enter: Fired when a state is entered after the named enter event.
        end + transition name: Fired when a transition ends.
        end: Fired when a transition ends after the named end event.
        finished: Fired when the state machine has transitioned into the
            terminal state if one is defined.
    
    Attributes:
        map:object A map of state names to transition maps.
        current:string The name of the current state.
        initial:string The name of the state to start with.
        terminal:string The name of the final state from which no other
            transitions are allowed.
    
    Private Attributes:
        __transitionInProgress:boolean Indicates that a transition is 
            currently under way.
        __pendingTransition:string The name of the transition that is currently
            under way.
        __additionalArgs:array An array of additional args passed into the
            doTransition or doAsyncTransition methods.
        __transitionDestinationState: The state the currently running 
            transition is transitioning to
        __transitionStage:string The stage of the current transition. Allowed
            values are 'leaveState' and 'enterState'.
        __deferredTransitions:array An array of transitions that will be
            performed after the current one completes.
*/
myt.StateMachine = new JS.Class('StateMachine', myt.Node, {
    // Class Methods and Attributes ////////////////////////////////////////////
    extend: {
        /** The transition was successfull. */
        SUCCEEDED:1,
        /** The transition was cancelled before the state change occurred. */
        CANCELLED:2,
        /** An asynchronous transition is in progress. */
        PENDING:3,
        /** The transition was invalid in some way. */
        INVALID:4,
        /** No transition exists for the current state. */
        NO_TRANSITION:5,
        
        /** Indicates a synchronous transition. */
        SYNC:'sync',
        /** Indicates an asynchronous transition. */
        ASYNC:'async',
        /** Special state name that holds transitions for all states. */
        WILDCARD:'*'
    },
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    initNode: function(parent, attrs) {
        this.map = {};
        this.map[myt.StateMachine.WILDCARD] = {};
        
        this.current = this.initial = this.terminal = '';
        this.__resetTransitionProgress();
        
        this.callSuper(parent, attrs);
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setInitialState: function(v) {
        if (this.current === '') {
            // Get optional args if v is an array
            var args;
            if (Array.isArray(v)) {
                args = v;
                v = args.shift();
            } else {
                args = [];
            }
            
            this.current = this.initial = v;
            this.doEnterState('', '', v, args);
            var eventValue = {name:'', from:'', to:v, args:args};
            this.fireEvent('enter' + v, eventValue);
            this.fireEvent('enter', eventValue);
            if (this.isFinished()) this.fireEvent('finished', eventValue);
        }
    },
    
    setTerminalState: function(v) {
        this.terminal = v;
    },
    
    setTransitions: function(v) {
        var i = v.length, data;
        while (i) {
            data = v[--i];
            this.addTransition(data.name, data.from, data.to);
        }
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    addTransition: function(transitionName, from, to) {
        var map = this.map;
        
        if (from) {
            from = Array.isArray(from) ? from : [from];
        } else {
            from = [myt.StateMachine.WILDCARD];
        }
        
        var i = from.length, mapEntry;
        while (i) {
            mapEntry = map[from[--i]];
            if (!mapEntry) mapEntry = map[from[i]] = {};
            mapEntry[transitionName] = to;
        }
    },
    
    doTransition: function() {
        var args = Array.prototype.slice.call(arguments);
        args.unshift(myt.StateMachine.SYNC);
        return this.__doTransition.apply(this, args);
    },
    
    doAsyncTransition: function() {
        var args = Array.prototype.slice.call(arguments);
        args.unshift(myt.StateMachine.ASYNC);
        return this.__doTransition.apply(this, args);
    },
    
    /** @private */
    __doTransition: function() {
        var args = Array.prototype.slice.call(arguments);
        
        // Don't allow another transition if one is already in progress.
        // Instead, defer them until after the current transition completes.
        if (this.__transitionInProgress) {
            var deferredTransitions = this.__deferredTransitions;
            if (!deferredTransitions) deferredTransitions = this.__deferredTransitions = [];
            deferredTransitions.unshift(args);
            return;
        } else {
            this.__transitionInProgress = true;
        }
        
        var async = args.shift(),
            transitionName = args.shift();
        
        // Invalid to start a transition if one is still pending.
        var SM = myt.StateMachine;
        if (this.__pendingTransition) return SM.PENDING;
        
        // Do not allow transition from the terminal states
        if (this.isFinished()) {
            this.__transitionInProgress = false;
            return SM.NO_TRANSITION;
        }
        
        var to = this.map[this.current][transitionName];
        if (!to) to = this.map[SM.WILDCARD][transitionName];
        if (to) {
            this.__pendingTransition = transitionName;
            this.__transitionDestinationState = to;
            this.__additionalArgs = args;
            return this.resumeTransition(async);
        } else {
            this.__transitionInProgress = false;
            return SM.NO_TRANSITION;
        }
    },
    
    resumeTransition: function(async) {
        var transitionName = this.__pendingTransition;
        
        // Invalid to resume a transition if none is pending.
        var SM = myt.StateMachine;
        if (!transitionName) return SM.INVALID;
        
        var current = this.current,
            to = this.__transitionDestinationState,
            args = this.__additionalArgs,
            eventValue = {name:transitionName, from:current, to:to, args:args};
        
        switch (this.__transitionStage) {
            case 'leaveState':
                var result = this.doLeaveState(transitionName, current, to, args);
                if (result === false) {
                    this.__resetTransitionProgress();
                    this.__doDeferredTransitions();
                    return SM.CANCELLED;
                } else if (result === SM.ASYNC || async === SM.ASYNC) {
                    this.__transitionStage = 'enterState';
                    this.fireEvent('start' + transitionName, eventValue);
                    this.fireEvent('start', eventValue);
                    this.fireEvent('leave' + current, eventValue);
                    this.fireEvent('leave', eventValue);
                    this.__doDeferredTransitions(); // FIXME: Is there a bug here if a transition starts in the middle of an async transition?
                    return SM.PENDING;
                } else {
                    this.fireEvent('start' + transitionName, eventValue);
                    this.fireEvent('start', eventValue);
                    this.fireEvent('leave' + current, eventValue);
                    this.fireEvent('leave', eventValue);
                    // Synchronous so fall through to 'enterState' case.
                }
            case 'enterState':
                this.current = to;
                this.__resetTransitionProgress();
                this.doEnterState(transitionName, current, to, args);
                this.fireEvent('enter' + to, eventValue);
                this.fireEvent('enter', eventValue);
                this.fireEvent('end' + transitionName, eventValue);
                this.fireEvent('end', eventValue);
                if (this.isFinished()) this.fireEvent('finished', eventValue);
        }
        
        this.__doDeferredTransitions();
        return SM.SUCCEEDED;
    },
    
    /** @private */
    __doDeferredTransitions: function() {
        this.__transitionInProgress = false;
        
        var deferredTransitions = this.__deferredTransitions;
        if (deferredTransitions) {
            while(deferredTransitions.length > 0) {
                this.__doTransition.apply(this, deferredTransitions.pop());
            }
        }
    },
    
    doLeaveState: function(transitionName, from, to, args) {
        // Subclasses to implement as needed.
    },
    
    doEnterState: function(transitionName, from, to, args) {
        // Subclasses to implement as needed.
    },
    
    /** @private */
    __resetTransitionProgress: function() {
        this.__additionalArgs = [];
        this.__pendingTransition = '';
        this.__transitionDestinationState = '';
        this.__transitionStage = 'leaveState';
    },
    
    isFinished: function() {
        return this.is(this.terminal);
    },
    
    isStarting: function() {
        return this.is(this.initial);
    },
    
    is: function(stateName) {
        if (Array.isArray(stateName)) {
            return stateName.indexOf(this.current) >= 0;
        } else {
            return this.current === stateName;
        }
    },
    
    can: function(transitionName) {
        if (this.map[this.current][transitionName] !== undefined) {
            return true;
        } else {
            return this.map[myt.StateMachine.WILDCARD][transitionName] !== undefined;
        }
    }
});


/** Objects that can be replicated should include this mixin and implemment
    the replicate method. The myt.Reusable mixin is also included and the
    clean method should also be implemented. The methods replicate and clean
    should perform setup and teardown of the object respectively.
    
    Events:
        None
    
    Attributes:
        replicationData:* The data provided during replication.
        replicationIndex:number The replication index provided 
            during replication.
*/
myt.Replicable = new JS.Module('Replicable', {
    include: [myt.Reusable],
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** Called to configure the replicable object with data. Subclasses should
        call super.
        @param data:object the data being replicated for this instance.
        @param idx:number the index of the data in the replicated list.
        @returns void */
    replicate: function(data, idx) {
        this.replicationData = data;
        this.replicationIndex = idx;
    },
    
    // FIXME: Make this a mixin?
    /** Notifies this object that something happened.
        @param key:string the name of the message
        @param value:* the value of the message.
        @returns void */
    notify: function(key, value) {},
    
    /** @overrides myt.Reusable
        Subclasses should call super. */
    clean: function() {
        this.replicationData = null;
        this.replicationIndex = -1;
    },
    
    /** Called by an myt.Replicator to check if this replicable needs to be
        updated or not.
        @param data:object the data being replicated for this instance.
        @param idx:number the index of the data in the replicated list.
        @returns boolean true if the provided data is already set on this
            replicable, false otherwise. */
    alreadyHasReplicationData: function(data, idx) {
        // FIXME: Use deepEquals on replicationData?
        return idx === this.replicationIndex && data === this.replicationData;
    }
});


/** Creates instances using a template class and an array of data items.
    
    Events:
        None
    
    Attributes:
        template:JS.Class The template to replicate for each entry in the
            data set.
        data:array The data to replicate the template for.
    
    Private Attributes:
        __pool:myt.TrackActivesPool The pool that holds the myt.Replicable
            instances.
*/
myt.Replicator = new JS.Class('Replicator', myt.Node, {
    // Class Methods and Attributes ////////////////////////////////////////////
    extend: {
        SORT_FUNCTION: function(a, b) {
            return a.replicationIndex - b.replicationIndex;
        }
    },
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides myt.Node */
    initNode: function(parent, attrs) {
        this.callSuper(parent, attrs);
        
        this.__setupPool();
        this.doReplication();
    },
    
    /** @overrides myt.Node */
    destroyAfterOrphaning: function() {
        this.__destroyOldPool();
        this.callSuper();
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setTemplate: function(v) {
        // Make sure template class is an myt.Replicable
        this.template = v.includes(myt.Replicable) ? v : null;
        if (!this.template) myt.dumpStack("Template not an myt.Replicable");
        
        if (this.inited) {
            this.__setupPool();
            this.doReplication();
        }
    },
    
    setData: function(v) {
        this.data = v;
        if (this.inited) this.doReplication();
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** @private */
    __setupPool: function() {
        this.__destroyOldPool();
        
        // Create new pool
        var template = this.template;
        if (template) this.__pool = new myt.TrackActivesPool(template, this.parent);
    },
    
    /** @private */
    __destroyOldPool: function() {
        // Destroy old pool and instances.
        var pool = this.__pool;
        if (pool) {
            // Lock layouts before modifying instances
            var layouts = this.parent.getLayouts();
            this.__lockLayouts(layouts);
            
            pool.putActives();
            pool.destroyPooledInstances();
            
            this.__unlockLayouts(layouts, false);
            
            pool.destroy();
        }
    },
    
    /** Performs replication.
        @returns void */
    doReplication: function() {
        var pool = this.__pool;
        if (pool) {
            // Lock layouts before modifying instances
            var layouts = this.parent.getLayouts();
            this.__lockLayouts(layouts);
            
            // Walk actives comparing against data
            var data = this.data, dataLen = data ? data.length : 0,
                actives = pool.getActives(), activesLen = actives.length,
                i = activesLen, active,
                replicationIndex, unused = [],
                sortFunc = myt.Replicator.SORT_FUNCTION;
            
            actives.sort(sortFunc);
            
            while (i) {
                active = actives[--i];
                replicationIndex = active.replicationIndex;
                if (replicationIndex >= dataLen ||
                    !active.alreadyHasReplicationData(data[replicationIndex], replicationIndex)
                ) {
                    unused[replicationIndex] = active;
                }
            }
            
            // Put away all unused actives
            i = unused.length;
            while (i) {
                active = unused[--i];
                if (active) pool.putInstance(active);
            }
            
            // Replicate on unused data and data that was beyond the length
            // of the actives list
            for (i = 0; dataLen > i; ++i) {
                if (i >= activesLen || unused[i] != null) pool.getInstance().replicate(data[i], i);
            }
            
            // Sort layout subviews so the layout reflects the data list order.
            i = layouts.length;
            while (i) layouts[--i].sortSubviews(sortFunc);
            
            this.__unlockLayouts(layouts, true);
        }
    },
    
    // FIXME: Make this a mixin?
    /** Sends a message to each active myt.Replicable.
        @param key:string the name of the message
        @param value:* the value of the message.
        @returns void */
    notify: function(key, value) {
        var pool = this.__pool;
        if (pool) {
            var actives = pool.getActives(), i = actives.length;
            while (i) actives[--i].notify(key, value);
        }
    },
    
    /** @private */
    __lockLayouts: function(layouts) {
        var i = layouts.length;
        while (i) layouts[--i].incrementLockedCounter();
    },
    
    /** @private */
    __unlockLayouts: function(layouts, update) {
        var i = layouts.length, layout;
        while (i) {
            layout = layouts[--i];
            layout.decrementLockedCounter();
            if (update) layout.update();
        }
    }
});


/** A layout that sets the target attribute name to the target value for 
    each subview.
    
    Events:
        targetAttrName:string
        targetValue:*
    
    Attributes:
        targetAttrName:string the name of the attribute to set on each subview.
        targetValue:* the value to set the attribute to.
        setterName:string the name of the setter method to call on the subview
            for the targetAttrName. This value is updated when
            setTargetAttrName is called.
*/
myt.ConstantLayout = new JS.Class('ConstantLayout', myt.Layout, {
    // Accessors ///////////////////////////////////////////////////////////////
    setTargetAttrName: function(v) {
        if (this.targetAttrName !== v) {
            this.targetAttrName = v;
            this.setterName = myt.AccessorSupport.generateSetterName(v);
            if (this.inited) {
                this.fireEvent('targetAttrName', v);
                this.update();
            }
        }
    },
    
    setTargetValue: function(v) {
        if (this.targetValue !== v) {
            this.targetValue = v;
            if (this.inited) {
                this.fireEvent('targetValue', v);
                this.update();
            }
        }
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** @overrides myt.Layout */
    update: function() {
        if (this.canUpdate()) {
            var setterName = this.setterName, 
                value = this.targetValue, 
                svs = this.subviews, len = svs.length, sv,
                setter, i = 0;
            for (; len > i;) {
                sv = svs[i++];
                setter = sv[setterName];
                if (setter) setter.call(sv, value);
            }
        }
    }
});


/** An extension of ConstantLayout that allows for variation based on the
    index and subview. An updateSubview method is provided that can be
    overriden to provide variable behavior.
    
    Events:
        collapseParent:boolean
        reverse:boolean
    
    Attributes:
        collapseParent:boolean If true the updateParent method will be called.
            The updateParent method will typically resize the parent to fit
            the newly layed out child views. Defaults to false.
        reverse:boolean If true the layout will position the items in the
            opposite order. For example, right to left instead of left to right.
            Defaults to false.
*/
myt.VariableLayout = new JS.Class('VariableLayout', myt.ConstantLayout, {
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides myt.Node */
    initNode: function(parent, attrs) {
        this.collapseParent = this.reverse = false;
        
        this.callSuper(parent, attrs);
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setCollapseParent: function(v) {
        if (this.collapseParent !== v) {
            this.collapseParent = v;
            if (this.inited) {
                this.fireEvent('collapseParent', v);
                this.update();
            }
        }
    },
    
    setReverse: function(v) {
        if (this.reverse !== v) {
            this.reverse = v;
            if (this.inited) {
                this.fireEvent('reverse', v);
                this.update();
            }
        }
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** @overrides myt.ConstantLayout */
    update: function() {
        if (this.canUpdate()) {
            // Prevent inadvertent loops
            this.incrementLockedCounter();
            
            this.doBeforeUpdate();
            
            var setterName = this.setterName, value = this.targetValue,
                svs = this.subviews, len = svs.length, i, sv, count = 0;
            
            if (this.reverse) {
                i = len;
                while(i) {
                    sv = svs[--i];
                    if (this.skipSubview(sv)) continue;
                    value = this.updateSubview(++count, sv, setterName, value);
                }
            } else {
                i = 0;
                while(len > i) {
                    sv = svs[i++];
                    if (this.skipSubview(sv)) continue;
                    value = this.updateSubview(++count, sv, setterName, value);
                }
            }
            
            this.doAfterUpdate();
            
            if (this.collapseParent && !this.parent.isBeingDestroyed) {
                this.updateParent(setterName, value);
            }
            
            this.decrementLockedCounter();
        }
    },
    
    /** Called by update before any processing is done. Gives subviews a
        chance to do any special setup before update is processed.
        @returns void */
    doBeforeUpdate: function() {
        // Subclasses to implement as needed.
    },
    
    /** Called by update after any processing is done but before the optional
        collapsing of parent is done. Gives subviews a chance to do any 
        special teardown after update is processed.
        @returns void */
    doAfterUpdate: function() {
        // Subclasses to implement as needed.
    },
    
    /** @overrides myt.Layout
        Provides a default implementation that calls update when the
        visibility of a subview changes. */
    startMonitoringSubview: function(sv) {
        this.attachTo(sv, 'update', 'visible');
    },
    
    /** @overrides myt.Layout
        Provides a default implementation that calls update when the
        visibility of a subview changes. */
    stopMonitoringSubview: function(sv) {
        this.detachFrom(sv, 'update', 'visible');
    },
    
    /** Called for each subview in the layout.
        @param count:int the number of subviews that have been layed out
            including the current one. i.e. count will be 1 for the first
            subview layed out.
        @param sv:View the subview being layed out.
        @param setterName:string the name of the setter method to call.
        @param value:* the layout value.
        @returns the value to use for the next subview. */
    updateSubview: function(count, sv, setterName, value) {
        sv[setterName](value);
        return value;
    },
    
    /** Called for each subview in the layout to determine if the view should
        be positioned or not. The default implementation returns true if the 
        subview is not visible.
        @param sv:View The subview to test.
        @returns true if the subview should be skipped during layout updates.*/
    skipSubview: function(sv) {
        return !sv.visible;
    },
    
    /** Called if the collapseParent attribute is true. Subclasses should 
        implement this if they want to modify the parent view.
        @param setterName:string the name of the setter method to call on
            the parent.
        @param value:* the value to set on the parent.
        @returns void */
    updateParent: function(setterName, value) {
        // Subclasses to implement as needed.
    }
});


/** An extension of VariableLayout that positions views along an axis using
    an inset, outset and spacing value. Views will be wrapped when they
    overflow the available space.
    
    Supported Layout Hints:
        break:string Will force the subview to start a new line/column.
*/
myt.WrappingLayout = new JS.Class('WrappingLayout', myt.VariableLayout, {
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides myt.VariableLayout */
    initNode: function(parent, attrs) {
        var self = this;
        
        self.targetAttrName = self.axis = 'x';
        self.setterName = 'setX';
        self.otherSetterName = 'setY';
        self.measureAttrName = 'boundsWidth';
        self.measureAttrBaseName = 'width';
        self.otherMeasureAttrName = 'boundsHeight';
        self.otherMeasureAttrBaseName = 'height';
        self.parentSetterName = 'setHeight';
        self.targetValue = self.spacing = self.inset = self.outset = self.lineSpacing = self.lineInset = self.lineOutset = 0;
        
        self.callSuper(parent, attrs);
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    /** @overrides myt.ConstantLayout */
    setTargetAttrName: function(v) {
        if (this.targetAttrName !== v) {
            var isY = v === 'y',
                inited = this.inited;
            
            if (inited) this.stopMonitoringAllSubviews();
            
            this.measureAttrName = isY ? 'boundsHeight' : 'boundsWidth';
            var mabn = this.measureAttrBaseName = isY ? 'height' : 'width';
            this.otherMeasureAttrName = isY ? 'boundsWidth' : 'boundsHeight';
            var omabn = this.otherMeasureAttrBaseName = isY ? 'width' : 'height';
            this.parentSetterName = isY ? 'setWidth' : 'setHeight';
            this.otherSetterName = isY ? 'setX' : 'setY';
            
            if (inited) {
                this.startMonitoringAllSubviews();
                this.stopMonitoringParent(omabn);
                this.startMonitoringParent(mabn);
            }
            this.callSuper(v);
        }
    },
    
    /** @overrides myt.Layout */
    setParent: function(v) {
        if (this.parent !== parent) {
            var isY = this.targetAttrName === 'y';
            if (this.parent) this.stopMonitoringParent(isY ? 'height' : 'width');
            this.callSuper(v);
            if (this.parent) this.startMonitoringParent(isY ? 'height' : 'width');
        }
    },
    
    setAxis: function(v) {this.setTargetAttrName(this.axis = v);},
    setInset: function(v) {this.setTargetValue(this.inset = v);},
    
    setSpacing: function(v) {
        if (this.spacing !== v) {
            this.spacing = v;
            if (this.inited) {
                this.fireEvent('spacing', v);
                this.update();
            }
        }
    },
    
    setOutset: function(v) {
        if (this.outset !== v) {
            this.outset = v;
            if (this.inited) {
                this.fireEvent('outset', v);
                this.update();
            }
        }
    },
    
    setLineSpacing: function(v) {
        if (this.lineSpacing !== v) {
            this.lineSpacing = v;
            if (this.inited) {
                this.fireEvent('lineSpacing', v);
                this.update();
            }
        }
    },
    
    setLineInset: function(v) {
        if (this.lineInset !== v) {
            this.lineInset = v;
            if (this.inited) {
                this.fireEvent('lineInset', v);
                this.update();
            }
        }
    },
    
    setLineOutset: function(v) {
        if (this.lineOutset !== v) {
            this.lineOutset = v;
            if (this.inited) {
                this.fireEvent('lineOutset', v);
                this.update();
            }
        }
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** Called when monitoring of width/height should start on our parent. */
    startMonitoringParent: function(measureAttrName) {
        this.attachTo(this.parent, 'update', measureAttrName);
    },
    
    /** Called when monitoring of width/height should stop on our parent. */
    stopMonitoringParent: function(measureAttrName) {
        this.detachFrom(this.parent, 'update', measureAttrName);
    },
    
    /** @overrides myt.Layout */
    startMonitoringSubview: function(sv) {
        this.attachTo(sv, 'update', this.measureAttrName);
        this.attachTo(sv, 'update', this.otherMeasureAttrName);
        this.callSuper(sv);
    },
    
    /** @overrides myt.Layout */
    stopMonitoringSubview: function(sv) {
        this.detachFrom(sv, 'update', this.measureAttrName);
        this.detachFrom(sv, 'update', this.otherMeasureAttrName);
        this.callSuper(sv);
    },
    
    
    /** @overrides myt.VariableLayout */
    doBeforeUpdate: function() {
        // The number of lines layed out.
        this.lineCount = 1;
        
        // The maximum size achieved by any line.
        this.maxSize = 0;
        
        // Track the maximum size of a line. Used to determine how much to
        // update linePos by when wrapping occurs.
        this.lineSize = 0;
        
        // The position for each subview in a line. Gets updated for each new
        // line of subviews.
        this.linePos = this.lineInset;
        
        // The size of the parent view. Needed to determine when to wrap. The
        // outset is already subtracted as a performance optimization.
        this.parentSizeLessOutset = this.parent[this.measureAttrName] - this.outset;
    },
    
    /** @overrides myt.ConstantLayout */
    updateSubview: function(count, sv, setterName, value) {
        var size = sv[this.measureAttrName],
            otherSize = sv[this.otherMeasureAttrName];
        
        if (value + size > this.parentSizeLessOutset || sv.layoutHint === 'break') {
            // Check for overflow
            value = this.targetValue; // Reset to inset.
            this.linePos += this.lineSize + this.lineSpacing;
            this.lineSize = otherSize;
            
            ++this.lineCount;
        } else if (otherSize > this.lineSize) {
            // Update line size if this subview is larger
            this.lineSize = otherSize;
        }
        
        sv[this.otherSetterName](this.linePos + (otherSize - sv[this.otherMeasureAttrBaseName])/2.0); // adj is for transform
        sv[setterName](value + (size - sv[this.measureAttrBaseName])/2.0); // adj is for transform
        
        // Track max size achieved during layout.
        this.maxSize = Math.max(this.maxSize, value + size + this.outset);
        
        return value + size + this.spacing;
    },
    
    /** @overrides myt.VariableLayout */
    updateParent: function(setterName, value) {
        // Collapse in the other direction
        this.parent[this.parentSetterName](this.linePos + this.lineSize + this.lineOutset);
    }
});


/** An extension of VariableLayout that positions views along an axis using
    an inset, outset and spacing value.
    
    Events:
        spacing:number
        outset:number
    
    Attributes:
        axis:string The orientation of the layout. An alias 
            for setTargetAttrName.
        inset:number Padding before the first subview that gets positioned.
            An alias for setTargetValue.
        spacing:number Spacing between each subview.
        outset:number Padding at the end of the layout. Only gets used
            if collapseParent is true.
        noAddSubviewOptimization:boolean Turns the optimization to supress
            layout updates when a subview is added off/on. Defaults to 
            undefined which is equivalent to false and thus leaves the
            optimization on.
*/
myt.SpacedLayout = new JS.Class('SpacedLayout', myt.VariableLayout, {
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides myt.VariableLayout */
    initNode: function(parent, attrs) {
        var self = this;
        
        self.targetAttrName = self.axis = 'x';
        self.setterName = 'setX';
        self.measureAttrName = 'boundsWidth';
        self.measureAttrBaseName = 'width';
        self.parentSetterName = 'setWidth';
        self.targetValue = self.spacing = self.inset = self.outset = 0;
        
        self.callSuper(parent, attrs);
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    /** @overrides myt.ConstantLayout */
    setTargetAttrName: function(v) {
        if (this.targetAttrName !== v) {
            var isY = v === 'y',
                inited = this.inited;
            if (inited) this.stopMonitoringAllSubviews();
            this.measureAttrName = isY ? 'boundsHeight' : 'boundsWidth';
            this.measureAttrBaseName = isY ? 'height' : 'width';
            this.parentSetterName = isY ? 'setHeight' : 'setWidth';
            if (inited) this.startMonitoringAllSubviews();
            this.callSuper(v);
        }
    },
    
    setNoAddSubviewOptimization: function(v) {this.noAddSubviewOptimization = v;},
    setAxis: function(v) {this.setTargetAttrName(this.axis = v);},
    setInset: function(v) {this.setTargetValue(this.inset = v);},
    
    setSpacing: function(v) {
        if (this.spacing !== v) {
            this.spacing = v;
            if (this.inited) {
                this.fireEvent('spacing', v);
                this.update();
            }
        }
    },
    
    setOutset: function(v) {
        if (this.outset !== v) {
            this.outset = v;
            if (this.inited) {
                this.fireEvent('outset', v);
                this.update();
            }
        }
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** @overrides myt.Layout */
    addSubview: function(sv) {
        // OPTIMIZATION: Skip the update call that happens during subview add.
        // The boundsWidth/boundsHeight events will be fired immediately 
        // after and are a more appropriate time to do the update.
        var isLocked = this.locked; // Remember original locked state.
        if (!this.noAddSubviewOptimization) this.locked = true; // Lock the layout so no updates occur.
        this.callSuper(sv);
        this.locked = isLocked; // Restore original locked state.
    },
    
    /** @overrides myt.VariableLayout */
    startMonitoringSubview: function(sv) {
        this.attachTo(sv, 'update', this.measureAttrName);
        this.callSuper(sv);
    },
    
    /** @overrides myt.VariableLayout */
    stopMonitoringSubview: function(sv) {
        this.detachFrom(sv, 'update', this.measureAttrName);
        this.callSuper(sv);
    },
    
    /** @overrides myt.ConstantLayout */
    updateSubview: function(count, sv, setterName, value) {
        var size = sv[this.measureAttrName];
        sv[setterName](value + (size - sv[this.measureAttrBaseName])/2.0); // Adj for transform
        return value + size + this.spacing;
    },
    
    /** @overrides myt.VariableLayout */
    updateParent: function(setterName, value) {
        this.parent[this.parentSetterName](value + this.outset - this.spacing);
    }
});


/** An extension of SpacedLayout that resizes one or more views to fill in
    any remaining space. The resizable subviews should not have a transform
    applied to it. The non-resized views may have transforms applied to them. */
myt.ResizeLayout = new JS.Class('SpacedLayout', myt.SpacedLayout, {
    // Accessors ///////////////////////////////////////////////////////////////
    /** @overrides myt.VariableLayout */
    setCollapseParent: function(v) {
        // collapseParent attribute is unused in ResizeLayout.
    },
    
    /** @overrides myt.SpacedLayout */
    setTargetAttrName: function(v) {
        if (this.targetAttrName !== v) {
            if (this.inited) {
                var isX = v === 'x';
                this.stopMonitoringParent(isX ? 'height' : 'width');
                this.startMonitoringParent(isX ? 'width' : 'height');
            }
            
            this.callSuper(v);
        }
    },
    
    /** @overrides myt.Layout */
    setParent: function(parent) {
        if (this.parent !== parent) {
            var dim = this.targetAttrName === 'x' ? 'width' : 'height';
            if (this.parent) this.stopMonitoringParent(dim);
            
            this.callSuper(parent);
            
            if (this.parent) this.startMonitoringParent(dim);
        }
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** Called when monitoring of width/height should start on our parent.
        @param attrName:string the name of the attribute to start monitoring.
        @returns void */
    startMonitoringParent: function(attrName) {
        this.attachTo(this.parent, 'update', attrName);
    },
    
    /** Called when monitoring of width/height should stop on our parent.
        @param attrName:string the name of the attribute to stop monitoring.
        @returns void */
    stopMonitoringParent: function(attrName) {
        this.detachFrom(this.parent, 'update', attrName);
    },
    
    /** @overrides myt.VariableLayout */
    doBeforeUpdate: function() {
        // Get size to fill
        var measureAttrName = this.measureAttrName,
            measureAttrBaseName = this.measureAttrBaseName,
            remainder = this.parent[measureAttrBaseName];
        
        // Calculate minimum required size
        remainder -= this.targetValue + this.outset;
        
        var svs = this.subviews, i = svs.length, sv,
            count = 0, resizeSum = 0;
        
        while(i) {
            sv = svs[--i];
            if (this.skipSubview(sv)) continue;
            ++count;
            if (sv.layoutHint > 0) {
                resizeSum += sv.layoutHint;
            } else {
                remainder -= sv[measureAttrName];
            }
        }
        
        if (count !== 0) {
            remainder -= (count - 1) * this.spacing;
            
            // Store for update
            this.remainder = remainder;
            this.resizeSum = resizeSum;
            this.scalingFactor = remainder / resizeSum;
            this.resizeSumUsed = this.remainderUsed = 0;
            this.measureSetter = measureAttrName === 'boundsWidth' ? 'setWidth' : 'setHeight';
        }
    },
    
    /** @overrides myt.SpacedLayout */
    updateSubview: function(count, sv, setterName, value) {
        var hint = sv.layoutHint;
        if (hint > 0) {
            this.resizeSumUsed += hint;
            
            var size = this.resizeSum === this.resizeSumUsed ? 
                this.remainder - this.remainderUsed : 
                Math.round(hint * this.scalingFactor);
            
            this.remainderUsed += size;
            sv[this.measureSetter](size);
        }
        return this.callSuper(count, sv, setterName, value);
    },
    
    /** @overrides myt.SpacedLayout */
    startMonitoringSubview: function(sv) {
        // Don't monitor width/height of the "stretchy" subviews since this
        // layout changes them.
        if (!(sv.layoutHint > 0)) this.attachTo(sv, 'update', this.measureAttrName);
        this.attachTo(sv, 'update', 'visible');
    },
    
    /** @overrides myt.SpacedLayout */
    stopMonitoringSubview: function(sv) {
        // Don't monitor width/height of the "stretchy" subviews since this
        // layout changes them.
        if (!(sv.layoutHint > 0)) this.detachFrom(sv, 'update', this.measureAttrName);
        this.detachFrom(sv, 'update', 'visible');
    },
    
    /** @overrides myt.SpacedLayout */
    updateParent: function(setterName, value) {
        // No resizing of parent since this view expands to fill the parent.
    }
});


/** An extension of VariableLayout that also aligns each view vertically
    or horizontally.
    
    Events:
        align:string
    
    Attributes:
        align:string Determines which way the views are aligned. Allowed
            values are 'left', 'center', 'right' and 'top', 'middle', 'bottom'.
            Defaults to 'middle'.
*/
myt.AlignedLayout = new JS.Class('AlignedLayout', myt.VariableLayout, {
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides myt.VariableLayout */
    initNode: function(parent, attrs) {
        var self = this;
        
        self.align = 'middle';
        self.targetAttrName = 'y';
        self.setterName = 'setY';
        self.measureAttrName = 'boundsHeight';
        self.measureAttrBaseName = 'height';
        self.parentSetterName = 'setHeight';
        self.targetValue = 0;
        
        self.callSuper(parent, attrs);
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    /** @overrides myt.ConstantLayout */
    setTargetAttrName: function(v) {
        if (this.targetAttrName !== v) {
            var isY = v === 'y',
                inited = this.inited;
            if (inited) this.stopMonitoringAllSubviews();
            this.measureAttrName = isY ? 'boundsHeight' : 'boundsWidth';
            this.measureAttrBaseName = isY ? 'height' : 'width';
            this.parentSetterName = isY ? 'setHeight' : 'setWidth';
            if (inited) this.startMonitoringAllSubviews();
            this.callSuper(v);
        }
    },
    
    setAlign: function(v) {
        if (this.align !== v) {
            this.align = v;
            
            // Update orientation but don't trigger an update since we
            // already call update at the end of this setter.
            var isLocked = this.locked;
            this.locked = true;
            this.setTargetAttrName((v === 'middle' || v === 'bottom' || v === 'top') ? 'y' : 'x');
            this.locked = isLocked;
            
            if (this.inited) {
                this.fireEvent('align', v);
                this.update();
            }
        }
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** @overrides myt.VariableLayout */
    startMonitoringSubview: function(sv) {
        this.attachTo(sv, 'update', this.measureAttrName);
        this.callSuper(sv);
    },
    
    /** @overrides myt.VariableLayout */
    stopMonitoringSubview: function(sv) {
        this.detachFrom(sv, 'update', this.measureAttrName);
        this.callSuper(sv);
    },
    
    /** Determine the maximum subview width/height according to the axis.
        @overrides myt.VariableLayout */
    doBeforeUpdate: function() {
        var measureAttrName = this.measureAttrName,
            value = 0, svs = this.subviews, sv, i = svs.length;
        while(i) {
            sv = svs[--i];
            if (this.skipSubview(sv)) continue;
            value = value > sv[measureAttrName] ? value : sv[measureAttrName];
        }
        
        this.setTargetValue(value);
    },
    
    /** @overrides myt.VariableLayout */
    updateSubview: function(count, sv, setterName, value) {
        switch (this.align) {
            case 'center': case 'middle':
                sv[setterName]((value - sv[this.measureAttrName]) / 2);
                break;
            case 'right': case 'bottom':
                sv[setterName](value - sv[this.measureAttrName]);
                break;
            default:
                sv[setterName](0);
        }
        return value;
    },
    
    /** @overrides myt.VariableLayout */
    updateParent: function(setterName, value) {
        this.parent[this.parentSetterName](value);
    }
});


/** A view for programatic drawing. This view is backed by an html 
    canvas element.
    
    Events:
        None
    
    Attributes:
        Same as HTML canvas element.
    
    Private Attributes:
        __canvas: A reference to the canvas dom element.
        __ctx: A reference to the 2D drawing context.
*/
myt.Canvas = new JS.Class('Canvas', myt.View, {
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides myt.View */
    createOurDomElement: function(parent) {
        var elements = this.callSuper(parent),
            innerElem;
        if (Array.isArray(elements)) {
            innerElem = elements[1];
        } else {
            innerElem = elements;
        }
        
        var canvas = this.__canvas = document.createElement('canvas');
        canvas.className = 'mytUnselectable';
        innerElem.appendChild(canvas);
        canvas.style.position = 'absolute';
        
        this.__ctx = canvas.getContext('2d');
        
        return elements;
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    /** @overrides myt.View
        Needed because canvas must also set width/height attribute.
        See: http://www.whatwg.org/specs/web-apps/current-work/multipage/the-canvas-element.html#attr-canvas-width */
    setWidth: function(v, supressEvent) {
        if (0 > v) v = 0;
        this.__canvas.setAttribute('width', v);
        this.callSuper(v, supressEvent);
    },
    
    /** @overrides myt.View
        Needed because canvas must also set width/height attribute.
        See: http://www.whatwg.org/specs/web-apps/current-work/multipage/the-canvas-element.html#attr-canvas-width */
    setHeight: function(v, supressEvent) {
        if (0 > v) v = 0;
        this.__canvas.setAttribute('height', v);
        this.callSuper(v, supressEvent);
    },
    
    setFillStyle: function(v) {this.__ctx.fillStyle = v;},
    getFillStyle: function() {return this.__ctx.fillStyle;},
    
    setStrokeStyle: function(v) {this.__ctx.strokeStyle = v;},
    getStrokeStyle: function() {return this.__ctx.strokeStyle;},
    
    setShadowColor: function(v) {this.__ctx.shadowColor = v;},
    getShadowColor: function() {return this.__ctx.shadowColor;},
    
    setShadowBlur: function(v) {this.__ctx.shadowBlur = v;},
    getShadowBlur: function() {return this.__ctx.shadowBlur;},
    
    setShadowOffsetX: function(v) {this.__ctx.shadowOffsetX = v;},
    getShadowOffsetX: function() {return this.__ctx.shadowOffsetX;},
    
    setShadowOffsetY: function(v) {this.__ctx.shadowOffsetY = v;},
    getShadowOffsetY: function() {return this.__ctx.shadowOffsetY;},
    
    setLineWidth: function(v) {this.__ctx.lineWidth = v;},
    getLineWidth: function() {return this.__ctx.lineWidth;},
    
    setLineCap: function(v) {this.__ctx.lineCap = v;},
    getLineCap: function() {return this.__ctx.lineCap;},
    
    setLineJoin: function(v) {this.__ctx.lineJoin = v;},
    getLineJoin: function() {return this.__ctx.lineJoin;},
    
    setMiterLimit: function(v) {this.__ctx.miterLimit = v;},
    getMiterLimit: function() {return this.__ctx.miterLimit;},
    
    setFont: function(v) {this.__ctx.font = v;},
    getFont: function() {return this.__ctx.font;},
    
    setTextAlign: function(v) {this.__ctx.textAlign = v;},
    getTextAlign: function() {return this.__ctx.textAlign;},
    
    setTextBaseline: function(v) {this.__ctx.textBaseline = v;},
    getTextBaseline: function() {return this.__ctx.textBaseline;},
    
    setGlobalAlpha: function(v) {this.__ctx.globalAlpha = v;},
    getGlobalAlpha: function() {return this.__ctx.globalAlpha;},
    
    setGlobalCompositeOperation: function(v) {this.__ctx.globalCompositeOperation = v;},
    getGlobalCompositeOperation: function() {return this.__ctx.globalCompositeOperation;},
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** Prevent views from being sent behind the __canvas. This allows us to
        add child views to a Canvas which is not directly supported in HTML.
        @overrides myt.View */
    sendSubviewToBack: function(sv) {
        if (sv.parent === this) {
            var de = this.domElement,
                firstChild = de.childNodes[1];
            if (sv.domElement !== firstChild) {
                var removedElem = de.removeChild(sv.domElement);
                if (removedElem) de.insertBefore(removedElem, firstChild);
            }
        }
    },
    
    /** Clears the drawing context. Anything currently drawn will be erased. */
    clear: function() {
        // Store the current transform matrix, then apply the identity matrix
        // to make clearing simpler then restore the transform.
        var ctx = this.__ctx;
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, this.width, this.height);
        ctx.restore();
    },
    
    dataURItoBlob: function(dataURI, dataTYPE) {
        var binary = atob(dataURI.split(',')[1]), 
            array = [];
        for (var i = 0; i < binary.length; i++) array.push(binary.charCodeAt(i));
        return new Blob([new Uint8Array(array)], {type: dataTYPE});
    },
    
    getDataURL: function(mimeType, opt) {
        return this.__canvas.toDataURL(mimeType, opt);
    },
    
    getImageFile: function(imageType, filename, opt) {
        var extension;
        switch (imageType) {
            case 'png': case 'PNG':
                extension = 'png';
                break;
            case 'jpg': case 'JPG': case 'jpeg': case 'JPEG':
                extension = 'jpeg';
                // opt should be a quality number between 0.0 (worst) and 1.0 (best)
                if (opt == null) opt = 0.5;
                break;
            default:
                console.warn('Unexpected image type: ', imageType);
                extension = imageType.toLowerCase();
        }
        var mimeType = 'image/' + extension,
            blob = this.dataURItoBlob(this.getDataURL(mimeType, opt), mimeType);
        if (filename) blob.name = filename + '.' + extension;
        return blob;
    },
    
    /** Draws a circle
        @param x:number the x location of the center of the circle.
        @param y:number the y location of the center of the circle.
        @param radius:number the radius of the circle.
        @returns void */
    circle: function(x, y, radius) {
        this.__ctx.arc(x, y, radius, 0, 2 * Math.PI);
    },
    
    save: function() {var ctx = this.__ctx; ctx.save.apply(ctx, arguments);},
    restore: function() {var ctx = this.__ctx; ctx.restore.apply(ctx, arguments);},
    
    scale: function() {var ctx = this.__ctx; ctx.scale.apply(ctx, arguments);},
    rotate: function() {var ctx = this.__ctx; ctx.rotate.apply(ctx, arguments);},
    translate: function() {var ctx = this.__ctx; ctx.translate.apply(ctx, arguments);},
    transform: function() {var ctx = this.__ctx; ctx.transform.apply(ctx, arguments);},
    setTransform: function() {var ctx = this.__ctx; ctx.setTransform.apply(ctx, arguments);},
    
    createLinearGradient: function() {var ctx = this.__ctx; return ctx.createLinearGradient.apply(ctx, arguments);},
    createRadialGradient: function() {var ctx = this.__ctx; return ctx.createRadialGradient.apply(ctx, arguments);},
    createPattern: function() {var ctx = this.__ctx; return ctx.createPattern.apply(ctx, arguments);},
    
    clearRect: function() {var ctx = this.__ctx; ctx.clearRect.apply(ctx, arguments);},
    fillRect: function() {var ctx = this.__ctx; ctx.fillRect.apply(ctx, arguments);},
    strokeRect: function() {var ctx = this.__ctx; ctx.strokeRect.apply(ctx, arguments);},
    
    beginPath: function() {var ctx = this.__ctx; ctx.beginPath.apply(ctx, arguments);},
    closePath: function() {var ctx = this.__ctx; ctx.closePath.apply(ctx, arguments);},
    moveTo: function() {var ctx = this.__ctx; ctx.moveTo.apply(ctx, arguments);},
    lineTo: function() {var ctx = this.__ctx; ctx.lineTo.apply(ctx, arguments);},
    
    quadraticCurveTo: function() {var ctx = this.__ctx; ctx.quadraticCurveTo.apply(ctx, arguments);},
    bezierCurveTo: function() {var ctx = this.__ctx; ctx.bezierCurveTo.apply(ctx, arguments);},
    arcTo: function() {var ctx = this.__ctx; ctx.arcTo.apply(ctx, arguments);},
    rect: function() {var ctx = this.__ctx; ctx.rect.apply(ctx, arguments);},
    arc: function() {var ctx = this.__ctx; ctx.arc.apply(ctx, arguments);},
    
    fill: function() {var ctx = this.__ctx; ctx.fill.apply(ctx, arguments);},
    stroke: function() {var ctx = this.__ctx; ctx.stroke.apply(ctx, arguments);},
    clip: function() {var ctx = this.__ctx; ctx.clip.apply(ctx, arguments);},
    isPointInPath: function() {var ctx = this.__ctx; ctx.isPointInPath.apply(ctx, arguments);},
    
    fillText: function() {var ctx = this.__ctx; ctx.fillText.apply(ctx, arguments);},
    strokeText: function() {var ctx = this.__ctx; ctx.strokeText.apply(ctx, arguments);},
    measureText: function() {var ctx = this.__ctx; return ctx.measureText.apply(ctx, arguments);},
    
    drawImage: function() {var ctx = this.__ctx; ctx.drawImage.apply(ctx, arguments);},
    createImageData: function() {var ctx = this.__ctx; ctx.createImageData.apply(ctx, arguments);},
    getImageData: function() {var ctx = this.__ctx; return ctx.getImageData.apply(ctx, arguments);},
    putImageData: function() {var ctx = this.__ctx; ctx.putImageData.apply(ctx, arguments)}
});



/** Adds an udpateUI method that should be called to update the UI. Various
    mixins will rely on the updateUI method to trigger visual updates.
    
    Events:
        None
    
    Attributes:
        None
*/
myt.UpdateableUI = new JS.Module('UpdateableUI', {
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides */
    initNode: function(parent, attrs) {
        this.callSuper(parent, attrs);
        
        // Call updateUI one time after initialization is complete to give
        // this View a chance to update itself.
        this.updateUI();
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** Updates the UI whenever a change occurs that requires a visual update.
        Subclasses should implement this as needed.
        @returns void */
    updateUI: function() {
        // Subclasses to implement as needed.
    }
});


/** Adds the capability to be "disabled" to an myt.Node. When an myt.Node is 
    disabled the user should typically not be able to interact with it.
    
    When disabled becomes true an attempt will be made to give away the focus
    using myt.FocusObservable's giveAwayFocus method.
    
    Events:
        disabled:boolean Fired when the disabled attribute is modified
            via setDisabled.
    
    Attributes:
        disabled:boolean Indicates that this component is disabled.
*/
myt.Disableable = new JS.Module('Disableable', {
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides */
    initNode: function(parent, attrs) {
        if (attrs.disabled == null) attrs.disabled = false;
        
        this.callSuper(parent, attrs);
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setDisabled: function(v) {
        if (this.disabled !== v) {
            this.disabled = v;
            if (this.inited) this.fireEvent('disabled', v);
            
            this.doDisabled();
        }
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** Called after the disabled attribute is set. Default behavior attempts
        to give away focus and calls the updateUI method of myt.UpdateableUI if 
        it is defined.
        @returns void */
    doDisabled: function() {
        if (this.inited) {
            // Give away focus if we become disabled and this instance is
            // a FocusObservable
            if (this.disabled && this.giveAwayFocus) this.giveAwayFocus();
            
            if (this.updateUI) this.updateUI();
        }
    }
});


/** Provides global mouse events by listening to mouse events on the the
    document. Registered with myt.global as 'mouse'. */
new JS.Singleton('GlobalMouse', {
    include: [myt.DomElementProxy, myt.DomObservable, myt.MouseObservable],
    
    
    // Constructor /////////////////////////////////////////////////////////////
    initialize: function() {
        this.setDomElement(document);
        
        myt.global.register('mouse', this);
    }
});


/** Provides a 'mouseOver' attribute that tracks mouse over/out state. Also
    provides a mechanism to smoothe over/out events so only one call to
    'doSmoothMouseOver' occurs per idle event.
    
    Requires myt.Disableable and myt.MouseObservable super mixins.
    
    Events:
        None
    
    Attributes:
        mouseOver:boolean Indicates if the mouse is over this view or not.
    
    Private Attributes:
        __attachedToOverIdle:boolean Used by the code that smoothes out
            mouseover events. Indicates that we are registered with the
            idle event.
        __lastOverIdleValue:boolean Used by the code that smoothes out
            mouseover events. Stores the last mouseOver value.
        __disabledOver:boolean Tracks mouse over/out state while a view is
            disabled. This allows correct restoration of mouseOver state if
            a view becomes enabled while the mouse is already over it.
*/
myt.MouseOver = new JS.Module('MouseOver', {
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides */
    initNode: function(parent, attrs) {
        if (attrs.mouseOver == null) attrs.mouseOver = false;
        
        this.callSuper(parent, attrs);
        
        this.attachToDom(this, 'doMouseOver', 'mouseover');
        this.attachToDom(this, 'doMouseOut', 'mouseout');
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setMouseOver: function(v) {
        if (this.mouseOver !== v) {
            this.mouseOver = v;
            // No event needed
            
            // Smooth out over/out events by delaying until the next idle event.
            if (this.inited && !this.__attachedToOverIdle) {
                this.__attachedToOverIdle = true;
                this.attachTo(myt.global.idle, '__doMouseOverOnIdle', 'idle');
            }
        }
    },
    
    /** @overrides myt.Disableable */
    setDisabled: function(v) {
        this.callSuper(v);
        
        if (this.disabled) {
            // When disabling make sure exposed mouseOver is not true. This 
            // helps prevent unwanted behavior of a disabled view such as a
            // disabled button looking like it is moused over.
            if (this.mouseOver) {
                this.__disabledOver = true;
                this.setMouseOver(false);
            }
        } else {
            // Restore exposed mouse over state when enabling
            if (this.__disabledOver) this.setMouseOver(true);
        }
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** @private */
    __doMouseOverOnIdle: function() {
        this.detachFrom(myt.global.idle, '__doMouseOverOnIdle', 'idle');
        this.__attachedToOverIdle = false;
        
        // Only call doSmoothOver if the over/out state has changed since the
        // last time it was called.
        var isOver = this.mouseOver;
        if (this.__lastOverIdleValue !== isOver) {
            this.__lastOverIdleValue = isOver;
            this.doSmoothMouseOver(isOver);
        }
    },
    
    /** Called when mouseOver state changes. This method is called after
        an event filtering process has reduced frequent over/out events
        originating from the dom.
        @returns void */
    doSmoothMouseOver: function(v) {
        if (this.inited && this.updateUI) this.updateUI();
    },
    
    /** Called when the mouse is over this view. Subclasses must call super.
        @returns void */
    doMouseOver: function(event) {
        this.__disabledOver = true;
        
        if (!this.disabled) this.setMouseOver(true);
    },
    
    /** Called when the mouse leaves this view. Subclasses must call super.
        @returns void */
    doMouseOut: function(event) {
        this.__disabledOver = false;
        
        if (!this.disabled) this.setMouseOver(false);
    }
});


/** Provides a 'mouseDown' attribute that tracks mouse up/down state.
    
    Requires: myt.MouseOver, myt.Disableable, myt.MouseObservable super mixins.
    
    Suggested: myt.UpdateableUI and myt.Activateable super mixins.
    
    Events:
        None
    
    Attributes:
        mouseDown:boolean Indicates if the mouse is down or not. */
myt.MouseDown = new JS.Module('MouseDown', {
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides */
    initNode: function(parent, attrs) {
        if (attrs.mouseDown == null) attrs.mouseDown = false;
        
        this.callSuper(parent, attrs);
        
        this.attachToDom(this, 'doMouseDown', 'mousedown');
        this.attachToDom(this, 'doMouseUp', 'mouseup');
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setMouseDown: function(v) {
        if (this.mouseDown !== v) {
            this.mouseDown = v;
            // No event needed
            if (this.inited) {
                if (v && this.isFocusable()) this.focus(true);
                if (this.updateUI) this.updateUI();
            }
        }
    },
    
    /** @overrides myt.Disableable */
    setDisabled: function(v) {
        // When about to disable the view make sure mouseDown is not true. This 
        // helps prevent unwanted activation of a disabled view.
        if (v && this.mouseDown) this.setMouseDown(false);
        
        this.callSuper(v);
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** @overrides myt.MouseOver */
    doMouseOver: function(event) {
        this.callSuper(event);
        if (this.mouseDown) this.detachFromDom(myt.global.mouse, 'doMouseUp', 'mouseup', true);
    },
    
    /** @overrides myt.MouseOver */
    doMouseOut: function(event) {
        this.callSuper(event);
        
        // Wait for a mouse up anywhere if the user moves the mouse out of the
        // view while the mouse is still down. This allows the user to move
        // the mouse in and out of the view with the view still behaving 
        // as moused down.
        if (!this.disabled && this.mouseDown) this.attachToDom(myt.global.mouse, 'doMouseUp', 'mouseup', true);
    },
    
    /** Called when the mouse is down on this view. Subclasses must call super.
        @returns void */
    doMouseDown: function(event) {
        if (!this.disabled) this.setMouseDown(true);
    },
    
    /** Called when the mouse is up on this view. Subclasses must call super.
        @returns void */
    doMouseUp: function(event) {
        // Cleanup global mouse listener since the mouseUp occurred outside
        // the view.
        if (!this.mouseOver) this.detachFromDom(myt.global.mouse, 'doMouseUp', 'mouseup', true);
        
        if (!this.disabled && this.mouseDown) {
            this.setMouseDown(false);
            
            // Only do mouseUpInside if the mouse is actually over the view.
            // This means the user can mouse down on a view, move the mouse
            // out and then mouse up and not "activate" the view.
            if (this.mouseOver) this.doMouseUpInside(event);
        }
    },
    
    /** Called when the mouse is up and we are still over the view. Executes
        the 'doActivated' method by default.
        @returns void */
    doMouseUpInside: function(event) {
        if (this.doActivated) this.doActivated();
    }
});


/** Provides both MouseOver and MouseDown mixins as a single mixin. */
myt.MouseOverAndDown = new JS.Module('MouseOverAndDown', {
    include: [myt.MouseOver, myt.MouseDown]
});


/** Adds the capability for an myt.View to be "activated". A doActivated method
    is added that gets called when the view is "activated". */
myt.Activateable = new JS.Module('Activateable', {
    // Methods /////////////////////////////////////////////////////////////////
    /** Called when this view should be activated.
        @returns void */
    doActivated: function() {
        // Subclasses to implement as needed.
    }
});


/** Provides keyboard handling to "activate" the component when a key is 
    pressed down or released up. By default, when a keyup event occurs for
    an activation key and this view is not disabled, the 'doActivated' method
    will get called.
    
    Requires: myt.Activateable, myt.Disableable, myt.KeyObservable and 
        myt.FocusObservable super mixins.
    
    Events:
        None
    
    Attributes:
        activationKeys:array of chars The keys that when keyed down will
            activate this component. Note: The value is not copied so
            modification of the array outside the scope of this object will
            effect behavior.
        activateKeyDown:number the keycode of the activation key that is
            currently down. This will be -1 when no key is down.
        repeatKeyDown:boolean Indicates if doActivationKeyDown will be called
            for repeated keydown events or not. Defaults to false.
*/
myt.KeyActivation = new JS.Module('KeyActivation', {
    // Class Methods and Attributes ////////////////////////////////////////////
    extend: {
        /** The default activation keys are enter (13) and spacebar (32). */
        DEFAULT_ACTIVATION_KEYS: [13,32]
    },
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides */
    initNode: function(parent, attrs) {
        var self = this;
        
        self.activateKeyDown = -1;
        
        if (attrs.activationKeys == null) attrs.activationKeys = myt.KeyActivation.DEFAULT_ACTIVATION_KEYS;
        
        self.callSuper(parent, attrs);
        
        self.attachToDom(self, '__handleKeyDown', 'keydown');
        self.attachToDom(self, '__handleKeyPress', 'keypress');
        self.attachToDom(self, '__handleKeyUp', 'keyup');
        self.attachToDom(self, '__doDomBlur', 'blur');
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setActivationKeys: function(v) {this.activationKeys = v;},
    setRepeatKeyDown: function(v) {this.repeatKeyDown = v;},
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** @private */
    __handleKeyDown: function(event) {
        if (!this.disabled) {
            if (this.activateKeyDown === -1 || this.repeatKeyDown) {
                var keyCode = myt.KeyObservable.getKeyCodeFromEvent(event),
                    keys = this.activationKeys, i = keys.length;
                while (i) {
                    if (keyCode === keys[--i]) {
                        if (this.activateKeyDown === keyCode) {
                            this.doActivationKeyDown(keyCode, true);
                        } else {
                            this.activateKeyDown = keyCode;
                            this.doActivationKeyDown(keyCode, false);
                        }
                        event.value.preventDefault();
                        return;
                    }
                }
            }
        }
    },
    
    /** @private */
    __handleKeyPress: function(event) {
        if (!this.disabled) {
            var keyCode = myt.KeyObservable.getKeyCodeFromEvent(event);
            if (this.activateKeyDown === keyCode) {
                var keys = this.activationKeys, i = keys.length;
                while (i) {
                    if (keyCode === keys[--i]) {
                        event.value.preventDefault();
                        return;
                    }
                }
            }
        }
    },
    
    /** @private */
    __handleKeyUp: function(event) {
        if (!this.disabled) {
            var keyCode = myt.KeyObservable.getKeyCodeFromEvent(event);
            if (this.activateKeyDown === keyCode) {
                var keys = this.activationKeys, i = keys.length;
                while (i) {
                    if (keyCode === keys[--i]) {
                        this.activateKeyDown = -1;
                        this.doActivationKeyUp(keyCode);
                        event.value.preventDefault();
                        return;
                    }
                }
            }
        }
    },
    
    /** @private */
    __doDomBlur: function(event) {
        if (!this.disabled) {
            var keyThatWasDown = this.activateKeyDown;
            if (keyThatWasDown !== -1) {
                this.activateKeyDown = -1;
                this.doActivationKeyAborted(keyThatWasDown);
            }
        }
    },
    
    /** Called when an activation key is pressed down. Default implementation
        does nothing.
        @param key:number the keycode that is down.
        @param isRepeat:boolean Indicates if this is a key repeat event or not.
        @returns void */
    doActivationKeyDown: function(key, isRepeat) {
        // Subclasses to implement as needed.
    },
    
    /** Called when an activation key is release up. This executes the
        'doActivated' method by default. 
        @param key:number the keycode that is up.
        @returns void */
    doActivationKeyUp: function(key) {
        this.doActivated();
    },
    
    /** Called when focus is lost while an activation key is down. Default 
        implementation does nothing.
        @param key:number the keycode that is down.
        @returns void */
    doActivationKeyAborted: function(key) {
        // Subclasses to implement as needed.
    }
});


((pkg) => {
    var JSClass = JS.Class,
        JSModule = JS.Module,
        defaultDisabledOpacity = 0.5,
        defaultFocusShadowPropertyValue = [0, 0, 7, '#666666'],
        
        /** Provides button functionality to an myt.View. Most of the functionality 
            comes from the mixins included by this mixin. This mixin resolves issues 
            that arise when the various mixins are used together.
            
            By default myt.Button instances are focusable.
            
            Events:
                None
            
            Attributes:
                None
            
            Private Attributes:
                __restoreCursor:string The cursor to restore to when the button is
                    no longer disabled.
        */
        Button = pkg.Button = new JSModule('Button', {
            include: [
                pkg.Activateable, 
                pkg.UpdateableUI, 
                pkg.Disableable, 
                pkg.MouseOverAndDown, 
                pkg.KeyActivation
            ],
            
            
            // Class Methods and Attributes ////////////////////////////////////
            extend: {
                DEFAULT_FOCUS_SHADOW_PROPERTY_VALUE: defaultFocusShadowPropertyValue,
                DEFAULT_DISABLED_OPACITY: defaultDisabledOpacity
            },
            
            
            // Life Cycle //////////////////////////////////////////////////////
            /** @overrides */
            initNode: function(parent, attrs) {
                if (attrs.focusable == null) attrs.focusable = true;
                if (attrs.cursor == null) attrs.cursor = 'pointer';
                
                this.callSuper(parent, attrs);
            },
            
            
            // Accessors ///////////////////////////////////////////////////////
            /** @overrides myt.FocusObservable */
            setFocused: function(v) {
                var self = this,
                    existing = self.focused;
                self.callSuper(v);
                if (self.inited && self.focused !== existing) self.updateUI();
            },
            
            
            // Methods /////////////////////////////////////////////////////////
            /** @overrides myt.KeyActivation. */
            doActivationKeyDown: function(key, isRepeat) {
                // Prevent unnecessary UI updates when the activation key is repeating.
                if (!isRepeat) this.updateUI();
            },
            
            /** @overrides myt.KeyActivation. */
            doActivationKeyUp: function(key) {
                this.callSuper(key);
                this.updateUI();
            },
            
            /** @overrides myt.KeyActivation. */
            doActivationKeyAborted: function(key) {
                this.callSuper(key);
                this.updateUI();
            },
            
            /** @overrides myt.UpdateableUI. */
            updateUI: function() {
                var self = this;
                
                if (self.disabled) {
                    // Remember the cursor to change back to, but don't re-remember
                    // if we're already remembering one.
                    if (self.__restoreCursor == null) self.__restoreCursor = self.cursor;
                    self.setCursor('not-allowed');
                    self.drawDisabledState();
                } else {
                    var rc = self.__restoreCursor;
                    if (rc) {
                        self.setCursor(rc);
                        self.__restoreCursor = null;
                    }
                    
                    if (self.activateKeyDown !== -1 || self.mouseDown) {
                        self.drawActiveState();
                    } else if (self.focused) {
                        self.drawFocusedState();
                    } else if (self.mouseOver) {
                        self.drawHoverState();
                    } else {
                        self.drawReadyState();
                    }
                }
            },
            
            /** Draw the UI when the component has focus. The default implementation
                calls drawHoverState.
                @returns void */
            drawFocusedState: function() {
                this.drawHoverState();
            },
            
            /** Draw the UI when the component is on the verge of being interacted 
                with. For mouse interactions this corresponds to the over state.
                @returns void */
            drawHoverState: () => {
                // Subclasses to implement as needed.
            },
            
            /** Draw the UI when the component has a pending activation. For mouse
                interactions this corresponds to the down state.
                @returns void */
            drawActiveState: () => {
                // Subclasses to implement as needed.
            },
            
            /** Draw the UI when the component is ready to be interacted with. For
                mouse interactions this corresponds to the enabled state when the
                mouse is not over the component.
                @returns void */
            drawReadyState: () => {
                // Subclasses to implement as needed.
            },
            
            /** Draw the UI when the component is in the disabled state.
                @returns void */
            drawDisabledState: () => {
                // Subclasses to implement as needed.
            },
            
            /** @overrides myt.FocusObservable */
            showFocusEmbellishment: function() {
                this.hideDefaultFocusEmbellishment();
                this.setBoxShadow(defaultFocusShadowPropertyValue);
            },
            
            /** @overrides myt.FocusObservable */
            hideFocusEmbellishment: function() {
                this.hideDefaultFocusEmbellishment();
                this.setBoxShadow();
            }
        }),
        
        /** An myt.Button that makes use of activeColor, hoverColor and readyColor
            attributes to fill the button.
            
            Events:
                None
            
            Attributes:
                activeColor:string A color string such as '#ff0000' or 'transparent'.
                    Used when the button is in the active state. The default value 
                    is transparent.
                hoverColor:string A color string such as '#ff0000' or 'transparent'.
                    Used when the button is in the hover state. The default value 
                    is transparent.
                readyColor:string A color string such as '#ff0000' or 'transparent'.
                    Used when the button is in the ready or disabled state. The 
                    default value is transparent.
        */
        SimpleButton = pkg.SimpleButton = new JSClass('SimpleButton', pkg.View, {
            include: [Button],
            
            
            // Life Cycle //////////////////////////////////////////////////////
            initNode: function(parent, attrs) {
                this.activeColor = this.hoverColor = this.readyColor = 'transparent';
                
                this.callSuper(parent, attrs);
            },
            
            
            // Accessors ///////////////////////////////////////////////////////
            setActiveColor: function(v) {
                if (this.activeColor !== v) {
                    this.activeColor = v;
                    // No event needed
                    if (this.inited) this.updateUI();
                }
            },
            
            setHoverColor: function(v) {
                if (this.hoverColor !== v) {
                    this.hoverColor = v;
                    // No event needed
                    if (this.inited) this.updateUI();
                }
            },
            
            setReadyColor: function(v) {
                if (this.readyColor !== v) {
                    this.readyColor = v;
                    // No event needed
                    if (this.inited) this.updateUI();
                }
            },
            
            
            // Methods /////////////////////////////////////////////////////////
            /** @overrides myt.Button */
            drawDisabledState: function() {
                this.setOpacity(defaultDisabledOpacity);
                this.setBgColor(this.readyColor);
            },
            
            /** @overrides myt.Button */
            drawHoverState: function() {
                this.setOpacity(1);
                this.setBgColor(this.hoverColor);
            },
            
            /** @overrides myt.Button */
            drawActiveState: function() {
                this.setOpacity(1);
                this.setBgColor(this.activeColor);
            },
            
            /** @overrides myt.Button */
            drawReadyState: function() {
                this.setOpacity(1);
                this.setBgColor(this.readyColor);
            }
        });
    
    /** A mixin that adds an icon and text to the inside of a button.
        
        Events:
            inset:number
            outset:number
            text:string
            shrinkToFit:boolean
            contentAlign:string
            iconUrl:string
            iconY:number|string
            iconSpacing:number
            textY:number|string
        
        Attributes:
            text:string The text to display on the button.
            iconUrl:string The url for an image to display in the button.
            inset:number The left padding before the icon. Defaults to 0.
            outset:number The right padding after the text/icon. Defaults to 0.
            textY:number|string The y offset for the text. If a string it must be
                a valign value: 'top', 'middle' or 'bottom'.
            iconY:number|string The y offset for the icon. If a string it must be
                a valign value: 'top', 'middle' or 'bottom'.
            iconSpacing:number The spacing between the iconView and the textView. 
                Defaults to 2.
            shrinkToFit:boolean When true the button will be as narrow as possible
                to fit the text, icon, inset and outset. When false the button 
                will be as wide as the set width. Defaults to false.
            contentAlign:string Determines how the icon and text will be 
                positioned when not in shrinkToFit mode. Allowed values are: 
                'left', 'center' and 'right'. Defaults to 'center'.
            textView:myt.Text A reference to the child text view.
            iconView:myt.Image A reference to the child image view.
            
        Private Attributes:
            __updateContentPositionLoopBlock:boolean Used in __updateContentPosition
                to prevent infinite loops.
    */
    pkg.IconTextButtonContent = new JSModule('IconTextButtonContent', {
        // Life Cycle //////////////////////////////////////////////////////////
        initNode: function(parent, attrs) {
            var self = this,
                iconView,
                textView;
            
            self.textY = self.iconY = 'middle';
            self.iconSpacing = 2;
            self.inset = self.outset = 0;
            
            if (attrs.shrinkToFit == null) attrs.shrinkToFit = false;
            if (attrs.contentAlign == null) attrs.contentAlign = 'center';
            
            self.callSuper(parent, attrs);
            
            // Setup the constraint after inited since the textView won't have
            // been sized to the dom until it's added in.
            iconView = self.iconView;
            textView = self.textView;
            self.applyConstraint('__updateContentPosition', [
                self, 'inset', self, 'outset',
                self, 'width', self, 'shrinkToFit', self, 'iconSpacing',
                self, 'contentAlign',
                iconView, 'width', iconView, 'visible',
                textView, 'width', textView, 'visible'
            ]);
        },
        
        doAfterAdoption: function() {
            var self = this,
                iconY = self.iconY,
                textY = self.textY,
                attrs = {
                    name:'iconView',
                    imageUrl:self.iconUrl
                };
            
            // Setup iconView
            if (typeof iconY === 'string') {
                attrs.valign = iconY;
            } else {
                attrs.y = iconY;
            }
            new pkg.Image(self, attrs);
            
            // Setup textView
            attrs = {
                name:'textView',
                whiteSpace:'nowrap',
                text:self.text, 
                domClass:'myt-Text mytButtonText'
            };
            if (typeof textY === 'string') {
                attrs.valign = textY;
            } else {
                attrs.y = textY;
            }
            new pkg.Text(self, attrs);
            
            self.callSuper();
        },
        
        
        // Accessors ///////////////////////////////////////////////////////////
        setInset: function(v) {
            // Adapt to event from syncTo
            if (v != null && typeof v === 'object') v = v.value;
            this.set('inset', v, true);
        },
        
        setOutset: function(v) {
            // Adapt to event from syncTo
            if (v != null && typeof v === 'object') v = v.value;
            this.set('outset', v, true);
        },
        
        setText: function(v) {
            if (this.text !== v) {
                this.text = v;
                if (this.inited) {
                    this.textView.setText(v);
                    this.fireEvent('text', v);
                }
            }
        },
        
        setShrinkToFit: function(v) {this.set('shrinkToFit', v, true);},
        setContentAlign: function(v) {this.set('contentAlign', v, true);},
        setIconSpacing: function(v) {this.set('iconSpacing', v, true);},
        
        setIconUrl: function(v) {
            if (this.iconUrl !== v) {
                this.iconUrl = v;
                if (this.inited) {
                    this.fireEvent('iconUrl', v);
                    this.iconView.setImageUrl(v);
                }
            }
        },
        
        setIconY: function(v) {
            var self = this,
                iconView = self.iconView;
            if (self.iconY !== v) {
                self.iconY = v;
                if (self.inited) {
                    self.fireEvent('iconY', v);
                    if (typeof v === 'string') {
                        iconView.setValign(v);
                    } else {
                        iconView.setY(v);
                    }
                }
            }
        },
        
        setTextY: function(v) {
            var self = this,
                textView = self.textView;
            if (self.textY !== v) {
                self.textY = v;
                if (self.inited) {
                    self.fireEvent('textY', v);
                    if (typeof v === 'string') {
                        textView.setValign(v);
                    } else {
                        textView.setValign('');
                        textView.setY(v);
                    }
                }
            }
        },
        
        
        // Methods /////////////////////////////////////////////////////////////
        /** @private */
        __updateContentPosition: function(v) {
            var self = this;
            
            if (self.__updateContentPositionLoopBlock || self.destroyed) return;
            
            var inset = self.inset,
                outset = self.outset,
                iconView = self.iconView,
                textView = self.textView,
                textViewVisible = textView.visible && self.text,
                iconWidth = iconView.visible ? iconView.width : 0,
                iconExtent = iconWidth + (textViewVisible && iconWidth > 0 ? self.iconSpacing : 0),
                textWidth = textViewVisible ? textView.width : 0,
                totalWidth,
                leftPos,
                extraWidth;
            
            if (self.shrinkToFit) {
                totalWidth = inset;
                iconView.setX(totalWidth);
                totalWidth += iconExtent;
                textView.setX(totalWidth);
                totalWidth += textWidth + outset;
                
                self.__updateContentPositionLoopBlock = true;
                self.setWidth(totalWidth);
                self.__updateContentPositionLoopBlock = false;
            } else {
                if (self.contentAlign === 'left') {
                    leftPos = inset;
                } else if (self.contentAlign === 'center') {
                    extraWidth = self.width - inset - iconExtent - textWidth - outset;
                    leftPos = inset + (extraWidth / 2);
                } else {
                    leftPos = self.width - iconExtent - textWidth - outset;
                }
                
                iconView.setX(leftPos);
                textView.setX(leftPos + iconExtent);
            }
        }
    });
    
    /** A mixin that adds a text element to the inside of a button.
        
        Events:
            inset:number
            outset:number
            text:string
            shrinkToFit:boolean
            textY:number|string
        
        Attributes:
            inset:number The left padding before the text. Defaults to 0.
            outset:number The right padding after the text. Defaults to 0.
            text:string The text to display on the button.
            shrinkToFit:boolean When true the button will be as narrow as possible
                to fit the text, inset and outset. When false the button 
                will be as wide as the set width. Defaults to false.
            textY:number|string The y offset for the text. If a string it must be
                a valign value: 'top', 'middle' or 'bottom'.
            textView:myt.Text A reference to the child text view.
        
        Private Attributes:
            __updateContentPositionLoopBlock:boolean Used in __updateContentPosition
                to prevent infinite loops.
            __origHeight:number The height the button has after adoption. Used to
                keep a positive height for the button even when the textView is
                not shown.
    */
    pkg.TextButtonContent = new JSModule('TextButtonContent', {
        // Life Cycle //////////////////////////////////////////////////////////
        initNode: function(parent, attrs) {
            var self = this,
                textView;
            
            self.inset = self.outset = 0;
            
            if (attrs.shrinkToFit == null) attrs.shrinkToFit = false;
            
            // Use appropriate default based on mutliline text or not.
            self.textY = attrs.shrinkToFit ? 'middle' : 0;
            
            self.callSuper(parent, attrs);
            
            // Setup the constraint after adoption since the textView won't have
            // been sized to the dom until it's added in.
            textView = self.textView;
            self.applyConstraint('__updateContentPosition', [
                self, 'inset', self, 'outset',
                self, 'width', self, 'shrinkToFit',
                textView, 'visible', textView, 'width',
                textView, 'height', textView, 'y'
            ]);
        },
        
        doAfterAdoption: function() {
            var self = this,
                textY = self.textY, 
                attrs = {
                    name:'textView', 
                    whiteSpace: self.shrinkToFit ? 'nowrap' : 'normal', 
                    text:self.text,
                    domClass:'myt-Text mytButtonText'
                };
            if (typeof textY === 'string') {
                attrs.valign = textY;
            } else {
                attrs.y = textY;
            }
            new pkg.Text(self, attrs);
            
            // Record original height
            self.__origHeight = self.height;
            
            self.callSuper();
        },
        
        
        // Accessors ///////////////////////////////////////////////////////////
        setInset: function(v) {
            // Adapt to event from syncTo
            if (v != null && typeof v === 'object') v = v.value;
            this.set('inset', v, true);
        },
        
        setOutset: function(v) {
            // Adapt to event from syncTo
            if (v != null && typeof v === 'object') v = v.value;
            this.set('outset', v, true);
        },
        
        setText: function(v) {
            if (this.text !== v) {
                this.text = v;
                if (this.inited) {
                    this.textView.setText(v);
                    this.fireEvent('text', v);
                }
            }
        },
        
        setShrinkToFit: function(v) {
            var self = this,
                textView = self.textView;
            if (self.shrinkToFit !== v) {
                self.shrinkToFit = v;
                if (self.inited) {
                    if (textView) textView.setWhiteSpace(v ? 'nowrap' : 'normal');
                    self.fireEvent('shrinkToFit', v);
                }
            }
        },
        
        setTextY: function(v) {
            var self = this,
                textView = self.textView;
            if (self.textY !== v) {
                self.textY = v;
                if (self.inited) {
                    self.fireEvent('textY', v);
                    if (typeof v === 'string') {
                        textView.setValign(v);
                    } else {
                        textView.setValign('');
                        textView.setY(v);
                    }
                }
            }
        },
        
        
        // Methods /////////////////////////////////////////////////////////////
        __updateContentPosition: function(v) {
            var self = this;
            
            if (self.__updateContentPositionLoopBlock || self.destroyed) return;
            
            var inset = self.inset, 
                outset = self.outset, 
                textView = self.textView,
                textViewVisible = textView.visible && self.text;
            
            self.__updateContentPositionLoopBlock = true;
            if (self.shrinkToFit) {
                textView.setX(inset);
                self.setWidth(inset + (textViewVisible ? textView.width : 0) + outset);
                self.setHeight(self.__origHeight);
            } else {
                textView.setHeight('auto');
                textView.setWidth(self.width - inset - outset);
                textView.setX(inset);
                self.setHeight(textViewVisible ? textView.y + textView.height : self.__origHeight);
            }
            self.__updateContentPositionLoopBlock = false;
        }
    });
    
    /** A simple button with support for an icon, text and a tooltip. */
    pkg.SimpleIconTextButton = new JSClass('SimpleIconTextButton', SimpleButton, {
        include: [pkg.IconTextButtonContent]
    });
    
    /** A simple button with support for text and a tooltip. */
    pkg.SimpleTextButton = new JSClass('SimpleTextButton', SimpleButton, {
        include: [pkg.TextButtonContent]
    });
})(myt);


((pkg) => {
    /** Models a color as individual color channels.
        
        Events:
            None
       
        Attributes:
            red:int The red channel. Will be an integer between 0 and 255.
            green:int The green channel. Will be an integer between 0 and 255.
            blue:int The blue channel. Will be an integer between 0 and 255.
    */
    var Color = pkg.Color = new JS.Class('Color', {
        // Class Methods and Attributes ////////////////////////////////////////
        extend: {
            /** Converts a number or string representation of a number to a 
                two character hex string.
                @param value:number/string The number or string to convert.
                @returns string: A two character hex string such as: '0c' or 'c9'. */
            toHex: function(value) {
                value = this.cleanChannelValue(value).toString(16);
                return value.length === 1 ? '0' + value : value;
            },
            
            /** Converts red, green, and blue color channel numbers to a six 
                character hex string.
                @param red:number The red color channel.
                @param green:number The green color channel.
                @param blue:number The blue color channel.
                @param prependHash:boolean (optional) If true a '#' character
                    will be prepended to the return value.
                @returns string: Something like: '#ff9c02' or 'ff9c02' */
            rgbToHex: function(red, green, blue, prependHash) {
                var toHex = this.toHex.bind(this);
                return [prependHash ? '#' : '', toHex(red), toHex(green), toHex(blue)].join('');
            },
            
            /** Limits a channel value to integers between 0 and 255.
                @param value:number the channel value to clean up.
                @returns number */
            cleanChannelValue: (value) => Math.min(255, Math.max(0, Math.round(value))),
            
            /** Gets the red channel from a "color" number.
                @return number */
            getRedChannel: (value) => (0xff0000 & value) >> 16,
            
            /** Gets the green channel from a "color" number.
                @returns number */
            getGreenChannel: (value) => (0x00ff00 & value) >> 8,
            
            /** Gets the blue channel from a "color" number.
                @returns number */
            getBlueChannel: (value) => (0x0000ff & value),
            
            /** Creates an myt.Color from a "color" number.
                @returns myt.Color */
            makeColorFromNumber: function(value) {
                return new Color(
                    this.getRedChannel(value),
                    this.getGreenChannel(value),
                    this.getBlueChannel(value)
                );
            },
            
            /** Creates an myt.Color from an html color string.
                @param value:string A hex string representation of a color, such
                    as '#ff339b'.
                @returns myt.Color or null if no color could be parsed. */
            makeColorFromHexString: function(value) {
                if (value && value.indexOf('#') === 0) {
                    return this.makeColorFromNumber(parseInt(value.substring(1), 16));
                } else {
                    return null;
                }
            },
            
            /** Returns the lighter of the two provided colors.
                @param a:number A color number.
                @param b:number A color number.
                @returns The number that represents the lighter color. */
            getLighterColor: function(a, b) {
                var cA = this.makeColorFromNumber(a),
                    cB = this.makeColorFromNumber(b);
                return cA.isLighterThan(cB) ? a : b;
            },
            
            /** Creates a "color" number from the provided color channels.
                @param red:number the red channel
                @param green:number the green channel
                @param blue:number the blue channel
                @returns number */
            makeColorNumberFromChannels: function(red, green, blue) {
                red = this.cleanChannelValue(red);
                green = this.cleanChannelValue(green);
                blue = this.cleanChannelValue(blue);
                return (red << 16) + (green << 8) + blue;
            },
            
            /** Creates a new myt.Color object that is a blend of the two provided
                colors.
                @param fromColor:myt.Color The first color to blend.
                @param toColor:myt.Color The second color to blend.
                @param percent:number The blend percent between the two colors
                    where 0 is the fromColor and 1.0 is the toColor.
                @returns myt.Color */
            makeBlendedColor: (fromColor, toColor, percent) => {
                return new Color(
                    fromColor.red + (percent * (toColor.red - fromColor.red)),
                    fromColor.green + (percent * (toColor.green - fromColor.green)),
                    fromColor.blue + (percent * (toColor.blue - fromColor.blue))
                );
            }
        },
        
        
        // Constructor /////////////////////////////////////////////////////////
        /** Create a new Color.
            @param red:number the red channel
            @param green:number the green channel
            @param blue:number the blue channel */
        initialize: function(red, green, blue) {
            this.setRed(red);
            this.setGreen(green);
            this.setBlue(blue);
        },
        
        
        // Accessors ///////////////////////////////////////////////////////////
        /** Sets the red channel value. */
        setRed: function(red) {
            this.red = Color.cleanChannelValue(red);
        },
        
        /** Sets the green channel value. */
        setGreen: function(green) {
            this.green = Color.cleanChannelValue(green);
        },
        
        /** Sets the blue channel value. */
        setBlue: function(blue) {
            this.blue = Color.cleanChannelValue(blue);
        },
        
        
        // Methods /////////////////////////////////////////////////////////////
        /** Gets the numerical representation of this color.
            @returns number: The number that represents this color. */
        getColorNumber: function() {
            return (this.red << 16) + (this.green << 8) + this.blue;
        },
        
        /** Gets the hex string representation of this color.
            @returns string: A hex color such as '#a0bbcc'. */
        getHtmlHexString: function() {
            return Color.rgbToHex(this.red, this.green, this.blue, true);
        },
        
        /** Tests if this color is lighter than the provided color.
            @param c:myt.Color the color to compare to.
            @returns boolean: True if this color is lighter, false otherwise. */
        isLighterThan: function(c) {
            var diff = this.getDiffFrom(c);
            
            // Sum channel diffs to determine lightest color. A negative diff
            // means a lighter color.
            return 0 > (diff.red + diff.green + diff.blue);
        },
        
        /** Gets an object holding color channel diffs.
            @param c:myt.Color the color to diff from.
            @returns object containing the diffs for the red, green and blue
                channels. */
        getDiffFrom: function(c) {
            return {
                red: c.red - this.red,
                green: c.green - this.green,
                blue: c.blue - this.blue
            };
        },
        
        /** Applies the provided diff object to this color.
            @param diff:object the color diff to apply.
            @returns this myt.Color to facilitate method chaining. */
        applyDiff: function(diff) {
            return this.add(diff);
        },
        
        /** Adds the provided color to this color.
            @param c:myt.Color the color to add.
            @returns this myt.Color to facilitate method chaining. */
        add: function(c) {
            this.setRed(this.red + c.red);
            this.setGreen(this.green + c.green);
            this.setBlue(this.blue + c.blue);
            return this;
        },
        
        /** Subtracts the provided color from this color.
            @param c:myt.Color the color to subtract.
            @returns this myt.Color to facilitate method chaining. */
        subtract: function(c) {
            this.setRed(this.red - c.red);
            this.setGreen(this.green - c.green);
            this.setBlue(this.blue - c.blue);
            return this;
        },
        
        /** Multiplys this color by the provided scalar.
            @param s:number the scaler to multiply by.
            @returns this myt.Color to facilitate method chaining. */
        multiply: function(s) {
            this.setRed(this.red * s);
            this.setGreen(this.green * s);
            this.setBlue(this.blue * s);
            return this;
        },
        
        /** Divides this color by the provided scalar.
            @param s:number the scaler to divide by.
            @returns this myt.Color to facilitate method chaining. */
        divide: function(s) {
            this.setRed(this.red / s);
            this.setGreen(this.green / s);
            this.setBlue(this.blue / s);
            return this;
        },
        
        /** Clones this Color.
            @returns myt.Color A copy of this myt.Color. */
        clone: function() {
            return new Color(this.red, this.green, this.blue);
        },
        
        /** Determine if this color has the same value as another color.
            @returns boolean True if this color has the same color values as
                this provided color, false otherwise. */
        equals: function(obj) {
            return obj === this || (obj && obj.isA && 
                obj.isA(Color) && 
                obj.red === this.red && 
                obj.green === this.green && 
                obj.blue === this.blue);
        }
    });
})(myt);


/** An ordered collection of points that can be applied to a canvas.
    
    Attributes:
        vectors:array The data is stored in a single array with the x coordinate
            first and the y coordinate second.
        _boundingBox:object the cached bounding box if it has been calculated.
*/
myt.Path = new JS.Class('Path', {
    // Constructor /////////////////////////////////////////////////////////////
    /** Create a new Path. */
    initialize: function(vectors) {
        this.setVectors(vectors || []);
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setVectors: function(v) {
        this._boundingBox = null;
        this.vectors = v;
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** Copy the data from the provided Path into this one.
        @param path:myt.Path
        @returns void */
    copyFrom: function(path) {
        this.vectors = path.vectors.slice();
        this._boundingBox = null;
    },
    
    /** Draws this path into the provided drawview. */
    drawInto: function(canvas) {
        canvas.beginPath();
        var vecs = this.vectors, len = vecs.length, i = 0;
        canvas.moveTo(vecs[i++], vecs[i++]);
        for (; len > i;) canvas.lineTo(vecs[i++], vecs[i++]);
        canvas.closePath();
    },
    
    /** Shift this path by the provided x and y amount. */
    translate: function(dx, dy) {
        var vecs = this.vectors, i = vecs.length;
        while (i) {
            vecs[--i] += dy;
            vecs[--i] += dx;
        }
        this._boundingBox = null;
    },
    
    /** Rotates this path around 0,0 by the provided angle in radians. */
    rotate: function(a) {
        var cosA = Math.cos(a), sinA = Math.sin(a),
            vecs = this.vectors, len = vecs.length,
            xNew, yNew, i = 0;
        for (; len > i;) {
            xNew = vecs[i] * cosA - vecs[i + 1] * sinA;
            yNew = vecs[i] * sinA + vecs[i + 1] * cosA;
            
            vecs[i++] = xNew;
            vecs[i++] = yNew;
        }
        this._boundingBox = null;
    },
    
    /** Rotates this path around the provided origin by the provided angle 
        in radians.
        @param angle:number the angle in radians
        @param xOrigin:number the x coordinate to rotate around.
        @param yOrigin:number the y coordinate to rotate around.
        @returns void */
    rotateAroundOrigin: function(angle, xOrigin, yOrigin) {
        this.translate(-xOrigin, -yOrigin);
        this.rotate(angle);
        this.translate(xOrigin, yOrigin);
    },
    
    /** Gets the bounding box for this path.
        @return object with properties x, y, width and height or null
            if no bounding box could be calculated. */
    getBoundingBox: function() {
        if (this._boundingBox) return this._boundingBox;
        
        var vecs = this.vectors, i = vecs.length, x, y, minX, maxX, minY, maxY;
        if (i >= 2) {
            minY = maxY = vecs[--i];
            minX = maxX = vecs[--i];
            while (i) {
                y = vecs[--i];
                x = vecs[--i];
                minY = Math.min(y, minY);
                maxY = Math.max(y, maxY);
                minX = Math.min(x, minX);
                maxX = Math.max(x, maxX);
            }
            return this._boundingBox = {x:minX, y:minY, width:maxX - minX, height:maxY - minY};
        }
        
        return this._boundingBox = null;
    },
    
    /** Gets the center point of the bounding box for the path.
        @returns object with properties x and y or null if no bounding box
            could be calculated. */
    getCenter: function() {
        var box = this.getBoundingBox();
        return box ? {
            x:box.x + box.width / 2,
            y:box.y + box.height / 2
        } : null;
    },
    
    /** Tests if the provided point is inside this path.
        @param x:number the x coordinate to test.
        @param y:number the y coordinate to test.
        
        Alternate params:
        @param x:object A point object with x and y properties.
        
        @return true if inside, false otherwise. */
    isPointInPath: function(x, y) {
        if (typeof x === 'object') {
            y = x.y;
            x = x.x;
        }
        return myt.Geometry.isPointInPath(x, y, this.getBoundingBox(), this.vectors);
    }
});


/** A collection of common drawing routines. */
myt.DrawingUtil = {
    // Methods /////////////////////////////////////////////////////////////////
    /** Draws a rounded rect into the provided drawview.
        @param r:Number the radius of the corners.
        @param thickness:Number the thickness of the line. If thickness is
            zero or less a fill will be done rather than an outline. */
    drawRoundedRect: (canvas, r, thickness, left, top, w, h) => {
        var bottom = top + h,
            right = left + w,
            PI = Math.PI;
        
        // We create a single path for both an outer and inner rounded rect.
        // The reason for this is that filling looks much better than stroking.
        canvas.beginPath();
        
        canvas.moveTo(left, top + r);
        
        canvas.lineTo(left, bottom - r);
        canvas.arc(left + r, bottom - r, r, PI, PI / 2, true);
        
        canvas.lineTo(right - r, bottom);
        canvas.arc(right - r, bottom - r, r, PI / 2, 0, true);
        
        canvas.lineTo(right, top + r);
        canvas.arc(right - r, top + r, r, 0, PI * 3 / 2, true);
        
        canvas.lineTo(left + r, top);
        canvas.arc(left + r, top + r, r, PI * 3 / 2, PI, true);
        
        canvas.closePath();
        
        if (thickness > 0) {
            r -= thickness;
            left += thickness;
            right -= thickness;
            top += thickness;
            bottom -= thickness;
            
            canvas.moveTo(left, top + r);
            
            canvas.arc(left + r, top + r, r, PI, PI * 3 / 2);
            
            canvas.lineTo(right - r, top);
            canvas.arc(right - r, top + r, r, PI * 3 / 2, 0);
            
            canvas.lineTo(right, bottom - r);
            canvas.arc(right - r, bottom - r, r, 0, PI / 2);
            
            canvas.lineTo(left + r, bottom);
            canvas.arc(left + r, bottom - r, r, PI / 2, PI);
            
            canvas.closePath();
        }
    },
    
    /** Draws a rect outline into the provided drawview.
        @param thickness:Number the thickness of the line. */
    drawRectOutline: (canvas, thickness, left, top, w, h) => {
        var bottom = top + h, 
            right = left + w,
            ileft = left + thickness,
            iright = right - thickness,
            itop = top + thickness,
            ibottom = bottom - thickness;
        
        canvas.beginPath();
        
        canvas.moveTo(left, top);
        canvas.lineTo(left, bottom);
        canvas.lineTo(right, bottom);
        canvas.lineTo(right, top);
        canvas.lineTo(left, top);
        
        canvas.lineTo(ileft, itop);
        canvas.lineTo(iright, itop);
        canvas.lineTo(iright, ibottom);
        canvas.lineTo(ileft, ibottom);
        canvas.lineTo(ileft, itop);
        
        canvas.closePath();
    },
    
    /** Draws a rounded rect with one or more flat corners.
        @param rTL:Number the radius for the top left corner.
        @param rTR:Number the radius for the top right corner.
        @param rBL:Number the radius for the bottom left corner.
        @param rBR:Number the radius for the bottom right corner. */
    drawPartiallyRoundedRect: (canvas, rTL, rTR, rBL, rBR, left, top, w, h) => {
        var bottom = top + h, right = left + w;
        
        canvas.beginPath();
        
        canvas.moveTo(left, top + rTL);
        
        canvas.lineTo(left, bottom - rBL);
        if (rBL > 0) canvas.quadraticCurveTo(left, bottom, left + rBL, bottom);
        
        canvas.lineTo(right - rBR, bottom);
        if (rBR > 0) canvas.quadraticCurveTo(right, bottom, right, bottom - rBR);
        
        canvas.lineTo(right, top + rTR);
        if (rTR > 0) canvas.quadraticCurveTo(right, top, right - rTR, top);
        
        canvas.lineTo(left + rTL, top);
        if (rTL > 0) canvas.quadraticCurveTo(left, top, left, top + rTL);
        
        canvas.closePath();
    },
    
    drawGradientArc: (canvas, centerX, centerY, r, ir, startAngle, endAngle, colors, segments) => {
        if (segments == null) segments = 60;
        
        var angleDelta = Math.PI / segments,
        
        // Antialiasing issues means we need to draw each polygon with a small 
        // overlap to fill the gap.
            angleOverlap =  Math.PI / 360,
        
        // Calculate Colors
            len = colors.length, i = 0, angleDiff, slices, diff;
        for (; len > i + 1; i++) {
            angleDiff = colors[i + 1].angle - colors[i].angle;
            slices = Math.round(angleDiff / angleDelta);
            diff = colors[i].color.getDiffFrom(colors[i + 1].color);
            colors[i].colorDelta = {red:diff.red / slices, green:diff.green / slices, blue:diff.blue / slices};
        }
        
        var path = new myt.Path([centerX + r, centerY, centerX + ir, centerY]),
            prevAngle, ix1, iy1, x1, y1,
            angle = startAngle;
        
        path.rotateAroundOrigin(angle, centerX, centerY);
        var vectors = path.vectors,
            x2 = vectors[0], y2 = vectors[1],
            ix2 = vectors[2], iy2 = vectors[3],
            diffCount = 0;
        
        i = 0;
        
        while (endAngle > angle) {
            // Shift angle and points
            x1 = x2;
            y1 = y2;
            ix1 = ix2;
            iy1 = iy2;
            prevAngle = angle;
            
            // Calculate new angle and points
            angle += angleDelta;
            if (angle > endAngle) {
                angleDelta += endAngle - angle;
                angleOverlap = 0;
                angle = endAngle;
            }
            path.rotateAroundOrigin(angleDelta + angleOverlap, centerX, centerY);
            x2 = vectors[0];
            y2 = vectors[1];
            ix2 = vectors[2];
            iy2 = vectors[3];
            
            // Draw part
            canvas.beginPath();
            canvas.moveTo(x1, y1);
            canvas.lineTo(ix1, iy1);
            canvas.lineTo(ix2, iy2);
            canvas.lineTo(x2, y2);
            canvas.closePath();
            
            var c = colors[i].color;
            var colorDelta = colors[i].colorDelta
            canvas.fillStyle = myt.Color.makeColorNumberFromChannels(
                c.red + (diffCount * colorDelta.red),
                c.green + (diffCount * colorDelta.green),
                c.blue + (diffCount * colorDelta.blue)
            );
            canvas.fill();
            
            if (angleOverlap > 0) {
                path.rotateAroundOrigin(-angleOverlap, centerX, centerY);
                x2 = vectors[0];
                y2 = vectors[1];
                ix2 = vectors[2];
                iy2 = vectors[3];
            }
            
            // Increment color
            diffCount++;
            if (angle >= colors[i + 1].angle) {
                diffCount = 0;
                i++;
            }
        }
    }
};


/** Encapsulates drawing into a myt.Canvas object. Contains a repository
    of DrawingMethod instances that can be accessed by class name. */
myt.DrawingMethod = new JS.Class('DrawingMethod', {
    // Class Methods and Attributes ////////////////////////////////////////////
    extend: {
        /** A map of DrawingMethod by class name. */
        _drawingMethods: {},
        
        /** Gets a DrawingMethod for the classname.
            @returns myt.DrawingMethod. */
        get: function(classname) {
            var drawingMethods = this._drawingMethods,
                drawingMethod = drawingMethods[classname];
            
            // Create the DrawingMethod if it wasn't found in the cache.
            if (!drawingMethod) {
                var drawingMethodClass = myt.resolveClassname(classname);
                if (drawingMethodClass) drawingMethods[classname] = drawingMethod = new drawingMethodClass();
            }
            
            return drawingMethod;
        },
        
        /** Gets a DrawingMethod and uses it to draw into the Canvas.
            @param classname:String the name of the class to draw with.
            @param canvas:myt.Canvas the canvas to draw into.
            @param config:Object (Optional) a map of configuration parameters 
                that control how the DrawingMethod draws. */
        draw: function(classname, canvas, config) {
            var drawingMethod = this.get(classname);
            if (drawingMethod) {
                drawingMethod.draw(canvas, config);
            } else {
                console.log("Unknown DrawingMethod", classname);
            }
        }
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** Draw into the Canvas.
        @param canvas:myt.Canvas the canvas to draw into.
        @param config:Object (Optional) a map of configuration parameters 
            that control how the DrawingMethod draws. */
    draw: function(canvas, config) {}
});


/** An myt.Button that makes use of an myt.DrawingMethod to display itself.
    
    Events:
        None
    
    Attributes:
        drawingMethodClassname:string the name of the class to draw with.
        drawingMethod:myt.DrawingMethod the instance to draw with. Obtained
            by resolving the drawingMethodClassname. This attribute should be
            treated as read only.
        drawBounds:object the bounds for drawing within.
    
    Private Attributes:
        __lastState:string The last draw state drawn.
*/
myt.DrawButton = new JS.Class('DrawButton', myt.Canvas, {
    include: [myt.Button],
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    initNode: function(parent, attrs) {
        this.drawBounds = {x:0, y:0, w:0, h:0};
        
        this.callSuper(parent, attrs);
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setDrawingMethodClassname: function(v) {
        if (this.drawingMethodClassname !== v) {
            this.drawingMethodClassname = v;
            this.setDrawingMethod(myt.DrawingMethod.get(v));
        }
    },
    
    setDrawingMethod: function(v) {
        if (this.drawingMethod !== v) {
            this.drawingMethod = v;
            if (this.inited) this.updateUI();
        }
    },
    
    /** Gets the bounds used by the DrawingMethod to draw within. By default
        this returns the bounds of this view.
        @returns an object with x, y, w and h properties. */
    getDrawBounds: function() {
        var bounds = this.drawBounds;
        bounds.w = this.width;
        bounds.h = this.height;
        return bounds;
    },
    
    getDrawConfig: function(state) {
        return {state:state, focused:this.focused, bounds:this.getDrawBounds()};
    },
    
    /** @overrides myt.View */
    setWidth: function(v, supressEvent) {
        this.callSuper(v, supressEvent);
        if (this.inited) this.redraw();
    },
    
    /** @overrides myt.View */
    setHeight: function(v, supressEvent) {
        this.callSuper(v, supressEvent);
        if (this.inited) this.redraw();
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** @overrides myt.Button */
    drawDisabledState: function() {
        this.setOpacity(myt.Button.DEFAULT_DISABLED_OPACITY);
        this.redraw('disabled');
    },
    
    /** @overrides myt.Button */
    drawHoverState: function() {
        this.setOpacity(1);
        this.redraw('hover');
    },
    
    /** @overrides myt.Button */
    drawActiveState: function() {
        this.setOpacity(1);
        this.redraw('active');
    },
    
    /** @overrides myt.Button */
    drawReadyState: function() {
        this.setOpacity(1);
        this.redraw('ready');
    },
    
    redraw: function(state) {
        // Used if redrawing for focus changes
        if (state == null) state = this.__lastState;
        this.__lastState = state;
        
        (this.drawingMethod || this).draw(this, this.getDrawConfig(state));
    },
    
    /** Used if no drawing method is found. */
    draw: function(canvas, config) {
        myt.dumpStack("No drawing method found");
    }
});


/** A panel that floats above everything else.
    
    Events:
        None
    
    Attributes:
        owner:myt.FloatingPanelAnchor The anchor that currently "owns" 
            this panel.
        panelId:string The unique ID for this panel instance.
        hideOnMouseDown:boolean If true this panel will be hidden when a
            mousedown occurs outside the panel. True by default.
        ignoreOwnerForHideOnMouseDown:boolean If true the owner view for this
            panel will also be ignored for mousedown events. True by default.
        ignoreOwnerForHideOnBlur:boolean If true the owner view for this
            panel will also be ignored for blur events. True by default.
        hideOnBlur:boolean If true this panel will be hidden when a
            focus traverses outside the panel. True by default.
*/
myt.FloatingPanel = new JS.Class('FloatingPanel', myt.View, {
    include: [myt.RootView],
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    initNode: function(parent, attrs) {
        // Create a dom element for the panel and insert it at the end of
        // the body.
        var elem = document.createElement('div');
        elem.style.position = 'absolute';
        myt.getElement().appendChild(elem);
        
        this.ignoreOwnerForHideOnMouseDown = this.ignoreOwnerForHideOnBlur = this.hideOnBlur = this.hideOnMouseDown = true;
        
        attrs.visible = attrs.focusEmbellishment = false;
        
        // Ensure the focus starts and ends with the panel
        attrs.focusable = attrs.focusCage = true;
        
        this.callSuper(elem, attrs);
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setOwner: function(v) {this.owner = v;},
    setPanelId: function(v) {this.panelId = v;},
    setIgnoreOwnerForHideOnMouseDown: function(v) {this.ignoreOwnerForHideOnMouseDown = v;},
    setHideOnBlur: function(v) {this.hideOnBlur = v;},
    setHideOnMouseDown: function(v) {this.hideOnMouseDown = v;},
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** @private */
    __doMouseDown: function(event) {
        var v = event.value, px = v.pageX, py = v.pageY;
        if (!this.containsPoint(px, py) && 
            (this.ignoreOwnerForHideOnMouseDown ? !this.owner.containsPoint(px, py) : true)
        ) {
            this.doMouseDownOutside();
        }
        return true;
    },
    
    /** Called when a mousedown occurs outside the floating panel. The default
        behavior is to hide the panel. This gives subclasses a chance to 
        provide different behavior.
        @returns void */
    doMouseDownOutside: function() {
        if (this.hideOnMouseDown) this.hide();
    },
    
    /** @overrides myt.FocusObservable
        Intercepts focus on this panel and refocuses to the "best" view.
        When focus enters the panel we give focus to the first focusable
        descendant of the panel. When leaving we ask the panel anchor
        where to give focus. */
    focus: function(noScroll) {
        var gf = myt.global.focus;
        if (this.owner && this.isAncestorOf(gf.focusedView)) {
            this.owner[gf.lastTraversalWasForward ? 'getNextFocusAfterPanel' : 'getPrevFocusAfterPanel'](this.panelId).focus(noScroll);
        } else {
            var ffv = this.getFirstFocusableDescendant();
            if (ffv === this) {
                // Process normally since focus is actually being set
                // on the panel.
                this.callSuper(noScroll);
            } else {
                ffv.focus(noScroll);
            }
        }
    },
    
    /** Gets the view to give focus to when this panel gets focus. Should be
        a descendant of the floating panel or the panel itself. Returns this 
        floating panel by default.
        @returns myt.View: The view to give focus to. */
    getFirstFocusableDescendant: function() {
        return this;
    },
    
    /** @private */
    __doFocusChange: function(event) {
        var v = event.value;
        if (v && !this.isAncestorOf(v)) this.doLostFocus();
    },
    
    /** Called when focus moves out of the floating panel. Hides the
        floating panel by default.
        @returns void */
    doLostFocus: function() {
        if (this.hideOnBlur) {
            if (this.ignoreOwnerForHideOnBlur && myt.global.focus.focusedView === this.owner) return;
            
            this.hide(true);
        }
    },
    
    /** Determines if this floating panel is being "shown" or not. Typically
        this means the floating panel is visible.
        @returns boolean: True if this panel is shown, otherwise false. */
    isShown: function() {
        return this.visible;
    },
    
    /** Shows the floating panel for the provided myt.FloatingPanelAnchor.
        @param panelAnchor:myt.FloatingPanelAnchor The floating panel anchor 
            to show the panel for.
        @returns void */
    show: function(panelAnchor) {
        if (!this.isShown()) {
            this.bringToFront();
            this.updateLocation(panelAnchor);
            this.setVisible(true);
            
            this.owner.notifyPanelShown(this);
            
            var g = myt.global;
            this.attachToDom(g.mouse, '__doMouseDown', 'mousedown', true);
            this.attachTo(g.focus, '__doFocusChange', 'focused');
        }
    },
    
    /** Hides the floating panel for the provided myt.FloatingPanelAnchor.
        @param ignoreRestoreFocus:boolean (Optional) If true the restoreFocus
            method will not be called. Defaults to undefined which is
            equivalent to false.
        @returns void */
    hide: function(ignoreRestoreFocus) {
        if (this.isShown()) {
            var g = myt.global;
            this.detachFromDom(g.mouse, '__doMouseDown', 'mousedown', true);
            this.detachFrom(g.focus, '__doFocusChange', 'focused');
            
            this.setVisible(false);
            this.owner.notifyPanelHidden(this);
            if (!ignoreRestoreFocus) this.restoreFocus();
            this.setOwner();
        }
    },
    
    /** Sends the focus back to the owner. Can be overridden to
        send the focus elsewhere.
        @returns void */
    restoreFocus: function() {
        if (this.owner) this.owner.focus();
    },
    
    /** Updates the x and y position of the floating panel for the provided 
        floating panel anchor.
        @param panelAnchor:myt.FloatingPanelAnchor The anchor to update the
            location for.
        @returns void */
    updateLocation: function(panelAnchor) {
        this.setOwner(panelAnchor);
        
        var panelId = this.panelId,
            align = panelAnchor.getFloatingAlignForPanelId(panelId),
            valign = panelAnchor.getFloatingValignForPanelId(panelId),
            anchorLocation = panelAnchor.getPagePosition(),
            x = 0, y = 0,
            type = typeof align;
        
        if (type === 'string') {
            x = anchorLocation.x + panelAnchor.getFloatingAlignOffsetForPanelId(panelId);
            switch(align) {
                case 'outsideRight': x += panelAnchor.width; break;
                case 'insideRight': x += panelAnchor.width - this.width; break;
                case 'outsideLeft': x -= this.width; break;
                case 'insideLeft': break;
                default: console.warn("Unexpected align value", type, align);
            }
        } else if (type === 'number') {
            // Absolute position
            x = align;
        } else {
            console.warn("Unexpected align type", type, align);
        }
        this.setX(x);
        
        // Vertical positioning
        type = typeof valign;
        
        if (type === 'string') {
            y = anchorLocation.y + panelAnchor.getFloatingValignOffsetForPanelId(panelId);
            switch(valign) {
                case 'outsideBottom': y += panelAnchor.height; break;
                case 'insideBottom': y += panelAnchor.height - this.height; break;
                case 'outsideTop': y -= this.height; break;
                case 'insideTop': break;
                default: console.warn("Unexpected valign value", type, valign);
            }
        } else if (type === 'number') {
            // Absolute position
            y = valign;
        } else {
            console.warn("Unexpected valign type", type, valign);
        }
        this.setY(y);
    }
});


/** Enables a view to act as the anchor point for a FloatingPanel.
    
    Events:
        floatingAlign:string
        floatingValign:string
        floatingAlignOffset:number
        floatingValignOffset:number
    
    Attributes:
        floatingPanelId:string If defined this is the panel ID that will be
            used by default in the various methods that require a panel ID.
        floatingAlign:string:number The horizontal alignment for panels shown 
            by this anchor. If the value is a string it is an alignment 
            identifier relative to this anchor. If the value is a number it is 
            an absolute position in pixels. Allowed values: 'outsideLeft', 
            'insideLeft', 'insideRight', 'outsideRight' or a number.
        floatingValign:string:number The vertical alignment for panels shown 
            by this anchor. If the value is a string it is an alignment 
            identifier relative to this anchor. If the value is a number it is 
            an absolute position in pixels. Allowed values: 'outsideTop', 
            'insideTop', 'insideBottom', 'outsideBottom' or a number.
        floatingAlignOffset:number The number of pixels to offset the panel
            position by horizontally.
        floatingValignOffset:number The number of pixels to offset the panel
            position by vertically.
        lastFloatingPanelShown:myt.FloatingPanel A reference to the last
            floating panel shown by this anchor.
*/
myt.FloatingPanelAnchor = new JS.Module('FloatingPanelAnchor', {
    // Class Methods and Attributes ////////////////////////////////////////////
    extend: {
        /** A map of FloatingPanel classes by panel ID. */
        classesByPanelId: {},
        
        /** A map of FloatingPanel instances by panel ID. */
        panelsByPanelId: {}
    },
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    initNode: function(parent, attrs) {
        this.floatingAlign = 'insideLeft';
        this.floatingValign = 'outsideBottom';
        this.floatingAlignOffset = this.floatingValignOffset = 0;
        
        this.callSuper(parent, attrs);
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setLastFloatingPanelShown: function(v) {this.lastFloatingPanelShown = v;},
    setLastFloatingPanelId: function(v) {this.floatingPanelId = v;},
    
    setFloatingAlign: function(v) {this.set('floatingAlign', v, true);},
    setFloatingValign: function(v) {this.set('floatingValign', v, true);},
    setFloatingAlignOffset: function(v) {this.set('floatingAlignOffset', v, true);},
    setFloatingValignOffset: function(v) {this.set('floatingValignOffset', v, true);},
    
    
    // Methods /////////////////////////////////////////////////////////////////
    createFloatingPanel: function(panelId, panelClass, panelInitAttrs) {
        panelId = panelId || this.floatingPanelId;
        
        var FPA = myt.FloatingPanelAnchor;
        panelClass = panelClass || FPA.classesByPanelId[panelId];
        if (!panelClass) {
            console.log("No panel class found for panelId:", panelId);
            return null;
        }
        
        panelInitAttrs = panelInitAttrs || {};
        panelInitAttrs.panelId = panelId;
        return FPA.panelsByPanelId[panelId] = new panelClass(null, panelInitAttrs);
    },
    
    getFloatingPanel: function(panelId) {
        return myt.FloatingPanelAnchor.panelsByPanelId[panelId || this.floatingPanelId];
    },
    
    toggleFloatingPanel: function(panelId) {
        var fp = this.getFloatingPanel(panelId = panelId || this.floatingPanelId);
        if (fp && fp.isShown()) {
            this.hideFloatingPanel(panelId);
        } else {
            this.showFloatingPanel(panelId);
        }
    },
    
    showFloatingPanel: function(panelId) {
        var fp = this.getFloatingPanel(panelId || this.floatingPanelId);
        if (fp) {
            fp.show(this);
            this.setLastFloatingPanelShown(fp);
        }
    },
    
    hideFloatingPanel: function(panelId) {
        var fp = this.getFloatingPanel(panelId || this.floatingPanelId);
        if (fp) {
            fp.hide();
            this.setLastFloatingPanelShown();
        }
    },
    
    /** Called when a floating panel has been shown for this anchor.
        @param panel:myt.FloatingPanel The panel that is now shown.
        @returns void */
    notifyPanelShown: function(panel) {
        // Subclasses to implement as needed.
        if (this.callSuper) this.callSuper();
    },
    
    /** Called when a floating panel has been hidden for this anchor.
        @param panel:myt.FloatingPanel The panel that is now hidden.
        @returns void */
    notifyPanelHidden: function(panel) {
        // Subclasses to implement as needed.
        if (this.callSuper) this.callSuper();
    },
    
    /** Called by the FloatingPanel to determine where to position itself
        horizontally. By default this returns the floatingAlign attribute. 
        Subclasses and instances should override this if panel specific 
        behavior is needed.
        @param panelId:string the ID of the panel being positioned.
        @returns:string|number an alignment identifer or absolute position. */
    getFloatingAlignForPanelId: function(panelId) {
        return this.floatingAlign;
    },
    
    /** Called by the FloatingPanel to determine where to position itself
        vertically. By default this returns the floatingAlign attribute. 
        Subclasses and instances should override this if panel specific 
        behavior is needed.
        @param panelId:string the ID of the panel being positioned.
        @returns:string|number an alignment identifer or absolute position. */
    getFloatingValignForPanelId: function(panelId) {
        return this.floatingValign;
    },
    
    /** Called by the FloatingPanel to determine where to position itself
        horizontally. By default this returns the floatingAlignOffset attribute. 
        Subclasses and instances should override this if panel specific 
        behavior is needed.
        @param panelId:string the ID of the panel being positioned.
        @returns:number the offset to use. */
    getFloatingAlignOffsetForPanelId: function(panelId) {
        return this.floatingAlignOffset;
    },
    
    /** Called by the FloatingPanel to determine where to position itself
        vertically. By default this returns the floatingValignOffset attribute. 
        Subclasses and instances should override this if panel specific 
        behavior is needed.
        @param panelId:string the ID of the panel being positioned.
        @returns:number the offset to use. */
    getFloatingValignOffsetForPanelId: function(panelId) {
        return this.floatingValignOffset;
    },
    
    /** @overrides myt.FocusObservable
        @returns the last floating panel shown if it exists and can be shown.
        Otherwise it returns the default. */
    getNextFocus: function() {
        var last = this.lastFloatingPanelShown;
        if (last && last.isShown()) return last;
        return this.callSuper ? this.callSuper() : null;
    },
    
    /** Called by the floating panel owned by this anchor to determine where
        to go to next after leaving the panel in the forward direction. */
    getNextFocusAfterPanel: function(panelId) {
        return this;
    },
    
    /** Called by the floating panel owned by this anchor to determine where
        to go to next after leaving the panel in the backward direction. */
    getPrevFocusAfterPanel: function(panelId) {
        return this;
    }
});


/** Defines the interface list view items must support.
    
    Events:
        None
    
    Attributes:
        listView:myt.ListView The list view this item is managed by.
*/
myt.ListViewItemMixin = new JS.Module('ListViewItemMixin', {
    // Accessors ///////////////////////////////////////////////////////////////
    setListView: function(v) {this.listView = v;},
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** Subclasses and/or implementations must implement this method. Should
        return the minimum width the list item needs to display itself.
        @returns number */
    getMinimumWidth: function() {
        return 0;
    },
    
    /** Part of a performance optimization. Called from ListView.__updateItems
        after the items have been inserted into the dom. Now we can actually
        measure text width. */
    syncToDom: function() {}
});


/** An item in an myt.ListView
    
    Events:
        None
    
    Attributes:
        None
*/
myt.ListViewItem = new JS.Class('ListViewItem', myt.SimpleIconTextButton, {
    include: [myt.ListViewItemMixin],
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    initNode: function(parent, attrs) {
        if (attrs.height == null) attrs.height = 24;
        
        if (attrs.activeColor == null) attrs.activeColor = '#bbbbbb';
        if (attrs.hoverColor == null) attrs.hoverColor = '#ffffff';
        if (attrs.readyColor == null) attrs.readyColor = '#eeeeee';
        
        if (attrs.contentAlign == null) attrs.contentAlign = 'left';
        if (attrs.inset == null) attrs.inset = 8;
        if (attrs.outset == null) attrs.outset = 8;
        
        if (attrs.activationKeys == null) attrs.activationKeys = [13,27,32,37,38,39,40];
        
        this.callSuper(parent, attrs);
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** @overrides myt.ListViewItemMixin */
    syncToDom: function() {
        this.textView.sizeViewToDom();
    },
    
    /** @overrides myt.ListViewItemMixin */
    getMinimumWidth: function() {
        var self = this,
            iconView = self.iconView,
            textView = self.textView,
            textViewVisible = textView.visible && self.text,
            iconWidth = iconView.visible ? iconView.width : 0,
            iconExtent = iconWidth + (textViewVisible && iconWidth > 0 ? self.iconSpacing : 0),
            textWidth = textViewVisible ? Math.ceil(textView.width) : 0;
        return self.inset + iconExtent + textWidth + self.outset;
    },
    
    /** @overrides myt.Button */
    doActivated: function() {
        this.listView.doItemActivated(this);
    },
    
    /** @overrides myt.Button */
    showFocusEmbellishment: function() {this.hideDefaultFocusEmbellishment();},
    
    /** @overrides myt.Button */
    hideFocusEmbellishment: function() {this.hideDefaultFocusEmbellishment();},
    
    /** @overrides myt.KeyActivation. */
    doActivationKeyDown: function(key, isRepeat) {
        switch (key) {
            case 27: // Escape
                this.listView.owner.hideFloatingPanel();
                return;
            case 37: // Left
            case 38: // Up
                myt.global.focus.prev();
                break;
            case 39: // Right
            case 40: // Down
                myt.global.focus.next();
                break;
        }
        
        this.callSuper(key, isRepeat);
    }
});


/** A separator item in an myt.ListView
    
    Events:
        None
    
    Attributes:
        None
*/
myt.ListViewSeparator = new JS.Class('ListViewSeparator', myt.View, {
    include: [myt.ListViewItemMixin],
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    initNode: function(parent, attrs) {
        if (attrs.height == null) attrs.height = 1;
        if (attrs.bgColor == null) attrs.bgColor = '#666666';
        
        this.callSuper(parent, attrs);
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** @overrides myt.ListViewItemMixin */
    getMinimumWidth: function() {
        return 0;
    }
});


/** A floating panel that contains a list of items.
    
    Events:
        maxHeight:number
    
    Attributes:
        minWidth:number The minimum width for the list. The list will size
            itself to fit the maximum width of the items in the list or this
            value whichever is larger. Defaults to 0.
        maxHeight:number The maximum height of the list view in pixels. If set 
            to -1 no max height will be used.
        defaultItemClass:JS.Class The class to use for list items if one is
            not provided in the config. Defaults to myt.ListViewItem.
        itemConfig:array An array of configuration information for the items
            in the list.
        items:array The array of items in the list.
*/
myt.ListView = new JS.Class('ListView', myt.FloatingPanel, {
    // Life Cycle //////////////////////////////////////////////////////////////
    initNode: function(parent, attrs) {
        this.items = [];
        this.maxHeight = -1;
        this.minWidth = 0;
        
        if (attrs.defaultItemClass == null) attrs.defaultItemClass = myt.ListViewItem;
        if (attrs.overflow == null) attrs.overflow = 'autoy';
        if (attrs.bgColor == null) attrs.bgColor = '#cccccc';
        if (attrs.boxShadow == null) attrs.boxShadow = myt.Button.DEFAULT_FOCUS_SHADOW_PROPERTY_VALUE;
        
        this.callSuper(parent, attrs);
        
        this.__updateItems();
        this.buildLayout();
    },
    
    buildLayout: function() {
        new myt.SpacedLayout(this.getContentView(), {
            axis:'y', spacing:1, collapseParent:true
        });
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setMinWidth: function(v) {this.minWidth = v;},
    setDefaultItemClass: function(v) {this.defaultItemClass = v;},
    setItemConfig: function(v) {
        this.itemConfig = v;
        if (this.inited) this.__updateItems();
    },
    
    /** Get the view that will contain list content.
        @returns myt.View */
    getContentView: function(v) {
        return this;
    },
    
    setMaxHeight: function(v) {
        if (this.maxHeight !== v) {
            this.maxHeight = v;
            if (this.inited) {
                this.fireEvent('maxHeight', v);
                this.setHeight(this.height);
            }
        }
    },
    
    /** @overrides myt.View */
    setHeight: function(v, supressEvent) {
        // Limit height if necessary
        if (this.maxHeight >= 0) v = Math.min(this.maxHeight, v);
        
        this.callSuper(v, supressEvent);
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** ListViewItems should call this method when they are activated. The
        default implementation invokes doItemActivated on the ListViewAnchor.
        @returns void */
    doItemActivated: function(itemView) {
        var owner = this.owner;
        if (owner) owner.doItemActivated(itemView);
    },
    
    /** @overrides myt.FloatingPanel */
    getFirstFocusableDescendant: function() {
        return this.getFirstFocusableItem() || this.callSuper();
    },
    
    getFirstFocusableItem: function() {
        var items = this.items, item, len = items.length, i = 0;
        for (; len > i; ++i) {
            item = items[i];
            if (item.isFocusable()) return item;
        }
        return null;
    },
    
    getLastFocusableItem: function() {
        var items = this.items, item, i = items.length;
        while (i) {
            item = items[--i];
            if (item.isFocusable()) return item;
        }
        return null;
    },
    
    /** @private */
    __updateItems: function() {
        var self = this,
            cfg = self.itemConfig || [],
            cfgLen = cfg.length, cfgItem, cfgClass, cfgAttrs,
            items = self.items, itemsLen = items.length, item,
            defaultItemClass = self.defaultItemClass,
            contentView = self.getContentView(), 
            layouts = contentView.getLayouts(), layout,
            layoutLen = layouts.length, i,
            minItemWidth, minWidth = self.minWidth;
        
        // Lock layouts during reconfiguration
        i = layoutLen;
        while (i) layouts[--i].incrementLockedCounter();
        
        // Performance: Remove from dom while doing inserts
        var de = contentView.getOuterDomElement(),
            nextDe = de.nextSibling,
            parentElem = de.parentNode;
        parentElem.removeChild(de);
        
        // Reconfigure list
        for (i = 0; cfgLen > i; ++i) {
            cfgItem = cfg[i];
            cfgClass = cfgItem.klass || defaultItemClass;
            cfgAttrs = cfgItem.attrs || {};
            
            item = items[i];
            
            // Destroy existing item if it's the wrong class
            if (item && !item.isA(cfgClass)) {
                item.destroy();
                item = null;
            }
            
            // Create a new item if no item exists
            if (!item) item = items[i] = new cfgClass(contentView, {listView:self});
            
            // Apply config to item
            if (item) {
                item.callSetters(cfgAttrs);
                
                // Create an item index to sort the layout subviews on. This
                // is necessary when the class of list items change so that the
                // newly created items don't end up out of order.
                item.__LAYOUT_IDX = i;
            }
        }
        
        // Performance: Put back in dom.
        parentElem.insertBefore(de, nextDe);
        
        // Measure width. Must be in dom at this point.
        for (i = 0; cfgLen > i; ++i) {
            item = items[i];
            item.syncToDom();
            minItemWidth = item.getMinimumWidth();
            if (minItemWidth > minWidth) minWidth = minItemWidth;
        }
        
        // Delete any remaining items
        for (; itemsLen > i; ++i) items[i].destroy();
        items.length = cfgLen;
        
        // Resize items and contentView
        for (i = 0; cfgLen > i; ++i) self.updateItemWidth(items[i], minWidth);
        self.updateContentWidth(contentView, minWidth);
        
        // Unlock layouts and update
        i = layoutLen;
        while (i) {
            layout = layouts[--i];
            layout.sortSubviews(function(a, b) {return a.__LAYOUT_IDX - b.__LAYOUT_IDX;});
            layout.decrementLockedCounter();
            layout.update();
        }
    },
    
    updateItemWidth: function(item, width) {
        item.setWidth(width);
    },
    
    updateContentWidth: function(contentView, width) {
        contentView.setWidth(width);
    }
});


/** The anchor for an myt.ListView.
    
    Events:
        None
    
    Attributes:
        listViewClass:JS.Class The class of list view to create. Defaults
            to myt.ListView.
        listViewAttrs:object The initialization attributes for the 
            listViewClass.
        itemConfig:array An array of configuration parameters for the items
            in the list.
*/
myt.ListViewAnchor = new JS.Module('ListViewAnchor', {
    include: [myt.FloatingPanelAnchor],
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    initNode: function(parent, attrs) {
        if (attrs.listViewClass == null) attrs.listViewClass = myt.ListView;
        if (attrs.listViewAttrs == null) attrs.listViewAttrs = {};
        if (attrs.itemConfig == null) attrs.itemConfig = [];
        
        // Assume this will be mixed onto something that implements 
        // myt.KeyActivation since it probably will.
        if (attrs.activationKeys == null) attrs.activationKeys = [13,27,32,37,38,39,40];
        
        this.callSuper(parent, attrs);
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setListViewClass: function(v) {this.listViewClass = v;},
    setListViewAttrs: function(v) {this.listViewAttrs = v;},
    setItemConfig: function(v) {this.itemConfig = v;},
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** Called by the list view when an item is activated. By default it
        hides the list view.
        @returns void */
    doItemActivated: function(itemView) {
        this.hideFloatingPanel();
    },
    
    /** @overrides myt.FloatingPanelAnchor */
    getFloatingPanel: function(panelId) {
        return this.callSuper(panelId) || this.createFloatingPanel(panelId, this.listViewClass, this.listViewAttrs);
    },
    
    /** @overrides myt.FloatingPanelAnchor */
    showFloatingPanel: function(panelId) {
        var fp = this.getFloatingPanel(panelId);
        if (fp) {
            fp.setItemConfig(this.itemConfig);
            this.callSuper(panelId);
        }
    },
    
    /** @overrides myt.KeyActivation. */
    doActivationKeyDown: function(key, isRepeat) {
        // Close for escape key.
        if (key === 27) {
            this.hideFloatingPanel();
            return;
        }
        
        // Select first/last if the list view is already open
        switch (key) {
            case 37: // Left
            case 38: // Up
                this.selectLastItem();
                break;
            case 39: // Right
            case 40: // Down
                this.selectFirstItem();
                break;
        }
        
        this.callSuper(key, isRepeat);
    },
    
    /** @overrides myt.KeyActivation. */
    doActivationKeyUp: function(key) {
        // Abort for escape key.
        if (key === 27) return;
        
        this.callSuper(key);
        
        // Select first/last after list view is open.
        switch (key) {
            case 37: // Left
            case 38: // Up
                this.selectLastItem();
                break;
            case 39: // Right
            case 40: // Down
                this.selectFirstItem();
                break;
        }
    },
    
    selectLastItem: function() {
        var fp = this.getFloatingPanel();
        if (fp && fp.isShown()) {
            var item = fp.getLastFocusableItem();
            if (item) item.focus();
        }
    },
    
    selectFirstItem: function() {
        var fp = this.getFloatingPanel();
        if (fp && fp.isShown()) {
            var item = fp.getFirstFocusableItem();
            if (item) item.focus();
        }
    }
});


/** Provides styling functionality for a Checkbox and other similar components.
    
    Requires:
        Should be used on: myt.DrawButton or subclass thereof.
    
    Events:
        None
    
    Attributes:
        None
*/
myt.CheckboxStyleMixin = new JS.Module('CheckboxStyleMixin', {
    // Class Methods and Attributes ////////////////////////////////////////////
    extend: {
        /** The x location of the "icon". */
        DEFAULT_PAD_X:3,
        /** The y location of the "icon". */
        DEFAULT_PAD_Y:4,
        /** The width of the "icon". */
        DEFAULT_WIDTH:14,
        /** The height of the "icon" */
        DEFAULT_HEIGHT:14,
        DEFAULT_FILL_COLOR_CHECKED: '#666666',
        DEFAULT_FILL_COLOR_HOVER: '#eeeeee',
        DEFAULT_FILL_COLOR_ACTIVE: '#cccccc',
        DEFAULT_FILL_COLOR_READY: '#ffffff',
        DEFAULT_EDGE_COLOR: '#333333',
        DEFAULT_EDGE_SIZE: 0.5
    },
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    initNode: function(parent, attrs) {
        if (attrs.width == null) attrs.width = this.getIconExtentX();
        if (attrs.height == null) attrs.height = this.getIconExtentY();
        if (attrs.focusEmbellishment == null) attrs.focusEmbellishment = false;
        
        var CSM = myt.CheckboxStyleMixin;
        if (attrs.fillColorChecked == null) attrs.fillColorChecked = CSM.DEFAULT_FILL_COLOR_CHECKED;
        if (attrs.fillColorHover == null) attrs.fillColorHover = CSM.DEFAULT_FILL_COLOR_HOVER;
        if (attrs.fillColorActive == null) attrs.fillColorActive = CSM.DEFAULT_FILL_COLOR_ACTIVE;
        if (attrs.fillColorReady == null) attrs.fillColorReady = CSM.DEFAULT_FILL_COLOR_READY;
        if (attrs.edgeColor == null) attrs.edgeColor = CSM.DEFAULT_EDGE_COLOR;
        if (attrs.edgeSize == null) attrs.edgeSize = CSM.DEFAULT_EDGE_SIZE;
        
        this.callSuper(parent, attrs);
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setFillColorChecked: function(v) {this.fillColorChecked = v;},
    setFillColorHover: function(v) {this.fillColorHover = v;},
    setFillColorActive: function(v) {this.fillColorActive = v;},
    setFillColorReady: function(v) {this.fillColorReady = v;},
    setEdgeColor: function(v) {this.edgeColor = v;},
    setEdgeSize: function(v) {this.edgeSize = v;},
    
    /** @overrides myt.DrawButton */
    setFocused: function(v) {
        this.callSuper(v);
        
        if (this.inited) this.redraw();
    },
    
    /** @overrides myt.DrawButton */
    getDrawBounds: function() {
        var bounds = this.drawBounds,
            CSM = myt.CheckboxStyleMixin;
        bounds.x = CSM.DEFAULT_PAD_X;
        bounds.y = CSM.DEFAULT_PAD_Y;
        bounds.w = CSM.DEFAULT_WIDTH;
        bounds.h = CSM.DEFAULT_HEIGHT;
        return bounds;
    },
    
    /** @overrides myt.DrawButton */
    getDrawConfig: function(state) {
        var self = this,
            config = self.callSuper(state);
        config.checkedColor = self.fillColorChecked;
        config.edgeColor = self.edgeColor;
        config.edgeSize = self.edgeSize;
        
        switch (state) {
            case 'hover':
                config.fillColor = self.fillColorHover;
                break;
            case 'active':
                config.fillColor = self.fillColorActive;
                break;
            case 'disabled':
            case 'ready':
                config.fillColor = self.fillColorReady;
                break;
            default:
        }
        return config;
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** Gets the horizontal size of the "icon" plus the padding
        needed around it to display a shadow. */
    getIconExtentX: function() {
        var CSM = myt.CheckboxStyleMixin;
        return CSM.DEFAULT_WIDTH + 2 * CSM.DEFAULT_PAD_X;
    },
    
    /** Gets the vertical size of the "icon" plus the padding
        needed around it to display a shadow. */
    getIconExtentY: function() {
        var CSM = myt.CheckboxStyleMixin;
        return CSM.DEFAULT_HEIGHT + 2 * CSM.DEFAULT_PAD_Y;
    }
});


/** Provides a setValue and getValue method.
    
    Events:
        value:*
    
    Attributes:
        value:* The stored value.
        valueFilter:function If it exists, values will be run through this
            filter function before being set on the component. By default
            no valueFilter exists. A value filter function must take a 
            single value as an argument and return a value.
*/
myt.ValueComponent = new JS.Module('ValueComponent', {
    // Life Cycle //////////////////////////////////////////////////////////////
    initNode: function(parent, attrs) {
        this.appendToEarlyAttrs('valueFilter','value');
        this.callSuper(parent, attrs);
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setValueFilter: function(v) {
        this.valueFilter = v;
        
        if (this.inited && v) this.setValue(this.value);
    },
    
    setValue: function(v) {
        if (this.valueFilter) v = this.valueFilter(v);
        
        if (this.value !== v) {
            this.value = v;
            if (this.inited) this.fireEvent('value', this.getValue());
        }
    },
    
    getValue: function() {
        return this.value;
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** Combines a value filter with any existing value filter.
        @param filter:function the value filter to add.
        @param where:string (optional) Determines where to add the filter.
            Supported values are 'first' and 'last'. Defaults to 'first'.
        @returns void */
    chainValueFilter: function(filter, where) {
        var existingFilter = this.valueFilter, chainedFilter = filter;
        if (existingFilter) {
            if (where === 'last') {
                chainedFilter = function(v) {return filter(existingFilter(v));};
            } else if (where === 'first' || where == null) {
                chainedFilter = function(v) {return existingFilter(filter(v));};
            }
        }
        this.setValueFilter(chainedFilter);
    }
});


/** Draws a checkbox into an myt.Canvas. */
myt.CheckboxDrawingMethod = new JS.Class('CheckboxDrawingMethod', myt.DrawingMethod, {
    // Constructor /////////////////////////////////////////////////////////////
    initialize: function() {
        this.__getTemplate = myt.memoize(this.__getTemplate);
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** @overrides myt.DrawingMethod */
    draw: function(canvas, config) {
        canvas.clear();
        canvas.drawImage(this.__getTemplate(config), 0, 0);
    },
    
    /** @private */
    __getTemplate: function(config) {
        var m = myt, 
            b = config.bounds, x = b.x, y = b.y, w = b.w, h = b.h,
            shadowBlur         = config.shadowBlur == null ? 2 : config.shadowBlur,
            shadowOffsetX      = config.shadowOffsetX == null ? 0 : config.shadowOffsetX,
            shadowOffsetY      = config.shadowOffsetY == null ? 1 : config.shadowOffsetY,
            radius             = config.radius == null ? 4 : config.radius,
            shadowColor        = config.shadowColor == null ? 'rgba(0, 0, 0, 0.3)' : config.shadowColor,
            focusedShadowColor = config.focusedShadowColor == null ? 'rgba(0, 0, 0, 0.5)' : config.focusedShadowColor,
            fillColor          = config.fillColor,
            focused            = config.focused,
            inset              = config.edgeSize,
            x2 = x + inset, 
            y2 = y + inset,
            w2 = w - 2*inset,
            h2 = h - 2*inset,
            darkColor = (m.Color.makeColorFromHexString(fillColor)).multiply(5/6),
            DU = m.DrawingUtil;
        
        var canvas = new m.Canvas(m.global.roots.getRoots()[0], {
            width:x + w + shadowOffsetX + shadowBlur, 
            height:y + h + shadowOffsetY + shadowBlur, 
            visible:false, 
            ignoreLayout:true, 
            ignorePlacement:true
        });
        var grd = canvas.createLinearGradient(x2, y2, x2, y2 + h2);
        
        // Border and shadow
        canvas.save();
        canvas.setShadowOffsetX(shadowOffsetX);
        canvas.setShadowOffsetY(shadowOffsetY);
        canvas.setShadowBlur(shadowBlur * (focused ? 2 : 1));
        canvas.setShadowColor(focused ? focusedShadowColor : shadowColor);
        
        DU.drawRoundedRect(canvas, radius, 0, x, y, w, h);
        canvas.setFillStyle(config.edgeColor);
        canvas.fill();
        canvas.restore();
        
        // Fill
        DU.drawRoundedRect(canvas, radius - inset, 0, x2, y2, w2, h2);
        grd.addColorStop(0, fillColor);
        grd.addColorStop(1, darkColor.getHtmlHexString());
        canvas.setFillStyle(grd);
        canvas.fill();
        
        // Checkmark
        if (config.checked) {
            var path = new m.Path([
                x2 + 2, y2 + 1/2 * h2,
                x2 + 1/2 * w2, y2 + h2 - 2,
                x + w + 3, y,
                x2 + 1/2 * w2, y2 + h2 - 6,
                x2 + 5, y2 + 1/2 * h2 - 2
            ]);
            path.drawInto(canvas);
            canvas.setFillStyle(config.checkedColor);
            canvas.fill();
        }
        
        var retval = canvas.__canvas;
        canvas.destroy();
        return retval;
    }
});


/** Mix onto a view to make it behave as a checkbox button. Use setValue to 
    set the checked state of the checkbox.
    
    Requires:
        Should be used on: myt.DrawButton or subclass thereof.
    
    Events:
        None
    
    Attributes:
        None
*/
myt.CheckboxMixin = new JS.Module('CheckboxMixin', {
    include: [myt.ValueComponent, myt.CheckboxStyleMixin],
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    initNode: function(parent, attrs) {
        if (attrs.value == null) attrs.value = false;
        if (attrs.drawingMethodClassname == null) attrs.drawingMethodClassname = 'myt.CheckboxDrawingMethod';
        
        this.callSuper(parent, attrs);
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    /** @overrides myt.ValueComponent */
    setValue: function(v) {
        if (this.value !== v) {
            this.callSuper(v);
            
            if (this.inited) this.redraw();
        }
    },
    
    /** @overrides myt.CheckboxStyleMixin */
    getDrawConfig: function(state) {
        var config = this.callSuper(state);
        config.checked = this.value;
        return config;
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** @overrides myt.DrawButton
        Toggle the value attribute when activated. */
    doActivated: function() {
        this.setValue(!this.value);
    }
});


/** A checkbox component. */
myt.Checkbox = new JS.Class('Checkbox', myt.DrawButton, {
    include: [myt.CheckboxMixin]
});


/** A checkbox component with a text label. */
myt.TextCheckbox = new JS.Class('TextCheckbox', myt.Checkbox, {
    include: [myt.TextButtonContent],
    
    
    // Class Methods and Attributes ////////////////////////////////////////////
    extend: {
        /** Padding on the left and right side of the text. */
        DEFAULT_PAD_X:2,
        /** Padding above the text when in multiline mode (shrinkToFit == false) */
        DEFAULT_MULTILINE_PAD_Y:4,
    },
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    doAfterAdoption: function() {
        var self = this,
            TC = myt.TextCheckbox,
            padX = TC.DEFAULT_PAD_X;
        self.setInset(self.getIconExtentX() + padX);
        self.setOutset(padX);
        
        if (!self.shrinkToFit) self.setTextY(TC.DEFAULT_MULTILINE_PAD_Y);
        
        self.callSuper();
    }
});


/** Draws a radio button into an myt.Canvas. */
myt.RadioDrawingMethod = new JS.Class('RadioDrawingMethod', myt.DrawingMethod, {
    // Constructor /////////////////////////////////////////////////////////////
    initialize: function() {
        this.__getTemplate = myt.memoize(this.__getTemplate);
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** @overrides myt.DrawingMethod */
    draw: function(canvas, config) {
        canvas.clear();
        canvas.drawImage(this.__getTemplate(config), 0, 0);
    },
    
    /** @private */
    __getTemplate: function(config) {
        var m = myt,
            b = config.bounds, x = b.x, y = b.y, w = b.w, h = b.h,
            shadowBlur         = config.shadowBlur == null ? 2 : config.shadowBlur,
            shadowOffsetX      = config.shadowOffsetX == null ? 0 : config.shadowOffsetX,
            shadowOffsetY      = config.shadowOffsetY == null ? 1 : config.shadowOffsetY,
            shadowColor        = config.shadowColor == null ? 'rgba(0, 0, 0, 0.3)' : config.shadowColor,
            focusedShadowColor = config.focusedShadowColor == null ? 'rgba(0, 0, 0, 0.5)' : config.focusedShadowColor,
            fillColor          = config.fillColor,
            focused            = config.focused,
            inset              = config.edgeSize,
            radius = w / 2,
            radius2 = radius - inset,
            dotRadius = (radius2 / 2) - 1,
            centerX = x + radius,
            centerY = y + radius,
            darkColor = (m.Color.makeColorFromHexString(fillColor)).multiply(5/6);
        
        var canvas = new m.Canvas(m.global.roots.getRoots()[0], {
            width:x + w + shadowOffsetX + shadowBlur, 
            height:y + h + shadowOffsetY + shadowBlur, 
            visible:false, 
            ignoreLayout:true, 
            ignorePlacement:true
        });
        var grd = canvas.createLinearGradient(x, y, x, y + w);
        
        // Border and shadow
        canvas.save();
        canvas.setShadowOffsetX(shadowOffsetX);
        canvas.setShadowOffsetY(shadowOffsetY);
        canvas.setShadowBlur(shadowBlur * (focused ? 2 : 1));
        canvas.setShadowColor(focused ? focusedShadowColor : shadowColor);
        
        canvas.beginPath();
        canvas.circle(centerX, centerY, radius);
        canvas.closePath();
        canvas.setFillStyle(config.edgeColor);
        canvas.fill();
        canvas.restore();
        
        // Fill
        canvas.beginPath();
        canvas.circle(centerX, centerY, radius2);
        canvas.closePath();
        grd.addColorStop(0, fillColor);
        grd.addColorStop(1, darkColor.getHtmlHexString());
        canvas.setFillStyle(grd);
        canvas.fill();
        
        // Checkmark
        if (config.checked) {
            canvas.beginPath();
            canvas.circle(centerX, centerY, dotRadius);
            canvas.closePath();
            canvas.setFillStyle(config.checkedColor);
            canvas.fill();
        }
        
        var retval = canvas.__canvas;
        canvas.destroy();
        return retval;
    }
});


/** Provides the capability for a Node to participate in a BAG.
    
    Events:
        None
    
    Attributes:
        None
    
    Private Attributes:
        __bags:array A list of BAGs this node is a member of.
*/
myt.BAGMembership = new JS.Module('BAGMembership', {
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides myt.Node */
    initNode: function(parent, attrs) {
        this.__bags = [];
        
        this.callSuper(parent, attrs);
    },
    
    /** @overrides myt.Node */
    destroyAfterOrphaning: function() {
        this.callSuper();
        
        var groups = this.__bags, i = groups.length, group;
        while (i) {
            group = groups[--i];
            this.removeFromBAG(group.attrName, group.groupId);
        }
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    isRegisteredWithBAG: function(group) {
        var groups = this.__bags, i = groups.length;
        while (i) {
            if (groups[--i] === group) return true;
        }
        return false;
    },
    
    getBAG: function(attrName, groupId) {
        return myt.BAG.getGroup(attrName, groupId);
    },
    
    /** Adds this node to the BAG for the groupId and
        attribute name.
        @param attrName:string
        @param groupId:string
        @returns void */
    addToBAG: function(attrName, groupId) {
        var group = this.getBAG(attrName, groupId);
        if (!this.isRegisteredWithBAG(group)) {
            this.__bags.push(group);
            group.register(this);
            
            // Monitor attribute
            if (!this.isAttachedTo(this, '__updateForBAG', attrName)) {
                this.attachTo(this, '__updateForBAG', attrName);
            }
        }
    },
    
    /** Removes this node from the BAG for the groupId and
        attribute name.
        @param attrName:string
        @param groupId:string
        @returns void */
    removeFromBAG: function(attrName, groupId) {
        var group = this.getBAG(attrName, groupId);
        if (this.isRegisteredWithBAG(group)) {
            var groups = this.__bags, i = groups.length, g, detach = true;
            while (i) {
                g = groups[--i];
                if (g === group) {
                    groups.splice(i, 1);
                    group.unregister(this);
                } else if (g.attrName === attrName) {
                    // Don't detach if another group is listening to the same attr.
                    detach = false;
                }
            }
            
            if (detach) this.detachFrom(this, '__updateForBAG', attrName);
        }
    },
    
    /** Called whenever an event for the attrName is fired.
        @private 
        @returns void */
    __updateForBAG: function(event) {
        var type = event.type,
            value = event.value,
            groups = this.__bags, i = groups.length, group;
        while (i) {
            group = groups[--i];
            if (group.attrName === type) {
                if (value) {
                    group.setTrue(this);
                } else {
                    group.setFalse(this);
                }
            }
        }
    }
});


/** Manages a boolean attribute on a collection of Nodes. Ensures that no more
    than one of the Nodes has the attribute set to true at one time.
    
    Events:
        attrName:string
        groupId:string
        trueNode:myt.Node
    
    Attributes:
        attrName:string The name of the boolean attribute to monitor and update.
        groupId:string The unqiue ID of the group.
        trueNode:myt.Node The node that is currently true. Will be null if no
            node is true.
    
    Private Attributes:
        __nodes:array A list of the currently registered nodes.
*/
myt.BAG = new JS.Class('BAG', {
    include: [myt.AccessorSupport, myt.Destructible, myt.Observable],
    
    
    // Class Methods and Attributes ////////////////////////////////////////////
    extend: {
        /** A data structure of groups stored as a map of maps. First level 
            is attribute name second level is group ID.
            @private */
        __groups: {},
        
        /** Generates a unique group id
            @return number */
        generateUniqueGroupId: function() {
            return myt.generateGuid();
        },
        
        /** Creates a new BAG.
            @param attrName:string
            @returns a new BAG. */
        createGroup: function(attrName) {
            return new BAG(attrName, this.generateUniqueGroupId());
        },
        
        /** Gets a BAG for the attribute name and group ID.
            @param attrName:string the name of the attribute to monitor.
            @param groupId:string the unique ID of the group.
            @returns the BAG */
        getGroup: function(attrName, groupId) {
            if (attrName && groupId) {
                var groups = this.__groups,
                    groupIdMap = groups[attrName] || (groups[attrName] = {});
                return groupIdMap[groupId] || (groupIdMap[groupId] = new myt.BAG(attrName, groupId));
            }
            return null;
        },
        
        /** Removes a BAG for the attribute name and group id.
            @param attrName:string the name of the attribute to monitor.
            @param groupId:string the unique ID of the group.
            @returns the removed BAG */
        removeGroup: function(attrName, groupId) {
            if (attrName && groupId) {
                var groups = this.__groups;
                if (groups) {
                    var groupIdMap = groups[attrName];
                    if (groupIdMap) {
                        var group = groupIdMap[groupId];
                        if (group) delete groupIdMap[groupId];
                        return group;
                    }
                }
            }
            return null;
        }
    },
    
    
    // Constructor /////////////////////////////////////////////////////////////
    initialize: function(attrName, groupId) {
        this.__nodes = [];
        this.trueNode = null;
        
        this.attrName = attrName;
        this.groupId = groupId;
    },

    
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides myt.Destructible */
    destroy: function() {
        if (this.trueNode) this.setTrueNode(null);
        
        if (this.__nodes.length === 0) myt.BAG.removeGroup(this.attrName, this.groupId);
        
        this.__nodes.length = 0;
        this.detachAllObservers();
        this.callSuper();
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setGroupId: function(v) {this.set('groupId', v, true);},
    setAttrName: function(v) {this.set('attrName', v, true);},
    setTrueNode: function(v) {this.set('trueNode', v, true);},
    getNodes: function() {return this.__nodes;},
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** Registeres a node with this group.
        @param node:myt.Node the node to register with this group.
        @returns void */
    register: function(node) {
        if (node && !this.isRegistered(node)) {
            this.__nodes.push(node);
            
            // If node is true then update for this.
            if (node[this.attrName]) this.setTrue(node);
        }
    },
    
    /** Unregisteres a node from this group.
        @param node:myt.Node the node to unregister from this group.
        @returns void */
    unregister: function(node) {
        if (node) {
            var nodes = this.__nodes, i = nodes.length;
            while (i) {
                if (node === nodes[--i]) {
                    nodes.splice(i, 1);
                    break;
                }
            }
            
            if (this.trueNode === node) this.setTrueNode(null);
            
            if (nodes.length === 0) this.destroy();
        }
    },
    
    /** Sets the attribute to true on the provided registered node and sets 
        it to false on all other registered nodes.
        @param node:myt.Node the node to set the attribute to true on.
        @returns void */
    setTrue: function(node) {
        if (node && this.trueNode !== node && this.isRegistered(node)) {
            var attrName = this.attrName,
                setterName = myt.AccessorSupport.generateSetterName(attrName),
                nodes = this.__nodes, i = nodes.length, n;
            
            this.setTrueNode(node);
            
            while (i) {
                n = nodes[--i];
                if (node === n) {
                    if (!n[attrName]) n[setterName](true);
                } else {
                    if (n[attrName]) n[setterName](false);
                }
            }
            
        }
    },
    
    /** Sets the attribute to false on the provided registered node.
        @param node:myt.Node the node to set the attribute to false on.
        @returns void */
    setFalse: function(node) {
        if (node && this.trueNode === node) {
            var setterName = myt.AccessorSupport.generateSetterName(this.attrName);
            node[setterName](false);
            this.setTrueNode(null);
        }
    },
    
    /** Checks if a node is already registered or not.
        @param node:myt.Node the node to test.
        @returns void */
    isRegistered: function(node) {
        var nodes = this.__nodes, i = nodes.length;
        while (i) {
            if (node === nodes[--i]) return true;
        }
        return false;
    }
});


/** Mix onto a view to make it behave as a radio button. Should be used
    on an myt.DrawButton or subclass thereof.
    
    Events:
        optionValue:* Fired when the optionValue changes.
        selected:boolean Fired when a radio is selected/deselected.
        groupId:string Fired when the groupId is changed.
    
    Attributes:
        optionValue:* The value of this radio button within the radio group.
        selected:boolean Indicates if this radio is selected or not.
        groupId:string The radio group ID this radio is a member of.
    
    Private Attributes:
        __initValue:* Holds the value if it is set during initialization until
            the end of initialization so the group value can be updated.
*/
myt.RadioMixin = new JS.Module('RadioMixin', {
    include: [myt.BAGMembership, myt.CheckboxStyleMixin],
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides */
    initNode: function(parent, attrs) {
        if (attrs.selected == null) attrs.selected = false;
        if (attrs.groupId == null) attrs.groupId = myt.generateGuid();
        if (attrs.drawingMethodClassname == null) attrs.drawingMethodClassname = 'myt.RadioDrawingMethod';
        
        this.callSuper(parent, attrs);
        
        if (this.__initValue !== undefined) {
            this.__updateGroupValue(this.__initValue);
            delete this.__initValue;
        }
        
        if (this.selected) {
            var bag = this.__getBAG();
            if (bag) bag.setTrue(this);
        }
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setOptionValue: function(v) {this.set('optionValue', v, true);},
    
    /** Sets the value of the radio group. Calling this method on any
        radio button in the group should have the same effect. */
    setValue: function(v) {
        if (this.inited) {
            this.__updateGroupValue(v);
        } else {
            this.__initValue = v;
        }
    },
    
    /** Gets the value of the 'selected' radio button in the group.
        @returns *: The value of the selected radio button. */
    getValue: function() {
        // Get selected radio
        var bag = this.__getBAG(),
            selectedRadio = bag ? bag.trueNode : null;
        return selectedRadio ? selectedRadio.optionValue : null;
    },
    
    setSelected: function(v) {
        if (this.selected !== v) {
            this.selected = v;
            if (this.inited) {
                this.fireEvent('selected', v);
                this.redraw();
            }
        }
    },
    
    setGroupId: function(v) {
        if (this.groupId !== v) {
            var oldGroupId = this.groupId;
            this.groupId = v;
            if (oldGroupId) this.removeFromBAG('selected', oldGroupId);
            if (v) this.addToBAG('selected', v);
            if (this.inited) this.fireEvent('groupId', v);
        }
    },
    
    /** @overrides myt.CheckboxStyleMixin */
    getDrawConfig: function(state) {
        var config = this.callSuper(state);
        config.checked = this.selected;
        return config;
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** @overrides myt.DrawButton */
    doActivated: function() {
        if (!this.selected) this.setValue(this.optionValue);
    },
    
    /** @private */
    __getBAG: function() {
        return this.getBAG('selected', this.groupId);
    },
    
    /** Search the radio group for a matching node and make that one the
        true node.
        @private */
    __updateGroupValue: function(v) {
        var bag = this.__getBAG();
        if (bag) {
            var nodes = bag.getNodes(), i = nodes.length, node;
            while (i) {
                node = nodes[--i];
                if (node.optionValue === v) {
                    bag.setTrue(node);
                    break;
                }
            }
        }
    }
});


/** A radio button component. */
myt.Radio = new JS.Class('Radio', myt.DrawButton, {
    include: [myt.RadioMixin]
});


/** A radio button component with a text label. */
myt.TextRadio = new JS.Class('TextRadio', myt.Radio, {
    include: [myt.TextButtonContent],
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    doAfterAdoption: function() {
        var self = this,
            TC = myt.TextCheckbox,
            padX = TC.DEFAULT_PAD_X;
        
        self.setInset(self.getIconExtentX() + padX);
        self.setOutset(padX);
        
        if (!self.shrinkToFit) self.setTextY(TC.DEFAULT_MULTILINE_PAD_Y);
        
        self.callSuper();
    }
});


/** Makes an object selectable.
    
    Events:
        selected:boolean
    
    Attributes:
        selected:boolean Indicates the object is selected.
*/
myt.Selectable = new JS.Module('Selectable', {
    // Accessors ///////////////////////////////////////////////////////////////
    setSelected: function(v) {
        // Adapt to event from syncTo
        if (v !== null && typeof v === 'object') v = v.value;
        
        if (this.selected !== v) {
            this.selected = v;
            if (this.inited && this.fireEvent) this.fireEvent('selected', v);
        }
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** Checks if this object is selected. */
    isSelected: function() {
        return this.selected ? true : false;
    },
    
    /** Checks if the provided myt.SelectionManager can select this object.
        Returns true by default.
        @returns boolean */
    canSelect: function(selectionManager) {
        return true;
    },
    
    /** Checks if the provided myt.SelectionManager can deselect this object.
        Returns true by default.
        @returns boolean */
    canDeselect: function(selectionManager) {
        return true;
    }
});


/** Manages the selection of one or more items.
    
    Events:
        itemSelected:object Fired when an item is selected. The event value is 
            the selected item.
        itemDeselected:object Fired when an item is deselected. The event 
            value is the deselected item.
        selectedCount:number Fired when the number of selected items changes.
    
    Attributes:
        itemSelectionId:string The name of the property on items that is used
            to differentiate them from each other for selection. The default
            value is 'id'.
        maxSelected:number The maximum number of items that can be selected.
            If -1 is provided the count is unlimited. If 1 is provided attempts
            to select when an item is already selected will result in the
            existing selection being cleared and the the new item being
            selected. Defaults to -1.
        selectedCount:number The number of selected items.
    
    Private Attributes:
        __selected:object A map of selected items by itemSelectionId.
        __lastSelectedItem:object A reference to the last item that was
            selected. If this item is deselected this will get set to null.
*/
myt.SelectionManager = new JS.Module('SelectionManager', {
    // Class Methods and Attributes ////////////////////////////////////////////
    extend: {
        /** Determines if we are in "add" mode for selection such that
            selections will only be increased not reduced. Typically this
            means the shift key is down.
            @returns boolean true if in add mode, false otherwise. */
        isAddMode: function() {
            return myt.global.keys.isShiftKeyDown();
        },
        
        /** Determines if we are in "toggle" mode for selection such that
            selections can be added to or removed from incrementally. Typically 
            this means the control or command key is down.
            @returns boolean true if in add mode, false otherwise. */
        isToggleMode: function() {
            return myt.global.keys.isAcceleratorKeyDown();
        }
    },
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    initNode: function(parent, attrs) {
        this.__selected = {};
        this.__lastSelectedItem = null;
        
        attrs.selectedCount = 0;
        
        if (attrs.itemSelectionId == null) attrs.itemSelectionId = 'id';
        if (attrs.maxSelected == null) attrs.maxSelected = -1;
        
        this.callSuper(parent, attrs);
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setItemSelectionId: function(v) {this.itemSelectionId = v;},
    setMaxSelected: function(v) {this.maxSelected = v;},
    
    setSelectedCount: function(v) {
        if (this.selectedCount !== v) {
            this.selectedCount = v;
            if (this.inited) this.fireEvent('selectedCount', v);
        }
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** A wrapper around myt.SelectionManager.isAddMode. */
    isAddMode: function() {
        return myt.SelectionManager.isAddMode();
    },
    
    /** A wrapper around myt.SelectionManager.isToggleMode. */
    isToggleMode: function() {
        return myt.SelectionManager.isToggleMode();
    },
    
    /** Gets the currently selected items.
        @returns array: The selected items. */
    getSelected: function() {
        var retval = [], items = this.__selected, key;
        for (key in items) retval.push(items[key]);
        return retval;
    },
    
    /** Selects the provided item.
        @param item:object The item to select.
        @returns void */
    select: function(item) {
        if (item && !this.isSelectedItem(item) && this.canSelectItem(item)) {
            item.setSelected(true);
            this.__selected[item[this.itemSelectionId]] = item;
            this.setSelectedCount(this.selectedCount + 1);
            
            this.__lastSelectedItem = item;
            
            this.doSelected(item);
            this.fireEvent('itemSelected', item);
        }
    },
    
    /** Called when an item is selected.
        @param item:myt.Selectable The newly selected item.
        @returns void */
    doSelected: function(item) {},
    
    /** Selects the item with the provided item selection ID.
        @param itemSelectionId:string
        @returns void */
    selectById: function(itemSelectionId) {
        this.select(this.getSelectableItem(itemSelectionId));
    },
    
    /** Checks if the item can be selected.
        @param item:object The item to test.
        @returns boolean: True if selection is allowed, false otherwise. */
    canSelectItem: function(item) {
        var ms = this.maxSelected, sc = this.selectedCount;
        
        if (ms === 0) {
            return false;
        } else if (ms === 1) {
            // Deselect current selection if necessary
            if (sc > 0) {
                this.deselectAll();
                if (this.selectedCount > 0) return false;
            }
        } else if (ms > 1) {
            if (sc >= ms) return false;
        }
        
        return item.canSelect(this);
    },
    
    /** Selects all items that can be selected.
        @returns void */
    selectAll: function() {
        var items = this.getSelectableItems(), i = items.length;
        while (i) this.select(items[--i]);
    },
    
    /** Deselects the provided item.
        @param item:object The item to deselect.
        @returns void */
    deselect: function(item) {
        if (this.isSelectedItem(item) && this.canDeselectItem(item)) {
            item.setSelected(false);
            delete this.__selected[item[this.itemSelectionId]];
            this.setSelectedCount(this.selectedCount - 1);
            
            if (this.__lastSelectedItem === item) this.__lastSelectedItem = null;
            
            this.doDeselected(item);
            this.fireEvent('itemDeselected', item);
        }
    },
    
    /** Called when an item is deselected.
        @param item:myt.Selectable The newly deselected item.
        @returns void */
    doDeselected: function(item) {},
    
    /** Deselects the item with the provided item selection ID.
        @param itemSelectionId:string
        @returns void */
    deselectById: function(itemSelectionId) {
        this.deselect(this.getSelectableItem(itemSelectionId));
    },
    
    /** Checks if the item can be deselected.
        @returns true if deselection is allowed, false otherwise. */
    canDeselectItem: function(item) {
        return item.canDeselect(this);
    },
    
    /** Deselects all selected items.
        @returns void */
    deselectAll: function() {
        var items = this.__selected, key;
        for (key in items) this.deselect(items[key]);
    },
    
    /** Checks if the item is selected.
        @param item:object The item to test.
        @returns boolean */
    isSelectedItem: function(item) {
        return item ? item.isSelected() : false;
    },
    
    /** Checks if all selectable items are selected.
        @returns boolean */
    areAllSelected: function() {
        return this.selectedCount === this.getSelectableItems().length;
    },
    
    /** Gets a list of items that are potentially selectable by this manager.
        By default assumes this is an myt.View and returns all 
        myt.Selectable subviews.
        @returns array */
    getManagedItems: function() {
        var retval = [], svs = this.getSubviews(), i = svs.length, sv;
        while (i) {
            sv = svs[--i];
            if (sv.isA(myt.Selectable)) retval.push(sv);
        }
        return retval;
    },
    
    /** Gets a list of items that can currently be selected by this manager.
        @returns array */
    getSelectableItems: function() {
        var items = this.getManagedItems(), i = items.length;
        while (i) {
            if (!items[--i].canSelect(this)) items.splice(i, 1);
        }
        return items;
    },
    
    /** Gets a selectable item with the the provided selection item ID.
        @param itemSelectionId:string
        @returns myt.Selectable: The item or null if not found. */
    getSelectableItem: function(itemSelectionId) {
        var items = this.getSelectableItems(), i = items.length, item,
            selectionAttr = this.itemSelectionId;
        while (i) {
            item = items[--i];
            if (item[selectionAttr] === itemSelectionId) return item;
        }
        return null;
    }
});


/** A mixin that allows myt.TabSliders to be added to a view.
    
    Events:
        None
    
    Attributes:
        spacing:number The spacing between tab sliders. Defaults to
            myt.TabSliderContainer.DEFAULT_SPACING which is 1.
*/
myt.TabSliderContainer = new JS.Module('TabSliderContainer', {
    include: [myt.SelectionManager],
    
    
    // Class Methods and Attributes ////////////////////////////////////////////
    extend: {
        DEFAULT_SPACING:1
    },
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    initNode: function(parent, attrs) {
        this._tabSliders = [];
        
        attrs.defaultPlacement = 'container';
        
        if (attrs.spacing == null) attrs.spacing = myt.TabSliderContainer.DEFAULT_SPACING;
        if (attrs.overflow == null) attrs.overflow = 'autoy';
        if (attrs.itemSelectionId == null) attrs.itemSelectionId = 'tabId';
        if (attrs.maxSelected == null) attrs.maxSelected = 1;
        
        this.updateLayout = myt.debounce(this.updateLayout);
        
        this.callSuper(parent, attrs);
    },
    
    doAfterAdoption: function() {
        var self = this,
            M = myt,
            TS = M.TabSlider;
        var container = new M.View(self, {
            name:'container', ignorePlacement:true, percentOfParentWidth:100
        }, [M.SizeToParent, {
            /** @overrides myt.View */
            subnodeAdded: function(node) {
                this.callSuper(node);
                if (node instanceof TS) {
                    self._tabSliders.push(node);
                    self.attachTo(node, 'updateLayout', 'selected');
                }
            },
            
            /** @overrides myt.View */
            subnodeRemoved: function(node) {
                if (node instanceof TS) {
                    var tabSliders = self._tabSliders, i = tabSliders.length;
                    while (i) {
                        if (tabSliders[--i] === node) {
                            self.detachFrom(node, 'updateLayout', 'selected');
                            tabSliders.splice(i, 1);
                            break;
                        }
                    }
                }
                this.callSuper(node);
            }
        }]);
        new M.SpacedLayout(container, {name:'layout', axis:'y', spacing:self.spacing, collapseParent:true});
        
        self.attachTo(self, 'updateLayout', 'height');
        
        self.callSuper();
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setSpacing: function(v) {
        if (this.spacing !== v) {
            this.spacing = v;
            if (this.layout) this.layout.setSpacing(v);
        }
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    updateLayout: function(event) {
        var tabSliders = this._tabSliders, 
            i = tabSliders.length, 
            tabSlider,
            min = 0, 
            preferred = 0, 
            visCount = 0, 
            collapsedHeight;
        
        while (i) {
            tabSlider = tabSliders[--i];
            
            if (tabSlider.visible) {
                ++visCount;
                if (tabSlider.selected) {
                    min += tabSlider.getMinimumExpandedHeight();
                    preferred += tabSlider.getPreferredExpandedHeight();
                } else {
                    collapsedHeight = tabSlider.getCollapsedHeight();
                    min += collapsedHeight;
                    preferred += collapsedHeight;
                }
            }
        }
        
        var layout = this.container.layout,
            layoutOverage = layout.inset + layout.outset + layout.spacing * (visCount - 1);
        min += layoutOverage;
        preferred += layoutOverage;
        
        var h = this.height,
            minIsOver = min > h,
            preferredIsOver = preferred > h,
            overage = preferred - h,
            tabPreferred, tabMin, newVal;
        
        i = tabSliders.length;
        while (i) {
            tabSlider = tabSliders[--i];
            
            if (tabSlider.visible) {
                if (tabSlider.selected) {
                    if (minIsOver) {
                        newVal = tabSlider.getMinimumExpandedHeight();
                    } else if (preferredIsOver) {
                        tabPreferred = tabSlider.getPreferredExpandedHeight();
                        tabMin = tabSlider.getMinimumExpandedHeight();
                        
                        newVal = tabPreferred - overage;
                        if (tabMin > newVal) {
                            overage -= tabPreferred - tabMin;
                            newVal = tabMin;
                        } else {
                            overage = 0;
                        }
                    } else {
                        newVal = tabSlider.getPreferredExpandedHeight();
                    }
                    tabSlider.expand(newVal);
                } else {
                    tabSlider.collapse();
                }
            }
        }
    }
});


/** A tab slider component.
    
    Events:
        expansionState:string Fired when the tab slider changes expansion state.
    
    Attributes:
        tabId:string The unique ID for this tab slider relative to the
            tab slider container that manages this tab slider.
        tabContainer:myt.TabSliderContainer The tab slider container that 
            manages this tab.
        buttonClass:JS.Class The class to use for the button portion of the
            tab slider. Defaults to myt.SimpleButton.
        fillColorSelected:color The color of the button when selected.
        fillColorHover:color The color of the button when moused over.
        fillColorActive:color The color of the button while active.
        fillColorReady:color The color of the button when ready for interaction.
        buttonHeight:number The height of the button portion of the tab slider.
            Defaults to myt.TabSlider.DEFAULT_BUTTON_HEIGHT which is 30.
        minContainerHeight:number The minimum height of the content container
            inside this tab slider. Defaults to 
            myt.TabSlider.DEFAULT_MINIMUM_CONTAINER_HEIGHT which is 100.
        expansionState:string Indicates the expansion state of the tab slider.
            Supported values are: 'expanded', 'expanding', 'collapsed' and
            'collapsing'. Defaults to 'collapsed'.
*/
myt.TabSlider = new JS.Class('TabSlider', myt.View, {
    include: [myt.Selectable, myt.Disableable, myt.SizeToParent],
    
    
    // Class Methods and Attributes ////////////////////////////////////////////
    extend: {
        DEFAULT_BUTTON_HEIGHT:30,
        /** The minimum height of the container when expanded. */
        DEFAULT_MINIMUM_CONTAINER_HEIGHT:100,
        DEFAULT_FILL_COLOR_SELECTED:'#666666',
        DEFAULT_FILL_COLOR_HOVER:'#eeeeee',
        DEFAULT_FILL_COLOR_ACTIVE:'#cccccc',
        DEFAULT_FILL_COLOR_READY:'#ffffff',
        DEFAULT_ANIMATION_MILLIS:500
    },
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides myt.Checkbox */
    initNode: function(parent, attrs) {
        var self = this,
            TS = myt.TabSlider,
            initiallySelected;
        
        attrs.defaultPlacement = 'wrapper.container';
        attrs.percentOfParentWidth = 100;
        attrs.expansionState = 'collapsed';
        
        if (attrs.tabId == null) attrs.tabId = myt.generateGuid();
        if (attrs.tabContainer == null) attrs.tabContainer = parent;
        
        if (attrs.selected == null) attrs.selected = false;
        if (attrs.buttonClass == null) attrs.buttonClass = myt.SimpleButton;
        if (attrs.zIndex == null) attrs.zIndex = 0;
        
        if (attrs.buttonHeight == null) attrs.buttonHeight = TS.DEFAULT_BUTTON_HEIGHT;
        if (attrs.fillColorSelected == null) attrs.fillColorSelected = TS.DEFAULT_FILL_COLOR_SELECTED;
        if (attrs.fillColorHover == null) attrs.fillColorHover = TS.DEFAULT_FILL_COLOR_HOVER;
        if (attrs.fillColorActive == null) attrs.fillColorActive = TS.DEFAULT_FILL_COLOR_ACTIVE;
        if (attrs.fillColorReady == null) attrs.fillColorReady = TS.DEFAULT_FILL_COLOR_READY;
        if (attrs.minContainerHeight == null) attrs.minContainerHeight = TS.DEFAULT_MINIMUM_CONTAINER_HEIGHT;
        
        // Selection must be done via the select method on the tabContainer
        if (attrs.selected) {
            initiallySelected = true;
            delete attrs.selected;
        }
        
        self.callSuper(parent, attrs);
        
        if (initiallySelected) self.tabContainer.select(self);
        if (attrs.disabled === true) self.setDisabled(true);
        
        self.setHeight(self.getCollapsedHeight());
    },
    
    doAfterAdoption: function() {
        var self = this, 
            M = myt
            V = M.View;
        new self.buttonClass(self, {
            name:'button', ignorePlacement:true, zIndex:1,
            height:self.buttonHeight,
            focusEmbellishment:true,
            groupId:self.parent.parent.groupId,
            percentOfParentWidth:100,
            hoverColor:self.fillColorHover,
            activeColor:self.fillColorActive,
            readyColor:self.fillColorReady
        }, [M.SizeToParent, {
            /** @overrides myt.Button */
            doActivated: function() {
                var tc = self.tabContainer;
                if (self.isSelected() && tc.maxSelected !== 1) {
                    tc.deselect(self);
                } else {
                    tc.select(self);
                }
            },
            
            /** @overrides myt.Button. */
            updateUI: function() {
                this.callSuper();
                if (self.selected && self.tabContainer.maxSelected !== -1) this.setBgColor(self.fillColorSelected);
                self.notifyButtonRedraw();
            }
        }]);
        
        var wrapper = new V(self, {
            name:'wrapper', ignorePlacement:true,
            y:self.buttonHeight, height:0,
            visible:false, maskFocus:true,
            overflow:'hidden', percentOfParentWidth:100
        }, [M.SizeToParent, {
            setHeight: function(v, supressEvent) {
                this.callSuper(Math.round(v), supressEvent);
            },
            setWidth: function(v, supressEvent) {
                this.callSuper(v, supressEvent);
                if (this.inited) this.container.setWidth(v);
            }
        }]);
        
        var container = new V(wrapper, {name:'container'});
        new M.SizeToChildren(container, {axis:'y'});
        
        self.applyConstraint('__updateHeight', [wrapper, 'y', wrapper, 'height']);
        
        self.callSuper();
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    /** @overrides myt.Selectable */
    setSelected: function(v) {
        this.callSuper(v);
        if (this.button) this.button.updateUI();
    },
    
    setTabId: function(v) {this.tabId = v;},
    setTabContainer: function(v) {this.tabContainer = v;},
    
    setMinContainerHeight: function(v) {this.minContainerHeight = v;},
    setButtonClass: function(v) {this.buttonClass = v;},
    setFillColorSelected: function(v) {this.fillColorSelected = v;},
    setFillColorHover: function(v) {this.fillColorHover = v;},
    setFillColorActive: function(v) {this.fillColorActive = v;},
    setFillColorReady: function(v) {this.fillColorReady = v;},
    
    setButtonHeight: function(v) {
        if (this.buttonHeight !== v) {
            this.buttonHeight = v;
            if (this.button) {
                this.button.setHeight(v);
                this.wrapper.setY(v);
            }
        }
    },
    
    setExpansionState: function(v) {
        if (this.expansionState !== v) {
            this.expansionState = v;
            if (this.inited) this.fireEvent('expansionState', v);
            
            var wrapper = this.wrapper;
            if (wrapper) {
                if (v === 'expanded') {
                    wrapper.setMaskFocus(false);
                    wrapper.setOverflow('auto');
                } else if (v === 'expanding') {
                    wrapper.setVisible(true);
                } else if (v === 'collapsed') {
                    wrapper.setVisible(false);
                } else if (v === 'collapsing') {
                    wrapper.setMaskFocus(true);
                    wrapper.setOverflow('hidden');
                }
            }
        }
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** @overrides myt.Disableable */
    doDisabled: function() {
        var btn = this.button;
        if (btn) btn.setDisabled(this.disabled);
    },
    
    /** Called whenever the button is redrawn. Gives subclasses/instances
        a chance to do additional things when the button is redrawn.
        @returns void */
    notifyButtonRedraw: function() {},
    
    /** @private */
    __updateHeight: function(event) {
        this.setHeight(this.wrapper.y + this.wrapper.height);
    },
    
    /** Should only be called from the TabSliderContainer.
        @private */
    expand: function(targetHeight) {
        var self = this,
            wrapper = self.wrapper,
            to = targetHeight - self.getCollapsedHeight();
        
        self.setExpansionState('expanding');
        
        wrapper.stopActiveAnimators();
        
        if (wrapper.height !== to) {
            wrapper.animate({
                attribute:'height', to:to, 
                duration:myt.TabSlider.DEFAULT_ANIMATION_MILLIS
            }).next(function(success) {self.setExpansionState('expanded');});
        } else {
            self.setExpansionState('expanded');
        }
    },
    
    /** Should only be called from the TabSliderContainer.
        @private */
    collapse: function() {
        this.setExpansionState('collapsing');
        
        var wrapper = this.wrapper;
        
        wrapper.stopActiveAnimators();
        
        if (wrapper.height !== 0) {
            var self = this;
            wrapper.animate({
                attribute:'height', to:0, 
                duration:myt.TabSlider.DEFAULT_ANIMATION_MILLIS
            }).next(function(success) {self.setExpansionState('collapsed');});
        } else {
            this.setExpansionState('collapsed');
        }
    },
    
    /** Gets the height of the tab slider when it is collapsed. Will be the
        height of the button portion of the tab slider.
        @returns number */
    getCollapsedHeight: function() {
        return this.buttonHeight;
    },
    
    /** Gets the minimum height. Will be the smaller of the preferred height
        or the buttonHeight + minContainerHeight. Thus, if the content is
        smaller than the minContainerHeight extra space will not be shown.
        @returns number */
    getMinimumExpandedHeight: function() {
        return Math.min(this.getPreferredExpandedHeight(), this.buttonHeight + this.minContainerHeight);
    },
    
    /** Gets the preferred height that would allow the container to be shown
        without vertical scrollbars.
        @returns number */
    getPreferredExpandedHeight: function() {
        return this.buttonHeight + this.wrapper.container.height;
    }
});


/** A tab slider with a text label.
    
    Events:
        None
    
    Attributes:
        labelTextColorChecked:color
        labelTextColor:color
        text:string The text for the tab slider.
*/
myt.TextTabSlider = new JS.Class('TextTabSlider', myt.TabSlider, {
    // Class Methods and Attributes ////////////////////////////////////////////
    extend: {
        DEFAULT_LABEL_TEXT_COLOR_CHECKED: '#ffffff',
        DEFAULT_LABEL_TEXT_COLOR: '#333333'
    },
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    initNode: function(parent, attrs) {
        var TTS = myt.TextTabSlider;
        if (attrs.labelTextColorChecked == null) attrs.labelTextColorChecked = TTS.DEFAULT_LABEL_TEXT_COLOR_CHECKED;
        if (attrs.labelTextColor == null) attrs.labelTextColor = TTS.DEFAULT_LABEL_TEXT_COLOR;
        
        this.callSuper(parent, attrs);
        
        new myt.Text(this.button, {
            name:'label', domClass:'myt-Text mytTextTabSliderLabel', ignorePlacement:true,
            text:this.text, align:'center', valign:'middle', 
            textColor:this.__getTextColor()
        });
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setLabelTextColorChecked: function(v) {this.labelTextColorChecked = v;},
    setLabelTextColor: function(v) {this.labelTextColor = v;},
    
    setText: function(v) {
        if (this.text !== v) {
            this.text = v;
            var button = this.button;
            if (button && button.label) button.label.setText(v);
        }
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** @overrides myt.TabSlider */
    notifyButtonRedraw: function() {
        var label = this.button.label;
        if (label) label.setTextColor(this.__getTextColor());
    },
    
    /** @private */
    __getTextColor: function() {
        return (this.selected && this.tabContainer.maxSelected !== -1) ? this.labelTextColorChecked : this.labelTextColor;
    }
});


/** A mixin that allows myt.Tabs to be added to a view.
    
    Events:
        None
    
    Attributes:
        layout:myt.SpacedLayout The layout for the tabs.
        location:string The location of the tabs relative to the container.
            Supported values are: 'top', 'bottom', 'left' and 'right'. Defaults
            to 'top'.
        spacing:number The spacing between tabs. Defaults to 1.
        inset:number The inset for the layout. Defaults to 0.
*/
myt.TabContainer = new JS.Module('TabContainer', {
    include: [myt.SelectionManager],
    
    
    // Class Methods and Attributes ////////////////////////////////////////////
    extend: {
        DEFAULT_SPACING:1,
        DEFAULT_INSET:0
    },
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    initNode: function(parent, attrs) {
        this.__tabs = [];
        
        var TC = myt.TabContainer;
        if (attrs.spacing == null) attrs.spacing = TC.DEFAULT_SPACING;
        if (attrs.inset == null) attrs.inset = TC.DEFAULT_INSET;
        
        if (attrs.location == null) attrs.location = 'top';
        
        if (attrs.itemSelectionId == null) attrs.itemSelectionId = 'tabId';
        if (attrs.maxSelected == null) attrs.maxSelected = 1;
        
        this.callSuper(parent, attrs);
        
        var axis;
        switch (this.location) {
            case 'top':
            case 'bottom':
                axis = 'x';
                break;
            case 'left':
            case 'right':
                axis = 'y';
                break;
        }
        
        new myt.SpacedLayout(this, {
            name:'layout', axis:axis, spacing:this.spacing, inset:this.inset,
            collapseParent:true
        });
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setLocation: function(v) {this.location = v;},
    
    setSpacing: function(v) {
        if (this.spacing !== v) {
            this.spacing = v;
            if (this.layout) this.layout.setSpacing(v);
        }
    },
    
    setInset: function(v) {
        if (this.inset !== v) {
            this.inset = v;
            if (this.layout) this.layout.setInset(v);
        }
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    getFirstTab: function() {
        return this.__tabs[0];
    },
    
    /** Gets the currently selected tab.
        @returns myt.Tab or undefined if no tab is selected. */
    getSelectedTab: function() {
        return this.getSelected()[0];
    },
    
    /** @overrides myt.View */
    subnodeAdded: function(node) {
        this.callSuper(node);
        if (node.isA(myt.TabMixin)) {
            this.__tabs.push(node);
            
            switch (this.location) {
                case 'top':
                    node.setValign('bottom');
                    break;
                case 'bottom':
                    node.setValign('top');
                    break;
                case 'left':
                    node.setAlign('right');
                    break;
                case 'right':
                    node.setAlign('left');
                    break;
            }
        }
    },
    
    /** @overrides myt.View */
    subnodeRemoved: function(node) {
        if (node.isA(myt.TabMixin)) {
            var tabs = this.__tabs, i = tabs.length;
            while (i) {
                if (tabs[--i] === node) {
                    tabs.splice(i, 1);
                    break;
                }
            }
        }
        this.callSuper(node);
    }
});


/** A tab component.
    
    Requires:
        myt.Activateable
    
    Events:
        None
    
    Attributes:
        tabId:string The unique ID of this tab relative to its tab container.
        tabContainer:myt.TabContainer The tab container that manages this tab.
*/
myt.TabMixin = new JS.Module('TabMixin', {
    include: [myt.Selectable],
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides */
    initNode: function(parent, attrs) {
        if (attrs.tabId == null) attrs.tabId = myt.generateGuid();
        if (attrs.tabContainer == null) attrs.tabContainer = parent;
        
        // Selection must be done via the select method on the tabContainer
        var initiallySelected;
        if (attrs.selected) {
            initiallySelected = true;
            delete attrs.selected;
        }
        
        this.callSuper(parent, attrs);
        
        if (initiallySelected) this.tabContainer.select(this);
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setTabId: function(v) {this.tabId = v;},
    setTabContainer: function(v) {this.tabContainer = v;},
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** @overrides myt.Activateable */
    doActivated: function() {
        if (!this.selected) this.tabContainer.select(this);
    }
});


((pkg) => {
    var
        updateTextColor = (tab) => {
            tab.textView.setTextColor(tab.selected ? tab.labelTextSelectedColor : tab.labelTextColor);
        },
        
        updateCornerRadius = (tab) => {
            var r = tab.cornerRadius != null ? tab.cornerRadius : Tab.DEFAULT_RADIUS;
            switch (tab.tabContainer.location) {
                case 'top':
                    tab.setRoundedTopLeftCorner(r);
                    tab.setRoundedTopRightCorner(r);
                    break;
                case 'bottom':
                    tab.setRoundedBottomLeftCorner(r);
                    tab.setRoundedBottomRightCorner(r);
                    break;
                case 'left':
                    tab.setRoundedTopLeftCorner(r);
                    tab.setRoundedBottomLeftCorner(r);
                    break;
                case 'right':
                    tab.setRoundedTopRightCorner(r);
                    tab.setRoundedBottomRightCorner(r);
                    break;
            }
        },
        
        /** A simple tab component.
            
            Events:
                None
            
            Attributes:
                tabId:string The unique ID of this tab relative to its 
                    tab container.
                tabContainer:myt.TabContainer The tab container that manages 
                    this tab.
                edgeColor:color
                edgeSize:number
                selectedColor:color
                
                labelTextColorSelected:color The color to use for the label 
                    text when this tab is selected.
                cornerRadius:number Passed into the drawing config to determine
                    if a rounded corner is drawn or not. Defaults to undefined 
                    which causes myt.Tab.DEFAULT_RADIUS to be used.
        */
        Tab = pkg.Tab = new JS.Class('Tab', pkg.SimpleIconTextButton, {
            include: [pkg.TabMixin],
            
            
            // Class Methods and Attributes ////////////////////////////////////
            extend: {
                DEFAULT_HEIGHT: 24,
                DEFAULT_INSET: 8,
                DEFAULT_OUTSET: 8,
                DEFAULT_FILL_COLOR_SELECTED: '#ffffff',
                DEFAULT_FILL_COLOR_HOVER: '#eeeeee',
                DEFAULT_FILL_COLOR_ACTIVE: '#aaaaaa',
                DEFAULT_FILL_COLOR_READY: '#cccccc',
                DEFAULT_LABEL_TEXT_COLOR_SELECTED:'#333333',
                DEFAULT_RADIUS:6
            },
            
            
            // Life Cycle //////////////////////////////////////////////////////
            initNode: function(parent, attrs) {
                // myt.SimpleIconTextButton
                if (attrs.inset == null) attrs.inset = Tab.DEFAULT_INSET;
                if (attrs.outset == null) attrs.outset = Tab.DEFAULT_OUTSET;
                
                // myt.Tab
                if (attrs.selectedColor == null) attrs.selectedColor = Tab.DEFAULT_FILL_COLOR_SELECTED;
                if (attrs.hoverColor == null) attrs.hoverColor = Tab.DEFAULT_FILL_COLOR_HOVER;
                if (attrs.activeColor == null) attrs.activeColor = Tab.DEFAULT_FILL_COLOR_ACTIVE;
                if (attrs.readyColor == null) attrs.readyColor = Tab.DEFAULT_FILL_COLOR_READY;
                if (attrs.labelTextSelectedColor == null) attrs.labelTextSelectedColor = Tab.DEFAULT_LABEL_TEXT_COLOR_SELECTED;
                
                // Other
                if (attrs.height == null) attrs.height = Tab.DEFAULT_HEIGHT;
                if (attrs.focusEmbellishment == null) attrs.focusEmbellishment = false;
                
                this.callSuper(parent, attrs);
                
                updateCornerRadius(this);
                updateTextColor(this);
            },
            
            
            // Accessors ///////////////////////////////////////////////////////
            setSelectedColor: function(v) {this.selectedColor = v;},
            
            setCornerRadius: function(v) {
                this.cornerRadius = v;
                if (this.inited) updateCornerRadius(this);
            },
            
            setLabelTextColor: function(v) {this.labelTextColor = v;},
            
            setLabelTextSelectedColor: function(v) {
                this.labelTextSelectedColor = v;
                if (this.inited && this.selected) this.textView.setTextColor(v);
            },
            
            setSelected: function(v) {
                this.callSuper(v);
                if (this.inited) {
                    this.updateUI();
                    updateTextColor(this);
                }
            },
            
            
            // Methods /////////////////////////////////////////////////////////
            /** @overrides myt.Button. */
            updateUI: function() {
                this.callSuper();
                if (this.selected) this.setBgColor(this.selectedColor);
            }
        });
})(myt);


/** Generates input events and passes them on to one or more event observers.
    Requires myt.DomObservable as a super mixin. */
myt.InputObservable = new JS.Module('InputObservable', {
    // Class Methods and Attributes ////////////////////////////////////////////
    extend: {
        /** A map of supported input event types. */
        EVENT_TYPES:{
            input:true,
            select:true,
            change:true
        },
        
        /** The common change/select event that gets reused. */
        EVENT:{source:null, type:null, value:null}
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** @overrides myt.DomObservable */
    createDomMethodRef: function(domObserver, methodName, type) {
        return this.createStandardDomMethodRef(domObserver, methodName, type, myt.InputObservable) || 
            this.callSuper(domObserver, methodName, type);
    }
});


/** A wrapper around a native browser input element.
    
    Events:
        value:* Fired when the setValue setter is called.
    
    Attributes:
        value:* the current value of the input element.
        inputType:string (read only) the type of the input element to create. 
            Changing this value after initialization will modify the type of the
            underlying dom element and is not generally supported.
            See https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#attr-type
            for more info and a list of allowed values.
*/
myt.NativeInputWrapper = new JS.Class('NativeInputWrapper', myt.View, {
    include: [myt.Disableable, myt.InputObservable],
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides myt.View */
    initNode: function(parent, attrs) {
        if (attrs.tagName == null) attrs.tagName = 'input';
        if (attrs.focusable == null) attrs.focusable = true;
        
        this.callSuper(parent, attrs);
        
        // Set a css class to allow scoping of CSS rules
        this.addDomClass('mytNativeInput');
    },
    
    /** @overrides myt.View */
    createOurDomElement: function(parent) {
        var elements = this.callSuper(parent),
            innerElem;
        if (this.inputType) {
            if (Array.isArray(elements)) {
                innerElem = elements[1];
            } else {
                innerElem = elements;
            }
            innerElem.type = this.inputType;
        }
        return elements;
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    /** @overrides myt.Disableable */
    setDisabled: function(v) {
        if (this.disabled !== v) {
            this.getInnerDomElement().disabled = v;
            this.callSuper(v);
        }
    },
    
    setValue: function(v) {
        if (this.value !== v) {
            this.value = v;
            this.setDomValue(v);
            if (this.inited) this.fireEvent('value', v);
        }
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** Gets the value from the DOM.
        @returns * The value */
    getDomValue: function() {
        return this.getInnerDomElement().value;
    },
    
    /** Sets the value on the DOM.
        @param v:* The value to set.
        @returns void */
    setDomValue: function(v) {
        var de = this.getInnerDomElement();
        if (de.value !== v) de.value = v;
    }
});


/** Generates drag and drop events and passes them on to one or more event 
    observers.
    Requires myt.DomObservable as a super mixin. */
myt.DragDropObservable = new JS.Module('DragDropObservable', {
    // Class Methods and Attributes ////////////////////////////////////////////
    extend: {
        /** A map of supported drag and drop event types. */
        EVENT_TYPES:{
            dragleave:true,
            dragenter:true,
            dragover:true,
            drop:true
        },
        
        /** The common drag and drop event that gets reused. */
        EVENT:{source:null, type:null, value:null}
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** @overrides myt.DomObservable */
    createDomMethodRef: function(domObserver, methodName, type) {
        return this.createStandardDomMethodRef(domObserver, methodName, type, myt.DragDropObservable, true) || 
            this.callSuper(domObserver, methodName, type);
    }
});


/** Provides browser drag and drop support.
    
    Requires myt.Disableable as a super mixin. */
myt.DragDropSupport = new JS.Module('DragDropSupport', {
    include: [myt.DragDropObservable],
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides myt.View */
    initNode: function(parent, attrs) {
        this.callSuper(parent, attrs);
        
        if (!this.disabled) this.setupDragListeners();
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    /** @overrides myt.Disableable */
    setDisabled: function(v) {
        if (this.disabled !== v) {
            this.getInnerDomElement().disabled = v;
            this.callSuper(v);
            
            if (this.inited) {
                if (v) {
                    this.teardownDragListeners();
                } else {
                    this.setupDragListeners();
                }
            }
        }
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** @private */
    setupDragListeners: function() {
        this.attachToDom(this, 'doDragOver', 'dragover', false);
        this.attachToDom(this, 'doDragEnter', 'dragenter', false);
        this.attachToDom(this, 'doDragLeave', 'dragleave', false);
        this.attachToDom(this, 'doDrop', 'drop', false);
    },
    
    /** @private */
    teardownDragListeners: function() {
        this.detachFromDom(this, 'doDragOver', 'dragover', false);
        this.detachFromDom(this, 'doDragEnter', 'dragenter', false);
        this.detachFromDom(this, 'doDragLeave', 'dragleave', false);
        this.detachFromDom(this, 'doDrop', 'drop', false);
    },
    
    doDragOver: function(event) {},
    
    doDragEnter: function(event) {},
    
    doDragLeave: function(event) {},
    
    doDrop: function(event) {
        this.handleFiles(event.value.dataTransfer.files, event);
    },
    
    /** @private */
    handleFiles: function(files, event) {
        if (files !== undefined) {
            var i = files.length, file;
            while (i) {
                file = this.filterFiles(files[--i]);
                if (file) this.handleDroppedFile(file, event);
            }
        } else {
            myt.dumpStack("Browser doesn't support the File API");
        }
    },
    
    /** Provides an opportunity to prevent a file from being handled. The
        default implementation returns the provided file argument.
        @param file:File the file to be checked for handleability.
        @returns file:File the file to be handled (possibly modified by this
            function) or something falsy if the file should not be handled. */
    filterFiles: function(file) {
        return file;
    },
    
    handleDroppedFile: function(file, event) {}
});


((pkg) => {
    var 
        /** A specialized setter function used by the setters. */
        optsSetter = (ajax, key, value) => {
            var opts = ajax._opts || (ajax._opts = {});
            if (value) {
                opts[key] = value;
            } else {
                delete opts[key];
            }
        };
    
    /** Provides AJAX functionality. This is a wrapper around JQuery's ajax
        request.
        
        Private Attributes:
            _opts:object Lazily instantiated options object.
    */
    pkg.Ajax = new JS.Class('Ajax', pkg.Node, {
        // Accessors ///////////////////////////////////////////////////////////
        setUrl: function(v) {
            optsSetter(this, 'url', v);
        },
        
        /** The request type.
            Supported values: 'GET' or 'POST'. */
        setRequestMethod: function(v) {
            optsSetter(this, 'type', v);
        },
        
        /** A map of name value pairs for the request. */
        setRequestData: function(v) {
            optsSetter(this, 'data', v);
        },
        
        /** The response type.
            Supported values: 'xml', 'html', 'json', 'jsonp', 'script', or 'text'. */
        setResponseType: function(v) {
            optsSetter(this, 'datatype', v);
        },
        
        
        // Methods /////////////////////////////////////////////////////////////
        doRequest: function(opts, successCallback, failureCallback) {
            return $.ajax(
                    // Convert from myt.Ajax opts to JQuery.ajax opts.
                    pkg.extend(
                        {
                            context:this,
                            
                            // Store url and anything stored under the "callbackData" and
                            // "requestData" key on the jqxhr so we can read it in response 
                            // handling code.
                            beforeSend: (jqxhr, settings) => {
                                jqxhr.callbackData = opts.callbackData;
                                jqxhr.requestData = opts.requestData;
                                jqxhr.requestURL = settings.url;
                            }
                        },
                        this._opts,
                        opts,
                        (key, target, source) => {
                            var targetKey = key;
                            switch (key) {
                                case 'requestData': targetKey = 'data'; break;
                                case 'requestMethod': targetKey = 'type'; break;
                                case 'responseType': targetKey = 'datatype'; break;
                            }
                            target[targetKey] = source[key];
                        }
                    )
                ).done(
                    successCallback || this.handleSuccess
                ).fail(
                    failureCallback || this.handleFailure
                );
        },
        
        /** Handles request successes.
            @param data: The response data
            @param status: String the response status
            @param jqxhr: The request object */
        handleSuccess: function(data, status, jqxhr) {
            this.fireEvent('success', {data:data, status:status, xhr:jqxhr});
        },
        
        /** Handles request failures.
            @param jqxhr: The request object
            @param status: String the response status
            @param exception: XMLHttpRequestException */
        handleFailure: function(jqxhr, status, exception) {
            this.fireEvent('failure', {exception:exception, status:status, xhr:jqxhr});
        }
    });
})(myt);


/** Provides "form" functionality to a node. Forms can be nested to build
    up larger forms from one or more subforms.
    
    Events:
        isValid:boolean Fired when the form changes validity.
        isChanged:boolean Fired when the form becomes changed or unchanged.
    
    Attributes:
        id:string The unique ID for this form relative to its parent form.
        form:myt.Form A reference to the parent form if it exists.
        errorMessages:array A list of error messages that occurred during the
            last execution of doValidation.
        isValid:boolean Indicates if the data in this form is valid or not.
        isChanged:boolean Indicates if the data in this form is different
            from the rollback value or not.
    
    Private Attributes:
        _lockCascade:boolean Prevents changes to "isChanged" and "isValid" 
            from cascading upwards to the parent form. Used during reset 
            and rollback.
        __sf:object A map of child forms/elements by ID.
        __acc:object A map of method references by accelerator identifier. 
            The values will be function references. An intended use of these 
            is to submit or cancel a form by keystroke.
        __v:array A list of validators to apply to this form.
*/
myt.Form = new JS.Module('Form', {
    // Life Cycle //////////////////////////////////////////////////////////////
    initNode: function(parent, attrs) {
        var self = this;
        
        self.isChanged = self._lockCascade = false;
        self.isValid = true;
        
        self.__sf = {};
        self.__v = [];
        self.__acc = {};
        
        self.callSuper(parent, attrs);
        
        if (self.form) self.form.addSubForm(self);
    },
    
    /** @overrides myt.Node. */
    destroy: function() {
        if (this.form) this.form.removeSubForm(this.id);
        
        this.callSuper();
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setErrorMessages: function(v) {this.errorMessages = v;},
    
    getFullId: function() {
        var ids = [this.id],
            form = this.form;
        while (form && form.id) {
            ids.unshift(form.id);
            form = form.form;
        }
        return ids.join('.');
    },
    
    setId: function(v) {
        if (this.id !== v) {
            var existingId = this.id;
            this.id = v;
            
            var form = this.form;
            if (form && this.inited) {
                form.removeSubForm(existingId);
                form.addSubForm(this);
            }
        }
    },
    
    setForm: function(v) {
        if (this.form !== v) {
            var existingForm = this.form;
            this.form = v;
            if (existingForm) existingForm.removeSubForm(this.id);
            if (v && this.inited) v.addSubForm(this);
        }
    },
    
    setIsValid: function(v) {
        // Don't abort when value hasn't changed. The reason this form is
        // invalid may have changed so we want an event to fire so any new
        // error messages can be shown.
        this.isValid = v;
        if (this.inited) this.fireEvent('isValid', v);
        
        var form = this.form;
        if (form && !this._lockCascade) {
            if (v) {
                form.verifyValidState(this);
            } else {
                form.notifySubFormInvalid();
            }
        }
    },
    
    setIsChanged: function(v) {
        if (this.isChanged !== v) {
            this.isChanged = v;
            if (this.inited) this.fireEvent('isChanged', v);
            
            var form = this.form;
            if (form && !this._lockCascade) {
                if (v) {
                    form.notifySubFormChanged();
                } else {
                    form.verifyChangedState(this);
                }
            }
        }
    },
    
    /** Allows bulk setting of validators.
        @param validators:array An array of myt.Validator instances or
            IDs of validators from the myt.global.validators registry.
        @returns void */
    setValidators: function(validators) {
        var i = validators.length, validator;
        while (i) {
            validator = validators[--i];
            if (typeof validator === 'string') {
                validators[i] = validator = myt.global.validators.getValidator(validator);
                if (!validator) validators.splice(i, 1);
            }
        }
        
        this.__v = validators;
    },
    
    /** Gets the value of this form. For a form this will be a map of
        all the subform values by ID. Form elements should override this
        to return an element specific value.
        @returns object */
    getValue: function() {
        // Allow for superclass to have custom getValue behavior.
        if (this.callSuper) return this.callSuper();
        
        // Only do "form" behavior for true forms, not for form elements.
        if (this.isA(myt.FormElement)) return this.value;
        
        var retval = {}, subForms = this.__sf, id;
        for (id in subForms) retval[id] = subForms[id].getValue();
        return retval;
    },
    
    /** Sets the value of this form. For a form the value should be a map
        containing values for each of the subform elements. The entries in
        the map will be applied to each of the subforms.
        @param value:object the value to set.
        @returns the value that was actually set. */
    setValue: function(value) {
        // Allow for superclass to have custom setValue behavior.
        if (this.callSuper) this.callSuper(value);
        
        // Only do "form" behavior for true forms, not for form elements.
        if (typeof value === 'object' && !this.isA(myt.FormElement)) {
            var subform, id;
            for (id in value) {
                subform = this.getSubForm(id);
                if (subform) {
                    value[id] = subform.setValue(value[id]);
                } else {
                    console.warn("ID in setValue for non-existant subform", id);
                }
            }
        }
        
        // Notify parent form of value change.
        if (this.form) this.form.notifyValueChanged(this);
        
        return value;
    },
    
    /** Gets the default value of this form. For a form this will be a map of
        all the subform default values by ID. Form elements should override this
        to return an element specific default value.
        @returns object */
    getDefaultValue: function() {
        var retval = {}, subForms = this.__sf, id;
        for (id in subForms) retval[id] = subForms[id].getDefaultValue();
        return retval;
    },
    
    /** Sets the default value of this form. For a form the value should be a 
        map containing default values for each of the subform elements. The 
        entries in the map will be applied to each of the subforms.
        @param value:object the value to set.
        @returns the value that was actually set. */
    setDefaultValue: function(value) {
        if (typeof value === 'object') {
            var subform, id;
            for (id in value) {
                subform = this.getSubForm(id);
                if (subform) {
                    value[id] = subform.setDefaultValue(value[id]);
                } else {
                    console.warn("ID in setDefaultValue for non-existant subform", id);
                }
            }
        }
        return value;
    },
    
    /** Gets the rollback value of this form. For a form this will be a map of
        all the subform rollback values by ID. Form elements should override this
        to return an element specific rollback value.
        @returns object */
    getRollbackValue: function() {
        var retval = {}, subForms = this.__sf, id;
        for (id in subForms) retval[id] = subForms[id].getRollbackValue();
        return retval;
    },
    
    /** Sets the rollback value of this form. For a form the value should be a 
        map containing rollback values for each of the subform elements. The 
        entries in the map will be applied to each of the subforms.
        @param value:object the value to set.
        @returns the value that was actually set. */
    setRollbackValue: function(value) {
        if (typeof value === 'object') {
            var subform, id;
            for (id in value) {
                subform = this.getSubForm(id);
                if (subform) {
                    value[id] = subform.setRollbackValue(value[id]);
                } else {
                    console.warn("ID in setRollbackValue for non-existant subform", id);
                }
            }
        }
        return value;
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** Add an accelerator to this form.
        @param id:string the ID for the accelerator.
        @param func:function the function to call when the accelerator 
            is invoked.
        @returns void */
    addAccelerator: function(id, func) {
        this.__acc[id] = func;
    },
    
    /** Removes an accelerator from this form.
        @param id:string the ID for the accelerator.
        @returns void */
    removeAccelerator: function(id) {
        delete this.__acc[id];
    },
    
    /** Executes an accelerator in this form with the provided ID.
        @param id:string The ID of the accelerator to invoke.
        @param value:* (optional) The value to pass to the function.
        @returns void */
    invokeAccelerator: function(id, value) {
        var accelerator = this.__acc[id];
        if (accelerator) accelerator.call(this, value === undefined ? null : value);
    },
    
    /** Adds a validator to this form.
        @param validator:myt.Validator The validator to add.
        @returns void */
    addValidator: function(validator) {
        if (validator) this.__v.push(validator);
    },
    
    /** Removes a validator from this form.
        @param id:string The ID of the validator to remove.
        @returns the removed myt.Validator or null if not found. */
    removeValidator: function(id) {
        if (id) {
            var validators = this.__v, i = validators.length, validator;
            while (i) {
                validator = validators[--i];
                if (validator.id === id) {
                    validators.splice(i, 1);
                    return validator;
                }
            }
        }
        return null;
    },
    
    /** Gets the oldest ancestor form of this form or the form itself.
        @returns myt.Form */
    getRootForm: function() {
        return this.form ? this.form.getRootForm() : this;
    },
    
    /** Adds an myt.Form to this form.
        @param subform:myt.Form the form to add as a subform.
        @returns void */
    addSubForm: function(subform) {
        var id = subform.id;
        if (this.getSubForm(id) != null) {
            console.warn("ID in use for subform, add aborted.", id, subform);
            return;
        }
        
        subform.setForm(this);
        this.__sf[id] = subform;
        
        if (subform.isChanged) this.notifySubFormChanged();
        if (!subform.isValid) this.notifySubFormInvalid();
    },
    
    /** Removes the subform with the provided ID from this form.
        @param id:string The ID of the form to remove.
        @returns myt.Form or undefined if not found. */
    removeSubForm: function(id) {
        var subform = this.getSubForm(id);
        if (subform) {
            subform.setForm(null);
            delete this.__sf[id];
            this.verifyChangedState();
            this.verifyValidState();
        }
        return subform;
    },
    
    /** Gets the subform with the provided ID from this form.
        @param id:string The ID of the form to get.
        @returns myt.Form or undefined if not found. */
    getSubForm: function(id) {
        return this.__sf[id];
    },
    
    getSubForms: function() {
        return this.__sf;
    },
    
    getInvalidSubformIds: function(doValidation) {
        if (doValidation) this.doValidation();
        
        var FE = myt.FormElement,
            retval = [];
        (function inspect(subform) {
            if (subform.isA(FE)) {
                if (!subform.isValid) retval.push(subform.getFullId());
            } else {
                var subforms = subform.getSubForms(),
                    key;
                for (key in subforms) inspect(subforms[key]);
            }
        })(this);
        
        return retval;
    },
    
    /** Gets all error messages from the entire form tree.
        @returns array of error messages strings. */
    getAllErrorMessages: function() {
        var msgs = (this.errorMessages || []).concat(),
            subForms = this.__sf,
            id;
        for (id in subForms) msgs = msgs.concat(subForms[id].getAllErrorMessages());
        return msgs;
    },
    
    /** Called when a subform changes to the "invalid" state.
        @returns void */
    notifySubFormInvalid: function() {
        this.setIsValid(false);
    },
    
    /** Tests if this form is valid or not and updates the isValid attribute 
        if necessary. Allows upwards cascade of validity.
        @param subformToIgnore:myt.Form (optional) A subform that will not
            be checked for validity. This is typically the subform that is
            invoking this method.
        @returns boolean true if this form is valid, false otherwise. */
    verifyValidState: function(subformToIgnore) {
        var isValid = true, subForms = this.__sf, subform, id;
        for (id in subForms) {
            subform = subForms[id];
            if (subform !== subformToIgnore) isValid = subform.isValid && isValid;
        }
        return this.__applyValidation(isValid);
    },
    
    /** Tests if this form is valid or not. Performs a top down validation 
        check across the entire form tree. Does not allow upwards cascade of
        validity check since this is intended to be a top down check.
        @returns boolean true if this form is valid, false otherwise. */
    doValidation: function() {
        var isValid = true, subForms = this.__sf, id;
        for (id in subForms) isValid = subForms[id].doValidation() && isValid;
        
        this._lockCascade = true;
        isValid = this.__applyValidation(isValid);
        this._lockCascade = false;
        
        return isValid;
    },
    
    /** Runs the validators on this form.
        @private
        @param isValid:boolean The currently determined validity.
        @returns boolean true if this form is valid, false otherwise. */
    __applyValidation: function(isValid) {
        var validators = this.__v, len = validators.length, 
            errorMessages = [], i = 0;
        for (; len > i;) isValid = validators[i++].isFormValid(this, null, errorMessages) && isValid;
        
        this.setErrorMessages(errorMessages);
        this.setIsValid(isValid);
        
        return isValid;
    },
    
    /** Called whenever a value changes for the form or any subform therein.
        @param sourceForm:myt.Form the form that had a value change.
        @returns void */
    notifyValueChanged: function(sourceForm) {
        if (this.form) this.form.notifyValueChanged(sourceForm);
    },
    
    /** Called when a subform changed to the "changed" state.
        @returns void */
    notifySubFormChanged: function() {
        this.setIsChanged(true);
    },
    
    /** Tests if this form is changed or not and updates the isChanged 
        attribute if necessary. Allows upwards cascade of changed state.
        @param subformToIgnore:myt.Form (optional) A subform that will not
            be checked for changed state. This is typically the subform that is
            invoking this method.
        @returns boolean true if this form is changed, false otherwise. */
    verifyChangedState: function(subformToIgnore) {
        var isChanged = false, subForms = this.__sf, subform, id;
        for (id in subForms) {
            subform = subForms[id];
            if (subform !== subformToIgnore) isChanged = subform.isChanged || isChanged;
        }
        this.setIsChanged(isChanged);
        return isChanged;
    },
    
    /** Initializes the form to the provided values.
        @param defaultValue:object The default value.
        @param rollbackValue:object The rollback value.
        @param value:object The current value.
        @returns void */
    setup: function(defaultValue, rollbackValue, value) {
        this._lockCascade = true;
        this.setIsChanged(false);
        this.setErrorMessages([]);
        this.setIsValid(true);
        this._lockCascade = false;
        
        if (defaultValue == null) defaultValue = {};
        if (rollbackValue == null) rollbackValue = {};
        if (value == null) value = {};
        
        var subForms = this.__sf, id;
        for (id in subForms) subForms[id].setup(defaultValue[id], rollbackValue[id], value[id]);
    },
    
    /** Resets this form to the default values.
        @returns void */
    resetForm: function() {
        this._lockCascade = true;
        
        var subForms = this.__sf, id;
        for (id in subForms) subForms[id].resetForm();
        
        this.setIsChanged(false);
        this.setErrorMessages([]);
        this.setIsValid(true);
        
        this._lockCascade = false;
    },
    
    /** Rolls back this form to the rollback values.
        @returns void */
    rollbackForm: function() {
        this._lockCascade = true;
        
        var subForms = this.__sf, id;
        for (id in subForms) subForms[id].rollbackForm();
        
        this.setIsChanged(false);
        this.setErrorMessages([]);
        this.setIsValid(true);
        
        this._lockCascade = false;
    },
    
    /** Gets the changed values of this form. For a form this will be a map of
        all the subform values by ID that are in the "changed" state. Form 
        elements should override this to return an element specific value.
        @returns object */
    getChangedValue: function() {
        var retval = {}, subForms = this.__sf, subform, id;
        for (id in subForms) {
            subform = subForms[id];
            if (subform.isChanged) retval[id] = subform.getChangedValue();
        }
        return retval;
    }
});


/** Provides additional common functionality for a root level form.
    
    Accelerators:
        submit: Invokes the doSubmit function which in turn may invoke the
            doValidSubmit or doInvalidSubmit function.
        cancel: Invokes the doCancel function.
    
    Events:
        None
    
    Attributes:
        None
*/
myt.RootForm = new JS.Module('RootForm', {
    include: [myt.Form],
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    initNode: function(parent, attrs) {
        this.callSuper(parent, attrs);
        
        this.addAccelerator('submit', this.doSubmit);
        this.addAccelerator('cancel', this.doCancel);
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    doSubmit: function() {
        if (this.isChanged) {
            if (this.doValidation()) {
                this.doValidSubmit(this.getValue());
            } else {
                this.doInvalidSubmit();
            }
        }
    },
    
    /** Called when the form is submitted and it is valid.
        @returns void */
    doValidSubmit: function(value) {},
    
    /** Called when the form is submitted and it is not valid.
        @returns void */
    doInvalidSubmit: function() {},
    
    /** Rolls back the form and revalidates it.
        @returns void */
    doCancel: function() {
        this.rollbackForm();
        this.doValidation();
    }
});


/** Provides "form" element functionality to a node. A form element is a
    form that actually has a value.
    
    Events:
        defaultValue:* Fired when the default value changes.
        rollbackValue:* Fired when the rollback value changes.
    
    Attributes:
        value:* The current value of the form element.
        rollbackValue:* The rollback value of the form element.
        defaultValue:* The default value of the form element.
    
    Private Attributes:
        __vp:array A list of myt.ValueProcessors that get applied 
            to a value whenever it is retrieved via the methods: 
            getValue, getRollbackValue or getDefaultValue.
*/
myt.FormElement = new JS.Module('FormElement', {
    include: [myt.Form],
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    initNode: function(parent, attrs) {
        this.__vp = [];
        
        this.callSuper(parent, attrs);
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    /** @overrides myt.Form */
    getValue: function() {
        return this.__processValue(
            this.callSuper ? this.callSuper() : this.value, myt.ValueProcessor.CURRENT_ATTR
        );
    },
    
    /** @overrides myt.Form */
    setValue: function(value) {
        if (value === undefined) value = this.getRollbackValue();
        if (this.value !== value) {
            this.callSuper(value);
            this.verifyChangedState();
        }
        return value;
    },
    
    /** @overrides myt.Form */
    getDefaultValue: function() {
        return this.__processValue(this.defaultValue, myt.ValueProcessor.DEFAULT_ATTR);
    },
    
    /** @overrides myt.Form */
    setDefaultValue: function(value) {
        if (this.defaultValue !== value) {
            this.defaultValue = value;
            if (this.inited) this.fireEvent('defaultValue', value);
            this.verifyChangedState();
        }
        return value;
    },
    
    /** @overrides myt.Form */
    getRollbackValue: function() {
        return this.__processValue(this.rollbackValue, myt.ValueProcessor.ROLLBACK_ATTR);
    },
    
    /** @overrides myt.Form */
    setRollbackValue: function(value) {
        if (value === undefined) value = this.getDefaultValue();
        if (this.rollbackValue !== value) {
            this.rollbackValue = value;
            if (this.inited) this.fireEvent('rollbackValue', value);
            this.verifyChangedState();
        }
        return value;
    },
    
    /** Allows bulk setting of ValueProcessors.
        @param processors:array An array of myt.ValueProcessor instances or
            IDs of value processors from the myt.global.valueProcessors 
            registry.
        @returns void */
    setValueProcessors: function(processors) {
        var i = processors.length, processor;
        while (i) {
            processor = processors[--i];
            if (typeof processor === 'string') {
                processors[i] = processor = myt.global.valueProcessors.getValueProcessor(processor);
                if (!processor) processors.splice(i, 1);
            }
        }
        
        this.__vp = processors;
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** Adds a ValueProcessor to this form element.
        @param processor:myt.ValueProcessor
        @returns void */
    addValueProcessor: function(processor) {
        this.__vp.push(processor);
    },
    
    /** Removes a ValueProcessor from this form element.
        @param id:string the ID of the processor to remove.
        @returns the removed myt.ValueProcessor or null if not found. */
    removeValueProcessor: function(id) {
        if (id) {
            var processors = this.__vp, i = processors.length, processor;
            while (i) {
                processor = processors[--i];
                if (processor.id === id) {
                    processors.splice(i, 1);
                    return processor;
                }
            }
        }
        return null;
    },
    
    /** Runs the provided value through all the ValueProcessors.
        @private
        @param value:* The value to process.
        @param checkAttr:string The name of the attribute on each processor 
            that is checked to see if that processor should be run or not.
        @returns * The processed value. */
    __processValue: function(value, checkAttr) {
        var processors = this.__vp, len = processors.length, processor, i = 0;
        for (; len > i;) {
            processor = processors[i++];
            if (processor[checkAttr]) value = processor.process(value);
        }
        return value;
    },
    
    /** @overrides myt.Form */
    addSubForm: function(subform) {
        myt.dumpStack("addSubForm not supported on form elements.");
    },
    
    /** @overrides myt.Form */
    getSubForm: function(id) {
        myt.dumpStack("getSubForm not supported on form elements.");
        return null;
    },
    
    /** @overrides myt.Form */
    removeSubForm: function(id) {
        myt.dumpStack("removeSubForm not supported on form elements.");
        return null;
    },
    
    /** @overrides myt.Form */
    verifyChangedState: function(subformToIgnore) {
        var isChanged = this.getValue() !== this.getRollbackValue();
        this.setIsChanged(isChanged);
        return isChanged;
    },
    
    /** @overrides myt.Form */
    setup: function(defaultValue, rollbackValue, value) {
        this._lockCascade = true;
        
        // Reset values to uninitialized state to make repeated calls to
        // setup behave identically. Otherwise values could bleed through.
        this.defaultValue = undefined;
        this.rollbackValue = undefined;
        this.value = undefined;
        
        this.setDefaultValue(defaultValue);
        this.setRollbackValue(rollbackValue);
        
        this.setIsChanged(false);
        this.setErrorMessages([]);
        this.setIsValid(true);
        
        this._lockCascade = false;
        
        this.setValue(value);
    },
    
    /** @overrides myt.Form */
    resetForm: function() {
        this._lockCascade = true;
        
        var defaultValue = this.getDefaultValue();
        this.setRollbackValue(defaultValue);
        this.setValue(defaultValue);
        
        this.setIsChanged(false);
        this.setErrorMessages([]);
        this.setIsValid(true);
        
        this._lockCascade = false;
    },
    
    /** @overrides myt.Form */
    rollbackForm: function() {
        this._lockCascade = true;
        
        this.setValue(this.getRollbackValue());
        
        this.setIsChanged(false);
        this.setErrorMessages([]);
        this.setIsValid(true);
        
        this._lockCascade = false;
    },
    
    /** @overrides myt.Form
        @returns The current value if this form is in the changed state,
            otherwise undefined. */
    getChangedValue: function() {
        return this.isChanged ? this.getValue() : undefined;
    }
});


/** Component to upload files. */
myt.Uploader = new JS.Class('Uploader', myt.View, {
    include: [myt.DragDropSupport, myt.Disableable, myt.FormElement],
    
    
    // Class Methods and Attributes ////////////////////////////////////////////
    extend: {
        /** The attribute key used in a file to store the path for the file
            on the server. */
        FILE_ATTR_SERVER_PATH: 'serverPath',
        
        MIME_TYPES_BY_EXTENSION: {
            gif:'image/gif',
            png:'image/png',
            jpg:'image/jpeg',
            jpeg:'image/jpeg'
        },
        
        readFile: function(file, handlerFunc) {
            if (FileReader !== undefined) {
                reader = new FileReader();
                reader.onload = handlerFunc;
                reader.readAsDataURL(file);
            }
        },
        
        isSameFile: function(f1, f2) {
            if (f1 == null || f2 == null) return false;
            return f1.name === f2.name && f1.type === f2.type && f1.size === f2.size;
        },
        
        createFile: function(urlStr) {
            var fileName = (new myt.URI(urlStr)).file;
            return {
                name: fileName,
                serverPath: urlStr,
                size: -1,
                type: this.MIME_TYPES_BY_EXTENSION[myt.getExtension(fileName)]
            };
        }
    },
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides myt.View */
    initNode: function(parent, attrs) {
        var self = this;
        
        self.files = [];
        
        // Modify attrs so setter gets called.
        if (attrs.requestFileParam == null) attrs.requestFileParam = 'file';
        if (attrs.maxFiles == null) attrs.maxFiles = -1;
        
        self.callSuper(parent, attrs);
        
        // Support click to upload too.
        new myt.NativeInputWrapper(self, {
            name:'fileInput', percentOfParentWidth:100, percentOfParentHeight:100,
            opacity:0.01, disabled:self.disabled, overflow:'hidden'
        }, [myt.SizeToParent, {
            initNode: function(parent, attrs) {
                this.inputType = 'file';
                this.callSuper(parent, attrs);
                this.attachToDom(this, '_handleInput', 'change');
                
                this.domElement.multiple = self.maxFiles > 1;
            },
            
            _handleInput: function(event) {
                self.handleFiles(this.domElement.files, event);
            }
        }]);
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    /** Add a "remote" file when the value is set.
        @param v:string the URI for a remote image file. */
    setValue: function(v) {
        this.clearFiles();
        
        if (v) {
            if (!Array.isArray(v)) v = [v];
            var len = v.length, i = 0;
            for(; len > i; ++i) this.addFile(myt.Uploader.createFile(v[i]));
        }
        
        return this.callSuper ? this.callSuper(v) : v;
    },
    
    /** @returns the path to the uploaded files. */
    getValue: function() {
        return this.value;
    },
    
    /** @overrides myt.Disableable */
    setDisabled: function(v) {
        this.callSuper(v);
        
        if (this.fileInput) this.fileInput.setDisabled(v);
    },
    
    setMaxFiles: function(v) {
        if (this.maxFiles !== v) {
            this.maxFiles = v;
            if (this.inited) this.fireEvent('maxFiles', v);
            if (this.fileInput) this.fileInput.domElement.multiple = v > 1;
        }
    },
    
    setUploadUrl: function(v) {this.set('uploadUrl', v, true);},
    setRequestFileParam: function(v) {this.set('requestFileParam', v, true);},
    
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** @overrides myt.View */
    bringSubviewToFront: function(sv) {
        if (sv === this.fileInput) {
            this.callSuper(sv);
        } else {
            this.sendSubviewBehind(sv, this.fileInput);
        }
    },
    
    /** @overrides myt.View */
    subviewAdded: function(sv) {
        this.callSuper(sv);
        
        if (this.fileInput) this.bringSubviewToFront(this.fileInput);
    },
    
    handleDroppedFile: function(file, event) {
        this.addFile(file);
    },
    
    /** @overrides myt.DragDropSupport */
    filterFiles: function(file) {
        // Prevent max files from being exceeded.
        return this.maxFiles >= 0 && this.files.length >= this.maxFiles ? null : file;
    },
    
    uploadFiles: function(url, fileParam) {
        url = url || this.uploadUrl;
        
        var files = this.files, i = files.length;
        while (i) this.uploadFile(files[--i], url, fileParam);
    },
    
    uploadFile: function(file, url, fileParam) {
        url = url || this.uploadUrl;
        fileParam = fileParam || this.requestFileParam;
        
        var self = this;
        var ajax = new myt.Ajax(this, {
            url:url, requestMethod:'post', responseType:'json'
        }, [{
            handleSuccess: function(data, status, jqxhr) {
                this.callSuper(data, status, jqxhr);
                self.handleUploadSuccess(file, data, status, jqxhr);
            },
            
            handleFailure: function(jqxhr, status, exception) {
                this.callSuper(jqxhr, status, exception);
                self.handleUploadFailure(file, jqxhr, status, exception);
            }
        }]);
        
        var formData = new FormData();
        formData.append(fileParam, file, file.name);
        ajax.setRequestData(formData);
        
        ajax.doRequest({
            contentType:false,
            cache: false,
            processData: false
        });
    },
    
    handleUploadSuccess: function(file, data, status, jqxhr) {
        file[myt.Uploader.FILE_ATTR_SERVER_PATH] = this.parseServerPathFromResponse(data);
        this.updateValueFromFiles();
    },
    
    handleUploadFailure: function(file, jqxhr, status, exception) {
        myt.dumpStack("XHR failure: " + status + " : " + exception);
    },
    
    /** Subclasses must implement this to extract the uploaded file path from
        the response. By default this return null. */
    parseServerPathFromResponse: function(data) {
        return null;
    },
    
    addFile: function(file) {
        this.files.push(file);
        this.updateValueFromFiles();
        this.fireEvent('addFile', file);
    },
    
    removeFile: function(file) {
        var files = this.files, i = files.length;
        while (i) {
            if (myt.Uploader.isSameFile(files[--i], file)) {
                files.splice(i, 1);
                this.updateValueFromFiles();
                this.fireEvent('removeFile', file);
                break;
            }
        }
    },
    
    updateValueFromFiles: function() {
        var value = [], files = this.files, i = files.length, serverPath;
        while (i) {
            serverPath = files[--i][myt.Uploader.FILE_ATTR_SERVER_PATH];
            if (serverPath) value.push(serverPath);
        }
        
        var len = value.length;
        this.value = len === 1 ? value[0] : (len === 0 ? undefined : value);
        
        // Reset the form element if empty. Otherwise uploading the 
        // same file again won't trigger a change event.
        if (!this.value) this.fileInput.domElement.value = '';
        
        this.verifyChangedState(); // FIXME: mimics what happens in myt.FormElement setValue
        if (this.form) this.form.notifyValueChanged(this); // FIXME: mimics what happens in myt.Form setValue
        
        this.fireEvent('value', this.value);
    },
    
    clearFiles: function() {
        var files = this.files, i = files.length;
        while (i) this.removeFile(files[--i]);
    }
});


/** Component to upload image files. */
myt.ImageUploader = new JS.Class('ImageUploader', myt.Uploader, {
    // Class Methods and Attributes ////////////////////////////////////////////
    extend: {
        isImageFile: function(file) {
            return (/image/i).test(file.type);
        }
    },
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides myt.View */
    initNode: function(parent, attrs) {
        attrs.maxFiles = 1;
        
        this.callSuper(parent, attrs);
    },
    
    
    // Attributes //////////////////////////////////////////////////////////////
    setWidth: function(v, supressEvent) {
        this.callSuper(v, supressEvent);
        if (this.inited) this.updateImageSize();
    },
    
    setHeight: function(v, supressEvent) {
        this.callSuper(v, supressEvent);
        if (this.inited) this.updateImageSize();
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    filterFiles: function(file) {
        if (!myt.ImageUploader.isImageFile(file)) return null;
        
        // Remove existing file
        while (this.files.length > 0) this.removeFile(this.files[0]);
        
        return this.callSuper(file);
    },
    
    addFile: function(file) {
        var self = this;
        
        self.callSuper(file);
        
        var image = self.image = new myt.Image(self, {useNaturalSize:false, align:'center', valign:'middle'});
        
        image.file = file;
        
        // Read into image
        if (file.size === -1) {
            var img = new Image();
            img.onload = function() {
                file.width = this.width;
                file.height = this.height;
                
                if (!image || image.destroyed) return
                
                self.updateImage(file, image, this.src);
            };
            img.src = file.serverPath;
        } else if (FileReader !== undefined && myt.ImageUploader.isImageFile(file)) {
            myt.Uploader.readFile(file, function(event) {
                var img = new Image();
                img.onload = function() {
                    file.width = this.width;
                    file.height = this.height;
                    
                    if (!image || image.destroyed) return
                    
                    self.updateImage(file, image, this.src);
                };
                img.src = event.target.result;
            });
        }
    },
    
    scaleToFit: function(boundsWidth, boundsHeight, imgWidth, imgHeight) {
        var boundsRatio = boundsWidth / boundsHeight;
        var imgRatio = imgWidth / imgHeight;
        
        if (imgRatio > boundsRatio) {
            return [boundsWidth, imgHeight * boundsWidth / imgWidth];
        } else {
            return [imgWidth * boundsHeight / imgHeight, boundsHeight];
        }
    },
    
    removeFile: function(file) {
        this.callSuper(file);
        
        var images = this.getSubviews(),
            i = images.length,
            image;
        while (i) {
            image = images[--i];
            if (myt.Uploader.isSameFile(image.file, file)) {
                image.destroy();
                break;
            }
        }
    },
    
    handleDroppedFile: function(file, event) {
        this.callSuper(file, event);
        
        this.uploadFile(file, this.uploadUrl);
    },
    
    updateImage: function(file, image, src) {
        this.nativeWidth = file.width;
        this.nativeHeight = file.height;
        
        this.updateImageSize();
        
        image.setImageUrl(src);
    },
    
    updateImageSize: function() {
        var image = this.image;
        if (image && !image.destroyed) {
            var size = this.scaleToFit(this.width, this.height, this.nativeWidth, this.nativeHeight),
                w = Math.round(size[0]), 
                h = Math.round(size[1]);
            image.setImageSize(w + 'px ' + h + 'px');
            image.setWidth(w);
            image.setHeight(h);
        }
    },
    
    getImageSize: function() {
        return this.files.length ? {width:this.nativeWidth, height:this.nativeHeight} : null;
    }
});


// Spectrum Colorpicker v1.4.1
// https://github.com/bgrins/spectrum
// Author: Brian Grinstead
// License: MIT
(function (window, $, undefined) {
    "use strict";

    var defaultOpts = {
        color: false,
        allowEmpty: true,
        showSelectionPalette: true,
        localStorageKey: false,
        selectionWrapSize: 8,
        maxSelectionSize: 56,
        clearText: "Clear Color Selection",
        noColorSelectedText: "No Color Selected",
        palette: [],
        selectionPalette: []
    },
    spectrums = [],
    IE = BrowserDetect.browser === 'Explorer',
    markup = (function () {
        // IE does not support gradients with multiple stops, so we need to simulate
        //  that for the rainbow slider with 8 divs that each have a single gradient
        var gradientFix = "";
        if (IE) {
            for (var i = 1; i <= 6; i++) gradientFix += "<div class='sp-" + i + "'></div>";
        }

        return [
            "<div class='sp-container'>",
                "<div class='sp-palette-container'>",
                    "<div class='sp-palette sp-thumb sp-cf'></div>",
                "</div>",
                "<div class='sp-picker-container'>",
                    "<div class='sp-top sp-cf'>",
                        "<div class='sp-fill'></div>",
                        "<div class='sp-top-inner'>",
                            "<div class='sp-color'>",
                                "<div class='sp-sat'>",
                                    "<div class='sp-val'>",
                                        "<div class='sp-dragger'></div>",
                                    "</div>",
                                "</div>",
                            "</div>",
                            "<div class='sp-clear sp-clear-display'>",
                            "</div>",
                            "<div class='sp-hue'>",
                                "<div class='sp-slider'></div>",
                                gradientFix,
                            "</div>",
                        "</div>",
                    "</div>",
                    "<div class='sp-input-container sp-cf'>",
                        "<input class='sp-input' type='text' spellcheck='false'/>",
                    "</div>",
                    "<div class='sp-initial sp-thumb sp-cf'></div>",
                "</div>",
            "</div>"
        ].join("");
    })();

    function paletteTemplate(p, color, opts) {
        var html = [];
        for (var i = 0; i < p.length; i++) {
            var current = p[i];
            if (current) {
                var tiny = tinycolor(current);
                var c = tiny.toHsl().l < 0.5 ? "sp-thumb-el sp-thumb-dark" : "sp-thumb-el sp-thumb-light";
                c += tinycolor.equals(color, current) ? " sp-thumb-active" : "";
                var swatchStyle = "background-color:" + tiny.toHexString();
                html.push('<span title="' + tiny.toHexString() + '" data-color="' + tiny.toHexString() + '" class="' + c + '"><span class="sp-thumb-inner" style="' + swatchStyle + ';" /></span>');
            } else {
                var cls = 'sp-clear-display';
                html.push($('<div />')
                    .append($('<span data-color="" style="background-color:transparent;" class="' + cls + '"></span>')
                        .attr('title', opts.noColorSelectedText)
                    ).html()
                );
            }
        }
        return "<div class='sp-cf'>" + html.join('') + "</div>";
    }

    function spectrum(element, o) {
        var opts = myt.extend({}, defaultOpts, o),
            showSelectionPalette = opts.showSelectionPalette,
            localStorageKey = opts.localStorageKey,
            dragWidth = 0,
            dragHeight = 0,
            dragHelperHeight = 0,
            slideHeight = 0,
            slideWidth = 0,
            slideHelperHeight = 0,
            currentHue = 0,
            currentSaturation = 0,
            currentValue = 0,
            palette = [],
            paletteArray = [],
            paletteLookup = {},
            selectionPalette = opts.selectionPalette.slice(0),
            selectionWrapSize = opts.selectionWrapSize,
            maxSelectionSize = opts.maxSelectionSize,
            draggingClass = "sp-dragging",
            shiftMovementDirection = null;

        var doc = element.ownerDocument,
            body = doc.body,
            boundElement = $(element),
            container = $(markup, doc),
            pickerContainer = container.find(".sp-picker-container"),
            dragger = container.find(".sp-color"),
            dragHelper = container.find(".sp-dragger"),
            slider = container.find(".sp-hue"),
            slideHelper = container.find(".sp-slider"),
            textInput = container.find(".sp-input"),
            paletteContainer = container.find(".sp-palette"),
            initialColorContainer = container.find(".sp-initial"),
            clearButton = container.find(".sp-clear"),
            initialColor = opts.color,
            colorOnShow = false,
            isEmpty = !initialColor,
            allowEmpty = opts.allowEmpty,
            dialog = opts.dialog;

        function applyOptions() {
            if (opts.palette) {
                palette = opts.palette.slice(0);
                paletteArray = Array.isArray(palette[0]) ? palette : [palette];
                paletteLookup = {};
                for (var i = 0; i < paletteArray.length; i++) {
                    for (var j = 0; j < paletteArray[i].length; j++) {
                        var rgb = tinycolor(paletteArray[i][j]).toHexString();
                        paletteLookup[rgb] = true;
                    }
                }
            }
            container.toggleClass("sp-clear-enabled", allowEmpty);
            reflow();
        }

        function initialize() {
            if (IE) container.find("*:not(input)").attr("unselectable", "on");

            applyOptions();

            if (!allowEmpty) clearButton.hide();

            boundElement.after(container).hide();

            updateSelectionPaletteFromStorage();

            // Handle user typed input
            textInput.change(setFromTextInput);
            textInput.bind("paste", function() {
                setTimeout(setFromTextInput, 1);
            });
            textInput.keydown(function(e) {if (e.keyCode == 13) {setFromTextInput();}});

            clearButton.attr("title", opts.clearText);
            clearButton.bind("click.spectrum", function(e) {
                e.stopPropagation();
                e.preventDefault();
                isEmpty = true;
                updateUI();
            });

            draggable(slider, function(dragX, dragY) {
                currentHue = parseFloat(dragY / slideHeight);
                isEmpty = false;
                updateUI();
            }, dragStart, dragStop);

            draggable(dragger, function(dragX, dragY, e) {
                // shift+drag should snap the movement to either the x or y axis.
                if (!e.shiftKey) {
                    shiftMovementDirection = null;
                } else if (!shiftMovementDirection) {
                    var oldDragX = currentSaturation * dragWidth;
                    var oldDragY = dragHeight - (currentValue * dragHeight);
                    var furtherFromX = Math.abs(dragX - oldDragX) > Math.abs(dragY - oldDragY);
                    shiftMovementDirection = furtherFromX ? "x" : "y";
                }

                var setSaturation = !shiftMovementDirection || shiftMovementDirection === "x";
                var setValue = !shiftMovementDirection || shiftMovementDirection === "y";

                if (setSaturation) currentSaturation = parseFloat(dragX / dragWidth);
                if (setValue) currentValue = parseFloat((dragHeight - dragY) / dragHeight);

                isEmpty = false;

                updateUI();
            }, dragStart, dragStop);

            if (!!initialColor) {
                set(initialColor);
                addColorToSelectionPalette(initialColor);
            }

            reflow();
            colorOnShow = get();
            updateUI();

            function paletteElementClick(e) {
                set($(e.target).closest(".sp-thumb-el").data("color"));
                updateUI();
                return false;
            }

            var paletteEvent = IE ? "mousedown.spectrum" : "click.spectrum";
            paletteContainer.delegate(".sp-thumb-el", paletteEvent, paletteElementClick);
            initialColorContainer.delegate(".sp-thumb-el:nth-child(1)", paletteEvent, paletteElementClick);
        }

        function updateSelectionPaletteFromStorage() {
            if (localStorageKey && window.localStorage) {
                try {
                    selectionPalette = window.localStorage[localStorageKey].split(";");
                } catch (e) {}
            }
        }

        function addColorToSelectionPalette(color) {
            if (showSelectionPalette) {
                var rgb = tinycolor(color).toHexString();
                if (!paletteLookup[rgb] && $.inArray(rgb, selectionPalette) === -1) {
                    selectionPalette.push(rgb);
                    while (selectionPalette.length > maxSelectionSize) selectionPalette.shift();
                }

                if (localStorageKey && window.localStorage) {
                    try {
                        window.localStorage[localStorageKey] = selectionPalette.join(";");
                    } catch(e) {}
                }
            }
        }

        function getUniqueSelectionPalette() {
            var unique = [];
            for (var i = 0; i < selectionPalette.length; i++) {
                var rgb = tinycolor(selectionPalette[i]).toHexString();
                if (!paletteLookup[rgb]) unique.push(selectionPalette[i]);
            }
            return unique.reverse().slice(0, opts.maxSelectionSize);
        }

        function drawPalette() {
            var currentColor = get();

            var html = $.map(paletteArray, function (palette, i) {
                return paletteTemplate(palette, currentColor, opts);
            });

            updateSelectionPaletteFromStorage();

            if (selectionPalette) {
                var uniquePalette = getUniqueSelectionPalette();
                for (var i = 0, len = uniquePalette.length; len > i; i += selectionWrapSize) {
                    html.push(paletteTemplate(uniquePalette.slice(i, i + selectionWrapSize), currentColor, opts));
                }
            }

            paletteContainer.html(html.join(""));
        }

        function dragStart() {
            if (dragHeight <= 0 || dragWidth <= 0 || slideHeight <= 0) reflow();
            container.addClass(draggingClass);
            shiftMovementDirection = null;
            boundElement.trigger('dragstart.spectrum', [get()]);
        }

        function dragStop() {
            container.removeClass(draggingClass);
            boundElement.trigger('dragstop.spectrum', [get()]);
        }

        function setFromTextInput() {
            var value = textInput.val();
            if ((value === null || value === "") && allowEmpty) {
                set(null);
            } else {
                var tiny = tinycolor(value);
                if (tiny.isValid()) {
                    set(tiny);
                } else {
                    textInput.addClass("sp-validation-error");
                }
            }
        }

        function set(color) {
            if (!tinycolor.equals(color, get())) {
                var newColor, newHsv;
                if (!color && allowEmpty) {
                    isEmpty = true;
                } else {
                    isEmpty = false;
                    newColor = tinycolor(color);
                    newHsv = newColor.toHsv();
                    currentHue = (newHsv.h % 360) / 360;
                    currentSaturation = newHsv.s;
                    currentValue = newHsv.v;
                }
            }

            // Update UI just in case a validation error needs to be cleared.
            updateUI();
        }

        function get() {
            if (allowEmpty && isEmpty) return null;

            return tinycolor.fromRatio({
                h: currentHue,
                s: currentSaturation,
                v: currentValue
            });
        }

        function updateUI() {
            textInput.removeClass("sp-validation-error");

            updateHelperLocations();

            // Update dragger background color (gradients take care of saturation and value).
            var flatColor = tinycolor.fromRatio({h:currentHue, s:1, v:1});
            dragger.css("background-color", flatColor.toHexString());

            var realColor = get(),
                displayColor = (realColor || !allowEmpty) ? realColor.toHexString() : '';

            // Update the text entry input as it changes happen
            textInput.val(displayColor);

            drawPalette();

            // Draw initial
            var initial = colorOnShow;
            var current = get();
            initialColorContainer.html(paletteTemplate([initial, current], current, opts));
        }

        function updateHelperLocations() {
            if (allowEmpty && isEmpty) {
                // if selected color is empty, hide the helpers
                slideHelper.hide();
                dragHelper.hide();
            } else {
                // make sure helpers are visible
                slideHelper.show();
                dragHelper.show();

                // Where to show the little circle in that displays your current selected color
                var dragX = currentSaturation * dragWidth,
                    dragY = dragHeight - (currentValue * dragHeight);
                dragX = Math.max(
                    -dragHelperHeight,
                    Math.min(dragWidth - dragHelperHeight, dragX - dragHelperHeight)
                );
                dragY = Math.max(
                    -dragHelperHeight,
                    Math.min(dragHeight - dragHelperHeight, dragY - dragHelperHeight)
                );
                dragHelper.css({
                    "top": dragY + "px",
                    "left": dragX + "px"
                });

                // Where to show the bar that displays your current selected hue
                var slideY = currentHue * slideHeight;
                slideHelper.css({
                    "top": (slideY - slideHelperHeight) + "px"
                });
            }
        }

        function reflow() {
            dragWidth = dragger.width();
            dragHeight = dragger.height();
            dragHelperHeight = dragHelper.height();
            slideWidth = slider.width();
            slideHeight = slider.height();
            slideHelperHeight = slideHelper.height();

            updateHelperLocations();
            drawPalette();

            boundElement.trigger('reflow.spectrum');
        }

        function destroy() {
            boundElement.show();
            container.remove();
            spectrums[spect.id] = null;
        }

        function option(optionName, optionValue) {
            if (optionName == null) return myt.extend({}, opts);
            if (optionValue == null) return opts[optionName];

            opts[optionName] = optionValue;
            applyOptions();
        }

        initialize();

        var spect = {
            reflow: reflow,
            option: option,
            set: set,
            addColorToSelectionPalette: addColorToSelectionPalette,
            get: get,
            destroy: destroy,
            container: container
        };

        spect.id = spectrums.push(spect) - 1;

        dialog._spectrumCallback(spect);

        return spect;
    }

    /**
      * Lightweight drag helper.  Handles containment within the element, so that
      * when dragging, the x is within [0,element.width] and y is within [0,element.height]
      */
    function draggable(element, onmove, onstart, onstop) {
        onmove = onmove || function () { };
        onstart = onstart || function () { };
        onstop = onstop || function () { };
        var doc = element.ownerDocument || document;
        var dragging = false;
        var offset = {};
        var maxHeight = 0;
        var maxWidth = 0;

        var duringDragEvents = {};
        duringDragEvents["selectstart"] = prevent;
        duringDragEvents["dragstart"] = prevent;
        duringDragEvents["mousemove"] = move;
        duringDragEvents["mouseup"] = stop;

        function prevent(e) {
            if (e.stopPropagation) e.stopPropagation();
            if (e.preventDefault) e.preventDefault();
            e.returnValue = false;
        }

        function move(e) {
            if (dragging) {
                // Mouseup happened outside of window
                if (IE && document.documentMode < 9 && !e.button) return stop();

                var dragX = Math.max(0, Math.min(e.pageX - offset.left, maxWidth));
                var dragY = Math.max(0, Math.min(e.pageY - offset.top, maxHeight));
                onmove.apply(element, [dragX, dragY, e]);
            }
        }

        function start(e) {
            var rightclick = (e.which) ? (e.which == 3) : (e.button == 2);

            if (!rightclick && !dragging) {
                if (onstart.apply(element, arguments) !== false) {
                    dragging = true;
                    maxHeight = $(element).height();
                    maxWidth = $(element).width();
                    offset = $(element).offset();

                    $(doc).bind(duringDragEvents);
                    $(doc.body).addClass("sp-dragging");

                    move(e);
                    prevent(e);
                }
            }
        }

        function stop() {
            if (dragging) {
                $(doc).unbind(duringDragEvents);
                $(doc.body).removeClass("sp-dragging");
                onstop.apply(element, arguments);
            }
            dragging = false;
        }

        $(element).bind("mousedown", start);
    }

    /**
      * Define a jQuery plugin
      */
    var dataID = "spectrum.id";
    $.fn.spectrum = function (opts, extra) {
        if (typeof opts == "string") {
            var returnValue = this;
            var args = Array.prototype.slice.call(arguments, 1);
            this.each(function () {
                var spect = spectrums[$(this).data(dataID)];
                if (spect) {
                    var method = spect[opts];
                    if (!method) {
                        throw new Error( "Spectrum: no such method: '" + opts + "'" );
                    }

                    if (opts == "get") {
                        returnValue = spect.get();
                    } else if (opts == "container") {
                        returnValue = spect.container;
                    } else if (opts == "option") {
                        returnValue = spect.option.apply(spect, args);
                    } else if (opts == "destroy") {
                        spect.destroy();
                        $(this).removeData(dataID);
                    } else {
                        method.apply(spect, args);
                    }
                }
            });
            return returnValue;
        }

        // Initializing a new instance of spectrum
        return this.spectrum("destroy").each(function () {
            var options = myt.extend({}, opts, $(this).data());
            var spect = spectrum(this, options);
            $(this).data(dataID, spect.id);
        });
    };

    $.fn.spectrum.load = true;
    $.fn.spectrum.draggable = draggable;
    $.fn.spectrum.defaults = defaultOpts;
    $.spectrum = {};

    // TinyColor v1.0.0
    // https://github.com/bgrins/TinyColor
    // Brian Grinstead, MIT License
    (function() {

    var trimHash = /^[#]+/,
        math = Math,
        mathRound = math.round,
        mathMin = math.min,
        mathMax = math.max;

    var tinycolor = function tinycolor(color) {
        color = color ? color : '';

        // If input is already a tinycolor, return itself
        if (color instanceof tinycolor) return color;

        // If we are called as a function, call using new instead
        if (!(this instanceof tinycolor)) return new tinycolor(color);

        // Input to RGB
        var rgb = {r:0, g:0, b:0},
            ok = false;
        if (typeof color == "string") color = stringInputToObject(color);
        if (typeof color == "object") {
            if (color.hasOwnProperty("r") && color.hasOwnProperty("g") && color.hasOwnProperty("b")) {
                rgb = rgbToRgb(color.r, color.g, color.b);
                ok = true;
            } else if (color.hasOwnProperty("h") && color.hasOwnProperty("s") && color.hasOwnProperty("v")) {
                color.s = convertToPercentage(color.s);
                color.v = convertToPercentage(color.v);
                rgb = hsvToRgb(color.h, color.s, color.v);
                ok = true;
            }
        }

        this._r = mathMin(255, mathMax(rgb.r, 0));
        this._g = mathMin(255, mathMax(rgb.g, 0));
        this._b = mathMin(255, mathMax(rgb.b, 0));
        this._ok = ok;

        // Don't let the range of [0,255] come back in [0,1].
        // Potentially lose a little bit of precision here, but will fix issues where
        // .5 gets interpreted as half of the total, instead of half of 1
        // If it was supposed to be 128, this was already taken care of by `inputToRgb`
        if (this._r < 1) this._r = mathRound(this._r);
        if (this._g < 1) this._g = mathRound(this._g);
        if (this._b < 1) this._b = mathRound(this._b);
    };

    tinycolor.prototype = {
        isValid: function() {
            return this._ok;
        },
        toHsv: function() {
            var hsv = rgbToHsv(this._r, this._g, this._b);
            return {h:hsv.h * 360, s:hsv.s, v:hsv.v};
        },
        toHsl: function() {
            var hsl = rgbToHsl(this._r, this._g, this._b);
            return {h:hsl.h * 360, s:hsl.s, l:hsl.l};
        },
        toHexString: function() {
            return myt.Color.rgbToHex(this._r, this._g, this._b, true);
        }
    };

    // If input is an object, force 1 into "1.0" to handle ratios properly
    // String input requires "1.0" as input, so 1 will be treated as 1
    tinycolor.fromRatio = function(color) {
        if (typeof color == "object") {
            var newColor = {};
            for (var i in color) {
                if (color.hasOwnProperty(i)) newColor[i] = convertToPercentage(color[i]);
            }
            color = newColor;
        }
        return tinycolor(color);
    };

    // `equals`
    // Can be called with any tinycolor input
    tinycolor.equals = function (color1, color2) {
        if (!color1 || !color2) return false;
        return tinycolor(color1).toHexString() == tinycolor(color2).toHexString();
    };

    // `rgbToHsl`, `rgbToHsv`, `hsvToRgb` modified from:
    // <http://mjijackson.com/2008/02/rgb-to-hsl-and-rgb-to-hsv-color-model-conversion-algorithms-in-javascript>

    // `rgbToRgb`
    // Handle bounds / percentage checking to conform to CSS color spec
    // <http://www.w3.org/TR/css3-color/>
    // *Assumes:* r, g, b in [0, 255] or [0, 1]
    // *Returns:* { r, g, b } in [0, 255]
    function rgbToRgb(r, g, b){
        return {
            r:bound01(r, 255) * 255,
            g:bound01(g, 255) * 255,
            b:bound01(b, 255) * 255
        };
    }

    // `rgbToHsl`
    // Converts an RGB color value to HSL.
    // *Assumes:* r, g, and b are contained in [0, 255] or [0, 1]
    // *Returns:* { h, s, l } in [0,1]
    function rgbToHsl(r, g, b) {
        r = bound01(r, 255);
        g = bound01(g, 255);
        b = bound01(b, 255);

        var max = mathMax(r, g, b), min = mathMin(r, g, b);
        var h, s, l = (max + min) / 2;

        if (max == min) {
            h = s = 0; // achromatic
        } else {
            var d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch(max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }
        return {h:h, s:s, l:l};
    }

    // `rgbToHsv`
    // Converts an RGB color value to HSV
    // *Assumes:* r, g, and b are contained in the set [0, 255] or [0, 1]
    // *Returns:* { h, s, v } in [0,1]
    function rgbToHsv(r, g, b) {
        r = bound01(r, 255);
        g = bound01(g, 255);
        b = bound01(b, 255);

        var max = mathMax(r, g, b), min = mathMin(r, g, b);
        var h, s, v = max;

        var d = max - min;
        s = max === 0 ? 0 : d / max;

        if (max == min) {
            h = 0; // achromatic
        } else {
            switch(max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }
        return {h:h, s:s, v:v};
    }

    // `hsvToRgb`
    // Converts an HSV color value to RGB.
    // *Assumes:* h is contained in [0, 1] or [0, 360] and s and v are contained in [0, 1] or [0, 100]
    // *Returns:* { r, g, b } in the set [0, 255]
    function hsvToRgb(h, s, v) {
        h = bound01(h, 360) * 6;
        s = bound01(s, 100);
        v = bound01(v, 100);

        var i = math.floor(h),
            f = h - i,
            p = v * (1 - s),
            q = v * (1 - f * s),
            t = v * (1 - (1 - f) * s),
            mod = i % 6,
            r = [v, q, p, p, t, v][mod],
            g = [t, v, v, q, p, p][mod],
            b = [p, p, t, v, v, q][mod];

        return {r:r * 255, g:g * 255, b:b * 255};
    }

    // Take input from [0, n] and return it as [0, 1]
    function bound01(n, max) {
        var isString = typeof n == "string";
        if (isString && n.indexOf('.') != -1 && parseFloat(n) === 1) n = "100%";

        var isPercentage = isString && n.indexOf('%') != -1;
        n = mathMin(max, mathMax(0, parseFloat(n)));

        // Automatically convert percentage into number
        if (isPercentage) n = parseInt(n * max, 10) / 100;

        // Handle floating point rounding errors
        if (math.abs(n - max) < 0.000001) return 1;

        // Convert into [0, 1] range if it isn't already
        return (n % max) / parseFloat(max);
    }

    // Replace a decimal with it's percentage value
    function convertToPercentage(n) {
        return n <= 1 ? (n * 100) + "%" : n;
    }

    var matchers = (function() {
        // Allow positive/negative integer/number. Don't capture the either/or, just the entire outcome.
        var CSS_UNIT = "(?:[-\\+]?\\d*\\.\\d+%?)|(?:[-\\+]?\\d+%?)";
        return {
            rgb: new RegExp("rgb[\\s|\\(]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")\\s*\\)?"),
            hex6: /^([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/
        };
    })();

    // `stringInputToObject`
    // Permissive string parsing.  Take in a number of formats, and output an object
    // based on detected format.  Returns `{ r, g, b }` or `{ h, s, l }` or `{ h, s, v}`
    function stringInputToObject(color) {
        color = color.trim().toLowerCase().replace(trimHash, '');

        // Try to match string input using regular expressions.
        // Keep most of the number bounding out of this function - don't worry about [0,1] or [0,100] or [0,360]
        // Just return an object and let the conversion functions handle that.
        // This way the result will be the same whether the tinycolor is initialized with string or object.
        var match;
        if (match = matchers.rgb.exec(color)) return {r:match[1], g:match[2], b:match[3]};
        if (match = matchers.hex6.exec(color)) {
            return {
                r: parseInt(match[1], 16),
                g: parseInt(match[2], 16),
                b: parseInt(match[3], 16)
            };
        }
        return false;
    }

    window.tinycolor = tinycolor;
    })();

})(window, jQuery);


/**
 * jquery-simple-datetimepicker (jquery.simple-dtpicker.js)
 * v1.12.0
 * (c) Masanori Ohgita - 2014.
 * https://github.com/mugifly/jquery-simple-datetimepicker
 */
(function (window, $, undefined) {
	"use strict";
	var lang = {
		en: {
			days: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
			months: [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ],
			sep: '-',
			prevMonth: 'Previous month',
			nextMonth: 'Next month',
			today: 'Today'
		},
		ro:{
			days: ['Dum', 'Lun', 'Mar', 'Mie', 'Joi', 'Vin', 'Sâm'],
			months: ['Ian', 'Feb', 'Mar', 'Apr', 'Mai', 'Iun', 'Iul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
			sep: '.',
			prevMonth: 'Luna precedentă',
			nextMonth: 'Luna următoare',
			today: 'Azi'
		},
		ja: {
			days: ['日', '月', '火', '水', '木', '金', '土'],
			months: [ "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12" ],
			sep: '/'
		},
		ru: {
			days: ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
			months: [ "Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек" ]
		},
		br: {
			days: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
			months: [ "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro" ]
		},
		pt: {
			days: ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'],
			months: [ "janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro" ]
		},
		cn: {
			days: ['日', '一', '二', '三', '四', '五', '六'],
			months: [ "一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月" ]
		},
		de: {
			days: ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'],
			months: [ "Jan", "Feb", "März", "Apr", "Mai", "Juni", "Juli", "Aug", "Sept", "Okt", "Nov", "Dez" ]
		},
		sv: {
			days: ['Sö', 'Må', 'Ti', 'On', 'To', 'Fr', 'Lö'],
			months: [ "Jan", "Feb", "Mar", "Apr", "Maj", "Juni", "Juli", "Aug", "Sept", "Okt", "Nov", "Dec" ]
		},
		id: {
			days: ['Min','Sen','Sel', 'Rab', 'Kam', 'Jum', 'Sab'],
			months: [ "Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des" ]
		},
		it: {
			days: ['Dom','Lun','Mar', 'Mer', 'Gio', 'Ven', 'Sab'],
			months: [ "Gen", "Feb", "Mar", "Apr", "Mag", "Giu", "Lug", "Ago", "Set", "Ott", "Nov", "Dic" ]
		},
		tr: {
			days: ['Pz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cu', 'Cts'],
			months: [ "Ock", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Agu", "Eyl", "Ekm", "Kas", "Arlk" ]
		},
		es: {
			days: ['dom', 'lun', 'mar', 'miér', 'jue', 'vié', 'sáb'],
			months: [ "ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic" ]
		},
		ko: {
			days: ['일', '월', '화', '수', '목', '금', '토'],
			months: [ "1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월" ]
		},
		nl: {
			days: ['zo', 'ma', 'di', 'wo', 'do', 'vr', 'za'],
			months: [ "jan", "feb", "mrt", "apr", "mei", "jun", "jul", "aug", "sep", "okt", "nov", "dec" ],
		},
		cz: {
			days: ['Ne', 'Po', 'Út', 'St', 'Čt', 'Pá', 'So'],
			months: [ "Led", "Úno", "Bře", "Dub", "Kvě", "Čer", "Čvc", "Srp", "Zář", "Říj", "Lis", "Pro" ]
		},
		fr: {
			days: ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'],
			months: [ "Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre" ]
		},
		pl: {
			days: ['N', 'Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So'],
			months: [ "Styczeń", "Luty", "Marzec", "Kwiecień", "Maj", "Czerwiec", "Lipiec", "Sierpień", "Wrzesień", "Październik", "Listopad", "Grudzień" ],
			prevMonth: 'Poprzedni miesiąc',
			nextMonth: 'Następny miesiąc',
			today: 'Dzisiaj'
		},
		gr: {
			days: ['Κυ', 'Δε', 'Τρ', 'Τε', 'Πε', 'Πα', 'Σα'],
			months: [ "Ιαν", "Φεβ", "Μαρ", "Απρ", "Μαϊ", "Ιουν", "Ιουλ", "Αυγ", "Σεπ", "Οκτ", "Νοε", "Δεκ" ],
			prevMonth: 'Προηγ. μήνας',
			nextMonth: 'Επόμ. μήνας',
			today: 'Σήμερα'
		}
	};

	var getParentPickerObject = function(obj) {
		return $(obj).closest('.datepicker');
	};

	var beforeMonth = function($obj) {
		var $picker = getParentPickerObject($obj);

		if ($picker.data('stateAllowBeforeMonth') === false) return;

		var date = getPickedDate($picker);
		var targetMonth_lastDay = new Date(date.getFullYear(), date.getMonth(), 0).getDate();
		if (targetMonth_lastDay < date.getDate()) date.setDate(targetMonth_lastDay);
		draw($picker, date.getFullYear(), date.getMonth() - 1, date.getDate(), date.getHours(), date.getMinutes());

		var todayDate = new Date();
		var isCurrentYear = todayDate.getFullYear() == date.getFullYear();
		var isCurrentMonth = isCurrentYear && todayDate.getMonth() == date.getMonth();
		
		if (!isCurrentMonth || !$picker.data("futureOnly")) {
			if (targetMonth_lastDay < date.getDate()) date.setDate(targetMonth_lastDay);
			draw($picker, date.getFullYear(), date.getMonth() - 1, date.getDate(), date.getHours(), date.getMinutes());
		}
	};

	var nextMonth = function($obj) {
		var $picker = getParentPickerObject($obj);
		var date = getPickedDate($picker);
		var targetMonth_lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
		if (targetMonth_lastDay < date.getDate()) date.setDate(targetMonth_lastDay);

		// Check a last date of a next month
		var lastDate = (new Date(date.getFullYear(), date.getMonth() + 2, 0)).getDate();
		if (lastDate < date.getDate()) date.setDate(lastDate);

		draw($picker, date.getFullYear(), date.getMonth() + 1, date.getDate(), date.getHours(), date.getMinutes());
	};
	
	var beforeDay = function($obj) {
		var $picker = getParentPickerObject($obj);
		var date = getPickedDate($picker);
		date.setDate(date.getDate() - 1);
		draw($picker, date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes());
	};
	
	var afterDay = function($obj) {
		var $picker = getParentPickerObject($obj);
		var date = getPickedDate($picker);
		date.setDate(date.getDate() + 1);
		draw($picker, date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes());
	};

	var getPickedDate = function($obj) {
		return getParentPickerObject($obj).data("pickedDate");
	};

	var zpadding = function(num) {
		return ("0" + num).slice(-2);
	};

	var translate = function(locale, s) {
		if (typeof lang[locale][s] !== "undefined") return lang[locale][s];
		return lang.en[s];
	};

	var draw = function($picker, year, month, day, hour, min) {
		var date;
		if (hour != null) {
			date = new Date(year, month, day, hour, min, 0);
		} else if (year != null) {
			date = new Date(year, month, day);
		} else {
			date = new Date();
		}

		var isTodayButton = $picker.data("todayButton");
		var isFutureOnly = $picker.data("futureOnly");
		var minDate = $picker.data("minDate");
		var maxDate = $picker.data("maxDate");

		var minuteInterval = $picker.data("minuteInterval");
		var firstDayOfWeek = $picker.data("firstDayOfWeek");

		var allowWdays = $picker.data("allowWdays");
		if (allowWdays == null || Array.isArray(allowWdays) === false || allowWdays.length <= 0) allowWdays = null;
		
		var minTime = $picker.data("minTime");
		var maxTime = $picker.data("maxTime");

		/* Check a specified date */
		var todayDate = new Date();
		if (isFutureOnly) {
			if (date.getTime() < todayDate.getTime()) { // Already passed
				date.setTime(todayDate.getTime());
			}
		}
		if(allowWdays != null && allowWdays.length <= 6) {
			while (true) {
				if ($.inArray(date.getDay(), allowWdays) == -1) { // Unallowed wday
					// Slide a date
					date.setDate(date.getDate() + 1);
				} else {
					break;
				}
			}
		}

		/* Read locale option */
		var locale = $picker.data("locale");
		if (!lang.hasOwnProperty(locale)) locale = 'en';

		/* Calculate dates */
		var firstWday = new Date(date.getFullYear(), date.getMonth(), 1).getDay() - firstDayOfWeek;
		var lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
		var beforeMonthLastDay = new Date(date.getFullYear(), date.getMonth(), 0).getDate();
		var dateBeforeMonth = new Date(date.getFullYear(), date.getMonth(), 0);
		var dateNextMonth = new Date(date.getFullYear(), date.getMonth() + 2, 0);
		var isCurrentYear = todayDate.getFullYear() == date.getFullYear();
		var isCurrentMonth = isCurrentYear && todayDate.getMonth() == date.getMonth();
		var isCurrentDay = isCurrentMonth && todayDate.getDate() == date.getDate();
		var isPastMonth = false;
		if (date.getFullYear() < todayDate.getFullYear() || (isCurrentYear && date.getMonth() < todayDate.getMonth())) {
			isPastMonth = true;
		}

		/* Collect each part */
		var $header = $picker.children('.datepicker_header');
		var $inner = $picker.children('.datepicker_inner_container');
		var $calendar = $picker.children('.datepicker_inner_container').children('.datepicker_calendar');
		var $table = $calendar.children('.datepicker_table');
		var $timelist = $picker.children('.datepicker_inner_container').children('.datepicker_timelist');

		/* Grasp a point that will be changed */
		var changePoint = "";
		var oldDate = getPickedDate($picker);
		if(oldDate != null){
			if(oldDate.getMonth() != date.getMonth() || oldDate.getDate() != date.getDate()){
				changePoint = "calendar";
			} else if (oldDate.getHours() != date.getHours() || oldDate.getMinutes() != date.getMinutes()){
				if(date.getMinutes() === 0 || date.getMinutes() % minuteInterval === 0){
					changePoint = "timelist";
				}
			}
		}

		/* Save new date to Picker data */
		$($picker).data("pickedDate", date);
		$.fn.dtpicker.dialog._dtpickerCallback(date);

		/* Remind timelist scroll state */
		var drawBefore_timeList_scrollTop = $timelist.scrollTop();

		/* New timelist  */
		var timelist_activeTimeCell_offsetTop = -1;

		if ($picker.data("timeOnly") === true) {
			$calendar.css("border-right", '0px');
			$timelist.css("width", '130px');
		} else {
			/* Header ----- */
			$header.children().remove();
	
			var cDate = new Date(date.getTime());
			cDate.setMinutes(59);
			cDate.setHours(23);
			cDate.setSeconds(59);
			cDate.setDate(0); // last day of previous month
	
			var $link_before_month = null;
			if ((!isFutureOnly || !isCurrentMonth) && ((minDate == null) || (minDate < cDate.getTime()))) {
				$link_before_month = $('<a>');
				$link_before_month.text('<');
				$link_before_month.prop('alt', translate(locale,'prevMonth'));
				$link_before_month.prop('title', translate(locale,'prevMonth') );
				$link_before_month.click(function() {
					beforeMonth($picker);
				});
				$picker.data('stateAllowBeforeMonth', true);
			} else {
				$picker.data('stateAllowBeforeMonth', false);
			}
	
			cDate.setMinutes(0);
			cDate.setHours(0);
			cDate.setSeconds(0);
			cDate.setDate(1); // First day of next month
			cDate.setMonth(date.getMonth() + 1);
	
			var $now_month = $('<span>');
			$now_month.text(date.getFullYear() + " " + translate(locale, 'sep') + " " + translate(locale, 'months')[date.getMonth()]);
	
			var $link_next_month = null;
			if ((maxDate == null) || (maxDate > cDate.getTime())) {
				$link_next_month = $('<a>');
				$link_next_month.text('>');
				$link_next_month.prop('alt', translate(locale,'nextMonth'));
				$link_next_month.prop('title', translate(locale,'nextMonth'));
				$link_next_month.click(function() {
					nextMonth($picker);
				});
			}
	
			if (isTodayButton) {
				var $link_today = $('<a/>');
				/* This icon resource from a part of "FontAwesome" by Dave Gandy - http://fontawesome.io".
					http://fortawesome.github.io/Font-Awesome/license/
					Thankyou. */
				$link_today.html(decodeURIComponent('%3c%3fxml%20version%3d%221%2e0%22%20encoding%3d%22UTF%2d8%22%20standalone%3d%22no%22%3f%3e%3csvg%20%20xmlns%3adc%3d%22http%3a%2f%2fpurl%2eorg%2fdc%2felements%2f1%2e1%2f%22%20%20xmlns%3acc%3d%22http%3a%2f%2fcreativecommons%2eorg%2fns%23%22%20xmlns%3ardf%3d%22http%3a%2f%2fwww%2ew3%2eorg%2f1999%2f02%2f22%2drdf%2dsyntax%2dns%23%22%20%20xmlns%3asvg%3d%22http%3a%2f%2fwww%2ew3%2eorg%2f2000%2fsvg%22%20xmlns%3d%22http%3a%2f%2fwww%2ew3%2eorg%2f2000%2fsvg%22%20%20version%3d%221%2e1%22%20%20width%3d%22100%25%22%20%20height%3d%22100%25%22%20viewBox%3d%220%200%2010%2010%22%3e%3cg%20transform%3d%22translate%28%2d5%2e5772299%2c%2d26%2e54581%29%22%3e%3cpath%20d%3d%22m%2014%2e149807%2c31%2e130932%20c%200%2c%2d0%2e01241%200%2c%2d0%2e02481%20%2d0%2e0062%2c%2d0%2e03721%20L%2010%2e57723%2c28%2e153784%207%2e0108528%2c31%2e093719%20c%200%2c0%2e01241%20%2d0%2e0062%2c0%2e02481%20%2d0%2e0062%2c0%2e03721%20l%200%2c2%2e97715%20c%200%2c0%2e217084%200%2e1798696%2c0%2e396953%200%2e3969534%2c0%2e396953%20l%202%2e3817196%2c0%200%2c%2d2%2e38172%201%2e5878132%2c0%200%2c2%2e38172%202%2e381719%2c0%20c%200%2e217084%2c0%200%2e396953%2c%2d0%2e179869%200%2e396953%2c%2d0%2e396953%20l%200%2c%2d2%2e97715%20m%201%2e383134%2c%2d0%2e427964%20c%200%2e06823%2c%2d0%2e08063%200%2e05582%2c%2d0%2e210882%20%2d0%2e02481%2c%2d0%2e279108%20l%20%2d1%2e358324%2c%2d1%2e128837%200%2c%2d2%2e530576%20c%200%2c%2d0%2e111643%20%2d0%2e08683%2c%2d0%2e198477%20%2d0%2e198477%2c%2d0%2e198477%20l%20%2d1%2e190859%2c0%20c%20%2d0%2e111643%2c0%20%2d0%2e198477%2c0%2e08683%20%2d0%2e198477%2c0%2e198477%20l%200%2c1%2e209467%20%2d1%2e513384%2c%2d1%2e265289%20c%20%2d0%2e2605%2c%2d0%2e217083%20%2d0%2e682264%2c%2d0%2e217083%20%2d0%2e942764%2c0%20L%205%2e6463253%2c30%2e42386%20c%20%2d0%2e080631%2c0%2e06823%20%2d0%2e093036%2c0%2e198476%20%2d0%2e024809%2c0%2e279108%20l%200%2e3845485%2c0%2e458976%20c%200%2e031012%2c0%2e03721%200%2e080631%2c0%2e06203%200%2e1302503%2c0%2e06823%200%2e055821%2c0%2e0062%200%2e1054407%2c%2d0%2e01241%200%2e1488574%2c%2d0%2e04342%20l%204%2e2920565%2c%2d3%2e578782%204%2e292058%2c3%2e578782%20c%200%2e03721%2c0%2e03101%200%2e08063%2c0%2e04342%200%2e13025%2c0%2e04342%200%2e0062%2c0%200%2e01241%2c0%200%2e01861%2c0%200%2e04962%2c%2d0%2e0062%200%2e09924%2c%2d0%2e03101%200%2e130251%2c%2d0%2e06823%20l%200%2e384549%2c%2d0%2e458976%22%20%2f%3e%3c%2fg%3e%3c%2fsvg%3e') );
				$link_today.addClass('icon-home');
				$link_today.prop('alt', translate(locale,'today'));
				$link_today.prop('title', translate(locale,'today'));
				$link_today.click(function() {
					var date = new Date();
					draw(getParentPickerObject($picker), date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes());
				});
				$header.append($link_today);
			}
	
			if ($link_before_month != null) $header.append($link_before_month);
			$header.append($now_month);
			if ($link_next_month != null) $header.append($link_next_month);
	
			/* Calendar > Table ----- */
			$table.children().remove();
			var $tr = $('<tr>');
			$table.append($tr);
	
			/* Output wday cells */
			var firstDayDiff = 7 + firstDayOfWeek;
			var daysOfWeek = translate(locale,'days');
			var $td;
			for (var i = 0; i < 7; i++) {
				$td = $('<th>');
				$td.text(daysOfWeek[((i + firstDayDiff) % 7)]);
				$tr.append($td);
			}
	
			/* Output day cells */
			var cellNum = Math.ceil((firstWday + lastDay) / 7) * 7;
			i = 0;
			if (firstWday < 0) i = -7;
			
			var realDayObj =  new Date(date.getTime());
			realDayObj.setHours(0);
			realDayObj.setMinutes(0);
			realDayObj.setSeconds(0);
			for (var zz = 0; i < cellNum; i++) {
				var realDay = i + 1 - firstWday;
	
				var isPast = isPastMonth || (isCurrentMonth && realDay < todayDate.getDate());
	
				if (i % 7 === 0) {
					$tr = $('<tr>');
					$table.append($tr);
				}
	
				$td = $('<td>');
				$td.data("day", realDay);
	
				$tr.append($td);
	
				if (firstWday > i) {/* Before months day */
					$td.text(beforeMonthLastDay + realDay);
					$td.addClass('day_another_month');
					$td.data("dateStr", dateBeforeMonth.getFullYear() + "/" + (dateBeforeMonth.getMonth() + 1) + "/" + (beforeMonthLastDay + realDay));
					realDayObj.setDate(beforeMonthLastDay + realDay);
					realDayObj.setMonth(dateBeforeMonth.getMonth());
					realDayObj.setYear(dateBeforeMonth.getFullYear());
				} else if (i < firstWday + lastDay) {/* Now months day */
					$td.text(realDay);
					$td.data("dateStr", (date.getFullYear()) + "/" + (date.getMonth() + 1) + "/" + realDay);
					realDayObj.setDate(realDay);
					realDayObj.setMonth(date.getMonth());
					realDayObj.setYear(date.getFullYear());
				} else {/* Next months day */
					$td.text(realDay - lastDay);
					$td.addClass('day_another_month');
					$td.data("dateStr", dateNextMonth.getFullYear() + "/" + (dateNextMonth.getMonth() + 1) + "/" + (realDay - lastDay));
					realDayObj.setDate(realDay - lastDay);
					realDayObj.setMonth(dateNextMonth.getMonth());
					realDayObj.setYear(dateNextMonth.getFullYear());
				}
	
				/* Check a wday */
				var wday = ((i + firstDayDiff) % 7);
				if(allowWdays != null) {
					if ($.inArray(wday, allowWdays) == -1) {
						$td.addClass('day_in_unallowed');
						continue; // Skip
					}
				} else if (wday === 0) {/* Sunday */
					$td.addClass('wday_sun');
				} else if (wday == 6) {/* Saturday */
					$td.addClass('wday_sat');
				}
	
				/* Set a special mark class */
				if (realDay == date.getDate()) $td.addClass('active');
	
				if (isCurrentMonth && realDay == todayDate.getDate()) $td.addClass('today');
	
				var realDayObjMN =  new Date(realDayObj.getTime());
				realDayObjMN.setHours(23);
				realDayObjMN.setMinutes(59);
				realDayObjMN.setSeconds(59);
	
				if (
					// compare to 23:59:59 on the current day (if MIN is 1pm, then we still need to show this day
					((minDate != null) && (minDate > realDayObjMN.getTime())) || ((maxDate != null) && (maxDate < realDayObj.getTime())) // compare to 00:00:00
				) { // Out of range day
					$td.addClass('out_of_range');
				} else if (isFutureOnly && isPast) { // Past day
					$td.addClass('day_in_past');
				} else {
					/* Set event-handler to day cell */
					$td.click(function() {
						if ($(this).hasClass('hover')) {
							$(this).removeClass('hover');
						}
						$(this).addClass('active');
	
						var $picker = getParentPickerObject($(this));
						var targetDate = new Date($(this).data("dateStr"));
						var selectedDate = getPickedDate($picker);
						draw($picker, targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), selectedDate.getHours(), selectedDate.getMinutes());
					});
	
					$td.hover(function() {
						if (! $(this).hasClass('active')) {
							$(this).addClass('hover');
						}
					}, function() {
						if ($(this).hasClass('hover')) {
							$(this).removeClass('hover');
						}
					});
				}
			}
		}
		
		if ($picker.data("dateOnly") === true) {
			/* dateOnly mode */
			$timelist.css("display", "none");
			$calendar.css("border-right", '0px');
		} else {
			/* Timelist ----- */
			$timelist.children().remove();

			realDayObj =  new Date(date.getTime());
			$timelist.css("height", '175px');

			/* Output time cells */
			var hour_ = minTime[0];
			var min_ = minTime[1];

			while( hour_*100+min_ < maxTime[0]*100+maxTime[1] ){
				var $o = $('<div>');
				var is_past_time = hour_ < todayDate.getHours() || (hour_ == todayDate.getHours() && min_ < todayDate.getMinutes());
				var is_past = isCurrentDay && is_past_time;
				
				$o.addClass('timelist_item');
				$o.text(zpadding(hour_) + ":" + zpadding(min_));

				$o.data("hour", hour_);
				$o.data("min", min_);

				$timelist.append($o);

				realDayObj.setHours(hour_);
				realDayObj.setMinutes(min_);

				if (
					((minDate != null) && (minDate > realDayObj.getTime())) || ((maxDate != null) && (maxDate < realDayObj.getTime()))
				) { // Out of range cell
					$o.addClass('out_of_range');
				} else if (isFutureOnly && is_past) { // Past cell
					$o.addClass('time_in_past');
				} else { // Normal cell
					/* Set event handler to time cell */
					$o.click(function() {
						if ($(this).hasClass('hover')) {
							$(this).removeClass('hover');
						}
						$(this).addClass('active');

						var $picker = getParentPickerObject($(this));
						var date = getPickedDate($picker);
						var hour = $(this).data("hour");
						var min = $(this).data("min");
						draw($picker, date.getFullYear(), date.getMonth(), date.getDate(), hour, min);
					});

					$o.hover(function() {
						if (!$(this).hasClass('active')) $(this).addClass('hover');
					}, function() {
						if ($(this).hasClass('hover')) $(this).removeClass('hover');
					});
				}
				
				if (hour_ == date.getHours() && min_ == date.getMinutes()) { /* selected time */
					$o.addClass('active');
					timelist_activeTimeCell_offsetTop = $o.offset().top;
				}

				min_ += minuteInterval;
				if (min_ >= 60){
					min_ -= 60;
					hour_++;
				}
			}

			/* Scroll the timelist */
			$timelist.scrollTop(drawBefore_timeList_scrollTop);
		}
	};

	/** Initialize dtpicker */
	$.fn.dtpicker = function(config) {
		var dialog = config.dialog;
		
		var opt = $.extend({
			"current": null,
			"locale": "en",
			"minuteInterval": 30,
			"firstDayOfWeek": 0,
			"todayButton": true,
			"dateOnly": false,
			"timeOnly": false,
			"futureOnly": false,
			"minDate" : null,
			"maxDate" : null,
			"minTime":"00:00",
			"maxTime":"23:59",
			"allowWdays": null
		}, config);
		
		/* Container */
		var $picker = $('<div>');

		$picker.addClass('datepicker');
		$(this).append($picker);

		/* Set current date */
		if (!opt.current) opt.current = new Date();

		/* Set options data to container object  */
		$picker.data("dateOnly", opt.dateOnly);
		$picker.data("timeOnly", opt.timeOnly);
		$picker.data("locale", opt.locale);
		$picker.data("firstDayOfWeek", opt.firstDayOfWeek);
		$picker.data("todayButton", opt.todayButton);
		$picker.data('futureOnly', opt.futureOnly);
		$picker.data('allowWdays', opt.allowWdays);

		var minDate = Date.parse(opt.minDate);
		$picker.data('minDate', isNaN(minDate) ? null : minDate);
		var maxDate = Date.parse(opt.maxDate);
		$picker.data('maxDate', isNaN(maxDate) ? null : maxDate);
		
		$picker.data("state", 0);

		if(5 <= opt.minuteInterval && opt.minuteInterval <= 30){
			$picker.data("minuteInterval", opt.minuteInterval);
		} else {
			$picker.data("minuteInterval", 30);
		}
		opt.minTime = opt.minTime.split(':');
		opt.maxTime = opt.maxTime.split(':');

		if(!((opt.minTime[0] >= 0 ) && (opt.minTime[0] <24 ))) opt.minTime[0]="00";
		if(!((opt.maxTime[0] >= 0 ) && (opt.maxTime[0] <24 ))) opt.maxTime[0]="23";
		if(!((opt.minTime[1] >= 0 ) && (opt.minTime[1] <60 ))) opt.minTime[1]="00";
		if(!((opt.maxTime[1] >= 0 ) && (opt.maxTime[1] <24 ))) opt.maxTime[1]="59";
		opt.minTime[0]=parseInt(opt.minTime[0]);
		opt.minTime[1]=parseInt(opt.minTime[1]);
		opt.maxTime[0]=parseInt(opt.maxTime[0]);
		opt.maxTime[1]=parseInt(opt.maxTime[1]);
		$picker.data('minTime', opt.minTime);
		$picker.data('maxTime', opt.maxTime);
		
		/* Header */
		var $header = $('<div>');
		$header.addClass('datepicker_header');
		$picker.append($header);
		
		/* InnerContainer*/
		var $inner = $('<div>');
		$inner.addClass('datepicker_inner_container');
		$picker.append($inner);
		
		/* Calendar */
		var $calendar = $('<div>');
		$calendar.addClass('datepicker_calendar');
		$calendar.css("height", '175px');
		var $table = $('<table>');
		$table.addClass('datepicker_table');
		$calendar.append($table);
		$inner.append($calendar);
		
		/* Timelist */
		var $timelist = $('<div>');
		$timelist.addClass('datepicker_timelist');
		$inner.append($timelist);

		/* Set event-handler to calendar */
		if (window.sidebar) { // Mozilla Firefox
			$calendar.bind('DOMMouseScroll', function(e){
				var $picker = getParentPickerObject($(this));
				
				// up,left [delta < 0] down,right [delta > 0]
				var delta = e.originalEvent.detail;
				if(delta > 0) {
					afterDay($picker);
				} else {
					beforeDay($picker);
				}
				return false;
			});
		} else { // Other browsers
			$calendar.bind('mousewheel', function(e){
				var $picker = getParentPickerObject($(this));
				// up [delta > 0] down [delta < 0]
				var threshold = 75, dtpicker = $.fn.dtpicker;
				if (dtpicker._delta == null) dtpicker._delta = 0;
				var delta = dtpicker._delta += e.originalEvent.wheelDeltaY;
				if(delta > threshold) {
					dtpicker._delta -= threshold;
					beforeDay($picker);
				} else if (delta < -threshold) {
					dtpicker._delta += threshold;
					afterDay($picker);
				}
				return false;
			});
		}
		
		$.fn.dtpicker.dialog = dialog;
		
		var date = opt.current;
		draw($picker, date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes());
	};
})(window, jQuery);


/** A dimmer that can be placed on another myt.View to obscure the subviews of
    that view.
    
    Events:
        None
    
    Attributes:
        restoreFocus:boolean when true focus will be sent back to the view
            that had focus before the dimmer was shown when the dimmer is
            hidden. Defaults to true.
        prevFocus:myt.View or dom element. The thing to set focus on when
            the dimmer is hidden if restoreFocus is true.
*/
myt.Dimmer = new JS.Class('Dimmer', myt.View, {
    include: [myt.SizeToParent],
    
    
    // Class Methods and Attributes ////////////////////////////////////////////
    extend: {
        DEFAULT_OPACITY: 0.35,
        DEFAULT_COLOR: '#000000'
    },
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides myt.View */
    initNode: function(parent, attrs) {
        var self = this;
        
        self.restoreFocus = true;
        
        attrs.focusable = attrs.focusCage = true;
        
        if (attrs.percentOfParentWidth == null) attrs.percentOfParentWidth = 100;
        if (attrs.percentOfParentHeight == null) attrs.percentOfParentHeight = 100;
        if (attrs.visible == null) attrs.visible = false;
        if (attrs.ignoreLayout == null) attrs.ignoreLayout = true;
        
        self.callSuper(parent, attrs);
        
        // Eat mouse events
        self.attachDomObserver(self, 'eatMouseEvent', 'mouseover');
        self.attachDomObserver(self, 'eatMouseEvent', 'mouseout');
        self.attachDomObserver(self, 'eatMouseEvent', 'mousedown');
        self.attachDomObserver(self, 'eatMouseEvent', 'mouseup');
        self.attachDomObserver(self, 'eatMouseEvent', 'click');
        self.attachDomObserver(self, 'eatMouseEvent', 'dblclick');
        self.attachDomObserver(self, 'eatMouseEvent', 'mousemove');
        
        myt.RootView.setupCaptureDrop(self);
    },
    
    /** @overrides myt.View */
    doBeforeAdoption: function() {
        this.callSuper();
        
        var M = myt,
            D = M.Dimmer;
        new M.View(this, {
            name:'overlay', ignorePlacement:true, 
            opacity:D.DEFAULT_OPACITY,
            bgColor:D.DEFAULT_COLOR,
            percentOfParentWidth:100,
            percentOfParentHeight:100
        }, [M.SizeToParent]);
    },
    
    /** @overrides myt.View */
    destroyAfterOrphaning: function() {
        myt.RootView.teardownCaptureDrop(this);
        
        this.callSuper();
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setRestoreFocus: function(v) {this.restoreFocus = v;},
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** A handler for mouse events that does nothing and prevents propogation.
        @return boolean True so that the dom event gets eaten. */
    eatMouseEvent: function(event) {
        return true;
    },
    
    /** Shows the dimmer and remembers the focus location.
        @returns void */
    show: function() {
        var self = this,
            gf = myt.global.focus;
        self.prevFocus = gf.focusedView || gf.focusedDom;
        
        self.makeHighestZIndex();
        
        // Prevent focus traversing
        if (self.focusable) self.focus();
        
        self.setVisible(true);
    },
    
    /** Hides the dimmer and restores focus if necessary.
        @returns void */
    hide: function(ignoreRestoreFocus) {
        this.setVisible(false);
        
        if (!ignoreRestoreFocus && this.restoreFocus && this.prevFocus) this.prevFocus.focus();
    }
});


/** A special "layout" that resizes the parent to fit the children rather than
    laying out the children.
    
    Events:
        axis:string
        paddingX:number
        paddingY:number
    
    Attributes:
        axis:string The axis along which to resize this view to fit its
            children. Supported values are 'x', 'y' and 'both'. Defaults to 'x'.
        paddingX:number Additional space added on the child extent along the
            x-axis. Defaults to 0.
        paddingY:number Additional space added on the child extent along the
            y-axis. Defaults to 0.
*/
myt.SizeToChildren = new JS.Class('SizeToChildren', myt.Layout, {
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides myt.Node */
    initNode: function(parent, attrs) {
        this.axis = 'x';
        this.paddingX = this.paddingY = 0;
        
        this.callSuper(parent, attrs);
    },
    
    
    // Acessors ////////////////////////////////////////////////////////////////
    setAxis: function(v) {
        if (this.axis !== v) {
            if (this.inited) {
                this.stopMonitoringAllSubviews();
                this.axis = v;
                this.startMonitoringAllSubviews();
                this.fireEvent('axis', v);
                this.update();
            } else {
                this.axis = v;
            }
        }
    },
    
    setPaddingX: function(v) {
        if (this.paddingX !== v) {
            this.paddingX = v;
            if (this.inited) {
                this.fireEvent('paddingX', v);
                this.update();
            }
        }
    },
    
    setPaddingY: function(v) {
        if (this.paddingY !== v) {
            this.paddingY = v;
            if (this.inited) {
                this.fireEvent('paddingY', v);
                this.update();
            }
        }
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** @overrides myt.ConstantLayout */
    update: function() {
        if (this.canUpdate()) {
            // Prevent inadvertent loops
            this.incrementLockedCounter();
            
            var p = this.parent;
            
            if (!p.isBeingDestroyed) {
                var svs = this.subviews, len = svs.length, i, sv,
                    max, bound,
                    axis = this.axis,
                    maxFunc = Math.max;
                if (axis !== 'y') {
                    i = len;
                    max = 0;
                    while(i) {
                        sv = svs[--i];
                        if (sv.visible) {
                            bound = sv.boundsWidth;
                            bound = bound > 0 ? bound : 0;
                            max = maxFunc(max, sv.x + bound);
                        }
                    }
                    p.setWidth(max + this.paddingX);
                }
                if (axis !== 'x') {
                    i = len;
                    max = 0;
                    while(i) {
                        sv = svs[--i];
                        if (sv.visible) {
                            bound = sv.boundsHeight;
                            bound = bound > 0 ? bound : 0;
                            max = maxFunc(max, sv.y + bound);
                        }
                    }
                    p.setHeight(max + this.paddingY);
                }
            }
            
            this.decrementLockedCounter();
        }
    },
    
    /** @overrides myt.Layout
        Provides a default implementation that calls update when the
        visibility of a subview changes. */
    startMonitoringSubview: function(sv) {
        this.__updateMonitoringSubview(sv, this.attachTo);
    },
    
    /** @overrides myt.Layout
        Provides a default implementation that calls update when the
        visibility of a subview changes. */
    stopMonitoringSubview: function(sv) {
        this.__updateMonitoringSubview(sv, this.detachFrom);
    },
    
    /** Wrapped by startMonitoringSubview and stopMonitoringSubview.
        @private */
    __updateMonitoringSubview: function(sv, func) {
        var axis = this.axis;
        func = func.bind(this);
        if (axis !== 'y') {
            func(sv, 'update', 'x');
            func(sv, 'update', 'boundsWidth');
        }
        if (axis !== 'x') {
            func(sv, 'update', 'y');
            func(sv, 'update', 'boundsHeight');
        }
        func(sv, 'update', 'visible');
    }
});


/** An myt.Dimmer that also provides a content panel.
    
    Attributes:
        content:myt.View The content view placed inside the dimmer.
        sizingStrategy:string Determines how the content view is positioned
            relative to the bounds of the dimmer. Supported values are:
                children: The content will be sized to fit the children it
                    contains. The content will be positioned in the center and
                    middle of the dimmer. This is the default sizingStrategy
                parent: The content will be sized to the bounds of the dimmer.
                basic: The content will not be sized in any way. It will be
                    positioned in the center and middle of the dimmer.
                none: The content will not be sized or positioned in any way.
        marginTop:number The margin above the content when the sizingStrategy
            is "parent". Defaults to 40 if not provided.
        marginLeft:number The margin on the left side of the content when 
            the sizingStrategy is "parent". Defaults to 40 if not provided.
        marginBottom:number The margin below the content when the 
            sizingStrategy is "parent". Defaults to 40 if not provided.
        marginRight:number The margin on the right side of the content when 
            the sizingStrategy is "parent". Defaults to 40 if not provided.
        paddingX:number The internal horizontal padding when the sizingStrategy
            is "children". Defaults to 20 if not provided.
        paddingY:number The internal vertical padding when the sizingStrategy
            is "children". Defaults to 15 if not provided.
        
    Events:
        None
*/
myt.ModalPanel = new JS.Class('ModalPanel', myt.Dimmer, {
    // Class Methods and Attributes ////////////////////////////////////////////
    extend: {
        DEFAULT_PADDING_X:20,
        DEFAULT_PADDING_Y:15,
        
        DEFAULT_MARGIN_TOP:40,
        DEFAULT_MARGIN_LEFT:40,
        DEFAULT_MARGIN_BOTTOM:40,
        DEFAULT_MARGIN_RIGHT:40
    },
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    initNode: function(parent, attrs) {
        this.defaultPlacement = 'content';
        
        if (attrs.sizingStrategy == null) attrs.sizingStrategy = 'children';
        
        var MP = myt.ModalPanel;
        
        // Used for parent sizing strategy
        if (attrs.marginTop == null) attrs.marginTop = MP.DEFAULT_MARGIN_TOP;
        if (attrs.marginLeft == null) attrs.marginLeft = MP.DEFAULT_MARGIN_LEFT;
        if (attrs.marginBottom == null) attrs.marginBottom = MP.DEFAULT_MARGIN_BOTTOM;
        if (attrs.marginRight == null) attrs.marginRight = MP.DEFAULT_MARGIN_RIGHT;
        
        // Used for "children" sizing strategy
        if (attrs.paddingX == null) attrs.paddingX = MP.DEFAULT_PADDING_X;
        if (attrs.paddingY == null) attrs.paddingY = MP.DEFAULT_PADDING_Y;
        
        this.callSuper(parent, attrs);
    },
    
    doBeforeAdoption: function() {
        var self = this,
            M = myt,
            V = M.View,
            viewAttrs = {name:'content', ignorePlacement:true},
            centeredViewAttrs = M.extend({}, viewAttrs, {align:'center', valign:'middle'});
        
        self.callSuper();
        
        switch (self.sizingStrategy) {
            case 'children':
                new M.SizeToChildren(new V(self, centeredViewAttrs), {
                    name:'sizeToChildren', axis:'both',
                    paddingX:self.paddingX, 
                    paddingY:self.paddingY
                });
                break;
            case 'parent':
                new V(self, M.extend(viewAttrs, {
                    x:self.marginLeft,
                    y:self.marginTop,
                    percentOfParentWidthOffset:-self.marginLeft - self.marginRight,
                    percentOfParentHeightOffset:-self.marginTop - self.marginBottom,
                    percentOfParentWidth:100,
                    percentOfParentHeight:100,
                }), [M.SizeToParent]);
                break;
            case 'basic':
                new V(self, centeredViewAttrs);
                break;
            case 'none':
            default:
                new V(self, viewAttrs);
        }
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setSizingStrategy: function(v) {this.sizingStrategy = v;},
    
    setMarginTop: function(v) {this.marginTop = v;},
    setMarginLeft: function(v) {this.marginLeft = v;},
    setMarginBottom: function(v) {this.marginBottom = v;},
    setMarginRight: function(v) {this.marginRight = v;},
    
    setPaddingX: function(v) {this.paddingX = v;},
    setPaddingY: function(v) {this.paddingY = v;}
});


/** A spinner that uses the CSS border property and a CSS rotation animation
        to create the appearance of a spinner.
    
    Events:
        spinColor
    
    Attributes:
        size:number The width and height of the spinner.
        spinColor:color_string The color spinning quarter of the border.
    
    Private Attributes:
        None
*/
myt.Spinner = new JS.Class('Spinner', myt.View, {
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides myt.View */
    initNode: function(parent, attrs) {
        var self = this;
        
        self.lateAttrs = ['spinColor'];
        
        if (attrs.visible == null) attrs.visible = false;
        if (attrs.borderWidth == null) attrs.borderWidth = 5;
        if (attrs.borderColor == null) attrs.borderColor = '#ffffff';
        if (attrs.borderStyle == null) attrs.borderStyle = 'solid';
        if (attrs.spinColor == null) attrs.spinColor = '#000000';
        
        self.callSuper(parent, attrs);
        
        self.deStyle.borderRadius = '50%';
        
        self._updateSize();
        self._spin();
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setSize: function(v) {
        if (this.size !== v) {
            this.size = v;
            if (this.inited) this._updateSize();
        }
    },
    
    setSpinColor: function(v) {
        if (this.spinColor !== v) {
            this.deStyle.borderTopColor = this.spinColor = v;
            if (this.inited) this.fireEvent('spinColor', v);
        }
    },
    
    /** @overrides myt.View */
    setBorderWidth: function(v) {
        if (this.borderWidth !== v) {
            this.callSuper(v);
            if (this.inited) this._updateSize();
        }
    },
    
    /** @overrides myt.View */
    setVisible: function(v) {
        if (this.visible !== v) {
            this.callSuper(v);
            if (this.inited) this._spin();
        }
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** @private */
    _spin: function() {
        this[this.visible ? 'addDomClass' : 'removeDomClass']('mytCenterSpin');
    },
    
    /** Remove the border from the dom element width and height so that the
        spinner doesn't take up more space that the size.
        @private */
    _updateSize: function() {
        var self = this,
            size = self.size,
            deStyle = self.deStyle;
        self.setWidth(size);
        self.setHeight(size);
        deStyle.width = deStyle.height = (size - 2*self.borderWidth) + 'px';
    }
});


/** The class used as the DEFAULT_BUTTON_CLASS in myt.Dialog.
    
    Events:
        None
    
    Attributes:
        None
*/
myt.DialogButton = new JS.Class('DialogButton', myt.SimpleButton, {
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides */
    initNode: function(parent, attrs) {
        if (attrs.height == null) attrs.height = 20;
        if (attrs.shrinkToFit == null) attrs.shrinkToFit = true;
        if (attrs.inset == null) attrs.inset = 10;
        if (attrs.outset == null) attrs.outset = 10;
        if (attrs.textY == null) attrs.textY = 3;
        if (attrs.roundedCorners == null) attrs.roundedCorners = 5;
        
        if (attrs.activeColor == null) attrs.activeColor = '#bbbbbb';
        if (attrs.hoverColor == null) attrs.hoverColor = '#dddddd';
        if (attrs.readyColor == null) attrs.readyColor = '#cccccc';
        if (attrs.textColor == null) attrs.textColor = '#000000';
        
        var fontSize = attrs.fontSize,
            shrinkToFit = attrs.shrinkToFit,
            text = attrs.text || '';
        delete attrs.fontSize;
        delete attrs.shrinkToFit;
        delete attrs.text;
        
        this.callSuper(parent, attrs);
        
        var textView = this.textView = new myt.Text(this, {
            x:this.inset, 
            y:this.textY, 
            text:text,
            fontSize:fontSize,
            whiteSpace:'nowrap',
            domClass:'myt-Text mytButtonText'
        });
        if (shrinkToFit) this.applyConstraint('__update', [this, 'inset', this, 'outset', textView, 'width']);
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setText: function(v) {
        if (this.inited) this.textView.setText(v);
    },
    
    setTooltip: function(v) {
        this.getInnerDomElement().title = v;
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** @private */
    __update: function(v) {
        if (!this.destroyed) {
            var inset = this.inset,
                textView = this.textView;
            textView.setX(inset);
            this.setWidth(inset + textView.width + this.outset);
        }
    }
});


/** A modal panel that contains a Dialog.
    
    Events:
        None
    
    Attributes:
        displayMode:string (read only) Indicates what kind of dialog this 
            component is currently configured as. Allowed values are: 'blank',
            'message', 'spinner', 'color_picker', 'date_picker' and 'confirm'.
        callbackFunction:function (read only) A function that gets called when 
            the dialog is about to be closed. A single argument is passed in 
            that indicates the UI element interacted with that should close the 
            dialog. Supported values are: 'closeBtn', 'cancelBtn' and 
            'confirmBtn'. The function should return true if the close should 
            be aborted.
*/
myt.Dialog = new JS.Class('Dialog', myt.ModalPanel, {
    // Class Methods and Attributes ////////////////////////////////////////////
    extend: {
        DEFAULT_RADIUS: 12,
        DEFAULT_SHADOW: [0, 4, 20, '#666666'],
        DEFAULT_BORDER: [1, 'solid', '#ffffff'],
        DEFAULT_BGCOLOR: '#ffffff',
        DEFAULT_BUTTON_CLASS: myt.DialogButton,
        
        /** Makes the text wrap at 200px and the dialog will be at
            least 200px wide. */
        WRAP_TEXT_DEFAULTS: {
            width:200,
            fontWeight:'bold',
            whiteSpace:'normal',
            wordWrap:'break-word'
        },
        
        /** Makes the text stay on a single line and the dialog sizes to fit. */
        NO_WRAP_TEXT_DEFAULTS: {
            width:'auto',
            fontWeight:'bold',
            whiteSpace:'nowrap',
            wordWrap:'break-word'
        },
        
        /** Defaults used in a confirm dialog. */
        CONFIRM_DEFAULTS: {
            cancelTxt:'Cancel',
            confirmTxt:'Confirm',
            maxContainerHeight:300
        },
        
        /** Defaults used in a color picker dialog. */
        PICKER_DEFAULTS: {
            cancelTxt:'Cancel',
            confirmTxt:'Choose',
            titleText:'Choose a Color',
            color:'#000000'
        },
        
        /** Defaults used in a date picker dialog. */
        DATE_PICKER_DEFAULTS: {
            cancelTxt:'Cancel',
            confirmTxt:'Choose',
            titleText:'Choose a Date',
            timeOnlyTitleText:'Choose a Time',
            color:'#000000'
        }
    },
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides */
    initNode: function(parent, attrs) {
        if (attrs.buttonClass == null) attrs.buttonClass = myt.Dialog.DEFAULT_BUTTON_CLASS;
        
        this.callSuper(parent, attrs);
    },
    
    doAfterAdoption: function() {
        this.setupDialog();
        
        this.callSuper();
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setButtonClass: function(v) {this.buttonClass = v;},
    setDisplayMode: function(v) {this.displayMode = v;},
    setCallbackFunction: function(v) {this.callbackFunction = v;},
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** Does basic styling of a dialog and creates a close button.
        @returns void */
    setupDialog: function() {
        var D = myt.Dialog,
            content = this.content;
        content.setRoundedCorners(D.DEFAULT_RADIUS);
        content.setBgColor(D.DEFAULT_BGCOLOR);
        content.setBoxShadow(D.DEFAULT_SHADOW);
        content.setBorder(D.DEFAULT_BORDER);
        content.setFocusCage(true);
        
        this.createCloseButton(content, this);
    },
    
    /** Creates a close button on the provided targetView.
        @param targetView:myt.View The view to create the button on.
        @param callbackTarget:object An object with a doCallback method
            that will get called when the close button is activated.
        @param hoverColor:color (optional) The color used when the mouse 
            hovers over the button. Defaults to '#666666'.
        @param activeColor:color (optional) The color used when the button 
            is active. Defaults to '#000000'.
        @param readyColor:color (optional) The color used when the button 
            is ready to be activated. Defaults to '#333333'.
        @param iconColor:color (optional) The color used to draw the 
            close icon. Defaults to '#ffffff'.
        @returns myt.Button: The created button. */
    createCloseButton: function(
        targetView, callbackTarget, hoverColor, activeColor, readyColor, iconColor
    ) {
        return new this.buttonClass(targetView, {
            name:'closeBtn',
            ignoreLayout:true, width:16, height:16, y:4, align:'right', alignOffset:4,
            inset:3, textY:1, shrinkToFit:false,
            roundedCorners:8,
            activeColor:activeColor || '#cc0000',
            hoverColor:hoverColor || '#ff3333',
            readyColor:readyColor || '#ff0000',
            textColor:'#ffffff',
            fontSize:'12.5px',
            text:myt.FontAwesome.makeTag(['close']),
            tooltip:'Close Dialog.',
        }, [{
            doActivated: function() {callbackTarget.doCallback(this);}
        }]);
    },
    
    /** @overrides myt.Dimmer */
    hide: function(ignoreRestoreFocus) {
        this.__hideSpinner();
        
        this.callSuper(ignoreRestoreFocus);
    },
    
    /** Hide spinner related elements.
        @private
        @returns void */
    __hideSpinner: function() {
        if (this.spinner) {
            this.spinner.setVisible(false);
            this.spinner = undefined;
        }
    },
    
    /** @overrides myt.Dimmer */
    eatMouseEvent: function(event) {
        if (this.displayMode === 'message') this.content.closeBtn.focus();
        return this.callSuper(event);
    },
    
    /** Called before a dialog is shown to reset state and cleanup UI elements
        from the previous display of the Dialog.
        @private
        @returns void */
    __destroyContent: function() {
        this.__hideSpinner();
        
        var M = myt,
            MP = M.ModalPanel, 
            MD = M.Dialog,
            content = this.content, 
            stc = content.sizeToChildren,
            svs = content.getSubviews(), 
            i = svs.length,
            sv;
        
        // Destroy all children except the close button since that gets reused.
        while (i) {
            sv = svs[--i];
            if (sv.name !== 'closeBtn') sv.destroy();
        }
        
        // The blank dialog sets this.
        content.setVisible(true);
        this.overlay.setBgColor(M.Dimmer.DEFAULT_COLOR);
        
        // Message and Confirm dialogs set this.
        this.setCallbackFunction();
        
        // The confirm dialog modifies this.
        stc.setPaddingY(MP.DEFAULT_PADDING_Y);
        
        // The confirm content dialog modifies this.
        stc.setPaddingX(MP.DEFAULT_PADDING_X);
        
        // Any opts could modify this
        content.setRoundedCorners(MD.DEFAULT_RADIUS);
        content.setBgColor(MD.DEFAULT_BGCOLOR);
        content.setBoxShadow(MD.DEFAULT_SHADOW);
        content.setBorder(MD.DEFAULT_BORDER);
    },
    
    /** Called by each of the buttons that can trigger the dialog to be hidden.
        @param sourceView:myt.View the view that triggered the hiding 
            of the dialog.
        @returns void */
    doCallback: function(sourceView) {
        var cbf = this.callbackFunction;
        if (!cbf || !cbf.call(this, sourceView.name)) this.hide();
    },
    
    /** Shows this dialog as a regular dimmer.
        @param opts:object If opts.bgColor is provided it will be used for
            the bgColor of the overlay.
        @returns void */
    showBlank: function(opts) {
        this.__destroyContent();
        
        this.content.setVisible(false);
        if (opts && opts.bgColor) this.overlay.setBgColor(opts.bgColor);
        
        this.show();
        
        this.setDisplayMode('blank');
    },
    
    /** Shows a dialog with a message and the standard cancel button.
        @param msg:string the message to show.
        @param callbackFunction:function (optional) A function that gets 
            called when the close button is activated. A single argument is
            passed in that indicates the UI element interacted with that should
            close the dialog. Supported values are: 'closeBtn', 'cancelBtn' and
            'confirmBtn'. The function should return true if the close should 
            be aborted.
        @param opts:object (optional) options that modify how the message is 
            displayed. Supports: fontWeight, whiteSpace, wordWrap and width.
        @returns void */
    showMessage: function(msg, callbackFunction, opts) {
        var self = this,
            M = myt,
            MP = M.ModalPanel,
            D = M.Dialog,
            content = self.content, 
            closeBtn = content.closeBtn;
        
        opts = M.extend({}, D.WRAP_TEXT_DEFAULTS, opts);
        
        self.__destroyContent();
        
        self.setCallbackFunction(callbackFunction);
        
        var msgView = new M.Text(content, {
            name:'msg',
            text:msg,
            whiteSpace:opts.whiteSpace,
            wordWrap:opts.wordWrap,
            fontWeight:opts.fontWeight,
            x:opts.msgX == null ? MP.DEFAULT_PADDING_X : opts.msgX,
            y:opts.msgY == null ? MP.DEFAULT_PADDING_Y : opts.msgY,
            width:opts.width
        });
        
        if (opts.titleText) {
            self.setupTitle(content, opts.titleText, D.DEFAULT_RADIUS);
            msgView.setY(msgView.y + 24);
        }
        
        self.show();
        
        closeBtn.setVisible(true);
        closeBtn.focus();
        
        self.setDisplayMode('message');
    },
    
    showSimple: function(contentBuilderFunc, callbackFunction, opts) {
        var self = this,
            M = myt,
            content = self.content,
            closeBtn = content.closeBtn,
            opts = opts || {},
            maxHeight = opts.maxContainerHeight;
        
        self.__destroyContent();
        
        if (opts.bgColor) content.setBgColor(opts.bgColor);
        if (opts.roundedCorners) content.setRoundedCorners(opts.roundedCorners);
        if (opts.boxShadow) content.setBoxShadow(opts.boxShadow);
        if (opts.border) content.setBorder(opts.border);
        
        content.sizeToChildren.setPaddingX(1);
        self.setCallbackFunction(callbackFunction);
        
        var contentContainer = new M.View(content, {
            name:'contentContainer', x:1, y:25, overflow:'auto'
        }, [{
            setHeight: function(v) {
                if (v > maxHeight) v = maxHeight;
                this.callSuper(v);
            }
        }]);
        
        contentBuilderFunc.call(self, contentContainer);
        
        new M.SizeToChildren(contentContainer, {axis:'both'});
        
        self.show();
        
        closeBtn.setVisible(true);
        closeBtn.focus();
        
        self.setDisplayMode('content');
        
        // Set initial focus
        if (contentContainer.initialFocus) contentContainer.initialFocus.focus();
    },
    
    /** Shows a dialog with a spinner and a message and no standard cancel
        button.
        @param msg:string the message to show.
        @param opts:object options that modify how the message is displayed.
            Supports: fontWeight, whiteSpace, wordWrap and width.
        @returns void */
    showSpinner: function(msg, opts) {
        var self = this,
            M = myt,
            MP = M.ModalPanel,
            content = self.content;
        
        opts = M.extend({}, M.Dialog.NO_WRAP_TEXT_DEFAULTS, opts);
        
        self.__destroyContent();
        
        var spinner = self.spinner = new M.Spinner(content, {
            align:'center', visible:true,
            borderColor:'#cccccc',
            size:50, y:opts.msgY == null ? MP.DEFAULT_PADDING_Y : opts.msgY,
        });
        if (msg) {
            new M.Text(content, {
                text:msg,
                whiteSpace:opts.whiteSpace,
                wordWrap:opts.wordWrap,
                fontWeight:opts.fontWeight,
                x:opts.msgX == null ? MP.DEFAULT_PADDING_X : opts.msgX,
                y:spinner.y + spinner.size + MP.DEFAULT_PADDING_Y,
                width:opts.width
            });
        }
        
        self.show();
        
        content.closeBtn.setVisible(false);
        self.focus(); // Focus on the dimmer itself to prevent user interaction.
        
        self.setDisplayMode('spinner');
    },
    
    showColorPicker: function(callbackFunction, opts) {
        var self = this,
            M = myt,
            V = M.View,
            MP = M.ModalPanel,
            content = self.content,
            closeBtn = content.closeBtn,
            r = M.Dialog.DEFAULT_RADIUS;
        
        opts = M.extend({}, M.Dialog.PICKER_DEFAULTS, opts);
        
        self.__destroyContent();
        
        // Set the callback function to one wrapped to handle each button type.
        self.setCallbackFunction(function(action) {
            switch(action) {
                case 'closeBtn':
                case 'cancelBtn':
                    callbackFunction.call(this, action);
                    break;
                case 'confirmBtn':
                    var color = this._spectrum.get();
                    this._spectrum.addColorToSelectionPalette(color);
                    callbackFunction.call(this, action, color ? color.toHexString() : 'transparent');
                    break;
            }
            this._spectrum.destroy();
        });
        
        // Build Picker
        var picker = new V(content, {
            name:'picker',
            x:MP.DEFAULT_PADDING_X,
            y:MP.DEFAULT_PADDING_Y + 24,
            width:337,
            height:177
        });
        var spectrumView = new V(picker);
        $(spectrumView.getInnerDomElement()).spectrum({
            color:opts.color,
            palette: [['#000000','#111111','#222222','#333333','#444444','#555555','#666666','#777777'],
                      ['#888888','#999999','#aaaaaa','#bbbbbb','#cccccc','#dddddd','#eeeeee','#ffffff']],
            localStorageKey: "myt.default",
            dialog:self
        });
        
        self.show();
        
        closeBtn.setVisible(true);
        closeBtn.focus();
        
        self.setupFooterButtons(picker, opts);
        self.setupTitle(content, opts.titleText, r);
        
        self.setDisplayMode('color_picker');
    },
    
    _spectrumCallback: function(spectrum) {
        this._spectrum = spectrum;
    },
    
    showDatePicker: function(callbackFunction, opts) {
        var self = this,
            M = myt,
            MP = M.ModalPanel, 
            V = M.View,
            content = self.content,
            closeBtn = content.closeBtn,
            r = M.Dialog.DEFAULT_RADIUS;
        
        opts = M.extend({}, M.Dialog.DATE_PICKER_DEFAULTS, opts);
        
        self.__destroyContent();
        
        content.sizeToChildren.setPaddingX(0);
        
        // Set the callback function to one wrapped to handle each button type.
        self.setCallbackFunction(function(action) {
            switch(action) {
                case 'closeBtn':
                case 'cancelBtn':
                    callbackFunction.call(this, action);
                    break;
                case 'confirmBtn':
                    callbackFunction.call(this, action, this._pickedDateTime);
                    break;
            }
        });
        
        // Build Picker
        var picker = new V(content, {
            name:'picker',
            x:MP.DEFAULT_PADDING_X,
            y:MP.DEFAULT_PADDING_Y + 24,
            width:opts.dateOnly ? 195 : (opts.timeOnly ? 150 : 240),
            height:185
        });
        var pickerView = new V(picker);
        
        $(pickerView.getInnerDomElement()).dtpicker({
            current:new Date(opts.initialDate || Date.now()),
            dateOnly:opts.dateOnly || false,
            timeOnly:opts.timeOnly || false,
            dialog:self
        });
        
        self.show();
        
        closeBtn.setVisible(true);
        closeBtn.focus();
        
        self.setupFooterButtons(picker, opts);
        self.setupTitle(content, opts.timeOnly ? opts.timeOnlyTitleText : opts.titleText, r);
        
        self.setDisplayMode('date_picker');
    },
    
    _dtpickerCallback: function(dtpicker) {
        this._pickedDateTime = dtpicker;
    },
    
    showConfirm: function(msg, callbackFunction, opts) {
        var self = this,
            M = myt;
        
        opts = M.extend({}, M.Dialog.CONFIRM_DEFAULTS, opts);
        
        self.showMessage(msg, callbackFunction, opts);
        self.setupFooterButtons(self.content.msg, opts);
        
        self.setDisplayMode('confirm');
    },
    
    showContentConfirm: function(contentBuilderFunc, callbackFunction, opts) {
        var self = this,
            M = myt,
            V = M.View,
            content = self.content,
            closeBtn = content.closeBtn,
            r = M.Dialog.DEFAULT_RADIUS,
            maxHeight;
        
        opts = M.extend({}, M.Dialog.CONFIRM_DEFAULTS, opts);
        
        maxHeight = opts.maxContainerHeight;
        
        self.__destroyContent();
        
        content.sizeToChildren.setPaddingX(1);
        self.setCallbackFunction(callbackFunction);
        
        // Setup form
        var contentContainer = new V(content, {
            name:'contentContainer', x:1, y:25, overflow:'auto'
        }, [{
            setHeight: function(v) {
                this.callSuper(v > maxHeight ? maxHeight : v);
            }
        }]);
        
        contentBuilderFunc.call(self, contentContainer);
        
        new M.SizeToChildren(contentContainer, {axis:'both'});
        
        self.show();
        
        closeBtn.setVisible(true);
        closeBtn.focus();
        
        self.setupTitle(content, opts.titleText, r);
        contentContainer.setY(self.header.height + 1);
        self.setupFooterButtons(contentContainer, opts);
        
        self.setDisplayMode('content');
        
        // Set initial focus
        if (contentContainer.initialFocus) contentContainer.initialFocus.focus();
    },
    
    setupTitle: function(content, titleTxt, r) {
        (this.header = new myt.View(content, {
            ignoreLayout:true,
            width:content.width,
            height:24,
            bgColor:'#eeeeee',
            roundedTopLeftCorner:r,
            roundedTopRightCorner:r
        })).sendToBack();
        
        new myt.Text(content, {
            name:'title', x:r, y:4, text:titleTxt, fontWeight:'bold'
        });
    },
    
    /** @private */
    setupFooterButtons: function(mainView, opts) {
        var self = this,
            M = myt,
            V = M.View,
            content = self.content, 
            DPY = M.ModalPanel.DEFAULT_PADDING_Y,
            r = M.Dialog.DEFAULT_RADIUS,
            BUTTON_CLASS = self.buttonClass,
            attrs,
            buttons;
        
        var btnContainer = new V(content, {
            y:mainView.y + mainView.height + DPY, align:'center'
        });
        
        // Cancel Button
        attrs = opts.cancelAttrs || {};
        if (attrs.name == null) attrs.name = 'cancelBtn';
        if (attrs.text == null) attrs.text = opts.cancelTxt;
        if (opts.activeColor != null) attrs.activeColor = opts.activeColor;
        if (opts.hoverColor != null) attrs.hoverColor = opts.hoverColor;
        if (opts.readyColor != null) attrs.readyColor = opts.readyColor;
        if (opts.textColor != null) attrs.textColor = opts.textColor;
        new BUTTON_CLASS(btnContainer, attrs, [{
            doActivated: function() {self.doCallback(this);}
        }]);
        
        // Confirm Button
        attrs = opts.confirmAttrs || {};
        if (attrs.name == null) attrs.name = 'confirmBtn';
        if (attrs.text == null) attrs.text = opts.confirmTxt;
        if (opts.activeColorConfirm != null) attrs.activeColor = opts.activeColorConfirm;
        if (opts.hoverColorConfirm != null) attrs.hoverColor = opts.hoverColorConfirm;
        if (opts.readyColorConfirm != null) attrs.readyColor = opts.readyColorConfirm;
        if (opts.textColorConfirm != null) attrs.textColor = opts.textColorConfirm;
        new BUTTON_CLASS(btnContainer, attrs, [{
            doActivated: function() {self.doCallback(this);}
        }]);
        
        // Additional Buttons
        buttons = opts.buttons;
        if (buttons) {
            for (var i = 0, len = buttons.length; len > i; i++) {
                attrs = buttons[i];
                if (attrs.name == null) attrs.name = 'btn_' + i;
                new BUTTON_CLASS(btnContainer, attrs, [{
                    doActivated: function() {self.doCallback(this);}
                }]);
            }
        }
        
        new M.SizeToChildren(btnContainer, {axis:'y'});
        new M.SpacedLayout(btnContainer, {spacing:4, collapseParent:true});
        
        content.sizeToChildren.setPaddingY(DPY / 2);
        
        var bg = new V(content, {
            ignoreLayout:true,
            y:btnContainer.y - (DPY / 2),
            width:content.width,
            bgColor:'#eeeeee',
            roundedBottomLeftCorner:r,
            roundedBottomRightCorner:r
        });
        bg.setHeight(content.height - bg.y); // WHY: is this not in the attrs?
        bg.sendToBack();
    }
});


((pkg) => {
    var JSClass = JS.Class,
        
        // Safe as a closure var because the registry is a singleton.,
        validators = {},
        
        getValidator = (id) => validators[id],
        
        doFuncOnIdentifiable = (identifiable, func) => {
            if (identifiable) {
                var id = identifiable.id;
                if (identifiable.id) {
                    func(id);
                } else {
                    pkg.dumpStack("No ID");
                }
            } else {
                pkg.dumpStack("No validator");
            }
        },
        
        register = (identifiable) => {
            doFuncOnIdentifiable(identifiable, (id) => {validators[id] = identifiable});
        },
        
        /** Tests if a value is "valid" or not.
            
            Events:
                None
            
            Attributes:
                id:string the ideally unique ID for this Validator so it can be
                    stored and retreived from the myt.global.validators registry.
        */
        Validator = pkg.Validator = new JSClass('Validator', {
            /** Creates a new Validator
                @param id:string the ideally unique ID for a validator instance. */
            initialize: function(id) {
                this.id = id;
            },
            
            /** Tests if the value is valid or not.
                @param value:* the value to test validity for.
                @param config:Object (optional) A map of configuration values that
                    can be used to augment the validation function as needed. The
                    nature of this config will be specific to each Validator class.
                @param errorMessages:array (optional) Any error messages arising during
                    validation will be pushed onto thiis array if it is provided.
                @returns boolean true if the value is valid, false otherwise. */
            isValid: (value, config, errorMessages) => true,
            
            /** Tests if the form is valid or not.
                @param form:myt.Form the form to test validity for.
                @param config:Object (optional) A map of configuration values that
                    can be used to augment the validation function as needed. The
                    nature of this config will be specific to each Validator class.
                @param errorMessages:array (optional) Any error messages arising during
                    validation will be pushed onto thiis array if it is provided.
                @returns boolean true if the form is valid, false otherwise. */
            isFormValid: function(form, config, errorMessages) {
                if (!config) config = {};
                config.form = form;
                return this.isValid(form.getValue(), config, errorMessages);
            }
        });
        
        
        /** Tests that a value is not null, undefined or empty. */
        RequiredFieldValidator = pkg.RequiredFieldValidator = new JSClass('RequiredFieldValidator', Validator, {
            /** @overrides myt.Validator */
            isValid: function(value, config, errorMessages) {
                if (value == null || value === '' || (typeof value === 'string' && value.trim() === '')) {
                    if (errorMessages) errorMessages.push("This value is required.");
                    return false;
                }
                
                return true;
            }
        }),
        
        /** Tests that the value differs from the form rollback value by more than
            just case. */
        EqualsIgnoreCaseValidator = pkg.EqualsIgnoreCaseValidator = new JSClass('EqualsIgnoreCaseValidator', Validator, {
            /** @overrides myt.Validator */
            isValid: function(value, config, errorMessages) {
                var rbv = config.form.getRollbackValue();
                if (value && rbv && value.toLowerCase() === rbv.toLowerCase()) {
                    if (errorMessages) errorMessages.push("Value must differ by more than just case.");
                    return false;
                }
                
                return true;
            }
        }),
        
        /** Verifies that a value is in the form of a URL. */
        URLValidator = pkg.URLValidator = new JSClass('URLValidator', Validator, {
            /** @overrides myt.Validator
                @param originalRawQuery:boolean if true this prevents the query from
                    being normalized. */
            initialize: function(id, originalRawQuery) {
                this.callSuper(id);
                this.originalRawQuery = originalRawQuery;
            },
            
            /** @overrides myt.Validator */
            isValid: function(value, config, errorMessages) {
                var uri = new pkg.URI(value);
                if (uri.toString(this.originalRawQuery) !== value) {
                    if (errorMessages) errorMessages.push("Not a valid URL.");
                    return false;
                }
                return true;
            }
        }),
        
        /** Verifies that a value is JSON. */
        JSONValidator = pkg.JSONValidator = new JSClass('JSONValidator', Validator, {
            /** @overrides myt.Validator */
            isValid: function(value, config, errorMessages) {
                try {
                    JSON.parse(value);
                    return true;
                } catch(e) {
                    if (errorMessages) errorMessages.push(e);
                    return false;
                }
            }
        });
    
    /** Tests that the value from two fields are equal. */
    pkg.EqualFieldsValidator = new JSClass('EqualFieldsValidator', Validator, {
        /** @overrides myt.Validator
            @param fieldA the first form field to compare.
            @param fieldB the second form field to compare. */
        initialize: function(id, fieldA, fieldB) {
            this.callSuper(id);
            
            this.fieldA = fieldA;
            this.fieldB = fieldB;
        },
        
        /** @overrides myt.Validator */
        isValid: function(value, config, errorMessages) {
            if (value && this.fieldA.getValue() === this.fieldB.getValue()) return true;
            
            if (errorMessages) errorMessages.push('Field "' + this.fieldA.key + '" must be equal to field "' + this.fieldB.key + '".');
            return false;
        }
    });
    
    /** Tests that the value has a length between min and max. */
    pkg.LengthValidator = new JSClass('LengthValidator', Validator, {
        /** @overrides myt.Validator
            @param min:number The minimum length value.
            @param max:number The maximum length value. */
        initialize: function(id, min, max) {
            this.callSuper(id);
            
            this.min = min;
            this.max = max;
        },
        
        /** @overrides myt.Validator */
        isValid: function(value, config, errorMessages) {
            var len = value ? value.length : 0,
                min = this.min,
                max = this.max;
            
            // Test min
            if (min !== undefined && min > len) {
                if (errorMessages) errorMessages.push('Value must not be less than ' + min + '.');
                return false;
            }
            
            // Test max
            if (max !== undefined && max < len) {
                if (errorMessages) errorMessages.push('Value must not be greater than ' + max + '.');
                return false;
            }
            
            return true;
        }
    });
    
    /** Tests that adBinary value is between min and max. */
    pkg.NumericRangeValidator = new JSClass('NumericRangeValidator', Validator, {
        /** @overrides myt.Validator
            @param min:number The minimum value.
            @param max:number The maximum value. */
        initialize: function(id, min, max) {
            this.callSuper(id);
            
            this.min = min;
            this.max = max;
        },
        
        /** @overrides myt.Validator */
        isValid: function(value, config, errorMessages) {
            // Treat empty values as valid.
            if (value === "") return true;
            
            // Must be a number
            var numericValue = Number(value), min = this.min, max = this.max;
            if (isNaN(numericValue)) {
                if (errorMessages) errorMessages.push("Value is not a number.");
                return false;
            }
            
            // Test min
            if (min !== undefined && min > numericValue) {
                if (errorMessages) errorMessages.push('Value must not be less than ' + min + '.');
                return false;
            }
            
            // Test max
            if (max !== undefined && max < numericValue) {
                if (errorMessages) errorMessages.push('Value must not be greater than ' + max + '.');
                return false;
            }
            
            return true;
        }
    });
    
    /** A Validator composed from multiple Validators.
        
        Events:
            None
        
        Attributes:
            None
        
        Private Attributes:
            __v:array The array of myt.Validators that compose 
                this Validator.
    */
    pkg.CompoundValidator = new JSClass('CompoundValidator', Validator, {
        // Constructor /////////////////////////////////////////////////////////
        /** Creates a new CompoundValidator for the ID and 0 or more Validators
            provided.
            @param arguments:args ever argument after the first must be a
                Validator or a Validator ID from the myt.global.validators
                registry.*/
        initialize: function(id) {
            this.callSuper(id);
            
            var args = Array.prototype.slice.call(arguments);
            args.shift();
            
            // Make sure each arg is an myt.Validator
            var i = args.length,
                validator;
            while (i) {
                validator = args[--i];
                if (typeof validator === 'string') {
                    args[i] = validator = getValidator(validator);
                    if (!validator) args.splice(i, 1);
                }
            }
            
            this.__v = args;
        },
        
        
        // Methods /////////////////////////////////////////////////////////////
        /** Add a Validator to this CompoundValidator.
            @param validator:myt.Validator|string The validator to add or a string
                used to lookup a validator in the validator repository.
            @returns void */
        addValidator: function(v) {
            if (typeof v === 'string') v = getValidator(v);
            if (v) this.__v.push(v);
        },
        
        /** @overrides myt.Validator */
        isValid: function(value, config, errorMessages) {
            var isValid = true, 
                validators = this.__v, 
                len = validators.length, 
                i = 0;
            for (; len > i;) isValid = validators[i++].isValid(value, config, errorMessages) && isValid;
            return isValid;
        }
    });
    
    /** Stores myt.Validators by ID so they can be used in multiple
        places easily.
        
        Events:
            None
        
        Attributes:
            None
    */
    new JS.Singleton('GlobalValidatorRegistry', {
        // Life Cycle //////////////////////////////////////////////////////////
        initialize: function() {
            // Register a few common Validators
            register(new RequiredFieldValidator('required'));
            register(new EqualsIgnoreCaseValidator('equalsIgnoreCase'));
            register(new URLValidator('url'));
            register(new JSONValidator('json'));
            
            pkg.global.register('validators', this);
        },
        
        
        // Accessors ///////////////////////////////////////////////////////////
        /** Gets a Validator for the ID.
            @param id:string the ID of the Validator to get.
            @returns an myt.Validator or undefined if not found. */
        getValidator: getValidator,
        
        
        // Methods /////////////////////////////////////////////////////////////
        /** Adds a Validator to this registry.
            @param identifiable:myt.Validator the Validator to add.
            @returns void */
        register: register,
        
        /** Removes a Validator from this registery.
            @param identifiable:myt.Validator the Validator to remove.
            @returns void */
        unregister: (identifiable) => {
            doFuncOnIdentifiable(identifiable, (id) => {
                // Make sure the validator is in the repository then delete.
                if (getValidator(id)) delete validators[id];
            });
        }
    });
})(myt);


/** Modifies a value. Typically used to convert a form element value to its
    canonical form.
    
    Events:
        None
    
    Attributes:
        id:string The ideally unique ID for this value processor.
        runForDefault:boolean Indicates this processor should be run for
            default form values. Defaults to true.
        runForRollback:boolean Indicates this processor should be run for
            rollback form values. Defaults to true.
        runForCurrent:boolean Indicates this processor should be run for
            current form values. Defaults to true.
*/
myt.ValueProcessor = new JS.Class('ValueProcessor', {
    // Class Methods ///////////////////////////////////////////////////////////
    extend: {
        DEFAULT_ATTR: 'runForDefault',
        ROLLBACK_ATTR: 'runForRollback',
        CURRENT_ATTR: 'runForCurrent'
    },
    
    
    // Constructor /////////////////////////////////////////////////////////////
    /** Creates a new ValueProcessor
        @param id:string the ideally unique ID for a processor instance.
        @param runForDefault:boolean (optional) 
        @param runForRollback:boolean (optional) 
        @param runForCurrent:boolean (optional) */
    initialize: function(id, runForDefault, runForRollback, runForCurrent) {
        this.id = id;
        
        var VP = myt.ValueProcessor;
        this[VP.DEFAULT_ATTR] = runForDefault ? true : false;
        this[VP.ROLLBACK_ATTR] = runForRollback ? true : false;
        this[VP.CURRENT_ATTR] = runForCurrent ? true : false;
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** Processes the value. The default implementation returns the value
        unmodified.
        @param value:* the value to modify.
        @returns * the modified value. */
    process: function(value) {
        return value;
    }
});


/** Converts values to a Number if possible. If the value becomes NaN
    the original value is returned. */
myt.ToNumberValueProcessor = new JS.Class('ToNumberValueProcessor', myt.ValueProcessor, {
    // Methods /////////////////////////////////////////////////////////////////
    /** @overrides myt.ValueProcessor */
    process: function(v) {
        // Don't convert "empty" values to a number since they'll become zero
        // which is probably incorrect. Also catch undefined/null values since
        // they will become NaN.
        if (v == null || v === "" || v === "-") return v;
        
        var numericValue = Number(v);
        return isNaN(numericValue) ? v : numericValue;
    }
});


/** Trims the whitespace from a value.
    
    Attributes:
        trim:string Determines what kind of trimming to do. Supported values
            are 'left', 'right' and 'both'. The default value is 'both'.
*/
myt.TrimValueProcessor = new JS.Class('TrimValueProcessor', myt.ValueProcessor, {
    // Constructor /////////////////////////////////////////////////////////////
    /** @overrides myt.ValueProcessor
        @param trim:string Determines the type of trimming to do. Allowed
            values are 'left', 'right' or 'both'. The default value 
            is 'both'. */
    initialize: function(id, runForDefault, runForRollback, runForCurrent, trim) {
        this.callSuper(id, runForDefault, runForRollback, runForCurrent);
        
        this.trim = trim;
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** @overrides myt.ValueProcessor */
    process: function(v) {
        v += '';
        switch (this.trim) {
            case 'start':
            case 'left':
                return v.trimStart();
            case 'end':
            case 'right':
                return v.trimEnd();
            default:
                return v.trim();
        }
    }
});


/** Converts undefined values to a default value.
    
    Attributes:
        defaultValue:* The value to return when the processed value is
            undefined.
*/
myt.UndefinedValueProcessor = new JS.Class('UndefinedValueProcessor', myt.ValueProcessor, {
    // Constructor /////////////////////////////////////////////////////////////
    /** @overrides myt.ValueProcessor
        @param defaultValue:* The default value to convert undefined to. */
    initialize: function(id, runForDefault, runForRollback, runForCurrent, defaultValue) {
        this.callSuper(id, runForDefault, runForRollback, runForCurrent);
        
        this.defaultValue = defaultValue;
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** @overrides myt.ValueProcessor */
    process: function(v) {
        return v === undefined ? this.defaultValue : v;
    }
});


/** Stores myt.ValueProcessors by ID so they can be used in multiple
    places easily.
    
    Events:
        None
    
    Attributes:
        None
    
    Private Attributes:
        __c:object A map of myt.ValueProcessors by ID.
*/
new JS.Singleton('GlobalValueProcessorRegistry', {
    // Life Cycle //////////////////////////////////////////////////////////////
    initialize: function() {
        var self = this,
            m = myt;
        
        self.__c = {};
        
        m.global.register('valueProcessors', self);
        
        // Register a few common ValueProcessors
        self.register(new m.UndefinedValueProcessor('undefToEmpty', true, true, true, ''));
        self.register(new m.ToNumberValueProcessor('toNumber', true, true, true));
        self.register(new m.TrimValueProcessor('trimLeft', true, true, true, 'left'));
        self.register(new m.TrimValueProcessor('trimRight', true, true, true, 'right'));
        self.register(new m.TrimValueProcessor('trimBoth', true, true, true, 'both'));
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    /** Gets a ValueProcessor for the ID.
        @param id:string the ID of the ValueProcessor to get.
        @returns an myt.ValueProcessor or undefined if not found. */
    getValueProcessor: function(id) {
        return this.__c[id];
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** Adds a ValueProcessor to this registry.
        @param identifiable:myt.ValueProcessor the ValueProcessor to add.
        @returns void */
    register: function(identifiable) {
        if (identifiable) {
            var id = identifiable.id;
            if (id) {
                this.__c[id] = identifiable;
            } else {
                myt.dumpStack("No ID");
            }
        } else {
            myt.dumpStack("No processor");
        }
    },
    
    /** Removes a ValueProcessor from this registery.
        @param identifiable:myt.ValueProcessor the ValueProcessor to remove.
        @returns void */
    unregister: function(identifiable) {
        if (identifiable) {
            var id = identifiable.id;
            if (id) {
                // Make sure it's in the repository and then delete
                if (this.getValueProcessor(id)) delete this.__c[id];
            } else {
                myt.dumpStack("No ID");
            }
        } else {
            myt.dumpStack("No processor");
        }
    }
});


/** Pulls the current value from another form field if the provided value
    is undefined, null or empty string.
    
    Attributes:
        otherField:myt.FormElement The form element to pull the current 
            value from.
*/
myt.UseOtherFieldIfEmptyValueProcessor = new JS.Class('UseOtherFieldIfEmptyValueProcessor', myt.ValueProcessor, {
    // Constructor /////////////////////////////////////////////////////////////
    /** @overrides myt.ValueProcessor
        @param otherField:myt.FormElement The form field to pull the 
            value from. */
    initialize: function(id, runForDefault, runForRollback, runForCurrent, otherField) {
        this.callSuper(id, runForDefault, runForRollback, runForCurrent);
        
        this.otherField = otherField;
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** @overrides myt.ValueProcessor */
    process: function(v) {
        return (v == null || v === "") ? this.otherField.getValue() : v;
    }
});


/** A wrapper around a native browser select component.
    
    Events:
        multiple:boolean
        size:int
        value:string
    
    Attributes:
        multiple:boolean Indicates if multiple options can be selected or not.
            Defaults to false.
        size:int The number of options to show. The default value is 4 for
            multiple == true and 1 for multiple == false. It is recommended
            that a size of at least 4 be used when multiple is 2.
        options:array (write only) Adds a list of options to this select list.
            The value should be an array of myt.InputSelectOptions attrs that 
            will be used to instantiate new myt.InputSelectOption instances on
            this select list.
*/
myt.InputSelect = new JS.Class('InputSelect', myt.NativeInputWrapper, {
    include: [myt.SizeToDom],
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides myt.NativeInputWrapper */
    initNode: function(parent, attrs) {
        if (attrs.tagName == null) attrs.tagName = 'select';
        attrs.inputType = null;
        
        if (attrs.multiple == null) attrs.multiple = false;
        if (attrs.size == null) attrs.size = attrs.multiple ? 4 : 1;
        
        this.callSuper(parent, attrs);
        
        this.attachToDom(this, '__syncToDom', 'change');
        
        // Make sure initial value is in sync with the UI
        this.__syncToDom();
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setMultiple: function(v) {
        if (this.multiple !== v) {
            this.multiple = this.getInnerDomElement().multiple = v;
            if (this.inited) this.fireEvent('multiple', v);
        }
    },
    
    setSize: function(v) {
        if (this.size !== v) {
            this.size = this.getInnerDomElement().size = v;
            if (this.inited) this.fireEvent('size', v);
        }
    },
    
    setOptions: function(v) {
        this.destroyAllOptions();
        if (Array.isArray(v)) {
            for (var i = 0, len = v.length; len > i; ++i) this.addOption(v[i]);
        }
    },
    
    /** The options are just the subviews.
        @returns an array of options for this select list. */
    getOptions: function() {
        return this.getSubviews().concat();
    },
    
    /** @overrides myt.NativeInputWrapper
        Does not update the dom since the dom element's 'value' attribute
        doesn't support lists. */
    setValue: function(v) {
        if (Array.isArray(v) && myt.areArraysEqual(v, this.value)) return;
        
        if (this.value !== v) {
            this.value = v;
            if (this.inited) this.fireEvent('value', v);
        }
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** @overrides myt.View */
    subviewAdded: function(sv) {
        // Destroy subview if it's not supported.
        if (!(sv instanceof myt.InputSelectOption)) {
            myt.dumpStack("Subview not supported. Destroying it.");
            sv.destroy();
        }
    },
    
    /** @overrides myt.FocusObservable */
    showFocusEmbellishment: function() {
        this.hideDefaultFocusEmbellishment();
        this.setBoxShadow(myt.Button.DEFAULT_FOCUS_SHADOW_PROPERTY_VALUE);
    },
    
    /** @overrides myt.FocusObservable */
    hideFocusEmbellishment: function() {
        this.hideDefaultFocusEmbellishment();
        this.setBoxShadow();
    },
    
    // Options //
    /** Gets an array of selected myt.InputSelectOptions.
        @returns array: An array of selected myt.InputSelectOptions. */
    getSelectedOptions: function() {
        var options = this.getOptions(), i = options.length, option, retval = [];
        while (i) {
            option = options[--i];
            if (option.isSelected()) retval.push(option);
        }
        return retval;
    },
    
    /** Gets an array of selected myt.InputSelectOption values.
        @returns array: An array of selected option values. */
    getSelectedOptionValues: function() {
        var options = this.getOptions(), i = options.length, option, retval = []
        while (i) {
            option = options[--i];
            if (option.isSelected()) retval.push(option.value);
        }
        return retval;
    },
    
    /** Gets the myt.InputSelectOption with the provided value.
        @param value:* The value of the option to get.
        @returns myt.InputSelectOption: The matching option or null if not
            found. */
    getOptionForValue: function(value) {
        var options = this.getOptions(), i = options.length, option;
        while (i) {
            option = options[--i];
            if (option.value === value) return option;
        }
        return null;
    },
    
    /** Adds a new myt.InputSelectionOption to this select list.
        @param attrs:object The attrs for the new option
        @returns myt.InputSelectOption: The newly created option. */
    addOption: function(attrs) {
        new myt.InputSelectOption(this, attrs);
    },
    
    destroyAllOptions: function() {
        var options = this.getOptions(), i = options.length;
        while (i) options[--i].destroy();
    },
    
    /** Destroys an option that has the provided value.
        @param value:* The value of the option to remove.
        @returns boolean: true if the option is destroyed, false otherwise. */
    destroyOptionWithValue: function(value) {
        var option = this.getOptionForValue(value);
        if (option) {
            option.destroy();
            if (option.destroyed) return true;
        }
        return false;
    },
    
    // Selection //
    /** Deselects all selected options included disabled options.
        @returns void */
    deselectAll: function() {
        var options = this.getOptions(), i = options.length, option, changed = false;
        while (i) {
            option = options[--i];
            if (option.isSelected()) {
                option.setSelected(false);
                changed = true;
            }
        }
        
        if (changed) this.__doChanged();
    },
    
    selectValues: function(values) {
        values = Array.isArray(values) ? values : [values];
        var i = values.length;
        while (i) this.selectValue(values[--i]);
    },
    
    /** Selects the option that has the provided value.
        @param value:* The value of the option to select.
        @returns void */
    selectValue: function(value) {
        this.select(this.getOptionForValue(value));
    },
    
    /** Selects the provided option.
        @param option:myt.InputSelectOption The option to select.
        @returns void */
    select: function(option) {
        if (option && option.canSelect(this)) {
            option.setSelected(true);
            this.__syncToDom();
        }
    },
    
    /** Deselects the option that has the provided value.
        @param value:* The value of the option to deselect.
        @returns void */
    deselectValue: function(value) {
        this.deselect(this.getOptionForValue(value));
    },
    
    /** Deselects the provided option.
        @param option:myt.InputSelectOption The option to deselect.
        @returns void */
    deselect: function(option) {
        if (option && option.canDeselect(this)) {
            option.setSelected(false);
            this.__syncToDom();
        }
    },
    
    /** @private */
    __doChanged: function(event) {
        this.__syncToDom();
        this.doChanged();
    },
    
    /** Called whenever the underlying dom element fires a "change" event.
        @returns void */
    doChanged: function() {},
    
    /** @private */
    __syncToDom: function() {
        this.setValue(this.multiple ? this.getSelectedOptionValues() : this.getDomValue());
    }
});


/** An option in a native browser select element.
    
    Events:
        value:*
        label:string
    
    Attributes:
        value:* the value of the option.
        label:string the text label for the option.
*/
myt.InputSelectOption = new JS.Class('InputSelectOption', myt.View, {
    include: [myt.Disableable, myt.Selectable],
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides myt.Input */
    createOurDomElement: function(parent) {
        return document.createElement('option');
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    /** @overrideds myt.Selectable */
    setSelected: function(v) {
        // Adapt to event from syncTo
        if (v !== null && typeof v === 'object') v = v.value;
        
        var de = this.getInnerDomElement();
        if (de.selected !== v) de.selected = v;
    },
    
    /** @overrides myt.Disableable */
    setDisabled: function(v) {
        if (this.disabled !== v) {
            this.getInnerDomElement().disabled = v;
            this.callSuper(v);
        }
    },
    
    setValue: function(v) {
        if (this.value !== v) {
            this.value = v;
            if (this.getInnerDomElement().value !== v) this.getInnerDomElement().value = v;
            if (this.inited) this.fireEvent('value', v);
        }
    },
    
    setLabel: function(v) {
        if (this.label !== v) {
            this.getInnerDomElement().textContent = this.label = v;
            if (this.inited) this.fireEvent('label', v);
        }
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** @overrideds myt.Selectable */
    isSelected: function() {
        return this.getInnerDomElement().selected;
    },
    
    /** @overrideds myt.Selectable */
    canSelect: function(selectionManager) {
        return !this.disabled && !this.getInnerDomElement().selected && this.parent === selectionManager;
    },
    
    /** @overrideds myt.Selectable */
    canDeselect: function(selectionManager) {
        return !this.disabled && this.getInnerDomElement().selected && this.parent === selectionManager;
    }
});


/** An myt.InputSelect that is also a FormElement.
    
    Events:
        None
    
    Attributes:
        None
    
    Private Attributes:
        __abortSetValue:boolean Prevents setValue from being called again
            when performing operations from within setValue.
*/
myt.FormInputSelect = new JS.Class('FormInputSelect', myt.InputSelect, {
    include: [myt.FormElement],
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    /** @overrides myt.FormElement */
    setValue: function(v) {
        if (this.__abortSetValue) return;
        
        var retval = this.callSuper(v);
        
        // Clear Selection and then reselect
        this.__abortSetValue = true;
        this.deselectAll();
        this.selectValues(retval);
        this.__abortSetValue = false;
        
        return retval;
    }
});


/** Monitors a radio button group for a form.
    
    Events:
        None
    
    Attributes:
        groupId:string The ID of the radio group to monitor.
*/
myt.FormRadioGroup = new JS.Class('FormRadioGroup', myt.Node, {
    include: [myt.ValueComponent, myt.FormElement],
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides */
    initNode: function(parent, attrs) {
        if (attrs.groupId == null) attrs.groupId = myt.generateGuid();
        
        this.callSuper(parent, attrs);
        
        if (this.value !== undefined) this.__updateGroupValue();
        this.__startMonitoring();
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    /** @overrides myt.FormElement */
    setValue: function(v) {
        var retval = this.callSuper(v);
        if (this.inited) this.__updateGroupValue();
        return retval;
    },
    
    setGroupId: function(v) {
        if (this.groupId !== v) {
            this.__stopMonitoring();
            this.groupId = v;
            if (this.inited) this.__startMonitoring();
        }
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** @private */
    __startMonitoring: function() {
        if (this.groupId) {
            var bag = this.__getBAG();
            if (bag) this.syncTo(bag, '__syncValue', 'trueNode');
        }
    },
    
    /** @private */
    __stopMonitoring: function() {
        if (this.groupId) {
            var bag = this.__getBAG();
            if (bag) this.detachFrom(bag, '__syncValue', 'trueNode');
        }
    },
    
    /** @private */
    __syncValue: function(event) {
        this.setValue(event.value ? event.value.optionValue : null);
    },
    
    /** Search the radio group for a matching node and make that one the
        true node.
        @private */
    __updateGroupValue: function() {
        var bag = this.__getBAG();
        if (bag) {
            var nodes = bag.getNodes(), i = nodes.length, node, v = this.value;
            while (i) {
                node = nodes[--i];
                if (node.optionValue === v) {
                    bag.setTrue(node);
                    break;
                }
            }
        }
    },
    
    /** @private */
    __getBAG: function() {
        return myt.BAG.getGroup('selected', this.groupId);
    }
});


/** An myt.Checkbox that is also a FormElement.
    
    Events:
        None
    
    Attributes:
        None
*/
myt.FormCheckbox = new JS.Class('FormCheckbox', myt.Checkbox, {
    include: [myt.FormElement],
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides */
    initNode: function(parent, attrs) {
        this.rollbackValue = this.defaultValue = false;
        
        this.callSuper(parent, attrs);
    }
});


/** An myt.TextCheckbox that is also a FormElement.
    
    Events:
        None
    
    Attributes:
        None
*/
myt.FormTextCheckbox = new JS.Class('FormTextCheckbox', myt.TextCheckbox, {
    include: [myt.FormElement],
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides */
    initNode: function(parent, attrs) {
        this.rollbackValue = this.defaultValue = false;
        
        this.callSuper(parent, attrs);
    }
});


/** Provides common functionality for text related form elements.
    
    Accelerators:
        accept: Invokes the doAccept function. Activated upon key down of
            the ENTER key.
        reject: Invokes the doReject function. Activated upon key up of 
            the ESC key.
    
    Events:
        None
    
    Attributes:
        errorColor:color_string The color to use when a validation 
            error exists. Defaults to '#ff9999'.
        actionRequiredColor:color_string The color to use when a validation 
            error exists but the user has not modified the value. Defaults
            to '#996666'.
        normalColor:color_string The color to use when no validation 
            error exists. Defaults to '#999999'.
        validateWhen:string Indicates when to run validation.
            Supported values are:
                key: Validate as the user types.
                blur: Validate when blurring out of the UI control
                blurWithKeyFix: The same as blur except we also validate as 
                    the user types if currently invalid.
                none: Don't do any validation when interacting with the field.
            The default value is 'key'.
        acceleratorScope:string The scope the accelerators will be applied to.
            Supported values are:
                element: Take action on this element only
                root: Take action on the root form.
                none: Take no action.
            The default value is 'element'.
*/
myt.FormInputTextMixin = new JS.Module('FormInputTextMixin', {
    include: [myt.FormElement, myt.UpdateableUI],
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides myt.Input */
    initNode: function(parent, attrs) {
        var self = this;
        
        self.acceleratorScope = 'element';
        self.validateWhen = 'key';
        self.errorColor = '#ff9999';
        self.actionRequiredColor = '#996666';
        self.normalColor = '#999999';
        
        if (attrs.bgColor == null) attrs.bgColor = '#ffffff';
        if (attrs.borderWidth == null) attrs.borderWidth = 1;
        if (attrs.borderStyle == null) attrs.borderStyle = 'solid';
        if (attrs.focusEmbellishment == null) attrs.focusEmbellishment = true;
        
        self.callSuper(parent, attrs);
        
        self.addValueProcessor(myt.global.valueProcessors.getValueProcessor('undefToEmpty'));
        
        self.attachToDom(self, '__handleKeyDown', 'keydown');
        self.attachToDom(self, '__handleKeyUp', 'keyup');
        
        self.addAccelerator('accept', self.doAccept);
        self.addAccelerator('reject', self.doReject);
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setValidateWhen: function(v) {this.validateWhen = v;},
    setAcceleratorScope: function(v) {this.acceleratorScope = v;},
    setErrorColor: function(v) {this.errorColor = v;},
    setActionRequiredColor: function(v) {this.actionRequiredColor = v;},
    setNormalColor: function(v) {this.normalColor = v;},
    
    setIsChanged: function(v) {
        this.callSuper(v);
        if (this.inited) this.updateUI();
    },
    
    setIsValid: function(v) {
        this.callSuper(v);
        if (this.inited) this.updateUI();
    },
    
    /** @overrides myt.FormElement */
    setValue: function(v) {
        var retval = this.callSuper(v);
        
        // Validate as we type.
        var when = this.validateWhen;
        if (when === 'key' || when === 'blurWithKeyFix') this.verifyValidState();
        
        return retval;
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    doAccept: function() {
        if (!this.disabled) {
            switch (this.acceleratorScope) {
                case 'root':
                    this.getRootForm().invokeAccelerator("submit");
                    break;
                case 'element':
                    // Tab navigate forward
                    myt.global.focus.next(false);
                    break;
                case 'none':
                default:
            }
        }
    },
    
    doReject: function() {
        if (!this.disabled) {
            switch (this.acceleratorScope) {
                case 'root':
                    this.getRootForm().invokeAccelerator("cancel");
                    break;
                case 'element':
                    this.rollbackForm();
                    this.getRootForm().doValidation();
                    if (this.form) this.form.verifyChangedState(this);
                    break;
                case 'none':
                default:
            }
        }
    },
    
    /** @private */
    __handleKeyDown: function(event) {
        if (myt.KeyObservable.getKeyCodeFromEvent(event) === 13) this.invokeAccelerator("accept");
    },
    
    /** @private */
    __handleKeyUp: function(event) {
        if (myt.KeyObservable.getKeyCodeFromEvent(event) === 27) this.invokeAccelerator("reject");
    },
    
    /** @overrides myt.FocusObservable */
    doBlur: function() {
        this.callSuper();
        
        // Validate on blur
        var when = this.validateWhen;
        if (when === 'blur' || when === 'blurWithKeyFix') this.verifyValidState();
    },
    
    /** @overrides myt.UpdateableUI */
    updateUI: function() {
        this.setBorderColor(
            this.isValid ? this.normalColor : (this.isChanged ? this.errorColor : this.actionRequiredColor)
        );
    }
});


/** A base class for input:text and textarea components.
    
    Events:
        spellcheck:boolean
        maxLength:int
        placeholder:string
    
    Attributes:
        spellcheck:boolean Turns browser spellchecking on and off. Defaults
            to false.
        maxLength:int Sets a maximum number of input characters. Set to a
            negative number to turn off max length. Defaults to undefined
            which is equivalent to a negative number.
        allowedChars:string Each character in the string is an allowed
            input character. If not set or empty all characters are allowed. 
            Defaults to undefined.
        placeholder:string Text that will be shown if the value is empty.
*/
myt.BaseInputText = new JS.Class('BaseInputText', myt.NativeInputWrapper, {
    include: [myt.TextSupport],
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides myt.NativeInputWrapper */
    initNode: function(parent, attrs) {
        var self = this;
        
        if (attrs.bgColor == null) attrs.bgColor = 'transparent';
        if (attrs.spellcheck == null) attrs.spellcheck = false;
        
        self.callSuper(parent, attrs);
        
        self.attachToDom(self, '__syncToDom', 'input');
        
        // Allow filtering of input
        self.attachToDom(self, '__filterInputPress', 'keypress');
        self.attachToDom(self, '__filterInput', 'keyup');
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    /** @overrides myt.TextSupport
        Alias setText to setValue. */
    setText: function(v) {
        this.callSuper(v);
        
        this.setValue(v);
    },
    
    setSpellcheck: function(v) {
        if (this.spellcheck !== v) {
            this.spellcheck = this.getInnerDomElement().spellcheck = v;
            if (this.inited) this.fireEvent('spellcheck', v);
        }
    },
    
    setMaxLength: function(v) {
        if (v == null || 0 > v) v = undefined;
        
        if (this.maxLength !== v) {
            this.maxLength = this.getInnerDomElement().maxLength = v;
            if (this.inited) this.fireEvent('maxLength', v);
        }
    },
    
    setAllowedChars: function(v) {this.allowedChars = v;},
    
    setPlaceholder: function(v) {
        if (this.placeholder !== v) {
            this.getInnerDomElement().placeholder = this.placeholder = v;
            if (this.inited) this.fireEvent('placeholder', v);
        }
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** @overrides myt.FocusObservable */
    showFocusEmbellishment: function() {
        this.hideDefaultFocusEmbellishment();
        this.setBoxShadow(myt.Button.DEFAULT_FOCUS_SHADOW_PROPERTY_VALUE);
    },
    
    /** @overrides myt.FocusObservable */
    hideFocusEmbellishment: function() {
        this.hideDefaultFocusEmbellishment();
        this.setBoxShadow();
    },
    
    /** @private */
    __filterInput: function(event) {
        this.setDomValue(this.filterInput(this.getDomValue()));
    },
    
    /** @private */
    __filterInputPress: function(event) {
        var domEvent = event.value,
            charCode = domEvent.which;
        
        // Firefox fires events for arrow keys and backspace which should be
        // ignored completely.
        switch (charCode) {
            case 8: // backspace key
            case 0: // arrow keys have a "charCode" of 0 in firefox.
                return;
        }
        
        // Filter for allowed characters
        var allowedChars = this.allowedChars;
        if (allowedChars && allowedChars.indexOf(String.fromCharCode(charCode)) === -1) domEvent.preventDefault();
        
        this.filterInputPress(domEvent);
    },
    
    /** A hook for subclasses/instances to do input filtering. The default
        implementation returns the value unchanged.
        @param v:string the current value of the form element.
        @returns string: The new value of the form element. */
    filterInput: function(v) {
        return v;
    },
    
    /** A hook for subclasses/instances to do input filtering during key press.
        The default implementation does nothing.
        @param domEvent:object The dom key press event.
        @returns void */
    filterInputPress: function(domEvent) {},
    
    /** @private */
    __syncToDom: function(event) {
        this.setValue(this.getDomValue());
    },
    
    /** Gets the location of the caret.
        @returns int. */
    getCaretPosition: function() {
        // IE Support
        if (document.selection) {
            var selection = document.selection.createRange();
            selection.moveStart('character', -this.getDomValue().length);
            return selection.text.length;
        }
        
        return this.getInnerDomElement().selectionStart || 0;
    },
    
    /** Sets the caret and selection.
        @param start:int the start of the selection or location of the caret
            if no end is provided.
        @param end:int (optional) the end of the selection.
        @returns void */
    setCaretPosition: function(start, end) {
        if (end == null || start === end) {
            // Don't update if the current position already matches.
            if (this.getCaretPosition() === start) return;
            
            end = start;
        }
        var elem = this.getInnerDomElement();
        
        if (elem.setSelectionRange) {
            elem.setSelectionRange(start, end);
        } else if (elem.createTextRange) {
            var range = elem.createTextRange();
            range.collapse(true);
            range.moveEnd('character', end);
            range.moveStart('character', start);
            range.select();
        }
    },
    
    /** Sets the caret to the start of the text input.
        @returns void */
    setCaretToStart: function() {
        this.setCaretPosition(0);
    },
    
    /** Sets the caret to the end of the text input.
        @returns void */
    setCaretToEnd: function() {
        this.setCaretPosition(this.getDomValue().length);
    },
    
    // Selection //
    /** Selects all the text in the input element.
        @returns void */
    selectAll: function() {
        this.getInnerDomElement().select();
    },
    
    getSelection: function() {
        var de = this.getInnerDomElement();
        return {
            start:de.selectionStart,
            startElem:de,
            end:de.selectionEnd,
            endElem:de
        };
    },
    
    setSelection: function(selection) {
        if (selection) this.setCaretPosition(selection.start, selection.end);
    },
    
    saveSelection: function(selection) {
        this._selRange = selection || this.getSelection() || this._selRange;
    },
    
    restoreSelection: function() {
        this.setSelection(this._selRange);
    }
});


/** A view that accepts single line user text input. */
myt.InputText = new JS.Class('InputText', myt.BaseInputText, {
    include: [myt.SizeHeightToDom],
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides myt.Input */
    initNode: function(parent, attrs) {
        this.inputType = attrs.password === true ? 'password' : 'text';
        
        this.callSuper(parent, attrs);
        
        this.setCaretToEnd();
    },
    
    // Accessors ///////////////////////////////////////////////////////////////
    setPassword: function(v) {this.password = v;}
});


/** An myt.InputText that is also a FormElement.
    
    Events:
        None
    
    Attributes:
        None
*/
myt.FormInputText = new JS.Class('FormInputText', myt.InputText, {
    include: [myt.FormInputTextMixin]
});


/** A text input with select list.
    
    Events:
        None
    
    Attributes:
        filterItems:boolean Indicates if the list items should be filtered
            down based on the current value. Defaults to true.
        fullItemConfig:array The full list of items that can be shown in the
            list. The actual itemConfig used will be filtered based on the
            current value of the input text.
*/
myt.ComboBox = new JS.Class('ComboBox', myt.InputText, {
    include: [
        myt.Activateable,
        myt.KeyActivation,
        myt.ListViewAnchor
    ],
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides myt.Input */
    initNode: function(parent, attrs) {
        this.filterItems = true;
        
        if (attrs.activationKeys == null) attrs.activationKeys = [13,27,38,40];
        if (attrs.bgColor == null) attrs.bgColor = '#ffffff';
        if (attrs.borderWidth == null) attrs.borderWidth = 1;
        if (attrs.borderStyle == null) attrs.borderStyle = 'solid';
        if (attrs.floatingAlignOffset == null) attrs.floatingAlignOffset = attrs.borderWidth;
        if (attrs.listViewAttrs == null) attrs.listViewAttrs = {maxHeight:99};
        if (attrs.fullItemConfig == null) attrs.fullItemConfig = [];
        
        this.callSuper(parent, attrs);
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setFullItemConfig: function(v) {this.fullItemConfig = v;},
    setFilterItems: function(v) {this.filterItems = v;},
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** Show floating panel if the value has changed during during
        user interaction.
        @overrides */
    __syncToDom: function(event) {
        var existing = this.value;
        this.callSuper(event);
        if (existing !== this.value) this.showFloatingPanel();
    },
    
    /** @overrides */
    showFloatingPanel: function(panelId) {
        var fp = this.getFloatingPanel(panelId);
        if (fp) {
            // Filter config
            var itemConfig;
            if (this.filterItems) {
                itemConfig = [];
                
                var curValue = this.value,
                    normalizedCurValue = curValue == null ? '' : ('' + curValue).toLowerCase(),
                    fullItemConfig = this.fullItemConfig,
                    len = fullItemConfig.length, i = 0, 
                    item, normalizedItemValue, idx;
                for (; len > i;) {
                    item = fullItemConfig[i++];
                    normalizedItemValue = item.attrs.text.toLowerCase();
                    idx = normalizedItemValue.indexOf(normalizedCurValue);
                    if (idx === 0) {
                        if (normalizedItemValue !== normalizedCurValue) itemConfig.push(item);
                    } else if (idx > 0) {
                        itemConfig.push(item);
                    }
                }
            } else {
                itemConfig = this.fullItemConfig;
            }
            
            if (itemConfig.length > 0) {
                fp.setMinWidth(this.width - 2 * this.borderWidth); // Must be set before setItemConfig
                this.setItemConfig(itemConfig);
                this.callSuper(panelId);
            } else {
                this.hideFloatingPanel(panelId);
            }
        }
    },
    
    /** @overrides */
    doItemActivated: function(itemView) {
        this.setValue(itemView.text);
        this.callSuper(itemView);
    },
    
    /** @overrides */
    doActivated: function() {
        this.toggleFloatingPanel();
    }
});


/** An myt.ComboBox that is also a FormElement.
    
    Events:
        None
    
    Attributes:
        None
*/
myt.FormComboBox = new JS.Class('FormComboBox', myt.ComboBox, {
    include: [myt.FormElement, myt.UpdateableUI],
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides myt.Input */
    initNode: function(parent, attrs) {
        this.acceleratorScope = 'element';
        this.validateWhen = 'key';
        this.errorColor = '#ff9999';
        this.actionRequiredColor = '#996666';
        this.normalColor = '#999999';
        
        this.callSuper(parent, attrs);
        
        this.addValueProcessor(myt.global.valueProcessors.getValueProcessor('undefToEmpty'));
        
        this.addAccelerator('accept', this.doAccept);
        this.addAccelerator('reject', this.doReject);
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setValidateWhen: function(v) {this.validateWhen = v;},
    setAcceleratorScope: function(v) {this.acceleratorScope = v;},
    setErrorColor: function(v) {this.errorColor = v;},
    setActionRequiredColor: function(v) {this.actionRequiredColor = v;},
    setNormalColor: function(v) {this.normalColor = v;},
    
    setIsChanged: function(v) {
        this.callSuper(v);
        if (this.inited) this.updateUI();
    },
    
    setIsValid: function(v) {
        this.callSuper(v);
        if (this.inited) this.updateUI();
    },
    
    /** @overrides myt.FormElement */
    setValue: function(v) {
        var retval = this.callSuper(v);
        
        // Validate as we type.
        var when = this.validateWhen;
        if (when === 'key' || when === 'blurWithKeyFix') this.verifyValidState();
        
        return retval;
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    doAccept: function() {
        if (!this.disabled) {
            switch (this.acceleratorScope) {
                case 'root':
                    this.getRootForm().invokeAccelerator("submit");
                    break;
                case 'element':
                    // Tab navigate forward
                    myt.global.focus.next(false);
                    break;
                case 'none':
                default:
            }
        }
    },
    
    doReject: function() {
        if (!this.disabled) {
            switch (this.acceleratorScope) {
                case 'root':
                    this.getRootForm().invokeAccelerator("cancel");
                    break;
                case 'element':
                    this.rollbackForm();
                    this.getRootForm().doValidation();
                    if (this.form) this.form.verifyChangedState(this);
                    break;
                case 'none':
                default:
            }
        }
    },
    
    notifyPanelShown: function(panel) {
        this._isShown = true;
    },
    
    notifyPanelHidden: function(panel) {
        this._isShown = false;
    },
    
    /** @overrides myt.ListViewAnchor. */
    doActivationKeyDown: function(key, isRepeat) {
        if (key === 27 && !this._isShown) {
            this.invokeAccelerator("reject");
        } else {
            this.callSuper(key, isRepeat);
        }
    },
    
    /** @overrides myt.ListViewAnchor. */
    doActivationKeyUp: function(key) {
        if (key === 13 && !this._isShown) {
            this.invokeAccelerator("accept");
        } else {
            this.callSuper(key);
        }
    },
    
    /** @overrides myt.FocusObservable */
    doBlur: function() {
        this.callSuper();
        
        // Validate on blur
        var when = this.validateWhen;
        if (when === 'blur' || when === 'blurWithKeyFix') this.verifyValidState();
    },
    
    /** @overrides myt.UpdateableUI */
    updateUI: function() {
        this.setBorderColor(
            this.isValid ? this.normalColor : (this.isChanged ? this.errorColor : this.actionRequiredColor)
        );
    }
});


/** A view that accepts multi line user text input.
    
    Events:
        resize:string
        wrap:string
    
    Attributes:
        resize:string Sets how the textarea can be resized. Defaults to 'none'.
            Allowed values: 'none', 'both', 'horizontal', 'vertical'.
        wrap:string Sets how text will wrap. Defaults to 'soft'.
            Allowed values: 'off', 'hard', 'soft'.
*/
myt.InputTextArea = new JS.Class('InputTextArea', myt.BaseInputText, {
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides myt.BaseInputText */
    initNode: function(parent, attrs) {
        if (attrs.tagName == null) attrs.tagName = 'textarea';
        attrs.inputType = null;
        
        if (attrs.resize == null) attrs.resize = 'none';
        if (attrs.wrap == null) attrs.wrap = 'soft';
        
        this.callSuper(parent, attrs);
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setResize: function(v) {
        if (this.resize !== v) {
            this.resize = this.getInnerDomStyle().resize = v || 'none';
            if (this.inited) this.fireEvent('resize', v);
        }
    },
    
    setWrap: function(v) {
        if (this.wrap !== v) {
            this.wrap = this.getInnerDomElement().wrap = v;
            if (this.inited) this.fireEvent('wrap', v);
        }
    }
});


/** An myt.InputTextArea that is also a FormElement.
    
    Accelerators:
        Only "reject" from myt.FormInputTextMixin.
    
    Events:
        None
    
    Attributes:
        None
*/
myt.FormInputTextArea = new JS.Class('FormInputTextArea', myt.InputTextArea, {
    include: [myt.FormInputTextMixin],
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** @overrides myt.FormInputTextMixin */
    __handleKeyDown: function(event) {
        // Do nothing so the "accept" accelerator is not invoked.
    },
});


/** Text content that can be edited.
    
    Events:
        contentEditable:boolean
        minWidth:number
    
    Attributes:
        contentEditble:boolean Makes the text editable or not.
        minWidth:number The minimum width for the component. Defaults to 
            undefined which is effectively 0.
        minHeight:number The minimum height for the component. Defaults to 
            undefined which is effectively 0.
    
    Private Attributes:
        _selRange:object Stores the start and end of the selection.
*/
myt.EditableText = new JS.Class('EditableText', myt.BaseInputText, {
    include: [myt.SizeToDom],
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides myt.BaseInputText */
    initNode: function(parent, attrs) {
        var self = this;
        
        if (attrs.tagName == null) attrs.tagName = 'div';
        attrs.inputType = null;
        
        if (attrs.whiteSpace == null) attrs.whiteSpace = 'pre';
        if (attrs.contentEditable == null) attrs.contentEditable = true;
        
        self.callSuper(parent, attrs);
        
        self.attachToDom(self, '__cleanInput', 'keydown');
        
        self.attachToDom(self, '__userInteraction', 'keyup');
        self.attachToDom(self, '__userInteraction', 'mouseup');
        
        self.setCaretToEnd();
    },
    
    
    // Attributes //////////////////////////////////////////////////////////////
    setMinWidth: function(v) {this.__setProp(v, 'minWidth');},
    setMinHeight: function(v) {
        if (BrowserDetect.browser === 'Firefox') v += 2;
        
        this.__setProp(v, 'minHeight');
    },
    setPadding: function(v) {
        this.setPaddingTop(v);
        this.setPaddingRight(v);
        this.setPaddingBottom(v);
        this.setPaddingLeft(v);
    },
    setPaddingTop: function(v) {this.__setProp(v, 'paddingTop');},
    setPaddingRight: function(v) {this.__setProp(v, 'paddingRight');},
    setPaddingBottom: function(v) {this.__setProp(v, 'paddingBottom');},
    setPaddingLeft: function(v) {this.__setProp(v, 'paddingLeft');},
    
    /** @private */
    __setProp: function(v, propName) {
        if (this[propName] !== v) {
            this[propName] = v;
            this.deStyle[propName] = v + 'px';
            if (this.inited) {
                this.fireEvent(propName, v);
                this.sizeViewToDom();
            }
        }
    },
    
    setContentEditable: function(v) {
        if (this.contentEditable !== v) {
            this.contentEditable = this.getInnerDomElement().contentEditable = v;
            if (this.inited) this.fireEvent('contentEditable', v);
        }
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** @overrides myt.BaseInputText */
    filterInputPress: function(domEvent) {
        // Implement maxLength
        var maxLength = this.maxLength;
        if (maxLength >= 0 && this.getCharacterCount() === maxLength) domEvent.preventDefault();
        
        this.callSuper(domEvent);
    },
    
    /** @overrides myt.NativeInputWrapper */
    getDomValue: function() {
        return this.getInnerDomElement().innerHTML;
    },
    
    /** @overrides myt.NativeInputWrapper */
    setDomValue: function(v) {
        var de = this.getInnerDomElement();
        if (de.innerHTML !== v) {
            de.innerHTML = v;
            this.sizeViewToDom();
            this.restoreSelection();
        }
    },
    
    /** @private */
    __cleanInput: function(event) {
        // Prevent enter key from inserting a div
        if (myt.KeyObservable.getKeyCodeFromEvent(event) === 13) {
            event.value.preventDefault();
            
            // Instead, insert a linefeed if wrapping is allowed.
            if (this.whitespace !== 'nowrap') {
                document.execCommand('insertHTML', false, this.isCaretAtEnd() ? '\n\n' : '\n');
            }
        }
    },
    
    /** @overrides myt.BaseInputText */
    __syncToDom: function(event) {
        this.callSuper(event);
        
        this.saveSelection();
        this.sizeViewToDom();
        this.restoreSelection();
    },
    
    // Caret handling
    getCharacterCount: function() {
        var elem = this.getInnerDomElement().firstChild;
        return elem ? elem.length : 0;
    },
    
    isCaretAtEnd: function() {
        return this.getCaretPosition() === this.getCharacterCount();
    },
    
    /** @overrides myt.BaseInputText */
    getCaretPosition: function() {
        var selection = this.getSelection();
        return selection ? selection.end : 0;
    },
    
    /** @overrides myt.BaseInputText */
    setCaretPosition: function(start, end) {
        if (end == null || start === end) {
            // Don't update if the current position already matches.
            if (this.getCaretPosition() === start) return;
            
            end = start;
        }
        this.saveSelection({
            start:start,
            startElem:this.getInnerDomElement().firstChild,
            end:end,
            endElem:this.getInnerDomElement().firstChild
        });
    },
    
    // Selection handling
    /** @overrides myt.FocusObservable */
    doFocus: function() {
        this.callSuper();
        this.restoreSelection();
    },
    
    /** @private */
    __userInteraction: function(event) {
        this.saveSelection();
        return true;
    },
    
    /** @overrides myt.BaseInputText */
    getSelection: function() {
        var range;
        if (window.getSelection) {
            var sel = window.getSelection();
            if (sel.rangeCount > 0) {
                // Sometimes when deleting we get an unexpected node
                if (sel.extentNode === this.getInnerDomElement()) return null;
                
                range = sel.getRangeAt(0);
            }
        } else if (document.selection) {
            range = document.selection.createRange();
        }
        
        return {
            start:range ? range.startOffset : 0,
            startElem:range ? range.startContainer : this.getInnerDomElement().firstChild,
            end:range ? range.endOffset : 0,
            endElem:range ? range.endContainer : this.getInnerDomElement().firstChild
        };
    },
    
    /** @overrides myt.BaseInputText */
    setSelection: function(selection) {
        if (selection) {
            var startElem = selection.startElem,
                endElem = selection.endElem;
            if (startElem && startElem.parentNode && endElem && endElem.parentNode) {
                var range = document.createRange();
                range.setStart(startElem, Math.min(selection.start, startElem.length));
                range.setEnd(endElem, Math.min(selection.end, endElem.length));
                
                if (window.getSelection) {
                    var sel = window.getSelection();
                    if (sel.rangeCount > 0) sel.removeAllRanges();
                    sel.addRange(range);
                } else if (document.selection) {
                    range.select();
                }
            }
        }
    }
});


/** An myt.EditableText that is also a FormElement.
    
    Events:
        None
    
    Attributes:
        None
*/
myt.FormEditableText = new JS.Class('FormEditableText', myt.EditableText, {
    include: [myt.FormInputTextMixin],
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** @overrides myt.FormInputTextMixin */
    __handleKeyDown: function(event) {
        // Only allow enter key as accelerator if no wrapping is occurring
        if (this.whitespace === 'nowrap') this.callSuper(event);
    },
});


/** A numeric value component that stays within a minimum and maximum value.
    
    Events:
        minValue:number
        maxValue:number
        snapToInt:boolean
    
    Attributes:
        minValue:number the largest value allowed. If undefined or null no
            min value is enforced.
        maxValue:number the lowest value allowed. If undefined or null no
            max value is enforced.
        snapToInt:boolean If true values can only be integers. Defaults to true.
*/
myt.BoundedValueComponent = new JS.Module('BoundedValueComponent', {
    include: [myt.ValueComponent],
    
    // Life Cycle //////////////////////////////////////////////////////////////
    initNode: function(parent, attrs) {
        this.appendToEarlyAttrs('snapToInt','minValue','maxValue');
        
        if (attrs.snapToInt == null) attrs.snapToInt = true;
        
        if (!attrs.valueFilter) {
            var self = this;
            attrs.valueFilter = function(v) {
                var max = self.maxValue;
                if (max != null && v > max) return max;
                
                var min = self.minValue;
                if (min != null && v < min) return min;
                
                return v;
            };
        }
        
        this.callSuper(parent, attrs);
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setSnapToInt: function(v) {
        if (this.snapToInt !== v) {
            this.snapToInt = v;
            if (this.inited) {
                this.fireEvent('snapToInt', v);
                
                // Update min, max and value since snap has been turned on
                if (v) {
                    this.setMinValue(this.minValue);
                    this.setMaxValue(this.maxValue);
                    this.setValue(this.value);
                }
            }
        }
    },
    
    setMinValue: function(v) {
        if (this.snapToInt && v != null) v = Math.round(v);
        
        if (this.minValue !== v) {
            var max = this.maxValue;
            if (max != null && v > max) v = max;
            
            if (this.minValue !== v) {
                this.minValue = v;
                if (this.inited) {
                    this.fireEvent('minValue', v);
                    
                    // Rerun setValue since the filter has changed.
                    this.setValue(this.value);
                }
            }
        }
    },
    
    setMaxValue: function(v) {
        if (this.snapToInt && v != null) v = Math.round(v);
        
        if (this.maxValue !== v) {
            var min = this.minValue;
            if (min != null && v < min) v = min;
            
            if (this.maxValue !== v) {
                this.maxValue = v;
                if (this.inited) {
                    this.fireEvent('maxValue', v);
                    
                    // Rerun setValue since the filter has changed.
                    this.setValue(this.value);
                }
            }
        }
    },
    
    /** @overrides myt.ValueComponent */
    setValue: function(v) {
        this.callSuper(this.snapToInt && v != null && !isNaN(v) ? Math.round(v) : v);
    }
});


/** Provides global drag and drop functionality.
    
    Events:
        dragLeave:myt.DropTarget Fired when a myt.Dropable is dragged out of
            the drop target.
        dragEnter:myt.DropTarget Fired when a myt.Dropable is dragged over
            the drop target.
        startDrag:object Fired when a drag starts. Value is the object
            being dragged.
        stopDrag:object Fired when a drag ends. Value is the object 
            that is no longer being dragged.
        drop:object Fired when a drag ends over a drop target. The value is
            an array containing the dropable at index 0 and the drop target
            at index 1.
    
    Attributes:
        dragView:myt.View The view currently being dragged.
        overView:myt.View The view currently being dragged over.
        dropTargets:array The list of myt.DropTargets currently registered
            for notification when drag and drop events occur.
        autoScrollers:array The list of myt.AutoScrollers currently registered
            for notification when drags start and stop.
*/
new JS.Singleton('GlobalDragManager', {
    include: [myt.Observable],
    
    
    // Constructor /////////////////////////////////////////////////////////////
    initialize: function() {
        this.dropTargets = [];
        this.autoScrollers = [];
        
        myt.global.register('dragManager', this);
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setDragView: function(v) {
        var cur = this.dragView;
        if (cur !== v) {
            this.dragView = v;
            
            var isStart = !!v, targets, i, dv, funcName, eventName;
            
            if (isStart) {
                dv = v;
                funcName = 'notifyDragStart';
                eventName = 'startDrag';
            } else {
                dv = cur;
                funcName = 'notifyDragStop';
                eventName = 'stopDrag';
            }
            
            targets = this.__filterList(dv, this.dropTargets);
            i = targets.length;
            while (i) targets[--i][funcName](dv);
            
            targets = this.__filterList(dv, this.autoScrollers);
            i = targets.length;
            while (i) targets[--i][funcName](dv);
            
            this.fireEvent(eventName, v);
        }
    },
    
    setOverView: function(v) {
        var cur = this.overView;
        if (cur !== v) {
            var dv = this.dragView;
            if (cur) {
                cur.notifyDragLeave(dv);
                if (!dv.destroyed) dv.notifyDragLeave(cur);
                this.fireEvent('dragLeave', cur);
            }
            
            this.overView = v;
            
            if (v) {
                v.notifyDragEnter(dv);
                if (!dv.destroyed) dv.notifyDragEnter(v);
                this.fireEvent('dragEnter', cur);
            }
        }
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** Registers the provided auto scroller to receive notifications.
        @param autoScroller:myt.AutoScroller The auto scroller to register.
        @returns void */
    registerAutoScroller: function(autoScroller) {
        this.autoScrollers.push(autoScroller);
    },
    
    /** Unregisters the provided auto scroller.
        @param autoScroller:myt.AutoScroller The auto scroller to unregister.
        @returns void */
    unregisterAutoScroller: function(autoScroller) {
        var autoScrollers = this.autoScrollers, i = autoScrollers.length;
        while (i) {
            if (autoScrollers[--i] === autoScroller) {
                autoScrollers.splice(i, 1);
                break;
            }
        }
    },
    
    /** Registers the provided drop target to receive notifications.
        @param dropTarget:myt.DropTarget The drop target to register.
        @returns void */
    registerDropTarget: function(dropTarget) {
        this.dropTargets.push(dropTarget);
    },
    
    /** Unregisters the provided drop target.
        @param dropTarget:myt.DropTarget The drop target to unregister.
        @returns void */
    unregisterDropTarget: function(dropTarget) {
        var dropTargets = this.dropTargets, i = dropTargets.length;
        while (i) {
            if (dropTargets[--i] === dropTarget) {
                dropTargets.splice(i, 1);
                break;
            }
        }
    },
    
    /** Called by a myt.Dropable when a drag starts.
        @param dropable:myt.Dropable The dropable that started the drag.
        @returns void */
    startDrag: function(dropable) {
        this.setDragView(dropable);
    },
    
    /** Called by a myt.Dropable when a drag stops.
        @param event:event The mouse event that triggered the stop drag.
        @param dropable:myt.Dropable The dropable that stopped being dragged.
        @returns void */
    stopDrag: function(event, dropable, isAbort) {
        var overView = this.overView;
        dropable.notifyDropped(overView, isAbort);
        if (overView && !isAbort) overView.notifyDrop(dropable);
        
        this.setOverView();
        this.setDragView();
        
        if (overView && !isAbort) this.fireEvent('drop', [dropable, overView]);
    },
    
    /** Called by a myt.Dropable during dragging.
        @param event:event The mousemove event for the drag update.
        @param dropable:myt.Dropable The dropable that is being dragged.
        @returns void */
    updateDrag: function(event, dropable) {
        // Get the frontmost myt.DropTarget that is registered with this 
        // manager and is under the current mouse location and has a 
        // matching drag group.
        var topDropTarget,
            dropTargets = this.__filterList(dropable, this.dropTargets);
            i = dropTargets.length;
        
        if (i > 0) {
            var domMouseEvent = event.value,
                mouseX = domMouseEvent.pageX,
                mouseY = domMouseEvent.pageY,
                dropTarget;
            
            while (i) {
                dropTarget = dropTargets[--i];
                if (dropTarget.willAcceptDrop(dropable) &&
                    dropable.willPermitDrop(dropTarget) &&
                    dropTarget.isPointVisible(mouseX, mouseY) && 
                    (!topDropTarget || dropTarget.isInFrontOf(topDropTarget))
                ) {
                    topDropTarget = dropTarget;
                }
            }
        }
        
        this.setOverView(topDropTarget);
    },
    
    /** Filters the provided array of myt.DragGroupSupport items for the
        provided dropable.
        @private
        @param dropable:myt.Dropable The dropable to filter for.
        @returns array: An array of the matching list items. */
    __filterList: function(dropable, list) {
        var retval;
        
        if (dropable.destroyed) {
            retval = [];
        } else {
            if (dropable.acceptAnyDragGroup()) {
                retval = list;
            } else {
                retval = [];
                
                var dragGroups = dropable.getDragGroups(),
                    i = list.length, 
                    item, targetGroups, dragGroup;
                while (i) {
                    item = list[--i];
                    if (item.acceptAnyDragGroup()) {
                        retval.push(item);
                    } else {
                        targetGroups = item.getDragGroups();
                        for (dragGroup in dragGroups) {
                            if (targetGroups[dragGroup]) {
                                retval.push(item);
                                break;
                            }
                        }
                    }
                }
            }
        }
        
        return retval;
    }
});


/** Makes an myt.View draggable via the mouse.
    
    Also supresses context menus since the mouse down to open it causes bad
    behavior since a mouseup event is not always fired.
    
    Events:
        isDragging:boolean Fired when the isDragging attribute is modified
            via setIsDragging.
    
    Attributes:
        allowAbort:boolean Allows a drag to be aborted by the user by
            pressing the 'esc' key. Defaults to undefined which is equivalent
            to false.
        isDraggable:boolean Configures the view to be draggable or not. The 
            default value is true.
        distanceBeforeDrag:number The distance, in pixels, before a mouse 
            down and drag is considered a drag action. Defaults to 0.
        isDragging:boolean Indicates that this view is currently being dragged.
        draggableAllowBubble:boolean Determines if mousedown and mouseup
            dom events handled by this component will bubble or not. Defaults
            to true.
        dragOffsetX:number The x amount to offset the position during dragging.
            Defaults to 0.
        dragOffsetY:number The y amount to offset the position during dragging.
            Defaults to 0.
        dragInitX:number Stores initial mouse x position during dragging.
        dragInitY:number Stores initial mouse y position during dragging.
        centerOnMouse:boolean If true this draggable will update the dragInitX
            and dragInitY to keep the view centered on the mouse. Defaults
            to undefined which is equivalent to false.
    
    Private Attributes:
        __lastMousePosition:object The last position of the mouse during
            dragging.
*/
myt.Draggable = new JS.Module('Draggable', {
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides myt.View */
    initNode: function(parent, attrs) {
        var self = this,
            isDraggable = true;
        
        self.isDraggable = self.isDragging = false;
        self.draggableAllowBubble = true;
        self.distanceBeforeDrag = self.dragOffsetX = self.dragOffsetY = 0;
        
        // Will be set after init since the draggable subview probably
        // doesn't exist yet.
        if (attrs.isDraggable != null) {
            isDraggable = attrs.isDraggable;
            delete attrs.isDraggable;
        }
        
        self.callSuper(parent, attrs);
        
        self.setIsDraggable(isDraggable);
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setIsDraggable: function(v) {
        var self = this,
            func,
            dragviews,
            dragview,
            i;
        if (self.isDraggable !== v) {
            self.isDraggable = v;
            // No event needed.
            
            if (v) {
                func = self.attachToDom;
            } else if (self.inited) {
                func = self.detachFromDom;
            }
            
            if (func) {
                dragviews = self.getDragViews();
                i = dragviews.length;
                while (i) {
                    dragview = dragviews[--i];
                    func.call(self, dragview, '__doMouseDown', 'mousedown');
                    func.call(self, dragview, '__doContextMenu', 'contextmenu');
                }
            }
        }
    },
    
    setIsDragging: function(v) {
        this.set('isDragging', v, true);
    },
    
    setDragOffsetX: function(v, supressUpdate) {
        if (this.dragOffsetX !== v) {
            this.dragOffsetX = v;
            if (this.inited && this.isDragging && !supressUpdate) this.__requestDragPosition();
        }
    },
    
    setDragOffsetY: function(v, supressUpdate) {
        if (this.dragOffsetY !== v) {
            this.dragOffsetY = v;
            if (this.inited && this.isDragging && !supressUpdate) this.__requestDragPosition();
        }
    },
    
    setDistanceBeforeDrag: function(v) {this.distanceBeforeDrag = v;},
    setDraggableAllowBubble: function(v) {this.draggableAllowBubble = v;},
    setCenterOnMouse: function(v) {this.centerOnMouse = v;},
    setAllowAbort: function(v) {this.allowAbort = v;},
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** @returns an array of views that can be moused down on to start the
        drag. Subclasses should override this to return an appropriate list
        of views. By default this view is returned thus making the entire
        view capable of starting a drag. */
    getDragViews: function() {
        return [this];
    },
    
    /** @private */
    __doContextMenu: function(event) {
        // Do nothing so the context menu event is supressed.
    },
    
    /** @private */
    __doMouseDown: function(event) {
        var self = this,
            pos = myt.MouseObservable.getMouseFromEvent(event),
            gm = myt.global.mouse,
            de = self.getOuterDomElement();
        self.dragInitX = pos.x - de.offsetLeft;
        self.dragInitY = pos.y - de.offsetTop;
        
        self.attachToDom(gm, '__doMouseUp', 'mouseup', true);
        if (self.distanceBeforeDrag > 0) {
            self.attachToDom(gm, '__doDragCheck', 'mousemove', true);
        } else {
            self.startDrag(event);
        }
        
        event.value.preventDefault();
        return self.draggableAllowBubble;
    },
    
    /** @private */
    __doMouseUp: function(event) {
        if (this.isDragging) {
            this.stopDrag(event, false);
        } else {
            var gm = myt.global.mouse;
            this.detachFromDom(gm, '__doMouseUp', 'mouseup', true);
            this.detachFromDom(gm, '__doDragCheck', 'mousemove', true);
        }
        return this.draggableAllowBubble;
    },
    
    /** @private */
    __watchForAbort: function(event) {
        if (event.value === 27) this.stopDrag(event, true);
    },
    
    /** @private */
    __doDragCheck: function(event) {
        var self = this,
            M = myt,
            pos = M.MouseObservable.getMouseFromEvent(event),
            distance = M.Geometry.measureDistance(pos.x, pos.y, self.dragInitX + self.x, self.dragInitY + self.y);
        if (distance >= self.distanceBeforeDrag) {
            self.detachFromDom(M.global.mouse, '__doDragCheck', 'mousemove', true);
            self.startDrag(event);
        }
    },
    
    /** Active until stopDrag is called. The view position will be bound
        to the mouse position. Subclasses typically call this onmousedown for
        subviews that allow dragging the view.
        @param event:event The event the mouse event when the drag started.
        @returns void */
    startDrag: function(event) {
        var self = this,
            g = myt.global;
        
        if (self.centerOnMouse) {
            self.syncTo(self, '__updateDragInitX', 'width');
            self.syncTo(self, '__updateDragInitY', 'height');
        }
        
        if (self.allowAbort) self.attachTo(g.keys, '__watchForAbort', 'keyup');
        
        self.setIsDragging(true);
        self.attachToDom(g.mouse, 'updateDrag', 'mousemove', true);
        self.updateDrag(event);
    },
    
    /** Called on every mousemove event while dragging.
        @returns void */
    updateDrag: function(event) {
        this.__lastMousePosition = myt.MouseObservable.getMouseFromEvent(event);
        this.__requestDragPosition();
    },
    
    /** @private */
    __updateDragInitX: function(event) {
        this.dragInitX = this.width / 2 * (this.scaleX || 1);
    },
    
    /** @private */
    __updateDragInitY: function(event) {
        this.dragInitY = this.height / 2 * (this.scaleY || 1);
    },
    
    /** @private */
    __requestDragPosition: function() {
        var self = this,
            pos = self.__lastMousePosition;
        self.requestDragPosition(
            pos.x - self.dragInitX + self.dragOffsetX, 
            pos.y - self.dragInitY + self.dragOffsetY
        );
    },
    
    /** Stop the drag. (see startDrag for more details)
        @param event:object The event that ended the drag.
        @param isAbort:boolean Indicates if the drag ended normally or was
            aborted.
        @returns void */
    stopDrag: function(event, isAbort) {
        var self = this,
            g = myt.global,
            gm = g.mouse;
        self.detachFromDom(gm, '__doMouseUp', 'mouseup', true);
        self.detachFromDom(gm, 'updateDrag', 'mousemove', true);
        if (self.centerOnMouse) {
            self.detachFrom(self, '__updateDragInitX', 'width');
            self.detachFrom(self, '__updateDragInitY', 'height');
        }
        if (self.allowAbort) self.detachFrom(g.keys, '__watchForAbort', 'keyup');
        self.setIsDragging(false);
    },
    
    /** Repositions the view to the provided values. The default implementation
        is to directly set x and y. Subclasses should override this method
        when it is necessary to constrain the position.
        @param x:number the new x position.
        @param y:number the new y position.
        @returns void */
    requestDragPosition: function(x, y) {
        if (!this.disabled) {
            this.setX(x);
            this.setY(y);
        }
    }
});


/** Provides Slider thumb functionality.
    
    Requires:
        myt.Button
    
    Events:
        None
    
    Attributes:
        None
*/
myt.SliderThumbMixin = new JS.Module('SliderThumbMixin', {
    include: [myt.Draggable],
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides myt.Checkbox */
    initNode: function(parent, attrs) {
        if (attrs.width == null) attrs.width = parent.thumbWidth;
        if (attrs.height == null) attrs.height = parent.thumbHeight;
        
        if (attrs.repeatKeyDown == null) attrs.repeatKeyDown = true;
        if (attrs.activationKeys == null) {
            attrs.activationKeys = [
                37, // left arrow
                38, // up arrow
                39, // right arrow
                40 // down arrow
            ];
        }
        
        this.callSuper(parent, attrs);
        
        if (parent.axis === 'x') {
            this.setY(parent.thumbOffset);
        } else {
            this.setX(parent.thumbOffset);
        }
        
        this.syncTo(parent, 'setDisabled', 'disabled');
        
        parent._syncThumbToValue(this, parent.getValue());
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    /** @overrides myt.Disableable */
    setDisabled: function(v) {
        // Adapt to event from syncTo
        if (v != null && typeof v === 'object') v = v.value;
        
        this.callSuper(v);
    },
    
    /** @overrides myt.FocusObservable */
    setFocused: function(v) {
        this.callSuper(v);
        if (v) this.makeHighestZIndex();
    },
    
    /** @overrides myt.View */
    setX: function(v) {
        if (this.x !== v) {
            this.callSuper(v);
            
            var p = this.parent;
            if (p.axis === 'x') p._syncValueToThumb(this);
        }
    },
    
    /** @overrides myt.View */
    setY: function(v) {
        if (this.y !== v) {
            this.callSuper(v);
            
            var p = this.parent;
            if (p.axis === 'y') p._syncValueToThumb(this);
        }
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** @overrides myt.Draggable */
    requestDragPosition: function(x, y) {
        if (!this.disabled) {
            var parent = this.parent,
                minPx = parent.getMinPixelValueForThumb(this),
                maxPx = parent.getMaxPixelValueForThumb(this),
                halfSize, pos, func;
            
            if (parent.axis === 'x') {
                halfSize = this.width / 2;
                pos = x;
                func = this.setX;
            } else {
                halfSize = this.height / 2;
                pos = y;
                func = this.setY;
            }
            
            func.call(this, Math.min(Math.max(pos, minPx - halfSize), maxPx - halfSize));
        }
    },
    
    /** @overrides myt.Button. */
    doActivationKeyDown: function(key, isRepeat) {
        var parent = this.parent;
        switch (key) {
            case 37: // Left
                parent.nudgeValueLeft(this);
                break;
            case 38: // Up
                parent.nudgeValueUp(this);
                break;
            case 39: // Right
                parent.nudgeValueRight(this);
                break;
            case 40: // Down
                parent.nudgeValueDown(this);
                break;
        }
        
        this.callSuper(key, isRepeat);
    }
});


/** A simple implementation of a slider thumb. */
myt.SimpleSliderThumb = new JS.Class('SimpleSliderThumb', myt.SimpleButton, {
    include: [myt.SliderThumbMixin],
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides myt.SimpleButton */
    initNode: function(parent, attrs) {
        if (attrs.activeColor == null) attrs.activeColor = '#bbbbbb';
        if (attrs.readyColor == null) attrs.readyColor = '#cccccc';
        if (attrs.hoverColor == null) attrs.hoverColor = '#dddddd';
        
        if (attrs.boxShadow == null) attrs.boxShadow = [0, 0, 4, '#666666'];
        
        this.callSuper(parent, attrs);
        
        if (attrs.roundedCorners == null) this.setRoundedCorners(Math.min(this.height, this.width) / 2);
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** @overrides myt.FocusObservable */
    showFocusEmbellishment: function() {
        this.hideDefaultFocusEmbellishment();
        this.setBoxShadow([0, 0, 9, '#666666']);
    },
    
    /** @overrides myt.FocusObservable */
    hideFocusEmbellishment: function() {
        this.hideDefaultFocusEmbellishment();
        this.setBoxShadow([0, 0, 4, '#666666']);
    }
});


/** A base class for slider components.
    
    Events:
        None
    
    Attributes:
        axis:string Indicates the direction the slider moves in. Allowed values
            are 'x' and 'y'. Defaults to 'x'.
        trackInset:number the number of pixels to inset the start of the track
            from the top/left edge of the component. Defaults to 0.
        trackOutset:number the number of pixels to inset the end of the track
            from the bottom/right edge of the component. Default to 0.
        thumbWidth:number The width of the thumb.
        thumbHeight:number The height of the thumb.
        thumbOffset:number The x/y offset of the thumb. Will applied to the
            opposite dimension to the axis.
        thumbClass:JS.Class the class to use to create the thumb.
        nudgeAmount:number the amount to nudge the value when the arrows keys
            are invoked. Defaults to 1.
*/
myt.BaseSlider = new JS.Class('BaseSlider', myt.View, {
    include: [myt.Disableable],
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides myt.View */
    initNode: function(parent, attrs) {
        if (attrs.axis == null) attrs.axis = 'x';
        if (attrs.axis === 'x') {
            if (attrs.width == null) attrs.width = 100;
            if (attrs.height == null) attrs.height = 18;
        } else {
            if (attrs.width == null) attrs.width = 18;
            if (attrs.height == null) attrs.height = 100;
        }
        
        if (attrs.bgColor == null) attrs.bgColor = '#999999';
        if (attrs.roundedCorners == null) attrs.roundedCorners = 9;
        
        if (attrs.trackInset == null) attrs.trackInset = 9;
        if (attrs.trackOutset == null) attrs.trackOutset = 9;
        if (attrs.thumbWidth == null) attrs.thumbWidth = 16;
        if (attrs.thumbHeight == null) attrs.thumbHeight = 16;
        if (attrs.thumbOffset == null) attrs.thumbOffset = 1;
        
        if (attrs.nudgeAmount == null) attrs.nudgeAmount = 1;
        
        if (attrs.thumbClass == null) attrs.thumbClass = myt.SimpleSliderThumb;
        
        this.callSuper(parent, attrs);
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setAxis: function(v) {this.axis = v;},
    setTrackInset: function(v) {this.trackInset = v;},
    setTrackOutset: function(v) {this.trackOutset = v;},
    setThumbWidth: function(v) {this.thumbWidth = v;},
    setThumbHeight: function(v) {this.thumbHeight = v;},
    setThumbOffset: function(v) {this.thumbOffset = v;},
    setThumbClass: function(v) {this.thumbClass = v;},
    setNudgeAmount: function(v) {this.nudgeAmount = v;},
    
    
    // Methods /////////////////////////////////////////////////////////////////
    convertValueToPixels: function(v) {
        var self = this,
            minV = self.minValue, ti = self.trackInset,
            pxRange = (self.axis === 'x' ? self.width : self.height) - ti - self.trackOutset,
            valueRange = self.maxValue - minV;
        return ti + ((v - minV) * (pxRange / valueRange));
    },
    
    convertPixelsToValue: function(px) {
        var self = this,
            minV = self.minValue, ti = self.trackInset,
            pxRange = (self.axis === 'x' ? self.width : self.height) - ti - self.trackOutset,
            valueRange = self.maxValue - minV;
        return ((px - ti) * (valueRange / pxRange)) + minV;
    },
    
    nudgeValueLeft: function(thumb) {
        this._nudge(thumb, false);
    },
    
    nudgeValueUp: function(thumb) {
        this._nudge(thumb, false);
    },
    
    nudgeValueRight: function(thumb) {
        this._nudge(thumb, true);
    },
    
    nudgeValueDown: function(thumb) {
        this._nudge(thumb, true);
    },
    
    _nudge: function(thumb, up) {
        // Subclasses to implement
    },
    
    _syncThumbToValue: function(thumb, value) {
        value = this.convertValueToPixels(value);
        if (this.axis === 'x') {
            thumb.setX(value - thumb.width / 2);
        } else {
            thumb.setY(value - thumb.height / 2);
        }
    }
});


/** A slider component.
    
    Events:
        None
    
    Attributes:
        None
    
    Private Attributes:
        __lockSync:boolean Used internally to prevent infinite loops.
*/
myt.Slider = new JS.Class('Slider', myt.BaseSlider, {
    include: [myt.BoundedValueComponent],
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    doAfterAdoption: function() {
        new this.thumbClass(this, {name:'thumb'});
        
        this.callSuper();
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    /** @overrides */
    setValue: function(v) {
        this.callSuper(v);
        
        // Sync position of thumb
        if (this.inited && !this.__lockSync) this._syncThumbToValue(this.thumb, this.getValue());
    },
    
    /** Update the thumb position if the width changes.
        @overrides */
    setWidth: function(v, supressEvent) {
        var existing = this.width;
        this.callSuper(v, supressEvent);
        if (this.inited && this.axis === 'x' && this.width !== existing) this._syncThumbToValue(this.thumb, this.getValue());
    },
    
    /** Update the thumb position if the height changes.
        @overrides */
    setHeight: function(v, supressEvent) {
        var existing = this.height;
        this.callSuper(v, supressEvent);
        if (this.inited && this.axis === 'y' && this.height !== existing) this._syncThumbToValue(this.thumb, this.getValue());
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** Should only be called by myt.SliderThumbMixin.
        @private */
    _syncValueToThumb: function(thumb) {
        if (this.inited && !this.__lockSync) {
            this.__lockSync = true;
            
            this.setValue(this.convertPixelsToValue(
                this.axis === 'x' ? thumb.x + thumb.width / 2 : thumb.y + thumb.height / 2
            ));
            
            // Update thumb position since value may have been adjusted
            this._syncThumbToValue(thumb, this.getValue());
            
            this.__lockSync = false;
        }
    },
    
    /** @overrides myt.BaseSlider */
    _nudge: function(thumb, up) {
        this.setValue(this.getValue() + this.nudgeAmount * (up ? 1 : -1));
    },
    
    /** Should only be called by myt.SliderThumbMixin.
        @private */
    getMinPixelValueForThumb: function(thumb) {
        return this.convertValueToPixels(this.minValue);
    },
    
    /** Should only be called by myt.SliderThumbMixin.
        @private */
    getMaxPixelValueForThumb: function(thumb) {
        return this.convertValueToPixels(this.maxValue);
    }
});


/** A value that consists of an upper and lower value. The lower value must
    be less than or equal to the upper value. The value object that must be
    passed into setValue and returned from getValue is an object of the
    form: {lower:number, upper:number}. */
myt.RangeComponent = new JS.Module('RangeComponent', {
    include: [myt.ValueComponent],
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setLowerValue: function(v) {
        this.setValue({
            lower:v, 
            upper:(this.value && this.value.upper !== undefined) ? this.value.upper : v
        });
    },
    
    getLowerValue: function() {
        return this.value ? this.value.lower : undefined;
    },
    
    setUpperValue: function(v) {
        this.setValue({
            lower:(this.value && this.value.lower !== undefined) ? this.value.lower : v,
            upper:v
        });
    },
    
    getUpperValue: function() {
        return this.value ? this.value.upper : undefined;
    },
    
    setValue: function(v) {
        if (v) {
            var existing = this.value,
                existingLower = existing ? existing.lower : undefined,
                existingUpper = existing ? existing.upper : undefined;
            
            if (this.valueFilter) v = this.valueFilter(v);
            
            // Do nothing if value is identical
            if (v.lower === existingLower && v.upper === existingUpper) return;
            
            // Assign upper to lower if no lower was provided.
            if (v.lower == null) v.lower = v.upper;
            
            // Assign lower to upper if no upper was provided.
            if (v.upper == null) v.upper = v.lower;
            
            // Swap lower and upper if they are in the wrong order
            if (v.lower !== undefined && v.upper !== undefined && v.lower > v.upper) {
                var temp = v.lower;
                v.lower = v.upper;
                v.upper = temp;
            }
            
            this.value = v;
            if (this.inited) {
                this.fireEvent('value', this.getValue());
                if (v.lower !== existingLower) this.fireEvent('lowerValue', v.lower);
                if (v.upper !== existingUpper) this.fireEvent('upperValue', v.upper);
            }
        } else {
            this.callSuper(v);
        }
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    getValueCopy: function() {
        var v = this.value;
        return {lower:v.lower, upper:v.upper};
    }
});


/** A numeric value component that stays within an upper and lower value and
    where the value is a range. */
myt.BoundedRangeComponent = new JS.Module('BoundedRangeComponent', {
    include: [myt.BoundedValueComponent, myt.RangeComponent],
    
    // Life Cycle //////////////////////////////////////////////////////////////
    initNode: function(parent, attrs) {
        if (!attrs.valueFilter) {
            var self = this;
            attrs.valueFilter = function(v) {
                if (v) {
                    var max = self.maxValue, min = self.minValue;
                    if (max != null && v.upper > max) v.upper = max;
                    if (min != null && v.lower < min) v.lower = min;
                }
                return v;
            };
        }
        
        this.callSuper(parent, attrs);
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    /** @overrides myt.ValueComponent */
    setValue: function(v) {
        if (this.snapToInt && v != null) {
            if (v.lower != null && !isNaN(v.lower)) v.lower = Math.round(v.lower);
            if (v.upper != null && !isNaN(v.upper)) v.upper = Math.round(v.upper);
        }
        this.callSuper(v);
    }
});


/** A simple implementation of the range fill for a RangeSlider. */
myt.SimpleSliderRangeFill = new JS.Class('SimpleSliderRangeFill', myt.View, {
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides myt.Checkbox */
    initNode: function(parent, attrs) {
        if (attrs.bgColor == null) attrs.bgColor = '#666666';
        
        this.callSuper(parent, attrs);
        
        if (parent.axis === 'x') {
            this.setY(parent.thumbOffset);
            this.setHeight(parent.thumbHeight);
            this.setRoundedCorners(parent.thumbHeight / 2);
        } else {
            this.setX(parent.thumbOffset);
            this.setWidth(parent.thumbWidth);
            this.setRoundedCorners(parent.thumbWidth / 2);
        }
        parent._syncRangeFillToValue();
    }
});


/** A slider component that support two thumbs.
    
    Events:
        None
    
    Attributes:
        rangeFillClass:JS.Class The class used to instantiate the rangeFill
    
    Private Attributes:
        __lockSync:boolean Used internally to prevent infinite loops.
*/
myt.RangeSlider = new JS.Class('RangeSlider', myt.BaseSlider, {
    include: [myt.BoundedRangeComponent],
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides myt.BaseSlider */
    initNode: function(parent, attrs) {
        if (attrs.rangeFillClass == null) attrs.rangeFillClass = myt.SimpleSliderRangeFill;
        
        this.callSuper(parent, attrs);
    },
    
    /** @overrides */
    doAfterAdoption: function() {
        new this.rangeFillClass(this, {name:'rangeFill'});
        new this.thumbClass(this, {name:'thumbLower'});
        new this.thumbClass(this, {name:'thumbUpper'});
        
        this.callSuper();
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setRangeFillClass: function(v) {this.rangeFillClass = v;},
    
    /** @overrides */
    setValue: function(v) {
        this.callSuper(v);
        
        if (this.inited) {
            // Sync position of thumb
            if (!this.__lockSync) {
                v = this.getValue();
                this._syncThumbToValue(this.thumbLower, v);
                this._syncThumbToValue(this.thumbUpper, v);
            }
            
            this._syncRangeFillToValue();
        }
    },
    
    /** Update the thumb position if the width changes.
        @overrides */
    setWidth: function(v, supressEvent) {
        var existing = this.width;
        this.callSuper(v, supressEvent);
        if (this.inited && this.axis === 'x' && this.width !== existing) {
            var value = this.getValue();
            this._syncThumbToValue(this.thumbLower, value);
            this._syncThumbToValue(this.thumbUpper, value);
        }
    },
    
    /** Update the thumb position if the height changes.
        @overrides */
    setHeight: function(v, supressEvent) {
        var existing = this.height;
        this.callSuper(v, supressEvent);
        if (this.inited && this.axis === 'y' && this.height !== existing) {
            var value = this.getValue();
            this._syncThumbToValue(this.thumbLower, value);
            this._syncThumbToValue(this.thumbUpper, value);
        }
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** Should only be called by myt.SimpleSliderRangeFill.
        @private */
    _syncRangeFillToValue: function() {
        var rangeFill = this.rangeFill, value = this.getValue(),
            lowerPx = this.convertValueToPixels(value.lower),
            extent = this.convertValueToPixels(value.upper) - lowerPx;
        if (this.axis === 'x') {
            rangeFill.setX(lowerPx);
            rangeFill.setWidth(extent);
        } else {
            rangeFill.setY(lowerPx);
            rangeFill.setHeight(extent);
        }
    },
    
    /** @overrides myt.BaseSlider */
    _syncThumbToValue: function(thumb, value) {
        this.callSuper(thumb, thumb.name === 'thumbLower' ? value.lower : value.upper);
    },
    
    /** Should only be called by myt.SliderThumbMixin.
        @private */
    _syncValueToThumb: function(thumb) {
        if (this.inited && !this.__lockSync) {
            this.__lockSync = true;
            
            var converted = this.convertPixelsToValue(
                this.axis === 'x' ? thumb.x + thumb.width / 2 : thumb.y + thumb.height / 2
            );
            
            var value = this.getValueCopy();
            if (thumb.name === 'thumbLower') {
                value.lower = converted;
            } else {
                value.upper = converted;
            }
            this.setValue(value);
            
            // Update thumb position since value may have been adjusted
            value = this.getValue();
            if (this.thumbLower) this._syncThumbToValue(this.thumbLower, value);
            if (this.thumbUpper) this._syncThumbToValue(this.thumbUpper, value);
            
            this.__lockSync = false;
        }
    },
    
    /** @overrides myt.BaseSlider */
    _nudge: function(thumb, up) {
        var value = this.getValueCopy(),
            adj = this.nudgeAmount * (up ? 1 : -1);
        if (thumb.name === 'thumbLower') {
            value.lower += adj;
            if (value.lower > value.upper) value.lower = value.upper;
        } else {
            value.upper += adj;
            if (value.lower > value.upper) value.upper = value.lower;
        }
        this.setValue(value);
    },
    
    /** Should only be called by myt.SliderThumbMixin.
        @private */
    getMinPixelValueForThumb: function(thumb) {
        return this.convertValueToPixels(
            thumb.name === 'thumbLower' ? this.minValue : this.getValue().lower
        );
    },
    
    /** Should only be called by myt.SliderThumbMixin.
        @private */
    getMaxPixelValueForThumb: function(thumb) {
        return this.convertValueToPixels(
            thumb.name === 'thumbLower' ? this.getValue().upper : this.maxValue
        );
    }
});


((pkg) => {
    var JSClass = JS.Class,
        
        /** Setup the limitToParent constraint. */
        updateLimitToParentConstraint = (divider) => {
            var dim = divider.axis === 'y' ? 'height' : 'width';
            divider.applyConstraint('__limitToParent', [divider, 'limitToParent', divider, dim, divider.parent, dim]);
        },
        
        /** A divider is a UI control that allows the user to resize two area by
            dragging the divider left/right or up/down.
            
            Events:
                limitToParent:number
            
            Attributes:
                axis:string Indicates if the divider should be constrained horizontally
                    or vertically. Allowed values: 'x' or 'y'. This value can only
                    be set during instantiation.
                limitToParent:number If set, this will constrain the maxValue to the
                    appropriate parent view dimension less the limitToParent amount.
                expansionState:number Used by the "primary" action to update the 
                    divider position. Allowed values are:
                        collapsed:0
                        restored just collapsed:1
                        restored just expanded:2
                        expanded:3
                restoreValue:number The value used to restore the position in the
                    "primary" action.
            
            Private Attributes:
                __nudgeAcc:number The multiplier in px per nudge.
        */
        BaseDivider = new JSClass('BaseDivider', pkg.SimpleButton, {
            include: [pkg.BoundedValueComponent, pkg.Draggable],
            
            
            // Life Cycle //////////////////////////////////////////////////////
            initNode: function(parent, attrs) {
                var self = this;
                
                if (attrs.activeColor == null) attrs.activeColor = '#bbbbbb';
                if (attrs.hoverColor == null) attrs.hoverColor = '#dddddd';
                if (attrs.readyColor == null) attrs.readyColor = '#cccccc';
                
                if (attrs.axis == null) attrs.axis = 'x';
                if (attrs.minValue == null) attrs.minValue = 0;
                if (attrs.value == null) attrs.value = attrs.minValue;
                if (attrs.expansionState == null) attrs.expansionState = 2;
                
                if (attrs.focusEmbellishment == null) attrs.focusEmbellishment = false;
                if (attrs.repeatKeyDown == null) attrs.repeatKeyDown = true;
                
                if (attrs.activationKeys == null) {
                    attrs.activationKeys = [
                        37, // left arrow
                        38, // up arrow
                        39, // right arrow
                        40, // down arrow
                        13, // enter
                        32  // spacebar
                    ];
                }
                
                if (attrs.axis === 'y') {
                    if (attrs.height == null) attrs.height = 6;
                    if (attrs.cursor == null) attrs.cursor = 'row-resize';
                } else {
                    if (attrs.width == null) attrs.width = 6;
                    if (attrs.cursor == null) attrs.cursor = 'col-resize';
                }
                
                // Controls acceleration of the nudge amount
                self.__nudgeAcc = 1;
                
                self.callSuper(parent, attrs);
                
                // Do afterwards since value might have been constrained from the
                // value provided in attrs.
                if (attrs.restoreValue == null) self.setRestoreValue(self.value);
                
                if (self.limitToParent != null) updateLimitToParentConstraint(self);
                
                self.attachDomObserver(self, 'doPrimaryAction', 'dblclick');
            },
            
            
            // Accessors ///////////////////////////////////////////////////////
            setExpansionState: function(v) {this.expansionState = v;},
            setRestoreValue: function(v) {this.restoreValue = v;},
            
            setLimitToParent: function(v) {
                var self = this;
                
                if (self.limitToParent !== v) {
                    self.limitToParent = v;
                    if (self.inited) {
                        self.fireEvent('limitToParent', v);
                        
                        if (v == null) {
                            self.releaseConstraint('__limitToParent');
                        } else {
                            updateLimitToParentConstraint(self);
                        }
                    }
                }
            },
            
            setAxis: function(v) {
                if (this.inited) {
                    console.warn("Axis may not be updated after instantiation.");
                } else {
                    this.axis = v;
                }
            },
            
            /** Update the x or y position of the component as the value changes.
                @param restoreValueAlso:boolean (optional) If true, the restoreValue
                    will also be updated.
                @overrides myt.ValueComponent */
            setValue: function(v, restoreValueAlso) {
                this.callSuper(v);
                
                v = this.value;
                if (this.axis === 'y') {
                    this.setY(v);
                } else {
                    this.setX(v);
                }
                
                if (restoreValueAlso) this.setRestoreValue(v);
            },
            
            
            // Methods /////////////////////////////////////////////////////////
            /** Do the limitToParent constraint.
                @private */
            __limitToParent: function(event) {
                var self = this,
                    dim = self.axis === 'y' ? 'height' : 'width';
                self.setMaxValue(self.parent[dim] - self.limitToParent - self[dim]);
            },
            
            /** Nudge the divider when the arrow keys are used. Nudging accelerates
                up to a limit if the key is held down.
                @overrides myt.Button. */
            doActivationKeyDown: function(key, isRepeat) {
                var self = this,
                    dir = 0;
                
                self.callSuper(key, isRepeat);
                
                // Determine nudge direction
                switch (key) {
                    case 37: case 38: dir = -1; break;
                    case 39: case 40: dir = 1; break;
                    case 13: case 32: default:
                        self.doPrimaryAction();
                        return;
                }
                
                // Update nudge amount, but never nudge more than 64.
                self.__nudgeAcc = isRepeat ? Math.min(self.__nudgeAcc + 1, 64) : 1;
                
                self.setValue(self.value + dir * self.__nudgeAcc, true);
                self.setExpansionState(2);
            },
            
            doPrimaryAction: function() {
                var self = this,
                    toValue, 
                    rv = self.restoreValue, 
                    maxV = self.maxValue, 
                    minV = self.minValue;
                switch (self.expansionState) {
                    case 0:
                        if (rv != null) {
                            self.setExpansionState(1);
                            if (rv === minV) {
                                // Prevent infinite loop if there's nowhere to animate to.
                                if (rv !== maxV) self.doPrimaryAction();
                            } else {
                                toValue = rv;
                            }
                        }
                        break;
                    case 1:
                        if (maxV != null) {
                            self.setExpansionState(3);
                            if (self.value === maxV) {
                                self.doPrimaryAction();
                            } else {
                                toValue = maxV;
                            }
                        }
                        break;
                    case 2:
                        if (minV != null) {
                            self.setExpansionState(0);
                            if (self.value === minV) {
                                self.doPrimaryAction();
                            } else {
                                toValue = minV;
                            }
                        }
                        break;
                    case 3:
                        if (rv != null) {
                            self.setExpansionState(2);
                            if (rv === maxV) {
                                self.doPrimaryAction();
                            } else {
                                toValue = rv;
                            }
                        }
                        break;
                }
                if (toValue != null) {
                    self.stopActiveAnimators('value');
                    self.animateOnce('value', toValue, null, 250);
                }
            },
            
            /** Constrain dragging to horizontal or vertical based on axis.
                @overrides myt.Draggable */
            requestDragPosition: function(x, y) {
                if (!this.disabled) {
                    this.setValue(this.axis === 'y' ? y : x, true);
                    this.setExpansionState(2);
                }
            }
        });
    
    /** A divider that moves left/right. */
    pkg.HorizontalDivider = new JSClass('HorizontalDivider', BaseDivider, {
        initNode: function(parent, attrs) {
            attrs.axis = 'x';
            this.callSuper(parent, attrs);
        }
    });
    
    /** A divider that moves left/right. */
    pkg.VerticalDivider = new JSClass('VerticalDivider', BaseDivider, {
        initNode: function(parent, attrs) {
            attrs.axis = 'y';
            this.callSuper(parent, attrs);
        }
    });
})(myt);


/** Makes a view behave as a grid column header.
    
    Events:
        sortable:boolean
        sortState:string
        resizable:boolean
    
    Attributes:
        columnId:string The unique ID for this column relative to the grid it
            is part of.
        gridController:myt.GridController the controller for the grid this
            component is part of.
        flex:number If 1 or more the column will get extra space if any exists.
        resizable:boolean Indicates if this column can be resized or not.
            Defaults to true.
        last:boolean Indicates if this is the last column header or not.
        sortable:boolean Indicates if this column can be sorted or not.
            Defaults to true.
        sortState:string The sort state of this column. Allowed values are:
            'ascending': Sorted in ascending order.
            'descending': Sorted in descending order.
            'none': Not currently an active sort column.
        cellXAdj:number The amount to shift the x values of cells updated by
            this column. Defaults to 0.
        cellWidthAdj:number The amount to grow/shrink the width of cells 
            updated by this column. Defaults to 0.
*/
myt.GridColumnHeader = new JS.Module('GridColumnHeader', {
    include: [myt.BoundedValueComponent],
    
    
    // Class Methods and Attributes ////////////////////////////////////////////
    extend: {
        DEFAULT_MIN_VALUE: 16,
        DEFAULT_MAX_VALUE: 9999
    },
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    initNode: function(parent, attrs) {
        var M = myt,
            GCH = M.GridColumnHeader;
        if (attrs.minValue == null) attrs.minValue = GCH.DEFAULT_MIN_VALUE;
        if (attrs.maxValue == null) attrs.maxValue = GCH.DEFAULT_MAX_VALUE;
        if (attrs.resizable == null) attrs.resizable = true;
        if (attrs.flex == null) attrs.flex = 0;
        if (attrs.cellXAdj == null) attrs.cellXAdj = 0;
        if (attrs.cellWidthAdj == null) attrs.cellWidthAdj = 0;
        
        if (attrs.sortable == null) attrs.sortable = true;
        if (attrs.sortState == null) attrs.sortState = 'none';
        
        // Ensure participation in determinePlacement method of myt.Grid
        if (attrs.placement == null) attrs.placement = '*';
        
        this.callSuper(parent, attrs);
        
        new M.View(this, {
            name:'resizer', cursor:'col-resize', width:10, zIndex:1,
            percentOfParentHeight:100, align:'right', alignOffset:-5,
            draggableAllowBubble:false
        }, [M.SizeToParent, M.Draggable, {
            requestDragPosition: function(x, y) {
                var p = this.parent, gc = p.gridController,
                    diff = x - this.x;
                
                if (gc.fitToWidth) {
                    if (diff > 0) {
                        // Get amount that this header can grow
                        var growAmt = p.maxValue - p.value;
                        // Get amount that can be given on the left
                        var giveLeft = p._getGiveLeft();
                        
                        // Get amount that can be stolen on the right
                        var takeRight = p._getTakeRight();
                        
                        diff = Math.min(diff, Math.min(-takeRight, growAmt + giveLeft));
                    } else if (diff < 0) {
                        // Get amount that this header can shrink
                        var shrinkAmt = p.minValue - p.value;
                        // Get amount that can be stolen on the left
                        var takeLeft = p._getTakeLeft();
                        
                        // Get amount that can be given on the right
                        var giveRight = p._getGiveRight();
                        
                        diff = Math.max(diff, Math.max(-giveRight, shrinkAmt + takeLeft));
                    }
                    
                    if (diff === 0) return;
                }
                
                var newValue = p.value + diff;
                
                if (p.resizable) p.setValue(newValue);
                var remainingDiff = newValue - p.value;
                var stolenAmt = remainingDiff - diff;
                var additionalActualDiff = 0;
                if (remainingDiff < 0) {
                    additionalActualDiff = p._stealPrevWidth(remainingDiff);
                } else if (remainingDiff > 0) {
                    additionalActualDiff = p._givePrevWidth(remainingDiff);
                }
                this.dragInitX += additionalActualDiff;
                stolenAmt -= additionalActualDiff;
                
                if (gc.fitToWidth) {
                    if (stolenAmt < 0) {
                        p._stealNextWidth(stolenAmt);
                    } else if (stolenAmt > 0) {
                        p._giveNextWidth(stolenAmt);
                    }
                }
            }
        }]);
        
        var gc = this.gridController;
        if (gc) {
            gc.notifyAddColumnHeader(this);
            gc.notifyColumnHeaderXChange(this);
            gc.notifyColumnHeaderVisibilityChange(this);
        }
        this.setWidth(this.value);
        this._updateLast();
    },
    
    destroy: function(v) {
        this.setGridController();
        
        this.callSuper(v);
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setSortable: function(v) {this.set('sortable', v, true);},
    setSortState: function(v) {this.set('sortState', v, true);},
    
    setResizable: function(v) {this.set('resizable', v, true);},
    
    setCellWidthAdj: function(v) {this.cellWidthAdj = v;},
    setCellXAdj: function(v) {this.cellXAdj = v;},
    setFlex: function(v) {this.flex = v;},
    setColumnId: function(v) {this.columnId = v;},
    
    setLast: function(v) {
        this.last = v;
        if (this.inited) this._updateLast();
    },
    
    setGridController: function(v) {
        var existing = this.gridController;
        if (existing !== v) {
            if (existing) existing.notifyRemoveColumnHeader(this);
            this.gridController = v;
            if (this.inited && v) {
                v.notifyAddColumnHeader(this);
                v.notifyColumnHeaderXChange(this);
                v.notifyColumnHeaderWidthChange(this);
                v.notifyColumnHeaderVisibilityChange(this);
            }
        }
    },
    
    /** @overrides myt.BoundedValueComponent */
    setValue: function(v) {
        this.callSuper(v);
        if (this.inited) this.setWidth(this.value);
    },
    
    /** @overrides myt.BoundedValueComponent */
    setMinValue: function(v) {
        var self = this,
            oldMinValue = self.minValue || 0, 
            gc = self.gridController;
        self.callSuper(v);
        if (self.inited && gc && oldMinValue !== self.minValue) gc.setMinWidth(gc.minWidth + self.minValue - oldMinValue);
    },
    
    /** @overrides myt.BoundedValueComponent */
    setMaxValue: function(v) {
        var self = this,
            oldMaxValue = self.maxValue || 0,
            gc = self.gridController;
        if (v == null) v = myt.GridColumnHeader.DEFAULT_MAX_VALUE;
        self.callSuper(v);
        if (self.inited && gc && oldMaxValue !== self.maxValue) gc.setMaxWidth(gc.maxWidth + self.maxValue - oldMaxValue);
    },
    
    /** @overrides myt.View */
    setWidth: function(v, supressEvent) {
        var self = this,
            cur = self.width;
        self.callSuper(v, supressEvent);
        if (self.inited && self.gridController && cur !== self.width) self.gridController.notifyColumnHeaderWidthChange(self);
    },
    
    /** @overrides myt.View */
    setX: function(v) {
        var self = this,
            cur = self.x;
        self.callSuper(v);
        if (self.inited && self.gridController && cur !== self.x) self.gridController.notifyColumnHeaderXChange(self);
    },
    
    /** @overrides myt.View */
    setVisible: function(v) {
        var self = this,
            cur = self.visible;
        self.callSuper(v);
        if (self.inited && self.gridController && cur !== self.visible) self.gridController.notifyColumnHeaderVisibilityChange(self);
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    getPrevColumnHeader: function() {
        return this.gridController ? this.gridController.getPrevColumnHeader(this) : null;
    },
    
    getNextColumnHeader: function() {
        return this.gridController ? this.gridController.getNextColumnHeader(this) : null;
    },
    
    /** @private */
    _updateLast: function() {
        this.resizer.setVisible(!(this.last && this.gridController.fitToWidth));
    },
    
    /** Steals width from previous column headers.
        @param diff:number the amount to steal. Will be a negative number.
        @returns number:the amount of width actually stolen. */
    _stealPrevWidth: function(diff) {
        var hdr = this.getPrevColumnHeader(),
            usedDiff = 0;
        if (hdr) {
            var newValue = hdr.value + diff;
            if (hdr.resizable) hdr.setValue(newValue);
            var remainingDiff = newValue - hdr.value;
            usedDiff = diff - remainingDiff;
            if (remainingDiff < 0) usedDiff += hdr._stealPrevWidth(remainingDiff);
        }
        
        return usedDiff;
    },
    
    /** Gives width to previous column headers.
        @param diff:number the amount to give. Will be a positive number.
        @returns number:the amount of width actually given. */
    _givePrevWidth: function(diff) {
        var hdr = this.getPrevColumnHeader(),
            usedDiff = 0;
        if (hdr) {
            var newValue = hdr.value + diff;
            if (hdr.resizable) hdr.setValue(newValue);
            var remainingDiff = newValue - hdr.value;
            usedDiff = diff - remainingDiff;
            if (remainingDiff > 0) usedDiff += hdr._givePrevWidth(remainingDiff);
        }
        
        return usedDiff;
    },
    
    /** Steals width from next column headers.
        @param diff:number the amount to steal. Will be a negative number.
        @returns number:the amount of width actually stolen. */
    _stealNextWidth: function(diff) {
        var hdr = this.getNextColumnHeader();
        if (hdr) {
            var newValue = hdr.value + diff;
            if (hdr.resizable) hdr.setValue(newValue);
            var remainingDiff = newValue - hdr.value;
            if (remainingDiff < 0) hdr._stealNextWidth(remainingDiff);
        }
    },
    
    /** Gives width to next column headers.
        @param diff:number the amount to give. Will be a positive number.
        @returns number:the amount of width actually given. */
    _giveNextWidth: function(diff) {
        var hdr = this.getNextColumnHeader();
        if (hdr) {
            var newValue = hdr.value + diff;
            if (hdr.resizable) hdr.setValue(newValue);
            var remainingDiff = newValue - hdr.value;
            if (remainingDiff > 0) hdr._giveNextWidth(remainingDiff);
        }
    },
    
    _getGiveLeft: function() {
        var hdr = this.getPrevColumnHeader();
        return hdr ? hdr.maxValue - hdr.value + hdr._getGiveLeft() : 0;
    },
    
    _getGiveRight: function() {
        var hdr = this.getNextColumnHeader();
        return hdr ? hdr.maxValue - hdr.value + hdr._getGiveRight() : 0;
    },
    
    _getTakeLeft: function() {
        var hdr = this.getPrevColumnHeader();
        return hdr ? hdr.minValue - hdr.value + hdr._getTakeLeft() : 0;
    },
    
    _getTakeRight: function() {
        var hdr = this.getNextColumnHeader();
        return hdr ? hdr.minValue - hdr.value + hdr._getTakeRight() : 0;
    }
});


/** Makes a view behave as a row in a grid.
    
    Events:
        None
    
    Attributes:
        gridController:myt.GridConstroller A reference to the grid controller
            that is managing this row.
*/
myt.GridRow = new JS.Module('GridRow', {
    // Life Cycle //////////////////////////////////////////////////////////////
    initNode: function(parent, attrs) {
        // Ensure participation in determinePlacement method of myt.Grid
        if (attrs.placement == null) attrs.placement = '*';
        
        this.callSuper(parent, attrs);
        
        var gc = this.gridController;
        if (gc) gc.notifyAddRow(this);
    },
    
    destroy: function(v) {
        this.setGridController();
        
        this.callSuper(v);
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setGridController: function(v) {
        var existing = this.gridController;
        if (existing !== v) {
            if (existing) existing.notifyRemoveRow(this);
            this.gridController = v;
            if (this.inited && v) v.notifyAddRow(this);
        }
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    notifyColumnHeaderXChange: function(columnHeader) {
        var sv = this[columnHeader.columnId + 'View'];
        if (sv) sv.setX(columnHeader.x + columnHeader.cellXAdj);
    },
    
    notifyColumnHeaderWidthChange: function(columnHeader) {
        var sv = this[columnHeader.columnId + 'View'];
        if (sv) sv.setWidth(columnHeader.width + columnHeader.cellWidthAdj);
    },
    
    notifyColumnHeaderVisibilityChange: function(columnHeader) {
        var sv = this[columnHeader.columnId + 'View'];
        if (sv) sv.setVisible(columnHeader.visible);
    }
});


/** Coordinates the behavior of a grid.
    
    Events:
        sort:array
        maxWidth:number
        minWidth:number
    
    Attributes:
        maxWidth:number the sum of the maximum widths of the columns.
        minWidth:number the sum of the minimum widths of the columns.
        gridWidth:number the width of the grid component.
        fitToWidth:boolean determines if the columns will always fill up the
            width of the grid or not. Defaults to true.
        lastColumn:myt.GridColumnHeader Holds a reference to the last
            column header.
        sort:array An array containing the id of the column to sort by and
            the order to sort by.
        locked:boolean Prevents the grid from updating the UI. Defaults to
            true. After a grid has been setup a call should be made to
            setLocked(false)
    
    Private Attributes:
        columnHeaders:array An array of column headers in this grid.
        rows:array An array of rows in this grid.
        __tempLock:boolean Prevents "change" notifications from being processed.
*/
myt.GridController = new JS.Module('GridController', {
    // Life Cycle //////////////////////////////////////////////////////////////
    initNode: function(parent, attrs) {
        var self = this;
        
        self.columnHeaders = [];
        self.rows = [];
        
        self.maxWidth = self.minWidth = self.gridWidth = 0;
        self.fitToWidth = self.locked = true;
        
        self.callSuper(parent, attrs);
        
        self._fitToWidth();
        self._notifyHeadersOfSortState();
        if (!self.locked) self.doSort();
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setSort: function(v) {
        if (!myt.areArraysEqual(v, this.sort)) {
            this.sort = v;
            if (this.inited) {
                this.fireEvent('sort', v);
                this._notifyHeadersOfSortState();
                if (!this.locked) this.doSort();
            }
        }
    },
    
    setLastColumn: function(v) {
        var cur = this.lastColumn;
        if (cur !== v) {
            if (cur) cur.setLast(false);
            this.lastColumn = v;
            if (v) v.setLast(true);
        }
    },
    
    setFitToWidth: function(v) {this.fitToWidth = v;},
    
    setLocked: function(v) {
        this.locked = v;
        if (this.inited && !v) {
            this.__tempLock = true; // Prevent change calls during fitToWidth
            this._fitToWidth();
            this.__tempLock = false;
            
            var hdrs = this.columnHeaders, i = hdrs.length, hdr;
            // Reset min/max since notifyColumnHeaderVisibilityChange will
            // update these values
            this.setMaxWidth(0);
            this.setMinWidth(0);
            while (i) {
                hdr = hdrs[--i];
                this.notifyColumnHeaderXChange(hdr);
                this.notifyColumnHeaderWidthChange(hdr);
                this.notifyColumnHeaderVisibilityChange(hdr);
            }
            
            this.doSort();
        }
    },
    
    setMaxWidth: function(v) {this.set('maxWidth', v, true);},
    setMinWidth: function(v) {this.set('minWidth', v, true);},
    
    setGridWidth: function(v) {
        if (v !== null && typeof v === 'object') v = v.value;
        
        if (this.gridWidth !== v) {
            this.gridWidth = v;
            if (this.inited) this._fitToWidth();
        }
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    _fitToWidth: function() {
        if (this.locked || !this.fitToWidth) return;
        
        var hdrs = this.columnHeaders, len = hdrs.length, i = len, hdr;
        
        // Determine max extent
        var maxExtent = 0, extent;
        while(i) {
            hdr = hdrs[--i];
            if (!hdr.visible) continue;
            extent = hdr.x + hdr.width;
            if (extent > maxExtent) maxExtent = extent;
        }
        
        var extra = this.gridWidth - maxExtent;
        
        if (extra === 0) return;
        var isGrow = extra > 0;
        
        // Get resizable columns
        var resizeInfo = [], limit;
        i = len;
        while(i) {
            hdr = hdrs[--i];
            if (!hdr.visible) continue;
            if (hdr.resizable && hdr.flex > 0) {
                limit = (isGrow ? hdr.maxValue : hdr.minValue) - hdr.value;
                resizeInfo.push({hdr:hdr, limit:limit, amt:0});
            }
        }
        
        // Abort if no resizable flex columns.
        var resizeCount = resizeInfo.length;
        if (resizeCount <= 0) return;
        
        // Calculate resize amounts
        var idx = 0, fullCount = 0, incr, info;
        while (extra !== 0) {
            info = resizeInfo[idx];
            hdr = info.hdr;
            
            if (!info.full) {
                if (isGrow) {
                    incr = Math.min(hdr.flex, extra);
                    if (info.amt + incr > info.limit) {
                        incr = info.limit - info.amt;
                        info.full = true;
                    }
                } else {
                    incr = Math.max(-hdr.flex, extra);
                    if (info.amt + incr < info.limit) {
                        incr = info.limit - info.amt;
                        info.full = true;
                    }
                }
                info.amt += incr;
                extra -= incr;
            } else {
                ++fullCount;
            }
            
            if (fullCount === resizeCount) break;
            
            ++idx;
            if (idx === resizeCount) {
                idx = 0;
                fullCount = 0;
            }
        }
        
        // Distribute amounts
        i = resizeCount;
        while (i) {
            info = resizeInfo[--i];
            hdr = info.hdr;
            hdr.setValue(hdr.value + info.amt);
        }
        
        // Distribute remaing extra to resizable non-flex columns
        if (extra !== 0) {
            // Get resizable columns
            resizeInfo = [];
            i = len;
            while(i) {
                hdr = hdrs[--i];
                if (!hdr.visible) continue;
                if (hdr.resizable && hdr.flex === 0) {
                    limit = (isGrow ? hdr.maxValue : hdr.minValue) - hdr.value;
                    resizeInfo.push({hdr:hdr, limit:limit, amt:0});
                }
            }
            
            // Abort if no resizable columns.
            resizeCount = resizeInfo.length;
            if (resizeCount <= 0) return;
            
            // Calculate resize amounts
            idx = 0;
            fullCount = 0;
            while (extra !== 0) {
                info = resizeInfo[idx];
                hdr = info.hdr;
                
                if (!info.full) {
                    if (isGrow) {
                        incr = Math.min(1, extra);
                        if (info.amt + incr > info.limit) {
                            incr = info.limit - info.amt;
                            info.full = true;
                        }
                    } else {
                        incr = Math.max(-1, extra);
                        if (info.amt + incr < info.limit) {
                            incr = info.limit - info.amt;
                            info.full = true;
                        }
                    }
                    info.amt += incr;
                    extra -= incr;
                } else {
                    ++fullCount;
                }
                
                if (fullCount === resizeCount) break;
                
                ++idx;
                if (idx === resizeCount) {
                    idx = 0;
                    fullCount = 0;
                }
            }
            
            // Distribute amounts
            i = resizeCount;
            while (i) {
                info = resizeInfo[--i];
                hdr = info.hdr;
                hdr.setValue(hdr.value + info.amt);
            }
        }
    },
    
    // Sorting
    _notifyHeadersOfSortState: function() {
        var hdrs = this.columnHeaders, i = hdrs.length, hdr,
            sort = this.sort,
            sortColumnId = sort ? sort[0] : '',
            sortOrder = sort ? sort[1] : '';
        while (i) {
            hdr = hdrs[--i];
            if (hdr.columnId === sortColumnId) {
                if (hdr.sortable) hdr.setSortState(sortOrder);
            } else {
                hdr.setSortState('none');
            }
        }
    },
    
    /** Sorts the rows according to the current sort criteria. Subclasses and
        instances should implement this as needed.
        @returns void */
    doSort: function() {},
    
    // Column Headers
    /** Gets the column header before the provided one.
        @returns myt.GridColumnHeader or null if none exists. */
    getPrevColumnHeader: function(columnHeader) {
        var hdr,
            hdrs = this.columnHeaders,
            idx = this.getColumnHeaderIndex(columnHeader);
        if (idx > 0) {
            while (idx) {
                hdr = hdrs[--idx];
                if (hdr.visible) return hdr;
            }
        }
        return null;
    },
    
    /** Gets the column header after the provided one.
        @returns myt.GridColumnHeader or null if none exists. */
    getNextColumnHeader: function(columnHeader) {
        var hdr,
            hdrs = this.columnHeaders,
            len = hdrs.length,
            idx = this.getColumnHeaderIndex(columnHeader) + 1;
        if (idx > 0 && idx < len) {
            for (; len > idx; idx++) {
                hdr = hdrs[idx];
                if (hdr.visible) return hdr;
            }
        }
        return null;
    },
    
    /** @private */
    _findLastColumn: function() {
        var hdrs = this.columnHeaders,
            i = hdrs.length,
            hdr;
        while (i) {
            hdr = hdrs[--i];
            if (hdr.visible) return hdr;
        }
        return null;
    },
    
    hasColumnHeader: function(columnHeader) {
        return this.getColumnHeaderIndex(columnHeader) !== -1;
    },
    
    getColumnHeaderIndex: function(columnHeader) {
        return this.columnHeaders.indexOf(columnHeader);
    },
    
    getColumnHeaderById: function(columnId) {
        var hdrs = this.columnHeaders,
            i = hdrs.length,
            hdr;
        while (i) {
            hdr = hdrs[--i];
            if (hdr.columnId === columnId) return hdr;
        }
        return null;
    },
    
    notifyAddColumnHeader: function(columnHeader) {
        if (!this.hasColumnHeader(columnHeader)) {
            this.columnHeaders.push(columnHeader);
            if (columnHeader.visible) this.setLastColumn(columnHeader);
        }
    },
    
    notifyRemoveColumnHeader: function(columnHeader) {
        var idx = this.getColumnHeaderIndex(columnHeader);
        if (idx >= 0) {
            this.columnHeaders.splice(idx, 1);
            if (columnHeader.visible && columnHeader.last) this.setLastColumn(this.getPrevColumnHeader(columnHeader));
        }
    },
    
    notifyColumnHeaderXChange: function(columnHeader) {
        if (this.locked || this.__tempLock) return;
        var rows = this.rows, i = rows.length;
        while (i) rows[--i].notifyColumnHeaderXChange(columnHeader);
    },
    
    notifyColumnHeaderWidthChange: function(columnHeader) {
        if (this.locked || this.__tempLock) return;
        var rows = this.rows, i = rows.length;
        while (i) rows[--i].notifyColumnHeaderWidthChange(columnHeader);
    },
    
    notifyColumnHeaderVisibilityChange: function(columnHeader) {
        if (this.locked || this.__tempLock) return;
        
        var rows = this.rows, 
            i = rows.length;
        while (i) rows[--i].notifyColumnHeaderVisibilityChange(columnHeader);
        
        this.setLastColumn(this._findLastColumn());
        if (columnHeader.visible) {
            this.setMaxWidth(this.maxWidth + columnHeader.maxValue);
            this.setMinWidth(this.minWidth + columnHeader.minValue);
        } else {
            this.setMaxWidth(this.maxWidth - columnHeader.maxValue);
            this.setMinWidth(this.minWidth - columnHeader.minValue);
        }
        this._fitToWidth();
    },
    
    // Rows
    hasRow: function(row) {
        return this.getRowIndex(row) !== -1;
    },
    
    getRowIndex: function(row) {
        return this.rows.indexOf(row);
    },
    
    notifyAddRow: function(row) {
        if (!this.hasRow(row)) {
            this.rows.push(row);
            
            // Update cell positions
            if (!this.locked) {
                var hdrs = this.columnHeaders, i = hdrs.length, hdr;
                while (i) {
                    hdr = hdrs[--i];
                    row.notifyColumnHeaderXChange(hdr);
                    row.notifyColumnHeaderWidthChange(hdr);
                    row.notifyColumnHeaderVisibilityChange(hdr);
                }
                
                this.doSort();
            }
        }
    },
    
    notifyRemoveRow: function(row) {
        var idx = this.getRowIndex(row);
        if (idx >= 0) this.rows.splice(idx, 1);
    }
});


/** An implementation of a grid component.
    
    Events:
        None
    
    Attributes:
        rowSpacing:number The spacing between rows. Defaults to 1.
        columnSpacing:number the spacing between columns. Defaults to 1.
        sizeHeightToRows:boolean If true, this component will be sized to fit
            all the rows without showing scrollbars. Defaults to undefined
            which is equivalent to false.
*/
myt.Grid = new JS.Class('Grid', myt.View, {
    include: [myt.GridController],
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides myt.View */
    initNode: function(parent, attrs) {
        // Allows horizontal scrolling if the grid columns are too wide.
        if (attrs.overflow == null) attrs.overflow = 'autox';
        
        if (attrs.bgColor == null) attrs.bgColor = '#cccccc';
        if (attrs.rowSpacing == null) attrs.rowSpacing = 1;
        if (attrs.columnSpacing == null) attrs.columnSpacing = 1;
        
        this.callSuper(parent, attrs);
    },
    
    /** @overrides myt.View */
    doAfterAdoption: function() {
        var self = this,
            M = myt,
            V = M.View,
            SL = M.SpacedLayout,
            sizeHeightToRows = self.sizeHeightToRows;
        
        var header = new V(self, {name:'header', overflow:'hidden'});
        new SL(header, {
            name:'xLayout', locked:true, collapseParent:true, 
            spacing:self.columnSpacing
        });
        new M.SizeToChildren(header, {name:'yLayout', locked:true, axis:'y'});
        
        var content = new V(self, {
            name:'content', 
            overflow:sizeHeightToRows ? 'hidden' : 'autoy'
        });
        new SL(content, {
            name:'yLayout', locked:true, axis:'y', spacing:self.rowSpacing,
            collapseParent:sizeHeightToRows
        });
        
        self.syncTo(self, 'setGridWidth', 'width');
        self.syncTo(header, '_updateContentWidth', 'width');
        
        self.applyConstraint('_updateContentHeight', [
            sizeHeightToRows ? content : self, 'height', 
            header, 'height', 
            header, 'y'
        ]);
        
        self.callSuper();
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setSizeHeightToRows: function(v) {this.sizeHeightToRows = v;},
    
    setRowSpacing: function(v) {
        if (this.rowSpacing !== v) {
            this.rowSpacing = v;
            if (this.inited) this.content.yLayout.setSpacing(v);
        }
    },
    
    setColumnSpacing: function(v) {
        if (this.columnSpacing !== v) {
            this.columnSpacing = v;
            if (this.inited) this.header.xLayout.setSpacing(v);
        }
    },
    
    /** @overrides myt.GridController */
    setLocked: function(v) {
        // Performance: don't update layouts until the grid is unlocked.
        if (this.inited) {
            var header = this.header,
                headerXLayout = header.xLayout,
                headerYLayout = header.yLayout,
                contentYLayout = this.content.yLayout;
            if (v) {
                headerXLayout.incrementLockedCounter();
                headerYLayout.incrementLockedCounter();
                contentYLayout.incrementLockedCounter();
            } else {
                headerXLayout.decrementLockedCounter();
                headerXLayout.update();
                headerYLayout.decrementLockedCounter();
                headerYLayout.update();
                contentYLayout.decrementLockedCounter();
                contentYLayout.update();
            }
        }
        
        this.callSuper(v);
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    _updateContentWidth: function(event) {
        this.content.setWidth(event.value);
    },
    
    _updateContentHeight: function(event) {
        var self = this,
            header = self.header, 
            content = self.content,
            y = header.y + header.height;
        content.setY(y);
        
        if (self.sizeHeightToRows) {
            self.setHeight(y + content.height);
        } else {
            content.setHeight(self.height - y);
        }
    },
    
    /** @overrides myt.Node */
    determinePlacement: function(placement, subnode) {
        // Automatically place column headers and rows in the header and
        // content views respectively.
        if (placement === '*') {
            var target;
            if (subnode.isA(myt.GridRow)) {
                target = this.content;
            } else if (subnode.isA(myt.GridColumnHeader)) {
                target = this.header;
            }
            
            if (target) {
                if (subnode.gridController !== this) subnode.setGridController(this);
                return target;
            }
        }
        
        return this.callSuper(placement, subnode);
    },
    
    /** @overrides myt.GridController */
    doSort: function() {
        var sort = this.sort || ['',''],
            sortFunc = this.getSortFunction(sort[0], sort[1]);
        if (sortFunc) {
            var content = this.content, 
                yLayout = content.yLayout;
            this.rows.sort(sortFunc);
            content.sortSubviews(sortFunc);
            yLayout.sortSubviews(sortFunc);
            yLayout.update();
        }
    },
    
    /** Gets the sort function used to sort the rows. Subclasses and instances
        should implement this as needed.
        @returns function a comparator function used for sorting. */
    getSortFunction: function(sortColumnId, sortOrder) {
        if (sortColumnId) {
            // Default sort function uses the 'text' attribute of the subview.
            var sortNum = sortOrder === 'ascending' ? 1 : -1,
                columnName = sortColumnId + 'View';
            return function(a, b) {
                var aValue = a[columnName].text,
                    bValue = b[columnName].text;
                if (aValue > bValue) {
                    return sortNum;
                } else if (bValue > aValue) {
                    return -sortNum;
                }
                return 0;
            };
        }
    }
});


/** An adapter for FontAwesome.
    
    Attributes:
        icon:string The name of the FA icon to set.
        size:number A number from 0 to 5 with 0 being normal size and 5 being
            the largest size.
        propeties:string || array A space separated string or list of FA
            CSS classes to set.
*/
myt.FontAwesome = new JS.Class('FontAwesome', myt.Markup, {
    // Class Methods and Attributes ////////////////////////////////////////////
    extend: {
        FA_SIZE_CLASSES: ['','fa-lg','fa-2x','fa-3x','fa-4x','fa-5x'],
        
        makeTag: function(props) {
            if (Array.isArray(props)) {
                var len = props.length;
                if (len > 0) {
                    props.unshift('fa');
                    ++len;
                    
                    if (props[1].indexOf('fa-') !== 0) props[1] = 'fa-' + props[1];
                    
                    if (len >= 3) props[2] = this.FA_SIZE_CLASSES[props[2]] || '';
                    
                    if (len > 3) {
                        var prop, i = 3;
                        for (; len > i; ++i) {
                            prop = props[i];
                            if (prop.indexOf('fa-') !== 0) props[i] = 'fa-' + prop;
                        }
                    }
                    
                    return '<i class="' + props.join(' ') + '"></i>';
                }
            }
            
            myt.dumpStack('Error making tag');
            console.error(props);
            return '';
        },
        
        targets: [],
        active: false,
        
        registerForNotification: function(fa) {
            if (!this.active) this.targets.push(fa);
        },
        
        notifyActive: function(active) {
            this.active = active;
            if (active) {
                var targets = this.targets;
                while (targets.length) targets.pop().sizeViewToDom();
            }
        }
    },
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides myt.View */
    initNode: function(parent, attrs) {
        this.size = 0;
        this.icon = '';
        
        this.callSuper(parent, attrs);
        
        this.__update();
        
        myt.FontAwesome.registerForNotification(this);
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setIcon: function(v) {
        var existing = this.icon;
        this.set('icon', v, true);
        if (this.inited && existing !== v) this.__update();
    },
    
    setSize: function(v) {
        var existing = this.size;
        this.set('size', v, true);
        if (this.inited && existing !== v) this.__update();
    },
    
    setProperties: function(v) {
        this.properties = v;
        this.fireEvent('properties', v);
        if (this.inited) this.__update();
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** @private */
    __update: function() {
        var props = this.properties;
        if (props) {
            if (typeof props === 'string') {
                props = props.split(' ');
            } else {
                props = props.concat();
            }
            props.unshift(this.size);
            props.unshift(this.icon);
        } else {
            props = [this.icon, this.size];
        }
        
        this.setHtml(myt.FontAwesome.makeTag(props));
    }
});

/* Font Face Observer v2.1.0 - © Bram Stein. License: BSD-3-Clause */(function(){function l(a,b){document.addEventListener?a.addEventListener("scroll",b,!1):a.attachEvent("scroll",b)}function m(a){document.body?a():document.addEventListener?document.addEventListener("DOMContentLoaded",function c(){document.removeEventListener("DOMContentLoaded",c);a()}):document.attachEvent("onreadystatechange",function k(){if("interactive"==document.readyState||"complete"==document.readyState)document.detachEvent("onreadystatechange",k),a()})};function t(a){this.a=document.createElement("div");this.a.setAttribute("aria-hidden","true");this.a.appendChild(document.createTextNode(a));this.b=document.createElement("span");this.c=document.createElement("span");this.h=document.createElement("span");this.f=document.createElement("span");this.g=-1;this.b.style.cssText="max-width:none;display:inline-block;position:absolute;height:100%;width:100%;overflow:scroll;font-size:16px;";this.c.style.cssText="max-width:none;display:inline-block;position:absolute;height:100%;width:100%;overflow:scroll;font-size:16px;";
this.f.style.cssText="max-width:none;display:inline-block;position:absolute;height:100%;width:100%;overflow:scroll;font-size:16px;";this.h.style.cssText="display:inline-block;width:200%;height:200%;font-size:16px;max-width:none;";this.b.appendChild(this.h);this.c.appendChild(this.f);this.a.appendChild(this.b);this.a.appendChild(this.c)}
function u(a,b){a.a.style.cssText="max-width:none;min-width:20px;min-height:20px;display:inline-block;overflow:hidden;position:absolute;width:auto;margin:0;padding:0;top:-999px;white-space:nowrap;font-synthesis:none;font:"+b+";"}function z(a){var b=a.a.offsetWidth,c=b+100;a.f.style.width=c+"px";a.c.scrollLeft=c;a.b.scrollLeft=a.b.scrollWidth+100;return a.g!==b?(a.g=b,!0):!1}function A(a,b){function c(){var a=k;z(a)&&a.a.parentNode&&b(a.g)}var k=a;l(a.b,c);l(a.c,c);z(a)};function B(a,b){var c=b||{};this.family=a;this.style=c.style||"normal";this.weight=c.weight||"normal";this.stretch=c.stretch||"normal"}var C=null,D=null,E=null,F=null;function G(){if(null===D)if(J()&&/Apple/.test(window.navigator.vendor)){var a=/AppleWebKit\/([0-9]+)(?:\.([0-9]+))(?:\.([0-9]+))/.exec(window.navigator.userAgent);D=!!a&&603>parseInt(a[1],10)}else D=!1;return D}function J(){null===F&&(F=!!document.fonts);return F}
function K(){if(null===E){var a=document.createElement("div");try{a.style.font="condensed 100px sans-serif"}catch(b){}E=""!==a.style.font}return E}function L(a,b){return[a.style,a.weight,K()?a.stretch:"","100px",b].join(" ")}
B.prototype.load=function(a,b){var c=this,k=a||"BESbswy",r=0,n=b||3E3,H=(new Date).getTime();return new Promise(function(a,b){if(J()&&!G()){var M=new Promise(function(a,b){function e(){(new Date).getTime()-H>=n?b(Error(""+n+"ms timeout exceeded")):document.fonts.load(L(c,'"'+c.family+'"'),k).then(function(c){1<=c.length?a():setTimeout(e,25)},b)}e()}),N=new Promise(function(a,c){r=setTimeout(function(){c(Error(""+n+"ms timeout exceeded"))},n)});Promise.race([N,M]).then(function(){clearTimeout(r);a(c)},
b)}else m(function(){function v(){var b;if(b=-1!=f&&-1!=g||-1!=f&&-1!=h||-1!=g&&-1!=h)(b=f!=g&&f!=h&&g!=h)||(null===C&&(b=/AppleWebKit\/([0-9]+)(?:\.([0-9]+))/.exec(window.navigator.userAgent),C=!!b&&(536>parseInt(b[1],10)||536===parseInt(b[1],10)&&11>=parseInt(b[2],10))),b=C&&(f==w&&g==w&&h==w||f==x&&g==x&&h==x||f==y&&g==y&&h==y)),b=!b;b&&(d.parentNode&&d.parentNode.removeChild(d),clearTimeout(r),a(c))}function I(){if((new Date).getTime()-H>=n)d.parentNode&&d.parentNode.removeChild(d),b(Error(""+
n+"ms timeout exceeded"));else{var a=document.hidden;if(!0===a||void 0===a)f=e.a.offsetWidth,g=p.a.offsetWidth,h=q.a.offsetWidth,v();r=setTimeout(I,50)}}var e=new t(k),p=new t(k),q=new t(k),f=-1,g=-1,h=-1,w=-1,x=-1,y=-1,d=document.createElement("div");d.dir="ltr";u(e,L(c,"sans-serif"));u(p,L(c,"serif"));u(q,L(c,"monospace"));d.appendChild(e.a);d.appendChild(p.a);d.appendChild(q.a);document.body.appendChild(d);w=e.a.offsetWidth;x=p.a.offsetWidth;y=q.a.offsetWidth;I();A(e,function(a){f=a;v()});u(e,
L(c,'"'+c.family+'",sans-serif'));A(p,function(a){g=a;v()});u(p,L(c,'"'+c.family+'",serif'));A(q,function(a){h=a;v()});u(q,L(c,'"'+c.family+'",monospace'))})})};"object"===typeof module?module.exports=B:(window.FontFaceObserver=B,window.FontFaceObserver.prototype.load=B.prototype.load);}());

(new FontFaceObserver('Font Awesome\ 5 Free')).load('\uf00c\uf000').then(
    () => {
        // A timeout seems to be necessary to correctly measure the height of
        // the dom elements after the font has been loaded.
        setTimeout(() => {
            myt.FontAwesome.notifyActive(true);
        }, 100);
    }
);
myt.loadCSSFonts(['//use.fontawesome.com/releases/v5.0.8/css/all.css']);


/** A simple implementation of a grid column header.
    
    Attributes:
        sortIconColor:color the color to fill the sort icon with if shown.
            Defaults to '#666666'.
*/
myt.SimpleGridColumnHeader = new JS.Class('SimpleGridColumnHeader', myt.SimpleIconTextButton, {
    include: [myt.GridColumnHeader],
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides myt.View */
    initNode: function(parent, attrs) {
        if (attrs.activeColor == null) attrs.activeColor = '#999999';
        if (attrs.hoverColor == null) attrs.hoverColor = '#bbbbbb';
        if (attrs.readyColor == null) attrs.readyColor = '#aaaaaa';
        if (attrs.inset == null) attrs.inset = 2;
        if (attrs.outset == null) attrs.outset = 2;
        
        if (attrs.height == null) attrs.height = 18;
        
        if (attrs.contentAlign == null) attrs.contentAlign = 'left';
        if (attrs.sortIconColor == null) attrs.sortIconColor = '#666666';
        
        this.callSuper(parent, attrs);
        
        this.setDisabled(!this.sortable);
        this._updateTextWidth();
        this._updateSortIcon();
    },
    
    /** @overrides myt.View */
    doAfterAdoption: function() {
        new myt.FontAwesome(this, {
            name:'sortIcon', align:'right', alignOffset:3, valign:'middle',
            textColor:this.sortIconColor
        }, [{
            initNode: function(parent, attrs) {
                this.callSuper(parent, attrs);
                this.deStyle.fontSize = '0.7em'; // Looks better a bit smaller.
            },
            
            sizeViewToDom:function() {
                this.callSuper();
                
                var p = this.parent;
                p.setOutset(this.width + 2);
                p._updateTextWidth();
            }
        }]);
        
        this.callSuper();
        
        this.textView.enableEllipsis();
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setSortIconColor: function(v) {
        this.sortIconColor = v;
        if (this.sortIcon) this.sortIcon.setTextColor(v);
    },
    
    /** @overrides myt.GridColumnHeader */
    setSortable: function(v) {
        this.callSuper(v);
        
        if (this.inited) {
            if (v) this.setOutset(14);
            this.setDisabled(!v);
            this._updateSortIcon();
        }
    },
    
    /** @overrides myt.GridColumnHeader */
    setSortState: function(v) {
        this.callSuper(v);
        
        if (this.inited) this._updateSortIcon();
    },
    
    /** @overrides myt.View */
    setWidth: function(v, supressEvent) {
        this.callSuper(v, supressEvent);
        
        if (this.inited) this._updateTextWidth();
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** @private */
    _updateSortIcon: function() {
        var glyph = '';
        if (this.sortable) {
            switch (this.sortState) {
                case 'ascending':
                    glyph = 'chevron-up';
                    break;
                case 'descending':
                    glyph = 'chevron-down';
                    break;
            }
        }
        this.sortIcon.setIcon(glyph);
    },
    
    /** @private */
    _updateTextWidth: function() {
        if (this.contentAlign === 'left') {
            var tv = this.textView;
            if (tv) tv.setWidth(this.width - this.outset - tv.x);
        }
    },
    
    doActivated: function() {
        if (!this.disabled) {
            switch (this.sortState) {
                case 'ascending': this.setSortState('descending'); break;
                case 'descending': this.setSortState('ascending'); break;
                case 'none': this.setSortState('ascending'); break;
            }
            this.gridController.setSort([this.columnId, this.sortState]);
        }
    },
    
    /** @overrides myt.SimpleButton */
    drawDisabledState: function() {
        this.setBgColor(this.readyColor);
    },
    
    /** @overrides myt.Button */
    showFocusEmbellishment: function() {this.hideDefaultFocusEmbellishment();},
    
    /** @overrides myt.Button */
    hideFocusEmbellishment: function() {this.hideDefaultFocusEmbellishment();}
});


/** A mixin for rows in infinite scrolling lists
    
    Events:
        None
    
    Attributes:
        None
    
    Private Attributes:
        None
*/
myt.InfiniteListRow = new JS.Module('InfiniteListRow', {
    include: [myt.Reusable],
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setInfiniteOwner: function(v) {
        this.infiniteOwner = v;
    },
    
    setModel: function(model) {
        this.model = model;
    }
});


/** A base class for infinite scrolling lists
    
    Events:
        None
    
    Attributes:
        collectionModel
        rowClass
        modelIDName
        numericSort
        ascendingSort
        rowHeight
        rowInset
        rowOutset
        rowSpacing
    
    Private Attributes:
        _listData:array The data for the rows in the list.
        _startIdx:int The index into the data of the first row shown
        _endIdx:int The index into the data of the last row shown
        _visibleRowsByIdx:object A cache of what rows are currently shown by
            the index of the data for the row. This is provides faster
            performance when refreshing the list.
        _listView:myt.View The view that contains the rows in the list.
        _itemPool:myt.TrackActivesPool The pool for row views.
*/
myt.InfiniteList = new JS.Class('InfiniteList', myt.View, {
    // Class Methods and Attributes ////////////////////////////////////////////
    extend: {
        DEFAULT_ROW_SPACING:1,
        DEFAULT_ROW_HEIGHT:30,
        DEFAULT_ROW_INSET:0,
        DEFAULT_ROW_OUTSET:0,
        DEFAULT_BG_COLOR:'#cccccc',
    },
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    initNode: function(parent, attrs) {
        var self = this,
            M = myt,
            IL = M.InfiniteList,
            rowClass = attrs.rowClass;
        delete attrs.rowClass;
        
        if (attrs.modelIDName == null) attrs.modelIDName = 'id';
        if (attrs.numericSort == null) attrs.numericSort = true;
        if (attrs.ascendingSort == null) attrs.ascendingSort = true;
        if (attrs.overflow == null) attrs.overflow = 'autoy';
        
        if (attrs.bgColor == null) attrs.bgColor = IL.DEFAULT_BG_COLOR;
        if (attrs.rowSpacing == null) attrs.rowSpacing = IL.DEFAULT_ROW_SPACING;
        if (attrs.rowInset == null) attrs.rowInset = IL.DEFAULT_ROW_INSET;
        if (attrs.rowOutset == null) attrs.rowOutset = IL.DEFAULT_ROW_OUTSET;
        if (attrs.rowHeight == null) attrs.rowHeight = IL.DEFAULT_ROW_HEIGHT;
        
        self._rowExtent = self.rowSpacing = self.rowHeight = 
            self._startIdx = self._endIdx = 0;
        
        self.callSuper(parent, attrs);
        
        self.getInnerDomStyle().overscrollBehavior = 'contain';
        
        // Build UI
        var listView = self._listView = new M.View(self);
        self._scrollAnchorView = new M.View(listView, {width:1, height:1, bgColor:'transparent'});
        self._itemPool = new M.TrackActivesPool(rowClass, listView);
        
        self.attachTo(self, 'refreshListUI', 'height');
        self.attachToDom(self, '_handleScrollChange', 'scroll');
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setCollectionModel: function(v) {this.collectionModel = v;},
    setModelIDName: function(v) {this.modelIDName = v;},
    setRowSpacing: function(v) {
        this.rowSpacing = v;
        this._updateRowExtent();
    },
    setRowHeight: function(v) {
        this.rowHeight = v;
        this._updateRowExtent();
    },
    
    getListData: function() {return this._listData;},
    
    /** @private */
    _updateRowExtent: function() {
        this._rowExtent = this.rowSpacing + this.rowHeight;
    },
    
    setWidth: function(v, supressEvent) {
        if (v > 0) {
            this.callSuper(v, supressEvent);
            if (this.inited) {
                var listView = this._listView,
                    w = this.width;
                listView.setWidth(w);
                listView.getSubviews().forEach(sv => {sv.setWidth(w);});
            }
        }
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** @private */
    _getDomScrollTop: function() {
        return this.getInnerDomElement().scrollTop;
    },
    
    /** @private */
    _setDomScrollTop: function(v) {
        this.getInnerDomElement().scrollTop = v;
    },
    
    isScrolledToEnd: function() {
        return this._getDomScrollTop() + this.height === this._listView.height;
    },
    
    getSortFunction: function() {
        // Default to a numeric sort on the IDs
        var modelIDName = this.modelIDName,
            asc = this.ascendingSort ? 1 : -1;
        if (this.numericSort) {
            return (a, b) => (a[modelIDName] - b[modelIDName]) * asc;
        } else {
            return (a, b) => {
                a = a[modelIDName];
                b = b[modelIDName];
                return (a > b ? 1 : (a < b ? -1 : 0)) * asc;
            }
        }
    },
    
    getFilterFunction: function() {
        // Unimplemented which means don't filter anything out.
    },
    
    scrollModelIntoView: function(model) {
        var self = this,
            idx = self.getIndexOfModelInData(model),
            rowExtent = self._rowExtent,
            viewportTop,
            viewportBottom,
            rowTop,
            rowBottom;
        if (idx >= 0) {
            viewportTop = self._getDomScrollTop();
            viewportBottom = viewportTop + self.height;
            rowTop = self.rowInset + idx * rowExtent;
            rowBottom = rowTop + rowExtent;
            
            // Only scroll if not overlapping visible area.
            if (rowTop <= viewportTop) {
                self._setDomScrollTop(rowTop);
                return true;
            } else if (rowBottom >= viewportBottom) {
                self._setDomScrollTop(rowBottom - self.height);
                return true;
            }
        }
        
        return false;
    },
    
    isModelInData: function(model) {
        return this.getIndexOfModelInData(model) !== -1;
    },
    
    getNextModel: function(model, wrap=true, alwaysReturnAModel=true) {
        var data = this.getListData(),
            len = data.length,
            idx = this.getIndexOfModelInData(model);
        if (idx >= 0) {
            idx += 1;
            if (idx >= len) {
                return wrap ? data[0] : data[len - 1];
            } else {
                return data[idx];
            }
        } else {
            // Return last model for no result if so indicated
            if (alwaysReturnAModel && len > 0) return data[len - 1];
        }
    },
    
    getPrevModel: function(model, wrap=true, alwaysReturnAModel=true) {
        var data = this.getListData(),
            len = data.length,
            idx = this.getIndexOfModelInData(model);
        if (idx >= 0) {
            idx -= 1;
            if (idx < 0) {
                return wrap ? data[len - 1] : data[0];
            } else {
                return data[idx];
            }
        } else {
            // Return first model for no result if so indicated
            if (alwaysReturnAModel && len > 0) return data[0];
        }
    },
    
    getIndexOfModelInData: function(model) {
        if (model) {
            var self = this,
                modelIDName = self.modelIDName,
                modelId = model[modelIDName],
                data = self.getListData(),
                i = data.length;
            while (i) if (data[--i][modelIDName] === modelId) return i;
        }
        return -1;
    },
    
    getActiveRowForModel: function(model) {
        var activeRows = this._itemPool.getActives(),
            i = activeRows.length,
            row;
        while (i) {
            row = activeRows[--i];
            if (row.model === model) return row;
        }
    },
    
    /** @private */
    _handleScrollChange: function(event) {
        this.refreshListUI();
    },
    
    refreshListData: function(preserveScroll) {
        this._listData = this.fetchListData();
        this.resetListUI(preserveScroll);
    },
    
    fetchListData: function() {
        return this.collectionModel.getAsSortedList(this.getSortFunction(), this.getFilterFunction());
    },
    
    resetListUI: function(preserveScroll) {
        var self = this,
            data = self.getListData(),
            len = data.length,
            i,
            visibleRowsByIdx = self._visibleRowsByIdx,
            pool = self._itemPool,
            listView = self._listView,
            scrollAnchorView = self._scrollAnchorView;
        
        // Resize the listView to the height to accomodate all rows
        listView.setHeight(len * self._rowExtent - (len > 0 ? self.rowSpacing : 0) + self.rowInset + self.rowOutset);
        scrollAnchorView.setY(listView.height - scrollAnchorView.height);
        
        // Clear out existing rows
        self._startIdx = self._endIdx = 0;
        for (i in visibleRowsByIdx) self.putRowBackInPool(visibleRowsByIdx[i]);
        self._visibleRowsByIdx = {};
        
        // Reset scroll position
        if (preserveScroll || self._getDomScrollTop() === 0) {
            // Just refresh since we won't move the scroll position
            self.refreshListUI();
        } else {
            // Updating the scroll position triggers a refreshListUI 
            // via _handleScrollChange
            self._setDomScrollTop(0);
        }
    },
    
    putRowBackInPool: function(row) {
        row.setVisible(false);
        this._itemPool.putInstance(row);
    },
    
    refreshListUI: function() {
        var self = this,
            startIdx,
            endIdx,
            scrollY = self._getDomScrollTop(),
            data = self.getListData() || [],
            visibleRowsByIdx = self._visibleRowsByIdx,
            pool = self._itemPool,
            row,
            rowWidth = self.width,
            rowHeight = self.rowHeight,
            rowExtent = self._rowExtent,
            rowInset = self.rowInset,
            i;
        
        startIdx = Math.max(0, Math.floor((scrollY - rowInset) / rowExtent));
        endIdx = Math.min(data.length, Math.ceil((scrollY - rowInset + self.height) / rowExtent));
        
        if (self._startIdx !== startIdx || self._endIdx !== endIdx) {
            self._startIdx = startIdx;
            self._endIdx = endIdx;
            
            // Put all visible rows that are not within the idx range back 
            // into the pool
            for (i in visibleRowsByIdx) {
                if (i < startIdx || i >= endIdx) {
                    self.putRowBackInPool(visibleRowsByIdx[i])
                    delete visibleRowsByIdx[i];
                }
            }
            
            for (i = startIdx; i < endIdx; i++) {
                row = visibleRowsByIdx[i];
                
                if (!row) {
                    row = pool.getInstance();
                    
                    row.setWidth(rowWidth);
                    row.setHeight(rowHeight);
                    row.setY(rowInset + i * rowExtent);
                    row.setModel(data[i]);
                    row.setInfiniteOwner(self);
                    row.setVisible(true);
                    
                    visibleRowsByIdx[i] = row;
                }
                
                // Maintain tab ordering by updating the underlying dom order.
                row.bringToFront();
            }
        }
        
        self.doAfterListRefresh();
    },
    
    doAfterListRefresh: function() {}
});


/** A mixin for rows in infinite scrolling lists
    
    Events:
        None
    
    Attributes:
        None
    
    Private Attributes:
        None
*/
myt.SelectableInfiniteListRow = new JS.Module('SelectableInfiniteListRow', {
    include: [myt.InfiniteListRow, myt.Selectable]
});


/** A base class for infinite scrolling lists that support a selectable row.
    
    Events:
        None
    
    Attributes:
        selectedRow
        selectedRowModel
    
    Private Attributes:
        None
*/
myt.SelectableInfiniteList = new JS.Class('SelectableInfiniteList', myt.InfiniteList, {
    // Accessors ///////////////////////////////////////////////////////////////
    setSelectedRow: function(row) {
        var existing = this.selectedRow;
        if (row !== existing) {
            if (existing) existing.setSelected(false);
            this.setSelectedRowModel();
            this.set('selectedRow', row, true);
            if (row) {
                this.setSelectedRowModel(row.model);
                row.setSelected(true);
            }
        }
    },
    
    setSelectedRowModel: function(v) {
        this.set('selectedRowModel', v, true);
        
        // Scroll the selected row into view
        this.scrollModelIntoView(this.selectedRowModel);
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** Clears the selectedRow while leaving the selectedRowModel.
        @private */
    _clearSelectedRow: function() {
        var existing = this.selectedRow;
        if (existing) {
            existing.setSelected(false);
            this.set('selectedRow', null, true);
        }
    },
    
    getActiveSelectedRow: function() {
        return this.getActiveRowForModel(this.selectedRowModel);
    },
    
    selectRowForModel: function(model, focus) {
        if (model) {
            this._clearSelectedRow();
            this.setSelectedRowModel(model);
            this.refreshListUI();
            
            // Focus on the newly selected row
            if (focus) {
                var row = this.getActiveSelectedRow();
                if (row) row.focus();
            }
        }
    },
    
    selectNextRowForModel: function(model, focus=true) {
        this.selectRowForModel(this.getNextModel(model), focus);
    },
    
    selectPrevRowForModel: function(model, focus=true) {
        this.selectRowForModel(this.getPrevModel(model), focus);
    },
    
    /** @overrides */
    resetListUI: function(preserveScroll) {
        var self = this;
        
        if (self.isModelInData(self.selectedRowModel)) {
            // Only clear the selected row since it's still in the data and
            // thus may be shown again.
            self._clearSelectedRow();
        } else {
            // Clear the row and model since the model can no longer be shown.
            self.setSelectedRow();
        }
        
        self.callSuper(preserveScroll);
    },
    
    /** @overrides */
    putRowBackInPool: function(row) {
        if (row.selected) this._clearSelectedRow();
        this.callSuper(row);
    },
    
    /** @overrides */
    doAfterListRefresh: function() {
        var row = this.getActiveSelectedRow();
        if (row) {
            this.set('selectedRow', row, true);
            row.setSelected(true);
        }
        
        this.callSuper();
    }
});


/** A simple implementation of a SelectableInfiniteListRow.
    
    Events:
        None
    
    Attributes:
        selectedColor
    
    Private Attributes:
        None
*/
myt.SimpleSelectableInfiniteListRow = new JS.Class('SimpleSelectableInfiniteListRow', myt.SimpleButton, {
    include: [myt.SelectableInfiniteListRow],
    
    
    // Class Methods and Attributes ////////////////////////////////////////////
    extend: {
        DEFAULT_SELECTED_COLOR:'#ccccff',
        DEFAULT_ACTIVE_COLOR:'#f8f8f8',
        DEFAULT_HOVER_COLOR:'#eeeeee',
        DEFAULT_READY_COLOR:'#ffffff'
    },
    
    // Life Cycle //////////////////////////////////////////////////////////////
    initNode: function(parent, attrs) {
        var self = this,
            SSILR = myt.SimpleSelectableInfiniteListRow;
        
        if (attrs.selectedColor == null) attrs.selectedColor = SSILR.DEFAULT_SELECTED_COLOR;
        if (attrs.activeColor == null) attrs.activeColor = SSILR.DEFAULT_ACTIVE_COLOR;
        if (attrs.hoverColor == null) attrs.hoverColor = SSILR.DEFAULT_HOVER_COLOR;
        if (attrs.readyColor == null) attrs.readyColor = SSILR.DEFAULT_READY_COLOR;
        
        if (attrs.focusEmbellishment == null) attrs.focusEmbellishment = false;
        if (attrs.activationKeys == null) attrs.activationKeys = [13,27,32,37,38,39,40];
        
        this.callSuper(parent, attrs);
    },
    
    destroy: function() {
        if (this.selected) this.infiniteOwner.setSelectedRow();
        this.callSuper();
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setSelected: function(v) {
        this.callSuper(v);
        if (this.inited) this.updateUI();
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    clean: function() {
        this.setMouseOver(false);
        this.setMouseDown(false);
        if (this.focused) this.blur();
        this.callSuper();
    },
    
    updateUI: function() {
        this.callSuper();
        if (this.selected) this.setBgColor(this.selectedColor);
    },
    
    doActivated: function() {
        this.callSuper();
        this.infiniteOwner.setSelectedRow(this);
    },
    
    doActivationKeyDown: function(key, isRepeat) {
        var self = this,
            owner = self.infiniteOwner,
            model = self.model;
        switch (key) {
            case 27: // Escape
                if (self.selected) owner.setSelectedRow();
                break;
            case 37: // Left
            case 38: // Up
                owner.selectPrevRowForModel(model);
                break;
            case 39: // Right
            case 40: // Down
                owner.selectNextRowForModel(model);
                break;
        }
    },
    
    doActivationKeyUp: function(key) {
        switch (key) {
            case 13: // Enter
            case 32: // Space
                this.doActivated();
                break;
        }
    }
});


/** Makes a view act as a panel in a myt.PanelStack.
    
    Events:
        None
    
    Attributes:
        panelId:string The unique ID of the panel.
        panelStack:myt.PanelStack A reference to the panel stack this panel
            belongs to. If undefined the parent view will be used.
*/
myt.StackablePanel = new JS.Module('StackablePanel', {
    include: [myt.Selectable],
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides */
    initNode: function(parent, attrs) {
        attrs.visible = attrs.selected = false;
        
        if (attrs.bgColor == null) attrs.bgColor = '#ffffff';
        if (attrs.panelId == null) attrs.panelId = attrs.name;
        
        this.callSuper(parent, attrs);
        
        if (this.selected) this.doStackTransition();
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setPanelStack: function(v) {this.panelStack = v;},
    
    getPanelStack: function() {
        return this.panelStack || this.parent;
    },
    
    setPanelId: function(v) {this.panelId = v;},
    
    /** @overrides myt.Selectable */
    setSelected: function(v) {
        if (this.selected !== v) {
            this.callSuper(v);
            if (this.inited) this.doStackTransition();
        }
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** Called whenever a transition between panels is initiated by this panel.
        Default behavior is to defer to the panelStack's doStackTransition
        method.
        @returns void */
    doStackTransition: function() {
        this.getPanelStack().doStackTransition(this);
    }
});


/** Use this to implement more complex transitions in a PanelStack. */
myt.PanelStackTransition = new JS.Class('PanelStackTransition', myt.Node, {
    // Methods /////////////////////////////////////////////////////////////////
    /** Called when transitioning to the provided panel.
        @param panel:myt.StackablePanel
        @returns a promise object that has a next function. */
    to: function(panel) {
        // Default implementation keeps the promise right away.
        return myt.promise(panel).keep();
    },
    
    /** Called when transitioning from the provided panel.
        @param panel:myt.StackablePanel
        @returns a promise object that has a next function. */
    from: function(panel) {
        // Default implementation keeps the promise right away.
        return myt.promise(panel).keep();
    }
});


/** A PanelStackTransition that fades the opacity between the two panels. */
myt.PanelStackFadeTransition = new JS.Class('PanelStackFadeTransition', myt.PanelStackTransition, {
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides */
    initNode: function(parent, attrs) {
        if (attrs.duration == null) attrs.duration = 1000;
        
        this.callSuper(parent, attrs);
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setDuration: function(duration) {this.duration = duration;},
    
    
    // Methods /////////////////////////////////////////////////////////////////
    to: function(panel) {
        var promise = myt.promise(panel);
        
        panel.stopActiveAnimators('opacity');
        panel.setVisible(true);
        panel.animate({attribute:'opacity', to:1, duration:this.duration}).next(function(success) {
            panel.makeHighestZIndex();
            promise.keep();
        });
        
        return promise;
    },
    
    from: function(panel) {
        var promise = myt.promise(panel);
        
        panel.stopActiveAnimators('opacity');
        panel.animate({attribute:'opacity', to:0, duration:this.duration}).next(function(success) {
            panel.setVisible(false);
            promise.keep();
        });
        
        return promise;
    }
});


/** A PanelStackTransition that slides between the from and to panel. */
myt.PanelStackSlideTransition = new JS.Class('PanelStackSlideTransition', myt.PanelStackTransition, {
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides */
    initNode: function(parent, attrs) {
        if (attrs.duration == null) attrs.duration = 1000;
        if (attrs.direction == null) attrs.direction = 'right';
        
        this.callSuper(parent, attrs);
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setDuration: function(duration) {this.duration = duration;},
    setDirection: function(direction) {this.direction = direction;},
    
    
    // Methods /////////////////////////////////////////////////////////////////
    to: function(panel) {
        var promise = myt.promise(panel),
            panelStack = panel.getPanelStack(),
            toValue, axis;
        switch (this.direction) {
            case 'left':
                axis = 'x';
                toValue = panelStack.width;
                break;
            case 'right':
                axis = 'x';
                toValue = -panelStack.width;
                break;
            case 'up':
                axis = 'y';
                toValue = panelStack.height;
                break;
            case 'down':
                axis = 'y';
                toValue = -panelStack.height;
                break;
        }
        
        panel.stopActiveAnimators(axis);
        panel.set(axis, toValue);
        panel.setVisible(true);
        var nextFunc = function(success) {
            panel.makeHighestZIndex();
            promise.keep();
        };
        if (this.duration > 0) {
            panel.animate({attribute:axis, to:0, duration:this.duration}).next(nextFunc);
        } else {
            panel.set(axis, 0);
            nextFunc();
        }
        
        return promise;
    },
    
    from: function(panel) {
        var promise = myt.promise(panel),
            panelStack = panel.getPanelStack(),
            toValue, axis;
        switch (this.direction) {
            case 'left':
                axis = 'x';
                toValue = -panelStack.width;
                break;
            case 'right':
                axis = 'x';
                toValue = panelStack.width;
                break;
            case 'up':
                axis = 'y';
                toValue = -panelStack.height;
                break;
            case 'down':
                axis = 'y';
                toValue = panelStack.height;
                break;
        }
        
        panel.stopActiveAnimators(axis);
        var nextFunc = function(success) {
            panel.setVisible(false);
            promise.keep();
        };
        if (this.duration > 0) {
            panel.animate({attribute:axis, to:toValue, duration:this.duration}).next(nextFunc);
        } else {
            panel.set(axis, toValue);
            nextFunc();
        }
        
        return promise;
    }
});


/** Manages a stack of myt.View panel children that can be transitioned to
    an "active" state as they are selected. The active panel will be sized
    to fit the bounds of the stack.
    
    Events:
        None
    
    Attributes:
        None
*/
// FIXME: handle panel destruction
// FIXME: handle panel insertion
myt.PanelStack = new JS.Class('PanelStack', myt.View, {
    include: [myt.SelectionManager],
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides myt.View */
    initNode: function(parent, attrs) {
        attrs.overflow = 'hidden';
        
        if (attrs.itemSelectionId == null) attrs.itemSelectionId = 'panelId';
        if (attrs.maxSelected == null) attrs.maxSelected = 1;
        
        this.callSuper(parent, attrs);
        
        this.syncTo(this, '__updateHeight', 'height');
        this.syncTo(this, '__updateWidth', 'width');
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setTransition: function(transition) {this.set('transition', transition, true);},
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** @private */
    __updateWidth: function(event) {
        // Only resize the active panel
        var panel = this.getActivePanel();
        if (panel) panel.setWidth(event.value);
    },
    
    /** @private */
    __updateHeight: function(event) {
        // Only resize the active panel
        var panel = this.getActivePanel();
        if (panel) panel.setHeight(event.value);
    },
    
    /** Gets the selected panel.
        @returns myt.StackablePanel: The selected panel or undefined if
            none selected. */
    getActivePanel: function() {
        return this.getSelected()[0];
    },
    
    getPanel: function(panelId) {
        return this.getSelectableItem(panelId);
    },
    
    selectPanel: function(panelId) {
        this.selectById(panelId);
    },
    
    /** @overrides myt.SelectionManager */
    doSelected: function(item) {
        item.setWidth(this.width);
        item.setHeight(this.height);
    },
    
    /** Called by a panel when it transitions between selected states. Should
        not be called directly. Instead change the panel selection.
        @param panel:myt.StackablePanel The panel that is transitioning.
        @returns void */
    doStackTransition: function(panel) {
        this['doStackTransition' + (panel.selected ? 'To' : 'From')](panel);
    },
    
    /** Called by PanelStack.doStackTransition when the provided panel will be 
        the newly selected panel in the stack. Should not be called directly. 
        Instead change the panel selection.
        @param panel:myt.StackablePanel The panel that is transitioning.
        @returns void */
    doStackTransitionTo: function(panel) {
        this.doBeforeTransitionTo(panel);
        
        var transition = this.transition;
        if (transition) {
            var self = this;
            transition.to(panel).next(function(panel) {self.doAfterTransitionTo(panel)});
        } else {
            panel.makeHighestZIndex();
            panel.setVisible(true);
            
            this.doAfterTransitionTo(panel);
        }
    },
    
    doBeforeTransitionTo: function(panel) {},
    doAfterTransitionTo: function(panel) {},
    
    /** Called by PanelStack.doStackTransition when the provided panel will be 
        the newly deselected panel in the stack. Should not be called directly. 
        Instead change the panel selection.
        @param panel:myt.StackablePanel The panel that is transitioning.
        @returns void */
    doStackTransitionFrom: function(panel) {
        this.doBeforeTransitionFrom(panel);
        
        var transition = this.transition;
        if (transition) {
            var self = this;
            transition.from(panel).next(function(panel) {self.doAfterTransitionFrom(panel)});
        } else {
            panel.setVisible(false);
            this.doAfterTransitionFrom(panel);
        }
    },
    
    doBeforeTransitionFrom: function(panel) {},
    doAfterTransitionFrom: function(panel) {},
});


/** Adds drag group support to drag and drop related classes.
    
    Events:
        None
    
    Attributes:
        None
    
    Private Attributes:
        __dragGroups:object The keys are the set of drag groups this view
            supports. By default the special drag group of '*' which accepts
            all drag groups is defined.
        __acceptAny:boolean The precalculated return value for the
            acceptAnyDragGroup method.
*/
myt.DragGroupSupport = new JS.Module('DragGroupSupport', {
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides */
    initNode: function(parent, attrs) {
        this.__dragGroups = {'*':true};
        this.__acceptAny = true;
        
        this.callSuper(parent, attrs);
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setDragGroups: function(v) {
        var newDragGroups = {};
        for (var dragGroup in v) newDragGroups[dragGroup] = true;
        this.__dragGroups = newDragGroups;
        this.__acceptAny = newDragGroups.hasOwnProperty('*');
    },
    
    getDragGroups: function() {
        return this.__dragGroups;
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** Adds the provided dragGroup to the dragGroups.
        @param dragGroup:string The drag group to add.
        @returns void */
    addDragGroup: function(dragGroup) {
        if (dragGroup) {
            this.__dragGroups[dragGroup] = true;
            if (dragGroup === '*') this.__acceptAny = true;
        }
    },
    
    /** Removes the provided dragGroup from the dragGroups.
        @param dragGroup:string The drag group to remove.
        @returns void */
    removeDragGroup: function(dragGroup) {
        if (dragGroup) {
            delete this.__dragGroups[dragGroup];
            if (dragGroup === '*') this.__acceptAny = false;
        }
    },
    
    /** Determines if this drop target will accept drops from any drag group.
        @returns boolean: True if any drag group will be accepted, false
            otherwise. */
    acceptAnyDragGroup: function() {
        return this.__acceptAny;
    }
});


/** Makes an myt.View drag and dropable via the mouse.
    
    Events:
        None
    
    Attributes:
        dropped:boolean Indicates this dropable was just dropped.
        dropFailed:boolean Indicates this dropable was just dropped outside
            of a drop target.
        dropTarget:myt.DropTarget The drop target this dropable is currently
            over.
*/
myt.Dropable = new JS.Module('Dropable', {
    include: [myt.Draggable, myt.DragGroupSupport],
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setDropTarget: function(v) {this.dropTarget = v;},
    setDropped: function(v) {this.dropped = v;},
    setDropFailed: function(v) {this.dropFailed = v;},
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** Called by myt.GlobalDragManager when a dropable is dragged over a
        target. Gives this dropable a chance to reject a drop regardless
        of drag group. The default implementation returns true.
        @param dropTarget:myt.DropTarget The drop target dragged over.
        @returns boolean: True if the drop will be allowed, false otherwise. */
    willPermitDrop: function(dropTarget) {
        return true;
    },
    
    /** @overrides myt.Draggable */
    startDrag: function(event) {
        this.setDropped(false);
        this.setDropFailed(false);
        
        myt.global.dragManager.startDrag(this);
        this.callSuper(event);
    },
    
    /** @overrides myt.Draggable */
    updateDrag: function(event) {
        myt.global.dragManager.updateDrag(event, this);
        this.callSuper(event);
    },
    
    /** @overrides myt.Draggable */
    stopDrag: function(event, isAbort) {
        myt.global.dragManager.stopDrag(event, this, isAbort);
        this.callSuper(event, isAbort);
        
        if (isAbort) {
            this.notifyDropAborted();
        } else if (this.dropFailed) {
            this.notifyDropFailed();
        }
    },
    
    /** Called by myt.GlobalDragManager when this view is dragged over a drop
        target.
        @param dropTarget:myt.DropTarget The target that was dragged over.
        @returns void */
    notifyDragEnter: function(dropTarget) {
        this.setDropTarget(dropTarget);
    },
    
    /** Called by myt.GlobalDragManager when this view is dragged out of a drop
        target.
        @param dropTarget:myt.DropTarget The target that was dragged out of.
        @returns void */
    notifyDragLeave: function(dropTarget) {
        this.setDropTarget();
    },
    
    /** Called by myt.GlobalDragManager when this view is dropped.
        @param dropTarget:myt.DropTarget The target that was dropped on. Will
            be undefined if this dropable was dropped on no drop target.
        @param isAbort:boolean Indicates if the drop was the result of an
            abort or a normal drop.
        @returns void */
    notifyDropped: function(dropTarget, isAbort) {
        this.setDropped(true);
        
        if (!this.dropTarget) this.setDropFailed(true);
    },
    
    /** Called after dragging stops and the drop failed. The default
        implementation does nothing.
        @returns void */
    notifyDropFailed: function() {},
    
    /** Called after dragging stops and the drop was aborted. The default
        implementation does nothing.
        @returns void */
    notifyDropAborted: function() {}
});


/** Makes an myt.View support having myt.Dropable views dropped on it.
    
    Events:
        None
    
    Attributes:
        None
*/
myt.DropTarget = new JS.Module('DropTarget', {
    include: [myt.DragGroupSupport],
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides */
    initNode: function(parent, attrs) {
        this.callSuper(parent, attrs);
        
        myt.global.dragManager.registerDropTarget(this);
    },
    
    /** @overrides */
    destroyAfterOrphaning: function() {
        myt.global.dragManager.unregisterDropTarget(this);
        
        this.callSuper();
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** Called by myt.GlobalDragManager when a dropable is dragged over this
        target. Gives this drop target a chance to reject a drop regardless
        of drag group. The default implementation returns true if the view
        is not disabled.
        @param dropable:myt.Dropable The dropable being dragged.
        @returns boolean: True if the drop will be allowed, false otherwise. */
    willAcceptDrop: function(dropable) {
        // Handle the common case of a disabled or not visible component.
        if (this.disabled || !this.isVisible()) return false;
        
        return true;
    },
    
    /** Called by myt.GlobalDragManager when a dropable starts being dragged
        that has a matching drag group.
        @param dropable:myt.Dropable The dropable being dragged.
        @returns void */
    notifyDragStart: function(dropable) {},
    
    /** Called by myt.GlobalDragManager when a dropable stops being dragged
        that has a matching drag group.
        @param dropable:myt.Dropable The dropable no longer being dragged.
        @returns void */
    notifyDragStop: function(dropable) {},
    
    /** Called by myt.GlobalDragManager when a dropable is dragged over this
        view and has a matching drag group.
        @param dropable:myt.Dropable The dropable being dragged over this view.
        @returns void */
    notifyDragEnter: function(dropable) {},
    
    /** Called by myt.GlobalDragManager when a dropable is dragged out of this
        view and has a matching drag group.
        @param dropable:myt.Dropable The dropable being dragged out of 
            this view.
        @returns void */
    notifyDragLeave: function(dropable) {},
    
    /** Called by myt.GlobalDragManager when a dropable is dropped onto this
        view and has a matching drag group.
        @param dropable:myt.Dropable The dropable being dropped onto this view.
        @returns void */
    notifyDrop: function(dropable) {}
});


/** Makes an myt.View support being a source for myt.Dropable instances. Makes
    use of myt.Draggable for handling drag initiation but this view is not
    itself, actually draggable.
    
    Events:
        None
    
    Attributes:
        dropParent:myt.View The view to make the myt.Dropable instances in.
            Defaults to the myt.RootView that contains this drop source.
        dropClass:JS.Class The myt.Dropable class that gets created in the
            default implementation of makeDropable.
        dropClassAttrs:object The attrs to use when making the dropClass
            instance.
        dropable:mytDropable (read only) The dropable that was most 
            recently created. Once the dropable has been dropped this will
            be set to null.
*/
myt.DropSource = new JS.Module('DropSource', {
    include: [myt.Draggable],
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides */
    initNode: function(parent, attrs) {
        if (attrs.distanceBeforeDrag == null) attrs.distanceBeforeDrag = 2;
        if (attrs.dropParent == null) attrs.dropParent = parent.getRoot();
        
        this.callSuper(parent, attrs);
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setDropClass: function(v) {this.dropClass = myt.resolveClassname(v);},
    setDropClassAttrs: function(v) {this.dropClassAttrs = v;},
    setDropParent: function(v) {this.dropParent = v;},
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** @overrides myt.Draggable */
    startDrag: function(event) {
        var dropable = this.dropable = this.makeDropable();
        
        // Emulate mouse down on the dropable
        if (dropable) {
            // Remember distance and set to zero so a drag will begin for sure.
            var origDistance = dropable.distanceBeforeDrag;
            dropable.distanceBeforeDrag = 0;
            
            dropable.doMouseDown(event); // Execute MouseDownMixin
            dropable.__doMouseDown(event); // Execute Draggable
            
            // Restore distance
            dropable.distanceBeforeDrag = origDistance;
        }
    },
    
    /** @overrides myt.MouseDown */
    doMouseUp: function(event) {
        this.callSuper(event);
        
        // Emulate mouse up on the dropable
        var dropable = this.dropable;
        if (dropable) {
            dropable.__doMouseUp(event);
            dropable.doMouseUp(event);
            this.dropable = null;
        }
    },
    
    /** Called by startDrag to make a dropable.
        @returns myt.Dropable or undefined if one can't be created. */
    makeDropable: function() {
        var dropClass = this.dropClass,
            dropParent = this.dropParent;
        if (dropClass && dropParent) {
            var pos = myt.DomElementProxy.getPagePosition(this.getInnerDomElement(), dropParent.getInnerDomElement()),
            attrs = myt.extend({}, this.dropClassAttrs);
            attrs.x = pos.x || 0;
            attrs.y = pos.y || 0;
            return new dropClass(dropParent, attrs);
        }
    },
});


/** Makes an myt.View auto scroll during drag and drop.
    
    Events:
        None
    
    Attributes:
        scrollBorder:number The thickness of the auto scroll border. Defaults
            to 40 pixels.
        scrollFrequency:number The time between autoscroll adjustments.
            Defaults to 50 millis.
        scrollAmount:number The number of pixels to adjust by each time.
            Defaults to 2 pixels.
        scrollAcceleration:number The amount to increase scrolling by as the
            mouse gets closer to the edge of the view. Setting this to 0 will
            result in no acceleration. Defaults to 7.
    
    Private Attributes:
        __amountscrollUp:number
        __amountscrollDown:number
        __amountscrollLeft:number
        __amountscrollRight:number
        __isAutoscrollUp:boolean
        __timerIdAutoscrollUp:number
        __isAutoscrollDown:boolean
        __timerIdAutoscrollDown:number
        __isAutoscrollLeft:boolean
        __timerIdAutoscrollLeft:number
        __isAutoscrollRight:boolean
        __timerIdAutoscrollRight:number
*/
myt.AutoScroller = new JS.Module('AutoScroller', {
    include: [myt.DragGroupSupport],
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides */
    initNode: function(parent, attrs) {
        this.scrollBorder = 40;
        this.scrollFrequency = 50;
        this.scrollAmount = 2;
        this.scrollAcceleration = 7;
        
        if (attrs.overflow == null) attrs.overflow = 'auto';
        
        this.callSuper(parent, attrs);
        
        myt.global.dragManager.registerAutoScroller(this);
    },
    
    /** @overrides */
    destroyAfterOrphaning: function() {
        myt.global.dragManager.unregisterAutoScroller(this);
        
        this.callSuper();
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setScrollBorder: function(v) {this.scrollBorder = v;},
    setScrollFrequency: function(v) {this.scrollFrequency = v;},
    setScrollAmount: function(v) {this.scrollAmount = v;},
    setScrollAcceleration: function(v) {this.scrollAcceleration = v;},
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** Called by myt.GlobalDragManager when a dropable starts being dragged
        that has a matching drag group.
        @param dropable:myt.Dropable The dropable being dragged.
        @returns void */
    notifyDragStart: function(dropable) {
        var de = this.getInnerDomElement();
        if (de.scrollHeight > de.clientHeight || de.scrollWidth > de.clientWidth) {
            this.attachToDom(myt.global.mouse, '__handleMouseMove', 'mousemove', true);
        }
    },
    
    /** Called by myt.GlobalDragManager when a dropable stops being dragged
        that has a matching drag group.
        @param dropable:myt.Dropable The dropable no longer being dragged.
        @returns void */
    notifyDragStop: function(dropable) {
        this.detachFromDom(myt.global.mouse, '__handleMouseMove', 'mousemove', true);
        
        this.__resetVScroll();
        this.__resetHScroll();
    },
    
    /** @private */
    __handleMouseMove: function(event) {
        var self = this,
            mousePos = event.value, 
            mouseX = mousePos.pageX, 
            mouseY = mousePos.pageY;
        
        if (self.containsPoint(mouseX, mouseY)) {
            var pos = self.getPagePosition(), 
                scrollBorder = self.scrollBorder;
            
            mouseX -= pos.x;
            mouseY -= pos.y;
            
            if (mouseY < scrollBorder) {
                self.__isAutoscrollUp = true;
                self.__amountscrollUp = self.__calculateAmount((scrollBorder - mouseY) / scrollBorder);
                if (!self.__timerIdAutoscrollUp) self.__doAutoScrollAdj('scrollUp', -1);
            } else if (self.height - mouseY < scrollBorder) {
                self.__isAutoscrollDown = true;
                self.__amountscrollDown = self.__calculateAmount((scrollBorder - (self.height - mouseY)) / scrollBorder);
                if (!self.__timerIdAutoscrollDown) self.__doAutoScrollAdj('scrollDown', 1);
            } else {
                self.__resetVScroll();
            }
            
            if (mouseX < scrollBorder) {
                self.__isAutoscrollLeft = true;
                self.__amountscrollLeft = self.__calculateAmount((scrollBorder - mouseX) / scrollBorder);
                if (!self.__timerIdAutoscrollLeft) self.__doAutoScrollAdj('scrollLeft', -1);
            } else if (self.width - mouseX < scrollBorder) {
                self.__isAutoscrollRight = true;
                self.__amountscrollRight = self.__calculateAmount((scrollBorder - (self.width - mouseX)) / scrollBorder);
                if (!self.__timerIdAutoscrollRight) self.__doAutoScrollAdj('scrollRight', 1);
            } else {
                self.__resetHScroll();
            }
        } else {
            self.__resetVScroll();
            self.__resetHScroll();
        }
    },
    
    /** @private */
    __calculateAmount: function(percent) {
        return Math.round(this.scrollAmount * (1 + this.scrollAcceleration * percent));
    },
    
    /** @private */
    __resetVScroll: function() {
        this.__isAutoscrollUp = this.__isAutoscrollDown = false;
        this.__timerIdAutoscrollUp = this.__timerIdAutoscrollDown = null;
    },
    
    /** @private */
    __resetHScroll: function() {
        this.__isAutoscrollLeft = this.__isAutoscrollRight = false;
        this.__timerIdAutoscrollLeft = this.__timerIdAutoscrollRight = null;
    },
    
    /** @private */
    __doAutoScrollAdj: function(dir, amt) {
        var self = this;
        
        if (self['__isAuto' + dir]) {
            self.getInnerDomElement()[dir === 'scrollUp' || dir === 'scrollDown' ? 'scrollTop' : 'scrollLeft'] += amt * self['__amount' + dir];
            
            self['__timerIdAuto' + dir] = setTimeout(function() {
                self.__doAutoScrollAdj(dir, amt);
            }, self.scrollFrequency);
        }
    }
});


/** An object that provides accessors, events and simple lifecycle management.
    Useful as a light weight alternative to myt.Node when parent child
    relationships are not needed.
    
    Events:
        None.
    
    Attributes:
        inited:boolean Set to true after this Eventable has completed 
            initializing.
*/
myt.Eventable = new JS.Class('Eventable', {
    include: [myt.AccessorSupport, myt.Destructible, myt.Observable, myt.Constrainable],
    
    
    // Constructor /////////////////////////////////////////////////////////////
    /** The standard JSClass initializer function.
        @param attrs:object (Optional) A map of attribute names and values.
        @param mixins:array (Optional) a list of mixins to be added onto
            the new instance.
        @returns void */
    initialize: function(attrs, mixins) {
        var self = this;
        if (mixins) {
            for (var i = 0, len = mixins.length, mixin; len > i;) {
                if (mixin = mixins[i++]) {
                    self.extend(mixin);
                } else {
                    console.warn("Missing mixin in:" + self.klass.__displayName);
                }
            }
        }
        
        self.inited = false;
        self.init(attrs || {});
    },
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    /** Called during initialization. Calls setter methods and lastly, sets 
        inited to true. Subclasses must callSuper.
        @param attrs:object A map of attribute names and values.
        @returns void */
    init: function(attrs) {
        this.callSetters(attrs);
        this.inited = true;
    },
    
    /** @overrides myt.Destructible. */
    destroy: function() {
        var self = this;
        self.releaseAllConstraints();
        self.detachFromAllObservables();
        self.detachAllObservers();
        
        self.callSuper();
    }
});


((pkg) => {
    var degreesToRadians = pkg.Geometry.degreesToRadians,
        
        redraw = (annulus) => {
            pkg.Annulus.draw(
                annulus.__path, 
                degreesToRadians(annulus.startAngle), 
                degreesToRadians(annulus.endAngle), 
                annulus.thickness, 
                annulus.radius, 
                annulus.width / 2, 
                annulus.color, 
                annulus.startCapRounding, 
                annulus.endCapRounding
            );
        },
        
        /** Ensures the size of the view exactly fits the annulus. */
        updateSize = (annulus) => {
            var size = 2*(annulus.radius + annulus.thickness),
                svg = annulus.__svg;
            annulus.setWidth(size);
            annulus.setHeight(size);
            
            svg.setAttribute('viewBox', '0 0 ' + size + ' ' + size);
            svg.setAttribute('width', size);
            svg.setAttribute('height', size);
            
            redraw(annulus);
        };
     
    /** An annulus component. */
    pkg.Annulus = new JS.Class('Annulus', pkg.View, {
        // Class Methods and Attributes ////////////////////////////////////////
        extend: {
            /** Draws an annulus using the provided path.
                @param path:svg path object
                @param startAngle:number The start angle in radians.
                @param endAngle:number The end angle in radians.
                @param thickness:number The difference between the inner and outer
                    radius.
                @param r1:number The inner radius.
                @param c:number The center of the annulus
                @param color:hex string The color to fill with.
                @param startCapRounding:boolean If true the starting cap will
                    be drawn as a semicircle.
                @param endCapRounding:boolean If true the ending cap will be
                    drawn as a semicircle.
                @returns void */
            draw: (path, startAngle, endAngle, thickness, r1, c, color, startCapRounding, endCapRounding) => {
                // Ensure endAngle is greater than or equal to startAngle
                if (startAngle > endAngle) {
                    var tmp = startAngle;
                    startAngle = endAngle;
                    endAngle = tmp;
                }
                
                var r2 = r1 + thickness,
                    PI = Math.PI,
                    angleDiff = endAngle - startAngle,
                    isFull = angleDiff + 0.0001 >= 2 * PI; // 0.0001 is to handle floating point errors
                
                // Will use two arcs for a full circle
                if (isFull) {
                    startAngle = 0;
                    endAngle = PI;
                }
                
                var COS = Math.cos,
                    SIN = Math.sin,
                    points = [
                        [c + r2 * COS(startAngle), c + r2 * SIN(startAngle)],
                        [c + r2 * COS(endAngle),   c + r2 * SIN(endAngle)],
                        [c + r1 * COS(endAngle),   c + r1 * SIN(endAngle)],
                        [c + r1 * COS(startAngle), c + r1 * SIN(startAngle)]
                    ],
                    commands = [];
                
                commands.push("M" + points[0].join());
                if (isFull) {
                    commands.push("A" + [r2, r2, 0, 1, 1, points[1]].join());
                    commands.push("A" + [r2, r2, 0, 1, 1, points[0]].join());
                    commands.push("L" + points[2].join());
                    commands.push("A" + [r1, r1, 0, 1, 0, points[3]].join());
                    commands.push("A" + [r1, r1, 0, 1, 0, points[2]].join());
                } else {
                    var largeArc = (angleDiff % (2 * PI)) > PI ? 1 : 0;
                    commands.push("A" + [r2, r2, 0, largeArc, 1, points[1]].join());
                    if (endCapRounding) {
                        commands.push("A" + [thickness / 2, thickness / 2, 0, 0, 1, points[2]].join());
                    } else {
                        commands.push("L" + points[2].join());
                    }
                    commands.push("A" + [r1, r1, 0, largeArc, 0, points[3]].join());
                    if (startCapRounding) commands.push("A" + [thickness / 2, thickness / 2, 0, 0, 1, points[0]].join());
                }
                commands.push("z");
                
                path.setAttribute('d', commands.join(' '));
                path.setAttribute('fill', color);
            },
            
            makeSVG: (elementName, parentElem) => {
                var svgElem = document.createElementNS("http://www.w3.org/2000/svg", elementName);
                if (parentElem) parentElem.appendChild(svgElem);
                return svgElem;
            }
        },
        
        
        // Life Cycle //////////////////////////////////////////////////////////
        initNode: function(parent, attrs) {
            var self = this;
            
            self.radius = self.thickness = self.startAngle = self.endAngle = 0;
            self.startCapRounding = self.endCapRounding = false;
            
            self.callSuper(parent, attrs);
            
            updateSize(self);
        },
        
        /** @overrides myt.View */
        createOurDomElement: function(parent) {
            var elements = this.callSuper(parent),
                MSVG = pkg.Annulus.makeSVG,
                svg,
                innerElem;
            if (Array.isArray(elements)) {
                innerElem = elements[1];
            } else {
                innerElem = elements;
            }
            
            svg = this.__svg = MSVG('svg', innerElem);
            this.__path = MSVG('path', svg);
            
            // Let the view handle mouse events
            svg.style.pointerEvents = 'none';
            
            return elements;
        },
        
        
        // Accessors ///////////////////////////////////////////////////////////
        setRadius: function(v) {
            if (this.radius !== v) {
                this.radius = v = Math.max(0, v);
                if (this.inited) {
                    updateSize(this);
                    this.fireEvent('radius', v);
                }
            }
        },
        
        setThickness: function(v) {
            if (this.thickness !== v) {
                this.thickness = v = Math.max(0, v);
                if (this.inited) {
                    updateSize(this);
                    this.fireEvent('thickness', v);
                }
            }
        },
        
        setStartAngle: function(v) {
            if (this.startAngle !== v) {
                this.startAngle = v;
                if (this.inited) {
                    redraw(this);
                    this.fireEvent('startAngle', v);
                }
            }
        },
        
        setEndAngle: function(v) {
            if (this.endAngle !== v) {
                this.endAngle = v;
                if (this.inited) {
                    redraw(this);
                    this.fireEvent('endAngle', v);
                }
            }
        },
        
        setStartCapRounding: function(v) {
            if (this.startCapRounding !== v) {
                this.startCapRounding = v;
                if (this.inited) {
                    redraw(this);
                    this.fireEvent('startCapRounding', v);
                }
            }
        },
        
        setEndCapRounding: function(v) {
            if (this.endCapRounding !== v) {
                this.endCapRounding = v;
                if (this.inited) {
                    redraw(this);
                    this.fireEvent('endCapRounding', v);
                }
            }
        },
        
        setColor: function(v) {
            if (this.color !== v) {
                this.color = v;
                if (this.inited) {
                    redraw(this);
                    this.fireEvent('color', v);
                }
            }
        },
        
        
        // Methods /////////////////////////////////////////////////////////////
        /** Prevent views from being sent behind the __svg. This allows us to
            add child views to an Annulus which is not directly supported in HTML.
            @overrides myt.View */
        sendSubviewToBack: function(sv) {
            if (sv.parent === this) {
                var de = this.getInnerDomElement(),
                    firstChild = de.childNodes[1];
                if (sv.getOuterDomElement() !== firstChild) {
                    var removedElem = de.removeChild(sv.getOuterDomElement());
                    if (removedElem) de.insertBefore(removedElem, firstChild);
                }
            }
        },
        
        /** @overrides myt.View */
        isColorAttr: function(attrName) {
            return attrName === 'color' || this.callSuper(attrName);
        }
    });
})(myt);


/** Provides WebSocket functionality. */
myt.WebSocket = new JS.Class('WebSocket', myt.Node, {
    // Life Cycle //////////////////////////////////////////////////////////////
    initNode: function(parent, attrs) {
        this.status = 'closed';
        this.useJSON = true;
        this.callSuper();
    },
    
    destroy: function() {
        this.close(1000, 'destroyed');
        this.callSuper();
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setUseJSON: function(v) {
        if (this.useJSON !== v) {
            this.useJSON = v;
            if (this.inited) this.fireEvent('useJSON', v);
        }
    },
    
    setStatus: function(v) {
        if (this.status !== v) {
            this.status = v;
            if (this.inited) this.fireEvent('status', v);
        }
    },
    
    setUrl: function(v) {
        // Support myt.URI for the url param.
        if (typeof v === 'object' && typeof v.isA === 'function' && v.isA(myt.URI)) v = v.toString();
        
        this.url = v;
    },
    
    setProtocols: function(v) {
        this.protocols = v;
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** Connects the WebSocket to the currently configured URL.
        @param afterOpenCallback:function (optional) This callback will be
            executed once after the connection is established and the onOpen
            method has been called.
        @returns void */
    connect: function(afterOpenCallback) {
        if (!this._ws && this.url) {
            try {
                var ws = this._ws = new WebSocket(this.url, this.protocols);
                
                var openFunc = this.onOpen.bind(this);
                if (afterOpenCallback) {
                    // Execute an afterOpenCallback one time
                    ws.onopen = function(event) {
                        openFunc(event);
                        afterOpenCallback(event);
                        
                        // Reassign handler
                        ws.onopen = openFunc;
                    }
                } else {
                    ws.onopen = openFunc;
                }
                
                ws.onerror = this.onError.bind(this);
                ws.onmessage = this.onMessage.bind(this);
                ws.onclose = this.onClose.bind(this);
            } catch (ex) {
                this.onError(ex);
            }
        }
    },
    
    /** Sends a message over the WebSocket.
        @param msg:* The message to send.
        @param doNotTryToConnect:boolean (optional) If falsy an attempt will
            be made to connect if the WebSocket is not currently connected
            before sending the message.
        @param returns boolean|undefined Indicating if the message was sent
            or not. Undefined is returned when the connection has to be opened
            before sending. */
    send: function(msg, doNotTryToConnect) {
        var ws = this._ws;
        if (ws && this.status === 'open') {
            if (this.useJSON) {
                try {
                    msg = JSON.stringify(msg);
                } catch (ex) {
                    this.onError(ex);
                }
            }
            ws.send(msg);
            return true;
        } else if (!doNotTryToConnect) {
            // Try to connect first and then send
            var self = this;
            this.connect(function(event) {self.send(msg, true);});
        } else {
            return false;
        }
    },
    
    /** Attempts to close the connection.
        @param code:number (optional) Should be a WebSocket CloseEvent.code 
            value. Defaults to 1000 CLOSE_NORMAL.
        @param reason:string (optional) An explanation of why the close is
            occurring. Defaults to "close".
        @returns void */
    close: function(code, reason) {
        if (this._ws) this._ws.close(code || 1000, reason || 'close');
    },
    
    /** Invoked when after the WebSocket is opened.
        @param event:Event The open event fired by the WebSocket.
        @returns void */
    onOpen: function(event) {
        this.setStatus('open');
    },
    
    /** Invoked when an error occurs in the WebSocket.
        @param event:Event The error event fired by the WebSocket.
        @returns void */
    onError: function(event) {
        console.error(event);
        
        var ws = this._ws;
        if (ws && ws.readyState !== 1) this.close();
    },
    
    /** Invoked when a message is received over the WebSocket.
        @param event:Event The message event fired by the WebSocket.
        @returns msg:* The message received. */
    onMessage: function(event) {
        var msg = event.data;
        
        if (this.useJSON) {
            try {
                msg = JSON.parse(msg);
            } catch (ex) {
                this.onError(ex);
            }
        }
        
        return msg; // Useful for subclassing
    },
    
    /** Invoked when the WebSocket is closed.
        @param event:Event The close event fired by the WebSocket.
        @returns void */
    onClose: function(event) {
        if (this._ws) delete this._ws;
        this.setStatus('closed');
    }
});


/** A WebSocket where messages are JSON objects with the following structure:
    type:string The type of the message. This will allow registered listeners
        to be notified when a message they are interested in arrives.
    msg:json The message payload.
    date:number The time in milliseconds when the message was sent.
*/
myt.MessageTypeWebSocket = new JS.Class('MessageTypeWebSocket', myt.WebSocket, {
    // Class Methods and Attributes ////////////////////////////////////////////
    extend: {
        MATCH_ANYTHING:function(type) {return true;},
        matcherFunctionsByKey:{}
    },
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides */
    initNode: function(parent, attrs) {
        this._listeners = [];
        
        if (attrs.protocols == null) attrs.protocols = 'typedMessage';
        
        this.callSuper();
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** Registers a listener function that will get called for messages with
        a type that is matched by the provided matcher.
        @param listenerFunc:function The function that will get invoked. The
            message is provided as the sole argument to the function.
        @param matcher:string|function (optional) A matcher function that takes
            the type as the sole argument and must return true or false
            indicating if the type is matched or not. If a string is provided
            it will be converted into an exact match function. If not provided
            (or something falsy) is provided a promiscuous matcher function
            will be used.
        @returns void */
    registerListener: function(listenerFunc, matcher) {
        if (listenerFunc) {
            var matcherFunc = this._makeMatcherFunction(matcher);
            if (matcherFunc) {
                // Register for existing listenr
                var listeners = this._listeners, i = listeners.length, listenerInfo;
                while (i) {
                    listenerInfo = listeners[--i];
                    if (listenerInfo.func === listenerFunc) {
                        var patternMatchers = listenerInfo.patternMatchers, 
                            j = patternMatchers.length;
                        while (j) {
                            // Abort since patternMatcher is already registered
                            if (patternMatchers[--j] === matcherFunc) return;
                        }
                        patternMatchers.push(matcherFunc);
                        
                        // Prevent fall through to "add" below since we found
                        // a listener.
                        return;
                    }
                }
                
                // Add a new listenerFunc
                listeners.push({
                    func:listenerFunc,
                    patternMatchers:[matcherFunc]
                });
            }
        }
    },
    
    /** Removed the provided listener function and matcher. */
    unregisterListener: function(listenerFunc, matcher) {
        if (listenerFunc) {
            var matcherFunc = this._makeMatcherFunction(matcher);
            if (matcherFunc) {
                var listeners = this._listeners, i = listeners.length, listenerInfo;
                while (i) {
                    listenerInfo = listeners[--i];
                    if (listenerInfo.func === listenerFunc) {
                        // Try to remove the matcherFunc
                        var patternMatchers = listenerInfo.patternMatchers, 
                            j = patternMatchers.length;
                        while (j) {
                            if (patternMatchers[--j] === matcherFunc) {
                                patternMatchers.splice(j, 1);
                                break;
                            }
                        }
                        
                        // Remove entire entry if there are no more matchers
                        if (patternMatchers.length === 0) listeners.splice(i, 1);
                        break;
                    }
                }
            }
        }
    },
    
    /** @private */
    _makeMatcherFunction: function(matcher) {
        var matcherFunc;
        if (typeof matcher === 'string') {
            // Use the provided string as an exact match function. We must
            // generate a unique function for each string key (and reuse it)
            // so that the === tests will work in the registerListener and
            // unregisterListener functions.
            var funcsByKey = myt.MessageTypeWebSocket.matcherFunctionsByKey;
            matcherFunc = funcsByKey[matcher] || (funcsByKey[matcher] = function(type) {return type === matcher;});
        } else if (typeof matcher === 'function') {
            matcherFunc = matcher;
        } else if (matcher == null) {
            // Use a unique match anything function
            matcherFunc = myt.MessageTypeWebSocket.MATCH_ANYTHING;
        } else {
            // Invalid matcherFunc
        }
        return matcherFunc;
    },
    
    /** @private */
    _getListenersForType: function(type) {
        var retval = [],
            listeners = this._listeners,
            i = listeners.length,
            listenerInfo, patternMatchers, j;
        while (i) {
            listenerInfo = listeners[--i];
            patternMatchers = listenerInfo.patternMatchers;
            j = patternMatchers.length;
            while (j) if (patternMatchers[--j](type)) retval.push(listenerInfo.func);
        }
        return retval;
    },
    
    /** Sends a message with a type. Use this method instead of send.
        @param type:string The type of the message to send.
        @param msg:* The message value. Must be convertible to JSON.
        @returns The sent message. */
    sendTypedMessage: function(type, msg, doNotTryToConnect) {
        msg = this.createMessage(type, msg);
        if (msg) return this.send(msg, doNotTryToConnect);
    },
    
    /** Creates a new message to be sent. May be overridden by subclasses, but
        should not be used externally.
        @param type:string The type of the message to send.
        @param msg:* The message value. Must be convertible to JSON.
        @returns string The message to be sent or undefined if an
            exception occurs during JSON.stringify. */
    createMessage: function(type, msg) {
        var jsonMsg;
        try {
            jsonMsg = JSON.stringify(msg);
        } catch (ex) {
            console.error(ex);
            return;
        }
        
        return {
            type:type || '',
            msg:jsonMsg,
            date:Date.now()
        };
    },
    
    /** @overrides */
    onMessage: function(event) {
        var msg = this.callSuper(event);
        
        // Parse msg.msg JSON
        try {
            msg.msg = JSON.parse(msg.msg);
        } catch (ex) {
            this.onError(msg);
            return;
        }
        
        // Notify Listeners
        var listeners = this._getListenersForType(msg.type), i = listeners.length;
        while (i) listeners[--i](msg);
        
        return msg;
    }
});


/** A base class for tooltip classes.
    
    Events:
        None
    
    Attributes:
        tooltip:object The tooltip configuration assigned to this tooltip
            when the mouse has moved over a view with TooltipMixin.
        tipDelay:number The time in millis to wait before showing the tooltip.
        tipHideDelay:number The time in millis to wait before hiding 
            the tooltip.
    
    Private Attributes:
        __checkTipTimerId:number The timer ID used internally for delaying
            when the tip gets shown.
*/
myt.BaseTooltip = new JS.Class('BaseTooltip', myt.View, {
    include: [myt.RootView],
    
    
    // Class Methods and Attributes ////////////////////////////////////////////
    extend: {
        /** The length of time in millis before the tip is shown. */
        DEFAULT_TIP_DELAY:500,
        /** The length of time in millis before the tip is hidden. */
        DEFAULT_TIP_HIDE_DELAY:100
    },
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    initNode: function(parent, attrs) {
        var BTT = myt.BaseTooltip;
        this.tipDelay = this.nextTipDelay = BTT.DEFAULT_TIP_DELAY;
        this.tipHideDelay = BTT.DEFAULT_TIP_HIDE_DELAY;
        
        if (attrs.visible == null) attrs.visible = false;
        
        this.callSuper(parent, attrs);
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    /** Sets the tooltip info that will be displayed. 
        @param v:object with the following keys:
            parent:myt.View The view to show the tip for.
            text:string The tip text.
            tipalign:string Tip alignment, 'left' or 'right'.
            tipvalign:string Tip vertical alignment, 'above' or 'below'. */
    setTooltip: function(v) {
        if (this.inited) {
            this.tooltip = v;
            if (v) {
                this.attachToDom(myt.global.mouse, '__checkMouseMovement', 'mousemove', true);
                
                var ttp = v.parent;
                this.attachToDom(ttp, 'hideTip', 'mousedown', true);
                this.attachToDom(ttp, 'hideTip', 'mouseup', true);
            }
        }
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** @private */
    __checkMouseMovement: function(event) {
        var self = this;
        self._lastPos = myt.MouseObservable.getMouseFromEvent(event);
        if (self.__checkIn()) {
            self.__clearTimeout();
            self.__checkTipTimerId = setTimeout(
                function() {
                    delete self.__checkTipTimerId;
                    
                    // If the mouse rests in the tip's parent, show the tip.
                    if (self.__checkIn()) self.showTip();
                },
                self.nextTipDelay
            );
        }
    },
    
    /** @private */
    __clearTimeout: function() {
        if (this.__checkTipTimerId) {
            clearTimeout(this.__checkTipTimerId);
            delete this.__checkTipTimerId;
        }
    },
    
    /** Checks if the last mouse position is inside the tip's parent.
        If not inside the tip will also get hidden.
        @private
        @returns boolean: false if the tip got hidden, true otherwise. */
    __checkIn: function() {
        var tt = this.tooltip;
        if (tt) {
            var pos = this._lastPos;
            if (tt.parent.containsPoint(pos.x, pos.y)) return true;
        }
        this.hideTip();
        return false;
    },
    
    /** Called when the tip will be hidden.
        @returns boolean */
    hideTip: function(event) {
        this.__clearTimeout();
        
        var ttp = this.tooltip.parent;
        this.detachFromDom(ttp, 'hideTip', 'mousedown', true);
        this.detachFromDom(ttp, 'hideTip', 'mouseup', true);
        this.detachFromDom(myt.global.mouse, '__checkMouseMovement', 'mousemove', true);
        
        this.nextTipDelay = this.tipDelay;
        this.setVisible(false);
        
        // Don't consume mouse event since we just want to close the tip
        // as a side effect of the user action. The typical case for this is
        // the user clicking on a button while the tooltip for that button
        // is shown.
        return true;
    },
    
    /** Called when the tip will be shown.
        @returns void */
    showTip: function() {
        // Don't show tooltips while doing drag and drop since they're
        // distracting while this is going on.
        if (!myt.global.dragManager.dragView) {
            this.nextTipDelay = this.tipHideDelay;
            this.bringToFront();
            this.setVisible(true);
        }
    }
});


/** An implementation of a tooltip.
    
    Events:
        None
    
    Attributes:
        edgeWidth:number the width of the "edge" of the tip background.
        pointerInset:number The inset of the "pointer" from the left/right 
            edge of the tip.
        insetH:number The horizontal inset of the text from the edge.
        insetTop:number The top inset of the text from the edge.
        insetBottom:number The bottom inset of the text from the edge.
        shadowWidth:number The width of the shadow.
        maxTextWidth:number The maximum width for the text view in the tooltip.
        tipBgColor:string The color to use for the tip background.
        edgeColor:string The color used for the edge.
        shadowColor:string The color of the shadow.
    
    Private Attributes:
        __tipWidth:number The width of the tip text view.
*/
myt.Tooltip = new JS.Class('Tooltip', myt.BaseTooltip, {
    // Class Methods and Attributes ////////////////////////////////////////////
    extend: {
        DEFAULT_POINTER_WIDTH:7,
        DEFAULT_POINTER_HEIGHT:4,
        DEFAULT_EDGE_WIDTH:1,
        DEFAULT_POINTER_INSET:2,
        DEFAULT_HORIZONTAL_INSET:4,
        DEFAULT_TOP_INSET:2,
        DEFAULT_BOTTOM_INSET:3,
        DEFAULT_SHADOW_WIDTH:2,
        DEFAULT_MAX_TEXT_WIDTH:280,
        DEFAULT_TIP_BG_COLOR:'#dddddd',
        DEFAULT_EDGE_COLOR:'#666666',
        DEFAULT_SHADOW_COLOR:'#000000'
    },
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    initNode: function(parent, attrs) {
        var self = this,
            M = myt,
            T = M.Tooltip;
        if (attrs.pointerWidth == null) attrs.pointerWidth = T.DEFAULT_POINTER_WIDTH;
        if (attrs.pointerHeight == null) attrs.pointerHeight = T.DEFAULT_POINTER_HEIGHT;
        if (attrs.edgeWidth == null) attrs.edgeWidth = T.DEFAULT_EDGE_WIDTH;
        if (attrs.pointerInset == null) attrs.pointerInset = T.DEFAULT_POINTER_INSET;
        if (attrs.insetH == null) attrs.insetH = T.DEFAULT_HORIZONTAL_INSET;
        if (attrs.insetTop == null) attrs.insetTop = T.DEFAULT_TOP_INSET;
        if (attrs.insetBottom == null) attrs.insetBottom = T.DEFAULT_BOTTOM_INSET;
        if (attrs.shadowWidth == null) attrs.shadowWidth = T.DEFAULT_SHADOW_WIDTH;
        if (attrs.maxTextWidth == null) attrs.maxTextWidth = T.DEFAULT_MAX_TEXT_WIDTH;
        if (attrs.tipBgColor == null) attrs.tipBgColor = T.DEFAULT_TIP_BG_COLOR;
        if (attrs.edgeColor == null) attrs.edgeColor = T.DEFAULT_EDGE_COLOR;
        if (attrs.shadowColor == null) attrs.shadowColor = T.DEFAULT_SHADOW_COLOR;
        
        self.__tipWidth = 0;
        
        self.callSuper(parent, attrs);
        
        new M.Canvas(self, {
            name:'_bg', percentOfParentWidth:100, percentOfParentHeight:100
        }, [M.SizeToParent]);
        new M.Text(self, {
            name:'_tipText', fontSize:'12px',
            x:self.edgeWidth + self.insetH, whiteSpace:'inherit'
        });
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setPointerWidth: function(v) {this.pointerWidth = v;},
    setPointerHeight: function(v) {this.pointerHeight = v;},
    setEdgeWidth: function(v) {this.edgeWidth = v;},
    setPointerInset: function(v) {this.pointerInset = v;},
    setInsetH: function(v) {this.insetH = v;},
    setInsetTop: function(v) {this.insetTop = v;},
    setInsetBottom: function(v) {this.insetBottom = v;},
    setShadowWidth: function(v) {this.shadowWidth = v;},
    setMaxTextWidth: function(v) {this.maxTextWidth = v;},
    setTipBgColor: function(v) {this.tipBgColor = v;},
    setEdgeColor: function(v) {this.edgeColor = v;},
    setShadowColor: function(v) {this.shadowColor = v;},
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** @overrides myt.BaseTooltip. */
    showTip: function() {
        var self = this,
            tt = self.tooltip,
            txt = tt.text,
            ttp = tt.parent,
            tipText = self._tipText,
            insetTop = self.insetTop,
            shadowWidth = self.shadowWidth;
        
        // Set tip text
        if (tipText.text !== txt) tipText.setText(txt);
        
        // Get floating boundary
        var gwr = myt.global.windowResize,
            bounds = {x:0, y:0, width:gwr.getWidth(), height:gwr.getHeight()},
            boundsXOffset = 0, boundsYOffset = 0;
        
        // Get position of parent
        var parentPos = ttp.getPagePosition(),
            tipX = parentPos.x,
            tipParentY = parentPos.y;
        
        // Determine X position
        tipText.setWidth('auto');
        var tipTextWidth = Math.min(tipText.measureNoWrapWidth(), self.maxTextWidth),
            pointerX = tipText.x;
        self.__tipWidth = 2 * pointerX + tipTextWidth;
        tipText.setWidth(tipTextWidth);
        tipText.sizeViewToDom();
        
        if (tt.tipalign === 'right') {
            tipX += ttp.width - self.__tipWidth;
            pointerX += tipText.width - self.pointerInset - self.pointerWidth;
        } else {
            pointerX += self.pointerInset;
        }
        
        // Prevent out-of-bounds to the left
        var diff;
        if (boundsXOffset > tipX) {
            diff = boundsXOffset - tipX;
            tipX += diff;
            pointerX -= diff;
        }
        
        // Prevent out-of-bounds to the right
        if (tipX + self.__tipWidth > boundsXOffset + bounds.width) {
            diff = (tipX + self.__tipWidth) - (boundsXOffset + bounds.width);
            tipX -= diff;
            pointerX += diff;
        }
        
        // Determine Y position
        var tipHeight = 2*self.edgeWidth + insetTop + self.insetBottom + tipText.height + self.pointerHeight,
            tipParentHeight = ttp.height,
            pointerOnTop, tipY;
        switch (tt.tipvalign) {
            case "below":
                tipY = tipParentY + tipParentHeight;
                pointerOnTop = true;
                
                if (tipY + tipHeight > boundsYOffset + bounds.height) {
                    tipY = tipParentY - tipHeight;
                    pointerOnTop = false;
                }
                break;
            
            case "above":
            default:
                tipY = tipParentY - tipHeight;
                pointerOnTop = false;
                
                if (boundsYOffset > tipY) {
                    tipY = tipParentY + tipParentHeight;
                    pointerOnTop = true;
                }
                break;
        }
        
        // Apply values
        self.setX(Math.round(tipX));
        self.setY(Math.round(tipY));
        tipText.setY(insetTop + self.edgeWidth + (pointerOnTop ? self.pointerHeight : 0));
        
        self.setWidth(self.__tipWidth + shadowWidth);
        self.setHeight(tipHeight + shadowWidth);
        
        self.__redraw(pointerX, pointerOnTop);
        
        self.callSuper();
    },
    
    /** @private */
    __redraw: function(pointerX, pointerOnTop) {
        var self = this,
            canvas = self._bg,
            right = self.__tipWidth,
            top = pointerOnTop ? self.pointerHeight : 0,
            bottom = 2*self.edgeWidth + self.insetTop + self.insetBottom + self._tipText.height + top,
            pointerWidth = self.pointerWidth,
            pointerXCtr = pointerX + pointerWidth / 2,
            pointerXRt = pointerX + pointerWidth,
            pointerHeight = self.pointerHeight,
            shadowWidth = self.shadowWidth,
            edgeWidth = self.edgeWidth,
            lineTo = canvas.lineTo.bind(canvas);
        
        canvas.clear();
        
        // Draw Shadow
        canvas.beginPath();
        canvas.moveTo(shadowWidth, top + shadowWidth);
        lineTo(right + shadowWidth, top + shadowWidth);
        lineTo(right + shadowWidth, bottom + shadowWidth);
        lineTo(shadowWidth, bottom + shadowWidth);
        canvas.closePath();
        canvas.setGlobalAlpha(0.3);
        canvas.setFillStyle(self.shadowColor);
        canvas.fill();
        
        canvas.setGlobalAlpha(1);
        
        // Draw Edge
        canvas.beginPath();
        canvas.moveTo(0, top);
        
        if (pointerOnTop) {
            lineTo(pointerX, top);
            lineTo(pointerXCtr, top - pointerHeight);
            lineTo(pointerXRt, top);
        }
        
        lineTo(right, top);
        lineTo(right, bottom);
        
        if (!pointerOnTop) {
            lineTo(pointerXRt, bottom);
            lineTo(pointerXCtr, bottom + pointerHeight);
            lineTo(pointerX, bottom);
        }
        
        lineTo(0, bottom);
        canvas.closePath();
        canvas.setFillStyle(self.edgeColor);
        canvas.fill();
        
        // Draw Fill
        right -= edgeWidth;
        top += edgeWidth;
        bottom -= edgeWidth;
        
        canvas.beginPath();
        canvas.moveTo(edgeWidth, top);
        
        if (pointerOnTop) {
            lineTo(pointerX, top);
            lineTo(pointerXCtr, top - pointerHeight);
            lineTo(pointerXRt, top);
        }
        
        lineTo(right, top);
        lineTo(right, bottom);
        
        if (!pointerOnTop) {
            lineTo(pointerXRt, bottom);
            lineTo(pointerXCtr, bottom + pointerHeight);
            lineTo(pointerX, bottom);
        }
        
        lineTo(edgeWidth, bottom);
        canvas.closePath();
        canvas.setFillStyle(self.tipBgColor);
        canvas.fill();
    }
});


/** A mixin that adds tooltip support to a view.
    
    Requires:
        myt.MouseOver
    
    Events:
        tooltip:string
        tipAlign:string
        tipValign:string
        tipClass:JS.Class
    
    Attributes:
        tooltip:string The tip text to display.
        tipAlign:string The horizontal alignment of the tooltip relative to
            the view the tip is being shown for. Supported values are 'left'
            and 'right'. Defaults to 'left'.
        tipValign:string The vertical alignment of the tooltip relative to
            the view the tip is being shown for. Supported values are 'above'
            and 'below'. Defaults to 'above'.
        tipClass:JS.Class The class to use to instantiate the tooltip.
*/
myt.TooltipMixin = new JS.Module('TooltipMixin', {
    // Class Methods and Attributes ////////////////////////////////////////////
    extend: {
        /** The default class to use for tooltip views. If a project wants to use
            a special tip class everywhere it should override this. */
        DEFAULT_TIP_CLASS:myt.Tooltip
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setTooltip: function(v) {
        // Supresses the myt.View tooltip behavior.
        this.callSuper('');
        
        this.set('tooltip', v, true);
    },
    setTipAlign: function(v) {this.set('tipAlign', v, true);},
    setTipValign: function(v) {this.set('tipValign', v, true);},
    setTipClass: function(v) {this.set('tipClass', v, true);},
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** @overrides myt.MouseOver. */
    doSmoothMouseOver: function(isOver) {
        var self = this,
            M = myt,
            g = M.global,
            tooltip = self.tooltip;
        
        self.callSuper(isOver);
        
        if (isOver && tooltip) {
            // Use configured class or default if none defined.
            var tipClass = self.tipClass || M.TooltipMixin.DEFAULT_TIP_CLASS,
                tooltipView = g.tooltipView;
            
            // Destroy tip if it's not the correct class.
            if (tooltipView && !(tooltipView instanceof tipClass)) {
                g.unregister('tooltipView');
                tooltipView.destroy();
                tooltipView = null;
            }
            
            // Create new instance.
            if (!tooltipView) {
                // Create tooltip div if necessary
                var elem = document.getElementById("tooltipDiv");
                if (!elem) {
                    elem = M.DomElementProxy.createDomElement('div', {position:'absolute'});
                    
                    // Make the div a child of the body element so it can be
                    // in front of pretty much anything in the document.
                    M.getElement().appendChild(elem);
                }
                g.register('tooltipView', tooltipView = new tipClass(elem, {domId:'tooltipDiv'}));
            }
            
            tooltipView.setTooltip({
                parent:self, 
                text:tooltip, 
                tipalign:self.tipAlign || 'left', 
                tipvalign:self.tipValign || 'above'
            });
        }
    }
});


/** Provides a dependency target that pulls in all of the myt package. */
myt.all = true;

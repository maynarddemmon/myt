var JS = {};
((global, exports) => {
    'use strict';
    
    // Ordered list of unique elements, for storing dependencies ///////////////
    var OrderedSet = function(list) {
        this._members = this.list = [];
        this._index = {};
        if (list) for (var i = 0, n = list.length; i < n; i++) this.push(list[i]);
    };
    
    OrderedSet.prototype.push = function(item) {
        var key = (item.id !== undefined) ? item.id : item,
            index = this._index;
        if (!index.hasOwnProperty(key)) {
            index[key] = this._members.length;
            this._members.push(item);
        }
    };
    
    // Util ////////////////////////////////////////////////////////////////////
    var resolve = function(filename) {
        if (!/^https?:/.test(filename)) {
            var root = exports.ROOT;
            if (root) filename = (root + '/' + filename).replace(/\/+/g, '/');
        }
        return filename;
    };
    
    // Package /////////////////////////////////////////////////////////////////
    var Package = function(loader) {
        Package._index(this);
        
        this._loader    = loader;
        this._names     = new OrderedSet();
        this._deps      = new OrderedSet();
        this._uses      = new OrderedSet();
        this._observers = {};
        this._events    = {};
    };
    
    Package.ENV = exports.ENV = global;
    
    Package._throw = (message) => {throw new Error(message);};
    
    // Functions found in manifest files ///////////////////////////////////////
    var instance = Package.prototype;
    
    instance.requires = function() {
        var len = arguments.length, i = 0;
        for (; i < len;) this._deps.push(arguments[i++]);
        return this;
    };
    
    instance.uses = function() {
        var len = arguments.length, i = 0;
        for (; i < len;) this._uses.push(arguments[i++]);
        return this;
    };
    
    instance.provides = function() {
        var len = arguments.length, i = 0;
        for (; i < len; i++) {
            this._names.push(arguments[i]);
            Package._getFromCache(arguments[i]).pkg = this;
        }
        return this;
    };
    
    // Event dispatchers, for communication between packages ///////////////////
    instance._on = function(eventType, block, context) {
        if (this._events[eventType]) return block.call(context);
        var list = this._observers[eventType] = this._observers[eventType] || [];
        list.push([block, context]);
        this._load();
    };
    
    instance._fire = function(eventType) {
        if (this._events[eventType]) return false;
        this._events[eventType] = true;
        
        var list = this._observers[eventType];
        if (!list) return true;
        delete this._observers[eventType];
        
        for (var i = 0, n = list.length; i < n; i++) list[i][0].call(list[i][1]);
        
        return true;
    };
    
    // Loading frontend and other miscellany ///////////////////////////////////
    instance._isLoaded = function(withExceptions) {
        if (!withExceptions && this.__isLoaded !== undefined) return this.__isLoaded;
        
        var names = this._names.list,
            i = names.length,
            name,
            object;
        
        while (i--) {
            name = names[i];
            object = Package._getObject(name, this._exports);
            if (object !== undefined) continue;
            if (withExceptions)
                return Package._throw('Expected package at ' + this._loader + ' to define ' + name);
            else
                return this.__isLoaded = false;
        }
        return this.__isLoaded = true;
    };
    
    instance._load = function() {
        if (!this._fire('request')) return;
        if (!this._isLoaded()) this._prefetch();
    
        var allDeps = this._deps.list.concat(this._uses.list),
            source  = this._source || [],
            n       = (this._loader || {}).length,
            self    = this;
    
        Package.when({load: allDeps});
    
        Package.when({complete: this._deps.list}, function() {
            Package.when({complete: allDeps, load: [this]}, function() {
                this._fire('complete');
            }, this);
    
            var loadNext = function(exports) {
                if (n === 0) return fireOnLoad(exports);
                n -= 1;
                var index = self._loader.length - n - 1;
                Package.loader.loadFile(self._loader[index], loadNext, source[index]);
            };
            
            var fireOnLoad = function(exports) {
                self._exports = exports;
                if (self._onload) self._onload();
                self._isLoaded(true);
                self._fire('load');
            };
            
            if (this._isLoaded()) {
                this._fire('download');
                return this._fire('load');
            }
            
            if (this._loader === undefined) return Package._throw('No load path found for ' + this._names.list[0]);
            
            if (typeof this._loader === 'function')
                this._loader(fireOnLoad);
            else
                loadNext();
        }, this);
    };
    
    instance._prefetch = function() {
        if (this._source || !(this._loader instanceof Array) || !Package.loader.fetch) return;
        this._source = [];
        for (var i = 0, n = this._loader.length; i < n; i++) this._source[i] = Package.loader.fetch(this._loader[i]);
    };
    
    // Class-level event API, handles group listeners //////////////////////////
    Package.when = function(eventTable, block, context) {
        var eventList = [],
            objects = {},
            event, packages, i;
        for (event in eventTable) {
            if (!eventTable.hasOwnProperty(event)) continue;
            objects[event] = [];
            packages = new OrderedSet(eventTable[event]);
            i = packages.list.length;
            while (i--) eventList.push([event, packages.list[i], i]);
        }
    
        var waiting = i = eventList.length;
        if (waiting === 0) return block && block.call(context, objects);
    
        while (i--) {
            (function(event) {
                var pkg = Package._getByName(event[1]);
                pkg._on(event[0], function() {
                    objects[event[0]][event[2]] = Package._getObject(event[1], pkg._exports);
                    waiting -= 1;
                    if (waiting === 0 && block) block.call(context, objects);
                });
            })(eventList[i]);
        }
    };
    
    // Indexes for fast lookup by path and name, and assigning IDs /////////////
    Package._autoIncrement = 1;
    Package._indexByPath = {};
    Package._indexByName = {};
    
    Package._index = function(pkg) {
        pkg.id = this._autoIncrement;
        this._autoIncrement += 1;
    };
    
    Package._getByPath = function(loader) {
        var path = loader.toString(),
            pkg  = this._indexByPath[path];
        
        if (pkg) return pkg;
        
        if (typeof loader === 'string') loader = [].slice.call(arguments);
        
        pkg = this._indexByPath[path] = new this(loader);
        return pkg;
    };
    
    Package._getByName = function(name) {
        if (typeof name !== 'string') return name;
        var cached = this._getFromCache(name);
        if (cached.pkg) return cached.pkg;
        
        var placeholder = new this();
        placeholder.provides(name);
        return placeholder;
    };
    
    // Cache for named packages and runtime objects ////////////////////////////
    Package._getFromCache = function(name) {
        return this._indexByName[name] = this._indexByName[name] || {};
    };
    
    Package._getObject = function(name, rootObject) {
        if (typeof name !== 'string') return undefined;
        
        var cached = rootObject ? {} : this._getFromCache(name);
        if (cached.obj !== undefined) return cached.obj;
        
        var object = rootObject || this.ENV,
            parts  = name.split('.'), part;
        
        while (part = parts.shift()) object = object && object[part];
        
        if (rootObject && object === undefined) return this._getObject(name);
        
        return cached.obj = object;
    };
    
    // Wrapper for deferred values /////////////////////////////////////////////
    var Deferred = Package.Deferred = function() {
        this._status    = 'deferred';
        this._value     = null;
        this._callbacks = [];
    };
    
    Deferred.prototype.callback = function(callback, context) {
        if (this._status === 'succeeded') callback.call(context, this._value);
        else this._callbacks.push([callback, context]);
    };
    
    Deferred.prototype.succeed = function(value) {
        this._status = 'succeeded';
        this._value  = value;
        var callback;
        while (callback = this._callbacks.shift()) callback[0].call(callback[1], value);
    };
    
    Package.loader = {
        HOST_REGEX: /^(https?\:)?\/\/[^\/]+/i,
        
        __FILE__: function() {
            var scripts = document.getElementsByTagName('script'),
                src     = scripts[scripts.length - 1].src,
                url     = window.location.href;
            
            if (/^\w+\:\/+/.test(src)) return src;
            if (/^\//.test(src)) return window.location.origin + src;
            return url.replace(/[^\/]*$/g, '') + src;
        },
        
        cacheBust: function(path) {
            if (exports.cache !== false) return path;
            return path + (/\?/.test(path) ? '&' : '?') + new Date().getTime();
        },
        
        fetch: function(path) {
            var originalPath = path;
            path = this.cacheBust(path);
            
            this.HOST = this.HOST || this.HOST_REGEX.exec(window.location.href);
            var host = this.HOST_REGEX.exec(path);
            
            if (!this.HOST || (host && host[0] !== this.HOST[0])) return null;
            
            var source = new Package.Deferred(),
                self   = this,
                xhr    = new XMLHttpRequest();
            
            xhr.open('GET', path, true);
            xhr.onreadystatechange = () => {
            if (xhr.readyState === 4) {
                xhr.onreadystatechange = self._K;
                if (xhr.status !== 200) {
                    console.error('Manifest loading error for file:' + originalPath);
                } else {
                    source.succeed(xhr.responseText + '\n//# sourceURL=' + originalPath);
                }
                xhr = null;
            }
            };
            xhr.send(null);
            return source;
        },
        
        loadFile: function(path, fireCallbacks, source) {
            if (!source) path = this.cacheBust(path);
            
            var self   = this,
                head   = document.getElementsByTagName('head')[0],
                script = document.createElement('script');
            
            script.type = 'text/javascript';
            
            if (source) {
                return source.callback(function(code) {
                    var execute = new Function('code', 'eval(code)');
                    execute(code);
                    fireCallbacks();
                });
            };
            
            script.src = path;
            
            script.onload = script.onreadystatechange = function() {
                var state = script.readyState,
                    status = script.status;
                if (!state || state === 'loaded' || state === 'complete' || (state === 4 && status === 200)) {
                    fireCallbacks();
                    script.onload = script.onreadystatechange = self._K;
                    head = null;
                    script = null;
                }
            };
            head.appendChild(script);
        },
        
        _K: function() {}
    };
    
    exports.Packages = function(declaration) {
        declaration.call({
            file: function(filename) {
                var files = [],
                    i = arguments.length;
                while (i--) files[i] = resolve(arguments[i]);
                return Package._getByPath.apply(Package, files);
            }
        });
    };
    
    exports.require = function() {
        var files = [],
            i = 0,
            callback,
            context;
        
        while (typeof arguments[i] === 'string'){
            files.push(arguments[i]);
            i += 1;
        }
        callback = arguments[i];
        context = arguments[i + 1];
        
        Package.when({complete:files}, function(objects) {
            if (callback) callback.apply(context, objects && objects.complete);
        });
        
        return this;
    };
})(global, JS);
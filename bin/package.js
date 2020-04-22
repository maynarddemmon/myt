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
                loadFile(self._loader[index], loadNext, source[index]);
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
        if (!pkg) {
            if (typeof loader === 'string') loader = [].slice.call(arguments);
            pkg = this._indexByPath[path] = new this(loader);
        }
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
    
    // File Loader /////////////////////////////////////////////////////////////
    var loadFile = (path, fireCallbacks) => {
        var file, module;
        
        if (typeof process !== 'undefined') {
            module = path.replace(/\.[^\.]+$/g, '');
            file   = require('path').resolve(module);
        } else if (typeof phantom !== 'undefined') {
            file = phantom.libraryPath.replace(/\/$/, '') + '/' +
            path.replace(/^\//, '');
        }
        
        var module = require(file);
        fireCallbacks(module);
        
        return module;
    };
    
    // Exports /////////////////////////////////////////////////////////////////
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
    
    exports.Package = Package;
})(global, exports);
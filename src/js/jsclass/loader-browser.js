((global, exports) => {
    'use strict';
    
    // Ordered list of unique elements, for storing dependencies ///////////////
    const OrderedSet = function(list) {
        this._members = this.list = [];
        this._index = {};
        if (list) for (let i = 0, n = list.length; i < n;) this.push(list[i++]);
    };
    
    OrderedSet.prototype.push = function(item) {
        const key = (item.id !== undefined) ? item.id : item,
            index = this._index;
        if (!index.hasOwnProperty(key)) {
            index[key] = this._members.length;
            this._members.push(item);
        }
    };
    
    // Util ////////////////////////////////////////////////////////////////////
    const resolve = filename => {
            if (!/^https?:/.test(filename) && exports.ROOT) filename = (exports.ROOT + '/' + filename).replace(/\/+/g, '/');
            return filename;
        },
    
    // Package /////////////////////////////////////////////////////////////////
        Package = function(loader) {
            Package._index(this);
            
            this._loader    = loader;
            this._names     = new OrderedSet();
            this._deps      = new OrderedSet();
            this._uses      = new OrderedSet();
            this._observers = {};
            this._events    = {};
        };
    
    Package.ENV = exports.ENV = global;
    
    Package._throw = message => {throw new Error(message);};
    
    // Functions found in manifest files ///////////////////////////////////////
    const instance = Package.prototype;
    
    instance.requires = function() {
        const len = arguments.length;
        for (let i = 0; i < len;) this._deps.push(arguments[i++]);
        return this;
    };
    
    instance.uses = function() {
        const len = arguments.length;
        for (let i = 0; i < len;) this._uses.push(arguments[i++]);
        return this;
    };
    
    instance.provides = function() {
        const len = arguments.length;
        for (let i = 0; i < len; i++) {
            this._names.push(arguments[i]);
            Package._getFromCache(arguments[i]).pkg = this;
        }
        return this;
    };
    
    // Event dispatchers, for communication between packages ///////////////////
    instance._on = function(eventType, block, context) {
        if (this._events[eventType]) return block.call(context);
        const list = this._observers[eventType] = this._observers[eventType] || [];
        list.push([block, context]);
        this._load();
    };
    
    instance._fire = function(eventType) {
        if (this._events[eventType]) return false;
        this._events[eventType] = true;
        
        const list = this._observers[eventType];
        if (list) {
            delete this._observers[eventType];
            for (let i = 0, n = list.length; i < n; i++) list[i][0].call(list[i][1]);
        }
        return true;
    };
    
    // Loading frontend and other miscellany ///////////////////////////////////
    instance._isLoaded = function(withExceptions) {
        if (!withExceptions && this.__isLoaded !== undefined) return this.__isLoaded;
        
        const names = this._names.list;
        let i = names.length;
        while (i--) {
            const name = names[i],
                object = Package._getObject(name, this._exports);
            if (object === undefined) {
                if (withExceptions) {
                    return Package._throw('Expected package at ' + this._loader + ' to define ' + name);
                } else {
                    return this.__isLoaded = false;
                }
            }
        }
        return this.__isLoaded = true;
    };
    
    instance._load = function() {
        const self = this;
        if (self._fire('request')) {
            if (!self._isLoaded()) {
                if (!self._source && (self._loader instanceof Array)) {
                    self._source = [];
                    for (let i = 0, len = self._loader.length; i < len; i++) {
                        self._source[i] = fetchFile(self._loader[i]);
                    }
                }
            }
            
            const allDeps = self._deps.list.concat(self._uses.list),
                source = self._source || [];
            let n = (self._loader || {}).length;
            
            Package.when({load: allDeps});
            
            Package.when({complete:self._deps.list}, function() {
                Package.when({complete: allDeps, load: [this]}, function() {
                    this._fire('complete');
                }, this);
                
                const loadNext = exports => {
                        if (n === 0) return fireOnLoad(exports);
                        n--;
                        const index = self._loader.length - n - 1;
                        loadFile(self._loader[index], loadNext, source[index]);
                    },
                    fireOnLoad = exports => {
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
                
                if (typeof this._loader === 'function') {
                    this._loader(fireOnLoad);
                } else {
                    loadNext();
                }
            }, self);
        }
    };
    
    // Class-level event API, handles group listeners //////////////////////////
    Package.when = (eventTable, block, context) => {
        const eventList = [],
            objects = {};
        let packages,
            i;
        for (const event in eventTable) {
            if (!eventTable.hasOwnProperty(event)) continue;
            objects[event] = [];
            packages = new OrderedSet(eventTable[event]);
            i = packages.list.length;
            while (i--) eventList.push([event, packages.list[i], i]);
        }
        
        let waiting = i = eventList.length;
        if (waiting === 0) return block && block.call(context, objects);
        
        while (i--) {
            (event => {
                const pkg = Package._getByName(event[1]);
                pkg._on(event[0], () => {
                    objects[event[0]][event[2]] = Package._getObject(event[1], pkg._exports);
                    if (--waiting === 0 && block) block.call(context, objects);
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
        this._autoIncrement++;
    };
    
    Package._getByPath = function(loader) {
        const path = loader.toString();
        let pkg = this._indexByPath[path];
        if (!pkg) {
            if (typeof loader === 'string') loader = [].slice.call(arguments);
            pkg = this._indexByPath[path] = new this(loader);
        }
        return pkg;
    };
    
    Package._getByName = function(name) {
        if (typeof name !== 'string') return name;
        const cached = this._getFromCache(name);
        if (cached.pkg) return cached.pkg;
        
        const placeholder = new this();
        placeholder.provides(name);
        return placeholder;
    };
    
    // Cache for named packages and runtime objects ////////////////////////////
    Package._getFromCache = function(name) {
        return this._indexByName[name] = this._indexByName[name] || {};
    };
    
    Package._getObject = function(name, rootObject) {
        if (typeof name === 'string') {
            const cached = rootObject ? {} : this._getFromCache(name);
            if (cached.obj !== undefined) return cached.obj;
            
            let object = rootObject || this.ENV,
                part;
            const parts = name.split('.');
            
            while (part = parts.shift()) object = object && object[part];
            
            if (rootObject && object === undefined) return this._getObject(name);
            
            return cached.obj = object;
        }
    };
    
    // Wrapper for deferred values /////////////////////////////////////////////
    const Deferred = Package.Deferred = function() {
        this._status    = 'deferred';
        this._value     = null;
        this._callbacks = [];
    };
    
    Deferred.prototype.callback = function(callback, context) {
        if (this._status === 'succeeded') {
            callback.call(context, this._value);
        } else {
            this._callbacks.push([callback, context]);
        }
    };
    
    Deferred.prototype.succeed = function(value) {
        this._status = 'succeeded';
        this._value  = value;
        let callback;
        while (callback = this._callbacks.shift()) callback[0].call(callback[1], value);
    };
    
    // File Loader /////////////////////////////////////////////////////////////
    const HOST_REGEX = /^(https?\:)?\/\/[^\/]+/i,
        WINDOW_HOST = HOST_REGEX.exec(window.location.href),
        
        fetchFile = path => {
            const pathHost = HOST_REGEX.exec(path);
            
            // Don't use browser fetch API for cross-origin requests.
            if (WINDOW_HOST && (!pathHost || pathHost[0] === WINDOW_HOST[0])) {
                const source = new Package.Deferred();
                
                fetch(path, {method:'GET'}).then(
                    response => {
                        if (response.ok) {
                            return response.text();
                        } else {
                            throw new Error('Manifest loading error for:' + path);
                        }
                    }
                ).then(
                    response => {
                        source.succeed(response + '\n//# sourceURL=' + path);
                    }
                );
                
                return source;
            }
        },
        
        loadFile = (path, fireCallbacks, source) => {
            if (source) {
                // The fetch function retrieved the code.
                return source.callback(code => {
                    const execute = new Function('code', 'eval(code)');
                    execute(code);
                    fireCallbacks();
                });
            } else {
                // Fully qualified URL from another domain so fetch didn't
                // retrieve the code. We use a script tag instead.
                let head = document.getElementsByTagName('head')[0],
                    script = document.createElement('script');
                
                script.type = 'text/javascript';
                script.src = path;
                
                script.onload = script.onreadystatechange = () => {
                    const state = script.readyState,
                        status = script.status;
                    if (!state || state === 'loaded' || state === 'complete' || (state === 4 && status === 200)) {
                        fireCallbacks();
                        script.onload = script.onreadystatechange = () => {};
                        head = null;
                        script = null;
                    }
                };
                head.appendChild(script);
            }
        };
    
    // Exports /////////////////////////////////////////////////////////////////
    exports.Packages = declaration => {
        declaration.call({
            file: function(filename) {
                const files = [];
                let i = arguments.length;
                while (i--) files[i] = resolve(arguments[i]);
                return Package._getByPath.apply(Package, files);
            }
        });
    };
    
    exports.require = function() {
        const files = [];
        let i = 0;
        while (typeof arguments[i] === 'string') files.push(arguments[i++]);
        const callback = arguments[i++],
            context = arguments[i];
        Package.when({complete:files}, objects => {
            if (callback) callback.apply(context, objects && objects.complete);
        });
        return this;
    };
})(global, global.JS = global.JS || {});
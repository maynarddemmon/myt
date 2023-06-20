((global, exports) => {
    // Ordered list of unique elements, for storing dependencies ///////////////
    const OrderedSet = function(list) {
        this.list = [];
        this._index = {};
        if (list) this.push(...list);
    };
    
    OrderedSet.prototype.push = function(...items) {
        items.forEach(item => {
            const key = (item.id !== undefined) ? item.id : item,
                index = this._index;
            if (!index.hasOwnProperty(key)) {
                index[key] = this.list.length;
                this.list.push(item);
            }
        });
    };
    
    // Package /////////////////////////////////////////////////////////////////
    let autoIncrement = 1;
    
    const HTTP_REGEX = /^https?:/i,
        
        indexByPath = {},
        indexByName = {},
        
        getFromCache = name => indexByName[name] ??= {},
        
        getObject = function(name, rootObject) {
            if (typeof name === 'string') {
                const cached = rootObject ? {} : getFromCache(name);
                if (cached.obj !== undefined) return cached.obj;
                
                let object = rootObject ?? global,
                    part;
                const parts = name.split('.');
                
                while (part = parts.shift()) object = object && object[part];
                
                if (rootObject && object === undefined) return getObject(name);
                
                return cached.obj = object;
            }
        },
        
        getByName = name => {
            if (typeof name === 'string') {
                const cached = getFromCache(name);
                if (cached.pkg) {
                    return cached.pkg;
                } else {
                    const pkg = new Package();
                    pkg.provides(name);
                    return pkg;
                }
            } else {
                return name;
            }
        },
        
        when = (eventTable, block, context) => {
            const eventList = [],
                objects = {};
            let packages,
                i;
            for (const event in eventTable) {
                if (eventTable.hasOwnProperty(event)) {
                    objects[event] = [];
                    packages = new OrderedSet(eventTable[event]);
                    i = packages.list.length;
                    while (i--) eventList.push([event, packages.list[i], i]);
                }
            }
            
            let waiting = i = eventList.length;
            if (waiting === 0) return block?.call(context, objects);
            
            while (i--) {
                (event => {
                    const pkg = getByName(event[1]);
                    
                    pkg._on(event[0], () => {
                        objects[event[0]][event[2]] = getObject(event[1], pkg._exports);
                        if (--waiting === 0) block?.call(context, objects);
                    });
                })(eventList[i]);
            }
        },
        
        Package = function(loader) {
            this.id = autoIncrement;
            autoIncrement++;
            
            this._loader    = loader;
            this._names     = new OrderedSet();
            this._deps      = new OrderedSet();
            this._uses      = new OrderedSet();
            this._observers = {};
            this._events    = {};
        },
    
    // Functions found in manifest files ///////////////////////////////////////
        PackageProto = Package.prototype;
    
    PackageProto.provides = function(...args) {
        args.forEach(item => {getFromCache(item).pkg = this;});
        this._names.push(...args);
        return this;
    };
    
    PackageProto.requires = function(...args) {
        this._deps.push(...args);
        return this;
    };
    
    PackageProto.uses = function(...args) {
        this._uses.push(...args);
        return this;
    };
    
    // Event dispatchers, for communication between packages ///////////////////
    PackageProto._on = function(eventType, block, context) {
        const self = this;
        
        if (self._events[eventType]) return block.call(context);
        const list = self._observers[eventType] ??= [];
        list.push([block, context]);
        
        // Load
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
                source = self._source ?? [];
            let n = (self._loader ?? {}).length;
            
            when({load: allDeps});
            
            when({complete:self._deps.list}, function() {
                when({complete:allDeps, load:[this]}, function() {
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
                        self._onload?.();
                        self._isLoaded(true);
                        self._fire('load');
                    };
                
                if (this._isLoaded()) {
                    this._fire('download');
                    return this._fire('load');
                }
                
                if (this._loader === undefined) throw new Error('No load path found for ' + this._names.list[0]);
                
                if (typeof this._loader === 'function') {
                    this._loader(fireOnLoad);
                } else {
                    loadNext();
                }
            }, self);
        }
    };
    
    PackageProto._fire = function(eventType) {
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
    PackageProto._isLoaded = function(withExceptions) {
        if (!withExceptions && this.__isLoaded !== undefined) return this.__isLoaded;
        
        const names = this._names.list;
        let i = names.length;
        while (i--) {
            const name = names[i],
                object = getObject(name, this._exports);
            if (object === undefined) {
                if (withExceptions) {
                    throw new Error('Expected package at ' + this._loader + ' to define ' + name);
                } else {
                    return this.__isLoaded = false;
                }
            }
        }
        return this.__isLoaded = true;
    };
    
    // Class Functions for Package /////////////////////////////////////////////
    Package.ENV = exports.ENV = global;
    
    Package.extractFilePaths = include => {
        // Creates the list of packages needed for the include list. Resolves the depends and uses 
        // information so that the resulting packages list is in dependency order.
        const packages = [],
            includedFiles = [],
            expand = name => {
                const pkg = getByName(name);
                pkg._deps.list.forEach(p => {expand(p);});
                if (!packages.includes(pkg)) packages.push(pkg);
                pkg._uses.list.forEach(p => {expand(p);});
            };
        include.forEach(p => {expand(p);});
        
        // Extract the file paths out of the packages list. This is necessary because each file() 
        // declaration in the manifest file can declare more than one file.
        packages.forEach(pkg => {
            let paths = pkg._loader;
            if (!(paths instanceof Array)) throw new Error('Cannot bundle ' + pkg + ': no path specified in your manifest');
            paths = paths.filter(p => !HTTP_REGEX.test(p));
            paths.forEach(loader => {includedFiles.push(loader)});
        });
        
        return includedFiles;
    };
    
    // Deferred values used with fetchFile /////////////////////////////////////
    const Deferred = function() {};
    
    Deferred.prototype.callback = function(callback, context) {
        callback.bind(context);
        if (this._status === 'succeeded') {
            callback(this._value);
        } else {
            (this._callbacks ??= []).push(callback);
        }
    };
    
    Deferred.prototype.succeed = function(value) {
        this._status = 'succeeded';
        this._value  = value;
        const callbacks = this._callbacks ?? [];
        while (callbacks.length) callbacks.shift()(value);
    };
    
    // File Loader /////////////////////////////////////////////////////////////
    const loadFile = (path, fireCallbacks) => {
        let file,
            module;
        
        if (typeof process !== 'undefined') {
            module = path.replace(/\.[^\.]+$/g, '');
            file   = require('path').resolve(module);
        } else if (typeof phantom !== 'undefined') {
            file = phantom.libraryPath.replace(/\/$/, '') + '/' +
            path.replace(/^\//, '');
        }
        
        module = require(file);
        fireCallbacks(module);
        
        return module;
    };
    
    // Exports /////////////////////////////////////////////////////////////////
    exports.Packages = manifestFunc => {
        manifestFunc(
            // The "file" function used inside the manifestFunc.
            (...args) => {
                const ROOT_PATH = exports.ROOT,
                    resolved = args.map(
                        filename => (!HTTP_REGEX.test(filename) && ROOT_PATH) ? ROOT_PATH + '/' + filename : filename
                    );
                let loader = resolved[0],
                    path = loader.toString(),
                    pkg = indexByPath[path];
                if (pkg) {
                    return pkg;
                } else {
                    return indexByPath[path] = new Package(typeof loader === 'string' ? resolved : loader);
                }
            }
        );
    };
    
    exports.require = (...args) => {
        const files = [];
        let i = 0;
        while (typeof args[i] === 'string') files.push(args[i++]);
        const callback = args[i++].bind(args[i]);
        when({complete:files}, objects => {callback(objects?.complete);});
    };
    
    exports.Package = Package;
})(global, exports);
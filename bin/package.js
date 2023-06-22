((global, exports) => {
    // Package /////////////////////////////////////////////////////////////////
    let autoIncrement = 1;
    
    const HTTP_REGEX = /^https?:/i,
        
        // Ordered list of unique elements, for storing dependencies
        OrderedSet = function(initialList) {
            const self = this,
                index = {},
                list = self.list = [],
                push = self.push = (...items) => {
                    items.forEach(item => {
                        const key = item.id ?? item;
                        if (!index.hasOwnProperty(key)) {
                            index[key] = true;
                            list.push(item);
                        }
                    });
                };
            
            if (initialList) push(...initialList);
        },
        
        indexByName = {},
        
        getFromCache = name => indexByName[name] ??= {},
        
        getObject = name => {
            if (typeof name === 'string') {
                const cached = getFromCache(name);
                if (cached.obj !== undefined) return cached.obj;
                
                const parts = name.split('.');
                
                let object = global,
                    part;
                while (part = parts.shift()) object = object && object[part];
                
                return cached.obj = object;
            }
        },
        
        getByName = name => typeof name === 'string' ? getFromCache(name)?.pkg : name,
        
        when = (eventTable, block) => {
            const eventList = [],
                objects = {};
            for (const event in eventTable) {
                if (eventTable.hasOwnProperty(event)) {
                    objects[event] = [];
                    const packageList = (new OrderedSet(eventTable[event])).list;
                    let i = packageList.length;
                    while (i--) eventList.push([event, packageList[i], i]);
                }
            }
            
            let waiting = eventList.length,
                i = waiting;
            if (waiting === 0) return block?.(objects);
            
            while (i--) {
                const [eventName, objName, idx] = eventList[i],
                    pkg = getByName(objName);
                
                if (!pkg) throw new Error(objName + ' required to exist');
                
                // Event dispatch, for communication between packages
                const eventCallback = () => {
                    objects[eventType][idx] = getObject(objName);
                    if (--waiting === 0) block?.(objects);
                };
                if (pkg._events[eventType]) {
                    eventCallback();
                } else {
                    (pkg._observers[eventType] ??= []).push(eventCallback);
                    
                    // Load
                    if (fire(pkg, 'request')) {
                        const loader = pkg._loader,
                            deps = pkg._deps.list,
                            source = pkg._source ?? [];
                        let n = loader.length;
                        
                        when({complete:deps}, () => {
                            when({complete:deps, load:[pkg]}, () => {fire(pkg, 'complete');});
                            
                            if (isLoaded(pkg)) {
                                fire(pkg, 'load');
                            } else {
                                const loadNext = () => {
                                    if (n === 0) {
                                        isLoaded(pkg);
                                        fire(pkg, 'load');
                                    } else {
                                        const index = loader.length - n;
                                        n--;
                                        loadFile(loader[index], loadNext, source[index]);
                                    }
                                };
                                loadNext();
                            }
                        });
                    }
                }
            }
        },
        
        fire = (pkg, eventType) => {
            const events = pkg._events,
                observers = pkg._observers;
            if (events[eventType]) {
                return false;
            } else {
                events[eventType] = true;
                const observersForEvent = observers[eventType];
                if (observersForEvent) {
                    delete observers[eventType];
                    observersForEvent.forEach(callback => {callback();});
                }
                return true;
            }
        },
        
        isLoaded = pkg => {
            if (pkg._isLoaded === undefined) {
                const names = pkg._names.list;
                let i = names.length;
                while (i--) {
                    if (getObject(names[i]) === undefined) return pkg._isLoaded = false;
                }
                return pkg._isLoaded = true;
            } else {
                return pkg._isLoaded;
            }
        },
        
        Package = exports.Package = function(loader) {
            const self = this,
                names = self._names = new OrderedSet(),
                deps = self._deps = new OrderedSet();
            
            self.id = autoIncrement++;
            self._loader = loader;
            self._observers = {};
            self._events = {};
            
            // Functions found in manifest files
            self.provides = (...args) => {
                args.forEach(item => {getFromCache(item).pkg = self;});
                names.push(...args);
                return self;
            };
            
            self.requires = (...args) => {
                deps.push(...args);
                return self;
            };
        };
    
    // Class Functions for Package /////////////////////////////////////////////
    Package.ENV = exports.ENV = global;
    
    Package.extractFilePaths = include => {
        // Creates the list of packages needed for the include list. Resolves the .requires() 
        // information so that the resulting packages list is in dependency order.
        const packages = [],
            includedFiles = [],
            expand = name => {
                const pkg = getByName(name);
                pkg._deps.list.forEach(p => {expand(p);});
                if (!packages.includes(pkg)) packages.push(pkg);
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
            (...args) => new Package(args.map(filename => !HTTP_REGEX.test(filename) && exports.ROOT ? exports.ROOT + '/' + filename : filename))
        );
    };
    
    exports.require = (...args) => {
        const files = [];
        let i = 0;
        while (typeof args[i] === 'string') files.push(args[i++]);
        when({complete:files}, args[i]);
    };
})(global, exports);

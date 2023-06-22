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
        
        // Deferred values used with fetchFile
        Deferred = function() {
            const self = this,
                callbacks = [];
            let succeeded,
                value;
            self.callback = callbackFunc => {
                if (succeeded) {
                    callbackFunc(value);
                } else {
                    callbacks.push(callbackFunc);
                }
            };
            self.succeed = v => {
                succeeded = true;
                value = v;
                while (callbacks.length) callbacks.shift()(v);
            };
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
                const [eventType, objName, idx] = eventList[i],
                    pkg = typeof objName === 'string' ? getFromCache(objName)?.pkg : objName;
                
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
                        const loader = pkg._loader;
                        
                        if (!isLoaded(pkg) && !pkg._source) {
                            pkg._source = [];
                            for (let j = 0, len = loader.length; j < len; j++) {
                                pkg._source[j] = fetchFile(loader[j]);
                            }
                        }
                        
                        const deps = pkg._deps.list,
                            source = pkg._source ?? [];
                        let n = loader.length;
                        
                        when(
                            {complete:deps}, 
                            () => {
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
                            }
                        );
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
        
        Package = function(loader) {
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
    
    // File Loader /////////////////////////////////////////////////////////////
    const HOST_REGEX = /^(https?\:)?\/\/[^\/]+/i,
        WINDOW_HOST = HOST_REGEX.exec(window.location.href),
        
        fetchFile = path => {
            const pathHost = HOST_REGEX.exec(path);
            
            // Don't use browser fetch API for cross-origin requests.
            if (WINDOW_HOST && (!pathHost || pathHost[0] === WINDOW_HOST[0])) {
                const source = new Deferred();
                
                fetch(path, {method:'GET'}).then(
                    response => {
                        if (response.ok) {
                            return response.text();
                        } else {
                            throw new Error('Manifest load error:' + path);
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
                // The fetch function will retrieve the code.
                source.callback(code => {
                    (new Function(code))();
                    fireCallbacks();
                });
            } else {
                // Fully qualified URL from another domain so fetch can't retrieve the code. 
                // We use a script tag instead.
                let head = document.getElementsByTagName('head')[0],
                    script = document.createElement('script');
                
                script.type = 'text/javascript';
                script.src = path;
                script.onload = script.onreadystatechange = () => {
                    const state = script.readyState;
                    if (!state || state === 'loaded' || state === 'complete' || (state === 4 && script.status === 200)) {
                        fireCallbacks();
                        script.onload = script.onreadystatechange = () => {};
                        head = script = null;
                    }
                };
                head.appendChild(script);
            }
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
})(global, global.JS = global.JS ?? {});

((global, exports) => {
    const HTTP_REGEX = /^https?:/i,
        
        pkgByName = {}, // Each entry will be: <name>:{pkg:<Package>, obj:Object}
        getPkgByName = name => pkgByName[name] ??= {},
        
        getPkgObject = name => {
            if (typeof name === 'string') {
                const pkg = getPkgByName(name);
                if (pkg.obj === undefined) {
                    const parts = name.split('.');
                    let object = global,
                        part;
                    while (part = parts.shift()) object = object && object[part];
                    pkg.obj = object;
                }
                return pkg.obj;
            }
        },
        
        Deferred = function() {
            const callbacks = [];
            let succeeded,
                value;
            this.callback = callbackFunc => {
                if (succeeded) {
                    callbackFunc(value);
                } else {
                    callbacks.push(callbackFunc);
                }
            };
            this.succeed = v => {
                succeeded = true;
                value = v;
                while (callbacks.length) callbacks.shift()(v);
            };
        },
        
        when = (eventTable, block) => {
            const eventList = [],
                objects = {};
            for (const event in eventTable) {
                objects[event] = [];
                const packageList = new Set(eventTable[event]);
                let i = packageList.size;
                for (const item of packageList) eventList.unshift([event, item, --i]);
            }
            
            let waiting = eventList.length;
            if (waiting === 0) return block?.(objects);
            let i = waiting;
            
            while (i--) {
                const [eventType, objName, idx] = eventList[i],
                    pkg = typeof objName === 'string' ? getPkgByName(objName)?.pkg : objName;
                
                if (!pkg) throw new Error(objName + ' required to exist');
                
                // Event dispatch, for communication between packages
                const eventCallback = () => {
                    objects[eventType][idx] = getPkgObject(objName);
                    if (--waiting === 0) block?.(objects);
                };
                if (pkg[eventType]) {
                    eventCallback();
                } else {
                    (pkg._observers[eventType] ??= []).push(eventCallback);
                    
                    // Load
                    if (!pkg.request) {
                        pkg.request = true;
                        const paths = pkg._paths;
                        if (!isLoaded(pkg) && !pkg._source) {
                            const source = pkg._source = [];
                            for (const path of paths) {
                                const deferred = new Deferred();
                                source.push(deferred);
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
                                        deferred.succeed(response + '\n//# sourceURL=' + path);
                                    }
                                );
                            }
                        }
                        
                        const deps = Array.from(pkg._deps),
                            source = pkg._source ?? [],
                            pathsLen = paths.length;
                        let n = pathsLen;
                        when(
                            {complete:deps}, 
                            () => {
                                when(
                                    {complete:deps, load:[pkg]}, 
                                    () => {fire(pkg, 'complete');}
                                );
                                
                                if (isLoaded(pkg)) {
                                    fire(pkg, 'load');
                                } else {
                                    const loadNext = () => {
                                        if (n === 0) {
                                            isLoaded(pkg);
                                            fire(pkg, 'load');
                                        } else {
                                            n--;
                                            source[pathsLen - 1 - n].callback(code => {
                                                (new Function(code))();
                                                loadNext();
                                            });
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
            if (!pkg[eventType]) {
                pkg[eventType] = true;
                const observersForEvent = pkg._observers[eventType];
                if (observersForEvent) {
                    delete pkg._observers[eventType];
                    for (const callback of observersForEvent) callback();
                }
            }
        },
        
        isLoaded = pkg => {
            if (pkg._isLoaded === undefined) {
                for (const name of pkg._names) {
                    if (getPkgObject(name) === undefined) return pkg._isLoaded = false;
                }
                return pkg._isLoaded = true;
            } else {
                return pkg._isLoaded;
            }
        },
        
        Package = function(paths) {
            const self = this,
                names = self._names = new Set(),
                deps = self._deps = new Set();
            
            self._paths = paths;
            self._observers = {}; // Event observers.
            self.request = self.complete = self.load = false; // Events start as false.
            
            // Functions found in manifest files
            self.provides = (...args) => {
                for (const arg of args) {
                    getPkgByName(arg).pkg = self;
                    names.add(arg);
                }
                return self;
            };
            self.requires = (...args) => {
                for (const arg of args) deps.add(arg);
                return self;
            };
        };
    
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

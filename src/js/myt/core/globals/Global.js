(pkg => {
    const consoleWarn = console.warn,
    
        /** Holds references to "global" objects. Fires events when these globals are registered 
            and unregistered.
            
            Events:
                register<key>:object Fired when an object is stored under the key.
                unregister<key>:object Fired when an object is removed from the key.
            
            @class */
        globalRegistry = pkg.global = new JS.Singleton('Global', {
            include: [pkg.Observable],
            
            
            // Constructor /////////////////////////////////////////////////////
            initialize: pkg.NOOP,
            
            
            // Methods /////////////////////////////////////////////////////////
            /** Registers the provided global under the key. Fires a register<key> event. 
                If a global is already registered under the key the existing global is 
                unregistered first.
                @param {string} key
                @param {!Object} v
                @returns {void} */
            register: (key, v) => {
                if (Object.hasOwn(globalRegistry, key)) {
                    consoleWarn('Global key in use', key);
                    globalRegistry.unregister(key);
                }
                globalRegistry[key] = v;
                globalRegistry.fireEvent('register' + key, v);
            },
            
            /** Unegisters the global for the provided key. Fires an unregister<key> event if the 
                key exists.
                @param {string} key
                @returns {void} */
            unregister: key => {
                if (Object.hasOwn(globalRegistry, key)) {
                    const v = globalRegistry[key];
                    delete globalRegistry[key];
                    globalRegistry.fireEvent('unregister' + key, v);
                } else {
                    consoleWarn('Global key not in use', key);
                }
            }
        });
})(myt);

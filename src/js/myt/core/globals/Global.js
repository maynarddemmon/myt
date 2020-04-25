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
        @param {string} key
        @param {!Object} v
        @returns {undefined} */
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
        @param {string} key
        @returns {undefined} */
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

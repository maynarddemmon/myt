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
        this.fireNewEvent('register' + key, v);
    },
    
    /** Unegisters the global for the provided key. Fires an unregister<key>
        event if the key exists.
        @returns void */
    unregister: function(key) {
        if (!this.hasOwnProperty(key)) {
            console.log("Warning: myt.global key not in use: ", key);
            return;
        }
        var v = this[key];
        delete this[key];
        this.fireNewEvent('unregister' + key, v);
    }
});

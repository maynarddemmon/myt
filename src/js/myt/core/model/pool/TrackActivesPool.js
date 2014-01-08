/** An myt.SimplePool that tracks which objects are "active". An "active"
    object is one that has been obtained by the getInstance method.
    
    Events:
        None
    
    Attributes:
        None
    
    Private Attributes:
        __actives:array an array of active instances.
*/
myt.TrackActivesPool = new JS.Class('TrackActivesPool', myt.SimplePool, {
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides myt.Destructible */
    destroy: function() {
        var actives = this.__actives;
        if (actives) actives.length = 0;
        
        this.callSuper();
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** @overrides myt.AbstractPool */
    getInstance: function() {
        var actives = this.__actives;
        if (!actives) actives = this.__actives = [];
        
        var instance = this.callSuper();
        actives.push(instance);
        return instance;
    },
    
    /** @overrides myt.AbstractPool */
    putInstance: function(obj) {
        var actives = this.__actives;
        if (actives) {
            var exists = false, i = actives.length;
            while (i) {
                if (actives[--i] === obj) {
                    actives.splice(i, 1);
                    exists = true;
                    break;
                }
            }
            
            if (exists) {
                this.callSuper(obj);
            } else {
                console.warn("Attempt to putInstance for a non-active instance.", obj, this);
            }
        } else {
            console.warn("Attempt to putInstance when no actives exist.", obj, this);
        }
    },
    
    /** Gets an array of the active instances.
        @returns array */
    getActives: function() {
        return this.__actives ? this.__actives.concat() : [];
    },
    
    /** Puts all the active instances back in the pool.
        @returns void */
    putActives: function() {
        var actives = this.__actives;
        if (actives) {
            var i = actives.length;
            while (i) this.putInstance(actives[--i]);
        }
    }
});

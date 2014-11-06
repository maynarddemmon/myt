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
        var instance = this.callSuper();
        (this.__actives || (this.__actives = [])).push(instance);
        return instance;
    },
    
    /** @overrides myt.AbstractPool */
    putInstance: function(obj) {
        var actives = this.__actives;
        if (actives) {
            var i = actives.length;
            while (i) {
                if (actives[--i] === obj) {
                    actives.splice(i, 1);
                    this.callSuper(obj);
                    return;
                }
            }
            console.warn("Attempt to putInstance for a non-active instance.", obj, this);
        } else {
            console.warn("Attempt to putInstance when no actives exist.", obj, this);
        }
    },
    
    /** Gets an array of the active instances.
        @param filterFunc:function (optional) If provided filters the
            results.
        @returns array */
    getActives: function(filterFunc) {
        var actives = this.__actives;
        if (actives) {
            if (filterFunc) {
                var retval = [], len = actives.length, i = 0, active;
                for (; len > i;) {
                    active = actives[i++];
                    if (filterFunc.call(this, active)) retval.push(active);
                }
                return retval;
            }
            return actives.concat();
        }
        return [];
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

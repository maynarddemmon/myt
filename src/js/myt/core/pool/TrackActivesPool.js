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
        var actives = this.__getActives();
        if (actives) actives.length = 0;
        
        this.callSuper();
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** Get the active objects array.
        @param lazy:boolean If true a list will be lazily instantiated.
        @private */
    __getActives: function(lazy) {
        return lazy ? this.__actives || (this.__actives = []) : this.__actives;
    },
    
    /** @overrides myt.AbstractPool */
    getInstance: function() {
        var instance = this.callSuper();
        this.__getActives(true).push(instance);
        return instance;
    },
    
    /** @overrides myt.AbstractPool */
    putInstance: function(obj) {
        var actives = this.__getActives(),
            i,
            warningType;
        if (actives) {
            i = actives.length;
            while (i) {
                if (actives[--i] === obj) {
                    actives.splice(i, 1);
                    this.callSuper(obj);
                    return;
                }
            }
            warningType = "non-active";
        } else {
            warningType = "non-existant";
        }
        console.warn("Attempt to put a " + warningType + " instance.", obj, this);
    },
    
    /** Gets an array of the active instances.
        @param filterFunc:function (optional) If provided filters the
            results.
        @returns array */
    getActives: function(filterFunc) {
        var actives = this.__getActives();
        if (actives) {
            if (filterFunc) {
                var retval = [],
                    len = actives.length,
                    i = 0,
                    active;
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
        @returns {undefined} */
    putActives: function() {
        var actives = this.__getActives();
        if (actives) {
            var i = actives.length;
            while (i) this.putInstance(actives[--i]);
        }
    }
});

/** An myt.SimplePool that tracks which objects are "active". An "active"
    object is one that has been obtained by the getInstance method.
    
    Events:
        None
    
    Attributes:
        None
    
    Private Attributes:
        __actives:array an array of active instances.
    
    @class */
myt.TrackActivesPool = new JS.Class('TrackActivesPool', myt.SimplePool, {
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides myt.Destructible */
    destroy: function() {
        const actives = this.__getActives();
        if (actives) actives.length = 0;
        
        this.callSuper();
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** Get the active objects array.
        @private
        @param {boolean} lazy - If true a list will be lazily instantiated.
        @returns {!Array} */
    __getActives: function(lazy) {
        return lazy ? this.__actives || (this.__actives = []) : this.__actives;
    },
    
    /** @overrides myt.AbstractPool */
    getInstance: function() {
        const instance = this.callSuper();
        this.__getActives(true).push(instance);
        return instance;
    },
    
    /** @overrides myt.AbstractPool */
    putInstance: function(obj) {
        const actives = this.__getActives();
        let i,
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
        @param {?Function} [filterFunc] - If provided filters the
            results.
        @returns {!Array} */
    getActives: function(filterFunc) {
        const actives = this.__getActives();
        if (actives) {
            if (filterFunc) {
                const retval = [],
                    len = actives.length;
                let i = 0,
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
        const actives = this.__getActives();
        if (actives) {
            let i = actives.length;
            while (i) this.putInstance(actives[--i]);
        }
    }
});

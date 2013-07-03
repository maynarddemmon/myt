/** An myt.SimplePool that tracks which objects are "active" since they have
    been obtained by the "getInstance" method.
    
    Attributes:
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
        
        // Don't allow put if the instance isn't one of the actives.
        if (!actives) {
            console.warn("Attempt to putInstance when no actives exist.", obj, this);
            return;
        }
        
        var exists = false, i = actives.length;
        while (i) {
            if (actives[--i] === obj) {
                actives.splice(i, 1);
                exists = true;
                break;
            }
        }
        
        if (!exists) {
            console.warn("Attempt to putInstance for a non-active instance.", obj, this);
            return;
        }
        
        this.callSuper(obj);
    },
    
    /** Gets an array of the active instances.
        @returns array */
    getActives: function() {
        var actives = this.__actives;
        if (!actives) actives = this.__actives = [];
        
        return actives.concat();
    }
});

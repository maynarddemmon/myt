/** Provides a destroy method that can be used as part of an Object creation
    and destruction lifecycle. When an object is "destroyed" it will have
    a 'destroyed' attribute with a value of true.
    
    Events:
        None
    
    Attributes:
        destroyed:boolean Set to true when the object is in the "destroyed"
            state, undefinded otherwise.
*/
myt.Destructible = new JS.Module('Destructible', {
    // Methods /////////////////////////////////////////////////////////////////
    /** Destroys this Object. Subclasses must call super.
        @returns void */
    destroy: function() {
        // See http://perfectionkills.com/understanding-delete/ for details
        // on how delete works. This is why we use Object.keys below since it
        // avoids iterating over many of the properties that are not deletable.
        var keys, i;
        
        // OPTIMIZATION: Improve garbage collection for JS.Class
        var meta = this.__meta__;
        if (meta) {
            keys = Object.keys(meta);
            i = keys.length;
            while (i) delete meta[keys[--i]];
        }
        
        keys = Object.keys(this);
        i = keys.length;
        while (i) delete this[keys[--i]];
        
        this.destroyed = true;
    }
});

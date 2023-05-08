/** Provides a destroy method that can be used as part of an Object creation and destruction 
    lifecycle. When an object is "destroyed" it will have a "destroyed" attribute with a value 
    of true.
    
    Attributes:
        destroyed:boolean Set to true when the object is in the "destroyed" state, 
            undefinded otherwise.
    
    @class */
myt.Destructible = new JS.Module('Destructible', {
    // Methods /////////////////////////////////////////////////////////////////
    /** Destroys this Object. Subclasses must call super.
        @returns {undefined} */
    destroy: function() {
        // See http://perfectionkills.com/understanding-delete/ for details on how delete works. 
        // This is why we use Object.keys below since it avoids iterating over many of the 
        // properties that are not deletable.
        const self = this;
        if (self.destroyed) {
            console.warn('Already destroyed');
        } else {
            // OPTIMIZATION: Improve garbage collection for JS.Class
            const meta = self.__meta__;
            if (meta) {
                const metaKeys = Object.keys(meta);
                for (let i = metaKeys.length; i > 0;) delete meta[metaKeys[--i]];
            }
            
            const keys = Object.keys(self);
            for (let i = keys.length; i > 0;) delete self[keys[--i]];
            
            self.destroyed = true;
        }
    }
});

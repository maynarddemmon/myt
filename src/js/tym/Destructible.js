/** Provides a destroy method that can be used as part of an Object creation and destruction 
    lifecycle. When an object is "destroyed" it will have a "destroyed" attribute with a value 
    of true.
    
    Attributes:
        destroyed:boolean Set to true when the object is in the "destroyed" state, 
            undefinded otherwise.
    
    @class */
tym.Destructible = new JS.Module('Destructible', {
    // Methods /////////////////////////////////////////////////////////////////
    /** Destroys this Object. Subclasses must call super.
        @returns {undefined} */
    destroy: function() {
        const self = this;
        if (self.destroyed) {
            console.warn('Already destroyed');
        } else {
            // OPTIMIZATION: Improve garbage collection for JS.Class
            const meta = self.__meta__;
            if (meta) for (const key of Object.keys(meta)) meta[key] = null;
            
            for (const key of Object.keys(self)) self[key] = null;
            
            self.destroyed = true;
        }
    }
});

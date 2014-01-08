/** Objects that can be used in an myt.AbstractPool should use this mixin and 
    implement the "clean" method. */
myt.Reusable = new JS.Module('Reusable', {
    // Methods /////////////////////////////////////////////////////////////////
    /** Puts this object back into a default state suitable for storage in
        an myt.AbstractPool
        @returns void */
    clean: function() {}
});

/** Trims the whitespace from a value. */
myt.TrimValueProcessor = new JS.Class('TrimValueProcessor', myt.ValueProcessor, {
    // Constructor /////////////////////////////////////////////////////////////
    /** @overrides myt.ValueProcessor
        @param trim:string Determines the type of trimming to do. Allowed
            values are 'left', 'right' or 'both'. The default value 
            is 'both'. */
    initialize: function(id, trim) {
        this.callSuper(id);
        
        this.trim = trim;
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** @overrides myt.ValueProcessor */
    process: function(v) {
        v += '';
        if (this.trim === 'left') {
            return v.trimLeft();
        } else if (this.trim === 'right') {
            return v.trimRight();
        }
        return v.trim();
    }
});

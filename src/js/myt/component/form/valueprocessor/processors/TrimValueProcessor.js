/** Trims the whitespace from a value.
    
    Attributes:
        trim:string Determines what kind of trimming to do. Supported values
            are 'left', 'right' and 'both'. The default value is 'both'.
*/
myt.TrimValueProcessor = new JS.Class('TrimValueProcessor', myt.ValueProcessor, {
    // Constructor /////////////////////////////////////////////////////////////
    /** @overrides myt.ValueProcessor
        @param trim:string Determines the type of trimming to do. Allowed
            values are 'left', 'right' or 'both'. The default value 
            is 'both'. */
    initialize: function(id, runForDefault, runForRollback, runForCurrent, trim) {
        this.callSuper(id, runForDefault, runForRollback, runForCurrent);
        
        this.trim = trim;
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** @overrides myt.ValueProcessor */
    process: function(v) {
        v += '';
        switch (this.trim) {
            case 'start':
            case 'left':
                return v.trimStart();
            case 'end':
            case 'right':
                return v.trimEnd();
            default:
                return v.trim();
        }
    }
});

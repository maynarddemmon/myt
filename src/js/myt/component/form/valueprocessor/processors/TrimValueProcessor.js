/** Trims the whitespace from a value.
    
    Attributes:
        trim:string Determines what kind of trimming to do. Supported values
            are 'left', 'right' and 'both'. The default value is 'both'.
    
    @class */
myt.TrimValueProcessor = new JS.Class('TrimValueProcessor', myt.ValueProcessor, {
    // Constructor /////////////////////////////////////////////////////////////
    /** @overrides myt.ValueProcessor
        @param {string} id - The ideally unique ID for a processor instance.
        @param {boolean} [runForDefault]
        @param {boolean} [runForRollback]
        @param {boolean} [runForCurrent]
        @param trim:string Determines the type of trimming to do. Allowed
            values are 'left', 'right' or 'both'. The default value 
            is 'both'.
        @returns {undefined} */
    initialize: function(id, runForDefault, runForRollback, runForCurrent, trim) {
        this.callSuper(id, runForDefault, runForRollback, runForCurrent);
        
        this.trim = trim;
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** @overrides */
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

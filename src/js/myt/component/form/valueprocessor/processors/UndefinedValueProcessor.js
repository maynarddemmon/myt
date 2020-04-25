/** Converts undefined values to a default value.
    
    Attributes:
        defaultValue:* The value to return when the processed value is
            undefined.
*/
myt.UndefinedValueProcessor = new JS.Class('UndefinedValueProcessor', myt.ValueProcessor, {
    // Constructor /////////////////////////////////////////////////////////////
    /** @overrides myt.ValueProcessor
        @param {string} id - The ideally unique ID for a processor instance.
        @param {boolean} [runForDefault]
        @param {boolean} [runForRollback]
        @param {boolean} [runForCurrent]
        @param {*} [defaultValue] - The default value to convert undefined to.
        @returns {undefined} */
    initialize: function(id, runForDefault, runForRollback, runForCurrent, defaultValue) {
        this.callSuper(id, runForDefault, runForRollback, runForCurrent);
        
        this.defaultValue = defaultValue;
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** @overrides myt.ValueProcessor */
    process: function(v) {
        return v === undefined ? this.defaultValue : v;
    }
});

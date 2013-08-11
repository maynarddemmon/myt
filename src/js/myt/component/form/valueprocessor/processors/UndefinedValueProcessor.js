/** Converts undefined values to a default value. */
myt.UndefinedValueProcessor = new JS.Class('UndefinedValueProcessor', myt.ValueProcessor, {
    // Constructor /////////////////////////////////////////////////////////////
    /** @overrides myt.ValueProcessor
    @param defaultValue:* the default value to convert undefined to. */
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

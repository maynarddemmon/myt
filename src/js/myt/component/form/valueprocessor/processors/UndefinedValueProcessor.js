/** Converts undefined values to a default value. */
myt.UndefinedValueProcessor = new JS.Class('UndefinedValueProcessor', myt.ValueProcessor, {
    // Constructor /////////////////////////////////////////////////////////////
    /** @overrides myt.ValueProcessor
    @param defaultValue:* the default value to convert undefined to. */
    initialize: function(id, defaultValue) {
        this.callSuper(id);
        
        this.defaultValue = defaultValue;
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** @overrides myt.ValueProcessor */
    process: function(v) {
        return v === undefined ? this.defaultValue : v;
    }
});

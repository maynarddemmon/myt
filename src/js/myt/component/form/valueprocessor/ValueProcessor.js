/** Modifies a value. Typically used to convert a form element value to its
    canonical form.
    
    Events:
        None
    
    Attributes:
        id:string The ideally unique ID for this value processor.
        runForDefault:boolean Indicates this processor should be run for
            default form values. Defaults to true.
        runForRollback:boolean Indicates this processor should be run for
            rollback form values. Defaults to true.
        runForCurrent:boolean Indicates this processor should be run for
            current form values. Defaults to true.
    
    @class */
myt.ValueProcessor = new JS.Class('ValueProcessor', {
    // Class Methods ///////////////////////////////////////////////////////////
    extend: {
        DEFAULT_ATTR: 'runForDefault',
        ROLLBACK_ATTR: 'runForRollback',
        CURRENT_ATTR: 'runForCurrent'
    },
    
    
    // Constructor /////////////////////////////////////////////////////////////
    /** Creates a new ValueProcessor
        @param {string} id - The ideally unique ID for a processor instance.
        @param {boolean} [runForDefault]
        @param {boolean} [runForRollback]
        @param {boolean} [runForCurrent]
        @returns {undefined} */
    initialize: function(id, runForDefault, runForRollback, runForCurrent) {
        this.id = id;
        
        var VP = myt.ValueProcessor;
        this[VP.DEFAULT_ATTR] = runForDefault ? true : false;
        this[VP.ROLLBACK_ATTR] = runForRollback ? true : false;
        this[VP.CURRENT_ATTR] = runForCurrent ? true : false;
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** Processes the value. The default implementation returns the value
        unmodified.
        @param {*} value - The value to modify.
        @returns {*} - The modified value. */
    process: function(value) {
        return value;
    }
});

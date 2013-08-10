/** Modifies a value. Typically used to convert a form element value to its
    canonical form.
    
    Attributes:
        runForDefault:boolean Indicates this processor should be run for
            default form values. Defaults to true.
        runForRollback:boolean Indicates this processor should be run for
            rollback form values. Defaults to true.
        runForCurrent:boolean Indicates this processor should be run for
            current form values. Defaults to true.
*/
myt.ValueProcessor = new JS.Class('ValueProcessor', {
    // Constructor /////////////////////////////////////////////////////////////
    /** Creates a new ValueProcessor
        @param id:string the ideally unique ID for a processor instance.
        @param runForDefault:boolean (optional) 
        @param runForRollback:boolean (optional) 
        @param runForCurrent:boolean (optional) */
    initialize: function(id, runForDefault, runForRollback, runForCurrent) {
        this.id = id;
        
        this.runForDefault = runForDefault ? true : false;
        this.runForRollback = runForRollback ? true : false;
        this.runForCurrent = runForCurrent ? true : false;
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** Processes the value.
        @param value:* the value to modify.
        @returns * the modified value. */
    process: function(v) {
        return v;
    }
});

/** Provides global error events and console logging.
    
    Events:
        Error specific events are broadcast. Here is a list of known error
        types.
            eventLoop: Fired by myt.Observable when an infinite event loop
                would occur.
    
    Attributes:
        stackTraceLimit:int Sets the size for stack traces.
        consoleLogging:boolean Turns logging to the console on and off.
*/
new JS.Singleton('GlobalError', {
    include: [myt.Observable],
    
    
    // Constructor /////////////////////////////////////////////////////////////
    initialize: function() {
        this.setStackTraceLimit(50);
        this.setConsoleLogging(true);
        myt.global.register('error', this);
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setConsoleLogging: function(v) {this.consoleLogging = v;},
    setStackTraceLimit: function(v) {Error.stackTraceLimit = this.stackTraceLimit = v;},
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** A wrapper on this.notify where consoleFuncName is 'error'. */
    notifyError: function(type, msg, err) {this.notify('error', type, msg, err);},
    
    /** A wrapper on this.notify where consoleFuncName is 'warn'. */
    notifyWarn: function(type, msg, err) {this.notify('warn', type, msg, err);},
    
    /** A wrapper on this.notify where consoleFuncName is 'log'. */
    notifyMsg: function(type, msg, err) {this.notify('log', type, msg, err);},
    
    /** A wrapper on this.notify where consoleFuncName is 'debug'. */
    notifyDebug: function(type, msg, err) {this.notify('debug', type, msg, err);},
    
    /** Broadcasts that an error has occurred and also logs the error to the
        console if so configured.
        @param consoleFuncName:string (optional) The name of the function to 
            call on the console. Standard values are:'error', 'warn', 'log'
            and 'debug'. If not provided no console logging will occur 
            regardless of the value of this.consoleLogging.
        @param evenType:string (optional) The type of the event that will be 
            broadcast. If not provided 'error' will be used.
        @param msg:* (optional) Usually a string, this is additional information
            that will be provided in the value object of the broadcast event.
        @param err:Error (optional) A javascript error object from which a
            stacktrace will be taken. If not provided a stacktrace will be
            automatically generated.
        @private */
    notify: function(consoleFuncName, eventType, msg, err) {
        // Generate Stacktrace
        if (!err) err = new Error(msg || eventType);
        var stacktrace = err.stack || err.stacktrace;
        
        this.fireNewEvent(eventType || 'error', {msg:msg, stacktrace:stacktrace});
        if (this.consoleLogging && consoleFuncName) console[consoleFuncName](stacktrace);
    }
});

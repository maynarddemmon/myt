/** Provides global error events and console logging.
    
    Events:
        Error specific events are broadcast. Here is a list of known error types.
            eventLoop: Fired by myt.Observable when an infinite event loop would occur.
    
    Attributes:
        stackTraceLimit:int Sets the size for stack traces.
        consoleLogging:boolean Turns logging to the console on and off.
    
    @class */
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
    /** Broadcasts errors and also logs the error to the console if so configured.
        @param {string} [consoleFuncName] - The name of the function to call on the console. 
            Standard values are:'error', 'warn', 'log' and 'debug'. If not provided no console 
            logging will occur regardless of the value of this.consoleLogging.
        @param {string} [eventType] - The type of the event that will be broadcast. If not provided 
            'error' will be used.
        @param {*} [msg] - Usually a string, this is additional information that will be provided in 
            the value object of the broadcast event.
        @param {?Error} [err] - A javascript error object from which a stacktrace will be taken. 
            If not provided a stacktrace will be automatically generated.
        @param {?Object} [extraInfo] - An object that will be copied onto the Error object under
            "extraInfo". This can be used to provide additional context for the Error.
        @returns {undefined} */
    notify: function(consoleFuncName, eventType, msg, err, extraInfo) {
        // Generate Stacktrace
        if (!err) err = new Error(msg ?? eventType);
        const stacktrace = err.stack ?? err.stacktrace,
            eventValue = {msg:msg, stacktrace:stacktrace};
        if (extraInfo) Object.assign(eventValue, extraInfo);
        this.fireEvent(eventType ?? 'error', eventValue);
        if (this.consoleLogging && consoleFuncName) console[consoleFuncName](stacktrace);
    }
});

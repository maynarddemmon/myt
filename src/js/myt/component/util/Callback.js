/** Stores a function name and a context to call that function on along with 
    zero or more callback parameters. */
myt.Callback = new JS.Class('Callback', {
    // Constructor /////////////////////////////////////////////////////////////
    /** Create a new Callback.
        @param methodName:String the name of the method to call.
        @param context:Object the object to call the method on.
        @param extraArgs:Array (Optional) args to be passed to the method. */
    initialize: function(methodName, context, extraArgs) {
        this.setContext(context);
        this.setMethodName(methodName);
        this.setExtraArgs(extraArgs);
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    /** @param context:Object The context to call the method/function on. */
    setContext: function(context) {
        this.context = context;
    },
    
    /** @param methodName:string The name of the function to call. */
    setMethodName: function(methodName) {
        this.methodName = methodName;
    },
    
    /** @param extraArgs:array An array of additional args to pass to the 
        function. These are appended to the args passed into the 'execute'
        method. */
    setExtraArgs: function(extraArgs) {
        this.extraArgs = extraArgs;
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** Calls the callback method using the provided arguments 
        "array" and any extraArgs.
        @returns void */
    execute: function() {
        var args = Array.prototype.slice.call(arguments);
        
        // Concat extraArgs if they exist.
        if (this.extraArgs && this.extraArgs.length > 0) {
            args = args.concat(this.extraArgs);
        }
        
        // Call the method
        var ctx = this.context;
        ctx[this.methodName].apply(ctx, args);
    }
});

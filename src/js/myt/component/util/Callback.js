/** Stores a function name and a context to call that function on along with 
    zero or more callback parameters.
    
    Events:
        None
    
    Attributes:
        context:object The context to call the method/function on.
        methodName:string The name of the function to call on the context.
        extraArgs:array An array of additional args to pass to the function. 
            These are appended to the args passed into the 'execute' method.
*/
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
    setContext: function(context) {this.context = context;},
    setMethodName: function(methodName) {this.methodName = methodName;},
    setExtraArgs: function(extraArgs) {this.extraArgs = extraArgs;},
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** Calls the callback method using the provided arguments 
        "array" and any extraArgs.
        @param arguments:arguments The arguments passed to the callback
            function when it is executed.
        @returns void */
    execute: function() {
        var args = Array.prototype.slice.call(arguments),
            ctx = this.context,
            ea = this.extraArgs;
        
        // Concat extraArgs if they exist.
        if (ea && ea.length > 0) args = args.concat(ea);
        
        // Call the method
        ctx[this.methodName].apply(ctx, args);
    }
});

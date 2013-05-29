/** Encapsulates drawing into a myt.Canvas object. Contains a repository
    of DrawingMethod instances that can be accessed by class name. */
myt.DrawingMethod = new JS.Class('DrawingMethod', {
    // Class Methods and Attributes ////////////////////////////////////////////
    extend: {
        /** A map of DrawingMethod by class name. */
        _drawingMethods: {},
        
        /** Gets a DrawingMethod for the classname.
            @returns myt.DrawingMethod. */
        get: function(classname) {
            var drawingMethods = this._drawingMethods;
            
            var drawingMethod = drawingMethods[classname];
            
            // Create the DrawingMethod if it wasn't found in the cache.
            if (!drawingMethod) {
                var drawingMethodClass = myt.resolveName(classname);
                if (drawingMethodClass) {
                    drawingMethods[classname] = drawingMethod = new drawingMethodClass();
                }
            }
            
            return drawingMethod;
        },
        
        /** Gets a DrawingMethod and uses it to draw into the Canvas.
            @param classname:String the name of the class to draw with.
            @param canvas:myt.Canvas the canvas to draw into.
            @param config:Object (Optional) a map of configuration parameters 
                that control how the DrawingMethod draws. */
        draw: function(classname, canvas, config) {
            var drawingMethod = this.get(classname);
            if (drawingMethod) {
                drawingMethod.draw(canvas, config);
            } else {
                console.log("Unknown DrawingMethod", classname);
            }
        }
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** Draw into the Canvas.
        @param canvas:myt.Canvas the canvas to draw into.
        @param config:Object (Optional) a map of configuration parameters 
            that control how the DrawingMethod draws. */
    draw: function(canvas, config) {}
});

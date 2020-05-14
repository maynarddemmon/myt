/** Encapsulates drawing into a myt.Canvas object. Contains a repository
    of DrawingMethod instances that can be accessed by class name.
    
    @class */
myt.DrawingMethod = new JS.Class('DrawingMethod', {
    // Class Methods and Attributes ////////////////////////////////////////////
    extend: {
        /** A map of DrawingMethod by class name. */
        _drawingMethods: {},
        
        /** Gets a DrawingMethod for the classname.
            @param {string} classname
            @returns {!Function} myt.DrawingMethod. */
        get: function(classname) {
            const drawingMethods = this._drawingMethods;
            let drawingMethod = drawingMethods[classname];
            
            // Create the DrawingMethod if it wasn't found in the cache.
            if (!drawingMethod) {
                const drawingMethodClass = myt.resolveClassname(classname);
                if (drawingMethodClass) drawingMethods[classname] = drawingMethod = new drawingMethodClass();
            }
            
            return drawingMethod;
        },
        
        /** Gets a DrawingMethod and uses it to draw into the Canvas.
            @param {string} classname - The name of the class to draw with.
            @param {!Objecdt} canvas - The myt.Canvas to draw into.
            @param {?Object} [config] - A map of configuration parameters 
                that control how the DrawingMethod draws.
            @returns {undefined} */
        draw: function(classname, canvas, config) {
            const drawingMethod = this.get(classname);
            if (drawingMethod) {
                drawingMethod.draw(canvas, config);
            } else {
                console.log("Unknown DrawingMethod", classname);
            }
        }
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** Draw into the Canvas.
        @param {!Object} canvas - The myt.Canvas to draw into.
        @param {?Object} [config] - A map of configuration parameters 
            that control how the DrawingMethod draws.
        @returns {undefined} */
    draw: function(canvas, config) {}
});

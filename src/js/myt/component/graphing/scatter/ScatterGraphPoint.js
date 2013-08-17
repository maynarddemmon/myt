/** A data point in an myt.ScatterGraph
    
    Attributes:
        id:string The unique ID of the point relative to the ScatterGraph it
            is in.
        x:number The raw x value of the data.
        y:number The raw y value of the data.
        px:number The converted x pixel location.
        py:number The converted y pixel location.
        ax:number The animation target x for a point being animated.
        ay:number The animation target y for a point being animated.
        config:object holds arbitrary config information. Typically used to
            provide drawing hints.
*/
myt.ScatterGraphPoint = new JS.Class('ScatterGraphPoint', {
    // Constructor /////////////////////////////////////////////////////////////
    /** Create a new Path. */
    initialize: function(id, x, y, config) {
        this.setId(id);
        this.setX(x);
        this.setY(y);
        this.setConfig(config);
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setId: function(v) {this.id = v;},
    setX: function(v) {this.x = v;},
    setY: function(v) {this.y = v;},
    setPx: function(v) {this.px = v;},
    setPy: function(v) {this.py = v;},
    setAx: function(v) {this.ax = v;},
    setAy: function(v) {this.ay = v;},
    setConfig: function(v) {this.config = v;},
    
    
    // Methods /////////////////////////////////////////////////////////////////
    prepareForAnimation: function(ax, ay) {
        this.ax = ax;
        this.ay = ay;
        
        this._origX = this.x;
        this._origY = this.y;
        this._xAttrDiff = ax - this.x;
        this._yAttrDiff = ay - this.y;
        this._progress = 0;
        this._easingFunc = myt.Animator.easingFunctions.easeInOutQuad;
    },
    
    updateForAnimation: function(timeDiff) {
        // Snap to final value when close
        if (Math.abs(this.x - this.ax) + Math.abs(this.y - this.ay) < 0.5) {
            this.x = this.ax;
            this.y = this.ay;
            return false;
        }
        
        // Animate
        this._progress += timeDiff;
        if (this._progress > 1000) this._progress = 1000;
        
        this.x = this._origX + this._easingFunc(this._progress, this._xAttrDiff, 1000);
        this.y = this._origY + this._easingFunc(this._progress, this._yAttrDiff, 1000);
        return true;
    }
});

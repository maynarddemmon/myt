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
        _progress:number The animation progress.
        _origX:number The starting x when an animation begins.
        _origY:number The starting y when an animation begins.
        _xAttrDiff:number The x difference between the original and animation
            target when an animation begins.
        _yAttrDiff:number The y difference between the original and animation
            target when an animation begins.
*/
myt.ScatterGraphPoint = new JS.Class('ScatterGraphPoint', {
    include: [myt.Selectable],
    
    
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
    getTemplate: function(graph) {
        return graph.getPointTemplate(this.selected ? this.config.selectedTemplateKey : this.config.templateKey);
    },
    
    setData: function(key, value) {
        let data = this._data;
        if (!data) this._data = data = {};
        data[key] = value;
    },
    
    getData: function(key) {
        return this._data ? this._data[key] : undefined;
    },
    
    prepareForAnimation: function(ax, ay) {
        this.ax = ax;
        this.ay = ay;
        
        this._origX = this.x;
        this._origY = this.y;
        this._xAttrDiff = ax - this.x;
        this._yAttrDiff = ay - this.y;
        this._progress = 0;
    },
    
    updateForAnimation: function(timeDiff) {
        // Snap to final value when close
        if (Math.abs(this.x - this.ax) + Math.abs(this.y - this.ay) < 0.00000001) {
            this.x = this.ax;
            this.y = this.ay;
            return false;
        }
        
        // Animate
        this._progress += timeDiff;
        if (this._progress > 1000) this._progress = 1000;
        
        const easingFunc = this.config.easingFunction || myt.Animator.DEFAULT_EASING_FUNCTION,
            percent = this._progress / 1000;
        
        this.x = this._origX + this._xAttrDiff * easingFunc(percent);
        this.y = this._origY + this._yAttrDiff * easingFunc(percent);
        return true;
    }
});

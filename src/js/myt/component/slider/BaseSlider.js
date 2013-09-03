/** A base class for slider components.
    
    Attributes:
        axis:string Indicates the direction the slider moves in. Allowed values
            are 'x' and 'y'. Defaults to 'x'.
        trackInset:number the number of pixels to inset the start of the track
            from the top/left edge of the component. Defaults to 0.
        trackOutset:number the number of pixels to inset the end of the track
            from the bottom/right edge of the component. Default to 0.
        thumbWidth:number The width of the thumb.
        thumbHeight:number The height of the thumb.
        thumbOffset:number The x/y offset of the thumb. Will applied to the
            opposite dimension to the axis.
        thumbClass:JS.Class the class to use to create the thumb.
        nudgeAmount:number the amount to nudge the value when the arrows keys
            are invoked. Defaults to 1.
*/
myt.BaseSlider = new JS.Class('BaseSlider', myt.View, {
    include: [myt.Disableable],
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides myt.Checkbox */
    initNode: function(parent, attrs) {
        if (attrs.axis === undefined) attrs.axis = 'x';
        if (attrs.axis === 'x') {
            if (attrs.width === undefined) attrs.width = 100;
            if (attrs.height === undefined) attrs.height = 18;
        } else {
            if (attrs.width === undefined) attrs.width = 18;
            if (attrs.height === undefined) attrs.height = 100;
        }
        
        if (attrs.bgColor === undefined) attrs.bgColor = '#999999';
        if (attrs.roundedCorners === undefined) attrs.roundedCorners = 9;
        
        if (attrs.trackInset === undefined) attrs.trackInset = 9;
        if (attrs.trackOutset === undefined) attrs.trackOutset = 9;
        if (attrs.thumbWidth === undefined) attrs.thumbWidth = 16;
        if (attrs.thumbHeight === undefined) attrs.thumbHeight = 16;
        if (attrs.thumbOffset === undefined) attrs.thumbOffset = 1;
        
        if (attrs.nudgeAmount === undefined) attrs.nudgeAmount = 1;
        
        if (attrs.thumbClass === undefined) attrs.thumbClass = myt.SimpleSliderThumb;
        if (attrs.rangeFillClass === undefined) attrs.rangeFillClass = myt.SimpleSliderRangeFill;
        
        this.callSuper(parent, attrs);
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setAxis: function(v) {this.axis = v;},
    setTrackInset: function(v) {this.trackInset = v;},
    setTrackOutset: function(v) {this.trackOutset = v;},
    setThumbWidth: function(v) {this.thumbWidth = v;},
    setThumbHeight: function(v) {this.thumbHeight = v;},
    setThumbOffset: function(v) {this.thumbOffset = v;},
    setThumbClass: function(v) {this.thumbClass = v;},
    setNudgeAmount: function(v) {this.nudgeAmount = v;},
    
    
    // Methods /////////////////////////////////////////////////////////////////
    convertValueToPixels: function(v) {
        var pxRange = (this.axis === 'x' ? this.width : this.height) - this.trackInset - this.trackOutset,
            valueRange = this.maxValue - this.minValue;
        return this.trackInset + ((v - this.minValue) * (pxRange / valueRange));
    },
    
    convertPixelsToValue: function(px) {
        var pxRange = (this.axis === 'x' ? this.width : this.height) - this.trackInset - this.trackOutset,
            valueRange = this.maxValue - this.minValue;
        return ((px - this.trackInset) * (valueRange / pxRange)) + this.minValue;
    },
    
    nudgeValueLeft: function(thumb) {
        this._nudge(thumb, false);
    },
    
    nudgeValueUp: function(thumb) {
        this._nudge(thumb, false);
    },
    
    nudgeValueRight: function(thumb) {
        this._nudge(thumb, true);
    },
    
    nudgeValueDown: function(thumb) {
        this._nudge(thumb, true);
    },
    
    _nudge: function(thumb, up) {
        // Subclasses to implement
    }
});

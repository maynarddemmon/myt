/** A base class for slider components.
    
    Events:
        None
    
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
    /** @overrides myt.View */
    initNode: function(parent, attrs) {
        if (attrs.axis == null) attrs.axis = 'x';
        if (attrs.axis === 'x') {
            if (attrs.width == null) attrs.width = 100;
            if (attrs.height == null) attrs.height = 18;
        } else {
            if (attrs.width == null) attrs.width = 18;
            if (attrs.height == null) attrs.height = 100;
        }
        
        if (attrs.bgColor == null) attrs.bgColor = '#999999';
        if (attrs.roundedCorners == null) attrs.roundedCorners = 9;
        
        if (attrs.trackInset == null) attrs.trackInset = 9;
        if (attrs.trackOutset == null) attrs.trackOutset = 9;
        if (attrs.thumbWidth == null) attrs.thumbWidth = 16;
        if (attrs.thumbHeight == null) attrs.thumbHeight = 16;
        if (attrs.thumbOffset == null) attrs.thumbOffset = 1;
        
        if (attrs.nudgeAmount == null) attrs.nudgeAmount = 1;
        
        if (attrs.thumbClass == null) attrs.thumbClass = myt.SimpleSliderThumb;
        
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
        var self = this,
            minV = self.minValue, ti = self.trackInset,
            pxRange = (self.axis === 'x' ? self.width : self.height) - ti - self.trackOutset,
            valueRange = self.maxValue - minV;
        return ti + ((v - minV) * (pxRange / valueRange));
    },
    
    convertPixelsToValue: function(px) {
        var self = this,
            minV = self.minValue, ti = self.trackInset,
            pxRange = (self.axis === 'x' ? self.width : self.height) - ti - self.trackOutset,
            valueRange = self.maxValue - minV;
        return ((px - ti) * (valueRange / pxRange)) + minV;
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
    },
    
    _syncThumbToValue: function(thumb, value) {
        value = this.convertValueToPixels(value);
        if (this.axis === 'x') {
            thumb.setX(value - thumb.width / 2);
        } else {
            thumb.setY(value - thumb.height / 2);
        }
    }
});

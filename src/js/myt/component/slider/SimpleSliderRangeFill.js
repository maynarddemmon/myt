/** A simple implementation of the range fill for a RangeSlider. */
myt.SimpleSliderRangeFill = new JS.Class('SimpleSliderRangeFill', myt.View, {
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides myt.Checkbox */
    initNode: function(parent, attrs) {
        if (attrs.bgColor === undefined) attrs.bgColor = '#666666';
        
        this.callSuper(parent, attrs);
        
        if (parent.axis === 'x') {
            this.setY(parent.thumbOffset);
            this.setHeight(parent.thumbHeight);
            this.setRoundedCorners(parent.thumbHeight / 2);
        } else {
            this.setX(parent.thumbOffset);
            this.setWidth(parent.thumbWidth);
            this.setRoundedCorners(parent.thumbWidth / 2);
        }
        parent._syncRangeFillToValue();
    }
});

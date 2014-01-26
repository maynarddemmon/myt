/** A simple implementation of a slider thumb. */
myt.SimpleSliderThumb = new JS.Class('SimpleSliderThumb', myt.SimpleButton, {
    include: [myt.SliderThumbMixin],
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides myt.SimpleButton */
    initNode: function(parent, attrs) {
        if (attrs.activeColor === undefined) attrs.activeColor = '#bbbbbb';
        if (attrs.readyColor === undefined) attrs.readyColor = '#cccccc';
        if (attrs.hoverColor === undefined) attrs.hoverColor = '#dddddd';
        
        if (attrs.boxShadow === undefined) attrs.boxShadow = [0, 0, 4, '#666666'];
        
        this.callSuper(parent, attrs);
        
        if (attrs.roundedCorners === undefined) this.setRoundedCorners(Math.min(this.height, this.width) / 2);
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** @overrides myt.FocusObservable */
    showFocusEmbellishment: function() {
        this.hideDefaultFocusEmbellishment();
        this.setBoxShadow([0, 0, 9, '#666666']);
    },
    
    /** @overrides myt.FocusObservable */
    hideFocusEmbellishment: function() {
        this.hideDefaultFocusEmbellishment();
        this.setBoxShadow([0, 0, 4, '#666666']);
    }
});

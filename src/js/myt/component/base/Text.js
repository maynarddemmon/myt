/** Displays text content.
    
    Performance Note: If you set the bgColor of a text element it will render
    about 10% faster than if the background is set to 'transparent'. */
myt.Text = new JS.Class('Text', myt.View, {
    include: [myt.SizeToDom, myt.TextSupport],
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides myt.View */
    initNode: function(parent, attrs) {
        if (attrs.whiteSpace === undefined) attrs.whiteSpace = 'nowrap';
        if (attrs.userUnselectable === undefined) attrs.userUnselectable = true;
        
        this.callSuper(parent, attrs);
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** Measures the width of this element as if the wrapping was set 
        to 'nowrap'. The dom element is manipulated directly so that no 
        events get fired.
        @returns number the unwrapped width of this text view. */
    measureNoWrapWidth: function() {
        if (this.whiteSpace === 'nowrap') return this.width;
        
        // Temporarily set wrapping to 'nowrap', take measurement and
        // then restore wrapping.
        var s = this.deStyle, oldValue = s.whiteSpace;
        s.whiteSpace = 'nowrap';
        var measuredWidth = this.domElement.getBoundingClientRect().width;
        s.whiteSpace = oldValue;
        return measuredWidth;
    }
});

/** A mixin that sizes a RootView to the window width. */
myt.SizeToWindowWidth = new JS.Module('SizeToWindowWidth', {
    include: [myt.SizeToWindow],
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides myt.SizeToWindow */
    initNode: function(parent, attrs) {
        if (attrs.resizeDimension == null) attrs.resizeDimension = 'width';
        
        this.callSuper(parent, attrs);
    }
});

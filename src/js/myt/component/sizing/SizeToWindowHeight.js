/** A mixin that sizes a RootView to the window height. */
myt.SizeToWindowHeight = new JS.Module('SizeToWindowHeight', {
    include: [myt.SizeToWindow],
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides myt.SizeToWindow */
    initNode: function(parent, attrs) {
        if (attrs.resizeDimension == null) attrs.resizeDimension = 'height';
        
        this.callSuper(parent, attrs);
    }
});

/** A mixin that sizes a RootView to the window width, height or both. */
myt.SizeToWindow = new JS.Module('SizeToWindow', {
    include: [myt.RootView],
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides myt.Node */
    initNode: function(parent, attrs) {
        if (attrs.resizeDimension === undefined) attrs.resizeDimension = 'both';
        
        this.attachTo(myt.global.windowResize, '__handleResize', 'resize');
        this.callSuper(parent, attrs);
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setResizeDimension: function(v) {
        if (this.resizeDimension === v) return;
        this.resizeDimension = v;
        
        var gwr = myt.global.windowResize;
        if (v === 'width' || v === 'both') this.setWidth(gwr.getWidth());
        if (v === 'height' || v === 'both') this.setHeight(gwr.getHeight());
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    __handleResize: function(event) {
        var v = event.value;
        var dim = this.resizeDimension;
        if (dim === 'width' || dim === 'both') this.setWidth(v.w);
        if (dim === 'height' || dim === 'both') this.setHeight(v.h);
    }
});

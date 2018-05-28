/** A mixin that sizes a RootView to the window width, height or both.
    
    Events:
        None
    
    Attributes:
        resizeDimension:string The dimension to resize in. Supported values
            are 'width', 'height' and 'both'. Defaults to 'both'.
        minWidth:number the minimum width below which this view will not 
            resize its width. Defaults to 0.
        minWidth:number the minimum height below which this view will not
            resize its height. Defaults to 0.
*/
myt.SizeToWindow = new JS.Module('SizeToWindow', {
    include: [myt.RootView],
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides */
    initNode: function(parent, attrs) {
        this.minWidth = this.minHeight = 0;
        if (attrs.resizeDimension == null) attrs.resizeDimension = 'both';
        
        this.attachTo(myt.global.windowResize, '__handleResize', 'resize');
        this.callSuper(parent, attrs);
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setResizeDimension: function(v) {
        if (this.resizeDimension !== v) {
            this.resizeDimension = v;
            this.__handleResize();
        }
    },
    
    setMinWidth: function(v) {
        if (this.minWidth !== v) {
            this.minWidth = v;
            this.__handleResize();
        }
    },
    
    setMinHeight: function(v) {
        if (this.minHeight !== v) {
            this.minHeight = v;
            this.__handleResize();
        }
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** @private */
    __handleResize: function(event) {
        var WR = myt.global.windowResize,
            dim = this.resizeDimension;
        if (dim === 'width' || dim === 'both') this.setWidth(Math.max(this.minWidth, WR.getWidth()));
        if (dim === 'height' || dim === 'both') this.setHeight(Math.max(this.minHeight, WR.getHeight()));
    }
});

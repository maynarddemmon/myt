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
    /** @overrides myt.Node */
    initNode: function(parent, attrs) {
        this.minWidth = this.minHeight = 0;
        if (attrs.resizeDimension === undefined) attrs.resizeDimension = 'both';
        
        this.attachTo(myt.global.windowResize, '__handleResize', 'resize');
        this.callSuper(parent, attrs);
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setResizeDimension: function(v) {
        if (this.resizeDimension !== v) {
            this.resizeDimension = v;
            this.__handleResize(myt.global.windowResize.RESIZE_EVENT);
        }
    },
    
    setMinWidth: function(v) {
        if (this.minWidth !== v) {
            this.minWidth = v;
            this.__handleResize(myt.global.windowResize.RESIZE_EVENT);
        }
    },
    
    setMinHeight: function(v) {
        if (this.minHeight !== v) {
            this.minHeight = v;
            this.__handleResize(myt.global.windowResize.RESIZE_EVENT);
        }
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** @private */
    __handleResize: function(event) {
        var v = event.value,
            dim = this.resizeDimension;
        if (dim === 'width' || dim === 'both') this.setWidth(Math.max(this.minWidth, v.w));
        if (dim === 'height' || dim === 'both') this.setHeight(Math.max(this.minHeight, v.h));
    }
});

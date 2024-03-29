(pkg => {
    const JSModule = JS.Module,
        GlobalWindowResize = pkg.global.windowResize,
        
        mathMax = Math.max,
        
        handleResize = sizeToWindow => {
            const dim = sizeToWindow.resizeDimension;
            if (dim === 'both' || dim === 'width') sizeToWindow.setWidth(mathMax(sizeToWindow.minWidth, GlobalWindowResize.getWidth()));
            if (dim === 'both' || dim === 'height') sizeToWindow.setHeight(mathMax(sizeToWindow.minHeight, GlobalWindowResize.getHeight()));
        },
        
        /** A mixin that sizes a RootView to the window width, height or both.
            
            Attributes:
                resizeDimension:string The dimension to resize in. Supported values are 'width', 
                    'height' and 'both'. Defaults to 'both'.
                minWidth:number the minimum width below which this view will not resize its width. 
                    Defaults to 0.
                minWidth:number the minimum height below which this view will not resize its 
                    height. Defaults to 0.
            
            @class */
        SizeToWindow = pkg.SizeToWindow = new JSModule('SizeToWindow', {
            include: [pkg.RootView],
            
            
            // Life Cycle //////////////////////////////////////////////////////
            /** @overrides */
            initNode: function(parent, attrs) {
                this.minWidth = this.minHeight = 0;
                attrs.resizeDimension ??= 'both';
                
                this.attachTo(GlobalWindowResize, '__hndlResize', 'resize');
                this.callSuper(parent, attrs);
            },
            
            
            // Accessors ///////////////////////////////////////////////////////
            setResizeDimension: function(v) {
                if (this.resizeDimension !== v) {
                    this.resizeDimension = v;
                    handleResize(this);
                }
            },
            
            setMinWidth: function(v) {
                if (this.minWidth !== v) {
                    this.minWidth = v;
                    handleResize(this);
                }
            },
            
            setMinHeight: function(v) {
                if (this.minHeight !== v) {
                    this.minHeight = v;
                    handleResize(this);
                }
            },
            
            
            // Methods /////////////////////////////////////////////////////////
            /** @private
                @param {!Object} ignoredEvent
                @returns {undefined} */
            __hndlResize: function(ignoredEvent) {
                handleResize(this);
            }
        });
    
    /** A mixin that sizes a RootView to the window width.
        
        @class */
    pkg.SizeToWindowWidth = new JSModule('SizeToWindowWidth', {
        include: [SizeToWindow],
        
        
        // Life Cycle //////////////////////////////////////////////////////////
        /** @overrides myt.SizeToWindow */
        initNode: function(parent, attrs) {
            attrs.resizeDimension ??= 'width';
            this.callSuper(parent, attrs);
        }
    });
    
    /** A mixin that sizes a RootView to the window height.
        
        @class */
    pkg.SizeToWindowHeight = new JSModule('SizeToWindowHeight', {
        include: [SizeToWindow],
        
        
        // Life Cycle //////////////////////////////////////////////////////////
        /** @overrides myt.SizeToWindow */
        initNode: function(parent, attrs) {
            attrs.resizeDimension ??= 'height';
            this.callSuper(parent, attrs);
        }
    });
})(myt);

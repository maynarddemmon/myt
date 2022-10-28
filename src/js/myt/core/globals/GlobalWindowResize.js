(pkg => {
    let 
        /*  The clientWidth of the window.document.body. */
        clientWidth,
        
        /*  The clientHeight of the window.document.body. */
        clientHeight;
    
    const G = pkg.global,
        globalIdle = G.idle,
        doc = window.document;
    
    /** Provides events when the window's body is resized. Registered with 
        myt.global as 'windowResize'.
        
        Events:
            resize:object Fired when the window.document.body is resized. The 
                type is 'resize' and the value is an object containing:
                    w:number the new window.document.body clientWidth.
                    h:number the new window.document.body clientHeight.
        
        @class */
    new JS.Singleton('GlobalWindowResize', {
        include: [pkg.Observable, pkg.Observer],
        
        
        // Life Cycle //////////////////////////////////////////////////////////
        initialize: function() {
            // We need to wait for the body to exist.
            this.attachTo(globalIdle, '__setup', 'idle');
            G.register('windowResize', this);
        },
        
        /** @private */
        __setup: function(ignoredEvent) {
            const self = this,
                body = doc.body;
            if (body) {
                self.detachFrom(globalIdle, '__setup', 'idle');
                new ResizeObserver(() => {
                    self.fireEvent('resize', {w:clientWidth = body.clientWidth, h:clientHeight = body.clientHeight});
                }).observe(body);
            }
        },
        
        
        // Accessors ///////////////////////////////////////////////////////////
        /** Gets the window.document.body's clientWidth.
            @returns {number} - The current width of the window.document.body. */
        getWidth: () => clientWidth || (clientWidth = doc.body.clientWidth),
        
        /** Gets the window.document.body's clientHeight.
            @returns {number} - The current height of the window.document.body. */
        getHeight: () => clientHeight || (clientHeight = doc.body.clientHeight)
    });
})(myt);

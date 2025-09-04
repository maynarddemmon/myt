(pkg => {
    let globalWindowResize,
        
        /*  The clientWidth of the window.document.documentElement. */
        clientWidth,
        
        /*  The clientHeight of the window.document.documentElement. */
        clientHeight,
        
        /*  The scrollSidth of the window.document.documentElement. */
        scrollWidth,
        
        /*  The scrollHeight of the window.document.documentElement. */
        scrollHeight;
    
    const G = pkg.global,
        globalIdle = G.idle,
        docElem = window.document.documentElement;
    
    /** Provides events when the window's html is resized. Registered with myt.global 
        as 'windowResize'.
        
        Events:
            resize:object Fired when the window.document.documentElement is resized. The type is 
                'resize' and the value is an object containing:
                    w:number the window.document.documentElement new clientWidth.
                    h:number the window.document.documentElement new clientHeight.
                    sw:number the window.document.documentElement new scrollWidth.
                    sh:number the window.document.documentElement new scrollHeight.
        
        @class */
    new JS.Singleton('GlobalWindowResize', {
        include: [pkg.Observable, pkg.Observer],
        
        
        // Life Cycle //////////////////////////////////////////////////////////
        initialize: function() {
            globalWindowResize = this;
            
            // We need to wait for the html to exist.
            globalWindowResize.attachTo(globalIdle, '__setup', 'idle');
            G.register('windowResize', globalWindowResize);
        },
        
        /** @private */
        __setup: _event => {
            if (docElem) {
                globalWindowResize.detachFrom(globalIdle, '__setup', 'idle');
                new ResizeObserver(() => {
                    globalWindowResize.fireEvent('resize', {
                        w:clientWidth = docElem.clientWidth, 
                        h:clientHeight = docElem.clientHeight,
                        sw:scrollWidth = docElem.scrollWidth, 
                        sh:scrollHeight = docElem.scrollHeight
                    });
                }).observe(docElem);
            }
        },
        
        
        // Accessors ///////////////////////////////////////////////////////////
        /** Gets the window.document.documentElement's clientWidth.
            @returns {number} - The current width of the window.document.documentElement. */
        getWidth: () => clientWidth ??= docElem.clientWidth,
        
        /** Gets the window.document.documentElement's clientHeight.
            @returns {number} - The current height of the window.document.documentElement. */
        getHeight: () => clientHeight ??= docElem.clientHeight,
        
        /** Gets the window.document.documentElement's scrollWidth.
            @returns {number} - The current scrollable width of the window.document.documentElement. */
        getScrollWidth: () => scrollWidth ??= docElem.scrollWidth,
        
        /** Gets the window.document.documentElement's scrollHeight.
            @returns {number} - The current scrollable height of the window.document.documentElement. */
        getScrollHeight: () => scrollHeight ??= docElem.scrollHeight
    });
})(myt);

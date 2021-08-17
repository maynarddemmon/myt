(pkg => {
    let 
        /*  The inner width of the browser window. */
        innerWidth,
        
        /*  The inner height of the browser window. */
        innerHeight;
    
    const win = window;
    
    /** Provides events when the window is resized. Registered with myt.global
        as 'windowResize'.
        
        Events:
            resize:object Fired when the browser window is resized. The type
                is 'resize' and the value is an object containing:
                    w:number the new window width.
                    h:number the new window height.
        
        @class */
    new JS.Singleton('GlobalWindowResize', {
        include: [pkg.Observable],
        
        
        // Life Cycle //////////////////////////////////////////////////////////
        initialize: function() {
            // Handle the window resize event and broadcast it to the observers.
            pkg.addEventListener(win, 'resize', 
                domEvent => {
                    this.fireEvent('resize', {w:innerWidth = win.innerWidth, h:innerHeight = win.innerHeight});
                }
            );
            
            pkg.global.register('windowResize', this);
        },
        
        
        // Accessors ///////////////////////////////////////////////////////////
        /** Gets the window's innerWidth.
            @returns {number} - The current width of the window. */
        getWidth: () => innerWidth || (innerWidth = win.innerWidth),
        
        /** Gets the window's innerHeight.
            @returns {number} - The current height of the window. */
        getHeight: () => innerHeight || (innerHeight = win.innerHeight)
    });
})(myt);

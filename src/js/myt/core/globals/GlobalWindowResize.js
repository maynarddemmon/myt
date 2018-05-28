/** Provides events when the window is resized. Registered with myt.global
    as 'windowResize'.
    
    Events:
        resize:object Fired when the browser window is resized. The type
            is 'resize' and the value is an object containing:
                w:number the new window width.
                h:number the new window height.
    
    Attributes:
        None
    
    Private Attributes:
        __windowInnerWidth:number The inner width of the browser window.
        __windowInnerHeight:number The inner height of the browser window.
*/
new JS.Singleton('GlobalWindowResize', {
    include: [myt.Observable],
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    initialize: function() {
        var self = this;
        
        myt.addEventListener(window, 'resize', function(domEvent) {self.__handleEvent(domEvent);});
        
        myt.global.register('windowResize', self);
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    /** Gets the window's innerWidth.
        @returns the current width of the window. */
    getWidth: function() {
        return this.__windowInnerWidth || (this.__windowInnerWidth = window.innerWidth);
    },
    
    /** Gets the window's innerHeight.
        @returns the current height of the window. */
    getHeight: function() {
        return this.__windowInnerHeight || (this.__windowInnerHeight = window.innerHeight);
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** Handles the window resize event and broadcasts it to the observers.
        @private
        @param domEvent:object the window resize dom event.
        @returns void */
    __handleEvent: function(domEvent) {
        this.fireEvent('resize', {
            w:this.__windowInnerWidth = window.innerWidth,
            h:this.__windowInnerHeight = window.innerHeight
        });
    }
});

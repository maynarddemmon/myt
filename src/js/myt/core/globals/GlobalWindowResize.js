/** Provides events when the window is resized. Registered with myt.global
    as 'windowResize'.
    
    Events:
        resize:object Fired when the browser window is resized. This is a
            reused event stored at myt.global.windowResize.RESIZE_EVENT. The 
            value is an object containing:
                w:number the new window width.
                h:number the new window height.
    
    Attributes:
        RESIZE_EVENT:object The common resize event that gets fired.
    
    Private Attributes:
        __windowInnerWidth:number The inner width of the browser window.
        __windowInnerHeight:number The inner height of the browser window.
*/
new JS.Singleton('GlobalWindowResize', {
    include: [myt.Observable],
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    initialize: function() {
        // The common browser resize event that gets reused.
        this.RESIZE_EVENT = {
            source:this, type:'resize', value:{w:this.getWidth(), h:this.getHeight()}
        };
        
        var self = this;
        myt.addEventListener(window, 'resize', function(domEvent) {self.__handleEvent(domEvent);});
        
        myt.global.register('windowResize', this);
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    /** Gets the window's innerWidth.
        @returns the current width of the window. */
    getWidth: function() {
        var retval = this.__windowInnerWidth;
        if (retval === undefined) retval = this.__windowInnerWidth = window.innerWidth;
        return retval;
    },
    
    /** Gets the window's innerHeight.
        @returns the current height of the window. */
    getHeight: function() {
        var retval = this.__windowInnerHeight;
        if (retval === undefined) retval = this.__windowInnerHeight = window.innerHeight;
        return retval;
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** Handles the window resize event and broadcasts it to the observers.
        @private
        @param domEvent:object the window resize dom event.
        @returns void */
    __handleEvent: function(domEvent) {
        if (!domEvent) domEvent = window.event;
        
        var event = this.RESIZE_EVENT,
            target = domEvent.target,
            value = event.value,
            isChanged = false,
            w = target.innerWidth,
            h = target.innerHeight;
        if (w !== value.w) {
            value.w = this.__windowInnerWidth = w;
            isChanged = true;
        }
        if (h !== value.h) {
            value.h = this.__windowInnerHeight = h;
            isChanged = true;
        }
        
        if (isChanged) this.fireEvent(event);
    }
});

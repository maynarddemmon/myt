/** Provides events when the window is resized. Registered with myt.global
    as 'windowResize'.
    
    Events:
        resize:object Fired when the browser window is resized. This is a
            reused event stored at myt.global.windowResize.RESIZE_EVENT. The 
            value is an object containing:
                w:number the new window width.
                h:number the new window height.
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
        myt.addEventListener(window, 'resize', function(domEvent) {self._handleEvent(domEvent);});
        
        myt.global.register('windowResize', this);
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    /** Gets the window's innerWidth.
        @returns the current width of the window. */
    getWidth: function() {
        var retval = this._windowInnerWidth;
        if (retval === undefined) retval = this._windowInnerWidth = window.innerWidth;
        return retval;
    },
    
    /** Gets the window's innerHeight.
        @returns the current height of the window. */
    getHeight: function() {
        var retval = this._windowInnerHeight;
        if (retval === undefined) retval = this._windowInnerHeight = window.innerHeight;
        return retval;
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** Handles the window resize event and broadcasts it to the observers.
        @param domEvent:object the window resize dom event.
        @returns void */
    _handleEvent: function(domEvent) {
        if (!domEvent) domEvent = window.event;
        
        var event = this.RESIZE_EVENT;
        var target = domEvent.target;
        var value = event.value;
        
        var isChanged = false;
        var w = target.innerWidth;
        if (w !== value.w) {
            value.w = this._windowInnerWidth = w;
            isChanged = true;
        }
        var h = target.innerHeight;
        if (h !== value.h) {
            value.h = this._windowInnerHeight = h;
            isChanged = true;
        }
        
        if (isChanged) this.fireEvent(event);
    }
});

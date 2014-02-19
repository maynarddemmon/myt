/** Provides idle events. Registered with myt.global as 'idle'.
    
    Events:
        idle:object Fired when a browser idle event occurs. The event value is
            an object containing:
                delta: The time in millis since the last idle evnet.
                time: The time in millis of this idle event.
    
    Attributes:
        running:boolean Indicates if idle events are currently being fired
            or not.
        lastTime:number The millis of the last idle event fired.
    
    Private Attributes:
        __timerId:number The ID of the last idle event in the browser.
        __doIdle:function The function that gets executed on idle.
        __event:object The idle event object that gets reused.
*/
new JS.Singleton('GlobalIdle', {
    include: [myt.Observable],
    
    
    // Constructor /////////////////////////////////////////////////////////////
    initialize: function() {
        this.running = false;
        
        var vendor, vendors = ['webkit','moz','ms','o'], win = window;
        for (var i = 0; i < vendors.length && !win.requestAnimationFrame; ++i) {
            vendor = vendors[i];
            win.requestAnimationFrame = win[vendor + 'RequestAnimationFrame'];
            win.cancelAnimationFrame = win[vendor + 'CancelAnimationFrame'] || win[vendor + 'CancelRequestAnimationFrame'];
        }
        
        // Setup callback function
        var self = this;
        this.__event = {};
        this.__doIdle = function doIdle(time) {
            self.__timerId = win.requestAnimationFrame(doIdle);
            var lastTime = self.lastTime;
            if (lastTime !== -1) {
                var event = self.__event;
                event.delta = time - lastTime;
                event.time = time;
                self.fireNewEvent('idle', event);
            }
            self.lastTime = time;
        };
        
        myt.global.register('idle', this);
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** @overrides myt.Observable */
    attachObserver: function(observer, methodName, type) {
        var retval = this.callSuper(observer, methodName, type);
        
        // Start firing idle events
        if (!this.running && this.hasObservers('idle')) {
            this.running = true;
            this.lastTime = -1;
            this.__timerId = window.requestAnimationFrame(this.__doIdle);
        }
        
        return retval;
    },
    
    /** @overrides myt.Observable */
    detachObserver: function(observer, methodName, type) {
        var retval = this.callSuper(observer, methodName, type);
        
        // Stop firing idle events
        if (this.running && !this.hasObservers('idle')) {
            window.cancelAnimationFrame(this.__timerId);
            this.running = false;
        }
        
        return retval;
    }
});

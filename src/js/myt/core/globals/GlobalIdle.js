/** Provides idle events. Registered with myt.global as 'idle'.
    
    Events:
        idle:object Fired when a browser idle event occurs. The event value is
            an object containing:
                delta: The time in millis since the last idle evnet.
                time: The time in millis of this idle event.
    
    Attributes:
        running:boolean indicates if idle events are currently being fired
            or not.
        lastTime:number the millis of the last idle event fired.
        __timerId:number the ID of the last idle event in the browser.
*/
new JS.Singleton('GlobalIdle', {
    include: [myt.Observable],
    
    
    // Constructor /////////////////////////////////////////////////////////////
    initialize: function() {
        this.running = false;
        
        var vendors = ['ms', 'moz', 'webkit', 'o'];
        var vendor;
        for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
            vendor = vendors[x];
            window.requestAnimationFrame = window[vendor + 'RequestAnimationFrame'];
            window.cancelAnimationFrame = window[vendor + 'CancelAnimationFrame'] || window[vendor + 'CancelRequestAnimationFrame'];
        }
        
        myt.global.register('idle', this);
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** @overrides myt.Observable */
    attachObserver: function(observer, methodName, type) {
        var retval = this.callSuper(observer, methodName, type);
        if (!this.running && this.hasObservers('idle')) this.start();
        return retval;
    },
    
    /** @overrides myt.Observable */
    detachObserver: function(observer, methodName, type) {
        var retval = this.callSuper(observer, methodName, type);
        if (this.running && !this.hasObservers('idle')) this.stop();
        return retval;
    },
    
    start: function() {
        if (this.running) return;
        
        var self = this;
        function doIdle(time) {
            if (self.lastTime === -1) {
                // Don't fire idle events for first browser "idle" event.
                // Instead, use it to record lastTime so we will have a delta
                // when we do fire idle events.
                self.lastTime = time;
                self.__timerId = window.requestAnimationFrame(doIdle);
            } else {
                self.__timerId = window.requestAnimationFrame(doIdle);
                self.fireNewEvent('idle', {delta:time - self.lastTime, time:time});
                self.lastTime = time;
            }
        };
        
        this.running = true;
        this.lastTime = -1;
        this.__timerId = window.requestAnimationFrame(doIdle);
    },
    
    stop: function() {
        if (!this.running) return;
        
        window.cancelAnimationFrame(this.__timerId);
        this.running = false;
    }
});

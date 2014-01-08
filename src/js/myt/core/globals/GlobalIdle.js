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
*/
new JS.Singleton('GlobalIdle', {
    include: [myt.Observable],
    
    
    // Constructor /////////////////////////////////////////////////////////////
    initialize: function() {
        this.running = false;
        
        var vendor, vendors = ['webkit','moz','ms','o'];
        for (var i = 0; i < vendors.length && !window.requestAnimationFrame; ++i) {
            vendor = vendors[i];
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
    
    /** Start firing idle events.
        @returns void */
    start: function() {
        if (!this.running) {
            var self = this;
            function doFirstIdle(time) {
                self.__timerId = window.requestAnimationFrame(doIdle);
                self.lastTime = time;
            };
            function doIdle(time) {
                self.__timerId = window.requestAnimationFrame(doIdle);
                self.fireNewEvent('idle', {delta:time - self.lastTime, time:time});
                self.lastTime = time;
            };
            
            this.running = true;
            this.lastTime = -1;
            this.__timerId = window.requestAnimationFrame(doFirstIdle);
        }
    },
    
    /** Stop firing idle events.
        @returns void */
    stop: function() {
        if (this.running) {
            window.cancelAnimationFrame(this.__timerId);
            this.running = false;
        }
    }
});

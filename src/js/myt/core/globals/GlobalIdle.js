((pkg) => {
    const win = window,
        
        /* The idle event object that gets reused. */
        EVENT = {};
        
        /* The ID of the last idle event in the browser. */
    let timerId,
        
        /* The function that gets executed on idle. */
        idleFunc,
        
        /* The millis of the last idle event fired. */
        lastTime,
        
        /* Indicates if idle events are currently being fired or not. */
        running = false;
    
    /** Provides idle events. Registered with myt.global as 'idle'.
        
        Events:
            idle:object Fired when a browser idle event occurs. The event value 
                is an object containing:
                    delta: The time in millis since the last idle evnet.
                    time: The time in millis of this idle event.
        
        @class */
    new JS.Singleton('GlobalIdle', {
        include: [pkg.Observable],
        
        
        // Constructor /////////////////////////////////////////////////////////
        initialize: function() {
            const self = this,
                vendors = ['webkit','moz','ms','o'];
            for (let i = 0; i < vendors.length && !win.requestAnimationFrame;) {
                const vendor = vendors[i++];
                win.requestAnimationFrame = win[vendor + 'RequestAnimationFrame'];
                win.cancelAnimationFrame = win[vendor + 'CancelAnimationFrame'] || win[vendor + 'CancelRequestAnimationFrame'];
            }
            
            // Setup callback function
            idleFunc = time => {
                timerId = win.requestAnimationFrame(idleFunc);
                if (lastTime !== -1) {
                    time = Math.round(time);
                    EVENT.delta = time - lastTime;
                    EVENT.time = time;
                    self.fireEvent('idle', EVENT);
                }
                lastTime = time;
            };
            
            pkg.global.register('idle', self);
        },
        
        
        // Methods /////////////////////////////////////////////////////////////
        /** @overrides myt.Observable */
        attachObserver: function(observer, methodName, type) {
            const retval = this.callSuper(observer, methodName, type);
            
            // Start firing idle events
            if (!running && this.hasObservers('idle')) {
                running = true;
                lastTime = -1;
                timerId = win.requestAnimationFrame(idleFunc);
            }
            
            return retval;
        },
        
        /** @overrides myt.Observable */
        detachObserver: function(observer, methodName, type) {
            const retval = this.callSuper(observer, methodName, type);
            
            // Stop firing idle events
            if (running && !this.hasObservers('idle')) {
                win.cancelAnimationFrame(timerId);
                running = false;
            }
            
            return retval;
        }
    });
})(myt);

(pkg => {
    let 
        /* A reference to the GlobalIdle Singleton. */
        globalIdle,
        
        /*  The ID of the last idle event in the browser. */
        timerId,
        
        /*  The millis of the last idle event fired. */
        lastTime,
        
        /*  Indicates if idle events are currently being fired or not. */
        running = false;
    
    const {requestAnimationFrame, cancelAnimationFrame} = window,
        
        /*  The idle event object that gets reused. */
        EVENT = {},
        
        /*  The function that gets executed on idle. */
        idleFunc = time => {
            timerId = requestAnimationFrame(idleFunc);
            time = Math.round(time);
            if (lastTime !== -1) {
                EVENT.delta = time - lastTime;
                EVENT.time = time;
                globalIdle.fireEvent('idle', EVENT);
            }
            lastTime = time;
        };
    
    /** Provides idle events. Registered with myt.global as 'idle'.
        
        Events:
            idle:object Fired when a browser idle event occurs. The event value is an 
                object containing:
                    delta: The time in millis since the last idle evnet.
                    time: The time in millis of this idle event.
        
        @class */
    new JS.Singleton('GlobalIdle', {
        include: [pkg.Observable],
        
        
        // Constructor /////////////////////////////////////////////////////////
        initialize: function() {
            pkg.global.register('idle', globalIdle = this);
        },
        
        
        // Methods /////////////////////////////////////////////////////////////
        /** @overrides myt.Observable */
        attachObserver: (observer, methodName, type) => {
            const retval = globalIdle.callSuper(observer, methodName, type);
            
            // Start firing idle events
            if (!running && globalIdle.hasObservers('idle')) {
                running = true;
                lastTime = -1;
                timerId = requestAnimationFrame(idleFunc);
            }
            
            return retval;
        },
        
        /** @overrides myt.Observable */
        detachObserver: (observer, methodName, type) => {
            const retval = globalIdle.callSuper(observer, methodName, type);
            
            // Stop firing idle events
            if (running && !globalIdle.hasObservers('idle')) {
                cancelAnimationFrame(timerId);
                running = false;
            }
            
            return retval;
        }
    });
})(myt);

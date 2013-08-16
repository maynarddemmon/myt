/** A utility class that will call a myt.Callback or function after a 
    specified time. */
myt.Timer = new JS.Class('Timer', {
    // Constructor /////////////////////////////////////////////////////////////
    /** Creates a new Timer. If a callback and delay are provided
        the timer is started.
        @param callback:myt.Callback/function the callback to execute when the
            timer completes.
        @param delayInMillis:Number the length of time to delay for. */
    initialize: function(callback, delayInMillis) {
        this.reset(callback, delayInMillis);
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    /** The myt.Callback or function to execute when the time completes. */
    setCallback: function(callback) {
        this.callback = callback;
    },
    
    /** (Number) The "timer" ID returned by setTimeout. The initial value 
        is undefined. */
    setTimerId: function(timerId) {
        this.timerId = timerId;
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** Stops the timer and clears the callback.
        @returns void */
    clear: function() {
        if (this.isRunning()) {
            clearTimeout(this.timerId);
            this.setTimerId(undefined);
        }
        this.setCallback(undefined);
    },
    
    /** Stops the Timer and restarts it with the callback and delay if
        they are provided.
        @returns void */
    reset: function(callback, delayInMillis) {
        this.clear();
        this.setCallback(callback);
        this.run(delayInMillis);
    },
    
    /** Start the timer.
        @returns void */
    run: function(delayInMillis) {
        if (this.callback && delayInMillis >= 0) {
            var self = this;
            var func = function() {
                self.setTimerId(undefined);
                if (self.callback.execute) {
                    self.callback.execute();
                } else {
                    self.callback.call(this);
                }
            };
            
            this.setTimerId(
                BrowserDetect.browser === 'Firefox' ? this.__setTimeout(func, delayInMillis) : setTimeout(func, delayInMillis)
            );
        }
    },
    
    /** Indicates if the Timer is currently running or not.
        @returns boolean */
    isRunning: function() {
        return this.timerId !== undefined;
    },
    
    /** Fix for firefox since that browser often executes setTimeout early. */
    __setTimeout: function(f, t) {
        var self = this;
        var endTime = Date.now() + t;
        return setTimeout(function() {
            var now = Date.now();
            if (now < endTime) {
                self.setTimerId(self.__setTimeout(f, endTime - now));
            } else {
                f();
            }
        }, t);
    }
});

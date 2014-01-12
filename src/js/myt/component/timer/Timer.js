/** A utility class that will call a myt.Callback or function after a 
    specified time.
    
    Events:
        None
    
    Attributes:
        callback:myt.Callback|function The callback to get executed when the
            timer completes.
        timerId:number The "timer" ID returned by setTimeout. The initial value 
            is undefined.
*/
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
    setCallback: function(callback) {this.callback = callback;},
    setTimerId: function(timerId) {this.timerId = timerId;},
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** Stops the timer and clears the callback.
        @returns void */
    clear: function() {
        if (this.isRunning()) {
            clearTimeout(this.timerId);
            this.setTimerId();
        }
        this.setCallback();
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
                self.setTimerId();
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
    
    /** Fix for firefox since that browser often executes setTimeout early.
        @private */
    __setTimeout: function(f, t) {
        var self = this,
            endTime = Date.now() + t;
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

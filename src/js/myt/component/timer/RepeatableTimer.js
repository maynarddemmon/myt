/** A Timer that can be repeated as well as provide a value to execute.
    
    Events:
        None
    
    Attributes:
        value:* An optional value to be passed to the callbacks execute method.
        repeatDelayInMillis:number If this value is greater than zero the 
            timer will repeat using this value as the delay.
*/
myt.RepeatableTimer = new JS.Class('RepeatableTimer', myt.Timer, {
    // Constructor /////////////////////////////////////////////////////////////
    /** Creates a new Timer. If a callback and delay are provided
        the timer is started.
        @overrides
        @param callback:Callback the Callback to execute when the timer
            completes.
        @param delayInMillis:Number the length of time to delay for.
        @param value:* (Optional) value to be passed to the callback when
            the timer fires.
        @param repeatDelayInMillis:Number (Optional) the length of time in
            millis between repeated calls of this timer. If less than zero the
            timer will not be repeated. */
    initialize: function(callback, delayInMillis, value, repeatDelayInMillis) {
        this.reset(callback, delayInMillis, value, repeatDelayInMillis);
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setValue: function(value) {this.value = value;},
    setRepeatDelayInMillis: function(repeatDelayInMillis) {this.repeatDelayInMillis = repeatDelayInMillis;},
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** Stops the timer and clears the callback, value and repeat delay.
        @overrides
        @returns void */
    clear: function() {
        this.callSuper();
        this.setValue();
        this.setRepeatDelayInMillis();
    },
    
    /** Stops the Timer and restarts it with the callback and delay if
        they are provided.
        @overrides
        @returns void */
    reset: function(callback, delayInMillis, value, repeatDelayInMillis) {
        this.clear();
        this.setCallback(callback);
        this.setValue(value);
        this.setRepeatDelayInMillis(repeatDelayInMillis);
        this.run(delayInMillis);
    },
    
    /** @overrides myt.Timer */
    run: function(delayInMillis) {
        if (this.callback && delayInMillis >= 0) {
            var self = this;
            this.setTimerId(setTimeout(function() {
                var repeatDelay = self.repeatDelayInMillis,
                    isRepeating = repeatDelay !== undefined && repeatDelay >= 0;
                if (!isRepeating) self.setTimerId();
                
                if (self.value === undefined) {
                    self.callback.execute();
                } else {
                    self.callback.execute(self.value);
                }
                
                if (isRepeating) self.run(repeatDelay);
            }, delayInMillis));
        }
    }
});

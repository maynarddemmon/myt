/** Changes the value of an attribute on a target over time.
    
    Events:
        running:boolean Fired when the animation starts or stops.
        paused:boolean Fired when the animation is paused or unpaused.
        reverse:boolean
        easingFunction:function
        from:number
        to:number
        repeat:Fired when the animation repeats. The value is the current
            loop count.
        
    Attributes:
        attribute:string The attribute to animate.
        target:object The object to animate the attribute on. The default is 
            the parent of this node.
        from:number The starting value of the attribute. If not specified the 
            current value on the target will be used.
        to:number The ending value of the attribute.
        duration:number The length of time the animation will run in millis.
            The default value is 1000.
        easingFunction:string/function Controls the rate of animation.
            string: See http://easings.net/ for more info. One of the following:
                linear, 
                easeInQuad, easeOutQuad, easeInOutQuad(default), 
                easeInCubic, easeOutCubic, easeInOutCubic, 
                easeInQuart, easeOutQuart, easeInOutQuart, 
                easeInQuint, easeOutQuint, easeInOutQuint, 
                easeInSine, easeOutSine, easeInOutSine,
                easeInExpo ,easeOutExpo, easeInOutExpo, 
                easeInCirc, easeOutCirc, easeInOutCirc,
                easeInElastic ,easeOutElastic, easeInOutElastic, 
                easeInBack, easeOutBack, easeInOutBack, 
                easeInBounce, easeOutBounce, easeInOutBounce
            
            function: A function that determines the rate of change of the 
                attribute. The arguments to the easing function are:
                t: Animation progress in millis
                c: Value change (to - from)
                d: Animation duration in millis
        relative:boolean Determines if the animated value is set on the target 
            (false), or added to the exiting value on the target (true). Note
            that this means the difference between the from and to values
            will be "added" to the existing value on the target. The default 
            value is false.
        repeat:number The number of times to repeat the animation. If negative 
            the animation will repeat forever. The default value is 1.
        reverse:boolean If true, the animation is run in reverse.
        running:boolean Indicates if the animation is currently running. The 
            default value is false.
        paused:boolean Indicates if the animation is temporarily paused. The 
            default value is false.
        callback:function A function that gets called when the animation
            completes. A boolean value is passed into the function and will be
            true if the animation completed successfully or false if not.
    
    Private Attributes:
        __loopCount:number the loop currently being run.
        __progress:number the number of millis currently used during the
            current animation loop.
        __temporaryFrom:boolean Indicates no "from" was set on the animator so 
            we will have to generate one when needed. We want to reset back to 
            undefined after the animation completes so that subsequent calls 
            to start the animation will behave the same.
*/
myt.Animator = new JS.Class('Animator', myt.Node, {
    include: [myt.Reusable],
    
    
    // Class Methods and Attributes ////////////////////////////////////////////
    extend: {
        easingFunctions: {
            linear:function(t){return t;},
            easeInQuad:function(t){return t*t;},
            easeOutQuad:function(t){return -t*(t-2);},
            easeInOutQuad:function(t){return (t/=0.5) < 1 ? 0.5*t*t : -0.5 * ((--t)*(t-2) - 1);},
            easeInCubic:function(t){return t*t*t;},
            easeOutCubic:function(t){return ((t=t-1)*t*t + 1);},
            easeInOutCubic:function(t){return (t/=0.5) < 1 ? 0.5*t*t*t : 1 /2*((t-=2)*t*t + 2);},
            easeInQuart:function(t){return t*t*t*t;},
            easeOutQuart:function(t){return -((t=t-1)*t*t*t - 1);},
            easeInOutQuart:function(t){return (t/=0.5) < 1 ? 0.5*t*t*t*t : -0.5 * ((t-=2)*t*t*t - 2);},
            easeInQuint:function(t){return t*t*t*t*t;},
            easeOutQuint:function(t){return ((t=t-1)*t*t*t*t + 1);},
            easeInOutQuint:function(t){return (t/=0.5) < 1 ? 0.5*t*t*t*t*t : 0.5*((t-=2)*t*t*t*t + 2);},
            easeInSine:function(t){return - Math.cos(t * (Math.PI/2)) + 1;},
            easeOutSine:function(t){return Math.sin(t * (Math.PI/2));},
            easeInOutSine:function(t){return -0.5 * (Math.cos(Math.PI*t) - 1);},
            easeInExpo:function(t){return (t==0)? 0: Math.pow(2, 10 * (t - 1));},
            easeOutExpo:function(t){return (t==1)? 1: (-Math.pow(2, -10 * t) + 1);},
            easeInCirc:function(t){return - (Math.sqrt(1 - t*t) - 1);},
            easeOutCirc:function(t){return Math.sqrt(1 - (t=t-1)*t);},
            easeInOutCirc:function(t){return (t/=0.5) < 1? -0.5 * (Math.sqrt(1 - t*t) - 1): 0.5 * (Math.sqrt(1 - (t-=2)*t) + 1);},
            easeInOutExpo:function(t){
                if (t==0) return 0;
                if (t==1) return 1;
                if ((t/=0.5) < 1) return 0.5 * Math.pow(2, 10 * (t - 1));
                return 0.5 * (-Math.pow(2, -10 * --t) + 2);
            },
            easeInElastic:function(t){
                var s=1.70158, p=0, a=1;
                if (t==0) return 0;
                if (t==1) return 1;
                if (!p) p=0.3;
                if (a < 1) {
                    a=1; var s=p/4;
                } else {
                    var s = p/(2*Math.PI) * Math.asin (1/a);
                }
                return -(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*1-s)*(2*Math.PI)/p));
            },
            easeOutElastic:function(t){
                var s=1.70158, p=0, a=1;
                if (t==0) return 0;
                if (t==1) return 1;
                if (!p) p=1*0.3;
                if (a < 1) {
                    a=1; var s=p/4;
                } else {
                    var s = p/(2*Math.PI) * Math.asin (1/a);
                }
                return a*Math.pow(2,-10*t) * Math.sin((t*1-s)*(2*Math.PI)/p) + 1;
            },
            easeInOutElastic:function(t){
                var s=1.70158, p=0, a=1;
                if (t==0) return 0;
                if ((t/=0.5)==2) return 1;
                if (!p) p=(0.3*1.5);
                if (a < 1) {
                    a=1; var s=p/4;
                } else {
                    var s = p/(2*Math.PI) * Math.asin (1/a);
                }
                if (t < 1) return -.5*(a*Math.pow(2,10*(t-=1)) * Math.sin((t*1-s)*(2*Math.PI)/p));
                return a*Math.pow(2,-10*(t-=1)) * Math.sin((t*1-s)*(2*Math.PI)/p)*0.5 + 1;
            },
            easeInBack:function(t, s){
                if (s == undefined) s = 1.70158;
                return (t/=1)*t*((s+1)*t - s);
            },
            easeOutBack:function(t, s){
                if (s == undefined) s = 1.70158;
                return ((t=t/1-1)*t*((s+1)*t + s) + 1);
            },
            easeInOutBack:function(t, s){
                if (s == undefined) s = 1.70158;
                if ((t/=0.5) < 1) return 0.5*(t*t*(((s*=(1.525))+1)*t - s));
                return 0.5*((t-=2)*t*(((s*=(1.525))+1)*t + s) + 2);
            },
            easeInBounce:function(t){return 1 - myt.Animator.easingFunctions.easeOutBounce(1-t);},
            easeOutBounce:function(t){
                if (t < (1/2.75)) {
                    return (7.5625*t*t);
                } else if (t < (2/2.75)) {
                    return (7.5625*(t-=(1.5/2.75))*t + 0.75);
                } else if (t < (2.5/2.75)) {
                    return (7.5625*(t-=(2.25/2.75))*t + 0.9375);
                }
                return (7.5625*(t-=(2.625/2.75))*t + .984375);
            },
            easeInOutBounce:function(t){
                if (t < 0.5) return myt.Animator.easingFunctions.easeInBounce(t*2) * 0.5;
                return myt.Animator.easingFunctions.easeOutBounce(t*2-1) * 0.5 + 0.5;
            }
        }
    },
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides myt.Node */
    initNode: function(parent, attrs) {
        var self = this;
        
        self.duration = 1000;
        self.relative = self.reverse = self.running = self.paused = false;
        self.repeat = 1;
        self.easingFunction = myt.Animator.DEFAULT_EASING_FUNCTION;
        
        self.callSuper(parent, attrs);
        
        self.__reset();
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setRunning: function(v) {
        var self = this;
        
        if (self.running !== v) {
            self.running = v;
            if (self.inited) self.fireNewEvent('running', v);
            
            if (!self.paused) {
                if (v) {
                    self.__isColorAttr();
                } else {
                    if (self.__temporaryFrom) self.from = undefined;
                    self.__reset();
                }
                self[v ? 'attachTo' : 'detachFrom'](myt.global.idle, '__update', 'idle');
            }
        }
    },
    
    setPaused: function(v) {
        var self = this;
        
        if (self.paused !== v) {
            self.paused = v;
            if (self.inited) self.fireNewEvent('paused', v);
            if (self.running) self[v ? 'detachFrom' : 'attachTo'](myt.global.idle, '__update', 'idle');
        }
    },
    
    setReverse: function(v) {
        var self = this;
        
        if (self.reverse !== v) {
            self.reverse = v;
            if (self.inited) self.fireNewEvent('reverse', v);
            if (!self.running) self.__reset();
        }
    },
    
    setEasingFunction: function(v) {
        // Lookup easing function if a string is provided.
        if (typeof v === 'string') v = myt.Animator.easingFunctions[v];
        
        // Use default if invalid
        if (!v) v = myt.Animator.DEFAULT_EASING_FUNCTION;
        
        if (this.easingFunction !== v) {
            this.easingFunction = v;
            if (this.inited) this.fireNewEvent('easingFunction', v);
        }
    },
    
    setFrom: function(v) {
        if (this.from !== v) {
            this.from = v;
            if (this.inited) this.fireNewEvent('from', v);
        }
    },
    
    setTo: function(v) {
        if (this.to !== v) {
            this.to = v;
            if (this.inited) this.fireNewEvent('to', v);
        }
    },
    
    setCallback: function(v) {this.callback = v;},
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** @private */
    __isColorAttr: function() {
        var target = this.__getTarget();
        this.__isColorAnim = (target && typeof target.isColorAttr === 'function') ? target.isColorAttr(this.attribute) : undefined;
    },
    
    /** @private */
    __getTarget: function() {
        return this.target || this.parent;
    },
    
    /** A convienence method to set the callback to run when the animator
        stops running. If a callback already exists the provided callback
        will be executed after the existing one.
        @param callback:function the function to run.
        @param replace:boolean (optional) if true the existing callback will 
            be replaced with the new callback.
        @returns void */
    next: function(callback, replace) {
        var existingCallback = this.callback;
        if (existingCallback && !replace) {
            var anim = this;
            this.setCallback(function(success) {
                existingCallback.call(anim, success);
                callback.call(anim, success);
            });
        } else {
            this.setCallback(callback);
        }
    },
    
    /** Puts the animator back to an initial configured state.
        @param executeCallback:boolean (optional) if true the callback, if
            it exists, will be executed.
        @returns void */
    reset: function(executeCallback) {
        var self = this;
        
        self.__reset();
        
        self.setRunning(false);
        self.setPaused(false);
        
        if (executeCallback && self.callback) self.callback.call(self, false);
    },
    
    /** @overrides myt.Reusable */
    clean: function() {
        var self = this;
        
        self.to = self.from = self.attribute = self.callback = undefined;
        self.duration = 1000;
        self.relative = self.reverse = false;
        self.repeat = 1;
        self.easingFunction = myt.Animator.DEFAULT_EASING_FUNCTION;
        
        self.reset(false);
    },
    
    /** @private */
    __reset: function() {
        var self = this;
        
        self.__temporaryFrom = false;
        self.__loopCount = self.reverse ? self.repeat - 1 : 0;
        self.__progress = self.reverse ? self.duration : 0;
    },
    
    /** @private */
    __update: function(idleEvent) {
        this.__advance(idleEvent.value.delta);
    },
    
    /** @private */
    __advance: function(timeDiff) {
        var self = this;
        
        if (self.running && !self.paused) {
            var reverse = self.reverse, 
                duration = self.duration, 
                repeat = self.repeat;
            
            // An animation in reverse is like time going backward.
            if (reverse) timeDiff = timeDiff * -1;
            
            // Determine how much time to move forward by.
            var oldProgress = self.__progress;
            self.__progress += timeDiff;
            
            // Check for overage
            var remainderTime = 0;
            if (self.__progress > duration) {
                remainderTime = self.__progress - duration;
                self.__progress = duration;
                
                // Increment loop count and halt looping if necessary
                if (++self.__loopCount === repeat) remainderTime = 0;
            } else if (0 > self.__progress) {
                // Reverse case
                remainderTime = -self.__progress; // Flip reverse time back to forward time
                self.__progress = 0;
                
                // Decrement loop count and halt looping if necessary
                if (0 > --self.__loopCount && repeat > 0) remainderTime = 0;
            }
            
            var target = self.__getTarget();
            if (target) {
                self.__updateTarget(target, self.__progress, oldProgress);
                
                if (
                    (!reverse && self.__loopCount === repeat) || // Forward check
                    (reverse && 0 > self.__loopCount && repeat > 0) // Reverse check
                ) {
                    // Stop animation since loop count exceeded repeat count.
                    self.setRunning(false);
                    if (self.callback) self.callback.call(self, true);
                } else if (remainderTime > 0) {
                    // Advance again if time is remaining. This occurs when
                    // the timeDiff provided was greater than the animation
                    // duration and the animation loops.
                    self.fireNewEvent('repeat', self.__loopCount);
                    self.__progress = reverse ? duration : 0;
                    self.__advance(remainderTime);
                }
            } else {
                console.log("No target found for animator.", self);
                self.setRunning(false);
                if (self.callback) self.callback.call(self, false);
            }
        }
    },
    
    /** @private */
    __updateTarget: function(target, progress, oldProgress) {
        var self = this,
            relative = self.relative,
            duration = self.duration,
            attr = self.attribute,
            progressPercent = Math.max(0, progress / duration), 
            oldProgressPercent = Math.max(0, oldProgress / duration);
        
        // Determine what "from" to use if none was provided.
        if (self.from == null) {
            self.__temporaryFrom = true;
            self.from = relative ? (self.__isColorAnim ? '#000000' : 0) : target.get(attr);
        }
        
        var motionValue = self.easingFunction(progressPercent) - (relative ? self.easingFunction(oldProgressPercent) : 0),
            value = relative ? target.get(attr) : self.from,
            to = self.to;
        
        target.set(attr, self.__isColorAnim ? self.__getColorValue(self.from, to, motionValue, relative, value) : value + ((to - self.from) * motionValue));
    },
    
    /** @private */
    __getColorValue: function(from, to, motionValue, relative, value) {
        var C = myt.Color,
            fromColor = C.makeColorFromHexString(from),
            toColor = C.makeColorFromHexString(to),
            colorObj = relative ? C.makeColorFromHexString(value) : fromColor;
        colorObj.setRed(colorObj.red + ((toColor.red - fromColor.red) * motionValue));
        colorObj.setGreen(colorObj.green + ((toColor.green - fromColor.green) * motionValue));
        colorObj.setBlue(colorObj.blue + ((toColor.blue - fromColor.blue) * motionValue));
        return colorObj.getHtmlHexString();
    }
});

/** Setup the default easing function. */
myt.Animator.DEFAULT_EASING_FUNCTION = myt.Animator.easingFunctions.easeInOutQuad;

(pkg => {
    const getTarget = animator => animator.target || animator.parent,
        
        isColorAttr = animator => {
            const target = getTarget(animator);
            animator.__isColorAnim = (target && typeof target.isColorAttr === 'function') ? target.isColorAttr(animator.attribute) : undefined;
        },
        
        getColorValue = (from, to, motionValue, relative, value) => {
            const Color = pkg.Color,
                fromColor = Color.makeColorFromHexString(from),
                toColor = Color.makeColorFromHexString(to),
                colorObj = relative ? Color.makeColorFromHexString(value) : fromColor;
            colorObj.setRed(colorObj.red + ((toColor.red - fromColor.red) * motionValue));
            colorObj.setGreen(colorObj.green + ((toColor.green - fromColor.green) * motionValue));
            colorObj.setBlue(colorObj.blue + ((toColor.blue - fromColor.blue) * motionValue));
            return colorObj.getHtmlHexString();
        },
        
        updateTarget = (animator, target, progress, oldProgress) => {
            const relative = animator.relative,
                duration = animator.duration,
                attr = animator.attribute,
                progressPercent = Math.max(0, progress / duration), 
                oldProgressPercent = Math.max(0, oldProgress / duration);
            
            // Determine what "from" to use if none was provided.
            if (animator.from == null) {
                animator.__temporaryFrom = true;
                animator.from = relative ? (animator.__isColorAnim ? '#000' : 0) : target.get(attr);
            }
            
            const motionValue = animator.easingFunction(progressPercent) - (relative ? animator.easingFunction(oldProgressPercent) : 0),
                value = relative ? target.get(attr) : animator.from,
                to = animator.to;
            
            target.set(attr, animator.__isColorAnim ? getColorValue(animator.from, to, motionValue, relative, value) : value + ((to - animator.from) * motionValue));
        },
        
        reset = animator => {
            animator.__temporaryFrom = false;
            animator.__loopCount = animator.reverse ? animator.repeat - 1 : 0;
            animator.__progress = animator.reverse ? animator.duration : 0;
        },
        
        advance = (animator, timeDiff) => {
            if (animator.running && !animator.paused) {
                const reverse = animator.reverse, 
                    duration = animator.duration, 
                    repeat = animator.repeat;
                
                // An animation in reverse is like time going backward.
                if (reverse) timeDiff = timeDiff * -1;
                
                // Determine how much time to move forward by.
                const oldProgress = animator.__progress;
                animator.__progress += timeDiff;
                
                // Check for overage
                let remainderTime = 0;
                if (animator.__progress > duration) {
                    remainderTime = animator.__progress - duration;
                    animator.__progress = duration;
                    
                    // Increment loop count and halt looping if necessary
                    if (++animator.__loopCount === repeat) remainderTime = 0;
                } else if (0 > animator.__progress) {
                    // Reverse case
                    remainderTime = -animator.__progress; // Flip reverse time back to forward time
                    animator.__progress = 0;
                    
                    // Decrement loop count and halt looping if necessary
                    if (0 > --animator.__loopCount && repeat > 0) remainderTime = 0;
                }
                
                const target = getTarget(animator);
                if (target) {
                    updateTarget(animator, target, animator.__progress, oldProgress);
                    
                    if (
                        (!reverse && animator.__loopCount === repeat) || // Forward check
                        (reverse && 0 > animator.__loopCount && repeat > 0) // Reverse check
                    ) {
                        // Stop animation since loop count exceeded repeat count.
                        animator.setRunning(false);
                        if (animator.callback) animator.callback.call(animator, true);
                    } else if (remainderTime > 0) {
                        // Advance again if time is remaining. This occurs when
                        // the timeDiff provided was greater than the animation
                        // duration and the animation loops.
                        animator.fireEvent('repeat', animator.__loopCount);
                        animator.__progress = reverse ? duration : 0;
                        advance(animator, remainderTime);
                    }
                } else {
                    console.log("No target found for animator.", animator);
                    animator.setRunning(false);
                    if (animator.callback) animator.callback.call(animator, false);
                }
            }
        },
        
        PI = Math.PI,
        TWO_PI = 2*PI,
        HALF_PI = PI/2,
        
        /** Changes the value of an attribute on a target over time.
            
            Events:
                running:boolean Fired when the animation starts or stops.
                paused:boolean Fired when the animation is paused or unpaused.
                reverse:boolean
                easingFunction:function
                from:number
                to:number
                repeat:Fired when the animation repeats. The value is the 
                    current loop count.
                
            Attributes:
                attribute:string The attribute to animate.
                target:object The object to animate the attribute on. The 
                    default is the parent of this node.
                from:number The starting value of the attribute. If not 
                    specified the current value on the target will be used.
                to:number The ending value of the attribute.
                duration:number The length of time the animation will run 
                    in millis. The default value is 1000.
                easingFunction:string/function Controls the rate of animation.
                    string: See http://easings.net/ for more info. One of the 
                        following:
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
                    
                    function: A function that determines the rate of change of 
                        the attribute. The arguments to the easing 
                        function are:
                            t: Animation progress in millis
                            c: Value change (to - from)
                            d: Animation duration in millis
                relative:boolean Determines if the animated value is set on the 
                    target (false), or added to the exiting value on the 
                    target (true). Note that this means the difference between 
                    the from and to values will be "added" to the existing 
                    value on the target. The default value is false.
                repeat:number The number of times to repeat the animation. If 
                    negative the animation will repeat forever. The default 
                    value is 1.
                reverse:boolean If true, the animation is run in reverse.
                running:boolean Indicates if the animation is currently running.
                    The default value is false.
                paused:boolean Indicates if the animation is temporarily paused.
                    The default value is false.
                callback:function A function that gets called when the animation
                    completes. A boolean value is passed into the function and 
                    will be true if the animation completed successfully or 
                    false if not.
            
            Private Attributes:
                __loopCount:number the loop currently being run.
                __progress:number the number of millis currently used during the
                    current animation loop.
                __temporaryFrom:boolean Indicates no "from" was set on the 
                    animator so we will have to generate one when needed. We 
                    want to reset back to undefined after the animation 
                    completes so that subsequent calls to start the animation
                    will behave the same.
                __isColorAnim:boolean Indicates this animator is animating a
                    color attribute.
            
            @class */
        Animator = pkg.Animator = new JS.Class('Animator', pkg.Node, {
            include: [pkg.Reusable],
            
            
            // Class Methods and Attributes ////////////////////////////////////
            extend: {
                easingFunctions: {
                    linear:t => t,
                    
                    easeInQuad:t => t*t,
                    easeOutQuad:t => -t*(t-2),
                    easeInOutQuad:t => (t/=0.5) < 1 ? 0.5*t*t : -0.5 * ((--t)*(t-2) - 1),
                    
                    easeInCubic:t => t*t*t,
                    easeOutCubic:t => ((t=t-1)*t*t + 1),
                    easeInOutCubic:t => (t/=0.5) < 1 ? 0.5*t*t*t : 1 /2*((t-=2)*t*t + 2),
                    
                    easeInQuart:t => t*t*t*t,
                    easeOutQuart:t => -((t=t-1)*t*t*t - 1),
                    easeInOutQuart:t => (t/=0.5) < 1 ? 0.5*t*t*t*t : -0.5 * ((t-=2)*t*t*t - 2),
                    
                    easeInQuint:t => t*t*t*t*t,
                    easeOutQuint:t => ((t=t-1)*t*t*t*t + 1),
                    easeInOutQuint:t => (t/=0.5) < 1 ? 0.5*t*t*t*t*t : 0.5*((t-=2)*t*t*t*t + 2),
                    
                    easeInSine:t => -Math.cos(t * HALF_PI) + 1,
                    easeOutSine:t => Math.sin(t * HALF_PI),
                    easeInOutSine:t => -0.5 * (Math.cos(PI*t) - 1),
                    
                    easeInCirc:t => -(Math.sqrt(1 - t*t) - 1),
                    easeOutCirc:t => Math.sqrt(1 - (t=t-1)*t),
                    easeInOutCirc:t => (t/=0.5) < 1? -0.5 * (Math.sqrt(1 - t*t) - 1): 0.5 * (Math.sqrt(1 - (t-=2)*t) + 1),
                    
                    easeInExpo:t => (t==0) ? 0 : Math.pow(2, 10 * (t - 1)),
                    easeOutExpo:t => (t==1) ? 1 : (-Math.pow(2, -10 * t) + 1),
                    easeInOutExpo:t => {
                        if (t==0) return 0;
                        if (t==1) return 1;
                        if ((t/=0.5) < 1) return 0.5 * Math.pow(2, 10 * (t - 1));
                        return 0.5 * (-Math.pow(2, -10 * --t) + 2);
                    },
                    
                    easeInElastic:t => {
                        if (t==0) return 0;
                        if (t==1) return 1;
                        let p = 0.3,
                            s = p/4;
                        return -(Math.pow(2,10*(t-=1)) * Math.sin((t*1-s)*TWO_PI/p));
                    },
                    easeOutElastic:t => {
                        if (t==0) return 0;
                        if (t==1) return 1;
                        let p = 0.3,
                            s = p/4;
                        return Math.pow(2,-10*t) * Math.sin((t*1-s)*TWO_PI/p) + 1;
                    },
                    easeInOutElastic:t => {
                        if (t==0) return 0;
                        if ((t/=0.5)==2) return 1;
                        let p = 0.45,
                            s = p/4;
                        if (t < 1) return -.5*(Math.pow(2,10*(t-=1)) * Math.sin((t*1-s)*TWO_PI/p));
                        return Math.pow(2,-10*(t-=1)) * Math.sin((t*1-s)*TWO_PI/p)*0.5 + 1;
                    },
                    
                    easeInBack:(t, s=1.70158) => (t/=1)*t*((s+1)*t - s),
                    easeOutBack:(t, s=1.70158) => ((t=t/1-1)*t*((s+1)*t + s) + 1),
                    easeInOutBack:(t, s=1.70158) => {
                        if ((t/=0.5) < 1) return 0.5*(t*t*(((s*=(1.525))+1)*t - s));
                        return 0.5*((t-=2)*t*(((s*=(1.525))+1)*t + s) + 2);
                    },
                    
                    easeInBounce:t => 1 - Animator.easingFunctions.easeOutBounce(1-t),
                    easeOutBounce:t => {
                        if (t < (1/2.75)) {
                            return (7.5625*t*t);
                        } else if (t < (2/2.75)) {
                            return (7.5625*(t-=(1.5/2.75))*t + 0.75);
                        } else if (t < (2.5/2.75)) {
                            return (7.5625*(t-=(2.25/2.75))*t + 0.9375);
                        }
                        return (7.5625*(t-=(2.625/2.75))*t + .984375);
                    },
                    easeInOutBounce:t => {
                        if (t < 0.5) return Animator.easingFunctions.easeInBounce(t*2) * 0.5;
                        return Animator.easingFunctions.easeOutBounce(t*2-1) * 0.5 + 0.5;
                    }
                }
            },
            
            
            // Life Cycle //////////////////////////////////////////////////////
            /** @overrides myt.Node */
            initNode: function(parent, attrs) {
                const self = this;
                
                self.duration = 1000;
                self.relative = self.reverse = self.running = self.paused = false;
                self.repeat = 1;
                self.easingFunction = Animator.DEFAULT_EASING_FUNCTION;
                
                self.callSuper(parent, attrs);
                
                reset(self);
            },
            
            
            // Accessors ///////////////////////////////////////////////////////
            setRunning: function(v) {
                const self = this;
                
                if (self.running !== v) {
                    self.running = v;
                    if (self.inited) self.fireEvent('running', v);
                    
                    if (!self.paused) {
                        if (v) {
                            isColorAttr(self);
                        } else {
                            if (self.__temporaryFrom) self.from = undefined;
                            reset(self);
                        }
                        self[v ? 'attachTo' : 'detachFrom'](pkg.global.idle, '__updateAnim', 'idle');
                    }
                }
            },
            
            setPaused: function(v) {
                const self = this;
                
                if (self.paused !== v) {
                    self.paused = v;
                    if (self.inited) self.fireEvent('paused', v);
                    if (self.running) self[v ? 'detachFrom' : 'attachTo'](pkg.global.idle, '__updateAnim', 'idle');
                }
            },
            
            setReverse: function(v) {
                const self = this;
                
                if (self.reverse !== v) {
                    self.reverse = v;
                    if (self.inited) self.fireEvent('reverse', v);
                    if (!self.running) reset(self);
                }
            },
            
            setEasingFunction: function(v) {
                // Lookup easing function if a string is provided.
                if (typeof v === 'string') v = Animator.easingFunctions[v];
                
                // Use default if invalid
                if (!v) v = Animator.DEFAULT_EASING_FUNCTION;
                
                this.set('easingFunction', v, true);
            },
            
            setFrom: function(v) {
                this.set('from', v, true);
            },
            
            setTo: function(v) {
                this.set('to', v, true);
            },
            
            setCallback: function(v) {this.callback = v;},
            
            
            // Methods /////////////////////////////////////////////////////////
            /** A convienence method to set the callback to run when the 
                animator stops running. If a callback already exists the 
                provided callback will be executed after the existing one.
                @param {!Function} callback - The function to run.
                @param {boolean} [replace] - If true the existing callback will 
                    be replaced with the new callback.
                @returns {undefined} */
            next: function(callback, replace) {
                const self = this,
                    existingCallback = self.callback;
                if (existingCallback && !replace) {
                    self.setCallback(success => {
                        existingCallback.call(self, success);
                        callback.call(self, success);
                    });
                } else {
                    self.setCallback(callback);
                }
            },
            
            /** Puts the animator back to an initial configured state.
                @param {boolean} [executeCallback] - If true the callback, if
                    it exists, will be executed.
                @returns {undefined} */
            reset: function(executeCallback) {
                const self = this;
                
                reset(self);
                
                self.setRunning(false);
                self.setPaused(false);
                
                if (executeCallback && self.callback) self.callback.call(self, false);
            },
            
            /** @overrides myt.Reusable */
            clean: function() {
                const self = this;
                
                self.to = self.from = self.attribute = self.callback = undefined;
                self.duration = 1000;
                self.relative = self.reverse = false;
                self.repeat = 1;
                self.easingFunction = Animator.DEFAULT_EASING_FUNCTION;
                
                self.reset(false);
            },
            
            /** @private
                @param {!Object} idleEvent
                @returns {undefined} */
            __updateAnim: function(idleEvent) {
                advance(this, idleEvent.value.delta);
            }
        });
    
    /* Setup the default easing function. */
    Animator.DEFAULT_EASING_FUNCTION = Animator.easingFunctions.easeInOutQuad;
})(myt);

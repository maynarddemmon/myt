(pkg => {
    const {max:mathMax, sin:mathSin, cos:mathCos, pow:mathPow, sqrt:mathSqrt, PI} = Math,
        
        TWO_PI = 2 * PI,
        HALF_PI = PI / 2,
        
        globalIdle = pkg.global.idle,
        
        makeColorFromHexString = pkg.Color.makeColorFromHexString,
        
        wiggleLeg = (t, magnitude) => magnitude * ((t*=2) < 1 ? t*t/2 : -((--t)*(t-2) - 1)/2),
        
        easingFunctions = {
            linear:t => t,
            
            inQuad:t => t*t,
            outQuad:t => -t*(t-2),
            inOutQuad:t => (t*=2) < 1 ? t*t/2 : -((--t)*(t-2) - 1)/2,
            
            inCubic:t => t*t*t,
            outCubic:t => (t=t-1)*t*t + 1,
            inOutCubic:t => (t*=2) < 1 ? t*t*t/2 : ((t-=2)*t*t + 2)/2,
            
            inQuart:t => t*t*t*t,
            outQuart:t => -((t=t-1)*t*t*t - 1),
            inOutQuart:t => (t*=2) < 1 ? t*t*t*t/2 : -((t-=2)*t*t*t - 2)/2,
            
            inQuint:t => t*t*t*t*t,
            outQuint:t => (t=t-1)*t*t*t*t + 1,
            inOutQuint:t => (t*=2) < 1 ? t*t*t*t*t/2 : ((t-=2)*t*t*t*t + 2)/2,
            
            inSine:t => -mathCos(t * HALF_PI) + 1,
            outSine:t => mathSin(t * HALF_PI),
            inOutSine:t => -(mathCos(t * PI) - 1)/2,
            
            inCirc:t => -(mathSqrt(1 - t*t) - 1),
            outCirc:t => mathSqrt(1 - (t=t-1)*t),
            inOutCirc:t => (t*=2) < 1 ? -(mathSqrt(1 - t*t) - 1)/2: (mathSqrt(1 - (t-=2)*t) + 1)/2,
            
            inExpo:t => t === 0 ? 0 : mathPow(2, 10 * (t - 1)),
            outExpo:t => t === 1 ? 1 : (-mathPow(2, -10 * t) + 1),
            inOutExpo:t => {
                if (t === 0 || t === 1) return t;
                if ((t*=2) < 1) return mathPow(2, 10 * (t - 1))/2;
                return (-mathPow(2, -10 * --t) + 2)/2;
            },
            
            inElastic:t => {
                if (t === 0 || t === 1) return t;
                const p = 0.3;
                return -(mathPow(2, 10 * (t -= 1)) * mathSin((t * 1 - p/4) * TWO_PI / p));
            },
            outElastic:t => {
                if (t === 0 || t === 1) return t;
                const p = 0.3;
                return mathPow(2,-10 * t) * mathSin((t * 1 - p/4) * TWO_PI / p) + 1;
            },
            inOutElastic:t => {
                if (t === 0 || t === 1) return t;
                const p = 0.45;
                if ((t*=2) < 1) return -(mathPow(2, 10 * (t-=1)) * mathSin((t * 1 - p/4) * TWO_PI / p))/2;
                return mathPow(2, -10 * (t-=1)) * mathSin((t * 1 - p/4) * TWO_PI/p)/2 + 1;
            },
            
            inBack:(t, s=1.70158) => (t/=1) * t * ((s+1)*t - s),
            outBack:(t, s=1.70158) => (t=t/1-1) * t * ((s+1)*t + s) + 1,
            inOutBack:(t, s=1.70158) => (t*=2) < 1 ? (t*t*(((s*=(1.525))+1)*t - s))/2 : ((t-=2)*t*(((s*=(1.525))+1)*t + s) + 2)/2,
            
            inBounce:t => 1 - easingFunctions.outBounce(1-t),
            outBounce:t => {
                if (t < (1/2.75)) {
                    return 7.5625*t*t;
                } else if (t < (2/2.75)) {
                    return 7.5625*(t-=(1.5/2.75))*t + 0.75;
                } else if (t < (2.5/2.75)) {
                    return 7.5625*(t-=(2.25/2.75))*t + 0.9375;
                }
                return 7.5625*(t-=(2.625/2.75))*t + 0.984375;
            },
            inOutBounce:t => (t*=2) < 1 ? easingFunctions.inBounce(t)/2 : (easingFunctions.outBounce(t-1) + 1)/2,
            
            wiggle:t => {
                t *= 6;
                if (t < 1) return wiggleLeg(t - 0, 1);
                if (t < 2) return wiggleLeg(2 - t, 1);
                if (t < 3) return wiggleLeg(t - 2, 0.5);
                if (t < 4) return wiggleLeg(4 - t, 0.5);
                if (t < 5) return wiggleLeg(t - 4, 0.25);
                           return wiggleLeg(6 - t, 0.25);
            }
        },
        
        DEFAULT_EASING = easingFunctions.inOutQuad,
        
        getTarget = animator => animator.target ?? animator.parent,
        
        getColorValue = (from, to, motionValue, relative, value) => {
            const fromColor = makeColorFromHexString(from),
                toColor = makeColorFromHexString(to),
                colorObj = relative ? makeColorFromHexString(value) : fromColor;
            colorObj.setRed(colorObj.red + ((toColor.red - fromColor.red) * motionValue));
            colorObj.setGreen(colorObj.green + ((toColor.green - fromColor.green) * motionValue));
            colorObj.setBlue(colorObj.blue + ((toColor.blue - fromColor.blue) * motionValue));
            return colorObj.getHtmlHexString();
        },
        
        reset = animator => {
            animator.__tmpFrom = false;
            animator.__loopCnt = animator.reverse ? animator.repeat - 1 : 0;
            animator.__prog = animator.reverse ? animator.duration : 0;
        },
        
        advance = (animator, timeDiff) => {
            const {running, paused, reverse, duration, repeat, __prog:oldProgress, easingFunction, callback} = animator;
            if (running && !paused) {
                // An animation in reverse is like time going backward.
                if (reverse) timeDiff *= -1;
                
                // Determine how much time to move forward by.
                let progress = oldProgress + timeDiff;
                
                // Check for overage
                let remainderTime = 0;
                if (progress > duration) {
                    remainderTime = progress - duration;
                    progress = duration;
                    
                    // Increment loop count and halt looping if necessary
                    if (++animator.__loopCnt === repeat) remainderTime = 0;
                } else if (0 > progress) {
                    // Reverse case
                    remainderTime = -progress; // Flip reverse time back to forward time
                    progress = 0;
                    
                    // Decrement loop count and halt looping if necessary
                    if (0 > --animator.__loopCnt && repeat > 0) remainderTime = 0;
                }
                
                const target = getTarget(animator);
                if (target) {
                    // Update Target
                    const {relative, attribute:attr, __isColorAnim, __loopCnt, to} = animator,
                        progressPercent = mathMax(0, progress / duration), 
                        oldProgressPercent = mathMax(0, oldProgress / duration);
                    
                    // Determine what "from" to use if none was provided.
                    if (animator.from == null) {
                        animator.__tmpFrom = true;
                        animator.from = relative ? (__isColorAnim ? '#000' : 0) : target.get(attr);
                    }
                    
                    const motionValue = easingFunction(progressPercent) - (relative ? easingFunction(oldProgressPercent) : 0),
                        from = animator.from,
                        value = relative ? target.get(attr) : from;
                    target.set(attr, __isColorAnim ? getColorValue(from, to, motionValue, relative, value) : value + ((to - from) * motionValue));
                    
                    if (
                        (!reverse && __loopCnt === repeat) || // Forward check
                        (reverse && 0 > __loopCnt && repeat > 0) // Reverse check
                    ) {
                        // Stop animation since loop count exceeded repeat count.
                        animator.setRunning(false);
                        callback?.call(animator, true);
                    } else if (remainderTime > 0) {
                        // Advance again if time is remaining. This occurs when the timeDiff 
                        // provided was greater than the animation duration and the animation loops.
                        animator.fireEvent('repeat', __loopCnt);
                        animator.__prog = reverse ? duration : 0;
                        advance(animator, remainderTime);
                    } else {
                        animator.__prog = progress;
                    }
                } else {
                    console.log('No target for animator', animator);
                    animator.setRunning(false);
                    callback?.call(animator, false);
                }
            }
        },
        
        wiggleView = (view, amount, duration, axis) => {
            view.stopActiveAnimators(axis, true);
            const value = view[axis];
            view.animate({
                attribute:axis, from:value, to:value + amount, duration:duration, easingFunction:'wiggle'
            }).next(() => {
                view.set(axis, value);
            });
        };
    
    /** Changes the value of an attribute on a target over time.
        
        Events:
            running:boolean Fired when the animation starts or stops.
            paused:boolean Fired when the animation is paused or unpaused.
            reverse:boolean
            easingFunction:function
            from:number
            to:number
            repeat:Fired when the animation repeats. The value is the current loop count.
            
        Attributes:
            attribute:string The attribute to animate.
            target:object The object to animate the attribute on. The default is the parent of 
                this node.
            from:number The starting value of the attribute. If not specified the current value 
                on the target will be used.
            to:number The ending value of the attribute.
            duration:number The length of time the animation will run in millis. The default 
                value is 1000.
            easingFunction:string/function Controls the rate of animation.
                string: See http://easings.net/ for more info. One of the following:
                        linear, 
                        inQuad, outQuad, inOutQuad(default), 
                        inCubic, outCubic, inOutCubic, 
                        inQuart, outQuart, inOutQuart, 
                        inQuint, outQuint, inOutQuint, 
                        inSine, outSine, inOutSine,
                        inExpo ,outExpo, inOutExpo, 
                        inCirc, outCirc, inOutCirc,
                        inElastic ,outElastic, inOutElastic, 
                        inBack, outBack, inOutBack, 
                        inBounce, outBounce, inOutBounce
                
                function: A function that determines the rate of change of the attribute. The 
                    arguments to the easing function are:
                        t: Animation progress in millis
                        c: Value change (to - from)
                        d: Animation duration in millis
            relative:boolean Determines if the animated value is set on the target (false), or 
                added to the exiting value on the target (true). Note that this means the 
                difference between the from and to values will be "added" to the existing 
                value on the target. The default value is false.
            repeat:number The number of times to repeat the animation. 
                If negative the animation will repeat forever. The default value is 1.
            reverse:boolean If true, the animation is run in reverse.
            running:boolean Indicates if the animation is currently running. The default value 
                is false.
            paused:boolean Indicates if the animation is temporarily paused. The default value 
                is false.
            callback:function A function that gets called when the animation completes. A 
                boolean value is passed into the function and will be true if the animation 
                completed successfully or false if not.
        
        Private Attributes:
            __loopCnt:number the loop currently being run.
            __prog:number the number of millis currently used during the current animation loop.
            __tmpFrom:boolean Indicates no "from" was set on the animator so we will have to 
                generate one when needed. We want to reset back to undefined after the animation 
                completes so that subsequent calls to start the animation will behave the same.
            __isColorAnim:boolean Indicates this animator is animating a color attribute.
        
        @class */
    pkg.Animator = new JS.Class('Animator', pkg.Node, {
        include: [pkg.Reusable],
        
        
        // Class Methods and Attributes ////////////////////////////////////
        extend: {
            /** An object containing easign functions. */
            easings: easingFunctions,
            
            /** Utility function to bounce a View. */
            bounceView: (view, amount=-6, duration=900) => {
                wiggleView(view, amount, duration, 'y');
            },
            
            /** Utility function to shake a View. */
            shakeView: (view, amount=10, duration=300) => {
                wiggleView(view, amount, duration, 'x');
            },
            
            /** Utility function to bounce or shake a View. */
            wiggleView:wiggleView
        },
        
        
        // Life Cycle //////////////////////////////////////////////////////
        /** @overrides myt.Node */
        initNode: function(parent, attrs) {
            const self = this;
            
            self.duration = 1000;
            self.relative = self.reverse = self.running = self.paused = false;
            self.repeat = 1;
            self.easingFunction = DEFAULT_EASING;
            
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
                        // Determine if we are animating a color or not. We do this by checking
                        // an isColorAttr function on the animation target if it exists.
                        const target = getTarget(self);
                        self.__isColorAnim = (target && typeof target.isColorAttr === 'function') ? target.isColorAttr(self.attribute) : undefined;
                    } else {
                        if (self.__tmpFrom) self.from = undefined;
                        reset(self);
                    }
                    self[v ? 'attachTo' : 'detachFrom'](globalIdle, '__updateAnim', 'idle');
                }
            }
        },
        
        setPaused: function(v) {
            const self = this;
            if (self.paused !== v) {
                self.paused = v;
                if (self.inited) self.fireEvent('paused', v);
                if (self.running) self[v ? 'detachFrom' : 'attachTo'](globalIdle, '__updateAnim', 'idle');
            }
        },
        
        setReverse: function(v) {
            this.set('reverse', v, true);
            if (this.inited && !this.running) reset(this);
        },
        
        setRepeat: function(v) {
            this.set('repeat', v, true);
            if (this.inited && !this.running) reset(this);
        },
        
        setDuration: function(v) {
            this.set('duration', v, true);
            if (this.inited && !this.running) reset(this);
        },
        
        setEasingFunction: function(v) {
            // Lookup easing function if a string is provided.
            if (typeof v === 'string') v = easingFunctions[v];
            
            this.set('easingFunction', v ?? DEFAULT_EASING, true);
        },
        
        setFrom: function(v) {this.set('from', v, true);},
        setTo: function(v) {this.set('to', v, true);},
        setCallback: function(v) {this.callback = v;},
        
        
        // Methods /////////////////////////////////////////////////////////
        /** A convienence method to set the callback to run when the animator stops running. If 
            a callback already exists the provided callback will be executed after (but not 
            after the existing animator completes) the existing one.
            @param {!Function} callback - The function to run.
            @param {boolean} [replace] - If true the existing callback will be replaced with 
                the new callback.
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
            @param {boolean} [executeCallback] - If true and the callback exists, the callback 
                will be executed.
            @returns {undefined} */
        reset: function(executeCallback) {
            const self = this;
            
            reset(self);
            
            self.setRunning(false);
            self.setPaused(false);
            
            if (executeCallback) self.callback?.call(self, false);
        },
        
        /** @overrides myt.Reusable */
        clean: function() {
            const self = this;
            
            self.to = self.from = self.attribute = self.callback = undefined;
            self.duration = 1000;
            self.relative = self.reverse = false;
            self.repeat = 1;
            self.easingFunction = DEFAULT_EASING;
            
            self.reset(false);
        },
        
        /** @private
            @param {!Object} idleEvent
            @returns {undefined} */
        __updateAnim: function(idleEvent) {
            advance(this, idleEvent.value.delta);
        }
    });
})(myt);

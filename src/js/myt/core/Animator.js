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
        duration:number The length of time for the animation in millis. The 
            default value is 1000.
        easingFunction:string/function Control the rate of animation.
            string: See http://easings.net/ for more info. One of the following:
                linear(default), 
                easeInQuad, easeOutQuad, easeInOutQuad, 
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
                t: animation progress in millis
                c: value change (to - from)
                d: duration
        relative:boolean Determines if the animated value is set on the target 
            (false), or added to the exiting value on the target (true). The 
            default value is false.
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
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides myt.Node */
    initNode: function(parent, attrs) {
        this.duration = 1000;
        this.relative = this.reverse = this.running = this.paused = false;
        this.repeat = 1;
        this.easingFunction = myt.Animator.easingFunctions.linear;
        
        this.callSuper(parent, attrs);
        
        this.__temporaryFrom = false;
        this.__loopCount = this.reverse ? this.repeat - 1 : 0;
        this.__progress = this.reverse ? this.duration : 0;
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setRunning: function(v) {
        if (this.running !== v) {
            this.running = v;
            if (this.inited) this.fireNewEvent('running', v);
            
            if (!this.paused) {
                if (v) {
                    this.attachTo(myt.global.idle, '__update', 'idle');
                } else {
                    this.__loopCount = this.reverse ? this.repeat - 1 : 0;
                    this.__progress = this.reverse ? this.duration : 0;
                    if (this.__temporaryFrom) this.from = undefined;
                    this.__temporaryFrom = false;
                    this.detachFrom(myt.global.idle, '__update', 'idle');
                }
            }
        }
    },
    
    setPaused: function(v) {
        if (this.paused !== v) {
            this.paused = v;
            if (this.inited) this.fireNewEvent('paused', v);
            
            if (this.running) {
                if (v) {
                    this.detachFrom(myt.global.idle, '__update', 'idle');
                } else {
                    this.attachTo(myt.global.idle, '__update', 'idle');
                }
            }
        }
    },
    
    setReverse: function(v) {
        if (this.reverse !== v) {
            this.reverse = v;
            if (this.inited) this.fireNewEvent('reverse', v);
            
            if (!this.running) {
                this.__loopCount = this.reverse ? this.repeat - 1 : 0;
                this.__progress = this.reverse ? this.duration : 0;
            }
        }
    },
    
    setEasingFunction: function(v) {
        // Lookup easing function if a string is provided.
        if (typeof v === 'string') {
            var func = myt.Animator.easingFunctions[v];
            if (!func) {
                console.log("Unknown easingFunction: ", v);
                func = myt.Animator.easingFunctions.linear;
            }
            v = func;
        }
        
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
            it exists will be executed.
        @returns void */
    reset: function(executeCallback) {
        if (this.paused) {
            this.__temporaryFrom = false;
            this.__loopCount = this.reverse ? this.repeat - 1 : 0;
            this.__progress = this.reverse ? this.duration : 0;
        }
        
        this.setRunning(false);
        this.setPaused(false);
        
        if (executeCallback && this.callback) this.callback.call(this, false);
    },
    
    /** @overrides myt.Reusable */
    clean: function() {
        this.to = this.from = this.attribute = this.callback = undefined;
        this.duration = 1000;
        this.relative = this.reverse = false;
        this.repeat = 1;
        this.easingFunction = myt.Animator.easingFunctions.linear;
        
        if (this.paused) {
            this.__temporaryFrom = false;
            this.__loopCount = this.reverse ? this.repeat - 1 : 0;
            this.__progress = this.reverse ? this.duration : 0;
        }
        
        this.setRunning(false);
        this.setPaused(false);
    },
    
    /** @private */
    __update: function(idleEvent) {
        this.__advance(idleEvent.value.delta);
    },
    
    /** @private */
    __advance: function(timeDiff) {
        if (!this.running || this.paused) return;
        
        var reverse = this.reverse, 
            duration = this.duration, 
            repeat = this.repeat, 
            attr = this.attribute;
        if (reverse) timeDiff = timeDiff * -1;
        
        // Determine how much time to move forward by.
        var oldProgress = this.__progress;
        this.__progress += timeDiff;
        
        // Check for overage
        var remainderTime = 0;
        if (this.__progress > duration) {
            remainderTime = this.__progress - duration;
            this.__progress = duration;
            
            if (++this.__loopCount === repeat) remainderTime = 0;
        } else if (0 > this.__progress) {
            // Reverse case
            remainderTime = -this.__progress;
            this.__progress = 0;
            
            if (0 > --this.__loopCount && repeat > 0) remainderTime = 0;
        }
        
        // Apply to attribute
        var target = this.target ? this.target : this.parent;
        if (!target) {
            console.log("No target found for animator.", this);
            this.setRunning(false);
            if (this.callback) this.callback.call(this, false);
            return;
        }
        
        if (this.from == null) {
            this.__temporaryFrom = true;
            this.from = this.relative ? 0 : target.get(attr);
        }
        var from = this.from,
            attrDiff = this.to - from,
            newValue = this.easingFunction(this.__progress, attrDiff, duration);
        if (this.relative) {
            var oldValue = this.easingFunction(oldProgress, attrDiff, duration),
                curValue = target.get(attr);
            target.set(attr, curValue + newValue - oldValue);
        } else {
            target.set(attr, from + newValue);
        }
        
        // Stop animation if loop count exceeded
        if (reverse) {
            if (0 > this.__loopCount && repeat > 0) {
                this.setRunning(false);
                if (this.callback) this.callback.call(this, true);
                return;
            }
        } else {
            if (this.__loopCount === repeat) {
                this.setRunning(false);
                if (this.callback) this.callback.call(this, true);
                return;
            }
        }
        
        // Advance again if time is remaining
        if (remainderTime > 0) {
            this.fireNewEvent('repeat', this.__loopCount);
            this.__progress = reverse ? duration : 0;
            this.__advance(remainderTime);
        }
    }
});


/*
 * TERMS OF USE - EASING EQUATIONS
 * 
 * Open source under the BSD License. 
 * 
 * Copyright © 2001 Robert Penner
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without modification, 
 * are permitted provided that the following conditions are met:
 * 
 * Redistributions of source code must retain the above copyright notice, this list of 
 * conditions and the following disclaimer.
 * Redistributions in binary form must reproduce the above copyright notice, this list 
 * of conditions and the following disclaimer in the documentation and/or other materials 
 * provided with the distribution.
 * 
 * Neither the name of the author nor the names of contributors may be used to endorse 
 * or promote products derived from this software without specific prior written permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY 
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE
 * COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 * EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE
 * GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED 
 * AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED 
 * OF THE POSSIBILITY OF SUCH DAMAGE. 
 *
 * ============================================================
 * jQuery Easing v1.3 - http://gsgd.co.uk/sandbox/jquery/easing/
 *
 * Open source under the BSD License.
 *
 * Copyright © 2008 George McGinley Smith
 * All rights reserved.
 * https://raw.github.com/danro/jquery-easing/master/LICENSE
 * ============================================================
 */
myt.Animator.easingFunctions = {
    linear:function(t, c, d) {
        return c*(t/d);
    },
    easeInQuad:function(t, c, d) {
        return c*(t/=d)*t;
    },
    easeOutQuad:function(t, c, d) {
        return -c *(t/=d)*(t-2);
    },
    easeInOutQuad:function(t, c, d) {
        if ((t/=d/2) < 1) return c/2*t*t;
        return -c/2 * ((--t)*(t-2) - 1);
    },
    easeInCubic:function(t, c, d) {
        return c*(t/=d)*t*t;
    },
    easeOutCubic:function(t, c, d) {
        return c*((t=t/d-1)*t*t + 1);
    },
    easeInOutCubic:function(t, c, d) {
        if ((t/=d/2) < 1) return c/2*t*t*t;
        return c/2*((t-=2)*t*t + 2);
    },
    easeInQuart:function(t, c, d) {
        return c*(t/=d)*t*t*t;
    },
    easeOutQuart:function(t, c, d) {
        return -c * ((t=t/d-1)*t*t*t - 1);
    },
    easeInOutQuart:function(t, c, d) {
        if ((t/=d/2) < 1) return c/2*t*t*t*t;
        return -c/2 * ((t-=2)*t*t*t - 2);
    },
    easeInQuint:function(t, c, d) {
        return c*(t/=d)*t*t*t*t;
    },
    easeOutQuint:function(t, c, d) {
        return c*((t=t/d-1)*t*t*t*t + 1);
    },
    easeInOutQuint:function(t, c, d) {
        if ((t/=d/2) < 1) return c/2*t*t*t*t*t;
        return c/2*((t-=2)*t*t*t*t + 2);
    },
    easeInSine: function (t, c, d) {
        return -c * Math.cos(t/d * (Math.PI/2)) + c;
    },
    easeOutSine: function (t, c, d) {
        return c * Math.sin(t/d * (Math.PI/2));
    },
    easeInOutSine: function (t, c, d) {
        return -c/2 * (Math.cos(Math.PI*t/d) - 1);
    },
    easeInExpo: function (t, c, d) {
        return (t===0) ? 0 : c * Math.pow(2, 10 * (t/d - 1));
    },
    easeOutExpo: function (t, c, d) {
        return (t===d) ? c : c * (-Math.pow(2, -10 * t/d) + 1);
    },
    easeInOutExpo: function (t, c, d) {
        if (t===0) return 0;
        if (t===d) return c;
        if ((t/=d/2) < 1) return c/2 * Math.pow(2, 10 * (t - 1));
        return c/2 * (-Math.pow(2, -10 * --t) + 2);
    },
    easeInCirc: function (t, c, d) {
        return -c * (Math.sqrt(1 - (t/=d)*t) - 1);
    },
    easeOutCirc: function (t, c, d) {
        return c * Math.sqrt(1 - (t=t/d-1)*t);
    },
    easeInOutCirc: function (t, c, d) {
        if ((t/=d/2) < 1) return -c/2 * (Math.sqrt(1 - t*t) - 1);
        return c/2 * (Math.sqrt(1 - (t-=2)*t) + 1);
    },
    easeInElastic: function (t, c, d) {
        var s = 1.70158, p = 0, a = c;
        if (t===0) return 0;
        if ((t/=d)===1) return c;
        if (!p) p = d*.3;
        if (a < Math.abs(c)) {
            //a = c;
            s = p/4;
        } else {
            s = p/(2*Math.PI) * Math.asin(c/a);
        }
        return -(a*Math.pow(2,10*(t-=1)) * Math.sin((t*d-s)*(2*Math.PI)/p));
    },
    easeOutElastic: function (t, c, d) {
        var s = 1.70158, p = 0, a = c;
        if (t===0) return 0;
        if ((t/=d)===1) return c;
        if (!p) p = d*.3;
        if (a < Math.abs(c)) {
            //a = c;
            s = p/4;
        } else {
            s = p/(2*Math.PI) * Math.asin(c/a);
        }
        return a*Math.pow(2,-10*t) * Math.sin((t*d-s)*(2*Math.PI)/p) + c;
    },
    easeInOutElastic: function (t, c, d) {
        var s = 1.70158, p = 0, a = c;
        if (t===0) return 0;
        if ((t/=d/2)===2) return c;
        if (!p) p = d*(.3*1.5);
        if (a < Math.abs(c)) {
            //a = c;
            s = p/4;
        } else {
            s = p/(2*Math.PI) * Math.asin(c/a);
        }
        if (t < 1) return -.5*(a*Math.pow(2,10*(t-=1)) * Math.sin((t*d-s)*(2*Math.PI)/p));
        return a*Math.pow(2,-10*(t-=1)) * Math.sin((t*d-s)*(2*Math.PI)/p)*.5 + c;
    },
    easeInBack: function (t, c, d, s) {
        if (s === undefined) s = 1.70158;
        return c*(t/=d)*t*((s+1)*t - s) + b;
    },
    easeOutBack: function (t, c, d, s) {
        if (s === undefined) s = 1.70158;
        return c*((t=t/d-1)*t*((s+1)*t + s) + 1);
    },
    easeInOutBack: function (t, c, d, s) {
        if (s === undefined) s = 1.70158; 
        if ((t/=d/2) < 1) return c/2*(t*t*(((s*=(1.525))+1)*t - s));
        return c/2*((t-=2)*t*(((s*=(1.525))+1)*t + s) + 2);
    },
    easeInBounce: function (t, c, d) {
        return c - myt.Animator.easingFunctions.easeOutBounce(d-t, c, d);
    },
    easeOutBounce: function (t, c, d) {
        if ((t/=d) < (1/2.75)) {
            return c*(7.5625*t*t);
        } else if (t < (2/2.75)) {
            return c*(7.5625*(t-=(1.5/2.75))*t + .75);
        } else if (t < (2.5/2.75)) {
            return c*(7.5625*(t-=(2.25/2.75))*t + .9375);
        } else {
            return c*(7.5625*(t-=(2.625/2.75))*t + .984375);
        }
    },
    easeInOutBounce: function (t, c, d) {
        if (t < d/2) return myt.Animator.easingFunctions.easeInBounce(t*2, c, d) * .5;
        return myt.Animator.easingFunctions.easeOutBounce(t*2-d, c, d) * .5 + c*.5;
    }
};

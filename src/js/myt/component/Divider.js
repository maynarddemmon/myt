(pkg => {
    const JSClass = JS.Class,
        
        {abs:mathAbs, min:mathMin} = Math,
        
        {CODE_ENTER, CODE_SPACE, ARROW_KEYS} = pkg.global.keys,
        
        STATE_COLLAPSED = 0,
        STATE_RESTORED_JUST_COLLAPSED = 1,
        STATE_RESTORED_JUST_EXPANDED = 2,
        STATE_EXPANDED = 3,
        
        /*  Setup the limitToParent constraint.
            @param {!BaseDivider} divider
            @returns {void} */
        updateLimitToParentConstraint = divider => {
            const dim = divider.axis === 'y' ? 'height' : 'width';
            divider.constrain('__limitToParent', [divider, 'limitToParent', divider, dim, divider.parent, dim]);
        },
        
        NudgeMixin = pkg.NudgeMixin = new JS.Module('NudgeMixin', {
            // Life Cycle //////////////////////////////////////////////////////
            /** @overrides */
            initNode: function(parent, attrs) {
                attrs.nudgeTargetValue ??= 'value';
                attrs.nudgeIncrement ??= 1;
                attrs.nudgeMin ??= 1;
                attrs.nudgeMax ??= 64;
                this.__nudgeAcc = attrs.nudgeMin;
                
                this.callSuper(parent, attrs);
            },
            
            
            // Accessors ///////////////////////////////////////////////////////
            setNudgeIncrement: function(v) {this.set('nudgeIncrement', mathAbs(v), true);},
            setNudgeMin: function(v) {this.set('nudgeMin', mathAbs(v), true);},
            setNudgeMax: function(v) {this.set('nudgeMax', mathAbs(v), true);},
            setNudgeTargetValue: function(v) {this.set('nudgeTargetValue', v, true);},
            
            
            // Methods /////////////////////////////////////////////////////////
            /** Nudge the value of the nudgeTargetValue repeatedly.
                @param {boolean} direction - When true indicates positive.
                @param {boolean} isRepeat - Indicates if this is the result of a repeated user 
                    action and should thus accelerate.
                @returns {boolean}  */
            nudge: function(direction, isRepeat) {
                const self = this,
                    nudgeTargetValue = self.nudgeTargetValue,
                    nudgeAcc = self.__nudgeAcc = isRepeat ? mathMin(self.__nudgeAcc + self.nudgeIncrement, self.nudgeMax) : self.nudgeMin;
                
                self.set(
                    nudgeTargetValue, 
                    (self.get(nudgeTargetValue) || 0) + (direction ? 1 : -1) * nudgeAcc
                );
                
                return true;
            }
        }),
        
        /** A divider is a UI control that allows the user to resize two area by dragging the 
            divider left/right or up/down.
            
            Events:
                limitToParent:number
            
            Attributes:
                @property {string} axis - Indicates if the divider should be constrained 
                    horizontally or vertically. Allowed values: 'x' or 'y'. This value can only be 
                    set during instantiation.
                @property {number} limitToParent - If set, this will constrain the maxValue to the 
                    appropriate parent view dimension less the limitToParent amount.
                @property {number} expansionState - Used by the "primary" action to update the 
                    divider position. Allowed values are:
                        collapsed:0
                        restored just collapsed:1
                        restored just expanded:2
                        expanded:3
                @property {number} restoreValue - The value used to restore the position in the 
                    "primary" action.
            
            Private Attributes:
                __nudgeAcc:number The multiplier in px per nudge.
            
            @class */
        BaseDivider = new JSClass('BaseDivider', pkg.SimpleButton, {
            include: [pkg.BoundedValueComponent, pkg.Draggable, pkg.ArrowKeyActivation, NudgeMixin],
            
            
            // Life Cycle //////////////////////////////////////////////////////
            initNode: function(parent, attrs) {
                const self = this;
                
                attrs.activeColor ??= '#bbb';
                attrs.hoverColor ??= '#ddd';
                attrs.readyColor ??= '#ccc';
                attrs.axis ??= 'x';
                attrs.minValue ??= 0;
                attrs.value ??= attrs.minValue;
                attrs.expansionState ??= STATE_RESTORED_JUST_EXPANDED;
                attrs.focusIndicator ??= false;
                attrs.repeatKeyDown ??= true;
                attrs.activationKeys ??= [CODE_ENTER, CODE_SPACE, ...ARROW_KEYS];
                
                if (attrs.axis === 'y') {
                    attrs.height ??= 6;
                    attrs.cursor ??= 'row-resize';
                } else {
                    attrs.width ??= 6;
                    attrs.cursor ??= 'col-resize';
                }
                self.quickSet(['axis'], attrs);
                
                self.callSuper(parent, attrs);
                
                // Do afterwards since the value might have been constrained from the value provided 
                // in the attrs.
                if (attrs.restoreValue == null) self.setRestoreValue(self.value);
                
                if (self.limitToParent != null) updateLimitToParentConstraint(self);
                
                self.attachDomObserver(self, 'doPrimaryAction', 'dblclick');
            },
            
            
            // Accessors ///////////////////////////////////////////////////////
            setExpansionState: function(v) {this.expansionState = v;},
            setRestoreValue: function(v) {this.restoreValue = v;},
            
            setLimitToParent: function(v) {
                const self = this;
                
                if (self.limitToParent !== v) {
                    self.limitToParent = v;
                    if (self.inited) {
                        self.fireEvent('limitToParent', v);
                        
                        if (v == null) {
                            self.releaseConstraint('__limitToParent');
                        } else {
                            updateLimitToParentConstraint(self);
                        }
                    }
                }
            },
            
            setAxis: function(v) {
                if (this.inited) {
                    console.warn('Axis not updatable after instantiation');
                } else {
                    this.axis = v;
                }
            },
            
            /** Update the x or y position of the divider as the value changes.
                @overrides myt.ValueComponent
                @param {number} v - The x or y position to set.
                @returns {void} */
            setValue: function(v) {
                this.callSuper(v);
                
                v = this.value;
                if (this.axis === 'y') {
                    this.setY(v);
                } else {
                    this.setX(v);
                }
            },
            
            
            // Methods /////////////////////////////////////////////////////////
            /** Do the limitToParent constraint.
                @private
                @param {!Object} event
                @returns {void} */
            __limitToParent: function(event) {
                const self = this,
                    dim = self.axis === 'y' ? 'height' : 'width';
                self.setMaxValue(self.parent[dim] - self.limitToParent - self[dim]);
            },
            
            /** @overrides myt.Button. */
            doActivationKeyDown: function(key, isRepeat) {
                this.callSuper(key, isRepeat);
                
                switch (key) {
                    case CODE_ENTER:
                    case CODE_SPACE:
                        this.doPrimaryAction();
                }
            },
            
            /** @overrides myt.ArrowKeyActivation. */
            doKeyArrowLeftOrUp: function(isLeft, isRepeat) {
                return this.nudge(false, isRepeat);
            },
            
            /** @overrides myt.ArrowKeyActivation. */
            doKeyArrowRightOrDown: function(isRight, isRepeat) {
                return this.nudge(true, isRepeat);
            },
            
            /** Nudge the divider when the arrow keys are used. Nudging accelerates up to a limit 
                if the key is held down.
                @param {boolean} direction - When true indicates right/down.
                @param {boolean} isRepeat - Indicates if this is the result of a repeated key event.
                @returns {boolean}  */
            nudge: function(direction, isRepeat) {
                const self = this,
                    retval = self.callSuper(direction, isRepeat);
                self.setExpansionState(STATE_RESTORED_JUST_EXPANDED);
                self.setRestoreValue(self.value);
                return retval;
            },
            
            doPrimaryAction: function() {
                const self = this,
                    {restoreValue:rv, maxValue:maxV, minValue:minV} = self;
                let toValue;
                switch (self.expansionState) {
                    case STATE_COLLAPSED:
                        if (rv != null) {
                            self.setExpansionState(STATE_RESTORED_JUST_COLLAPSED);
                            if (rv === minV) {
                                // Prevent infinite loop if there's nowhere to animate to.
                                if (rv !== maxV) self.doPrimaryAction();
                            } else {
                                toValue = rv;
                            }
                        }
                        break;
                    case STATE_RESTORED_JUST_COLLAPSED:
                        if (maxV != null) {
                            self.setExpansionState(STATE_EXPANDED);
                            if (self.value === maxV) {
                                self.doPrimaryAction();
                            } else {
                                toValue = maxV;
                            }
                        }
                        break;
                    case STATE_RESTORED_JUST_EXPANDED:
                        if (minV != null) {
                            self.setExpansionState(STATE_COLLAPSED);
                            if (self.value === minV) {
                                self.doPrimaryAction();
                            } else {
                                toValue = minV;
                            }
                        }
                        break;
                    case STATE_EXPANDED:
                        if (rv != null) {
                            self.setExpansionState(STATE_RESTORED_JUST_EXPANDED);
                            if (rv === maxV) {
                                self.doPrimaryAction();
                            } else {
                                toValue = rv;
                            }
                        }
                        break;
                }
                self.animateToValue(toValue);
            },
            
            animateToValue: function(value, speed=250) {
                if (value != null) {
                    this.stopActiveAnimators('value');
                    this.animate({
                        attribute:'value',
                        to:value,
                        duration:speed
                    });
                }
            },
            
            /** Constrain dragging to horizontal or vertical based on axis.
                @overrides myt.Draggable */
            requestDragPosition: function(x, y) {
                if (!this.disabled) {
                    const value = this.axis === 'y' ? y : x,
                        curValue = this.value;
                    if (value !== curValue) {
                        this.setValue(value);
                        this.setRestoreValue(value);
                        this.setExpansionState(curValue > value ? STATE_RESTORED_JUST_EXPANDED : STATE_RESTORED_JUST_COLLAPSED);
                    }
                }
            }
        });
    
    /** A divider that moves left/right.
        
        @class */
    pkg.HorizontalDivider = new JSClass('HorizontalDivider', BaseDivider, {
        initNode: function(parent, attrs) {
            attrs.axis = 'x';
            this.callSuper(parent, attrs);
        }
    });
    
    /** A divider that moves left/right.
        
        @class */
    pkg.VerticalDivider = new JSClass('VerticalDivider', BaseDivider, {
        initNode: function(parent, attrs) {
            attrs.axis = 'y';
            this.callSuper(parent, attrs);
        }
    });
})(myt);

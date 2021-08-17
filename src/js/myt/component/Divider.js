(pkg => {
    const JSClass = JS.Class,
        
        STATE_COLLAPSED = 0,
        STATE_RESTORED_JUST_COLLAPSED = 1,
        STATE_RESTORED_JUST_EXPANDED = 2,
        STATE_EXPANDED = 3,
        
        defAttr = pkg.AccessorSupport.defAttr,
        
        /*  Setup the limitToParent constraint.
            @param {!BaseDivider} divider
            @returns {undefined} */
        updateLimitToParentConstraint = divider => {
            const dim = divider.axis === 'y' ? 'height' : 'width';
            divider.constrain('__limitToParent', [divider, 'limitToParent', divider, dim, divider.parent, dim]);
        },
        
        /** A divider is a UI control that allows the user to resize two area 
            by dragging the divider left/right or up/down.
            
            Events:
                limitToParent:number
            
            Attributes:
                @property {string} axis - Indicates if the divider should be 
                    constrained horizontally or vertically. Allowed values: 'x' 
                    or 'y'. This value can only be set during instantiation.
                @property {number} limitToParent - If set, this will constrain 
                    the maxValue to the appropriate parent view dimension less 
                    the limitToParent amount.
                @property {number} expansionState - Used by the "primary" 
                    action to update the divider position. Allowed values are:
                        collapsed:0
                        restored just collapsed:1
                        restored just expanded:2
                        expanded:3
                @property {number} restoreValue - The value used to restore 
                    the position in the "primary" action.
            
            Private Attributes:
                __nudgeAcc:number The multiplier in px per nudge.
            
            @class */
        BaseDivider = new JSClass('BaseDivider', pkg.SimpleButton, {
            include: [pkg.BoundedValueComponent, pkg.Draggable],
            
            
            // Life Cycle //////////////////////////////////////////////////////
            initNode: function(parent, attrs) {
                const self = this;
                
                defAttr(attrs, 'activeColor', '#bbb');
                defAttr(attrs, 'hoverColor', '#ddd');
                defAttr(attrs, 'readyColor', '#ccc');
                defAttr(attrs, 'axis', 'x');
                defAttr(attrs, 'minValue', 0);
                defAttr(attrs, 'value', attrs.minValue);
                defAttr(attrs, 'expansionState', STATE_RESTORED_JUST_EXPANDED);
                defAttr(attrs, 'focusIndicator', false);
                defAttr(attrs, 'repeatKeyDown', true);
                defAttr(attrs, 'activationKeys', [
                    37, // left arrow
                    38, // up arrow
                    39, // right arrow
                    40, // down arrow
                    13, // enter
                    32  // spacebar
                ]);
                
                if (attrs.axis === 'y') {
                    defAttr(attrs, 'height', 6);
                    defAttr(attrs, 'cursor', 'row-resize');
                } else {
                    defAttr(attrs, 'width', 6);
                    defAttr(attrs, 'cursor', 'col-resize');
                }
                
                // Controls acceleration of the nudge amount
                self.__nudgeAcc = 1;
                
                self.callSuper(parent, attrs);
                
                // Do afterwards since value might have been constrained from 
                // the value provided in attrs.
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
                @param {boolean} [restoreValueAlso] - If true, the restoreValue
                    will also be updated.
                @returns {undefined} */
            setValue: function(v, restoreValueAlso) {
                this.callSuper(v);
                
                v = this.value;
                if (this.axis === 'y') {
                    this.setY(v);
                } else {
                    this.setX(v);
                }
                
                if (restoreValueAlso) this.setRestoreValue(v);
            },
            
            
            // Methods /////////////////////////////////////////////////////////
            /** Do the limitToParent constraint.
                @private
                @param {!Object} event
                @returns {undefined} */
            __limitToParent: function(event) {
                const self = this,
                    dim = self.axis === 'y' ? 'height' : 'width';
                self.setMaxValue(self.parent[dim] - self.limitToParent - self[dim]);
            },
            
            /** Nudge the divider when the arrow keys are used. Nudging 
                accelerates up to a limit if the key is held down.
                @overrides myt.Button. */
            doActivationKeyDown: function(key, isRepeat) {
                const self = this;
                
                self.callSuper(key, isRepeat);
                
                // Determine nudge direction
                let dir = 0;
                switch (key) {
                    case 37: case 38: dir = -1; break;
                    case 39: case 40: dir = 1; break;
                    case 13: case 32: default:
                        self.doPrimaryAction();
                        return;
                }
                
                // Update nudge amount, but never nudge more than 64.
                self.__nudgeAcc = isRepeat ? Math.min(self.__nudgeAcc + 1, 64) : 1;
                
                self.setValue(self.value + dir * self.__nudgeAcc, true);
                self.setExpansionState(STATE_RESTORED_JUST_EXPANDED);
            },
            
            doPrimaryAction: function() {
                const self = this,
                    rv = self.restoreValue, 
                    maxV = self.maxValue, 
                    minV = self.minValue;
                let toValue;
                switch (self.expansionState) {
                    case STATE_COLLAPSED:
                        if (rv != null) {
                            self.setExpansionState(STATE_RESTORED_JUST_COLLAPSED);
                            if (rv === minV) {
                                // Prevent infinite loop if there's nowhere 
                                // to animate to.
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
                if (toValue != null) {
                    self.stopActiveAnimators('value');
                    self.animateOnce('value', toValue, null, 250);
                }
            },
            
            /** Constrain dragging to horizontal or vertical based on axis.
                @overrides myt.Draggable */
            requestDragPosition: function(x, y) {
                if (!this.disabled) {
                    this.setValue(this.axis === 'y' ? y : x, true);
                    this.setExpansionState(STATE_RESTORED_JUST_EXPANDED);
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

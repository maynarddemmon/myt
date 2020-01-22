((pkg) => {
    var JSClass = JS.Class,
        
        /** Setup the limitToParent constraint. */
        updateLimitToParentConstraint = (divider) => {
            var dim = divider.axis === 'y' ? 'height' : 'width';
            divider.applyConstraint('__limitToParent', [divider, 'limitToParent', divider, dim, divider.parent, dim]);
        },
        
        /** A divider is a UI control that allows the user to resize two area by
            dragging the divider left/right or up/down.
            
            Events:
                limitToParent:number
            
            Attributes:
                axis:string Indicates if the divider should be constrained horizontally
                    or vertically. Allowed values: 'x' or 'y'. This value can only
                    be set during instantiation.
                limitToParent:number If set, this will constrain the maxValue to the
                    appropriate parent view dimension less the limitToParent amount.
                expansionState:number Used by the "primary" action to update the 
                    divider position. Allowed values are:
                        collapsed:0
                        restored just collapsed:1
                        restored just expanded:2
                        expanded:3
                restoreValue:number The value used to restore the position in the
                    "primary" action.
            
            Private Attributes:
                __nudgeAcc:number The multiplier in px per nudge.
        */
        BaseDivider = new JSClass('BaseDivider', pkg.SimpleButton, {
            include: [pkg.BoundedValueComponent, pkg.Draggable],
            
            
            // Life Cycle //////////////////////////////////////////////////////
            initNode: function(parent, attrs) {
                var self = this;
                
                if (attrs.activeColor == null) attrs.activeColor = '#bbbbbb';
                if (attrs.hoverColor == null) attrs.hoverColor = '#dddddd';
                if (attrs.readyColor == null) attrs.readyColor = '#cccccc';
                
                if (attrs.axis == null) attrs.axis = 'x';
                if (attrs.minValue == null) attrs.minValue = 0;
                if (attrs.value == null) attrs.value = attrs.minValue;
                if (attrs.expansionState == null) attrs.expansionState = 2;
                
                if (attrs.focusEmbellishment == null) attrs.focusEmbellishment = false;
                if (attrs.repeatKeyDown == null) attrs.repeatKeyDown = true;
                
                if (attrs.activationKeys == null) {
                    attrs.activationKeys = [
                        37, // left arrow
                        38, // up arrow
                        39, // right arrow
                        40, // down arrow
                        13, // enter
                        32  // spacebar
                    ];
                }
                
                if (attrs.axis === 'y') {
                    if (attrs.height == null) attrs.height = 6;
                    if (attrs.cursor == null) attrs.cursor = 'row-resize';
                } else {
                    if (attrs.width == null) attrs.width = 6;
                    if (attrs.cursor == null) attrs.cursor = 'col-resize';
                }
                
                // Controls acceleration of the nudge amount
                self.__nudgeAcc = 1;
                
                self.callSuper(parent, attrs);
                
                // Do afterwards since value might have been constrained from the
                // value provided in attrs.
                if (attrs.restoreValue == null) self.setRestoreValue(self.value);
                
                if (self.limitToParent != null) updateLimitToParentConstraint(self);
                
                self.attachDomObserver(self, 'doPrimaryAction', 'dblclick');
            },
            
            
            // Accessors ///////////////////////////////////////////////////////
            setExpansionState: function(v) {this.expansionState = v;},
            setRestoreValue: function(v) {this.restoreValue = v;},
            
            setLimitToParent: function(v) {
                var self = this;
                
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
                    console.warn("Axis may not be updated after instantiation.");
                } else {
                    this.axis = v;
                }
            },
            
            /** Update the x or y position of the component as the value changes.
                @param restoreValueAlso:boolean (optional) If true, the restoreValue
                    will also be updated.
                @overrides myt.ValueComponent */
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
                @private */
            __limitToParent: function(event) {
                var self = this,
                    dim = self.axis === 'y' ? 'height' : 'width';
                self.setMaxValue(self.parent[dim] - self.limitToParent - self[dim]);
            },
            
            /** Nudge the divider when the arrow keys are used. Nudging accelerates
                up to a limit if the key is held down.
                @overrides myt.Button. */
            doActivationKeyDown: function(key, isRepeat) {
                var self = this,
                    dir = 0;
                
                self.callSuper(key, isRepeat);
                
                // Determine nudge direction
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
                self.setExpansionState(2);
            },
            
            doPrimaryAction: function() {
                var self = this,
                    toValue, 
                    rv = self.restoreValue, 
                    maxV = self.maxValue, 
                    minV = self.minValue;
                switch (self.expansionState) {
                    case 0:
                        if (rv != null) {
                            self.setExpansionState(1);
                            if (rv === minV) {
                                // Prevent infinite loop if there's nowhere to animate to.
                                if (rv !== maxV) self.doPrimaryAction();
                            } else {
                                toValue = rv;
                            }
                        }
                        break;
                    case 1:
                        if (maxV != null) {
                            self.setExpansionState(3);
                            if (self.value === maxV) {
                                self.doPrimaryAction();
                            } else {
                                toValue = maxV;
                            }
                        }
                        break;
                    case 2:
                        if (minV != null) {
                            self.setExpansionState(0);
                            if (self.value === minV) {
                                self.doPrimaryAction();
                            } else {
                                toValue = minV;
                            }
                        }
                        break;
                    case 3:
                        if (rv != null) {
                            self.setExpansionState(2);
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
                    this.setExpansionState(2);
                }
            }
        });
    
    /** A divider that moves left/right. */
    pkg.HorizontalDivider = new JSClass('HorizontalDivider', BaseDivider, {
        initNode: function(parent, attrs) {
            attrs.axis = 'x';
            this.callSuper(parent, attrs);
        }
    });
    
    /** A divider that moves left/right. */
    pkg.VerticalDivider = new JSClass('VerticalDivider', BaseDivider, {
        initNode: function(parent, attrs) {
            attrs.axis = 'y';
            this.callSuper(parent, attrs);
        }
    });
})(myt);

/** A divider is a UI control that allows the user to resize two area by
    dragging the divider left/right or up/down.
    
    Attributes:
        axis:string Indicates if the divider should be constrained horizontally
            or vertically. Allowed values: 'x' or 'y'. This value can only
            be set during instantiation.
        limitToParent:number If set, this will constrain the maxValue to the
            appropriate parent view dimension less the limitToParent amount.
        inset:number Insets the rendered portion of the divider thus allowing
            the interactive footprint of the component to be larger than the
            visible footprint. This value will be applied to the top and bottom
            or left and right edge of the component.
        expansionState:number Used by the "primary" action to update the 
            divider position. Allowed values are:
                collapsed:0
                restored just collapsed:1
                restored just expanded:2
                expanded:3
        restoreValue:number The value used to restore the position in the
            "primary" action.
*/
myt.BaseDivider = new JS.Class('BaseDivider', myt.DrawButton, {
    include: [myt.BoundedValueComponent, myt.Draggable],
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    initNode: function(parent, attrs) {
        if (attrs.drawingMethodClassname === undefined) attrs.drawingMethodClassname = 'myt.DividerDrawingMethod';
        if (attrs.axis === undefined) attrs.axis = 'x';
        if (attrs.inset === undefined) attrs.inset = 2;
        if (attrs.minValue === undefined) attrs.minValue = -attrs.inset;
        if (attrs.value === undefined) attrs.value = attrs.minValue;
        if (attrs.focusEmbellishment === undefined) attrs.focusEmbellishment = false;
        if (attrs.repeatKeyDown === undefined) attrs.repeatKeyDown = true;
        if (attrs.expansionState === undefined) attrs.expansionState = 2;
        
        if (attrs.activationKeys === undefined) {
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
            if (attrs.height === undefined) attrs.height = 8;
            if (attrs.cursor === undefined) attrs.cursor = 'row-resize';
        } else {
            if (attrs.width === undefined) attrs.width = 8;
            if (attrs.cursor === undefined) attrs.cursor = 'col-resize';
        }
        
        // Controls acceleration of the nudge amount
        this.__nudgeAcc = 1;
        
        this.callSuper(parent, attrs);
        
        // Do afterwards since value might have been constrained from the
        // value provided in attrs.
        if (attrs.restoreValue === undefined) this.setRestoreValue(this.value);
        
        if (this.limitToParent !== undefined) this.__updateLimitToParentConstraint();
        
        this.attachDomObserver(this, 'doPrimaryAction', 'dblclick');
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setExpansionState: function(v) {this.expansionState = v;},
    setRestoreValue: function(v) {this.restoreValue = v;},
    
    setLimitToParent: function(v) {
        if (this.limitToParent !== v) {
            this.limitToParent = v;
            if (this.inited) {
                this.fireNewEvent('limitToParent', v);
                
                if (v === undefined) {
                    this.releaseConstraint('__limitToParent');
                } else {
                    this.__updateLimitToParentConstraint();
                }
            }
        }
    },
    
    setInset: function(v) {
        if (this.inset !== v) {
            this.inset = v;
            if (this.inited) {
                this.fireNewEvent('inset', v);
                this.updateUI();
            }
        }
    },
    
    setAxis: function(v) {
        if (this.inited) {
            myt.dumpStack("Axis may not be updated after instantiation.");
            return;
        }
        
        this.axis = v;
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
    
    /** Ensure the component gets redrawn when it gains and loses focus.
        @overrides myt.FocusObservable. */
    setFocused: function(v) {
        this.callSuper(v);
        
        if (this.inited) this.redraw();
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** Setup the limitToParent constraint.
        @private */
    __updateLimitToParentConstraint: function() {
        var dim = this.axis === 'y' ? 'height' : 'width';
        this.applyConstraint('__limitToParent', [this, 'limitToParent', this, 'inset', this, dim, this.parent, dim]);
    },
    
    /** Do the limitToParent constraint.
        @private */
    __limitToParent: function(event) {
        var dim = this.axis === 'y' ? 'height' : 'width';
        this.setMaxValue(this.parent[dim] - this.limitToParent - this[dim] + this.inset);
    },
    
    /** Nudge the divider when the arrow keys are used. Nuding accelerates
        up to a limit if the key is held down.
        @overrides myt.Button. */
    doActivationKeyDown: function(key) {
        this.callSuper(key);
        
        // Determine nudge direction
        var dir = 0;
        switch (key) {
            case 37: case 38: dir = -1; break;
            case 39: case 40: dir = 1; break;
            case 13: case 32: default:
                this.doPrimaryAction();
                return;
        }
        
        // Update nudge amount, but never nudge more than 20.
        this.__nudgeAcc = Math.min(this.__nudgeAcc + 1, 20);
        
        this.setValue(this.value + dir * this.__nudgeAcc, true);
        this.setExpansionState(2);
    },
    
    doPrimaryAction: function() {
        var toValue, rv = this.restoreValue, maxV = this.maxValue, minV = this.minValue;
        switch (this.expansionState) {
            case 0:
                if (rv != null) {
                    this.setExpansionState(1);
                    if (rv === minV) {
                        // Prevent infinite loop if there's nowhere to animate to.
                        if (rv !== maxV) this.doPrimaryAction();
                    } else {
                        toValue = rv;
                    }
                }
                break;
            case 1:
                if (maxV != null) {
                    this.setExpansionState(3);
                    if (this.value === maxV) {
                        this.doPrimaryAction();
                    } else {
                        toValue = maxV;
                    }
                }
                break;
            case 2:
                if (minV != null) {
                    this.setExpansionState(0);
                    if (this.value === minV) {
                        this.doPrimaryAction();
                    } else {
                        toValue = minV;
                    }
                }
                break;
            case 3:
                if (rv != null) {
                    this.setExpansionState(2);
                    if (rv === maxV) {
                        this.doPrimaryAction();
                    } else {
                        toValue = rv;
                    }
                }
                break;
        }
        if (toValue != null) {
            this.stopActiveAnimators('value');
            this.animate('value', toValue, null, null, null, 250, null, null, 'easeInOutQuad');
        }
    },
    
    /** Reset nudge acceleration when the key is released.
        @overrides myt.Button. */
    doActivationKeyUp: function(key) {
        this.callSuper(key);
        this.__nudgeAcc = 1;
    },
    
    /** Reset nudge acceleration when the key is aborted.
        @overrides myt.Button. */
    doActivationKeyAborted: function(key) {
        this.callSuper(key);
        this.__nudgeAcc = 1;
    },
    
    /** Constrain dragging to horizontal or vertical based on axis.
        @overrides myt.Draggable */
    requestDragPosition: function(x, y) {
        if (!this.disabled) {
            this.setValue(this.axis === 'y' ? y : x, true);
            this.setExpansionState(2);
        }
    },
    
    /** @overrides myt.DrawButton */
    getDrawConfig: function(state) {
        var cfg = this.callSuper(state);
        cfg.axis = this.axis;
        cfg.inset = this.inset;
        return cfg;
    },
});

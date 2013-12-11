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
        
        if (attrs.activationKeys === undefined) {
            attrs.activationKeys = [
                37, // left arrow
                38, // up arrow
                39, // right arrow
                40  // down arrow
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
        
        if (this.limitToParent !== undefined) this.__updateLimitToParentConstraint();
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
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
        @overrides myt.ValueComponent */
    setValue: function(v) {
        this.callSuper(v);
        
        if (this.axis === 'y') {
            this.setY(this.value);
        } else {
            this.setX(this.value);
        }
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
        }
        
        // Update nudge amount, but never nudge more than 20.
        this.__nudgeAcc = Math.min(this.__nudgeAcc + 1, 20);
        
        this.setValue(this.value + dir * this.__nudgeAcc);
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
        if (!this.disabled) this.setValue(this.axis === 'y' ? y : x);
    },
    
    /** @overrides myt.DrawButton */
    getDrawConfig: function(state) {
        var cfg = this.callSuper(state);
        cfg.axis = this.axis;
        cfg.inset = this.inset;
        return cfg;
    },
});

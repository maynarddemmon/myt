/** An extension of VariableLayout that positions views along an axis using
    an inset, outset and spacing value.
    
    Events:
        spacing:number
        outset:number
    
    Attributes:
        axis:string The orientation of the layout. An alias 
            for setTargetAttrName.
        inset:number Padding before the first subview that gets positioned.
            An alias for setTargetValue.
        spacing:number Spacing between each subview.
        outset:number Padding at the end of the layout. Only gets used
            if collapseParent is true.
        noAddSubviewOptimization:boolean Turns the optimization to supress
            layout updates when a subview is added off/on. Defaults to 
            undefined which is equivalent to false and thus leaves the
            optimization on.
*/
myt.SpacedLayout = new JS.Class('SpacedLayout', myt.VariableLayout, {
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides myt.VariableLayout */
    initNode: function(parent, attrs) {
        this.targetAttrName = this.axis = 'x';
        this.setterName = 'setX';
        this.measureAttrName = 'boundsWidth';
        this.measureAttrBaseName = 'width';
        this.parentSetterName = 'setWidth';
        this.targetValue = this.spacing = this.inset = this.outset = 0;
        
        this.callSuper(parent, attrs);
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    /** @overrides myt.ConstantLayout */
    setTargetAttrName: function(v) {
        if (this.targetAttrName !== v) {
            var isY = v === 'y',
                inited = this.inited;
            if (inited) this.stopMonitoringAllSubviews();
            this.measureAttrName = isY ? 'boundsHeight' : 'boundsWidth';
            this.measureAttrBaseName = isY ? 'height' : 'width';
            this.parentSetterName = isY ? 'setHeight' : 'setWidth';
            if (inited) this.startMonitoringAllSubviews();
            this.callSuper(v);
        }
    },
    
    setNoAddSubviewOptimization: function(v) {this.noAddSubviewOptimization = v;},
    setAxis: function(v) {this.setTargetAttrName(this.axis = v);},
    setInset: function(v) {this.setTargetValue(this.inset = v);},
    
    setSpacing: function(v) {
        if (this.spacing !== v) {
            this.spacing = v;
            if (this.inited) {
                this.fireNewEvent('spacing', v);
                this.update();
            }
        }
    },
    
    setOutset: function(v) {
        if (this.outset !== v) {
            this.outset = v;
            if (this.inited) {
                this.fireNewEvent('outset', v);
                this.update();
            }
        }
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** @overrides myt.Layout */
    addSubview: function(sv) {
        // OPTIMIZATION: Skip the update call that happens during subview add.
        // The boundsWidth/boundsHeight events will be fired immediately 
        // after and are a more appropriate time to do the update.
        var isLocked = this.locked; // Remember original locked state.
        if (!this.noAddSubviewOptimization) this.locked = true; // Lock the layout so no updates occur.
        this.callSuper(sv);
        this.locked = isLocked; // Restore original locked state.
    },
    
    /** @overrides myt.VariableLayout */
    startMonitoringSubview: function(sv) {
        this.attachTo(sv, 'update', this.measureAttrName);
        this.callSuper(sv);
    },
    
    /** @overrides myt.VariableLayout */
    stopMonitoringSubview: function(sv) {
        this.detachFrom(sv, 'update', this.measureAttrName);
        this.callSuper(sv);
    },
    
    /** @overrides myt.ConstantLayout */
    updateSubview: function(count, sv, setterName, value) {
        var size = sv[this.measureAttrName];
        sv[setterName](value + (size - sv[this.measureAttrBaseName])/2.0); // Adj for transform
        return value + size + this.spacing;
    },
    
    /** @overrides myt.VariableLayout */
    updateParent: function(setterName, value) {
        this.parent[this.parentSetterName](value + this.outset - this.spacing);
    }
});

/** An extension of VariableLayout that positions views along an axis using
    an inset, outset and spacing value. */
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
            if (v === 'x') {
                if (this.inited) this.stopMonitoringAllSubviews();
                this.measureAttrName = 'boundsWidth';
                this.measureAttrBaseName = 'width';
                this.parentSetterName = 'setWidth';
                if (this.inited) this.startMonitoringAllSubviews();
                this.callSuper(v);
            } else if (v === 'y') {
                if (this.inited) this.stopMonitoringAllSubviews();
                this.measureAttrName = 'boundsHeight';
                this.measureAttrBaseName = 'height';
                this.parentSetterName = 'setHeight';
                if (this.inited) this.startMonitoringAllSubviews();
                this.callSuper(v);
            }
        }
    },
    
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
    
    // Aliases: We use a wrapper rather than .alias since .alias doesn't
    // appear to carry over to subclasses.
    setAxis: function(v) {
        this.setTargetAttrName(v);
        this.axis = this.targetAttrName;
    },
    
    setInset: function(v) {
        this.setTargetValue(v);
        this.inset = this.targetValue;
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** @overrides myt.Layout */
    addSubview: function(sv) {
        // OPTIMIZATION: Skip the update call that happens during subview add.
        // The boundsWidth/boundsHeight events will be fired immediately 
        // after and are a more appropriate time to do the update.
        var isLocked = this.locked; // Remember original locked state.
        this.locked = true; // Lock the layout so no updateds occur.
        this.callSuper(sv);
        this.locked = isLocked; // Restore original locked state.
    },
    
    /** @overrides myt.VariableLayout */
    startMonitoringSubview: function(sv) {
        this.attachTo(sv, 'update', this.measureAttrName);
        this.attachTo(sv, 'update', 'visible');
    },
    
    /** @overrides myt.VariableLayout */
    stopMonitoringSubview: function(sv) {
        this.detachFrom(sv, 'update', this.measureAttrName);
        this.detachFrom(sv, 'update', 'visible');
    },
    
    /** @overrides myt.ConstantLayout */
    updateSubview: function(count, sv, setterName, value) {
        var size = sv[this.measureAttrName];
        sv[setterName](value + (size - sv[this.measureAttrBaseName])/2.0); // Adj for transform
        return value + size + this.spacing;
    },
    
    /** @overrides myt.VariableLayout */
    updateParent: function(setterName, value) {
        var diff = this.outset - this.spacing;
        this.parent[this.parentSetterName](value + diff);
    }
});

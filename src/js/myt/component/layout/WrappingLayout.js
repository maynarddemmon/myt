/** An extension of VariableLayout that positions views along an axis using
    an inset, outset and spacing value. Views will be wrapped when they
    overflow the available space. */
myt.WrappingLayout = new JS.Class('WrappingLayout', myt.VariableLayout, {
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides myt.VariableLayout */
    initNode: function(parent, attrs) {
        this.targetAttrName = this.axis = 'x';
        this.setterName = 'setX';
        this.otherSetterName = 'setY';
        this.measureAttrName = 'boundsWidth';
        this.measureAttrBaseName = 'width';
        this.otherMeasureAttrName = 'boundsHeight';
        this.otherMeasureAttrBaseName = 'height';
        this.parentSetterName = 'setHeight';
        this.targetValue = this.spacing = this.inset = this.outset = this.lineSpacing = this.lineInset = this.lineOutset = 0;
        
        this.callSuper(parent, attrs);
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    /** @overrides myt.ConstantLayout */
    setTargetAttrName: function(v) {
        if (this.targetAttrName === v) return;
        
        if (v === 'x') {
            if (this.inited) this.stopMonitoringAllSubviews();
            this.measureAttrName = 'boundsWidth';
            this.measureAttrBaseName = 'width';
            this.otherMeasureAttrName = 'boundsHeight';
            this.otherMeasureAttrBaseName = 'height';
            this.parentSetterName = 'setHeight';
            this.otherSetterName = 'setY';
            if (this.inited) {
                this.startMonitoringAllSubviews();
                this.stopMonitoringParent('height');
                this.startMonitoringParent('width');
            }
            this.callSuper(v);
        } else if (v === 'y') {
            if (this.inited) this.stopMonitoringAllSubviews();
            this.measureAttrName = 'boundsHeight';
            this.measureAttrBaseName = 'height';
            this.otherMeasureAttrName = 'boundsWidth';
            this.otherMeasureAttrBaseName = 'width';
            this.parentSetterName = 'setWidth';
            this.otherSetterName = 'setX';
            if (this.inited) {
                this.startMonitoringAllSubviews();
                this.stopMonitoringParent('width');
                this.startMonitoringParent('height');
            }
            this.callSuper(v);
        }
    },
    
    /** @overrides myt.Layout */
    setParent: function(parent) {
        if (this.parent === parent) return;
        
        if (this.parent) {
            if (this.targetAttrName === 'x') {
                this.stopMonitoringParent('width');
            } else if (this.targetAttrName === 'y') {
                this.stopMonitoringParent('height');
            }
        }
        
        this.callSuper(parent);
        
        if (this.parent) {
            if (this.targetAttrName === 'x') {
                this.startMonitoringParent('width');
            } else if (this.targetAttrName === 'y') {
                this.startMonitoringParent('height');
            }
        }
    },
    
    setSpacing: function(v) {
        if (this.spacing === v) return;
        this.spacing = v;
        if (this.inited) {
            this.fireNewEvent('spacing', v);
            this.update();
        }
    },
    
    setOutset: function(v) {
        if (this.outset === v) return;
        this.outset = v;
        if (this.inited) {
            this.fireNewEvent('outset', v);
            this.update();
        }
    },
    
    setLineSpacing: function(v) {
        if (this.lineSpacing === v) return;
        this.lineSpacing = v;
        if (this.inited) {
            this.fireNewEvent('lineSpacing', v);
            this.update();
        }
    },
    
    setLineInset: function(v) {
        if (this.lineInset === v) return;
        this.lineInset = v;
        if (this.inited) {
            this.fireNewEvent('lineInset', v);
            this.update();
        }
    },
    
    setLineOutset: function(v) {
        if (this.lineOutset === v) return;
        this.lineOutset = v;
        if (this.inited) {
            this.fireNewEvent('lineOutset', v);
            this.update();
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
    /** Called when monitoring of width/height should start on our parent. */
    startMonitoringParent: function(measureAttrName) {
        this.attachTo(this.parent, 'update', measureAttrName);
    },
    
    /** Called when monitoring of width/height should stop on our parent. */
    stopMonitoringParent: function(measureAttrName) {
        this.detachFrom(this.parent, 'update', measureAttrName);
    },
    
    /** @overrides myt.Layout */
    startMonitoringSubview: function(sv) {
        this.attachTo(sv, 'update', this.measureAttrName);
        this.attachTo(sv, 'update', this.otherMeasureAttrName);
        this.attachTo(sv, 'update', 'visible');
    },
    
    /** @overrides myt.Layout */
    stopMonitoringSubview: function(sv) {
        this.detachFrom(sv, 'update', this.measureAttrName);
        this.detachFrom(sv, 'update', this.otherMeasureAttrName);
        this.detachFrom(sv, 'update', 'visible');
    },
    
    
    /** @overrides myt.VariableLayout */
    doBeforeUpdate: function() {
        // The number of lines layed out.
        this.lineCount = 1;
        
        // The maximum size achieved by any line.
        this.maxSize = 0;
        
        // Track the maximum size of a line. Used to determine how much to
        // update linePos by when wrapping occurs.
        this.lineSize = 0;
        
        // The position for each subview in a line. Gets updated for each new
        // line of subviews.
        this.linePos = this.lineInset;
        
        // The size of the parent view. Needed to determine when to wrap. The
        // outset is already subtracted as a performance optimization.
        this.parentSizeLessOutset = this.parent[this.measureAttrName] - this.outset;
    },
    
    /** @overrides myt.ConstantLayout */
    updateSubview: function(count, sv, setterName, value) {
        var size = sv[this.measureAttrName],
            otherSize = sv[this.otherMeasureAttrName];
        
        if (value + size > this.parentSizeLessOutset) {
            // Check for overflow
            value = this.targetValue; // Reset to inset.
            this.linePos += this.lineSize + this.lineSpacing;
            this.lineSize = otherSize;
            
            ++this.lineCount;
        } else if (otherSize > this.lineSize) {
            // Update line size if this subview is larger
            this.lineSize = otherSize;
        }
        
        sv[this.otherSetterName](this.linePos + (otherSize - sv[this.otherMeasureAttrBaseName])/2.0); // adj is for transform
        sv[setterName](value + (size - sv[this.measureAttrBaseName])/2.0); // adj is for transform
        
        // Track max size achieved during layout.
        this.maxSize = Math.max(this.maxSize, value + size + this.outset);
        
        return value + size + this.spacing;
    },
    
    /** @overrides myt.VariableLayout */
    updateParent: function(setterName, value) {
        // Collapse in the other direction
        value = this.linePos + this.lineSize + this.lineOutset;
        this.parent[this.parentSetterName](value);
    }
});

/** An extension of VariableLayout that positions views along an axis using
    an inset, outset and spacing value. Views will be wrapped when they
    overflow the available space.
    
    Supported Layout Hints:
        break:string Will force the subview to start a new line/column.
*/
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
        if (this.targetAttrName !== v) {
            var isY = v === 'y',
                inited = this.inited;
            
            if (inited) this.stopMonitoringAllSubviews();
            
            this.measureAttrName = isY ? 'boundsHeight' : 'boundsWidth';
            var mabn = this.measureAttrBaseName = isY ? 'height' : 'width';
            this.otherMeasureAttrName = isY ? 'boundsWidth' : 'boundsHeight';
            var omabn = this.otherMeasureAttrBaseName = isY ? 'width' : 'height';
            this.parentSetterName = isY ? 'setWidth' : 'setHeight';
            this.otherSetterName = isY ? 'setX' : 'setY';
            
            if (inited) {
                this.startMonitoringAllSubviews();
                this.stopMonitoringParent(omabn);
                this.startMonitoringParent(mabn);
            }
            this.callSuper(v);
        }
    },
    
    /** @overrides myt.Layout */
    setParent: function(v) {
        if (this.parent !== parent) {
            var isY = this.targetAttrName === 'y';
            if (this.parent) this.stopMonitoringParent(isY ? 'height' : 'width');
            this.callSuper(v);
            if (this.parent) this.startMonitoringParent(isY ? 'height' : 'width');
        }
    },
    
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
    
    setLineSpacing: function(v) {
        if (this.lineSpacing !== v) {
            this.lineSpacing = v;
            if (this.inited) {
                this.fireNewEvent('lineSpacing', v);
                this.update();
            }
        }
    },
    
    setLineInset: function(v) {
        if (this.lineInset !== v) {
            this.lineInset = v;
            if (this.inited) {
                this.fireNewEvent('lineInset', v);
                this.update();
            }
        }
    },
    
    setLineOutset: function(v) {
        if (this.lineOutset !== v) {
            this.lineOutset = v;
            if (this.inited) {
                this.fireNewEvent('lineOutset', v);
                this.update();
            }
        }
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
        this.callSuper(sv);
    },
    
    /** @overrides myt.Layout */
    stopMonitoringSubview: function(sv) {
        this.detachFrom(sv, 'update', this.measureAttrName);
        this.detachFrom(sv, 'update', this.otherMeasureAttrName);
        this.callSuper(sv);
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
        
        if (value + size > this.parentSizeLessOutset || sv.layoutHint === 'break') {
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
        this.parent[this.parentSetterName](this.linePos + this.lineSize + this.lineOutset);
    }
});

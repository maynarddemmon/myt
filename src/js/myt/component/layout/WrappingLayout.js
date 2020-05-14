/** An extension of VariableLayout that positions views along an axis using
    an inset, outset and spacing value. Views will be wrapped when they
    overflow the available space.
    
    Supported Layout Hints:
        break:string Will force the subview to start a new line/column.
    
    @class */
myt.WrappingLayout = new JS.Class('WrappingLayout', myt.VariableLayout, {
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides myt.VariableLayout */
    initNode: function(parent, attrs) {
        const self = this;
        
        self.targetAttrName = self.axis = 'x';
        self.setterName = 'setX';
        self.otherSetterName = 'setY';
        self.measureAttrName = 'boundsWidth';
        self.measureAttrBaseName = 'width';
        self.otherMeasureAttrName = 'boundsHeight';
        self.otherMeasureAttrBaseName = 'height';
        self.parentSetterName = 'setHeight';
        self.targetValue = self.spacing = self.inset = self.outset = self.lineSpacing = self.lineInset = self.lineOutset = 0;
        
        self.callSuper(parent, attrs);
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    /** @overrides myt.ConstantLayout */
    setTargetAttrName: function(v) {
        if (this.targetAttrName !== v) {
            const isY = v === 'y',
                inited = this.inited;
            
            if (inited) this.stopMonitoringAllSubviews();
            
            this.measureAttrName = isY ? 'boundsHeight' : 'boundsWidth';
            const mabn = this.measureAttrBaseName = isY ? 'height' : 'width';
            this.otherMeasureAttrName = isY ? 'boundsWidth' : 'boundsHeight';
            const omabn = this.otherMeasureAttrBaseName = isY ? 'width' : 'height';
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
    setParent: function(parent) {
        if (this.parent !== parent) {
            const isY = this.targetAttrName === 'y';
            if (this.parent) this.stopMonitoringParent(isY ? 'height' : 'width');
            this.callSuper(parent);
            if (this.parent) this.startMonitoringParent(isY ? 'height' : 'width');
        }
    },
    
    setAxis: function(v) {this.setTargetAttrName(this.axis = v);},
    setInset: function(v) {this.setTargetValue(this.inset = v);},
    
    setSpacing: function(v) {
        if (this.spacing !== v) {
            this.spacing = v;
            if (this.inited) {
                this.fireEvent('spacing', v);
                this.update();
            }
        }
    },
    
    setOutset: function(v) {
        if (this.outset !== v) {
            this.outset = v;
            if (this.inited) {
                this.fireEvent('outset', v);
                this.update();
            }
        }
    },
    
    setLineSpacing: function(v) {
        if (this.lineSpacing !== v) {
            this.lineSpacing = v;
            if (this.inited) {
                this.fireEvent('lineSpacing', v);
                this.update();
            }
        }
    },
    
    setLineInset: function(v) {
        if (this.lineInset !== v) {
            this.lineInset = v;
            if (this.inited) {
                this.fireEvent('lineInset', v);
                this.update();
            }
        }
    },
    
    setLineOutset: function(v) {
        if (this.lineOutset !== v) {
            this.lineOutset = v;
            if (this.inited) {
                this.fireEvent('lineOutset', v);
                this.update();
            }
        }
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** Called when monitoring of width/height should start on our parent.
        @param {string} measureAttrName - The name of the attribute to start monitoring.
        @returns {undefined} */
    startMonitoringParent: function(measureAttrName) {
        this.attachTo(this.parent, 'update', measureAttrName);
    },
    
    /** Called when monitoring of width/height should stop on our parent.
        @param {string} measureAttrName - The name of the attribute to stop monitoring.
        @returns {undefined} */
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
        const size = sv[this.measureAttrName],
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

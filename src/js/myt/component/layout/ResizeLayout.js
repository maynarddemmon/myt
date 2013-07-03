/** An extension of SpacedLayout that resizes one or more views to fill in
    any remaining space. The resizable subviews should not have a transform
    applied to it. The non-resized views may have transforms applied to them. */
myt.ResizeLayout = new JS.Class('SpacedLayout', myt.SpacedLayout, {
    // Accessors ///////////////////////////////////////////////////////////////
    /** @overrides myt.VariableLayout */
    setCollapseParent: function(v) {
        console.log("collapseParent attribute is unused in ResizeLayout.");
    },
    
    /** @overrides myt.SpacedLayout */
    setTargetAttrName: function(v) {
        if (this.targetAttrName === v) return;
        
        if (this.inited) {
            if (v === 'x') {
                this.stopMonitoringParent('height');
                this.startMonitoringParent('width');
            } else if (v === 'y') {
                this.stopMonitoringParent('width');
                this.startMonitoringParent('height');
            }
        }
        
        this.callSuper(v);
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
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** Called when monitoring of width/height should start on our parent.
        @param attrName:string the name of the attribute to start monitoring.
        @returns void */
    startMonitoringParent: function(attrName) {
        this.attachTo(this.parent, 'update', attrName);
    },
    
    /** Called when monitoring of width/height should stop on our parent.
        @param attrName:string the name of the attribute to stop monitoring.
        @returns void */
    stopMonitoringParent: function(attrName) {
        this.detachFrom(this.parent, 'update', attrName);
    },
    
    /** @overrides myt.VariableLayout */
    doBeforeUpdate: function() {
        // Get size to fill
        var measureAttrName = this.measureAttrName,
            measureAttrBaseName = this.measureAttrBaseName,
            remainder = this.parent[measureAttrBaseName];
        
        // Calculate minimum required size
        remainder -= this.targetValue + this.outset;
        
        var svs = this.subviews, i = svs.length, sv;
        var count = 0, resizeSum = 0;
        
        while(i) {
            sv = svs[--i];
            if (this.skipSubview(sv)) continue;
            ++count;
            if (sv.layoutHint > 0) {
                resizeSum += sv.layoutHint;
            } else {
                remainder -= sv[measureAttrName];
            }
        }
        
        // Abort, nothing to layout
        if (count === 0) return;
        
        remainder -= (count - 1) * this.spacing;
        
        // Store for update
        this.remainder = remainder;
        this.resizeSum = resizeSum;
        this.scalingFactor = remainder / resizeSum;
        this.resizeSumUsed = 0;
        this.remainderUsed = 0;
        this.measureSetter = measureAttrName === 'boundsWidth' ? 'setWidth' : 'setHeight';
    },
    
    /** @overrides myt.SpacedLayout */
    updateSubview: function(count, sv, setterName, value) {
        var hint = sv.layoutHint;
        if (hint > 0) {
            this.resizeSumUsed += hint;
            
            var size = Math.round(hint * this.scalingFactor);
            
            // Adjust for leftover
            if (this.resizeSum === this.resizeSumUsed) {
                size += this.remainder - (this.remainderUsed + size);
            }
            
            this.remainderUsed += size;
            sv[this.measureSetter](size);
        }
        return this.callSuper(count, sv, setterName, value);
    },
    
    /** @overrides myt.SpacedLayout */
    startMonitoringSubview: function(sv) {
        // Don't monitor width/height of the "stretchy" subviews since this
        // layout changes them.
        if (!(sv.layoutHint > 0)) this.attachTo(sv, 'update', this.measureAttrName);
        this.attachTo(sv, 'update', 'visible');
    },
    
    /** @overrides myt.SpacedLayout */
    stopMonitoringSubview: function(sv) {
        // Don't monitor width/height of the "stretchy" subviews since this
        // layout changes them.
        if (!(sv.layoutHint > 0)) this.detachFrom(sv, 'update', this.measureAttrName);
        this.detachFrom(sv, 'update', 'visible');
    },
    
    /** @overrides myt.SpacedLayout */
    updateParent: function(setterName, value) {
        // No resizing of parent since this view expands to fill the parent.
    }
});

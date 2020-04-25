/** An extension of SpacedLayout that resizes one or more views to fill in
    any remaining space. The resizable subviews should not have a transform
    applied to it. The non-resized views may have transforms applied to them.
    
    @class */
myt.ResizeLayout = new JS.Class('SpacedLayout', myt.SpacedLayout, {
    // Accessors ///////////////////////////////////////////////////////////////
    /** @overrides myt.VariableLayout */
    setCollapseParent: function(v) {
        // collapseParent attribute is unused in ResizeLayout.
    },
    
    /** @overrides myt.SpacedLayout */
    setTargetAttrName: function(v) {
        if (this.targetAttrName !== v) {
            if (this.inited) {
                var isX = v === 'x';
                this.stopMonitoringParent(isX ? 'height' : 'width');
                this.startMonitoringParent(isX ? 'width' : 'height');
            }
            
            this.callSuper(v);
        }
    },
    
    /** @overrides myt.Layout */
    setParent: function(parent) {
        if (this.parent !== parent) {
            var dim = this.targetAttrName === 'x' ? 'width' : 'height';
            if (this.parent) this.stopMonitoringParent(dim);
            
            this.callSuper(parent);
            
            if (this.parent) this.startMonitoringParent(dim);
        }
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** Called when monitoring of width/height should start on our parent.
        @param {string} attrName - The name of the attribute to start monitoring.
        @returns {undefined} */
    startMonitoringParent: function(attrName) {
        this.attachTo(this.parent, 'update', attrName);
    },
    
    /** Called when monitoring of width/height should stop on our parent.
        @param {string} attrName - The name of the attribute to stop monitoring.
        @returns {undefined} */
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
        
        var svs = this.subviews, i = svs.length, sv,
            count = 0, resizeSum = 0;
        
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
        
        if (count !== 0) {
            remainder -= (count - 1) * this.spacing;
            
            // Store for update
            this.remainder = remainder;
            this.resizeSum = resizeSum;
            this.scalingFactor = remainder / resizeSum;
            this.resizeSumUsed = this.remainderUsed = 0;
            this.measureSetter = measureAttrName === 'boundsWidth' ? 'setWidth' : 'setHeight';
        }
    },
    
    /** @overrides myt.SpacedLayout */
    updateSubview: function(count, sv, setterName, value) {
        var hint = sv.layoutHint;
        if (hint > 0) {
            this.resizeSumUsed += hint;
            
            var size = this.resizeSum === this.resizeSumUsed ? 
                this.remainder - this.remainderUsed : 
                Math.round(hint * this.scalingFactor);
            
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

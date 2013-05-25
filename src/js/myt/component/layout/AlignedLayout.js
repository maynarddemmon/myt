/** An extension of VariableLayout that also aligns each view vertically
    or horizontally. */
myt.AlignedLayout = new JS.Class('AlignedLayout', myt.VariableLayout, {
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides myt.VariableLayout */
    initNode: function(parent, attrs) {
        this.targetAttrName = this.axis = 'x';
        this.align = 'middle';
        this.setterName = 'setX';
        this.measureAttrName = 'boundsWidth';
        this.measureAttrBaseName = 'width';
        this.parentSetterName = 'setWidth';
        this.targetValue = 0;
        
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
    },
    
    setAlign: function(v) {
        if (this.align === v) return;
        this.align = v;
        if (this.inited) {
            this.fireNewEvent('align', v);
            this.update();
        }
    },
    
    // Aliases: We use a wrapper rather than .alias since .alias doesn't
    // appear to carry over to subclasses.
    setAxis: function(v) {this.setTargetAttrName(v);},
    
    
    // Methods /////////////////////////////////////////////////////////////////
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
    
    /** Determine the maximum subview width/height according to the axis.
        @overrides myt.VariableLayout */
    doBeforeUpdate: function() {
        var measureAttrName = this.measureAttrName;
        var value = 0;
        var svs = this.subviews;
        var len = svs.length;
        var sv;
        
        var i = len;
        while(i) {
            sv = svs[--i];
            if (this.skipSubview(sv)) continue;
            value = Math.max(value, sv[measureAttrName]);
        }
        
        if (isNaN(value) || 0 >= value) value = 0;
        
        this.setTargetValue(value);
    },
    
    /** @overrides myt.ConstantLayout */
    updateSubview: function(count, sv, setterName, value) {
        switch (this.align) {
            case 'center': case 'middle':
                sv[setterName]((value - sv[this.measureAttrName]) / 2);
                break;
            case 'right': case 'bottom':
                sv[setterName](value - sv[this.measureAttrName]);
                break;
            default:
                sv[setterName](0);
                break;
        }
        return value;
    },
    
    /** @overrides myt.VariableLayout */
    updateParent: function(setterName, value) {
        this.parent[this.parentSetterName](value);
    }
});

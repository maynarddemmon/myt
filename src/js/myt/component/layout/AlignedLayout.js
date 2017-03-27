/** An extension of VariableLayout that also aligns each view vertically
    or horizontally.
    
    Events:
        align:string
    
    Attributes:
        align:string Determines which way the views are aligned. Allowed
            values are 'left', 'center', 'right' and 'top', 'middle', 'bottom'.
            Defaults to 'middle'.
*/
myt.AlignedLayout = new JS.Class('AlignedLayout', myt.VariableLayout, {
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides myt.VariableLayout */
    initNode: function(parent, attrs) {
        var self = this;
        
        self.align = 'middle';
        self.targetAttrName = 'y';
        self.setterName = 'setY';
        self.measureAttrName = 'boundsHeight';
        self.measureAttrBaseName = 'height';
        self.parentSetterName = 'setHeight';
        self.targetValue = 0;
        
        self.callSuper(parent, attrs);
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
    
    setAlign: function(v) {
        if (this.align !== v) {
            this.align = v;
            
            // Update orientation but don't trigger an update since we
            // already call update at the end of this setter.
            var isLocked = this.locked;
            this.locked = true;
            this.setTargetAttrName((v === 'middle' || v === 'bottom' || v === 'top') ? 'y' : 'x');
            this.locked = isLocked;
            
            if (this.inited) {
                this.fireEvent('align', v);
                this.update();
            }
        }
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
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
    
    /** Determine the maximum subview width/height according to the axis.
        @overrides myt.VariableLayout */
    doBeforeUpdate: function() {
        var measureAttrName = this.measureAttrName,
            value = 0, svs = this.subviews, sv, i = svs.length;
        while(i) {
            sv = svs[--i];
            if (this.skipSubview(sv)) continue;
            value = value > sv[measureAttrName] ? value : sv[measureAttrName];
        }
        
        this.setTargetValue(value);
    },
    
    /** @overrides myt.VariableLayout */
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
        }
        return value;
    },
    
    /** @overrides myt.VariableLayout */
    updateParent: function(setterName, value) {
        this.parent[this.parentSetterName](value);
    }
});

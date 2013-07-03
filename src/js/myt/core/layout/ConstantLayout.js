/** A Layout that sets the configured target attribute name to the configured
    target value for every subview. */
myt.ConstantLayout = new JS.Class('ConstantLayout', myt.Layout, {
    // Accessors ///////////////////////////////////////////////////////////////
    setTargetAttrName: function(v) {
        if (this.targetAttrName === v) return;
        this.targetAttrName = v;
        this.setterName = myt.AccessorSupport.generateSetterName(v);
        if (this.inited) {
            this.fireNewEvent('targetAttrName', v);
            this.update();
        }
    },
    
    setTargetValue: function(v) {
        if (this.targetValue === v) return;
        this.targetValue = v;
        if (this.inited) {
            this.fireNewEvent('targetValue', v);
            this.update();
        }
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** @overrides myt.Layout */
    update: function() {
        if (this.canUpdate()) {
            var setterName = this.setterName, 
                value = this.targetValue, 
                svs = this.subviews;
            for (var i = 0, len = svs.length; len > i; ++i) {
                svs[i][setterName](value);
            }
        }
    }
});

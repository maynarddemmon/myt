/** A layout that sets the target attribute name to the target value for 
    each subview.
    
    Events:
        targetAttrName:string
        targetValue:*
    
    Attributes:
        targetAttrName:string the name of the attribute to set on each subview.
        targetValue:* the value to set the attribute to.
        setterName:string the name of the setter method to call on the subview
            for the targetAttrName. This value is updated when
            setTargetAttrName is called.
*/
myt.ConstantLayout = new JS.Class('ConstantLayout', myt.Layout, {
    // Accessors ///////////////////////////////////////////////////////////////
    setTargetAttrName: function(v) {
        if (this.targetAttrName !== v) {
            this.targetAttrName = v;
            this.setterName = myt.AccessorSupport.generateSetterName(v);
            if (this.inited) {
                this.fireNewEvent('targetAttrName', v);
                this.update();
            }
        }
    },
    
    setTargetValue: function(v) {
        if (this.targetValue !== v) {
            this.targetValue = v;
            if (this.inited) {
                this.fireNewEvent('targetValue', v);
                this.update();
            }
        }
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** @overrides myt.Layout */
    update: function() {
        if (this.canUpdate()) {
            var setterName = this.setterName, 
                value = this.targetValue, 
                svs = this.subviews,
                sv, setter;
            for (var i = 0, len = svs.length; len > i; ++i) {
                sv = svs[i];
                setter = sv[setterName];
                if (setter) setter.call(sv, value);
            }
        }
    }
});

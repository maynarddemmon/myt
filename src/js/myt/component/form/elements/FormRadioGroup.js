/** Monitors a radio button group for a form.
    
    Events:
        None
    
    Attributes:
        groupId:string The ID of the radio group to monitor.
*/
myt.FormRadioGroup = new JS.Class('FormRadioGroup', myt.Node, {
    include: [myt.ValueComponent, myt.FormElement],
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides */
    initNode: function(parent, attrs) {
        if (attrs.groupId === undefined) attrs.groupId = myt.generateGuid();
        
        this.callSuper(parent, attrs);
        
        if (this.value !== undefined) this.__updateGroupValue();
        this.__startMonitoring();
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    /** @overrides myt.FormElement */
    setValue: function(v) {
        var retval = this.callSuper(v);
        if (this.inited) this.__updateGroupValue();
        return retval;
    },
    
    setGroupId: function(v) {
        if (this.groupId !== v) {
            this.__stopMonitoring();
            this.groupId = v;
            if (this.inited) this.__startMonitoring();
        }
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** @private */
    __startMonitoring: function() {
        if (this.groupId) {
            var bag = this.__getBAG();
            if (bag) this.syncTo(bag, '__syncValue', 'trueNode');
        }
    },
    
    /** @private */
    __stopMonitoring: function() {
        if (this.groupId) {
            var bag = this.__getBAG();
            if (bag) this.detachFrom(bag, '__syncValue', 'trueNode');
        }
    },
    
    /** @private */
    __syncValue: function(event) {
        this.setValue(event.value ? event.value.optionValue : null);
    },
    
    /** Search the radio group for a matching node and make that one the
        true node.
        @private */
    __updateGroupValue: function() {
        var bag = this.__getBAG();
        if (bag) {
            var nodes = bag.getNodes(), i = nodes.length, node, v = this.value;
            while (i) {
                node = nodes[--i];
                if (node.optionValue === v) {
                    bag.setTrue(node);
                    break;
                }
            }
        }
    },
    
    /** @private */
    __getBAG: function() {
        return myt.BAG.getGroup('selected', this.groupId);
    }
});

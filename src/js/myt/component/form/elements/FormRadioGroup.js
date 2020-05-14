((pkg) => {
    const getBooleanAttributeGroup = (formRadioGroup) => pkg.BAG.getGroup('selected', formRadioGroup.groupId),
        
        /*  Search the radio group for a matching node and make that one the
            true node.
            @param {!Object} formRadioGroup
            @returns {undefined} */
        updateGroupValue = (formRadioGroup) => {
            const bag = getBooleanAttributeGroup(formRadioGroup);
            if (bag) {
                const nodes = bag.getNodes(),
                    v = formRadioGroup.value;
                let i = nodes.length, 
                    node;
                while (i) {
                    node = nodes[--i];
                    if (node.optionValue === v) {
                        bag.setTrue(node);
                        break;
                    }
                }
            }
        },
        
        startMonitoring = (formRadioGroup) => {
            if (formRadioGroup.groupId) {
                const bag = getBooleanAttributeGroup(formRadioGroup);
                if (bag) formRadioGroup.syncTo(bag, '__syncValue', 'trueNode');
            }
        },
        
        stopMonitoring = (formRadioGroup) => {
            if (formRadioGroup.groupId) {
                const bag = getBooleanAttributeGroup(formRadioGroup);
                if (bag) formRadioGroup.detachFrom(bag, '__syncValue', 'trueNode');
            }
        };
    
    /** Monitors a radio button group for a form.
        
        Attributes:
            groupId:string The ID of the radio group to monitor.
        
        @class
    */
    pkg.FormRadioGroup = new JS.Class('FormRadioGroup', pkg.Node, {
        include: [pkg.ValueComponent, pkg.FormElement],
        
        
        // Life Cycle //////////////////////////////////////////////////////////
        /** @overrides */
        initNode: function(parent, attrs) {
            if (attrs.groupId == null) attrs.groupId = pkg.generateGuid();
            
            this.callSuper(parent, attrs);
            
            if (this.value !== undefined) updateGroupValue(this);
            startMonitoring(this);
        },
        
        
        // Accessors ///////////////////////////////////////////////////////////
        /** @overrides myt.FormElement */
        setValue: function(v) {
            const retval = this.callSuper(v);
            if (this.inited) updateGroupValue(this);
            return retval;
        },
        
        setGroupId: function(v) {
            if (this.groupId !== v) {
                stopMonitoring(this);
                this.groupId = v;
                if (this.inited) startMonitoring(this);
            }
        },
        
        
        // Methods /////////////////////////////////////////////////////////////
        /** @private
            @param {!Object} event
            @returns {undefined} */
        __syncValue: function(event) {
            this.setValue(event.value ? event.value.optionValue : null);
        }
    });
})(myt);

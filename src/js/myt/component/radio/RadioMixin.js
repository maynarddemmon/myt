/** Mix onto a view to make it behave as a radio button. Should be used
    on an myt.DrawButton or subclass thereof.
    
    Events:
        optionValue:* Fired when the optionValue changes.
        selected:boolean Fired when a radio is selected/deselected.
        groupId:string Fired when the groupId is changed.
    
    Attributes:
        optionValue:* The value of this radio button within the radio group.
        selected:boolean Indicates if this radio is selected or not.
        groupId:string The radio group ID this radio is a member of.
    
    Private Attributes:
        __initValue:* Holds the value if it is set during initialization until
            the end of initialization so the group value can be updated.
*/
myt.RadioMixin = new JS.Module('RadioMixin', {
    include: [myt.BAGMembership, myt.CheckboxStyleMixin],
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides */
    initNode: function(parent, attrs) {
        if (attrs.selected === undefined) attrs.selected = false;
        if (attrs.groupId === undefined) attrs.groupId = myt.generateGuid();
        if (attrs.drawingMethodClassname === undefined) attrs.drawingMethodClassname = 'myt.RadioDrawingMethod';
        
        this.callSuper(parent, attrs);
        
        if (this.__initValue !== undefined) {
            this.__updateGroupValue(this.__initValue);
            delete this.__initValue;
        }
        
        if (this.selected) {
            var bag = this.__getBAG();
            if (bag) bag.setTrue(this);
        }
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setOptionValue: function(v) {
        if (this.optionValue !== v) {
            this.optionValue = v;
            if (this.inited) this.fireNewEvent('optionValue', v);
        }
    },
    
    /** Sets the value of the radio group. Calling this method on any
        radio button in the group should have the same effect. */
    setValue: function(v) {
        if (this.inited) {
            this.__updateGroupValue(v);
        } else {
            this.__initValue = v;
        }
    },
    
    /** Gets the value of the 'selected' radio button in the group.
        @returns *: The value of the selected radio button. */
    getValue: function() {
        // Get selected radio
        var bag = this.__getBAG(),
            selectedRadio = bag ? bag.trueNode : null;
        return selectedRadio ? selectedRadio.optionValue : null;
    },
    
    setSelected: function(v) {
        if (this.selected !== v) {
            this.selected = v;
            if (this.inited) {
                this.fireNewEvent('selected', v);
                this.redraw();
            }
        }
    },
    
    setGroupId: function(v) {
        if (this.groupId !== v) {
            var oldGroupId = this.groupId;
            this.groupId = v;
            if (oldGroupId) this.removeFromBAG('selected', oldGroupId);
            if (v) this.addToBAG('selected', v);
            if (this.inited) this.fireNewEvent('groupId', v);
        }
    },
    
    /** @overrides myt.CheckboxStyleMixin */
    getDrawConfig: function(state) {
        var config = this.callSuper(state);
        config.checked = this.selected;
        return config;
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** @overrides myt.DrawButton */
    doActivated: function() {
        if (!this.selected) this.setValue(this.optionValue);
    },
    
    /** @private */
    __getBAG: function() {
        return this.getBAG('selected', this.groupId);
    },
    
    /** Search the radio group for a matching node and make that one the
        true node.
        @private */
    __updateGroupValue: function(v) {
        var bag = this.__getBAG();
        if (bag) {
            var nodes = bag.getNodes(), i = nodes.length, node;
            while (i) {
                node = nodes[--i];
                if (node.optionValue === v) {
                    bag.setTrue(node);
                    break;
                }
            }
        }
    }
});

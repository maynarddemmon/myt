/** Mix onto a view to make it behave as a radio button. Should be used
    on an myt.DrawButton or subclass thereof. */
myt.RadioMixin = new JS.Module('RadioMixin', {
    include: [myt.BAGMembership, myt.CheckboxMixin],
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides myt.Checkbox */
    initNode: function(parent, attrs) {
        if (attrs.groupId === undefined) attrs.groupId = myt.InputRadio.getGroupId();
        if (attrs.drawingMethodClassname === undefined) attrs.drawingMethodClassname = 'myt.RadioDrawingMethod';
        
        this.callSuper(parent, attrs);
        
        // Update BAG
        if (this.checked) {
            var bag = this.getBAG('checked', this.groupId);
            if (bag) bag.setTrue(this);
        }
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setGroupId: function(v) {
        if (this.groupId === v) return;
        var oldGroupId = this.groupId;
        this.groupId = v;
        if (oldGroupId) this.removeFromBAG('checked', oldGroupId);
        if (v) this.addToBAG('checked', v);
        if (this.inited) this.fireNewEvent('groupId', v);
    },
    
    /** @overrides myt.CheckboxMixin */
    getValue: function() {
        return this.value;
    },
    
    getGroupValue: function() {
        var checkedRadio = this.getCheckedRadio();
        return checkedRadio ? checkedRadio.getValue() : null;
    },
    
    getCheckedRadio: function() {
        var bag = this.getBAG('checked', this.groupId);
        return bag ? bag.trueNode : null;
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** @overrides myt.CheckboxMixin */
    doActivated: function() {
        if (!this.checked) {
            var bag = this.getBAG('checked', this.groupId);
            if (bag) bag.setTrue(this);
        }
    }
});

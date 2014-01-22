/** Mix onto a view to make it behave as a radio button. Should be used
    on an myt.DrawButton or subclass thereof.
    
    Events:
        selected:boolean Fired when a radio is selected/deselected.
        groupId:string Fired when the groupId is changed.
    
    Attributes:
        selected:boolean Indicates if this radio is selected or not.
        groupId:string The radio group ID this radio is a member of.
*/
myt.RadioMixin = new JS.Module('RadioMixin', {
    include: [myt.ValueComponent, myt.BAGMembership, myt.CheckboxStyleMixin],
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides */
    initNode: function(parent, attrs) {
        if (attrs.selected === undefined) attrs.selected = false;
        if (attrs.groupId === undefined) attrs.groupId = myt.generateGuid();
        if (attrs.drawingMethodClassname === undefined) attrs.drawingMethodClassname = 'myt.RadioDrawingMethod';
        
        this.callSuper(parent, attrs);
        
        if (this.selected) this.__setTrue();
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
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
    
    /** Gets the value of the selected radio for the radio group.
        @returns *: The value of the radio or null if not found. */
    getGroupValue: function() {
        // Get selected radio
        var bag = this.getBAG('selected', this.groupId),
            selectedRadio = bag ? bag.trueNode : null;
        return selectedRadio ? selectedRadio.getValue() : null;
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
        if (!this.selected) this.__setTrue();
    },
    
    /** @private */
    __setTrue: function() {
        var bag = this.getBAG('selected', this.groupId);
        if (bag) bag.setTrue(this);
    }
});

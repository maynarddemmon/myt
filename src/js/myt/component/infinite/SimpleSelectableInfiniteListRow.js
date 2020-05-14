/** A simple implementation of a SelectableInfiniteListRow.
    
    Events:
        None
    
    Attributes:
        selectedColor
    
    Private Attributes:
        None
    
    @class */
myt.SimpleSelectableInfiniteListRow = new JS.Class('SimpleSelectableInfiniteListRow', myt.SimpleButton, {
    include: [myt.SelectableInfiniteListRow],
    
    
    // Class Methods and Attributes ////////////////////////////////////////////
    extend: {
        DEFAULT_SELECTED_COLOR:'#ccccff',
        DEFAULT_ACTIVE_COLOR:'#f8f8f8',
        DEFAULT_HOVER_COLOR:'#eeeeee',
        DEFAULT_READY_COLOR:'#ffffff'
    },
    
    // Life Cycle //////////////////////////////////////////////////////////////
    initNode: function(parent, attrs) {
        const self = this,
            SSILR = myt.SimpleSelectableInfiniteListRow;
        
        if (attrs.selectedColor == null) attrs.selectedColor = SSILR.DEFAULT_SELECTED_COLOR;
        if (attrs.activeColor == null) attrs.activeColor = SSILR.DEFAULT_ACTIVE_COLOR;
        if (attrs.hoverColor == null) attrs.hoverColor = SSILR.DEFAULT_HOVER_COLOR;
        if (attrs.readyColor == null) attrs.readyColor = SSILR.DEFAULT_READY_COLOR;
        
        if (attrs.focusEmbellishment == null) attrs.focusEmbellishment = false;
        if (attrs.activationKeys == null) attrs.activationKeys = [13,27,32,37,38,39,40];
        
        self.callSuper(parent, attrs);
    },
    
    destroy: function() {
        if (this.selected) this.infiniteOwner.setSelectedRow();
        this.callSuper();
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setSelected: function(v) {
        this.callSuper(v);
        if (this.inited) this.updateUI();
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    clean: function() {
        this.setMouseOver(false);
        this.setMouseDown(false);
        if (this.focused) this.blur();
        this.callSuper();
    },
    
    updateUI: function() {
        this.callSuper();
        if (this.selected) this.setBgColor(this.selectedColor);
    },
    
    doActivated: function() {
        this.callSuper();
        this.infiniteOwner.setSelectedRow(this);
    },
    
    doActivationKeyDown: function(key, isRepeat) {
        const self = this,
            owner = self.infiniteOwner,
            model = self.model;
        switch (key) {
            case 27: // Escape
                if (self.selected) owner.setSelectedRow();
                break;
            case 37: // Left
            case 38: // Up
                owner.selectPrevRowForModel(model);
                break;
            case 39: // Right
            case 40: // Down
                owner.selectNextRowForModel(model);
                break;
        }
    },
    
    doActivationKeyUp: function(key) {
        switch (key) {
            case 13: // Enter
            case 32: // Space
                this.doActivated();
                break;
        }
    }
});

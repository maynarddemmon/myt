/** Manages a stack of myt.View panel children that can be transitioned to
    an "active" state as they are selected. The active panel will be sized
    to fit the bounds of the stack.
    
    Events:
        None
    
    Attributes:
        None
*/
// FIXME: handle panel destruction
// FIXME: handle panel insertion
myt.PanelStack = new JS.Class('PanelStack', myt.View, {
    include: [myt.SelectionManager],
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides myt.View */
    initNode: function(parent, attrs) {
        attrs.overflow = 'hidden';
        
        if (attrs.itemSelectionId === undefined) attrs.itemSelectionId = 'panelId';
        if (attrs.maxSelected === undefined) attrs.maxSelected = 1;
        
        this.callSuper(parent, attrs);
        
        this.syncTo(this, '__updateHeight', 'height');
        this.syncTo(this, '__updateWidth', 'width');
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** @private */
    __updateWidth: function(event) {
        // Only resize the active panel
        var panel = this.getActivePanel();
        if (panel) panel.setWidth(event.value);
    },
    
    /** @private */
    __updateHeight: function(event) {
        // Only resize the active panel
        var panel = this.getActivePanel();
        if (panel) panel.setHeight(event.value);
    },
    
    /** Gets the selected panel.
        @returns myt.StackablePanel: The selected panel or undefined if
            none selected. */
    getActivePanel: function() {
        return this.getSelected()[0];
    },
    
    getPanel: function(panelId) {
        return this.getSelectableItem(panelId);
    },
    
    selectPanel: function(panelId) {
        this.selectById(panelId);
    },
    
    /** @overrides myt.SelectionManager */
    doSelected: function(item) {
        item.setWidth(this.width);
        item.setHeight(this.height);
    },
    
    /** Called by a panel when it transitions between selected states. Should
        not be called directly.
        @param panel:myt.StackablePanel The panel that is transitioning.
        @returns void */
    doStackTransition: function(panel) {
        var selected = panel.selected;
        if (selected) panel.makeHighestZIndex();
        panel.setVisible(selected);
    }
});

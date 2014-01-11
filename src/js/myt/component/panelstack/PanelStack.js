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
        
        this.applyConstraint('__updateHeight', [this, 'height']);
        this.applyConstraint('__updateWidth', [this, 'width']);
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** @private */
    __updateWidth: function(event) {
        // Only resize the active panel
        var panel = this.getActivePanel();
        if (panel) panel.setWidth(event.value);
    },
    
    /** @private */
    __updateHeight: function() {
        // Only resize the active panel
        var panel = this.getActivePanel();
        if (panel) panel.setHeight(event.value);
    },
    
    getActivePanel: function() {
        var selected = this.getSelected();
        return selected.length > 0 ? selected[0] : null;
    },
    
    getPanel: function(panelId) {
        var subs = this.subviews, i = subs.length, panel;
        while (i) {
            panel = subs[--i];
            if (panel.panelId === panelId) return panel;
        }
        return null;
    },
    
    selectPanel: function(panelId) {
        var panel = this.getPanel(panelId);
        if (panel) {
            this.select(panel);
            panel.setWidth(this.width);
            panel.setHeight(this.height);
        }
    },
    
    /** Called by a panel when it transitions between selected states. Should
        not be called directly.
        @param panel:myt.StackablePanel The panel that is transitioning.
        @returns void */
    doStackTransition: function(panel) {
        var selected = panel.selected;
        if (selected) panel.bringToFront();
        panel.setVisible(selected);
    }
});

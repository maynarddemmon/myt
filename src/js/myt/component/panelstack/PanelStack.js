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
        
        if (attrs.itemSelectionId == null) attrs.itemSelectionId = 'panelId';
        if (attrs.maxSelected == null) attrs.maxSelected = 1;
        
        this.callSuper(parent, attrs);
        
        this.syncTo(this, '__updateHeight', 'height');
        this.syncTo(this, '__updateWidth', 'width');
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setTransition: function(transition) {this.set('transition', transition, true);},
    
    
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
        not be called directly. Instead change the panel selection.
        @param panel:myt.StackablePanel The panel that is transitioning.
        @returns void */
    doStackTransition: function(panel) {
        this['doStackTransition' + (panel.selected ? 'To' : 'From')](panel);
    },
    
    /** Called by PanelStack.doStackTransition when the provided panel will be 
        the newly selected panel in the stack. Should not be called directly. 
        Instead change the panel selection.
        @param panel:myt.StackablePanel The panel that is transitioning.
        @returns void */
    doStackTransitionTo: function(panel) {
        this.doBeforeTransitionTo(panel);
        
        var transition = this.transition;
        if (transition) {
            var self = this;
            transition.to(panel).then((panel) => {self.doAfterTransitionTo(panel);});
        } else {
            panel.makeHighestZIndex();
            panel.setVisible(true);
            
            this.doAfterTransitionTo(panel);
        }
    },
    
    doBeforeTransitionTo: function(panel) {},
    doAfterTransitionTo: function(panel) {},
    
    /** Called by PanelStack.doStackTransition when the provided panel will be 
        the newly deselected panel in the stack. Should not be called directly. 
        Instead change the panel selection.
        @param panel:myt.StackablePanel The panel that is transitioning.
        @returns void */
    doStackTransitionFrom: function(panel) {
        this.doBeforeTransitionFrom(panel);
        
        var transition = this.transition;
        if (transition) {
            var self = this;
            transition.from(panel).then((panel) => {self.doAfterTransitionFrom(panel);});
        } else {
            panel.setVisible(false);
            this.doAfterTransitionFrom(panel);
        }
    },
    
    doBeforeTransitionFrom: function(panel) {},
    doAfterTransitionFrom: function(panel) {},
});

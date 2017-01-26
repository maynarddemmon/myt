/** Makes a view act as a panel in a myt.PanelStack.
    
    Events:
        None
    
    Attributes:
        panelId:string The unique ID of the panel.
        panelStack:myt.PanelStack A reference to the panel stack this panel
            belongs to. If undefined the parent view will be used.
*/
myt.StackablePanel = new JS.Module('StackablePanel', {
    include: [myt.Selectable],
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides */
    initNode: function(parent, attrs) {
        attrs.visible = attrs.selected = false;
        
        if (attrs.bgColor === undefined) attrs.bgColor = '#ffffff';
        if (attrs.panelId === undefined) attrs.panelId = attrs.name;
        
        this.callSuper(parent, attrs);
        
        if (this.selected) this.doStackTransition();
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setPanelStack: function(v) {this.panelStack = v;},
    
    getPanelStack: function() {
        return this.panelStack || this.parent;
    },
    
    setPanelId: function(v) {this.panelId = v;},
    
    /** @overrides myt.Selectable */
    setSelected: function(v) {
        if (this.selected !== v) {
            this.callSuper(v);
            if (this.inited) this.doStackTransition();
        }
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** Called whenever a transition between panels is initiated by this panel.
        Default behavior is to defer to the panelStack's doStackTransition
        method.
        @returns void */
    doStackTransition: function() {
        this.getPanelStack().doStackTransition(this);
    }
});

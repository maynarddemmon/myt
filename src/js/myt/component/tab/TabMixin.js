/** A tab component.
    
    Requires:
        myt.Activateable
    
    Events:
        None
    
    Attributes:
        tabId:string The unique ID of this tab relative to its tab container.
        tabContainer:myt.TabContainer The tab container that manages this tab.
*/
myt.TabMixin = new JS.Module('TabMixin', {
    include: [myt.Selectable],
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides */
    initNode: function(parent, attrs) {
        if (attrs.tabId == null) attrs.tabId = myt.generateGuid();
        if (attrs.tabContainer == null) attrs.tabContainer = parent;
        
        // Selection must be done via the select method on the tabContainer
        let initiallySelected;
        if (attrs.selected) {
            initiallySelected = true;
            delete attrs.selected;
        }
        
        this.callSuper(parent, attrs);
        
        if (initiallySelected) this.tabContainer.select(this);
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setTabId: function(v) {this.tabId = v;},
    setTabContainer: function(v) {this.tabContainer = v;},
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** @overrides myt.Activateable */
    doActivated: function() {
        if (!this.selected) this.tabContainer.select(this);
    }
});

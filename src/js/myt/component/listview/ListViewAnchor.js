/** The anchor for an myt.ListView.
    
    Events:
        None
    
    Attributes:
        listViewClass:JS.Class The class of list view to create. Defaults
            to myt.ListView.
        listViewAttrs:object The initialization attributes for the 
            listViewClass.
        itemConfig:array An array of configuration parameters for the items
            in the list.
    
    @class
*/
myt.ListViewAnchor = new JS.Module('ListViewAnchor', {
    include: [myt.FloatingPanelAnchor],
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    initNode: function(parent, attrs) {
        if (attrs.listViewClass == null) attrs.listViewClass = myt.ListView;
        if (attrs.listViewAttrs == null) attrs.listViewAttrs = {};
        if (attrs.itemConfig == null) attrs.itemConfig = [];
        
        // Assume this will be mixed onto something that implements 
        // myt.KeyActivation since it probably will.
        if (attrs.activationKeys == null) attrs.activationKeys = [13,27,32,37,38,39,40];
        
        this.callSuper(parent, attrs);
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setListViewClass: function(v) {this.listViewClass = v;},
    setListViewAttrs: function(v) {this.listViewAttrs = v;},
    setItemConfig: function(v) {this.itemConfig = v;},
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** Called by the list view when an item is activated. By default it
        hides the list view.
        @param {!Object} itemView
        @returns {undefined} */
    doItemActivated: function(itemView) {
        this.hideFloatingPanel();
    },
    
    /** @overrides myt.FloatingPanelAnchor */
    getFloatingPanel: function(panelId) {
        return this.callSuper(panelId) || this.createFloatingPanel(panelId, this.listViewClass, this.listViewAttrs);
    },
    
    /** @overrides myt.FloatingPanelAnchor */
    showFloatingPanel: function(panelId) {
        const fp = this.getFloatingPanel(panelId);
        if (fp) {
            fp.setItemConfig(this.itemConfig);
            this.callSuper(panelId);
        }
    },
    
    /** @overrides myt.KeyActivation. */
    doActivationKeyDown: function(key, isRepeat) {
        // Close for escape key.
        if (key === 27) {
            this.hideFloatingPanel();
            return;
        }
        
        // Select first/last if the list view is already open
        switch (key) {
            case 37: // Left
            case 38: // Up
                this.selectLastItem();
                break;
            case 39: // Right
            case 40: // Down
                this.selectFirstItem();
                break;
        }
        
        this.callSuper(key, isRepeat);
    },
    
    /** @overrides myt.KeyActivation. */
    doActivationKeyUp: function(key) {
        // Abort for escape key.
        if (key === 27) return;
        
        this.callSuper(key);
        
        // Select first/last after list view is open.
        switch (key) {
            case 37: // Left
            case 38: // Up
                this.selectLastItem();
                break;
            case 39: // Right
            case 40: // Down
                this.selectFirstItem();
                break;
        }
    },
    
    selectLastItem: function() {
        const fp = this.getFloatingPanel();
        if (fp && fp.isShown()) {
            const item = fp.getLastFocusableItem();
            if (item) item.focus();
        }
    },
    
    selectFirstItem: function() {
        const fp = this.getFloatingPanel();
        if (fp && fp.isShown()) {
            const item = fp.getFirstFocusableItem();
            if (item) item.focus();
        }
    }
});

/** Manages the selection of one or more items.
    
    Events:
        itemSelected: Fired when an item is selected. The value is the item.
        itemDeselected: Fired when an item is deselected. The value is the item.
    
    Attributes:
        itemSelectionId:string the name of the property on items that is used
            to differentiate them from each other for selection. The default
            value is 'id'.
        selectedCount:number the number of selected items.
        _selected:object a map of selected items by itemSelectionId.
        _lastSelectedItem:object a reference to the last item that was
            selected. If this item is deselected this will get set to null.
*/
myt.SelectionManager = new JS.Module('SelectionManager', {
    // Life Cycle //////////////////////////////////////////////////////////////
    initNode: function(parent, attrs) {
        this._selected = {};
        this._lastSelectedItem = null;
        
        attrs.selectedCount = 0;
        
        if (attrs.itemSelectionId === undefined) attrs.itemSelectionId = 'id';
        
        this.callSuper(parent, attrs);
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setItemSelectionId: function(v) {
        this.itemSelectionId = v;
    },
    
    setSelectedCount: function() {
        if (this.selectedCount === v) return;
        this.selectedCount = v;
        if (this.inited) this.fireNewEvent('selectedCount', v);
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** Selects the provided item.
        @returns void */
    select: function(item) {
        if (!this.isSelected(item) && item.canSelect(this)) {
            item.setSelected(true);
            this._selected[item[this.itemSelectionId]] = item;
            this.setSelectedCount(this.selectedCount + 1);
            
            this._lastSelectedItem = item;
            
            this.fireNewEvent('itemSelected', item);
        }
    },
    
    /** Selects all items that can be selected.
        @returns void */
    selectAll: function() {
        var items = this.getSelectableItems(), i = items.length;
        while (i) this.select(items[--i]);
    },
    
    /** Deselects the provided item.
        @returns void */
    deselect: function(item) {
        if (this.isSelected(item) && item.canDeselect(this)) {
            item.setSelected(false);
            delete this._selected[item[this.itemSelectionId]];
            this.setSelectedCount(this.selectedCount - 1);
            
            if (this._lastSelectedItem === item) this._lastSelectedItem = null;
            
            this.fireNewEvent('itemDeselected', item);
        }
    },
    
    /** Deselects all selected items.
        @returns void */
    deselectAll: function() {
        var items = this._selected, key;
        for (key in selectedItems) this.deselect(items[key]);
    },
    
    /** Checks if the item is selected.
        @returns boolean */
    isSelected: function(item) {
        return item ? item.isSelected() : false;
    },
    
    /** Checks if all selectable items are selected.
        @returns boolean */
    areAllSelected: function() {
        return this.selectedCount === this.getSelectableItems().length;
    },
    
    /** Gets a list of items that are potentially selectable by this manager.
        By default assumes this is an myt.View and returns all 
        myt.Selectable subviews.
        @returns array */
    getManagedItems: function() {
        var retval = [], svs = this.subviews, i = svs.length, sv;
        while (i) {
            sv = svs[--i];
            if (sv.isA(myt.Selectable)) retval.push(sv);
        }
        return retval;
    },
    
    /** Gets a list of items that can currently be selected by this manager.
        @returns array */
    getSelectableItems: function() {
        var items = this.getManagedItems(), i = items.length;
        while (i) {
            if (!items[--i].canSelect(this)) items.splice(i, 1);
        }
        return items;
    }
});

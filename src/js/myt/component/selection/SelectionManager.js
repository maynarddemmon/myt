/** Manages the selection of one or more items.
    
    Events:
        itemSelected:object Fired when an item is selected. The event value is 
            the selected item.
        itemDeselected:object Fired when an item is deselected. The event 
            value is the deselected item.
        selectedCount:number Fired when the number of selected items changes.
    
    Attributes:
        itemSelectionId:string The name of the property on items that is used
            to differentiate them from each other for selection. The default
            value is 'id'.
        maxSelected:number The maximum number of items that can be selected.
            If -1 is provided the count is unlimited. If 1 is provided attempts
            to select when an item is already selected will result in the
            existing selection being cleared and the the new item being
            selected. Defaults to -1.
        selectedCount:number The number of selected items.
    
    Private Attributes:
        __selected:object A map of selected items by itemSelectionId.
        __lastSelectedItem:object A reference to the last item that was
            selected. If this item is deselected this will get set to null.
*/
myt.SelectionManager = new JS.Module('SelectionManager', {
    // Class Methods and Attributes ////////////////////////////////////////////
    extend: {
        /** Determines if we are in "add" mode for selection such that
            selections will only be increased not reduced. Typically this
            means the shift key is down.
            @returns boolean true if in add mode, false otherwise. */
        isAddMode: function() {
            return myt.global.keys.isShiftKeyDown();
        },
        
        /** Determines if we are in "toggle" mode for selection such that
            selections can be added to or removed from incrementally. Typically 
            this means the control or command key is down.
            @returns boolean true if in add mode, false otherwise. */
        isToggleMode: function() {
            var gk = myt.global.keys;
            return gk.isControlKeyDown() || gk.isCommandKeyDown();
        }
    },
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    initNode: function(parent, attrs) {
        this.__selected = {};
        this.__lastSelectedItem = null;
        
        attrs.selectedCount = 0;
        
        if (attrs.itemSelectionId === undefined) attrs.itemSelectionId = 'id';
        if (attrs.maxSelected === undefined) attrs.maxSelected = -1;
        
        this.callSuper(parent, attrs);
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setItemSelectionId: function(v) {this.itemSelectionId = v;},
    setMaxSelected: function(v) {this.maxSelected = v;},
    
    setSelectedCount: function(v) {
        if (this.selectedCount !== v) {
            this.selectedCount = v;
            if (this.inited) this.fireNewEvent('selectedCount', v);
        }
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** A wrapper around myt.SelectionManager.isAddMode. */
    isAddMode: function() {
        return myt.SelectionManager.isAddMode();
    },
    
    /** A wrapper around myt.SelectionManager.isToggleMode. */
    isToggleMode: function() {
        return myt.SelectionManager.isToggleMode();
    },
    
    /** Gets the currently selected items.
        @returns array: The selected items. */
    getSelected: function() {
        var retval = [], items = this.__selected, key;
        for (key in items) retval.push(items[key]);
        return retval;
    },
    
    /** Selects the provided item.
        @param item:object The item to select.
        @returns void */
    select: function(item) {
        if (!this.isSelected(item) && this.canSelect(item)) {
            item.setSelected(true);
            this.__selected[item[this.itemSelectionId]] = item;
            this.setSelectedCount(this.selectedCount + 1);
            
            this.__lastSelectedItem = item;
            
            this.fireNewEvent('itemSelected', item);
        }
    },
    
    /** Checks if the item can be selected.
        @param item:object The item to test.
        @returns boolean: True if selection is allowed, false otherwise. */
    canSelect: function(item) {
        var ms = this.maxSelected, sc = this.selectedCount;
        
        if (ms === 0) {
            return false;
        } else if (ms === 1) {
            // Deselect current selection if necessary
            if (sc > 0) {
                this.deselectAll();
                if (this.selectedCount > 0) return false;
            }
        } else if (ms > 1) {
            if (sc >= ms) return false;
        }
        
        return item.canSelect(this);
    },
    
    /** Selects all items that can be selected.
        @returns void */
    selectAll: function() {
        var items = this.getSelectableItems(), i = items.length;
        while (i) this.select(items[--i]);
    },
    
    /** Deselects the provided item.
        @param item:object The item to deselect.
        @returns void */
    deselect: function(item) {
        if (this.isSelected(item) && this.canDeselect(item)) {
            item.setSelected(false);
            delete this.__selected[item[this.itemSelectionId]];
            this.setSelectedCount(this.selectedCount - 1);
            
            if (this.__lastSelectedItem === item) this.__lastSelectedItem = null;
            
            this.fireNewEvent('itemDeselected', item);
        }
    },
    
    /** Checks if the item can be deselected.
        @returns true if deselection is allowed, false otherwise. */
    canDeselect: function(item) {
        return item.canDeselect(this);
    },
    
    /** Deselects all selected items.
        @returns void */
    deselectAll: function() {
        var items = this.__selected, key;
        for (key in items) this.deselect(items[key]);
    },
    
    /** Checks if the item is selected.
        @param item:object The item to test.
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
        var retval = [], svs = this.getSubviews(), i = svs.length, sv;
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

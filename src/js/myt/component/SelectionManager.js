(pkg => {
    const JSModule = JS.Module,
        GlobalKeys = pkg.global.keys,
        
        /** Makes an object selectable.
            
            Events:
                selected:boolean
            
            Attributes:
                selected:boolean Indicates the object is selected.
            
            @class */
        Selectable = pkg.Selectable = new JSModule('Selectable', {
            // Accessors ///////////////////////////////////////////////////////
            setSelected: function(v) {
                v = this.valueFromEvent(v);
                if (this.selected !== v) {
                    this.selected = v;
                    if (this.inited) this.fireEvent?.('selected', v);
                }
            },
            
            
            // Methods /////////////////////////////////////////////////////////
            /** Checks if this object is selected.
                @returns {boolean} */
            isSelected: function() {
                return !!this.selected;
            },
            
            /** Checks if the provided myt.SelectionManager can select this object. Returns true 
                by default.
                @param {!Object} selectionManager
                @returns {boolean} */
            canSelect: selectionManager => true,
            
            /** Checks if the provided myt.SelectionManager can deselect this object. Returns true 
                by default.
                @param {!Object} selectionManager
                @returns {boolean} */
            canDeselect: selectionManager => true
        }),
        
        /** Manages the selection of one or more items.
            
            Events:
                itemSelected:object Fired when an item is selected. The event value is the 
                    selected item.
                itemDeselected:object Fired when an item is deselected. The event value is the 
                    deselected item.
                selectedCount:number Fired when the number of selected items changes.
            
            Attributes:
                itemSelectionId:string The name of the property on items that is used to 
                    differentiate them from each other for selection. The default value is 'id'.
                maxSelected:number The maximum number of items that can be selected. If -1 is 
                    provided the count is unlimited. If 1 is provided attempts to select when an 
                    item is already selected will result in the existing selection being cleared 
                    and the the new item being selected. Defaults to -1.
                minSelected:number The minimum number of items that can be selected. Defaults to 0.
                selectedCount:number The number of selected items.
            
            Private Attributes:
                __selected:object A map of selected items by itemSelectionId.
                __lastSelectedItem:object A reference to the last item that was selected. If this 
                    item is deselected this will get set to null.
            
            @class */
        SelectionManager = pkg.SelectionManager = new JSModule('SelectionManager', {
            // Class Methods and Attributes ////////////////////////////////////
            extend: {
                /** Determines if we are in "add" mode for selection such that selections will only 
                    be increased not reduced. Typically this means the shift key is down.
                    @returns {boolean} true if in add mode, false otherwise. */
                isAddMode: () => GlobalKeys.isShiftKeyDown(),
                
                /** Determines if we are in "toggle" mode for selection such that selections can be 
                    added to or removed from incrementally. Typically this means the control or 
                    command key is down.
                    @returns {boolean} true if in add mode, false otherwise. */
                isToggleMode: () => GlobalKeys.isAcceleratorKeyDown()
            },
            
            
            // Life Cycle //////////////////////////////////////////////////////
            initNode: function(parent, attrs) {
                this.__selected = {};
                this.__lastSelectedItem = null;
                
                attrs.selectedCount = 0;
                
                attrs.itemSelectionId ??= 'id';
                attrs.maxSelected ??= -1;
                attrs.minSelected ??= 0;
                
                this.callSuper(parent, attrs);
            },
            
            
            // Accessors ///////////////////////////////////////////////////////
            setItemSelectionId: function(v) {this.itemSelectionId = v;},
            setMaxSelected: function(v) {this.maxSelected = v;},
            
            setSelectedCount: function(v) {
                if (this.selectedCount !== v) {
                    this.selectedCount = v;
                    if (this.inited) this.fireEvent('selectedCount', v);
                }
            },
            
            
            // Methods /////////////////////////////////////////////////////////
            /** A wrapper around myt.SelectionManager.isAddMode.
                @returns {boolean} */
            isAddMode: () => SelectionManager.isAddMode(),
            
            /** A wrapper around myt.SelectionManager.isToggleMode.
                @returns {boolean} */
            isToggleMode: () => SelectionManager.isToggleMode(),
            
            /** Gets the currently selected items.
                @returns {!Array} The selected items. */
            getSelected: function() {
                return Object.values(this.__selected);
            },
            
            /** Selects the provided item.
                @param {!Object} item - The item to select.
                @returns {undefined} */
            select: function(item) {
                if (item && !this.isSelectedItem(item) && this.canSelectItem(item)) {
                    item.setSelected(true);
                    this.__selected[item[this.itemSelectionId]] = item;
                    this.setSelectedCount(this.selectedCount + 1);
                    
                    this.__lastSelectedItem = item;
                    
                    this.doSelected(item);
                    this.fireEvent('itemSelected', item);
                }
            },
            
            /** Called when an item is selected.
                @param {!Objectd} item - The newly selected myt.Selectable..
                @returns {undefined} */
            doSelected: item => {},
            
            /** Selects the item with the provided item selection ID.
                @param {string} itemSelectionId
                @returns {undefined} */
            selectById: function(itemSelectionId) {
                this.select(this.getSelectableItem(itemSelectionId));
            },
            
            /** Checks if the item can be selected.
                @param {!Object} item - The item to test.
                @returns {boolean} True if selection is allowed, false otherwise. */
            canSelectItem: function(item) {
                const {maxSelected, selectedCount} = this;
                
                if (maxSelected === 0) {
                    return false;
                } else if (maxSelected === 1) {
                    // Deselect current selection if necessary
                    if (selectedCount > 0) {
                        this.deselectAll();
                        if (this.selectedCount > 0) return false;
                    }
                } else if (maxSelected > 1) {
                    if (selectedCount >= maxSelected) return false;
                }
                
                return item.canSelect(this);
            },
            
            /** Selects all items that can be selected.
                @returns {undefined} */
            selectAll: function() {
                const items = this.getSelectableItems();
                let i = items.length;
                while (i) this.select(items[--i]);
            },
            
            /** Deselects the provided item.
                @param {!Object} item - The item to deselect.
                @returns {undefined} */
            deselect: function(item) {
                if (this.isSelectedItem(item) && this.canDeselectItem(item)) {
                    item.setSelected(false);
                    delete this.__selected[item[this.itemSelectionId]];
                    this.setSelectedCount(this.selectedCount - 1);
                    
                    if (this.__lastSelectedItem === item) this.__lastSelectedItem = null;
                    
                    this.doDeselected(item);
                    this.fireEvent('itemDeselected', item);
                }
            },
            
            /** Called when an item is deselected.
                @param {!Object} item - The newly deselected myt.Selectable.
                @returns {undefined} */
            doDeselected: item => {},
            
            /** Deselects the item with the provided item selection ID.
                @param {string} itemSelectionId
                @returns {undefined} */
            deselectById: function(itemSelectionId) {
                this.deselect(this.getSelectableItem(itemSelectionId));
            },
            
            /** Checks if the item can be deselected.
                @param {!Object} item
                @returns {boolean}true if deselection is allowed, false otherwise. */
            canDeselectItem: function(item) {
                if (this.selectedCount <= this.minSelected) return false;
                return item.canDeselect(this);
            },
            
            /** Deselects all selected items.
                @returns {undefined} */
            deselectAll: function() {
                const items = this.__selected;
                for (const key in items) this.deselect(items[key]);
            },
            
            /** Checks if the item is selected.
                @param {!Objecdt} item - The item to test.
                @returns {boolean} */
            isSelectedItem: item => item ? item.isSelected() : false,
            
            /** Checks if all selectable items are selected.
                @returns {boolean} */
            areAllSelected: function() {
                return this.selectedCount === this.getSelectableItems().length;
            },
            
            /** Gets a list of items that are potentially selectable by this manager. By default 
                assumes this is an myt.View and returns all myt.Selectable subviews.
                @returns {!Array} */
            getManagedItems: function() {
                const retval = [], 
                    svs = this.getSubviews();
                let i = svs.length;
                while (i) {
                    const sv = svs[--i];
                    if (sv.isA(Selectable)) retval.push(sv);
                }
                return retval;
            },
            
            /** Gets a list of items that can currently be selected by this manager.
                @returns {!Array} */
            getSelectableItems: function() {
                const items = this.getManagedItems();
                let i = items.length;
                while (i) {
                    if (!items[--i].canSelect(this)) items.splice(i, 1);
                }
                return items;
            },
            
            /** Gets a selectable item with the the provided selection item ID.
                @param {string} itemSelectionId
                @returns {?Object} - The myt.Selectable or undefined if not found. */
            getSelectableItem: function(itemSelectionId) {
                const items = this.getSelectableItems(),
                    selectionAttr = this.itemSelectionId;
                let i = items.length;
                while (i) {
                    const item = items[--i];
                    if (item[selectionAttr] === itemSelectionId) return item;
                }
            }
        });
})(myt);

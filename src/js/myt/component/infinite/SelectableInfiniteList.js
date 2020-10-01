((pkg) => {
    const JSClass = JS.Class,
        DEFAULT_SELECTED_COLOR = '#ccccff',
        DEFAULT_ACTIVE_COLOR = '#f8f8f8',
        DEFAULT_HOVER_COLOR = '#eeeeee',
        DEFAULT_READY_COLOR = '#ffffff',
        
        /* Clears the selectedRow while leaving the selectedRowModel. */
        clearSelectedRow = (selectableInfiniteList) => {
            const existing = selectableInfiniteList.selectedRow;
            if (existing) {
                existing.setSelected(false);
                selectableInfiniteList.set('selectedRow', null, true);
            }
        },
        
        /** A mixin for rows in infinite scrolling lists
            
            @class */
        SelectableInfiniteListRow = pkg.SelectableInfiniteListRow = new JS.Module('SelectableInfiniteListRow', {
            include: [pkg.InfiniteListRow, pkg.Selectable]
        });
    
    /** A simple implementation of a SelectableInfiniteListRow.
        
        Attributes:
            selectedColor
        
        @class */
    pkg.SimpleSelectableInfiniteListRow = new JSClass('SimpleSelectableInfiniteListRow', pkg.SimpleButton, {
        include: [SelectableInfiniteListRow],
        
        
        // Life Cycle //////////////////////////////////////////////////////////
        initNode: function(parent, attrs) {
            if (attrs.selectedColor == null) attrs.selectedColor = DEFAULT_SELECTED_COLOR;
            if (attrs.activeColor == null) attrs.activeColor = DEFAULT_ACTIVE_COLOR;
            if (attrs.hoverColor == null) attrs.hoverColor = DEFAULT_HOVER_COLOR;
            if (attrs.readyColor == null) attrs.readyColor = DEFAULT_READY_COLOR;
            
            if (attrs.focusEmbellishment == null) attrs.focusEmbellishment = false;
            if (attrs.activationKeys == null) attrs.activationKeys = [13,27,32,37,38,39,40];
            
            this.callSuper(parent, attrs);
        },
        
        destroy: function() {
            if (this.selected) this.infiniteOwner.setSelectedRow();
            this.callSuper();
        },
        
        
        // Accessors ///////////////////////////////////////////////////////////
        setSelected: function(v) {
            this.callSuper(v);
            if (this.inited) this.updateUI();
        },
        
        
        // Methods /////////////////////////////////////////////////////////////
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
            const owner = this.infiniteOwner,
                model = this.model;
            switch (key) {
                case 27: // Escape
                    if (this.selected) owner.setSelectedRow();
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

    /** A base class for infinite scrolling lists that support a selectable row.
        
        Attributes:
            selectedRow
            selectedRowModel
        
        @class */
    pkg.SelectableInfiniteList = new JSClass('SelectableInfiniteList', pkg.InfiniteList, {
        // Accessors ///////////////////////////////////////////////////////////
        setSelectedRow: function(row) {
            const existing = this.selectedRow;
            if (row !== existing) {
                if (existing) existing.setSelected(false);
                this.setSelectedRowModel();
                this.set('selectedRow', row, true);
                if (row) {
                    this.setSelectedRowModel(row.model);
                    row.setSelected(true);
                }
            }
        },
        
        setSelectedRowModel: function(v) {
            this.set('selectedRowModel', v, true);
            
            // Scroll the selected row into view
            this.scrollModelIntoView(this.selectedRowModel);
        },
        
        
        // Methods /////////////////////////////////////////////////////////////
        getActiveSelectedRow: function() {
            return this.getActiveRowForModel(this.selectedRowModel);
        },
        
        selectRowForModel: function(model, focus, isNext) {
            if (model) {
                clearSelectedRow(this);
                this.setSelectedRowModel(model);
                this.refreshListUI();
                
                // Focus on the newly selected row
                if (focus) {
                    const row = this.getActiveSelectedRow();
                    if (row) row.focus();
                }
            }
        },
        
        selectNextRowForModel: function(model, focus=true) {
            this.selectRowForModel(this.getNextModel(model), focus, true);
        },
        
        selectPrevRowForModel: function(model, focus=true) {
            this.selectRowForModel(this.getPrevModel(model), focus, false);
        },
        
        /** @overrides */
        resetListUI: function(preserveScroll) {
            if (this.isModelInData(this.selectedRowModel)) {
                // Only clear the selected row since it's still in the data and
                // thus may be shown again.
                clearSelectedRow(this);
            } else {
                // Clear the row and model since the model can no longer be shown.
                this.setSelectedRow();
            }
            
            this.callSuper(preserveScroll);
        },
        
        /** @overrides */
        putRowBackInPool: function(row) {
            if (row.selected) clearSelectedRow(this);
            this.callSuper(row);
        },
        
        /** @overrides */
        refreshListUI: function(ignoredEvent) {
            const currentFocus = pkg.global.focus.focusedView;
            
            this.callSuper();
            
            const row = this.getActiveSelectedRow();
            if (row) {
                this.set('selectedRow', row, true);
                row.setSelected(true);
                if (!currentFocus || currentFocus === row) row.focus(true);
            }
        }
    });
})(myt);

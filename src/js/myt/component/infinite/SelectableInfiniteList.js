/** A base class for infinite scrolling lists that support a selectable row.
    
    Events:
        None
    
    Attributes:
        selectedRow
        selectedRowModel
    
    Private Attributes:
        None
*/
myt.SelectableInfiniteList = new JS.Class('SelectableInfiniteList', myt.InfiniteList, {
    // Accessors ///////////////////////////////////////////////////////////////
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
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** Clears the selectedRow while leaving the selectedRowModel.
        @private */
    _clearSelectedRow: function() {
        const existing = this.selectedRow;
        if (existing) {
            existing.setSelected(false);
            this.set('selectedRow', null, true);
        }
    },
    
    getActiveSelectedRow: function() {
        return this.getActiveRowForModel(this.selectedRowModel);
    },
    
    selectRowForModel: function(model, focus) {
        if (model) {
            this._clearSelectedRow();
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
        this.selectRowForModel(this.getNextModel(model), focus);
    },
    
    selectPrevRowForModel: function(model, focus=true) {
        this.selectRowForModel(this.getPrevModel(model), focus);
    },
    
    /** @overrides */
    resetListUI: function(preserveScroll) {
        const self = this;
        
        if (self.isModelInData(self.selectedRowModel)) {
            // Only clear the selected row since it's still in the data and
            // thus may be shown again.
            self._clearSelectedRow();
        } else {
            // Clear the row and model since the model can no longer be shown.
            self.setSelectedRow();
        }
        
        self.callSuper(preserveScroll);
    },
    
    /** @overrides */
    putRowBackInPool: function(row) {
        if (row.selected) this._clearSelectedRow();
        this.callSuper(row);
    },
    
    /** @overrides */
    doAfterListRefresh: function() {
        const row = this.getActiveSelectedRow();
        if (row) {
            this.set('selectedRow', row, true);
            row.setSelected(true);
        }
        
        this.callSuper();
    }
});

/** Makes a view behave as a row in a grid.
    
    Events:
        None
    
    Attributes:
        gridController:myt.GridConstroller A reference to the grid controller
            that is managing this row.
*/
myt.GridRow = new JS.Module('GridRow', {
    // Life Cycle //////////////////////////////////////////////////////////////
    initNode: function(parent, attrs) {
        // Ensure participation in determinePlacement method of myt.Grid
        if (attrs.placement == null) attrs.placement = '*';
        
        this.callSuper(parent, attrs);
        
        var gc = this.gridController;
        if (gc) gc.notifyAddRow(this);
    },
    
    destroy: function(v) {
        this.setGridController();
        
        this.callSuper(v);
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setGridController: function(v) {
        var existing = this.gridController;
        if (existing !== v) {
            if (existing) existing.notifyRemoveRow(this);
            this.gridController = v;
            if (this.inited && v) v.notifyAddRow(this);
        }
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    notifyColumnHeaderXChange: function(columnHeader) {
        var sv = this[columnHeader.columnId + 'View'];
        if (sv) sv.setX(columnHeader.x + columnHeader.cellXAdj);
    },
    
    notifyColumnHeaderWidthChange: function(columnHeader) {
        var sv = this[columnHeader.columnId + 'View'];
        if (sv) sv.setWidth(columnHeader.width + columnHeader.cellWidthAdj);
    }
});

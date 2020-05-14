((pkg) => {
    const getSubview = (gridRow, columnHeader) => gridRow[columnHeader.columnId + 'View'];
    
    /** Makes a view behave as a row in a grid.
        
        Events:
            None
        
        Attributes:
            gridController:myt.GridConstroller A reference to the grid controller
                that is managing this row.
        
        @class */
    pkg.GridRow = new JS.Module('GridRow', {
        // Life Cycle //////////////////////////////////////////////////////////
        initNode: function(parent, attrs) {
            // Ensure participation in determinePlacement method of myt.Grid
            if (attrs.placement == null) attrs.placement = '*';
            
            this.callSuper(parent, attrs);
            
            const gc = this.gridController;
            if (gc) gc.notifyAddRow(this);
        },
        
        destroy: function(v) {
            this.setGridController();
            this.callSuper(v);
        },
        
        
        // Accessors ///////////////////////////////////////////////////////////
        setGridController: function(v) {
            const existing = this.gridController;
            if (existing !== v) {
                if (existing) existing.notifyRemoveRow(this);
                this.gridController = v;
                if (this.inited && v) v.notifyAddRow(this);
            }
        },
        
        
        // Methods /////////////////////////////////////////////////////////////
        notifyColumnHeaderXChange: function(columnHeader) {
            const sv = getSubview(this, columnHeader);
            if (sv) sv.setX(columnHeader.x + columnHeader.cellXAdj);
        },
        
        notifyColumnHeaderWidthChange: function(columnHeader) {
            const sv = getSubview(this, columnHeader);
            if (sv) sv.setWidth(columnHeader.width + columnHeader.cellWidthAdj);
        },
        
        notifyColumnHeaderVisibilityChange: function(columnHeader) {
            const sv = getSubview(this, columnHeader);
            if (sv) sv.setVisible(columnHeader.visible);
        }
    });
})(myt);

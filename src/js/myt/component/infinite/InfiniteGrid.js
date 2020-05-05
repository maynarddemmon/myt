((pkg) => {
    var JSClass = JS.Class,
        View = pkg.View,
        
        getSubview = (gridRow, columnHeader) => gridRow[columnHeader.columnId + 'View'];
    
    pkg.InfiniteGridRow = new JS.Module('InfiniteGridRow', {
        include: [pkg.InfiniteListRow],
        
        
        // Methods /////////////////////////////////////////////////////////////
        notifyXChange: function(columnHeader) {
            var sv = getSubview(this, columnHeader);
            if (sv) sv.setX(columnHeader.x + columnHeader.cellXAdj);
        },
        
        notifyWidthChange: function(columnHeader) {
            var sv = getSubview(this, columnHeader);
            if (sv) sv.setWidth(columnHeader.width + columnHeader.cellWidthAdj);
        },
        
        notifyVisibilityChange: function(columnHeader) {
            var sv = getSubview(this, columnHeader);
            if (sv) sv.setVisible(columnHeader.visible);
        }
    });
    
    pkg.InfiniteGridHeader = new JSClass('InfiniteGridHeader', View, {
        include: [pkg.GridController],
        
        
        // Life Cycle //////////////////////////////////////////////////////////
        /** @overrides */
        initNode: function(parent, attrs) {
            if (attrs.columnSpacing == null) attrs.columnSpacing = 1;
            
            attrs.overflow = 'hidden';
            
            this.callSuper(parent, attrs);
            
            new pkg.SpacedLayout(this, {spacing:this.columnSpacing});
        },
        
        
        // Accessors ///////////////////////////////////////////////////////////
        setGrid: function(v) {this.grid = v;},
        setColumnSpacing: function(v) {this.columnSpacing = v;},
        
        /** @overrides myt.View */
        setHeight: function(v, supressEvent) {
            this.callSuper(v, supressEvent);
            if (this.inited) {
                v = this.height;
                this.columnHeaders.forEach((hdr) => {hdr.setHeight(v);});
            }
        },
        
        /** @overrides myt.View */
        setWidth: function(v, supressEvent) {
            this.callSuper(Math.max(this.minWidth, v), supressEvent);
            if (this.inited) this.setGridWidth(this.width);
        },
        
        
        // Methods /////////////////////////////////////////////////////////////
        /** @overrides */
        subviewAdded: function(sv) {
            this.callSuper(sv);
            
            if (sv.isA(pkg.GridColumnHeader)) {
                sv.setGridController(this);
                sv.setHeight(this.height);
            }
        },
        
        /** @overrides myt.GridController */
        doSort: function() {
            this.grid.refreshListData(true);
        },
        
        /** @overrides myt.GridController */
        notifyColumnHeaderXChange: function(columnHeader) {
            if (!this.isLocked()) this.grid.notifyXChange(columnHeader);
        },
        
        /** @overrides myt.GridController */
        notifyColumnHeaderWidthChange: function(columnHeader) {
            if (!this.isLocked()) this.grid.notifyWidthChange(columnHeader);
        },
        
        /** @overrides myt.GridController */
        updateRowsForVisibilityChange: function(columnHeader) {
            this.grid.notifyVisibilityChange(columnHeader);
        }
    });
    
    /** A base class for infinite scrolling grids
        
        @class */
    pkg.InfiniteGrid = new JSClass('InfiniteGrid', pkg.InfiniteList, {
        // Accessors ///////////////////////////////////////////////////////////
        setGridHeader: function(v) {
            this.gridHeader = v;
            if (v) v.setGrid(this);
        },
        
        
        // Methods /////////////////////////////////////////////////////////////
        makeReady: function() {
            this.gridHeader.setLocked(false);
            this.refreshListData(false);
        },
        
        /** @overrides myt.InfiniteList */
        getSortFunction: function() {
            var sort = this.gridHeader.sort || ['',''],
                sortColumnId  = sort[0],
                sortOrder = sort[1];
            if (sortColumnId) {
                var sortNum = sortOrder === 'ascending' ? 1 : -1;
                return (a, b) => {
                    var aValue = a[sortColumnId],
                        bValue = b[sortColumnId];
                    if (aValue > bValue) {
                        return sortNum;
                    } else if (bValue > aValue) {
                        return -sortNum;
                    }
                    return 0;
                };
            } else {
                return this.callSuper();
            }
        },
        
        /** @overrides myt.InfiniteList */
        updateRow: function(row) {
            if (this.gridHeader) {
                this.gridHeader.columnHeaders.forEach((hdr) => {
                    row.notifyXChange(hdr);
                    row.notifyWidthChange(hdr);
                    row.notifyVisibilityChange(hdr);
                });
            }
        },
        
        notifyXChange: function(columnHeader) {
            this.getVisibleRows().forEach((row) => {row.notifyXChange(columnHeader);});
        },
        
        notifyWidthChange: function(columnHeader) {
            this.getVisibleRows().forEach((row) => {row.notifyWidthChange(columnHeader);});
        },
        
        notifyVisibilityChange: function(columnHeader) {
            this.getVisibleRows().forEach((row) => {row.notifyVisibilityChange(columnHeader);});
        }
    });
})(myt);

((pkg) => {
    const JSClass = JS.Class,
        JSModule = JS.Module,
        View = pkg.View,
        
        getSubview = (gridRow, columnHeader) => gridRow[columnHeader.columnId + 'View'],
        
        InfiniteGridRowMixin = new JSModule('InfiniteGridRowMixin', {
            // Methods /////////////////////////////////////////////////////////
            notifyXChange: function(columnHeader) {
                const sv = getSubview(this, columnHeader);
                if (sv) sv.setX(columnHeader.x + columnHeader.cellXAdj);
            },
            
            notifyWidthChange: function(columnHeader) {
                const sv = getSubview(this, columnHeader);
                if (sv) sv.setWidth(columnHeader.width + columnHeader.cellWidthAdj);
            },
            
            notifyVisibilityChange: function(columnHeader) {
                const sv = getSubview(this, columnHeader);
                if (sv) sv.setVisible(columnHeader.visible);
            }
        }),
        
        InfiniteGridMixin = new JSModule('InfiniteGridMixin', {
            // Accessors ///////////////////////////////////////////////////////
            setGridHeader: function(v) {
                this.gridHeader = v;
                if (v) v.setGrid(this);
            },
            
            
            // Methods /////////////////////////////////////////////////////////
            makeReady: function(sortState, forceFullReset) {
                const gridHeader = this.gridHeader;
                if (gridHeader) {
                    this.__forceFullResetOnNextRefresh = forceFullReset;
                    gridHeader.setSort(sortState);
                    gridHeader.setLocked(false);
                } else {
                    this.refreshListData(false, forceFullReset);
                }
            },
            
            /** @overrides myt.InfiniteList */
            getSortFunction: function() {
                const sort = this.gridHeader.sort || ['',''],
                    sortColumnId  = sort[0],
                    sortOrder = sort[1];
                if (sortColumnId) {
                    const sortNum = sortOrder === 'ascending' ? 1 : -1;
                    return (a, b) => {
                        const aValue = a[sortColumnId],
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
    
    pkg.InfiniteGridRow = new JSModule('InfiniteGridRow', {
        include: [pkg.InfiniteListRow, InfiniteGridRowMixin]
    });
    
    pkg.SelectableInfiniteGridRow = new JSModule('SelectableInfiniteGridRow', {
        include: [pkg.SelectableInfiniteListRow, InfiniteGridRowMixin]
    });
    
    pkg.SimpleSelectableInfiniteGridRow = new JSClass('SimpleSelectableInfiniteGridRow', pkg.SimpleSelectableInfiniteListRow, {
        include: [InfiniteGridRowMixin]
    });
    
    /** A base class for infinite scrolling grids
        
        @class */
    pkg.InfiniteGrid = new JSClass('InfiniteGrid', pkg.InfiniteList, {
        include: [InfiniteGridMixin]
    });
    
    /** A base class for selectable infinite scrolling grids
        
        @class */
    pkg.SelectableInfiniteGrid = new JSClass('InfiniteGrid', pkg.SelectableInfiniteList, {
        include: [InfiniteGridMixin]
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
            const self = this;
            self.callSuper(Math.max(self.minWidth, v), supressEvent);
            if (self.inited) {
                const width = self.width;
                self.setGridWidth(width);
                self.grid.setWidth(width);
            }
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
            this.grid.refreshListData(true, this.grid.__forceFullResetOnNextRefresh);
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
})(myt);

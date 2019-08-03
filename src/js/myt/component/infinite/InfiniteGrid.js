/** A base class for infinite scrolling grids
    
    Events:
        None
    
    Attributes:
        selectedRow
        selectedRowModel
        controller
        collectionModel
        rowClass
        hideGridHeader:boolean
    
    Private Attributes:
        _listData:array The data for the rows in the grid.
        _listScrollY:int The current scroll offset of the grid
        _startIdx:int The index into the data of the first row shown
        _endIdx:int The index into the data of the last row shown
        _visibleRowsByIdx:object A cache of what rows are currently shown by
            the index of the data for the row. This is provides faster
            performance when refreshing the grid.
        _gridListContainer:myt.View The view that contains the listView. This 
            view allows scrolling of the list. This is where _listScrollY 
            comes from.
        _gridListView:myt.View The view that contains the rows in the grid.
        _gridPool:myt.TrackActivesPool The pool for grid row views.
*/
myt.InfiniteGrid = new JS.Class('InfiniteGrid', myt.View, {
    // Class Methods and Attributes ////////////////////////////////////////////
    extend: {
        SPACING:1,
        ROW_HEIGHT:30,
        ROW_EXTENT:31, // ROW_HEIGHT + SPACING
        
        LIST_BG_COLOR:'#cccccc',
    },
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    initNode: function(parent, attrs) {
        var self = this,
            M = myt,
            IG = M.InfiniteGrid,
            V = M.View,
            rowClass = attrs.rowClass,
            hideGridHeader = attrs.hideGridHeader;
        delete attrs.rowClass;
        delete attrs.hideGridHeader;
        
        if (attrs.focusable == null) attrs.focusable = true;
        if (attrs.focusEmbellishment == null) attrs.focusEmbellishment = false;
        
        self._listScrollY = self._startIdx = self._endIdx = 0;
        
        self.callSuper(parent, attrs);
        
        //// Build UI
        var gridHeader = self.controller = new V(self, {
            height:IG.ROW_HEIGHT, gridWidth:self.width,
            visible:!hideGridHeader
        }, [M.GridController, {
            /** Eliminates the sort side effect of the standard implementation
                in GridController.
                @overrides */
            notifyAddRow: function(row) {
                if (!this.hasRow(row)) {
                    this.rows.push(row);
                    
                    // Update cell positions
                    if (!this.locked) {
                        var hdrs = this.columnHeaders,
                            i = hdrs.length,
                            hdr;
                        while (i) {
                            hdr = hdrs[--i];
                            row.notifyColumnHeaderXChange(hdr);
                            row.notifyColumnHeaderWidthChange(hdr);
                            row.notifyColumnHeaderVisibilityChange(hdr);
                        }
                        
                        // Eliminates sort that would normally happen here.
                    }
                }
            },
            
            /** @overrides */
            doSort: function() {
                if (this.sort) self.refreshGridData();
            },
            
            /** @overrides */
            setWidth: function(v, supressEvent) {
                this.callSuper(v, supressEvent);
                
                if (listContainer && listView) {
                    listContainer.setWidth(v);
                    listView.setWidth(v);
                    listView.getSubviews().forEach(sv => {sv.setWidth(v);});
                }
            }
        }]);
        gridHeader.grid = self; // Allows SelectableGridRow to access functions of the grid.
        new M.SpacedLayout(gridHeader, {collapseParent:true, spacing:IG.SPACING});
        self.buildGridHeaders(gridHeader);
        
        // List
        var listContainer = self._gridListContainer = new V(self, {
            bgColor:IG.LIST_BG_COLOR, overflow:'autoy', layoutHint:1
        });
        listContainer.getInnerDomStyle().overscrollBehavior = 'contain';
        
        var listView = self._gridListView = new V(listContainer);
        
        new M.ResizeLayout(self, {axis:'y', spacing:IG.SPACING});
        
        gridHeader.setLocked(false);
        gridHeader.setWidth(gridHeader.width);
        
        self.attachTo(listContainer, '_refreshGridUI', 'height');
        self.attachToDom(listContainer, '_handleScrollChange', 'scroll');
        
        self._gridPool = new M.TrackActivesPool(rowClass, listView);
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setCollectionModel: function(v) {this.collectionModel = v;},
    
    setWidth: function(v, supressEvent) {
        if (v > 0) {
            var self = this;
            self.callSuper(v, supressEvent);
            if (self.inited) {
                var w = self.width;
                self.controller.setGridWidth(w);
                self._gridListContainer.setWidth(w);
                self._gridListView.setWidth(w);
            }
        }
    },
    
    setSelectedRow: function(v) {
        var existing = this.selectedRow;
        if (v !== existing) {
            if (existing) existing.setSelected(false);
            this.setSelectedRowModel();
            this.set('selectedRow', v, true);
            if (v) {
                this.setSelectedRowModel(v.model);
                v.setSelected(true);
            }
        }
    },
    
    /** Clears the selectedRow while leaving the selectedRowModel. */
    clearSelectedRow: function() {
        var existing = this.selectedRow;
        if (existing) {
            existing.setSelected(false);
            this.set('selectedRow', null, true);
        }
    },
    
    /** Sets the selectedRow without updating the selectedRowModel. */
    restoreSelectedRow: function(row, model) {
        if (model === this.selectedRowModel) {
            this.set('selectedRow', row, true);
            row.setSelected(true);
        }
    },
    
    setSelectedRowModel: function(v) {
        this.set('selectedRowModel', v, true);
        this.doSelectedModel(this.selectedRowModel);
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    isScrolledToEnd: function() {
        var container = this._gridListContainer;
        return container.getInnerDomElement().scrollTop + container.height === this._gridListView.height;
    },
    
    buildGridHeaders: function(gridHeader) {},
    
    buildSortFunction: function(sortOrder) {
        if (sortOrder) {
            // FIXME
        } else {
            // Default to a numeric sort on the IDs
            return (a, b) => a.id - b.id;
        }
    },
    
    doSelectedModel: function(model) {
        // Scroll the selected row into view
        this.scrollModelIntoView(model);
    },
    
    scrollModelIntoView: function(model) {
        var self = this,
            idx = self._getIndexOfModelInData(model),
            rowExtent = myt.InfiniteGrid.ROW_EXTENT,
            gridListContainer = self._gridListContainer,
            de = gridListContainer.getInnerDomElement(),
            viewportTop,
            viewportBottom,
            rowTop,
            rowBottom;
        if (idx >= 0) {
            viewportTop = de.scrollTop;
            viewportBottom = viewportTop + gridListContainer.height;
            rowTop = idx * rowExtent;
            rowBottom = rowTop + rowExtent;
            
            // Only scroll if not overlapping visible part of grid container.
            if (rowBottom <= viewportTop || rowTop >= viewportBottom) de.scrollTop = rowTop;
        }
    },
    
    isModelInData: function(model) {
        return this._getIndexOfModelInData(model) !== -1;
    },
    
    /** @private */
    _getIndexOfModelInData: function(model) {
        if (model) {
            var self = this,
                modelId = model.id,
                data = self._listData,
                i = data.length;
                while (i) if (data[--i].id === modelId) return i;
        }
        return -1;
    },
    
    /** @private */
    _handleScrollChange: function(event) {
        this._listScrollY = this._gridListContainer.getInnerDomElement().scrollTop;
        this._refreshGridUI();
    },
    
    refreshGridData: function(preserveScroll) {
        this._listData = this.fetchGridData();
        this.resetGridUI(preserveScroll);
    },
    
    fetchGridData: function() {
        return this.collectionModel.getAsSortedList(this.buildSortFunction(this.controller.sort));
    },
    
    resetGridUI: function(preserveScroll) {
        var self = this,
            IG = myt.InfiniteGrid,
            data = self._listData,
            len = data.length;
        
        // Resize the listView to the height to accomodate all rows
        self._gridListView.setHeight(len * IG.ROW_EXTENT - (len > 0 ? IG.SPACING : 0));
        
        if (self.isModelInData(self.selectedRowModel)) {
            // Only clear the selected row since it's still in the data and
            // thus may be shown again.
            self.clearSelectedRow();
        } else {
            // Clear the row and model since the model can no longer be shown.
            self.setSelectedRow();
        }
        
        // Clear out existing rows
        self._gridPool.putActives();
        self._startIdx = self._endIdx = 0;
        self._visibleRowsByIdx = {};
        
        // Reset scroll position
        if (preserveScroll) {
            // Just refresh since we won't move the scroll position
            self._refreshGridUI();
        } else {
            if (self._listScrollY !== 0) {
                // Updating the scroll position triggers a _refreshGridUI via _handleScrollChange
                self._gridListContainer.getInnerDomElement().scrollTop = 0;
            } else {
                self._refreshGridUI();
            }
        }
    },
    
    /** @private */
    _refreshGridUI: function() {
        var self = this,
            rowExtent = myt.InfiniteGrid.ROW_EXTENT,
            startIdx,
            endIdx,
            scrollY = self._listScrollY,
            listContainerHeight = self._gridListContainer.height,
            data = self._listData || [],
            visibleRowsByIdx = self._visibleRowsByIdx,
            pool = self._gridPool,
            row,
            gridController = self.controller,
            rowWidth = self.width,
            i,
            model;
        
        startIdx = Math.max(0, Math.floor(scrollY / rowExtent));
        endIdx = Math.min(data.length, Math.ceil((scrollY + listContainerHeight) / rowExtent));
        
        if (self._startIdx !== startIdx || self._endIdx !== endIdx) {
            self._startIdx = startIdx;
            self._endIdx = endIdx;
            
            // Put all visible rows that are not within the idx range back 
            // into the pool
            for (i in visibleRowsByIdx) {
                if (i < startIdx || i >= endIdx) {
                    pool.putInstance(visibleRowsByIdx[i]);
                    delete visibleRowsByIdx[i];
                }
            }
            
            for (i = startIdx; i < endIdx; i++) {
                row = visibleRowsByIdx[i];
                if (!row) {
                    model = data[i];
                    
                    row = pool.getInstance();
                    row.setWidth(rowWidth);
                    row.setY(i * rowExtent);
                    row.setModel(model);
                    row.setInfiniteGridOwner(self);
                    row.setVisible(true);
                    
                    // Restore Selection
                    self.restoreSelectedRow(row, model);
                    
                    visibleRowsByIdx[i] = row;
                }
                
                // Maintain tab ordering by updating the underlying dom order.
                row.bringToFront();
            }
        }
        
        self.doAfterGridRefresh();
    },
    
    doAfterGridRefresh: function() {}
});

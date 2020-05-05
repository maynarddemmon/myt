/** A base class for infinite scrolling lists
    
    Events:
        None
    
    Attributes:
        collectionModel
        rowClass
        modelIDName
        numericSort
        ascendingSort
        rowHeight
        rowInset
        rowOutset
        rowSpacing
    
    Private Attributes:
        _listData:array The data for the rows in the list.
        _startIdx:int The index into the data of the first row shown
        _endIdx:int The index into the data of the last row shown
        _visibleRowsByIdx:object A cache of what rows are currently shown by
            the index of the data for the row. This is provides faster
            performance when refreshing the list.
        _listView:myt.View The view that contains the rows in the list.
        _itemPool:myt.TrackActivesPool The pool for row views.
*/
myt.InfiniteList = new JS.Class('InfiniteList', myt.View, {
    // Class Methods and Attributes ////////////////////////////////////////////
    extend: {
        DEFAULT_ROW_SPACING:1,
        DEFAULT_ROW_HEIGHT:30,
        DEFAULT_ROW_INSET:0,
        DEFAULT_ROW_OUTSET:0,
        DEFAULT_BG_COLOR:'#cccccc',
    },
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    initNode: function(parent, attrs) {
        var self = this,
            M = myt,
            IL = M.InfiniteList,
            rowClass = attrs.rowClass;
        delete attrs.rowClass;
        
        if (attrs.modelIDName == null) attrs.modelIDName = 'id';
        if (attrs.numericSort == null) attrs.numericSort = true;
        if (attrs.ascendingSort == null) attrs.ascendingSort = true;
        if (attrs.overflow == null) attrs.overflow = 'autoy';
        
        if (attrs.bgColor == null) attrs.bgColor = IL.DEFAULT_BG_COLOR;
        if (attrs.rowSpacing == null) attrs.rowSpacing = IL.DEFAULT_ROW_SPACING;
        if (attrs.rowInset == null) attrs.rowInset = IL.DEFAULT_ROW_INSET;
        if (attrs.rowOutset == null) attrs.rowOutset = IL.DEFAULT_ROW_OUTSET;
        if (attrs.rowHeight == null) attrs.rowHeight = IL.DEFAULT_ROW_HEIGHT;
        
        if (attrs.overscrollBehavior == null) attrs.overscrollBehavior = 'auto contain';
        
        self._rowExtent = self.rowSpacing = self.rowHeight = 
            self._startIdx = self._endIdx = 0;
        
        self.callSuper(parent, attrs);
        
        // Build UI
        var listView = self._listView = new M.View(self);
        self._scrollAnchorView = new M.View(listView, {width:1, height:1, bgColor:'transparent'});
        self._itemPool = new M.TrackActivesPool(rowClass, listView);
        
        self.attachTo(self, 'refreshListUI', 'height');
        self.attachToDom(self, '_handleScrollChange', 'scroll');
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setOverscrollBehavior: function(v) {
        this.overscrollBehavior = v;
        this.getInnerDomStyle().overscrollBehavior = v;
    },
    
    setCollectionModel: function(v) {this.collectionModel = v;},
    setModelIDName: function(v) {this.modelIDName = v;},
    setRowSpacing: function(v) {
        this.rowSpacing = v;
        this._updateRowExtent();
    },
    setRowHeight: function(v) {
        this.rowHeight = v;
        this._updateRowExtent();
    },
    
    getListData: function() {return this._listData;},
    
    /** @private */
    _updateRowExtent: function() {
        this._rowExtent = this.rowSpacing + this.rowHeight;
    },
    
    setWidth: function(v, supressEvent) {
        if (v > 0) {
            this.callSuper(v, supressEvent);
            if (this.inited) {
                var listView = this._listView,
                    w = this.width;
                listView.setWidth(w);
                listView.getSubviews().forEach(sv => {sv.setWidth(w);});
            }
        }
    },
    
    getVisibleRows: function() {
        return Object.values(this._visibleRowsByIdx || {});
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** @private
        @returns {number} */
    _getDomScrollTop: function() {
        return this.getInnerDomElement().scrollTop;
    },
    
    /** @private
        @param {number} v
        @returns {undefined} */
    _setDomScrollTop: function(v) {
        this.getInnerDomElement().scrollTop = v;
    },
    
    /** @returns {undefined} */
    isScrolledToEnd: function() {
        return this._getDomScrollTop() + this.height === this._listView.height;
    },
    
    getSortFunction: function() {
        // Default to a numeric sort on the IDs
        var modelIDName = this.modelIDName,
            asc = this.ascendingSort ? 1 : -1;
        if (this.numericSort) {
            return (a, b) => (a[modelIDName] - b[modelIDName]) * asc;
        } else {
            return (a, b) => {
                a = a[modelIDName];
                b = b[modelIDName];
                return (a > b ? 1 : (a < b ? -1 : 0)) * asc;
            };
        }
    },
    
    getFilterFunction: function() {
        // Unimplemented which means don't filter anything out.
    },
    
    scrollModelIntoView: function(model) {
        var self = this,
            idx = self.getIndexOfModelInData(model),
            rowExtent = self._rowExtent,
            viewportTop,
            viewportBottom,
            rowTop,
            rowBottom;
        if (idx >= 0) {
            viewportTop = self._getDomScrollTop();
            viewportBottom = viewportTop + self.height;
            rowTop = self.rowInset + idx * rowExtent;
            rowBottom = rowTop + rowExtent;
            
            // Only scroll if not overlapping visible area.
            if (rowTop <= viewportTop) {
                self._setDomScrollTop(rowTop);
                return true;
            } else if (rowBottom >= viewportBottom) {
                self._setDomScrollTop(rowBottom - self.height);
                return true;
            }
        }
        
        return false;
    },
    
    isModelInData: function(model) {
        return this.getIndexOfModelInData(model) !== -1;
    },
    
    getNextModel: function(model, wrap=true, alwaysReturnAModel=true) {
        var data = this.getListData(),
            len = data.length,
            idx = this.getIndexOfModelInData(model);
        if (idx >= 0) {
            idx += 1;
            if (idx >= len) {
                return wrap ? data[0] : data[len - 1];
            } else {
                return data[idx];
            }
        } else {
            // Return last model for no result if so indicated
            if (alwaysReturnAModel && len > 0) return data[len - 1];
        }
    },
    
    getPrevModel: function(model, wrap=true, alwaysReturnAModel=true) {
        var data = this.getListData(),
            len = data.length,
            idx = this.getIndexOfModelInData(model);
        if (idx >= 0) {
            idx -= 1;
            if (idx < 0) {
                return wrap ? data[len - 1] : data[0];
            } else {
                return data[idx];
            }
        } else {
            // Return first model for no result if so indicated
            if (alwaysReturnAModel && len > 0) return data[0];
        }
    },
    
    getIndexOfModelInData: function(model) {
        if (model) {
            var self = this,
                modelIDName = self.modelIDName,
                modelId = model[modelIDName],
                data = self.getListData(),
                i = data.length;
            while (i) if (data[--i][modelIDName] === modelId) return i;
        }
        return -1;
    },
    
    getActiveRowForModel: function(model) {
        var activeRows = this._itemPool.getActives(),
            i = activeRows.length,
            row;
        while (i) {
            row = activeRows[--i];
            if (row.model === model) return row;
        }
    },
    
    /** @private
        @param {!Object} event
        @returns {undefined} */
    _handleScrollChange: function(event) {
        this.refreshListUI();
    },
    
    refreshListData: function(preserveScroll) {
        this._listData = this.fetchListData();
        this.resetListUI(preserveScroll);
    },
    
    fetchListData: function() {
        return this.collectionModel.getAsSortedList(this.getSortFunction(), this.getFilterFunction());
    },
    
    resetListUI: function(preserveScroll) {
        var self = this,
            data = self.getListData(),
            len = data.length,
            i,
            visibleRowsByIdx = self._visibleRowsByIdx,
            pool = self._itemPool,
            listView = self._listView,
            scrollAnchorView = self._scrollAnchorView;
        
        // Resize the listView to the height to accomodate all rows
        listView.setHeight(len * self._rowExtent - (len > 0 ? self.rowSpacing : 0) + self.rowInset + self.rowOutset);
        scrollAnchorView.setY(listView.height - scrollAnchorView.height);
        
        // Clear out existing rows
        self._startIdx = self._endIdx = 0;
        for (i in visibleRowsByIdx) self.putRowBackInPool(visibleRowsByIdx[i]);
        self._visibleRowsByIdx = {};
        
        // Reset scroll position
        if (preserveScroll || self._getDomScrollTop() === 0) {
            // Just refresh since we won't move the scroll position
            self.refreshListUI();
        } else {
            // Updating the scroll position triggers a refreshListUI 
            // via _handleScrollChange
            self._setDomScrollTop(0);
        }
    },
    
    putRowBackInPool: function(row) {
        row.setVisible(false);
        this._itemPool.putInstance(row);
    },
    
    refreshListUI: function() {
        var self = this,
            startIdx,
            endIdx,
            scrollY = self._getDomScrollTop(),
            data = self.getListData() || [],
            visibleRowsByIdx = self._visibleRowsByIdx,
            pool = self._itemPool,
            row,
            rowWidth = self.width,
            rowHeight = self.rowHeight,
            rowExtent = self._rowExtent,
            rowInset = self.rowInset,
            i;
        
        startIdx = Math.max(0, Math.floor((scrollY - rowInset) / rowExtent));
        endIdx = Math.min(data.length, Math.ceil((scrollY - rowInset + self.height) / rowExtent));
        
        if (self._startIdx !== startIdx || self._endIdx !== endIdx) {
            self._startIdx = startIdx;
            self._endIdx = endIdx;
            
            // Put all visible rows that are not within the idx range back 
            // into the pool
            for (i in visibleRowsByIdx) {
                if (i < startIdx || i >= endIdx) {
                    self.putRowBackInPool(visibleRowsByIdx[i]);
                    delete visibleRowsByIdx[i];
                }
            }
            
            for (i = startIdx; i < endIdx; i++) {
                row = visibleRowsByIdx[i];
                
                if (!row) {
                    row = pool.getInstance();
                    
                    row.setWidth(rowWidth);
                    row.setHeight(rowHeight);
                    row.setY(rowInset + i * rowExtent);
                    row.setModel(data[i]);
                    row.setInfiniteOwner(self);
                    row.setVisible(true);
                    
                    visibleRowsByIdx[i] = row;
                    
                    self.updateRow(row);
                }
                
                // Maintain tab ordering by updating the underlying dom order.
                row.bringToFront();
            }
        }
        
        self.doAfterListRefresh();
    },
    
    updateRow: (row) => {},
    
    doAfterListRefresh: () => {}
});

((pkg) => {
    const View = pkg.View,
        DEFAULT_ROW_SPACING = 1,
        DEFAULT_ROW_HEIGHT = 30,
        DEFAULT_ROW_INSET = 0,
        DEFAULT_ROW_OUTSET = 0,
        DEFAULT_BG_COLOR = '#cccccc',
        
        DEFAULT_CLASS_KEY = 'default',
        
        updateRowExtent = (infiniteList) => {
            infiniteList._rowExtent = infiniteList.rowSpacing + infiniteList.rowHeight;
        },
        
        getDomScrollTop = (infiniteList) => infiniteList.getInnerDomElement().scrollTop,
        
        setDomScrollTop = (infiniteList, v) => {
            infiniteList.scrollYTo(v, true);
        };
        
    /** A mixin for rows in infinite scrolling lists
        
        Attributes:
            infiniteOwner
            model
        
        @class */
    pkg.InfiniteListRow = new JS.Module('InfiniteListRow', {
        include: [pkg.Reusable],
        
        
        // Accessors ///////////////////////////////////////////////////////////
        setInfiniteOwner: function(v) {
            this.infiniteOwner = v;
        },
        
        setModel: function(model) {
            this.model = model;
        }
    });
    
    /** A base class for infinite scrolling lists
        
        Attributes:
            collectionModel
            rowClasses
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
        
        @class */
    pkg.InfiniteList = new JS.Class('InfiniteList', View, {
        // Life Cycle //////////////////////////////////////////////////////////
        initNode: function(parent, attrs) {
            const self = this;
            let rowClasses = attrs.rowClasses;
            delete attrs.rowClasses;
            
            if (typeof rowClasses === 'function') {
                const defaultClassObj = {};
                defaultClassObj[DEFAULT_CLASS_KEY] = rowClasses;
                rowClasses = defaultClassObj;
            }
            
            if (attrs.modelIDName == null) attrs.modelIDName = 'id';
            if (attrs.numericSort == null) attrs.numericSort = true;
            if (attrs.ascendingSort == null) attrs.ascendingSort = true;
            if (attrs.overflow == null) attrs.overflow = 'autoy';
            
            if (attrs.bgColor == null) attrs.bgColor = DEFAULT_BG_COLOR;
            if (attrs.rowSpacing == null) attrs.rowSpacing = DEFAULT_ROW_SPACING;
            if (attrs.rowInset == null) attrs.rowInset = DEFAULT_ROW_INSET;
            if (attrs.rowOutset == null) attrs.rowOutset = DEFAULT_ROW_OUTSET;
            if (attrs.rowHeight == null) attrs.rowHeight = DEFAULT_ROW_HEIGHT;
            
            if (attrs.overscrollBehavior == null) attrs.overscrollBehavior = 'auto contain';
            
            self._rowExtent = self.rowSpacing = self.rowHeight = 
                self._startIdx = self._endIdx = 0;
            
            self.callSuper(parent, attrs);
            
            // Build UI
            const listView = self._listView = new View(self);
            self._scrollAnchorView = new View(listView, {width:1, height:1, bgColor:'transparent'});
            self._itemPool = self.makePool(rowClasses, listView);
            
            self.attachTo(self, 'refreshListUI', 'height');
            self.attachToDom(self, 'refreshListUI', 'scroll');
        },
        
        makePool: (rowClasses, listView) => new pkg.TrackActivesMultiPool(rowClasses, listView),
        
        
        // Accessors ///////////////////////////////////////////////////////////
        setOverscrollBehavior: function(v) {
            this.overscrollBehavior = v;
            this.getInnerDomStyle().overscrollBehavior = v;
        },
        
        setCollectionModel: function(v) {this.collectionModel = v;},
        setModelIDName: function(v) {this.modelIDName = v;},
        setRowSpacing: function(v) {
            this.rowSpacing = v;
            updateRowExtent(this);
        },
        setRowHeight: function(v) {
            this.rowHeight = v;
            updateRowExtent(this);
        },
        
        getListData: function() {return this._listData;},
        
        setWidth: function(v, supressEvent) {
            if (v > 0) {
                this.callSuper(v, supressEvent);
                if (this.inited) {
                    const listView = this._listView,
                        w = this.width;
                    listView.setWidth(w);
                    listView.getSubviews().forEach(sv => {sv.setWidth(w);});
                }
            }
        },
        
        getVisibleRows: function() {
            return Object.values(this._visibleRowsByIdx || {});
        },
        
        
        // Methods /////////////////////////////////////////////////////////////
        /** @returns {undefined} */
        isScrolledToEnd: function() {
            return getDomScrollTop(this) + this.height === this._listView.height;
        },
        
        getSortFunction: function() {
            // Default to a numeric sort on the IDs
            const modelIDName = this.modelIDName,
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
            const self = this,
                idx = self.getIndexOfModelInData(model);
            if (idx >= 0) {
                const rowExtent = self._rowExtent,
                    viewportTop = getDomScrollTop(self),
                    viewportBottom = viewportTop + self.height,
                    rowTop = self.rowInset + idx * rowExtent,
                    rowBottom = rowTop + rowExtent;
                
                // Only scroll if not overlapping visible area.
                if (rowTop <= viewportTop) {
                    setDomScrollTop(self, rowTop);
                    return true;
                } else if (rowBottom >= viewportBottom) {
                    setDomScrollTop(self, rowBottom - self.height);
                    return true;
                }
            }
            
            return false;
        },
        
        isModelInData: function(model) {
            return this.getIndexOfModelInData(model) !== -1;
        },
        
        getNextModel: function(model, wrap=true, alwaysReturnAModel=true) {
            const data = this.getListData(),
                len = data.length;
            let idx = this.getIndexOfModelInData(model);
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
            const data = this.getListData(),
                len = data.length;
            let idx = this.getIndexOfModelInData(model);
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
                const self = this,
                    modelIDName = self.modelIDName,
                    modelId = model[modelIDName],
                    data = self.getListData();
                let i = data.length;
                while (i) if (data[--i][modelIDName] === modelId) return i;
            }
            return -1;
        },
        
        getActiveRowForModel: function(model) {
            const activeRows = this._itemPool.getActives();
            let i = activeRows.length;
            while (i) {
                const row = activeRows[--i];
                if (row.model === model) return row;
            }
        },
        
        refreshListData: function(preserveScroll) {
            this._listData = this.fetchListData();
            this.resetListUI(preserveScroll);
        },
        
        fetchListData: function() {
            return this.collectionModel.getAsSortedList(this.getSortFunction(), this.getFilterFunction());
        },
        
        resetListUI: function(preserveScroll) {
            const self = this,
                data = self.getListData(),
                len = data.length,
                visibleRowsByIdx = self._visibleRowsByIdx,
                listView = self._listView,
                scrollAnchorView = self._scrollAnchorView;
            
            // Resize the listView to the height to accomodate all rows
            listView.setHeight(len * self._rowExtent - (len > 0 ? self.rowSpacing : 0) + self.rowInset + self.rowOutset);
            scrollAnchorView.setY(listView.height - scrollAnchorView.height);
            
            // Clear out existing rows
            self._startIdx = self._endIdx = 0;
            for (let i in visibleRowsByIdx) self.putRowBackInPool(visibleRowsByIdx[i]);
            self._visibleRowsByIdx = {};
            
            // Reset scroll position
            if (preserveScroll || getDomScrollTop(self) === 0) {
                // Just refresh since we won't move the scroll position
                self.refreshListUI();
            } else {
                // Updating the scroll position triggers a refreshListUI 
                // via the DOM scroll event
                setDomScrollTop(self, 0);
            }
        },
        
        putRowBackInPool: function(row) {
            row.setVisible(false);
            this._itemPool.putInstance(row);
        },
        
        refreshListUI: function(ignoredEvent) {
            const self = this,
                rowWidth = self.width,
                rowHeight = self.rowHeight,
                rowExtent = self._rowExtent,
                rowInset = self.rowInset,
                scrollY = getDomScrollTop(self),
                data = self.getListData() || [],
                visibleRowsByIdx = self._visibleRowsByIdx,
                startIdx = Math.max(0, Math.floor((scrollY - rowInset) / rowExtent)),
                endIdx = Math.min(data.length, Math.ceil((scrollY - rowInset + self.height) / rowExtent));
            
            if (self._startIdx !== startIdx || self._endIdx !== endIdx) {
                self._startIdx = startIdx;
                self._endIdx = endIdx;
                
                // Put all visible rows that are not within the idx range back 
                // into the pool
                let i;
                for (i in visibleRowsByIdx) {
                    if (i < startIdx || i >= endIdx) {
                        self.putRowBackInPool(visibleRowsByIdx[i]);
                        delete visibleRowsByIdx[i];
                    }
                }
                
                for (i = startIdx; i < endIdx; i++) {
                    let row = visibleRowsByIdx[i];
                    
                    if (!row) {
                        const model = data[i];
                        row = self._itemPool.getInstance(self.getClassKey(model));
                        
                        row.setWidth(rowWidth);
                        row.setHeight(rowHeight);
                        row.setY(rowInset + i * rowExtent);
                        row.setModel(model);
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
        
        getClassKey: (model) => DEFAULT_CLASS_KEY,
        
        updateRow: (row) => {},
        
        doAfterListRefresh: () => {}
    });
})(myt);

(pkg => {
    const JSClass = JS.Class,
        JSModule = JS.Module,
        
        math = Math,
        mathMax = math.max,
        
        View = pkg.View,
        GlobalFocus = pkg.global.focus,
        
        defAttr = pkg.AccessorSupport.defAttr,
        
        DEFAULT_CLASS_KEY = 'default',
        
        /*  Clears the selectedRow while leaving the selectedRowModel. */
        clearSelectedRow = selectableInfiniteList => {
            const existing = selectableInfiniteList.selectedRow;
            if (existing) {
                existing.setSelected(false);
                selectableInfiniteList.set('selectedRow', null, true);
            }
        },
        
        updateRowExtent = infiniteList => {
            infiniteList._rowExtent = infiniteList.rowSpacing + infiniteList.rowHeight;
        },
        
        getDomScrollTop = infiniteList => infiniteList.getIDE().scrollTop,
        
        setDomScrollTop = (infiniteList, v) => {
            infiniteList.scrollYTo(v, true);
        },
        
        getSubview = (gridRow, columnHeader) => gridRow[columnHeader.columnId + 'View'],
        
        /** A mixin for rows in infinite scrolling lists
            
            Attributes:
                infiniteOwner
                model
                classKey
            
            @class */
        InfiniteListRow = pkg.InfiniteListRow = new JSModule('InfiniteListRow', {
            include: [pkg.Reusable],
            
            
            // Accessors ///////////////////////////////////////////////////////
            setInfiniteOwner: function(v) {
                this.infiniteOwner = v;
            },
            
            setModel: function(model) {
                this.model = model;
            },
            
            setClassKey: function(classKey) {
                this.classKey = classKey;
            },
            
            
            // Methods /////////////////////////////////////////////////////////
            notifyRefreshed: () => {/* Subclasses to implement as needed. */}
        }),
        
        /** A mixin for rows in infinite scrolling lists
            
            @class */
        SelectableInfiniteListRow = pkg.SelectableInfiniteListRow = new JSModule('SelectableInfiniteListRow', {
            include: [InfiniteListRow, pkg.Selectable]
        }),
        
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
                _visibleRowsByIdx:object A cache of what rows are currently 
                    shown by the index of the data for the row. This is 
                    provides faster performance when refreshing the list.
                _listView:myt.View The view that contains the rows in the list.
                _itemPool:myt.TrackActivesPool The pool for row views.
            
            @class */
        InfiniteList = pkg.InfiniteList = new JSClass('InfiniteList', View, {
            // Life Cycle //////////////////////////////////////////////////////
            initNode: function(parent, attrs) {
                const self = this;
                let rowClasses = attrs.rowClasses;
                delete attrs.rowClasses;
                
                if (typeof rowClasses === 'function') {
                    const defaultClassObj = {};
                    defaultClassObj[DEFAULT_CLASS_KEY] = rowClasses;
                    rowClasses = defaultClassObj;
                }
                
                defAttr(attrs, 'modelIDName', 'id');
                defAttr(attrs, 'numericSort', true);
                defAttr(attrs, 'ascendingSort', true);
                defAttr(attrs, 'overflow', 'autoy');
                defAttr(attrs, 'bgColor', '#ccc');
                defAttr(attrs, 'rowSpacing', 1);
                defAttr(attrs, 'rowInset', 0);
                defAttr(attrs, 'rowOutset', 0);
                defAttr(attrs, 'rowHeight', 30);
                defAttr(attrs, 'overscrollBehavior', 'auto contain');
                
                self._rowExtent = self.rowSpacing = self.rowHeight = 0;
                self._startIdx = self._endIdx = -1;
                self._visibleRowsByIdx = {};
                
                self.callSuper(parent, attrs);
                
                // Build UI
                const listView = self._listView = new View(self);
                self._scrollAnchorView = new View(listView, {width:1, height:1, bgColor:'transparent'});
                self._itemPool = self.makePool(rowClasses, listView);
                
                self.attachTo(self, 'refreshListUI', 'height');
                self.attachToDom(self, 'refreshListUI', 'scroll');
            },
            
            makePool: (rowClasses, listView) => new pkg.TrackActivesMultiPool(rowClasses, listView),
            
            
            // Accessors ///////////////////////////////////////////////////////
            setOverscrollBehavior: function(v) {
                this.overscrollBehavior = v;
                this.getIDS().overscrollBehavior = v;
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
            
            setWidth: function(v, suppressEvent) {
                if (v > 0) {
                    this.callSuper(v, suppressEvent);
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
            
            
            // Methods /////////////////////////////////////////////////////////
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
            
            getFilterFunction: () => {/* Unimplemented which means don't filter anything out. */},
            
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
                return this.getIndexOfModelInData(model) >= 0;
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
                        data = self.getListData();
                    let i = data.length;
                    while (i) if (self.areModelsEqual(data[--i], model)) return i;
                }
                return -1;
            },
            
            areModelsEqual: function(modelA, modelB) {
                const modelIDName = this.modelIDName;
                return modelA[modelIDName] === modelB[modelIDName];
            },
            
            getActiveRowForModel: function(model) {
                if (model) {
                    const self = this,
                        activeRows = self._itemPool.getActives();
                    let i = activeRows.length;
                    while (i) {
                        const row = activeRows[--i];
                        if (self.areModelsEqual(row.model, model)) return row;
                    }
                }
            },
            
            refreshListData: function(preserveScroll, forceFullReset) {
                this._listData = this.collectionModel.getAsSortedList(this.getSortFunction(), this.getFilterFunction());
                this.resetListUI(preserveScroll, forceFullReset);
            },
            
            resetListUI: function(preserveScroll, forceFullReset) {
                const self = this,
                    data = self.getListData(),
                    len = data.length,
                    listView = self._listView,
                    scrollAnchorView = self._scrollAnchorView;
                
                // Resize the listView to the height to accomodate all rows
                listView.setHeight(len * self._rowExtent - (len > 0 ? self.rowSpacing : 0) + self.rowInset + self.rowOutset);
                scrollAnchorView.setY(listView.height - scrollAnchorView.height);
                
                // Ensure the next refreshListUI actually refreshes
                self._startIdx = self._endIdx = -1;
                
                // Reset scroll position
                self.forceFullResetOnNextRefresh = forceFullReset;
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
                // Clear or reassign focus since the row will get reused and 
                // the reused row will likely not be the appropriate focus.
                const currentFocus = GlobalFocus.focusedView;
                if (currentFocus && currentFocus.isDescendantOf(row)) {
                    const focusTrap = this.getFocusTrap();
                    if (focusTrap) {
                        focusTrap.focus();
                    } else {
                        GlobalFocus.clear();
                    }
                }
                
                row.setVisible(false);
                this._itemPool.putInstance(row);
            },
            
            refreshListUI: function(ignoredEvent) {
                const self = this,
                    rowExtent = self._rowExtent,
                    rowInset = self.rowInset,
                    forceFullReset = self.forceFullResetOnNextRefresh,
                    scrollY = getDomScrollTop(self),
                    data = self.getListData() || [],
                    startIdx = mathMax(0, math.floor((scrollY - rowInset) / rowExtent)),
                    endIdx = math.min(data.length, math.ceil((scrollY - rowInset + self.height) / rowExtent));
                
                if (self.forceFullResetOnNextRefresh) self.forceFullResetOnNextRefresh = false;
                
                if (self._startIdx !== startIdx || self._endIdx !== endIdx || forceFullReset) {
                    const rowWidth = self.width,
                        rowHeight = self.rowHeight,
                        visibleRowsByIdx = self._visibleRowsByIdx;
                    
                    self._startIdx = startIdx;
                    self._endIdx = endIdx;
                    
                    // Put all visible rows that are not within the idx range 
                    // back into the pool
                    for (const idx in visibleRowsByIdx) {
                        if (idx < startIdx || idx >= endIdx) {
                            self.putRowBackInPool(visibleRowsByIdx[idx]);
                            delete visibleRowsByIdx[idx];
                        }
                    }
                    
                    for (let i = startIdx; i < endIdx; i++) {
                        let row = visibleRowsByIdx[i];
                        
                        const model = data[i],
                            classKey = self.getClassKey(model);
                        let mustUpdateRow = false;
                        if (!row || row.classKey !== classKey) {
                            if (row) self.putRowBackInPool(row);
                            
                            visibleRowsByIdx[i] = row = self._itemPool.getInstance(classKey);
                            
                            row.setInfiniteOwner(self);
                            row.setClassKey(classKey);
                            row.setWidth(rowWidth);
                            row.setHeight(rowHeight);
                            row.setY(rowInset + i * rowExtent);
                            row.setVisible(true);
                            
                            mustUpdateRow = true;
                        }
                        
                        if (forceFullReset || !row.model || !self.areModelsEqual(row.model, model)) {
                            row.setModel(model);
                            self.updateRow(row);
                        } else if (mustUpdateRow) {
                            self.updateRow(row);
                        }
                        
                        row.notifyRefreshed();
                        
                        // Maintain tab ordering by updating the underlying 
                        // dom order.
                        row.bringToFront();
                    }
                }
            },
            
            getClassKey: model => DEFAULT_CLASS_KEY,
            
            updateRow: row => {}
        }),
        
        /** A simple implementation of a SelectableInfiniteListRow.
            
            Attributes:
                selectedColor
            
            @class */
        SimpleSelectableInfiniteListRow = pkg.SimpleSelectableInfiniteListRow = new JSClass('SimpleSelectableInfiniteListRow', pkg.SimpleButton, {
            include: [SelectableInfiniteListRow],
            
            
            // Life Cycle //////////////////////////////////////////////////////
            initNode: function(parent, attrs) {
                defAttr(attrs, 'selectedColor', '#ccf');
                defAttr(attrs, 'activeColor', '#f8f8f8');
                defAttr(attrs, 'hoverColor', '#eee');
                defAttr(attrs, 'readyColor', '#fff');
                defAttr(attrs, 'focusIndicator', false);
                defAttr(attrs, 'activationKeys', [13,27,32,37,38,39,40]);
                
                this.callSuper(parent, attrs);
            },
            
            destroy: function() {
                if (this.selected) this.infiniteOwner.setSelectedRow();
                this.callSuper();
            },
            
            
            // Accessors ///////////////////////////////////////////////////////
            setSelected: function(v) {
                this.callSuper(v);
                if (this.inited) this.updateUI();
            },
            
            
            // Methods /////////////////////////////////////////////////////////
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
        }),
        
        /** A base class for infinite scrolling lists that support a 
            selectable row.
            
            Attributes:
                selectedRow
                selectedRowModel
            
            @class */
        SelectableInfiniteList = pkg.SelectableInfiniteList = new JSClass('SelectableInfiniteList', InfiniteList, {
            // Accessors ///////////////////////////////////////////////////////
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
            
            
            // Methods /////////////////////////////////////////////////////////
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
            resetListUI: function(preserveScroll, forceFullReset) {
                if (this.isModelInData(this.selectedRowModel)) {
                    // Only clear the selected row since it's still in the 
                    // data and thus may be shown again.
                    clearSelectedRow(this);
                } else {
                    // Clear the row and model since the model can no longer 
                    // be shown.
                    this.setSelectedRow();
                }
                
                this.callSuper(preserveScroll, forceFullReset);
            },
            
            /** @overrides */
            putRowBackInPool: function(row) {
                if (row.selected) clearSelectedRow(this);
                this.callSuper(row);
            },
            
            /** @overrides */
            refreshListUI: function(ignoredEvent) {
                const currentFocus = GlobalFocus.focusedView;
                
                this.callSuper();
                
                const row = this.getActiveSelectedRow();
                if (row) {
                    this.set('selectedRow', row, true);
                    row.setSelected(true);
                    if (!currentFocus || currentFocus === row) row.focus(true);
                }
            }
        }),
        
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
                    this.forceFullResetOnNextRefresh = forceFullReset;
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
                    this.gridHeader.columnHeaders.forEach(hdr => {
                        row.notifyXChange(hdr);
                        row.notifyWidthChange(hdr);
                        row.notifyVisibilityChange(hdr);
                    });
                }
            },
            
            notifyXChange: function(columnHeader) {
                this.getVisibleRows().forEach(row => {row.notifyXChange(columnHeader);});
            },
            
            notifyWidthChange: function(columnHeader) {
                this.getVisibleRows().forEach(row => {row.notifyWidthChange(columnHeader);});
            },
            
            notifyVisibilityChange: function(columnHeader) {
                this.getVisibleRows().forEach(row => {row.notifyVisibilityChange(columnHeader);});
            }
        });
    
    pkg.InfiniteGridRow = new JSModule('InfiniteGridRow', {
        include: [InfiniteListRow, InfiniteGridRowMixin]
    });
    
    pkg.SelectableInfiniteGridRow = new JSModule('SelectableInfiniteGridRow', {
        include: [SelectableInfiniteListRow, InfiniteGridRowMixin]
    });
    
    pkg.SimpleSelectableInfiniteGridRow = new JSClass('SimpleSelectableInfiniteGridRow', SimpleSelectableInfiniteListRow, {
        include: [InfiniteGridRowMixin]
    });
    
    /** A base class for infinite scrolling grids
        
        @class */
    pkg.InfiniteGrid = new JSClass('InfiniteGrid', InfiniteList, {
        include: [InfiniteGridMixin]
    });
    
    /** A base class for selectable infinite scrolling grids
        
        @class */
    pkg.SelectableInfiniteGrid = new JSClass('InfiniteGrid', SelectableInfiniteList, {
        include: [InfiniteGridMixin]
    });
    
    pkg.InfiniteGridHeader = new JSClass('InfiniteGridHeader', View, {
        include: [pkg.GridController],
        
        
        // Life Cycle //////////////////////////////////////////////////////////
        /** @overrides */
        initNode: function(parent, attrs) {
            defAttr(attrs, 'columnSpacing', 1);
            
            attrs.overflow = 'hidden';
            
            this.callSuper(parent, attrs);
            
            new pkg.SpacedLayout(this, {spacing:this.columnSpacing});
        },
        
        
        // Accessors ///////////////////////////////////////////////////////////
        setGrid: function(v) {this.grid = v;},
        setColumnSpacing: function(v) {this.columnSpacing = v;},
        
        getColumnSpacingInUse: function() {
            return this.columnSpacing === 0 ? 0 : mathMax(0, this.getVisibleHdrs().length - 1) * this.columnSpacing;
        },
        
        /** @overrides myt.View */
        setHeight: function(v, suppressEvent) {
            this.callSuper(v, suppressEvent);
            if (this.inited) {
                v = this.height;
                this.columnHeaders.forEach(hdr => {hdr.setHeight(v);});
            }
        },
        
        /** @overrides myt.View */
        setWidth: function(v, suppressEvent) {
            const self = this;
            self.callSuper(mathMax(self.minWidth, v), suppressEvent);
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
            
            if (sv.isA(pkg.GridColHdr)) {
                sv.setGridController(this);
                sv.setHeight(this.height);
            }
        },
        
        /** @overrides myt.GridController */
        doSort: function() {
            this.grid.refreshListData(true, this.grid.forceFullResetOnNextRefresh);
        },
        
        /** @overrides myt.GridController */
        notifyHdrXChange: function(columnHeader) {
            if (!this.isLocked()) this.grid.notifyXChange(columnHeader);
        },
        
        /** @overrides myt.GridController */
        notifyHdrWidthChange: function(columnHeader) {
            if (!this.isLocked()) this.grid.notifyWidthChange(columnHeader);
        },
        
        /** @overrides myt.GridController */
        updateRowsForVisibilityChange: function(columnHeader) {
            this.grid.notifyVisibilityChange(columnHeader);
        }
    });
})(myt);

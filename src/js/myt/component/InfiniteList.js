(pkg => {
    const {Class:JSClass, Module:JSModule} = JS,
        
        {min:mathMin, max:mathMax, floor:mathFloor, ceil:mathCeil} = Math,
        
        {
            NOOP, View, LocalStorage:{setDatum, getDatum},
            global:{focus:GlobalFocus, keys:GlobalKeys},
            getAlphaObjSortFunc
        } = pkg,
        
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
        
        getSubview = (gridRow, columnHeader) => gridRow.getRef(columnHeader.columnId),
        
        getVisibleRowsIterator = infiniteList => infiniteList._visibleRowsByIdx.values(),
        
        /*  Build a sort storage key from a hash of the grid header's columnIds sorted
            and comma joined. */
        getSortStorageKey = gridHeader => gridHeader.__ssk ?? (gridHeader.__ssk = 'InfiniteGridMixin.sort.' + pkg.hash(gridHeader.columnHeaders.map(hdr => hdr.columnId).sort().join(','))),
        
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
            notifyRefreshed: NOOP // () => {/* Subclasses to implement as needed. */}
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
                _visibleRowsByIdx:Map - A cache of what rows are currently shown by the index of 
                    the data for the row. This provides faster performance when refreshing the list.
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
                
                attrs.modelIDName ??= 'id';
                attrs.numericSort ??= true;
                attrs.ascendingSort ??= true;
                attrs.overflow ??= 'autoy';
                attrs.bgColor ??= '#ccc';
                attrs.rowSpacing ??= 1;
                attrs.rowInset ??= 0;
                attrs.rowOutset ??= 0;
                attrs.rowHeight ??= 30;
                attrs.overscrollBehavior ??= 'auto contain';
                
                self._rowExtent = self.rowSpacing = self.rowHeight = 0;
                self._startIdx = self._endIdx = -1;
                self._visibleRowsByIdx = new Map();
                
                self.callSuper(parent, attrs);
                
                // Build UI
                const listView = self._listView = new View(self);
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
            
            setWidth: function(v) {
                if (v > 0) {
                    this.callSuper(v);
                    if (this.inited) {
                        const listView = this._listView,
                            w = this.width;
                        listView.setWidth(w);
                        for (const sv of listView.getSubviews()) sv.setWidth(w);
                    }
                }
            },
            
            /*getVisibleRowsAsArray: function() {
                return Array.from(getVisibleRowsIterator(this));
            },*/
            
            getVisibleRowForModel: function(model) {
                for (const row of this._visibleRowsByIdx.values()) {
                    if (row.model === model) return row;
                }
            },
            
            getListViewHeight: function() {return this._listView.height;},
            
            
            // Methods /////////////////////////////////////////////////////////
            /** @returns {void} */
            isScrolledToEnd: function() {
                return getDomScrollTop(this) + this.height === this._listView.height;
            },
            
            getSortFunction: function() {
                // Default to a numeric sort on the IDs
                const self = this,
                    modelIDName = self.modelIDName,
                    ascendingSort = self.ascendingSort;
                if (self.numericSort) {
                    return pkg.getNumericObjSortFunc(modelIDName, ascendingSort);
                } else {
                    return getAlphaObjSortFunc(modelIDName, ascendingSort, false);
                }
            },
            
            getFilterFunction: NOOP, // () => {/* Unimplemented which means don't filter anything out. */},
            
            scrollModelIntoView: function(model, doFocus) {
                const self = this,
                    idx = self.getIndexOfModelInData(model);
                let retval = false;
                if (idx >= 0) {
                    const rowExtent = self._rowExtent,
                        viewportTop = getDomScrollTop(self),
                        viewportBottom = viewportTop + self.height,
                        rowTop = self.rowInset + idx * rowExtent,
                        rowBottom = rowTop + rowExtent;
                    
                    // Only scroll if not overlapping visible area.
                    if (rowTop <= viewportTop) {
                        setDomScrollTop(self, rowTop);
                        retval = true;
                    } else if (rowBottom >= viewportBottom) {
                        setDomScrollTop(self, rowBottom - self.height);
                        retval = true;
                    }
                    
                    if (doFocus) {
                        const row = self.getVisibleRowForModel(model);
                        if (row) {
                            row.focus();
                        } else {
                            self._focusToModel = model;
                        }
                    }
                }
                
                return retval;
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
            
            areModelsEqual: function(modelA, modelB) {
                const modelIDName = this.modelIDName;
                return modelA[modelIDName] === modelB[modelIDName];
            },
            
            getIndexOfModelInData: function(model) {
                if (model) {
                    const data = this.getListData(),
                        areModelsEqual = this.areModelsEqual.bind(this);
                    let i = data.length;
                    while (i) if (areModelsEqual(data[--i], model)) return i;
                }
                return -1;
            },
            
            getActiveRowForModel: function(model) {
                if (model) {
                    const activeRows = this._itemPool.getActives(),
                        areModelsEqual = this.areModelsEqual.bind(this);
                    let i = activeRows.length;
                    while (i) {
                        const row = activeRows[--i];
                        if (areModelsEqual(row.model, model)) return row;
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
                    listView = self._listView;
                
                // Resize the listView to the height to accomodate all rows
                listView.setHeight(len * self._rowExtent - (len > 0 ? self.rowSpacing : 0) + self.rowInset + self.rowOutset);
                
                // Ensure the next refreshListUI actually refreshes
                self._startIdx = self._endIdx = -1;
                
                // Reset scroll position
                self.forceFullResetOnNextRefresh = forceFullReset;
                if (preserveScroll || getDomScrollTop(self) === 0) {
                    // Just refresh since we won't move the scroll position
                    self.refreshListUI();
                } else {
                    // Updating the scroll position triggers a refreshListUI via the DOM 
                    // scroll event.
                    setDomScrollTop(self, 0);
                }
            },
            
            putRowBackInPool: function(row) {
                // Clear or reassign focus since the row will get reused and the reused row will 
                // likely not be the appropriate focus.
                const currentFocus = GlobalFocus.focusedView;
                if (currentFocus?.isDescendantOf(row)) {
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
            
            refreshListUI: function(_event) {
                const self = this,
                    rowExtent = self._rowExtent,
                    rowInset = self.rowInset,
                    forceFullReset = self.forceFullResetOnNextRefresh,
                    scrollY = getDomScrollTop(self),
                    data = self.getListData() ?? [],
                    startIdx = mathMax(0, mathFloor((scrollY - rowInset) / rowExtent)),
                    endIdx = mathMin(data.length, mathCeil((scrollY - rowInset + self.height) / rowExtent));
                
                if (self.forceFullResetOnNextRefresh) self.forceFullResetOnNextRefresh = false;
                
                if (self._startIdx !== startIdx || self._endIdx !== endIdx || forceFullReset) {
                    const rowWidth = self.width,
                        rowHeight = self.rowHeight,
                        visibleRowsByIdx = self._visibleRowsByIdx,
                        focusToModel = self._focusToModel,
                        areModelsEqual = self.areModelsEqual.bind(self);
                    
                    self._startIdx = startIdx;
                    self._endIdx = endIdx;
                    
                    // Put all visible rows that are not within the idx range back into the pool
                    for (const [idx, row] of visibleRowsByIdx) {
                        if (idx < startIdx || idx >= endIdx) {
                            self.putRowBackInPool(row);
                            visibleRowsByIdx.delete(idx);
                        }
                    }
                    
                    for (let i = startIdx; i < endIdx; i++) {
                        let row = visibleRowsByIdx.get(i);
                        
                        const model = data[i],
                            classKey = self.getClassKey(model);
                        let mustUpdateRow = false;
                        if (!row || row.classKey !== classKey) {
                            if (row) self.putRowBackInPool(row);
                            
                            visibleRowsByIdx.set(i, row = self._itemPool.getInstance(classKey));
                            
                            row.setInfiniteOwner(self);
                            row.setClassKey(classKey);
                            row.setWidth(rowWidth);
                            row.setHeight(rowHeight);
                            row.setY(rowInset + i * rowExtent);
                            row.setVisible(true);
                            
                            mustUpdateRow = true;
                        }
                        
                        if (forceFullReset || !row.model || !areModelsEqual(row.model, model)) {
                            row.setModel(model);
                            self.updateRow(row);
                        } else if (mustUpdateRow) {
                            self.updateRow(row);
                        }
                        
                        row.notifyRefreshed();
                        
                        // Maintain tab ordering by updating the underlying dom order.
                        row.bringToFront();
                        
                        if (focusToModel && areModelsEqual(focusToModel, model)) {
                            row.focus();
                            self._focusToModel = null;
                        }
                    }
                }
            },
            
            getClassKey: _model => DEFAULT_CLASS_KEY,
            
            updateRow:NOOP // row => {}
        }),
        
        /** A simple implementation of a SelectableInfiniteListRow.
            
            Attributes:
                selectedColor
            
            @class */
        SimpleSelectableInfiniteListRow = pkg.SimpleSelectableInfiniteListRow = new JSClass('SimpleSelectableInfiniteListRow', pkg.SimpleButton, {
            include: [SelectableInfiniteListRow, pkg.ArrowKeyActivation],
            
            
            // Life Cycle //////////////////////////////////////////////////////
            initNode: function(parent, attrs) {
                attrs.selectedColor ??= '#ccf';
                attrs.activeColor ??= '#f8f8f8';
                attrs.hoverColor ??= '#eee';
                attrs.readyColor ??= '#fff';
                attrs.focusIndicator ??= false;
                attrs.activationKeys ??= GlobalKeys.LIST_KEYS;
                
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
            
            doActivationKeyDown: function(code, isRepeat) {
                if (code === GlobalKeys.CODE_ESC) {
                    if (this.selected) this.infiniteOwner.setSelectedRow();
                } else {
                    this.callSuper(code, isRepeat);
                }
            },
            
            /** @overrides myt.ArrowKeyActivation. */
            doKeyArrowLeftOrUp: function(_isLeft, _isRepeat) {
                this.infiniteOwner.selectPrevRowForModel(this.model);
                return true;
            },
            
            /** @overrides myt.ArrowKeyActivation. */
            doKeyArrowRightOrDown: function(_isRight, _isRepeat) {
                this.infiniteOwner.selectNextRowForModel(this.model);
                return true;
            },
            
            doActivationKeyUp: function(code) {
                switch (code) {
                    case GlobalKeys.CODE_ENTER:
                    case GlobalKeys.CODE_SPACE:
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
                    existing?.setSelected(false);
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
                this.scrollModelIntoView(this.selectedRowModel, false);
            },
            
            
            // Methods /////////////////////////////////////////////////////////
            getActiveSelectedRow: function() {
                return this.getActiveRowForModel(this.selectedRowModel);
            },
            
            selectRowForModel: function(model, focus, _isNext) {
                if (model) {
                    clearSelectedRow(this);
                    this.setSelectedRowModel(model);
                    this.refreshListUI();
                    
                    // Focus on the newly selected row
                    if (focus) this.getActiveSelectedRow()?.focus();
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
                    // Only clear the selected row since it's still in the data and thus may be 
                    // shown again.
                    clearSelectedRow(this);
                } else {
                    // Clear the row and model since the model can no longer be shown.
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
            refreshListUI: function(_event) {
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
                getSubview(this, columnHeader)?.setX(columnHeader.x + columnHeader.cellXAdj);
            },
            
            notifyWidthChange: function(columnHeader) {
                getSubview(this, columnHeader)?.setWidth(columnHeader.width + columnHeader.cellWidthAdj);
            },
            
            notifyVisibilityChange: function(columnHeader) {
                getSubview(this, columnHeader)?.setVisible(columnHeader.visible);
            }
        }),
        
        InfiniteGridMixin = new JSModule('InfiniteGridMixin', {
            // Accessors ///////////////////////////////////////////////////////
            setGridHeader: function(v) {
                (this.gridHeader = v)?.setGrid(this);
            },
            
            
            // Methods /////////////////////////////////////////////////////////
            makeReady: function(sortState, forceFullReset) {
                const gridHeader = this.gridHeader;
                if (gridHeader) {
                    this.forceFullResetOnNextRefresh = forceFullReset;
                    const persistedSortOrder = gridHeader.persistSortOrder ? getDatum(getSortStorageKey(gridHeader)) : undefined;
                    gridHeader.setSort(persistedSortOrder ?? sortState);
                    gridHeader.setLocked(false);
                } else {
                    this.refreshListData(false, forceFullReset);
                }
            },
            
            /** @overrides myt.InfiniteList */
            getSortFunction: function() {
                const [sortColumnId, sortOrder] = this.gridHeader.sort ?? ['',''];
                return sortColumnId ? getAlphaObjSortFunc(sortColumnId, sortOrder === pkg.Grid.SORT_ORDER_ASC, false) : this.callSuper();
            },
            
            /** @overrides myt.InfiniteList */
            updateRow: function(row) {
                const gridHeader = this.gridHeader;
                if (gridHeader) {
                    for (const hdr of gridHeader.columnHeaders) {
                        row.notifyXChange(hdr);
                        row.notifyWidthChange(hdr);
                        row.notifyVisibilityChange(hdr);
                    }
                }
            },
            
            notifyXChange: function(columnHeader) {
                for (const row of getVisibleRowsIterator(this)) row.notifyXChange(columnHeader);
            },
            
            notifyWidthChange: function(columnHeader) {
                for (const row of getVisibleRowsIterator(this)) row.notifyWidthChange(columnHeader);
            },
            
            notifyVisibilityChange: function(columnHeader) {
                for (const row of getVisibleRowsIterator(this)) row.notifyVisibilityChange(columnHeader);
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
            attrs.columnSpacing ??= 1;
            attrs.persistSortOrder ??= true;
            
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
        
        setPersistSortOrder: function(v) {this.persistSortOrder = v;},
        
        /** @overrides myt.View */
        setHeight: function(v) {
            this.callSuper(v);
            if (this.inited) {
                v = this.height;
                for (const hdr of this.columnHeaders) hdr.setHeight(v);
            }
        },
        
        /** @overrides myt.View */
        setWidth: function(v) {
            this.callSuper(mathMax(this.minWidth, v));
            if (this.inited) {
                const width = this.width;
                this.setGridWidth(width);
                this.grid.setWidth(width);
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
            this.persistSort();
            this.grid.refreshListData(true, this.grid.forceFullResetOnNextRefresh);
        },
        
        persistSort: function() {
            // Save the sort order to LocalStorage. Save happens in InfiniteGridMixin.makeReady
            // which calls this function during grid initialization.
            if (this.persistSortOrder) setDatum(getSortStorageKey(this), this.sort);
        },
        
        /** @overrides myt.GridController */
        notifyHdrXChange: function(columnHeader) {
            if (!this.isLocked()) {
                this.grid.notifyXChange(columnHeader);
                this._notifyHdrChange('X', columnHeader);
            }
        },
        
        /** @overrides myt.GridController */
        notifyHdrWidthChange: function(columnHeader) {
            if (!this.isLocked()) {
                this.grid.notifyWidthChange(columnHeader);
                this._notifyHdrChange('Width', columnHeader);
            }
        },
        
        /** @overrides myt.GridController */
        updateRowsForVisibilityChange: function(columnHeader) {
            this.grid.notifyVisibilityChange(columnHeader);
            if (!this.isLocked()) {
                this._notifyHdrChange('Visibility', columnHeader);
            }
        }
    });
})(myt);

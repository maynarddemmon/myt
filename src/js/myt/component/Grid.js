(pkg => {
    /** Use a shared idx so we can better distibute extra space during small but frequent resizings 
        such as what occurs when slowly resizing a grid. */
    let resizeIdx = 0;
    
    const JSClass = JS.Class,
        JSModule = JS.Module,
        
        mathMin = Math.min,
        mathMax = Math.max,
        
        View = pkg.View,
        
        DEFAULT_PLACEMENT = pkg.Node.DEFAULT_PLACEMENT,
        
        // GridController
        findLastVisibleColumn = controller => {
            const hdrs = controller.columnHeaders;
            let i = hdrs.length;
            while (i) {
                const hdr = hdrs[--i];
                if (hdr.visible) return hdr;
            }
        },
        
        notifyHeadersOfSortState = controller => {
            const hdrs = controller.columnHeaders,
                [sortColumnId, sortOrder] = controller.sort ?? ['',''];
            let i = hdrs.length;
            while (i) {
                const hdr = hdrs[--i];
                if (hdr.columnId === sortColumnId) {
                    if (hdr.sortable) hdr.setSortState(sortOrder);
                } else {
                    hdr.setSortState('none');
                }
            }
            if (!controller.locked) controller.doSort();
        },
        
        /*  Calculate resize amounts and distribute it to the headers */
        calculateAndDistribute = (hdrs, extra, isFlex, nextFunc) => {
            if (extra !== 0) {
                // Get resizable column info
                const isGrow = extra > 0,
                    resizeInfo = [];
                let i = hdrs.length;
                while (i) {
                    const hdr = hdrs[--i];
                    if (hdr.resizable && (isFlex ? (hdr.flex > 0) : (hdr.flex === 0))) {
                        resizeInfo.push({
                            hdr:hdr,
                            limit:(isGrow ? hdr.maxValue : hdr.minValue) - hdr.value,
                            amt:0
                        });
                    }
                }
                
                // Calculate Amounts
                let resizeCount = resizeInfo.length;
                if (resizeCount > 0) {
                    let fullCount = 0;
                    
                    while (extra !== 0) {
                        if (resizeIdx >= resizeCount) {
                            resizeIdx = 0;
                            fullCount = 0;
                        }
                        
                        const info = resizeInfo[resizeIdx],
                            hdr = info.hdr;
                        
                        if (info.full) {
                            ++fullCount;
                        } else {
                            let incr;
                            if (isGrow) {
                                incr = mathMin(isFlex ? hdr.flex : 1, extra);
                                if (info.amt + incr > info.limit) {
                                    incr = info.limit - info.amt;
                                    info.full = true;
                                }
                            } else {
                                incr = mathMax(isFlex ? -hdr.flex : -1, extra);
                                if (info.amt + incr < info.limit) {
                                    incr = info.limit - info.amt;
                                    info.full = true;
                                }
                            }
                            info.amt += incr;
                            extra -= incr;
                        }
                        
                        if (fullCount === resizeCount) break;
                        
                        ++resizeIdx;
                    }
                    
                    // Distribute
                    resizeInfo.forEach(info => {info.hdr.setValue(info.hdr.value + info.amt);});
                    
                    if (nextFunc) nextFunc(extra);
                }
            }
        },
        
        // GridColHdr
        defaultMaxValue = 1000,
        
        getPrevHdr = gridHeader => gridHeader.gridController ? gridHeader.gridController.getPrevHdr(gridHeader) : null,
        
        getNextHdr = gridHeader => gridHeader.gridController ? gridHeader.gridController.getNextHdr(gridHeader) : null,
        
        getGiveLeft = gridHeader => {
            const hdr = getPrevHdr(gridHeader);
            return hdr ? hdr.maxValue - hdr.value + getGiveLeft(hdr) : 0;
        },
        
        getGiveRight = gridHeader => {
            const hdr = getNextHdr(gridHeader);
            return hdr ? hdr.maxValue - hdr.value + getGiveRight(hdr) : 0;
        },
        
        getTakeLeft = gridHeader => {
            const hdr = getPrevHdr(gridHeader);
            return hdr ? hdr.minValue - hdr.value + getTakeLeft(hdr) : 0;
        },
        
        getTakeRight = gridHeader => {
            const hdr = getNextHdr(gridHeader);
            return hdr ? hdr.minValue - hdr.value + getTakeRight(hdr) : 0;
        },
        
        /*  @param {!Object} gridHeader
            @returns {undefined} */
        updateLast = gridHeader => {
            gridHeader.resizer.setVisible(!(gridHeader.last && gridHeader.gridController.fitToWidth));
        },
        
        /*  Steals width from previous column headers.
            @param {!Object} gridHeader
            @param {number} diff - The amount to steal. Will be a negative number.
            @returns {number} - The amount of width actually stolen. */
        stealPrevWidth = (gridHeader, diff) => {
            const hdr = getPrevHdr(gridHeader);
            let usedDiff = 0;
            if (hdr) {
                const newValue = hdr.value + diff;
                if (hdr.resizable) hdr.setValue(newValue);
                const remainingDiff = newValue - hdr.value;
                usedDiff = diff - remainingDiff;
                if (remainingDiff < 0) usedDiff += stealPrevWidth(hdr, remainingDiff);
            }
            return usedDiff;
        },
        
        /*  Gives width to previous column headers.
            @param {!Object} gridHeader
            @param {number} diff - The amount to give. Will be a positive number.
            @returns {number} - The amount of width actually given. */
        givePrevWidth = (gridHeader, diff) => {
            const hdr = getPrevHdr(gridHeader);
            let usedDiff = 0;
            if (hdr) {
                const newValue = hdr.value + diff;
                if (hdr.resizable) hdr.setValue(newValue);
                const remainingDiff = newValue - hdr.value;
                usedDiff = diff - remainingDiff;
                if (remainingDiff > 0) usedDiff += givePrevWidth(hdr, remainingDiff);
            }
            return usedDiff;
        },
        
        /*  Steals width from next column headers.
            @param {!Object} gridHeader
            @param {number} diff - The amount to steal. Will be a negative number.
            @returns {number} - The amount of width actually stolen. */
        stealNextWidth = (gridHeader, diff) => {
            const hdr = getNextHdr(gridHeader);
            if (hdr) {
                const newValue = hdr.value + diff;
                if (hdr.resizable) hdr.setValue(newValue);
                const remainingDiff = newValue - hdr.value;
                if (remainingDiff < 0) stealNextWidth(hdr, remainingDiff);
            }
        },
        
        /*  Gives width to next column headers.
            @param {!Object} gridHeader
            @param {number} diff - The amount to give. Will be a positive number.
            @returns {number} - The amount of width actually given. */
        giveNextWidth = (gridHeader, diff) => {
            const hdr = getNextHdr(gridHeader);
            if (hdr) {
                const newValue = hdr.value + diff;
                if (hdr.resizable) hdr.setValue(newValue);
                const remainingDiff = newValue - hdr.value;
                if (remainingDiff > 0) giveNextWidth(hdr, remainingDiff);
            }
        },
        
        // GridRow
        getRowSubview = (gridRow, columnHeader) => gridRow[columnHeader.columnId + 'View'],
        
        // SimpleGridColHdr
        updateSortIcon = gridHeader => {
            let glyph = '';
            if (gridHeader.sortable) {
                switch (gridHeader.sortState) {
                    case 'ascending': glyph = 'chevron-up'; break;
                    case 'descending': glyph = 'chevron-down'; break;
                }
            }
            gridHeader.sortIcon.setIcon(glyph);
        },
        
        updateTextWidth = gridHeader => {
            const textView = gridHeader.textView;
            if (textView) textView.setWidth(gridHeader.width - gridHeader.outset - textView.x);
        },
        
        /** Coordinates the behavior of a grid.
            
            Events:
                sort:array
                maxWidth:number
                minWidth:number
            
            Attributes:
                maxWidth:number the sum of the maximum widths of the columns.
                minWidth:number the sum of the minimum widths of the columns.
                gridWidth:number the width of the grid component.
                fitToWidth:boolean determines if the columns will always fill up the width of the 
                    grid or not. Defaults to true.
                lastColumn:myt.GridColHdr Holds a reference to the last column header.
                sort:array An array containing the id of the column to sort by and the order to 
                    sort by.
                locked:boolean Prevents the grid from updating the UI. Defaults to true. After a 
                    grid has been setup a call should be made to setLocked(false)
            
            Private Attributes:
                columnHeaders:array An array of column headers in this grid.
                rows:array An array of rows in this grid.
                __tempLock:boolean Prevents "change" notifications from being processed.
            
            @class */
        GridController = pkg.GridController = new JSModule('GridController', {
            // Life Cycle //////////////////////////////////////////////////////
            initNode: function(parent, attrs) {
                const self = this;
                
                self.columnHeaders = [];
                self.rows = [];
                
                self.maxWidth = self.minWidth = self.gridWidth = 0;
                self.fitToWidth = self.locked = true;
                
                self.callSuper(parent, attrs);
                
                self.fitHeadersToWidth();
                notifyHeadersOfSortState(self);
            },
            
            
            // Accessors ///////////////////////////////////////////////////////
            setMaxWidth: function(v) {this.set('maxWidth', v, true);},
            setMinWidth: function(v) {this.set('minWidth', v, true);},
            
            setFitToWidth: function(v) {this.fitToWidth = v;},
            
            setSort: function(v) {
                if (!pkg.areArraysEqual(v, this.sort)) {
                    this.sort = v;
                    if (this.inited) {
                        this.fireEvent('sort', v);
                        notifyHeadersOfSortState(this);
                    }
                }
            },
            
            setLastColumn: function(v) {
                const cur = this.lastColumn;
                if (cur !== v) {
                    if (cur) cur.setLast(false);
                    this.lastColumn = v;
                    if (v) v.setLast(true);
                }
            },
            
            setLocked: function(v) {
                this.locked = v;
                if (this.inited && !v) {
                    // Prevent change calls during fitHeadersToWidth
                    this.__tempLock = true;
                    this.fitHeadersToWidth();
                    this.__tempLock = false;
                    
                    // Reset min/max since notifyHdrVisibilityChange will update these values
                    this.setMaxWidth(0);
                    this.setMinWidth(0);
                    this.__skipInvisibleHeaders = true;
                    this.columnHeaders.forEach(hdr => {
                        this.notifyHdrXChange(hdr);
                        this.notifyHdrWidthChange(hdr);
                        this.notifyHdrVisibilityChange(hdr);
                    });
                    this.__skipInvisibleHeaders = false;
                    
                    this.doSort();
                }
            },
            
            isLocked: function() {
                return this.locked || this.__tempLock;
            },
            
            setGridWidth: function(v) {
                v = this.valueFromEvent(v);
                if (this.gridWidth !== v) {
                    this.gridWidth = v;
                    if (this.inited) this.fitHeadersToWidth();
                }
            },
            
            
            // Methods /////////////////////////////////////////////////////////
            /** Sorts the rows according to the current sort criteria. Subclasses and instances 
                should implement this as needed.
                @returns {undefined} */
            doSort: () => {},
            
            // Column Headers
            /** Gets the column header before the provided one.
                @param {!Object} columnHeader
                @returns {?Object} The myt.GridColHdr or undefined if none exists. */
            getPrevHdr: function(columnHeader) {
                const hdrs = this.columnHeaders;
                let idx = this.getHdrIndex(columnHeader);
                if (idx > 0) {
                    while (idx) {
                        const hdr = hdrs[--idx];
                        if (hdr.visible) return hdr;
                    }
                }
            },
            
            /** Gets the column header after the provided one.
                @param {!Object} columnHeader
                @returns {?Object} The myt.GridColHdr or undefined if none exists. */
            getNextHdr: function(columnHeader) {
                const hdrs = this.columnHeaders,
                    len = hdrs.length;
                let idx = this.getHdrIndex(columnHeader) + 1;
                if (idx > 0 && idx < len) {
                    for (; len > idx;) {
                        const hdr = hdrs[idx++];
                        if (hdr.visible) return hdr;
                    }
                }
            },
            
            hasHdr: function(columnHeader) {
                return this.columnHeaders.includes(columnHeader);
            },
            
            getHdrIndex: function(columnHeader) {
                return this.columnHeaders.indexOf(columnHeader);
            },
            
            getHdrById: function(columnId) {
                const hdrs = this.columnHeaders;
                let i = hdrs.length;
                while (i) {
                    const hdr = hdrs[--i];
                    if (hdr.columnId === columnId) return hdr;
                }
            },
            
            getVisibleHdrs: function() {
                return this.columnHeaders.filter(hdr => hdr.visible);
            },
            
            notifyAddHdr: function(columnHeader) {
                if (!this.hasHdr(columnHeader)) {
                    this.columnHeaders.push(columnHeader);
                    if (columnHeader.visible) this.setLastColumn(columnHeader);
                    this.fixupResizerCursors();
                }
            },
            
            notifyRemoveHdr: function(columnHeader) {
                const idx = this.getHdrIndex(columnHeader);
                if (idx > -1) {
                    this.columnHeaders.splice(idx, 1);
                    if (columnHeader.visible && columnHeader.last) this.setLastColumn(this.getPrevHdr(columnHeader));
                    this.fixupResizerCursors();
                }
            },
            
            notifyHdrXChange: function(columnHeader) {
                if (!this.isLocked()) this.rows.forEach(row => {row.notifyHdrXChange(columnHeader);});
            },
            
            notifyHdrWidthChange: function(columnHeader) {
                if (!this.isLocked()) this.rows.forEach(row => {row.notifyHdrWidthChange(columnHeader);});
            },
            
            notifyHdrVisibilityChange: function(columnHeader) {
                const skip = this.__skipInvisibleHeaders && !columnHeader.visible;
                
                if (!skip && !this.isLocked()) {
                    this.updateRowsForVisibilityChange(columnHeader);
                    
                    this.setLastColumn(findLastVisibleColumn(this));
                    
                    const adjMultiplier = columnHeader.visible ? 1 : -1;
                    this.setMaxWidth(this.maxWidth + columnHeader.maxValue * adjMultiplier);
                    this.setMinWidth(this.minWidth + columnHeader.minValue * adjMultiplier);
                    
                    this.fitHeadersToWidth();
                    this.fixupResizerCursors();
                }
            },
            
            updateRowsForVisibilityChange: function(columnHeader) {
                this.rows.forEach(row => {row.notifyHdrVisibilityChange(columnHeader);});
            },
            
            // Rows
            hasRow: function(row) {
                return this.rows.includes(row);
            },
            
            getRowIndex: function(row) {
                return this.rows.indexOf(row);
            },
            
            /** Gets a row for the provided id and matcher function. If no matcher function is 
                provided a default function will be used that assumes each row has a model property 
                and that model 
                property has an id property.
                @param {string} id
                @param {?Function} [matcherFunc]
                @returns {?Objecdt} */
            getRowById: function(id, matcherFunc=row => row.model.id === id) {
                return this.rows.find(matcherFunc);
            },
            
            getPrevRow: function(row) {
                const idx = this.getRowIndex(row) - 1;
                return this.rows[idx < 0 ? this.rows.length - 1 : idx];
            },
            
            getNextRow: function(row) {
                const idx = this.getRowIndex(row) + 1;
                return this.rows[idx < this.rows.length ? idx : 0];
            },
            
            notifyAddRow: function(row, doNotSort) {
                if (!this.hasRow(row)) {
                    this.rows.push(row);
                    
                    // Update cell positions
                    if (!this.locked) {
                        const w = this.width;
                        this.columnHeaders.forEach(hdr => {
                            row.setWidth(w);
                            row.notifyHdrXChange(hdr);
                            row.notifyHdrWidthChange(hdr);
                            row.notifyHdrVisibilityChange(hdr);
                        });
                        
                        if (!doNotSort) this.doSort();
                    }
                }
            },
            
            notifyRemoveRow: function(row) {
                const idx = this.getRowIndex(row);
                if (idx > -1) this.rows.splice(idx, 1);
            },
            
            fitHeadersToWidth: function() {
                if (!this.locked && this.fitToWidth) {
                    // Determine extra width to distribute/consume
                    const hdrs = this.getVisibleHdrs();
                    let maxExtent = 0;
                    hdrs.forEach(hdr => {maxExtent = mathMax(maxExtent, hdr.x + hdr.width);});
                    
                    // Distribute extra width to resizable flex columns and then to 
                    // non-flex columns.
                    calculateAndDistribute(hdrs, this.gridWidth - maxExtent, true, extra => {
                        calculateAndDistribute(hdrs, extra, false, null);
                    });
                }
            },
            
            fixupResizerCursors: function() {
                const hdrs = this.getVisibleHdrs();
                
                // Search forward hiding the cursor for each fixed column until a non-fixed column 
                // is encountered
                let allPrevAreFixed = true,
                    firstNonFixedIdx = 0;
                hdrs.forEach((hdr, idx) => {
                    if (allPrevAreFixed && hdr.isFixed()) {
                        hdr.setResizerCursor('', true);
                    } else {
                        if (allPrevAreFixed) firstNonFixedIdx = idx;
                        allPrevAreFixed = false;
                        hdr.restoreResizerCursor();
                    }
                });
                
                // Search backward hiding the cursor for each fixed column until a non-fixed 
                // column is encountered
                let allAfterAreFixed = true,
                    i = hdrs.length,
                    lastNonFixedIndex = i - 1;
                while (i > firstNonFixedIdx) {
                    const hdr = hdrs[--i];
                    if (allAfterAreFixed) {
                        hdr.setResizerCursor('', true);
                    } else {
                        hdr.restoreResizerCursor();
                    }
                    if (!hdr.isFixed()) {
                        if (allAfterAreFixed) lastNonFixedIndex = i;
                        allAfterAreFixed = false;
                    }
                }
                
                // Handle the case where there is only one resizable column. When there's only one 
                // there is not point in resizing it.
                if (firstNonFixedIdx === lastNonFixedIndex) hdrs[firstNonFixedIdx].setResizerCursor('', true);
            }
        }),
        
        /** Makes a view behave as a grid column header.
            
            Events:
                sortable:boolean
                sortState:string
                resizable:boolean
            
            Attributes:
                columnId:string The unique ID for this column relative to the grid it is part of.
                gridController:myt.GridController the controller for the grid this component is 
                    part of.
                flex:number If 1 or more the column will get extra space if any exists.
                resizable:boolean Indicates if this column can be resized or not. Defaults to true.
                last:boolean Indicates if this is the last column header or not.
                sortable:boolean Indicates if this column can be sorted or not. Defaults to true.
                sortState:string The sort state of this column. Allowed 
                    values are:
                        'ascending': Sorted in ascending order.
                        'descending': Sorted in descending order.
                        'none': Not currently an active sort column.
                cellXAdj:number The amount to shift the x values of cells updated by this column. 
                    Defaults to 0.
                cellWidthAdj:number The amount to grow/shrink the width of cells updated by this 
                    column. Defaults to 0.
            
            @class */
        GridColHdr = pkg.GridColHdr = new JSModule('GridColHdr', {
            include: [pkg.BoundedValueComponent],
            
            
            // Life Cycle //////////////////////////////////////////////////////
            initNode: function(parent, attrs) {
                const self = this;
                
                const resizerCursor = attrs.resizerCursor ?? 'col-resize';
                delete attrs.resizerCursor;
                
                attrs.minValue ??= 16;
                attrs.maxValue ??= defaultMaxValue;
                attrs.value ??= attrs.minValue;
                
                attrs.resizable ??= true;
                attrs.flex ??= 0;
                attrs.cellXAdj ??= 0;
                attrs.cellWidthAdj ??= 0;
                attrs.sortable ??= true;
                attrs.sortState ??= 'none';
                
                // Ensure participation in determinePlacement method of myt.Grid
                attrs.placement ??= DEFAULT_PLACEMENT;
                
                self.callSuper(parent, attrs);
                
                const gc = self.gridController;
                
                self.resizer = new View(self, {
                    cursor:resizerCursor, width:10, zIndex:1,
                    percentOfParentHeight:100, align:'right', alignOffset:-5,
                    draggableAllowBubble:false
                }, [pkg.SizeToParent, pkg.Draggable, {
                    requestDragPosition: function(x, y) {
                        let diff = x - this.x;
                        if (gc.fitToWidth) {
                            if (diff > 0) {
                                // Get amount that this header can grow
                                diff = mathMin(diff, mathMin(-getTakeRight(self), self.maxValue - self.value + getGiveLeft(self)));
                            } else if (diff < 0) {
                                // Get amount that this header can shrink
                                diff = mathMax(diff, mathMax(-getGiveRight(self), self.minValue - self.value + getTakeLeft(self)));
                            }
                            
                            if (diff === 0) return;
                        }
                        
                        const newValue = self.value + diff;
                        
                        if (self.resizable) self.setValue(newValue);
                        const remainingDiff = newValue - self.value;
                        let stolenAmt = remainingDiff - diff,
                            additionalActualDiff = 0;
                        if (remainingDiff < 0) {
                            additionalActualDiff = stealPrevWidth(self, remainingDiff);
                        } else if (remainingDiff > 0) {
                            additionalActualDiff = givePrevWidth(self, remainingDiff);
                        }
                        this.dragInitX += additionalActualDiff;
                        stolenAmt -= additionalActualDiff;
                        
                        if (gc.fitToWidth) {
                            if (stolenAmt < 0) {
                                stealNextWidth(self, stolenAmt);
                            } else if (stolenAmt > 0) {
                                giveNextWidth(self, stolenAmt);
                            }
                        }
                    }
                }]);
                
                if (gc) {
                    gc.notifyAddHdr(self);
                    gc.notifyHdrXChange(self);
                    gc.notifyHdrVisibilityChange(self);
                }
                self.setWidth(self.value);
                updateLast(self);
            },
            
            destroy: function(v) {
                this.setGridController();
                this.callSuper(v);
            },
            
            
            // Accessors ///////////////////////////////////////////////////////
            setSortable: function(v) {this.set('sortable', v, true);},
            setSortState: function(v) {this.set('sortState', v, true);},
            setResizable: function(v) {this.set('resizable', v, true);},
            setCellWidthAdj: function(v) {this.cellWidthAdj = v;},
            setCellXAdj: function(v) {this.cellXAdj = v;},
            setFlex: function(v) {this.flex = v;},
            setColumnId: function(v) {this.columnId = v;},
            
            setResizerCursor: function(v, restorable) {
                const self = this,
                    resizer = self.resizer,
                    existingCursor = resizer.cursor;
                if (v !== existingCursor) {
                    if (restorable) self.__rrc = existingCursor;
                    resizer.setCursor(v);
                }
            },
            
            restoreResizerCursor: function() {
                const self = this,
                    restoreResizerCursor = self.__rrc;
                if (restoreResizerCursor) {
                    self.setResizerCursor(restoreResizerCursor);
                    self.__rrc = null;
                }
            },
            
            /** Check if this GridHeader has a fixed size.
                @returns {boolean} */
            isFixed: function() {
                return this.minValue === this.maxValue;
            },
            
            setLast: function(v) {
                this.last = v;
                if (this.inited) updateLast(this);
            },
            
            setGridController: function(v) {
                const existing = this.gridController;
                if (existing !== v) {
                    if (existing) existing.notifyRemoveHdr(this);
                    this.gridController = v;
                    if (this.inited && v) {
                        v.notifyAddHdr(this);
                        v.notifyHdrXChange(this);
                        v.notifyHdrWidthChange(this);
                        v.notifyHdrVisibilityChange(this);
                    }
                }
            },
            
            /** @overrides myt.BoundedValueComponent */
            setValue: function(v) {
                this.callSuper(v);
                if (this.inited) this.setWidth(this.value);
            },
            
            /** @overrides myt.BoundedValueComponent */
            setMinValue: function(v) {
                const self = this,
                    oldMinValue = self.minValue ?? 0, 
                    gc = self.gridController;
                self.callSuper(v);
                if (gc && self.inited && oldMinValue !== self.minValue) gc.setMinWidth(gc.minWidth + self.minValue - oldMinValue);
            },
            
            /** @overrides myt.BoundedValueComponent */
            setMaxValue: function(v) {
                const self = this,
                    oldMaxValue = self.maxValue ?? 0,
                    gc = self.gridController;
                v ??= defaultMaxValue;
                self.callSuper(v);
                if (gc && self.inited && oldMaxValue !== self.maxValue) gc.setMaxWidth(gc.maxWidth + self.maxValue - oldMaxValue);
            },
            
            /** @overrides myt.View */
            setWidth: function(v, suppressEvent) {
                const self = this,
                    cur = self.width,
                    gc = self.gridController;
                self.callSuper(v, suppressEvent);
                if (gc && self.inited && cur !== self.width) gc.notifyHdrWidthChange(self);
            },
            
            /** @overrides myt.View */
            setX: function(v) {
                const self = this,
                    cur = self.x,
                    gc = self.gridController;
                self.callSuper(v);
                if (gc && self.inited && cur !== self.x) gc.notifyHdrXChange(self);
            },
            
            /** @overrides myt.View */
            setVisible: function(v) {
                const self = this,
                    cur = self.visible,
                    gc = self.gridController;
                self.callSuper(v);
                if (self.inited && gc && cur !== self.visible) gc.notifyHdrVisibilityChange(self);
            }
        }),
        
        /** Makes a view behave as a row in a grid.
            
            Attributes:
                gridController:myt.GridConstroller A reference to the grid controller that is 
                    managing this row.
            
            @class */
        GridRow = pkg.GridRow = new JSModule('GridRow', {
            // Life Cycle //////////////////////////////////////////////////////
            initNode: function(parent, attrs) {
                // Ensure participation in determinePlacement method of myt.Grid
                attrs.placement ??= DEFAULT_PLACEMENT;
                
                this.callSuper(parent, attrs);
                
                this.gridController?.notifyAddRow(this);
            },
            
            destroy: function(v) {
                this.setGridController();
                this.callSuper(v);
            },
            
            
            // Accessors ///////////////////////////////////////////////////////
            setGridController: function(v) {
                const existing = this.gridController;
                if (existing !== v) {
                    if (existing) existing.notifyRemoveRow(this);
                    this.gridController = v;
                    if (this.inited && v) v.notifyAddRow(this);
                }
            },
            
            
            // Methods /////////////////////////////////////////////////////////
            notifyHdrXChange: function(columnHeader) {
                const sv = getRowSubview(this, columnHeader);
                if (sv) sv.setX(columnHeader.x + columnHeader.cellXAdj);
            },
            
            notifyHdrWidthChange: function(columnHeader) {
                const sv = getRowSubview(this, columnHeader);
                if (sv) sv.setWidth(columnHeader.width + columnHeader.cellWidthAdj);
            },
            
            notifyHdrVisibilityChange: function(columnHeader) {
                const sv = getRowSubview(this, columnHeader);
                if (sv) sv.setVisible(columnHeader.visible);
            }
        });
    
    /** An implementation of a grid component.
        
        Attributes:
            rowSpacing:number The spacing between rows. Defaults to 1.
            columnSpacing:number the spacing between columns. Defaults to 1.
            sizeHeightToRows:boolean If true, this component will be sized to fit all the rows 
                without showing scrollbars. Defaults to undefined which is equivalent to false.
        
        @class */
    pkg.Grid = new JSClass('Grid', View, {
        include: [GridController],
        
        
        // Life Cycle //////////////////////////////////////////////////////////
        /** @overrides myt.View */
        initNode: function(parent, attrs) {
            const self = this,
                SpacedLayout = pkg.SpacedLayout;
            
            // Allows horizontal scrolling if the grid columns are too wide.
            attrs.overflow ??= 'autox';
            
            attrs.bgColor ??= '#ccc';
            attrs.rowSpacing ??= 1;
            attrs.columnSpacing ??= 1;
            
            const isAutoScrolling = attrs.isAutoScrolling;
            delete attrs.isAutoScrolling;
            
            self.callSuper(parent, attrs);
            
            // Build UI
            const header = self.header = new View(self, {overflow:'hidden'});
            header.xLayout = new SpacedLayout(header, {locked:true, collapseParent:true, spacing:self.columnSpacing});
            header.yLayout = new pkg.SizeToChildren(header, {locked:true, axis:'y'});
            
            const sizeHeightToRows = self.sizeHeightToRows,
                contentMixins = isAutoScrolling ? [pkg.AutoScroller] : [],
                content = self.content = new View(self, {overflow:sizeHeightToRows ? 'hidden' : 'autoy'}, contentMixins);
            content.yLayout = new SpacedLayout(content, {locked:true, axis:'y', spacing:self.rowSpacing, collapseParent:sizeHeightToRows});
            
            self.syncTo(self, 'setGridWidth', 'width');
            self.syncTo(header, '_updateContentWidth', 'width');
            self.constrain('_updateContentHeight', [sizeHeightToRows ? content : self, 'height', header, 'height', header, 'y']);
        },
        
        
        // Accessors ///////////////////////////////////////////////////////////
        setSizeHeightToRows: function(v) {this.sizeHeightToRows = v;},
        
        setRowSpacing: function(v) {
            if (this.rowSpacing !== v) {
                this.rowSpacing = v;
                if (this.inited) this.content.yLayout.setSpacing(v);
            }
        },
        
        setColumnSpacing: function(v) {
            if (this.columnSpacing !== v) {
                this.columnSpacing = v;
                if (this.inited) this.header.xLayout.setSpacing(v);
            }
        },
        
        /** @overrides myt.GridController */
        setLocked: function(v) {
            // Performance: don't update layouts until the grid is unlocked.
            if (this.inited) {
                [this.header.xLayout, this.header.yLayout, this.content.yLayout].forEach(layout => {
                    if (v) {
                        layout.incrementLockedCounter();
                    } else {
                        layout.decrementLockedCounter();
                        layout.update();
                    }
                });
            }
            this.callSuper(v);
        },
        
        
        // Methods /////////////////////////////////////////////////////////////
        /** @private
            @param {!Object} event
            @returns {undefined} */
        _updateContentWidth: function(event) {
            const content = this.content,
                w = event.value;
            content.setWidth(w);
            content.getSubviews().forEach(sv => {sv.setWidth(w);});
        },
        
        /** @private
            @param {!Object} event
            @returns {undefined} */
        _updateContentHeight: function(event) {
            const self = this,
                header = self.header, 
                content = self.content,
                y = header.y + header.height;
            content.setY(y);
            
            if (self.sizeHeightToRows) {
                self.setHeight(y + content.height);
            } else {
                content.setHeight(self.height - y);
            }
        },
        
        /** @overrides myt.Node */
        determinePlacement: function(placement, subnode) {
            // Automatically place column headers and rows in the header and content 
            // views respectively.
            if (placement === DEFAULT_PLACEMENT) {
                let target;
                if (subnode.isA(GridRow)) {
                    target = this.content;
                } else if (subnode.isA(GridColHdr)) {
                    target = this.header;
                }
                
                if (target) {
                    if (subnode.gridController !== this) subnode.setGridController(this);
                    return target;
                }
            }
            
            return this.callSuper(placement, subnode);
        },
        
        /** @overrides myt.GridController */
        doSort: function() {
            const [sortField, sortOrder] = this.sort ?? ['', ''],
                sortFunc = this.getSortFunction(sortField, sortOrder);
            if (sortFunc) {
                const content = this.content, 
                    yLayout = content.yLayout;
                this.rows.sort(sortFunc);
                content.sortSubviews(sortFunc);
                yLayout.sortSubviews(sortFunc);
                yLayout.update();
            }
        },
        
        /** Gets the sort function used to sort the rows. Subclasses and instances should 
            implement this as needed.
            @param {string} sortColumnId,
            @param {string} sortOrder
            @returns {!Function}  a comparator function used for sorting. */
        getSortFunction: (sortColumnId, sortOrder) => {
            if (sortColumnId) {
                // Default sort function uses the 'text' attribute of 
                // the subview.
                const sortNum = sortOrder === 'ascending' ? 1 : -1,
                    columnName = sortColumnId + 'View';
                return (a, b) => {
                    const aValue = a[columnName].text,
                        bValue = b[columnName].text;
                    if (aValue > bValue) {
                        return sortNum;
                    } else if (bValue > aValue) {
                        return -sortNum;
                    }
                    return 0;
                };
            }
        }
    });
    
    /** A simple implementation of a grid column header.
        
        Attributes:
            sortIconColor:color the color to fill the sort icon with if shown. Defaults to '#666'.
        
        @class */
    pkg.SimpleGridColHdr = new JSClass('SimpleGridColHdr', pkg.SimpleTextButton, {
        include: [GridColHdr],
        
        
        // Life Cycle //////////////////////////////////////////////////////////
        /** @overrides myt.View */
        initNode: function(parent, attrs) {
            const self = this;
            
            attrs.activeColor ??= '#999';
            attrs.hoverColor ??= '#bbb';
            attrs.readyColor ??= '#aaa';
            attrs.inset ??= 2;
            attrs.sortIconColor ??= '#666';
            
            const outset = attrs.outset ?? 2;
            delete attrs.outset;
            
            self.callSuper(parent, attrs);
            
            self.sortIcon = new pkg.FontAwesome(self, {
                align:'right', alignOffset:3, valign:'middle', textColor:self.sortIconColor
            }, [{
                initNode: function(parent, attrs) {
                    this.callSuper(parent, attrs);
                    this.getIDS().fontSize = '0.7em'; // Looks better a bit smaller.
                },
                sizeViewToDom: function() {
                    this.callSuper();
                    self.setOutset(this.width + outset);
                    updateTextWidth(self);
                }
            }]);
            
            self.textView.enableEllipsis();
            
            self.setDisabled(!self.sortable);
            updateTextWidth(self);
            updateSortIcon(self);
        },
        
        
        // Accessors ///////////////////////////////////////////////////////////
        setSortIconColor: function(v) {
            this.sortIconColor = v;
            if (this.sortIcon) this.sortIcon.setTextColor(v);
        },
        
        /** @overrides myt.GridColHdr */
        setSortable: function(v) {
            this.callSuper(v);
            if (this.inited) {
                if (v) this.setOutset(14);
                this.setDisabled(!v);
                updateSortIcon(this);
            }
        },
        
        /** @overrides myt.GridColHdr */
        setSortState: function(v) {
            this.callSuper(v);
            if (this.inited) updateSortIcon(this);
        },
        
        /** @overrides myt.View */
        setWidth: function(v, suppressEvent) {
            this.callSuper(v, suppressEvent);
            if (this.inited) updateTextWidth(this);
        },
        
        
        // Methods /////////////////////////////////////////////////////////////
        doActivated: function() {
            if (!this.disabled) {
                this.setSortState(this.sortState === 'ascending' ? 'descending' : 'ascending');
                this.gridController.setSort([this.columnId, this.sortState]);
            }
        },
        
        /** @overrides myt.SimpleButton */
        drawDisabledState: function() {this.draw(this.readyColor, 1);}
    });
})(myt);

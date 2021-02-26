((pkg) => {
    const findLastColumn = (controller) => {
            const hdrs = controller.columnHeaders;
            let i = hdrs.length;
            while (i) {
                const hdr = hdrs[--i];
                if (hdr.visible) return hdr;
            }
            return null;
        },
        
        notifyHeadersOfSortState = (controller) => {
            const hdrs = controller.columnHeaders,
                sort = controller.sort,
                sortColumnId = sort ? sort[0] : '',
                sortOrder = sort ? sort[1] : '';
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
        
        /* Calculate resize amounts and distribute it to the headers */
        calculateAndDistribute = (hdrs, extra, isFlex, nextFunc) => {
            if (extra !== 0) {
                const isGrow = extra > 0;
                
                // Get resizable column info
                const resizeInfo = [];
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
                    let idx = 0,
                        fullCount = 0;
                    while (extra !== 0) {
                        const info = resizeInfo[idx],
                            hdr = info.hdr;
                        
                        if (info.full) {
                            ++fullCount;
                        } else {
                            let incr;
                            if (isGrow) {
                                incr = Math.min(isFlex ? hdr.flex : 1, extra);
                                if (info.amt + incr > info.limit) {
                                    incr = info.limit - info.amt;
                                    info.full = true;
                                }
                            } else {
                                incr = Math.max(isFlex ? -hdr.flex : -1, extra);
                                if (info.amt + incr < info.limit) {
                                    incr = info.limit - info.amt;
                                    info.full = true;
                                }
                            }
                            info.amt += incr;
                            extra -= incr;
                        }
                        
                        if (fullCount === resizeCount) break;
                        
                        ++idx;
                        if (idx === resizeCount) {
                            idx = 0;
                            fullCount = 0;
                        }
                    }
                    
                    // Distribute
                    resizeInfo.forEach(info => {info.hdr.setValue(info.hdr.value + info.amt);});
                    
                    if (nextFunc) nextFunc(extra);
                }
            }
        };
    
    /** Coordinates the behavior of a grid.
        
        Events:
            sort:array
            maxWidth:number
            minWidth:number
        
        Attributes:
            maxWidth:number the sum of the maximum widths of the columns.
            minWidth:number the sum of the minimum widths of the columns.
            gridWidth:number the width of the grid component.
            fitToWidth:boolean determines if the columns will always fill up the
                width of the grid or not. Defaults to true.
            lastColumn:myt.GridColumnHeader Holds a reference to the last
                column header.
            sort:array An array containing the id of the column to sort by and
                the order to sort by.
            locked:boolean Prevents the grid from updating the UI. Defaults to
                true. After a grid has been setup a call should be made to
                setLocked(false)
        
        Private Attributes:
            columnHeaders:array An array of column headers in this grid.
            rows:array An array of rows in this grid.
            __tempLock:boolean Prevents "change" notifications from being processed.
        
        @class */
    pkg.GridController = new JS.Module('GridController', {
        // Life Cycle //////////////////////////////////////////////////////////
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
        
        
        // Accessors ///////////////////////////////////////////////////////////
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
                
                // Reset min/max since notifyColumnHeaderVisibilityChange will
                // update these values
                this.setMaxWidth(0);
                this.setMinWidth(0);
                this.columnHeaders.forEach(hdr => {
                    this.notifyColumnHeaderXChange(hdr);
                    this.notifyColumnHeaderWidthChange(hdr);
                    this.notifyColumnHeaderVisibilityChange(hdr);
                });
                
                this.doSort();
            }
        },
        
        isLocked: function() {
            return this.locked || this.__tempLock;
        },
        
        setGridWidth: function(v) {
            if (v !== null && typeof v === 'object') v = v.value;
            
            if (this.gridWidth !== v) {
                this.gridWidth = v;
                if (this.inited) this.fitHeadersToWidth();
            }
        },
        
        
        // Methods /////////////////////////////////////////////////////////////
        /** Sorts the rows according to the current sort criteria. Subclasses and
            instances should implement this as needed.
            @returns {undefined} */
        doSort: () => {},
        
        // Column Headers
        /** Gets the column header before the provided one.
            @param {!Object} columnHeader
            @returns {?Object} The myt.GridColumnHeader or null if none exists. */
        getPrevColumnHeader: function(columnHeader) {
            const hdrs = this.columnHeaders;
            let idx = this.getColumnHeaderIndex(columnHeader);
            if (idx > 0) {
                while (idx) {
                    const hdr = hdrs[--idx];
                    if (hdr.visible) return hdr;
                }
            }
            return null;
        },
        
        /** Gets the column header after the provided one.
            @param {!Object} columnHeader
            @returns {?Object} The myt.GridColumnHeader or null if none exists. */
        getNextColumnHeader: function(columnHeader) {
            const hdrs = this.columnHeaders,
                len = hdrs.length;
            let idx = this.getColumnHeaderIndex(columnHeader) + 1;
            if (idx > 0 && idx < len) {
                for (; len > idx; idx++) {
                    const hdr = hdrs[idx];
                    if (hdr.visible) return hdr;
                }
            }
            return null;
        },
        
        hasColumnHeader: function(columnHeader) {
            return this.getColumnHeaderIndex(columnHeader) !== -1;
        },
        
        getColumnHeaderIndex: function(columnHeader) {
            return this.columnHeaders.indexOf(columnHeader);
        },
        
        getColumnHeaderById: function(columnId) {
            const hdrs = this.columnHeaders;
            let i = hdrs.length;
            while (i) {
                const hdr = hdrs[--i];
                if (hdr.columnId === columnId) return hdr;
            }
            return null;
        },
        
        getVisibleColumnHeaders: function() {
            return this.columnHeaders.filter(hdr => hdr.visible);
        },
        
        notifyAddColumnHeader: function(columnHeader) {
            if (!this.hasColumnHeader(columnHeader)) {
                this.columnHeaders.push(columnHeader);
                if (columnHeader.visible) this.setLastColumn(columnHeader);
            }
        },
        
        notifyRemoveColumnHeader: function(columnHeader) {
            const idx = this.getColumnHeaderIndex(columnHeader);
            if (idx >= 0) {
                this.columnHeaders.splice(idx, 1);
                if (columnHeader.visible && columnHeader.last) this.setLastColumn(this.getPrevColumnHeader(columnHeader));
            }
        },
        
        notifyColumnHeaderXChange: function(columnHeader) {
            if (!this.isLocked()) this.rows.forEach(row => {row.notifyColumnHeaderXChange(columnHeader);});
        },
        
        notifyColumnHeaderWidthChange: function(columnHeader) {
            if (!this.isLocked()) this.rows.forEach(row => {row.notifyColumnHeaderWidthChange(columnHeader);});
        },
        
        notifyColumnHeaderVisibilityChange: function(columnHeader) {
            if (!this.isLocked()) {
                this.updateRowsForVisibilityChange(columnHeader);
                
                this.setLastColumn(findLastColumn(this));
                
                const adjMultiplier = columnHeader.visible ? 1 : -1;
                this.setMaxWidth(this.maxWidth + columnHeader.maxValue * adjMultiplier);
                this.setMinWidth(this.minWidth + columnHeader.minValue * adjMultiplier);
                
                this.fitHeadersToWidth();
            }
        },
        
        updateRowsForVisibilityChange: function(columnHeader) {
            this.rows.forEach(row => {row.notifyColumnHeaderVisibilityChange(columnHeader);});
        },
        
        // Rows
        hasRow: function(row) {
            return this.getRowIndex(row) !== -1;
        },
        
        getRowIndex: function(row) {
            return this.rows.indexOf(row);
        },
        
        /** Gets a row for the provided id and matcher function. If no matcher
            function is provided a default function will be used that assumes
            each row has a model property and that model property has an id
            property.
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
                        row.notifyColumnHeaderXChange(hdr);
                        row.notifyColumnHeaderWidthChange(hdr);
                        row.notifyColumnHeaderVisibilityChange(hdr);
                    });
                    
                    if (!doNotSort) this.doSort();
                }
            }
        },
        
        notifyRemoveRow: function(row) {
            const idx = this.getRowIndex(row);
            if (idx >= 0) this.rows.splice(idx, 1);
        },
        
        fitHeadersToWidth: function() {
            if (!this.locked && this.fitToWidth) {
                // Determine extra width to distribute/consume
                const hdrs = this.getVisibleColumnHeaders();
                let maxExtent = 0;
                hdrs.forEach(hdr => {maxExtent = Math.max(maxExtent, hdr.x + hdr.width);});
                
                // Distribute extra width to resizable flex columns and then to non-flex columns.
                calculateAndDistribute(hdrs, this.gridWidth - maxExtent, true, (extra) => {
                    calculateAndDistribute(hdrs, extra, false, null);
                });
            }
        }
    });
})(myt);

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
*/
myt.GridController = new JS.Module('GridController', {
    // Life Cycle //////////////////////////////////////////////////////////////
    initNode: function(parent, attrs) {
        this.columnHeaders = [];
        this.rows = [];
        
        this.maxWidth = this.minWidth = this.gridWidth = 0;
        this.fitToWidth = this.locked = true;
        
        this.callSuper(parent, attrs);
        
        this._fitToWidth();
        this._notifyHeadersOfSortState();
        if (!this.locked) this.doSort();
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setSort: function(v) {
        if (!myt.areArraysEqual(v, this.sort)) {
            this.sort = v;
            if (this.inited) {
                this.fireNewEvent('sort', v);
                this._notifyHeadersOfSortState();
                if (!this.locked) this.doSort();
            }
        }
    },
    
    setLastColumn: function(v) {
        var cur = this.lastColumn;
        if (cur !== v) {
            if (cur) cur.setLast(false);
            this.lastColumn = v;
            if (v) v.setLast(true);
        }
    },
    
    setFitToWidth: function(v) {this.fitToWidth = v;},
    
    setLocked: function(v) {
        this.locked = v;
        if (this.inited && !v) {
            this.__tempLock = true; // Prevent change calls during fitToWidth
            this._fitToWidth();
            this.__tempLock = false;
            
            var hdrs = this.columnHeaders, i = hdrs.length, hdr;
            while (i) {
                hdr = hdrs[--i];
                this.notifyColumnHeaderXChange(hdr);
                this.notifyColumnHeaderWidthChange(hdr);
            }
            
            this.doSort();
        }
    },
    
    setMaxWidth: function(v) {
        if (this.maxWidth !== v) {
            this.maxWidth = v;
            if (this.inited) this.fireNewEvent('maxWidth', v);
        }
    },
    
    setMinWidth: function(v) {
        if (this.minWidth !== v) {
            this.minWidth = v;
            if (this.inited) this.fireNewEvent('minWidth', v);
        }
    },
    
    setGridWidth: function(v) {
        if (v !== null && typeof v === 'object') v = v.value;
        
        if (this.gridWidth !== v) {
            this.gridWidth = v;
            if (this.inited) this._fitToWidth();
        }
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    _fitToWidth: function() {
        if (this.locked || !this.fitToWidth) return;
        
        var hdrs = this.columnHeaders, len = hdrs.length, i = len, hdr;
        
        // Determine max extent
        var maxExtent = 0, extent;
        while(i) {
            hdr = hdrs[--i];
            extent = hdr.x + hdr.width;
            if (extent > maxExtent) maxExtent = extent;
        }
        
        var extra = this.gridWidth - maxExtent;
        
        if (extra === 0) return;
        var isGrow = extra > 0;
        
        // Get resizable columns
        var resizeInfo = [], limit;
        i = len;
        while(i) {
            hdr = hdrs[--i];
            if (hdr.resizable && hdr.flex > 0) {
                limit = (isGrow ? hdr.maxValue : hdr.minValue) - hdr.value;
                resizeInfo.push({hdr:hdr, limit:limit, amt:0});
            }
        }
        
        // Abort if no resizable flex columns.
        var resizeCount = resizeInfo.length;
        if (resizeCount <= 0) return;
        
        // Calculate resize amounts
        var idx = 0, fullCount = 0, incr, info;
        while (extra !== 0) {
            info = resizeInfo[idx];
            hdr = info.hdr;
            
            if (!info.full) {
                if (isGrow) {
                    incr = Math.min(hdr.flex, extra);
                    if (info.amt + incr > info.limit) {
                        incr = info.limit - info.amt;
                        info.full = true;
                    }
                } else {
                    incr = Math.max(-hdr.flex, extra);
                    if (info.amt + incr < info.limit) {
                        incr = info.limit - info.amt;
                        info.full = true;
                    }
                }
                info.amt += incr;
                extra -= incr;
            } else {
                ++fullCount;
            }
            
            if (fullCount === resizeCount) break;
            
            ++idx;
            if (idx === resizeCount) {
                idx = 0;
                fullCount = 0;
            }
        }
        
        // Distribute amounts
        i = resizeCount;
        while (i) {
            info = resizeInfo[--i];
            hdr = info.hdr;
            hdr.setValue(hdr.value + info.amt);
        }
        
        // Distribute remaing extra to resizable non-flex columns
        if (extra !== 0) {
            // Get resizable columns
            resizeInfo = [];
            i = len;
            while(i) {
                hdr = hdrs[--i];
                if (hdr.resizable && hdr.flex === 0) {
                    limit = (isGrow ? hdr.maxValue : hdr.minValue) - hdr.value;
                    resizeInfo.push({hdr:hdr, limit:limit, amt:0});
                }
            }
            
            // Abort if no resizable columns.
            resizeCount = resizeInfo.length;
            if (resizeCount <= 0) return;
            
            // Calculate resize amounts
            idx = 0;
            fullCount = 0;
            while (extra !== 0) {
                info = resizeInfo[idx];
                hdr = info.hdr;
                
                if (!info.full) {
                    if (isGrow) {
                        incr = Math.min(1, extra);
                        if (info.amt + incr > info.limit) {
                            incr = info.limit - info.amt;
                            info.full = true;
                        }
                    } else {
                        incr = Math.max(-1, extra);
                        if (info.amt + incr < info.limit) {
                            incr = info.limit - info.amt;
                            info.full = true;
                        }
                    }
                    info.amt += incr;
                    extra -= incr;
                } else {
                    ++fullCount;
                }
                
                if (fullCount === resizeCount) break;
                
                ++idx;
                if (idx === resizeCount) {
                    idx = 0;
                    fullCount = 0;
                }
            }
            
            // Distribute amounts
            i = resizeCount;
            while (i) {
                info = resizeInfo[--i];
                hdr = info.hdr;
                hdr.setValue(hdr.value + info.amt);
            }
        }
    },
    
    // Sorting
    _notifyHeadersOfSortState: function() {
        var hdrs = this.columnHeaders, i = hdrs.length, hdr,
            sort = this.sort,
            sortColumnId = sort ? sort[0] : '',
            sortOrder = sort ? sort[1] : '';
        while (i) {
            hdr = hdrs[--i];
            if (hdr.columnId === sortColumnId) {
                if (hdr.sortable) hdr.setSortState(sortOrder);
            } else {
                hdr.setSortState('none');
            }
        }
    },
    
    /** Sorts the rows according to the current sort criteria. Subclasses and
        instances should implement this as needed.
        @returns void */
    doSort: function() {},
    
    // Column Headers
    /** Gets the column header before the provided one.
        @returns myt.GridColumnHeader or null if none exists. */
    getPrevColumnHeader: function(columnHeader) {
        var idx = this.getColumnHeaderIndex(columnHeader) - 1;
        return idx >= 0 ? this.columnHeaders[idx] : null;
    },
    
    /** Gets the column header after the provided one.
        @returns myt.GridColumnHeader or null if none exists. */
    getNextColumnHeader: function(columnHeader) {
        var idx = this.getColumnHeaderIndex(columnHeader) + 1;
        var hdrs = this.columnHeaders;
        return idx > 0 && idx < hdrs.length ? hdrs[idx] : null;
    },
    
    hasColumnHeader: function(columnHeader) {
        return this.getColumnHeaderIndex(columnHeader) !== -1;
    },
    
    getColumnHeaderIndex: function(columnHeader) {
        return this.columnHeaders.indexOf(columnHeader);
    },
    
    notifyAddColumnHeader: function(columnHeader) {
        if (!this.hasColumnHeader(columnHeader)) {
            this.columnHeaders.push(columnHeader);
            this.setLastColumn(columnHeader);
            this.setMaxWidth(this.maxWidth + columnHeader.maxValue);
            this.setMinWidth(this.minWidth + columnHeader.minValue);
            this._fitToWidth();
        }
    },
    
    notifyRemoveColumnHeader: function(columnHeader) {
        var idx = this.getColumnHeaderIndex(columnHeader);
        if (idx >= 0) {
            var hdrs = this.columnHeaders;
            hdrs.splice(idx, 1);
            if (columnHeader.last) this.setLastColumn(hdrs[hdrs.length - 1]);
            this.setMaxWidth(this.maxWidth - columnHeader.maxValue);
            this.setMinWidth(this.minWidth - columnHeader.minValue);
            this._fitToWidth();
        }
    },
    
    notifyColumnHeaderXChange: function(columnHeader) {
        if (this.locked || this.__tempLock) return;
        var rows = this.rows, i = rows.length;
        while (i) rows[--i].notifyColumnHeaderXChange(columnHeader);
    },
    
    notifyColumnHeaderWidthChange: function(columnHeader) {
        if (this.locked || this.__tempLock) return;
        var rows = this.rows, i = rows.length;
        while (i) rows[--i].notifyColumnHeaderWidthChange(columnHeader);
    },
    
    // Rows
    hasRow: function(row) {
        return this.getRowIndex(row) !== -1;
    },
    
    getRowIndex: function(row) {
        return this.rows.indexOf(row);
    },
    
    notifyAddRow: function(row) {
        if (!this.hasRow(row)) {
            this.rows.push(row);
            
            // Update cell positions
            if (!this.locked) {
                var hdrs = this.columnHeaders, i = hdrs.length, hdr;
                while (i) {
                    hdr = hdrs[--i];
                    row.notifyColumnHeaderXChange(hdr);
                    row.notifyColumnHeaderWidthChange(hdr);
                }
                
                this.doSort();
            }
        }
    },
    
    notifyRemoveRow: function(row) {
        var idx = this.getRowIndex(row);
        if (idx >= 0) this.rows.splice(idx, 1);
    }
});

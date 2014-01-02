/** Coordinates the behavior of a grid.
    
    Attributes:
        maxWidth:number the sum of the maximum widths of the columns.
        minWidth:number the sum of the minimum widths of the columns.
        gridWidth:number the width of the grid component.
*/
myt.GridController = new JS.Module('GridController', {
    // Life Cycle //////////////////////////////////////////////////////////////
    initNode: function(parent, attrs) {
        this.columnHeaders = [];
        this.rows = [];
        
        this.maxWidth = this.minWidth = this.gridWidth = 0;
        
        this.callSuper(parent, attrs);
        
        this._updateHeaders();
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setMaxWidth: function(v) {
        if (this.maxWidth !== v) {
            this.maxWidth = v;
            if (this.inited) {
                this.fireNewEvent('maxWidth', v);
                //this._updateHeaders();
            }
        }
    },
    
    setMinWidth: function(v) {
        if (this.minWidth !== v) {
            this.minWidth = v;
            if (this.inited) {
                this.fireNewEvent('minWidth', v);
                //this._updateHeaders();
            }
        }
    },
    
    setGridWidth: function(v) {
        if (v !== null && typeof v === 'object') v = v.value;
        
        if (this.gridWidth !== v) {
            this.gridWidth = v;
            if (this.inited) this._updateHeaders();
        }
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    _updateHeaders: function() {
        /*
        // Count resizable columns
        var hdrs = this.columnHeaders, len = hdrs.length, i = len, hdr,
            resizeSum = 0, maxExtent = 0, extent;
        while(i) {
            hdr = hdrs[--i];
            if (hdr.flex > 0) resizeSum += hdr.flex;
            extent = hdr.x + hdr.width;
            if (extent > maxExtent) maxExtent = extent;
        }
        
        // Determine extra per flex column
        var extra = Math.max(this.gridWidth - maxExtent, 0);
        var extraPerFlex = resizeSum > 0 ? Math.floor(extra / resizeSum) : 0;
        var remainder = extra - (extraPerFlex * resizeSum);
        
        var firstFlex = true;
        for (i = 0; len > i; ++i) {
            hdr = hdrs[i];
            if (hdr.flex > 0) {
                hdr.setValue(hdr.value + extraPerFlex + (firstFlex ? remainder : 0));
                firstFlex = false;
            }
        }
        
        */
        
        /*if (this.__locked) return;
        
        this.__locked = true;
        
        var hdrs = this.columnHeaders, len = hdrs.length, i = 0, hdr;
        
        // Do basic layout
        var x = 0;
        for (; len > i; ++i) {
            hdr = hdrs[i];
            
            hdr.setX(x);
            x += hdr.width;
        }
        
        // Expand flex headers if necessary
        var min = Math.max(this.minWidth, this.gridWidth);
        
        if (min > x) {
            var extra = min - x;
            
            // Count resizable columns
            var resizeSum = 0;
            i = len;
            while(i) {
                hdr = hdrs[--i];
                if (hdr.flex > 0) resizeSum += hdr.flex;
            }
            
            // Determine extra per flex column
            var extraPerFlex = resizeSum > 0 ? Math.floor(extra / resizeSum) : 0;
            var remainder = extra - (extraPerFlex * resizeSum);
            
            x = 0, firstFlex = true;
            for (i = 0; len > i; ++i) {
                hdr = hdrs[i];
                
                hdr.setX(x);
                
                if (hdr.flex > 0) {
                    hdr.setWidth(hdr.width + extraPerFlex + (firstFlex ? remainder : 0));
                    firstFlex = false;
                }
                
                x += hdr.width;
            }
        }
        
        this.__locked = false;
        
        console.log('here', min);
        */
    },
    
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
            this.setMaxWidth(this.maxWidth + columnHeader.maxValue);
            this.setMinWidth(this.minWidth + columnHeader.minValue);
            this._updateHeaders();
        }
    },
    
    notifyRemoveColumnHeader: function(columnHeader) {
        var idx = this.getColumnHeaderIndex(columnHeader);
        if (idx >= 0) {
            this.columnHeaders.splice(idx, 1);
            this.setMaxWidth(this.maxWidth - columnHeader.maxValue);
            this.setMinWidth(this.minWidth - columnHeader.minValue);
            this._updateHeaders();
        }
    },
    
    notifyColumnHeaderXChange: function(columnHeader) {
        var rows = this.rows, i = rows.length;
        while (i) rows[--i].notifyColumnHeaderXChange(columnHeader);
    },
    
    notifyColumnHeaderWidthChange: function(columnHeader) {
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
        }
    },
    
    notifyRemoveRow: function(row) {
        var idx = this.getRowIndex(row);
        if (idx >= 0) this.rows.splice(idx, 1);
    }
});

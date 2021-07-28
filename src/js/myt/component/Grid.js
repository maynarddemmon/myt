((pkg) => {
    const JSClass = JS.Class,
        JSModule = JS.Module,
        
        View = pkg.View,
        
        defAttr = pkg.AccessorSupport.defAttr,
        
        // GridController
        findLastColumn = controller => {
            const hdrs = controller.columnHeaders;
            let i = hdrs.length;
            while (i) {
                const hdr = hdrs[--i];
                if (hdr.visible) return hdr;
            }
            return null;
        },
        
        notifyHeadersOfSortState = controller => {
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
                let i = hdrs.length,
                    hdr;
                while (i) {
                    hdr = hdrs[--i];
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
                        const info = resizeInfo[idx];
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
        },
        
        // GridColumnHeader
        defaultMaxValue = 9999,
        
        getPrevColumnHeader = gridHeader => gridHeader.gridController ? gridHeader.gridController.getPrevColumnHeader(gridHeader) : null,
        
        getNextColumnHeader = gridHeader => gridHeader.gridController ? gridHeader.gridController.getNextColumnHeader(gridHeader) : null,
        
        getGiveLeft = gridHeader => {
            const hdr = getPrevColumnHeader(gridHeader);
            return hdr ? hdr.maxValue - hdr.value + getGiveLeft(hdr) : 0;
        },
        
        getGiveRight = gridHeader => {
            const hdr = getNextColumnHeader(gridHeader);
            return hdr ? hdr.maxValue - hdr.value + getGiveRight(hdr) : 0;
        },
        
        getTakeLeft = gridHeader => {
            const hdr = getPrevColumnHeader(gridHeader);
            return hdr ? hdr.minValue - hdr.value + getTakeLeft(hdr) : 0;
        },
        
        getTakeRight = gridHeader => {
            const hdr = getNextColumnHeader(gridHeader);
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
            const hdr = getPrevColumnHeader(gridHeader);
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
            const hdr = getPrevColumnHeader(gridHeader);
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
            const hdr = getNextColumnHeader(gridHeader);
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
            const hdr = getNextColumnHeader(gridHeader);
            if (hdr) {
                const newValue = hdr.value + diff;
                if (hdr.resizable) hdr.setValue(newValue);
                const remainingDiff = newValue - hdr.value;
                if (remainingDiff > 0) giveNextWidth(hdr, remainingDiff);
            }
        },
        
        // GridRow
        getRowSubview = (gridRow, columnHeader) => gridRow[columnHeader.columnId + 'View'],
        
        // SimpleGridColumnHeader
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
                fitToWidth:boolean determines if the columns will always fill 
                    up the width of the grid or not. Defaults to true.
                lastColumn:myt.GridColumnHeader Holds a reference to the last
                    column header.
                sort:array An array containing the id of the column to sort by 
                    and the order to sort by.
                locked:boolean Prevents the grid from updating the UI. Defaults 
                    to true. After a grid has been setup a call should be made 
                    to setLocked(false)
            
            Private Attributes:
                columnHeaders:array An array of column headers in this grid.
                rows:array An array of rows in this grid.
                __tempLock:boolean Prevents "change" notifications from 
                    being processed.
            
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
                    
                    // Reset min/max since notifyColumnHeaderVisibilityChange 
                    // will update these values
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
                v = this.valueFromEvent(v);
                if (this.gridWidth !== v) {
                    this.gridWidth = v;
                    if (this.inited) this.fitHeadersToWidth();
                }
            },
            
            
            // Methods /////////////////////////////////////////////////////////
            /** Sorts the rows according to the current sort criteria. 
                Subclasses and instances should implement this as needed.
                @returns {undefined} */
            doSort: () => {},
            
            // Column Headers
            /** Gets the column header before the provided one.
                @param {!Object} columnHeader
                @returns {?Object} The myt.GridColumnHeader or null if none 
                    exists. */
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
                @returns {?Object} The myt.GridColumnHeader or null if 
                    none exists. */
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
            
            /** Gets a row for the provided id and matcher function. If no 
                matcher function is provided a default function will be used 
                that assumes each row has a model property and that model 
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
                    calculateAndDistribute(hdrs, this.gridWidth - maxExtent, true, extra => {
                        calculateAndDistribute(hdrs, extra, false, null);
                    });
                }
            }
        }),
        
        /** Makes a view behave as a grid column header.
            
            Events:
                sortable:boolean
                sortState:string
                resizable:boolean
            
            Attributes:
                columnId:string The unique ID for this column relative to the 
                    grid it is part of.
                gridController:myt.GridController the controller for the grid 
                    this component is part of.
                flex:number If 1 or more the column will get extra space if 
                    any exists.
                resizable:boolean Indicates if this column can be resized or 
                    not. Defaults to true.
                last:boolean Indicates if this is the last column header or not.
                sortable:boolean Indicates if this column can be sorted or not.
                    Defaults to true.
                sortState:string The sort state of this column. Allowed 
                    values are:
                        'ascending': Sorted in ascending order.
                        'descending': Sorted in descending order.
                        'none': Not currently an active sort column.
                cellXAdj:number The amount to shift the x values of cells 
                    updated by this column. Defaults to 0.
                cellWidthAdj:number The amount to grow/shrink the width of cells 
                    updated by this column. Defaults to 0.
            
            @class */
        GridColumnHeader = pkg.GridColumnHeader = new JSModule('GridColumnHeader', {
            include: [pkg.BoundedValueComponent],
            
            
            // Life Cycle //////////////////////////////////////////////////////
            initNode: function(parent, attrs) {
                const self = this;
                
                defAttr(attrs, 'minValue', 16);
                defAttr(attrs, 'maxValue', defaultMaxValue);
                defAttr(attrs, 'resizable', true);
                defAttr(attrs, 'flex', 0);
                defAttr(attrs, 'cellXAdj', 0);
                defAttr(attrs, 'cellWidthAdj', 0);
                defAttr(attrs, 'sortable', true);
                defAttr(attrs, 'sortState', 'none');
                
                // Ensure participation in determinePlacement method of myt.Grid
                defAttr(attrs, 'placement', '*');
                
                self.callSuper(parent, attrs);
                
                const gc = self.gridController;
                
                new View(self, {
                    name:'resizer', cursor:'col-resize', width:10, zIndex:1,
                    percentOfParentHeight:100, align:'right', alignOffset:-5,
                    draggableAllowBubble:false
                }, [pkg.SizeToParent, pkg.Draggable, {
                    requestDragPosition: function(x, y) {
                        let diff = x - this.x,
                            growAmt,
                            shrinkAmt,
                            newValue;
                        
                        if (gc.fitToWidth) {
                            if (diff > 0) {
                                // Get amount that this header can grow
                                growAmt = self.maxValue - self.value;
                                diff = Math.min(diff, Math.min(-getTakeRight(self), growAmt + getGiveLeft(self)));
                            } else if (diff < 0) {
                                // Get amount that this header can shrink
                                shrinkAmt = self.minValue - self.value;
                                diff = Math.max(diff, Math.max(-getGiveRight(self), shrinkAmt + getTakeLeft(self)));
                            }
                            
                            if (diff === 0) return;
                        }
                        
                        newValue = self.value + diff;
                        
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
                    gc.notifyAddColumnHeader(self);
                    gc.notifyColumnHeaderXChange(self);
                    gc.notifyColumnHeaderVisibilityChange(self);
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
            
            setLast: function(v) {
                this.last = v;
                if (this.inited) updateLast(this);
            },
            
            setGridController: function(v) {
                const existing = this.gridController;
                if (existing !== v) {
                    if (existing) existing.notifyRemoveColumnHeader(this);
                    this.gridController = v;
                    if (this.inited && v) {
                        v.notifyAddColumnHeader(this);
                        v.notifyColumnHeaderXChange(this);
                        v.notifyColumnHeaderWidthChange(this);
                        v.notifyColumnHeaderVisibilityChange(this);
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
                    oldMinValue = self.minValue || 0, 
                    gc = self.gridController;
                self.callSuper(v);
                if (self.inited && gc && oldMinValue !== self.minValue) gc.setMinWidth(gc.minWidth + self.minValue - oldMinValue);
            },
            
            /** @overrides myt.BoundedValueComponent */
            setMaxValue: function(v) {
                const self = this,
                    oldMaxValue = self.maxValue || 0,
                    gc = self.gridController;
                if (v == null) v = defaultMaxValue;
                self.callSuper(v);
                if (self.inited && gc && oldMaxValue !== self.maxValue) gc.setMaxWidth(gc.maxWidth + self.maxValue - oldMaxValue);
            },
            
            /** @overrides myt.View */
            setWidth: function(v, supressEvent) {
                const self = this,
                    cur = self.width;
                self.callSuper(v, supressEvent);
                if (self.inited && self.gridController && cur !== self.width) self.gridController.notifyColumnHeaderWidthChange(self);
            },
            
            /** @overrides myt.View */
            setX: function(v) {
                const self = this,
                    cur = self.x;
                self.callSuper(v);
                if (self.inited && self.gridController && cur !== self.x) self.gridController.notifyColumnHeaderXChange(self);
            },
            
            /** @overrides myt.View */
            setVisible: function(v) {
                const self = this,
                    cur = self.visible;
                self.callSuper(v);
                if (self.inited && self.gridController && cur !== self.visible) self.gridController.notifyColumnHeaderVisibilityChange(self);
            }
        }),
        
        /** Makes a view behave as a row in a grid.
            
            Attributes:
                gridController:myt.GridConstroller A reference to the grid 
                    controller that is managing this row.
            
            @class */
        GridRow = pkg.GridRow = new JSModule('GridRow', {
            // Life Cycle //////////////////////////////////////////////////////
            initNode: function(parent, attrs) {
                // Ensure participation in determinePlacement method of myt.Grid
                defAttr(attrs, 'placement', '*');
                
                this.callSuper(parent, attrs);
                
                const gc = this.gridController;
                if (gc) gc.notifyAddRow(this);
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
            notifyColumnHeaderXChange: function(columnHeader) {
                const sv = getRowSubview(this, columnHeader);
                if (sv) sv.setX(columnHeader.x + columnHeader.cellXAdj);
            },
            
            notifyColumnHeaderWidthChange: function(columnHeader) {
                const sv = getRowSubview(this, columnHeader);
                if (sv) sv.setWidth(columnHeader.width + columnHeader.cellWidthAdj);
            },
            
            notifyColumnHeaderVisibilityChange: function(columnHeader) {
                const sv = getRowSubview(this, columnHeader);
                if (sv) sv.setVisible(columnHeader.visible);
            }
        });
    
    /** An implementation of a grid component.
        
        Attributes:
            rowSpacing:number The spacing between rows. Defaults to 1.
            columnSpacing:number the spacing between columns. Defaults to 1.
            sizeHeightToRows:boolean If true, this component will be sized to 
                fit all the rows without showing scrollbars. Defaults to 
                undefined which is equivalent to false.
        
        @class */
    pkg.Grid = new JSClass('Grid', View, {
        include: [GridController],
        
        
        // Life Cycle //////////////////////////////////////////////////////////
        /** @overrides myt.View */
        initNode: function(parent, attrs) {
            const self = this,
                SpacedLayout = pkg.SpacedLayout;
            
            // Allows horizontal scrolling if the grid columns are too wide.
            defAttr(attrs, 'overflow', 'autox');
            
            defAttr(attrs, 'bgColor', '#ccc');
            defAttr(attrs, 'rowSpacing', 1);
            defAttr(attrs, 'columnSpacing', 1);
            
            const isAutoScrolling = attrs.isAutoScrolling;
            delete attrs.isAutoScrolling;
            
            self.callSuper(parent, attrs);
            
            // Build UI
            const header = new View(self, {name:'header', overflow:'hidden'});
            new SpacedLayout(header, {name:'xLayout', locked:true, collapseParent:true, spacing:self.columnSpacing});
            new pkg.SizeToChildren(header, {name:'yLayout', locked:true, axis:'y'});
            
            const sizeHeightToRows = self.sizeHeightToRows,
                contentMixins = isAutoScrolling ? [pkg.AutoScroller] : [],
                content = new View(self, {name:'content', overflow:sizeHeightToRows ? 'hidden' : 'autoy'}, contentMixins);
            new SpacedLayout(content, {name:'yLayout', locked:true, axis:'y', spacing:self.rowSpacing, collapseParent:sizeHeightToRows});
            
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
                svs = content.getSubviews(),
                w = event.value;
            content.setWidth(w);
            svs.forEach(sv => {sv.setWidth(w);});
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
            // Automatically place column headers and rows in the header and
            // content views respectively.
            if (placement === '*') {
                let target;
                if (subnode.isA(GridRow)) {
                    target = this.content;
                } else if (subnode.isA(GridColumnHeader)) {
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
            const sort = this.sort || ['',''],
                sortFunc = this.getSortFunction(sort[0], sort[1]);
            if (sortFunc) {
                const content = this.content, 
                    yLayout = content.yLayout;
                this.rows.sort(sortFunc);
                content.sortSubviews(sortFunc);
                yLayout.sortSubviews(sortFunc);
                yLayout.update();
            }
        },
        
        /** Gets the sort function used to sort the rows. Subclasses and instances
            should implement this as needed.
            @param {string} sortColumnId,
            @param {string} sortOrder
            @returns {!Function}  a comparator function used for sorting. */
        getSortFunction: (sortColumnId, sortOrder) => {
            if (sortColumnId) {
                // Default sort function uses the 'text' attribute of the subview.
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
            sortIconColor:color the color to fill the sort icon with if shown.
                Defaults to '#666666'.
        
        @class */
    pkg.SimpleGridColumnHeader = new JSClass('SimpleGridColumnHeader', pkg.SimpleTextButton, {
        include: [GridColumnHeader],
        
        
        // Life Cycle //////////////////////////////////////////////////////////
        /** @overrides myt.View */
        initNode: function(parent, attrs) {
            const self = this;
            
            defAttr(attrs, 'activeColor', '#999');
            defAttr(attrs, 'hoverColor', '#bbb');
            defAttr(attrs, 'readyColor', '#aaa');
            defAttr(attrs, 'inset', 2);
            defAttr(attrs, 'outset', 2);
            defAttr(attrs, 'sortIconColor', '#666');
            
            self.callSuper(parent, attrs);
            
            new pkg.FontAwesome(self, {
                name:'sortIcon', align:'right', alignOffset:3, valign:'middle', textColor:self.sortIconColor
            }, [{
                initNode: function(parent, attrs) {
                    this.callSuper(parent, attrs);
                    this.getInnerDomStyle().fontSize = '0.7em'; // Looks better a bit smaller.
                },
                sizeViewToDom:function() {
                    this.callSuper();
                    self.setOutset(this.width + 2);
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
        
        /** @overrides myt.GridColumnHeader */
        setSortable: function(v) {
            this.callSuper(v);
            if (this.inited) {
                if (v) this.setOutset(14);
                this.setDisabled(!v);
                updateSortIcon(this);
            }
        },
        
        /** @overrides myt.GridColumnHeader */
        setSortState: function(v) {
            this.callSuper(v);
            if (this.inited) updateSortIcon(this);
        },
        
        /** @overrides myt.View */
        setWidth: function(v, supressEvent) {
            this.callSuper(v, supressEvent);
            if (this.inited) updateTextWidth(this);
        },
        
        
        // Methods /////////////////////////////////////////////////////////////
        doActivated: function() {
            console.log('here');
            if (!this.disabled) {
                switch (this.sortState) {
                    case 'ascending': this.setSortState('descending'); break;
                    case 'descending': this.setSortState('ascending'); break;
                    case 'none': this.setSortState('ascending'); break;
                }
                this.gridController.setSort([this.columnId, this.sortState]);
            }
        },
        
        /** @overrides myt.SimpleButton */
        drawDisabledState: function() {this.draw(this.readyColor, 1);}
    });
})(myt);

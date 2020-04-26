((pkg) => {
    var defaultMaxValue = 9999,
        
        getPrevColumnHeader = (gridHeader) => gridHeader.gridController ? gridHeader.gridController.getPrevColumnHeader(gridHeader) : null,
        
        getNextColumnHeader = (gridHeader) => gridHeader.gridController ? gridHeader.gridController.getNextColumnHeader(gridHeader) : null,
        
        getGiveLeft = (gridHeader) => {
            var hdr = getPrevColumnHeader(gridHeader);
            return hdr ? hdr.maxValue - hdr.value + getGiveLeft(hdr) : 0;
        },
        
        getGiveRight = (gridHeader) => {
            var hdr = getNextColumnHeader(gridHeader);
            return hdr ? hdr.maxValue - hdr.value + getGiveRight(hdr) : 0;
        },
        
        getTakeLeft = (gridHeader) => {
            var hdr = getPrevColumnHeader(gridHeader);
            return hdr ? hdr.minValue - hdr.value + getTakeLeft(hdr) : 0;
        },
        
        getTakeRight = (gridHeader) => {
            var hdr = getNextColumnHeader(gridHeader);
            return hdr ? hdr.minValue - hdr.value + getTakeRight(hdr) : 0;
        },
        
        /*  @param {!Object} gridHeader
            @returns {undefined} */
        updateLast = (gridHeader) => {
            gridHeader.resizer.setVisible(!(gridHeader.last && gridHeader.gridController.fitToWidth));
        },
        
        /*  Steals width from previous column headers.
            @param {!Object} gridHeader
            @param {number} diff - The amount to steal. Will be a negative number.
            @returns {number} - The amount of width actually stolen. */
        stealPrevWidth = (gridHeader, diff) => {
            var hdr = getPrevColumnHeader(gridHeader),
                usedDiff = 0;
            if (hdr) {
                var newValue = hdr.value + diff;
                if (hdr.resizable) hdr.setValue(newValue);
                var remainingDiff = newValue - hdr.value;
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
            var hdr = getPrevColumnHeader(gridHeader),
                usedDiff = 0;
            if (hdr) {
                var newValue = hdr.value + diff;
                if (hdr.resizable) hdr.setValue(newValue);
                var remainingDiff = newValue - hdr.value;
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
            var hdr = getNextColumnHeader(gridHeader);
            if (hdr) {
                var newValue = hdr.value + diff;
                if (hdr.resizable) hdr.setValue(newValue);
                var remainingDiff = newValue - hdr.value;
                if (remainingDiff < 0) stealNextWidth(hdr, remainingDiff);
            }
        },
        
        /*  Gives width to next column headers.
            @param {!Object} gridHeader
            @param {number} diff - The amount to give. Will be a positive number.
            @returns {number} - The amount of width actually given. */
        giveNextWidth = (gridHeader, diff) => {
            var hdr = getNextColumnHeader(gridHeader);
            if (hdr) {
                var newValue = hdr.value + diff;
                if (hdr.resizable) hdr.setValue(newValue);
                var remainingDiff = newValue - hdr.value;
                if (remainingDiff > 0) giveNextWidth(hdr, remainingDiff);
            }
        };
    
    /** Makes a view behave as a grid column header.
        
        Events:
            sortable:boolean
            sortState:string
            resizable:boolean
        
        Attributes:
            columnId:string The unique ID for this column relative to the grid it
                is part of.
            gridController:myt.GridController the controller for the grid this
                component is part of.
            flex:number If 1 or more the column will get extra space if any exists.
            resizable:boolean Indicates if this column can be resized or not.
                Defaults to true.
            last:boolean Indicates if this is the last column header or not.
            sortable:boolean Indicates if this column can be sorted or not.
                Defaults to true.
            sortState:string The sort state of this column. Allowed values are:
                'ascending': Sorted in ascending order.
                'descending': Sorted in descending order.
                'none': Not currently an active sort column.
            cellXAdj:number The amount to shift the x values of cells updated by
                this column. Defaults to 0.
            cellWidthAdj:number The amount to grow/shrink the width of cells 
                updated by this column. Defaults to 0.
        
        @class */
    pkg.GridColumnHeader = new JS.Module('GridColumnHeader', {
        include: [pkg.BoundedValueComponent],
        
        
        // Life Cycle //////////////////////////////////////////////////////////
        initNode: function(parent, attrs) {
            var self = this,
                gc;
            
            if (attrs.minValue == null) attrs.minValue = 16;
            if (attrs.maxValue == null) attrs.maxValue = defaultMaxValue;
            if (attrs.resizable == null) attrs.resizable = true;
            if (attrs.flex == null) attrs.flex = 0;
            if (attrs.cellXAdj == null) attrs.cellXAdj = 0;
            if (attrs.cellWidthAdj == null) attrs.cellWidthAdj = 0;
            
            if (attrs.sortable == null) attrs.sortable = true;
            if (attrs.sortState == null) attrs.sortState = 'none';
            
            // Ensure participation in determinePlacement method of myt.Grid
            if (attrs.placement == null) attrs.placement = '*';
            
            self.callSuper(parent, attrs);
            
            gc = self.gridController;
            
            new pkg.View(self, {
                name:'resizer', cursor:'col-resize', width:10, zIndex:1,
                percentOfParentHeight:100, align:'right', alignOffset:-5,
                draggableAllowBubble:false
            }, [pkg.SizeToParent, pkg.Draggable, {
                requestDragPosition: function(x, y) {
                    var diff = x - this.x,
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
                    var remainingDiff = newValue - self.value,
                        stolenAmt = remainingDiff - diff,
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
        
        
        // Accessors ///////////////////////////////////////////////////////////
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
            var existing = this.gridController;
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
            var self = this,
                oldMinValue = self.minValue || 0, 
                gc = self.gridController;
            self.callSuper(v);
            if (self.inited && gc && oldMinValue !== self.minValue) gc.setMinWidth(gc.minWidth + self.minValue - oldMinValue);
        },
        
        /** @overrides myt.BoundedValueComponent */
        setMaxValue: function(v) {
            var self = this,
                oldMaxValue = self.maxValue || 0,
                gc = self.gridController;
            if (v == null) v = defaultMaxValue;
            self.callSuper(v);
            if (self.inited && gc && oldMaxValue !== self.maxValue) gc.setMaxWidth(gc.maxWidth + self.maxValue - oldMaxValue);
        },
        
        /** @overrides myt.View */
        setWidth: function(v, supressEvent) {
            var self = this,
                cur = self.width;
            self.callSuper(v, supressEvent);
            if (self.inited && self.gridController && cur !== self.width) self.gridController.notifyColumnHeaderWidthChange(self);
        },
        
        /** @overrides myt.View */
        setX: function(v) {
            var self = this,
                cur = self.x;
            self.callSuper(v);
            if (self.inited && self.gridController && cur !== self.x) self.gridController.notifyColumnHeaderXChange(self);
        },
        
        /** @overrides myt.View */
        setVisible: function(v) {
            var self = this,
                cur = self.visible;
            self.callSuper(v);
            if (self.inited && self.gridController && cur !== self.visible) self.gridController.notifyColumnHeaderVisibilityChange(self);
        }
    });
})(myt);

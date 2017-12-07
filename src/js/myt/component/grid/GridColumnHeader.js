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
*/
myt.GridColumnHeader = new JS.Module('GridColumnHeader', {
    include: [myt.BoundedValueComponent],
    
    
    // Class Methods and Attributes ////////////////////////////////////////////
    extend: {
        DEFAULT_MIN_VALUE: 16,
        DEFAULT_MAX_VALUE: 9999
    },
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    initNode: function(parent, attrs) {
        var M = myt,
            GCH = M.GridColumnHeader;
        if (attrs.minValue == null) attrs.minValue = GCH.DEFAULT_MIN_VALUE;
        if (attrs.maxValue == null) attrs.maxValue = GCH.DEFAULT_MAX_VALUE;
        if (attrs.resizable == null) attrs.resizable = true;
        if (attrs.flex == null) attrs.flex = 0;
        if (attrs.cellXAdj == null) attrs.cellXAdj = 0;
        if (attrs.cellWidthAdj == null) attrs.cellWidthAdj = 0;
        
        if (attrs.sortable == null) attrs.sortable = true;
        if (attrs.sortState == null) attrs.sortState = 'none';
        
        // Ensure participation in determinePlacement method of myt.Grid
        if (attrs.placement == null) attrs.placement = '*';
        
        this.callSuper(parent, attrs);
        
        new M.View(this, {
            name:'resizer', cursor:'col-resize', width:10, zIndex:1,
            percentOfParentHeight:100, align:'right', alignOffset:-5,
            draggableAllowBubble:false
        }, [M.SizeToParent, M.Draggable, {
            requestDragPosition: function(x, y) {
                var p = this.parent, gc = p.gridController,
                    diff = x - this.x;
                
                if (gc.fitToWidth) {
                    if (diff > 0) {
                        // Get amount that this header can grow
                        var growAmt = p.maxValue - p.value;
                        // Get amount that can be given on the left
                        var giveLeft = p._getGiveLeft();
                        
                        // Get amount that can be stolen on the right
                        var takeRight = p._getTakeRight();
                        
                        diff = Math.min(diff, Math.min(-takeRight, growAmt + giveLeft));
                    } else if (diff < 0) {
                        // Get amount that this header can shrink
                        var shrinkAmt = p.minValue - p.value;
                        // Get amount that can be stolen on the left
                        var takeLeft = p._getTakeLeft();
                        
                        // Get amount that can be given on the right
                        var giveRight = p._getGiveRight();
                        
                        diff = Math.max(diff, Math.max(-giveRight, shrinkAmt + takeLeft));
                    }
                    
                    if (diff === 0) return;
                }
                
                var newValue = p.value + diff;
                
                if (p.resizable) p.setValue(newValue);
                var remainingDiff = newValue - p.value;
                var stolenAmt = remainingDiff - diff;
                var additionalActualDiff = 0;
                if (remainingDiff < 0) {
                    additionalActualDiff = p._stealPrevWidth(remainingDiff);
                } else if (remainingDiff > 0) {
                    additionalActualDiff = p._givePrevWidth(remainingDiff);
                }
                this.dragInitX += additionalActualDiff;
                stolenAmt -= additionalActualDiff;
                
                if (gc.fitToWidth) {
                    if (stolenAmt < 0) {
                        p._stealNextWidth(stolenAmt);
                    } else if (stolenAmt > 0) {
                        p._giveNextWidth(stolenAmt);
                    }
                }
            }
        }]);
        
        var gc = this.gridController;
        if (gc) {
            gc.notifyAddColumnHeader(this);
            gc.notifyColumnHeaderXChange(this);
            gc.notifyColumnHeaderVisibilityChange(this);
        }
        this.setWidth(this.value);
        this._updateLast();
    },
    
    destroy: function(v) {
        this.setGridController();
        
        this.callSuper(v);
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setSortable: function(v) {this.set('sortable', v, true);},
    setSortState: function(v) {this.set('sortState', v, true);},
    
    setResizable: function(v) {this.set('resizable', v, true);},
    
    setCellWidthAdj: function(v) {this.cellWidthAdj = v;},
    setCellXAdj: function(v) {this.cellXAdj = v;},
    setFlex: function(v) {this.flex = v;},
    setColumnId: function(v) {this.columnId = v;},
    
    setLast: function(v) {
        this.last = v;
        if (this.inited) this._updateLast();
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
        if (v == null) v = myt.GridColumnHeader.DEFAULT_MAX_VALUE;
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
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    getPrevColumnHeader: function() {
        return this.gridController ? this.gridController.getPrevColumnHeader(this) : null;
    },
    
    getNextColumnHeader: function() {
        return this.gridController ? this.gridController.getNextColumnHeader(this) : null;
    },
    
    /** @private */
    _updateLast: function() {
        this.resizer.setVisible(!(this.last && this.gridController.fitToWidth));
    },
    
    /** Steals width from previous column headers.
        @param diff:number the amount to steal. Will be a negative number.
        @returns number:the amount of width actually stolen. */
    _stealPrevWidth: function(diff) {
        var hdr = this.getPrevColumnHeader(),
            usedDiff = 0;
        if (hdr) {
            var newValue = hdr.value + diff;
            if (hdr.resizable) hdr.setValue(newValue);
            var remainingDiff = newValue - hdr.value;
            usedDiff = diff - remainingDiff;
            if (remainingDiff < 0) usedDiff += hdr._stealPrevWidth(remainingDiff);
        }
        
        return usedDiff;
    },
    
    /** Gives width to previous column headers.
        @param diff:number the amount to give. Will be a positive number.
        @returns number:the amount of width actually given. */
    _givePrevWidth: function(diff) {
        var hdr = this.getPrevColumnHeader(),
            usedDiff = 0;
        if (hdr) {
            var newValue = hdr.value + diff;
            if (hdr.resizable) hdr.setValue(newValue);
            var remainingDiff = newValue - hdr.value;
            usedDiff = diff - remainingDiff;
            if (remainingDiff > 0) usedDiff += hdr._givePrevWidth(remainingDiff);
        }
        
        return usedDiff;
    },
    
    /** Steals width from next column headers.
        @param diff:number the amount to steal. Will be a negative number.
        @returns number:the amount of width actually stolen. */
    _stealNextWidth: function(diff) {
        var hdr = this.getNextColumnHeader();
        if (hdr) {
            var newValue = hdr.value + diff;
            if (hdr.resizable) hdr.setValue(newValue);
            var remainingDiff = newValue - hdr.value;
            if (remainingDiff < 0) hdr._stealNextWidth(remainingDiff);
        }
    },
    
    /** Gives width to next column headers.
        @param diff:number the amount to give. Will be a positive number.
        @returns number:the amount of width actually given. */
    _giveNextWidth: function(diff) {
        var hdr = this.getNextColumnHeader();
        if (hdr) {
            var newValue = hdr.value + diff;
            if (hdr.resizable) hdr.setValue(newValue);
            var remainingDiff = newValue - hdr.value;
            if (remainingDiff > 0) hdr._giveNextWidth(remainingDiff);
        }
    },
    
    _getGiveLeft: function() {
        var hdr = this.getPrevColumnHeader();
        return hdr ? hdr.maxValue - hdr.value + hdr._getGiveLeft() : 0;
    },
    
    _getGiveRight: function() {
        var hdr = this.getNextColumnHeader();
        return hdr ? hdr.maxValue - hdr.value + hdr._getGiveRight() : 0;
    },
    
    _getTakeLeft: function() {
        var hdr = this.getPrevColumnHeader();
        return hdr ? hdr.minValue - hdr.value + hdr._getTakeLeft() : 0;
    },
    
    _getTakeRight: function() {
        var hdr = this.getNextColumnHeader();
        return hdr ? hdr.minValue - hdr.value + hdr._getTakeRight() : 0;
    }
});

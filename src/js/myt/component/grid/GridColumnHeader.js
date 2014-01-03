/** Makes a view behave as a grid column header.
    
    Attributes:
        columnId:string The unique ID for this column relative to the grid it
            is part of.
        gridController:myt.GridController the controller for the grid this
            component is part of.
        flex:number If 1 or more the column will get extra space if any exists.
        resizable:boolean Indicates if this column can be resized or not.
            Defaults to true.
        last:boolean Indicates if this is the last column header or not.
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
        var GCH = myt.GridColumnHeader;
        if (attrs.minValue === undefined) attrs.minValue = GCH.DEFAULT_MIN_VALUE;
        if (attrs.maxValue === undefined) attrs.maxValue = GCH.DEFAULT_MAX_VALUE;
        if (attrs.resizable === undefined) attrs.resizable = true;
        if (attrs.flex === undefined) attrs.flex = 0;
        
        // Ensure participation in determinePlacement method of myt.Grid
        if (attrs.placement === undefined) attrs.placement = '*';
        
        this.callSuper(parent, attrs);
        
        new myt.View(this, {
            name:'resizer', cursor:'col-resize', width:10, zIndex:1,
            percentOfParentHeight:100, align:'right', alignOffset:-5,
            distanceBeforeDrag:0
        }, [myt.SizeToParent, myt.Draggable, {
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
                this._dragInitX += additionalActualDiff;
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
        }
        this.setWidth(this.value);
        this._updateLast();
    },
    
    destroy: function(v) {
        this.setGridController();
        
        this.callSuper(v);
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setFlex: function(v) {this.flex = v;},
    setColumnId: function(v) {this.columnId = v;},
    
    setLast: function(v) {
        this.last = v;
        if (this.inited) this._updateLast();
    },
    
    setResizable: function(v) {
        if (this.resizable !== v) {
            this.resizable = v;
            if (this.inited) this.fireNewEvent('resizable', v);
        }
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
        var oldValue = this.minValue || 0, 
            gc = this.gridController;
        
        this.callSuper(v);
        v = this.minValue;
        
        if (this.inited && gc && oldValue !== v) {
            gc.setMinWidth(gc.minWidth + v - oldValue);
        }
    },
    
    /** @overrides myt.BoundedValueComponent */
    setMaxValue: function(v) {
        var oldValue = this.maxValue || 0,
            gc = this.gridController;
        
        if (v == null) v = myt.GridColumnHeader.DEFAULT_MAX_VALUE;
        
        this.callSuper(v);
        v = this.maxValue;
        
        if (this.inited && gc && oldValue !== v) {
            gc.setMaxWidth(gc.maxWidth + v - oldValue);
        }
    },
    
    /** @overrides myt.View */
    setWidth: function(v, supressEvent) {
        this.callSuper(v, supressEvent);
        
        if (this.inited) {
            var gc = this.gridController;
            if (gc) gc.notifyColumnHeaderWidthChange(this);
        }
    },
    
    /** @overrides myt.View */
    setX: function(v) {
        this.callSuper(v);
        
        if (this.inited) {
            var gc = this.gridController;
            if (gc) gc.notifyColumnHeaderXChange(this);
        }
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    _updateLast: function() {
        this.resizer.setVisible(!(this.last && this.gridController.fitToWidth));
    },
    
    /** Steals width from previous column headers.
        @param diff:number the amount to steal. Will be a negative number.
        @returns number:the amount of width actually stolen. */
    _stealPrevWidth: function(diff) {
        var hdr = this.gridController.getPrevColumnHeader(this),
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
        var hdr = this.gridController.getPrevColumnHeader(this),
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
        var hdr = this.gridController.getNextColumnHeader(this);
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
        var hdr = this.gridController.getNextColumnHeader(this);
        if (hdr) {
            var newValue = hdr.value + diff;
            if (hdr.resizable) hdr.setValue(newValue);
            var remainingDiff = newValue - hdr.value;
            if (remainingDiff > 0) hdr._giveNextWidth(remainingDiff);
        }
    },
    
    _getGiveLeft: function() {
        var hdr = this.gridController.getPrevColumnHeader(this),
            give = 0;
        if (hdr) give = hdr.maxValue - hdr.value + hdr._getGiveLeft();
        return give;
    },
    
    _getGiveRight: function() {
        var hdr = this.gridController.getNextColumnHeader(this),
            give = 0;
        if (hdr) give = hdr.maxValue - hdr.value + hdr._getGiveRight();
        return give;
    },
    
    _getTakeLeft: function() {
        var hdr = this.gridController.getPrevColumnHeader(this),
            take = 0;
        if (hdr) take = hdr.minValue - hdr.value + hdr._getTakeLeft();
        return take;
    },
    
    _getTakeRight: function() {
        var hdr = this.gridController.getNextColumnHeader(this),
            take = 0;
        if (hdr) take = hdr.minValue - hdr.value + hdr._getTakeRight();
        return take;
    }
});

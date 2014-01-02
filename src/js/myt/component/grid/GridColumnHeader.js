/** Makes a view behave as a grid column header.
    
    Attributes:
        columnId:string The unique ID for this column relative to the grid it
            is part of.
        gridController:myt.GridController the controller for the grid this
            component is part of.
        flex:number If 1 or more the column will get extra space if any exists.
*/
myt.GridColumnHeader = new JS.Module('GridColumnHeader', {
    include: [myt.BoundedValueComponent],
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    initNode: function(parent, attrs) {
        if (attrs.minValue === undefined) attrs.minValue = 10;
        if (attrs.maxValue === undefined) attrs.maxValue = 9999;
        
        // Ensure participation in determinePlacement method of myt.Grid
        if (attrs.placement === undefined) attrs.placement = '*';
        
        this.callSuper(parent, attrs);
        
        new myt.View(this, {
            name:'resizer', cursor:'col-resize', width:10, zIndex:1,
            percentOfParentHeight:100, align:'right', alignOffset:-5,
            distanceBeforeDrag:0
        }, [myt.SizeToParent, myt.Draggable, {
            requestDragPosition: function(x, y) {
                var p = this.parent, 
                    curValue = p.value,
                    diff = x - this.x,
                    newValue = curValue + diff;
                p.setValue(newValue);
                var diff = newValue - p.value;
                if (diff < 0) this._dragInitX += p._stealFromPrevious(diff);
            }
        }]);
        
        var gc = this.gridController;
        if (gc) {
            gc.notifyAddColumnHeader(this);
            gc.notifyColumnHeaderXChange(this);
        }
        this.setWidth(this.value);
        this._updateResizer();
    },
    
    destroy: function(v) {
        this.setGridController();
        
        this.callSuper(v);
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setFlex: function(v) {
        this.flex = v;
    },
    
    setColumnId: function(v) {
        this.columnId = v;
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
            this._updateResizer();
        }
    },
    
    /** @overrides myt.BoundedValueComponent */
    setMaxValue: function(v) {
        var oldValue = this.maxValue || 0,
            gc = this.gridController;
        
        this.callSuper(v);
        v = this.maxValue;
        
        if (this.inited && gc && oldValue !== v) {
            gc.setMaxWidth(gc.maxWidth + v - oldValue);
            this._updateResizer();
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
    _updateResizer: function() {
        this.resizer.setVisible(this.minValue !== this.maxValue);
    },
    
    /** Steals width from previous column headers.
        @param diff:number the amount to steal. Will be a negative number.
        @returns number:the amount of width actually stolen. */
    _stealFromPrevious: function(diff) {
        var hdr = this.gridController.getPrevColumnHeader(this),
            usedDiff = 0;
        if (hdr) {
            var curValue = hdr.value, 
                newValue = curValue + diff;
            hdr.setValue(newValue);
            var remainingDiff = newValue - hdr.value;
            usedDiff = diff - remainingDiff;
            if (remainingDiff < 0) usedDiff += hdr._stealFromPrevious(remainingDiff);
        }
        
        return usedDiff;
    }
});

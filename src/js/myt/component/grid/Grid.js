/** An implementation of a grid component.
    
    Events:
        None
    
    Attributes:
        rowSpacing:number The spacing between rows. Defaults to 1.
        columnSpacing:number the spacing between columns. Defaults to 1.
        sizeHeightToRows:boolean If true, this component will be sized to fit
            all the rows without showing scrollbars. Defaults to undefined
            which is equivalent to false.
*/
myt.Grid = new JS.Class('Grid', myt.View, {
    include: [myt.GridController],
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides myt.View */
    initNode: function(parent, attrs) {
        // Allows horizontal scrolling if the grid columns are too wide.
        if (attrs.overflow === undefined) attrs.overflow = 'autox';
        
        if (attrs.bgColor === undefined) attrs.bgColor = '#cccccc';
        if (attrs.rowSpacing === undefined) attrs.rowSpacing = 1;
        if (attrs.columnSpacing === undefined) attrs.columnSpacing = 1;
        
        this.callSuper(parent, attrs);
    },
    
    /** @overrides myt.View */
    doAfterAdoption: function() {
        var shtr = this.sizeHeightToRows, m = myt;
        
        var header = new m.View(this, {name:'header', overflow:'hidden'});
        new m.SpacedLayout(header, {
            name:'xLayout', locked:true, axis:'x', collapseParent:true, 
            spacing:this.columnSpacing
        });
        new m.SizeToChildren(header, {name:'yLayout', locked:true, axis:'y'});
        
        var content = new m.View(this, {name:'content', overflow:shtr ? 'hidden' : 'autoy'});
        new m.SpacedLayout(content, {
            name:'yLayout', locked:true, axis:'y', spacing:this.rowSpacing,
            collapseParent:shtr
        });
        
        this.syncTo(this, 'setGridWidth', 'width');
        this.syncTo(header, '_updateContentWidth', 'width');
        
        this.applyConstraint('_updateContentHeight', [
            shtr ? content : this, 'height', 
            header, 'height', 
            header, 'y'
        ]);
        
        this.callSuper();
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
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
            var header = this.header,
                headerXLayout = header.xLayout,
                headerYLayout = header.yLayout,
                contentYLayout = this.content.yLayout;
            if (v) {
                headerXLayout.incrementLockedCounter();
                headerYLayout.incrementLockedCounter();
                contentYLayout.incrementLockedCounter();
            } else {
                headerXLayout.decrementLockedCounter();
                headerXLayout.update();
                headerYLayout.decrementLockedCounter();
                headerYLayout.update();
                contentYLayout.decrementLockedCounter();
                contentYLayout.update();
            }
        }
        
        this.callSuper(v);
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    _updateContentWidth: function(event) {
        this.content.setWidth(event.value);
    },
    
    _updateContentHeight: function(event) {
        var header = this.header, content = this.content,
            y = header.y + header.height;
        content.setY(y);
        
        if (this.sizeHeightToRows) {
            this.setHeight(y + content.height);
        } else {
            content.setHeight(this.height - y);
        }
    },
    
    /** @overrides myt.Node */
    determinePlacement: function(placement, subnode) {
        // Automatically place column headers and rows in the header and
        // content views respectively.
        if (placement === '*') {
            var target;
            if (subnode.isA(myt.GridRow)) {
                target = this.content;
            } else if (subnode.isA(myt.GridColumnHeader)) {
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
        var sort = this.sort || ['',''],
            sortFunc = this.getSortFunction(sort[0], sort[1]);
        if (sortFunc) {
            var content = this.content, 
                yLayout = content.yLayout;
            content.sortSubviews(sortFunc);
            yLayout.sortSubviews(sortFunc);
            yLayout.update();
        }
    },
    
    /** Gets the sort function used to sort the rows. Subclasses and instances
        should implement this as needed.
        @returns function a comparator function used for sorting. */
    getSortFunction: function(sortColumnId, sortOrder) {
        if (sortColumnId) {
            // Default sort function uses the 'text' attribute of the subview.
            var sortNum = sortOrder === 'ascending' ? 1 : -1,
                columnName = sortColumnId + 'View';
            return function(a, b) {
                var aValue = a[columnName].text,
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

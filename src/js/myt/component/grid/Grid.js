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
        if (attrs.overflow == null) attrs.overflow = 'autox';
        
        if (attrs.bgColor == null) attrs.bgColor = '#cccccc';
        if (attrs.rowSpacing == null) attrs.rowSpacing = 1;
        if (attrs.columnSpacing == null) attrs.columnSpacing = 1;
        
        this.callSuper(parent, attrs);
    },
    
    /** @overrides myt.View */
    doAfterAdoption: function() {
        const self = this,
            M = myt,
            V = M.View,
            SL = M.SpacedLayout,
            sizeHeightToRows = self.sizeHeightToRows;
        
        const header = new V(self, {name:'header', overflow:'hidden'});
        new SL(header, {
            name:'xLayout', locked:true, collapseParent:true, 
            spacing:self.columnSpacing
        });
        new M.SizeToChildren(header, {name:'yLayout', locked:true, axis:'y'});
        
        const content = new V(self, {
            name:'content', 
            overflow:sizeHeightToRows ? 'hidden' : 'autoy'
        });
        new SL(content, {
            name:'yLayout', locked:true, axis:'y', spacing:self.rowSpacing,
            collapseParent:sizeHeightToRows
        });
        
        self.syncTo(self, 'setGridWidth', 'width');
        self.syncTo(header, '_updateContentWidth', 'width');
        
        self.constrain('_updateContentHeight', [
            sizeHeightToRows ? content : self, 'height', 
            header, 'height', 
            header, 'y'
        ]);
        
        self.callSuper();
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
            const header = this.header,
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
    /** @private
        @param {!Object} event
        @returns {undefined} */
    _updateContentWidth: function(event) {
        this.content.setWidth(event.value);
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

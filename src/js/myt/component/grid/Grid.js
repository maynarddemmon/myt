((pkg) => {
    const View = pkg.View,
        
        getRowSubview = (gridRow, columnHeader) => gridRow[columnHeader.columnId + 'View'];
    
    /** Makes a view behave as a row in a grid.
        
        Events:
            None
        
        Attributes:
            gridController:myt.GridConstroller A reference to the grid controller
                that is managing this row.
        
        @class */
    pkg.GridRow = new JS.Module('GridRow', {
        // Life Cycle //////////////////////////////////////////////////////////
        initNode: function(parent, attrs) {
            // Ensure participation in determinePlacement method of myt.Grid
            if (attrs.placement == null) attrs.placement = '*';
            
            this.callSuper(parent, attrs);
            
            const gc = this.gridController;
            if (gc) gc.notifyAddRow(this);
        },
        
        destroy: function(v) {
            this.setGridController();
            this.callSuper(v);
        },
        
        
        // Accessors ///////////////////////////////////////////////////////////
        setGridController: function(v) {
            const existing = this.gridController;
            if (existing !== v) {
                if (existing) existing.notifyRemoveRow(this);
                this.gridController = v;
                if (this.inited && v) v.notifyAddRow(this);
            }
        },
        
        
        // Methods /////////////////////////////////////////////////////////////
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
    pkg.Grid = new JS.Class('Grid', View, {
        include: [pkg.GridController],
        
        
        // Life Cycle //////////////////////////////////////////////////////////
        /** @overrides myt.View */
        initNode: function(parent, attrs) {
            const self = this,
                SpacedLayout = pkg.SpacedLayout;
            
            // Allows horizontal scrolling if the grid columns are too wide.
            if (attrs.overflow == null) attrs.overflow = 'autox';
            
            if (attrs.bgColor == null) attrs.bgColor = '#cccccc';
            if (attrs.rowSpacing == null) attrs.rowSpacing = 1;
            if (attrs.columnSpacing == null) attrs.columnSpacing = 1;
            
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
                if (subnode.isA(pkg.GridRow)) {
                    target = this.content;
                } else if (subnode.isA(pkg.GridColumnHeader)) {
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
})(myt);

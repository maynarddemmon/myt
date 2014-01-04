/** An implementation of a grid component.
    
    Attributes:
        rowSpacing:number The spacing between rows. Defaults to 1.
        columnSpacing:number the spacing between columns. Defaults to 1.
*/
myt.Grid = new JS.Class('Grid', myt.View, {
    include: [myt.GridController],
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides myt.View */
    initNode: function(parent, attrs) {
        if (attrs.overflow === undefined) attrs.overflow = 'auto';
        if (attrs.bgColor === undefined) attrs.bgColor = '#cccccc';
        if (attrs.rowSpacing === undefined) attrs.rowSpacing = 1;
        if (attrs.columnSpacing === undefined) attrs.columnSpacing = 1;
        
        this.callSuper(parent, attrs);
    },
    
    /** @overrides myt.View */
    doAfterAdoption: function() {
        var header = new myt.View(this, {name:'header', overflow:'hidden'});
        new myt.SpacedLayout(header, {
            name:'xLayout', locked:true, axis:'x', collapseParent:true, 
            spacing:this.columnSpacing
        });
        new myt.SizeToChildren(header, {name:'yLayout', locked:true, axis:'y'});
        
        var content = new myt.View(this, {name:'content', overflow:'auto'});
        new myt.SpacedLayout(content, {
            name:'yLayout', locked:true, axis:'y', spacing:this.rowSpacing
        });
        
        this.syncTo(this, 'setGridWidth', 'width');
        this.syncTo(header, '_updateContentWidth', 'width');
        this.applyConstraint('_updateContentHeight', [this, 'height', header, 'height', header, 'y']);
        
        this.callSuper();
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
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
        content.setHeight(this.height - y);
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
    }
});

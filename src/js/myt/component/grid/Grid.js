/** An implementation of a grid component. */
myt.Grid = new JS.Class('Grid', myt.View, {
    include: [myt.GridController],
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides myt.View */
    initNode: function(parent, attrs) {
        if (attrs.overflow === undefined) attrs.overflow = 'auto';
        if (attrs.bgColor === undefined) attrs.bgColor = '#cccccc';
        
        this.callSuper(parent, attrs);
    },
    
    /** @overrides myt.View */
    doAfterAdoption: function() {
        var header = new myt.View(this, {name:'header', overflow:'hidden'});
        new myt.SpacedLayout(header, {axis:'x', collapseParent:true, spacing:1}); // FIXME: no spacing
        new myt.SizeToChildren(header, {axis:'y'});
        
        var content = new myt.View(this, {name:'content', overflow:'auto'});
        new myt.SpacedLayout(content, {axis:'y', spacing:1}); // FIXME: no spacing
        
        this.syncTo(this, 'setGridWidth', 'width');
        this.syncTo(header, '_updateContentWidth', 'width');
        this.applyConstraint('_updateContentHeight', [this, 'height', header, 'height', header, 'y']);
        
        this.callSuper();
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    
    
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

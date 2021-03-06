/** A floating panel that contains a list of items.
    
    Events:
        maxHeight:number
    
    Attributes:
        minWidth:number The minimum width for the list. The list will size
            itself to fit the maximum width of the items in the list or this
            value whichever is larger. Defaults to 0.
        maxHeight:number The maximum height of the list view in pixels. If set 
            to -1 no max height will be used.
        defaultItemClass:JS.Class The class to use for list items if one is
            not provided in the config. Defaults to myt.ListViewItem.
        itemConfig:array An array of configuration information for the items
            in the list.
        items:array The array of items in the list.
    
    @class
*/
myt.ListView = new JS.Class('ListView', myt.FloatingPanel, {
    // Life Cycle //////////////////////////////////////////////////////////////
    initNode: function(parent, attrs) {
        this.items = [];
        this.maxHeight = -1;
        this.minWidth = 0;
        
        if (attrs.defaultItemClass == null) attrs.defaultItemClass = myt.ListViewItem;
        if (attrs.overflow == null) attrs.overflow = 'autoy';
        if (attrs.bgColor == null) attrs.bgColor = '#cccccc';
        if (attrs.boxShadow == null) attrs.boxShadow = myt.Button.DEFAULT_FOCUS_SHADOW_PROPERTY_VALUE;
        
        this.callSuper(parent, attrs);
        
        this.__updateItems();
        this.buildLayout();
    },
    
    buildLayout: function() {
        new myt.SpacedLayout(this.getContentView(), {
            axis:'y', spacing:1, collapseParent:true
        });
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setMinWidth: function(v) {this.minWidth = v;},
    setDefaultItemClass: function(v) {this.defaultItemClass = v;},
    setItemConfig: function(v) {
        this.itemConfig = v;
        if (this.inited) this.__updateItems();
    },
    
    /** Get the view that will contain list content.
        @returns {!Object} myt.View */
    getContentView: function() {
        return this;
    },
    
    setMaxHeight: function(v) {
        if (this.maxHeight !== v) {
            this.maxHeight = v;
            if (this.inited) {
                this.fireEvent('maxHeight', v);
                this.setHeight(this.height);
            }
        }
    },
    
    /** @overrides myt.View */
    setHeight: function(v, supressEvent) {
        // Limit height if necessary
        if (this.maxHeight >= 0) v = Math.min(this.maxHeight, v);
        
        this.callSuper(v, supressEvent);
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** ListViewItems should call this method when they are activated. The
        default implementation invokes doItemActivated on the ListViewAnchor.
        @param {!Object} itemView
        @returns {undefined} */
    doItemActivated: function(itemView) {
        const owner = this.owner;
        if (owner) owner.doItemActivated(itemView);
    },
    
    /** @overrides myt.FloatingPanel */
    getFirstFocusableDescendant: function() {
        return this.getFirstFocusableItem() || this.callSuper();
    },
    
    getFirstFocusableItem: function() {
        const items = this.items, 
            len = items.length;
        let item, 
            i = 0;
        for (; len > i; ++i) {
            item = items[i];
            if (item.isFocusable()) return item;
        }
        return null;
    },
    
    getLastFocusableItem: function() {
        const items = this.items;
        let item,
            i = items.length;
        while (i) {
            item = items[--i];
            if (item.isFocusable()) return item;
        }
        return null;
    },
    
    /** @private
        @returns {undefined} */
    __updateItems: function() {
        const self = this,
            cfg = self.itemConfig || [],
            cfgLen = cfg.length,
            items = self.items, 
            itemsLen = items.length,
            defaultItemClass = self.defaultItemClass,
            contentView = self.getContentView(), 
            layouts = contentView.getLayouts(),
            layoutLen = layouts.length;
        let cfgItem, 
            cfgClass, 
            cfgAttrs,
            item, 
            layout, 
            i,
            minItemWidth, 
            minWidth = self.minWidth;
        
        // Lock layouts during reconfiguration
        i = layoutLen;
        while (i) layouts[--i].incrementLockedCounter();
        
        // Performance: Remove from dom while doing inserts
        const de = contentView.getOuterDomElement(),
            nextDe = de.nextSibling,
            parentElem = de.parentNode;
        parentElem.removeChild(de);
        
        // Reconfigure list
        for (i = 0; cfgLen > i; ++i) {
            cfgItem = cfg[i];
            cfgClass = cfgItem.klass || defaultItemClass;
            cfgAttrs = cfgItem.attrs || {};
            
            item = items[i];
            
            // Destroy existing item if it's the wrong class
            if (item && !item.isA(cfgClass)) {
                item.destroy();
                item = null;
            }
            
            // Create a new item if no item exists
            if (!item) item = items[i] = new cfgClass(contentView, {listView:self});
            
            // Apply config to item
            if (item) {
                item.callSetters(cfgAttrs);
                
                // Create an item index to sort the layout subviews on. This
                // is necessary when the class of list items change so that the
                // newly created items don't end up out of order.
                item.__LAYOUT_IDX = i;
            }
        }
        
        // Performance: Put back in dom.
        parentElem.insertBefore(de, nextDe);
        
        // Measure width. Must be in dom at this point.
        for (i = 0; cfgLen > i; ++i) {
            item = items[i];
            item.syncToDom();
            minItemWidth = item.getMinimumWidth();
            if (minItemWidth > minWidth) minWidth = minItemWidth;
        }
        
        // Delete any remaining items
        for (; itemsLen > i; ++i) items[i].destroy();
        items.length = cfgLen;
        
        // Resize items and contentView
        for (i = 0; cfgLen > i; ++i) self.updateItemWidth(items[i], minWidth);
        self.updateContentWidth(contentView, minWidth);
        
        // Unlock layouts and update
        i = layoutLen;
        while (i) {
            layout = layouts[--i];
            layout.sortSubviews(function(a, b) {return a.__LAYOUT_IDX - b.__LAYOUT_IDX;});
            layout.decrementLockedCounter();
            layout.update();
        }
    },
    
    updateItemWidth: function(item, width) {
        item.setWidth(width);
    },
    
    updateContentWidth: function(contentView, width) {
        contentView.setWidth(width);
    }
});

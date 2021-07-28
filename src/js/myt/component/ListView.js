((pkg) => {
    const JSClass = JS.Class,
        JSModule = JS.Module,
        
        GlobalFocus = pkg.global.focus,
        
        defAttr = pkg.AccessorSupport.defAttr,
        
        ACTIVATION_KEYS = [13,27,32,37,38,39,40],
        
        updateItems = listView => {
            const cfg = listView.itemConfig || [],
                cfgLen = cfg.length,
                items = listView.items, 
                itemsLen = items.length,
                defaultItemClass = listView.defaultItemClass,
                contentView = listView.getContentView(), 
                layouts = contentView.getLayouts();
            
            // Lock layouts during reconfiguration
            layouts.forEach(layout => {layout.incrementLockedCounter();});
            
            // Performance: Remove from dom while doing inserts
            const de = contentView.getOuterDomElement(),
                nextDe = de.nextSibling,
                parentElem = de.parentNode;
            parentElem.removeChild(de);
            
            // Reconfigure list
            let i = 0;
            for (; cfgLen > i; ++i) {
                const cfgItem = cfg[i],
                    cfgClass = cfgItem.klass || defaultItemClass,
                    cfgAttrs = cfgItem.attrs || {};
                let item = items[i];
                
                // Destroy existing item if it's the wrong class
                if (item && !item.isA(cfgClass)) {
                    item.destroy();
                    item = null;
                }
                
                // Create a new item if no item exists
                if (!item) item = items[i] = new cfgClass(contentView, {listView:listView});
                
                // Apply config to item
                if (item) {
                    item.callSetters(cfgAttrs);
                    
                    // Create an item index to sort the layout subviews on. This
                    // is necessary when the class of list items change so 
                    // that the newly created items don't end up out of order.
                    item.__LAYOUT_IDX = i;
                }
            }
            
            // Performance: Put back in dom.
            parentElem.insertBefore(de, nextDe);
            
            // Measure width. Must be in dom at this point.
            let minWidth = listView.minWidth;
            for (i = 0; cfgLen > i;) {
                const item = items[i++];
                item.syncToDom();
                minWidth = Math.max(minWidth, item.getMinimumWidth());
            }
            
            // Delete any remaining items
            for (; itemsLen > i;) items[i++].destroy();
            items.length = cfgLen;
            
            // Resize items and contentView
            for (i = 0; cfgLen > i;) listView.updateItemWidth(items[i++], minWidth);
            listView.updateContentWidth(contentView, minWidth);
            
            // Unlock layouts and update
            layouts.forEach(layout => {
                layout.sortSubviews((a, b) => a.__LAYOUT_IDX - b.__LAYOUT_IDX);
                layout.decrementLockedCounter();
                layout.update();
            });
        },
        
        /** Defines the interface list view items must support.
            
            Attributes:
                listView:myt.ListView The list view this item is managed by.
            
            @class */
        ListViewItemMixin = pkg.ListViewItemMixin = new JSModule('ListViewItemMixin', {
            // Accessors ///////////////////////////////////////////////////////
            setListView: function(v) {this.listView = v;},
            
            
            // Methods /////////////////////////////////////////////////////////
            /** Subclasses and/or implementations must implement this method. 
                Should return the minimum width the list item needs to 
                display itself.
                @returns number */
            getMinimumWidth: () => 0,
            
            /** Part of a performance optimization. Called from 
                updateItems after the items have been inserted into 
                the dom. Now we can actually measure text width. */
            syncToDom: () => {}
        });
    
    /** A floating panel that contains a list of items.
        
        Events:
            maxHeight:number
        
        Attributes:
            minWidth:number The minimum width for the list. The list will size
                itself to fit the maximum width of the items in the list or 
                this value whichever is larger. Defaults to 0.
            maxHeight:number The maximum height of the list view in pixels. 
                If set to -1 no max height will be used.
            defaultItemClass:JS.Class The class to use for list items if one 
                is not provided in the config. Defaults to myt.ListViewItem.
            itemConfig:array An array of configuration information for 
                the items in the list.
            items:array The array of items in the list.
        
        @class */
    pkg.ListView = new JSClass('ListView', pkg.FloatingPanel, {
        // Life Cycle //////////////////////////////////////////////////////////
        initNode: function(parent, attrs) {
            this.items = [];
            this.maxHeight = -1;
            this.minWidth = 0;
            
            defAttr(attrs, 'defaultItemClass', pkg.ListViewItem);
            defAttr(attrs, 'overflow', 'autoy');
            defAttr(attrs, 'bgColor', '#ccc');
            defAttr(attrs, 'boxShadow', pkg.Button.DEFAULT_FOCUS_SHADOW_PROPERTY_VALUE);
            
            this.callSuper(parent, attrs);
            
            updateItems(this);
            this.buildLayout(this.getContentView());
        },
        
        /** Allows subclasses to specify their own layout. For example a
            multi-column layout using a WrappingLayout is possible. */
        buildLayout: contentView => {
            new pkg.SpacedLayout(contentView, {
                axis:'y', spacing:1, collapseParent:true
            });
        },
        
        
        // Accessors ///////////////////////////////////////////////////////////
        setMinWidth: function(v) {this.minWidth = v;},
        setDefaultItemClass: function(v) {this.defaultItemClass = v;},
        setItemConfig: function(v) {
            this.itemConfig = v;
            if (this.inited) updateItems(this);
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
            this.callSuper(this.maxHeight >= 0 ? Math.min(this.maxHeight, v) : v, supressEvent);
        },
        
        
        // Methods /////////////////////////////////////////////////////////////
        /** ListViewItems should call this method when they are activated. 
            The default implementation invokes doItemActivated on 
            the ListViewAnchor.
            @param {!Object} itemView
            @returns {undefined} */
        doItemActivated: function(itemView) {
            if (this.owner) this.owner.doItemActivated(itemView);
        },
        
        /** @overrides myt.FloatingPanel */
        getFirstFocusableDescendant: function() {
            return this.getFirstFocusableItem() || this.callSuper();
        },
        
        getFirstFocusableItem: function() {
            const items = this.items, 
                len = items.length;
            for (let i = 0; len > i;) {
                const item = items[i++];
                if (item.isFocusable()) return item;
            }
            return null;
        },
        
        getLastFocusableItem: function() {
            const items = this.items;
            let i = items.length;
            while (i) {
                const item = items[--i];
                if (item.isFocusable()) return item;
            }
            return null;
        },
        
        updateItemWidth: (item, width) => {
            item.setWidth(width);
        },
        
        updateContentWidth: (contentView, width) => {
            contentView.setWidth(width);
        }
    });
    
    /** The anchor for an myt.ListView.
        
        Attributes:
            listViewClass:JS.Class The class of list view to create. Defaults
                to myt.ListView.
            listViewAttrs:object The initialization attributes for the 
                listViewClass.
            itemConfig:array An array of configuration parameters for the items
                in the list.
        
        @class */
    pkg.ListViewAnchor = new JSModule('ListViewAnchor', {
        include: [pkg.FloatingPanelAnchor],
        
        
        // Life Cycle //////////////////////////////////////////////////////////
        initNode: function(parent, attrs) {
            defAttr(attrs, 'listViewClass', pkg.ListView);
            defAttr(attrs, 'listViewAttrs', {});
            defAttr(attrs, 'itemConfig', []);
            
            // Assume this will be mixed onto something that implements 
            // myt.KeyActivation since it probably will.
            defAttr(attrs, 'activationKeys', ACTIVATION_KEYS);
            
            this.callSuper(parent, attrs);
        },
        
        
        // Accessors ///////////////////////////////////////////////////////////
        setListViewClass: function(v) {this.listViewClass = v;},
        setListViewAttrs: function(v) {this.listViewAttrs = v;},
        setItemConfig: function(v) {this.itemConfig = v;},
        
        
        // Methods /////////////////////////////////////////////////////////////
        /** Called by the list view when an item is activated. By default it
            hides the list view.
            @param {!Object} itemView
            @returns {undefined} */
        doItemActivated: function(itemView) {
            this.hideFloatingPanel();
        },
        
        /** @overrides myt.FloatingPanelAnchor */
        getFloatingPanel: function(panelId) {
            return this.callSuper(panelId) || this.createFloatingPanel(panelId, this.listViewClass, this.listViewAttrs);
        },
        
        /** @overrides myt.FloatingPanelAnchor */
        showFloatingPanel: function(panelId) {
            const fp = this.getFloatingPanel(panelId);
            if (fp) {
                fp.setItemConfig(this.itemConfig);
                this.callSuper(panelId);
            }
        },
        
        /** @overrides myt.KeyActivation. */
        doActivationKeyDown: function(key, isRepeat) {
            // Close for escape key.
            if (key === 27) {
                this.hideFloatingPanel();
            } else {
                // Select first/last if the list view is already open
                switch (key) {
                    case 37: // Left
                    case 38: // Up
                        this.selectLastItem();
                        break;
                    case 39: // Right
                    case 40: // Down
                        this.selectFirstItem();
                        break;
                }
                this.callSuper(key, isRepeat);
            }
        },
        
        /** @overrides myt.KeyActivation. */
        doActivationKeyUp: function(key) {
            // Abort for escape key.
            if (key !== 27) {
                this.callSuper(key);
                
                // Select first/last after list view is open.
                switch (key) {
                    case 37: // Left
                    case 38: // Up
                        this.selectLastItem();
                        break;
                    case 39: // Right
                    case 40: // Down
                        this.selectFirstItem();
                        break;
                }
            }
        },
        
        selectLastItem: function() {
            const fp = this.getFloatingPanel();
            if (fp && fp.isShown()) {
                const item = fp.getLastFocusableItem();
                if (item) item.focus();
            }
        },
        
        selectFirstItem: function() {
            const fp = this.getFloatingPanel();
            if (fp && fp.isShown()) {
                const item = fp.getFirstFocusableItem();
                if (item) item.focus();
            }
        }
    });
    
    /** An item in an myt.ListView
        
        @class */
    pkg.ListViewItem = new JSClass('ListViewItem', pkg.SimpleTextButton, {
        include: [ListViewItemMixin],
        
        
        // Life Cycle //////////////////////////////////////////////////////////
        initNode: function(parent, attrs) {
            defAttr(attrs, 'activeColor', '#bbb');
            defAttr(attrs, 'hoverColor', '#fff');
            defAttr(attrs, 'readyColor', '#eee');
            defAttr(attrs, 'inset', 8);
            defAttr(attrs, 'outset', 8);
            defAttr(attrs, 'activationKeys', ACTIVATION_KEYS);
            
            this.callSuper(parent, attrs);
        },
        
        
        // Methods /////////////////////////////////////////////////////////////
        /** @overrides myt.ListViewItemMixin */
        syncToDom: function() {
            this.textView.getInnerDomStyle().width = 'auto';
            this.textView.sizeViewToDom();
        },
        
        /** @overrides myt.ListViewItemMixin */
        getMinimumWidth: function() {
            return this.inset + (this.textView.visible && this.text ? Math.ceil(this.textView.measureNoWrapWidth()) : 0) + this.outset;
        },
        
        /** @overrides myt.Button */
        doActivated: function() {
            this.listView.doItemActivated(this);
        },
        
        /** @overrides myt.KeyActivation. */
        doActivationKeyDown: function(key, isRepeat) {
            switch (key) {
                case 27: // Escape
                    this.listView.owner.hideFloatingPanel();
                    return;
                case 37: // Left
                case 38: // Up
                    GlobalFocus.prev();
                    break;
                case 39: // Right
                case 40: // Down
                    GlobalFocus.next();
                    break;
            }
            
            this.callSuper(key, isRepeat);
        }
    });
    
    /** A separator item in an myt.ListView
        
        @class */
    pkg.ListViewSeparator = new JSClass('ListViewSeparator', pkg.View, {
        include: [ListViewItemMixin],
        
        
        // Life Cycle //////////////////////////////////////////////////////////
        initNode: function(parent, attrs) {
            defAttr(attrs, 'height', 1);
            defAttr(attrs, 'bgColor', '#666');
            
            this.callSuper(parent, attrs);
        }
    });
})(myt);

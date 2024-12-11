(pkg => {
    const {Class:JSClass, Module:JSModule} = JS,
        
        math = Math,
        
        {View, global:G} = pkg,
        GlobalFocus = G.focus,
        GlobalKeys = G.keys,
        {LIST_KEYS, CODE_ESC} = GlobalKeys,
        
        updateItems = listView => {
            const cfg = listView.itemConfig ?? [],
                cfgLen = cfg.length,
                {items, defaultItemClass, fixedWidth} = listView,
                itemsLen = items.length,
                isFixedWidth = fixedWidth > 0,
                contentView = listView.getContentView(), 
                layouts = contentView.getLayouts();
            let i = 0;
            
            // Lock layouts during reconfiguration
            for (const layout of layouts) layout.incrementLockedCounter();
            
            // Performance: Remove from dom while doing inserts
            View.doWhileRemovedFromDom(contentView, () => {
                // Reconfigure list
                const itemAttrs = {listView:listView};
                if (isFixedWidth) {
                    itemAttrs.width = fixedWidth;
                    itemAttrs.enableEllipsis = true;
                }
                for (; cfgLen > i; ++i) {
                    const cfgItem = cfg[i],
                        cfgClass = cfgItem.klass ?? defaultItemClass,
                        cfgAttrs = cfgItem.attrs ?? {};
                    let item = items[i];
                    
                    // Destroy existing item if it's the wrong class
                    if (item && !item.isA(cfgClass)) {
                        item.destroy();
                        item = null;
                    }
                    
                    // Create a new item if no item exists
                    item ??= items[i] = new cfgClass(contentView, {...itemAttrs});
                    
                    // Apply config to item
                    if (item) {
                        item.callSetters(cfgAttrs);
                        
                        // Create an item index to sort the layout subviews on. This is necessary when 
                        // the class of list items change so that the newly created items don't end up 
                        // out of order.
                        item.__LAYOUT_IDX = i;
                    }
                }
            });
            
            let minWidth;
            if (isFixedWidth) {
                minWidth = fixedWidth;
            } else {
                // Measure width. Must be in dom at this point.
                minWidth = listView.minWidth;
                for (i = 0; cfgLen > i;) {
                    const item = items[i++];
                    item.syncToDom();
                    minWidth = math.max(minWidth, item.getMinimumWidth());
                }
            }
            
            // Delete any remaining items
            for (; itemsLen > i;) items[i++].destroy();
            items.length = cfgLen;
            
            // Resize items and contentView
            if (!isFixedWidth) {
                for (i = 0; cfgLen > i;) listView.updateItemWidth(items[i++], minWidth);
            }
            listView.updateContentWidth(contentView, minWidth);
            
            // Unlock layouts and update
            for (const layout of layouts) {
                layout.sortSubviews((a, b) => a.__LAYOUT_IDX - b.__LAYOUT_IDX);
                layout.decrementLockedCounter();
                layout.update();
            }
        },
        
        /** Defines the interface list view items must support.
            
            Attributes:
                listView:myt.ListView The list view this item is managed by.
            
            @class */
        ListViewItemMixin = pkg.ListViewItemMixin = new JSModule('ListViewItemMixin', {
            // Accessors ///////////////////////////////////////////////////////
            setListView: function(v) {this.listView = v;},
            
            
            // Methods /////////////////////////////////////////////////////////
            /** Subclasses and/or implementations must implement this method. Should return the 
                minimum width the list item needs to display itself.
                @returns number */
            getMinimumWidth: () => 0,
            
            /** Part of a performance optimization. Called from updateItems after the items have 
                been inserted into the dom. Now we can actually measure text width. */
            syncToDom: () => {}
        });
    
    /** A floating panel that contains a list of items.
        
        Events:
            maxHeight:number
        
        Attributes:
            minWidth:number The minimum width for the list. The list will size itself to fit the 
                maximum width of the items in the list or this value whichever is larger. 
                Defaults to 0.
            maxHeight:number The maximum height of the list view in pixels. If set to -1 no max 
                height will be used.
            defaultItemClass:JS.Class The class to use for list items if one is not provided in 
                the config. Defaults to myt.ListViewItem.
            itemConfig:array An array of configuration information for the items in the list.
            items:array The array of items in the list.
        
        @class */
    pkg.ListView = new JSClass('ListView', pkg.FloatingPanel, {
        // Life Cycle //////////////////////////////////////////////////////////
        initNode: function(parent, attrs) {
            this.items = [];
            this.maxHeight = -1;
            this.minWidth = 0;
            
            attrs.defaultItemClass ??= pkg.ListViewItem;
            attrs.overflow ??= 'autoy';
            attrs.bgColor ??= '#ccc';
            attrs.boxShadow ??= pkg.theme.focusShadow;
            
            this.callSuper(parent, attrs);
            
            updateItems(this);
            this.buildLayout(this.getContentView());
        },
        
        /** Allows subclasses to specify their own layout. For example a multi-column layout using 
            a WrappingLayout is possible. */
        buildLayout: contentView => {
            new pkg.SpacedLayout(contentView, {axis:'y', spacing:1, collapseParent:true});
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
        setHeight: function(v) {
            // Limit height if necessary
            this.callSuper(this.maxHeight >= 0 ? math.min(this.maxHeight, v) : v);
            if (this.inited && this.owner) this.updateLocationY(this.owner);
        },
        
        
        // Methods /////////////////////////////////////////////////////////////
        /** ListViewItems should call this method when they are activated. The default 
            implementation invokes doItemActivated on the ListViewAnchor.
            @param {!Object} itemView
            @returns {undefined} */
        doItemActivated: function(itemView) {
            this?.owner.doItemActivated(itemView);
        },
        
        /** @overrides myt.FloatingPanel */
        getFirstFocusableDescendant: function() {
            return this.getFirstFocusableItem() ?? this.callSuper();
        },
        
        getFirstFocusableItem: function() {
            return this.items.find(item => item.isFocusable());
        },
        
        getLastFocusableItem: function() {
            return this.items.findLast(item => item.isFocusable());
        },
        
        focusToLastItem: function() {
            this.getLastFocusableItem()?.focus();
        },
        
        focusToFirstItem: function() {
            this.getFirstFocusableItem()?.focus();
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
            listViewClass:JS.Class The class of list view to create. Defaults to myt.ListView.
            listViewAttrs:object The initialization attributes for the listViewClass.
            itemConfig:array An array of configuration parameters for the items in the list.
        
        @class */
    pkg.ListViewAnchor = new JSModule('ListViewAnchor', {
        include: [pkg.FloatingPanelAnchor, pkg.ArrowKeyActivation],
        
        
        // Life Cycle //////////////////////////////////////////////////////////
        initNode: function(parent, attrs) {
            attrs.listViewClass ??= pkg.ListView;
            attrs.listViewAttrs ??= {};
            attrs.itemConfig ??= [];
            
            // Assume this will be mixed onto something that implements myt.KeyActivation since 
            // it probably will.
            attrs.activationKeys ??= LIST_KEYS;
            
            this.callSuper(parent, attrs);
        },
        
        
        // Accessors ///////////////////////////////////////////////////////////
        setListViewClass: function(v) {this.listViewClass = v;},
        setListViewAttrs: function(v) {this.listViewAttrs = v;},
        setItemConfig: function(v) {this.itemConfig = v;},
        
        
        // Methods /////////////////////////////////////////////////////////////
        /** @overrides */
        getFloatingValignForPanel: function(panel) {
            const self = this,
                panelHeight = panel.height,
                heightAbove = self.getPagePosition().y,
                heightBelow = G.windowResize.getHeight() - self.getPagePosition().y - self.height,
                diffAbove = heightAbove - panelHeight,
                diffBelow = heightBelow - panelHeight,
                moreHeightAbove = heightAbove > heightBelow;
            
            let valign = self.floatingValign;
            switch (valign) {
                case 'outsideBottom':
                    if (diffBelow < 0 && moreHeightAbove) valign = 'outsideTop';
                    break;
                case 'insideBottom':
                    if (diffBelow < 0 && moreHeightAbove) valign = 'insideTop';
                    break;
                case 'outsideTop':
                    if (diffAbove < 0 && !moreHeightAbove) valign = 'outsideBottom';
                    break;
                case 'insideTop':
                    if (diffAbove < 0 && !moreHeightAbove) valign = 'insideBottom';
                    break;
            }
            return valign;
        },
        
        /** Called by the list view when an item is activated. By default it hides the list view.
            @param {!Object} itemView
            @returns {undefined} */
        doItemActivated: function(itemView) {
            this.hideFloatingPanel();
        },
        
        /** @overrides myt.FloatingPanelAnchor */
        getFloatingPanel: function(panelId) {
            return this.callSuper(panelId) ?? this.createFloatingPanel(panelId, this.listViewClass, this.listViewAttrs);
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
        doActivationKeyDown: function(code, isRepeat) {
            // Close for escape key.
            if (code === CODE_ESC) {
                this.hideFloatingPanel();
            } else {
                // Select first/last if the list view is already open
                this.callSuper(code, isRepeat);
            }
        },
        
        /** @overrides myt.ArrowKeyActivation. */
        doKeyArrowLeftOrUp: function(isLeft, isRepeat) {
            this.focusToLastItem();
        },
        
        /** @overrides myt.ArrowKeyActivation. */
        doKeyArrowRightOrDown: function(isRight, isRepeat) {
            this.focusToFirstItem();
        },
        
        /** @overrides myt.KeyActivation. */
        doActivationKeyUp: function(code) {
            // Abort for escape key.
            if (code !== CODE_ESC) {
                this.callSuper(code);
                
                // Select first/last after list view is open.
                switch (code) {
                    case GlobalKeys.CODE_ARROW_LEFT:
                    case GlobalKeys.CODE_ARROW_UP:
                        this.focusToLastItem();
                        break;
                    case GlobalKeys.CODE_ARROW_RIGHT:
                    case GlobalKeys.CODE_ARROW_DOWN:
                        this.focusToFirstItem();
                        break;
                }
            }
        },
        
        focusToLastItem: function() {
            const fp = this.getFloatingPanel();
            if (fp?.isShown()) fp.focusToLastItem();
        },
        
        focusToFirstItem: function() {
            const fp = this.getFloatingPanel();
            if (fp?.isShown()) fp.focusToFirstItem();
        },
        
        // List Manipulation
        /** Updates an attr of an itemConfig entry with a matching value.
            @param {*} value
            @param {string} attrName
            @param {*} attrValue
            @returns {?Object} - The entry if a match was found, otherwise undefined. */
        updateEntryAttr: function(value, attrName, attrValue) {
            const entry = this.getEntryByValue(value);
            if (entry) entry.attrs[attrName] = attrValue;
            return entry;
        },
        
        /** Gets the first itemConfig entry with an attrs.value exactly equal to the provided value.
            @param {*} value
            @returns {?Object} - The itemConfig entry or undefined if no match found. */
        getEntryByValue: function(value) {
            return this.itemConfig.find(entry => entry?.attrs && entry.attrs.value === value);
        }
    });
    
    /** An item in an myt.ListView
        
        @class */
    pkg.ListViewItem = new JSClass('ListViewItem', pkg.TextButton, {
        include: [ListViewItemMixin, pkg.ArrowKeyActivation],
        
        
        // Life Cycle //////////////////////////////////////////////////////////
        initNode: function(parent, attrs) {
            attrs.activeColor ??= '#bbb';
            attrs.hoverColor ??= '#fff';
            attrs.readyColor ??= '#eee';
            attrs.paddingLeft ??= 8;
            attrs.paddingRight ??= 8;
            attrs.textAlign ??= 'left';
            attrs.roundedCorners ??= 0;
            attrs.activationKeys ??= LIST_KEYS;
            attrs.focusIndicator ??= true;
            
            const enableEllipsis = this.__enableEllipsis = attrs.enableEllipsis;
            delete attrs.enableEllipsis;
            
            this.callSuper(parent, attrs);
            
            this.addDomClass('mytButtonText');
            if (enableEllipsis) this.enableEllipsis();
        },
        
        
        // Methods /////////////////////////////////////////////////////////////
        /** @overrides myt.TextSupport */
        setText: function(v) {
            this.callSuper(v);
            if (this.__enableEllipsis) this.setTooltip(this.text);
        },
        
        /** @overrides myt.ListViewItemMixin */
        syncToDom: function() {
            this.getIDS().width = 'auto';
            this.sizeViewToDom();
        },
        
        /** @overrides myt.ListViewItemMixin */
        getMinimumWidth: function() {
            return math.ceil(this.measureNoWrapWidth());
        },
        
        /** @overrides myt.Button */
        doActivated: function() {
            this.listView.doItemActivated(this);
        },
        
        /** @overrides myt.KeyActivation. */
        doActivationKeyDown: function(code, isRepeat) {
            if (code === CODE_ESC) {
                this.listView.owner.hideFloatingPanel();
            } else {
                this.callSuper(code, isRepeat);
            }
        },
        
        /** @overrides myt.ArrowKeyActivation. */
        doKeyArrowLeftOrUp: function(isLeft, isRepeat) {
            GlobalFocus.prev();
        },
        
        /** @overrides myt.ArrowKeyActivation. */
        doKeyArrowRightOrDown: function(isRight, isRepeat) {
            GlobalFocus.next();
        }
    });
    
    /** A separator item in an myt.ListView
        
        @class */
    pkg.ListViewSeparator = new JSClass('ListViewSeparator', View, {
        include: [ListViewItemMixin],
        
        
        // Life Cycle //////////////////////////////////////////////////////////
        initNode: function(parent, attrs) {
            attrs.height ??= 1;
            attrs.bgColor ??= '#666';
            
            this.callSuper(parent, attrs);
        }
    });
})(myt);

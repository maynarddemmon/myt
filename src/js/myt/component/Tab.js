((pkg) => {
    const JSModule = JS.Module,
    
        defAttr = pkg.AccessorSupport.defAttr,
        
        updateTextColor = tab => {
            tab.textView.setTextColor(tab.selected ? tab.labelTextSelectedColor : tab.labelTextColor);
        },
        
        updateCornerRadius = tab => {
            const r = tab.cornerRadius != null ? tab.cornerRadius : Tab.DEFAULT_RADIUS;
            switch (tab.tabContainer.location) {
                case 'top':
                    tab.setRoundedTopLeftCorner(r);
                    tab.setRoundedTopRightCorner(r);
                    break;
                case 'bottom':
                    tab.setRoundedBottomLeftCorner(r);
                    tab.setRoundedBottomRightCorner(r);
                    break;
                case 'left':
                    tab.setRoundedTopLeftCorner(r);
                    tab.setRoundedBottomLeftCorner(r);
                    break;
                case 'right':
                    tab.setRoundedTopRightCorner(r);
                    tab.setRoundedBottomRightCorner(r);
                    break;
            }
        },
        
        /** A tab component.
            
            Requires:
                myt.Activateable
            
            Attributes:
                tabId:string The unique ID of this tab relative to its tab container.
                tabContainer:myt.TabContainer The tab container that manages this tab.
            
            @class */
        TabMixin = pkg.TabMixin = new JSModule('TabMixin', {
            include: [pkg.Selectable],
            
            
            // Life Cycle //////////////////////////////////////////////////////
            /** @overrides */
            initNode: function(parent, attrs) {
                if (attrs.tabId == null) attrs.tabId = pkg.generateGuid();
                if (attrs.tabContainer == null) attrs.tabContainer = parent;
                
                // Selection must be done via the select method on the tabContainer
                let initiallySelected;
                if (attrs.selected) {
                    initiallySelected = true;
                    delete attrs.selected;
                }
                
                this.callSuper(parent, attrs);
                
                if (initiallySelected) this.tabContainer.select(this);
            },
            
            
            // Accessors ///////////////////////////////////////////////////////
            setTabId: function(v) {this.tabId = v;},
            setTabContainer: function(v) {this.tabContainer = v;},
            
            
            // Methods /////////////////////////////////////////////////////////
            /** @overrides myt.Activateable */
            doActivated: function() {
                if (!this.selected) this.tabContainer.select(this);
            }
        }),
        
        /** A simple tab component.
            
            Attributes:
                tabId:string The unique ID of this tab relative to its 
                    tab container.
                tabContainer:myt.TabContainer The tab container that manages 
                    this tab.
                edgeColor:color
                edgeSize:number
                selectedColor:color
                
                labelTextColorSelected:color The color to use for the label 
                    text when this tab is selected.
                cornerRadius:number Passed into the drawing config to determine
                    if a rounded corner is drawn or not. Defaults to undefined 
                    which causes myt.Tab.DEFAULT_RADIUS to be used.
            
            @class */
        Tab = pkg.Tab = new JS.Class('Tab', pkg.SimpleIconTextButton, {
            include: [TabMixin],
            
            
            // Class Methods and Attributes ////////////////////////////////////
            extend: {
                DEFAULT_HEIGHT: 24,
                DEFAULT_INSET: 8,
                DEFAULT_OUTSET: 8,
                DEFAULT_FILL_COLOR_SELECTED: '#fff',
                DEFAULT_FILL_COLOR_HOVER: '#eee',
                DEFAULT_FILL_COLOR_ACTIVE: '#aaa',
                DEFAULT_FILL_COLOR_READY: '#ccc',
                DEFAULT_LABEL_TEXT_COLOR_SELECTED:'#333',
                DEFAULT_RADIUS:6
            },
            
            
            // Life Cycle //////////////////////////////////////////////////////
            initNode: function(parent, attrs) {
                // myt.SimpleIconTextButton
                defAttr(attrs, 'inset', Tab.DEFAULT_INSET);
                defAttr(attrs, 'outset', Tab.DEFAULT_OUTSET);
                
                // myt.Tab
                defAttr(attrs, 'selectedColor', Tab.DEFAULT_FILL_COLOR_SELECTED);
                defAttr(attrs, 'hoverColor', Tab.DEFAULT_FILL_COLOR_HOVER);
                defAttr(attrs, 'activeColor', Tab.DEFAULT_FILL_COLOR_ACTIVE);
                defAttr(attrs, 'readyColor', Tab.DEFAULT_FILL_COLOR_READY);
                defAttr(attrs, 'labelTextSelectedColor', Tab.DEFAULT_LABEL_TEXT_COLOR_SELECTED);
                
                // Other
                defAttr(attrs, 'height', Tab.DEFAULT_HEIGHT);
                defAttr(attrs, 'focusEmbellishment', false);
                
                this.callSuper(parent, attrs);
                
                updateCornerRadius(this);
                updateTextColor(this);
            },
            
            
            // Accessors ///////////////////////////////////////////////////////
            setSelectedColor: function(v) {this.selectedColor = v;},
            
            setCornerRadius: function(v) {
                this.cornerRadius = v;
                if (this.inited) updateCornerRadius(this);
            },
            
            setLabelTextColor: function(v) {this.labelTextColor = v;},
            
            setLabelTextSelectedColor: function(v) {
                this.labelTextSelectedColor = v;
                if (this.inited && this.selected) this.textView.setTextColor(v);
            },
            
            setSelected: function(v) {
                this.callSuper(v);
                if (this.inited) {
                    this.updateUI();
                    updateTextColor(this);
                }
            },
            
            
            // Methods /////////////////////////////////////////////////////////
            /** @overrides myt.Button. */
            updateUI: function() {
                this.callSuper();
                if (this.selected) this.setBgColor(this.selectedColor);
            }
        }),
        
        /** A mixin that allows myt.Tabs to be added to a view.
            
            Attributes:
                layout:myt.SpacedLayout The layout for the tabs.
                location:string The location of the tabs relative to the container.
                    Supported values are: 'top', 'bottom', 'left' and 'right'. Defaults
                    to 'top'.
                spacing:number The spacing between tabs. Defaults to 1.
                inset:number The inset for the layout. Defaults to 0.
            
            @class */
        TabContainer = pkg.TabContainer = new JSModule('TabContainer', {
            include: [pkg.SelectionManager],
            
            
            // Class Methods and Attributes ////////////////////////////////////
            extend: {
                DEFAULT_SPACING:1,
                DEFAULT_INSET:0
            },
            
            
            // Life Cycle //////////////////////////////////////////////////////
            initNode: function(parent, attrs) {
                this.__tabs = [];
                
                defAttr(attrs, 'spacing', TabContainer.DEFAULT_SPACING);
                defAttr(attrs, 'inset', TabContainer.DEFAULT_INSET);
                defAttr(attrs, 'location', 'top');
                defAttr(attrs, 'itemSelectionId', 'tabId');
                defAttr(attrs, 'maxSelected', 1);
                
                this.callSuper(parent, attrs);
                
                new pkg.SpacedLayout(this, {
                    name:'layout',
                    axis:this.location === 'left' || this.location === 'right' ? 'y' : 'x',
                    spacing:this.spacing,
                    inset:this.inset,
                    collapseParent:true
                });
            },
            
            
            // Accessors ///////////////////////////////////////////////////////
            setLocation: function(v) {this.location = v;},
            
            setSpacing: function(v) {
                if (this.spacing !== v) {
                    this.spacing = v;
                    if (this.layout) this.layout.setSpacing(v);
                }
            },
            
            setInset: function(v) {
                if (this.inset !== v) {
                    this.inset = v;
                    if (this.layout) this.layout.setInset(v);
                }
            },
            
            
            // Methods /////////////////////////////////////////////////////////
            getFirstTab: function() {
                return this.__tabs[0];
            },
            
            /** Gets the currently selected tab.
                @returns myt.Tab or undefined if no tab is selected. */
            getSelectedTab: function() {
                return this.getSelected()[0];
            },
            
            /** @overrides myt.View */
            subnodeAdded: function(node) {
                this.callSuper(node);
                if (node.isA(TabMixin)) {
                    this.__tabs.push(node);
                    
                    switch (this.location) {
                        case 'top':
                            node.setValign('bottom');
                            break;
                        case 'bottom':
                            node.setValign('top');
                            break;
                        case 'left':
                            node.setAlign('right');
                            break;
                        case 'right':
                            node.setAlign('left');
                            break;
                    }
                }
            },
            
            /** @overrides myt.View */
            subnodeRemoved: function(node) {
                if (node.isA(TabMixin)) {
                    const tabs = this.__tabs;
                    let i = tabs.length;
                    while (i) {
                        if (tabs[--i] === node) {
                            tabs.splice(i, 1);
                            break;
                        }
                    }
                }
                this.callSuper(node);
            }
        });
})(myt);

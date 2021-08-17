(pkg => {
    const JSModule = JS.Module,
        
        defAttr = pkg.AccessorSupport.defAttr,
        
        updateTextColor = tab => {
            tab.textView.setTextColor(tab.selected ? tab.labelTextSelectedColor : tab.labelTextColor);
        },
        
        updateCornerRadius = tab => {
            const radius = tab.cornerRadius != null ? tab.cornerRadius : Tab.RADIUS;
            switch (tab.tabContainer.location) {
                case 'top':
                    tab.setRoundedTopLeftCorner(radius);
                    tab.setRoundedTopRightCorner(radius);
                    break;
                case 'bottom':
                    tab.setRoundedBottomLeftCorner(radius);
                    tab.setRoundedBottomRightCorner(radius);
                    break;
                case 'left':
                    tab.setRoundedTopLeftCorner(radius);
                    tab.setRoundedBottomLeftCorner(radius);
                    break;
                case 'right':
                    tab.setRoundedTopRightCorner(radius);
                    tab.setRoundedBottomRightCorner(radius);
                    break;
            }
        },
        
        /** A simple tab component.
            
            Requires:
                myt.Activateable
            
            Attributes:
                tabId:string The unique ID of this tab relative to its tab 
                    container.
                tabContainer:myt.TabContainer The tab container that manages 
                    this tab.
                edgeColor:color
                edgeSize:number
                selectedColor:color
                
                labelTextColorSelected:color The color to use for the label 
                    text when this tab is selected.
                cornerRadius:number Passed into the drawing config to determine
                    if a rounded corner is drawn or not. Defaults to undefined 
                    which causes myt.Tab.RADIUS to be used.
            
            @class */
        Tab = pkg.Tab = new JS.Class('Tab', pkg.SimpleTextButton, {
            include: [pkg.Selectable],
            
            
            // Class Methods and Attributes ////////////////////////////////////
            extend: {
                HEIGHT: 24,
                INSET: 8,
                OUTSET: 8,
                FILL_COLOR_SELECTED: '#fff',
                FILL_COLOR_HOVER: '#eee',
                FILL_COLOR_ACTIVE: '#aaa',
                FILL_COLOR_READY: '#ccc',
                LABEL_TEXT_COLOR_SELECTED:'#333',
                RADIUS:6
            },
            
            
            // Life Cycle //////////////////////////////////////////////////////
            initNode: function(parent, attrs) {
                if (attrs.tabId == null) attrs.tabId = pkg.generateGuid();
                defAttr(attrs, 'tabContainer', parent);
                
                // Selection must be done via the select method on 
                // the tabContainer
                let initiallySelected;
                if (attrs.selected) {
                    initiallySelected = true;
                    delete attrs.selected;
                }
                
                // myt.SimpleTextButton
                defAttr(attrs, 'inset', Tab.INSET);
                defAttr(attrs, 'outset', Tab.OUTSET);
                
                // myt.Tab
                defAttr(attrs, 'selectedColor', Tab.FILL_COLOR_SELECTED);
                defAttr(attrs, 'hoverColor', Tab.FILL_COLOR_HOVER);
                defAttr(attrs, 'activeColor', Tab.FILL_COLOR_ACTIVE);
                defAttr(attrs, 'readyColor', Tab.FILL_COLOR_READY);
                defAttr(attrs, 'labelTextSelectedColor', Tab.LABEL_TEXT_COLOR_SELECTED);
                
                // Other
                defAttr(attrs, 'height', Tab.HEIGHT);
                defAttr(attrs, 'focusIndicator', false);
                
                this.callSuper(parent, attrs);
                
                if (initiallySelected) this.tabContainer.select(this);
                
                updateCornerRadius(this);
                updateTextColor(this);
            },
            
            
            // Accessors ///////////////////////////////////////////////////////
            setTabId: function(v) {this.tabId = v;},
            setTabContainer: function(v) {this.tabContainer = v;},
            setSelectedColor: function(v) {this.selectedColor = v;},
            setLabelTextColor: function(v) {this.labelTextColor = v;},
            
            setCornerRadius: function(v) {
                this.cornerRadius = v;
                if (this.inited) updateCornerRadius(this);
            },
            
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
            },
            
            /** @overrides myt.Activateable */
            doActivated: function() {
                if (!this.selected) this.tabContainer.select(this);
            }
        }),
        
        /** A mixin that allows myt.Tabs to be added to a view.
            
            Attributes:
                layout:myt.SpacedLayout The layout for the tabs.
                location:string The location of the tabs relative to the 
                    container. Supported values are: 'top', 'bottom', 'left' 
                    and 'right'. Defaults to 'top'.
                spacing:number The spacing between tabs. Defaults to 1.
                inset:number The inset for the layout. Defaults to 0.
            
            @class */
        TabContainer = pkg.TabContainer = new JSModule('TabContainer', {
            include: [pkg.SelectionManager],
            
            
            // Class Methods and Attributes ////////////////////////////////////
            extend: {
                SPACING:1,
                INSET:0
            },
            
            
            // Life Cycle //////////////////////////////////////////////////////
            initNode: function(parent, attrs) {
                this.__tabs = [];
                
                defAttr(attrs, 'spacing', TabContainer.SPACING);
                defAttr(attrs, 'inset', TabContainer.INSET);
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
                if (node.isA(Tab)) {
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
                if (node.isA(Tab)) {
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

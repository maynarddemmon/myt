((pkg) => {
    var
        updateTextColor = (tab) => {
            tab.textView.setTextColor(tab.selected ? tab.labelTextSelectedColor : tab.labelTextColor);
        },
        
        updateCornerRadius = (tab) => {
            var r = tab.cornerRadius != null ? tab.cornerRadius : Tab.DEFAULT_RADIUS;
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
        
        /** A simple tab component.
            
            Events:
                None
            
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
        */
        Tab = pkg.Tab = new JS.Class('Tab', pkg.SimpleIconTextButton, {
            include: [pkg.TabMixin],
            
            
            // Class Methods and Attributes ////////////////////////////////////
            extend: {
                DEFAULT_HEIGHT: 24,
                DEFAULT_INSET: 8,
                DEFAULT_OUTSET: 8,
                DEFAULT_FILL_COLOR_SELECTED: '#ffffff',
                DEFAULT_FILL_COLOR_HOVER: '#eeeeee',
                DEFAULT_FILL_COLOR_ACTIVE: '#aaaaaa',
                DEFAULT_FILL_COLOR_READY: '#cccccc',
                DEFAULT_LABEL_TEXT_COLOR_SELECTED:'#333333',
                DEFAULT_RADIUS:6
            },
            
            
            // Life Cycle //////////////////////////////////////////////////////
            initNode: function(parent, attrs) {
                // myt.SimpleIconTextButton
                if (attrs.inset == null) attrs.inset = Tab.DEFAULT_INSET;
                if (attrs.outset == null) attrs.outset = Tab.DEFAULT_OUTSET;
                
                // myt.Tab
                if (attrs.selectedColor == null) attrs.selectedColor = Tab.DEFAULT_FILL_COLOR_SELECTED;
                if (attrs.hoverColor == null) attrs.hoverColor = Tab.DEFAULT_FILL_COLOR_HOVER;
                if (attrs.activeColor == null) attrs.activeColor = Tab.DEFAULT_FILL_COLOR_ACTIVE;
                if (attrs.readyColor == null) attrs.readyColor = Tab.DEFAULT_FILL_COLOR_READY;
                if (attrs.labelTextSelectedColor == null) attrs.labelTextSelectedColor = Tab.DEFAULT_LABEL_TEXT_COLOR_SELECTED;
                
                // Other
                if (attrs.height == null) attrs.height = Tab.DEFAULT_HEIGHT;
                if (attrs.focusEmbellishment == null) attrs.focusEmbellishment = false;
                
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
        });
})(myt);

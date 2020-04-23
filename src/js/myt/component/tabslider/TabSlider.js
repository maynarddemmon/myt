((pkg) => {
    /** A tab slider component.
        
        Events:
            expansionState:string Fired when the tab slider changes expansion state.
        
        Attributes:
            tabId:string The unique ID for this tab slider relative to the
                tab slider container that manages this tab slider.
            tabContainer:myt.TabSliderContainer The tab slider container that 
                manages this tab.
            buttonClass:JS.Class The class to use for the button portion of the
                tab slider. Defaults to myt.SimpleButton.
            fillColorSelected:color The color of the button when selected.
            fillColorHover:color The color of the button when moused over.
            fillColorActive:color The color of the button while active.
            fillColorReady:color The color of the button when ready for interaction.
            buttonHeight:number The height of the button portion of the tab slider.
                Defaults to myt.TabSlider.DEFAULT_BUTTON_HEIGHT which is 30.
            minContainerHeight:number The minimum height of the content container
                inside this tab slider. Defaults to 
                myt.TabSlider.DEFAULT_MINIMUM_CONTAINER_HEIGHT which is 100.
            expansionState:string Indicates the expansion state of the tab slider.
                Supported values are: 'expanded', 'expanding', 'collapsed' and
                'collapsing'. Defaults to 'collapsed'.
    */
    var TabSlider = pkg.TabSlider = new JS.Class('TabSlider', pkg.View, {
        include: [pkg.Selectable, pkg.Disableable, pkg.SizeToParent],
        
        
        // Class Methods and Attributes ////////////////////////////////////////
        extend: {
            DEFAULT_BUTTON_HEIGHT:30,
            /** The minimum height of the container when expanded. */
            DEFAULT_MINIMUM_CONTAINER_HEIGHT:100,
            DEFAULT_FILL_COLOR_SELECTED:'#666666',
            DEFAULT_FILL_COLOR_HOVER:'#eeeeee',
            DEFAULT_FILL_COLOR_ACTIVE:'#cccccc',
            DEFAULT_FILL_COLOR_READY:'#ffffff',
            DEFAULT_ANIMATION_MILLIS:500
        },
        
        
        // Life Cycle //////////////////////////////////////////////////////////
        initNode: function(parent, attrs) {
            var self = this,
                initiallySelected;
            
            attrs.defaultPlacement = 'wrapper.container';
            attrs.percentOfParentWidth = 100;
            attrs.expansionState = 'collapsed';
            
            if (attrs.tabId == null) attrs.tabId = pkg.generateGuid();
            if (attrs.tabContainer == null) attrs.tabContainer = parent;
            
            if (attrs.selected == null) attrs.selected = false;
            if (attrs.buttonClass == null) attrs.buttonClass = pkg.SimpleButton;
            if (attrs.zIndex == null) attrs.zIndex = 0;
            
            if (attrs.buttonHeight == null) attrs.buttonHeight = TabSlider.DEFAULT_BUTTON_HEIGHT;
            if (attrs.fillColorSelected == null) attrs.fillColorSelected = TabSlider.DEFAULT_FILL_COLOR_SELECTED;
            if (attrs.fillColorHover == null) attrs.fillColorHover = TabSlider.DEFAULT_FILL_COLOR_HOVER;
            if (attrs.fillColorActive == null) attrs.fillColorActive = TabSlider.DEFAULT_FILL_COLOR_ACTIVE;
            if (attrs.fillColorReady == null) attrs.fillColorReady = TabSlider.DEFAULT_FILL_COLOR_READY;
            if (attrs.minContainerHeight == null) attrs.minContainerHeight = TabSlider.DEFAULT_MINIMUM_CONTAINER_HEIGHT;
            
            // Selection must be done via the select method on the tabContainer
            if (attrs.selected) {
                initiallySelected = true;
                delete attrs.selected;
            }
            
            self.callSuper(parent, attrs);
            
            if (initiallySelected) self.tabContainer.select(self);
            if (attrs.disabled === true) self.setDisabled(true);
            
            self.setHeight(self.getCollapsedHeight());
        },
        
        doAfterAdoption: function() {
            var self = this,
                View = pkg.View,
                SizeToParent = pkg.SizeToParent,
                wrapper,
                container;
            
            new self.buttonClass(self, {
                name:'button', ignorePlacement:true, zIndex:1,
                height:self.buttonHeight,
                focusEmbellishment:true,
                groupId:self.parent.parent.groupId,
                percentOfParentWidth:100,
                hoverColor:self.fillColorHover,
                activeColor:self.fillColorActive,
                readyColor:self.fillColorReady
            }, [SizeToParent, {
                /** @overrides myt.Button */
                doActivated: function() {
                    var tc = self.tabContainer;
                    if (self.isSelected() && tc.maxSelected !== 1) {
                        tc.deselect(self);
                    } else {
                        tc.select(self);
                    }
                },
                
                /** @overrides myt.Button. */
                updateUI: function() {
                    this.callSuper();
                    if (self.selected && self.tabContainer.maxSelected !== -1) this.setBgColor(self.fillColorSelected);
                    self.notifyButtonRedraw();
                }
            }]);
            
            wrapper = new View(self, {
                name:'wrapper', ignorePlacement:true,
                y:self.buttonHeight, height:0,
                visible:false, maskFocus:true,
                overflow:'hidden', percentOfParentWidth:100
            }, [SizeToParent, {
                setHeight: function(v, supressEvent) {
                    this.callSuper(Math.round(v), supressEvent);
                },
                setWidth: function(v, supressEvent) {
                    this.callSuper(v, supressEvent);
                    if (this.inited) this.container.setWidth(v);
                }
            }]);
            
            container = new View(wrapper, {name:'container'});
            new pkg.SizeToChildren(container, {axis:'y'});
            
            self.constrain('__updateHeight', [wrapper, 'y', wrapper, 'height']);
            
            self.callSuper();
        },
        
        
        // Accessors ///////////////////////////////////////////////////////////
        /** @overrides myt.Selectable */
        setSelected: function(v) {
            this.callSuper(v);
            if (this.button) this.button.updateUI();
        },
        
        setTabId: function(v) {this.tabId = v;},
        setTabContainer: function(v) {this.tabContainer = v;},
        
        setMinContainerHeight: function(v) {this.minContainerHeight = v;},
        setButtonClass: function(v) {this.buttonClass = v;},
        setFillColorSelected: function(v) {this.fillColorSelected = v;},
        setFillColorHover: function(v) {this.fillColorHover = v;},
        setFillColorActive: function(v) {this.fillColorActive = v;},
        setFillColorReady: function(v) {this.fillColorReady = v;},
        
        setButtonHeight: function(v) {
            if (this.buttonHeight !== v) {
                this.buttonHeight = v;
                if (this.button) {
                    this.button.setHeight(v);
                    this.wrapper.setY(v);
                }
            }
        },
        
        setExpansionState: function(v) {
            if (this.expansionState !== v) {
                this.expansionState = v;
                if (this.inited) this.fireEvent('expansionState', v);
                
                var wrapper = this.wrapper;
                if (wrapper) {
                    if (v === 'expanded') {
                        wrapper.setMaskFocus(false);
                        wrapper.setOverflow('auto');
                    } else if (v === 'expanding') {
                        wrapper.setVisible(true);
                    } else if (v === 'collapsed') {
                        wrapper.setVisible(false);
                    } else if (v === 'collapsing') {
                        wrapper.setMaskFocus(true);
                        wrapper.setOverflow('hidden');
                    }
                }
            }
        },
        
        
        // Methods /////////////////////////////////////////////////////////////
        /** @overrides myt.Disableable */
        doDisabled: function() {
            var btn = this.button;
            if (btn) btn.setDisabled(this.disabled);
        },
        
        /** Called whenever the button is redrawn. Gives subclasses/instances
            a chance to do additional things when the button is redrawn.
            @returns {undefined} */
        notifyButtonRedraw: () => {},
        
        /** @private
            @param {!Object} event
            @returns {undefined} */
        __updateHeight: function(event) {
            this.setHeight(this.wrapper.y + this.wrapper.height);
        },
        
        /** Should only be called from the TabSliderContainer.
            @private */
        expand: function(targetHeight) {
            var self = this,
                wrapper = self.wrapper,
                to = targetHeight - self.getCollapsedHeight();
            
            self.setExpansionState('expanding');
            
            wrapper.stopActiveAnimators();
            
            if (wrapper.height !== to) {
                wrapper.animate({
                    attribute:'height', to:to, 
                    duration:TabSlider.DEFAULT_ANIMATION_MILLIS
                }).next((success) => {self.setExpansionState('expanded');});
            } else {
                self.setExpansionState('expanded');
            }
        },
        
        /** Should only be called from the TabSliderContainer.
            @private */
        collapse: function() {
            var self = this,
                wrapper = self.wrapper;
            
            self.setExpansionState('collapsing');
            
            wrapper.stopActiveAnimators();
            
            if (wrapper.height !== 0) {
                wrapper.animate({
                    attribute:'height', to:0, 
                    duration:TabSlider.DEFAULT_ANIMATION_MILLIS
                }).next((success) => {self.setExpansionState('collapsed');});
            } else {
                self.setExpansionState('collapsed');
            }
        },
        
        /** Gets the height of the tab slider when it is collapsed. Will be the
            height of the button portion of the tab slider.
            @returns number */
        getCollapsedHeight: function() {
            return this.buttonHeight;
        },
        
        /** Gets the minimum height. Will be the smaller of the preferred height
            or the buttonHeight + minContainerHeight. Thus, if the content is
            smaller than the minContainerHeight extra space will not be shown.
            @returns number */
        getMinimumExpandedHeight: function() {
            return Math.min(this.getPreferredExpandedHeight(), this.buttonHeight + this.minContainerHeight);
        },
        
        /** Gets the preferred height that would allow the container to be shown
            without vertical scrollbars.
            @returns number */
        getPreferredExpandedHeight: function() {
            return this.buttonHeight + this.wrapper.container.height;
        }
    });
})(myt);

(pkg => {
    const JSClass = JS.Class,
        
        {View, SizeToParent} = pkg,
        
        STATE_EXPANDED = 'expanded',
        STATE_EXPANDING = 'expanding',
        STATE_COLLAPSED = 'collapsed',
        STATE_COLLAPSING = 'collapsing',
        
        /** A tab slider component.
            
            Events:
                expansionState:string Fired when the tab slider changes expansion state.
            
            Attributes:
                tabId:string The unique ID for this tab slider relative to the tab slider container 
                    that manages this tab slider.
                tabContainer:myt.TabSliderContainer The tab slider container that manages this tab.
                buttonClass:JS.Class The class to use for the button portion of the tab slider. 
                    Defaults to myt.SimpleButton.
                fillColorSelected:color The color of the button when selected.
                fillColorHover:color The color of the button when moused over.
                fillColorActive:color The color of the button while active.
                fillColorReady:color The color of the button when ready for interaction.
                buttonHeight:number The height of the button portion of the tab slider. Defaults 
                    to 30.
                minContainerHeight:number The minimum height of the content container inside this 
                    tab slider. This is the minimum height when expanded. Defaults to 100.
                expansionState:string Indicates the expansion state of the tab slider. Supported 
                    values are: 'expanded', 'expanding', 'collapsed' and 'collapsing'. Defaults 
                    to 'collapsed'.
            
            @class */
        _TabSlider = pkg.TabSlider = new JSClass('TabSlider', View, {
            include: [pkg.Selectable, pkg.Disableable, SizeToParent],
            
            
            // Class Methods and Attributes ////////////////////////////////////
            extend: {
                STATE_EXPANDED:STATE_EXPANDED,
                STATE_EXPANDING:STATE_EXPANDING,
                STATE_COLLAPSED:STATE_COLLAPSED,
                STATE_COLLAPSING:STATE_COLLAPSING
            },
            
            
            // Life Cycle //////////////////////////////////////////////////////
            initNode: function(parent, attrs) {
                const self = this;
                let initiallySelected;
                
                const noWrapperContainer = attrs.noWrapperContainer;
                delete attrs.noWrapperContainer;
                
                attrs.defaultPlacement = noWrapperContainer ? 'wrapper' : 'wrapper.container';
                attrs.percentOfParentWidth = 100;
                attrs.expansionState = STATE_COLLAPSED;
                
                attrs.tabId ??= pkg.generateGuid();
                attrs.tabContainer ??= parent;
                attrs.selected ??= false;
                attrs.buttonClass ??= pkg.SimpleButton;
                attrs.zIndex ??= 0;
                attrs.buttonHeight ??= 30;
                attrs.fillColorSelected ??= '#666';
                attrs.fillColorHover ??= '#eee';
                attrs.fillColorActive ??= '#ccc';
                attrs.fillColorReady ??= '#fff';
                attrs.minContainerHeight ??= 100;
                attrs.layoutPaddingY ??= 0;
                attrs.wrapperExpandedOverflow ??= 'autoy';
                
                // Selection must be done via the select method on the tabContainer
                if (attrs.selected) {
                    initiallySelected = true;
                    delete attrs.selected;
                }
                
                self.callSuper(parent, attrs);
                
                self.button = new self.buttonClass(self, {
                    ignorePlacement:true, zIndex:1,
                    height:self.buttonHeight,
                    focusIndicator:true,
                    groupId:self.parent.parent.groupId,
                    percentOfParentWidth:100,
                    hoverColor:self.fillColorHover,
                    activeColor:self.fillColorActive,
                    readyColor:self.fillColorReady
                }, [SizeToParent, {
                    /** @overrides myt.Button */
                    doActivated: () => {
                        const tc = self.tabContainer;
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
                
                const wrapper = self.wrapper = new View(self, {
                    ignorePlacement:true,
                    y:self.buttonHeight, 
                    visible:false, maskFocus:true,
                    overflow:'hidden', percentOfParentWidth:100
                }, [SizeToParent, {
                    setHeight: function(v) {
                        this.callSuper(Math.round(v));
                    },
                    setWidth: function(v) {
                        this.callSuper(v);
                        if (this.inited) this.container?.setWidth(v);
                    }
                }]);
                
                if (!noWrapperContainer) {
                    self._wrapperLayout = new pkg.SizeToChildren(wrapper.container = new View(wrapper), {axis:'y', paddingY:self.layoutPaddingY});
                }
                
                self.constrain('__updateHeight', [wrapper, 'y', wrapper, 'height']);
                
                if (initiallySelected) self.tabContainer.select(self);
                if (attrs.disabled === true) self.setDisabled(true);
                
                self.setHeight(self.getCollapsedHeight());
            },
            
            
            // Accessors ///////////////////////////////////////////////////////
            /** @overrides myt.Selectable */
            setSelected: function(v) {
                this.callSuper(v);
                this.button?.updateUI();
            },
            
            setTabId: function(v) {this.tabId = v;},
            setTabContainer: function(v) {this.tabContainer = v;},
            
            setLayoutPaddingY: function(v) {
                this.layoutPaddingY = v;
                if (this.inited) this._wrapperLayout?.setPaddingY(v);
            },
            
            setMinContainerHeight: function(v) {this.minContainerHeight = v;},
            setButtonClass: function(v) {this.buttonClass = v;},
            setFillColorSelected: function(v) {this.fillColorSelected = v;},
            setFillColorHover: function(v) {this.fillColorHover = v;},
            setFillColorActive: function(v) {this.fillColorActive = v;},
            setFillColorReady: function(v) {this.fillColorReady = v;},
            setWrapperExpandedOverflow: function(v) {this.wrapperExpandedOverflow = v;},
            
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
                    
                    const wrapper = this.wrapper;
                    if (wrapper) {
                        if (v === STATE_EXPANDED) {
                            wrapper.setMaskFocus(false);
                            wrapper.setOverflow(this.wrapperExpandedOverflow);
                            this.tabContainer?.saveState();
                        } else if (v === STATE_EXPANDING) {
                            wrapper.setVisible(true);
                        } else if (v === STATE_COLLAPSED) {
                            wrapper.setVisible(false);
                            this.tabContainer?.saveState();
                        } else if (v === STATE_COLLAPSING) {
                            wrapper.setMaskFocus(true);
                            wrapper.setOverflow('hidden');
                        }
                    }
                }
            },
            
            
            // Methods /////////////////////////////////////////////////////////
            /** @overrides myt.Disableable */
            doDisabled: function() {
                this.button?.setDisabled(this.disabled);
            },
            
            /** Called whenever the button is redrawn. Gives subclasses/instances a chance to do 
                additional things when the button is redrawn.
                @returns {void} */
            notifyButtonRedraw: pkg.NOOP,
            
            /** @private
                @param {!Object} _event
                @returns {void} */
            __updateHeight: function(_event) {
                this.setHeight(this.wrapper.y + this.wrapper.height);
            },
            
            /** Should only be called from the TabSliderContainer.
                @private */
            expand: function(targetHeight) {
                const self = this,
                    wrapper = self.wrapper,
                    to = targetHeight - self.getCollapsedHeight();
                
                self.setExpansionState(STATE_EXPANDING);
                
                wrapper.stopActiveAnimators();
                
                if (wrapper.height !== to) {
                    const duration = self.tabContainer.duration;
                    if (duration === 1) {
                        wrapper.setHeight(to);
                        self.setExpansionState(STATE_EXPANDED);
                    } else {
                        wrapper.animate({
                            attribute:'height', to:to, duration:duration
                        }).next(_success => {self.setExpansionState(STATE_EXPANDED);});
                    }
                } else {
                    self.setExpansionState(STATE_EXPANDED);
                }
            },
            
            /** Should only be called from the TabSliderContainer.
                @private */
            collapse: function() {
                const self = this,
                    wrapper = self.wrapper;
                
                self.setExpansionState(STATE_COLLAPSING);
                
                wrapper.stopActiveAnimators();
                
                if (wrapper.height !== 0) {
                    const duration = self.tabContainer.duration;
                    if (duration === 1) {
                        wrapper.setHeight(0);
                        self.setExpansionState(STATE_COLLAPSED);
                    } else {
                        wrapper.animate({
                            attribute:'height', to:0, duration:duration
                        }).next(_success => {self.setExpansionState(STATE_COLLAPSED);});
                    }
                } else {
                    self.setExpansionState(STATE_COLLAPSED);
                }
            },
            
            /** Gets the height of the tab slider when it is collapsed. Will be the height of the 
                button portion of the tab slider.
                @returns number */
            getCollapsedHeight: function() {
                return this.buttonHeight;
            },
            
            /** Gets the minimum height. Will be the smaller of the preferred height or the 
                buttonHeight + minContainerHeight. Thus, if the content is smaller than the 
                minContainerHeight extra space will not be shown.
                @returns number */
            getMinimumExpandedHeight: function() {
                return Math.min(this.getPreferredExpandedHeight(), this.buttonHeight + this.minContainerHeight);
            },
            
            /** Gets the preferred height that would allow the container to be shown without 
                vertical scrollbars.
                @returns number */
            getPreferredExpandedHeight: function() {
                return this.buttonHeight + this.wrapper.container?.height;
            }
        }),
        
        _updateLabelAttr = (textTabSlider, attrName, labelAttrName, v) => {
            if (textTabSlider[attrName] !== v) {
                textTabSlider[attrName] = v;
                textTabSlider.button?.label?.set(labelAttrName, v);
            }
        };
})(myt);

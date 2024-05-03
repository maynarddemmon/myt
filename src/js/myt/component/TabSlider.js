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
        TabSlider = pkg.TabSlider = new JSClass('TabSlider', View, {
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
                
                attrs.defaultPlacement = 'wrapper.container';
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
                        if (this.inited) this.container.setWidth(v);
                    }
                }]);
                
                self._wrapperLayout = new pkg.SizeToChildren(wrapper.container = new View(wrapper), {axis:'y', paddingY:self.layoutPaddingY});
                
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
                if (this.inited) this._wrapperLayout.setPaddingY(v);
            },
            
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
                    
                    const wrapper = this.wrapper;
                    if (wrapper) {
                        if (v === STATE_EXPANDED) {
                            wrapper.setMaskFocus(false);
                            wrapper.setOverflow('auto');
                        } else if (v === STATE_EXPANDING) {
                            wrapper.setVisible(true);
                        } else if (v === STATE_COLLAPSED) {
                            wrapper.setVisible(false);
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
                        }).next(success => {self.setExpansionState(STATE_EXPANDED);});
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
                        }).next(success => {self.setExpansionState(STATE_COLLAPSED);});
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
                return this.buttonHeight + this.wrapper.container.height;
            }
        }),
        
        /** A tab slider with a text label.
            
            Attributes:
                labelTextColorChecked:color
                labelTextColor:color
                text:string The text for the tab slider.
            
            @class */
        TextTabSlider = pkg.TextTabSlider = new JSClass('TextTabSlider', TabSlider, {
            // Life Cycle //////////////////////////////////////////////////////
            initNode: function(parent, attrs) {
                attrs.labelTextColorChecked ??= '#fff';
                attrs.labelTextColor ??= '#333';
                
                this.callSuper(parent, attrs);
                
                this.button.label = new pkg.Text(this.button, {
                    domClass:'myt-Text mytTextTabSliderLabel', ignorePlacement:true,
                    text:this.text, align:'center', valign:'middle', 
                    textColor:this.__getTextColor()
                });
            },
            
            
            // Accessors ///////////////////////////////////////////////////////
            setLabelTextColorChecked: function(v) {this.labelTextColorChecked = v;},
            setLabelTextColor: function(v) {this.labelTextColor = v;},
            
            setText: function(v) {
                if (this.text !== v) {
                    this.text = v;
                    this.button?.label?.setText(v);
                }
            },
            
            
            // Methods /////////////////////////////////////////////////////////
            /** @overrides myt.TabSlider */
            notifyButtonRedraw: function() {
                this.button.label?.setTextColor(this.__getTextColor());
            },
            
            /** @private
                @returns {string} */
            __getTextColor: function() {
                return (this.selected && this.tabContainer.maxSelected !== -1) ? this.labelTextColorChecked : this.labelTextColor;
            }
        }),
        
        /** A mixin that allows myt.TabSliders to be added to a view.
            
            Attributes:
                spacing:number The spacing between tab sliders. Defaults to
                    myt.TabSliderContainer.SPACING which is 1.
                duration:number The length of time for the animation.
            
            @class */
        TabSliderContainer = pkg.TabSliderContainer = new JS.Module('TabSliderContainer', {
            include: [pkg.SelectionManager],
            
            
            // Class Methods and Attributes ////////////////////////////////////
            extend: {
                SPACING:1
            },
            
            
            // Life Cycle //////////////////////////////////////////////////////
            initNode: function(parent, attrs) {
                const self = this;
                
                self._tabSliders = [];
                
                attrs.defaultPlacement = 'container';
                
                attrs.spacing ??= TabSliderContainer.SPACING;
                attrs.overflow ??= 'autoy';
                attrs.itemSelectionId ??= 'tabId';
                attrs.maxSelected ??= 1;
                attrs.duration ??= 500;
                
                self.updateLayout = pkg.debounce(self.updateLayout);
                
                self.callSuper(parent, attrs);
                
                const container = self.container = new View(self, {
                    ignorePlacement:true, percentOfParentWidth:100
                }, [SizeToParent, {
                    /** @overrides myt.View */
                    subnodeAdded: function(node) {
                        this.callSuper(node);
                        if (node instanceof TabSlider) {
                            self._tabSliders.push(node);
                            self.attachTo(node, 'updateLayout', 'selected');
                        }
                    },
                    
                    /** @overrides myt.View */
                    subnodeRemoved: function(node) {
                        if (node instanceof TabSlider) {
                            const tabSliders = self._tabSliders,
                                idx = tabSliders.indexOf(node);
                            if (idx > -1) {
                                self.detachFrom(node, 'updateLayout', 'selected');
                                tabSliders.splice(idx, 1);
                            }
                        }
                        this.callSuper(node);
                    }
                }]);
                container.layout = new pkg.SpacedLayout(container, {axis:'y', spacing:self.spacing, collapseParent:true});
                
                self.attachTo(self, 'updateLayout', 'height');
            },
            
            
            // Accessors ///////////////////////////////////////////////////////
            setSpacing: function(v) {
                if (this.spacing !== v) {
                    this.spacing = v;
                    this.layout?.setSpacing(v);
                }
            },
            
            setDuration: function(v) {this.duration = v;},
            
            
            // Methods /////////////////////////////////////////////////////////
            /** @param {!Object} ignoredEvent
                @param {number} [temporaryDuration]
                @returns {undefined} */
            updateLayout: function(ignoredEvent, temporaryDuration) {
                const tabSliders = this._tabSliders,
                    tabSlidersLen = tabSliders.length;
                let i = tabSlidersLen, 
                    min = 0, 
                    preferred = 0, 
                    visCount = 0;
                
                while (i) {
                    const tabSlider = tabSliders[--i];
                    if (tabSlider.visible) {
                        ++visCount;
                        if (tabSlider.selected) {
                            min += tabSlider.getMinimumExpandedHeight();
                            preferred += tabSlider.getPreferredExpandedHeight();
                        } else {
                            const collapsedHeight = tabSlider.getCollapsedHeight();
                            min += collapsedHeight;
                            preferred += collapsedHeight;
                        }
                    }
                }
                
                const layout = this.container.layout,
                    layoutOverage = layout.inset + layout.outset + layout.spacing * (visCount - 1);
                min += layoutOverage;
                preferred += layoutOverage;
                
                const h = this.height,
                    minIsOver = min > h,
                    preferredIsOver = preferred > h,
                    existingDuration = this.duration;
                let overage = preferred - h;
                
                if (temporaryDuration > 0) this.setDuration(temporaryDuration);
                
                i = tabSlidersLen;
                while (i) {
                    const tabSlider = tabSliders[--i];
                    if (tabSlider.visible) {
                        if (tabSlider.selected) {
                            let newVal;
                            if (minIsOver) {
                                newVal = tabSlider.getMinimumExpandedHeight();
                            } else if (preferredIsOver) {
                                const tabPreferred = tabSlider.getPreferredExpandedHeight(),
                                    tabMin = tabSlider.getMinimumExpandedHeight();
                                
                                newVal = tabPreferred - overage;
                                if (tabMin > newVal) {
                                    overage -= tabPreferred - tabMin;
                                    newVal = tabMin;
                                } else {
                                    overage = 0;
                                }
                            } else {
                                newVal = tabSlider.getPreferredExpandedHeight();
                            }
                            tabSlider.expand(newVal);
                        } else {
                            tabSlider.collapse();
                        }
                    }
                }
                
                // Restore duration
                if (temporaryDuration > 0) this.setDuration(existingDuration);
            }
        });
})(myt);

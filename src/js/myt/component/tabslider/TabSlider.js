/** A tab slider component.
    
    Events:
        expansionState:string Fired when the tab slider changes expansion state.
    
    Attributes:
        tabId:string The unique ID for this tab slider relative to the
            tab slider container that manages this tab slider.
        tabContainer:myt.TabSliderContainer The tab slider container that 
            manages this tab.
        buttonClass:JS.Class The class to use for the button portion of the
            tab slider. Defaults to myt.DrawButton.
        edgeColor:color The color of the edge of the tab slider button.
        edgeSize:number The size of the edge of the tab slider button.
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
myt.TabSlider = new JS.Class('TabSlider', myt.View, {
    include: [myt.Selectable, myt.Disableable, myt.SizeToParent],
    
    
    // Class Methods and Attributes ////////////////////////////////////////////
    extend: {
        DEFAULT_BUTTON_HEIGHT: 30,
        /** The minimum height of the container when expanded. */
        DEFAULT_MINIMUM_CONTAINER_HEIGHT:100,
        DEFAULT_FILL_COLOR_SELECTED: '#666666',
        DEFAULT_FILL_COLOR_HOVER: '#eeeeee',
        DEFAULT_FILL_COLOR_ACTIVE: '#cccccc',
        DEFAULT_FILL_COLOR_READY: '#ffffff',
        DEFAULT_EDGE_COLOR: '#333333',
        DEFAULT_EDGE_SIZE: 0.5,
        DEFAULT_ANIMATION_MILLIS: 500
    },
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides myt.Checkbox */
    initNode: function(parent, attrs) {
        attrs.defaultPlacement = 'wrapper.container';
        attrs.percentOfParentWidth = 100;
        attrs.expansionState = 'collapsed';
        
        if (attrs.tabId === undefined) attrs.tabId = myt.generateGuid();
        if (attrs.tabContainer === undefined) attrs.tabContainer = parent;
        
        if (attrs.selected === undefined) attrs.selected = false;
        if (attrs.buttonClass === undefined) attrs.buttonClass = myt.DrawButton;
        if (attrs.zIndex === undefined) attrs.zIndex = 0;
        
        var TS = myt.TabSlider;
        if (attrs.edgeColor === undefined) attrs.edgeColor = TS.DEFAULT_EDGE_COLOR;
        if (attrs.edgeSize === undefined) attrs.edgeSize = TS.DEFAULT_EDGE_SIZE;
        if (attrs.buttonHeight === undefined) attrs.buttonHeight = TS.DEFAULT_BUTTON_HEIGHT;
        if (attrs.fillColorSelected === undefined) attrs.fillColorSelected = TS.DEFAULT_FILL_COLOR_SELECTED;
        if (attrs.fillColorHover === undefined) attrs.fillColorHover = TS.DEFAULT_FILL_COLOR_HOVER;
        if (attrs.fillColorActive === undefined) attrs.fillColorActive = TS.DEFAULT_FILL_COLOR_ACTIVE;
        if (attrs.fillColorReady === undefined) attrs.fillColorReady = TS.DEFAULT_FILL_COLOR_READY;
        if (attrs.minContainerHeight === undefined) attrs.minContainerHeight = TS.DEFAULT_MINIMUM_CONTAINER_HEIGHT;
        
        // Selection must be done via the select method on the tabContainer
        if (attrs.selected) {
            var initiallySelected = true;
            delete attrs.selected;
        }
        
        this.callSuper(parent, attrs);
        
        if (initiallySelected) this.tabContainer.select(this);
        if (attrs.disabled === true) this.setDisabled(true);
        
        this.setHeight(this.getCollapsedHeight());
    },
    
    doAfterAdoption: function() {
        var self = this, btnClass = this.buttonClass;
        new btnClass(this, {
            name:'button', ignorePlacement:true, zIndex:1,
            height:this.buttonHeight,
            focusEmbellishment:true,
            drawingMethodClassname:'myt.TabSliderDrawingMethod',
            groupId:this.parent.parent.groupId,
            percentOfParentWidth:100,
            fillColorChecked:this.fillColorChecked,
            fillColorHover:this.fillColorHover,
            fillColorActive:this.fillColorActive,
            fillColorReady:this.fillColorReady,
            fillBorderColor:this.fillBorderColor,
            edgeSize:this.edgeSize
        }, [myt.SizeToParent, {
            setFocused: function(v) {
                this.callSuper(v);
                if (this.inited) this.redraw();
            },
            
            /** @overrides myt.DrawButton */
            doActivated: function() {
                if (!self.selected) self.tabContainer.select(self);
            },
            
            /** @overrides myt.DrawButton */
            getDrawConfig: function(state) {
                var config = this.callSuper(state);
                
                config.selected = self.selected;
                config.edgeColor = self.edgeColor;
                config.edgeSize = self.edgeSize;
                
                if (self.selected) {
                    config.fillColor = self.fillColorSelected;
                } else {
                    switch (state) {
                        case 'hover':
                            config.fillColor = self.fillColorHover;
                            break;
                        case 'active':
                            config.fillColor = self.fillColorActive;
                            break;
                        case 'disabled':
                        case 'ready':
                            config.fillColor = this.focused ? self.fillColorHover : self.fillColorReady;
                            break;
                        default:
                    }
                }
                
                return config;
            },
            
            /** @overrides myt.DrawButton */
            getDrawBounds: function() {
                var bounds = this.drawBounds;
                bounds.w = this.width;
                bounds.h = this.height;
                return bounds;
            },
            
            /** @overrides myt.DrawButton */
            redraw: function(state) {
                this.callSuper(state);
                self.notifyButtonRedraw(state);
            }
        }]);
        
        var wrapper = new myt.View(this, {
            name:'wrapper', ignorePlacement:true,
            y:this.buttonHeight, height:0,
            visible:false, maskFocus:true,
            overflow:'hidden', percentOfParentWidth:100
        }, [myt.SizeToParent]);
        
        var container = new myt.View(wrapper, {name:'container'});
        new myt.SizeToChildren(container, {axis:'y'});
        
        this.applyConstraint('__updateHeight', [wrapper, 'y', wrapper, 'height']);
        
        this.callSuper();
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    /** @overrides myt.Selectable */
    setSelected: function(v) {
        this.callSuper(v);
        if (this.button) this.button.redraw();
    },
    
    setTabId: function(v) {this.tabId = v;},
    setTabContainer: function(v) {this.tabContainer = v;},
    
    setMinContainerHeight: function(v) {this.minContainerHeight = v;},
    setButtonClass: function(v) {this.buttonClass = v;},
    setEdgeColor: function(v) {this.edgeColor = v;},
    setEdgeSize: function(v) {this.edgeSize = v;},
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
            if (this.inited) this.fireNewEvent('expansionState', v);
            
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
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** @overrides myt.Disableable */
    doDisabled: function() {
        var btn = this.button;
        if (btn) btn.setDisabled(this.disabled);
    },
    
    /** Called whenever the button is redrawn. Gives subclasses/instances
        a chance to do additional things when the button is redrawn.
        @param state:string The state the button is in.
        @returns void */
    notifyButtonRedraw: function(state) {},
    
    /** @private */
    __updateHeight: function(event) {
        this.setHeight(this.wrapper.y + this.wrapper.height);
    },
    
    /** Should only be called from the TabSliderContainer.
        @private */
    expand: function(targetHeight) {
        this.setExpansionState('expanding');
        
        this.wrapper.stopActiveAnimators();
        
        var self = this;
        this.wrapper.animate({
            attribute:'height', to:targetHeight - this.getCollapsedHeight(), 
            duration:myt.TabSlider.DEFAULT_ANIMATION_MILLIS, easingFunction:'easeInOutQuad'
        }).next(function(success) {self.setExpansionState('expanded');});
    },
    
    /** Should only be called from the TabSliderContainer.
        @private */
    collapse: function(targetHeight) {
        this.setExpansionState('collapsing');
        
        this.wrapper.stopActiveAnimators();
        
        var self = this;
        this.wrapper.animate({
            attribute:'height', to:targetHeight - this.getCollapsedHeight(), 
            duration:myt.TabSlider.DEFAULT_ANIMATION_MILLIS, easingFunction:'easeInOutQuad'
        }).next(function(success) {self.setExpansionState('collapsed');});
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

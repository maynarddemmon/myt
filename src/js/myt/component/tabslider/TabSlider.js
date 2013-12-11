/** A tab slider component. */
myt.TabSlider = new JS.Class('TabSlider', myt.View, {
    include: [myt.SizeToParent],
    
    
    // Class Methods and Attributes ////////////////////////////////////////////
    extend: {
        DEFAULT_BUTTON_HEIGHT: 30,
        /** The minimum height of the container when expanded. */
        DEFAULT_MINIMUM_CONTAINER_HEIGHT:100,
        DEFAULT_FILL_COLOR_CHECKED: '#666666',
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
        
        if (attrs.selected === undefined) attrs.selected = false;
        if (attrs.buttonClass === undefined) attrs.buttonClass = myt.Radio;
        if (attrs.zIndex === undefined) attrs.zIndex = 0;
        
        var TS = myt.TabSlider;
        if (attrs.buttonHeight === undefined) attrs.buttonHeight = TS.DEFAULT_BUTTON_HEIGHT;
        if (attrs.fillColorChecked === undefined) attrs.fillColorChecked = TS.DEFAULT_FILL_COLOR_CHECKED;
        if (attrs.fillColorHover === undefined) attrs.fillColorHover = TS.DEFAULT_FILL_COLOR_HOVER;
        if (attrs.fillColorActive === undefined) attrs.fillColorActive = TS.DEFAULT_FILL_COLOR_ACTIVE;
        if (attrs.fillColorReady === undefined) attrs.fillColorReady = TS.DEFAULT_FILL_COLOR_READY;
        if (attrs.edgeColor === undefined) attrs.edgeColor = TS.DEFAULT_EDGE_COLOR;
        if (attrs.edgeSize === undefined) attrs.edgeSize = TS.DEFAULT_EDGE_SIZE;
        if (attrs.minContainerHeight === undefined) attrs.minContainerHeight = TS.DEFAULT_MINIMUM_CONTAINER_HEIGHT;
        
        this.callSuper(parent, attrs);
        
        if (attrs.disabled === true) this.setDisabled(true);
        if (attrs.selected === true) this.setSelected(true);
        
        this.setHeight(this.getCollapsedHeight());
        
        this.parent.parent.updateLayout();
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
            checked:this.selected,
            fillColorChecked:this.fillColorChecked,
            fillColorHover:this.fillColorHover,
            fillColorActive:this.fillColorActive,
            fillColorReady:this.fillColorReady,
            fillBorderColor:this.fillBorderColor,
            edgeSize:this.edgeSize
        }, [myt.SizeToParent, {
            /** @overrides myt.CheckboxMixin */
            getDrawConfig: function(state) {
                var config = this.callSuper(state);
                if (this.focused && state !== 'active') config.fillColor = self.fillColorHover;
                if (this.checked) config.fillColor = self.fillColorChecked;
                return config;
            },
            
            /** @overrides myt.CheckboxMixin */
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
        this.syncTo(this.button, 'setSelected', 'checked');
        this.syncTo(this.button, 'setDisabled', 'disabled');
        
        var wrapper = new myt.View(this, {
            name:'wrapper', ignorePlacement:true,
            y:this.buttonHeight, height:0,
            visible:false, maskFocus:true,
            overflow:'hidden', percentOfParentWidth:100
        }, [myt.SizeToParent]);
        
        var container = new myt.View(wrapper, {name:'container'});
        new myt.SizeToChildren(container, {axis:'y'});
        
        this.applyConstraint('_updateHeight', [wrapper, 'y', wrapper, 'height']);
        
        this.callSuper();
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setFillColorChecked: function(v) {
        if (this.fillColorChecked !== v) {
            this.fillColorChecked = v;
            if (this.button) this.button.setFillColorChecked(v);
        }
    },
    setFillColorHover: function(v) {
        if (this.fillColorHover !== v) {
            this.fillColorHover = v;
            if (this.button) this.button.setFillColorHover(v);
        }
    },
    setFillColorActive: function(v) {
        if (this.fillColorActive !== v) {
            this.fillColorActive = v;
            if (this.button) this.button.setFillColorActive(v);
        }
    },
    setFillColorReady: function(v) {
        if (this.fillColorReady !== v) {
            this.fillColorReady = v;
            if (this.button) this.button.setFillColorReady(v);
        }
    },
    setEdgeColor: function(v) {
        if (this.edgeColor !== v) {
            this.edgeColor = v;
            if (this.button) this.button.setEdgeColor(v);
        }
    },
    setEdgeSize: function(v) {
        if (this.edgeSize !== v) {
            this.edgeSize = v;
            if (this.button) this.button.setEdgeSize(v);
        }
    },
    setButtonHeight: function(v) {
        if (this.buttonHeight !== v) {
            this.buttonHeight = v;
            if (this.button) {
                this.button.setHeight(v);
                this.wrapper.setY(v);
            }
        }
    },
    setMinContainerHeight: function(v) {this.minContainerHeight = v;},
    setButtonClass: function(v) {this.buttonClass = v;},
    
    setSelected: function(v) {
        // Adapt to event from syncTo
        if (typeof v === 'object') v = v.value;
        
        if (this.selected !== v) {
            this.selected = v;
            if (this.inited) this.fireNewEvent('selected', v);
            
            // Sync the other direction if necessary.
            if (this.button && this.button.checked !== v) this.button.setChecked(v);
        }
    },
    
    setDisabled: function(v) {
        // Adapt to event from syncTo
        if (typeof v === 'object') v = v.value;
        
        if (this.disabled !== v) {
            this.disabled = v;
            if (this.inited) this.fireNewEvent('disabled', v);
            
            // Sync the other direction if necessary.
            if (this.button && this.button.disabled !== v) this.button.setDisabled(v);
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
    /** Called whenever the button is redrawn. */
    notifyButtonRedraw: function(state) {},
    
    _updateHeight: function(event) {
        this.setHeight(this.wrapper.y + this.wrapper.height);
    },
    
    expand: function(targetHeight) {
        this.setExpansionState('expanding');
        
        this.wrapper.stopActiveAnimators();
        
        var self = this;
        this.wrapper.animate({
            attribute:'height', to:targetHeight - this.getCollapsedHeight(), 
            duration:myt.TabSlider.DEFAULT_ANIMATION_MILLIS, easingFunction:'easeInOutQuad'
        }).next(function(success) {self.setExpansionState('expanded');});
    },
    
    collapse: function(targetHeight) {
        this.setExpansionState('collapsing');
        
        this.wrapper.stopActiveAnimators();
        
        var self = this;
        this.wrapper.animate({
            attribute:'height', to:targetHeight - this.getCollapsedHeight(), 
            duration:myt.TabSlider.DEFAULT_ANIMATION_MILLIS, easingFunction:'easeInOutQuad'
        }).next(function(success) {self.setExpansionState('collapsed');});
    },
    
    getCollapsedHeight: function() {
        return this.buttonHeight;
    },
    
    getMinimumExpandedHeight: function() {
        return Math.min(this.getPreferredExpandedHeight(), this.buttonHeight + this.minContainerHeight);
    },
    
    getPreferredExpandedHeight: function() {
        return this.buttonHeight + this.wrapper.container.height;
    }
});

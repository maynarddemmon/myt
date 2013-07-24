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
        DEFAULT_BORDER_COLOR: '#333333',
        DEFAULT_BORDER_SIZE: 0.5,
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
        
        var TS = myt.TabSlider;
        if (attrs.buttonHeight === undefined) attrs.buttonHeight = TS.DEFAULT_BUTTON_HEIGHT;
        if (attrs.fillColorChecked === undefined) attrs.fillColorChecked = TS.DEFAULT_FILL_COLOR_CHECKED;
        if (attrs.fillColorHover === undefined) attrs.fillColorHover = TS.DEFAULT_FILL_COLOR_HOVER;
        if (attrs.fillColorActive === undefined) attrs.fillColorActive = TS.DEFAULT_FILL_COLOR_ACTIVE;
        if (attrs.fillColorReady === undefined) attrs.fillColorReady = TS.DEFAULT_FILL_COLOR_READY;
        if (attrs.borderColor === undefined) attrs.borderColor = TS.DEFAULT_BORDER_COLOR;
        if (attrs.borderSize === undefined) attrs.borderSize = TS.DEFAULT_BORDER_SIZE;
        if (attrs.minContainerHeight === undefined) attrs.minContainerHeight = TS.DEFAULT_MINIMUM_CONTAINER_HEIGHT;
        
        this.callSuper(parent, attrs);
        
        this.setHeight(this.getCollapsedHeight());
        
        this.parent.parent.updateLayout();
    },
    
    doAfterAdoption: function() {
        var wrapper = new myt.View(this, {
            name:'wrapper', ignorePlacement:true,
            y:this.buttonHeight, height:0,
            visible:false, maskFocus:true,
            clip:true, overflow:'hidden', percentOfParentWidth:100
        }, [myt.SizeToParent]);
        
        var container = new myt.View(wrapper, {name:'container'});
        new myt.SizeToChildren(container, {axis:'y'});
        
        this.applyConstraint('_updateHeight', [wrapper, 'y', wrapper, 'height']);
        
        var self = this;
        var btnClass = this.buttonClass;
        new btnClass(this, {
            name:'button', ignorePlacement:true,
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
            borderSize:this.borderSize
        }, [myt.SizeToParent, {
            /** @overrides myt.Checkbox */
            getDrawConfig: function(state) {
                var config = this.callSuper(state);
                if (this.focused && state !== 'active') config.fillColor = self.fillColorHover;
                if (this.checked) config.fillColor = self.fillColorChecked;
                return config;
            },
            
            /** @overrides myt.Checkbox */
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
        
        this.callSuper();
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setFillColorChecked: function(v) {
        if (this.fillColorChecked === v) return;
        this.fillColorChecked = v;
        if (this.button) this.button.setFillColorChecked(v);
    },
    setFillColorHover: function(v) {
        if (this.fillColorHover === v) return;
        this.fillColorHover = v;
        if (this.button) this.button.setFillColorHover(v);
    },
    setFillColorActive: function(v) {
        if (this.fillColorActive === v) return;
        this.fillColorActive = v;
        if (this.button) this.button.setFillColorActive(v);
    },
    setFillColorReady: function(v) {
        if (this.fillColorReady === v) return;
        this.fillColorReady = v;
        if (this.button) this.button.setFillColorReady(v);
    },
    setBorderColor: function(v) {
        if (this.borderColor === v) return;
        this.borderColor = v;
        if (this.button) this.button.setBorderColor(v);
    },
    setBorderSize: function(v) {
        if (this.borderSize === v) return;
        this.borderSize = v;
        if (this.button) this.button.setBorderSize(v);
    },
    setButtonHeight: function(v) {
        if (this.buttonHeight === v) return;
        this.buttonHeight = v;
        if (this.button) {
            this.button.setHeight(v);
            this.wrapper.setY(v);
        }
    },
    setMinContainerHeight: function(v) {this.minContainerHeight = v;},
    setButtonClass: function(v) {this.buttonClass = v;},
    
    setSelected: function(v) {
        // Adapt to event from syncTo
        if (typeof v === 'object') v = v.value;
        
        if (this.selected === v) return;
        this.selected = v;
        if (this.inited) this.fireNewEvent('selected', v);
        
        // Sync the other direction if necessary.
        if (this.button && this.button.checked !== v) this.button.setChecked(v);
    },
    
    setExpansionState: function(v) {
        if (this.expansionState === v) return;
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
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** Called whenever the button is redrawn. */
    notifyButtonRedraw: function(state) {},
    
    _updateHeight: function(event) {
        this.setHeight(this.wrapper.y + this.wrapper.height);
    },
    
    expand: function(targetHeight) {
        this.setExpansionState('expanding');
        
        // Stop any running animations
        var activeAnims = this.wrapper.getActiveAnimators();
        var i = activeAnims.length;
        while (i) activeAnims[--i].reset(false);
        
        var self = this;
        this.wrapper.animate({
            attribute:'height', to:targetHeight - this.getCollapsedHeight(), 
            duration:myt.TabSlider.DEFAULT_ANIMATION_MILLIS, easingFunction:'easeInOutQuad'
        }).next(function(success) {self.setExpansionState('expanded');});
    },
    
    collapse: function(targetHeight) {
        this.setExpansionState('collapsing');
        
        // Stop any running animations
        var activeAnims = this.wrapper.getActiveAnimators();
        var i = activeAnims.length;
        while (i) activeAnims[--i].reset(false);
        
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

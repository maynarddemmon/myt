/** A mixin that allows myt.TabSliders to be added to a view. */
myt.TabSliderContainer = new JS.Module('TabSliderContainer', {
    // Class Methods and Attributes ////////////////////////////////////////////
    extend: {
        DEFAULT_SPACING:1
    },
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    initNode: function(parent, attrs) {
        this._tabSliders = [];
        
        attrs.defaultPlacement = 'container';
        
        if (attrs.spacing === undefined) attrs.spacing = myt.TabSliderContainer.DEFAULT_SPACING;
        
        if (attrs.clip === undefined) attrs.clip = true;
        if (attrs.overflow === undefined) attrs.overflow = 'auto';
        if (attrs.groupId === undefined) attrs.groupId = myt.generateGuid();
        
        myt.DelayedMethodCall.createDelayedMethodCall(this, 0, '_updateLayout');
        
        this.callSuper(parent, attrs);
    },
    
    doAfterAdoption: function() {
        var self = this;
        var container = new myt.View(this, {
            name:'container', ignorePlacement:true, percentOfParentWidth:100
        }, [myt.SizeToParent, {
            /** @overrides myt.View */
            subnodeAdded: function(node) {
                this.callSuper(node);
                if (node instanceof myt.TabSlider) {
                    self._tabSliders.push(node);
                    self.attachTo(node, 'updateLayout', 'selected');
                }
            },
            
            /** @overrides myt.View */
            subnodeRemoved: function(node) {
                if (node instanceof myt.TabSlider) {
                    var tabSliders = self._tabSliders, i = tabSliders.length;
                    while (i) {
                        if (tabSliders[--i] === node) {
                            self.detachFrom(node, 'updateLayout', 'selected');
                            tabSliders.splice(i, 1);
                            break;
                        }
                    }
                }
                this.callSuper(node);
            }
        }]);
        new myt.SpacedLayout(container, {name:'layout', axis:'y', spacing:this.spacing, collapseParent:true});
        
        this.attachTo(this, 'updateLayout', 'height');
        
        this.callSuper();
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setGroupId: function(v) {
        this.groupId = v;
    },
    
    setSpacing: function(v) {
        if (this.spacing === v) return;
        this.spacing = v;
        if (this.layout) this.layout.setSpacing(v);
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    updateLayout: function(event) {
        this._updateLayoutDelayed();
    },
    
    _updateLayout: function() {
        var tabSliders = this._tabSliders, i = tabSliders.length, tabSlider;
        var min = 0, preferred = 0, visCount = 0;
        
        while (i) {
            tabSlider = tabSliders[--i];
            
            if (tabSlider.visible) {
                ++visCount;
                if (tabSlider.selected) {
                    min += tabSlider.getMinimumExpandedHeight();
                    preferred += tabSlider.getPreferredExpandedHeight();
                } else {
                    min += tabSlider.getCollapsedHeight();
                    preferred += tabSlider.getCollapsedHeight();
                }
            }
        }
        
        var layout = this.container.layout;
        var layoutOverage = layout.inset + layout.outset + layout.spacing * (visCount - 1);
        min += layoutOverage;
        preferred += layoutOverage;
        
        var minIsOver = min > this.height;
        var preferredIsOver = preferred > this.height;
        
        i = tabSliders.length;
        while (i) {
            tabSlider = tabSliders[--i];
            
            if (tabSlider.visible) {
                if (tabSlider.selected) {
                    if (minIsOver) {
                        tabSlider.expand(tabSlider.getMinimumExpandedHeight());
                    } else if (preferredIsOver) {
                        var diff = preferred - this.height;
                        tabSlider.expand(tabSlider.getPreferredExpandedHeight() - diff);
                    } else {
                        tabSlider.expand(tabSlider.getPreferredExpandedHeight());
                    }
                } else {
                    tabSlider.collapse(tabSlider.getCollapsedHeight());
                }
            }
        }
    }
});

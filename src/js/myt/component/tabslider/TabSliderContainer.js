((pkg) => {
    /** A mixin that allows myt.TabSliders to be added to a view.
        
        Attributes:
            spacing:number The spacing between tab sliders. Defaults to
                myt.TabSliderContainer.DEFAULT_SPACING which is 1.
        
        @class */
    pkg.TabSliderContainer = new JS.Module('TabSliderContainer', {
        include: [pkg.SelectionManager],
        
        
        // Class Methods and Attributes ////////////////////////////////////////
        extend: {
            DEFAULT_SPACING:1
        },
        
        
        // Life Cycle //////////////////////////////////////////////////////////
        initNode: function(parent, attrs) {
            const self = this;
            
            self._tabSliders = [];
            
            attrs.defaultPlacement = 'container';
            
            if (attrs.spacing == null) attrs.spacing = pkg.TabSliderContainer.DEFAULT_SPACING;
            if (attrs.overflow == null) attrs.overflow = 'autoy';
            if (attrs.itemSelectionId == null) attrs.itemSelectionId = 'tabId';
            if (attrs.maxSelected == null) attrs.maxSelected = 1;
            
            self.updateLayout = pkg.debounce(self.updateLayout);
            
            self.callSuper(parent, attrs);
            
            const TabSlider = pkg.TabSlider;
            const container = new pkg.View(self, {
                name:'container', ignorePlacement:true, percentOfParentWidth:100
            }, [pkg.SizeToParent, {
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
                        const tabSliders = self._tabSliders;
                        let i = tabSliders.length;
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
            new pkg.SpacedLayout(container, {name:'layout', axis:'y', spacing:self.spacing, collapseParent:true});
            
            self.attachTo(self, 'updateLayout', 'height');
        },
        
        
        // Accessors ///////////////////////////////////////////////////////////
        setSpacing: function(v) {
            if (this.spacing !== v) {
                this.spacing = v;
                if (this.layout) this.layout.setSpacing(v);
            }
        },
        
        
        // Methods /////////////////////////////////////////////////////////////
        /** @param {!Object} event
            @returns {undefined} */
        updateLayout: function(event) {
            const tabSliders = this._tabSliders;
            let i = tabSliders.length, 
                tabSlider,
                min = 0, 
                preferred = 0, 
                visCount = 0, 
                collapsedHeight;
            
            while (i) {
                tabSlider = tabSliders[--i];
                
                if (tabSlider.visible) {
                    ++visCount;
                    if (tabSlider.selected) {
                        min += tabSlider.getMinimumExpandedHeight();
                        preferred += tabSlider.getPreferredExpandedHeight();
                    } else {
                        collapsedHeight = tabSlider.getCollapsedHeight();
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
                preferredIsOver = preferred > h;
            let overage = preferred - h,
                tabPreferred, 
                tabMin, 
                newVal;
            
            i = tabSliders.length;
            while (i) {
                tabSlider = tabSliders[--i];
                
                if (tabSlider.visible) {
                    if (tabSlider.selected) {
                        if (minIsOver) {
                            newVal = tabSlider.getMinimumExpandedHeight();
                        } else if (preferredIsOver) {
                            tabPreferred = tabSlider.getPreferredExpandedHeight();
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
        }
    });
})(myt);

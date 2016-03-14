/** A mixin that allows myt.TabSliders to be added to a view.
    
    Events:
        None
    
    Attributes:
        spacing:number The spacing between tab sliders. Defaults to
            myt.TabSliderContainer.DEFAULT_SPACING which is 1.
*/
myt.TabSliderContainer = new JS.Module('TabSliderContainer', {
    include: [myt.SelectionManager],
    
    
    // Class Methods and Attributes ////////////////////////////////////////////
    extend: {
        DEFAULT_SPACING:1
    },
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    initNode: function(parent, attrs) {
        this._tabSliders = [];
        
        attrs.defaultPlacement = 'container';
        
        if (attrs.spacing === undefined) attrs.spacing = myt.TabSliderContainer.DEFAULT_SPACING;
        if (attrs.overflow === undefined) attrs.overflow = 'autoy';
        if (attrs.itemSelectionId === undefined) attrs.itemSelectionId = 'tabId';
        if (attrs.maxSelected === undefined) attrs.maxSelected = 1;
        
        myt.DelayedMethodCall.createDelayedMethodCall(this, 0, '__updateLayout');
        
        this.callSuper(parent, attrs);
    },
    
    doAfterAdoption: function() {
        var self = this,
            M = myt,
            TS = M.TabSlider;
        var container = new M.View(this, {
            name:'container', ignorePlacement:true, percentOfParentWidth:100
        }, [M.SizeToParent, {
            /** @overrides myt.View */
            subnodeAdded: function(node) {
                this.callSuper(node);
                if (node instanceof TS) {
                    self._tabSliders.push(node);
                    self.attachTo(node, 'updateLayout', 'selected');
                }
            },
            
            /** @overrides myt.View */
            subnodeRemoved: function(node) {
                if (node instanceof TS) {
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
        new M.SpacedLayout(container, {name:'layout', axis:'y', spacing:this.spacing, collapseParent:true});
        
        this.attachTo(this, 'updateLayout', 'height');
        
        this.callSuper();
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setSpacing: function(v) {
        if (this.spacing !== v) {
            this.spacing = v;
            if (this.layout) this.layout.setSpacing(v);
        }
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    updateLayout: function(event) {
        this.__updateLayoutDelayed();
    },
    
    /** @private */
    __updateLayout: function() {
        var tabSliders = this._tabSliders, i = tabSliders.length, tabSlider,
            min = 0, preferred = 0, visCount = 0, collapsedHeight;
        
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
        
        var layout = this.container.layout,
            layoutOverage = layout.inset + layout.outset + layout.spacing * (visCount - 1);
        min += layoutOverage;
        preferred += layoutOverage;
        
        var h = this.height,
            minIsOver = min > h,
            preferredIsOver = preferred > h,
            overage = preferred - h,
            tabPreferred, tabMin, newVal;
        
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

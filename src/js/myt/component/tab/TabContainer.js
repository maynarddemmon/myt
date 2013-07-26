/** A mixin that allows myt.Tabs to be added to a view. */
myt.TabContainer = new JS.Module('TabContainer', {
    // Class Methods and Attributes ////////////////////////////////////////////
    extend: {
        DEFAULT_SPACING:1
    },
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    initNode: function(parent, attrs) {
        this._tabs = [];
        
        if (attrs.spacing === undefined) attrs.spacing = myt.TabContainer.DEFAULT_SPACING;
        
        if (attrs.location === undefined) attrs.location = 'top';
        if (attrs.groupId === undefined) attrs.groupId = myt.generateGuid();
        
        this.callSuper(parent, attrs);
    },
    
    doAfterAdoption: function() {
        var axis;
        switch (this.location) {
            case 'top':
            case 'bottom':
                axis = 'x';
                break;
            case 'left':
            case 'right':
                axis = 'y';
                break;
        }
        
        new myt.SpacedLayout(this, {name:'layout', axis:axis, spacing:this.spacing, collapseParent:true});
        
        this.callSuper();
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setGroupId: function(v) {this.groupId = v;},
    setLocation: function(v) {this.location = v;},
    
    setSpacing: function(v) {
        if (this.spacing === v) return;
        this.spacing = v;
        if (this.layout) this.layout.setSpacing(v);
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    getFirstTab: function() {
        return this._tabs[0];
    },
    
    getSelected: function() {
        var tab = this._tabs[0];
        if (tab) return tab.getCheckedRadio();
        return null;
    },
    
    /** @overrides myt.View */
    subnodeAdded: function(node) {
        this.callSuper(node);
        if (node instanceof myt.Tab) {
            this._tabs.push(node);
            
            switch (this.location) {
                case 'top':
                    node.setValign('bottom');
                    break;
                case 'bottom':
                    node.setValign('top');
                    break;
                case 'left':
                    node.setAlign('right');
                    break;
                case 'right':
                    node.setAlign('left');
                    break;
            }
        }
    },
    
    /** @overrides myt.View */
    subnodeRemoved: function(node) {
        if (node instanceof myt.Tab) {
            var tabs = this._tabs, i = tabs.length;
            while (i) {
                if (tabs[--i] === node) {
                    tabs.splice(i, 1);
                    break;
                }
            }
        }
        this.callSuper(node);
    }
});

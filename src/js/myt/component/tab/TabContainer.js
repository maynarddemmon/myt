/** A mixin that allows myt.Tabs to be added to a view.
    
    Events:
        None
    
    Attributes:
        location:string The location of the tabs relative to the container.
            Supported values are: 'top', 'bottom', 'left' and 'right'. Defaults
            to 'top'.
        spacing:number The spacing between tabs.
*/
myt.TabContainer = new JS.Module('TabContainer', {
    include: [myt.SelectionManager],
    
    
    // Class Methods and Attributes ////////////////////////////////////////////
    extend: {
        DEFAULT_SPACING:1
    },
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    initNode: function(parent, attrs) {
        this._tabs = [];
        
        if (attrs.spacing === undefined) attrs.spacing = myt.TabContainer.DEFAULT_SPACING;
        if (attrs.location === undefined) attrs.location = 'top';
        if (attrs.itemSelectionId === undefined) attrs.itemSelectionId = 'tabId';
        if (attrs.maxSelected === undefined) attrs.maxSelected = 1;
        
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
    setLocation: function(v) {this.location = v;},
    
    setSpacing: function(v) {
        if (this.spacing !== v) {
            this.spacing = v;
            if (this.layout) this.layout.setSpacing(v);
        }
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    getFirstTab: function() {
        return this._tabs[0];
    },
    
    /** Gets the currently selected tab.
        @returns myt.Tab or undefined if no tab is selected. */
    getSelectedTab: function() {
        return this.getSelected()[0];
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

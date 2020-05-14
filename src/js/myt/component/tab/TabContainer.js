/** A mixin that allows myt.Tabs to be added to a view.
    
    Events:
        None
    
    Attributes:
        layout:myt.SpacedLayout The layout for the tabs.
        location:string The location of the tabs relative to the container.
            Supported values are: 'top', 'bottom', 'left' and 'right'. Defaults
            to 'top'.
        spacing:number The spacing between tabs. Defaults to 1.
        inset:number The inset for the layout. Defaults to 0.
*/
myt.TabContainer = new JS.Module('TabContainer', {
    include: [myt.SelectionManager],
    
    
    // Class Methods and Attributes ////////////////////////////////////////////
    extend: {
        DEFAULT_SPACING:1,
        DEFAULT_INSET:0
    },
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    initNode: function(parent, attrs) {
        this.__tabs = [];
        
        const TC = myt.TabContainer;
        if (attrs.spacing == null) attrs.spacing = TC.DEFAULT_SPACING;
        if (attrs.inset == null) attrs.inset = TC.DEFAULT_INSET;
        
        if (attrs.location == null) attrs.location = 'top';
        
        if (attrs.itemSelectionId == null) attrs.itemSelectionId = 'tabId';
        if (attrs.maxSelected == null) attrs.maxSelected = 1;
        
        this.callSuper(parent, attrs);
        
        let axis;
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
        
        new myt.SpacedLayout(this, {
            name:'layout', axis:axis, spacing:this.spacing, inset:this.inset,
            collapseParent:true
        });
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setLocation: function(v) {this.location = v;},
    
    setSpacing: function(v) {
        if (this.spacing !== v) {
            this.spacing = v;
            if (this.layout) this.layout.setSpacing(v);
        }
    },
    
    setInset: function(v) {
        if (this.inset !== v) {
            this.inset = v;
            if (this.layout) this.layout.setInset(v);
        }
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    getFirstTab: function() {
        return this.__tabs[0];
    },
    
    /** Gets the currently selected tab.
        @returns myt.Tab or undefined if no tab is selected. */
    getSelectedTab: function() {
        return this.getSelected()[0];
    },
    
    /** @overrides myt.View */
    subnodeAdded: function(node) {
        this.callSuper(node);
        if (node.isA(myt.TabMixin)) {
            this.__tabs.push(node);
            
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
        if (node.isA(myt.TabMixin)) {
            const tabs = this.__tabs;
            let i = tabs.length;
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

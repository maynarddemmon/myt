/** A tab component.
    
    Events:
        None
    
    Attributes:
        tabId:string The unique ID of this tab relative to its tab container.
        tabContainer:myt.TabContainer The tab container that manages this tab.
        edgeColor:color
        edgeSize:number
        fillColorSelected:color
        fillColorHover:color
        fillColorActive:color
        fillColorReady:color
        labelTextColorSelected:color The color to use for the label text when
            this tab is selected.
        cornerRadius:number Passed into the drawing config to determine if
            a rounded corner is drawn or not. Defaults to undefined which
            causes myt.TabDrawingMethod.DEFAULT_RADIUS to be used.
*/
myt.Tab = new JS.Class('Tab', myt.DrawButton, {
    include: [myt.Selectable, myt.IconTextButtonContent],
    
    
    // Class Methods and Attributes ////////////////////////////////////////////
    extend: {
        DEFAULT_HEIGHT: 24,
        DEFAULT_INSET: 8,
        DEFAULT_OUTSET: 8,
        DEFAULT_FILL_COLOR_SELECTED: '#ffffff',
        DEFAULT_FILL_COLOR_HOVER: '#eeeeee',
        DEFAULT_FILL_COLOR_ACTIVE: '#aaaaaa',
        DEFAULT_FILL_COLOR_READY: '#cccccc',
        DEFAULT_LABEL_TEXT_COLOR_SELECTED:'#333333',
        DEFAULT_EDGE_COLOR: '#333333',
        DEFAULT_EDGE_SIZE: 0.5
    },
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides myt.DrawButton */
    initNode: function(parent, attrs) {
        var T = myt.Tab;
        
        // myt.DrawButton
        if (attrs.drawingMethodClassname === undefined) attrs.drawingMethodClassname = 'myt.TabDrawingMethod';
        
        // myt.IconTextButtonContent
        if (attrs.inset === undefined) attrs.inset = T.DEFAULT_INSET;
        if (attrs.outset === undefined) attrs.outset = T.DEFAULT_OUTSET;
        
        // myt.Tab
        if (attrs.tabId === undefined) attrs.tabId = myt.generateGuid();
        if (attrs.tabContainer === undefined) attrs.tabContainer = parent;
        if (attrs.edgeColor === undefined) attrs.edgeColor = T.DEFAULT_EDGE_COLOR;
        if (attrs.edgeSize === undefined) attrs.edgeSize = T.DEFAULT_EDGE_SIZE;
        if (attrs.fillColorSelected === undefined) attrs.fillColorSelected = T.DEFAULT_FILL_COLOR_SELECTED;
        if (attrs.fillColorHover === undefined) attrs.fillColorHover = T.DEFAULT_FILL_COLOR_HOVER;
        if (attrs.fillColorActive === undefined) attrs.fillColorActive = T.DEFAULT_FILL_COLOR_ACTIVE;
        if (attrs.fillColorReady === undefined) attrs.fillColorReady = T.DEFAULT_FILL_COLOR_READY;
        if (attrs.labelTextColorSelected === undefined) attrs.labelTextColorSelected = T.DEFAULT_LABEL_TEXT_COLOR_SELECTED;
        
        // Other
        if (attrs.height === undefined) attrs.height = T.DEFAULT_HEIGHT;
        if (attrs.focusEmbellishment === undefined) attrs.focusEmbellishment = false;
        
        // Selection must be done via the select method on the tabContainer
        if (attrs.selected) {
            var initiallySelected = true;
            delete attrs.selected;
        }
        
        this.callSuper(parent, attrs);
        
        if (initiallySelected) this.tabContainer.select(this);
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setTabId: function(v) {this.tabId = v;},
    setTabContainer: function(v) {this.tabContainer = v;},
    
    setEdgeColor: function(v) {this.edgeColor = v;},
    setEdgeSize: function(v) {this.edgeSize = v;},
    setFillColorSelected: function(v) {this.fillColorSelected = v;},
    setFillColorHover: function(v) {this.fillColorHover = v;},
    setFillColorActive: function(v) {this.fillColorActive = v;},
    setFillColorReady: function(v) {this.fillColorReady = v;},
    setLabelTextColorSelected: function(v) {this.labelTextColorSelected = v;},
    setCornerRadius: function(v) {this.cornerRadius = v;},
    
    setSelected: function(v) {
        this.callSuper(v);
        if (this.inited) this.redraw();
    },
    
    setFocused: function(v) {
        this.callSuper(v);
        if (this.inited) this.redraw();
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** @overrides myt.DrawButton */
    doActivated: function() {
        if (!this.selected) this.tabContainer.select(this);
    },
    
    /** @overrides myt.DrawButton */
    getDrawBounds: function() {
        var bounds = this.drawBounds;
        bounds.w = this.width;
        bounds.h = this.height;
        return bounds;
    },
    
    /** @overrides myt.DrawButton */
    getDrawConfig: function(state) {
        var config = this.callSuper(state);
        
        config.selected = this.selected;
        config.location = this.parent.location;
        config.cornerRadius = this.cornerRadius;
        config.edgeColor = this.edgeColor;
        config.edgeSize = this.edgeSize;
        
        if (this.selected) {
            config.fillColor = this.fillColorSelected;
        } else {
            switch (state) {
                case 'hover':
                    config.fillColor = this.fillColorHover;
                    break;
                case 'active':
                    config.fillColor = this.fillColorActive;
                    break;
                case 'disabled':
                case 'ready':
                    config.fillColor = this.focused ? this.fillColorHover : this.fillColorReady;
                    break;
                default:
            }
        }
        
        return config;
    },
    
    /** @overrides myt.DrawButton */
    redraw: function(state) {
        this.callSuper(state);
        this.textView.setTextColor(this.selected ? this.labelTextColorSelected : this.labelTextColor);
    }
});

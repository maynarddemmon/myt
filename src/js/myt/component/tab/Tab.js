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
    include: [myt.TabMixin, myt.IconTextButtonContent],
    
    
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
        if (attrs.drawingMethodClassname == null) attrs.drawingMethodClassname = 'myt.TabDrawingMethod';
        
        // myt.IconTextButtonContent
        if (attrs.inset == null) attrs.inset = T.DEFAULT_INSET;
        if (attrs.outset == null) attrs.outset = T.DEFAULT_OUTSET;
        
        // myt.Tab
        if (attrs.edgeColor == null) attrs.edgeColor = T.DEFAULT_EDGE_COLOR;
        if (attrs.edgeSize == null) attrs.edgeSize = T.DEFAULT_EDGE_SIZE;
        if (attrs.fillColorSelected == null) attrs.fillColorSelected = T.DEFAULT_FILL_COLOR_SELECTED;
        if (attrs.fillColorHover == null) attrs.fillColorHover = T.DEFAULT_FILL_COLOR_HOVER;
        if (attrs.fillColorActive == null) attrs.fillColorActive = T.DEFAULT_FILL_COLOR_ACTIVE;
        if (attrs.fillColorReady == null) attrs.fillColorReady = T.DEFAULT_FILL_COLOR_READY;
        if (attrs.labelTextColorSelected == null) attrs.labelTextColorSelected = T.DEFAULT_LABEL_TEXT_COLOR_SELECTED;
        
        // Other
        if (attrs.height == null) attrs.height = T.DEFAULT_HEIGHT;
        if (attrs.focusEmbellishment == null) attrs.focusEmbellishment = false;
        
        this.callSuper(parent, attrs);
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setEdgeColor: function(v) {this.edgeColor = v;},
    setEdgeSize: function(v) {this.edgeSize = v;},
    setFillColorSelected: function(v) {this.fillColorSelected = v;},
    setFillColorHover: function(v) {this.fillColorHover = v;},
    setFillColorActive: function(v) {this.fillColorActive = v;},
    setFillColorReady: function(v) {this.fillColorReady = v;},
    setLabelTextColor: function(v) {this.labelTextColor = v;},
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
    getDrawBounds: function() {
        var bounds = this.drawBounds;
        bounds.w = this.width;
        bounds.h = this.height;
        return bounds;
    },
    
    /** @overrides myt.DrawButton */
    getDrawConfig: function(state) {
        var self = this,
            config = self.callSuper(state);
        
        config.selected = self.selected;
        config.location = self.tabContainer.location;
        config.cornerRadius = self.cornerRadius;
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
                    config.fillColor = self.focused ? self.fillColorHover : self.fillColorReady;
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

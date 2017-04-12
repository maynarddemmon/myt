/** Provides styling functionality for a Checkbox and other similar components.
    
    Requires:
        Should be used on: myt.DrawButton or subclass thereof.
    
    Events:
        None
    
    Attributes:
        None
*/
myt.CheckboxStyleMixin = new JS.Module('CheckboxStyleMixin', {
    // Class Methods and Attributes ////////////////////////////////////////////
    extend: {
        /** The x location of the "icon". */
        DEFAULT_PAD_X:3,
        /** The y location of the "icon". */
        DEFAULT_PAD_Y:4,
        /** The width of the "icon". */
        DEFAULT_WIDTH:14,
        /** The height of the "icon" */
        DEFAULT_HEIGHT:14,
        DEFAULT_FILL_COLOR_CHECKED: '#666666',
        DEFAULT_FILL_COLOR_HOVER: '#eeeeee',
        DEFAULT_FILL_COLOR_ACTIVE: '#cccccc',
        DEFAULT_FILL_COLOR_READY: '#ffffff',
        DEFAULT_EDGE_COLOR: '#333333',
        DEFAULT_EDGE_SIZE: 0.5
    },
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    initNode: function(parent, attrs) {
        if (attrs.width == null) attrs.width = this.getIconExtentX();
        if (attrs.height == null) attrs.height = this.getIconExtentY();
        if (attrs.focusEmbellishment == null) attrs.focusEmbellishment = false;
        
        var CSM = myt.CheckboxStyleMixin;
        if (attrs.fillColorChecked == null) attrs.fillColorChecked = CSM.DEFAULT_FILL_COLOR_CHECKED;
        if (attrs.fillColorHover == null) attrs.fillColorHover = CSM.DEFAULT_FILL_COLOR_HOVER;
        if (attrs.fillColorActive == null) attrs.fillColorActive = CSM.DEFAULT_FILL_COLOR_ACTIVE;
        if (attrs.fillColorReady == null) attrs.fillColorReady = CSM.DEFAULT_FILL_COLOR_READY;
        if (attrs.edgeColor == null) attrs.edgeColor = CSM.DEFAULT_EDGE_COLOR;
        if (attrs.edgeSize == null) attrs.edgeSize = CSM.DEFAULT_EDGE_SIZE;
        
        this.callSuper(parent, attrs);
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setFillColorChecked: function(v) {this.fillColorChecked = v;},
    setFillColorHover: function(v) {this.fillColorHover = v;},
    setFillColorActive: function(v) {this.fillColorActive = v;},
    setFillColorReady: function(v) {this.fillColorReady = v;},
    setEdgeColor: function(v) {this.edgeColor = v;},
    setEdgeSize: function(v) {this.edgeSize = v;},
    
    /** @overrides myt.DrawButton */
    setFocused: function(v) {
        this.callSuper(v);
        
        if (this.inited) this.redraw();
    },
    
    /** @overrides myt.DrawButton */
    getDrawBounds: function() {
        var bounds = this.drawBounds,
            CSM = myt.CheckboxStyleMixin;
        bounds.x = CSM.DEFAULT_PAD_X;
        bounds.y = CSM.DEFAULT_PAD_Y;
        bounds.w = CSM.DEFAULT_WIDTH;
        bounds.h = CSM.DEFAULT_HEIGHT;
        return bounds;
    },
    
    /** @overrides myt.DrawButton */
    getDrawConfig: function(state) {
        var self = this,
            config = self.callSuper(state);
        config.checkedColor = self.fillColorChecked;
        config.edgeColor = self.edgeColor;
        config.edgeSize = self.edgeSize;
        
        switch (state) {
            case 'hover':
                config.fillColor = self.fillColorHover;
                break;
            case 'active':
                config.fillColor = self.fillColorActive;
                break;
            case 'disabled':
            case 'ready':
                config.fillColor = self.fillColorReady;
                break;
            default:
        }
        return config;
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** Gets the horizontal size of the "icon" plus the padding
        needed around it to display a shadow. */
    getIconExtentX: function() {
        var CSM = myt.CheckboxStyleMixin;
        return CSM.DEFAULT_WIDTH + 2 * CSM.DEFAULT_PAD_X;
    },
    
    /** Gets the vertical size of the "icon" plus the padding
        needed around it to display a shadow. */
    getIconExtentY: function() {
        var CSM = myt.CheckboxStyleMixin;
        return CSM.DEFAULT_HEIGHT + 2 * CSM.DEFAULT_PAD_Y;
    }
});

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
        if (attrs.width === undefined) attrs.width = this.getIconExtentX();
        if (attrs.height === undefined) attrs.height = this.getIconExtentY();
        if (attrs.focusEmbellishment === undefined) attrs.focusEmbellishment = false;
        
        var CSM = myt.CheckboxStyleMixin;
        if (attrs.fillColorChecked === undefined) attrs.fillColorChecked = CSM.DEFAULT_FILL_COLOR_CHECKED;
        if (attrs.fillColorHover === undefined) attrs.fillColorHover = CSM.DEFAULT_FILL_COLOR_HOVER;
        if (attrs.fillColorActive === undefined) attrs.fillColorActive = CSM.DEFAULT_FILL_COLOR_ACTIVE;
        if (attrs.fillColorReady === undefined) attrs.fillColorReady = CSM.DEFAULT_FILL_COLOR_READY;
        if (attrs.edgeColor === undefined) attrs.edgeColor = CSM.DEFAULT_EDGE_COLOR;
        if (attrs.edgeSize === undefined) attrs.edgeSize = CSM.DEFAULT_EDGE_SIZE;
        
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
        var bounds = this.drawBounds, CSM = myt.CheckboxStyleMixin;
        bounds.x = CSM.DEFAULT_PAD_X;
        bounds.y = CSM.DEFAULT_PAD_Y;
        bounds.w = CSM.DEFAULT_WIDTH;
        bounds.h = CSM.DEFAULT_HEIGHT;
        return bounds;
    },
    
    /** @overrides myt.DrawButton */
    getDrawConfig: function(state) {
        var config = this.callSuper(state);
        config.checkedColor = this.fillColorChecked;
        config.edgeColor = this.edgeColor;
        config.edgeSize = this.edgeSize;
        
        switch (state) {
            case 'hover':
                config.fillColor = this.fillColorHover;
                break;
            case 'active':
                config.fillColor = this.fillColorActive;
                break;
            case 'disabled':
            case 'ready':
                config.fillColor = this.fillColorReady;
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

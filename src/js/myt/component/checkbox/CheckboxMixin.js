/** Mix onto a view to make it behave as a checkbox button. Should be used
    on an myt.DrawButton or subclass thereof.
    
    Attributes:
        checked:boolean Indicates if this component is in the "checked" state
            or not.
*/
myt.CheckboxMixin = new JS.Module('CheckboxMixin', {
    include: [myt.ValueComponent],
    
    
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
        if (attrs.checked === undefined) attrs.checked = false;
        if (attrs.value === undefined) attrs.value = true;
        if (attrs.drawingMethodClassname === undefined) attrs.drawingMethodClassname = 'myt.CheckboxDrawingMethod';
        if (attrs.focusEmbellishment === undefined) attrs.focusEmbellishment = false;
        
        var CBM = myt.CheckboxMixin;
        if (attrs.fillColorChecked === undefined) attrs.fillColorChecked = CBM.DEFAULT_FILL_COLOR_CHECKED;
        if (attrs.fillColorHover === undefined) attrs.fillColorHover = CBM.DEFAULT_FILL_COLOR_HOVER;
        if (attrs.fillColorActive === undefined) attrs.fillColorActive = CBM.DEFAULT_FILL_COLOR_ACTIVE;
        if (attrs.fillColorReady === undefined) attrs.fillColorReady = CBM.DEFAULT_FILL_COLOR_READY;
        if (attrs.edgeColor === undefined) attrs.edgeColor = CBM.DEFAULT_EDGE_COLOR;
        if (attrs.edgeSize === undefined) attrs.edgeSize = CBM.DEFAULT_EDGE_SIZE;
        
        this.callSuper(parent, attrs);
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setFillColorChecked: function(v) {this.fillColorChecked = v;},
    setFillColorHover: function(v) {this.fillColorHover = v;},
    setFillColorActive: function(v) {this.fillColorActive = v;},
    setFillColorReady: function(v) {this.fillColorReady = v;},
    setEdgeColor: function(v) {this.edgeColor = v;},
    setEdgeSize: function(v) {this.edgeSize = v;},
    
    setFocused: function(v) {
        this.callSuper(v);
        
        if (this.inited) this.redraw();
    },
    
    setChecked: function(v) {
        if (this.checked === v) return;
        this.checked = v;
        if (this.inited) {
            this.fireNewEvent('checked', v);
            this.redraw();
        }
    },
    
    /** @overrides myt.DrawButton */
    getDrawBounds: function() {
        var bounds = this.drawBounds;
        var CBM = myt.CheckboxMixin;
        bounds.x = CBM.DEFAULT_PAD_X;
        bounds.y = CBM.DEFAULT_PAD_Y;
        bounds.w = CBM.DEFAULT_WIDTH;
        bounds.h = CBM.DEFAULT_HEIGHT;
        return bounds;
    },
    
    /** @overrides myt.DrawButton */
    getDrawConfig: function(state) {
        var config = this.callSuper(state);
        config.checked = this.checked;
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
    
    /** @overrides myt.ValueComponent */
    getValue: function() {
        return this.checked ? this.value : null;
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** Gets the horizontal size of the "icon" plus the padding
        needed around it to display a shadow. */
    getIconExtentX: function() {
        var CBM = myt.CheckboxMixin;
        return CBM.DEFAULT_WIDTH + 2 * CBM.DEFAULT_PAD_X;
    },
    
    /** Gets the vertical size of the "icon" plus the padding
        needed around it to display a shadow. */
    getIconExtentY: function() {
        var CBM = myt.CheckboxMixin;
        return CBM.DEFAULT_HEIGHT + 2 * CBM.DEFAULT_PAD_Y;
    },
    
    /** Toggle the checked attribute when activated. */
    doActivated: function() {
        this.setChecked(!this.checked);
    }
});

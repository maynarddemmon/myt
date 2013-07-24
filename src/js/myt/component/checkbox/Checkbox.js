/** A checkbox component. */
myt.Checkbox = new JS.Class('Checkbox', myt.DrawButton, {
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
        DEFAULT_BORDER_COLOR: '#333333',
        DEFAULT_BORDER_SIZE: 0.5
    },
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    initNode: function(parent, attrs) {
        if (attrs.width === undefined) attrs.width = this.getIconExtentX();
        if (attrs.height === undefined) attrs.height = this.getIconExtentY();
        if (attrs.checked === undefined) attrs.checked = false;
        if (attrs.value === undefined) attrs.value = true;
        if (attrs.drawingMethodClassname === undefined) attrs.drawingMethodClassname = 'myt.CheckboxDrawingMethod';
        if (attrs.focusEmbellishment === undefined) attrs.focusEmbellishment = false;
        
        var CB = myt.Checkbox;
        if (attrs.fillColorChecked === undefined) attrs.fillColorChecked = CB.DEFAULT_FILL_COLOR_CHECKED;
        if (attrs.fillColorHover === undefined) attrs.fillColorHover = CB.DEFAULT_FILL_COLOR_HOVER;
        if (attrs.fillColorActive === undefined) attrs.fillColorActive = CB.DEFAULT_FILL_COLOR_ACTIVE;
        if (attrs.fillColorReady === undefined) attrs.fillColorReady = CB.DEFAULT_FILL_COLOR_READY;
        if (attrs.borderColor === undefined) attrs.borderColor = CB.DEFAULT_BORDER_COLOR;
        if (attrs.borderSize === undefined) attrs.borderSize = CB.DEFAULT_BORDER_SIZE;
        
        this.callSuper(parent, attrs);
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setFillColorChecked: function(v) {this.fillColorChecked = v;},
    setFillColorHover: function(v) {this.fillColorHover = v;},
    setFillColorActive: function(v) {this.fillColorActive = v;},
    setFillColorReady: function(v) {this.fillColorReady = v;},
    setBorderColor: function(v) {this.borderColor = v;},
    setBorderSize: function(v) {this.borderSize = v;},
    
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
        var CB = myt.Checkbox;
        bounds.x = CB.DEFAULT_PAD_X;
        bounds.y = CB.DEFAULT_PAD_Y;
        bounds.w = CB.DEFAULT_WIDTH;
        bounds.h = CB.DEFAULT_HEIGHT;
        return bounds;
    },
    
    /** @overrides myt.DrawButton */
    getDrawConfig: function(state) {
        var config = this.callSuper(state);
        config.checked = this.checked;
        config.checkedColor = this.fillColorChecked;
        config.borderColor = this.borderColor;
        config.borderSize = this.borderSize;
        
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
    
    setValue: function(v) {
        if (this.value === v) return;
        this.value = v;
        if (this.inited) this.fireNewEvent('value', this.getValue());
    },
    
    getValue: function() {
        return this.checked ? this.value : null;
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** Gets the horizontal size of the "icon" plus the padding
        needed around it to display a shadow. */
    getIconExtentX: function() {
        var CB = myt.Checkbox;
        return CB.DEFAULT_WIDTH + 2 * CB.DEFAULT_PAD_X;
    },
    
    /** Gets the vertical size of the "icon" plus the padding
        needed around it to display a shadow. */
    getIconExtentY: function() {
        var CB = myt.Checkbox;
        return CB.DEFAULT_HEIGHT + 2 * CB.DEFAULT_PAD_Y;
    },
    
    /** Toggle the checked attribute when activated. */
    doActivated: function() {
        this.setChecked(!this.checked);
    }
});

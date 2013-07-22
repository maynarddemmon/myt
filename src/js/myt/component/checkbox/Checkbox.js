/** A checkbox component. */
myt.Checkbox = new JS.Class('Checkbox', myt.DrawButton, {
    // Class Methods and Attributes ////////////////////////////////////////////
    extend: {
        /** The x location of the checkbox "icon". */
        DEFAULT_PAD_X:3,
        /** The y location of the checkbox "icon". */
        DEFAULT_PAD_Y:4,
        /** The width of the checkbox "icon". */
        DEFAULT_WIDTH:14,
        /** The height of the checkbox "icon" */
        DEFAULT_HEIGHT:14
    },
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    initNode: function(parent, attrs) {
        if (attrs.width === undefined) attrs.width = this.getCheckboxExtentX();
        if (attrs.height === undefined) attrs.height = this.getCheckboxExtentY();
        if (attrs.checked === undefined) attrs.checked = false;
        if (attrs.value === undefined) attrs.value = true;
        if (attrs.drawingMethodClassname === undefined) attrs.drawingMethodClassname = 'myt.CheckboxDrawingMethod';
        if (attrs.focusEmbellishment === undefined) attrs.focusEmbellishment = false;
        
        this.callSuper(parent, attrs);
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
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
        
        switch (state) {
            case 'hover':
                config.fillColor = '#eeeeee';
                break;
            case 'active':
                config.fillColor = '#dddddd';
                break;
            case 'disabled':
            case 'ready':
                config.fillColor = '#ffffff';
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
    /** Gets the horizontal size of the checkbox "icon" plus the padding
        needed around it to display a shadow. */
    getCheckboxExtentX: function() {
        var CB = myt.Checkbox;
        return CB.DEFAULT_WIDTH + 2 * CB.DEFAULT_PAD_X;
    },
    
    /** Gets the vertical size of the checkbox "icon" plus the padding
        needed around it to display a shadow. */
    getCheckboxExtentY: function() {
        var CB = myt.Checkbox;
        return CB.DEFAULT_HEIGHT + 2 * CB.DEFAULT_PAD_Y;
    },
    
    /** Toggle the checkbox when activated. */
    doActivated: function() {
        this.setChecked(!this.checked);
    }
});

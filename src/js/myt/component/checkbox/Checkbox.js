/** A checkbox component. */
myt.Checkbox = new JS.Class('Checkbox', myt.DrawButton, {
    // Class Methods and Attributes ////////////////////////////////////////////
    extend: {
        DEFAULT_PAD_X:3,
        DEFAULT_PAD_Y:4,
        DEFAULT_WIDTH:14,
        DEFAULT_HEIGHT:14
    },
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    initNode: function(parent, attrs) {
        var CB = myt.Checkbox;
        if (attrs.width === undefined) {
            attrs.width = CB.DEFAULT_WIDTH + 2 * CB.DEFAULT_PAD_X;
        }
        if (attrs.height === undefined) {
            attrs.height = CB.DEFAULT_HEIGHT + 2 * CB.DEFAULT_PAD_Y;
        }
        if (attrs.checked === undefined) attrs.checked = false;
        if (attrs.value === undefined) attrs.value = true;
        if (attrs.drawingMethodClassname === undefined) attrs.drawingMethodClassname = 'myt.CheckboxDrawingMethod';
        
        if (attrs.focusEmbellishment === undefined) attrs.focusEmbellishment = false;
        
        this.callSuper(parent, attrs);
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setFocused: function(v) {
        this.callSuper(v);
        
        this.redraw();
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
        config.borderSize = 0.5;
        config.checkmarkColor = '#666666';
        config.borderColor = '#333333';
        config.shadowColor = 'rgba(0, 0, 0, 0.3)';
        config.focusedShadowColor = 'rgba(0, 0, 0, 0.5)';
        config.shadowOffsetX = 0;
        config.shadowOffsetY = 1;
        config.shadowBlur = 2;
        config.radius = 4;
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
    doActivated: function() {
        this.setChecked(!this.checked);
    }
});

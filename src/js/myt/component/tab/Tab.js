/** A tab component.
    
    Attributes:
        cornerRadius:number Passed into the drawing config to determine if
            a rounded corner is drawn or not.
        labelTextColorChecked:color The color to use for the label text when
            this tab is "checked".
*/
myt.Tab = new JS.Class('Tab', myt.DrawButton, {
    include: [myt.SizeToParent, myt.RadioMixin, myt.IconTextButtonContent],
    
    
    // Class Methods and Attributes ////////////////////////////////////////////
    extend: {
        DEFAULT_HEIGHT:24,
        DEFAULT_INSET:8,
        DEFAULT_OUTSET:8,
        DEFAULT_FILL_COLOR_CHECKED: '#ffffff',
        DEFAULT_FILL_COLOR_READY: '#cccccc',
        DEFAULT_LABEL_TEXT_COLOR_CHECKED:'#333333'
    },
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides myt.Checkbox */
    initNode: function(parent, attrs) {
        var T = myt.Tab;
        if (attrs.inset === undefined) attrs.inset = T.DEFAULT_INSET;
        if (attrs.outset === undefined) attrs.outset = T.DEFAULT_OUTSET;
        if (attrs.fillColorChecked === undefined) attrs.fillColorChecked = T.DEFAULT_FILL_COLOR_CHECKED;
        if (attrs.fillColorReady === undefined) attrs.fillColorReady = T.DEFAULT_FILL_COLOR_READY;
        if (attrs.labelTextColorChecked === undefined) attrs.labelTextColorChecked = T.DEFAULT_LABEL_TEXT_COLOR_CHECKED;
        if (attrs.drawingMethodClassname === undefined) attrs.drawingMethodClassname = 'myt.TabDrawingMethod';
        
        if (attrs.groupId === undefined) attrs.groupId = parent.groupId;
        
        this.callSuper(parent, attrs);
        
        this.syncTo(this, 'setSelected', 'checked');
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setLabelTextColorChecked: function(v) {this.labelTextColorChecked = v;},
    setCornerRadius: function(v) {this.cornerRadius = v;},
    
    setSelected: function(v) {
        // Adapt to event from syncTo
        if (v !== null && typeof v === 'object') v = v.value;
        
        if (this.selected !== v) {
            this.selected = v;
            if (this.inited) this.fireNewEvent('selected', v);
            
            // Sync the other direction if necessary.
            if (this.checked !== v) this.setChecked(v);
        }
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** @overrides myt.CheckboxMixin */
    getDrawBounds: function() {
        var bounds = this.drawBounds;
        bounds.w = this.width;
        bounds.h = this.height;
        return bounds;
    },
    
    /** @overrides myt.CheckboxMixin */
    getDrawConfig: function(state) {
        var config = this.callSuper(state);
        config.location = this.parent.location;
        config.cornerRadius = this.cornerRadius;
        if (this.focused && state !== 'active') config.fillColor = this.fillColorHover;
        if (this.checked) config.fillColor = this.fillColorChecked;
        return config;
    },
    
    /** @overrides myt.DrawButton */
    redraw: function(state) {
        this.callSuper(state);
        this.textView.setTextColor(this.determineTextColor(this.checked));
    },
    
    determineTextColor: function(checked) {
        return checked ? this.labelTextColorChecked : this.labelTextColor;
    },
    
    /** @overrides myt.CheckboxMixin */
    getIconExtentX: function() {
        return 0;
    },
    
    /** @overrides myt.CheckboxMixin */
    getIconExtentY: function() {
        return myt.Tab.DEFAULT_HEIGHT;
    }
});

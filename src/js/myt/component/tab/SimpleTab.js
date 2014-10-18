/** A simple tab component.
    
    Events:
        None
    
    Attributes:
        tabId:string The unique ID of this tab relative to its tab container.
        tabContainer:myt.TabContainer The tab container that manages this tab.
        edgeColor:color
        edgeSize:number
        selectedColor:color
        
        labelTextColorSelected:color The color to use for the label text when
            this tab is selected.
        cornerRadius:number Passed into the drawing config to determine if
            a rounded corner is drawn or not. Defaults to undefined which
            causes myt.TabDrawingMethod.DEFAULT_RADIUS to be used.
*/
myt.SimpleTab = new JS.Class('SimpleTab', myt.SimpleIconTextButton, {
    include: [myt.TabMixin],
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides myt.DrawButton */
    initNode: function(parent, attrs) {
        var T = myt.Tab;
        
        // myt.IconTextButtonContent
        if (attrs.inset === undefined) attrs.inset = T.DEFAULT_INSET;
        if (attrs.outset === undefined) attrs.outset = T.DEFAULT_OUTSET;
        
        // myt.Tab
        if (attrs.selectedColor === undefined) attrs.selectedColor = T.DEFAULT_FILL_COLOR_SELECTED;
        if (attrs.hoverColor === undefined) attrs.hoverColor = T.DEFAULT_FILL_COLOR_HOVER;
        if (attrs.activeColor === undefined) attrs.activeColor = T.DEFAULT_FILL_COLOR_ACTIVE;
        if (attrs.readyColor === undefined) attrs.readyColor = T.DEFAULT_FILL_COLOR_READY;
        if (attrs.labelTextSelectedColor === undefined) attrs.labelTextSelectedColor = T.DEFAULT_LABEL_TEXT_COLOR_SELECTED;
        
        // Other
        if (attrs.height === undefined) attrs.height = T.DEFAULT_HEIGHT;
        if (attrs.focusEmbellishment === undefined) attrs.focusEmbellishment = false;
        
        this.callSuper(parent, attrs);
        
        this.__updateCornerRadius();
        this.__updateTextColor();
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setSelectedColor: function(v) {this.selectedColor = v;},
    
    setCornerRadius: function(v) {
        this.cornerRadius = v;
        
        if (this.inited) this.__updateCornerRadius();
    },
    
    setLabelTextColor: function(v) {this.labelTextColor = v;},
    
    setLabelTextSelectedColor: function(v) {
        this.labelTextSelectedColor = v;
        if (this.inited && this.selected) this.textView.setTextColor(v);
    },
    
    setSelected: function(v) {
        this.callSuper(v);
        if (this.inited) {
            this.updateUI();
            this.__updateTextColor();
        }
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** @private */
    __updateTextColor: function() {
        this.textView.setTextColor(this.selected ? this.labelTextSelectedColor : this.labelTextColor);
    },
    
    /** @private */
    __updateCornerRadius: function() {
        var r = this.cornerRadius != null ? this.cornerRadius : myt.TabDrawingMethod.DEFAULT_RADIUS;
        switch (this.tabContainer.location) {
            case 'top':
                this.setRoundedTopLeftCorner(r);
                this.setRoundedTopRightCorner(r);
                break;
            case 'bottom':
                this.setRoundedBottomLeftCorner(r);
                this.setRoundedBottomRightCorner(r);
                break;
            case 'left':
                this.setRoundedTopLeftCorner(r);
                this.setRoundedBottomLeftCorner(r);
                break;
            case 'right':
                this.setRoundedTopRightCorner(r);
                this.setRoundedBottomRightCorner(r);
                break;
        }
    },
    
    /** @overrides myt.SimpleButton */
    drawDisabledState: function() {
        this.callSuper();
        if (this.selected) this.setBgColor(this.selectedColor);
    },
    
    /** @overrides myt.SimpleButton */
    drawHoverState: function() {
        this.callSuper();
        if (this.selected) this.setBgColor(this.selectedColor);
    },
    
    /** @overrides myt.SimpleButton */
    drawActiveState: function() {
        this.callSuper();
        if (this.selected) this.setBgColor(this.selectedColor);
    },
    
    /** @overrides myt.SimpleButton */
    drawReadyState: function() {
        this.callSuper();
        if (this.selected) this.setBgColor(this.selectedColor);
    }
});

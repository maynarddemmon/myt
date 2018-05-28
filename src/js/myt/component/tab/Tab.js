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
            causes myt.Tab.DEFAULT_RADIUS to be used.
*/
myt.Tab = new JS.Class('Tab', myt.SimpleIconTextButton, {
    include: [myt.TabMixin],
    
    
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
        DEFAULT_RADIUS:6
    },
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    initNode: function(parent, attrs) {
        var T = myt.Tab;
        
        // myt.IconTextButtonContent
        if (attrs.inset == null) attrs.inset = T.DEFAULT_INSET;
        if (attrs.outset == null) attrs.outset = T.DEFAULT_OUTSET;
        
        // myt.Tab
        if (attrs.selectedColor == null) attrs.selectedColor = T.DEFAULT_FILL_COLOR_SELECTED;
        if (attrs.hoverColor == null) attrs.hoverColor = T.DEFAULT_FILL_COLOR_HOVER;
        if (attrs.activeColor == null) attrs.activeColor = T.DEFAULT_FILL_COLOR_ACTIVE;
        if (attrs.readyColor == null) attrs.readyColor = T.DEFAULT_FILL_COLOR_READY;
        if (attrs.labelTextSelectedColor == null) attrs.labelTextSelectedColor = T.DEFAULT_LABEL_TEXT_COLOR_SELECTED;
        
        // Other
        if (attrs.height == null) attrs.height = T.DEFAULT_HEIGHT;
        if (attrs.focusEmbellishment == null) attrs.focusEmbellishment = false;
        
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
        var self = this,
            r = self.cornerRadius != null ? self.cornerRadius : myt.Tab.DEFAULT_RADIUS;
        switch (self.tabContainer.location) {
            case 'top':
                self.setRoundedTopLeftCorner(r);
                self.setRoundedTopRightCorner(r);
                break;
            case 'bottom':
                self.setRoundedBottomLeftCorner(r);
                self.setRoundedBottomRightCorner(r);
                break;
            case 'left':
                self.setRoundedTopLeftCorner(r);
                self.setRoundedBottomLeftCorner(r);
                break;
            case 'right':
                self.setRoundedTopRightCorner(r);
                self.setRoundedBottomRightCorner(r);
                break;
        }
    },
    
    /** @overrides myt.Button. */
    updateUI: function() {
        this.callSuper();
        if (this.selected) this.setBgColor(this.selectedColor);
    }
});

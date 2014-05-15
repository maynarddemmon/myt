/** An item in an myt.ListView
    
    Events:
        None
    
    Attributes:
        None
*/
myt.ListViewItem = new JS.Class('ListViewItem', myt.SimpleIconTextButton, {
    include: [myt.ListViewItemMixin],
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    initNode: function(parent, attrs) {
        if (attrs.height === undefined) attrs.height = 24;
        
        if (attrs.activeColor === undefined) attrs.activeColor = '#bbbbbb';
        if (attrs.hoverColor === undefined) attrs.hoverColor = '#ffffff';
        if (attrs.readyColor === undefined) attrs.readyColor = '#eeeeee';
        
        if (attrs.contentAlign === undefined) attrs.contentAlign = 'left';
        if (attrs.inset === undefined) attrs.inset = 8;
        if (attrs.outset === undefined) attrs.outset = 8;
        
        if (attrs.activationKeys === undefined) {
            attrs.activationKeys = [13,27,32,37,38,39,40];
        }
        
        this.callSuper(parent, attrs);
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    /** @overrides myt.FocusObservable */
    setFocused: function(v) {
        this.callSuper(v);
        
        if (this.inited) this.updateUI();
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** @overrides myt.ListViewItemMixin */
    getMinimumWidth: function() {
        var iconView = this.iconView,
            textView = this.textView,
            textViewVisible = textView.visible && this.text,
            iconWidth = iconView.visible ? iconView.width : 0,
            iconExtent = iconWidth + (textViewVisible && iconWidth > 0 ? this.iconSpacing : 0),
            textWidth = textViewVisible ? Math.ceil(textView.width) : 0;
        return this.inset + iconExtent + textWidth + this.outset;
    },
    
    /** @overrides myt.Button */
    doActivated: function() {
        this.listView.doItemActivated(this);
    },
    
    /** @overrides myt.SimpleButton */
    drawReadyState: function() {
        this.setOpacity(1);
        this.setBgColor(this.focused ? this.hoverColor : this.readyColor);
    },
    
    /** @overrides myt.Button */
    showFocusEmbellishment: function() {this.hideDefaultFocusEmbellishment();},
    
    /** @overrides myt.Button */
    hideFocusEmbellishment: function() {this.hideDefaultFocusEmbellishment();},
    
    /** @overrides myt.KeyActivation. */
    doActivationKeyDown: function(key, isRepeat) {
        switch (key) {
            case 27: // Escape
                this.listView.owner.hideFloatingPanel();
                return;
            case 37: // Left
            case 38: // Up
                myt.global.focus.prev();
                break;
            case 39: // Right
            case 40: // Down
                myt.global.focus.next();
                break;
        }
        
        this.callSuper(key, isRepeat);
    }
});

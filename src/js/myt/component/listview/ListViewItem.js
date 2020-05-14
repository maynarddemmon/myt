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
        if (attrs.height == null) attrs.height = 24;
        
        if (attrs.activeColor == null) attrs.activeColor = '#bbbbbb';
        if (attrs.hoverColor == null) attrs.hoverColor = '#ffffff';
        if (attrs.readyColor == null) attrs.readyColor = '#eeeeee';
        
        if (attrs.contentAlign == null) attrs.contentAlign = 'left';
        if (attrs.inset == null) attrs.inset = 8;
        if (attrs.outset == null) attrs.outset = 8;
        
        if (attrs.activationKeys == null) attrs.activationKeys = [13,27,32,37,38,39,40];
        
        this.callSuper(parent, attrs);
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** @overrides myt.ListViewItemMixin */
    syncToDom: function() {
        this.textView.sizeViewToDom();
    },
    
    /** @overrides myt.ListViewItemMixin */
    getMinimumWidth: function() {
        const self = this,
            iconView = self.iconView,
            textView = self.textView,
            textViewVisible = textView.visible && self.text,
            iconWidth = iconView.visible ? iconView.width : 0,
            iconExtent = iconWidth + (textViewVisible && iconWidth > 0 ? self.iconSpacing : 0),
            textWidth = textViewVisible ? Math.ceil(textView.width) : 0;
        return self.inset + iconExtent + textWidth + self.outset;
    },
    
    /** @overrides myt.Button */
    doActivated: function() {
        this.listView.doItemActivated(this);
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

/** A text input with select list.
    
    Events:
        None
    
    Attributes:
        filterItems:boolean Indicates if the list items should be filtered
            down based on the current value. Defaults to true.
        fullItemConfig:array The full list of items that can be shown in the
            list. The actual itemConfig used will be filtered based on the
            current value of the input text.
*/
myt.ComboBox = new JS.Class('ComboBox', myt.InputText, {
    include: [
        myt.Activateable,
        myt.KeyActivation,
        myt.ListViewAnchor
    ],
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides myt.Input */
    initNode: function(parent, attrs) {
        this.filterItems = true;
        
        if (attrs.activationKeys === undefined) attrs.activationKeys = [13,27,38,40];
        if (attrs.bgColor === undefined) attrs.bgColor = '#ffffff';
        if (attrs.borderWidth === undefined) attrs.borderWidth = 1;
        if (attrs.borderStyle === undefined) attrs.borderStyle = 'solid';
        if (attrs.floatingAlignOffset === undefined) attrs.floatingAlignOffset = attrs.borderWidth;
        if (attrs.listViewAttrs === undefined) attrs.listViewAttrs = {maxHeight:99};
        if (attrs.fullItemConfig === undefined) attrs.fullItemConfig = [];
        
        this.callSuper(parent, attrs);
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setFullItemConfig: function(v) {this.fullItemConfig = v;},
    setFilterItems: function(v) {this.filterItems = v;},
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** Show floating panel if the value has changed during during
        user interaction.
        @overrides */
    __syncToDom: function(event) {
        var existing = this.value;
        this.callSuper(event);
        if (existing !== this.value) this.showFloatingPanel();
    },
    
    /** @overrides */
    showFloatingPanel: function(panelId) {
        var fp = this.getFloatingPanel(panelId);
        if (fp) {
            // Filter config
            var itemConfig;
            if (this.filterItems) {
                itemConfig = [];
                
                var curValue = this.value,
                    normalizedCurValue = curValue == null ? '' : ('' + curValue).toLowerCase(),
                    fullItemConfig = this.fullItemConfig,
                    len = fullItemConfig.length, i = 0, 
                    item, normalizedItemValue, idx;
                for (; len > i;) {
                    item = fullItemConfig[i++];
                    normalizedItemValue = item.attrs.text.toLowerCase();
                    idx = normalizedItemValue.indexOf(normalizedCurValue);
                    if (idx === 0) {
                        if (normalizedItemValue !== normalizedCurValue) itemConfig.push(item);
                    } else if (idx > 0) {
                        itemConfig.push(item);
                    }
                }
            } else {
                itemConfig = this.fullItemConfig;
            }
            
            if (itemConfig.length > 0) {
                fp.setMinWidth(this.width - 2 * this.borderWidth); // Must be set before setItemConfig
                this.setItemConfig(itemConfig);
                this.callSuper(panelId);
            } else {
                this.hideFloatingPanel(panelId);
            }
        }
    },
    
    /** @overrides */
    doItemActivated: function(itemView) {
        this.setValue(itemView.text);
        this.callSuper(itemView);
    },
    
    /** @overrides */
    doActivated: function() {
        this.toggleFloatingPanel();
    }
});

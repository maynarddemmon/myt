/** A simple implementation of a grid column header.
    
    Attributes:
        sortIconColor:color the color to fill the sort icon with if shown.
            Defaults to '#666666'.
*/
myt.SimpleGridColumnHeader = new JS.Class('SimpleGridColumnHeader', myt.SimpleIconTextButton, {
    include: [myt.GridColumnHeader],
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides myt.View */
    initNode: function(parent, attrs) {
        if (attrs.activeColor === undefined) attrs.activeColor = '#999999';
        if (attrs.hoverColor === undefined) attrs.hoverColor = '#bbbbbb';
        if (attrs.readyColor === undefined) attrs.readyColor = '#aaaaaa';
        if (attrs.inset === undefined) attrs.inset = 2;
        if (attrs.outset === undefined) attrs.outset = 2;
        
        if (attrs.height === undefined) attrs.height = 18;
        
        if (attrs.contentAlign === undefined) attrs.contentAlign = 'left';
        if (attrs.sortIconColor === undefined) attrs.sortIconColor = '#666666';
        
        this.callSuper(parent, attrs);
        
        this.setDisabled(!this.sortable);
        this._updateTextWidth();
        this._updateSortIcon();
    },
    
    /** @overrides myt.View */
    doAfterAdoption: function() {
        new myt.FontAwesome(this, {
            name:'sortIcon', align:'right', alignOffset:3, valign:'middle',
            textColor:this.sortIconColor
        }, [{
            initNode: function(parent, attrs) {
                this.callSuper(parent, attrs);
                this.deStyle.fontSize = '0.7em'; // Looks better a bit smaller.
            },
            
            sizeViewToDom:function() {
                this.callSuper();
                
                var p = this.parent;
                p.setOutset(this.width + 2);
                p._updateTextWidth();
            }
        }]);
        
        this.callSuper();
        
        this.textView.enableEllipsis();
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setSortIconColor: function(v) {
        this.sortIconColor = v;
        if (this.sortIcon) this.sortIcon.setTextColor(v);
    },
    
    /** @overrides myt.GridColumnHeader */
    setSortable: function(v) {
        this.callSuper(v);
        
        if (this.inited) {
            if (v) this.setOutset(14);
            this.setDisabled(!v);
            this._updateSortIcon();
        }
    },
    
    /** @overrides myt.GridColumnHeader */
    setSortState: function(v) {
        this.callSuper(v);
        
        if (this.inited) this._updateSortIcon();
    },
    
    /** @overrides myt.View */
    setWidth: function(v, supressEvent) {
        this.callSuper(v, supressEvent);
        
        if (this.inited) this._updateTextWidth();
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** @private */
    _updateSortIcon: function() {
        var glyph = '';
        if (this.sortable) {
            switch (this.sortState) {
                case 'ascending':
                    glyph = 'chevron-up';
                    break;
                case 'descending':
                    glyph = 'chevron-down';
                    break;
            }
        }
        this.sortIcon.setIcon(glyph);
    },
    
    /** @private */
    _updateTextWidth: function() {
        if (this.contentAlign === 'left') {
            var tv = this.textView;
            if (tv) tv.setWidth(this.width - this.outset - tv.x);
        }
    },
    
    doActivated: function() {
        if (!this.disabled) {
            switch (this.sortState) {
                case 'ascending': this.setSortState('descending'); break;
                case 'descending': this.setSortState('ascending'); break;
                case 'none': this.setSortState('ascending'); break;
            }
            this.gridController.setSort([this.columnId, this.sortState]);
        }
    },
    
    /** @overrides myt.SimpleButton */
    drawDisabledState: function() {
        this.setBgColor(this.readyColor);
    },
    
    /** @overrides myt.Button */
    showFocusEmbellishment: function() {this.hideDefaultFocusEmbellishment();},
    
    /** @overrides myt.Button */
    hideFocusEmbellishment: function() {this.hideDefaultFocusEmbellishment();}
});

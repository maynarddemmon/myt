((pkg) => {
    const updateSortIcon = (gridHeader) => {
            let glyph = '';
            if (gridHeader.sortable) {
                switch (gridHeader.sortState) {
                    case 'ascending':
                        glyph = 'chevron-up';
                        break;
                    case 'descending':
                        glyph = 'chevron-down';
                        break;
                }
            }
            gridHeader.sortIcon.setIcon(glyph);
        },
        
        updateTextWidth = (gridHeader) => {
            if (gridHeader.contentAlign === 'left') {
                const tv = gridHeader.textView;
                if (tv) tv.setWidth(gridHeader.width - gridHeader.outset - tv.x);
            }
        };
    
    /** A simple implementation of a grid column header.
        
        Attributes:
            sortIconColor:color the color to fill the sort icon with if shown.
                Defaults to '#666666'.
        
        @class */
    pkg.SimpleGridColumnHeader = new JS.Class('SimpleGridColumnHeader', pkg.SimpleIconTextButton, {
        include: [pkg.GridColumnHeader],
        
        
        // Life Cycle //////////////////////////////////////////////////////////
        /** @overrides myt.View */
        initNode: function(parent, attrs) {
            const self = this;
            
            if (attrs.activeColor == null) attrs.activeColor = '#999999';
            if (attrs.hoverColor == null) attrs.hoverColor = '#bbbbbb';
            if (attrs.readyColor == null) attrs.readyColor = '#aaaaaa';
            if (attrs.inset == null) attrs.inset = 2;
            if (attrs.outset == null) attrs.outset = 2;
            
            if (attrs.height == null) attrs.height = 18;
            
            if (attrs.contentAlign == null) attrs.contentAlign = 'left';
            if (attrs.sortIconColor == null) attrs.sortIconColor = '#666666';
            
            self.callSuper(parent, attrs);
            
            new pkg.FontAwesome(self, {
                name:'sortIcon', align:'right', alignOffset:3, valign:'middle',
                textColor:self.sortIconColor
            }, [{
                initNode: function(parent, attrs) {
                    this.callSuper(parent, attrs);
                    this.getInnerDomStyle().fontSize = '0.7em'; // Looks better a bit smaller.
                },
                sizeViewToDom:function() {
                    this.callSuper();
                    
                    self.setOutset(this.width + 2);
                    updateTextWidth(self);
                }
            }]);
            
            self.textView.enableEllipsis();
            
            self.setDisabled(!self.sortable);
            updateTextWidth(self);
            updateSortIcon(self);
        },
        
        
        // Accessors ///////////////////////////////////////////////////////////
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
                updateSortIcon(this);
            }
        },
        
        /** @overrides myt.GridColumnHeader */
        setSortState: function(v) {
            this.callSuper(v);
            
            if (this.inited) updateSortIcon(this);
        },
        
        /** @overrides myt.View */
        setWidth: function(v, supressEvent) {
            this.callSuper(v, supressEvent);
            
            if (this.inited) updateTextWidth(this);
        },
        
        
        // Methods /////////////////////////////////////////////////////////////
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
})(myt);

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
        
        if (this.sortable) this.setOutset(14);
        
        this.setDisabled(!this.sortable);
        this._updateTextWidth();
        this._drawSortIcon();
    },
    
    /** @overrides myt.View */
    doAfterAdoption: function() {
        new myt.Canvas(this, {name:'sortIcon', align:'right', alignOffset:3, width:8, height:10, y:4});
        
        this.callSuper();
        
        this.textView.enableEllipsis();
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setSortIconColor: function(v) {this.sortIconColor = v;},
    
    /** @overrides myt.GridColumnHeader */
    setSortable: function(v) {
        this.callSuper(v);
        
        if (this.inited) {
            if (v) this.setOutset(14);
            this.setDisabled(!v);
            this._drawSortIcon();
        }
    },
    
    /** @overrides myt.GridColumnHeader */
    setSortState: function(v) {
        this.callSuper(v);
        
        if (this.inited) this._drawSortIcon();
    },
    
    /** @overrides myt.FocusObservable */
    setFocused: function(v) {
        this.callSuper(v);
        
        if (this.inited) this.updateUI();
    },
    
    /** @overrides myt.View */
    setWidth: function(v, supressEvent) {
        this.callSuper(v, supressEvent);
        
        if (this.inited) this._updateTextWidth();
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    _drawSortIcon: function() {
        var canvas = this.sortIcon, sortState = this.sortState;
        canvas.clear();
        
        if (this.sortable) {
            canvas.beginPath();
            
            var fillColor;
            switch (sortState) {
                case 'ascending':
                    fillColor = this.sortIconColor;
                    canvas.moveTo(0,10);
                    canvas.lineTo(4,0);
                    canvas.lineTo(8,10);
                    break;
                case 'descending':
                    fillColor = this.sortIconColor;
                    canvas.moveTo(0,0);
                    canvas.lineTo(4,10);
                    canvas.lineTo(8,0);
                    break;
                case 'none':
                    fillColor = this.activeColor;
                    canvas.moveTo(0,5);
                    canvas.lineTo(4,10);
                    canvas.lineTo(8,5);
                    canvas.lineTo(4,0);
                    break;
            }
            
            canvas.closePath();
            canvas.setFillStyle(fillColor);
            canvas.fill();
        }
    },
    
    _updateTextWidth: function() {
        if (this.contentAlign === 'left') {
            var tv = this.textView;
            tv.setWidth(this.width - this.outset - tv.x);
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
    
    /** @overrides myt.SimpleButton */
    drawHoverState: function() {
        this.setBgColor(this.hoverColor);
    },
    
    /** @overrides myt.SimpleButton */
    drawActiveState: function() {
        this.setBgColor(this.activeColor);
    },
    
    /** @overrides myt.SimpleButton */
    drawReadyState: function() {
        this.setBgColor(this.focused ? this.hoverColor : this.readyColor);
    },
    
    /** @overrides myt.Button */
    showFocusEmbellishment: function() {this.hideDefaultFocusEmbellishment();},
    
    /** @overrides myt.Button */
    hideFocusEmbellishment: function() {this.hideDefaultFocusEmbellishment();}
});

/** A spinner that uses the CSS border property and a CSS rotation animation
        to create the appearance of a spinner.
    
    Events:
        spinColor
    
    Attributes:
        size:number The width and height of the spinner.
        spinColor:color_string The color spinning quarter of the border.
    
    Private Attributes:
        None
*/
myt.Spinner = new JS.Class('Spinner', myt.View, {
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides myt.View */
    initNode: function(parent, attrs) {
        const self = this;
        
        self.lateAttrs = ['spinColor'];
        
        if (attrs.visible == null) attrs.visible = false;
        if (attrs.borderWidth == null) attrs.borderWidth = 5;
        if (attrs.borderColor == null) attrs.borderColor = '#fff';
        if (attrs.borderStyle == null) attrs.borderStyle = 'solid';
        if (attrs.spinColor == null) attrs.spinColor = '#000';
        
        self.callSuper(parent, attrs);
        
        self.deStyle.borderRadius = '50%';
        
        self._updateSize();
        self._spin();
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setSize: function(v) {
        if (this.size !== v) {
            this.size = v;
            if (this.inited) this._updateSize();
        }
    },
    
    setSpinColor: function(v) {
        if (this.spinColor !== v) {
            this.deStyle.borderTopColor = this.spinColor = v;
            if (this.inited) this.fireEvent('spinColor', v);
        }
    },
    
    /** @overrides myt.View */
    setBorderWidth: function(v) {
        if (this.borderWidth !== v) {
            this.callSuper(v);
            if (this.inited) this._updateSize();
        }
    },
    
    /** @overrides myt.View */
    setVisible: function(v) {
        if (this.visible !== v) {
            this.callSuper(v);
            if (this.inited) this._spin();
        }
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** @private */
    _spin: function() {
        this[this.visible ? 'addDomClass' : 'removeDomClass']('mytCenterSpin');
    },
    
    /** Remove the border from the dom element width and height so that the
        spinner doesn't take up more space that the size.
        @private */
    _updateSize: function() {
        const self = this,
            size = self.size,
            deStyle = self.deStyle;
        self.setWidth(size);
        self.setHeight(size);
        deStyle.width = deStyle.height = (size - 2*self.borderWidth) + 'px';
    }
});

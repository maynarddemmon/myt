/** Adds support for flex box child behavior to a myt.View.
    
    Events:
        flexGrow
        flexShrink
        alignSelf
    
    Attributes:
        flexGrow
        flexShrink
        alignSelf
*/
myt.FlexBoxChildSupport = new JS.Module('FlexBoxChildSupport', {
    // Accessors ///////////////////////////////////////////////////////////////
    /** @overrides */
    setParent: function(v) {
        var self = this,
            oldParentIsFlexBox = self.isChildOfFlexBox();
        
        self.callSuper(v);
        
        self._isChildOfFlexBox = self.parent && self.parent.isA(myt.FlexBoxSupport);
        
        // When reparenting from a flexbox parent to a non-flexbox parent we
        // may need to resync the dom to the model.
        if (self.inited && oldParentIsFlexBox && !self.isChildOfFlexBox()) self._syncDomToModel();
    },
    
    /** @private */
    _syncDomToModel: function() {
        var self = this,
            s = self.getOuterDomStyle();
        s.width = self.width + 'px';
        s.height = self.height + 'px';
        self.syncInnerToOuter();
    },
    
    /** @overrides
        Keep outer dom element's width in sync with the inner dom element. */
    setWidth: function(v, supressEvent) {
        if (v == null || v === '') {
            this.getOuterDomStyle().width = '';
            this.__syncModelToOuterBoundsWidth();
        } else {
            this.callSuper(v, supressEvent);
        }
        this.__syncInnerWidthToOuterWidth();
    },
    
    /** @overrides
        Keep outer dom element's height in sync with the inner dom element. */
    setHeight: function(v, supressEvent) {
        if (v == null || v === '') {
            this.getOuterDomStyle().height = '';
            this.__syncModelToOuterBoundsHeight();
        } else {
            this.callSuper(v, supressEvent);
        }
        this.__syncInnerHeightToOuterHeight();
    },
    
    // Flex Box Attrs
    setFlexGrow: function(v) {
        if (this.flexGrow !== v) {
            this.getOuterDomStyle().flexGrow = this.flexGrow = v;
            if (this.inited) {
                this.fireEvent('flexGrow', v);
                if (this.parent && this.parent.__syncSubviews) {
                    this.parent.__syncSubviews();
                }
            }
        }
    },
    
    setFlexShrink: function(v) {
        if (this.flexShrink !== v) {
            this.getOuterDomStyle().flexShrink = this.flexShrink = v;
            if (this.inited) {
                this.fireEvent('flexShrink', v);
                if (this.parent && this.parent.__syncSubviews) {
                    this.parent.__syncSubviews();
                }
            }
        }
    },
    
    setAlignSelf: function(v) {
        if (this.alignSelf !== v) {
            this.alignSelf = v;
            
            // Alias common unexpected values when assigning to the dom
            var domValue = v;
            switch (domValue) {
                case 'start':
                    domValue = 'flex-start';
                    break;
                case 'end':
                    domValue = 'flex-end';
                    break;
            }
            this.getOuterDomStyle().alignSelf = domValue;
            
            if (this.inited) this.fireEvent('alignSelf', v);
        }
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    isChildOfFlexBox: function() {
        return this._isChildOfFlexBox;
    },
    
    syncModelToOuterBounds: function() {
        var de = this.getOuterDomElement();
        this.__syncModelToOuterBoundsWidth(de);
        this.__syncModelToOuterBoundsHeight(de);
    },
    
    /** @private */
    __syncModelToOuterBoundsWidth: function(de) {
        var ids = this.getInnerDomStyle();
        if (!de) de = this.getOuterDomElement();
        if (ids.width === 'auto') {
            // We're sizing to our contents so first sync the outer dom style 
            // so we can read the correct client size below.
            this.getOuterDomStyle().width = 'auto';
        } else {
            // We're using a fixed size so first sync the inner dom style
            // to the outer dom style.
            this.__setInnerWidth(de.clientWidth);
        }
        this.fireEvent('width', this.width = de.clientWidth);
    },
    
    /** @private */
    __syncModelToOuterBoundsHeight: function(de) {
        var ids = this.getInnerDomStyle();
        if (!de) de = this.getOuterDomElement();
        if (ids.height === 'auto') {
            // We're sizing to our contents so first sync the outer dom style 
            // so we can read the correct client size below.
            this.getOuterDomStyle().height = 'auto';
        } else {
            // We're using a fixed size so first sync the inner dom style
            // to the outer dom style.
            this.__setInnerHeight(de.clientHeight);
        }
        this.fireEvent('height', this.height = de.clientHeight);
    },
    
    syncInnerToOuter: function() {
        this.__syncInnerWidthToOuterWidth();
        this.__syncInnerHeightToOuterHeight();
    },
    
    /** @private */
    __syncInnerWidthToOuterWidth: function() {
        // Don't clobber auto sizing
        if (this.getInnerDomStyle().width !== 'auto') {
            this.__setInnerWidth(this.getOuterDomElement().clientWidth);
        }
    },
    
    /** @private */
    __syncInnerHeightToOuterHeight: function() {
        // Don't clobber auto sizing
        if (this.getInnerDomStyle().height !== 'auto') {
            this.__setInnerHeight(this.getOuterDomElement().clientHeight);
        }
    },
    
    /** @private */
    __setInnerWidth: function(v) {
        this.getInnerDomStyle().width = v + 'px';
    },
    
    /** @private */
    __setInnerHeight: function(v) {
        this.getInnerDomStyle().height = v + 'px';
    },
    
    /** @overrides */
    createOurDomElement: function(parent) {
        var outerElem = this.callSuper(parent);
        
        // We need an inner dom element that is position relative to mask the
        // flex box behavior for descendants of this flex box child.
        var innerElem = document.createElement('div');
        innerElem.style.position = 'relative';
        outerElem.appendChild(innerElem);
        
        return [outerElem, innerElem];
    }
});

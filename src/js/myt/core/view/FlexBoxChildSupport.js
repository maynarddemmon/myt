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
        return this.parent && this.parent.isA(myt.FlexBoxSupport);
    },
    
    syncModelToOuterBounds: function() {
        var de = this.getOuterDomElement();
        this.__syncModelToOuterBoundsWidth(de);
        this.__syncModelToOuterBoundsHeight(de);
    },
    
    /** @private */
    __syncModelToOuterBoundsWidth: function(de) {
        if (!de) de = this.getOuterDomElement();
        this.getInnerDomStyle().width = de.offsetWidth + 'px';
        this.fireEvent('width', this.width = de.offsetWidth);
    },
    
    /** @private */
    __syncModelToOuterBoundsHeight: function(de) {
        if (!de) de = this.getOuterDomElement();
        this.getInnerDomStyle().height = de.offsetHeight + 'px';
        this.fireEvent('height', this.height = de.offsetHeight);
    },
    
    syncInnerToOuter: function() {
        this.__syncInnerWidthToOuterWidth();
        this.__syncInnerHeightToOuterHeight();
    },
    
    /** @private */
    __syncInnerWidthToOuterWidth: function() {
        this.getInnerDomStyle().width = this.getOuterDomStyle().width;
    },
    
    /** @private */
    __syncInnerHeightToOuterHeight: function() {
        this.getInnerDomStyle().height = this.getOuterDomStyle().height;
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

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
            if (this.inited) this.fireEvent('flexGrow', v);
        }
    },
    
    setFlexShrink: function(v) {
        if (this.flexShrink !== v) {
            this.getOuterDomStyle().flexShrink = this.flexShrink = v;
            if (this.inited) this.fireEvent('flexShrink', v);
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
    syncModelToOuterBounds: function() {
        var bounds = this.getOuterDomElement().getBoundingClientRect();
        this.__syncModelToOuterBoundsWidth(bounds);
        this.__syncModelToOuterBoundsHeight(bounds);
    },
    
    /** @private */
    __syncModelToOuterBoundsWidth: function(bounds) {
        if (!bounds) bounds = this.getOuterDomElement().getBoundingClientRect();
        this.fireEvent('width', this.width = bounds.width);
    },
    
    /** @private */
    __syncModelToOuterBoundsHeight: function(bounds) {
        if (!bounds) bounds = this.getOuterDomElement().getBoundingClientRect();
        this.fireEvent('height', this.height = bounds.height);
    },
    
    syncInnerToOuter: function() {
        this.__syncInnerWidthToOuterWidth();
        this.__syncInnerHeightToOuterHeight();
    },
    
    /** @private */
    __syncInnerWidthToOuterWidth: function() {
        this.__syncInnerToOuter('width');
    },
    
    /** @private */
    __syncInnerHeightToOuterHeight: function() {
        this.__syncInnerToOuter('height');
    },
    
    /** @private */
    __syncInnerToOuter: function(propName) {
        this.getInnerDomStyle()[propName] = myt.DomElementProxy.getComputedStyle(this.getOuterDomElement())[propName];
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

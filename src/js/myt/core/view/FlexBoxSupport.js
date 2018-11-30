/** Adds support for flex box to a myt.View.
    
    Events:
        flexDirection
        flexWrap
        justifyContent
        alignItems
        alignContent
    
    Attributes:
        flexDirection
        flexWrap
        justifyContent
        alignItems
        alignContent
*/
myt.FlexBoxSupport = new JS.Module('FlexBoxSupport', {
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides */
    initNode: function(parent, attrs) {
        this.callSuper(parent, attrs);
        this.__syncSubviews();
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    /** @overrides */
    setWidth: function(v, supressEvent) {
        this.callSuper(v, supressEvent);
        if (this.inited) this.__syncSubviews();
    },
    
    /** @overrides */
    setHeight: function(v, supressEvent) {
        this.callSuper(v, supressEvent);
        if (this.inited) this.__syncSubviews();
    },
    
    setFlexDirection: function(v) {
        if (this.flexDirection !== v) {
            this.getInnerDomStyle().flexDirection = this.flexDirection = v;
            if (this.inited) this.fireEvent('flexDirection', v);
        }
    },
    
    setFlexWrap: function(v) {
        if (this.flexWrap !== v) {
            this.getInnerDomStyle().flexWrap = this.flexWrap = v;
            if (this.inited) this.fireEvent('flexWrap', v);
        }
    },
    
    setJustifyContent: function(v) {
        if (this.justifyContent !== v) {
            this.getInnerDomStyle().justifyContent = this.justifyContent = v;
            if (this.inited) this.fireEvent('justifyContent', v);
        }
    },
    
    setAlignItems: function(v) {
        if (this.alignItems !== v) {
            this.getInnerDomStyle().alignItems = this.alignItems = v;
            if (this.inited) this.fireEvent('alignItems', v);
        }
    },
    
    setAlignContent: function(v) {
        if (this.alignContent !== v) {
            this.getInnerDomStyle().alignContent = this.alignContent = v;
            if (this.inited) this.fireEvent('alignContent', v);
        }
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** @overrides */
    createOurDomElement: function(parent) {
        var elem = this.callSuper(parent);
        elem.style.display = 'flex';
        return elem;
    },
    
    /** @overrides myt.View
        Allow the child views to be managed by the flex box.*/
    subviewAdded: function(sv) {
        if (sv) {
            sv.getOuterDomStyle().position = '';
            if (this.inited) this.__syncSubview(sv);
        }
    },
    
    /** @private */
    __syncSubviews: function() {
        var svs = this.getSubviews();
        svs.forEach(sv => this.__syncSubview(sv));
    },
    
    /** @private */
    __syncSubview: function(sv) {
        if (sv && sv.syncInnerToOuter) {
            sv.syncInnerToOuter();
            sv.syncModelToOuterBounds();
        }
    },
    
    /** @overrides myt.View
        Allow the child views to be managed by the flex box.*/
    subviewRemoved: function(sv) {
        if (sv && !sv.destroyed) sv.getOuterDomStyle().position = 'absolute';
    }
});

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
            this.flexDirection = v;
            
            // Alias common unexpected values when assigning to the dom
            var domValue = v;
            switch (domValue) {
                case 'rowReverse':
                    domValue = 'row-reverse';
                    break;
                case 'columnReverse':
                    domValue = 'column-reverse';
                    break;
            }
            this.getInnerDomStyle().flexDirection = domValue;
            
            if (this.inited) {
                this.fireEvent('flexDirection', v);
                this.__syncSubviews();
            }
        }
    },
    
    setFlexWrap: function(v) {
        if (this.flexWrap !== v) {
            this.flexWrap = v;
            
            // Alias common unexpected values when assigning to the dom
            var domValue = v;
            switch (domValue) {
                case 'wrapReverse':
                case 'reverse':
                    domValue = 'wrap-reverse';
                    break;
            }
            this.getInnerDomStyle().flexWrap = domValue;
            
            
            if (this.inited) {
                this.fireEvent('flexWrap', v);
                this.__syncSubviews();
            }
        }
    },
    
    setJustifyContent: function(v) {
        if (this.justifyContent !== v) {
            this.justifyContent = v;
            
            // Alias common unexpected values when assigning to the dom
            var domValue = v;
            switch (domValue) {
                case 'start':
                    domValue = 'flex-start';
                    break;
                case 'end':
                    domValue = 'flex-end';
                    break;
                case 'spaceBetween':
                case 'between':
                    domValue = 'space-between';
                    break;
                case 'spaceAround':
                case 'around':
                    domValue = 'space-around';
                    break;
                case 'spaceEvenly':
                case 'evenly':
                    domValue = 'space-evenly';
                    break;
            }
            this.getInnerDomStyle().justifyContent = domValue;
            
            if (this.inited) {
                this.fireEvent('justifyContent', v);
                this.__syncSubviews();
            }
        }
    },
    
    setAlignItems: function(v) {
        if (this.alignItems !== v) {
            this.alignItems = v;
            
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
            this.getInnerDomStyle().alignItems = domValue;
            
            if (this.inited) {
                this.fireEvent('alignItems', v);
                this.__syncSubviews();
            }
        }
    },
    
    setAlignContent: function(v) {
        if (this.alignContent !== v) {
            this.alignContent = v;
            
            // Alias common unexpected values when assigning to the dom
            var domValue = v;
            switch (domValue) {
                case 'start':
                    domValue = 'flex-start';
                    break;
                case 'end':
                    domValue = 'flex-end';
                    break;
                case 'spaceBetween':
                case 'between':
                    domValue = 'space-between';
                    break;
                case 'spaceAround':
                case 'around':
                    domValue = 'space-around';
                    break;
            }
            this.getInnerDomStyle().alignContent = domValue;
            
            if (this.inited) {
                this.fireEvent('alignContent', v);
                this.__syncSubviews();
            }
        }
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** @overrides */
    createOurDomElement: function(parent) {
        var elements = this.callSuper(parent),
            innerElem;
        if (Array.isArray(elements)) {
            innerElem = elements[1];
        } else {
            innerElem = elements;
        }
        innerElem.style.display = 'flex';
        return elements;
    },
    
    /** @overrides myt.View
        Allow the child views to be managed by the flex box.*/
    subviewAdded: function(sv) {
        if (sv && !sv.ignoreFlex) {
            sv.getOuterDomStyle().position = '';
            if (this.inited) this.__syncSubviews();
        }
    },
    
    /** @private */
    __syncSubviews: function() {
        var svs = this.getSubviews();
        svs.forEach(sv => this.__syncSubview(sv));
    },
    
    /** @private */
    __syncSubview: function(sv) {
        if (sv && sv.syncInnerToOuter && !sv.ignoreFlex) {
            sv.syncInnerToOuter();
            sv.syncModelToOuterBounds();
        }
    },
    
    /** @overrides myt.View
        Allow the child views to be managed by the flex box.*/
    subviewRemoved: function(sv) {
        if (sv && !sv.destroyed && !sv.ignoreFlex) sv.getOuterDomStyle().position = 'absolute';
    }
});

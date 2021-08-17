(pkg => {
    const JSModule = JS.Module,
        
        AUTO = 'auto',
        
        syncSubviewsForFlexBox = flexBox => {
            flexBox.getSubviews().forEach(sv => {
                if (sv && sv.syncInnerToOuter && !sv.ignoreFlex) {
                    sv.syncInnerToOuter();
                    sv.syncModelToOuterBounds();
                }
            });
        },
        
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
            
            @class */
        FlexBoxSupport = pkg.FlexBoxSupport = new JSModule('FlexBoxSupport', {
            // Life Cycle //////////////////////////////////////////////////////
            /** @overrides */
            initNode: function(parent, attrs) {
                this.callSuper(parent, attrs);
                syncSubviewsForFlexBox(this);
            },
            
            
            // Accessors ///////////////////////////////////////////////////////
            /** @overrides */
            setWidth: function(v, supressEvent) {
                this.callSuper(v, supressEvent);
                if (this.inited) syncSubviewsForFlexBox(this);
            },
            
            /** @overrides */
            setHeight: function(v, supressEvent) {
                this.callSuper(v, supressEvent);
                if (this.inited) syncSubviewsForFlexBox(this);
            },
            
            setFlexDirection: function(v) {
                if (this.flexDirection !== v) {
                    this.flexDirection = v;
                    
                    // Alias common unexpected values when assigning to the dom
                    let domValue = v;
                    switch (domValue) {
                        case 'rowReverse':
                            domValue = 'row-reverse';
                            break;
                        case 'columnReverse':
                            domValue = 'column-reverse';
                            break;
                    }
                    this.getIDS().flexDirection = domValue;
                    
                    if (this.inited) {
                        this.fireEvent('flexDirection', v);
                        syncSubviewsForFlexBox(this);
                    }
                }
            },
            
            setFlexWrap: function(v) {
                if (this.flexWrap !== v) {
                    this.flexWrap = v;
                    
                    // Alias common unexpected values when assigning to the dom
                    let domValue = v;
                    switch (domValue) {
                        case 'wrapReverse':
                        case 'reverse':
                            domValue = 'wrap-reverse';
                            break;
                    }
                    this.getIDS().flexWrap = domValue;
                    
                    if (this.inited) {
                        this.fireEvent('flexWrap', v);
                        syncSubviewsForFlexBox(this);
                    }
                }
            },
            
            setJustifyContent: function(v) {
                if (this.justifyContent !== v) {
                    this.justifyContent = v;
                    
                    // Alias common unexpected values when assigning to the dom
                    let domValue = v;
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
                    this.getIDS().justifyContent = domValue;
                    
                    if (this.inited) {
                        this.fireEvent('justifyContent', v);
                        syncSubviewsForFlexBox(this);
                    }
                }
            },
            
            setAlignItems: function(v) {
                if (this.alignItems !== v) {
                    this.alignItems = v;
                    
                    // Alias common unexpected values when assigning to the dom
                    let domValue = v;
                    switch (domValue) {
                        case 'start':
                            domValue = 'flex-start';
                            break;
                        case 'end':
                            domValue = 'flex-end';
                            break;
                    }
                    this.getIDS().alignItems = domValue;
                    
                    if (this.inited) {
                        this.fireEvent('alignItems', v);
                        syncSubviewsForFlexBox(this);
                    }
                }
            },
            
            setAlignContent: function(v) {
                if (this.alignContent !== v) {
                    this.alignContent = v;
                    
                    // Alias common unexpected values when assigning to the dom
                    let domValue = v;
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
                    this.getIDS().alignContent = domValue;
                    
                    if (this.inited) {
                        this.fireEvent('alignContent', v);
                        syncSubviewsForFlexBox(this);
                    }
                }
            },
            
            
            // Methods /////////////////////////////////////////////////////////
            /** @overrides */
            createOurDomElement: function(parent) {
                const elements = this.callSuper(parent);
                (Array.isArray(elements) ? elements[1] : elements).style.display = 'flex';
                return elements;
            },
            
            /** @overrides myt.View
                Allow the child views to be managed by the flex box.*/
            subviewAdded: function(sv) {
                if (sv && !sv.ignoreFlex) {
                    sv.getODS().position = '';
                    if (this.inited) syncSubviewsForFlexBox(this);
                }
            },
            
            /** Syncs all the subviews inner dom elements to outer dom 
                elements and models to outer bounds.
                @returns {undefined} */
            syncSubviews: function() {
                syncSubviewsForFlexBox(this);
            },
            
            /** @overrides myt.View
                Allow the child views to be managed by the flex box. */
            subviewRemoved: sv => {
                if (sv && !sv.destroyed && !sv.ignoreFlex) sv.getODS().position = 'absolute';
            }
        });
    
    /** Adds support for flex box child behavior to a myt.View.
        
        Events:
            flexGrow
            flexShrink
            alignSelf
        
        Attributes:
            flexGrow
            flexShrink
            alignSelf
        
        @class */
    pkg.FlexBoxChildSupport = new JSModule('FlexBoxChildSupport', {
        // Accessors ///////////////////////////////////////////////////////////
        /** @overrides */
        setParent: function(v) {
            const self = this,
                oldParentIsFlexBox = self.isChildOfFlexBox();
            
            self.callSuper(v);
            
            self.__parentIsFlexBox = self.parent && self.parent.isA(FlexBoxSupport);
            
            // When reparenting from a flexbox parent to a non-flexbox parent 
            // we may need to resync the dom to the model.
            if (self.inited && oldParentIsFlexBox && !self.isChildOfFlexBox()) {
                // Sync dom to model
                const ods = self.getODS();
                if (ods.width !== AUTO) ods.width = self.width + 'px';
                if (ods.height !== AUTO) ods.height = self.height + 'px';
                self.syncInnerToOuter();
            }
        },
        
        /** @overrides
            Keep outer dom element's width in sync with the inner 
            dom element. */
        setWidth: function(v, supressEvent) {
            if (v == null || v === '') {
                this.getODS().width = '';
                this.syncModelToOuterBounds(false, true);
            } else {
                this.callSuper(v, supressEvent);
            }
            this.syncInnerToOuter(false, true);
        },
        
        /** @overrides
            Keep outer dom element's height in sync with the inner 
            dom element. */
        setHeight: function(v, supressEvent) {
            if (v == null || v === '') {
                this.getODS().height = '';
                this.syncModelToOuterBounds(true, false);
            } else {
                this.callSuper(v, supressEvent);
            }
            this.syncInnerToOuter(true, false);
        },
        
        // Flex Box Attrs
        setFlexGrow: function(v) {
            if (this.flexGrow !== v) {
                this.getODS().flexGrow = this.flexGrow = v;
                if (this.inited) {
                    this.fireEvent('flexGrow', v);
                    const parent = this.parent;
                    if (parent && parent.syncSubviews) parent.syncSubviews();
                }
            }
        },
        
        setFlexShrink: function(v) {
            if (this.flexShrink !== v) {
                this.getODS().flexShrink = this.flexShrink = v;
                if (this.inited) {
                    this.fireEvent('flexShrink', v);
                    const parent = this.parent;
                    if (parent && parent.syncSubviews) parent.syncSubviews();
                }
            }
        },
        
        setAlignSelf: function(v) {
            if (this.alignSelf !== v) {
                this.alignSelf = v;
                
                // Alias common unexpected values when assigning to the dom
                let domValue = v;
                switch (domValue) {
                    case 'start':
                        domValue = 'flex-start';
                        break;
                    case 'end':
                        domValue = 'flex-end';
                        break;
                }
                this.getODS().alignSelf = domValue;
                
                if (this.inited) this.fireEvent('alignSelf', v);
            }
        },
        
        
        // Methods /////////////////////////////////////////////////////////////
        isChildOfFlexBox: function() {
            return this.__parentIsFlexBox;
        },
        
        /** @param {boolean} [notWidth] If true width will not be synced.
            @param {boolean} [notHeight] If true height will not be synced.
            @returns {undefined} */
        syncModelToOuterBounds: function(notWidth, notHeight) {
            const ode = this.getODE(),
                ids = this.getIDS();
            if (!notWidth) {
                if (ids.width === AUTO) {
                    // We're sizing to our contents so first sync the outer 
                    // dom style so we can read the correct client size below.
                    this.getODS().width = AUTO;
                } else {
                    // We're using a fixed size so first sync the inner dom 
                    // style to the outer dom style.
                    this.setInnerWidth(ode.clientWidth);
                }
                this.fireEvent('width', this.width = ode.clientWidth);
            }
            if (!notHeight) {
                if (ids.height === AUTO) {
                    // We're sizing to our contents so first sync the outer dom 
                    // style so we can read the correct client size below.
                    this.getODS().height = AUTO;
                } else {
                    // We're using a fixed size so first sync the inner dom 
                    // style to the outer dom style.
                    this.setInnerHeight(ode.clientHeight);
                }
                this.fireEvent('height', this.height = ode.clientHeight);
            }
        },
        
        /** @param {boolean} [notWidth] If true width will not be synced.
            @param {boolean} [notHeight] If true height will not be synced.
            @returns {undefined} */
        syncInnerToOuter: function(notWidth, notHeight) {
            const ids = this.getIDS(),
                ode = this.getODE();
            // Don't clobber auto sizing
            if (!notWidth && ids.width !== AUTO) this.setInnerWidth(ode.clientWidth);
            if (!notHeight && ids.height !== AUTO) this.setInnerHeight(ode.clientHeight);
        },
        
        /** Sets the inner dom element's width.
            @param {number} v
            @returns {undefined} */
        setInnerWidth: function(v) {
            this.getIDS().width = v + 'px';
        },
        
        /** Sets the inner dom element's height.
            @param {number} v
            @returns {undefined} */
        setInnerHeight: function(v) {
            this.getIDS().height = v + 'px';
        },
        
        /** @overrides */
        createOurDomElement: function(parent) {
            const outerElem = this.callSuper(parent);
            
            // We need an inner dom element that is position relative to mask 
            // the flex box behavior for descendants of this flex box child.
            const innerElem = document.createElement('div');
            innerElem.style.position = 'relative';
            outerElem.appendChild(innerElem);
            
            return [outerElem, innerElem];
        }
    });
})(myt);

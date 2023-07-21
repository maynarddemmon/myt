(pkg => {
    const mathRound = Math.round,
        DomElementProxy = pkg.DomElementProxy,
        
        rectContainsPoint = pkg.Geometry.rectContainsPoint,
        
        getDomStyle = (view, isInnerElem) => isInnerElem ? view.getIDS() : view.getODS(),
        
        /*  Preserves focus and scroll position during dom updates. Focus can get lost in webkit 
            when an element is removed from the dom.
                param viewBeingRemoved:myt.View
                param wrapperFunc:function a function to execute that manipulates the dom in some 
                    way, typically a remove followed by an insert. */
        retainFocusDuringDomUpdate = (viewBeingRemoved, wrappedFunc) => {
            const restoreFocus = pkg.global.focus.focusedView, 
                elem = viewBeingRemoved.getIDE();
            if (restoreFocus === viewBeingRemoved || restoreFocus?.isDescendantOf(viewBeingRemoved)) {
                restoreFocus._ignoreFocus = true;
            }
            
            // Also maintain scrollTop/scrollLeft since those also get reset when a dom element is 
            // removed. Note: descendant elements with scroll positions won't get maintained.
            const {scrollTop, scrollLeft} = elem;
            
            wrappedFunc();
            
            if (restoreFocus) {
                restoreFocus._ignoreFocus = false;
                restoreFocus.focus(true);
            }
            
            // Restore scrollTop/scrollLeft
            elem.scrollTop = scrollTop;
            elem.scrollLeft = scrollLeft;
        },
        
        /*  Implements isBehind and isInFrontOf methods. Returns a boolean indicating front or 
            behind respective to the "front" param.
                param firstView:View The view to check position for
                param view:View The view to check the position of the first view against.
                param front:boolean indicates if this is the isInFrontOf test or not.
                param checkZIndex:boolean If true z-index will first be used to check if the view 
                    is in front or not. */
        comparePosition = (firstView, secondView, front, checkZIndex) => {
            if (secondView && typeof secondView === 'object') {
                if (checkZIndex) {
                    const commonAncestorElem = firstView.getLeastCommonAncestor(secondView)?.getIDE();
                    if (commonAncestorElem) {
                        const getZIndexRelativeToAncestor = DomElementProxy.getZIndexRelativeToAncestor,
                            inverter = front ? -1 : 1, // Reverse comparison order if so directed.
                            zIdx = inverter * getZIndexRelativeToAncestor(firstView.getODE(), commonAncestorElem),
                            otherZIdx = inverter * getZIndexRelativeToAncestor(secondView.getODE(), commonAncestorElem);
                        if (zIdx < otherZIdx) {
                            return true;
                        } else if (otherZIdx < zIdx) {
                            return false;
                        }
                        // Fall through to dom comparison since z-indices are equal.
                    }
                }
                
                // DOCUMENT_POSITION_DISCONNECTED 1
                // DOCUMENT_POSITION_PRECEDING 2
                // DOCUMENT_POSITION_FOLLOWING 4
                // DOCUMENT_POSITION_CONTAINS 8
                // DOCUMENT_POSITION_CONTAINED_BY 16
                // DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC 32
                const rel = firstView.getODE().compareDocumentPosition(secondView.getODE());
                return front ? rel === 2 || rel === 10 : rel === 4 || rel === 20;
            } else {
                return false;
            }
        },
        
        /*  Calculates the effective scale for the provided view and all its ancestors. Returns the 
            effective scale for the provided view. */
        calculateEffectiveScale = view => {
            const ancestorsAndSelf = view.getAncestors();
            let i = ancestorsAndSelf.length, 
                effectiveScaleX = 1,
                effectiveScaleY = 1;
            while (i) {
                const ancestor = ancestorsAndSelf[--i];
                effectiveScaleX *= ancestor.scaleX || 1;
                effectiveScaleY *= ancestor.scaleY || 1;
                ancestor.__effectiveScaleX = effectiveScaleX;
                ancestor.__effectiveScaleY = effectiveScaleY;
            }
            return {scaleX:effectiveScaleX, scaleY:effectiveScaleY};
        },
        
        isPointVisible = (view, x, y) => {
            const ode = view.getODE();
            if (rectContainsPoint(x, y, 0, 0, ode.offsetWidth * view.__effectiveScaleX, ode.offsetHeight * view.__effectiveScaleY)) {
                let parent;
                if (parent = view.parent) {
                    const pIde = parent.getIDE();
                    return isPointVisible(
                        parent, 
                        x + (ode.offsetLeft - pIde.scrollLeft) * parent.__effectiveScaleX, 
                        y + (ode.offsetTop - pIde.scrollTop) * parent.__effectiveScaleY
                    );
                }
                return true;
            }
            return false;
        },
        
        teardownAlignConstraint = view => {
            switch (view.align) {
                case 'center': view.releaseConstraint('__doAlignCenter'); break;
                case 'right': view.releaseConstraint('__doAlignRight'); break;
                case 'left':
                default: // Do nothing
            }
        },
        
        setupAlignConstraint = view => {
            const parent = view.parent;
            if (parent) {
                switch (view.align) {
                    case 'center':
                        view.constrain('__doAlignCenter', [view, 'width', view, 'alignOffset', parent, 'width']);
                        break;
                    case 'right':
                        view.constrain('__doAlignRight', [view, 'width', view, 'alignOffset', parent, 'width']);
                        break;
                    case 'left':
                        view.setX(view.alignOffset || 0);
                        break;
                    default: // Do nothing
                }
            }
        },
        
        teardownValignConstraint = view => {
            switch (view.valign) {
                case 'middle': view.releaseConstraint('__doValignMiddle'); break;
                case 'bottom': view.releaseConstraint('__doValignBottom'); break;
                case 'top':
                default: // Do nothing
            }
        },
        
        setupValignConstraint = view => {
            const parent = view.parent;
            if (parent) {
                switch (view.valign) {
                    case 'middle':
                        view.constrain('__doValignMiddle', [view, 'height', view, 'valignOffset', parent, 'height']);
                        break;
                    case 'bottom':
                        view.constrain('__doValignBottom', [view, 'height', view, 'valignOffset', parent, 'height']);
                        break;
                    case 'top':
                        view.setY(view.valignOffset || 0);
                        break;
                    default: // Do nothing
                }
            }
        };
    
    /** A Node that can be viewed. Instances of view are typically backed by an absolutely 
        positioned div element.
        
        Events:
            domClass:string Fired when the domClass setter is called.
            domId:string Fired when the domId setter is called.
            align:string
            alignOffset:number
            valign:string
            valignOffset:number
            x:number
            y:number
            width:number (suppressable)
            height:number (suppressable)
            boundsWidth:number Fired when the bounds width of the view changes.
            boundsHeight:number Fired when the bounds height of the view changes.
            textColor:string
            bgColor:string
            opacity:number
            overflow:string
            visible:boolean
            cursor:string
            subviewAdded:myt.View Fired when a subview is added to this view.
            subviewRemoved:myt.View Fired when a subview is removed from this view.
            layoutAdded:myt.Layout Fired when a layout is added to this view.
            layoutRemoved:myt.Layout Fired when a layout is removed from this view.
        
        Attributes:
            tagName:string Determines the name of the DOM element to create for this instance. This 
                is not a normal attribute. It is only used during initialization and it will be 
                deleted from the attrs object upon use. If no tagName is provided "div" will be used.
            focusTrap:boolean Determines if focus traversal can move above this view or not. The 
                default is undefined which is equivalent to false. Can be ignored using a key 
                modifier. The key modifier is typically 'option'.
            focusCage:boolean Determines if focus traversal can move above this view or not. The 
                default is undefined which is equivalent to false. This is the same as focusTrap 
                except it can't be ignored using a key modifier.
            maskFocus:boolean Prevents focus from traversing into this view or any of its subviews. 
                The default is undefined which is equivalent to false.
            ignoreLayout:boolean Determines if this view should be included in layouts or not. 
                Default is undefined which is equivalent to false.
            layoutHint:* A value that indicates this view is treated as "special" by the layout. 
                The interpretation of this value is up to the layout managing the view.
            align:string Aligns the view horizontally within its parent. Supported values are: 
                'left', 'center', 'right' and ''. The default is undefined which is equivalent to ''.
            alignOffset:number A pixel offset to use when aligning a view.
            valign:string Aligns the view vertically within its parent. Supported values are: 'top', 
                'middle', 'bottom' and ''. The default is undefined which is equivalent to ''.
            valignOffset:number A pixel offset to use when valigning a view.
            x:number The x-position of this view in pixels. Defaults to 0.
            y:number The y-position of this view in pixels. Defaults to 0.
            width:number The width of this view in pixels. Defaults to 0.
            height:number the height of this view in pixels. Defaults to 0.
            boundsWidth:number (read only) The actual bounds of the view in the x-dimension. This 
                value is in pixels relative to the RootView and thus compensates for rotation 
                and scaling.
            boundsHeight:number (read only) The actual bounds of the view in the y-dimension. This 
                value is in pixels relative to the RootView and thus compensates for rotation 
                and scaling.
            textColor:string The color used for text. Will be inherited by descendant views if they 
                don't themselves set textColor or if they set textColor to 'inherit'. Defaults to 
                undefined which is equivalent to 'inherit'.
            bgColor:string The background color of this view. Use a value of 'transparent' to make 
                this view transparent. Defaults to 'transparent'.
            opacity:number The opacity of this view. The value should be a number between 0 and 1. 
                Defaults to 1.
            overflow:string Determines how descendant content overflows the bounds. Allowed values: 
                'visible', 'hidden', 'scroll', 'auto', 'autoy', 'autox' and 'inherit'. Defaults to 
                undefined which is equivalent to 'visible'.
            visible:boolean Makes this view visible or not. The default value is true which means 
                visbility is inherited from the parent view.
            cursor:string Determines what cursor to show when moused over the view. Allowed values: 
                'auto', 'move', 'no-drop', 'col-resize', 'all-scroll', 'pointer', 'not-allowed', 
                'row-resize', 'crosshair', 'progress', 'e-resize', 'ne-resize', 'default', 'text', 
                'n-resize', 'nw-resize', 'help', 'vertical-text', 's-resize', 'se-resize', 
                'inherit', 'wait', 'w-resize', 'sw-resize'. Defaults to undefined which is 
                equivalent to 'auto'.
            pointerEvents:string Determines if this view responds to pointer events or not. 
                Supported values: 'none', 'auto' and 'inherit'. Defaults to undefined which is 
                equivalent to 'auto'.
            outlineWidth:number The width of the CSS outline. If a value equivalent to false is 
                provided 0 will be used.
            outlineStyle:string The CSS outline style. If null or undefined is provided 'none' will 
                be used. Supported values: 'none', 'dotted', 'dashed', 'solid', 'double', 'groove', 
                'ridge', 'inset', 'outset', 'inherit'.
            outlineColor:string Sets the color of the CSS outline. If null or undefined is provided 
                '#000' will be used.
            borderWidth:number The width of the CSS border. If a value equivalent to false is 
                provided 0 will be used.
            borderStyle:string The CSS border style. If null or undefined is provided 'none' will 
                be used. Supported values: 'none', 'dotted', 'dashed', 'solid', 'double', 'groove', 
                'ridge', 'inset', 'outset', 'inherit'.
            borderColor:string Sets the color of the CSS border. If null or undefined is provided 
                '#000' will be used.
            tooltip:string Sets a tooltip for this view. The basic implementation uses the dom 
                element's title property. For a richer tooltip display use myt.TooltipMixin.
        
        Private Attributes:
            subviews:array The array of child myt.Views for this view. Should be accessed through 
                the getSubviews method.
            layouts:array The array of child myt.Layouts for this view. Should be accessed through 
                the getLayouts method.
        
        @class */
    pkg.View = new JS.Class('View', pkg.Node, {
        include: [
            DomElementProxy, 
            pkg.DomObservable, 
            pkg.DomObserver, 
            pkg.ScrollObservable, 
            pkg.FocusObservable, 
            pkg.KeyObservable, 
            pkg.MouseObservable
        ],
        
        
        // Class Methods and Attributes ////////////////////////////////////////
        extend: {
            retainFocusDuringDomUpdate: retainFocusDuringDomUpdate
        },
        
        
        // Life Cycle //////////////////////////////////////////////////////////
        /** @overrides myt.Node */
        initNode: function(parent, attrs) {
            const self = this;
            
            self.x = self.y = self.width = self.height = 0;
            self.opacity = 1;
            self.visible = true;
            
            if (attrs.tagName) {
                self.tagName = attrs.tagName;
                delete attrs.tagName;
            }
            self.setDomElement(self.createOurDomElement(parent));
            
            // Necessary since x and y of 0 won't update the dom element style so this gets things 
            // initialized correctly. Without this RootViews will have an incorrect initial 
            // position for x or y of 0. This is also necessary if the parent of this View uses CSS
            // based padding.
            const ods = self.getODS();
            ods.left = ods.top = '0px';
            
            self.callSuper(parent, attrs);
            
            // Must be done after the dom element is inserted so that calls to 
            // getBoundingClientRect will work.
            self.__updateBounds(self.width, self.height);
        },
        
        /** Creates the dom element we will be a proxy for. Called during View initialization. 
            Gives subclasses a change to change how the view is backed. This implementation also 
            looks for a this.tagName property which it will use as the name for the dom element 
            that gets created. If no this.tagName property is found "div" will be used.
            @param {!Object} parent - The dom element that will be the parent of the newly created 
                dom element.
            @returns {!Object} a dom element */
        createOurDomElement: function(parent) {
            const elem = document.createElement(this.tagName ?? 'div');
            elem.style.position = 'absolute';
            
            // Make dom elements easier to location via selectors
            elem.className = this.klass.__cssClassName ??= 'myt-' + this.klass.__displayName.split('.').join('-');
            
            return elem;
        },
        
        /** @overrides myt.Node */
        destroyAfterOrphaning: function() {
            this.callSuper();
            
            this.detachFromAllDomSources();
            this.detachAllDomObservers();
            this.disposeOfDomElement();
        },
        
        
        // Accessors ///////////////////////////////////////////////////////////
        /** @overrides myt.Node */
        setParent: function(parent) {
            const self = this;
            if (self.parent !== parent) {
                if (self.inited) {
                    teardownAlignConstraint(self);
                    teardownValignConstraint(self);
                }
                self.callSuper(parent);
                if (self.align) setupAlignConstraint(self);
                if (self.valign) setupValignConstraint(self);
            }
        },
        
        /** Does lazy instantiation of the subviews array.
            @returns {!Array} */
        getSubviews: function() {
            return this.subviews ??= [];
        },
        
        /** Get an array of the subviews in the lexical order of the dom.
            @returns {!Array} */
        getSubviewsInLexicalOrder: function() {
            const self = this,
                retval = [],
                children = self.getIDE().children,
                len = children.length;
            for (let i = 0; i < len;) {
                const sv = children[i++].model;
                if (sv?.parent === self) retval.push(sv);
            }
            return retval;
        },
        
        /** Gets the views that are our siblings.
            @returns {!Array} of myt.View or undefined if this view is orphaned. */
        getSiblingViews: function() {
            if (this.parent) {
                // Using filter ensures we have a copy of the subviews since we will modify it and 
                // do not want to modify the original array. Remove ourselves from the subviews 
                // since we only want siblings.
                return this.parent.getSubviews().filter(sv => sv !== this);
            }
        },
        
        // Focus Attributes //
        setFocusTrap: function(v) {this.focusTrap = v;},
        setFocusCage: function(v) {this.focusCage = v;},
        setMaskFocus: function(v) {this.maskFocus = v;},
        
        // Layout Attributes //
        setLayoutHint: function(v) {this.layoutHint = v;},
        
        /** Does lazy instantiation of the layouts array.
            @returns {!Array} */
        getLayouts: function() {
            return this.layouts ??= [];
        },
        
        setIgnoreLayout: function(v) {
            const self = this;
            if (self.ignoreLayout !== v) {
                // Add or remove ourselves from any layouts on our parent.
                const ready = self.inited && self.parent;
                let layouts,
                    i;
                if (v) {
                    if (ready) {
                        layouts = self.parent.getLayouts();
                        i = layouts.length;
                        while (i) layouts[--i].removeSubview(self);
                    }
                    self.ignoreLayout = v;
                } else {
                    self.ignoreLayout = v;
                    if (ready) {
                        layouts = self.parent.getLayouts();
                        i = layouts.length;
                        while (i) layouts[--i].addSubview(self);
                    }
                }
            }
        },
        
        // Dom Selector Attributes //
        /** @overrides myt.DomElementProxy */
        setDomClass: function(v) {
            if (this.domClass !== v) {
                this.callSuper(v);
                if (this.inited) this.fireEvent('domClass', v);
            }
        },
        
        /** @overrides myt.DomElementProxy */
        setDomId: function(v) {
            if (this.domId !== v) {
                this.callSuper(v);
                if (this.inited) this.fireEvent('domId', v);
            }
        },
        
        // Alignment Attributes //
        setAlignOffset: function(v) {
            if (this.alignOffset !== v) {
                this.alignOffset = v;
                if (this.inited) this.fireEvent('alignOffset', v);
                if (this.parent && this.align === 'left') this.setX(v);
            }
        },
        
        setAlign: function(v) {
            if (this.align !== v) {
                if (this.inited) teardownAlignConstraint(this);
                this.align = v;
                if (this.inited) {
                    this.fireEvent('align', v);
                    setupAlignConstraint(this);
                }
            }
        },
        
        /** @private
            @param {!Object} event
            @returns {undefined} */
        __doAlignCenter: function(event) {
            this.setX(mathRound((this.parent.width - this.width) / 2) + (this.alignOffset || 0));
        },
        
        /** @private
            @param {!Object} event
            @returns {undefined} */
        __doAlignRight: function(event) {
            this.setX(this.parent.width - this.width - (this.alignOffset || 0));
        },
        
        setValignOffset: function(v) {
            if (this.valignOffset !== v) {
                this.valignOffset = v;
                if (this.inited) this.fireEvent('valignOffset', v);
                if (this.parent && this.valign === 'top') this.setY(v);
            }
        },
        
        setValign: function(v) {
            if (this.valign !== v) {
                if (this.inited) teardownValignConstraint(this);
                this.valign = v;
                if (this.inited) {
                    this.fireEvent('valign', v);
                    setupValignConstraint(this);
                }
            }
        },
        
        /** @private
            @param {!Object} event
            @returns {undefined} */
        __doValignMiddle: function(event) {
            this.setY(mathRound((this.parent.height - this.height) / 2) + (this.valignOffset || 0));
        },
        
        /** @private
            @param {!Object} event
            @returns {undefined} */
        __doValignBottom: function(event) {
            this.setY(this.parent.height - this.height - (this.valignOffset || 0));
        },
        
        // Visual Attributes //
        setX: function(v) {
            if (this.x !== v) {
                this.x = v;
                if (this.visible) this.getODS().left = v + 'px';
                if (this.inited) this.fireEvent('x', v);
            }
        },
        
        setY: function(v) {
            if (this.y !== v) {
                this.y = v;
                if (this.visible) this.getODS().top = v + 'px';
                if (this.inited) this.fireEvent('y', v);
            }
        },
        
        setWidth: function(v) {
            // Dom elements don't support negative width
            if (0 > v) v = 0;
            
            if (this.width !== v) {
                this.width = v;
                this.getODS().width = v + 'px';
                if (this.inited) {
                    this.__updateBounds(v, this.height);
                    this.fireEvent('width', v);
                }
            }
        },
        
        setHeight: function(v) {
            // Dom elements don't support negative height
            if (0 > v) v = 0;
            
            if (this.height !== v) {
                this.height = v;
                this.getODS().height = v + 'px';
                if (this.inited) {
                    this.__updateBounds(this.width, v);
                    this.fireEvent('height', v);
                }
            }
        },
        
        setDomMinWidth: function(v, isInnerElem) {
            getDomStyle(this, isInnerElem).minWidth = v != null ? v + 'px' : null;
        },
        
        getDomMinWidth: function(isInnerElem) {
            const minWidth = getDomStyle(this, isInnerElem).minWidth;
            return minWidth != null ? Number.parseInt(minWidth) : null;
        },
        
        setDomMinHeight: function(v, isInnerElem) {
            getDomStyle(this, isInnerElem).minHeight = v != null ? v + 'px' : null;
        },
        
        getDomMinHeight: function(isInnerElem) {
            const minHeight = getDomStyle(this, isInnerElem).minHeight;
            return minHeight != null ? Number.parseInt(minHeight) : null;
        },
        
        setTextColor: function(v) {
            if (this.textColor !== v) {
                this.textColor = v;
                this.getODS().color = v || 'inherit';
                if (this.inited) this.fireEvent('textColor', v);
            }
        },
        
        setBgColor: function(v) {
            if (this.bgColor !== v) {
                this.getODS().backgroundColor = this.bgColor = v;
                if (this.inited) this.fireEvent('bgColor', v);
            }
        },
        
        /** Used by myt.Animator to determine if an attribute is a color attribute or not.
            @param {string} attrName
            @returns {boolean} */
        isColorAttr: attrName => attrName === 'bgColor' || attrName === 'textColor',
        
        setOpacity: function(v) {
            if (this.opacity !== v) {
                this.getODS().opacity = this.opacity = v;
                if (this.inited) this.fireEvent('opacity', v);
            }
        },
        
        setOverflow: function(v) {
            const existing = this.overflow;
            if (existing !== v) {
                this.overflow = v;
                
                const ids = this.getIDS();
                if (v === 'autox') {
                    ids.overflowX = 'auto';
                    ids.overflowY = 'hidden';
                } else if (v === 'autoy') {
                    ids.overflowY = 'auto';
                    ids.overflowX = 'hidden';
                } else {
                    if (existing === 'autox' || existing === 'autoy') ids.overflowX = ids.overflowY = null;
                    ids.overflow = v || 'visible';
                }
                
                if (this.inited) this.fireEvent('overflow', v);
            }
        },
        
        setVisible: function(v) {
            const self = this;
            if (self.visible !== v) {
                self.visible = v;
                
                const ods = self.getODS();
                ods.visibility = v ? 'inherit' : 'hidden';
                
                // Move invisible elements to a very negative location so they won't effect 
                // scrollable area. Ideally we could use display:none but we can't because that 
                // makes measuring bounds not work.
                ods.left = v ? self.x + 'px' : '-100000px';
                ods.top = v ? self.y + 'px' : '-100000px';
                
                if (self.inited) self.fireEvent('visible', v);
            }
        },
        
        setPointerEvents: function(v) {
            if (this.pointerEvents !== v) {
                this.pointerEvents = v;
                this.getODS().pointerEvents = v || 'auto';
                if (this.inited) this.fireEvent('pointerEvents', v);
            }
        },
        
        setCursor: function(v) {
            if (this.cursor !== v) {
                this.cursor = v;
                this.getODS().cursor = v || 'auto';
                if (this.inited) this.fireEvent('cursor', v);
            }
        },
        
        /** Updates the boundsWidth and boundsHeight attributes.
            @private
            @param {number} w - the boundsWidth to set.
            @param {number} h - the boundsHeight to set.
            @returns {undefined} */
        __updateBounds: function(w, h) {
            if (this.boundsWidth !== w) this.fireEvent('boundsWidth', this.boundsWidth = w);
            if (this.boundsHeight !== h) this.fireEvent('boundsHeight', this.boundsHeight = h);
        },
        
        // Outlines
        /** Sets outlineWidth, outlineStyle and outlineColor via a single array. If a value 
            equivalent to false is provided the outline will be suppressed.
            @param {?Array} v - An array where index 0 is outlineWidth, index 1 is outline style 
                and index 2 is outlineColor.
            @returns {undefined} */
        setOutline: function(v) {
            const [width, style, color] = v ?? [];
            this.setOutlineWidth(width);
            this.setOutlineStyle(style);
            this.setOutlineColor(color);
        },
        
        setOutlineWidth: function(v) {
            this.getODS().outlineWidth = (this.outlineWidth = v || 0) + 'px';
        },
        
        setOutlineStyle: function(v) {
            this.getODS().outlineStyle = this.outlineStyle = v || 'none';
        },
        
        setOutlineColor: function(v) {
            this.getODS().outlineColor = this.outlineColor = v || '#000';
        },
        
        // Borders
        /** Sets borderWidth, borderStyle and borderColor via a single array. If a value equivalent 
            to false is provided the border will be suppressed.
            @param {?Array} v - An array where index 0 is borderWidth, index 1 is border style and 
                index 2 is borderColor.
            @returns {undefined} */
        setBorder: function(v) {
            const [width, style, color] = v ?? [];
            this.setBorderWidth(width);
            this.setBorderStyle(style);
            this.setBorderColor(color);
        },
        
        setBorderWidth: function(v) {
            this.getODS().borderWidth = (this.borderWidth = v || 0) + 'px';
        },
        
        setBorderStyle: function(v) {
            this.getODS().borderStyle = this.borderStyle = v || 'none';
        },
        
        setBorderColor: function(v) {
            this.getODS().borderColor = this.borderColor = v || '#000';
        },
        
        // Edge treatements
        /** A convienence method to set rounded corners on an element.
            @param {number} radius - The radius of the corners.
            @returns {undefined} */
        setRoundedCorners: function(radius) {
            this.getODS().borderRadius = radius + 'px';
        },
        
        /** A convienence method to round the top left corner.
            @param {number} radius - The radius of the corner.
            @returns {undefined} */
        setRoundedTopLeftCorner: function(radius) {
            this.getODS().borderTopLeftRadius = radius + 'px';
        },
        
        /** A convienence method to round the top right corner.
            @param {number} radius - The radius of the corner.
            @returns {undefined} */
        setRoundedTopRightCorner: function(radius) {
            this.getODS().borderTopRightRadius = radius + 'px';
        },
        
        /** A convienence method to round the bottom left corner.
            @param {number} radius - The radius of the corner.
            @returns {undefined} */
        setRoundedBottomLeftCorner: function(radius) {
            this.getODS().borderBottomLeftRadius = radius + 'px';
        },
        
        /** A convienence method to round the bottom right corner.
            @param {number} radius - The radius of the corner.
            @returns {undefined} */
        setRoundedBottomRightCorner: function(radius) {
            this.getODS().borderBottomRightRadius = radius + 'px';
        },
        
        /** Sets the CSS boxShadow property.
            @param {?Array} v - An array where index 0 is the horizontal shadow offset, index 1 is 
                the vertical shadow offset, index 2 is the blur amount, and index 3 is the color.
            @returns {undefined} */
        setBoxShadow: function(v) {
            const [horizontalShadowOffset, verticalShadowOffset, blurAmt, color] = v ?? [];
            this.getODS().boxShadow = v ? (horizontalShadowOffset || 0) + 'px ' + (verticalShadowOffset || 0) + 'px ' + (blurAmt || 7) + 'px ' + (color || '#000') : 'none';
        },
        
        /** Sets the CSS liner-gradient or radial-gradient property. Setting this property will 
            take the place of any bgColor used in the view.
            @param {?Array} v - An array where:
                index 0: is the gradient type: linear or radial
                index 1: is the geometry of the gradient.
                    radial: The value "cover" / "farthest-corner" or "contain" / "closest-side"
                    linear: A number will be interpreted as the degrees or a string must be one of: 
                        top, top right, right, bottom  right, bottom, bottom left, left, top left
                index 3+: Are the color stops which must be a valid CSS color. If the first and 
                    second color stops will default to the textColor and bgColor properties of this 
                    view if not provided. Use of the rgba(0-255,0-255,0-255,0-1) syntax is a good 
                    way to designate colors since it will let you use an opacity. For a more 
                    comprehensive description of how to specify color stops 
                    see: https://developer.mozilla.org/en-US/docs/Web/CSS/linear-gradient
            @returns {undefined} */
        setGradient: function(v) {
            const self = this,
                ods = self.getODS();
            if (v) {
                // Determine type
                let type = v[0];
                if (type === 'linear' || type === 'radial') {
                    v.shift();
                } else {
                    type = 'linear';
                }
                
                // Determine geometry of the gradient
                let geometry = v[0];
                if (type === 'radial') {
                    if (geometry === undefined) {
                        geometry = 'closest-side';
                    } else {
                        v.shift();
                    }
                    
                    let shape = v[0];
                    if (shape === undefined) {
                        shape = 'circle';
                    } else {
                        switch (shape) {
                            case 'circle':
                            case 'ellipse':
                                break;
                            default:
                                console.warn('Unexpected radial gradient shape', shape);
                                shape = 'circle';
                        }
                        v.shift();
                    }
                    
                    let origin = v[0];
                    if (origin === undefined) {
                        origin = 'center';
                    } else {
                        origin = origin.replaceAll('middle', 'center');
                        v.shift();
                    }
                    
                    geometry = shape + ' ' + geometry + ' at ' + origin;
                } else {
                    if (typeof geometry === 'number') {
                        geometry = geometry + 'deg';
                        v.shift();
                    } else if (geometry) {
                        geometry = 'to ' + geometry;
                        v.shift();
                    } else {
                        geometry = '0deg';
                    }
                }
                
                // Use colors that may have already been configured if less than 2 color stops 
                // are provided
                const pushColor = color => {
                    v.push(color && color !== 'inherit' ? color : 'transparent');
                };
                if (v.length < 2) pushColor(self.textColor);
                if (v.length < 2) pushColor(self.bgColor);
                
                ods.background = type + '-gradient(' + geometry + ',' + v.join(',') + ')';
            } else {
                ods.background = 'none';
            }
            
            // Wipe the bgColor property since setting style.background replaces the bgColor.
            self.bgColor = undefined;
        },
        
        /** Sets the tooltip.
            @param {string} v
            @return {undefined} */
        setTooltip: function(v) {
            if (this.tooltip !== v) {
                this.tooltip = this.getODE().title = v;
                if (this.inited) this.fireEvent('tooltip', v);
            }
        },
        
        
        // Methods /////////////////////////////////////////////////////////////
        /** Checks that this view is visible and each view in the parent chain up to the RootView is 
            also visible. Dom elements are not explicitly checked. If you need to check dom elements 
            as well, use myt.DomElementProxy.isDomElementVisible.
            @returns {boolean} true if this view is visible, false otherwise. */
        isVisible: function() {
            return this.searchAncestorsOrSelf(v => !v.visible) == null;
        },
        
        /** Finds the youngest ancestor (or self) that is a focusTrap or focusCage.
            @param {boolean} ignoreFocusTrap - Indicates focusTraps should be ignored.
            @returns {?Object} a View with focusTrap set to true or undefined if not found. */
        getFocusTrap: function(ignoreFocusTrap) {
            return this.searchAncestorsOrSelf(v => v.focusCage || (v.focusTrap && !ignoreFocusTrap));
        },
        
        /** @overrides myt.Node
            Calls this.subviewAdded if the added subnode is a myt.View.
            @param {!Object} node
            @returns {undefined}
            
            @fires subviewAdded event with the provided Node if it's a View. 
            @fires layoutAdded event with the provided node if it's a Layout. */
        subnodeAdded: function(node) {
            if (node instanceof pkg.View) {
                this.getIDE().appendChild(node.getODE());
                this.getSubviews().push(node);
                this.fireEvent('subviewAdded', node);
                this.subviewAdded(node);
            } else if (node instanceof pkg.Layout) {
                this.getLayouts().push(node);
                this.fireEvent('layoutAdded', node);
                this.layoutAdded(node);
            }
        },
        
        /** @overrides myt.Node
            Calls this.subviewRemoved if the remove subnode is a myt.View.
            @param {!Object} node
            @returns {undefined}
            
            @fires subviewRemoved event with the provided Node if it's a View and removal succeeds. 
            @fires layoutRemoved event with the provided Node if it's a Layout and removal 
                succeeds. */
        subnodeRemoved: function(node) {
            let idx;
            if (node instanceof pkg.View) {
                idx = this.getSubviewIndex(node);
                if (idx > -1) {
                    this.fireEvent('subviewRemoved', node);
                    node.removeDomElement();
                    this.subviews.splice(idx, 1);
                    this.subviewRemoved(node);
                }
            } else if (node instanceof pkg.Layout) {
                idx = this.getLayoutIndex(node);
                if (idx > -1) {
                    this.fireEvent('layoutRemoved', node);
                    this.layouts.splice(idx, 1);
                    this.layoutRemoved(node);
                }
            }
        },
        
        // Subviews //
        /** Checks if this View has the provided View in the subviews array.
            @param {!Object} sv - The myt.View to look for.
            @returns {boolean} true if the subview is found, false otherwise. */
        hasSubview: function(sv) {
            return this.getSubviews().includes(sv);
        },
        
        /** Gets the index of the provided View in the subviews array.
            @param {!Object} sv - The myt.View to look for.
            @returns {number} the index of the subview or -1 if not found. */
        getSubviewIndex: function(sv) {
            return this.getSubviews().indexOf(sv);
        },
        
        /** Called when a View is added to this View. Do not call this method to add a View. 
            Instead call setParent.
            @param {!Object} sv - The myt.View that was added.
            @returns {undefined} */
        subviewAdded: sv => {},
        
        /** Called when a View is removed from this View. Do not call this method to remove a View. 
            Instead call setParent.
            @param {!Object} sv - The myt.View that was removed.
            @returns {undefined} */
        subviewRemoved: sv => {},
        
        /** Gets the next sibling view based on lexical ordering of dom elements.
            @returns {?Object} - The next sibling myt.View or undefined if none exists. */
        getNextSibling: function() {
            if (this.parent) return this.getODE().nextElementSibling?.model;
        },
        
        /** Gets the previous sibling view.
            @returns {?Object} - The previous sibling myt.View or undefined if none exists. */
        getPrevSibling: function() {
            if (this.parent) return this.getODE().previousElementSibling?.model;
        },
        
        // Layouts //
        /** Checks if this View has the provided Layout in the layouts array.
            @param {!Object} layout - The myt.Layout to look for.
            @returns {boolean} true if the layout is found, false otherwise. */
        hasLayout: function(layout) {
            return this.getLayouts().includes(layout);
        },
        
        /** Gets the index of the provided Layout in the layouts array.
            @param {!Object} layout - The myt.Layout to look for.
            @returns {number} the index of the layout or -1 if not found. */
        getLayoutIndex: function(layout) {
            return this.getLayouts().indexOf(layout);
        },
        
        /** Called when a Layout is added to this View. Do not call this method to add a Layout. 
            Instead call setParent.
            @param {!Object} layout - The myt.Layout that was added.
            @returns {undefined} */
        layoutAdded: layout => {},
        
        /** Called when a Layout is removed from this View. Do not call this method to remove a 
            Layout. Instead call setParent.
            @param {!Object} layout - The myt.Layout that was removed.
            @returns {undefined} */
        layoutRemoved: layout => {},
        
        // Dom-Ordering //
        /** Test if the provided view is behind this view. The view to test can be anywhere in 
            the document.
            @param {!Object} view - The myt.View to check.
            @param {boolean} [checkZIndex] - If true z-index will first be used to check if the 
                view is behind or not.
            @returns {boolean} true if the view is behind this view, false otherwise. */
        isBehind: function(view, checkZIndex) {
            return comparePosition(this, view, false, checkZIndex);
        },
        
        /** Test if the provided view is front of this view. The view to test can be anywhere in 
            the document.
            @param {!Object} view - The myt.View to check.
            @param {boolean} [checkZIndex] - If true z-index will first be used to check if the 
                view is in front or not.
            @returns {boolean} true if the view is in front of this view, false otherwise. */
        isInFrontOf: function(view, checkZIndex) {
            return comparePosition(this, view, true, checkZIndex);
        },
        
        /** Brings this view to the front.
            @returns {undefined} */
        bringToFront: function() {
            this.parent.bringSubviewToFront(this);
        },
        
        /** Sends this view to the back.
            @returns {undefined} */
        sendToBack: function() {
            this.parent.sendSubviewToBack(this);
        },
        
        /** Sends this view behind the provided sibling view.
            @param {!Object} sv
            @returns {undefined} */
        sendBehind: function(sv) {
            this.parent.sendSubviewBehind(this, sv);
        },
        
        /** Sends this view in front of the provided sibling view.
            @param {!Object} sv
            @returns {undefined} */
        sendInFrontOf: function(sv) {
            this.parent.sendSubviewInFrontOf(this, sv);
        },
        
        /** Called whenever the subviews are reordered in the DOM using one of the reordering 
            functions of myt.View.
            @param {?Object} sv The subview that was reorderd or null if no specific subview can 
                be determined.
            @returns {undefined} */
        doSubviewsReorderedInDom: sv => {/* Subclasses to implement. */},
        
        /** Sends the provided subview to the back.
            @param {!Object} sv - The subview of this view to bring to front.
            @returns {undefined} */
        bringSubviewToFront: function(sv) {
            const self = this;
            if (sv?.parent === self) {
                const innerElem = self.getIDE(),
                    svOde = sv.getODE();
                if (svOde !== innerElem.lastElementChild) {
                    retainFocusDuringDomUpdate(sv, () => {
                        innerElem.appendChild(svOde);
                        self.doSubviewsReorderedInDom(sv);
                    });
                }
            }
        },
        
        /** Sends the provided subview to the back.
            @param {?Object} sv - The sub myt.View of this myt.View to send to back.
            @returns {undefined} */
        sendSubviewToBack: function(sv) {
            const self = this;
            if (sv?.parent === self) {
                const innerElem = self.getIDE(),
                    firstElementChild = innerElem.firstElementChild,
                    svOde = sv.getODE();
                if (svOde !== firstElementChild) {
                    retainFocusDuringDomUpdate(sv, () => {
                        innerElem.insertBefore(svOde, firstElementChild);
                        self.doSubviewsReorderedInDom(sv);
                    });
                }
            }
        },
        
        /** Sends the subview behind the existing subview.
            @param {!Object} sv - The sub myt.View to send behind the existing myt.View.
            @param {?Object} existing - The sub myt.View to send the other sub myt.View behind.
            @returns {undefined} */
        sendSubviewBehind: function(sv, existing) {
            const self = this;
            if (sv?.parent === self && existing?.parent === self) {
                const svOde = sv.getODE(),
                    existingOde = existing.getODE();
                if (svOde !== existingOde.previousElementSibling) {
                    const innerElem = self.getIDE();
                    retainFocusDuringDomUpdate(sv, () => {
                        innerElem.insertBefore(svOde, existingOde);
                        self.doSubviewsReorderedInDom(sv);
                    });
                }
            }
        },
        
        /** Sends the subview in front of the existing subview.
            @param {!Object} sv - the subview to send in front of the existing view.
            @param {!Object} existing - the subview to send the other subview in front of.
            @returns {undefined} */
        sendSubviewInFrontOf: function(sv, existing) {
            const self = this;
            if (sv?.parent === self && existing?.parent === self) {
                const svOde = sv.getODE(),
                    existingOdeNextElementSibling = existing.getODE().nextElementSibling;
                if (svOde !== existingOdeNextElementSibling) {
                    const innerElem = self.getIDE();
                    retainFocusDuringDomUpdate(sv, () => {
                        // Relies on insertBefore behavior: If existingOdeNextElementSibling is 
                        // nullish, then svOde is inserted at the end of innerElem's child nodes.
                        innerElem.insertBefore(svOde, existingOdeNextElementSibling);
                        self.doSubviewsReorderedInDom(sv);
                    });
                }
            }
        },
        
        /** Sorts the subviews array according to the provided sort function. Also rearranges the 
            dom elements so that focus navigation and z-ordering get updated.
            @param {!Function} sortFunc - The sort function to sort the subviews with.
            @returns {undefined} */
        sortSubviews: function(sortFunc) {
            // Sort subviews
            const self = this,
                svs = self.getSubviews();
            
            // OPTIMIZATION: Check if the svs are already sorted. If they're not then we will
            // resort and reorder the DOM. This occurs frequently enough that it is worth doing.
            if (pkg.isNotSorted(svs, sortFunc)) {
                svs.sort(sortFunc);
                
                // Rearrange the DOM to match the new sort order.
                retainFocusDuringDomUpdate(self, () => {
                    const outerElem = self.getODE(),
                        parentElem = outerElem.parentNode;
                    // Remove this dom element from the dom
                    let nextDe;
                    if (parentElem) {
                        nextDe = outerElem.nextElementSibling;
                        parentElem.removeChild(outerElem);
                    }
                    
                    // Copy the dom elements in the correct order to a document fragment and 
                    // then add that fragment back to the dom.
                    const fragment = document.createDocumentFragment(),
                        len = svs.length;
                    for (let i = 0; len > i;) fragment.appendChild(svs[i++].getODE());
                    self.getIDE().appendChild(fragment);
                    
                    // Put this dom element back in the dom
                    parentElem?.insertBefore(outerElem, nextDe);
                    
                    self.doSubviewsReorderedInDom(null);
                });
            }
        },
        
        // Hit Testing //
        /** Checks if the provided location is inside this view or not.
            @param {number} locX - the x position to test.
            @param {number} locY - the y position to test.
            @param {?Object} [referenceFrameDomElem] - The dom element the locX and locY are 
                relative to. If not provided the page is assumed.
            @returns {boolean} True if the location is inside this view, false if not. */
        containsPoint: function(locX, locY, referenceFrameDomElem) {
            const outerElem = this.getODE();
            if (!outerElem) return false;
            const {x, y} = DomElementProxy.getRelativePosition(outerElem, referenceFrameDomElem);
            return rectContainsPoint(locX, locY, x, y, this.width, this.height);
        },
        
        /** Checks if the provided location is visible on this view and is not masked by the 
            bounding box of the view or any of its ancestor views.
            @param {number} locX
            @param {number} locY
            @returns {boolean} true if visible, false otherwise. */
        isPointVisible: function(locX, locY) {
            const {x, y} = this.getPagePosition(true);
            calculateEffectiveScale(this);
            return isPointVisible(this, locX - x, locY - y);
        },
        
        /** Tests if this View intersects with the provided sibling view. Transformations are not
            taken into account.
            @param {?Object} sibling - The sibling View to test against.
            @returns {boolean} indicating if the sibling View is indeed a sibling and that it
                intersects with this View. */
        intersectsWithSibling: function(sibling) {
            return sibling.parent === this.parent && !(
                sibling.x > this.x + this.width || 
                sibling.x + sibling.width < this.x || 
                sibling.y > this.y + this.height || 
                sibling.y + sibling.height < this.y
            );
        },
        
        getEffectiveScale: function() {
            return calculateEffectiveScale(this);
        },
        
        getEffectiveScaleX: function() {
            return calculateEffectiveScale(this).scaleX;
        },
        
        getEffectiveScaleY: function() {
            return calculateEffectiveScale(this).scaleY;
        }
    });
})(myt);

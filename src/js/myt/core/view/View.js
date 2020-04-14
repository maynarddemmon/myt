((pkg) => {
    var 
        /** Preserves focus and scroll position during dom updates. Focus can 
            get lost in webkit when an element is removed from the dom.
                param viewBeingRemoved:myt.View
                param wrapperFunc:function a function to execute that 
                    manipulates the dom in some way, typically a remove 
                    followed by an insert.
        */
        retainFocusDuringDomUpdate = (viewBeingRemoved, wrappedFunc) => {
            var restoreFocus = pkg.global.focus.focusedView, 
                elem = viewBeingRemoved.getInnerDomElement(), 
                restoreScrollTop, 
                restoreScrollLeft;
            if (restoreFocus === viewBeingRemoved || (restoreFocus && restoreFocus.isDescendantOf(viewBeingRemoved))) {
                restoreFocus._ignoreFocus = true;
            }
            
            // Also maintain scrollTop/scrollLeft since those also
            // get reset when a dom element is removed. Note: descendant
            // elements with scroll positions won't get maintained.
            restoreScrollTop = elem.scrollTop;
            restoreScrollLeft = elem.scrollLeft;
            
            wrappedFunc.call();
            
            if (restoreFocus) {
                restoreFocus._ignoreFocus = false;
                restoreFocus.focus(true);
            }
            
            // Restore scrollTop/scrollLeft
            elem.scrollTop = restoreScrollTop;
            elem.scrollLeft = restoreScrollLeft;
        },
        
        /** Implements isBehind and isInFrontOf methods. Returns a boolean
            indicating front or behind respective to the "front" param.
                param firstView:View The view to check position for
                param view:View The view to check the position of the first
                    view against.
                param front:boolean indicates if this is the isInFrontOf 
                    test or not.
                param checkZIndex:boolean If true z-index will 
                    first be used to check if the view is in front or not.
        */
        comparePosition = (firstView, secondView, front, checkZIndex) => {
            if (secondView && typeof secondView === 'object') {
                if (checkZIndex) {
                    var commonAncestor = firstView.getLeastCommonAncestor(secondView);
                    if (commonAncestor) {
                        var commonAncestorElem = commonAncestor.getInnerDomElement(),
                            DEP = pkg.DomElementProxy,
                            zIdx = DEP.getZIndexRelativeToAncestor(firstView.getOuterDomElement(), commonAncestorElem),
                            otherZIdx = DEP.getZIndexRelativeToAncestor(secondView.getOuterDomElement(), commonAncestorElem);
                        
                        // Reverse comparison order
                        if (front) {
                            zIdx *= -1;
                            otherZIdx *= -1;
                        }
                        
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
                var rel = firstView.getOuterDomElement().compareDocumentPosition(secondView.getOuterDomElement());
                return front ? rel === 2 || rel === 10 : rel === 4 || rel === 20;
            } else {
                return false;
            }
        },
        
        /** Calculates the effective scale for the provided view and all its
            ancestors. Returns the effective scale for the provided view. */
        calculateEffectiveScale = (view) => {
            var ancestorsAndSelf = view.getAncestors(), 
                i = ancestorsAndSelf.length, 
                ancestor,
                effectiveScaleX = 1,
                effectiveScaleY = 1;
            while (i) {
                ancestor = ancestorsAndSelf[--i];
                effectiveScaleX *= ancestor.scaleX || 1;
                effectiveScaleY *= ancestor.scaleY || 1;
                ancestor.__effectiveScaleX = effectiveScaleX;
                ancestor.__effectiveScaleY = effectiveScaleY;
            }
            return {scaleX:effectiveScaleX, scaleY:effectiveScaleY};
        },
        
        isPointVisible = (view, x, y) => {
            var ode = view.getOuterDomElement(),
                parent,
                pOde;
            if (pkg.Geometry.rectContainsPoint(x, y, 0, 0, ode.offsetWidth * view.__effectiveScaleX, ode.offsetHeight * view.__effectiveScaleY)) {
                if (parent = view.parent) {
                    pOde = parent.getOuterDomElement();
                    return isPointVisible(
                        parent, 
                        x + (ode.offsetLeft - pOde.scrollLeft) * parent.__effectiveScaleX, 
                        y + (ode.offsetTop - pOde.scrollTop) * parent.__effectiveScaleY
                    );
                }
                return true;
            }
            return false;
        },
        
        teardownAlignConstraint = (view) => {
            switch (view.align) {
                case 'center': view.releaseConstraint('__doAlignCenter'); break;
                case 'right': view.releaseConstraint('__doAlignRight'); break;
                case 'left':
                default: // Do nothing
            }
        },
        
        setupAlignConstraint = (view) => {
            var parent = view.parent;
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
        
        teardownValignConstraint = (view) => {
            switch (view.valign) {
                case 'middle': view.releaseConstraint('__doValignMiddle'); break;
                case 'bottom': view.releaseConstraint('__doValignBottom'); break;
                case 'top':
                default: // Do nothing
            }
        },
        
        setupValignConstraint = (view) => {
            var parent = view.parent;
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
        },
        
        /** A convienence method to set a single rounded corner on an element.
                radius:number the radius of the corner.
                corner:string One of 'TopLeft', 'TopRight', 'BottomLeft' or
                    'BottomRight'.
        */
        setRoundedCorner = (view, radius, corner) => {
            view.getOuterDomStyle()['border' + corner + 'Radius'] = radius + 'px';
        };
    
    /** A Node that can be viewed. Instances of view are typically backed by
        an absolutely positioned div element.
        
        Events:
            domClass:string Fired when the domClass setter is called.
            domId:string Fired when the domId setter is called.
            align:string
            alignOffset:number
            valign:string
            valignOffset:number
            x:number
            y:number
            width:number (supressable)
            height:number (supressable)
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
            tagName:string Determines the name of the DOM element to create for
                this instance. This is not a normal attribute. It is only used
                during initialization and it will be deleted from the attrs object
                upon use. If no tagName is provided "div" will be used.
            focusTrap:boolean Determines if focus traversal can move above this view
                or not. The default is undefined which is equivalent to false. Can 
                be ignored using a key modifier. The key modifier is 
                typically 'option'.
            focusCage:boolean Determines if focus traversal can move above this view
                or not. The default is undefined which is equivalent to false. This
                is the same as focusTrap except it can't be ignored using a 
                key modifier.
            maskFocus:boolean Prevents focus from traversing into this view or any
                of its subviews. The default is undefined which is equivalent 
                to false.
            ignoreLayout:boolean Determines if this view should be included in 
                layouts or not. Default is undefined which is equivalent to false.
            layoutHint:* A value that indicates this view is treated as "special" 
                by the layout. The interpretation of this value is up to the 
                layout managing the view.
            align:string Aligns the view horizontally within its parent. 
                Supported values are: 'left', 'center', 'right' and ''. 
                The default is undefined which is equivalent to ''.
            alignOffset:number A pixel offset to use when aligning a view.
            valign:string Aligns the view vertically within its parent. 
                Supported values are: 'top', 'middle', 'bottom' and ''. 
                The default is undefined which is equivalent to ''.
            valignOffset:number A pixel offset to use when valigning a view.
            x:number The x-position of this view in pixels. Defaults to 0.
            y:number The y-position of this view in pixels. Defaults to 0.
            width:number The width of this view in pixels. Defaults to 0.
            height:number the height of this view in pixels. Defaults to 0.
            boundsWidth:number (read only) The actual bounds of the view in the
                x-dimension. This value is in pixels relative to the RootView and
                thus compensates for rotation and scaling.
            boundsHeight:number (read only) The actual bounds of the view in the
                y-dimension. This value is in pixels relative to the RootView and
                thus compensates for rotation and scaling.
            textColor:string The color used for text. Will be inherited by 
                descendant views if they don't themselves set textColor or if 
                they set textColor to 'inherit'. Defaults to undefined which is
                equivalent to 'inherit'.
            bgColor:string The background color of this view. Use a value of 
                'transparent' to make this view transparent. Defaults 
                to 'transparent'.
            opacity:number The opacity of this view. The value should be a number 
                between 0 and 1. Defaults to 1.
            overflow:string Determines how descendant content overflows the bounds.
                Allowed values: 'visible', 'hidden', 'scroll', 'auto', 'autoy',
                'autox' and 'inherit'. Defaults to undefined which is equivalent 
                to 'visible'.
            visible:boolean Makes this view visible or not. The default value is 
                true which means visbility is inherited from the parent view.
            cursor:string Determines what cursor to show when moused over the view.
                Allowed values: 'auto', 'move', 'no-drop', 'col-resize', 
                'all-scroll', 'pointer', 'not-allowed', 'row-resize', 'crosshair', 
                'progress', 'e-resize', 'ne-resize', 'default', 'text', 'n-resize', 
                'nw-resize', 'help', 'vertical-text', 's-resize', 'se-resize', 
                'inherit', 'wait', 'w-resize', 'sw-resize'. Defaults to undefined 
                which is equivalent to 'auto'.
            pointerEvents:string Determines if this view responds to pointer events
                or not. Supported values: 'none', 'auto' and 'inherit'. Defaults 
                to undefined which is equivalent to 'auto'.
            outlineWidth:number The width of the CSS outline. If a value equivalent
                to false is provided 0 will be used.
            outlineStyle:string The CSS outline style. If null or undefined is 
                provided 'none' will be used. Supported values: 'none', 'dotted', 
                'dashed', 'solid', 'double', 'groove', 'ridge', 'inset', 
                'outset', 'inherit'.
            outlineColor:string Sets the color of the CSS outline. If null or 
                undefined is provided '#000000' will be used.
            borderWidth:number The width of the CSS border. If a value equivalent 
                to false is provided 0 will be used.
            borderStyle:string The CSS border style. If null or undefined is 
                provided 'none' will be used. Supported values: 'none', 'dotted', 
                'dashed', 'solid', 'double', 'groove', 'ridge', 'inset', 
                'outset', 'inherit'.
            borderColor:string Sets the color of the CSS border. If null or 
                undefined is provided '#000000' will be used.
            tooltip:string Sets a tooltip for this view. The basic implementation
                uses domElement.title. For a richer tooltip display use the
                myt.TooltipMixin.
        
        Private Attributes:
            subviews:array The array of child myt.Views for this view. Should 
                be accessed through the getSubviews method.
            layouts:array The array of child myt.Layouts for this view. Should
                be accessed through the getLayouts method.
    */
    pkg.View = new JS.Class('View', pkg.Node, {
        include: [
            pkg.DomElementProxy, 
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
            var self = this;
            
            self.x = self.y = self.width = self.height = 0;
            self.opacity = 1;
            self.visible = true;
            
            self.tagName = attrs.tagName;
            if (self.tagName) delete attrs.tagName;
            self.setDomElement(self.createOurDomElement(parent));
            
            // Necessary since x and y of 0 won't update deStyle so this gets
            // things initialized correctly. Without this RootViews will have
            // an incorrect initial position for x or y of 0.
            var s = self.getOuterDomStyle();
            s.left = s.top = '0px';
            
            self.callSuper(parent, attrs);
            
            // Set default bgcolor afterwards if still undefined. This allows 
            // BaseInputText to override the default for input:text via attrs.
            if (self.bgColor === undefined) self.bgColor = 'transparent';
        },
        
        /** Creates the dom element we will be a proxy for. Called during View
            initialization. Gives subclasses a change to change how the view is
            backed. This implementation also looks for a this.tagName property
            which it will use as the name for the dom element that gets created.
            If no this.tagName property is found "div" will be used.
            @param parent:dom element The dom element that will be the parent
                of the newly created dom element.
            @returns a dom element */
        createOurDomElement: function(parent) {
            var elem = document.createElement(this.tagName || 'div');
            elem.style.position = 'absolute';
            
            // Make dom elements easier to location via selectors
            var klass = this.klass;
            elem.className = klass.__cssClassName || (klass.__cssClassName = 'myt-' + klass.__displayName.split('.').join('-'));
            
            return elem;
        },
        
        /** @overrides myt.Node 
            Subclasses should call super if they don't call __updateBounds. The call
            to super should probably occur at the end of the overridden method. */
        doAfterAdoption: function() {
            // Must be done after domElement is inserted so that calls to
            // getBoundingClientRect will work.
            this.__updateBounds(this.width, this.height);
        },
        
        /** @overrides myt.Node */
        destroyAfterOrphaning: function() {
            var self = this;
            
            self.callSuper();
            
            self.detachFromAllDomSources();
            self.detachAllDomObservers();
            self.disposeOfDomElement();
        },
        
        
        // Accessors ///////////////////////////////////////////////////////////
        /** @overrides myt.Node */
        setParent: function(parent) {
            var self = this;
            
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
        
        /** Does lazy instantiation of the subviews array. */
        getSubviews: function() {
            return this.subviews || (this.subviews = []);
        },
        
        /** Gets the views that are our siblings.
            @returns array of myt.View or undefined if this view is orphaned. */
        getSiblingViews: function() {
            if (this.parent) {
                // Get a copy of the subviews since we will modify it and do not
                // want to modify the original array.
                var svs = this.parent.getSubviews().concat(),
                    i = svs.length;
                
                // Remove ourselves from the subviews since we only want siblings.
                while (i) {
                    if (svs[--i] === this) {
                        svs.splice(i, 1);
                        break;
                    }
                }
                
                return svs;
            }
        },
        
        // Focus Attributes //
        setFocusTrap: function(v) {this.focusTrap = v;},
        setFocusCage: function(v) {this.focusCage = v;},
        setMaskFocus: function(v) {this.maskFocus = v;},
        
        // Layout Attributes //
        setLayoutHint: function(v) {this.layoutHint = v;},
        
        /** Does lazy instantiation of the layouts array. */
        getLayouts: function() {
            return this.layouts || (this.layouts = []);
        },
        
        setIgnoreLayout: function(v) {
            var self = this;
            
            if (self.ignoreLayout !== v) {
                // Add or remove ourselves from any layouts on our parent.
                var ready = self.inited && self.parent,
                    layouts,
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
        
        /** @private */
        __doAlignCenter: function(event) {
            this.setX(Math.round((this.parent.width - this.width) / 2) + (this.alignOffset || 0));
        },
        
        /** @private */
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
        
        /** @private */
        __doValignMiddle: function(event) {
            this.setY(Math.round((this.parent.height - this.height) / 2) + (this.valignOffset || 0));
        },
        
        /** @private */
        __doValignBottom: function(event) {
            this.setY(this.parent.height - this.height - (this.valignOffset || 0));
        },
        
        // Visual Attributes //
        setX: function(v) {
            if (this.x !== v) {
                this.x = v;
                if (this.visible) this.getOuterDomStyle().left = v + 'px';
                if (this.inited) this.fireEvent('x', v);
            }
        },
        
        setY: function(v) {
            if (this.y !== v) {
                this.y = v;
                if (this.visible) this.getOuterDomStyle().top = v + 'px';
                if (this.inited) this.fireEvent('y', v);
            }
        },
        
        setWidth: function(v, supressEvent) {
            // Dom elements don't support negative width
            if (0 > v) v = 0;
            
            if (this.width !== v) {
                this.width = v;
                this.getOuterDomStyle().width = v + 'px';
                if (this.inited) {
                    this.__updateBounds(v, this.height);
                    if (!supressEvent) this.fireEvent('width', v);
                }
            }
        },
        
        setHeight: function(v, supressEvent) {
            // Dom elements don't support negative height
            if (0 > v) v = 0;
            
            if (this.height !== v) {
                this.height = v;
                this.getOuterDomStyle().height = v + 'px';
                if (this.inited) {
                    this.__updateBounds(this.width, v);
                    if (!supressEvent) this.fireEvent('height', v);
                }
            }
        },
        
        setTextColor: function(v) {
            if (this.textColor !== v) {
                this.textColor = v;
                this.getOuterDomStyle().color = v || 'inherit';
                if (this.inited) this.fireEvent('textColor', v);
            }
        },
        
        setBgColor: function(v) {
            if (this.bgColor !== v) {
                this.getOuterDomStyle().backgroundColor = this.bgColor = v;
                if (this.inited) this.fireEvent('bgColor', v);
            }
        },
        
        setOpacity: function(v) {
            if (this.opacity !== v) {
                this.getOuterDomStyle().opacity = this.opacity = v;
                if (this.inited) this.fireEvent('opacity', v);
            }
        },
        
        setOverflow: function(v) {
            var existing = this.overflow;
            if (existing !== v) {
                this.overflow = v;
                
                var s = this.getInnerDomStyle();
                if (v === 'autox') {
                    s.overflowX = 'auto';
                    s.overflowY = 'hidden';
                } else if (v === 'autoy') {
                    s.overflowY = 'auto';
                    s.overflowX = 'hidden';
                } else {
                    if (existing === 'autox' || existing === 'autoy') s.overflowX = s.overflowY = null;
                    s.overflow = v || 'visible';
                }
                
                if (this.inited) this.fireEvent('overflow', v);
            }
        },
        
        setVisible: function(v) {
            var self = this;
            if (self.visible !== v) {
                self.visible = v;
                
                var s = self.getOuterDomStyle();
                s.visibility = v ? 'inherit' : 'hidden';
                
                // Move invisible elements to a very negative location so they won't
                // effect scrollable area. Ideally we could use display:none but we
                // can't because that makes measuring bounds not work.
                s.left = v ? self.x + 'px' : '-100000px';
                s.top = v ? self.y + 'px' : '-100000px';
                
                if (self.inited) self.fireEvent('visible', v);
            }
        },
        
        setPointerEvents: function(v) {
            if (this.pointerEvents !== v) {
                this.pointerEvents = v;
                this.getOuterDomStyle().pointerEvents = v || 'auto';
                if (this.inited) this.fireEvent('pointerEvents', v);
            }
        },
        
        setCursor: function(v) {
            if (this.cursor !== v) {
                this.cursor = v;
                this.getOuterDomStyle().cursor = v || 'auto';
                if (this.inited) this.fireEvent('cursor', v);
            }
        },
        
        /** Updates the boundsWidth and boundsHeight attributes.
            @private
            @param w:number the boundsWidth to set.
            @param h:number the boundsHeight to set.
            @returns void */
        __updateBounds: function(w, h) {
            if (this.boundsWidth !== w) {
                this.boundsWidth = w;
                this.fireEvent('boundsWidth', w);
            }
            
            if (this.boundsHeight !== h) {
                this.boundsHeight = h;
                this.fireEvent('boundsHeight', h);
            }
        },
        
        // Outlines
        /** Sets outlineWidth, outlineStyle and outlineColor via a single 
            array. If a value equivalent to false is provided the outline 
            will be supressed.
            @param v:array where index 0 is outlineWidth, index 1 is outline 
                style and index 2 is outlineColor.
            @returns void */
        setOutline: function(v) {
            v = v || [];
            this.setOutlineWidth(v[0]);
            this.setOutlineStyle(v[1]);
            this.setOutlineColor(v[2]);
        },
        
        setOutlineWidth: function(v) {
            this.outlineWidth = v || 0;
            this.getOuterDomStyle().outlineWidth = this.outlineWidth + 'px';
        },
        
        setOutlineStyle: function(v) {
            this.getOuterDomStyle().outlineStyle = this.outlineStyle = v || 'none';
        },
        
        setOutlineColor: function(v) {
            this.getOuterDomStyle().outlineColor = this.outlineColor = v || '#000000';
        },
        
        // Borders
        /** Sets borderWidth, borderStyle and borderColor via a single 
            array. If a value equivalent to false is provided the border 
            will be supressed.
            @param v:array where index 0 is borderWidth, index 1 is border 
                style and index 2 is borderColor.
            @returns void */
        setBorder: function(v) {
            v = v || [];
            this.setBorderWidth(v[0]);
            this.setBorderStyle(v[1]);
            this.setBorderColor(v[2]);
        },
        
        setBorderWidth: function(v) {
            this.borderWidth = v || 0;
            this.getOuterDomStyle().borderWidth = this.borderWidth + 'px';
        },
        
        setBorderStyle: function(v) {
            this.getOuterDomStyle().borderStyle = this.borderStyle = v || 'none';
        },
        
        setBorderColor: function(v) {
            this.getOuterDomStyle().borderColor = this.borderColor = v || '#000000';
        },
        
        // Edge treatements
        /** A convienence method to set rounded corners on an element.
            @param radius:number the radius of the corners.
            @returns void */
        setRoundedCorners: function(radius) {
            this.getOuterDomStyle().borderRadius = radius + 'px';
        },
        
        /** A convienence method to round the top left corner.
            @param radius:number the radius of the corner.
            @returns void */
        setRoundedTopLeftCorner: function(radius) {
            setRoundedCorner(this, radius, 'TopLeft');
        },
        
        /** A convienence method to round the top right corner.
            @param radius:number the radius of the corner.
            @returns void */
        setRoundedTopRightCorner: function(radius) {
            setRoundedCorner(this, radius, 'TopRight');
        },
        
        /** A convienence method to round the bottom left corner.
            @param radius:number the radius of the corner.
            @returns void */
        setRoundedBottomLeftCorner: function(radius) {
            setRoundedCorner(this, radius, 'BottomLeft');
        },
        
        /** A convienence method to round the bottom right corner.
            @param radius:number the radius of the corner.
            @returns void */
        setRoundedBottomRightCorner: function(radius) {
            setRoundedCorner(this, radius, 'BottomRight');
        },
        
        /** Sets the CSS boxShadow property.
            @param v:array where index 0 is the horizontal shadow offset,
                index 1 is the vertical shadow offset, index 2 is the blur amount,
                and index 3 is the color.
            @returns void */
        setBoxShadow: function(v) {
            if (v) {
                var hShadow = v[0] || 0,
                    vShadow = v[1] || 0,
                    blur = v[2] || 7,
                    color = v[3] || '#000000';
                v = hShadow + 'px ' + vShadow + 'px ' + blur + 'px ' + color;
            } else {
                v = 'none';
            }
            this.getOuterDomStyle().boxShadow = v;
        },
        
        /** Sets the CSS liner-gradient or radial-gradient property. Setting this
            property will take the place of any bgColor used in the view.
            @param v:array where:
                index 0: is the gradient type: linear or radial
                index 1: is the geometry of the gradient.
                    radial: The value "cover" / "farthest-corner" or 
                        "contain" / "closest-side"
                    linear: A number will be interpreted as the degrees or a
                        string must be one of: top, top right, right, bottom right,
                            bottom, bottom left, left, top left
                index 3+: Are the color stops which must be a valid CSS color. If
                    the first and second color stops will default to the textColor
                    and bgColor properties of this view if not provided. Use of the
                    rgba(0-255,0-255,0-255,0-1) syntax is a good way to designate 
                    colors since it will let you use an opacity. For a more 
                    comprehensive description of how to specify color stops see: 
                    https://developer.mozilla.org/en-US/docs/Web/CSS/linear-gradient
            @returns void */
        setGradient: function(v) {
            var self = this,
                ods = self.getOuterDomStyle();
            if (v) {
                // Determine type
                var type = v[0];
                if (type === 'linear' || type === 'radial') {
                    v.shift();
                } else {
                    type = 'linear';
                }
                
                // Determine geometry of the gradient
                var geometry = v[0];
                if (type === 'radial') {
                    if (geometry !== undefined) {
                        if (geometry === 'cover' || geometry === 'farthest-corner') {
                            geometry = 'farthest-corner';
                        } else {
                            geometry = 'closest-side';
                        }
                        v.shift();
                    } else {
                        geometry = 'closest-side';
                    }
                    geometry = 'circle ' + geometry;
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
                
                // Use colors that may have already been configured if less
                // than 2 color stops are provided
                var pushColor = (color) => {
                    v.push(color && color !== 'inherit' ? color : 'transparent');
                };
                if (v.length < 2) pushColor(self.textColor);
                if (v.length < 2) pushColor(self.bgColor);
                
                ods.background = type + '-gradient(' + geometry + ',' + v.join(',') + ')';
            } else {
                ods.background = 'none';
            }
            
            // Wipe the bgColor property since setting style.background replaces 
            // the bgColor.
            self.bgColor = undefined;
        },
        
        /** Sets the tooltip.
            @param v:string
            @return void */
        setTooltip: function(v) {
            if (this.tooltip !== v) {
                this.tooltip = this.getOuterDomElement().title = v;
                if (this.inited) this.fireEvent('tooltip', v);
            }
        },
        
        
        // Methods /////////////////////////////////////////////////////////////////
        /** Checks if this view is visible and each view in the parent chain to
            the RootView is also visible. Dom elements are not explicitly
            checked. If you need to check that use myt.DomElementProxy.isDomElementVisible.
            @returns true if this view is visible, false otherwise. */
        isVisible: function() {
            return this.searchAncestorsOrSelf((v) => !v.visible) === null;
        },
        
        /** Finds the youngest ancestor (or self) that is a focusTrap or focusCage.
            @param ignoreFocusTrap:boolean indicates focusTraps should be
                ignored.
            @returns a View with focusTrap set to true or null if not found. */
        getFocusTrap: function(ignoreFocusTrap) {
            return this.searchAncestorsOrSelf((v) => v.focusCage || (v.focusTrap && !ignoreFocusTrap));
        },
        
        /** @overrides myt.Node
            Calls this.subviewAdded if the added subnode is a myt.View. 
            @fires subviewAdded event with the provided Node if it's a View. 
            @fires layoutAdded event with the provided node if it's a Layout. */
        subnodeAdded: function(node) {
            if (node instanceof pkg.View) {
                this.getInnerDomElement().appendChild(node.getOuterDomElement());
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
            @fires subviewRemoved event with the provided Node if it's a View
                and removal succeeds. 
            @fires layoutRemoved event with the provided Node if it's a Layout
                and removal succeeds. */
        subnodeRemoved: function(node) {
            var idx;
            if (node instanceof pkg.View) {
                idx = this.getSubviewIndex(node);
                if (idx !== -1) {
                    this.fireEvent('subviewRemoved', node);
                    node.removeDomElement();
                    this.subviews.splice(idx, 1);
                    this.subviewRemoved(node);
                }
            } else if (node instanceof pkg.Layout) {
                idx = this.getLayoutIndex(node);
                if (idx !== -1) {
                    this.fireEvent('layoutRemoved', node);
                    this.layouts.splice(idx, 1);
                    this.layoutRemoved(node);
                }
            }
        },
        
        // Subviews //
        /** Checks if this View has the provided View in the subviews array.
            @param sv:View the view to look for.
            @returns true if the subview is found, false otherwise. */
        hasSubview: function(sv) {
            return this.getSubviewIndex(sv) !== -1;
        },
        
        /** Gets the index of the provided View in the subviews array.
            @param sv:View the view to look for.
            @returns the index of the subview or -1 if not found. */
        getSubviewIndex: function(sv) {
            return this.getSubviews().indexOf(sv);
        },
        
        /** Called when a View is added to this View. Do not call this method to 
            add a View. Instead call addSubnode or setParent.
            @param sv:View the view that was added.
            @returns void */
        subviewAdded: (sv) => {},
        
        /** Called when a View is removed from this View. Do not call this method 
            to remove a View. Instead call removeSubnode or setParent.
            @param sv:View the view that was removed.
            @returns void */
        subviewRemoved: (sv) => {},
        
        /** Gets the next sibling view based on lexical ordering of dom elements.
            @returns myt.View: The next sibling view or null if none exists. */
        getNextSibling: function() {
            if (this.parent) {
                var nextDomElement = this.getOuterDomElement().nextElementSibling;
                if (nextDomElement) return nextDomElement.model;
            }
            return null;
        },
        
        /** Gets the previous sibling view.
            @returns myt.View: The previous sibling view or null if none exists. */
        getPrevSibling: function() {
            if (this.parent) {
                var prevDomElement = this.getOuterDomElement().previousElementSibling;
                if (prevDomElement) return prevDomElement.model;
            }
            return null;
        },
        
        // Layouts //
        /** Checks if this View has the provided Layout in the layouts array.
            @param layout:Layout the layout to look for.
            @returns true if the layout is found, false otherwise. */
        hasLayout: function(layout) {
            return this.getLayoutIndex(layout) !== -1;
        },
        
        /** Gets the index of the provided Layout in the layouts array.
            @param layout:Layout the layout to look for.
            @returns the index of the layout or -1 if not found. */
        getLayoutIndex: function(layout) {
            return this.getLayouts().indexOf(layout);
        },
        
        /** Called when a Layout is added to this View. Do not call this method to 
            add a Layout. Instead call addSubnode or setParent.
            @param layout:Layout the layout that was added.
            @returns void */
        layoutAdded: (layout) => {},
        
        /** Called when a Layout is removed from this View. Do not call this 
            method to remove a Layout. Instead call removeSubnode or setParent.
            @param layout:Layout the layout that was removed.
            @returns void */
        layoutRemoved: (layout) => {},
        
        // Dom-Ordering //
        /** Test if the provided view is behind this view. The view to test can
            be anywhere in the document.
            @param view:myt.View the view to check.
            @param checkZIndex:boolean (optional) If true z-index will first be
                used to check if the view is behind or not.
            @returns boolean: true if the view is behind this view, 
                false otherwise. */
        isBehind: function(view, checkZIndex) {
            return comparePosition(this, view, false, checkZIndex);
        },
        
        /** Test if the provided view is front of this view. The view to test can
            be anywhere in the document.
            @param view:myt.View the view to check.
            @param checkZIndex:boolean (optional) If true z-index will first be
                used to check if the view is in front or not.
            @returns boolean: true if the view is in front of this view, 
                false otherwise. */
        isInFrontOf: function(view, checkZIndex) {
            return comparePosition(this, view, true, checkZIndex);
        },
        
        /** Brings this view to the front. */
        bringToFront: function() {
            this.parent.bringSubviewToFront(this);
        },
        
        /** Sends this view to the back. */
        sendToBack: function() {
            this.parent.sendSubviewToBack(this);
        },
        
        /** Sends this view behind the provided sibling view. */
        sendBehind: function(sv) {
            this.parent.sendSubviewBehind(this, sv);
        },
        
        /** Sends this view in front of the provided sibling view. */
        sendInFrontOf: function(sv) {
            this.parent.sendSubviewInFrontOf(this, sv);
        },
        
        /** Sends the provided subview to the back.
            @param sv:View the subview of this view to bring to front.
            @returns void */
        bringSubviewToFront: function(sv) {
            if (sv && sv.parent === this) {
                var innerElem = this.getInnerDomElement();
                if (sv.getOuterDomElement() !== innerElem.lastChild) {
                    retainFocusDuringDomUpdate(sv, () => {
                        innerElem.appendChild(sv.getOuterDomElement());
                    });
                }
            }
        },
        
        /** Sends the provided subview to the back.
            @param sv:View the subview of this view to send to back.
            @returns void */
        sendSubviewToBack: function(sv) {
            if (sv && sv.parent === this) {
                var innerElem = this.getInnerDomElement();
                if (sv.getOuterDomElement() !== innerElem.firstChild) {
                    retainFocusDuringDomUpdate(sv, () => {
                        innerElem.insertBefore(sv.getOuterDomElement(), innerElem.firstChild);
                    });
                }
            }
        },
        
        /** Sends the subview behind the existing subview.
            @param sv:View the subview to send behind the existing view.
            @param existing:View the subview to send the other subview behind.
            @returns void */
        sendSubviewBehind: function(sv, existing) {
            if (sv && existing && sv.parent === this && existing.parent === this) {
                var innerElem = this.getInnerDomElement();
                retainFocusDuringDomUpdate(sv, () => {
                    innerElem.insertBefore(sv.getOuterDomElement(), existing.getOuterDomElement());
                });
            }
        },
        
        /** Sends the subview in front of the existing subview.
            @param sv:View the subview to send in front of the existing view.
            @param existing:View the subview to send the other subview in front of.
            @returns void */
        sendSubviewInFrontOf: function(sv, existing) {
            if (sv && existing && sv.parent === this && existing.parent === this) {
                this.sendSubviewBehind(sv, existing);
                this.sendSubviewBehind(existing, sv);
            }
        },
        
        /** Sorts the subviews array according to the provided sort function.
            Also rearranges the dom elements so that focus navigation and z
            ordering get updated.
            @param sortFunc:function the sort function to sort the subviews with.
            @returns void */
        sortSubviews: function(sortFunc) {
            // Sort subviews
            var self = this,
                svs = self.getSubviews();
            svs.sort(sortFunc);
            
            // Rearrange dom to match new sort order.
            retainFocusDuringDomUpdate(self, () => {
                var len = svs.length,
                    i = 0,
                    outerElem = self.getOuterDomElement(),
                    innerElem = self.getInnerDomElement(),
                    nextDe = outerElem.nextSibling,
                    parentElem = outerElem.parentNode,
                    fragment;
                // Remove this dom element from the dom
                if (parentElem) parentElem.removeChild(outerElem);
                
                // Copy the dom elements in the correct order to a document
                // fragment and then add that fragment back to the dom.
                fragment = document.createDocumentFragment();
                for (; len > i;) fragment.appendChild(svs[i++].getOuterDomElement());
                innerElem.appendChild(fragment);
                
                // Put this dom element back in the dom
                if (parentElem) parentElem.insertBefore(outerElem, nextDe);
            });
        },
        
        // Hit Testing //
        /** Checks if the provided location is inside this view or not.
            @param locX:number the x position to test.
            @param locY:number the y position to test.
            @param referenceFrameDomElem:dom_element (optional) The dom element
                the locX and locY are relative to. If not provided the page is
                assumed.
            @returns boolean True if the location is inside this view, false 
                if not. */
        containsPoint: function(locX, locY, referenceFrameDomElem) {
            var outerElem = this.getOuterDomElement();
            if (!outerElem) return false;
            
            var pos = pkg.DomElementProxy.getPagePosition(outerElem, referenceFrameDomElem);
            return pkg.Geometry.rectContainsPoint(locX, locY, pos.x, pos.y, this.width, this.height);
        },
        
        /** Checks if the provided location is visible on this view and is not
            masked by the bounding box of the view or any of its ancestor views.
            @returns boolean: true if visible, false otherwise. */
        isPointVisible: function(locX, locY) {
            var pos = this.getTruePagePosition();
            calculateEffectiveScale(this);
            return isPointVisible(this, locX - pos.x, locY - pos.y);
        },
        
        getEffectiveScale: function() {
            return calculateEffectiveScale(this);
        },
        
        getEffectiveScaleX: function() {
            return calculateEffectiveScale(this).scaleX;
        },
        
        getEffectiveScaleY: function() {
            return calculateEffectiveScale(this).scaleY;
        },
        
        /** Used by myt.Animator to determine if an attribute is a color 
            attribute or not. */
        isColorAttr: (attrName) => attrName === 'bgColor' || attrName === 'textColor'
    });
})(myt);

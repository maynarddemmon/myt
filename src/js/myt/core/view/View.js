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
            Allowed values: 'visible', 'hidden', 'scroll', 'auto', 'inherit'.
            Defaults to undefined which is equivalent to 'visible'.
        visible:boolean Makes this view visible or not. The default value is 
            true which means visbility is inherited from the parent view.
        cursor:string Determines what cursor to show when moused over the view.
            Allowed values: 'auto', 'move', 'no-drop', 'col-resize', 
            'all-scroll', 'pointer', 'not-allowed', 'row-resize', 'crosshair', 
            'progress', 'e-resize', 'ne-resize', 'default', 'text', 'n-resize', 
            'nw-resize', 'help', 'vertical-text', 's-resize', 'se-resize', 
            'inherit', 'wait', 'w-resize', 'sw-resize'. Defaults to undefined 
            which is equivalent to 'auto'.
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
    
    Private Attributes:
        subviews:array The array of child myt.Views for this view. Should 
            be accessed through the getSubviews method.
        layouts:array The array of child myt.Layouts for this view. Should
            be accessed through the getLayouts method.
*/
myt.View = new JS.Class('View', myt.Node, {
    include: [
        myt.DomElementProxy, 
        myt.DomObservable, 
        myt.DomObserver, 
        myt.ScrollObservable, 
        myt.FocusObservable, 
        myt.KeyObservable, 
        myt.MouseObservable
    ],
    
    
    // Class Methods and Attributes ////////////////////////////////////////////
    extend: {
        /** Preserves focus and scroll position during dom updates. Focus can 
            get lost in webkit when an element is removed from the dom.
            viewBeingRemoved:myt.View
            wrapperFunc:function a function to execute that manipulates the
                dom in some way, typically a remove followed by an insert.
            @returns void */
        retainFocusDuringDomUpdate: function(viewBeingRemoved, wrappedFunc) {
            // DUPLICATION: Nearly identical code exists in 
            // myt.VariableLayout.update
            var restoreFocus = myt.global.focus.focusedView, 
                elem = viewBeingRemoved.domElement, restoreScrollTop, restoreScrollLeft;
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
        }
    },
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides myt.Node */
    initNode: function(parent, attrs) {
        this.x = this.y = this.width = this.height = 0;
        this.opacity = 1;
        this.visible = true;
        
        this.setDomElement(this.createOurDomElement(parent));
        
        // Necessary since x and y of 0 won't update deStyle so this gets
        // things initialized correctly. Without this RootViews will have
        // an incorrect initial position for x or y of 0.
        this.deStyle.left = this.deStyle.top = '0px';
        
        this.callSuper(parent, attrs);
        
        // Set default bgcolor afterwards if still undefined. This allows 
        // BaseInputText to override the default for input:text via attrs.
        if (this.bgColor === undefined) this.bgColor = 'transparent';
    },
    
    /** Creates the dom element we will be a proxy for. Called during View
        initialization. Gives subclasses a change to change how the view is
        backed.
        @param parent:dom element The dom element that will be the parent
            of the newly created dom element.
        @returns a dom element */
    createOurDomElement: function(parent) {
        var elem = document.createElement('div');
        elem.style.position = 'absolute';
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
        this.callSuper();
        
        this.detachFromAllDomSources();
        this.detachAllDomObservers();
        this.disposeOfDomElement();
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    /** @overrides myt.Node */
    setParent: function(parent) {
        if (this.parent !== parent) {
            if (this.inited) {
                this.__teardownAlignConstraint();
                this.__teardownValignConstraint();
            }
            this.callSuper(parent);
            this.__setupAlignConstraint();
            this.__setupValignConstraint();
        }
    },
    
    /** Does lazy instantiation of the subviews array. */
    getSubviews: function() {
        return this.subviews || (this.subviews = []);
    },
    
    /** Gets the views that are our siblings.
        @returns array of myt.View or null if this view is orphaned. */
    getSiblingViews: function() {
        if (!this.parent) return null;
        
        // Get a copy of the subviews since we will filter it.
        var svs = this.parent.getSubviews().concat();
        
        // Filter out ourself
        myt.filterArray(svs, this);
        
        return svs;
    },
    
    /** Does lazy instantiation of the layouts array. */
    getLayouts: function() {
        return this.layouts || (this.layouts = []);
    },
    
    // Focus Attributes //
    setFocusTrap: function(v) {this.focusTrap = v;},
    setFocusCage: function(v) {this.focusCage = v;},
    setMaskFocus: function(v) {this.maskFocus = v;},
    
    // Layout Attributes //
    setIgnoreLayout: function(v) {this.ignoreLayout = v;},
    setLayoutHint: function(v) {this.layoutHint = v;},
    
    // Dom Selector Attributes //
    /** @overrides myt.DomElementProxy */
    setDomClass: function(v) {
        if (this.domClass !== v) {
            this.callSuper(v);
            if (this.inited) this.fireNewEvent('domClass', v);
        }
    },
    
    /** @overrides myt.DomElementProxy */
    setDomId: function(v) {
        if (this.domId !== v) {
            this.callSuper(v);
            if (this.inited) this.fireNewEvent('domId', v);
        }
    },
    
    // Alignment Attributes //
    setAlignOffset: function(v) {
        if (this.alignOffset !== v) {
            this.alignOffset = v;
            if (this.inited) this.fireNewEvent('alignOffset', v);
            if (this.parent && this.align === 'left') this.setX(v);
        }
    },
    
    setAlign: function(v) {
        if (this.align !== v) {
            if (this.inited) this.__teardownAlignConstraint();
            this.align = v;
            if (this.inited) {
                this.fireNewEvent('align', v);
                this.__setupAlignConstraint();
            }
        }
    },
    
    /** @private */
    __teardownAlignConstraint: function() {
        switch (this.align) {
            case 'center': this.releaseConstraint('__doAlignCenter'); break;
            case 'right': this.releaseConstraint('__doAlignRight'); break;
            case 'left':
            default: // Do nothing
        }
    },
    
    /** @private */
    __setupAlignConstraint: function() {
        var parent = this.parent;
        if (parent) {
            switch (this.align) {
                case 'center':
                    this.applyConstraint('__doAlignCenter', [this, 'width', this, 'alignOffset', parent, 'width']);
                    break;
                case 'right':
                    this.applyConstraint('__doAlignRight', [this, 'width', this, 'alignOffset', parent, 'width']);
                    break;
                case 'left':
                    this.setX(this.alignOffset || 0);
                    break;
                default: // Do nothing
            }
        }
    },
    
    /** @private */
    __doAlignCenter: function(e) {
        this.setX(Math.round((this.parent.width - this.width) / 2) + (this.alignOffset || 0));
    },
    
    /** @private */
    __doAlignRight: function(e) {
        this.setX(this.parent.width - this.width - (this.alignOffset || 0));
    },
    
    setValignOffset: function(v) {
        if (this.valignOffset !== v) {
            this.valignOffset = v;
            if (this.inited) this.fireNewEvent('valignOffset', v);
            if (this.parent && this.valign === 'top') this.setY(v);
        }
    },
    
    setValign: function(v) {
        if (this.valign !== v) {
            if (this.inited) this.__teardownValignConstraint();
            this.valign = v;
            if (this.inited) {
                this.fireNewEvent('valign', v);
                this.__setupValignConstraint();
            }
        }
    },
    
    /** @private */
    __teardownValignConstraint: function() {
        switch (this.valign) {
            case 'middle': this.releaseConstraint('__doValignMiddle'); break;
            case 'bottom': this.releaseConstraint('__doValignBottom'); break;
            case 'top':
            default: // Do nothing
        }
    },
    
    /** @private */
    __setupValignConstraint: function() {
        var parent = this.parent;
        if (parent) {
            switch (this.valign) {
                case 'middle':
                    this.applyConstraint('__doValignMiddle', [this, 'height', this, 'valignOffset', parent, 'height']);
                    break;
                case 'bottom':
                    this.applyConstraint('__doValignBottom', [this, 'height', this, 'valignOffset', parent, 'height']);
                    break;
                case 'top':
                    this.setY(this.valignOffset || 0);
                    break;
                default: // Do nothing
            }
        }
    },
    
    /** @private */
    __doValignMiddle: function(e) {
        this.setY(Math.round((this.parent.height - this.height) / 2) + (this.valignOffset || 0));
    },
    
    /** @private */
    __doValignBottom: function(e) {
        this.setY(this.parent.height - this.height - (this.valignOffset || 0));
    },
    
    // Visual Attributes //
    setX: function(v) {
        if (this.x !== v) {
            this.x = v;
            
            // Only set x-location if currently visible. See this.setVisible 
            // for more info.
            if (this.visible) this.deStyle.left = v + 'px';
            
            if (this.inited) this.fireNewEvent('x', v);
        }
    },
    
    setY: function(v) {
        if (this.y !== v) {
            this.y = v;
            this.deStyle.top = v + 'px';
            if (this.inited) this.fireNewEvent('y', v);
        }
    },
    
    setWidth: function(v, supressEvent) {
        // Dom elements don't support negative width
        if (0 > v) v = 0;
        
        if (this.width !== v) {
            this.width = v;
            this.deStyle.width = v + 'px';
            if (this.inited) {
                this.__updateBounds(v, this.height);
                if (!supressEvent) this.fireNewEvent('width', v);
            }
        }
    },
    
    setHeight: function(v, supressEvent) {
        // Dom elements don't support negative height
        if (0 > v) v = 0;
        
        if (this.height !== v) {
            this.height = v;
            this.deStyle.height = v + 'px';
            if (this.inited) {
                this.__updateBounds(this.width, v);
                if (!supressEvent) this.fireNewEvent('height', v);
            }
        }
    },
    
    setTextColor: function(v) {
        if (this.textColor !== v) {
            this.textColor = v;
            this.deStyle.color = v || 'inherit';
            if (this.inited) this.fireNewEvent('textColor', v);
        }
    },
    
    setBgColor: function(v) {
        if (this.bgColor !== v) {
            this.deStyle.backgroundColor = this.bgColor = v;
            if (this.inited) this.fireNewEvent('bgColor', v);
        }
    },
    
    setOpacity: function(v) {
        if (this.opacity !== v) {
            this.deStyle.opacity = this.opacity = v;
            if (this.inited) this.fireNewEvent('opacity', v);
        }
    },
    
    setOverflow: function(v) {
        if (this.overflow !== v) {
            this.overflow = v;
            this.deStyle.overflow = v || 'visible';
            if (this.inited) this.fireNewEvent('overflow', v);
        }
    },
    
    setVisible: function(v) {
        if (this.visible !== v) {
            this.visible = v;
            
            var s = this.deStyle;
            s.visibility = v ? 'inherit' : 'hidden';
            
            // Move invisible elements to a very negative location so they won't
            // effect scrollable area. Ideally we could use display:none but we
            // can't because that makes measuring bounds not work.
            s.left = v ? this.x + 'px' : '-1000000px';
            
            if (this.inited) this.fireNewEvent('visible', v);
        }
    },
    
    setCursor: function(v) {
        if (this.cursor !== v) {
            this.cursor = v;
            this.deStyle.cursor = v || 'auto';
            if (this.inited) this.fireNewEvent('cursor', v);
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
            this.fireNewEvent('boundsWidth', w);
        }
        
        if (this.boundsHeight !== h) {
            this.boundsHeight = h;
            this.fireNewEvent('boundsHeight', h);
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
        this.deStyle.outlineWidth = this.outlineWidth + 'px';
    },
    
    setOutlineStyle: function(v) {
        this.deStyle.outlineStyle = this.outlineStyle = v || 'none';
    },
    
    setOutlineColor: function(v) {
        this.deStyle.outlineColor = this.outlineColor = v || '#000000';
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
        this.deStyle.borderWidth = this.borderWidth + 'px';
    },
    
    setBorderStyle: function(v) {
        this.deStyle.borderStyle = this.borderStyle = v || 'none';
    },
    
    setBorderColor: function(v) {
        this.deStyle.borderColor = this.borderColor = v || '#000000';
    },
    
    // Edge treatements
    /** A convienence method to set rounded corners on an element.
        @param radius:number the radius of the corners.
        @returns void */
    setRoundedCorners: function(radius) {
        this.deStyle.borderRadius = radius + 'px';
    },
    
    /** A convienence method to round the top left corner.
        @param radius:number the radius of the corner.
        @returns void */
    setRoundedTopLeftCorner: function(radius) {
        this.setRoundedCorner(radius, 'TopLeft');
    },
    
    /** A convienence method to round the top right corner.
        @param radius:number the radius of the corner.
        @returns void */
    setRoundedTopRightCorner: function(radius) {
        this.setRoundedCorner(radius, 'TopRight');
    },
    
    /** A convienence method to round the bottom left corner.
        @param radius:number the radius of the corner.
        @returns void */
    setRoundedBottomLeftCorner: function(radius) {
        this.setRoundedCorner(radius, 'BottomLeft');
    },
    
    /** A convienence method to round the bottom right corner.
        @param radius:number the radius of the corner.
        @returns void */
    setRoundedBottomRightCorner: function(radius) {
        this.setRoundedCorner(radius, 'BottomRight');
    },
    
    /** A convienence method to set a single rounded corner on an element.
        @param radius:number the radius of the corner.
        @param corner:string One of 'TopLeft', 'TopRight', 'BottomLeft' or
            'BottomRight'.
        @returns void */
    setRoundedCorner: function(radius, corner) {
        this.deStyle['border' + corner + 'Radius'] = radius + 'px';
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
        this.deStyle.boxShadow = v;
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** Checks if this view is visible and each view in the parent chain to
        the RootView is also visible. Dom elements are not explicitly
        checked. If you need to check that use myt.DomElementProxy.isDomElementVisible.
        @returns true if this view is visible, false otherwise. */
    isVisible: function() {
        return this.searchAncestorsOrSelf(function(v) {return !v.visible;}) === null;
    },
    
    /** Finds the youngest ancestor (or self) that is a focusTrap or focusCage.
        @param ignoreFocusTrap:boolean indicates focusTraps should be
            ignored.
        @returns a View with focusTrap set to true or null if not found. */
    getFocusTrap: function(ignoreFocusTrap) {
        return this.searchAncestorsOrSelf(
            function(v) {
                return v.focusCage || (v.focusTrap && !ignoreFocusTrap);
            }
        );
    },
    
    /** @overrides myt.Node
        Calls this.subviewAdded if the added subnode is a myt.View. 
        @fires subviewAdded event with the provided Node if it's a View. 
        @fires layoutAdded event with the provided node if it's a Layout. */
    subnodeAdded: function(node) {
        if (node instanceof myt.View) {
            this.domElement.appendChild(node.domElement);
            this.getSubviews().push(node);
            this.fireNewEvent('subviewAdded', node);
            this.subviewAdded(node);
        } else if (node instanceof myt.Layout) {
            this.getLayouts().push(node);
            this.fireNewEvent('layoutAdded', node);
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
        if (node instanceof myt.View) {
            idx = this.getSubviewIndex(node);
            if (idx !== -1) {
                this.fireNewEvent('subviewRemoved', node);
                node.removeDomElement();
                this.subviews.splice(idx, 1);
                this.subviewRemoved(node);
            }
        } else if (node instanceof myt.Layout) {
            idx = this.getLayoutIndex(node);
            if (idx !== -1) {
                this.fireNewEvent('layoutRemoved', node);
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
    subviewAdded: function(sv) {},
    
    /** Called when a View is removed from this View. Do not call this method 
        to remove a View. Instead call removeSubnode or setParent.
        @param sv:View the view that was removed.
        @returns void */
    subviewRemoved: function(sv) {},
    
    /** Gets the next sibling view based on lexical ordering of dom elements.
        @returns myt.View: The next sibling view or null if none exists. */
    getNextSibling: function() {
        if (this.parent) {
            var nextDomElement = this.domElement.nextElementSibling;
            if (nextDomElement) return nextDomElement.model;
        }
        return null;
    },
    
    /** Gets the previous sibling view.
        @returns myt.View: The previous sibling view or null if none exists. */
    getPrevSibling: function() {
        if (this.parent) {
            var prevDomElement = this.domElement.previousElementSibling;
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
    layoutAdded: function(layout) {},
    
    /** Called when a Layout is removed from this View. Do not call this 
        method to remove a Layout. Instead call removeSubnode or setParent.
        @param layout:Layout the layout that was removed.
        @returns void */
    layoutRemoved: function(layout) {},
    
    // Dom-Ordering //
    /** Test if the provided view is behind this view. The view to test can
        be anywhere in the document.
        @param view:myt.View the view to check.
        @param checkZIndex:boolean (optional) If true z-index will first be
            used to check if the view is behind or not.
        @returns boolean: true if the view is behind this view, 
            false otherwise. */
    isBehind: function(view, checkZIndex) {
        return this.__comparePosition(view, false, checkZIndex);
    },
    
    /** Test if the provided view is front of this view. The view to test can
        be anywhere in the document.
        @param view:myt.View the view to check.
        @param checkZIndex:boolean (optional) If true z-index will first be
            used to check if the view is in front or not.
        @returns boolean: true if the view is in front of this view, 
            false otherwise. */
    isInFrontOf: function(view, checkZIndex) {
        return this.__comparePosition(view, true, checkZIndex);
    },
    
    /** Implements isBehind and isInFrontOf methods.
        @private
        @param front:boolean indicates if this is the isInFrontOf test or not.
        @returns boolean */
    __comparePosition: function(view, front, checkZIndex) {
        if (view) {
            if (checkZIndex) {
                var commonAncestor = this.getLeastCommonAncestor(view);
                if (commonAncestor) {
                    var commonAncestorElem = commonAncestor.domElement,
                        DEP = myt.DomElementProxy,
                        zIdx = DEP.getZIndexRelativeToAncestor(this.domElement, commonAncestorElem),
                        otherZIdx = DEP.getZIndexRelativeToAncestor(view.domElement, commonAncestorElem);
                    
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
            var rel = this.domElement.compareDocumentPosition(view.domElement);
            return front ? rel === 2 || rel === 10 : rel === 4 || rel === 20;
        } else {
            return false;
        }
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
            var de = this.domElement;
            if (sv.domElement !== de.lastChild) {
                myt.View.retainFocusDuringDomUpdate(sv, function() {
                    de.appendChild(sv.domElement);
                });
            }
        }
    },
    
    /** Sends the provided subview to the back.
        @param sv:View the subview of this view to send to back.
        @returns void */
    sendSubviewToBack: function(sv) {
        if (sv && sv.parent === this) {
            var de = this.domElement;
            if (sv.domElement !== de.firstChild) {
                myt.View.retainFocusDuringDomUpdate(sv, function() {
                    de.insertBefore(sv.domElement, de.firstChild);
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
            var de = this.domElement;
            myt.View.retainFocusDuringDomUpdate(sv, function() {
                de.insertBefore(sv.domElement, existing.domElement);
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
        var svs = this.getSubviews(), i = svs.length;
        svs.sort(sortFunc);
        
        // Rearrange dom to match new sort order.
        while (i) this.sendSubviewToBack(svs[--i]);
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
        var pos = myt.DomElementProxy.getPagePosition(this.domElement, referenceFrameDomElem);
        return myt.Geometry.rectContainsPoint(locX, locY, pos.x, pos.y, this.width, this.height);
    },
    
    /** Checks if the provided location is visible on this view and is not
        masked by the bounding box of the view or any of its ancestor views.
        @returns boolean: true if visible, false otherwise. */
    isPointVisible: function(locX, locY) {
        var pos = this.getTruePagePosition();
        this.calculateEffectiveScale();
        return this.__isPointVisible(locX - pos.x, locY - pos.y);
    },
    
    /** @private */
    __isPointVisible: function(x, y) {
        var effectiveScale = this.__effectiveScale;
        
        if (myt.Geometry.rectContainsPoint(x, y, 0, 0, this.width * effectiveScale, this.height * effectiveScale)) {
            var p = this.parent;
            if (p) {
                var de = p.domElement, pScale = p.__effectiveScale;
                return p.__isPointVisible(x + (this.x - de.scrollLeft) * pScale, y + (this.y - de.scrollTop) * pScale);
            }
            return true;
        }
        return false;
    },
    
    calculateEffectiveScale: function() {
        var ancestors = this.getAncestors(), i = ancestors.length, ancestor,
            effectiveScale = 1;
        while (i) {
            ancestor = ancestors[--i];
            effectiveScale *= ancestor.scaleX || 1;
            ancestor.__effectiveScale = effectiveScale;
        }
    },
    
    getEffectiveScale: function() {
        this.calculateEffectiveScale();
        return this.__effectiveScale;
    }
});

/** A Node that can be viewed. Instances of view are typically backed by
    an absolutely positioned div element. */
myt.View = new JS.Class('View', myt.Node, {
    include: [
        myt.DomElementProxy, 
        myt.DomObservable, 
        myt.DomObserver, 
        myt.MouseObservable, 
        myt.KeyObservable, 
        myt.FocusObservable
    ],
    
    
    // Class Methods and Attributes ////////////////////////////////////////////
    extend: {
        /** Preserves focus during dom updates. Focus can get lost in webkit 
            when an element is removed from the dom.
            viewBeingRemoved:myt.View
            wrapperFunc:function a function to execute that manipulates the
                dom in some way.
            @returns void */
        retainFocusDuringDomUpdate: function(viewBeingRemoved, wrappedFunc) {
            var restoreFocus,
                currentFocus = myt.global.focus.focusedView;
            if (currentFocus && (currentFocus === viewBeingRemoved || currentFocus.isDescendantOf(viewBeingRemoved))) {
                restoreFocus = currentFocus;
                restoreFocus._ignoreFocus = true;
            }
            
            wrappedFunc.call();
            
            if (restoreFocus) {
                restoreFocus._ignoreFocus = false;
                restoreFocus.focus(true);
            }
        }
    },
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides myt.Node */
    initNode: function(parent, attrs) {
        this.x = this.y = this.width = this.height = 0;
        this.opacity = 1;
        this.clip = false;
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
        @returns a dom element */
    createOurDomElement: function(parent) {
        var elem = document.createElement('div');
        elem.style.position = 'absolute';
        return elem;
    },
    
    /** @overrides myt.Node 
        Subclasses should call super if they don't call __updateBounds. */
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
        if (this.parent === parent) return;
        if (this.inited) {
            this.__teardownAlignConstraint();
            this.__teardownValignConstraint();
        }
        this.callSuper(parent);
        this.__setupAlignConstraint();
        this.__setupValignConstraint();
    },
    
    /** Does lazy instantiation of the subviews array. */
    getSubviews: function() {
        if (!this.subviews) this.subviews = [];
        return this.subviews;
    },
    
    /** Does lazy instantiation of the layouts array. */
    getLayouts: function() {
        if (!this.layouts) this.layouts = [];
        return this.layouts;
    },
    
    // Focus Attributes //
    /** A boolean that determines if focus traversal can move above this view
        or not. The default is false. */
    setFocusTrap: function(v) {
        this.focusTrap = v;
    },
    
    /** A boolean that determines if focus traversal can move above this view
        or not. The default is false. This is the same as focusTrap except
        it can't be ignored. */
    setFocusCage: function(v) {
        this.focusCage = v;
    },
    
    /** A boolean that prevents focus from traversing into this view or any
        of its subviews. The default is false. */
    setMaskFocus: function(v) {
        this.maskFocus = v;
    },
    
    // Layout Attributes //
    /** A boolean that determines if this view should be included in layouts
        or not. */
    setIgnoreLayout: function(v) {
        this.ignoreLayout = v;
    },
    
    /** A String that indicates this view is treated as "special" by the 
        layout. The exact meaning of this value is up to the layouts used
        on the parent view. */
    setLayoutHint: function(v) {
        this.layoutHint = v;
    },
    
    // Dom Selector Attributes //
    /** @overrides myt.DomElementProxy */
    setDomClass: function(v) {
        if (this.domClass === v) return;
        this.callSuper(v);
        if (this.inited) this.fireNewEvent('domClass', v);
    },
    
    /** @overrides myt.DomElementProxy */
    setDomId: function(v) {
        if (this.domId === v) return;
        this.callSuper(v);
        if (this.inited) this.fireNewEvent('domId', v);
    },
    
    // Alignment Attributes //
    /** Offset to use when aligning a view. */
    setAlignOffset: function(v) {
        if (this.alignOffset === v) return;
        this.alignOffset = v;
        if (this.inited) this.fireNewEvent('alignOffset', v);
        if (this.parent && this.align === 'left') this.setX(v);
    },
    
    /** Aligns the view within its parent. Allowed values are: 'left', 'center',
        'right' and ''. The default is undefined. */
    setAlign: function(v) {
        if (this.align === v) return;
        if (this.inited) this.__teardownAlignConstraint();
        this.align = v;
        if (this.inited) this.fireNewEvent('align', v);
        this.__setupAlignConstraint();
    },
    
    __teardownAlignConstraint: function() {
        switch(this.align) {
            case 'center': this.releaseConstraint('__doAlignCenter'); break;
            case 'right': this.releaseConstraint('__doAlignRight'); break;
            case 'left':
            default: // Do nothing
        }
    },
    
    __setupAlignConstraint: function() {
        if (this.parent) {
            switch(this.align) {
                case 'center': this.applyConstraint('__doAlignCenter', [this, 'width', this, 'alignOffset', this.parent, 'width']); break;
                case 'right': this.applyConstraint('__doAlignRight', [this, 'width', this, 'alignOffset', this.parent, 'width']); break;
                case 'left': this.setX(this.alignOffset ? this.alignOffset : 0); break;
                default: // Do nothing
            }
        }
    },
    
    __doAlignCenter: function(e) {
        this.setX(((this.parent.width - this.width) / 2) + (this.alignOffset ? this.alignOffset : 0));
    },
    
    __doAlignRight: function(e) {
        this.setX(this.parent.width - this.width - (this.alignOffset ? this.alignOffset : 0));
    },
    
    /** Offset to use when vertically aligning a view. */
    setValignOffset: function(v) {
        if (this.valignOffset === v) return;
        this.valignOffset = v;
        if (this.inited) this.fireNewEvent('valignOffset', v);
        if (this.parent && this.valign === 'top') this.setY(v);
    },
    
    /** Vertically aligns the view within its parent. Allowed values are: 'top', 
        'middle', 'bottom' and ''. The default is undefined. */
    setValign: function(v) {
        if (this.valign === v) return;
        if (this.inited) this.__teardownValignConstraint();
        this.valign = v;
        if (this.inited) this.fireNewEvent('valign', v);
        this.__setupValignConstraint();
    },
    
    __teardownValignConstraint: function() {
        switch(this.valign) {
            case 'middle': this.releaseConstraint('__doValignMiddle'); break;
            case 'bottom': this.releaseConstraint('__doValignBottom'); break;
            case 'top':
            default: // Do nothing
        }
    },
    
    __setupValignConstraint: function() {
        if (this.parent) {
            switch(this.valign) {
                case 'middle': this.applyConstraint('__doValignMiddle', [this, 'height', this, 'valignOffset', this.parent, 'height']); break;
                case 'bottom': this.applyConstraint('__doValignBottom', [this, 'height', this, 'valignOffset', this.parent, 'height']); break;
                case 'top': this.setY(this.valignOffset ? this.valignOffset : 0); break;
                default: // Do nothing
            }
        }
    },
    
    __doValignMiddle: function(e) {
        this.setY(((this.parent.height - this.height) / 2) + (this.valignOffset ? this.valignOffset : 0));
    },
    
    __doValignBottom: function(e) {
        this.setY(this.parent.height - this.height - (this.valignOffset ? this.valignOffset : 0));
    },
    
    // Visual Attributes //
    /** Sets the x position of this view. */
    setX: function(v) {
        if (this.x === v) return;
        this.x = v;
        this.deStyle.left = v + 'px';
        if (this.inited) this.fireNewEvent('x', v);
    },
    
    /** Sets the y position of this view. */
    setY: function(v) {
        if (this.y === v) return;
        this.y = v;
        this.deStyle.top = v + 'px';
        if (this.inited) this.fireNewEvent('y', v);
    },
    
    /** Sets the width of this view. */
    setWidth: function(v, supressEvent) {
        // Dom elements don't support negative width
        if (0 > v) v = 0;
        
        if (this.width === v) return;
        this.width = v;
        this.deStyle.width = v + 'px';
        if (this.clip) this.__applyClipToDom();
        if (this.inited) {
            this.__updateBounds(v, this.height);
            if (!supressEvent) this.fireNewEvent('width', v);
        }
    },
    
    /** Sets the height of this view. */
    setHeight: function(v, supressEvent) {
        // Dom elements don't support negative height
        if (0 > v) v = 0;
        
        if (this.height === v) return;
        this.height = v;
        this.deStyle.height = v + 'px';
        if (this.clip) this.__applyClipToDom();
        if (this.inited) {
            this.__updateBounds(this.width, v);
            if (!supressEvent) this.fireNewEvent('height', v);
        }
    },
    
    /** Sets the color used for text. Will be inherited by descendant views
        if they don't themselves set textColor or if they set textColor to
        'inherit'. */
    setTextColor: function(v) {
        if (this.textColor === v) return;
        this.textColor = v;
        this.deStyle.color = v ? v : 'inherit';
        if (this.inited) this.fireNewEvent('textColor', v);
    },
    
    /** Sets the background color of this view. Use a value of 'transparent'
        to make this view transparent. */
    setBgColor: function(v) {
        if (this.bgColor === v) return;
        this.deStyle.backgroundColor = this.bgColor = v;
        if (this.inited) this.fireNewEvent('bgColor', v);
    },
    
    /** Sets the opacity of this view. The value should be a number between
        0 and 1. The default value is 1. */
    setOpacity: function(v) {
        if (this.opacity === v) return;
        this.deStyle.opacity = this.opacity = v;
        if (this.inited) this.fireNewEvent('opacity', v);
    },
    
    /** Turns clipping on and off for this view. The default value is false. */
    setClip: function(v) {
        if (this.clip === v) return;
        this.clip = v;
        this.__applyClipToDom();
        if (this.inited) this.fireNewEvent('clip', v);
    },
    
    /** Allowed values: 'visible', 'hidden', 'scroll', 'auto', 'inherit'. */
    setOverflow: function(v) {
        if (this.overflow === v) return;
        this.overflow = v;
        this.deStyle.overflow = v ? v : 'visible';
        if (this.inited) this.fireNewEvent('overflow', v);
    },
    
    /** Makes this view visible or not. The default value is true which means
        visbility is inherited from the parent view. */
    setVisible: function(v) {
        if (this.visible === v) return;
        this.visible = v;
        this.deStyle.visibility = v ? 'inherit' : 'hidden';
        if (this.inited) this.fireNewEvent('visible', v);
    },
    
    /** Allowed values: 'auto', 'move', 'no-drop', 'col-resize', 'all-scroll', 
        'pointer', 'not-allowed', 'row-resize', 'crosshair', 'progress', 
        'e-resize', 'ne-resize', 'default', 'text', 'n-resize', 'nw-resize', 
        'help', 'vertical-text', 's-resize', 'se-resize', 'inherit', 'wait', 
        'w-resize', 'sw-resize' */
    setCursor: function(v) {
        if (this.cursor === v) return;
        this.cursor = v;
        this.deStyle.cursor = v ? v : 'auto';
        if (this.inited) this.fireNewEvent('cursor', v);
    },
    
    /** Applys a clipping rect to the domElement.
        @returns void */
    __applyClipToDom: function() {
        var style = this.deStyle;
        style.clip = this.clip ? 'rect(0px, ' + style.width + ', ' + style.height + ', 0px)' : 'auto';
    },
    
    /** Updates the boundsWidth and boundsHeight attributes.
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
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** Checks if this view is visible and each view in the parent chain to
        the RootView is also visible. Dom elements are not explicitly
        checked. If you need to check that use myt.DomElementProxy.isDomElementVisible.
        @returns true if this view is visible, false otherwise. */
    isVisible: function() {
        var p = this;
        while (p) {
            if (!p.visible) return false;
            p = p.parent;
        }
        return true;
    },
    
    /** Finds the youngest ancestor (or self) that is a focusTrap or focusCage.
        @param ignoreFocusTrap:boolean indicates focusTraps should be
            ignored.
        @returns a View with focusTrap set to true or null if not found. */
    getFocusTrap: function(ignoreFocusTrap) {
        var p = this;
        while (p) {
            if (p.focusCage || (p.focusTrap && !ignoreFocusTrap)) return p;
            p = p.parent;
        }
        return null;
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
        var subs = this.subviews;
        if (subs) {
            var i = subs.length;
            while (i) {
                if (sv === subs[--i]) return true;
            }
        }
        return false;
    },
    
    /** Gets the index of the provided View in the subviews array.
        @param sv:View the view to look for.
        @returns the index of the subview or -1 if not found. */
    getSubviewIndex: function(sv) {
        var subs = this.subviews;
        if (subs) {
            var i = subs.length;
            while (i) {
                if (sv === subs[--i]) return i;
            }
        }
        return -1;
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
    
    // Layouts //
    /** Checks if this View has the provided Layout in the layouts array.
        @param layout:Layout the layout to look for.
        @returns true if the layout is found, false otherwise. */
    hasLayout: function(layout) {
        var subs = this.layouts;
        if (subs) {
            var i = subs.length;
            while (i) {
                if (layout === subs[--i]) return true;
            }
        }
        return false;
    },
    
    /** Gets the index of the provided Layout in the layouts array.
        @param layout:Layout the layout to look for.
        @returns the index of the layout or -1 if not found. */
    getLayoutIndex: function(layout) {
        var subs = this.layouts;
        if (subs) {
            var i = subs.length;
            while (i) {
                if (layout === subs[--i]) return i;
            }
        }
        return -1;
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
    
    // Z-Ordering //
    /** Test if the provided view is behind this view. The view to test can
        be anywhere in the document.
        @returns true if the view is behind this view, false otherwise. */
    isBehind: function(view) {
        var rel = this.domElement.compareDocumentPosition(view.domElement);
        return rel === 4 || rel === 8;
    },
    
    /** Test if the provided view is front of this view. The view to test can
        be anywhere in the document.
        @returns true if the view is in front of this view, false otherwise. */
    isInFrontOf: function(view) {
        var rel = this.domElement.compareDocumentPosition(view.domElement);
        return rel === 2 || rel === 10;
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
        this.parent.sendSubviewInFrontOf(sv, this);
    },
    
    /** Sends the provided subview to the back.
        @param sv:View the subview of this view to bring to front.
        @returns void */
    bringSubviewToFront: function(sv) {
        if (sv.parent === this) {
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
        if (sv.parent === this) {
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
        if (sv.parent === this && existing.parent === this) {
            var de = this.domElement;
            myt.View.retainFocusDuringDomUpdate(sv, function() {
                de.insertBefore(sv.domElement, existing);
            });
        }
    },
    
    /** Sends the subview in front of the existing subview.
        @param sv:View the subview to send in front of the existing view.
        @param existing:View the subview to send the other subview in front of.
        @returns void */
    sendSubviewInFrontOf: function(existing, sv) {
        if (sv.parent === this && existing.parent === this) {
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
        var svs = this.subviews, i = svs.length;
        svs.sort(sortFunc);
        
        // Rearrange dom to match new sort order.
        while (i) this.sendSubviewToBack(svs[--i]);
    },
    
    // Hit Testing //
    /** Checks if the provided location is inside this view or not.
        @param locX:number the x position to test.
        @param locY:number the y position to test.
        @returns boolean True if the location is inside this view, false 
            if not. */
    containsPoint: function(locX, locY) {
        var pos = this.getPagePosition();
        return myt.Geometry.rectContainsPoint(locX, locY, pos.x, pos.y, this.width, this.height);
    }
});

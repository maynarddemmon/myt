/** A panel that floats above everything else.
    
    Events:
        None
    
    Attributes:
        owner:myt.FloatingPanelAnchor The anchor that currently "owns" 
            this panel.
        panelId:string The unique ID for this panel instance.
        hideOnMouseDown:boolean If true this panel will be hidden when a
            mousedown occurs outside the panel. True by default.
        ignoreOwnerForHideOnMouseDown:boolean If true the owner view for this
            panel will also be ignored for mousedown events. True by default.
        ignoreOwnerForHideOnBlur:boolean If true the owner view for this
            panel will also be ignored for blur events. True by default.
        hideOnBlur:boolean If true this panel will be hidden when a
            focus traverses outside the panel. True by default.
*/
myt.FloatingPanel = new JS.Class('FloatingPanel', myt.View, {
    include: [myt.RootView],
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    initNode: function(parent, attrs) {
        // Create a dom element for the panel and insert it at the end of
        // the body.
        const elem = document.createElement('div');
        elem.style.position = 'absolute';
        myt.getElement().appendChild(elem);
        
        this.ignoreOwnerForHideOnMouseDown = this.ignoreOwnerForHideOnBlur = this.hideOnBlur = this.hideOnMouseDown = true;
        
        attrs.visible = attrs.focusEmbellishment = false;
        
        // Ensure the focus starts and ends with the panel
        attrs.focusable = attrs.focusCage = true;
        
        this.callSuper(elem, attrs);
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setOwner: function(v) {this.owner = v;},
    setPanelId: function(v) {this.panelId = v;},
    setIgnoreOwnerForHideOnMouseDown: function(v) {this.ignoreOwnerForHideOnMouseDown = v;},
    setHideOnBlur: function(v) {this.hideOnBlur = v;},
    setHideOnMouseDown: function(v) {this.hideOnMouseDown = v;},
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** @private
        @param {!Object} event
        @returns {undefined} */
    __doMouseDown: function(event) {
        const v = event.value, 
            px = v.pageX, 
            py = v.pageY;
        if (!this.containsPoint(px, py) && 
            (this.ignoreOwnerForHideOnMouseDown ? !this.owner.containsPoint(px, py) : true)
        ) {
            this.doMouseDownOutside();
        }
        return true;
    },
    
    /** Called when a mousedown occurs outside the floating panel. The default
        behavior is to hide the panel. This gives subclasses a chance to 
        provide different behavior.
        @returns {undefined} */
    doMouseDownOutside: function() {
        if (this.hideOnMouseDown) this.hide();
    },
    
    /** @overrides myt.FocusObservable
        Intercepts focus on this panel and refocuses to the "best" view.
        When focus enters the panel we give focus to the first focusable
        descendant of the panel. When leaving we ask the panel anchor
        where to give focus. */
    focus: function(noScroll) {
        const gf = myt.global.focus;
        if (this.owner && this.isAncestorOf(gf.focusedView)) {
            this.owner[gf.lastTraversalWasForward ? 'getNextFocusAfterPanel' : 'getPrevFocusAfterPanel'](this.panelId).focus(noScroll);
        } else {
            const ffv = this.getFirstFocusableDescendant();
            if (ffv === this) {
                // Process normally since focus is actually being set
                // on the panel.
                this.callSuper(noScroll);
            } else {
                ffv.focus(noScroll);
            }
        }
    },
    
    /** Gets the view to give focus to when this panel gets focus. Should be
        a descendant of the floating panel or the panel itself. Returns this 
        floating panel by default.
        @returns myt.View: The view to give focus to. */
    getFirstFocusableDescendant: function() {
        return this;
    },
    
    /** @private
        @param {!Object} event
        @returns {undefined} */
    __doFocusChange: function(event) {
        const v = event.value;
        if (v && !this.isAncestorOf(v)) this.doLostFocus();
    },
    
    /** Called when focus moves out of the floating panel. Hides the
        floating panel by default.
        @returns {undefined} */
    doLostFocus: function() {
        if (this.hideOnBlur) {
            if (this.ignoreOwnerForHideOnBlur && myt.global.focus.focusedView === this.owner) return;
            
            this.hide(true);
        }
    },
    
    /** Determines if this floating panel is being "shown" or not. Typically
        this means the floating panel is visible.
        @returns {boolean} True if this panel is shown, otherwise false. */
    isShown: function() {
        return this.visible;
    },
    
    /** Shows the floating panel for the provided myt.FloatingPanelAnchor.
        @param panelAnchor:myt.FloatingPanelAnchor The floating panel anchor 
            to show the panel for.
        @returns {undefined} */
    show: function(panelAnchor) {
        if (!this.isShown()) {
            this.bringToFront();
            this.updateLocation(panelAnchor);
            this.setVisible(true);
            
            this.owner.notifyPanelShown(this);
            
            const g = myt.global;
            this.attachToDom(g.mouse, '__doMouseDown', 'mousedown', true);
            this.attachTo(g.focus, '__doFocusChange', 'focused');
        }
    },
    
    /** Hides the floating panel for the provided myt.FloatingPanelAnchor.
        @param ignoreRestoreFocus:boolean (Optional) If true the restoreFocus
            method will not be called. Defaults to undefined which is
            equivalent to false.
        @returns {undefined} */
    hide: function(ignoreRestoreFocus) {
        if (this.isShown()) {
            const g = myt.global;
            this.detachFromDom(g.mouse, '__doMouseDown', 'mousedown', true);
            this.detachFrom(g.focus, '__doFocusChange', 'focused');
            
            this.setVisible(false);
            this.owner.notifyPanelHidden(this);
            if (!ignoreRestoreFocus) this.restoreFocus();
            this.setOwner();
        }
    },
    
    /** Sends the focus back to the owner. Can be overridden to
        send the focus elsewhere.
        @returns {undefined} */
    restoreFocus: function() {
        if (this.owner) this.owner.focus();
    },
    
    /** Updates the x and y position of the floating panel for the provided 
        floating panel anchor.
        @param panelAnchor:myt.FloatingPanelAnchor The anchor to update the
            location for.
        @returns {undefined} */
    updateLocation: function(panelAnchor) {
        this.setOwner(panelAnchor);
        
        const panelId = this.panelId,
            align = panelAnchor.getFloatingAlignForPanelId(panelId),
            valign = panelAnchor.getFloatingValignForPanelId(panelId),
            anchorLocation = panelAnchor.getPagePosition();
        let x = 0,
            y = 0,
            type = typeof align;
        
        if (type === 'string') {
            x = anchorLocation.x + panelAnchor.getFloatingAlignOffsetForPanelId(panelId);
            switch(align) {
                case 'outsideRight': x += panelAnchor.width; break;
                case 'insideRight': x += panelAnchor.width - this.width; break;
                case 'outsideLeft': x -= this.width; break;
                case 'insideLeft': break;
                default: console.warn("Unexpected align value", type, align);
            }
        } else if (type === 'number') {
            // Absolute position
            x = align;
        } else {
            console.warn("Unexpected align type", type, align);
        }
        this.setX(x);
        
        // Vertical positioning
        type = typeof valign;
        
        if (type === 'string') {
            y = anchorLocation.y + panelAnchor.getFloatingValignOffsetForPanelId(panelId);
            switch(valign) {
                case 'outsideBottom': y += panelAnchor.height; break;
                case 'insideBottom': y += panelAnchor.height - this.height; break;
                case 'outsideTop': y -= this.height; break;
                case 'insideTop': break;
                default: console.warn("Unexpected valign value", type, valign);
            }
        } else if (type === 'number') {
            // Absolute position
            y = valign;
        } else {
            console.warn("Unexpected valign type", type, valign);
        }
        this.setY(y);
    }
});

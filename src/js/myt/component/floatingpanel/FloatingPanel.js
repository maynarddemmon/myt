/** A panel that floats above everything else.
    
    Attributes:
        owner:FloatingPanelAnchor the anchor that currently "owns" this panel.
        panelId:string the unique ID for this panel instance.
        hideOnMouseDown:boolean If true this panel will be hidden when a
            mousedown occurs outside the panel. True by default.
        ignoreOwnerForHideOnMouseDown:boolean If true the owner view for this
            panel will also be ignored for mousedown events. True by default.
        hideOnBlur:boolean If true this panel will be hidden when a
            focus traverses outside the panel. True by default.
*/
myt.FloatingPanel = new JS.Class('FloatingPanel', myt.View, {
    include: [myt.RootView],
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    initNode: function(parent, attrs) {
        // Create a dom element for the panel and insert it at the end of
        // the body.
        var elem = document.createElement('div');
        elem.style.position = 'absolute';
        document.getElementsByTagName('body')[0].appendChild(elem);
        
        if (attrs.visible === undefined) attrs.visible = false;
        if (attrs.hideOnMouseDown === undefined) attrs.hideOnMouseDown = true;
        if (attrs.hideOnBlur === undefined) attrs.hideOnBlur = true;
        if (attrs.ignoreOwnerForHideOnMouseDown === undefined) attrs.ignoreOwnerForHideOnMouseDown = true;
        
        // Ensure the focus starts and ends with the panel
        attrs.focusable = true;
        attrs.focusCage = true;
        attrs.focusEmbellishment = false;
        
        this.callSuper(elem, attrs);
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setOwner: function(v) {
        this.owner = v;
    },
    
    setPanelId: function(v) {
        this.panelId = v;
    },
    
    setIgnoreOwnerForHideOnMouseDown: function(v) {
        this.ignoreOwnerForHideOnMouseDown = v;
    },
    
    setHideOnMouseDown: function(v) {
        if (this.hideOnMouseDown === v) return;
        this.hideOnMouseDown = v;
        
        if (this.inited && this.isShown()) {
            var gm = myt.global.mouse;
            if (v) {
                this.detachFromDom(gm, '_doMouseDown', 'mousedown', true);
            } else {
                this.detachFromDom(gm, '_doMouseDown', 'mousedown', true);
                this.attachToDom(gm, '_doMouseDown', 'mousedown', true);
            }
        }
    },
    
    setHideOnBlur: function(v) {
        if (this.hideOnBlur === v) return;
        this.hideOnBlur = v;
        
        if (this.inited && this.isShown()) {
            var gf = myt.global.focus;
            if (v) {
                this.detachFrom(gf, '_doGlobalFocusChange', 'focused');
            } else {
                this.detachFrom(gf, '_doGlobalFocusChange', 'focused');
                this.attachTo(gf, '_doGlobalFocusChange', 'focused');
            }
        }
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    _doMouseDown: function(event) {
        var v = event.value, px = v.pageX, py = v.pageY;
        if (!this.containsPoint(px, py) && 
            (this.ignoreOwnerForHideOnMouseDown ? !this.owner.containsPoint(px, py) : true)
        ) {
            this.doMouseDownOutside();
        }
        return true;
    },
    
    /** Called when a mousedown occurs outside the floating panel. The default
        behavior is to hide the panel. This gives subclasses a chance to 
        provide different behavior. */
    doMouseDownOutside: function() {
        this.hide(this.owner);
    },
    
    /** @overrides myt.FocusObservable
        Intercepts focus on this panel and refocuses to the "best" view.
        When focus enters the panel we give focus to the first focusable
        descendant of the panel. When leaving we ask the panel anchor
        where to give focus. */
    focus: function(noScroll) {
        var gf = myt.global.focus;
        if (this.owner && this.isAncestorOf(gf.focusedView)) {
            this.owner[gf.lastTraversalWasForward ? 'getNextFocusAfterPanel' : 'getPrevFocusAfterPanel'](this.panelId).focus(noScroll);
        } else {
            var ffv = this.getFirstFocusableDescendant();
            if (ffv === this) {
                // Process normally since focus is actually being set
                // on the panel.
                this.callSuper(noScroll);
            } else {
                ffv.focus(noScroll);
            }
        }
    },
    
    /** Gets the view to give focus to when this panel gets focus. By default
        this returns the panel itself.
        @returns the view to give focus to. */
    getFirstFocusableDescendant: function() {
        return this;
    },
    
    _doGlobalFocusChange: function(event) {
        var v = event.value;
        if (v && !this.isAncestorOf(v)) this.doLostFocus();
    },
    
    doLostFocus: function() {
        this.hide(this.owner, true);
    },
    
    isShown: function() {
        return this.visible;
    },
    
    show: function(panelAnchor) {
        if (this.isShown()) return;
        
        this.setOwner(panelAnchor);
        this.bringToFront();
        this.updateLocation(panelAnchor);
        this.setVisible(true);
        
        var gm = myt.global.mouse;
        this.detachFromDom(gm, '_doMouseDown', 'mousedown', true);
        if (this.hideOnMouseDown) this.attachToDom(gm, '_doMouseDown', 'mousedown', true);
        
        var gf = myt.global.focus;
        this.detachFrom(gf, '_doGlobalFocusChange', 'focused');
        if (this.hideOnBlur) this.attachTo(gf, '_doGlobalFocusChange', 'focused');
    },
    
    hide: function(panelAnchor, ignoreRestoreFocus) {
        if (!this.isShown()) return;
        
        this.detachFromDom(myt.global.mouse, '_doMouseDown', 'mousedown', true);
        this.detachFrom(myt.global.focus, '_doGlobalFocusChange', 'focused');
        
        this.setVisible(false);
        if (!ignoreRestoreFocus) this.restoreFocus();
        this.setOwner(null);
    },
    
    /** Sends the focus back to the owner. Can be overridden to
        send the focus elsewhere.
        @returns void */
    restoreFocus: function() {
        if (this.owner) this.owner.focus();
    },
    
    updateLocation: function(panelAnchor) {
        var panelId = this.panelId,
            align = panelAnchor.getFloatingAlignForPanelId(panelId),
            valign = panelAnchor.getFloatingValignForPanelId(panelId),
            alignOffset = panelAnchor.getFloatingAlignOffsetForPanelId(panelId),
            valignOffset = panelAnchor.getFloatingValignOffsetForPanelId(panelId),
            anchorLocation = panelAnchor.getPagePosition(),
            x = 0, y = 0,
            type = typeof align;
        
        if (type === 'string') {
            switch(align) {
                case 'outsideRight':
                    x = anchorLocation.x + panelAnchor.width;
                    break;
                case 'insideRight':
                    x = anchorLocation.x + panelAnchor.width - this.width;
                    break;
                case 'outsideLeft':
                    x = anchorLocation.x - this.width;
                    break;
                case 'insideLeft':
                    x = anchorLocation.x;
                    break;
                default:
                    console.warn("Unexpected align value", type, align);
            }
            
            x += alignOffset;
        } else if (type === 'number') {
            // Absolute position
            x = align;
        } else {
            console.warn("Unexpected align type", type, align);
        }
        this.setX(x);
        
        type = typeof valign;
        
        if (type === 'string') {
            switch(valign) {
                case 'outsideBottom':
                    y = anchorLocation.y + panelAnchor.height;
                    break;
                case 'insideBottom':
                    y = anchorLocation.y + panelAnchor.height - this.height;
                    break;
                case 'outsideTop':
                    y = anchorLocation.y - this.height;
                    break;
                case 'insideTop':
                    y = anchorLocation.y;
                    break;
                default:
                    console.warn("Unexpected valign value", type, valign);
            }
            
            y += valignOffset;
        } else if (type === 'number') {
            // Absolute position
            y = valign;
        } else {
            console.warn("Unexpected valign type", type, valign);
        }
        this.setY(y);
    }
});

(pkg => {
    const consoleWarn = console.warn,
        
        {focus:GlobalFocus, mouse:GlobalMouse, windowResize} = pkg.global,
        
        panelsByPanelId = {}, // A map of FloatingPanel instances by panel ID.
        
        getFloatingPanel = panelId => panelsByPanelId[panelId],
        
        /** Enables a view to act as the anchor point for a FloatingPanel.
            
            Events:
                floatingAlign:string
                floatingValign:string
                floatingAlignOffset:number
                floatingValignOffset:number
            
            Attributes:
                floatingPanelId:string If defined this is the panel ID that will be used by default 
                    in the various methods that require a panel ID.
                floatingAlign:string:number The horizontal alignment for panels shown by this 
                    anchor. If the value is a string it is an alignment identifier relative to this 
                    anchor. If the value is a number it is an absolute position in pixels. Allowed 
                    values: 'outsideLeft', 'insideLeft', 'insideRight', 'outsideRight' or a number.
                floatingValign:string:number The vertical alignment for panels shown by this anchor.
                    If the value is a string it is an alignment identifier relative to this anchor.
                    If the value is a number it is an absolute position in pixels. Allowed values: 
                    'outsideTop', 'insideTop', 'insideBottom', 'outsideBottom' or a number.
                floatingAlignOffset:number The number of pixels to offset the panel position 
                    by horizontally.
                floatingValignOffset:number The number of pixels to offset the panel position 
                    by vertically.
                lastFloatingPanelShown:myt.FloatingPanel A reference to the last floating panel 
                    shown by this anchor.
                keepInWindow:boolean - Indicates if the floating panel must be kept within the
                    bounds of the HTML document. Defaults to false.
                keepInWindowBorder:number - Extra space to take into account when checking if the
                    FloatingPanel would not be kept within the window.
            
            @class */
        FloatingPanelAnchor = pkg.FloatingPanelAnchor = new JS.Module('FloatingPanelAnchor', {
            // Class Methods and Attributes ////////////////////////////////////
            extend: {
                getFloatingPanel:getFloatingPanel
            },
            
            
            // Life Cycle //////////////////////////////////////////////////////
            initNode: function(parent, attrs) {
                this.floatingAlign = 'insideLeft';
                this.floatingValign = 'outsideBottom';
                this.keepInWindow = false;
                this.floatingAlignOffset = this.floatingValignOffset = this.keepInWindowBorder = 0;
                
                this.callSuper(parent, attrs);
            },
            
            
            // Accessors ///////////////////////////////////////////////////////
            setLastFloatingPanelShown: function(v) {this.lastFloatingPanelShown = v;},
            setLastFloatingPanelId: function(v) {this.floatingPanelId = v;},
            
            setFloatingAlign: function(v) {this.set('floatingAlign', v, true);},
            setFloatingValign: function(v) {this.set('floatingValign', v, true);},
            setFloatingAlignOffset: function(v) {this.set('floatingAlignOffset', v, true);},
            setFloatingValignOffset: function(v) {this.set('floatingValignOffset', v, true);},
            
            setKeepInWindow: function(v) {this.set('keepInWindow', v, true);},
            setKeepInWindowBorder: function(v) {this.set('keepInWindowBorder', v, true);},
            
            
            // Methods /////////////////////////////////////////////////////////
            createFloatingPanel: function(panelId, panelClass, panelInitAttrs) {
                panelId = panelId ?? this.floatingPanelId;
                panelInitAttrs = panelInitAttrs ?? {};
                panelInitAttrs.panelId = panelId;
                return panelsByPanelId[panelId] = new panelClass(null, panelInitAttrs);
            },
            
            getFloatingPanel: function(panelId) {
                return getFloatingPanel(panelId ?? this.floatingPanelId);
            },
            
            toggleFloatingPanel: function(panelId) {
                const fp = this.getFloatingPanel(panelId ??= this.floatingPanelId);
                if (fp?.isShown()) {
                    this.hideFloatingPanel(panelId);
                } else {
                    this.showFloatingPanel(panelId);
                }
            },
            
            showFloatingPanel: function(panelId) {
                const fp = this.getFloatingPanel(panelId ?? this.floatingPanelId);
                if (fp) {
                    fp.show(this);
                    this.setLastFloatingPanelShown(fp);
                }
            },
            
            hideFloatingPanel: function(panelId) {
                const fp = this.getFloatingPanel(panelId ?? this.floatingPanelId);
                if (fp) {
                    fp.hide();
                    this.setLastFloatingPanelShown();
                }
            },
            
            /** Called when a floating panel has been shown for this anchor.
                @param {!Object} panel - The myt.FloatingPanel that is now shown.
                @returns {void} */
            notifyPanelShown: function(panel) {
                // Subclasses to implement as needed.
                this.callSuper?.();
            },
            
            /** Called when a floating panel has been hidden for this anchor.
                @param {!Object} panel - The myt.FloatingPanel that is now hidden.
                @returns {void} */
            notifyPanelHidden: function(panel) {
                // Subclasses to implement as needed.
                this.callSuper?.();
            },
            
            /** Called by the FloatingPanel to determine where to position itself horizontally. By 
                default this returns the floatingAlign attribute. Subclasses and instances should 
                override this if panel specific behavior is needed.
                @param {?Object} panel - The panel being positioned.
                @returns {string|number} - An alignment identifer or absolute position. */
            getFloatingAlignForPanel: function(panel) {
                return this.floatingAlign;
            },
            
            /** Called by the FloatingPanel to determine where to position itself vertically. By 
                default this returns the floatingAlign attribute. Subclasses and instances should 
                override this if panel specific behavior is needed.
                @param {?Object} panel - The panel being positioned.
                @returns {string|number} - An alignment identifer or absolute position. */
            getFloatingValignForPanel: function(panel) {
                return this.floatingValign;
            },
            
            /** Called by the FloatingPanel to determine where to position itself horizontally. By 
                default this returns the floatingAlignOffset attribute. Subclasses and instances 
                should override this if panel specific behavior is needed.
                @param {?Object} panel - The panel being positioned.
                @returns {number} the offset to use. */
            getFloatingAlignOffsetForPanel: function(panel) {
                return this.floatingAlignOffset;
            },
            
            /** Called by the FloatingPanel to determine where to position itself vertically. By 
                default this returns the floatingValignOffset attribute. Subclasses and instances 
                should override this if panel specific behavior is needed.
                @param {?Object} panel - The panel being positioned.
                @returns {number} the offset to use. */
            getFloatingValignOffsetForPanel: function(panel) {
                return this.floatingValignOffset;
            },
            
            /** @overrides myt.FocusObservable
                @returns {!Object} The last floating panel shown if it exists and can be shown. 
                    Otherwise it returns the default. */
            getNextFocus: function() {
                const last = this.lastFloatingPanelShown;
                if (last?.isShown()) return last;
                return this.callSuper?.();
            },
            
            /** Called by the floating panel owned by this anchor to determine where to go to next 
                after leaving the panel in the forward direction.
                @param {string} panelId
                @returns {!Object} */
            getNextFocusAfterPanel: function(panelId) {
                return this;
            },
            
            /** Called by the floating panel owned by this anchor to determine where to go to next 
                after leaving the panel in the backward direction.
                @param {string} panelId
                @returns {!Object} */
            getPrevFocusAfterPanel: function(panelId) {
                return this;
            }
        });
    
    /** A panel that floats above everything else.
        
        Attributes:
            owner:myt.FloatingPanelAnchor The anchor that currently "owns" this panel.
            panelId:string The unique ID for this panel instance.
            hideOnMouseDown:boolean If true this panel will be hidden when a mousedown occurs 
                outside the panel. True by default.
            ignoreOwnerForHideOnMouseDown:boolean If true the owner view for this panel will also 
                be ignored for mousedown events. True by default.
            ignoreOwnerForHideOnBlur:boolean If true the owner view for this panel will also be 
                ignored for blur events. True by default.
            hideOnBlur:boolean If true this panel will be hidden when a focus traverses outside 
                the panel. True by default.
        
        @class */
    pkg.FloatingPanel = new JS.Class('FloatingPanel', pkg.View, {
        include: [pkg.RootView],
        
        
        // Life Cycle //////////////////////////////////////////////////////////
        initNode: function(parent, attrs) {
            this.ignoreOwnerForHideOnMouseDown = this.ignoreOwnerForHideOnBlur = this.hideOnBlur = this.hideOnMouseDown = true;
            
            attrs.visible = attrs.focusIndicator = false;
            
            // Ensure the focus starts and ends with the panel
            attrs.focusable = attrs.focusCage = true;
            
            this.callSuper(parent, attrs);
        },
        
        
        // Accessors ///////////////////////////////////////////////////////////
        setOwner: function(v) {this.owner = v;},
        setPanelId: function(v) {this.panelId = v;},
        setIgnoreOwnerForHideOnMouseDown: function(v) {this.ignoreOwnerForHideOnMouseDown = v;},
        setHideOnBlur: function(v) {this.hideOnBlur = v;},
        setHideOnMouseDown: function(v) {this.hideOnMouseDown = v;},
        
        setWidth: function(v) {
            const oldValue = this.width;
            this.callSuper(v);
            if (this.isShown() && (oldValue !== this.width) && this.owner?.keepInWindow) {
                this.updateLocationX(this.owner);
            }
        },
        
        setHeight: function(v) {
            const oldValue = this.height;
            this.callSuper(v);
            if (this.isShown() && (oldValue !== this.height) && this.owner?.keepInWindow) {
                this.updateLocationY(this.owner);
            }
        },
        
        // Methods /////////////////////////////////////////////////////////////
        /** @private
            @param {!Object} event
            @returns {void} */
        __doMouseDown: function(event) {
            const v = event.value, 
                px = v.pageX, 
                py = v.pageY;
            if (!this.containsPoint(px, py) && 
                (this.ignoreOwnerForHideOnMouseDown ? !this.owner.containsPoint(px, py) : true)
            ) {
                this.doMouseDownOutside(true);
            }
            return true;
        },
        
        /** Called when a mousedown occurs outside the floating panel. The default behavior is to 
            hide the panel. This gives subclasses a chance to provide different behavior.
            @param ignoreRestoreFocus:boolean (Optional) If true the restoreFocus method will not 
                be called. Defaults to undefined which is equivalent to false.
            @returns {void} */
        doMouseDownOutside: function(ignoreRestoreFocus) {
            if (this.hideOnMouseDown) this.hide(ignoreRestoreFocus);
        },
        
        /** @overrides myt.FocusObservable
            Intercepts focus on this panel and refocuses to the "best" view. When focus enters the 
            panel we give focus to the first focusable descendant of the panel. When leaving we ask 
            the panel anchor where to give focus. */
        focus: function(noScroll) {
            if (this.owner && this.isAncestorOf(GlobalFocus.focusedView)) {
                this.owner[(GlobalFocus.lastTraversalWasForward ? 'getNext' : 'getPrev') + 'FocusAfterPanel'](this.panelId).focus(noScroll);
            } else {
                const ffv = this.getFirstFocusableDescendant();
                if (ffv === this) {
                    // Process normally since focus is actually being set on the panel.
                    this.callSuper(noScroll);
                } else {
                    ffv.focus(noScroll);
                }
            }
        },
        
        /** Gets the view to give focus to when this panel gets focus. Should be a descendant of 
            the floating panel or the panel itself. Returns this floating panel by default.
            @returns myt.View: The view to give focus to. */
        getFirstFocusableDescendant: function() {
            return this;
        },
        
        /** @private
            @param {!Object} event
            @returns {void} */
        __doFocusChange: function(event) {
            const v = event.value;
            if (v && !this.isAncestorOf(v)) this.doLostFocus();
        },
        
        /** Called when focus moves out of the floating panel. Hides the floating panel by default.
            @returns {void} */
        doLostFocus: function() {
            if (this.hideOnBlur) {
                if (this.ignoreOwnerForHideOnBlur && GlobalFocus.focusedView === this.owner) return;
                
                this.hide(true);
            }
        },
        
        /** Determines if this floating panel is being "shown" or not. Typically this means the 
            floating panel is visible.
            @returns {boolean} True if this panel is shown, otherwise false. */
        isShown: function() {
            return this.visible;
        },
        
        /** Shows the floating panel for the provided myt.FloatingPanelAnchor.
            @param panelAnchor:myt.FloatingPanelAnchor The floating panel anchor to show the 
                panel for.
            @returns {void} */
        show: function(panelAnchor) {
            if (!this.isShown()) {
                this.bringToFront();
                this.updateLocation(panelAnchor);
                this.setVisible(true);
                
                this.owner.notifyPanelShown(this);
                
                this.attachToDom(GlobalMouse, '__doMouseDown', 'mousedown', true);
                this.attachTo(GlobalFocus, '__doFocusChange', 'focused');
            }
        },
        
        /** Hides the floating panel for the provided myt.FloatingPanelAnchor.
            @param ignoreRestoreFocus:boolean (Optional) If true the restoreFocus method will not 
                be called. Defaults to undefined which is equivalent to false.
            @returns {void} */
        hide: function(ignoreRestoreFocus) {
            if (this.isShown()) {
                this.detachFromDom(GlobalMouse, '__doMouseDown', 'mousedown', true);
                this.detachFrom(GlobalFocus, '__doFocusChange', 'focused');
                
                this.setVisible(false);
                this.owner.notifyPanelHidden(this);
                if (!ignoreRestoreFocus) this.restoreFocus();
                this.setOwner();
            }
        },
        
        /** Sends the focus back to the owner. Can be overridden to send the focus elsewhere.
            @returns {void} */
        restoreFocus: function() {
            this.owner?.focus();
        },
        
        /** Updates the x and y position of the floating panel for the provided floating 
            panel anchor.
            @param panelAnchor:myt.FloatingPanelAnchor The anchor to update the location for.
            @returns {void} */
        updateLocation: function(panelAnchor) {
            this.setOwner(panelAnchor);
            this.updateLocationX(panelAnchor);
            this.updateLocationY(panelAnchor);
        },
        
        updateLocationX: function(panelAnchor) {
            const align = panelAnchor.getFloatingAlignForPanel(this),
                type = typeof align;
            let x;
            if (type === 'string') {
                x = panelAnchor.getPagePosition().x + panelAnchor.getFloatingAlignOffsetForPanel(this);
                switch (align) {
                    case 'outsideRight': x += panelAnchor.width; break;
                    case 'insideRight': x += panelAnchor.width - this.width; break;
                    case 'outsideLeft': x -= this.width; break;
                    case 'insideLeft': break;
                    default: consoleWarn('Invalid align value', type, align);
                }
                
                if (panelAnchor.keepInWindow) {
                    const diff = x + this.width + (panelAnchor.keepInWindowBorder || 0) - windowResize.getWidth();
                    if (diff > 0) x -= diff;
                }
            } else if (type === 'number') {
                // Absolute position
                x = align;
            } else {
                consoleWarn('Invalid align type', type, align);
            }
            this.setX(x);
        },
        
        updateLocationY: function(panelAnchor) {
            const valign = panelAnchor.getFloatingValignForPanel(this),
                type = typeof valign;
            let y;
            if (type === 'string') {
                y = panelAnchor.getPagePosition().y + panelAnchor.getFloatingValignOffsetForPanel(this);
                switch (valign) {
                    case 'outsideBottom': y += panelAnchor.height; break;
                    case 'insideBottom': y += panelAnchor.height - this.height; break;
                    case 'outsideTop': y -= this.height; break;
                    case 'insideTop': break;
                    default: consoleWarn('Invalid valign value', type, valign);
                }
                
                if (panelAnchor.keepInWindow) {
                    const diff = y + this.height + (panelAnchor.keepInWindowBorder || 0) - windowResize.getHeight();
                    if (diff > 0) y -= diff;
                }
            } else if (type === 'number') {
                // Absolute position
                y = valign;
            } else {
                consoleWarn('Invalid valign type', type, valign);
            }
            this.setY(y);
        }
    });
})(myt);

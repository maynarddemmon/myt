/** Enables a view to act as the anchor point for a FloatingPanel.
    
    Events:
        floatingAlign:string
        floatingValign:string
        floatingAlignOffset:number
        floatingValignOffset:number
    
    Attributes:
        floatingPanelId:string If defined this is the panel ID that will be
            used by default in the various methods that require a panel ID.
        floatingAlign:string:number The horizontal alignment for panels shown 
            by this anchor. If the value is a string it is an alignment 
            identifier relative to this anchor. If the value is a number it is 
            an absolute position in pixels. Allowed values: 'outsideLeft', 
            'insideLeft', 'insideRight', 'outsideRight' or a number.
        floatingValign:string:number The vertical alignment for panels shown 
            by this anchor. If the value is a string it is an alignment 
            identifier relative to this anchor. If the value is a number it is 
            an absolute position in pixels. Allowed values: 'outsideTop', 
            'insideTop', 'insideBottom', 'outsideBottom' or a number.
        floatingAlignOffset:number The number of pixels to offset the panel
            position by horizontally.
        floatingValignOffset:number The number of pixels to offset the panel
            position by vertically.
        lastFloatingPanelShown:myt.FloatingPanel A reference to the last
            floating panel shown by this anchor.
*/
myt.FloatingPanelAnchor = new JS.Module('FloatingPanelAnchor', {
    // Class Methods and Attributes ////////////////////////////////////////////
    extend: {
        /** A map of FloatingPanel classes by panel ID. */
        classesByPanelId: {},
        
        /** A map of FloatingPanel instances by panel ID. */
        panelsByPanelId: {}
    },
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    initNode: function(parent, attrs) {
        this.floatingAlign = 'insideLeft';
        this.floatingValign = 'outsideBottom';
        this.floatingAlignOffset = this.floatingValignOffset = 0;
        
        this.callSuper(parent, attrs);
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setLastFloatingPanelShown: function(v) {this.lastFloatingPanelShown = v;},
    setLastFloatingPanelId: function(v) {this.floatingPanelId = v;},
    
    setFloatingAlign: function(v) {
        if (this.floatingAlign !== v) {
            this.floatingAlign = v;
            if (this.inited) this.fireNewEvent('floatingAlign', v);
        }
    },
    
    setFloatingValign: function(v) {
        if (this.floatingValign !== v) {
            this.floatingValign = v;
            if (this.inited) this.fireNewEvent('floatingValign', v);
        }
    },
    
    setFloatingAlignOffset: function(v) {
        if (this.floatingAlignOffset !== v) {
            this.floatingAlignOffset = v;
            if (this.inited) this.fireNewEvent('floatingAlignOffset', v);
        }
    },
    
    setFloatingValignOffset: function(v) {
        if (this.floatingValignOffset !== v) {
            this.floatingValignOffset = v;
            if (this.inited) this.fireNewEvent('floatingValignOffset', v);
        }
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    createFloatingPanel: function(panelId, panelClass, panelInitAttrs) {
        panelId = panelId || this.floatingPanelId;
        
        var FPA = myt.FloatingPanelAnchor;
        panelClass = panelClass || FPA.classesByPanelId[panelId];
        if (!panelClass) {
            console.log("No panel class found for panelId:", panelId);
            return null;
        }
        
        panelInitAttrs = panelInitAttrs || {};
        panelInitAttrs.panelId = panelId;
        return FPA.panelsByPanelId[panelId] = new panelClass(null, panelInitAttrs);
    },
    
    getFloatingPanel: function(panelId) {
        return myt.FloatingPanelAnchor.panelsByPanelId[panelId || this.floatingPanelId];
    },
    
    toggleFloatingPanel: function(panelId) {
        panelId = panelId || this.floatingPanelId;
        
        var fp = this.getFloatingPanel(panelId);
        if (fp && fp.isShown()) {
            this.hideFloatingPanel(panelId);
        } else {
            this.showFloatingPanel(panelId);
        }
    },
    
    showFloatingPanel: function(panelId) {
        var fp = this.getFloatingPanel(panelId || this.floatingPanelId);
        if (fp) {
            fp.show(this);
            this.setLastFloatingPanelShown(fp);
        }
    },
    
    hideFloatingPanel: function(panelId) {
        var fp = this.getFloatingPanel(panelId || this.floatingPanelId);
        if (fp) {
            fp.hide();
            this.setLastFloatingPanelShown();
        }
    },
    
    /** Called when a floating panel has been shown for this anchor.
        @param panel:myt.FloatingPanel The panel that is now shown.
        @returns void */
    notifyPanelShown: function(panel) {
        // Subclasses to implement as needed.
    },
    
    /** Called when a floating panel has been hidden for this anchor.
        @param panel:myt.FloatingPanel The panel that is now hidden.
        @returns void */
    notifyPanelHidden: function(panel) {
        // Subclasses to implement as needed.
    },
    
    /** Called by the FloatingPanel to determine where to position itself
        horizontally. By default this returns the floatingAlign attribute. 
        Subclasses and instances should override this if panel specific 
        behavior is needed.
        @param panelId:string the ID of the panel being positioned.
        @returns:string|number an alignment identifer or absolute position. */
    getFloatingAlignForPanelId: function(panelId) {
        return this.floatingAlign;
    },
    
    /** Called by the FloatingPanel to determine where to position itself
        vertically. By default this returns the floatingAlign attribute. 
        Subclasses and instances should override this if panel specific 
        behavior is needed.
        @param panelId:string the ID of the panel being positioned.
        @returns:string|number an alignment identifer or absolute position. */
    getFloatingValignForPanelId: function(panelId) {
        return this.floatingValign;
    },
    
    /** Called by the FloatingPanel to determine where to position itself
        horizontally. By default this returns the floatingAlignOffset attribute. 
        Subclasses and instances should override this if panel specific 
        behavior is needed.
        @param panelId:string the ID of the panel being positioned.
        @returns:number the offset to use. */
    getFloatingAlignOffsetForPanelId: function(panelId) {
        return this.floatingAlignOffset;
    },
    
    /** Called by the FloatingPanel to determine where to position itself
        vertically. By default this returns the floatingValignOffset attribute. 
        Subclasses and instances should override this if panel specific 
        behavior is needed.
        @param panelId:string the ID of the panel being positioned.
        @returns:number the offset to use. */
    getFloatingValignOffsetForPanelId: function(panelId) {
        return this.floatingValignOffset;
    },
    
    /** @overrides myt.FocusObservable
        @returns the last floating panel shown if it exists and can be shown.
        Otherwise it returns the default. */
    getNextFocus: function() {
        var last = this.lastFloatingPanelShown;
        if (last && last.isShown()) return last;
        return this.callSuper ? this.callSuper() : null;
    },
    
    /** Called by the floating panel owned by this anchor to determine where
        to go to next after leaving the panel in the forward direction. */
    getNextFocusAfterPanel: function(panelId) {
        return this;
    },
    
    /** Called by the floating panel owned by this anchor to determine where
        to go to next after leaving the panel in the backward direction. */
    getPrevFocusAfterPanel: function(panelId) {
        return this;
    }
});

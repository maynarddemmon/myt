/** Enables a view to act as the anchor point for a FloatingPanel.
    
    Attributes:
        floatingAlign:string:number the horizontal alignment for panels shown 
            by this anchor. If the value is a string it is an alignment 
            identifier relative to this anchor. If the value is a number it is 
            an absolute position in pixels. Allowed values: 'outsideLeft', 
            'insideLeft', 'insideRight', 'outsideRight' or a number.
        floatingValign:string:number the vertical alignment for panels shown 
            by this anchor. If the value is a string it is an alignment 
            identifier relative to this anchor. If the value is a number it is 
            an absolute position in pixels. Allowed values: 'outsideTop', 
            'insideTop', 'insideBottom', 'outsideBottom' or a number.
        floatingAlignOffset:number the number of pixels to offset the panel
            position by horizontally.
        floatingValignOffset:number the number of pixels to offset the panel
            position by vertically.
        lastFloatingPanelShown:myt.FloatingPanel a reference to the last
            floating panel shown.
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
        if (attrs.floatingAlign === undefined) attrs.floatingAlign = 'insideLeft';
        if (attrs.floatingValign === undefined) attrs.floatingValign = 'outsideBottom';
        if (attrs.floatingAlignOffset === undefined) attrs.floatingAlignOffset = 0;
        if (attrs.floatingValignOffset === undefined) attrs.floatingValignOffset = 0;
        
        this.callSuper(parent, attrs);
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setFloatingAlign: function(v) {
        if (this.floatingAlign === v) return;
        this.floatingAlign = v;
        if (this.inited) this.fireNewEvent('floatingAlign', v);
    },
    
    setFloatingValign: function(v) {
        if (this.floatingValign === v) return;
        this.floatingValign = v;
        if (this.inited) this.fireNewEvent('floatingValign', v);
    },
    
    setFloatingAlignOffset: function(v) {
        if (this.floatingAlignOffset === v) return;
        this.floatingAlignOffset = v;
        if (this.inited) this.fireNewEvent('floatingAlignOffset', v);
    },
    
    setFloatingValignOffset: function(v) {
        if (this.floatingValignOffset === v) return;
        this.floatingValignOffset = v;
        if (this.inited) this.fireNewEvent('floatingValignOffset', v);
    },
    
    setLastFloatingPanelShown: function(v) {
        this.lastFloatingPanelShown = v;
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    createFloatingPanel: function(panelId, panelClass, panelInitAttrs) {
        var fp = myt.FloatingPanelAnchor.panelsByPanelId[panelId];
        
        if (!fp) {
            if (!panelClass) panelClass = myt.FloatingPanelAnchor.classesByPanelId[panelId];
            
            if (!panelClass) {
                console.log("No panel class could be determined for panelId:", panelId);
                return null;
            }
            
            if (!panelInitAttrs) panelInitAttrs = {};
            panelInitAttrs.panelId = panelId;
            fp = myt.FloatingPanelAnchor.panelsByPanelId[panelId] = new panelClass(null, panelInitAttrs);
        }
        
        return fp;
    },
    
    getFloatingPanel: function(panelId) {
        return myt.FloatingPanelAnchor.panelsByPanelId[panelId];
    },
    
    toggleFloatingPanel: function(panelId) {
        var fp = this.getFloatingPanel(panelId);
        if (fp) {
            if (fp.isShown()) {
                this.hideFloatingPanel(panelId);
            } else {
                this.showFloatingPanel(panelId);
            }
        }
    },
    
    showFloatingPanel: function(panelId) {
        var fp = this.getFloatingPanel(panelId);
        if (fp) {
            fp.show(this);
            this.setLastFloatingPanelShown(fp);
        }
    },
    
    hideFloatingPanel: function(panelId) {
        var fp = this.getFloatingPanel(panelId);
        if (fp) {
            fp.hide(this);
            this.setLastFloatingPanelShown(null);
        }
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
        if (this.lastFloatingPanelShown && this.lastFloatingPanelShown.isShown()) {
            return this.lastFloatingPanelShown;
        }
        
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

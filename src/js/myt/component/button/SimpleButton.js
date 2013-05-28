/** A simple implementation of a button. */
myt.SimpleButton = new JS.Class('SimpleButton', myt.View, {
    include: [myt.Button],
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    initNode: function(parent, attrs) {
        this.activeColor = 'transparent';
        this.hoverColor = 'transparent';
        this.readyColor = 'transparent';
        
        this.callSuper(parent, attrs);
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setActiveColor: function(v) {
        if (this.activeColor === v) return;
        this.activeColor = v;
        // No event needed
        if (this.inited) this.updateUI();
    },
    
    setHoverColor: function(v) {
        if (this.hoverColor === v) return;
        this.hoverColor = v;
        // No event needed
        if (this.inited) this.updateUI();
    },
    
    setReadyColor: function(v) {
        if (this.readyColor === v) return;
        this.readyColor = v;
        // No event needed
        if (this.inited) this.updateUI();
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** @overrides myt.Button */
    drawDisabledState: function() {
        this.setOpacity(0.5);
        this.setBgColor(this.readyColor);
    },
    
    /** @overrides myt.Button */
    drawHoverState: function() {
        this.setOpacity(1);
        this.setBgColor(this.hoverColor);
    },
    
    /** @overrides myt.Button */
    drawActiveState: function() {
        this.setOpacity(1);
        this.setBgColor(this.activeColor);
    },
    
    /** @overrides myt.Button */
    drawReadyState: function() {
        this.setOpacity(1);
        this.setBgColor(this.readyColor);
    }
});

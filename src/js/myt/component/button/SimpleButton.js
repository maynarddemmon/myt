/** A simple implementation of a button. */
myt.SimpleButton = new JS.Class('SimpleButton', myt.View, {
    include: [myt.Button],
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    initNode: function(parent, attrs) {
        this.downColor = 'transparent';
        this.overColor = 'transparent';
        this.normalColor = 'transparent';
        
        this.callSuper(parent, attrs);
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setDownColor: function(v) {
        if (this.downColor === v) return;
        this.downColor = v;
        // No event needed
        if (this.inited) this.updateUI();
    },
    
    setOverColor: function(v) {
        if (this.overColor === v) return;
        this.overColor = v;
        // No event needed
        if (this.inited) this.updateUI();
    },
    
    setNormalColor: function(v) {
        if (this.normalColor === v) return;
        this.normalColor = v;
        // No event needed
        if (this.inited) this.updateUI();
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** @overrides myt.Button */
    drawDisabledState: function() {
        this.setOpacity(0.5);
        this.setBgColor(this.normalColor);
    },
    
    /** @overrides myt.Button */
    drawHoverState: function() {
        this.setOpacity(1);
        this.setBgColor(this.overColor);
    },
    
    /** @overrides myt.Button */
    drawActiveState: function() {
        this.setOpacity(1);
        this.setBgColor(this.downColor);
    },
    
    /** @overrides myt.Button */
    drawReadyState: function() {
        this.setOpacity(1);
        this.setBgColor(this.normalColor);
    }
});

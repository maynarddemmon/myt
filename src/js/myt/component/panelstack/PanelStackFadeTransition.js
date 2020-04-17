/** A PanelStackTransition that fades the opacity between the two panels. */
myt.PanelStackFadeTransition = new JS.Class('PanelStackFadeTransition', myt.PanelStackTransition, {
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides */
    initNode: function(parent, attrs) {
        if (attrs.duration == null) attrs.duration = 1000;
        
        this.callSuper(parent, attrs);
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setDuration: function(duration) {this.duration = duration;},
    
    
    // Methods /////////////////////////////////////////////////////////////////
    to: function(panel) {
        return new Promise((resolve, reject) => {
            panel.stopActiveAnimators('opacity');
            panel.setVisible(true);
            panel.animate({attribute:'opacity', to:1, duration:this.duration}).next((success) => {
                panel.makeHighestZIndex();
                resolve(panel);
            });
        });
    },
    
    from: function(panel) {
        return new Promise((resolve, reject) => {
            panel.stopActiveAnimators('opacity');
            panel.animate({attribute:'opacity', to:0, duration:this.duration}).next((success) => {
                panel.setVisible(false);
                resolve(panel);
            });
        });
    }
});

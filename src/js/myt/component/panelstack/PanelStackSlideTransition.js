/** A PanelStackTransition that slides between the from and to panel. */
myt.PanelStackSlideTransition = new JS.Class('PanelStackSlideTransition', myt.PanelStackTransition, {
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides */
    initNode: function(parent, attrs) {
        if (attrs.duration == null) attrs.duration = 1000;
        if (attrs.direction == null) attrs.direction = 'right';
        
        this.callSuper(parent, attrs);
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setDuration: function(duration) {this.duration = duration;},
    setDirection: function(direction) {this.direction = direction;},
    
    
    // Methods /////////////////////////////////////////////////////////////////
    to: function(panel) {
        var promise = this._makePromise(panel);
        
        var panelStack = panel.getPanelStack(),
            toValue, axis;
        switch (this.direction) {
            case 'left':
                axis = 'x';
                toValue = panelStack.width;
                break;
            case 'right':
                axis = 'x';
                toValue = -panelStack.width;
                break;
            case 'up':
                axis = 'y';
                toValue = panelStack.height;
                break;
            case 'down':
                axis = 'y';
                toValue = -panelStack.height;
                break;
        }
        
        panel.stopActiveAnimators(axis);
        panel.set(axis, toValue);
        panel.setVisible(true);
        panel.animate({attribute:axis, to:0, duration:this.duration}).next(function(success) {
            panel.makeHighestZIndex();
            promise.keep();
        });
        
        return promise;
    },
    
    from: function(panel) {
        var promise = this._makePromise(panel);
        
        var panelStack = panel.getPanelStack(),
            toValue, axis;
        switch (this.direction) {
            case 'left':
                axis = 'x';
                toValue = -panelStack.width;
                break;
            case 'right':
                axis = 'x';
                toValue = panelStack.width;
                break;
            case 'up':
                axis = 'y';
                toValue = -panelStack.height;
                break;
            case 'down':
                axis = 'y';
                toValue = panelStack.height;
                break;
        }
        
        panel.stopActiveAnimators(axis);
        panel.animate({attribute:axis, to:toValue, duration:this.duration}).next(function(success) {
            panel.setVisible(false);
            promise.keep();
        });
        
        return promise;
    }
});

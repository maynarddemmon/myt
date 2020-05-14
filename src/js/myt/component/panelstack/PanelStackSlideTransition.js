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
        const panelStack = panel.getPanelStack(),
            duration = this.duration;
        let toValue,
            axis;
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
        
        return new Promise((resolve, reject) => {
            const nextFunc = (success) => {
                panel.makeHighestZIndex();
                resolve(panel);
            };
            if (duration > 0) {
                panel.animate({attribute:axis, to:0, duration:duration}).next(nextFunc);
            } else {
                panel.set(axis, 0);
                nextFunc();
            }
        });
    },
    
    from: function(panel) {
        const panelStack = panel.getPanelStack(),
            duration = this.duration;
        let toValue,
            axis;
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
        
        return new Promise((resolve, reject) => {
            const nextFunc = (success) => {
                panel.setVisible(false);
                resolve(panel);
            };
            if (duration > 0) {
                panel.animate({attribute:axis, to:toValue, duration:duration}).next(nextFunc);
            } else {
                panel.set(axis, toValue);
                nextFunc();
            }
        });
    }
});

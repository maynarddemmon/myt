((pkg) => {
    const JSClass = JS.Class,
    
        /** Use this to implement more complex transitions in a PanelStack.
            
            @class */
        PanelStackTransition = pkg.PanelStackTransition = new JSClass('PanelStackTransition', pkg.Node, {
            // Methods /////////////////////////////////////////////////////////
            /** Called when transitioning to the provided panel.
                The default implementation keeps the promise right away.
                @param panel:myt.StackablePanel
                @returns a promise object that has a next function. */
            to: panel => Promise.resolve(panel),
            
            /** Called when transitioning from the provided panel.
                The default implementation keeps the promise right away.
                @param panel:myt.StackablePanel
                @returns a promise object that has a next function. */
            from: panel => Promise.resolve(panel)
        });
    
    /** Manages a stack of myt.View panel children that can be transitioned to
        an "active" state as they are selected. The active panel will be sized
        to fit the bounds of the stack.
        
        @class */
    // FIXME: handle panel destruction
    // FIXME: handle panel insertion
    pkg.PanelStack = new JSClass('PanelStack', pkg.View, {
        include: [pkg.SelectionManager],
        
        
        // Life Cycle //////////////////////////////////////////////////////////
        /** @overrides myt.View */
        initNode: function(parent, attrs) {
            attrs.overflow = 'hidden';
            
            if (attrs.itemSelectionId == null) attrs.itemSelectionId = 'panelId';
            if (attrs.maxSelected == null) attrs.maxSelected = 1;
            
            this.callSuper(parent, attrs);
            
            this.syncTo(this, '__updateHeight', 'height');
            this.syncTo(this, '__updateWidth', 'width');
        },
        
        
        // Accessors ///////////////////////////////////////////////////////////
        setTransition: function(transition) {this.set('transition', transition, true);},
        
        
        // Methods /////////////////////////////////////////////////////////////
        /** @private
            @param {!Object} event
            @returns {undefined} */
        __updateWidth: function(event) {
            // Only resize the active panel
            const panel = this.getActivePanel();
            if (panel) panel.setWidth(event.value);
        },
        
        /** @private
            @param {!Object} event
            @returns {undefined} */
        __updateHeight: function(event) {
            // Only resize the active panel
            const panel = this.getActivePanel();
            if (panel) panel.setHeight(event.value);
        },
        
        /** Gets the selected panel.
            @returns myt.StackablePanel: The selected panel or undefined if
                none selected. */
        getActivePanel: function() {
            return this.getSelected()[0];
        },
        
        getPanel: function(panelId) {
            return this.getSelectableItem(panelId);
        },
        
        selectPanel: function(panelId) {
            this.selectById(panelId);
        },
        
        /** @overrides myt.SelectionManager */
        doSelected: function(item) {
            item.setWidth(this.width);
            item.setHeight(this.height);
        },
        
        /** Called by a panel when it transitions between selected states. Should
            not be called directly. Instead change the panel selection.
            @param panel:myt.StackablePanel The panel that is transitioning.
            @returns {undefined} */
        doStackTransition: function(panel) {
            this['doStackTransition' + (panel.selected ? 'To' : 'From')](panel);
        },
        
        /** Called by PanelStack.doStackTransition when the provided panel will be 
            the newly selected panel in the stack. Should not be called directly. 
            Instead change the panel selection.
            @param panel:myt.StackablePanel The panel that is transitioning.
            @returns {undefined} */
        doStackTransitionTo: function(panel) {
            const self = this;
            
            self.doBeforeTransitionTo(panel);
            
            const transition = self.transition;
            if (transition) {
                transition.to(panel).then(panel => {self.doAfterTransitionTo(panel);});
            } else {
                panel.makeHighestZIndex();
                panel.setVisible(true);
                
                self.doAfterTransitionTo(panel);
            }
        },
        
        doBeforeTransitionTo: panel => {},
        doAfterTransitionTo: panel => {},
        
        /** Called by PanelStack.doStackTransition when the provided panel will be 
            the newly deselected panel in the stack. Should not be called directly. 
            Instead change the panel selection.
            @param panel:myt.StackablePanel The panel that is transitioning.
            @returns {undefined} */
        doStackTransitionFrom: function(panel) {
            const self = this;
            
            self.doBeforeTransitionFrom(panel);
            
            const transition = self.transition;
            if (transition) {
                transition.from(panel).then(panel => {self.doAfterTransitionFrom(panel);});
            } else {
                panel.setVisible(false);
                self.doAfterTransitionFrom(panel);
            }
        },
        
        doBeforeTransitionFrom: panel => {},
        doAfterTransitionFrom: panel => {}
    });
    
    /** Makes a view act as a panel in a myt.PanelStack.
        
        Attributes:
            panelId:string The unique ID of the panel.
            panelStack:myt.PanelStack A reference to the panel stack this panel
                belongs to. If undefined the parent view will be used.
        
        @class */
    pkg.StackablePanel = new JS.Module('StackablePanel', {
        include: [pkg.Selectable],
        
        
        // Life Cycle //////////////////////////////////////////////////////////
        /** @overrides */
        initNode: function(parent, attrs) {
            attrs.visible = attrs.selected = false;
            
            if (attrs.bgColor == null) attrs.bgColor = '#ffffff';
            if (attrs.panelId == null) attrs.panelId = attrs.name;
            
            this.callSuper(parent, attrs);
            
            if (this.selected) this.doStackTransition();
        },
        
        
        // Accessors ///////////////////////////////////////////////////////////
        setPanelStack: function(v) {this.panelStack = v;},
        
        getPanelStack: function() {
            return this.panelStack || this.parent;
        },
        
        setPanelId: function(v) {this.panelId = v;},
        
        /** @overrides myt.Selectable */
        setSelected: function(v) {
            if (this.selected !== v) {
                this.callSuper(v);
                if (this.inited) this.doStackTransition();
            }
        },
        
        
        // Methods /////////////////////////////////////////////////////////////
        /** Called whenever a transition between panels is initiated by this 
            panel. Default behavior is to defer to the panelStack's 
            doStackTransition method.
            @returns {undefined} */
        doStackTransition: function() {
            this.getPanelStack().doStackTransition(this);
        }
    });
    
    /** A PanelStackTransition that fades the opacity between the two panels.
        
        @class */
    pkg.PanelStackFadeTransition = new JSClass('PanelStackFadeTransition', PanelStackTransition, {
        // Life Cycle //////////////////////////////////////////////////////////
        /** @overrides */
        initNode: function(parent, attrs) {
            if (attrs.duration == null) attrs.duration = 1000;
            
            this.callSuper(parent, attrs);
        },
        
        
        // Accessors ///////////////////////////////////////////////////////////
        setDuration: function(duration) {this.duration = duration;},
        
        
        // Methods /////////////////////////////////////////////////////////////
        to: function(panel) {
            return new Promise((resolve, reject) => {
                panel.stopActiveAnimators('opacity');
                panel.setVisible(true);
                panel.animate({attribute:'opacity', to:1, duration:this.duration}).next(success => {
                    panel.makeHighestZIndex();
                    resolve(panel);
                });
            });
        },
        
        from: function(panel) {
            return new Promise((resolve, reject) => {
                panel.stopActiveAnimators('opacity');
                panel.animate({attribute:'opacity', to:0, duration:this.duration}).next(success => {
                    panel.setVisible(false);
                    resolve(panel);
                });
            });
        }
    });
    
    /** A PanelStackTransition that slides between the from and to panel.
        
        @class */
    pkg.PanelStackSlideTransition = new JSClass('PanelStackSlideTransition', PanelStackTransition, {
        // Life Cycle //////////////////////////////////////////////////////////
        /** @overrides */
        initNode: function(parent, attrs) {
            if (attrs.duration == null) attrs.duration = 1000;
            if (attrs.direction == null) attrs.direction = 'right';
            
            this.callSuper(parent, attrs);
        },
        
        
        // Accessors ///////////////////////////////////////////////////////////
        setDuration: function(duration) {this.duration = duration;},
        setDirection: function(direction) {this.direction = direction;},
        
        
        // Methods /////////////////////////////////////////////////////////////
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
})(myt);

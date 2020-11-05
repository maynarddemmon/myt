((pkg) => {
    const SizeToParent = pkg.SizeToParent;
    
    /** A dimmer that can be placed on another myt.View to obscure the subviews
        of that view.
        
        Events:
            None
        
        Attributes:
            restoreFocus:boolean when true focus will be sent back to the view
                that had focus before the dimmer was shown when the dimmer is
                hidden. Defaults to true.
            prevFocus:myt.View or dom element. The thing to set focus on when
                the dimmer is hidden if restoreFocus is true.
        
        @class */
    pkg.Dimmer = new JS.Class('Dimmer', pkg.View, {
        include: [SizeToParent],
        
        
        // Class Methods and Attributes ////////////////////////////////////////
        extend: {
            DEFAULT_OPACITY: 0.35,
            DEFAULT_COLOR: '#000000'
        },
        
        
        // Life Cycle //////////////////////////////////////////////////////////
        /** @overrides myt.View */
        initNode: function(parent, attrs) {
            const self = this;
            
            self.restoreFocus = true;
            
            attrs.focusable = attrs.focusCage = true;
            
            if (attrs.percentOfParentWidth == null) attrs.percentOfParentWidth = 100;
            if (attrs.percentOfParentHeight == null) attrs.percentOfParentHeight = 100;
            if (attrs.visible == null) attrs.visible = false;
            if (attrs.ignoreLayout == null) attrs.ignoreLayout = true;
            
            self.callSuper(parent, attrs);
            
            // Eat mouse events
            ['mouseover','mouseout','mousedown','mouseup','click','dblclick','mousemove'].forEach((eventName) => {self.attachDomObserver(self, 'eatMouseEvent', eventName);});
            
            pkg.RootView.setupCaptureDrop(self);
        },
        
        /** @overrides myt.View */
        doBeforeAdoption: function() {
            this.callSuper();
            
            const Dimmer = pkg.Dimmer;
            new pkg.View(this, {
                name:'overlay',
                ignorePlacement:true, 
                opacity:Dimmer.DEFAULT_OPACITY,
                bgColor:Dimmer.DEFAULT_COLOR,
                percentOfParentWidth:100,
                percentOfParentHeight:100
            }, [SizeToParent]);
        },
        
        /** @overrides myt.View */
        destroyAfterOrphaning: function() {
            pkg.RootView.teardownCaptureDrop(this);
            
            this.callSuper();
        },
        
        
        // Accessors ///////////////////////////////////////////////////////////
        setRestoreFocus: function(v) {this.restoreFocus = v;},
        
        
        // Methods /////////////////////////////////////////////////////////////
        /** A handler for mouse events that does nothing and prevents propogation.
            @param {!Object} event
            @return boolean True so that the dom event gets eaten. */
        eatMouseEvent: (event) => true,
        
        /** Shows the dimmer and remembers the focus location.
            @returns {undefined} */
        show: function() {
            const self = this,
                gf = pkg.global.focus;
            self.prevFocus = gf.focusedView || gf.focusedDom;
            
            self.makeHighestZIndex();
            
            // Prevent focus traversing
            if (self.focusable) self.focus();
            
            self.setVisible(true);
        },
        
        /** Hides the dimmer and restores focus if necessary.
            @param {boolean} [ignoreRestoreFocus] - When true focus will not be restored.
            @returns {undefined} */
        hide: function(ignoreRestoreFocus) {
            const self = this;
            if (self.visible) {
                self.setVisible(false);
                
                if (!ignoreRestoreFocus && self.restoreFocus && self.prevFocus) self.prevFocus.focus();
            }
        }
    });
})(myt);

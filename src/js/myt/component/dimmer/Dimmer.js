/** A dimmer that can be placed on another myt.View to obscure the subviews of
    that view.
    
    Events:
        None
    
    Attributes:
        restoreFocus:boolean when true focus will be sent back to the view
            that had focus before the dimmer was shown when the dimmer is
            hidden. Defaults to true.
        prevFocus:myt.View or dom element. The thing to set focus on when
            the dimmer is hidden if restoreFocus is true.
*/
myt.Dimmer = new JS.Class('Dimmer', myt.View, {
    include: [myt.SizeToParent],
    
    
    // Class Methods and Attributes ////////////////////////////////////////////
    extend: {
        DEFAULT_OPACITY: 0.35,
        DEFAULT_COLOR: '#000000'
    },
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides myt.View */
    initNode: function(parent, attrs) {
        var self = this;
        
        self.restoreFocus = true;
        
        attrs.focusable = attrs.focusCage = true;
        
        if (attrs.percentOfParentWidth == null) attrs.percentOfParentWidth = 100;
        if (attrs.percentOfParentHeight == null) attrs.percentOfParentHeight = 100;
        if (attrs.visible == null) attrs.visible = false;
        if (attrs.ignoreLayout == null) attrs.ignoreLayout = true;
        
        self.callSuper(parent, attrs);
        
        // Eat mouse events
        self.attachDomObserver(self, 'eatMouseEvent', 'mouseover');
        self.attachDomObserver(self, 'eatMouseEvent', 'mouseout');
        self.attachDomObserver(self, 'eatMouseEvent', 'mousedown');
        self.attachDomObserver(self, 'eatMouseEvent', 'mouseup');
        self.attachDomObserver(self, 'eatMouseEvent', 'click');
        self.attachDomObserver(self, 'eatMouseEvent', 'dblclick');
        self.attachDomObserver(self, 'eatMouseEvent', 'mousemove');
        
        myt.RootView.setupCaptureDrop(self);
    },
    
    /** @overrides myt.View */
    doBeforeAdoption: function() {
        this.callSuper();
        
        var M = myt,
            D = M.Dimmer;
        new M.View(this, {
            name:'overlay', ignorePlacement:true, 
            opacity:D.DEFAULT_OPACITY,
            bgColor:D.DEFAULT_COLOR,
            percentOfParentWidth:100,
            percentOfParentHeight:100
        }, [M.SizeToParent]);
    },
    
    /** @overrides myt.View */
    destroyAfterOrphaning: function() {
        myt.RootView.teardownCaptureDrop(this);
        
        this.callSuper();
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setRestoreFocus: function(v) {this.restoreFocus = v;},
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** A handler for mouse events that does nothing and prevents propogation.
        @param {!Object} event
        @return boolean True so that the dom event gets eaten. */
    eatMouseEvent: function(event) {
        return true;
    },
    
    /** Shows the dimmer and remembers the focus location.
        @returns {undefined} */
    show: function() {
        var self = this,
            gf = myt.global.focus;
        self.prevFocus = gf.focusedView || gf.focusedDom;
        
        self.makeHighestZIndex();
        
        // Prevent focus traversing
        if (self.focusable) self.focus();
        
        self.setVisible(true);
    },
    
    /** Hides the dimmer and restores focus if necessary.
        @returns {undefined} */
    hide: function(ignoreRestoreFocus) {
        this.setVisible(false);
        
        if (!ignoreRestoreFocus && this.restoreFocus && this.prevFocus) this.prevFocus.focus();
    }
});

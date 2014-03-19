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
        this.restoreFocus = true;
        
        attrs.focusable = attrs.focusCage = true;
        
        if (attrs.percentOfParentWidth === undefined) attrs.percentOfParentWidth = 100;
        if (attrs.percentOfParentHeight === undefined) attrs.percentOfParentHeight = 100;
        if (attrs.visible === undefined) attrs.visible = false;
        if (attrs.ignoreLayout === undefined) attrs.ignoreLayout = true;
        
        this.callSuper(parent, attrs);
        
        // Eat mouse events
        this.attachDomObserver(this, 'eatMouseEvent', 'mouseover');
        this.attachDomObserver(this, 'eatMouseEvent', 'mouseout');
        this.attachDomObserver(this, 'eatMouseEvent', 'mousedown');
        this.attachDomObserver(this, 'eatMouseEvent', 'mouseup');
        this.attachDomObserver(this, 'eatMouseEvent', 'click');
        this.attachDomObserver(this, 'eatMouseEvent', 'dblclick');
        this.attachDomObserver(this, 'eatMouseEvent', 'mousemove');
        
        myt.RootView.setupCaptureDrop(this);
    },
    
    /** @overrides myt.View */
    doBeforeAdoption: function() {
        this.callSuper();
        
        var D = myt.Dimmer;
        new myt.View(this, {
            name:'overlay', ignorePlacement:true, 
            opacity:D.DEFAULT_OPACITY,
            bgColor:D.DEFAULT_COLOR,
            percentOfParentWidth:100,
            percentOfParentHeight:100
        }, [myt.SizeToParent]);
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
        @return boolean True so that the dom event gets eaten. */
    eatMouseEvent: function(event) {
        return true;
    },
    
    /** Shows the dimmer and remembers the focus location.
        @returns void */
    show: function() {
        var gf = myt.global.focus;
        this.prevFocus = gf.focusedView || gf.focusedDom;
        
        // Bring to front
        this.setZIndex(this.parent.getHighestChildZIndex(this.domElement) + 1);
        
        // Prevent focus traversing
        if (this.focusable) this.focus();
        
        this.setVisible(true);
    },
    
    /** Hides the dimmer and restores focus if necessary.
        @returns void */
    hide: function() {
        this.setVisible(false);
        
        if (this.restoreFocus && this.prevFocus) this.prevFocus.focus();
    }
});

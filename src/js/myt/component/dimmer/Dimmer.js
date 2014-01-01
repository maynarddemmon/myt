/** A dimmer that can be placed on another myt.View to obscure the subviews of
    that view.
    
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
        attrs.focusable = attrs.focusCage = true;
        
        if (attrs.percentOfParentWidth === undefined) attrs.percentOfParentWidth = 100;
        if (attrs.percentOfParentHeight === undefined) attrs.percentOfParentHeight = 100;
        if (attrs.visible === undefined) attrs.visible = false;
        if (attrs.restoreFocus === undefined) attrs.restoreFocus = true;
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
    eatMouseEvent: function(event) {
        return true;
    },
    
    show: function() {
        var gf = myt.global.focus;
        this.prevFocus = gf.focusedView || gf._focusedDom;
        
        // Set z-index
        var siblings = this.getSiblingViews(), zIdx = 0;
        if (siblings) {
            var i = siblings.length, sibling;
            while (i) {
                sibling = siblings[--i];
                zIdx = Math.max(zIdx, sibling.getHighestZIndex());
            }
        }
        this.setZIndex(++zIdx);
        
        // Prevent focus traversing
        if (this.focusable) this.focus();
        
        this.setVisible(true);
    },
    
    hide: function() {
        this.setVisible(false);
        
        if (this.restoreFocus && this.prevFocus) this.prevFocus.focus();
    }
});

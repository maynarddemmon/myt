/** A base class for tooltip classes. */
myt.BaseTooltip = new JS.Class('BaseTooltip', myt.View, {
    include: [myt.RootView],
    
    
    // Class Methods and Attributes ////////////////////////////////////////////
    extend: {
        /** The length of time in millis before the tip is shown. */
        DEFAULT_TIP_DELAY:500
    },
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    initNode: function(parent, attrs) {
        this.tipDelay = myt.BaseTooltip.DEFAULT_TIP_DELAY;
        
        if (attrs.visible === undefined) attrs.visible = false;
        
        this.callSuper(parent, attrs);
        
        this._checkTipCallback = new myt.Callback('_checkTip', this);
        this._checkTipTimer = new myt.Timer();
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    /** Sets the tooltip info that will be displayed. 
        @param v:object with the following keys:
            parent: (myt.View) The view to show the tip for.
            text: (string) The tip text.
            tipalign: (string) tip alignment, 'left' or 'right'.
            tipvalign: (string) tip vertical alignment, 'above' or 'below'.
    */
    setTooltip: function(v) {
        if (this.inited) {
            this.tooltip = v;
            if (v) this.attachToDom(myt.global.mouse, '__checkMouseMovement', 'mousemove', true);
        }
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    __checkMouseMovement: function(event) {
        this._lastPos = myt.MouseObservable.getMouseFromEvent(event);
        if (this._checkOut()) {
            this._checkTipTimer.clear();
        } else {
            this._checkTipTimer.reset(this._checkTipCallback, this.tipDelay);
        }
    },
    
    /** If the mouse rests in the tip's parent, show the tip */
    _checkTip: function() {
        if (this._checkOut()) return;
        this.showTip();
    },
    
    /** Checks if the last mouse position is outside of the tip's parent
        and if so, the tip will get hidden.
        @returns boolean: true if the tip got hidden, false otherwise. */
    _checkOut: function() {
        var tt = this.tooltip;
        if (tt) {
            var pos = this._lastPos;
            if (tt.parent.containsPoint(pos.x, pos.y)) return false;
        }
        this.hideTip();
        return true;
    },
    
    /** Called when the tip will be hidden. */
    hideTip: function() {
        var ttp = this.tooltip.parent;
        this.detachFromDom(ttp, 'hideTip', 'mousedown', true);
        this.detachFromDom(ttp, 'hideTip', 'mouseup', true);
        this.detachFromDom(myt.global.mouse, '__checkMouseMovement', 'mousemove', true);
        
        this.setVisible(false);
        
        // Don't consume mouse event since we just want to close the tip
        // as a side effect of the user action. The typical case for this is
        // the user clicking on a button while the tooltip for that button
        // is shown.
        return true;
    },
    
    /** Called when the tip will be shown. */
    showTip: function() {
        var ttp = this.tooltip.parent;
        this.attachToDom(ttp, 'hideTip', 'mousedown', true);
        this.attachToDom(ttp, 'hideTip', 'mouseup', true);
        
        this.bringToFront();
        this.setVisible(true);
    }
});

/** A base class for tooltip classes. */
myt.BaseTooltip = new JS.Class('BaseTooltip', myt.View, {
    include: [myt.RootView],
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    initNode: function(parent, attrs) {
        // The length of time before the tip is shown in millis.
        this.tipDelay = 500;
        
        if (attrs.visible === undefined) attrs.visible = false;
        
        this.callSuper(parent, attrs);
        
        this._checkTipCallback = new myt.Callback('_checkTip', this);
        this._checkTipTimer = new myt.Timer();
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    /** Sets the tooltip info that will be displayed. This is an object
        consisting of:
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
    
    /** If the mouse moves out of the tip's parent, hide the tip. */
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
        var tt = this.tooltip;
        var ttp = tt.parent;
        this.detachFromDom(ttp, 'hideTip', 'mousedown', true);
        this.detachFromDom(ttp, 'hideTip', 'mouseup', true);
        this.detachFromDom(myt.global.mouse, '__checkMouseMovement', 'mousemove', true);
        
        this.setVisible(false);
        
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

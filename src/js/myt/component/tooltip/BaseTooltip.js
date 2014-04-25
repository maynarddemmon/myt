/** A base class for tooltip classes.
    
    Events:
        None
    
    Attributes:
        tooltip:object The tooltip configuration assigned to this tooltip
            when the mouse has moved over a view with TooltipMixin.
        tipDelay:number The time in millis to wait before showing the tooltip.
        tipHideDelay:number The time in millis to wait before hiding 
            the tooltip.
    
    Private Attributes:
        __checkTipCallback:myt.Callback The callback invoked by 
            the __checkTipTimer.
        __checkTipTimer:myt.Timer The timer that shows the tooltip if the
            mouse is still over the TooltipMixin view when the delay time
            has passed.
*/
myt.BaseTooltip = new JS.Class('BaseTooltip', myt.View, {
    include: [myt.RootView],
    
    
    // Class Methods and Attributes ////////////////////////////////////////////
    extend: {
        /** The length of time in millis before the tip is shown. */
        DEFAULT_TIP_DELAY:500,
        /** The length of time in millis before the tip is hidden. */
        DEFAULT_TIP_HIDE_DELAY:100
    },
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    initNode: function(parent, attrs) {
        this.tipDelay = this.nextTipDelay = myt.BaseTooltip.DEFAULT_TIP_DELAY;
        this.tipHideDelay = myt.BaseTooltip.DEFAULT_TIP_HIDE_DELAY;
        
        if (attrs.visible === undefined) attrs.visible = false;
        
        this.callSuper(parent, attrs);
        
        this.__checkTipCallback = new myt.Callback('__checkTip', this);
        this.__checkTipTimer = new myt.Timer();
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    /** Sets the tooltip info that will be displayed. 
        @param v:object with the following keys:
            parent:myt.View The view to show the tip for.
            text:string The tip text.
            tipalign:string Tip alignment, 'left' or 'right'.
            tipvalign:string Tip vertical alignment, 'above' or 'below'. */
    setTooltip: function(v) {
        if (this.inited) {
            this.tooltip = v;
            if (v) {
                this.attachToDom(myt.global.mouse, '__checkMouseMovement', 'mousemove', true);
                
                var ttp = v.parent;
                this.attachToDom(ttp, 'hideTip', 'mousedown', true);
                this.attachToDom(ttp, 'hideTip', 'mouseup', true);
            }
        }
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** @private */
    __checkMouseMovement: function(event) {
        this._lastPos = myt.MouseObservable.getMouseFromEvent(event);
        if (!this.__checkOut()) this.__checkTipTimer.reset(this.__checkTipCallback, this.nextTipDelay);
    },
    
    /** If the mouse rests in the tip's parent, show the tip.
        @private
        @returns void */
    __checkTip: function() {
        if (this.__checkOut()) return;
        this.showTip();
    },
    
    /** Checks if the last mouse position is outside of the tip's parent
        and if so, the tip will get hidden.
        @private
        @returns boolean: true if the tip got hidden, false otherwise. */
    __checkOut: function() {
        var tt = this.tooltip;
        if (tt) {
            var pos = this._lastPos;
            if (tt.parent.containsPoint(pos.x, pos.y)) return false;
        }
        this.hideTip();
        return true;
    },
    
    /** Called when the tip will be hidden.
        @returns boolean */
    hideTip: function(event) {
        this.__checkTipTimer.clear();
        
        var ttp = this.tooltip.parent;
        this.detachFromDom(ttp, 'hideTip', 'mousedown', true);
        this.detachFromDom(ttp, 'hideTip', 'mouseup', true);
        this.detachFromDom(myt.global.mouse, '__checkMouseMovement', 'mousemove', true);
        
        this.nextTipDelay = this.tipDelay;
        this.setVisible(false);
        
        // Don't consume mouse event since we just want to close the tip
        // as a side effect of the user action. The typical case for this is
        // the user clicking on a button while the tooltip for that button
        // is shown.
        return true;
    },
    
    /** Called when the tip will be shown.
        @returns void */
    showTip: function() {
        // Don't show tooltips while doing drag and drop since they're
        // distracting while this is going on.
        if (myt.global.dragManager.dragView) return;
        
        this.nextTipDelay = this.tipHideDelay;
        this.bringToFront();
        this.setVisible(true);
    }
});

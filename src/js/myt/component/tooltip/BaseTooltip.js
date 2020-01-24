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
        __checkTipTimerId:number The timer ID used internally for delaying
            when the tip gets shown.
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
        var BTT = myt.BaseTooltip;
        this.tipDelay = this.nextTipDelay = BTT.DEFAULT_TIP_DELAY;
        this.tipHideDelay = BTT.DEFAULT_TIP_HIDE_DELAY;
        
        if (attrs.visible == null) attrs.visible = false;
        
        this.callSuper(parent, attrs);
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
        var self = this;
        self._lastPos = myt.MouseObservable.getMouseFromEvent(event);
        if (self.__checkIn()) {
            self.__clearTimeout();
            self.__checkTipTimerId = setTimeout(
                function() {
                    delete self.__checkTipTimerId;
                    
                    // If the mouse rests in the tip's parent, show the tip.
                    if (self.__checkIn()) self.showTip();
                },
                self.nextTipDelay
            );
        }
    },
    
    /** @private */
    __clearTimeout: function() {
        if (this.__checkTipTimerId) {
            clearTimeout(this.__checkTipTimerId);
            delete this.__checkTipTimerId;
        }
    },
    
    /** Checks if the last mouse position is inside the tip's parent.
        If not inside the tip will also get hidden.
        @private
        @returns boolean: false if the tip got hidden, true otherwise. */
    __checkIn: function() {
        var tt = this.tooltip;
        if (tt) {
            var pos = this._lastPos;
            if (tt.parent.containsPoint(pos.x, pos.y)) return true;
        }
        this.hideTip();
        return false;
    },
    
    /** Called when the tip will be hidden.
        @returns boolean */
    hideTip: function(event) {
        this.__clearTimeout();
        
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
        if (!myt.global.dragManager.getDragView()) {
            this.nextTipDelay = this.tipHideDelay;
            this.bringToFront();
            this.setVisible(true);
        }
    }
});

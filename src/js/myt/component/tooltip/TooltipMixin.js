/** A mixin that adds tooltip support to a view.
    
    Requires myt.MouseOver. */
myt.TooltipMixin = new JS.Module('TooltipMixin', {
    // Class Methods and Attributes ////////////////////////////////////////////
    extend: {
        /** The default class to use for tooltip views. If a project wants to use
            a special tip class everywhere it should override this. */
        DEFAULT_TIP_CLASS:myt.Tooltip
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    /** The text to display in the tooltip. */
    setTooltip: function(v) {
        if (this.tooltip === v) return;
        this.tooltip = v;
        if (this.inited) this.fireNewEvent('tooltip', v);
    },
    
    /** The horizontal alignment of the tooltip. */
    setTipAlign: function(v) {
        if (this.tipAlign === v) return;
        this.tipAlign = v;
        if (this.inited) this.fireNewEvent('tipAlign', v);
    },
    
    /** The vertical alignment of the tooltip. */
    setTipValign: function(v) {
        if (this.tipValign === v) return;
        this.tipValign = v;
        if (this.inited) this.fireNewEvent('tipValign', v);
    },
    
    /** Sets the tooltip class to use. */
    setTipClass: function(v) {
        if (this.tipClass === v) return;
        this.tipClass = v;
        if (this.inited) this.fireNewEvent('tipClass', v);
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** @overrides MouseOverAndDown. */
    doSmoothMouseOver: function(isOver) {
        this.callSuper(isOver);
        
        if (isOver) {
            var tipText = this.tooltip;
            if (tipText) {
                var ttv = this.__getTooltipView(),
                    tipAlign = this.tipAlign,
                    tipValign = this.tipValign;
                ttv.setTooltip({
                    parent:this, 
                    text:tipText, 
                    tipalign:tipAlign ? tipAlign : 'left', 
                    tipvalign:tipValign ? tipValign : 'top'
                });
            }
        }
    },
    
    __getTooltipView: function() {
        // Use configured class or default if none defined.
        var tipClass = this.tipClass ? this.tipClass : myt.TooltipMixin.DEFAULT_TIP_CLASS;
        
        // Destroy tip if it's not the correct class.
        var g = myt.global,
            ttv = g.tooltipView;
        if (ttv && !(ttv instanceof tipClass)) {
            g.unregister(ttv);
            ttv.destroy();
            ttv = null;
        }
        
        // Create new instance.
        if (!ttv) {
            ttv = new tipClass(document.getElementById("tooltipDiv"), {});
            g.register('tooltipView', ttv);
        }
        
        return ttv;
    }
});

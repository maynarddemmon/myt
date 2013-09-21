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
    /** @overrides myt.MouseOver. */
    doSmoothMouseOver: function(isOver) {
        this.callSuper(isOver);
        
        if (isOver && this.tooltip) {
            // Use configured class or default if none defined.
            var tipClass = this.tipClass ? this.tipClass : myt.TooltipMixin.DEFAULT_TIP_CLASS,
                g = myt.global, 
                ttv = g.tooltipView;
            
            // Destroy tip if it's not the correct class.
            if (ttv && !(ttv instanceof tipClass)) {
                g.unregister('tooltipView');
                ttv.destroy();
                ttv = null;
            }
            
            // Create new instance.
            if (!ttv) {
                // Create tooltip div if necessary
                var elem = document.getElementById("tooltipDiv");
                if (!elem) {
                    elem = myt.DomElementProxy.createDomElement('div', {position:'absolute'});
                    document.getElementsByTagName('body')[0].appendChild(elem);
                }
                
                ttv = new tipClass(elem, {domId:'tooltipDiv'});
                g.register('tooltipView', ttv);
            }
            
            ttv.setTooltip({
                parent:this, 
                text:this.tooltip, 
                tipalign:this.tipAlign ? this.tipAlign : 'left', 
                tipvalign:this.tipValign ? this.tipValign : 'top'
            });
        }
    }
});

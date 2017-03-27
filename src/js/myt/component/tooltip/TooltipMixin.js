/** A mixin that adds tooltip support to a view.
    
    Requires:
        myt.MouseOver
    
    Events:
        tooltip:string
        tipAlign:string
        tipValign:string
        tipClass:JS.Class
    
    Attributes:
        tooltip:string The tip text to display.
        tipAlign:string The horizontal alignment of the tooltip relative to
            the view the tip is being shown for. Supported values are 'left'
            and 'right'. Defaults to 'left'.
        tipValign:string The vertical alignment of the tooltip relative to
            the view the tip is being shown for. Supported values are 'above'
            and 'below'. Defaults to 'above'.
        tipClass:JS.Class The class to use to instantiate the tooltip.
*/
myt.TooltipMixin = new JS.Module('TooltipMixin', {
    // Class Methods and Attributes ////////////////////////////////////////////
    extend: {
        /** The default class to use for tooltip views. If a project wants to use
            a special tip class everywhere it should override this. */
        DEFAULT_TIP_CLASS:myt.Tooltip
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setTooltip: function(v) {
        if (this.tooltip !== v) {
            this.tooltip = v;
            if (this.inited) this.fireEvent('tooltip', v);
        }
    },
    
    setTipAlign: function(v) {
        if (this.tipAlign !== v) {
            this.tipAlign = v;
            if (this.inited) this.fireEvent('tipAlign', v);
        }
    },
    
    setTipValign: function(v) {
        if (this.tipValign !== v) {
            this.tipValign = v;
            if (this.inited) this.fireEvent('tipValign', v);
        }
    },
    
    setTipClass: function(v) {
        if (this.tipClass !== v) {
            this.tipClass = v;
            if (this.inited) this.fireEvent('tipClass', v);
        }
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** @overrides myt.MouseOver. */
    doSmoothMouseOver: function(isOver) {
        this.callSuper(isOver);
        
        if (isOver && this.tooltip) {
            // Use configured class or default if none defined.
            var tipClass = this.tipClass || myt.TooltipMixin.DEFAULT_TIP_CLASS,
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
                    myt.getElement().appendChild(elem);
                }
                
                ttv = new tipClass(elem, {domId:'tooltipDiv'});
                g.register('tooltipView', ttv);
            }
            
            ttv.setTooltip({
                parent:this, 
                text:this.tooltip, 
                tipalign:this.tipAlign || 'left', 
                tipvalign:this.tipValign || 'above'
            });
        }
    }
});

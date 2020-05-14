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
        // Supresses the myt.View tooltip behavior.
        this.callSuper('');
        
        this.set('tooltip', v, true);
    },
    setTipAlign: function(v) {this.set('tipAlign', v, true);},
    setTipValign: function(v) {this.set('tipValign', v, true);},
    setTipClass: function(v) {this.set('tipClass', v, true);},
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** @overrides myt.MouseOver. */
    doSmoothMouseOver: function(isOver) {
        const self = this,
            M = myt,
            g = M.global,
            tooltip = self.tooltip;
        
        self.callSuper(isOver);
        
        if (isOver && tooltip) {
            // Use configured class or default if none defined.
            const tipClass = self.tipClass || M.TooltipMixin.DEFAULT_TIP_CLASS;
            let tooltipView = g.tooltipView;
            
            // Destroy tip if it's not the correct class.
            if (tooltipView && !(tooltipView instanceof tipClass)) {
                g.unregister('tooltipView');
                tooltipView.destroy();
                tooltipView = null;
            }
            
            // Create new instance.
            if (!tooltipView) {
                // Create tooltip div if necessary
                let elem = document.getElementById("tooltipDiv");
                if (!elem) {
                    elem = M.DomElementProxy.createDomElement('div', {position:'absolute'});
                    
                    // Make the div a child of the body element so it can be
                    // in front of pretty much anything in the document.
                    M.getElement().appendChild(elem);
                }
                g.register('tooltipView', tooltipView = new tipClass(elem, {domId:'tooltipDiv'}));
            }
            
            tooltipView.setTooltip({
                parent:self, 
                text:tooltip, 
                tipalign:self.tipAlign || 'left', 
                tipvalign:self.tipValign || 'above'
            });
        }
    }
});

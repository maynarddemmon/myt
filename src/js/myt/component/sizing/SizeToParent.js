/** A mixin that sizes a view to a percentage of its parent view.
    
    This is the inverse of a layout since the child is responsible for sizing
    itself to the parent rather than in a layout where the layout positions
    and sizes the children.
    
    Events:
        percentOfParentWidthOffset:number
        percentOfParentHeightOffset:number
        percentOfParentWidth:number
        percentOfParentHeight:number
        
    Attributes:
        percentOfParentWidthOffset:number An additional offset used to adjust
            the width of the parent. Defaults to undefined which is
            equivalent to 0.
        percentOfParentHeightOffset:number An additional offset used to adjust
            the height of the parent. Defaults to undefined which is
            equivalent to 0.
        percentOfParentWidth:number The percent of the parent views width
            to size this views width to. Should be a number between 0 and 100 
            or a negative value which means don't do resizing. Defaults to 
            undefined which is equivalent to a negative value.
        percentOfParentHeight:number The percent of the parent views height
            to size this views height to. Should be a number between 0 and 100 
            or a negative value which means don't do resizing. Defaults to 
            undefined which is equivalent to a negative value.
*/
myt.SizeToParent = new JS.Module('SizeToParent', {
    // Accessors ///////////////////////////////////////////////////////////////
    /** @overrides myt.Node */
    setParent: function(parent) {
        if (this.parent !== parent) {
            if (this.inited) {
                this.__teardownPercentOfParentWidthConstraint();
                this.__teardownPercentOfParentHeightConstraint();
            }
            this.callSuper(parent);
            this.__setupPercentOfParentWidthConstraint();
            this.__setupPercentOfParentHeightConstraint();
        }
    },
    
    setPercentOfParentWidthOffset: function(v) {
        if (this.percentOfParentWidthOffset !== v) {
            this.percentOfParentWidthOffset = v;
            if (this.inited) {
                this.fireNewEvent('percentOfParentWidthOffset', v);
                this.__doPercentOfParentWidth();
            }
        }
    },
    
    setPercentOfParentWidth: function(v) {
        if (this.percentOfParentWidth !== v) {
            if (this.inited) this.__teardownPercentOfParentWidthConstraint();
            this.percentOfParentWidth = v;
            if (this.inited) this.fireNewEvent('percentOfParentWidth', v);
            this.__setupPercentOfParentWidthConstraint();
        }
    },
    
    /** @private */
    __teardownPercentOfParentWidthConstraint: function() {
        if (this.percentOfParentWidth >= 0) this.detachFrom(this.parent, '__doPercentOfParentWidth', 'width');
    },
    
    /** @private */
    __setupPercentOfParentWidthConstraint: function() {
        var p = this.parent;
        if (p && this.percentOfParentWidth >= 0) this.syncTo(p, '__doPercentOfParentWidth', 'width');
    },
    
    /** @private */
    __doPercentOfParentWidth: function(e) {
        this.setWidth((this.percentOfParentWidthOffset || 0) + Math.round(this.parent.width * (this.percentOfParentWidth / 100)));
        // Force width event if not inited yet so that align constraint
        // will work.
        if (!this.inited) this.fireNewEvent('width', this.width);
    },
    
    setPercentOfParentHeightOffset: function(v) {
        if (this.percentOfParentHeightOffset !== v) {
            this.percentOfParentHeightOffset = v;
            if (this.inited) {
                this.fireNewEvent('percentOfParentHeightOffset', v);
                this.__doPercentOfParentHeight();
            }
        }
    },
    
    setPercentOfParentHeight: function(v) {
        if (this.percentOfParentHeight !== v) {
            if (this.inited) this.__teardownPercentOfParentHeightConstraint();
            this.percentOfParentHeight = v;
            if (this.inited) this.fireNewEvent('percentOfParentHeight', v);
            this.__setupPercentOfParentHeightConstraint();
        }
    },
    
    /** @private */
    __teardownPercentOfParentHeightConstraint: function() {
        if (this.percentOfParentHeight >= 0) this.detachFrom(this.parent, '__doPercentOfParentHeight', 'height');
    },
    
    /** @private */
    __setupPercentOfParentHeightConstraint: function() {
        var p = this.parent;
        if (p && this.percentOfParentHeight >= 0) this.syncTo(p, '__doPercentOfParentHeight', 'height');
    },
    
    /** @private */
    __doPercentOfParentHeight: function(e) {
        this.setHeight((this.percentOfParentHeightOffset || 0) + Math.round(this.parent.height * (this.percentOfParentHeight / 100)));
        // Force height event if not inited yet so that valign constraint
        // will work.
        if (!this.inited) this.fireNewEvent('height', this.height);
    }
});

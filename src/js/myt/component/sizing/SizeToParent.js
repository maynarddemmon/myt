/** A mixin that sizes a view to a percentage of its parent view.
    
    This is the inverse of a layout since the child is responsible for sizing
    itself to the parent rather than in a layout where the layout positions
    and sizes the children. */
myt.SizeToParent = new JS.Module('SizeToParent', {
    // Accessors ///////////////////////////////////////////////////////////////
    /** @overrides myt.Node */
    setParent: function(parent) {
        if (this.parent === parent) return;
        if (this.inited) {
            this.__teardownPercentOfParentWidthConstraint();
            this.__teardownPercentOfParentHeightConstraint();
        }
        this.callSuper(parent);
        this.__setupPercentOfParentWidthConstraint();
        this.__setupPercentOfParentHeightConstraint();
    },
    
    setPercentOfParentWidth: function(v) {
        if (this.percentOfParentWidth === v) return;
        if (this.inited) this.__teardownPercentOfParentWidthConstraint();
        this.percentOfParentWidth = v;
        if (this.inited) this.fireNewEvent('percentOfParentWidth', v);
        this.__setupPercentOfParentWidthConstraint();
    },
    
    __teardownPercentOfParentWidthConstraint: function() {
        if (this.percentOfParentWidth >= 0) {
            this.releaseConstraint('__doPercentOfParentWidth');
        }
    },
    
    __setupPercentOfParentWidthConstraint: function() {
        if (this.parent && this.percentOfParentWidth >= 0) {
            this.applyConstraint('__doPercentOfParentWidth', [this.parent, 'width']);
        }
    },
    
    __doPercentOfParentWidth: function(e) {
        this.setWidth(this.parent.width * (this.percentOfParentWidth / 100));
        // Force width event if not inited yet so that align constraint
        // will work.
        if (!this.inited) this.fireNewEvent('width', this.width);
    },
    
    setPercentOfParentHeight: function(v) {
        if (this.percentOfParentHeight === v) return;
        if (this.inited) this.__teardownPercentOfParentHeightConstraint();
        this.percentOfParentHeight = v;
        if (this.inited) this.fireNewEvent('percentOfParentHeight', v);
        this.__setupPercentOfParentHeightConstraint();
    },
    
    __teardownPercentOfParentHeightConstraint: function() {
        if (this.percentOfParentHeight >= 0) {
            this.releaseConstraint('__doPercentOfParentHeight');
        }
    },
    
    __setupPercentOfParentHeightConstraint: function() {
        if (this.parent && this.percentOfParentHeight >= 0) {
            this.applyConstraint('__doPercentOfParentHeight', [this.parent, 'height']);
        }
    },
    
    __doPercentOfParentHeight: function(e) {
        this.setHeight(this.parent.height * (this.percentOfParentHeight / 100));
        // Force height event if not inited yet so that valign constraint
        // will work.
        if (!this.inited) this.fireNewEvent('height', this.height);
    }
});

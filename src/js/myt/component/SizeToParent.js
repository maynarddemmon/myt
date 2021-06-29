((pkg) => {
    const
        setupPercentOfParentWidthConstraint = stp => {
            const p = stp.parent;
            if (p && stp.percentOfParentWidth >= 0) stp.syncTo(p, '__doPOPW', 'width');
        },
        
        teardownPercentOfParentWidthConstraint = stp => {
            if (stp.percentOfParentWidth >= 0) stp.detachFrom(stp.parent, '__doPOPW', 'width');
        },
        
        setupPercentOfParentHeightConstraint = stp => {
            const p = stp.parent;
            if (p && stp.percentOfParentHeight >= 0) stp.syncTo(p, '__doPOPH', 'height');
        },
        
        teardownPercentOfParentHeightConstraint = stp => {
            if (stp.percentOfParentHeight >= 0) stp.detachFrom(stp.parent, '__doPOPH', 'height');
        };
    
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
        
        @class */
    pkg.SizeToParent = new JS.Module('SizeToParent', {
        // Accessors ///////////////////////////////////////////////////////////
        /** @overrides myt.View */
        setParent: function(parent) {
            if (this.parent !== parent) {
                if (this.inited) {
                    teardownPercentOfParentWidthConstraint(this);
                    teardownPercentOfParentHeightConstraint(this);
                }
                this.callSuper(parent);
                setupPercentOfParentWidthConstraint(this);
                setupPercentOfParentHeightConstraint(this);
            }
        },
        
        setPercentOfParentWidthOffset: function(v) {
            if (this.percentOfParentWidthOffset !== v) {
                this.percentOfParentWidthOffset = v;
                if (this.inited) {
                    this.fireEvent('percentOfParentWidthOffset', v);
                    this.__doPOPW();
                }
            }
        },
        
        setPercentOfParentWidth: function(v) {
            if (this.percentOfParentWidth !== v) {
                if (this.inited) teardownPercentOfParentWidthConstraint(this);
                this.percentOfParentWidth = v;
                if (this.inited) this.fireEvent('percentOfParentWidth', v);
                setupPercentOfParentWidthConstraint(this);
            }
        },
        
        setPercentOfParentHeightOffset: function(v) {
            if (this.percentOfParentHeightOffset !== v) {
                this.percentOfParentHeightOffset = v;
                if (this.inited) {
                    this.fireEvent('percentOfParentHeightOffset', v);
                    this.__doPOPH();
                }
            }
        },
        
        setPercentOfParentHeight: function(v) {
            if (this.percentOfParentHeight !== v) {
                if (this.inited) teardownPercentOfParentHeightConstraint(this);
                this.percentOfParentHeight = v;
                if (this.inited) this.fireEvent('percentOfParentHeight', v);
                setupPercentOfParentHeightConstraint(this);
            }
        },
        
        
        // Methods /////////////////////////////////////////////////////////////
        /** @private
            @param {!Object} event
            @returns {undefined} */
        __doPOPW: function(event) {
            this.setWidth((this.percentOfParentWidthOffset || 0) + Math.round(this.parent.width * (this.percentOfParentWidth / 100)));
            // Force width event if not inited yet so that align constraint
            // in myt.View will work.
            if (!this.inited) this.fireEvent('width', this.width);
        },
        
        /** @private
            @param {!Object} event
            @returns {undefined} */
        __doPOPH: function(event) {
            this.setHeight((this.percentOfParentHeightOffset || 0) + Math.round(this.parent.height * (this.percentOfParentHeight / 100)));
            // Force height event if not inited yet so that valign constraint
            // in myt.View will work.
            if (!this.inited) this.fireEvent('height', this.height);
        }
    });
})(myt);

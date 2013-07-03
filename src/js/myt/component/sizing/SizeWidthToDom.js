/** A variation of myt.SizeToDom that sizes the view to the width of the 
    dom element only. */
myt.SizeWidthToDom = new JS.Module('SizeWidthToDom', {
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides myt.View 
        Subclasses should call super. */
    doAfterAdoption: function() {
        this.sizeViewToDom();
        this.__updateBounds(this.width, this.height);
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    /** @overrides myt.View */
    setWidth: function(v) {
        if (v === 'auto') {
            this.__hasSetWidth = false;
            this.deStyle.width = 'auto';
            this.sizeViewToDom();
        } else {
            this.__hasSetWidth = true;
            this.callSuper(v);
        }
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** Call this method after any change to the width of the dom
        element would have occurred.
        @returns void */
    sizeViewToDom: function() {
        if (!this.__hasSetWidth) {
            var bounds = this.domElement.getBoundingClientRect(),
                w = bounds.width;
            
            // Bounding rect doesn't factor in scaling so we need to calculate
            // this ourselves.
            var scaling = myt.TransformSupport.getEffectiveScale(this);
            w /= scaling.scaleX;
            
            // Circumvent setter
            if (this.width !== w) {
                this.width = w;
                if (this.clip) this.__applyClipToDom();
                this.__updateBounds(this.width, this.height);
                this.fireNewEvent('width', w);
            }
        }
    }
});

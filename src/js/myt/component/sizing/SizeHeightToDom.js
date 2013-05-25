/** A variation of myt.SizeToDom that sizes the view to the height of the 
    dom element only. */
myt.SizeHeightToDom = new JS.Module('SizeHeightToDom', {
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides myt.View 
        Subclasses should call super. */
    doAfterAdoption: function() {
        this.sizeViewToDom();
        this.__updateBounds(this.width, this.height);
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    /** @overrides myt.View */
    setHeight: function(v) {
        if (v === 'auto') {
            this.__hasSetHeight = false;
            this.deStyle.height = 'auto';
            this.sizeViewToDom();
        } else {
            this.__hasSetHeight = true;
            this.callSuper(v);
        }
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** Call this method after any change to the height of the dom
        element would have occurred.
        @returns void */
    sizeViewToDom: function() {
        if (!this.__hasSetHeight) {
            var bounds = this.domElement.getBoundingClientRect();
            var h = bounds.height;
            
            // Circumvent setter
            if (this.height !== h) {
                this.height = h;
                if (this.clip) this.__applyClipToDom();
                this.__updateBounds(this.width, this.height);
                this.fireNewEvent('height', h);
            }
        }
    }
});

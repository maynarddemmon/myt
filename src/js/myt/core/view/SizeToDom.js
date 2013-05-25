/** A mixin that sizes the view to the width and height of the dom element. */
myt.SizeToDom = new JS.Module('SizeToDom', {
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
    /** Call this method after any change to the width or height of the dom
        element would have occurred.
        @returns void */
    sizeViewToDom: function() {
        var bounds;
        
        if (!this.__hasSetWidth) {
            if (!bounds) bounds = this.domElement.getBoundingClientRect();
            var w = bounds.width;
            
            // Circumvent setter
            if (this.width !== w) {
                this.width = w;
                if (this.clip) this.__applyClipToDom();
                this.__updateBounds(this.width, this.height);
                this.fireNewEvent('width', w);
            }
        }
        
        if (!this.__hasSetHeight) {
            if (!bounds) bounds = this.domElement.getBoundingClientRect();
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

/** A variation of myt.SizeToDom that sizes the view to the width of the 
    dom element only.
    
    Events:
        None
    
    Attributes:
        width:number:string If a number the behavior is defined by the
            superclass. If a string value of 'auto' is provided sizing to
            the dom will occur. Using 'auto' allows the original SizeToDom
            behavior to be restored after an explicit width has been set.
    
    Private Attributes:
        __hasSetWidth:boolean Indicates the an explicit width has been set
            so that should be used rather than sizing to the dom element.
*/
myt.SizeWidthToDom = new JS.Module('SizeWidthToDom', {
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides myt.View 
        Subclasses should call super. */
    doAfterAdoption: function() {
        this.sizeViewToDom();
        this.callSuper();
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    /** @overrides myt.View */
    setWidth: function(v, supressEvent) {
        if (v === 'auto') {
            this.__hasSetWidth = false;
            this.deStyle.width = 'auto';
            this.sizeViewToDom();
        } else {
            this.__hasSetWidth = true;
            this.callSuper(v, supressEvent);
        }
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** Call this method after any change to the width of the dom
        element would have occurred.
        @returns void */
    sizeViewToDom: function() {
        if (!this.__hasSetWidth) {
            // Bounding rect doesn't factor in scaling so we need to calculate
            // this ourselves.
            var scaling = myt.TransformSupport.getEffectiveScale(this);
            
            var w = this.domElement.getBoundingClientRect().width / scaling.scaleX;
            
            // Circumvent setter
            if (this.width !== w) {
                this.width = w;
                if (this.inited) this.__updateBounds(w, this.height);
                this.fireEvent('width', w);
            }
        }
    }
});

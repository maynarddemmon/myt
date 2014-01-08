/** A variation of myt.SizeToDom that sizes the view to the height of the 
    dom element only.
    
    Events:
        None
    
    Attributes:
        height:number:string If a number the behavior is defined by the
            superclass. If a string value of 'auto' is provided sizing to
            the dom will occur. Using 'auto' allows the original SizeToDom
            behavior to be restored after an explicit height has been set.
    
    Private Attributes:
        __hasSetHeight:boolean Indicates the an explicit height has been set
            so that should be used rather than sizing to the dom element.
*/
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
    setHeight: function(v, supressEvent) {
        if (v === 'auto') {
            this.__hasSetHeight = false;
            this.deStyle.height = 'auto';
            this.sizeViewToDom();
        } else {
            this.__hasSetHeight = true;
            this.callSuper(v, supressEvent);
        }
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** Call this method after any change to the height of the dom
        element would have occurred.
        @returns void */
    sizeViewToDom: function() {
        if (!this.__hasSetHeight) {
            // Bounding rect doesn't factor in scaling so we need to calculate
            // this ourselves.
            var scaling = myt.TransformSupport.getEffectiveScale(this);
            
            var h = this.domElement.getBoundingClientRect().height / scaling.scaleY;
            
            // Circumvent setter
            if (this.height !== h) {
                this.height = h;
                if (this.inited) this.__updateBounds(this.width, this.height);
                this.fireNewEvent('height', h);
            }
        }
    }
});

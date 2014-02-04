/** A mixin that sizes the view to the width and height of the dom element.
    
    Events:
        None
    
    Attributes:
        width:number:string If a number the behavior is defined by the
            superclass. If a string value of 'auto' is provided sizing to
            the dom will occur. Using 'auto' allows the original SizeToDom
            behavior to be restored after an explicit width has been set.
        height:number:string If a number the behavior is defined by the
            superclass. If a string value of 'auto' is provided sizing to
            the dom will occur. Using 'auto' allows the original SizeToDom
            behavior to be restored after an explicit height has been set.
    
    Private Attributes:
        __hasSetWidth:boolean Indicates the an explicit width has been set
            so that should be used rather than sizing to the dom element.
        __hasSetHeight:boolean Indicates the an explicit height has been set
            so that should be used rather than sizing to the dom element.
*/
myt.SizeToDom = new JS.Module('SizeToDom', {
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
    /** Call this method after any change to the width or height of the dom
        element would have occurred.
        @returns void */
    sizeViewToDom: function() {
        var bounds, scaling;
        
        if (!this.__hasSetWidth) {
            bounds = this.domElement.getBoundingClientRect();
            var w = bounds.width;
            
            // Bounding rect doesn't factor in scaling so we need to calculate
            // this ourselves.
            scaling = myt.TransformSupport.getEffectiveScale(this);
            w /= scaling.scaleX;
            
            // Circumvent setter
            if (this.width !== w) {
                this.width = w;
                if (this.inited) this.__updateBounds(w, this.height);
                this.fireNewEvent('width', w);
            }
        }
        
        if (!this.__hasSetHeight) {
            if (!bounds) bounds = this.domElement.getBoundingClientRect();
            var h = bounds.height;
            
            // Bounding rect doesn't factor in scaling so we need to calculate
            // this ourselves.
            if (!scaling) scaling = myt.TransformSupport.getEffectiveScale(this);
            h /= scaling.scaleY;
            
            // Circumvent setter
            if (this.height !== h) {
                this.height = h;
                if (this.inited) this.__updateBounds(this.width, h);
                this.fireNewEvent('height', h);
            }
        }
    }
});

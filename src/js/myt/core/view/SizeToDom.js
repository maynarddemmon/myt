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
    
    @class */
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
            this.getOuterDomStyle().width = 'auto';
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
            this.getOuterDomStyle().height = 'auto';
            this.sizeViewToDom();
        } else {
            this.__hasSetHeight = true;
            this.callSuper(v, supressEvent);
        }
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** Call this method after any change to the width or height of the dom
        element would have occurred.
        @returns {undefined} */
    sizeViewToDom: function() {
        var self = this,
            de,
            scaling,
            w,
            h;
        
        if (!self.__hasSetWidth) {
            de = self.getOuterDomElement();
            w = de.offsetWidth;
            
            // Bounding rect doesn't factor in scaling so we need to calculate
            // this ourselves.
            scaling = self.getEffectiveScale();
            w /= scaling.scaleX;
            
            // Circumvent setter
            if (self.width !== w) {
                self.width = w;
                if (self.inited) self.__updateBounds(w, self.height);
                self.fireEvent('width', w);
            }
        }
        
        if (!self.__hasSetHeight) {
            if (!de) de = self.getOuterDomElement();
            h = de.offsetHeight;
            
            // Bounding rect doesn't factor in scaling so we need to calculate
            // this ourselves.
            if (!scaling) scaling = self.getEffectiveScale();
            h /= scaling.scaleY;
            
            // Circumvent setter
            if (self.height !== h) {
                self.height = h;
                if (self.inited) self.__updateBounds(self.width, h);
                self.fireEvent('height', h);
            }
        }
    }
});

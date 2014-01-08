/** A view that displays an image. By default useNaturalSize is set to true
    so the Image will take on the size of the image data. */
myt.Image = new JS.Class('Image', myt.View, {
    include: [myt.ImageSupport],
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides myt.View */
    initNode: function(parent, attrs) {
        if (attrs.useNaturalSize === undefined) attrs.useNaturalSize = true;
        
        this.callSuper(parent, attrs);
    }
});

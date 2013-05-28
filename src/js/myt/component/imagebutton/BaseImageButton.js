/** A button with images for the background. */
myt.BaseImageButton = new JS.Class('BaseImageButton', myt.View, {
    include: [myt.MouseableH3Panel],
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    initNode: function(parent, attrs) {
        this.imageRoot = myt.IMAGE_ROOT + 'component/imagebutton/rsrc/';
        
        if (attrs.focusable === undefined) attrs.focusable = true;
        if (attrs.focusEmbellishment === undefined) attrs.focusEmbellishment = false;
        
        this.callSuper(parent, attrs);
    }
});

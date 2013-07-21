/** A button that uses an myt.MouseableH3Panel. */
myt.BasePanelButton = new JS.Class('BasePanelButton', myt.View, {
    include: [myt.MouseableH3Panel],
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    initNode: function(parent, attrs) {
        this.imageRoot = myt.IMAGE_ROOT + 'component/panelbutton/rsrc/';
        
        if (attrs.focusable === undefined) attrs.focusable = true;
        
        this.callSuper(parent, attrs);
    }
});

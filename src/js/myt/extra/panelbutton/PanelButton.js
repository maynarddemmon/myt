/** A button that uses an myt.MouseableH3Panel. */
myt.PanelButton = new JS.Class('PanelButton', myt.View, {
    include: [myt.MouseableH3Panel],
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    initNode: function(parent, attrs) {
        this.imageRoot = myt.IMAGE_ROOT + 'component/panelbutton/rsrc/';
        
        this.callSuper(parent, attrs);
    }
});

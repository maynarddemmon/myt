/** An myt.Dimmer that also provides a content panel. */
myt.ModalPanel = new JS.Class('ModalPanel', myt.Dimmer, {
    // Class Methods and Attributes ////////////////////////////////////////////
    extend: {
        DEFAULT_PADDING_X:20,
        DEFAULT_PADDING_Y:15
    },
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    initNode: function(parent, attrs) {
        this.defaultPlacement = 'content';
        
        this.callSuper(parent, attrs);
    },
    
    doBeforeAdoption: function() {
        this.callSuper();
        
        var content = new myt.View(this, {
            name:'content', ignorePlacement:true, align:'center', valign:'middle'
        });
        var MP = myt.ModalPanel;
        new myt.SizeToChildren(content, {
            name:'sizeToChildren', axis:'both',
            paddingX:MP.DEFAULT_PADDING_X, 
            paddingY:MP.DEFAULT_PADDING_Y
        });
    }
});

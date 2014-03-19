/** A separator item in an myt.ListView
    
    Events:
        None
    
    Attributes:
        None
*/
myt.ListViewSeparator = new JS.Class('ListViewSeparator', myt.View, {
    include: [myt.ListViewItemMixin],
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    initNode: function(parent, attrs) {
        if (attrs.height === undefined) attrs.height = 1;
        if (attrs.bgColor === undefined) attrs.bgColor = '#666666';
        
        this.callSuper(parent, attrs);
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** @overrides myt.ListViewItemMixin */
    getMinimumWidth: function() {
        return 0;
    }
});

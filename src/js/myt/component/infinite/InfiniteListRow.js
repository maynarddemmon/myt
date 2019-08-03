/** A mixin for rows in infinite scrolling lists
    
    Events:
        None
    
    Attributes:
        None
    
    Private Attributes:
        None
*/
myt.InfiniteListRow = new JS.Module('InfiniteListRow', {
    include: [myt.Reusable],
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setInfiniteOwner: function(v) {
        this.infiniteOwner = v;
    },
    
    setModel: function(model) {
        this.model = model;
    }
});

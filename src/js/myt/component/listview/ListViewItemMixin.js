/** Defines the interface list view items must support.
    
    Events:
        None
    
    Attributes:
        listView:myt.ListView The list view this item is managed by.
*/
myt.ListViewItemMixin = new JS.Module('ListViewItemMixin', {
    // Accessors ///////////////////////////////////////////////////////////////
    setListView: function(v) {this.listView = v;},
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** Subclasses and/or implementations must implement this method. Should
        return the minimum width the list item needs to display itself.
        @returns number */
    getMinimumWidth: function() {
        return 0;
    },
    
    /** Part of a performance optimization. Called from ListView.__updateItems
        after the items have been inserted into the dom. Now we can actually
        measure text width. */
    syncToDom: function() {}
});

/** A mixin for rows in infinite scrolling lists
    
    Events:
        None
    
    Attributes:
        None
    
    Private Attributes:
        None
*/
myt.SelectableInfiniteListRow = new JS.Module('SelectableInfiniteListRow', {
    include: [myt.InfiniteListRow, myt.Selectable]
});

/** Displays HTML markup and resizes the view to fit the markup.
    
    Attributes:
        html:string The HTML to insert into the view.
*/
myt.Markup = new JS.Class('Markup', myt.View, {
    include: [myt.SizeToDom],
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setHtml: function(v) {
        const self = this;
        if (self.html !== v) {
            self.getInnerDomElement().innerHTML = self.html = v;
            if (self.inited) {
                self.fireEvent('html', v);
                self.sizeViewToDom();
            }
        }
    }
});

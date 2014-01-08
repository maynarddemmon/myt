/** Displays HTML markup and resizes the view to fit the markup.
    
    Attributes:
        html:string The HTML to insert into the view.
*/
myt.Markup = new JS.Class('Markup', myt.View, {
    include: [myt.SizeToDom],
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setHtml: function(v) {
        if (this.html !== v) {
            this.domElement.innerHTML = this.html = v;
            if (this.inited) {
                this.fireNewEvent('html', v);
                this.sizeViewToDom();
            }
        }
    }
});

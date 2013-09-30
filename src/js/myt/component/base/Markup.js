/** Displays HTML markup. */
myt.Markup = new JS.Class('Markup', myt.View, {
    include: [myt.SizeToDom],
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setHtml: function(v) {
        if (this.html === v) return;
        this.domElement.innerHTML = this.html = v;
        if (this.inited) {
            this.fireNewEvent('html', v);
            this.sizeViewToDom();
        }
    }
});

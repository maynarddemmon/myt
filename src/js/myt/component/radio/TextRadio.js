/** A radio button component with a text label. */
myt.TextRadio = new JS.Class('TextRadio', myt.Radio, {
    include: [myt.TextButtonContent, myt.TooltipMixin],
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    initNode: function(parent, attrs) {
        this.callSuper(parent, attrs);
        
        if (!this.shrinkToFit) this.setTextY(myt.TextCheckbox.DEFAULT_MULTILINE_PAD_Y);
    },
    
    doAfterAdoption: function() {
        var padX = myt.TextCheckbox.DEFAULT_PAD_X;
        this.setInset(this.getIconExtentX() + padX);
        this.setOutset(padX);
        
        this.callSuper();
    }
});

/** A radio button component with a text label. */
myt.TextRadio = new JS.Class('TextRadio', myt.Radio, {
    include: [myt.TextButtonContent, myt.TooltipMixin],
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    doAfterAdoption: function() {
        var TC = myt.TextCheckbox, padX = TC.DEFAULT_PAD_X;
        this.setInset(this.getIconExtentX() + padX);
        this.setOutset(padX);
        
        if (!this.shrinkToFit) this.setTextY(TC.DEFAULT_MULTILINE_PAD_Y);
        
        this.callSuper();
    }
});

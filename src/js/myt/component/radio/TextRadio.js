/** A radio button component with a text label. */
myt.TextRadio = new JS.Class('TextRadio', myt.Radio, {
    include: [myt.TextButtonContent],
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    doAfterAdoption: function() {
        var self = this,
            TC = myt.TextCheckbox,
            padX = TC.DEFAULT_PAD_X;
        
        self.setInset(self.getIconExtentX() + padX);
        self.setOutset(padX);
        
        if (!self.shrinkToFit) self.setTextY(TC.DEFAULT_MULTILINE_PAD_Y);
        
        self.callSuper();
    }
});

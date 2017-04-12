/** A checkbox component with a text label. */
myt.TextCheckbox = new JS.Class('TextCheckbox', myt.Checkbox, {
    include: [myt.TextButtonContent],
    
    
    // Class Methods and Attributes ////////////////////////////////////////////
    extend: {
        /** Padding on the left and right side of the text. */
        DEFAULT_PAD_X:2,
        /** Padding above the text when in multiline mode (shrinkToFit == false) */
        DEFAULT_MULTILINE_PAD_Y:4,
    },
    
    
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

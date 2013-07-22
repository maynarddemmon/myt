/** A checkbox component with a text label. */
myt.TextCheckbox = new JS.Class('TextCheckbox', myt.Checkbox, {
    include: [myt.TextButtonContent, myt.TooltipMixin],
    
    
    // Class Methods and Attributes ////////////////////////////////////////////
    extend: {
        /** Padding on the left and right side of the text. */
        DEFAULT_PAD_X:2,
        /** Padding above the text when in multiline mode (shrinkToFit == false) */
        DEFAULT_MULTILINE_PAD_Y:4,
    },
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    initNode: function(parent, attrs) {
        this.callSuper(parent, attrs);
        
        if (!this.shrinkToFit) this.setTextY(myt.TextCheckbox.DEFAULT_MULTILINE_PAD_Y);
    },
    
    doAfterAdoption: function() {
        var padX = myt.TextCheckbox.DEFAULT_PAD_X;
        this.setInset(this.getCheckboxExtentX() + padX);
        this.setOutset(padX);
        
        this.callSuper();
    }
});

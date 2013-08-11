/** An myt.InputText that is also a FormElement. */
myt.FormInputText = new JS.Class('FormInputText', myt.InputText, {
    include: [myt.FormElement],
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides myt.Input */
    initNode: function(parent, attrs) {
        this.callSuper(parent, attrs);
    }
});

/** An myt.InputTextArea that is also a FormElement.
    
    Accelerators:
        Only "reject" from myt.FormInputTextMixin.
    
    Events:
        None
    
    Attributes:
        None
*/
myt.FormInputTextArea = new JS.Class('FormInputTextArea', myt.InputTextArea, {
    include: [myt.FormInputTextMixin],
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** @overrides myt.FormInputTextMixin */
    __handleKeyDown: function(event) {
        // Do nothing so the "accept" accelerator is not invoked.
    },
});

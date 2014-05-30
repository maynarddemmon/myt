/** An myt.EditableText that is also a FormElement.
    
    Events:
        None
    
    Attributes:
        None
*/
myt.FormEditableText = new JS.Class('FormEditableText', myt.EditableText, {
    include: [myt.FormInputTextMixin],
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** @overrides myt.FormInputTextMixin */
    __handleKeyDown: function(event) {
        // Only allow enter key as accelerator if no wrapping is occurring
        if (this.whitespace === 'nowrap') this.callSuper(event);
    },
});

/** An myt.InputText that is also a FormElement.
    
    Events:
        None
    
    Attributes:
        None
*/
myt.FormInputText = new JS.Class('FormInputText', myt.InputText, {
    include: [myt.FormInputTextMixin]
});

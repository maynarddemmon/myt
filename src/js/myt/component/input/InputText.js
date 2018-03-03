/** A view that accepts single line user text input. */
myt.InputText = new JS.Class('InputText', myt.BaseInputText, {
    include: [myt.SizeHeightToDom],
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides myt.Input */
    initNode: function(parent, attrs) {
        this.inputType = attrs.password === true ? 'password' : 'text';
        
        this.callSuper(parent, attrs);
        
        this.setCaretToEnd();
    },
    
    // Accessors ///////////////////////////////////////////////////////////////
    setPassword: function(v) {this.password = v;}
});

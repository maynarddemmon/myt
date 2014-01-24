/** An myt.InputTextArea that is also a FormElement.
    
    Attributes:
        errorColor:color_string The color to use when a validation 
            error exists. Defaults to '#ff9999'.
        actionRequiredColor:color_string The color to use when a validation 
            error exists but the user has not modified the value. Defaults
            to '#996666'.
        normalColor:color_string The color to use when no validation 
            error exists. Defaults to '#999999'.
        validateWhen:string Indicates when to run validation.
            Supported values are:
                key: Validate as the user types.
                blur: Validate when blurring out of the UI control
                blurWithKeyFix: The same as blur except we also validate as 
                    the user types if currently invalid.
                none: Don't do any validation when interacting with the field.
            The default value is 'key'.
*/
myt.FormInputTextArea = new JS.Class('FormInputTextArea', myt.InputTextArea, {
    include: [myt.FormElement, myt.UpdateableUI],
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides myt.Input */
    initNode: function(parent, attrs) {
        this.validateWhen = 'key';
        this.errorColor = '#ff9999';
        this.actionRequiredColor = '#996666';
        this.normalColor = '#999999';
        
        if (attrs.bgColor === undefined) attrs.bgColor = '#ffffff';
        if (attrs.borderWidth === undefined) attrs.borderWidth = 1;
        if (attrs.borderStyle === undefined) attrs.borderStyle = 'solid';
        if (attrs.focusEmbellishment === undefined) attrs.focusEmbellishment = true;
        
        this.callSuper(parent, attrs);
        
        this.addValueProcessor(myt.global.valueProcessors.getValueProcessor('undefToEmpty'));
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setValidateWhen: function(v) {this.validateWhen = v;},
    setErrorColor: function(v) {this.errorColor = v;},
    setActionRequiredColor: function(v) {this.actionRequiredColor = v;},
    setNormalColor: function(v) {this.normalColor = v;},
    
    setIsChanged: function(v) {
        this.callSuper(v);
        if (this.inited) this.updateUI();
    },
    
    setIsValid: function(v) {
        this.callSuper(v);
        if (this.inited) this.updateUI();
    },
    
    /** @overrides myt.FormElement */
    setValue: function(v) {
        var retval = this.callSuper(v);
        
        // Validate as we type.
        var when = this.validateWhen;
        if (when === 'key' || when === 'blurWithKeyFix') this.verifyValidState();
        
        return retval;
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** @overrides myt.FocusObservable */
    doBlur: function() {
        this.callSuper();
        
        // Validate on blur
        var when = this.validateWhen;
        if (when === 'blur' || when === 'blurWithKeyFix') this.verifyValidState();
    },
    
    /** @overrides myt.UpdateableUI */
    updateUI: function() {
        this.setBorderColor(
            this.isValid ? this.normalColor : (this.isChanged ? this.errorColor : this.actionRequiredColor)
        );
    }
});

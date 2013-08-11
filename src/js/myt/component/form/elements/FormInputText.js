/** An myt.InputText that is also a FormElement.
    
    Attributes:
        errorColor:color_string The color to use when a validation 
            error exists.
        actionRequiredColor:color_string The color to use when a validation 
            error exists but the user has not modified the value.
        normalColor:color_string The color to use when no validation 
            error exists.
        validateWhen:string Indicates when to run validation.
            Supported values are:
                key: Validate as the user types.
                blur: Validate when blurring out of the UI control
                blurWithKeyFix: The same as blur except we also validate as 
                    the user types if currently invalid.
                none: Don't do any validation when interacting with the field.
            The default value is 'key'.
*/
myt.FormInputText = new JS.Class('FormInputText', myt.InputText, {
    include: [myt.FormElement, myt.UpdateableUI],
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides myt.Input */
    initNode: function(parent, attrs) {
        if (attrs.validateWhen === undefined) attrs.validateWhen = 'key';
        if (attrs.errorColor === undefined) attrs.errorColor = '#ff9999';
        if (attrs.actionRequiredColor === undefined) attrs.actionRequiredColor = '#996666';
        if (attrs.normalColor === undefined) attrs.normalColor = '#999999';
        
        if (attrs.focusEmbellishment === undefined) attrs.focusEmbellishment = true;
        
        this.callSuper(parent, attrs);
        
        this.addValueProcessor(myt.global.valueProcessors.getValueProcessor('undefToEmpty'));
        
        this.attachToDom(this, '_handleKeyDown', 'keydown');
        this.attachToDom(this, '_handleKeyUp', 'keyup');
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
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
    showFocusEmbellishment: function() {
        this.hideDefaultFocusEmbellishment();
        this.setStyleProperty('boxShadow', myt.Button.DEFAULT_FOCUS_SHADOW_PROPERTY_VALUE);
    },
    
    hideFocusEmbellishment: function() {
        this.hideDefaultFocusEmbellishment();
        this.setStyleProperty('boxShadow', 'none');
    },
    
    _handleKeyDown: function(event) {
        if (!this.disabled) {
            if (myt.KeyObservable.getKeyCodeFromEvent(event) === 13) { // Enter key
                this.getRootForm().invokeAccelerator("submit");
            }
        }
    },
    
    _handleKeyUp: function(event) {
        if (!this.disabled) {
            if (myt.KeyObservable.getKeyCodeFromEvent(event) === 27) { // Esc key
                this.getRootForm().invokeAccelerator("cancel");
            }
        }
    },
    
    /** @overrides myt.FocusObservable */
    doBlur: function() {
        this.callSuper();
        
        // Validate on blur
        var when = this.validateWhen;
        if (when === 'blur' || when === 'blurWithKeyFix') this.verifyValidState();
    },
    
    /** @overrides myt.UpdateableUI */
    updateUI: function() {
        var color;
        if (this.isValid) {
            color = this.normalColor;
        } else {
            color = this.isChanged ? this.errorColor : this.actionRequiredColor;
        }
        this.setCSSBorder([1, 'solid', color]);
    }
});

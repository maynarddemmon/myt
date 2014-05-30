/** An myt.InputText that is also a FormElement.
    
    Accelerators:
        accept: Invokes the doAccept function. Activated upon key down of
            the ENTER key.
        reject: Invokes the doReject function. Activated upon key up of 
            the ESC key.
    
    Events:
        None
    
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
        acceleratorScope:string The scope the accelerators will be applied to.
            Supported values are:
                element: Take action on this element only
                root: Take action on the root form.
                none: Take no action.
            The default value is 'element'.
*/
myt.FormInputText = new JS.Class('FormInputText', myt.InputText, {
    include: [myt.FormElement, myt.UpdateableUI],
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides myt.Input */
    initNode: function(parent, attrs) {
        this.acceleratorScope = 'element';
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
        
        this.attachToDom(this, '__handleKeyDown', 'keydown');
        this.attachToDom(this, '__handleKeyUp', 'keyup');
        
        this.addAccelerator('accept', this.doAccept);
        this.addAccelerator('reject', this.doReject);
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setValidateWhen: function(v) {this.validateWhen = v;},
    setAcceleratorScope: function(v) {this.acceleratorScope = v;},
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
    doAccept: function() {
        if (!this.disabled) {
            switch (this.acceleratorScope) {
                case 'root':
                    this.getRootForm().invokeAccelerator("submit");
                    break;
                case 'element':
                    // Tab navigate forward
                    myt.global.focus.next(false);
                    break;
                case 'none':
                default:
            }
        }
    },
    
    doReject: function() {
        if (!this.disabled) {
            switch (this.acceleratorScope) {
                case 'root':
                    this.getRootForm().invokeAccelerator("cancel");
                    break;
                case 'element':
                    this.rollbackForm();
                    this.getRootForm().doValidation();
                    if (this.form) this.form.verifyChangedState(this);
                    break;
                case 'none':
                default:
            }
        }
    },
    
    /** @private */
    __handleKeyDown: function(event) {
        if (myt.KeyObservable.getKeyCodeFromEvent(event) === 13) this.invokeAccelerator("accept");
    },
    
    /** @private */
    __handleKeyUp: function(event) {
        if (myt.KeyObservable.getKeyCodeFromEvent(event) === 27) this.invokeAccelerator("reject");
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
        this.setBorderColor(
            this.isValid ? this.normalColor : (this.isChanged ? this.errorColor : this.actionRequiredColor)
        );
    }
});

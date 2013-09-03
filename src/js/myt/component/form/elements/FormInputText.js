/** An myt.InputText that is also a FormElement.
    
    Attributes:
        errorColor:color_string The color to use when a validation 
            error exists.
        actionRequiredColor:color_string The color to use when a validation 
            error exists but the user has not modified the value.
        normalColor:color_string The color to use when no validation 
            error exists.
        borderSize:number The size of the border to draw.
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
        if (attrs.validateWhen === undefined) attrs.validateWhen = 'key';
        if (attrs.errorColor === undefined) attrs.errorColor = '#ff9999';
        if (attrs.actionRequiredColor === undefined) attrs.actionRequiredColor = '#996666';
        if (attrs.normalColor === undefined) attrs.normalColor = '#999999';
        if (attrs.acceleratorScope === undefined) attrs.acceleratorScope = 'element';
        if (attrs.borderSize === undefined) attrs.borderSize = 1;
        
        if (attrs.focusEmbellishment === undefined) attrs.focusEmbellishment = true;
        
        this.callSuper(parent, attrs);
        
        this.addValueProcessor(myt.global.valueProcessors.getValueProcessor('undefToEmpty'));
        
        this.attachToDom(this, '_handleKeyDown', 'keydown');
        this.attachToDom(this, '_handleKeyUp', 'keyup');
        
        this.addAccelerator('accept', this.doAccept);
        this.addAccelerator('reject', this.doReject);
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
    
    setBorderSize: function(v) {this.borderSize = v;},
    setAcceleratorScope: function(v) {this.acceleratorScope = v;},
    
    
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
    
    showFocusEmbellishment: function() {
        this.hideDefaultFocusEmbellishment();
        this.setBoxShadow(myt.Button.DEFAULT_FOCUS_SHADOW_PROPERTY_VALUE);
    },
    
    hideFocusEmbellishment: function() {
        this.hideDefaultFocusEmbellishment();
        this.setBoxShadow();
    },
    
    _handleKeyDown: function(event) {
        if (myt.KeyObservable.getKeyCodeFromEvent(event) === 13) this.invokeAccelerator("accept");
    },
    
    _handleKeyUp: function(event) {
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
        var color;
        if (this.isValid) {
            color = this.normalColor;
        } else {
            color = this.isChanged ? this.errorColor : this.actionRequiredColor;
        }
        this.setCSSBorder([this.borderSize, 'solid', color]);
    }
});

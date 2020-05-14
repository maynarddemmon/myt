/** An myt.ComboBox that is also a FormElement.
    
    Events:
        None
    
    Attributes:
        None
*/
myt.FormComboBox = new JS.Class('FormComboBox', myt.ComboBox, {
    include: [myt.FormElement, myt.UpdateableUI],
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides myt.Input */
    initNode: function(parent, attrs) {
        this.acceleratorScope = 'element';
        this.validateWhen = 'key';
        this.errorColor = '#ff9999';
        this.actionRequiredColor = '#996666';
        this.normalColor = '#999999';
        
        this.callSuper(parent, attrs);
        
        this.addValueProcessor(myt.global.valueProcessors.getValueProcessor('undefToEmpty'));
        
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
        const retval = this.callSuper(v);
        
        // Validate as we type.
        const when = this.validateWhen;
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
    
    notifyPanelShown: function(panel) {
        this._isShown = true;
    },
    
    notifyPanelHidden: function(panel) {
        this._isShown = false;
    },
    
    /** @overrides myt.ListViewAnchor. */
    doActivationKeyDown: function(key, isRepeat) {
        if (key === 27 && !this._isShown) {
            this.invokeAccelerator("reject");
        } else {
            this.callSuper(key, isRepeat);
        }
    },
    
    /** @overrides myt.ListViewAnchor. */
    doActivationKeyUp: function(key) {
        if (key === 13 && !this._isShown) {
            this.invokeAccelerator("accept");
        } else {
            this.callSuper(key);
        }
    },
    
    /** @overrides myt.FocusObservable */
    doBlur: function() {
        this.callSuper();
        
        // Validate on blur
        const when = this.validateWhen;
        if (when === 'blur' || when === 'blurWithKeyFix') this.verifyValidState();
    },
    
    /** @overrides myt.UpdateableUI */
    updateUI: function() {
        this.setBorderColor(
            this.isValid ? this.normalColor : (this.isChanged ? this.errorColor : this.actionRequiredColor)
        );
    }
});

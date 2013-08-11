/** Provides "form" functionality to a node. Forms can be nested to build
    up larger forms from one or more subforms.
    
    Attributes:
        id:string The unique ID for this form relative to its parent form.
        form:myt.Form a reference to the parent form if it exists.
        errorMessages:array A list of error messages that occurred during the
            last execution of doValidation.
        isValid:boolean Indicates if the data in this form is valid or not.
        isChanged:boolean Indicates if the data in this form is different
            from the rollback value or not.
        _lockCascade:boolean Prevents changes to "isChanged" and "isValid" 
            from cascading upwards to the parent form. Used during reset 
            and rollback.
        _subForms:object A map of child forms/elements by ID.
        _validators:array A list of validators to apply to this form.
        _accelerators:object A map of method references by accelerator 
            identifier. The values will be function references. An intended 
            use of these is to submit or cancel a form by keystroke.
*/
myt.Form = new JS.Module('Form', {
    // Life Cycle //////////////////////////////////////////////////////////////
    initNode: function(parent, attrs) {
        this.isChanged = this._lockCascade = false;
        this.isValid = true;
        
        this._subForms = {};
        this._validators = [];
        this._accelerators = {};
        
        this.callSuper(parent, attrs);
        
        if (this.form) this.form.addSubForm(this);
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setErrorMessages: function(v) {this.errorMessages = v;},
    
    setId: function(v) {
        if (this.id === v) return;
        this.id = v;
        
        var pf = this.form;
        if (this.inited && pf) {
            pf.removeSubForm(this);
            pf.addSubForm(this);
        }
    },
    
    setForm: function(v) {
        if (this.form !== v) {
            var existingForm = this.form;
            this.form = v;
            if (existingForm) existingForm.removeSubForm(this);
            if (this.inited && v) v.addSubForm(this);
        }
    },
    
    setIsValid: function(v) {
        // Don't abort when value hasn't changed. The reason this form is
        // invalid may have changed so we want an event to fire so any new
        // error messages can be shown.
        this.isValid = v;
        if (this.inited) this.fireNewEvent('isValid', v);
        
        var pf = this.form;
        if (pf && !this._lockCascade) {
            if (v) {
                pf.verifyValidState(this);
            } else {
                pf.notifySubFormInvalid();
            }
        }
    },
    
    setIsChanged: function(v) {
        if (this.isChanged === v) return;
        this.isChanged = v;
        if (this.inited) this.fireNewEvent('isChanged', v);
        
        var pf = this.form;
        if (pf && !this._lockCascade) {
            if (v) {
                pf.notifySubFormChanged();
            } else {
                pf.verifyChangedState(this);
            }
        }
    },
    
    /** Allows bulk setting of validators.
        @param validators:array An array of myt.Validator instances or
            IDs of validators from the myt.global.validators registry.
        @returns void */
    setValidators: function(validators) {
        var i = validators.length, validator;
        while (i) {
            validator = validators[--i];
            if (!(validator instanceof myt.Validator)) {
                validator = validators[i] = myt.global.validators.getValidator(validator);
                if (!validator) validators.splice(i, 1);
            }
        }
        
        this._validators = validators;
    },
    
    /** Gets the value of this form. For a form this will be a map of
        all the subform values by ID. Form elements should override this
        to return an element specific value.
        @returns object */
    getValue: function() {
        // Allow for superclass to have custom getValue behavior.
        if (this.callSuper) return this.callSuper();
        
        // Only do "form" behavior for true forms, not for form elements.
        if (this.isA(myt.FormElement)) {
            return this.value;
        } else {
            var retval = {}, subForms = this._subForms, id;
            for (id in subForms) retval[id] = subForms[id].getValue();
            return retval;
        }
    },
    
    /** Sets the value of this form. For a form the value should be a map
        containing values for each of the subform elements. The entries in
        the map will be applied to each of the subforms.
        @param value:object the value to set.
        @returns the value that was actually set. */
    setValue: function(value) {
        // Allow for superclass to have custom setValue behavior.
        if (this.callSuper) this.callSuper(value);
        
        // Only do "form" behavior for true forms, not for form elements.
        if (typeof value === 'object' && !this.isA(myt.FormElement)) {
            var subform, id;
            for (id in value) {
                subform = this.getSubForm(id);
                if (subform) {
                    value[id] = subform.setValue(value[id]);
                } else {
                    console.warn("ID in setValue for non-existant subform", id);
                }
            }
        }
        return value;
    },
    
    /** Gets the default value of this form. For a form this will be a map of
        all the subform default values by ID. Form elements should override this
        to return an element specific default value.
        @returns object */
    getDefaultValue: function() {
        var retval = {}, subForms = this._subForms, id;
        for (id in subForms) retval[id] = subForms[id].getDefaultValue();
        return retval;
    },
    
    /** Sets the default value of this form. For a form the value should be a 
        map containing default values for each of the subform elements. The 
        entries in the map will be applied to each of the subforms.
        @param value:object the value to set.
        @returns the value that was actually set. */
    setDefaultValue: function(value) {
        if (typeof value === 'object') {
            var subform, id;
            for (id in value) {
                subform = this.getSubForm(id);
                if (subform) {
                    value[id] = subform.setDefaultValue(value[id]);
                } else {
                    console.warn("ID in setDefaultValue for non-existant subform", id);
                }
            }
        }
        return value;
    },
    
    /** Gets the rollback value of this form. For a form this will be a map of
        all the subform rollback values by ID. Form elements should override this
        to return an element specific rollback value.
        @returns object */
    getRollbackValue: function() {
        var retval = {}, subForms = this._subForms, id;
        for (id in subForms) retval[id] = subForms[id].getRollbackValue();
        return retval;
    },
    
    /** Sets the rollback value of this form. For a form the value should be a 
        map containing rollback values for each of the subform elements. The 
        entries in the map will be applied to each of the subforms.
        @param value:object the value to set.
        @returns the value that was actually set. */
    setRollbackValue: function(value) {
        if (typeof value === 'object') {
            var subform, id;
            for (id in value) {
                subform = this.getSubForm(id);
                if (subform) {
                    value[id] = subform.setRollbackValue(value[id]);
                } else {
                    console.warn("ID in setRollbackValue for non-existant subform", id);
                }
            }
        }
        return value;
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** Add an accelerator to this form.
        @param id:string the ID for the accelerator.
        @param func:function the function to call when the accelerator 
            is invoked.
        @returns void */
    addAccelerator: function(id, func) {
        this._accelerators[id] = func;
    },
    
    /** Removes an accelerator from this form.
        @param id:string the ID for the accelerator.
        @returns void */
    removeAccelerator: function(id) {
        delete this._accelerators[id];
    },
    
    /** Executes an accelerator in this form with the provided ID.
        @param id:string The ID of the accelerator to invoke.
        @param value:* (optional) The value to pass to the function.
        @returns void */
    invokeAccelerator: function(id, value) {
        if (value === undefined) value = null;
        var accelerator = this._accelerators[id];
        if (accelerator) accelerator.call(this, value);
    },
    
    /** Adds a validator to this form.
        @param validator:myt.Validator The validator to add.
        @returns void */
    addValidator: function(validator) {
        if (validator) this._validators.push(validator);
    },
    
    /** Removes a validator from this form.
        @param id:string The ID of the validator to remove.
        @returns the removed myt.Validator or null if not found. */
    removeValidator: function(id) {
        if (id) {
            var validators = this._validators, i = validators.length, validator;
            while (i) {
                validator = validators[--i];
                if (validator.id === id) {
                    validators.splice(i, 1);
                    return validator;
                }
            }
        }
        return null;
    },
    
    /** Gets the oldest ancestor form of this form or the form itself.
        @returns myt.Form */
    getRootForm: function() {
        return this.form ? this.form.getRootForm() : this;
    },
    
    /** Adds an myt.Form to this form.
        @param subform:myt.Form the form to add as a subform.
        @returns void */
    addSubForm: function(subform) {
        var id = subform.id;
        if (this.getSubForm(id) != null) {
            console.warn("ID in use for subform, add aborted.", id, subform);
            return;
        }
        
        subform.setForm(this);
        this._subForms[id] = subform;
        
        if (subform.isChanged) this.notifySubFormChanged();
        if (!subform.isValid) this.notifySubFormInvalid();
    },
    
    /** Removes the subform with the provided ID from this form.
        @param id:string The ID of the form to remove.
        @returns myt.Form or undefined if not found. */
    removeSubForm: function(id) {
        var subform = this.getSubForm(id);
        if (subform) {
            subform.setForm(null);
            delete this._subForms[id];
            this.verifyChangedState();
            this.verifyValidState();
        }
        return subform;
    },
    
    /** Gets the subform with the provided ID from this form.
        @param id:string The ID of the form to get.
        @returns myt.Form or undefined if not found. */
    getSubForm: function(id) {
        return this._subForms[id];
    },
    
    /** Gets all error messages from the entire form tree.
        @returns array of error messages strings. */
    getAllErrorMessages: function() {
        var msgs = this.errorMessages.concat(), subForms = this._subForms, id;
        for (id in subForms) msgs = msgs.concat(subForms[id].getAllErrorMessages());
        return msgs;
    },
    
    /** Called when a subform changes to the "invalid" state.
        @returns void */
    notifySubFormInvalid: function() {
        this.setIsValid(false);
    },
    
    /** Tests if this form is valid or not and updates the isValid attribute 
        if necessary. Allows upwards cascade of validity.
        @param subformToIgnore:myt.Form (optional) A subform that will not
            be checked for validity. This is typically the subform that is
            invoking this method.
        @returns boolean true if this form is valid, false otherwise. */
    verifyValidState: function(subformToIgnore) {
        var isValid = true, subForms = this._subForms, subform, id;
        for (id in subForms) {
            subform = subForms[id];
            if (subform !== subformToIgnore) isValid = subform.isValid && isValid;
        }
        return this._applyValidation(isValid);
    },
    
    /** Tests if this form is valid or not. Performs a top down validation 
        check across the entire form tree. Does not allow upwards cascade of
        validity check since this is intended to be a top down check.
        @returns boolean true if this form is valid, false otherwise. */
    doValidation: function() {
        var isValid = true, subForms = this._subForms, id;
        for (id in subForms) isValid = subForms[id].doValidation() && isValid;
        
        this._lockCascade = true;
        isValid = this._applyValidation(isValid);
        this._lockCascade = false;
        
        return isValid;
    },
    
    /** Runs the validators on this form.
        @returns boolean true if this form is valid, false otherwise. */
    _applyValidation: function(isValid) {
        var validators = this._validators, len = validators.length, 
            errorMessages = [], i = 0;
        for (; len > i; i++) isValid = validators[i].isFormValid(this, null, errorMessages) && isValid;
        
        this.setErrorMessages(errorMessages);
        this.setIsValid(isValid);
        
        return isValid;
    },
    
    /** Called when a subform changed to the "changed" state.
        @returns void */
    notifySubFormChanged: function() {
        this.setIsChanged(true);
    },
    
    /** Tests if this form is changed or not and updates the isChanged 
        attribute if necessary. Allows upwards cascade of changed state.
        @param subformToIgnore:myt.Form (optional) A subform that will not
            be checked for changed state. This is typically the subform that is
            invoking this method.
        @returns boolean true if this form is changed, false otherwise. */
    verifyChangedState: function(subformToIgnore) {
        var isChanged = false, subForms = this._subForms, subform, id;
        for (id in subForms) {
            subform = subForms[id];
            if (subform !== subformToIgnore) isChanged = subform.isChanged || isChanged;
        }
        this.setIsChanged(isChanged);
        return isChanged;
    },
    
    /** Initializes the form to the provided values.
        @param defaultValue:object The default value.
        @param rollbackValue:object The rollback value.
        @param value:object The current value.
        @returns void */
    setup: function(defaultValue, rollbackValue, value) {
        this._lockCascade = true;
        this.setIsChanged(false);
        this.setErrorMessages([]);
        this.setIsValid(true);
        this._lockCascade = false;
        
        if (typeof defaultValue === 'object' && 
            typeof rollbackValue === 'object' && 
            typeof value === 'object'
        ) {
            var subForms = this._subForms, id;
            for (id in subForms) subForms[id].setup(defaultValue[id], rollbackValue[id], value[id]);
        }
    },
    
    /** Resets this form to the default values.
        @returns void */
    resetForm: function() {
        this._lockCascade = true;
        
        var subForms = this._subForms, id;
        for (id in subForms) subForms[id].resetForm();
        
        this.setIsChanged(false);
        this.setErrorMessages([]);
        this.setIsValid(true);
        
        this._lockCascade = false;
    },
    
    /** Rolls back this form to the rollback values.
        @returns void */
    rollbackForm: function() {
        this._lockCascade = true;
        
        var subForms = this._subForms, id;
        for (id in subForms) subForms[id].rollbackForm();
        
        this.setIsChanged(false);
        this.setErrorMessages([]);
        this.setIsValid(true);
        
        this._lockCascade = false;
    },
    
    /** Gets the changed values of this form. For a form this will be a map of
        all the subform values by ID that are in the "changed" state. Form 
        elements should override this to return an element specific value.
        @returns object */
    getChangedValue: function() {
        var retval = {}, subForms = this._subForms, subform, id;
        for (id in subForms) {
            subform = subForms[id];
            if (subform.isChanged) retval[id] = subform.getChangedValue();
        }
        return retval;
    }
});

((pkg) => {
    const JSModule = JS.Module,
        G = pkg.global,
        ValueProcessor = pkg.ValueProcessor,
        
        /*  Runs the validators on this form.
            @private
            @param isValid:boolean The currently determined validity.
            @returns boolean true if this form is valid, false otherwise. */
        applyValidation = (form, isValid) => {
            const validators = form.__v, len = validators.length, 
                errorMessages = [];
            for (let i = 0; len > i;) isValid = validators[i++].isFormValid(form, null, errorMessages) && isValid;
            
            form.setErrorMessages(errorMessages);
            form.setIsValid(isValid);
            
            return isValid;
        },
        
        /*  Runs the provided value through all the ValueProcessors.
            @private
            @param value:* The value to process.
            @param checkAttr:string The name of the attribute on each processor 
                that is checked to see if that processor should be run or not.
            @returns * The processed value. */
        processValue = (formElement, value, checkAttr) => {
            const processors = formElement.__vp, 
                len = processors.length;
            for (let i = 0; len > i;) {
                const processor = processors[i++];
                if (processor[checkAttr]) value = processor.process(value);
            }
            return value;
        },
        
        /** Provides "form" functionality to a node. Forms can be nested to build
            up larger forms from one or more subforms.
            
            Events:
                isValid:boolean Fired when the form changes validity.
                isChanged:boolean Fired when the form becomes changed or unchanged.
            
            Attributes:
                id:string The unique ID for this form relative to its parent form.
                form:myt.Form A reference to the parent form if it exists.
                errorMessages:array A list of error messages that occurred during the
                    last execution of doValidation.
                isValid:boolean Indicates if the data in this form is valid or not.
                isChanged:boolean Indicates if the data in this form is different
                    from the rollback value or not.
            
            Private Attributes:
                _lockCascade:boolean Prevents changes to "isChanged" and "isValid" 
                    from cascading upwards to the parent form. Used during reset 
                    and rollback.
                __sf:object A map of child forms/elements by ID.
                __acc:object A map of method references by accelerator identifier. 
                    The values will be function references. An intended use of these 
                    is to submit or cancel a form by keystroke.
                __v:array A list of validators to apply to this form.
            
            @class */
        Form = pkg.Form = new JSModule('Form', {
            // Life Cycle //////////////////////////////////////////////////////
            initNode: function(parent, attrs) {
                const self = this;
                
                self.isChanged = self._lockCascade = false;
                self.isValid = true;
                
                self.__sf = {};
                self.__v = [];
                self.__acc = {};
                
                self.callSuper(parent, attrs);
                
                if (self.form) self.form.addSubForm(self);
            },
            
            /** @overrides myt.Node. */
            destroy: function() {
                if (this.form) this.form.removeSubForm(this.id);
                
                this.callSuper();
            },
            
            
            // Accessors ///////////////////////////////////////////////////////
            setErrorMessages: function(v) {this.errorMessages = v;},
            
            getFullId: function() {
                const ids = [this.id];
                let form = this.form;
                while (form && form.id) {
                    ids.unshift(form.id);
                    form = form.form;
                }
                return ids.join('.');
            },
            
            setId: function(v) {
                if (this.id !== v) {
                    const existingId = this.id;
                    this.id = v;
                    
                    const form = this.form;
                    if (form && this.inited) {
                        form.removeSubForm(existingId);
                        form.addSubForm(this);
                    }
                }
            },
            
            setForm: function(v) {
                if (this.form !== v) {
                    const existingForm = this.form;
                    this.form = v;
                    if (existingForm) existingForm.removeSubForm(this.id);
                    if (v && this.inited) v.addSubForm(this);
                }
            },
            
            setIsValid: function(v) {
                // Don't abort when value hasn't changed. The reason this form is
                // invalid may have changed so we want an event to fire so any new
                // error messages can be shown.
                this.isValid = v;
                if (this.inited) this.fireEvent('isValid', v);
                
                const form = this.form;
                if (form && !this._lockCascade) {
                    if (v) {
                        form.verifyValidState(this);
                    } else {
                        form.notifySubFormInvalid();
                    }
                }
            },
            
            setIsChanged: function(v) {
                if (this.isChanged !== v) {
                    this.isChanged = v;
                    if (this.inited) this.fireEvent('isChanged', v);
                    
                    const form = this.form;
                    if (form && !this._lockCascade) {
                        if (v) {
                            form.notifySubFormChanged();
                        } else {
                            form.verifyChangedState(this);
                        }
                    }
                }
            },
            
            /** Allows bulk setting of validators.
                @param validators:array An array of myt.Validator instances or
                    IDs of validators from the myt.global.validators registry.
                @returns {undefined} */
            setValidators: function(validators) {
                let i = validators.length;
                while (i) {
                    const validator = validators[--i];
                    if (typeof validator === 'string') {
                        validators[i] = G.validators.getValidator(validator);
                        if (!validators[i]) validators.splice(i, 1);
                    }
                }
                
                this.__v = validators;
            },
            
            /** Gets the value of this form. For a form this will be a map of
                all the subform values by ID. Form elements should override this
                to return an element specific value.
                @returns object */
            getValue: function() {
                // Allow for superclass to have custom getValue behavior.
                if (this.callSuper) return this.callSuper();
                
                // Only do "form" behavior for true forms, not for form elements.
                if (this.isA(FormElement)) return this.value;
                
                const retval = {}, 
                    subForms = this.__sf;
                for (const id in subForms) retval[id] = subForms[id].getValue();
                return retval;
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
                if (typeof value === 'object' && !this.isA(FormElement)) {
                    for (const id in value) {
                        const subform = this.getSubForm(id);
                        if (subform) {
                            value[id] = subform.setValue(value[id]);
                        } else {
                            console.warn("ID in setValue for non-existant subform", id);
                        }
                    }
                }
                
                // Notify parent form of value change.
                if (this.form) this.form.notifyValueChanged(this);
                
                return value;
            },
            
            /** Gets the default value of this form. For a form this will be a map of
                all the subform default values by ID. Form elements should override this
                to return an element specific default value.
                @returns object */
            getDefaultValue: function() {
                const retval = {};
                let subForms = this.__sf;
                for (const id in subForms) retval[id] = subForms[id].getDefaultValue();
                return retval;
            },
            
            /** Sets the default value of this form. For a form the value should be a 
                map containing default values for each of the subform elements. The 
                entries in the map will be applied to each of the subforms.
                @param value:object the value to set.
                @returns the value that was actually set. */
            setDefaultValue: function(value) {
                if (typeof value === 'object') {
                    for (const id in value) {
                        const subform = this.getSubForm(id);
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
                const retval = {}, 
                    subForms = this.__sf;
                for (const id in subForms) retval[id] = subForms[id].getRollbackValue();
                return retval;
            },
            
            /** Sets the rollback value of this form. For a form the value should be a 
                map containing rollback values for each of the subform elements. The 
                entries in the map will be applied to each of the subforms.
                @param value:object the value to set.
                @returns the value that was actually set. */
            setRollbackValue: function(value) {
                if (typeof value === 'object') {
                    for (const id in value) {
                        const subform = this.getSubForm(id);
                        if (subform) {
                            value[id] = subform.setRollbackValue(value[id]);
                        } else {
                            console.warn("ID in setRollbackValue for non-existant subform", id);
                        }
                    }
                }
                return value;
            },
            
            
            // Methods /////////////////////////////////////////////////////////
            /** Add an accelerator to this form.
                @param id:string the ID for the accelerator.
                @param func:function the function to call when the accelerator 
                    is invoked.
                @returns {undefined} */
            addAccelerator: function(id, func) {
                this.__acc[id] = func;
            },
            
            /** Removes an accelerator from this form.
                @param id:string the ID for the accelerator.
                @returns {undefined} */
            removeAccelerator: function(id) {
                delete this.__acc[id];
            },
            
            /** Executes an accelerator in this form with the provided ID.
                @param id:string The ID of the accelerator to invoke.
                @param value:* (optional) The value to pass to the function.
                @returns {undefined} */
            invokeAccelerator: function(id, value) {
                const accelerator = this.__acc[id];
                if (accelerator) accelerator.call(this, value === undefined ? null : value);
            },
            
            /** Adds a validator to this form.
                @param validator:myt.Validator The validator to add.
                @returns {undefined} */
            addValidator: function(validator) {
                if (validator) this.__v.push(validator);
            },
            
            /** Removes a validator from this form.
                @param id:string The ID of the validator to remove.
                @returns the removed myt.Validator or null if not found. */
            removeValidator: function(id) {
                if (id) {
                    const validators = this.__v;
                    let i = validators.length;
                    while (i) {
                        const validator = validators[--i];
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
                @returns {undefined} */
            addSubForm: function(subform) {
                const id = subform.id;
                if (this.getSubForm(id) != null) {
                    console.warn("ID in use for subform, add aborted.", id, subform);
                } else {
                    subform.setForm(this);
                    this.__sf[id] = subform;
                    
                    if (subform.isChanged) this.notifySubFormChanged();
                    if (!subform.isValid) this.notifySubFormInvalid();
                }
            },
            
            /** Removes the subform with the provided ID from this form.
                @param id:string The ID of the form to remove.
                @returns myt.Form or undefined if not found. */
            removeSubForm: function(id) {
                const subform = this.getSubForm(id);
                if (subform) {
                    subform.setForm(null);
                    delete this.__sf[id];
                    this.verifyChangedState();
                    this.verifyValidState();
                }
                return subform;
            },
            
            /** Gets the subform with the provided ID from this form.
                @param id:string The ID of the form to get.
                @returns myt.Form or undefined if not found. */
            getSubForm: function(id) {
                return this.__sf[id];
            },
            
            getSubForms: function() {
                return this.__sf;
            },
            
            getInvalidSubformIds: function(doValidation) {
                if (doValidation) this.doValidation();
                
                const retval = [];
                (function inspect(subform) {
                    if (subform.isA(FormElement)) {
                        if (!subform.isValid) retval.push(subform.getFullId());
                    } else {
                        const subforms = subform.getSubForms();
                        for (const key in subforms) inspect(subforms[key]);
                    }
                })(this);
                
                return retval;
            },
            
            /** Gets all error messages from the entire form tree.
                @returns array of error messages strings. */
            getAllErrorMessages: function() {
                const subForms = this.__sf;
                let msgs = (this.errorMessages || []).concat();
                for (const id in subForms) msgs = msgs.concat(subForms[id].getAllErrorMessages());
                return msgs;
            },
            
            /** Called when a subform changes to the "invalid" state.
                @returns {undefined} */
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
                const subForms = this.__sf;
                let isValid = true;
                for (const id in subForms) {
                    const subform = subForms[id];
                    if (subform !== subformToIgnore) isValid = subform.isValid && isValid;
                }
                return applyValidation(this, isValid);
            },
            
            /** Tests if this form is valid or not. Performs a top down validation 
                check across the entire form tree. Does not allow upwards cascade of
                validity check since this is intended to be a top down check.
                @returns boolean true if this form is valid, false otherwise. */
            doValidation: function() {
                const subForms = this.__sf;
                let isValid = true;
                for (const id in subForms) isValid = subForms[id].doValidation() && isValid;
                
                this._lockCascade = true;
                isValid = applyValidation(this, isValid);
                this._lockCascade = false;
                
                return isValid;
            },
            
            /** Called whenever a value changes for the form or any subform therein.
                @param sourceForm:myt.Form the form that had a value change.
                @returns {undefined} */
            notifyValueChanged: function(sourceForm) {
                if (this.form) this.form.notifyValueChanged(sourceForm);
            },
            
            /** Called when a subform changed to the "changed" state.
                @returns {undefined} */
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
                const subForms = this.__sf;
                let isChanged = false;
                for (const id in subForms) {
                    const subform = subForms[id];
                    if (subform !== subformToIgnore) isChanged = subform.isChanged || isChanged;
                }
                this.setIsChanged(isChanged);
                return isChanged;
            },
            
            /** Initializes the form to the provided values.
                @param defaultValue:object The default value.
                @param rollbackValue:object The rollback value.
                @param value:object The current value.
                @returns {undefined} */
            setup: function(defaultValue, rollbackValue, value) {
                this._lockCascade = true;
                this.setIsChanged(false);
                this.setErrorMessages([]);
                this.setIsValid(true);
                this._lockCascade = false;
                
                if (defaultValue == null) defaultValue = {};
                if (rollbackValue == null) rollbackValue = {};
                if (value == null) value = {};
                
                const subForms = this.__sf;
                for (const id in subForms) subForms[id].setup(defaultValue[id], rollbackValue[id], value[id]);
            },
            
            /** Resets this form to the default values.
                @returns {undefined} */
            resetForm: function() {
                this._lockCascade = true;
                
                const subForms = this.__sf;
                for (const id in subForms) subForms[id].resetForm();
                
                this.setIsChanged(false);
                this.setErrorMessages([]);
                this.setIsValid(true);
                
                this._lockCascade = false;
            },
            
            /** Rolls back this form to the rollback values.
                @returns {undefined} */
            rollbackForm: function() {
                this._lockCascade = true;
                
                const subForms = this.__sf;
                for (const id in subForms) subForms[id].rollbackForm();
                
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
                const retval = {}, 
                    subForms = this.__sf;
                for (const id in subForms) {
                    const subform = subForms[id];
                    if (subform.isChanged) retval[id] = subform.getChangedValue();
                }
                return retval;
            }
        }),
        
        /** Provides "form" element functionality to a node. A form element is a
            form that actually has a value.
            
            Events:
                defaultValue:* Fired when the default value changes.
                rollbackValue:* Fired when the rollback value changes.
            
            Attributes:
                value:* The current value of the form element.
                rollbackValue:* The rollback value of the form element.
                defaultValue:* The default value of the form element.
            
            Private Attributes:
                __vp:array A list of myt.ValueProcessors that get applied 
                    to a value whenever it is retrieved via the methods: 
                    getValue, getRollbackValue or getDefaultValue.
            
            @class */
        FormElement = pkg.FormElement = new JSModule('FormElement', {
            include: [Form],
            
            
            // Life Cycle //////////////////////////////////////////////////////
            initNode: function(parent, attrs) {
                this.__vp = [];
                
                this.callSuper(parent, attrs);
            },
            
            
            // Accessors ///////////////////////////////////////////////////////
            /** @overrides myt.Form */
            getValue: function() {
                return processValue(this, this.callSuper ? this.callSuper() : this.value, ValueProcessor.CURRENT_ATTR);
            },
            
            /** @overrides myt.Form */
            setValue: function(value) {
                if (value === undefined) value = this.getRollbackValue();
                if (this.value !== value) {
                    this.callSuper(value);
                    this.verifyChangedState();
                }
                return value;
            },
            
            /** @overrides myt.Form */
            getDefaultValue: function() {
                return processValue(this, this.defaultValue, ValueProcessor.DEFAULT_ATTR);
            },
            
            /** @overrides myt.Form */
            setDefaultValue: function(value) {
                if (this.defaultValue !== value) {
                    this.defaultValue = value;
                    if (this.inited) this.fireEvent('defaultValue', value);
                    this.verifyChangedState();
                }
                return value;
            },
            
            /** @overrides myt.Form */
            getRollbackValue: function() {
                return processValue(this, this.rollbackValue, ValueProcessor.ROLLBACK_ATTR);
            },
            
            /** @overrides myt.Form */
            setRollbackValue: function(value) {
                if (value === undefined) value = this.getDefaultValue();
                if (this.rollbackValue !== value) {
                    this.rollbackValue = value;
                    if (this.inited) this.fireEvent('rollbackValue', value);
                    this.verifyChangedState();
                }
                return value;
            },
            
            /** Allows bulk setting of ValueProcessors.
                @param processors:array An array of myt.ValueProcessor instances or
                    IDs of value processors from the myt.global.valueProcessors 
                    registry.
                @returns {undefined} */
            setValueProcessors: function(processors) {
                let i = processors.length;
                while (i) {
                    const processor = processors[--i];
                    if (typeof processor === 'string') {
                        processors[i] = G.valueProcessors.getValueProcessor(processor);
                        if (!processors[i]) processors.splice(i, 1);
                    }
                }
                
                this.__vp = processors;
            },
            
            
            // Methods /////////////////////////////////////////////////////////
            /** Adds a ValueProcessor to this form element.
                @param processor:myt.ValueProcessor
                @returns {undefined} */
            addValueProcessor: function(processor) {
                this.__vp.push(processor);
            },
            
            /** Removes a ValueProcessor from this form element.
                @param id:string the ID of the processor to remove.
                @returns the removed myt.ValueProcessor or null if not found. */
            removeValueProcessor: function(id) {
                if (id) {
                    const processors = this.__vp;
                    let i = processors.length;
                    while (i) {
                        const processor = processors[--i];
                        if (processor.id === id) {
                            processors.splice(i, 1);
                            return processor;
                        }
                    }
                }
                return null;
            },
            
            /** @overrides myt.Form */
            addSubForm: subform => {
                pkg.dumpStack("addSubForm not supported on form elements.");
            },
            
            /** @overrides myt.Form */
            getSubForm: id => {
                pkg.dumpStack("getSubForm not supported on form elements.");
                return null;
            },
            
            /** @overrides myt.Form */
            removeSubForm: id => {
                pkg.dumpStack("removeSubForm not supported on form elements.");
                return null;
            },
            
            /** @overrides myt.Form */
            verifyChangedState: function(subformToIgnore) {
                const isChanged = this.getValue() !== this.getRollbackValue();
                this.setIsChanged(isChanged);
                return isChanged;
            },
            
            /** @overrides myt.Form */
            setup: function(defaultValue, rollbackValue, value) {
                this._lockCascade = true;
                
                // Reset values to uninitialized state to make repeated calls 
                // to setup behave identically. Otherwise values could 
                // bleed through.
                this.defaultValue = undefined;
                this.rollbackValue = undefined;
                this.value = undefined;
                
                this.setDefaultValue(defaultValue);
                this.setRollbackValue(rollbackValue);
                
                this.setIsChanged(false);
                this.setErrorMessages([]);
                this.setIsValid(true);
                
                this._lockCascade = false;
                
                this.setValue(value);
            },
            
            /** @overrides myt.Form */
            resetForm: function() {
                this._lockCascade = true;
                
                const defaultValue = this.getDefaultValue();
                this.setRollbackValue(defaultValue);
                this.setValue(defaultValue);
                
                this.setIsChanged(false);
                this.setErrorMessages([]);
                this.setIsValid(true);
                
                this._lockCascade = false;
            },
            
            /** @overrides myt.Form */
            rollbackForm: function() {
                this._lockCascade = true;
                
                this.setValue(this.getRollbackValue());
                
                this.setIsChanged(false);
                this.setErrorMessages([]);
                this.setIsValid(true);
                
                this._lockCascade = false;
            },
            
            /** @overrides myt.Form
                @returns The current value if this form is in the changed state,
                    otherwise undefined. */
            getChangedValue: function() {
                return this.isChanged ? this.getValue() : undefined;
            }
        });
        
    /** Provides additional common functionality for a root level form.
        
        Accelerators:
            submit: Invokes the doSubmit function which in turn may invoke the
                doValidSubmit or doInvalidSubmit function.
            cancel: Invokes the doCancel function.
        
        @class */
    pkg.RootForm = new JSModule('RootForm', {
        include: [Form],
        
        
        // Life Cycle //////////////////////////////////////////////////////////
        initNode: function(parent, attrs) {
            this.callSuper(parent, attrs);
            
            this.addAccelerator('submit', this.doSubmit);
            this.addAccelerator('cancel', this.doCancel);
        },
        
        
        // Methods /////////////////////////////////////////////////////////////
        doSubmit: function() {
            if (this.isChanged) {
                if (this.doValidation()) {
                    this.doValidSubmit(this.getValue());
                } else {
                    this.doInvalidSubmit();
                }
            }
        },
        
        /** Called when the form is submitted and it is valid.
            @param {*} value
            @returns {undefined} */
        doValidSubmit: value => {},
        
        /** Called when the form is submitted and it is not valid.
            @returns {undefined} */
        doInvalidSubmit: () => {},
        
        /** Rolls back the form and revalidates it.
            @returns {undefined} */
        doCancel: function() {
            this.rollbackForm();
            this.doValidation();
        }
    });
})(myt);

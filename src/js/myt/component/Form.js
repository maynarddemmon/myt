(pkg => {
    let undefToEmptyValueProcessor;
    
    const JSClass = JS.Class,
        JSModule = JS.Module,
        G = pkg.global,
        GlobalFocus = G.focus,
        GlobalKeys = G.keys,
        
        defAttr = pkg.AccessorSupport.defAttr,
        
        KeyObservable = pkg.KeyObservable,
        
        DEFAULT_ATTR = 'runForDefault',
        ROLLBACK_ATTR = 'runForRollback',
        CURRENT_ATTR = 'runForCurrent',
        
        ACCELERATOR_SUBMIT = 'submit',
        ACCELERATOR_CANCEL = 'cancel',
        ACCELERATOR_ACCEPT = 'accept',
        ACCELERATOR_REJECT = 'reject',
        
        ACCELERATOR_SCOPE_ROOT = 'root',
        ACCELERATOR_SCOPE_ELEMENT = 'element',
        ACCELERATOR_SCOPE_NONE = 'none',
        
        WHEN_BLUR_WITH_KEY_FIX = 'blurWithKeyFix',
        WHEN_BLUR = 'blur',
        WHEN_KEY = 'key',
        
        processorsById = {},
        
        getValueProcessor = id => processorsById[id],
        
        doFuncOnIdentifiable = (identifiable, func) => {
            if (identifiable) {
                const id = identifiable.id;
                if (identifiable.id) {
                    func(id);
                } else {
                    pkg.dumpStack('No ID');
                }
            } else {
                pkg.dumpStack('No processor');
            }
        },
        
        registerValueProcessor = identifiable => {
            doFuncOnIdentifiable(identifiable, id => {processorsById[id] = identifiable;});
        },
        
        getBooleanAttributeGroup = formRadioGroup => pkg.BAG.getGroup('selected', formRadioGroup.groupId),
        
        /*  Search the radio group for a matching node and make that one the
            true node.
            @param {!Object} formRadioGroup
            @returns {undefined} */
        updateRadioGroupValue = formRadioGroup => {
            const bag = getBooleanAttributeGroup(formRadioGroup);
            if (bag) {
                const nodes = bag.getNodes(),
                    v = formRadioGroup.value;
                let i = nodes.length;
                while (i) {
                    const node = nodes[--i];
                    if (node.optionValue === v) {
                        bag.setTrue(node);
                        break;
                    }
                }
            }
        },
        
        startMonitoringRadioGroup = formRadioGroup => {
            if (formRadioGroup.groupId) {
                const bag = getBooleanAttributeGroup(formRadioGroup);
                if (bag) formRadioGroup.syncTo(bag, '__syncValue', 'trueNode');
            }
        },
        
        stopMonitoringRadioGroup = formRadioGroup => {
            if (formRadioGroup.groupId) {
                const bag = getBooleanAttributeGroup(formRadioGroup);
                if (bag) formRadioGroup.detachFrom(bag, '__syncValue', 'trueNode');
            }
        },
        
        /*  Runs the validators on the form.
            @param isValid:boolean The currently determined validity.
            @returns boolean true if this form is valid, false otherwise. */
        applyValidation = (form, isValid) => {
            const errorMessages = [];
            form.__v.forEach(validator => {
                isValid = validator.isFormValid(form, null, errorMessages) && isValid;
            });
            form.setErrorMessages(errorMessages);
            form.setIsValid(isValid);
            return isValid;
        },
        
        /*  Runs the provided value through all the ValueProcessors.
            @param value:* The value to process.
            @param checkAttr:string The name of the attribute on each processor 
                that is checked to see if that processor should be run or not.
            @returns * The processed value. */
        processValue = (formElement, value, checkAttr) => {
            formElement.__vp.forEach(processor => {
                if (processor[checkAttr]) value = processor.process(value);
            });
            return value;
        },
        
        /** Modifies a value. Typically used to convert a form element value 
            to its canonical form.
            
            Attributes:
                id:string The ideally unique ID for this value processor.
                runForDefault:boolean Indicates this processor should be run 
                    for default form values. Defaults to true.
                runForRollback:boolean Indicates this processor should be run 
                    for rollback form values. Defaults to true.
                runForCurrent:boolean Indicates this processor should be run 
                    for current form values. Defaults to true.
            
            @class */
        ValueProcessor = pkg.ValueProcessor = new JSClass('ValueProcessor', {
            // Constructor /////////////////////////////////////////////////////
            /** Creates a new ValueProcessor
                @param {string} id - The ideally unique ID for a processor 
                    instance.
                @param {boolean} [runForDefault]
                @param {boolean} [runForRollback]
                @param {boolean} [runForCurrent]
                @returns {undefined} */
            initialize: function(id, runForDefault, runForRollback, runForCurrent) {
                this.id = id;
                
                this[DEFAULT_ATTR] = !!runForDefault;
                this[ROLLBACK_ATTR] = !!runForRollback;
                this[CURRENT_ATTR] = !!runForCurrent;
            },
            
            
            // Methods /////////////////////////////////////////////////////////
            /** Processes the value. The default implementation returns the 
                value unmodified.
                @param {*} value - The value to modify.
                @returns {*} - The modified value. */
            process: value => value
        }),
        
        /** Converts values to a Number if possible. If the value becomes NaN
            the original value is returned.
            
            @class */
        ToNumberValueProcessor = pkg.ToNumberValueProcessor = new JSClass('ToNumberValueProcessor', ValueProcessor, {
            // Methods /////////////////////////////////////////////////////////
            /** @overrides myt.ValueProcessor */
            process: value => {
                // Don't convert "empty" values to a number since they'll 
                // become zero which is probably incorrect. Also catch 
                // undefined/null values since they will become NaN.
                if (value == null || value === '' || value === '-') return value;
                
                const numericValue = Number(value);
                return isNaN(numericValue) ? value : numericValue;
            }
        }),
        
        /** Trims the whitespace from a value.
            
            Attributes:
                trim:string Determines what kind of trimming to do. Supported 
                    values are 'left', 'right' and 'both'. The default value 
                    is 'both'.
            
            @class */
        TrimValueProcessor = pkg.TrimValueProcessor = new JSClass('TrimValueProcessor', ValueProcessor, {
            // Constructor /////////////////////////////////////////////////////
            /** @overrides myt.ValueProcessor
                @param {string} id - The ideally unique ID for a processor 
                    instance.
                @param {boolean} [runForDefault]
                @param {boolean} [runForRollback]
                @param {boolean} [runForCurrent]
                @param trim:string Determines the type of trimming to do. 
                    Allowed values are 'left', 'right' or 'both'. The default 
                    value is 'both'.
                @returns {undefined} */
            initialize: function(id, runForDefault, runForRollback, runForCurrent, trim) {
                this.callSuper(id, runForDefault, runForRollback, runForCurrent);
                
                this.trim = trim;
            },
            
            
            // Methods /////////////////////////////////////////////////////////
            /** @overrides */
            process: function(value) {
                value += '';
                switch (this.trim) {
                    case 'start':
                    case 'left':
                        return value.trimStart();
                    case 'end':
                    case 'right':
                        return value.trimEnd();
                    default:
                        return value.trim();
                }
            }
        }),
        
        /** Converts undefined values to a default value.
            
            Attributes:
                defaultValue:* The value to return when the processed value 
                    is undefined.
            
            @class */
        UndefinedValueProcessor = pkg.UndefinedValueProcessor = new JSClass('UndefinedValueProcessor', ValueProcessor, {
            // Constructor /////////////////////////////////////////////////////
            /** @overrides myt.ValueProcessor
                @param {string} id - The ideally unique ID for a processor 
                    instance.
                @param {boolean} [runForDefault]
                @param {boolean} [runForRollback]
                @param {boolean} [runForCurrent]
                @param {*} [defaultValue] - The default value to convert 
                    undefined to.
                @returns {undefined} */
            initialize: function(id, runForDefault, runForRollback, runForCurrent, defaultValue) {
                this.callSuper(id, runForDefault, runForRollback, runForCurrent);
                
                this.defaultValue = defaultValue;
            },
            
            
            // Methods /////////////////////////////////////////////////////////
            /** @overrides myt.ValueProcessor */
            process: function(value) {
                return value === undefined ? this.defaultValue : value;
            }
        }),
        
        /** Provides "form" functionality to a node. Forms can be nested to 
            build up larger forms from one or more subforms.
            
            Events:
                isValid:boolean Fired when the form changes validity.
                isChanged:boolean Fired when the form becomes changed
                    or unchanged.
            
            Attributes:
                id:string The unique ID for this form relative to its 
                    parent form.
                form:myt.Form A reference to the parent form if it exists.
                errorMessages:array A list of error messages that occurred 
                    during the last execution of doValidation.
                isValid:boolean Indicates if the data in this form is 
                    valid or not.
                isChanged:boolean Indicates if the data in this form is 
                    different from the rollback value or not.
            
            Private Attributes:
                _lockCascade:boolean Prevents changes to "isChanged" and 
                    "isValid" from cascading upwards to the parent form. Used 
                    during reset and rollback.
                __sf:object A map of child forms/elements by ID.
                __acc:object A map of method references by accelerator 
                    identifier. The values will be function references. An 
                    intended use of these is to submit or cancel a form 
                    by keystroke.
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
                
                if (self.form && self.form.isA(Form)) self.form.addSubForm(self);
            },
            
            /** @overrides myt.Node. */
            destroy: function() {
                if (this.form && this.form.isA(Form)) this.form.removeSubForm(this.id);
                
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
                // Don't abort when value hasn't changed. The reason this form 
                // is invalid may have changed so we want an event to fire so 
                // any new error messages can be shown.
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
                all the subform values by ID. Form elements should override 
                this to return an element specific value.
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
            
            /** Sets the value of this form. For a form the value should be a 
                map containing values for each of the subform elements. The 
                entries in the map will be applied to each of the subforms.
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
                            console.warn('ID in setValue for missing subform', id);
                        }
                    }
                }
                
                // Notify parent form of value change.
                if (this.form) this.form.notifyValueChanged(this);
                
                return value;
            },
            
            /** Gets the default value of this form. For a form this will be 
                a map of all the subform default values by ID. Form elements 
                should override this to return an element specific default 
                value.
                @returns object */
            getDefaultValue: function() {
                const retval = {};
                let subForms = this.__sf;
                for (const id in subForms) retval[id] = subForms[id].getDefaultValue();
                return retval;
            },
            
            /** Sets the default value of this form. For a form the value 
                should be a map containing default values for each of the 
                subform elements. The entries in the map will be applied to 
                each of the subforms.
                @param value:object the value to set.
                @returns the value that was actually set. */
            setDefaultValue: function(value) {
                if (typeof value === 'object') {
                    for (const id in value) {
                        const subform = this.getSubForm(id);
                        if (subform) {
                            value[id] = subform.setDefaultValue(value[id]);
                        } else {
                            console.warn('ID in setDefaultValue for missing subform', id);
                        }
                    }
                }
                return value;
            },
            
            /** Gets the rollback value of this form. For a form this will 
                be a map of all the subform rollback values by ID. Form 
                elements should override this to return an element specific 
                rollback value.
                @returns object */
            getRollbackValue: function() {
                const retval = {}, 
                    subForms = this.__sf;
                for (const id in subForms) retval[id] = subForms[id].getRollbackValue();
                return retval;
            },
            
            /** Sets the rollback value of this form. For a form the value 
                should be a map containing rollback values for each of the 
                subform elements. The entries in the map will be applied to 
                each of the subforms.
                @param value:object the value to set.
                @returns the value that was actually set. */
            setRollbackValue: function(value) {
                if (typeof value === 'object') {
                    for (const id in value) {
                        const subform = this.getSubForm(id);
                        if (subform) {
                            value[id] = subform.setRollbackValue(value[id]);
                        } else {
                            console.warn('ID in setRollbackValue for missing subform', id);
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
                if (accelerator) accelerator.call(this, value == null ? null : value);
            },
            
            /** Adds a validator to this form.
                @param validator:myt.Validator The validator to add.
                @returns {undefined} */
            addValidator: function(validator) {
                if (validator) this.__v.push(validator);
            },
            
            /** Removes a validator from this form.
                @param id:string The ID of the validator to remove.
                @returns the removed myt.Validator or undefined 
                    if not found. */
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
                    console.warn('ID in use for subform, add aborted', id, subform);
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
            
            /** Tests if this form is valid or not and updates the isValid 
                attribute if necessary. Allows upwards cascade of validity.
                @param subformToIgnore:myt.Form (optional) A subform that will 
                    not be checked for validity. This is typically the subform 
                    that is invoking this method.
                @returns boolean true if this form is valid, 
                    false otherwise. */
            verifyValidState: function(subformToIgnore) {
                const subForms = this.__sf;
                let isValid = true;
                for (const id in subForms) {
                    const subform = subForms[id];
                    if (subform !== subformToIgnore) isValid = subform.isValid && isValid;
                }
                return applyValidation(this, isValid);
            },
            
            /** Tests if this form is valid or not. Performs a top down 
                validation check across the entire form tree. Does not allow 
                upwards cascade of validity check since this is intended to be 
                a top down check.
                @returns boolean true if this form is valid, 
                    false otherwise. */
            doValidation: function() {
                const subForms = this.__sf;
                let isValid = true;
                for (const id in subForms) isValid = subForms[id].doValidation() && isValid;
                
                this._lockCascade = true;
                isValid = applyValidation(this, isValid);
                this._lockCascade = false;
                
                return isValid;
            },
            
            /** Called whenever a value changes for the form or any subform 
                therein.
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
                @param subformToIgnore:myt.Form (optional) A subform that will 
                    not be checked for changed state. This is typically the 
                    subform that is invoking this method.
                @returns boolean true if this form is changed, 
                    false otherwise. */
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
            
            /** Gets the changed values of this form. For a form this will be 
                a map of all the subform values by ID that are in the "changed" 
                state. Form elements should override this to return an element 
                specific value.
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
        
        /** Provides "form" element functionality to a node. A form element 
            is a form that actually has a value.
            
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
                return processValue(this, this.callSuper ? this.callSuper() : this.value, CURRENT_ATTR);
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
                return processValue(this, this.defaultValue, DEFAULT_ATTR);
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
                return processValue(this, this.rollbackValue, ROLLBACK_ATTR);
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
                @param processors:array An array of myt.ValueProcessor 
                    instances or IDs of value processors from the 
                    myt.global.valueProcessors registry.
                @returns {undefined} */
            setValueProcessors: function(processors) {
                let i = processors.length;
                while (i) {
                    const processor = processors[--i];
                    if (typeof processor === 'string') {
                        processors[i] = getValueProcessor(processor);
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
                @returns the removed myt.ValueProcessor or undefined 
                    if not found. */
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
            },
            
            /** @overrides myt.Form */
            addSubForm: subform => {
                pkg.dumpStack('addSubForm unsupported on FormElement');
            },
            
            /** @overrides myt.Form */
            getSubForm: id => {
                pkg.dumpStack('getSubForm unsupported on FormElement');
            },
            
            /** @overrides myt.Form */
            removeSubForm: id => {
                pkg.dumpStack('removeSubForm unsupported on FormElement');
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
                @returns The current value if this form is in the changed 
                    state, otherwise undefined. */
            getChangedValue: function() {
                return this.isChanged ? this.getValue() : undefined;
            }
        }),
        
        /** Provides common functionality for text related form elements.
            
            Accelerators:
                accept: Invokes the doAccept function. Activated upon key down 
                    of the ENTER key.
                reject: Invokes the doReject function. Activated upon key up 
                    of the ESC key.
            
            Attributes:
                errorColor:color_string The color to use when a validation 
                    error exists. Defaults to '#f99'.
                actionRequiredColor:color_string The color to use when a 
                    validation error exists but the user has not modified the 
                    value. Defaults to '#966'.
                normalColor:color_string The color to use when no validation 
                    error exists. Defaults to '#999'.
                validateWhen:string Indicates when to run validation.
                    Supported values are:
                        key: Validate as the user types.
                        blur: Validate when blurring out of the UI control
                        blurWithKeyFix: The same as blur except we also 
                            validate as the user types if currently invalid.
                        none: Don't do any validation when interacting with 
                            the field.
                    The default value is 'key'.
                acceleratorScope:string The scope the accelerators will be 
                    applied to.
                    Supported values are:
                        element: Take action on this element only
                        root: Take action on the root form.
                        none: Take no action.
                    The default value is 'element'.
            
            @class */
        FormInputTextMixin = pkg.FormInputTextMixin = new JSModule('FormInputTextMixin', {
            include: [FormElement, pkg.UpdateableUI],
            
            
            // Life Cycle //////////////////////////////////////////////////////
            /** @overrides myt.Input */
            initNode: function(parent, attrs) {
                const self = this;
                
                self.acceleratorScope = ACCELERATOR_SCOPE_ELEMENT;
                self.validateWhen = WHEN_KEY;
                self.errorColor = '#f99';
                self.actionRequiredColor = '#966';
                self.normalColor = '#999';
                
                defAttr(attrs, 'bgColor', '#fff');
                defAttr(attrs, 'borderWidth', 1);
                defAttr(attrs, 'borderStyle', 'solid');
                defAttr(attrs, 'borderStyle', true);
                
                self.callSuper(parent, attrs);
                
                self.addValueProcessor(undefToEmptyValueProcessor);
                
                self.attachToDom(self, '__hndlKeyDown', 'keydown');
                self.attachToDom(self, '__hndlKeyUp', 'keyup');
                
                self.addAccelerator(ACCELERATOR_ACCEPT, self.doAccept);
                self.addAccelerator(ACCELERATOR_REJECT, self.doReject);
            },
            
            
            // Accessors ///////////////////////////////////////////////////////
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
                if (when === WHEN_KEY || when === WHEN_BLUR_WITH_KEY_FIX) this.verifyValidState();
                
                return retval;
            },
            
            
            // Methods /////////////////////////////////////////////////////////
            doAccept: function() {
                if (!this.disabled) {
                    switch (this.acceleratorScope) {
                        case ACCELERATOR_SCOPE_ROOT:
                            this.getRootForm().invokeAccelerator(ACCELERATOR_SUBMIT);
                            break;
                        case ACCELERATOR_SCOPE_ELEMENT:
                            // Tab navigate forward
                            GlobalFocus.next(false);
                            break;
                        case ACCELERATOR_SCOPE_NONE:
                        default:
                    }
                }
            },
            
            doReject: function() {
                if (!this.disabled) {
                    switch (this.acceleratorScope) {
                        case ACCELERATOR_SCOPE_ROOT:
                            this.getRootForm().invokeAccelerator(ACCELERATOR_CANCEL);
                            break;
                        case ACCELERATOR_SCOPE_ELEMENT:
                            this.rollbackForm();
                            this.getRootForm().doValidation();
                            if (this.form) this.form.verifyChangedState(this);
                            break;
                        case ACCELERATOR_SCOPE_NONE:
                        default:
                    }
                }
            },
            
            /** @private
                @param {!Object} event
                @returns {undefined} */
            __hndlKeyDown: function(event) {
                if (KeyObservable.isEnterKeyEvent(event)) this.invokeAccelerator(ACCELERATOR_ACCEPT);
            },
            
            /** @private
                @param {!Object} event
                @returns {undefined} */
            __hndlKeyUp: function(event) {
                if (KeyObservable.isEscKeyEvent(event)) this.invokeAccelerator(ACCELERATOR_REJECT);
            },
            
            /** @overrides myt.FocusObservable */
            doBlur: function() {
                this.callSuper();
                
                // Validate on blur
                const when = this.validateWhen;
                if (when === WHEN_BLUR || when === WHEN_BLUR_WITH_KEY_FIX) this.verifyValidState();
            },
            
            /** @overrides myt.UpdateableUI */
            updateUI: function() {
                this.setBorderColor(
                    this.isValid ? this.normalColor : (this.isChanged ? this.errorColor : this.actionRequiredColor)
                );
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
            
            this.addAccelerator(ACCELERATOR_SUBMIT, this.doSubmit);
            this.addAccelerator(ACCELERATOR_CANCEL, this.doCancel);
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
    
    /** An myt.Checkbox that is also a FormElement.
        
        @class */
    pkg.FormCheckbox = new JSClass('FormCheckbox', pkg.Checkbox, {
        include: [FormElement],
        
        
        // Life Cycle //////////////////////////////////////////////////////////
        /** @overrides */
        initNode: function(parent, attrs) {
            this.rollbackValue = this.defaultValue = false;
            this.callSuper(parent, attrs);
        }
    });
    
    /** An myt.ComboBox that is also a FormElement.
        
        @class */
    pkg.FormComboBox = new JSClass('FormComboBox', pkg.ComboBox, {
        include: [FormElement, pkg.UpdateableUI],
        
        
        // Life Cycle //////////////////////////////////////////////////////////
        /** @overrides myt.Input */
        initNode: function(parent, attrs) {
            this.acceleratorScope = ACCELERATOR_SCOPE_ELEMENT;
            this.validateWhen = WHEN_KEY;
            this.errorColor = '#f99';
            this.actionRequiredColor = '#966';
            this.normalColor = '#999';
            
            this.callSuper(parent, attrs);
            
            this.addValueProcessor(undefToEmptyValueProcessor);
            
            this.addAccelerator(ACCELERATOR_ACCEPT, this.doAccept);
            this.addAccelerator(ACCELERATOR_REJECT, this.doReject);
        },
        
        
        // Accessors ///////////////////////////////////////////////////////////
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
            if (when === WHEN_KEY || when === WHEN_BLUR_WITH_KEY_FIX) this.verifyValidState();
            
            return retval;
        },
        
        
        // Methods /////////////////////////////////////////////////////////////
        doAccept: function() {
            if (!this.disabled) {
                switch (this.acceleratorScope) {
                    case ACCELERATOR_SCOPE_ROOT:
                        this.getRootForm().invokeAccelerator(ACCELERATOR_SUBMIT);
                        break;
                    case ACCELERATOR_SCOPE_ELEMENT:
                        // Tab navigate forward
                        GlobalFocus.next(false);
                        break;
                    case ACCELERATOR_SCOPE_NONE:
                    default:
                }
            }
        },
        
        doReject: function() {
            if (!this.disabled) {
                switch (this.acceleratorScope) {
                    case ACCELERATOR_SCOPE_ROOT:
                        this.getRootForm().invokeAccelerator(ACCELERATOR_CANCEL);
                        break;
                    case ACCELERATOR_SCOPE_ELEMENT:
                        this.rollbackForm();
                        this.getRootForm().doValidation();
                        if (this.form) this.form.verifyChangedState(this);
                        break;
                    case ACCELERATOR_SCOPE_NONE:
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
        doActivationKeyDown: function(code, isRepeat) {
            if (code === GlobalKeys.CODE_ESC && !this._isShown) {
                this.invokeAccelerator(ACCELERATOR_REJECT);
            } else {
                this.callSuper(code, isRepeat);
            }
        },
        
        /** @overrides myt.ListViewAnchor. */
        doActivationKeyUp: function(code) {
            if (code === GlobalKeys.CODE_ENTER && !this._isShown) {
                this.invokeAccelerator(ACCELERATOR_ACCEPT);
            } else {
                this.callSuper(code);
            }
        },
        
        /** @overrides myt.FocusObservable */
        doBlur: function() {
            this.callSuper();
            
            // Validate on blur
            const when = this.validateWhen;
            if (when === WHEN_BLUR || when === WHEN_BLUR_WITH_KEY_FIX) this.verifyValidState();
        },
        
        /** @overrides myt.UpdateableUI */
        updateUI: function() {
            this.setBorderColor(
                this.isValid ? this.normalColor : (this.isChanged ? this.errorColor : this.actionRequiredColor)
            );
        }
    });
    
    /** An myt.EditableText that is also a FormElement.
        
        @class */
    pkg.FormEditableText = new JSClass('FormEditableText', pkg.EditableText, {
        include: [FormInputTextMixin],
        
        
        // Methods /////////////////////////////////////////////////////////////
        /** @overrides myt.FormInputTextMixin */
        __hndlKeyDown: function(event) {
            // Only allow enter key as accelerator if no wrapping is occurring
            if (this.whitespace === 'nowrap') this.callSuper(event);
        }
    });
    
    /** An myt.InputText that is also a FormElement.
        
        @class */
    pkg.FormInputText = new JSClass('FormInputText', pkg.InputText, {
        include: [FormInputTextMixin]
    });
    
    /** An myt.InputTextArea that is also a FormElement.
        
        Accelerators:
            Only "reject" from myt.FormInputTextMixin.
        
        @class */
    pkg.FormInputTextArea = new JSClass('FormInputTextArea', pkg.InputTextArea, {
        include: [FormInputTextMixin],
        
        
        // Methods /////////////////////////////////////////////////////////////
        /** @overrides myt.FormInputTextMixin */
        __hndlKeyDown: event => {/* Do nothing so the "accept" accelerator is not invoked. */}
    });
    
    /** An myt.InputSelect that is also a FormElement.
        
        Private Attributes:
            __abortSetValue:boolean Prevents setValue from being called again
                when performing operations from within setValue.
        
        @class */
    pkg.FormInputSelect = new JSClass('FormInputSelect', pkg.InputSelect, {
        include: [FormElement],
        
        
        // Accessors ///////////////////////////////////////////////////////////
        /** @overrides myt.FormElement */
        setValue: function(v) {
            if (this.__abortSetValue) return;
            
            const retval = this.callSuper(v);
            
            // Clear Selection and then reselect
            this.__abortSetValue = true;
            this.deselectAll();
            this.selectValues(retval);
            this.__abortSetValue = false;
            
            this.verifyValidState();
            
            return retval;
        }
    });
    
    /** Monitors a radio button group for a form.
        
        Attributes:
            groupId:string The ID of the radio group to monitor.
        
        @class */
    pkg.FormRadioGroup = new JSClass('FormRadioGroup', pkg.Node, {
        include: [pkg.ValueComponent, FormElement],
        
        
        // Life Cycle //////////////////////////////////////////////////////////
        /** @overrides */
        initNode: function(parent, attrs) {
            if (attrs.groupId == null) attrs.groupId = pkg.generateGuid();
            
            this.callSuper(parent, attrs);
            
            if (this.value !== undefined) updateRadioGroupValue(this);
            startMonitoringRadioGroup(this);
        },
        
        
        // Accessors ///////////////////////////////////////////////////////////
        /** @overrides myt.FormElement */
        setValue: function(v) {
            const retval = this.callSuper(v);
            if (this.inited) updateRadioGroupValue(this);
            return retval;
        },
        
        setGroupId: function(v) {
            if (this.groupId !== v) {
                stopMonitoringRadioGroup(this);
                this.groupId = v;
                if (this.inited) startMonitoringRadioGroup(this);
            }
        },
        
        
        // Methods /////////////////////////////////////////////////////////////
        /** @private
            @param {!Object} event
            @returns {undefined} */
        __syncValue: function(event) {
            const value = event.value;
            this.setValue(value ? value.optionValue : null);
        }
    });
    
    /** Pulls the current value from another form field if the provided value
        is undefined, null or empty string.
        
        Attributes:
            otherField:myt.FormElement The form element to pull the current 
                value from.
        
        @class */
    pkg.UseOtherFieldIfEmptyValueProcessor = new JSClass('UseOtherFieldIfEmptyValueProcessor', ValueProcessor, {
        // Constructor /////////////////////////////////////////////////////////
        /** @overrides myt.ValueProcessor
            @param {string} id - The ideally unique ID for a processor instance.
            @param {boolean} [runForDefault]
            @param {boolean} [runForRollback]
            @param {boolean} [runForCurrent]
            @param {!Object} [otherField] - The myt.FormElement to pull the 
                value from.
            @returns {undefined} */
        initialize: function(id, runForDefault, runForRollback, runForCurrent, otherField) {
            this.callSuper(id, runForDefault, runForRollback, runForCurrent);
            
            this.otherField = otherField;
        },
        
        
        // Methods /////////////////////////////////////////////////////////////
        /** @overrides */
        process: function(value) {
            return (value == null || value === '') ? this.otherField.getValue() : value;
        }
    });
    
    /** Stores myt.ValueProcessors by ID so they can be used in multiple
        places easily. */
    new JS.Singleton('GlobalValueProcessorRegistry', {
        // Life Cycle //////////////////////////////////////////////////////////
        initialize: function() {
            // Register a few common ValueProcessors
            registerValueProcessor(undefToEmptyValueProcessor = new UndefinedValueProcessor('undefToEmpty', true, true, true, ''));
            registerValueProcessor(new ToNumberValueProcessor('toNumber', true, true, true));
            registerValueProcessor(new TrimValueProcessor('trimLeft', true, true, true, 'left'));
            registerValueProcessor(new TrimValueProcessor('trimRight', true, true, true, 'right'));
            registerValueProcessor(new TrimValueProcessor('trimBoth', true, true, true, 'both'));
            
            G.register('valueProcessors', this);
        },
        
        
        // Accessors ///////////////////////////////////////////////////////////
        /** Gets a ValueProcessor for the ID.
            @param id:string the ID of the ValueProcessor to get.
            @returns an myt.ValueProcessor or undefined if not found. */
        getValueProcessor: getValueProcessor,
        
        
        // Methods /////////////////////////////////////////////////////////////
        /** Adds a ValueProcessor to this registry.
            @param identifiable:myt.ValueProcessor the ValueProcessor to add.
            @returns {undefined} */
        register: registerValueProcessor,
        
        /** Removes a ValueProcessor from this registery.
            @param identifiable:myt.ValueProcessor the ValueProcessor to remove.
            @returns {undefined} */
        unregister: identifiable => {
            doFuncOnIdentifiable(identifiable, id => {
                // Make sure the processor is in the repository then delete.
                if (getValueProcessor(id)) delete processorsById[id];
            });
        }
    });
})(myt);

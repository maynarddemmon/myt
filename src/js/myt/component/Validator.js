((pkg) => {
    const JSClass = JS.Class,
        
        // Safe as a closure variable because the registry is a singleton.,
        validators = {},
        
        getValidator = id => validators[id],
        
        doFuncOnIdentifiable = (identifiable, func) => {
            if (identifiable) {
                const id = identifiable.id;
                if (identifiable.id) {
                    func(id);
                } else {
                    pkg.dumpStack("No ID");
                }
            } else {
                pkg.dumpStack("No validator");
            }
        },
        
        register = identifiable => {
            doFuncOnIdentifiable(identifiable, id => {validators[id] = identifiable;});
        },
        
        /** Tests if a value is "valid" or not.
            
            Events:
                None
            
            Attributes:
                id:string the ideally unique ID for this Validator so it can be
                    stored and retreived from the myt.global.validators registry.
            
            @class */
        Validator = pkg.Validator = new JSClass('Validator', {
            /** Creates a new Validator
                @param {string} id - The ideally unique ID for a validator instance. */
            initialize: function(id) {
                this.id = id;
            },
            
            /** Tests if the value is valid or not.
                @param {*} value - The value to test validity for.
                @param {?Object} [config] - A map of configuration values that
                    can be used to augment the validation function as needed. The
                    nature of this config will be specific to each Validator class.
                @param {?Array} [errorMessages] - Any error messages arising during
                    validation will be pushed onto thiis array if it is provided.
                @returns {boolean} true if the value is valid, false otherwise. */
            isValid: (value, config, errorMessages) => true,
            
            /** Tests if the form is valid or not.
                @param {!Object} form - The myt.Form to test validity for.
                @param {?Object} [config] - A map of configuration values that
                    can be used to augment the validation function as needed. The
                    nature of this config will be specific to each Validator class.
                @param {?Array} [errorMessages] - Any error messages arising during
                    validation will be pushed onto thiis array if it is provided.
                @returns {boolean} true if the form is valid, false otherwise. */
            isFormValid: function(form, config, errorMessages) {
                if (!config) config = {};
                config.form = form;
                return this.isValid(form.getValue(), config, errorMessages);
            }
        }),
        
        /** Tests that a value is not null, undefined or empty. 
            @class */
        RequiredFieldValidator = pkg.RequiredFieldValidator = new JSClass('RequiredFieldValidator', Validator, {
            /** @overrides myt.Validator */
            isValid: function(value, config, errorMessages) {
                if (value == null || value === '' || (typeof value === 'string' && value.trim() === '')) {
                    if (errorMessages) errorMessages.push("This value is required.");
                    return false;
                }
                
                return true;
            }
        }),
        
        /** Tests that the value differs from the form rollback value by more than
            just case.
            @class */
        EqualsIgnoreCaseValidator = pkg.EqualsIgnoreCaseValidator = new JSClass('EqualsIgnoreCaseValidator', Validator, {
            /** @overrides myt.Validator */
            isValid: function(value, config, errorMessages) {
                const rbv = config.form.getRollbackValue();
                if (value && rbv && value.toLowerCase() === rbv.toLowerCase()) {
                    if (errorMessages) errorMessages.push("Value must differ by more than just case.");
                    return false;
                }
                
                return true;
            }
        }),
        
        /** Verifies that a value is in the form of a URL.
            @class */
        URLValidator = pkg.URLValidator = new JSClass('URLValidator', Validator, {
            /** @overrides myt.Validator
                @param {string id
                @param originalRawQuery:boolean if true this prevents the query from
                    being normalized. */
            initialize: function(id, originalRawQuery) {
                this.callSuper(id);
                this.originalRawQuery = originalRawQuery;
            },
            
            /** @overrides myt.Validator */
            isValid: function(value, config, errorMessages) {
                const uri = new pkg.URI(value);
                if (uri.toString(this.originalRawQuery) !== value) {
                    if (errorMessages) errorMessages.push("Not a valid URL.");
                    return false;
                }
                return true;
            }
        }),
        
        /** Verifies that a value is JSON.
            @class */
        JSONValidator = pkg.JSONValidator = new JSClass('JSONValidator', Validator, {
            /** @overrides myt.Validator */
            isValid: function(value, config, errorMessages) {
                try {
                    JSON.parse(value);
                    return true;
                } catch(e) {
                    if (errorMessages) errorMessages.push(e);
                    return false;
                }
            }
        });
    
    /** Tests that the value from two fields are equal. */
    pkg.EqualFieldsValidator = new JSClass('EqualFieldsValidator', Validator, {
        /** @overrides myt.Validator
            @param {string} id
            @param fieldA the first form field to compare.
            @param fieldB the second form field to compare. */
        initialize: function(id, fieldA, fieldB) {
            this.callSuper(id);
            
            this.fieldA = fieldA;
            this.fieldB = fieldB;
        },
        
        /** @overrides myt.Validator */
        isValid: function(value, config, errorMessages) {
            if (value && this.fieldA.getValue() === this.fieldB.getValue()) return true;
            
            if (errorMessages) errorMessages.push('Field "' + this.fieldA.key + '" must be equal to field "' + this.fieldB.key + '".');
            return false;
        }
    });
    
    /** Tests that the value has a length between min and max. */
    pkg.LengthValidator = new JSClass('LengthValidator', Validator, {
        /** @overrides myt.Validator
            @param {string} id
            @param {number} min - The minimum length value.
            @param {number} max - The maximum length value. */
        initialize: function(id, min, max) {
            this.callSuper(id);
            
            this.min = min;
            this.max = max;
        },
        
        /** @overrides myt.Validator */
        isValid: function(value, config, errorMessages) {
            const len = value ? value.length : 0,
                min = this.min,
                max = this.max;
            
            // Test min
            if (min !== undefined && min > len) {
                if (errorMessages) errorMessages.push('Value must not be less than ' + min + '.');
                return false;
            }
            
            // Test max
            if (max !== undefined && max < len) {
                if (errorMessages) errorMessages.push('Value must not be greater than ' + max + '.');
                return false;
            }
            
            return true;
        }
    });
    
    /** Tests that adBinary value is between min and max. */
    pkg.NumericRangeValidator = new JSClass('NumericRangeValidator', Validator, {
        /** @overrides myt.Validator
            @param {string} id
            @param {number} min - The minimum value.
            @param {number} max - The maximum value. */
        initialize: function(id, min, max) {
            this.callSuper(id);
            
            this.min = min;
            this.max = max;
        },
        
        /** @overrides myt.Validator */
        isValid: function(value, config, errorMessages) {
            // Treat empty values as valid.
            if (value === "") return true;
            
            // Must be a number
            const numericValue = Number(value),
                min = this.min,
                max = this.max;
            if (isNaN(numericValue)) {
                if (errorMessages) errorMessages.push("Value is not a number.");
                return false;
            }
            
            // Test min
            if (min !== undefined && min > numericValue) {
                if (errorMessages) errorMessages.push('Value must not be less than ' + min + '.');
                return false;
            }
            
            // Test max
            if (max !== undefined && max < numericValue) {
                if (errorMessages) errorMessages.push('Value must not be greater than ' + max + '.');
                return false;
            }
            
            return true;
        }
    });
    
    /** A Validator composed from multiple Validators.
        
        Events:
            None
        
        Attributes:
            None
        
        Private Attributes:
            __v:array The array of myt.Validators that compose 
                this Validator.
    */
    pkg.CompoundValidator = new JSClass('CompoundValidator', Validator, {
        // Constructor /////////////////////////////////////////////////////////
        /** Creates a new CompoundValidator for the ID and 0 or more Validators
            provided.
            @param {string} id
            @param arguments:args ever argument after the first must be a
                Validator or a Validator ID from the myt.global.validators
                registry.*/
        initialize: function(id, ...args) {
            this.callSuper(id);
            
            // Make sure each arg is an myt.Validator
            let i = args.length,
                validator;
            while (i) {
                validator = args[--i];
                if (typeof validator === 'string') {
                    args[i] = validator = getValidator(validator);
                    if (!validator) args.splice(i, 1);
                }
            }
            
            this.__v = args;
        },
        
        
        // Methods /////////////////////////////////////////////////////////////
        /** Add a Validator to this CompoundValidator.
            @param {!Object|string} v - The myt.Validator to add or a string
                used to lookup a validator in the validator repository.
            @returns {undefined} */
        addValidator: function(v) {
            if (typeof v === 'string') v = getValidator(v);
            if (v) this.__v.push(v);
        },
        
        /** @overrides myt.Validator */
        isValid: function(value, config, errorMessages) {
            const validators = this.__v, 
                len = validators.length;
            let isValid = true,
                i = 0;
            for (; len > i;) isValid = validators[i++].isValid(value, config, errorMessages) && isValid;
            return isValid;
        }
    });
    
    /** Stores myt.Validators by ID so they can be used in multiple
        places easily. */
    new JS.Singleton('GlobalValidatorRegistry', {
        // Life Cycle //////////////////////////////////////////////////////////
        initialize: function() {
            // Register a few common Validators
            register(new RequiredFieldValidator('required'));
            register(new EqualsIgnoreCaseValidator('equalsIgnoreCase'));
            register(new URLValidator('url'));
            register(new JSONValidator('json'));
            
            pkg.global.register('validators', this);
        },
        
        
        // Accessors ///////////////////////////////////////////////////////////
        /** Gets a Validator for the ID.
            @param {string} id - the ID of the Validator to get.
            @returns {?Obect} - An myt.Validator or undefined if not found. */
        getValidator: getValidator,
        
        
        // Methods /////////////////////////////////////////////////////////////
        /** Adds a Validator to this registry.
            @param {!Object} identifiable - The myt.Validator to add.
            @returns {undefined} */
        register: register,
        
        /** Removes a Validator from this registery.
            @param {!Object} identifiable - The myt.Validator to remove.
            @returns {undefined} */
        unregister: (identifiable) => {
            doFuncOnIdentifiable(identifiable, (id) => {
                // Make sure the validator is in the repository then delete.
                if (getValidator(id)) delete validators[id];
            });
        }
    });
})(myt);

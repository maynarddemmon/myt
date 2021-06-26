((pkg) => {
    const JSClass = JS.Class,
        
        // Safe as a closure variable because the registry is a singleton.,
        processorsById = {},
        
        getValueProcessor = id => processorsById[id],
        
        doFuncOnIdentifiable = (identifiable, func) => {
            if (identifiable) {
                const id = identifiable.id;
                if (identifiable.id) {
                    func(id);
                } else {
                    pkg.dumpStack("No ID");
                }
            } else {
                pkg.dumpStack("No processor");
            }
        },
        
        register = identifiable => {
            doFuncOnIdentifiable(identifiable, id => {processorsById[id] = identifiable;});
        },
        
        /** Modifies a value. Typically used to convert a form element value to its
            canonical form.
            
            Events:
                None
            
            Attributes:
                id:string The ideally unique ID for this value processor.
                runForDefault:boolean Indicates this processor should be run for
                    default form values. Defaults to true.
                runForRollback:boolean Indicates this processor should be run for
                    rollback form values. Defaults to true.
                runForCurrent:boolean Indicates this processor should be run for
                    current form values. Defaults to true.
            
            @class */
        ValueProcessor = pkg.ValueProcessor = new JSClass('ValueProcessor', {
            // Class Methods ///////////////////////////////////////////////////
            extend: {
                DEFAULT_ATTR: 'runForDefault',
                ROLLBACK_ATTR: 'runForRollback',
                CURRENT_ATTR: 'runForCurrent'
            },
            
            
            // Constructor /////////////////////////////////////////////////////
            /** Creates a new ValueProcessor
                @param {string} id - The ideally unique ID for a processor instance.
                @param {boolean} [runForDefault]
                @param {boolean} [runForRollback]
                @param {boolean} [runForCurrent]
                @returns {undefined} */
            initialize: function(id, runForDefault, runForRollback, runForCurrent) {
                this.id = id;
                
                this[ValueProcessor.DEFAULT_ATTR] = runForDefault ? true : false;
                this[ValueProcessor.ROLLBACK_ATTR] = runForRollback ? true : false;
                this[ValueProcessor.CURRENT_ATTR] = runForCurrent ? true : false;
            },
            
            
            // Methods /////////////////////////////////////////////////////////
            /** Processes the value. The default implementation returns the value
                unmodified.
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
                // Don't convert "empty" values to a number since they'll become zero
                // which is probably incorrect. Also catch undefined/null values since
                // they will become NaN.
                if (value == null || value === "" || value === "-") return value;
                
                const numericValue = Number(value);
                return isNaN(numericValue) ? value : numericValue;
            }
        }),
        
        /** Trims the whitespace from a value.
            
            Attributes:
                trim:string Determines what kind of trimming to do. Supported values
                    are 'left', 'right' and 'both'. The default value is 'both'.
            
            @class */
        TrimValueProcessor = pkg.TrimValueProcessor = new JSClass('TrimValueProcessor', ValueProcessor, {
            // Constructor /////////////////////////////////////////////////////
            /** @overrides myt.ValueProcessor
                @param {string} id - The ideally unique ID for a processor instance.
                @param {boolean} [runForDefault]
                @param {boolean} [runForRollback]
                @param {boolean} [runForCurrent]
                @param trim:string Determines the type of trimming to do. Allowed
                    values are 'left', 'right' or 'both'. The default value 
                    is 'both'.
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
                defaultValue:* The value to return when the processed value is undefined.
            
            @class */
        UndefinedValueProcessor = pkg.UndefinedValueProcessor = new JSClass('UndefinedValueProcessor', ValueProcessor, {
            // Constructor /////////////////////////////////////////////////////
            /** @overrides myt.ValueProcessor
                @param {string} id - The ideally unique ID for a processor instance.
                @param {boolean} [runForDefault]
                @param {boolean} [runForRollback]
                @param {boolean} [runForCurrent]
                @param {*} [defaultValue] - The default value to convert undefined to.
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
            @param {!Object} [otherField] - The myt.FormElement to pull the value from.
            @returns {undefined} */
        initialize: function(id, runForDefault, runForRollback, runForCurrent, otherField) {
            this.callSuper(id, runForDefault, runForRollback, runForCurrent);
            
            this.otherField = otherField;
        },
        
        
        // Methods /////////////////////////////////////////////////////////////
        /** @overrides */
        process: function(value) {
            return (value == null || value === "") ? this.otherField.getValue() : value;
        }
    });
    
    /** Stores myt.ValueProcessors by ID so they can be used in multiple
        places easily. */
    new JS.Singleton('GlobalValueProcessorRegistry', {
        // Life Cycle //////////////////////////////////////////////////////////
        initialize: function() {
            // Register a few common ValueProcessors
            register(new UndefinedValueProcessor('undefToEmpty', true, true, true, ''));
            register(new ToNumberValueProcessor('toNumber', true, true, true));
            register(new TrimValueProcessor('trimLeft', true, true, true, 'left'));
            register(new TrimValueProcessor('trimRight', true, true, true, 'right'));
            register(new TrimValueProcessor('trimBoth', true, true, true, 'both'));
            
            pkg.global.register('valueProcessors', this);
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
        register: register,
        
        /** Removes a ValueProcessor from this registery.
            @param identifiable:myt.ValueProcessor the ValueProcessor to remove.
            @returns {undefined} */
        unregister: identifiable => {
            doFuncOnIdentifiable(identifiable, (id) => {
                // Make sure the processor is in the repository then delete.
                if (getValueProcessor(id)) delete processorsById[id];
            });
        }
    });
})(myt);

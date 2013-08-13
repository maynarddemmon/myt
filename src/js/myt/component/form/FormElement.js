/** Provides "form" element functionality to a node. A form element is a
    form that actually has a value.
    
    Attributes:
        value:* The current value of the form element.
        rollbackValue:* The rollback value of the form element.
        defaultValue:* The default value of the form element.
        _valueProcessors:array A list of myt.ValueProcessors that get applied 
            to a value whenever it is retrieved via the methods: 
            getValue, getRollbackValue or getDefaultValue.
*/
myt.FormElement = new JS.Module('FormElement', {
    include: [myt.Form],
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    initNode: function(parent, attrs) {
        this._valueProcessors = [];
        
        this.callSuper(parent, attrs);
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    /** @overrides myt.Form */
    getValue: function() {
        return this._processValue(
            this.callSuper ? this.callSuper() : this.value, 'runForCurrent'
        );
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
        return this._processValue(this.defaultValue, 'runForDefault');
    },
    
    /** @overrides myt.Form */
    setDefaultValue: function(value) {
        if (this.defaultValue !== value) {
            this.defaultValue = value;
            if (this.inited) this.fireNewEvent('defaultValue', value);
            this.verifyChangedState();
        }
        return value;
    },
    
    /** @overrides myt.Form */
    getRollbackValue: function() {
        return this._processValue(this.rollbackValue, 'runForRollback');
    },
    
    /** @overrides myt.Form */
    setRollbackValue: function(value) {
        if (value === undefined) value = this.getDefaultValue();
        if (this.rollbackValue !== value) {
            this.rollbackValue = value;
            if (this.inited) this.fireNewEvent('rollbackValue', value);
            this.verifyChangedState();
        }
        return value;
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** Adds a ValueProcessor to this form element.
        @param processor:myt.ValueProcessor
        @returns void */
    addValueProcessor: function(processor) {
        this._valueProcessors.push(processor);
    },
    
    /** Removes a ValueProcessor from this form element.
        @param id:string the ID of the processor to remove.
        @returns the removed myt.ValueProcessor or null if not found. */
    removeValueProcessor: function(id) {
        if (id) {
            var processors = this._valueProcessors, i = processors.length, processor;
            while (i) {
                processor = processors[--i];
                if (processor.id === id) {
                    processors.splice(i, 1);
                    return processor;
                }
            }
        }
        return null;
    },
    
    /** Runs the provided value through all the ValueProcessors.
        @param value:* the value to process.
        @param checkAttr:string the name of the attribute on each processor 
            that is checked to see if that processor should be run or not.
        @returns the processed value. */
    _processValue: function(value, checkAttr) {
        var processors = this._valueProcessors, 
            len = processors.length, processor, i = 0;
        for (; len > i; ++i) {
            processor = processors[i];
            if (processor[checkAttr]) value = processor.process(value);
        }
        return value;
    },
    
    /** @overrides myt.Form */
    addSubForm: function(subform) {
        myt.dumpStack("addSubForm not supported on form elements.");
    },
    
    /** @overrides myt.Form */
    getSubForm: function(id) {
        myt.dumpStack("getSubForm not supported on form elements.");
        return null;
    },
    
    /** @overrides myt.Form */
    removeSubForm: function(id) {
        myt.dumpStack("removeSubForm not supported on form elements.");
        return null;
    },
    
    /** @overrides myt.Form */
    verifyChangedState: function(subformToIgnore) {
        var isChanged = this.value !== this.rollbackValue;
        this.setIsChanged(isChanged);
        return isChanged;
    },
    
    /** @overrides myt.Form */
    setup: function(defaultValue, rollbackValue, value) {
        this._lockCascade = true;
        
        // Reset values to uninitialized state to make repeated calls to
        // setup behave identically.
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
        
        var defaultValue = this.getDefaultValue();
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

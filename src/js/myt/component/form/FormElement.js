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
*/
myt.FormElement = new JS.Module('FormElement', {
    include: [myt.Form],
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    initNode: function(parent, attrs) {
        this.__vp = [];
        
        this.callSuper(parent, attrs);
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    /** @overrides myt.Form */
    getValue: function() {
        return this.__processValue(
            this.callSuper ? this.callSuper() : this.value, myt.ValueProcessor.CURRENT_ATTR
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
        return this.__processValue(this.defaultValue, myt.ValueProcessor.DEFAULT_ATTR);
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
        return this.__processValue(this.rollbackValue, myt.ValueProcessor.ROLLBACK_ATTR);
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
        let i = processors.length, 
            processor;
        while (i) {
            processor = processors[--i];
            if (typeof processor === 'string') {
                processors[i] = processor = myt.global.valueProcessors.getValueProcessor(processor);
                if (!processor) processors.splice(i, 1);
            }
        }
        
        this.__vp = processors;
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
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
    
    /** Runs the provided value through all the ValueProcessors.
        @private
        @param value:* The value to process.
        @param checkAttr:string The name of the attribute on each processor 
            that is checked to see if that processor should be run or not.
        @returns * The processed value. */
    __processValue: function(value, checkAttr) {
        const processors = this.__vp, 
            len = processors.length;
        for (let i = 0; len > i;) {
            const processor = processors[i++];
            if (processor[checkAttr]) value = processor.process(value);
        }
        return value;
    },
    
    /** @overrides myt.Form */
    addSubForm: subform => {
        myt.dumpStack("addSubForm not supported on form elements.");
    },
    
    /** @overrides myt.Form */
    getSubForm: id => {
        myt.dumpStack("getSubForm not supported on form elements.");
        return null;
    },
    
    /** @overrides myt.Form */
    removeSubForm: id => {
        myt.dumpStack("removeSubForm not supported on form elements.");
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
        
        // Reset values to uninitialized state to make repeated calls to
        // setup behave identically. Otherwise values could bleed through.
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

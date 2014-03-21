/** A wrapper around a native browser select component.
    
    Events:
        multiple:boolean
        size:int
        value:string
    
    Attributes:
        multiple:boolean Indicates if multiple options can be selected or not.
            Defaults to false.
        size:int The number of options to show. The default value is 4 for
            multiple == true and 1 for multiple == false. It is recommended
            that a size of at least 4 be used when multiple is 2.
        options:array (write only) Adds a list of options to this select list.
            The value should be an array of myt.InputSelectOptions attrs that 
            will be used to instantiate new myt.InputSelectOption instances on
            this select list.
*/
myt.InputSelect = new JS.Class('InputSelect', myt.NativeInputWrapper, {
    include: [myt.SizeHeightToDom],
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides myt.NativeInputWrapper */
    initNode: function(parent, attrs) {
        if (attrs.multiple === undefined) attrs.multiple = false;
        if (attrs.size === undefined) attrs.size = attrs.multiple ? 4 : 1;
        
        this.callSuper(parent, attrs);
        
        this.attachToDom(this, '__syncToDom', 'change');
        
        // Make sure initial value is in sync with the UI
        this.__syncToDom();
    },
    
    /** @overrides myt.NativeInputWrapper */
    createOurDomElement: function(parent) {
        var elem = document.createElement('select');
        elem.style.position = 'absolute';
        return elem;
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setMultiple: function(v) {
        if (this.multiple !== v) {
            this.multiple = this.domElement.multiple = v;
            if (this.inited) this.fireNewEvent('multiple', v);
        }
    },
    
    setSize: function(v) {
        if (this.size !== v) {
            this.size = this.domElement.size = v;
            if (this.inited) this.fireNewEvent('size', v);
        }
    },
    
    setOptions: function(v) {
        if (Array.isArray(v)) {
            for (var i = 0, len = v.length; len > i; ++i) this.addOption(v[i]);
        }
    },
    
    /** The options are just the subviews.
        @returns an array of options for this select list. */
    getOptions: function() {
        return this.getSubviews().concat();
    },
    
    /** @overrides myt.NativeInputWrapper
        Does not update the dom since the dom element's 'value' attribute
        doesn't support lists. */
    setValue: function(v) {
        if (Array.isArray(v) && myt.areArraysEqual(v, this.value)) return;
        
        if (this.value !== v) {
            this.value = v;
            if (this.inited) this.fireNewEvent('value', v);
        }
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** @overrides myt.View */
    subviewAdded: function(sv) {
        // Destroy subview if it's not supported.
        if (!(sv instanceof myt.InputSelectOption)) {
            myt.dumpStack("Subview not supported. Destroying it.");
            sv.destroy();
        }
    },
    
    /** @overrides myt.FocusObservable */
    showFocusEmbellishment: function() {
        this.hideDefaultFocusEmbellishment();
        this.setBoxShadow(myt.Button.DEFAULT_FOCUS_SHADOW_PROPERTY_VALUE);
    },
    
    /** @overrides myt.FocusObservable */
    hideFocusEmbellishment: function() {
        this.hideDefaultFocusEmbellishment();
        this.setBoxShadow();
    },
    
    // Options //
    /** Gets an array of selected myt.InputSelectOptions.
        @returns array: An array of selected myt.InputSelectOptions. */
    getSelectedOptions: function() {
        var options = this.getOptions(), i = options.length, option, retval = [];
        while (i) {
            option = options[--i];
            if (option.isSelected()) retval.push(option);
        }
        return retval;
    },
    
    /** Gets an array of selected myt.InputSelectOption values.
        @returns array: An array of selected option values. */
    getSelectedOptionValues: function() {
        var options = this.getOptions(), i = options.length, option, retval = []
        while (i) {
            option = options[--i];
            if (option.isSelected()) retval.push(option.value);
        }
        return retval;
    },
    
    /** Gets the myt.InputSelectOption with the provided value.
        @param value:* The value of the option to get.
        @returns myt.InputSelectOption: The matching option or null if not
            found. */
    getOptionForValue: function(value) {
        var options = this.getOptions(), i = options.length, option;
        while (i) {
            option = options[--i];
            if (option.value === value) return option;
        }
        return null;
    },
    
    /** Adds a new myt.InputSelectionOption to this select list.
        @param attrs:object The attrs for the new option
        @returns myt.InputSelectOption: The newly created option. */
    addOption: function(attrs) {
        new myt.InputSelectOption(this, attrs);
    },
    
    /** Destroys an option that has the provided value.
        @param value:* The value of the option to remove.
        @returns boolean: true if the option is destroyed, false otherwise. */
    destroyOptionWithValue: function(value) {
        var option = this.getOptionForValue(value);
        if (option) {
            option.destroy();
            if (option.destroyed) return true;
        }
        return false;
    },
    
    // Selection //
    /** Deselects all selected options included disabled options.
        @returns void */
    deselectAll: function() {
        var options = this.getOptions(), i = options.length, option, changed = false;
        while (i) {
            option = options[--i];
            if (option.isSelected()) {
                option.setSelected(false);
                changed = true;
            }
        }
        
        if (changed) this.__syncToDom();
    },
    
    selectValues: function(values) {
        values = Array.isArray(values) ? values : [values];
        var i = values.length;
        while (i) this.selectValue(values[--i]);
    },
    
    /** Selects the option that has the provided value.
        @param value:* The value of the option to select.
        @returns void */
    selectValue: function(value) {
        this.select(this.getOptionForValue(value));
    },
    
    /** Selects the provided option.
        @param option:myt.InputSelectOption The option to select.
        @returns void */
    select: function(option) {
        if (option && option.canSelect(this)) {
            option.setSelected(true);
            this.__syncToDom();
        }
    },
    
    /** Deselects the option that has the provided value.
        @param value:* The value of the option to deselect.
        @returns void */
    deselectValue: function(value) {
        this.deselect(this.getOptionForValue(value));
    },
    
    /** Deselects the provided option.
        @param option:myt.InputSelectOption The option to deselect.
        @returns void */
    deselect: function(option) {
        if (option && option.canDeselect(this)) {
            option.setSelected(false);
            this.__syncToDom();
        }
    },
    
    /** @private */
    __syncToDom: function(event) {
        this.setValue(this.multiple ? this.getSelectedOptionValues() : this.getDomValue());
    }
});

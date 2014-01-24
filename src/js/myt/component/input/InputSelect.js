/** A wrapper around a native browser select component.
    
    Events:
        multiple:boolean
        size:int
        value:string
    
    Attributes:
        multiple:boolean Indicates if multiple options can be selected or not.
            Defaults to false.
        size:int The number of options to show. The default value is 1.
        
*/
myt.InputSelect = new JS.Class('InputSelect', myt.NativeInputWrapper, {
    include: [myt.SizeHeightToDom],
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides myt.NativeInputWrapper */
    initNode: function(parent, attrs) {
        if (attrs.multiple === undefined) attrs.multiple = false;
        if (attrs.size === undefined) attrs.size = attrs.multiple ? 4 : 1;
        
        this.callSuper(parent, attrs);
        
        this.attachToDom(this, '__handleInput', 'change');
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
        // Destory subview if it's not supported.
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
    
    /** Gets an array of selected myt.InputSelectOptions.
        @returns array: An arra of selected options. */
    getSelectedOptions: function() {
        var options = this.getSubviews(), i = options.length, option, retval = [];
        while (i) {
            option = options[--i];
            if (option.isSelected()) retval.push(option);
        }
        return retval;
    },
    
    /** Gets an array of selected myt.InputSelectOption values.
        @returns array: An arra of selected option values. */
    getSelectedOptionValues: function() {
        var options = this.getSubviews(), i = options.length, option, retval = []
        while (i) {
            option = options[--i];
            if (option.isSelected()) retval.push(option.value);
        }
        return retval;
    },
    
    getOptionForValue: function(value) {
        var options = this.getSubviews(), i = options.length, option;
        while (i) {
            option = options[--i];
            if (option.value === value) return option;
        }
        return null;
    },
    
    deselectAll: function() {
        var options = this.getSubviews(), i = options.length, option, changed = false;
        while (i) {
            option = options[--i];
            if (option.isSelected()) {
                option.setSelected(false);
                changed = true;
            }
        }
        
        if (changed) this.__handleInput();
    },
    
    selectValue: function(value) {
        this.select(this.getOptionForValue(value));
    },
    
    select: function(option) {
        if (option && option.canSelect(this)) {
            option.setSelected(true);
            this.__handleInput();
        }
    },
    
    deselectValue: function(value) {
        this.deselect(this.getOptionForValue(value));
    },
    
    deselect: function(option) {
        if (option && option.canDeselect(this)) {
            option.setSelected(false);
            this.__handleInput();
        }
    },
    
    /** @private */
    __handleInput: function(event) {
        this.setValue(this.multiple ? this.getSelectedOptionValues() : this.domElement.value);
    }
});

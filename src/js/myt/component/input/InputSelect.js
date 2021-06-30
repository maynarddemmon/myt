((pkg) => {
    const JSClass = JS.Class,
    
        /** An option in a native browser select element.
            
            Events:
                value:*
                label:string
            
            Attributes:
                value:* the value of the option.
                label:string the text label for the option.
            
            @class */
        InputSelectOption = pkg.InputSelectOption = new JSClass('InputSelectOption', pkg.View, {
            include: [pkg.Disableable, pkg.Selectable],
            
            
            // Life Cycle //////////////////////////////////////////////////////////////
            /** @overrides myt.Input */
            createOurDomElement: function(parent) {
                return document.createElement('option');
            },
            
            
            // Accessors ///////////////////////////////////////////////////////////////
            /** @overrideds myt.Selectable */
            setSelected: function(v) {
                // Adapt to event from syncTo
                if (v !== null && typeof v === 'object') v = v.value;
                
                const de = this.getInnerDomElement();
                if (de.selected !== v) de.selected = v;
            },
            
            /** @overrides myt.Disableable */
            setDisabled: function(v) {
                if (this.disabled !== v) {
                    this.getInnerDomElement().disabled = v;
                    this.callSuper(v);
                }
            },
            
            setValue: function(v) {
                if (this.value !== v) {
                    this.value = v;
                    if (this.getInnerDomElement().value !== v) this.getInnerDomElement().value = v;
                    if (this.inited) this.fireEvent('value', v);
                }
            },
            
            setLabel: function(v) {
                if (this.label !== v) {
                    this.getInnerDomElement().textContent = this.label = v;
                    if (this.inited) this.fireEvent('label', v);
                }
            },
            
            
            // Methods /////////////////////////////////////////////////////////////////
            /** @overrideds myt.Selectable */
            isSelected: function() {
                return this.getInnerDomElement().selected;
            },
            
            /** @overrideds myt.Selectable */
            canSelect: function(selectionManager) {
                return !this.disabled && !this.getInnerDomElement().selected && this.parent === selectionManager;
            },
            
            /** @overrideds myt.Selectable */
            canDeselect: function(selectionManager) {
                return !this.disabled && this.getInnerDomElement().selected && this.parent === selectionManager;
            }
        });
    
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
        
        @class */
    pkg.InputSelect = new JSClass('InputSelect', pkg.NativeInputWrapper, {
        include: [pkg.SizeToDom],
        
        
        // Life Cycle //////////////////////////////////////////////////////////////
        /** @overrides myt.NativeInputWrapper */
        initNode: function(parent, attrs) {
            if (attrs.tagName == null) attrs.tagName = 'select';
            attrs.inputType = null;
            
            if (attrs.multiple == null) attrs.multiple = false;
            if (attrs.size == null) attrs.size = attrs.multiple ? 4 : 1;
            
            this.callSuper(parent, attrs);
            
            this.attachToDom(this, '__syncToDom', 'change');
            
            // Make sure initial value is in sync with the UI
            this.__syncToDom();
        },
        
        
        // Accessors ///////////////////////////////////////////////////////////////
        setMultiple: function(v) {
            if (this.multiple !== v) {
                this.multiple = this.getInnerDomElement().multiple = v;
                if (this.inited) this.fireEvent('multiple', v);
            }
        },
        
        setSize: function(v) {
            if (this.size !== v) {
                this.size = this.getInnerDomElement().size = v;
                if (this.inited) this.fireEvent('size', v);
            }
        },
        
        setOptions: function(v) {
            this.destroyAllOptions();
            if (Array.isArray(v)) {
                const len = v.length;
                for (let i = 0; len > i; ++i) this.addOption(v[i]);
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
            if (Array.isArray(v) && pkg.areArraysEqual(v, this.value)) return;
            
            if (this.value !== v) {
                this.value = v;
                if (this.inited) this.fireEvent('value', v);
            }
        },
        
        
        // Methods /////////////////////////////////////////////////////////////////
        /** @overrides myt.View */
        subviewAdded: function(sv) {
            // Destroy subview if it's not supported.
            if (!(sv instanceof InputSelectOption)) {
                pkg.dumpStack("Subview not supported. Destroying it.");
                sv.destroy();
            }
        },
        
        /** @overrides myt.FocusObservable */
        showFocusEmbellishment: function() {
            this.hideDefaultFocusEmbellishment();
            this.setBoxShadow(pkg.Button.DEFAULT_FOCUS_SHADOW_PROPERTY_VALUE);
        },
        
        /** @overrides myt.FocusObservable */
        hideFocusEmbellishment: function() {
            this.hideDefaultFocusEmbellishment();
            this.setBoxShadow();
        },
        
        // Options //
        /** Gets an array of selected myt.InputSelectOptions.
            @returns {!Array} - An array of selected myt.InputSelectOptions. */
        getSelectedOptions: function() {
            const options = this.getOptions(), 
                retval = []; 
            let i = options.length;
            while (i) {
                const option = options[--i];
                if (option.isSelected()) retval.push(option);
            }
            return retval;
        },
        
        /** Gets an array of selected myt.InputSelectOption values.
            @returns {!Array} - An array of selected option values. */
        getSelectedOptionValues: function() {
            const options = this.getOptions(), 
                retval = []; 
            let i = options.length;
            while (i) {
                const option = options[--i];
                if (option.isSelected()) retval.push(option.value);
            }
            return retval;
        },
        
        /** Gets the myt.InputSelectOption with the provided value.
            @param {*} value - The value of the option to get.
            @returns {?Object} - The matching myt.InputSelectOption option or null 
                if not found. */
        getOptionForValue: function(value) {
            const options = this.getOptions();
            let i = options.length;
            while (i) {
                const option = options[--i];
                if (option.value === value) return option;
            }
            return null;
        },
        
        /** Adds a new myt.InputSelectionOption to this select list.
            @param attrs:object The attrs for the new option
            @returns myt.InputSelectOption: The newly created option. */
        addOption: function(attrs) {
            new InputSelectOption(this, attrs);
        },
        
        destroyAllOptions: function() {
            const options = this.getOptions();
            let i = options.length;
            while (i) options[--i].destroy();
        },
        
        /** Destroys an option that has the provided value.
            @param value:* The value of the option to remove.
            @returns boolean: true if the option is destroyed, false otherwise. */
        destroyOptionWithValue: function(value) {
            const option = this.getOptionForValue(value);
            if (option) {
                option.destroy();
                if (option.destroyed) return true;
            }
            return false;
        },
        
        // Selection //
        /** Deselects all selected options included disabled options.
            @returns {undefined} */
        deselectAll: function() {
            const options = this.getOptions();
            let i = options.length, 
                changed = false;
            while (i) {
                const option = options[--i];
                if (option.isSelected()) {
                    option.setSelected(false);
                    changed = true;
                }
            }
            
            if (changed) this.__doChanged();
        },
        
        selectValues: function(values) {
            values = Array.isArray(values) ? values : [values];
            let i = values.length;
            while (i) this.selectValue(values[--i]);
        },
        
        /** Selects the option that has the provided value.
            @param value:* The value of the option to select.
            @returns {undefined} */
        selectValue: function(value) {
            this.select(this.getOptionForValue(value));
        },
        
        /** Selects the provided option.
            @param option:myt.InputSelectOption The option to select.
            @returns {undefined} */
        select: function(option) {
            if (option && option.canSelect(this)) {
                option.setSelected(true);
                this.__syncToDom();
            }
        },
        
        /** Deselects the option that has the provided value.
            @param {*} value - The value of the option to deselect.
            @returns {undefined} */
        deselectValue: function(value) {
            this.deselect(this.getOptionForValue(value));
        },
        
        /** Deselects the provided option.
            @param option:myt.InputSelectOption The option to deselect.
            @returns {undefined} */
        deselect: function(option) {
            if (option && option.canDeselect(this)) {
                option.setSelected(false);
                this.__syncToDom();
            }
        },
        
        /** @private
            @param {!Object} event
            @returns {undefined} */
        __doChanged: function(event) {
            this.__syncToDom();
            this.doChanged();
        },
        
        /** Called whenever the underlying dom element fires a "change" event.
            @returns {undefined} */
        doChanged: () => {},
        
        /** @private
            @returns {undefined} */
        __syncToDom: function() {
            this.setValue(this.multiple ? this.getSelectedOptionValues() : this.getDomValue());
        }
    });
})(myt);

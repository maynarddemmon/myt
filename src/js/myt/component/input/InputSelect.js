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
        if (attrs.size === undefined) attrs.size = 1;
        
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
        if (this.value !== v) {
            this.value = v;
            if (this.inited) this.fireNewEvent('value', v);
        }
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** @overrides myt.FocusObservable */
    showFocusEmbellishment: function() {
        // Outline positioning is inconsistent between retina and non-retina
        // macs so just avoid messing with the built in focus styling all 
        // together.
        if (BrowserDetect.browser !== 'Firefox') this.callSuper();
    },
    
    /** @overrides myt.FocusObservable */
    hideFocusEmbellishment: function() {
        // Outline positioning is inconsistent between retina and non-retina
        // macs so just avoid messing with the built in focus styling all 
        // together.
        if (BrowserDetect.browser !== 'Firefox') this.callSuper();
    },
    
    getSelectedOptions: function() {
        var options = this.domElement.options, retval = [];
        if (options) {
            var i = options.length, option;
            while (i) {
                option = options[--i];
                if (option.selected) retval.push(option);
            }
        }
        return retval;
    },
    
    getSelectedOptionValues: function() {
        var options = this.domElement.options, retval = []
        if (options) {
            var i = options.length, option;
            while (i) {
                option = options[--i];
                if (option.selected) retval.push(option.value);
            }
        }
        return retval;
    },
    
    getOptionForValue: function(value) {
        var options = this.domElement.options;
        if (options) {
            var i = options.length, option;
            while (i) {
                option = options[--i];
                if (option.value === value) return option;
            }
        }
        return null;
    },
    
    toggleValue: function(value) {
        var option = this.getOptionForValue(value);
        if (option && !option.disabled) {
            option.selected = !option.selected;
            this.__handleInput();
        }
    },
    
    selectValue: function(value) {
        var option = this.getOptionForValue(value);
        if (option && !option.disabled && !option.selected) {
            option.selected = true;
            this.__handleInput();
        }
    },
    
    deselectValue: function(value) {
        var option = this.getOptionForValue(value);
        if (option && !option.disabled && option.selected) {
            option.selected = false;
            this.__handleInput();
        }
    },
    
    /** @private */
    __handleInput: function(event) {
        this.setValue(this.multiple ? this.getSelectedOptionValues() : this.domElement.value);
    }
});

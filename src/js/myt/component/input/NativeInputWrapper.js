/** A wrapper around a native browser input element.
    
    Attributes:
        value:* the current value of the input element.
        inputType:string the type of the input element to create. Changing
            this value after initialization will modify the type of the
            underlying dom element and is not generally supported.
            See https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#attr-type
            for more info and a list of allowed values.
*/
myt.NativeInputWrapper = new JS.Class('NativeInputWrapper', myt.View, {
    include: [myt.Disableable, myt.InputObservable],
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides myt.View */
    initNode: function(parent, attrs) {
        // Modify attrs so setter gets called.
        if (attrs.focusable === undefined) attrs.focusable = true;
        
        this.callSuper(parent, attrs);
    },
    
    /** @overrides myt.View */
    createOurDomElement: function(parent) {
        var elem = document.createElement('input');
        elem.style.position = 'absolute';
        elem.type = this.inputType;
        return elem;
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    /** @overrides myt.Disableable */
    setDisabled: function(v) {
        if (this.disabled === v) return;
        this.domElement.disabled = v;
        this.callSuper(v);
    },
    
    setValue: function(v) {
        if (this.value === v) return;
        this.value = v;
        if (this.domElement.value !== v) this.domElement.value = v;
        if (this.inited) this.fireNewEvent('value', v);
    },
    
    setInputType: function(v) {
        if (this.inputType === v) return;
        this.inputType = this.domElement.type = v;
        if (this.inited) this.fireNewEvent('inputType', v);
    }
});

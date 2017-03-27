/** A wrapper around a native browser input element.
    
    Events:
        value:* Fired when the setValue setter is called.
    
    Attributes:
        value:* the current value of the input element.
        inputType:string (read only) the type of the input element to create. 
            Changing this value after initialization will modify the type of the
            underlying dom element and is not generally supported.
            See https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#attr-type
            for more info and a list of allowed values.
*/
myt.NativeInputWrapper = new JS.Class('NativeInputWrapper', myt.View, {
    include: [myt.Disableable, myt.InputObservable],
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides myt.View */
    initNode: function(parent, attrs) {
        if (attrs.focusable == null) attrs.focusable = true;
        
        this.callSuper(parent, attrs);
        
        // Set a css class to allow scoping of CSS rules
        this.addDomClass('mytNativeInput');
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
        if (this.disabled !== v) {
            this.domElement.disabled = v;
            this.callSuper(v);
        }
    },
    
    setValue: function(v) {
        if (this.value !== v) {
            this.value = v;
            this.setDomValue(v);
            if (this.inited) this.fireEvent('value', v);
        }
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** Gets the value from the DOM.
        @returns * The value */
    getDomValue: function() {
        return this.domElement.value;
    },
    
    /** Sets the value on the DOM.
        @param v:* The value to set.
        @returns void */
    setDomValue: function(v) {
        var de = this.domElement;
        if (de.value !== v) de.value = v;
    }
});

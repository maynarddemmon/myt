/** An option in a native browser select element.
    
    Events:
        value:*
        label:string
    
    Attributes:
        value:* the value of the option.
        label:string the text label for the option.
*/
myt.InputSelectOption = new JS.Class('InputSelectOption', myt.View, {
    include: [myt.Disableable],
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides myt.Input */
    createOurDomElement: function(parent) {
        return document.createElement('option');
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
            if (this.domElement.value !== v) this.domElement.value = v;
            if (this.inited) this.fireNewEvent('value', v);
        }
    },
    
    setLabel: function(v) {
        if (this.label !== v) {
            this.domElement.textContent = this.label = v;
            if (this.inited) this.fireNewEvent('label', v);
        }
    }
});

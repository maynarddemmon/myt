/** An option in a native browser select element.
    
    Events:
        value:*
        label:string
    
    Attributes:
        value:* the value of the option.
        label:string the text label for the option.
*/
myt.InputSelectOption = new JS.Class('InputSelectOption', myt.View, {
    include: [myt.Disableable, myt.Selectable],
    
    
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
        
        var de = this.domElement;
        if (de.selected !== v) de.selected = v;
    },
    
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
            if (this.inited) this.fireEvent('value', v);
        }
    },
    
    setLabel: function(v) {
        if (this.label !== v) {
            this.domElement.textContent = this.label = v;
            if (this.inited) this.fireEvent('label', v);
        }
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** @overrideds myt.Selectable */
    isSelected: function() {
        return this.domElement.selected;
    },
    
    /** @overrideds myt.Selectable */
    canSelect: function(selectionManager) {
        return !this.disabled && !this.domElement.selected && this.parent === selectionManager;
    },
    
    /** @overrideds myt.Selectable */
    canDeselect: function(selectionManager) {
        return !this.disabled && this.domElement.selected && this.parent === selectionManager;
    }
});

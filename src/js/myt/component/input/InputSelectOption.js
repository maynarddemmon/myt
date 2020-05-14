/** An option in a native browser select element.
    
    Events:
        value:*
        label:string
    
    Attributes:
        value:* the value of the option.
        label:string the text label for the option.
    
    @class */
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

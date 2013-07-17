/** A wrapper around a native browser checkbox.
    
    Attributes:
        checked:boolean checks or unchecks the checkbox.
*/
myt.InputCheckbox = new JS.Class('InputCheckbox', myt.NativeInputWrapper, {
    include: [myt.SizeToDom],
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides myt.NativeInputWrapper */
    initNode: function(parent, attrs) {
        this.inputType = 'checkbox';
        
        this.callSuper(parent, attrs);
        
        this.attachToDom(this, '_handleInput', 'change');
        this.attachToDom(this, '_handleMouseDown', 'mousedown');
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setChecked: function(v) {
        if (this.checked === v) return;
        this.checked = v
        this.domElement.checked = v;
        if (this.inited) this.fireNewEvent('checked', v);
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** @overrides myt.FocusObservable */
    showFocusEmbellishment: function() {
        // Outline positioning is inconsistent between retina and non-retina
        // macs so just avoid messing with the built in focus styling all together.
        if (BrowserDetect.browser !== 'Firefox') this.callSuper();
    },
    
    /** @overrides myt.FocusObservable */
    hideFocusEmbellishment: function() {
        // Outline positioning is inconsistent between retina and non-retina
        // macs so just avoid messing with the built in focus styling all together.
        if (BrowserDetect.browser !== 'Firefox') this.callSuper();
    },
    
    _handleInput: function(event) {
        this.setValue(this.domElement.checked);
    },
    
    _handleMouseDown: function(event) {
        this.focus();
    }
});

/** A wrapper around a native browser radio button.
    
    Attributes:
        checked:boolean checks or unchecks the radio button.
        groupId:string the name of the group the radio button is a member of
            If not provided during initialization a unique group id will be
            generated.
        optionValue:string the value of the radio button.
*/
myt.InputRadio = new JS.Class('InputRadio', myt.NativeInputWrapper, {
    include: [myt.SizeToDom],
    
    // Class Methods ///////////////////////////////////////////////////////////
    extend: {
        /** Creates a new unique group ID.
            @returns the group ID. */
        getGroupId: function() {
            if (!myt.InputRadio.__idCounter) myt.InputRadio.__idCounter = 0;
            return ++myt.InputRadio.__idCounter;
        }
    },
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides myt.NativeInputWrapper */
    initNode: function(parent, attrs) {
        // Modify attrs so setter gets called.
        if (attrs.groupId === undefined) attrs.groupId = myt.InputRadio.getGroupId();
        
        this.inputType = 'radio';
        
        this.callSuper(parent, attrs);
        
        this.attachToDom(this, '_handleInput', 'change');
        this.attachToDom(this, '_handleMouseDown', 'mousedown');
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setChecked: function(v) {
        if (this.checked === v) return;
        this.checked = v;
        this.domElement.checked = v;
        if (this.inited) this.fireNewEvent('checked', v);
    },
    
    setGroupId: function(v) {
        if (this.groupId === v) return;
        this.groupId = v;
        this.domElement.name = v;
        if (this.inited) this.fireNewEvent('groupId', v);
    },
    
    setOptionValue: function(v) {
        if (this.optionValue === v) return;
        this.optionValue = v;
        this.domElement.value = v;
        if (this.inited) this.fireNewEvent('optionValue', v);
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
    
    _handleInput: function(e) {
        this.setValue(this.domElement.checked);
    },
    
    _handleMouseDown: function(e) {
        this.focus();
    }
});

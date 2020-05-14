/** A wrapper around a native browser radio button.
    
    Events:
        checked:boolean
        groupId:string
        optionValue:string
    
    Attributes:
        checked:boolean Checks or unchecks the radio button.
        groupId:string The name of the group the radio button is a member of
            If not provided during initialization a unique group id will be
            generated. Changes to the groupId after initialization do not
            appear to effect the group membership.
        optionValue:string The value of the radio button.
    
    @deprecated No longer included in the manifest.js file.
*/
myt.InputRadio = new JS.Class('InputRadio', myt.NativeInputWrapper, {
    include: [myt.SizeToDom],
    
    // Class Methods and Attributes ////////////////////////////////////////////
    extend: {
        /** Stores the last checked myt.InputRadio by groupId. Needed so we
            can set the value of a radio to false when another radio in the 
            group is checked. */
        lastChecked: {}
    },
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides myt.NativeInputWrapper */
    initNode: function(parent, attrs) {
        if (attrs.groupId == null) attrs.groupId = myt.generateGuid();
        
        this.inputType = 'radio';
        
        this.callSuper(parent, attrs);
        
        this.attachToDom(this, '__syncToDom', 'change');
        this.attachToDom(this, '__handleMouseDown', 'mousedown');
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setChecked: function(v) {
        if (this.checked !== v) {
            this.checked = this.getInnerDomElement().checked = v;
            if (this.inited) this.fireEvent('checked', v);
        }
    },
    
    setGroupId: function(v) {
        if (this.groupId !== v) {
            this.groupId = this.getInnerDomElement().name = v;
            if (this.inited) this.fireEvent('groupId', v);
        }
    },
    
    setOptionValue: function(v) {
        if (this.optionValue !== v) {
            this.optionValue = this.getInnerDomElement().value = v;
            if (this.inited) this.fireEvent('optionValue', v);
        }
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** @overrides myt.FocusObservable */
    showFocusEmbellishment: function() {
        // Outline positioning is inconsistent between retina and non-retina
        // macs so just avoid messing with the built in focus styling all together.
        if (BrowserDetect.browser === 'Firefox') {
            this.hideDefaultFocusEmbellishment();
            this.setBoxShadow(myt.Button.DEFAULT_FOCUS_SHADOW_PROPERTY_VALUE);
        } else {
            this.callSuper();
        }
    },
    
    /** @overrides myt.FocusObservable */
    hideFocusEmbellishment: function() {
        // Outline positioning is inconsistent between retina and non-retina
        // macs so just avoid messing with the built in focus styling all together.
        if (BrowserDetect.browser === 'Firefox') {
            this.hideDefaultFocusEmbellishment();
            this.setBoxShadow();
        } else {
            this.callSuper();
        }
    },
    
    /** @private
        @param {!Object} event
        @returns {undefined} */
    __syncToDom: function(event) {
        if (this.getInnerDomElement().checked) {
            // Get last checked and deselect
            const groupId = this.groupId, 
                cache = myt.InputRadio.lastChecked,
                lastChecked = cache[groupId];
            if (lastChecked) lastChecked.setValue(false);
            
            this.setValue(true);
            cache[groupId] = this;
        }
    },
    
    /** @private
        @param {!Object} event
        @returns {undefined} */
    __handleMouseDown: function(event) {
        this.focus();
    }
});

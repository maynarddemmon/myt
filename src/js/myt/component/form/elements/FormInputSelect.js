/** An myt.InputSelect that is also a FormElement.
    
    Events:
        None
    
    Attributes:
        None
    
    Private Attributes:
        __abortSetValue:boolean Prevents setValue from being called again
            when performing operations from within setValue.
*/
myt.FormInputSelect = new JS.Class('FormInputSelect', myt.InputSelect, {
    include: [myt.FormElement],
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    /** @overrides myt.FormElement */
    setValue: function(v) {
        if (this.__abortSetValue) return;
        
        var retval = this.callSuper(v);
        
        // Clear Selection
        this.__abortSetValue = true;
        this.deselectAllValues();
        this.__abortSetValue = false;
        
        // Reselect for new value
        v = Array.isArray(retval) ? retval : [retval];
        var options = this.domElement.options, len = options.length, option, j;
        if (options) {
            var i = v.length, value;
            while (i) {
                value = v[--i];
                
                j = len;
                while (j) {
                    option = options[--j];
                    if (option.value === value) option.selected = true;
                }
            }
        }
        
        return retval;
    },
    
    // Methods /////////////////////////////////////////////////////////////////
    showFocusEmbellishment: function() {
        this.hideDefaultFocusEmbellishment();
        this.setBoxShadow(myt.Button.DEFAULT_FOCUS_SHADOW_PROPERTY_VALUE);
    },
    
    hideFocusEmbellishment: function() {
        this.hideDefaultFocusEmbellishment();
        this.setBoxShadow();
    }
});

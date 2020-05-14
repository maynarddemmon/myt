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
        
        const retval = this.callSuper(v);
        
        // Clear Selection and then reselect
        this.__abortSetValue = true;
        this.deselectAll();
        this.selectValues(retval);
        this.__abortSetValue = false;
        
        return retval;
    }
});

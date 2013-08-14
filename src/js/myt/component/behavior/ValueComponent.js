/** Provides a setValue and getValue method.
    
    Attributes:
        value:* The stored value.
*/
myt.ValueComponent = new JS.Module('ValueComponent', {
    // Accessors ///////////////////////////////////////////////////////////////
    setValue: function(v) {
        if (this.value === v) return;
        this.value = v;
        if (this.inited) this.fireNewEvent('value', this.getValue());
    },
    
    getValue: function() {
        return this.value;
    }
});

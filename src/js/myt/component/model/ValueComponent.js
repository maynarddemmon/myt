/** Provides a setValue and getValue method.
    
    Attributes:
        value:* The stored value.
        valueFilter:function If it exists, values will be run through this
            filter function before being set on the component. By default
            no valueFilter exists.
*/
myt.ValueComponent = new JS.Module('ValueComponent', {
    // Life Cycle //////////////////////////////////////////////////////////////
    initNode: function(parent, attrs) {
        this.callSuper(parent, attrs);
        
        // Attempt to setValue again since the valueFilter may not have been
        // set when setValue was originally called.
        if (this.valueFilter) this.setValue(this.value);
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setValueFilter: function(v) {
        this.valueFilter = v;
        
        if (this.inited && v) this.setValue(this.value);
    },
    
    setValue: function(v) {
        if (this.valueFilter) v = this.valueFilter(v);
        
        if (this.value === v) return;
        this.value = v;
        if (this.inited) this.fireNewEvent('value', this.getValue());
    },
    
    getValue: function() {
        return this.value;
    }
});

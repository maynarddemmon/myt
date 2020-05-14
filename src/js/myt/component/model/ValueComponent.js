/** Provides a setValue and getValue method.
    
    Events:
        value:*
    
    Attributes:
        value:* The stored value.
        valueFilter:function If it exists, values will be run through this
            filter function before being set on the component. By default
            no valueFilter exists. A value filter function must take a 
            single value as an argument and return a value.
*/
myt.ValueComponent = new JS.Module('ValueComponent', {
    // Life Cycle //////////////////////////////////////////////////////////////
    initNode: function(parent, attrs) {
        this.appendToEarlyAttrs('valueFilter','value');
        this.callSuper(parent, attrs);
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setValueFilter: function(v) {
        this.valueFilter = v;
        
        if (this.inited && v) this.setValue(this.value);
    },
    
    setValue: function(v) {
        if (this.valueFilter) v = this.valueFilter(v);
        
        if (this.value !== v) {
            this.value = v;
            if (this.inited) this.fireEvent('value', this.getValue());
        }
    },
    
    getValue: function() {
        return this.value;
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** Combines a value filter with any existing value filter.
        @param filter:function the value filter to add.
        @param where:string (optional) Determines where to add the filter.
            Supported values are 'first' and 'last'. Defaults to 'first'.
        @returns {undefined} */
    chainValueFilter: function(filter, where) {
        const existingFilter = this.valueFilter;
        let chainedFilter;
        if (existingFilter) {
            if (where === 'last') {
                chainedFilter = (v) => filter(existingFilter(v));
            } else {
                // "where" is 'first' or not provided.
                chainedFilter = (v) => existingFilter(filter(v));
            }
        } else {
            chainedFilter = filter;
        }
        this.setValueFilter(chainedFilter);
    }
});

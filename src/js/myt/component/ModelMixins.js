(pkg => {
    const JSModule = JS.Module,
        
        mathRound = Math.round,
        
        /** Provides a setValue and getValue method.
            
            Events:
                value:*
            
            Attributes:
                value:* The stored value.
                valueFilter:function If it exists, values will be run through this filter function 
                    before being set on the component. By default no valueFilter exists. A value 
                    filter function must take a single value as an argument and return a value.
            
            @class */
        ValueComponent = pkg.ValueComponent = new JSModule('ValueComponent', {
            // Life Cycle //////////////////////////////////////////////////////
            initNode: function(parent, attrs) {
                this.appendToEarlyAttrs('valueFilter','value');
                this.callSuper(parent, attrs);
            },
            
            
            // Accessors ///////////////////////////////////////////////////////
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
            
            
            // Methods /////////////////////////////////////////////////////////
            /** Combines a value filter with any existing value filter.
                @param filter:function the value filter to add.
                @param where:string (optional) Determines where to add the filter. Supported values 
                    are 'first' and 'last'. Defaults to 'first'.
                @returns {void} */
            chainValueFilter: function(filter, where) {
                const existingFilter = this.valueFilter;
                let chainedFilter;
                if (existingFilter) {
                    if (where === 'last') {
                        chainedFilter = v => filter(existingFilter(v));
                    } else {
                        // "where" is 'first' or not provided.
                        chainedFilter = v => existingFilter(filter(v));
                    }
                } else {
                    chainedFilter = filter;
                }
                this.setValueFilter(chainedFilter);
            }
        }),
        
        /** A value that consists of an upper and lower value. The lower value must be less than or 
            equal to the upper value. The value object that must be passed into setValue and 
            returned from getValue is an object of the form: {lower:number, upper:number}.
            
            @class */
        RangeComponent = pkg.RangeComponent = new JSModule('RangeComponent', {
            include: [ValueComponent],
            
            
            // Accessors ///////////////////////////////////////////////////////
            setLowerValue: function(v) {
                this.setValue({
                    lower:v, 
                    upper:(this.value && this.value.upper !== undefined) ? this.value.upper : v
                });
            },
            
            getLowerValue: function() {
                return this.value ? this.value.lower : undefined;
            },
            
            setUpperValue: function(v) {
                this.setValue({
                    lower:(this.value && this.value.lower !== undefined) ? this.value.lower : v,
                    upper:v
                });
            },
            
            getUpperValue: function() {
                return this.value ? this.value.upper : undefined;
            },
            
            setValue: function(v) {
                if (v) {
                    const existing = this.value,
                        existingLower = existing ? existing.lower : undefined,
                        existingUpper = existing ? existing.upper : undefined;
                    
                    if (this.valueFilter) v = this.valueFilter(v);
                    
                    // Do nothing if value is identical
                    if (v.lower === existingLower && v.upper === existingUpper) return;
                    
                    // Assign upper to lower if no lower was provided.
                    v.lower ??= v.upper;
                    
                    // Assign lower to upper if no upper was provided.
                    v.upper ??= v.lower;
                    
                    // Swap lower and upper if they are in the wrong order
                    if (v.lower !== undefined && v.upper !== undefined && v.lower > v.upper) {
                        const temp = v.lower;
                        v.lower = v.upper;
                        v.upper = temp;
                    }
                    
                    this.value = v;
                    if (this.inited) {
                        this.fireEvent('value', this.getValue());
                        if (v.lower !== existingLower) this.fireEvent('lowerValue', v.lower);
                        if (v.upper !== existingUpper) this.fireEvent('upperValue', v.upper);
                    }
                } else {
                    this.callSuper(v);
                }
            },
            
            
            // Methods /////////////////////////////////////////////////////////
            getValueCopy: function() {
                const v = this.value;
                return {lower:v.lower, upper:v.upper};
            }
        }),
        
        /** A numeric value component that stays within a minimum and maximum value.
            
            Events:
                minValue:number
                maxValue:number
                snapToInt:boolean
            
            Attributes:
                minValue:number the largest value allowed. If undefined or null no min value 
                    is enforced.
                maxValue:number the lowest value allowed. If undefined or null no max value 
                    is enforced.
                snapToInt:boolean If true values can only be integers. Defaults to true.
            
            @class */
        BoundedValueComponent = pkg.BoundedValueComponent = new JSModule('BoundedValueComponent', {
            include: [ValueComponent],
            
            // Life Cycle //////////////////////////////////////////////////////
            initNode: function(parent, attrs) {
                const self = this;
                
                self.appendToEarlyAttrs('snapToInt','minValue','maxValue');
                
                attrs.snapToInt ??= true;
                
                if (!attrs.valueFilter) {
                    attrs.valueFilter = v => {
                        const max = self.maxValue;
                        if (max != null && v > max) return max;
                        
                        const min = self.minValue;
                        if (min != null && v < min) return min;
                        
                        return v;
                    };
                }
                
                self.callSuper(parent, attrs);
            },
            
            
            // Accessors ///////////////////////////////////////////////////////
            setSnapToInt: function(v) {
                if (this.snapToInt !== v) {
                    this.snapToInt = v;
                    if (this.inited) {
                        this.fireEvent('snapToInt', v);
                        
                        // Update min, max and value since snap has been turned on
                        if (v) {
                            this.setMinValue(this.minValue);
                            this.setMaxValue(this.maxValue);
                            this.setValue(this.value);
                        }
                    }
                }
            },
            
            setMinValue: function(v) {
                if (this.snapToInt && v != null) v = mathRound(v);
                
                if (this.minValue !== v) {
                    const max = this.maxValue;
                    if (max != null && v > max) v = max;
                    
                    if (this.minValue !== v) {
                        this.minValue = v;
                        if (this.inited) {
                            this.fireEvent('minValue', v);
                            
                            // Rerun setValue since the filter has changed.
                            this.setValue(this.value);
                        }
                    }
                }
            },
            
            setMaxValue: function(v) {
                if (this.snapToInt && v != null) v = mathRound(v);
                
                if (this.maxValue !== v) {
                    const min = this.minValue;
                    if (min != null && v < min) v = min;
                    
                    if (this.maxValue !== v) {
                        this.maxValue = v;
                        if (this.inited) {
                            this.fireEvent('maxValue', v);
                            
                            // Rerun setValue since the filter has changed.
                            this.setValue(this.value);
                        }
                    }
                }
            },
            
            /** @overrides myt.ValueComponent */
            setValue: function(v) {
                this.callSuper(this.snapToInt && v != null && !isNaN(v) ? mathRound(v) : v);
            }
        });
    
    /** A numeric value component that stays within an upper and lower value and where the value 
        is a range.
        
        @class */
    pkg.BoundedRangeComponent = new JSModule('BoundedRangeComponent', {
        include: [BoundedValueComponent, RangeComponent],
        
        // Life Cycle //////////////////////////////////////////////////////////
        initNode: function(parent, attrs) {
            const self = this;
            if (!attrs.valueFilter) {
                attrs.valueFilter = v => {
                    if (v) {
                        const max = self.maxValue,
                            min = self.minValue;
                        if (max != null && v.upper > max) v.upper = max;
                        if (min != null && v.lower < min) v.lower = min;
                    }
                    return v;
                };
            }
            
            self.callSuper(parent, attrs);
        },
        
        
        // Accessors ///////////////////////////////////////////////////////////
        /** @overrides myt.ValueComponent */
        setValue: function(v) {
            if (this.snapToInt && v != null) {
                if (v.lower != null && !isNaN(v.lower)) v.lower = mathRound(v.lower);
                if (v.upper != null && !isNaN(v.upper)) v.upper = mathRound(v.upper);
            }
            this.callSuper(v);
        }
    });
})(myt);

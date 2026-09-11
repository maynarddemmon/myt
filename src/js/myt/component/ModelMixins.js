(pkg => {
    const {Class:JSClass, Module:JSModule} = JS,
        
        Eventable = pkg.Eventable,
        
        objValues = Object.values,
        
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
        }),
        
        /** A base class for "Business Object" type Models. A BaseModel is often collected
            together into a BaseModelCollection where each BaseModel is stored by an ID of
            some kind.
            
            Events:
                id:string
            
            Attributes:
                id:string - The unique ID of this BaseModel. Uniqueness is only relative to the 
                    any BaseModelCollection it is stored within.
                modelCollection:BaseModelCollection - (optional) The BaseModelCollection this
                    BaseModel will be stored and managed by. This gets stored internally in the
                    private attribute __mc.
            
            Private Attributes:
                __mc:BaseModelCollection - (optional) The BaseModelCollection this BaseModel is
                    currently stored within and managed by. The BaseModelCollection is the only
                    external things that should reach into this private attribute and modify it.
            
            @class */
        BaseModel = pkg.BaseModel = new JSClass('BaseModel', Eventable, {
            init: function(attrs) {
                if (attrs.modelCollection) {
                    this.__mc = attrs.modelCollection;
                    delete attrs.modelCollection;
                }
                
                this.callSuper(attrs);
            },
            
            /** Used to set an attr and percolate change events up from a BaseModel to the 
                BaseModelCollection to simplify monitoring an entire BaseModelCollection for 
                changes. This is a wrapper around AccessorSuport.set with the same params 
                provided here.
                @param {string} attrName - The name of the attribute to set.
                @param {*} v - The value to set.
                @param {boolean} [skipSetter] - If true no attempt will be made to invoke a setter 
                    function. Useful when you want to invoke standard setter behavior. Defaults to 
                    undefined which is equivalent to false.
                @returns {void} */
            setAndNotifyCollection: function(attrName, v, skipSetter) {
                this.set(attrName, v, skipSetter);
                this.__mc?.fireUpdatedEvent(this);
            },
            
            setId: function(id) {
                if (id !== this.id) {
                    if (this.__mc && this.inited) {
                        console.warn('Attempt to change ID while managed by a BaseModelCollection.', this.id, id);
                    } else {
                        this.set('id', id, true);
                    }
                }
            },
            
            /** Gets a POJO representation of this BaseModel.
                @param _cfg:Object - (optional) A configuration that can be used to control how
                    the Object is constructed. Implementation dependent.
                @returns {!Object} The POJO representation of this BaseModel. */
            getAsObj: function(_cfg) {
                // Subclasses should implement to return all data needed to instantiate but
                // not the BaseModelCollection.
                return {id:this.id};
            },
            
            /** Checks if a provided BaseModel or POJO represents essentially the same data as
                this BaseModel.
                @param attrsOrModel:Object|BaseModel - The target to compare against.
                @returns {boolean} */
            similarTo: function(attrsOrModel) {
                // Never similar to nullish
                if (attrsOrModel == null) return false;
                
                // Always similar to self
                if (attrsOrModel === this) return true;
                
                return pkg.shallowEqual(
                    this.getAsObj(),
                    typeof attrsOrModel.getAsObj === 'function' ? 
                        attrsOrModel.getAsObj() : // Assume we were provided a BaseModel
                        attrsOrModel // Assume we were provided a POJO
                );
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
    
    /** A base class for collections of BaseModel instances where they can be uniquely identified
        by a string based ID attr of some kind.
        
        Events:
            added:BaseModel - Fired when a BaseModel is added to this collection. The value
                provided in the event is the added model.
            updated:BaseModel - Fired when a BaseModel managed by this collection is changed. The
                value provided in the event is the modified model.
            removed:BaseModel - Fired when a BaseModel is removed from this collection. The value
                provided in the event is the removed model.
        
        Attributes:
            idField:string - The name of the field on a BaseModel used as an ID. Defaults to "id".
            modelClass:JS.Class - The JS.Class BaseModel used to instantiate new models in
                this collection.
        
        Private Attributes:
            __mbid:Object - The Object used to store the managed BaseModel instances.
        
        
        @class */
    pkg.BaseModelCollection = new JSClass('BaseModelCollection', Eventable, {
        // Life Cycle //////////////////////////////////////////////////////
        init: function(attrs) {
            this.__mbid = {};
            
            attrs.idField ??= 'id';
            attrs.modelClass ??= BaseModel;
            
            this.callSuper(attrs);
        },
        
        destroy: function() {
            const models = this.__mbid;
            for (const id in models) models[id].destroy();
            this.callSuper();
        },
        
        
        // Accessors ///////////////////////////////////////////////////////
        setIdField: function(v) {this.idField = v;},
        setModelClass: function(v) {this.modelClass = v;},
        
        
        // Methods /////////////////////////////////////////////////////////
        fireAddedEvent: function(model) {this.fireEvent('added', model);},
        fireUpdatedEvent: function(model) {this.fireEvent('updated', model);},
        fireRemovedEvent: function(model) {this.fireEvent('removed', model);},
        
        addModel: function(attrsOrModel) {
            const self = this,
                id = attrsOrModel[self.idField];
            if (id == null) {
                console.warn('addModel failed, no ID.', attrsOrModel);
            } else {
                const attrsAreModel = typeof attrsOrModel.isA === 'function' && attrsOrModel.isA(self.modelClass);
                let model = self.getById(id);
                if (model) {
                    // A model with the provided ID already exists in this collection. Let's attempt
                    // to update it.
                    if (!model.similarTo(attrsOrModel)) {
                        model.callSetters(attrsAreModel ? attrsOrModel.getAsObj() : attrsOrModel);
                        self.fireUpdatedEvent(model);
                    }
                } else {
                    // Don't add if the provided model is already in a collection
                    if (attrsAreModel && attrsOrModel.__mc != null) {
                        console.warn('addModel failed, already in another collection.', attrsOrModel);
                        return;
                    }
                    
                    // No model with the provided ID yet exists in this collection. Let's attempt to
                    // add or create a new one.
                    model = attrsAreModel ? attrsOrModel : self.createModel(attrsOrModel);
                    if (model.__mc !== self) model.__mc = self;
                    self.fireAddedEvent(self.__mbid[id] = model);
                }
                return model;
            }
        },
        
        createModel: function(attrs={}) {
            attrs.modelCollection = this;
            return new this.modelClass(attrs);
        },
        
        getById: function(id) {return this.__mbid[id];},
        
        getByIds: function(arrOfIds) {
            const retval = [];
            if (arrOfIds) {
                for (const id of arrOfIds) {
                    const model = this.getById(id);
                    if (model) retval.push(model);
                }
            }
            return retval;
        },
        
        isUniqueID: function(v) {return this.getById(v) == null;},
        
        getAll: function(copyOf) {
            return copyOf ? {...this.__mbid} : this.__mbid;
        },
        
        getCount: function(filterFunc) {
            if (filterFunc) {
                return objValues(this.__mbid).reduce((acc, model) => filterFunc(model) ? acc + 1 : acc, 0);
            } else {
                return Object.keys(this.__mbid).length;
            }
        },
        
        getAsList: function(filterFunc) {
            if (filterFunc) {
                return objValues(this.__mbid).filter(filterFunc);
            } else {
                return objValues(this.__mbid);
            }
        },
        
        getAsSortedList: function(sortFunc, filterFunc) {
            const listOfModels = this.getAsList(filterFunc);
            return sortFunc ? listOfModels.sort(sortFunc) : listOfModels;
        },
        
        getFirst: function(filterFunc) {
            const modelsById = this.__mbid;
            for (const id in modelsById) {
                const model = modelsById[id];
                if (filterFunc) {
                    if (filterFunc(model)) return model;
                } else {
                    return model;
                }
            }
        },
        
        removeById: function(id, destructive) {
            const modelsById = this.__mbid, 
                existingModel = modelsById[id];
            if (existingModel) {
                delete modelsById[id];
                existingModel.__mc = null;
                this.fireRemovedEvent(existingModel);
                if (destructive) existingModel.destroy();
                return existingModel;
            }
        },
        
        removeAll: function(destructive) {
            for (const id in this.__mbid) this.removeById(id, destructive);
        }
    });
})(myt);

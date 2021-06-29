((pkg) => {
    const JSClass = JS.Class,
        View = pkg.View,
        
        /** Provides Slider thumb functionality.
            
            Requires:
                myt.Button
            
            @class */
        SliderThumbMixin = pkg.SliderThumbMixin = new JS.Module('SliderThumbMixin', {
            include: [pkg.Draggable],
            
            
            // Life Cycle //////////////////////////////////////////////////////
            initNode: function(parent, attrs) {
                if (attrs.width == null) attrs.width = parent.thumbWidth;
                if (attrs.height == null) attrs.height = parent.thumbHeight;
                
                if (attrs.repeatKeyDown == null) attrs.repeatKeyDown = true;
                if (attrs.activationKeys == null) {
                    attrs.activationKeys = [
                        37, // left arrow
                        38, // up arrow
                        39, // right arrow
                        40 // down arrow
                    ];
                }
                
                this.callSuper(parent, attrs);
                
                if (parent.axis === 'x') {
                    this.setY(parent.thumbOffset);
                } else {
                    this.setX(parent.thumbOffset);
                }
                
                this.syncTo(parent, 'setDisabled', 'disabled');
                
                parent._syncThumbToValue(this, parent.getValue());
            },
            
            
            // Accessors ///////////////////////////////////////////////////////
            /** @overrides myt.Disableable */
            setDisabled: function(v) {
                // Adapt to event from syncTo
                if (v != null && typeof v === 'object') v = v.value;
                
                this.callSuper(v);
            },
            
            /** @overrides myt.FocusObservable */
            setFocused: function(v) {
                this.callSuper(v);
                if (v) this.makeHighestZIndex();
            },
            
            /** @overrides myt.View */
            setX: function(v) {
                if (this.x !== v) {
                    this.callSuper(v);
                    
                    const p = this.parent;
                    if (p.axis === 'x') p._syncValueToThumb(this);
                }
            },
            
            /** @overrides myt.View */
            setY: function(v) {
                if (this.y !== v) {
                    this.callSuper(v);
                    
                    const p = this.parent;
                    if (p.axis === 'y') p._syncValueToThumb(this);
                }
            },
            
            
            // Methods /////////////////////////////////////////////////////////////////
            /** @overrides myt.Draggable */
            requestDragPosition: function(x, y) {
                if (!this.disabled) {
                    const parent = this.parent,
                        minPx = parent.getMinPixelValueForThumb(this),
                        maxPx = parent.getMaxPixelValueForThumb(this);
                    let halfSize,
                        pos,
                        func;
                    
                    if (parent.axis === 'x') {
                        halfSize = this.width / 2;
                        pos = x;
                        func = this.setX;
                    } else {
                        halfSize = this.height / 2;
                        pos = y;
                        func = this.setY;
                    }
                    
                    func.call(this, Math.min(Math.max(pos, minPx - halfSize), maxPx - halfSize));
                }
            },
            
            /** @overrides myt.Button. */
            doActivationKeyDown: function(key, isRepeat) {
                const parent = this.parent;
                switch (key) {
                    case 37: // Left
                        parent.nudgeValueLeft(this);
                        break;
                    case 38: // Up
                        parent.nudgeValueUp(this);
                        break;
                    case 39: // Right
                        parent.nudgeValueRight(this);
                        break;
                    case 40: // Down
                        parent.nudgeValueDown(this);
                        break;
                }
                
                this.callSuper(key, isRepeat);
            }
        }),
        
        /** A simple implementation of a slider thumb.
            
            @class */
        SimpleSliderThumb = pkg.SimpleSliderThumb = new JSClass('SimpleSliderThumb', pkg.SimpleButton, {
            include: [SliderThumbMixin],
            
            
            // Life Cycle //////////////////////////////////////////////////////
            /** @overrides myt.SimpleButton */
            initNode: function(parent, attrs) {
                if (attrs.activeColor == null) attrs.activeColor = '#bbbbbb';
                if (attrs.readyColor == null) attrs.readyColor = '#cccccc';
                if (attrs.hoverColor == null) attrs.hoverColor = '#dddddd';
                
                if (attrs.boxShadow == null) attrs.boxShadow = [0, 0, 4, '#666666'];
                
                this.callSuper(parent, attrs);
                
                if (attrs.roundedCorners == null) this.setRoundedCorners(Math.min(this.height, this.width) / 2);
            },
            
            
            // Methods /////////////////////////////////////////////////////////
            /** @overrides myt.FocusObservable */
            showFocusEmbellishment: function() {
                this.hideDefaultFocusEmbellishment();
                this.setBoxShadow([0, 0, 9, '#666666']);
            },
            
            /** @overrides myt.FocusObservable */
            hideFocusEmbellishment: function() {
                this.hideDefaultFocusEmbellishment();
                this.setBoxShadow([0, 0, 4, '#666666']);
            }
        }),
        
        /** A base class for slider components.
            
            Attributes:
                axis:string Indicates the direction the slider moves in. Allowed 
                    values are 'x' and 'y'. Defaults to 'x'.
                trackInset:number the number of pixels to inset the start of the 
                    track from the top/left edge of the component. Defaults to 0.
                trackOutset:number the number of pixels to inset the end of the track
                    from the bottom/right edge of the component. Default to 0.
                thumbWidth:number The width of the thumb.
                thumbHeight:number The height of the thumb.
                thumbOffset:number The x/y offset of the thumb. Will applied to 
                    the opposite dimension to the axis.
                thumbClass:JS.Class the class to use to create the thumb.
                nudgeAmount:number the amount to nudge the value when the arrows 
                    keys are invoked. Defaults to 1.
            
            @class */
        BaseSlider = pkg.BaseSlider = new JSClass('BaseSlider', View, {
            include: [pkg.Disableable],
            
            
            // Life Cycle //////////////////////////////////////////////////////////
            /** @overrides myt.View */
            initNode: function(parent, attrs) {
                if (attrs.axis == null) attrs.axis = 'x';
                if (attrs.axis === 'x') {
                    if (attrs.width == null) attrs.width = 100;
                    if (attrs.height == null) attrs.height = 18;
                } else {
                    if (attrs.width == null) attrs.width = 18;
                    if (attrs.height == null) attrs.height = 100;
                }
                
                if (attrs.bgColor == null) attrs.bgColor = '#999999';
                if (attrs.roundedCorners == null) attrs.roundedCorners = 9;
                
                if (attrs.trackInset == null) attrs.trackInset = 9;
                if (attrs.trackOutset == null) attrs.trackOutset = 9;
                if (attrs.thumbWidth == null) attrs.thumbWidth = 16;
                if (attrs.thumbHeight == null) attrs.thumbHeight = 16;
                if (attrs.thumbOffset == null) attrs.thumbOffset = 1;
                
                if (attrs.nudgeAmount == null) attrs.nudgeAmount = 1;
                
                if (attrs.thumbClass == null) attrs.thumbClass = SimpleSliderThumb;
                
                this.callSuper(parent, attrs);
            },
            
            
            // Accessors ///////////////////////////////////////////////////////
            setAxis: function(v) {this.axis = v;},
            setTrackInset: function(v) {this.trackInset = v;},
            setTrackOutset: function(v) {this.trackOutset = v;},
            setThumbWidth: function(v) {this.thumbWidth = v;},
            setThumbHeight: function(v) {this.thumbHeight = v;},
            setThumbOffset: function(v) {this.thumbOffset = v;},
            setThumbClass: function(v) {this.thumbClass = v;},
            setNudgeAmount: function(v) {this.nudgeAmount = v;},
            
            
            // Methods /////////////////////////////////////////////////////////
            convertValueToPixels: function(v) {
                const self = this,
                    minV = self.minValue, ti = self.trackInset,
                    pxRange = (self.axis === 'x' ? self.width : self.height) - ti - self.trackOutset,
                    valueRange = self.maxValue - minV;
                return ti + ((v - minV) * (pxRange / valueRange));
            },
            
            convertPixelsToValue: function(px) {
                const self = this,
                    minV = self.minValue, ti = self.trackInset,
                    pxRange = (self.axis === 'x' ? self.width : self.height) - ti - self.trackOutset,
                    valueRange = self.maxValue - minV;
                return ((px - ti) * (valueRange / pxRange)) + minV;
            },
            
            nudgeValueLeft: function(thumb) {
                this._nudge(thumb, false);
            },
            
            nudgeValueUp: function(thumb) {
                this._nudge(thumb, false);
            },
            
            nudgeValueRight: function(thumb) {
                this._nudge(thumb, true);
            },
            
            nudgeValueDown: function(thumb) {
                this._nudge(thumb, true);
            },
            
            _nudge: (thumb, up) => {
                // Subclasses to implement
            },
            
            _syncThumbToValue: function(thumb, value) {
                value = this.convertValueToPixels(value);
                if (this.axis === 'x') {
                    thumb.setX(value - thumb.width / 2);
                } else {
                    thumb.setY(value - thumb.height / 2);
                }
            }
        }),
        
        /** A simple implementation of the range fill for a RangeSlider.
            
            @class */
        SimpleSliderRangeFill = pkg.SimpleSliderRangeFill = new JSClass('SimpleSliderRangeFill', View, {
            // Life Cycle //////////////////////////////////////////////////////////
            initNode: function(parent, attrs) {
                if (attrs.bgColor == null) attrs.bgColor = '#666666';
                
                this.callSuper(parent, attrs);
                
                if (parent.axis === 'x') {
                    this.setY(parent.thumbOffset);
                    this.setHeight(parent.thumbHeight);
                    this.setRoundedCorners(parent.thumbHeight / 2);
                } else {
                    this.setX(parent.thumbOffset);
                    this.setWidth(parent.thumbWidth);
                    this.setRoundedCorners(parent.thumbWidth / 2);
                }
                parent._syncRangeFillToValue();
            }
        });
    
    /** A slider component that support two thumbs.
        
        Attributes:
            rangeFillClass:JS.Class The class used to instantiate the rangeFill
        
        Private Attributes:
            __lockSync:boolean Used internally to prevent infinite loops.
        
        @class */
    pkg.RangeSlider = new JSClass('RangeSlider', BaseSlider, {
        include: [pkg.BoundedRangeComponent],
        
        
        // Life Cycle //////////////////////////////////////////////////////////
        /** @overrides myt.BaseSlider */
        initNode: function(parent, attrs) {
            if (attrs.rangeFillClass == null) attrs.rangeFillClass = SimpleSliderRangeFill;
            
            this.callSuper(parent, attrs);
            
            new this.rangeFillClass(this, {name:'rangeFill'});
            new this.thumbClass(this, {name:'thumbLower'});
            new this.thumbClass(this, {name:'thumbUpper'});
        },
        
        
        // Accessors ///////////////////////////////////////////////////////////
        setRangeFillClass: function(v) {this.rangeFillClass = v;},
        
        /** @overrides */
        setValue: function(v) {
            this.callSuper(v);
            
            if (this.inited) {
                // Sync position of thumb
                if (!this.__lockSync) {
                    v = this.getValue();
                    this._syncThumbToValue(this.thumbLower, v);
                    this._syncThumbToValue(this.thumbUpper, v);
                }
                
                this._syncRangeFillToValue();
            }
        },
        
        /** @overrides
            Update the thumb position if the width changes. */
        setWidth: function(v, supressEvent) {
            const existing = this.width;
            this.callSuper(v, supressEvent);
            if (this.inited && this.axis === 'x' && this.width !== existing) {
                const value = this.getValue();
                this._syncThumbToValue(this.thumbLower, value);
                this._syncThumbToValue(this.thumbUpper, value);
            }
        },
        
        /** @overrides
            Update the thumb position if the height changes. */
        setHeight: function(v, supressEvent) {
            const existing = this.height;
            this.callSuper(v, supressEvent);
            if (this.inited && this.axis === 'y' && this.height !== existing) {
                const value = this.getValue();
                this._syncThumbToValue(this.thumbLower, value);
                this._syncThumbToValue(this.thumbUpper, value);
            }
        },
        
        
        // Methods /////////////////////////////////////////////////////////////
        /** Should only be called by myt.SimpleSliderRangeFill.
            @private
            @returns {undefined} */
        _syncRangeFillToValue: function() {
            const rangeFill = this.rangeFill,
                value = this.getValue(),
                lowerPx = this.convertValueToPixels(value.lower),
                extent = this.convertValueToPixels(value.upper) - lowerPx;
            if (this.axis === 'x') {
                rangeFill.setX(lowerPx);
                rangeFill.setWidth(extent);
            } else {
                rangeFill.setY(lowerPx);
                rangeFill.setHeight(extent);
            }
        },
        
        /** @overrides myt.BaseSlider */
        _syncThumbToValue: function(thumb, value) {
            this.callSuper(thumb, thumb.name === 'thumbLower' ? value.lower : value.upper);
        },
        
        /** Should only be called by myt.SliderThumbMixin.
            @private
            @param {!Object} thumb
            @returns {undefined} */
        _syncValueToThumb: function(thumb) {
            if (this.inited && !this.__lockSync) {
                this.__lockSync = true;
                
                const converted = this.convertPixelsToValue(
                    this.axis === 'x' ? thumb.x + thumb.width / 2 : thumb.y + thumb.height / 2
                );
                
                let value = this.getValueCopy();
                if (thumb.name === 'thumbLower') {
                    value.lower = converted;
                } else {
                    value.upper = converted;
                }
                this.setValue(value);
                
                // Update thumb position since value may have been adjusted
                value = this.getValue();
                if (this.thumbLower) this._syncThumbToValue(this.thumbLower, value);
                if (this.thumbUpper) this._syncThumbToValue(this.thumbUpper, value);
                
                this.__lockSync = false;
            }
        },
        
        /** @overrides myt.BaseSlider */
        _nudge: function(thumb, up) {
            const value = this.getValueCopy(),
                adj = this.nudgeAmount * (up ? 1 : -1);
            if (thumb.name === 'thumbLower') {
                value.lower += adj;
                if (value.lower > value.upper) value.lower = value.upper;
            } else {
                value.upper += adj;
                if (value.lower > value.upper) value.upper = value.lower;
            }
            this.setValue(value);
        },
        
        /** Should only be called by myt.SliderThumbMixin.
            @private
            @param {!Object} thumb
            @returns {number} */
        getMinPixelValueForThumb: function(thumb) {
            return this.convertValueToPixels(
                thumb.name === 'thumbLower' ? this.minValue : this.getValue().lower
            );
        },
        
        /** Should only be called by myt.SliderThumbMixin.
            @private
            @param {!Object} thumb
            @returns {number} */
        getMaxPixelValueForThumb: function(thumb) {
            return this.convertValueToPixels(
                thumb.name === 'thumbLower' ? this.getValue().upper : this.maxValue
            );
        }
    });
    
    /** A slider component.
        
        Private Attributes:
            __lockSync:boolean Used internally to prevent infinite loops.
        
        @class */
    pkg.Slider = new JSClass('Slider', BaseSlider, {
        include: [pkg.BoundedValueComponent],
        
        
        // Life Cycle //////////////////////////////////////////////////////////
        /** @overrides myt.BaseSlider */
        initNode: function(parent, attrs) {
            this.callSuper(parent, attrs);
            
            new this.thumbClass(this, {name:'thumb'});
        },
        
        
        // Accessors ///////////////////////////////////////////////////////////
        /** @overrides */
        setValue: function(v) {
            this.callSuper(v);
            
            // Sync position of thumb
            if (this.inited && !this.__lockSync) this._syncThumbToValue(this.thumb, this.getValue());
        },
        
        /** @overrides
            Update the thumb position if the width changes. */
        setWidth: function(v, supressEvent) {
            const existing = this.width;
            this.callSuper(v, supressEvent);
            if (this.inited && this.axis === 'x' && this.width !== existing) this._syncThumbToValue(this.thumb, this.getValue());
        },
        
        /** @overrides
            Update the thumb position if the height changes. */
        setHeight: function(v, supressEvent) {
            const existing = this.height;
            this.callSuper(v, supressEvent);
            if (this.inited && this.axis === 'y' && this.height !== existing) this._syncThumbToValue(this.thumb, this.getValue());
        },
        
        
        // Methods /////////////////////////////////////////////////////////////
        /** Should only be called by myt.SliderThumbMixin.
            @private
            @param {!Object} thumb
            @returns {undefined} */
        _syncValueToThumb: function(thumb) {
            if (this.inited && !this.__lockSync) {
                this.__lockSync = true;
                
                this.setValue(this.convertPixelsToValue(
                    this.axis === 'x' ? thumb.x + thumb.width / 2 : thumb.y + thumb.height / 2
                ));
                
                // Update thumb position since value may have been adjusted
                this._syncThumbToValue(thumb, this.getValue());
                
                this.__lockSync = false;
            }
        },
        
        /** @overrides myt.BaseSlider */
        _nudge: function(thumb, up) {
            this.setValue(this.getValue() + this.nudgeAmount * (up ? 1 : -1));
        },
        
        /** Should only be called by myt.SliderThumbMixin.
            @private
            @param {!Object} thumb
            @returns {number} */
        getMinPixelValueForThumb: function(thumb) {
            return this.convertValueToPixels(this.minValue);
        },
        
        /** Should only be called by myt.SliderThumbMixin.
            @private
            @param {!Object} thumb
            @returns {number} */
        getMaxPixelValueForThumb: function(thumb) {
            return this.convertValueToPixels(this.maxValue);
        }
    });
})(myt);

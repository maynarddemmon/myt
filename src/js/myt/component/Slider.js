(pkg => {
    const JSClass = JS.Class,
        mathMin = Math.min,
        mathMax = Math.max,
        
        GlobalKeys = pkg.global.keys,
        
        View = pkg.View,
        
        defAttr = pkg.AccessorSupport.defAttr,
        
        SliderThumb = new JSClass('SliderThumb', pkg.SimpleButton, {
            include: [pkg.Draggable],
            
            
            // Life Cycle //////////////////////////////////////////////////////
            initNode: function(parent, attrs) {
                const width = attrs.width = parent.thumbWidth,
                    height = attrs.height = parent.thumbHeight;
                attrs.roundedCorners = mathMin(height, width) / 2;
                attrs.repeatKeyDown = true;
                attrs.activationKeys = GlobalKeys.ARROW_KEYS;
                attrs.activeColor = '#bbb';
                attrs.readyColor = '#ccc';
                attrs.hoverColor = '#ddd';
                attrs.boxShadow = [0, 0, 4, '#666'];
                
                this.callSuper(parent, attrs);
                
                this[parent.axis === 'x' ? 'setY' : 'setX'](parent.thumbOffset);
                
                this.syncTo(parent, 'setDisabled', 'disabled');
                
                parent._syncThumbToValue(this, parent.getValue());
            },
            
            
            // Accessors ///////////////////////////////////////////////////////
            /** @overrides myt.Disableable */
            setDisabled: function(v) {
                this.callSuper(this.valueFromEvent(v));
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
                    if (p.axis === 'x') p.syncValueToThumb(this);
                }
            },
            
            /** @overrides myt.View */
            setY: function(v) {
                if (this.y !== v) {
                    this.callSuper(v);
                    
                    const p = this.parent;
                    if (p.axis === 'y') p.syncValueToThumb(this);
                }
            },
            
            
            // Methods /////////////////////////////////////////////////////////
            /** @overrides myt.Draggable */
            requestDragPosition: function(x, y) {
                if (!this.disabled) {
                    const parent = this.parent,
                        minPx = parent.getMinPixelValueForThumb(this),
                        maxPx = parent.getMaxPixelValueForThumb(this);
                    let halfSize,
                        pos,
                        funcName;
                    if (parent.axis === 'x') {
                        halfSize = this.width / 2;
                        pos = x;
                        funcName = 'setX';
                    } else {
                        halfSize = this.height / 2;
                        pos = y;
                        funcName = 'setY';
                    }
                    this[funcName](mathMin(mathMax(pos, minPx - halfSize), maxPx - halfSize));
                }
            },
            
            /** @overrides myt.Button. */
            doActivationKeyDown: function(code, isRepeat) {
                const parent = this.parent;
                switch (code) {
                    case GlobalKeys.CODE_ARROW_LEFT:
                        parent.nudgeValueLeft(this);
                        break;
                    case GlobalKeys.CODE_ARROW_UP:
                        parent.nudgeValueUp(this);
                        break;
                    case GlobalKeys.CODE_ARROW_RIGHT:
                        parent.nudgeValueRight(this);
                        break;
                    case GlobalKeys.CODE_ARROW_DOWN:
                        parent.nudgeValueDown(this);
                        break;
                }
                this.callSuper(code, isRepeat);
            }
        }),
        
        /** A base class for slider components.
            
            Attributes:
                axis:string Indicates the direction the slider moves in. 
                    Allowed values are 'x' and 'y'. Defaults to 'x'.
                trackInset:number the number of pixels to inset the start of 
                    the track from the top/left edge of the component. 
                    Defaults to 0.
                trackOutset:number the number of pixels to inset the end of 
                    the track from the bottom/right edge of the component. 
                    Default to 0.
                thumbWidth:number The width of the thumb.
                thumbHeight:number The height of the thumb.
                thumbOffset:number The x/y offset of the thumb. Will applied to 
                    the opposite dimension to the axis.
                nudgeAmount:number the amount to nudge the value when the 
                    arrows keys are invoked. Defaults to 1.
            
            Private Attributes:
                __lockSync:boolean Used internally to prevent infinite loops.
            
            @class */
        BaseSlider = pkg.BaseSlider = new JSClass('BaseSlider', View, {
            include: [pkg.Disableable],
            
            
            // Life Cycle //////////////////////////////////////////////////////
            /** @overrides myt.View */
            initNode: function(parent, attrs) {
                defAttr(attrs, 'axis', 'x');
                if (attrs.axis === 'x') {
                    defAttr(attrs, 'width', 100);
                    defAttr(attrs, 'height', 18);
                } else {
                    defAttr(attrs, 'width', 18);
                    defAttr(attrs, 'height', 100);
                }
                defAttr(attrs, 'bgColor', '#999');
                defAttr(attrs, 'roundedCorners', 9);
                defAttr(attrs, 'trackInset', 9);
                defAttr(attrs, 'trackOutset', 9);
                defAttr(attrs, 'thumbWidth', 16);
                defAttr(attrs, 'thumbHeight', 16);
                defAttr(attrs, 'thumbOffset', 1);
                defAttr(attrs, 'nudgeAmount', 1);
                
                this.callSuper(parent, attrs);
            },
            
            
            // Accessors ///////////////////////////////////////////////////////
            setAxis: function(v) {this.axis = v;},
            setTrackInset: function(v) {this.trackInset = v;},
            setTrackOutset: function(v) {this.trackOutset = v;},
            setThumbWidth: function(v) {this.thumbWidth = v;},
            setThumbHeight: function(v) {this.thumbHeight = v;},
            setThumbOffset: function(v) {this.thumbOffset = v;},
            setNudgeAmount: function(v) {this.nudgeAmount = v;},
            
            
            // Methods /////////////////////////////////////////////////////////
            convertValueToPixels: function(v) {
                const self = this,
                    minV = self.minValue,
                    trackInset = self.trackInset,
                    pxRange = (self.axis === 'x' ? self.width : self.height) - trackInset - self.trackOutset,
                    valueRange = self.maxValue - minV;
                return trackInset + ((v - minV) * (pxRange / valueRange));
            },
            
            convertPixelsToValue: function(px) {
                const self = this,
                    minV = self.minValue,
                    trackInset = self.trackInset,
                    pxRange = (self.axis === 'x' ? self.width : self.height) - trackInset - self.trackOutset,
                    valueRange = self.maxValue - minV;
                return ((px - trackInset) * (valueRange / pxRange)) + minV;
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
            
            _nudge: (thumb, up) => {/* Subclasses to implement */},
            
            _syncThumbToValue: function(thumb, value) {
                value = this.convertValueToPixels(value);
                if (this.axis === 'x') {
                    thumb.setX(value - thumb.width / 2);
                } else {
                    thumb.setY(value - thumb.height / 2);
                }
            },
            
            /** Should only be called by SliderThumb.
                @private
                @param {!Object} thumb
                @returns {undefined} */
            syncValueToThumb: function(thumb) {
                if (this.inited && !this.__lockSync) {
                    this.__lockSync = true;
                    this._syncValueToThumb(thumb, this.convertPixelsToValue(
                        this.axis === 'x' ? thumb.x + thumb.width / 2 : thumb.y + thumb.height / 2
                    ));
                    this.__lockSync = false;
                }
            },
            
            _syncValueToThumb: (thumb, converted) => {/* Subclasses to implement */},
            
            /** Should only be called by SliderThumb.
                @private
                @param {!Object} thumb
                @returns {number} */
            getMinPixelValueForThumb: function(thumb) {
                return this.convertValueToPixels(this.minValue);
            },
            
            /** Should only be called by SliderThumb.
                @private
                @param {!Object} thumb
                @returns {number} */
            getMaxPixelValueForThumb: function(thumb) {
                return this.convertValueToPixels(this.maxValue);
            }
        });
    
    /** A slider component that supports two thumbs, a lower one and an
        upper one.
        
        @class */
    pkg.RangeSlider = new JSClass('RangeSlider', BaseSlider, {
        include: [pkg.BoundedRangeComponent],
        
        
        // Life Cycle //////////////////////////////////////////////////////////
        /** @overrides myt.BaseSlider */
        initNode: function(parent, attrs) {
            this.callSuper(parent, attrs);
            
            const rangeFillView = new View(this, {name:'rangeFill', bgColor:'#666'});
            if (this.axis === 'x') {
                rangeFillView.setY(this.thumbOffset);
                rangeFillView.setHeight(this.thumbHeight);
                rangeFillView.setRoundedCorners(this.thumbHeight / 2);
            } else {
                rangeFillView.setX(this.thumbOffset);
                rangeFillView.setWidth(this.thumbWidth);
                rangeFillView.setRoundedCorners(this.thumbWidth / 2);
            }
            
            new SliderThumb(this, {name:'thumbLower'});
            new SliderThumb(this, {name:'thumbUpper'});
            
            this._syncRangeFillToValue();
        },
        
        
        // Accessors ///////////////////////////////////////////////////////////
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
        setWidth: function(v, suppressEvent) {
            const existing = this.width;
            this.callSuper(v, suppressEvent);
            if (this.inited && this.axis === 'x' && this.width !== existing) {
                const value = this.getValue();
                this._syncThumbToValue(this.thumbLower, value);
                this._syncThumbToValue(this.thumbUpper, value);
            }
        },
        
        /** @overrides
            Update the thumb position if the height changes. */
        setHeight: function(v, suppressEvent) {
            const existing = this.height;
            this.callSuper(v, suppressEvent);
            if (this.inited && this.axis === 'y' && this.height !== existing) {
                const value = this.getValue();
                this._syncThumbToValue(this.thumbLower, value);
                this._syncThumbToValue(this.thumbUpper, value);
            }
        },
        
        
        // Methods /////////////////////////////////////////////////////////////
        /** Should only be called by this and the rangeFill View.
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
        
        /** @overrides myt.BaseSlider */
        _syncValueToThumb: function(thumb, converted) {
            let value = this.getValueCopy();
            value[thumb.name === 'thumbLower' ? 'lower' : 'upper'] = converted;
            
            this.setValue(value);
            
            // Update thumb position since value may have been adjusted
            value = this.getValue();
            if (this.thumbLower) this._syncThumbToValue(this.thumbLower, value);
            if (this.thumbUpper) this._syncThumbToValue(this.thumbUpper, value);
        },
        
        /** @overrides myt.BaseSlider */
        _nudge: function(thumb, up) {
            const value = this.getValueCopy(),
                adj = this.nudgeAmount * (up ? 1 : -1);
            if (thumb.name === 'thumbLower') {
                value.lower = mathMin(value.lower + adj, value.upper);
            } else {
                value.upper = mathMax(value.upper + adj, value.lower);
            }
            this.setValue(value);
        },
        
        /** @overrides */
        getMinPixelValueForThumb: function(thumb) {
            return this.convertValueToPixels(
                thumb.name === 'thumbLower' ? this.minValue : this.getValue().lower
            );
        },
        
        /** @overrides */
        getMaxPixelValueForThumb: function(thumb) {
            return this.convertValueToPixels(
                thumb.name === 'thumbLower' ? this.getValue().upper : this.maxValue
            );
        }
    });
    
    /** A slider component.
        
        @class */
    pkg.Slider = new JSClass('Slider', BaseSlider, {
        include: [pkg.BoundedValueComponent],
        
        
        // Life Cycle //////////////////////////////////////////////////////////
        /** @overrides myt.BaseSlider */
        initNode: function(parent, attrs) {
            this.callSuper(parent, attrs);
            
            new SliderThumb(this, {name:'thumb'});
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
        setWidth: function(v, suppressEvent) {
            const existing = this.width;
            this.callSuper(v, suppressEvent);
            if (this.inited && this.axis === 'x' && this.width !== existing) this._syncThumbToValue(this.thumb, this.getValue());
        },
        
        /** @overrides
            Update the thumb position if the height changes. */
        setHeight: function(v, suppressEvent) {
            const existing = this.height;
            this.callSuper(v, suppressEvent);
            if (this.inited && this.axis === 'y' && this.height !== existing) this._syncThumbToValue(this.thumb, this.getValue());
        },
        
        
        // Methods /////////////////////////////////////////////////////////////
        /** @overrides myt.BaseSlider */
        _syncValueToThumb: function(thumb, converted) {
            this.setValue(converted);
            
            // Update thumb position since value may have been adjusted
            this._syncThumbToValue(thumb, this.getValue());
        },
        
        /** @overrides myt.BaseSlider */
        _nudge: function(thumb, up) {
            this.setValue(this.getValue() + this.nudgeAmount * (up ? 1 : -1));
        }
    });
})(myt);

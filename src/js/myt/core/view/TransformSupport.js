((pkg) => {
    const
        updateBounds = view => {view.__updateBounds(view.width, view.height);},
        
        /*  Sets the 'transformOrigin' style property of the provided
            style property map.
                param view:View the view to modify.
                param v:string the transformOrigin to set. */
        setTransformOrigin = (view, v) => {
            view.getOuterDomStyle().transformOrigin = v || '50% 50% 0';
        },
        
        /*  Adds an entry to the 'transform' style property of the provided
            style property map.
                param view:View the view to add the transform to.
                param type:string the type of transform: 'rotate', 'scaleX', 
                    'scaleY', 'skewX', 'skewY'.
                    param v:string the style value to set. */
        addTransform = (view, type, v) => {
            const cur = removeTransform(view, type);
            view.getOuterDomStyle().transform = cur + (cur.length === 0 ? '' : ' ') + type + '(' + v + ')';
        },
        
        /*  Removes an entry from the 'transform' style property of the provided
            style property map. Returns the new transform value after the 
            removal has been applied.
                param view:View the view ro remove the transform from.
                param type:string the type of transform: 'rotate', 'scaleX', 
                    'scaleY', 'skewX', 'skewY'. */
        removeTransform = (view, type) => {
            const ods = view.getOuterDomStyle(),
                value = ods.transform;
            
            if (!value || value.length === 0) return '';
            
            const parts = value.split(' ');
            let i = parts.length;
            while (i) {
                if (parts[--i].indexOf(type) === 0) {
                    parts.splice(i, 1);
                    break;
                }
            }
            
            return ods.transform = parts.join(' ');
        },
        
        applyScale = (view, axis, v) => {
            if (v == null) {
                removeTransform(view, axis);
            } else {
                addTransform(view, axis, v || 1); // Also converts 0 to 1.
            }
        };
        
    /** Adds CSS3 transform support to a View.
        
        Events:
            transformOrigin:string
            rotation:number
            scaleX:number
            scaleY:number
            skewX:number
            skewY:number
        
        Attributes:
            transformOrigin:string The origin point for transforms.
            rotation:number The rotation in degrees.
            scale:number (write only) Sets the scale for the view in both the x 
                and y dimension to the same value. A value of 1 is no scaling, 
                0.5 is 50%, 2 is 200%, etc. Note: The setters for scaleX and 
                scaleY are not called.
            scaleX:number The scale for the view in the x-dimension. A value of 1 
                is no scaling, 0.5 is 50%, 2 is 200%, etc.
            scaleY:number The scale for the view in the y-dimension. A value of 1 
                is no scaling, 0.5 is 50%, 2 is 200%, etc.
            skewX:number Sets the horizontal skew in degrees.
            skewY:number Sets the vertical skew in degrees.
        
        @class */
    pkg.TransformSupport = new JS.Module('TransformSupport', {
        // Accessors ///////////////////////////////////////////////////////////
        setTransformOrigin: function(v) {
            if (this.transformOrigin !== v) {
                this.transformOrigin = v;
                setTransformOrigin(this, v);
                if (this.inited) {
                    updateBounds(this);
                    this.fireEvent('transformOrigin', v);
                }
            }
        },
        
        setRotation: function(v) {
            if (this.rotation !== v) {
                this.rotation = v;
                addTransform(this, 'rotate', (v || 0) + 'deg');
                if (this.inited) {
                    updateBounds(this);
                    this.fireEvent('rotation', v);
                }
            }
        },
        
        setScale: function(v) {
            const doUpdateX = this.scaleX !== v,
                doUpdateY = this.scaleY !== v;
            if (doUpdateX) applyScale(this, 'scaleX', this.scaleX = v);
            if (doUpdateY) applyScale(this, 'scaleY', this.scaleY = v);
            if (this.inited) {
                if (doUpdateX || doUpdateY) updateBounds(this);
                if (doUpdateX) this.fireEvent('scaleX', v);
                if (doUpdateY) this.fireEvent('scaleY', v);
            }
        },
        
        setScaleX: function(v) {
            if (this.scaleX !== v) {
                applyScale(this, 'scaleX', this.scaleX = v);
                if (this.inited) {
                    updateBounds(this);
                    this.fireEvent('scaleX', v);
                }
            }
        },
        
        setScaleY: function(v) {
            if (this.scaleY !== v) {
                applyScale(this, 'scaleY', this.scaleY = v);
                if (this.inited) {
                    updateBounds(this);
                    this.fireEvent('scaleY', v);
                }
            }
        },
        
        setSkewX: function(v) {
            if (this.skewX !== v) {
                this.skewX = v;
                addTransform(this, 'skewX', v || 0);
                if (this.inited) {
                    updateBounds(this);
                    this.fireEvent('skewX', v);
                }
            }
        },
        
        setSkewY: function(v) {
            if (this.skewY !== v) {
                this.skewY = v;
                addTransform(this, 'skewY', v || 0);
                if (this.inited) {
                    updateBounds(this);
                    this.fireEvent('skewY', v);
                }
            }
        },
        
        
        // Methods /////////////////////////////////////////////////////////////
        /** @overrides
            @private */
        __updateBounds: function(w, h) {
            const r = this.rotation,
                sx = this.scaleX,
                sy = this.scaleY,
                notScaled = (sx == null || sx === 1) && (sy == null || sy === 1);
            if (notScaled && (r == null || r === 0 || r === 180)) {
                // Do nothing
            } else if (notScaled && (r === 90 || r === 270)) {
                w = this.height;
                h = this.width;
            } else {
                const b = this.getOuterDomElement().getBoundingClientRect();
                w = b.width;
                h = b.height;
            }
            
            this.callSuper(w, h);
        }
    });
})(myt);

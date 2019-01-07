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
*/
myt.TransformSupport = new JS.Module('TransformSupport', {
    // Class Methods ///////////////////////////////////////////////////////////
    extend: {
        /** Sets the 'transformOrigin' style property of the provided
            style property map.
            @param s:Object the style map to modify.
            @param v:string the transformOrigin to set.
            @returns void */
        setTransformOrigin: function(s, v) {
            s.transformOrigin = v || '50% 50% 0';
        },
        
        /** Adds an entry to the 'transform' style property of the provided
            style property map.
            @param s:Object the style map to modify.
            @param type:string the type of transform: 'rotate', 'scaleX', 
                'scaleY', 'skewX', 'skewY'.
            @param v:string the style value to set.
            @returns void */
        addTransform: function(s, type, v) {
            var cur = this.removeTransform(s, type);
            s.transform = cur + (cur.length === 0 ? '' : ' ') + type + '(' + v + ')';
        },
        
        /** Removes an entry from the 'transform' style property of the provided
            style property map.
            @param s:Object the style map to modify.
            @param type:string the type of transform: 'rotate', 'scaleX', 
                'scaleY', 'skewX', 'skewY'.
            @returns string: the new transform value after the removal has been
                applied. */
        removeTransform: function(s, type) {
            var value = s.transform;
            
            if (!value || value.length === 0) return '';
            
            var parts = value.split(' '),
                i = parts.length;
            while (i) {
                if (parts[--i].indexOf(type) === 0) {
                    parts.splice(i, 1);
                    break;
                }
            }
            
            return s.transform = parts.join(' ');
        },
        
        /** Gets the total scaling being applied to an element. Walks up the
            ancestor chain multiplying the scaleX and scaleY.
            @param elem:myt.View the view to calculate scaling for.
            @returns object containing 'scaleX' and 'scaleY' numbers. */
        getEffectiveScale: function(elem) {
            var scaleX = 1, scaleY = 1;
            while (elem) {
                if (elem.scaleX != null) scaleX *= elem.scaleX;
                if (elem.scaleY != null) scaleY *= elem.scaleY;
                elem = elem.parent;
            }
            return {scaleX:scaleX, scaleY:scaleY};
        }
    },
    
    // Accessors ///////////////////////////////////////////////////////////////
    setTransformOrigin: function(v) {
        if (this.transformOrigin !== v) {
            this.transformOrigin = v;
            myt.TransformSupport.setTransformOrigin(this.getOuterDomStyle(), v);
            if (this.inited) {
                this.__updateBounds(this.width, this.height);
                this.fireEvent('transformOrigin', v);
            }
        }
    },
    
    setRotation: function(v) {
        if (this.rotation !== v) {
            this.rotation = v;
            myt.TransformSupport.addTransform(this.getOuterDomStyle(), 'rotate', (v || 0) + 'deg');
            if (this.inited) {
                this.__updateBounds(this.width, this.height);
                this.fireEvent('rotation', v);
            }
        }
    },
    
    setScale: function(v) {
        var doUpdateX = this.scaleX !== v;
        if (doUpdateX) this.__applyScale('scaleX', this.scaleX = v);
        
        var doUpdateY = this.scaleY !== v;
        if (doUpdateY) this.__applyScale('scaleY', this.scaleY = v);
        
        if (this.inited) {
            if (doUpdateX || doUpdateY) this.__updateBounds(this.width, this.height);
            if (doUpdateX) this.fireEvent('scaleX', v);
            if (doUpdateY) this.fireEvent('scaleY', v);
        }
    },
    
    setScaleX: function(v) {
        if (this.scaleX !== v) {
            this.__applyScale('scaleX', this.scaleX = v);
            if (this.inited) {
                this.__updateBounds(this.width, this.height);
                this.fireEvent('scaleX', v);
            }
        }
    },
    
    setScaleY: function(v) {
        if (this.scaleY !== v) {
            this.__applyScale('scaleY', this.scaleY = v);
            if (this.inited) {
                this.__updateBounds(this.width, this.height);
                this.fireEvent('scaleY', v);
            }
        }
    },
    
    /** @private */
    __applyScale: function(axis, v) {
        if (v == null) {
            myt.TransformSupport.removeTransform(this.getOuterDomStyle(), axis);
        } else {
            myt.TransformSupport.addTransform(this.getOuterDomStyle(), axis, v || 1); // Also converts 0 to 1.
        }
    },
    
    setSkewX: function(v) {
        if (this.skewX !== v) {
            this.skewX = v;
            myt.TransformSupport.addTransform(this.getOuterDomStyle(), 'skewX', v || 0);
            if (this.inited) {
                this.__updateBounds(this.width, this.height);
                this.fireEvent('skewX', v);
            }
        }
    },
    
    setSkewY: function(v) {
        if (this.skewY !== v) {
            this.skewY = v;
            myt.TransformSupport.addTransform(this.getOuterDomStyle(), 'skewY', v || 0);
            if (this.inited) {
                this.__updateBounds(this.width, this.height);
                this.fireEvent('skewY', v);
            }
        }
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** @overrides myt.View
        @private */
    __updateBounds: function(w, h) {
        var r = this.rotation,
            sx = this.scaleX,
            sy = this.scaleY,
            notScaled = false;
        if ((sx === undefined || sx === 1) && (sy === undefined || sy === 1)) notScaled = true;
        
        if (notScaled && (r === undefined || r === 0 || r === 180)) {
            // Do nothing
        } else if (notScaled && (r === 90 || r === 270)) {
            w = this.height;
            h = this.width;
        } else {
            var b = this.getOuterDomElement().getBoundingClientRect();
            w = b.width;
            h = b.height;
        }
        
        this.callSuper(w, h);
    }
});

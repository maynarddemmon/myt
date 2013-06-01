/** Adds CSS3 transform support to a View. */
myt.TransformSupport = new JS.Module('TransformSupport', {
    // Class Methods ///////////////////////////////////////////////////////////
    extend: {
        /** Determine the name to use for the transform style property. */
        _styleKey: function() {
            switch (BrowserDetect.browser) {
                case 'Chrome': case 'Safari': case 'OmniWeb': return 'webkitTransform';
                case 'MSIE': return 'msTransform';
                case 'Opera': return 'oTransform';
                case 'Firefox': default: return 'transform';
            }
        }(),
        
        /** Adds an entry to the 'transform' style property of the provided
            style property map.
            @param s:Object the style map to modify.
            @param type:string the type of transform: 'rotate', 'scaleX', 
                'scaleY', 'skewX', 'skewY'.
            @param v:string the style value to set.
            @returns void */
        setTransform: function(s, type, v) {
            var cur = this.removeTransform(s, type);
            s[this._styleKey] = cur + (cur.length === 0 ? '' : ' ') + type + '(' + v + ')';
        },
        
        /** Removes an entry from the 'transform' style property of the provided
            style property map.
            @param s:Object the style map to modify.
            @param type:string the type of transform: 'rotate', 'scaleX', 
                'scaleY', 'skewX', 'skewY'.
            @returns string: the new transform value after the removal has been
                applied. */
        removeTransform: function(s, type) {
            var key = this._styleKey;
            var value = s[key];
            
            if (!value || value.length === 0) return '';
            
            var parts = value.split(' ');
            var i = parts.length;
            while (i) {
                if (parts[--i].indexOf(type) === 0) {
                    parts.splice(i, 1);
                    break;
                }
            }
            
            return s[key] = parts.join(' ');
        },
        
        /** Set rotation in degrees. */
        rotate: function(s, v) {
            this.setTransform(s, 'rotate', v + 'deg');
        },
        
        /** Set horizontal scaling where 1 is 100%. */
        scaleX: function(s, v) {
            this.setTransform(s, 'scaleX', v);
        },
        
        /** Set vertical scaling where 1 is 100%. */
        scaleY: function(s, v) {
            this.setTransform(s, 'scaleY', v);
        },
        
        /** Set horizontal skew in degrees. */
        skewX: function(s, v) {
            this.setTransform(s, 'skewX', v + 'deg');
        },
        
        /** Set vertical skew in degrees. */
        skewY: function(s, v) {
            this.setTransform(s, 'skewY', v + 'deg');
        }
    },
    
    // Accessors ///////////////////////////////////////////////////////////////
    /** Value is in degrees. */
    setRotation: function(v) {
        if (this.rotation === v) return;
        this.rotation = v;
        myt.TransformSupport.rotate(this.deStyle, v ? v : 0);
        if (this.inited) {
            this.__updateBounds(this.width, this.height);
            this.fireNewEvent('rotation', v);
        }
    },
    
    /** Sets the scale for the view in both the x and y dimension to the
        same value. A value of 1 is no scaling, 0.5 is 50%, 2 is 200%, etc. */
    setScale: function(v) {
        var doUpdateX = this.scaleX !== v;
        if (doUpdateX) {
            this.scaleX = v;
            myt.TransformSupport.scaleX(this.deStyle, v ? v : 1);
        }
        
        var doUpdateY = this.scaleY !== v;
        if (doUpdateY) {
            this.scaleY = v;
            myt.TransformSupport.scaleY(this.deStyle, v ? v : 1);
        }
        
        if (this.inited) {
            if (doUpdateX || doUpdateY) this.__updateBounds(this.width, this.height);
            if (doUpdateX) this.fireNewEvent('scaleX', v);
            if (doUpdateY) this.fireNewEvent('scaleY', v);
        }
    },
    
    /** Sets the scale for the view in the x dimension. A value of 1 is no 
        scaling, 0.5 is 50%, 2 is 200%, etc. */
    setScaleX: function(v) {
        if (this.scaleX === v) return;
        this.scaleX = v;
        myt.TransformSupport.scaleX(this.deStyle, v ? v : 1);
        if (this.inited) {
            this.__updateBounds(this.width, this.height);
            this.fireNewEvent('scaleX', v);
        }
    },
    
    /** Sets the scale for the view in the y dimension. A value of 1 is no 
        scaling, 0.5 is 50%, 2 is 200%, etc. */
    setScaleY: function(v) {
        if (this.scaleY === v) return;
        this.scaleY = v;
        myt.TransformSupport.scaleY(this.deStyle, v ? v : 1);
        if (this.inited) {
            this.__updateBounds(this.width, this.height);
            this.fireNewEvent('scaleY', v);
        }
    },
    
    /** Value is in degrees. */
    setSkewX: function(v) {
        if (this.skewX === v) return;
        this.skewX = v;
        myt.TransformSupport.skewX(this.deStyle, v ? v : 0);
        if (this.inited) {
            this.__updateBounds(this.width, this.height);
            this.fireNewEvent('skewX', v);
        }
    },
    
    /** Value is in degrees. */
    setSkewY: function(v) {
        if (this.skewY === v) return;
        this.skewY = v;
        myt.TransformSupport.skewY(this.deStyle, v ? v : 0);
        if (this.inited) {
            this.__updateBounds(this.width, this.height);
            this.fireNewEvent('skewY', v);
        }
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** @overrides myt.View */
    __updateBounds: function(w, h) {
        var r = this.rotation, sx = this.scaleX, sy = this.scaleY, isScaled = true;
        if ((sx === undefined || sx === 1) && (sy === undefined || sy === 1)) isScaled = false;
        
        if (!isScaled && (r === undefined || r === 0 || r === 180)) {
            // Do nothing
        } else if (!isScaled && (r === 90 || r === 270)) {
            w = this.height;
            h = this.width;
        } else {
            var b = this.domElement.getBoundingClientRect();
            w = b.width;
            h = b.height;
        }
        
        this.callSuper(w, h);
    }
});

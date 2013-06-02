/** Adds support for text display to a View. Requires myt.SizeToDom mixin
    be used as a super mixin. */
myt.TextSupport = new JS.Module('TextSupport', {
    // Accessors ///////////////////////////////////////////////////////////////
    /** The text content to be displayed. */
    setText: function(v) {
        if (this.text === v) return;
        // Use innerHTML rather than textContent since this allows us to
        // embed formatting markup.
        this.domElement.innerHTML = this.text = v;
        if (this.inited) {
            this.fireNewEvent('text', v);
            this.sizeViewToDom();
        }
    },
    
    // Font Attributes
    setFontFamily: function(v) {
        if (this.fontFamily === v) return;
        this.fontFamily = v;
        this.deStyle.fontFamily = v ? v : 'inherit';
        if (this.inited) {
            this.fireNewEvent('fontFamily', v);
            this.sizeViewToDom();
        }
    },
    
    /** Supported values: 'normal', 'italic', 'oblique', 'inherit'. */
    setFontStyle: function(v) {
        if (this.fontStyle === v) return;
        this.fontStyle = v;
        this.deStyle.fontStyle = v ? v : 'inherit';
        if (this.inited) {
            this.fireNewEvent('fontStyle', v);
            this.sizeViewToDom();
        }
    },
    
    /** Supported values: 'normal', 'small-caps', 'inherit'. */
    setFontVariant: function(v) {
        if (this.fontVariant === v) return;
        this.fontVariant = v;
        this.deStyle.fontVariant = v ? v : 'inherit';
        if (this.inited) {
            this.fireNewEvent('fontVariant', v);
            this.sizeViewToDom();
        }
    },
    
    /** Supported values: 'normal', 'bold', 'bolder', 'lighter', '100-900', 'inherit'. */
    setFontWeight: function(v) {
        if (this.fontWeight === v) return;
        this.fontWeight = v;
        this.deStyle.fontWeight = v ? v : 'inherit';
        if (this.inited) {
            this.fireNewEvent('fontWeight', v);
            this.sizeViewToDom();
        }
    },
    
    /** Supported values: 'normal, '14px', '14pt', 'xx-small', 'x-small', 'small'
        'medium', 'large', 'x-large', 'xx-large', 'smaller', 'larger', '75%', 
        'inherit'. */
    setFontSize: function(v) {
        if (this.fontSize === v) return;
        this.fontSize = v;
        this.deStyle.fontSize = v ? v : 'inherit';
        if (this.inited) {
            this.fireNewEvent('fontSize', v);
            this.sizeViewToDom();
        }
    },
    
    // Text Attributes
    /** Supported values: 'normal', 'nowrap', 'pre', 'pre-line', 'pre-wrap', 'inherit'. */
    setWhiteSpace: function(v) {
        if (this.whiteSpace === v) return;
        this.whiteSpace = v;
        this.deStyle.whiteSpace = v ? v : 'inherit';
        if (this.inited) {
            this.fireNewEvent('whiteSpace', v);
            this.sizeViewToDom();
        }
    },
    
    /** Supported values: 'ellipsis', 'clip', 'inherit'. */
    setTextOverflow: function(v) {
        if (this.textOverflow === v) return;
        this.textOverflow = v;
        this.deStyle.textOverflow = v ? v : 'inherit';
        if (this.inited) this.fireNewEvent('textOverflow', v);
    },
    
    /** Supported values: 'left', 'right', 'center', 'justify', 'inherit'. */
    setTextAlign: function(v) {
        if (this.textAlign === v) return;
        this.textAlign = v;
        this.deStyle.textAlign = v ? v : 'inherit';
        if (this.inited) this.fireNewEvent('textAlign', v);
    },
    
    /** Supported values: '20px', '10%', 'inherit'. */
    setTextIndent: function(v) {
        if (this.textIndent === v) return;
        this.textIndent = v;
        this.deStyle.textIndent = v ? v : 'inherit';
        if (this.inited) {
            this.fireNewEvent('textIndent', v);
            this.sizeViewToDom();
        }
    },
    
    /** Supported values: 'none', 'capitalize', 'uppercase', 'lowercase', 'inherit'. */
    setTextTransform: function(v) {
        if (this.textTransform === v) return;
        this.textTransform = v;
        this.deStyle.textTransform = v ? v : 'inherit';
        if (this.inited) {
            this.fireNewEvent('textTransform', v);
            this.sizeViewToDom();
        }
    },
    
    /** Supported values: 'none', 'underline', 'overline', 'line-through', 'blink', 'inherit'. */
    setTextDecoration: function(v) {
        if (this.textDecoration === v) return;
        this.textDecoration = v;
        this.deStyle.textDecoration = v ? v : 'inherit';
        if (this.inited) {
            this.fireNewEvent('textDecoration', v);
            this.sizeViewToDom();
        }
    },
    
    /** Supported values: 'normal', '1.5', '22px', '150%', 'inherit'. */
    setLineHeight: function(v) {
        if (this.lineHeight === v) return;
        this.lineHeight = v;
        this.deStyle.lineHeight = v ? v : 'inherit';
        if (this.inited) {
            this.fireNewEvent('lineHeight', v);
            this.sizeViewToDom();
        }
    },
    
    /** Supported values: 'normal', '3px', 'inherit'. */
    setLetterSpacing: function(v) {
        if (this.letterSpacing === v) return;
        this.letterSpacing = v;
        this.deStyle.letterSpacing = v ? v : 'inherit';
        if (this.inited) {
            this.fireNewEvent('letterSpacing', v);
            this.sizeViewToDom();
        }
    },
    
    /** Supported values: 'normal', '3px', 'inherit'. */
    setWordSpacing: function(v) {
        if (this.wordSpacing === v) return;
        this.wordSpacing = v;
        this.deStyle.wordSpacing = v ? v : 'inherit';
        if (this.inited) {
            this.fireNewEvent('wordSpacing', v);
            this.sizeViewToDom();
        }
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** Configures the attributes for this Text so that an ellipsis will be
        displayed.
        @returns void */
    enableEllipsis: function() {
        this.setWhiteSpace('nowrap');
        this.setOverflow('hidden');
        this.setTextOverflow('ellipsis');
        
        // NOTE: To reveal hidden text set overflow:visible
    },
    
    /** Turns on a text shadow.
        @param x:number the x offset in pixels of the shadow.
        @param y:number the y offset in pixels of the shadow.
        @param blur:number the bluriness in pixels of the shadow.
        @param color:color_string the color of the shadow.
        @param extraStrength:number the number of times to render the shadow
            to give the shadow extra opacity.
        @returns void */
    showTextShadow: function(x, y, blur, color, extraStrength) {
        var shadow = x + 'px ' + y + 'px ' + blur + 'px ' + color;
        if (extraStrength === undefined || extraStrength < 0) extraStrength = 0;
        
        var value = shadow;
        while (extraStrength--) value += ',' + shadow;
        this.deStyle.textShadow = value;
    },
    
    /** Turns off a text shadow.
        @returns void */
    hideTextShadow: function() {
        this.deStyle.textShadow = 'none';
    }
});

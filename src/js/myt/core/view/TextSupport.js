/** Adds support for text display to a View. Requires myt.SizeToDom mixin
    be used as a super mixin.
    
    Attributes:
        text:string|event object with a string value
            The text to be displayed. The value will be assigned to the
            inner html of the div.
        fontFamily:string
            The name of a font to use. The value will be assigned to the
            font family CSS parameter. */
myt.TextSupport = new JS.Module('TextSupport', {
    // Accessors ///////////////////////////////////////////////////////////////
    /** The text content to be displayed. */
    setText: function(v) {
        if (typeof v === 'object') v = v.value;
        
        if (this.text === v) return;
        // Use innerHTML rather than textContent since this allows us to
        // embed formatting markup.
        this.domElement.innerHTML = this.text = v;
        if (this.inited) {
            this.fireNewEvent('text', v);
            this.sizeViewToDom();
        }
    },
    
    // Text Attributes
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
    
    /** Supported values: 'normal', 'nowrap', 'pre', 'pre-line', 'pre-wrap', 'inherit'. */
    setWhiteSpace: function(v) {
        this.__textSetter(v, 'whiteSpace');
    },
    
    /** Supported values: 'break-word', 'normal'. */
    setWordWrap: function(v) {
        this.__textSetter(v, 'wordWrap', 'normal');
    },
    
    /** Supported values: '20px', '10%', 'inherit'. */
    setTextIndent: function(v) {
        this.__textSetter(v, 'textIndent');
    },
    
    /** Supported values: 'none', 'capitalize', 'uppercase', 'lowercase', 'inherit'. */
    setTextTransform: function(v) {
        this.__textSetter(v, 'textTransform');
    },
    
    /** Supported values: 'none', 'underline', 'overline', 'line-through', 'blink', 'inherit'. */
    setTextDecoration: function(v) {
        this.__textSetter(v, 'textDecoration');
    },
    
    /** Supported values: 'normal', '1.5', '22px', '150%', 'inherit'. */
    setLineHeight: function(v) {
        this.__textSetter(v, 'lineHeight');
    },
    
    /** Supported values: 'normal', '3px', 'inherit'. */
    setLetterSpacing: function(v) {
        this.__textSetter(v, 'letterSpacing');
    },
    
    /** Supported values: 'normal', '3px', 'inherit'. */
    setWordSpacing: function(v) {
        this.__textSetter(v, 'wordSpacing');
    },
    
    // Font Attributes
    setFontFamily: function(v) {
        this.__textSetter(v, 'fontFamily');
    },
    
    /** Supported values: 'normal', 'italic', 'oblique', 'inherit'. */
    setFontStyle: function(v) {
        this.__textSetter(v, 'fontStyle');
    },
    
    /** Supported values: 'normal', 'small-caps', 'inherit'. */
    setFontVariant: function(v) {
        this.__textSetter(v, 'fontVariant');
    },
    
    /** Supported values: 'normal', 'bold', 'bolder', 'lighter', '100-900', 'inherit'. */
    setFontWeight: function(v) {
        this.__textSetter(v, 'fontWeight');
    },
    
    /** Supported values: 'normal, '14px', '14pt', 'xx-small', 'x-small', 'small'
        'medium', 'large', 'x-large', 'xx-large', 'smaller', 'larger', '75%', 
        'inherit'. */
    setFontSize: function(v) {
        this.__textSetter(v, 'fontSize');
    },
    
    __textSetter: function(v, attrName, defaultValue) {
        if (this[attrName] === v) return;
        this[attrName] = v;
        this.deStyle[attrName] = v ? v : (defaultValue ? defaultValue : 'inherit');
        if (this.inited) {
            this.fireNewEvent(attrName, v);
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

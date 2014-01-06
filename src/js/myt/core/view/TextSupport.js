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
    /** @overrides myt.View */
    setWidth: function(v, supressEvent) {
        this.callSuper(v, supressEvent);
        
        // Height can change with width change when wrapping occurs.
        if (v !== 'auto') {
            var ws = this.whiteSpace;
            if (ws === 'normal' || ws === 'pre-line' || ws === 'pre-wrap') {
                this.sizeViewToDom();
            }
        }
    },
    
    /** The text content to be displayed. */
    setText: function(v) {
        if (!v) v = '';
        if (typeof v === 'object') v = v.value;
        
        if (this.text !== v) {
            // Use innerHTML rather than textContent since this allows us to
            // embed formatting markup.
            this.domElement.innerHTML = this.text = v;
            if (this.inited) {
                this.fireNewEvent('text', v);
                this.sizeViewToDom();
            }
        }
    },
    
    // Text Attributes
    /** Supported values: 'ellipsis', 'clip', 'inherit'. */
    setTextOverflow: function(v) {
        if (this.textOverflow !== v) {
            this.textOverflow = v;
            this.deStyle.textOverflow = v ? v : 'inherit';
            if (this.inited) this.fireNewEvent('textOverflow', v);
        }
    },
    
    /** Supported values: 'left', 'right', 'center', 'justify', 'inherit'. */
    setTextAlign: function(v) {
        if (this.textAlign !== v) {
            this.textAlign = v;
            this.deStyle.textAlign = v ? v : 'inherit';
            if (this.inited) this.fireNewEvent('textAlign', v);
        }
    },
    
    /** Supported values: 'normal', 'nowrap', 'pre', 'pre-line', 'pre-wrap', 
        'inherit'. */
    setWhiteSpace: function(v) {
        this.__s(v, 'whiteSpace');
    },
    
    /** Supported values: 'break-word', 'normal'. */
    setWordWrap: function(v) {
        this.__s(v, 'wordWrap', 'normal');
    },
    
    /** Supported values: '20px', '10%', 'inherit'. */
    setTextIndent: function(v) {
        this.__s(v, 'textIndent');
    },
    
    /** Supported values: 'none', 'capitalize', 'uppercase', 'lowercase', 
        'inherit'. */
    setTextTransform: function(v) {
        this.__s(v, 'textTransform');
    },
    
    /** Supported values: 'none', 'underline', 'overline', 'line-through', 
        'blink', 'inherit'. */
    setTextDecoration: function(v) {
        this.__s(v, 'textDecoration');
    },
    
    /** Supported values: 'normal', '1.5', '22px', '150%', 'inherit'. */
    setLineHeight: function(v) {
        this.__s(v, 'lineHeight');
    },
    
    /** Supported values: 'normal', '3px', 'inherit'. */
    setLetterSpacing: function(v) {
        this.__s(v, 'letterSpacing');
    },
    
    /** Supported values: 'normal', '3px', 'inherit'. */
    setWordSpacing: function(v) {
        this.__s(v, 'wordSpacing');
    },
    
    // Font Attributes
    setFontFamily: function(v) {
        this.__s(v, 'fontFamily');
    },
    
    /** Supported values: 'normal', 'italic', 'oblique', 'inherit'. */
    setFontStyle: function(v) {
        this.__s(v, 'fontStyle');
    },
    
    /** Supported values: 'normal', 'small-caps', 'inherit'. */
    setFontVariant: function(v) {
        this.__s(v, 'fontVariant');
    },
    
    /** Supported values: 'normal', 'bold', 'bolder', 'lighter', '100-900', 
        'inherit'. */
    setFontWeight: function(v) {
        this.__s(v, 'fontWeight');
    },
    
    /** Supported values: 'normal, '14px', '14pt', 'xx-small', 'x-small', 
        'small', 'medium', 'large', 'x-large', 'xx-large', 'smaller', 'larger',
        '75%', 'inherit'. */
    setFontSize: function(v) {
        this.__s(v, 'fontSize');
    },
    
    /** A private setter function that provides a common implementation for
        most of this setters in this mixin. */
    __s: function(v, attrName, defaultValue) {
        if (this[attrName] !== v) {
            this[attrName] = v;
            this.deStyle[attrName] = v ? v : (defaultValue ? defaultValue : 'inherit');
            if (this.inited) {
                this.fireNewEvent(attrName, v);
                this.sizeViewToDom();
            }
        }
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** Configures the attributes for this Text so that an ellipsis will be
        displayed. To actually see an ellipsis, an explicit width should be
        set on the Text so that overflow will occur.
        @returns void */
    enableEllipsis: function() {
        this.setWhiteSpace('nowrap');
        this.setOverflow('hidden');
        this.setTextOverflow('ellipsis');
    },
    
    /** Turns ellipsis off by setting overflow to 'visible'. Other CSS
        related changes for ellipsis are not undone such as whiteSpace and
        textOverflow.
        @returns void */
    disableEllipsis: function() {
        this.setOverflow('visible');
    },
    
    /** Turns on a text shadow.
        @param x:number (optional) The x offset in pixels of the shadow.
            Defaults to 0 if not provided.
        @param y:number (optional) The y offset in pixels of the shadow.
            Defaults to 0 if not provided.
        @param blur:number (optional) The bluriness in pixels of the shadow.
            Defaults to 2 if not provided.
        @param color:color_string (optional) The color of the shadow. Defaults
            to '#000000' if not provided.
        @param extraStrength:number (optional) The number of times to render 
            the shadow to give the shadow extra opacity.
        @returns void */
    showTextShadow: function(x, y, blur, color, extraStrength) {
        var shadow = (x != null ? x : 0) + 'px ' + 
            (y != null ? y : 0) + 'px ' + 
            (blur != null ? blur : 2) + 'px ' + 
            (color || '#000000');
            
        if (extraStrength > 0) {
            var value = [shadow];
            while (extraStrength--) value.push(shadow);
            shadow = value.join(',');
        }
        
        this.deStyle.textShadow = shadow;
    },
    
    /** Turns off a text shadow.
        @returns void */
    hideTextShadow: function() {
        this.deStyle.textShadow = 'none';
    }
});

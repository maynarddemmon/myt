/** Adds support for text display to a View.
    
    Requires:
        myt.SizeToDom super mixin.
    
    Events:
        text:string
        textOverflow:string
        textAlign:string
        whiteSpace:string
        wordWrap:string
        textIndent:string
        textTransform:string
        textDecoration:string
        lineHeight:string
        letterSpacing:string
        wordSpacing:string
        fontFamily:string
        fontStyle:string
        fontVariant:string
        fontWeight:string
        fontSize:string
    
    Attributes:
        text:string|event(string) The text to be displayed. The value will 
            be assigned to the inner html of the div.
        textOverflow:string How text will be treated when it overflows the
            bounds. Supported values: 'ellipsis', 'clip', 'inherit'.
        textAlign:string How text will be aligned within the bounds. Supported 
            values: 'left', 'right', 'center', 'justify', 'inherit'.
        whiteSpace:string How white space is handled. Supported values: 
            'normal', 'nowrap', 'pre', 'pre-line', 'pre-wrap', 'inherit'.
        wordWrap:string How line wrapping is done. Supported 
            values: 'break-word', 'normal'.
        textIndent:string How text gets indented. Supported values: '20px', 
            '10%', 'inherit'.
        textTransform:string Transformation performed on the text during
            display. Supported values: 'none', 'capitalize', 'uppercase', 
            'lowercase', 'inherit'.
        textDecoration:string Visual decoration to the text. Supported 
            values: 'none', 'underline', 'overline', 'line-through', 
            'blink', 'inherit'.
        lineHeight:string The height of individual lines of text. Supported 
            values: 'normal', '1.5', '22px', '150%', 'inherit'.
        letterSpacing:string Spacing between letters. Supported values: 
            'normal', '3px', 'inherit'.
        wordSpacing:string Spacing between words. Supported values: 
            'normal', '3px', 'inherit'.
        fontFamily:string The name of a font to use. The value will be 
            assigned to the font family CSS parameter.
        fontStyle:string Styling applied to the text. Supported values: 
            'normal', 'italic', 'oblique', 'inherit'.
        fontVariant:string The font variant. Supported values: 'normal', 
            'small-caps', 'inherit'.
        fontWeight:string The font weight. Supported values: 'normal', 'bold', 
            'bolder', 'lighter', '100-900', 'inherit'.
        fontSize:string The size of the font. Supported values: 'normal, 
            '14px', '14pt', 'xx-small', 'x-small', 'small', 'medium', 'large', 
            'x-large', 'xx-large', 'smaller', 'larger', '75%', 'inherit'.
        userUnselectable:boolean If set to true the CSS property user-select 
            will be set to 'none' thus making text selection not work.
            Furthermore, the cursor will be set to the default so it no longer
            appears as an i-beam.
    
    @class */
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
    
    setText: function(v) {
        if (!v) v = '';
        if (typeof v === 'object') v = v.value;
        
        if (this.text !== v) {
            // Use innerHTML rather than textContent since this allows us to
            // embed formatting markup.
            this.getInnerDomElement().innerHTML = this.text = v;
            if (this.inited) {
                this.fireEvent('text', v);
                this.sizeViewToDom();
            }
        }
    },
    
    // Text Attributes
    setTextOverflow: function(v) {
        if (this.textOverflow !== v) {
            this.textOverflow = v;
            this.getInnerDomStyle().textOverflow = v || 'inherit';
            if (this.inited) this.fireEvent('textOverflow', v);
        }
    },
    
    setTextAlign: function(v) {
        if (this.textAlign !== v) {
            this.textAlign = v;
            this.getInnerDomStyle().textAlign = v || 'inherit';
            if (this.inited) this.fireEvent('textAlign', v);
        }
    },
    
    setWhiteSpace: function(v) {this.__s(v, 'whiteSpace');},
    setWordWrap: function(v) {this.__s(v, 'wordWrap', 'normal');},
    setTextIndent: function(v) {this.__s(v, 'textIndent');},
    setTextTransform: function(v) {this.__s(v, 'textTransform');},
    setTextDecoration: function(v) {this.__s(v, 'textDecoration');},
    setLineHeight: function(v) {this.__s(v, 'lineHeight');},
    setLetterSpacing: function(v) {this.__s(v, 'letterSpacing');},
    setWordSpacing: function(v) {this.__s(v, 'wordSpacing');},
    
    // Font Attributes
    setFontFamily: function(v) {this.__s(v, 'fontFamily');},
    setFontStyle: function(v) {this.__s(v, 'fontStyle');},
    setFontVariant: function(v) {this.__s(v, 'fontVariant');},
    setFontWeight: function(v) {this.__s(v, 'fontWeight');},
    setFontSize: function(v) {this.__s(v, 'fontSize');},
    
    /** A private setter function that provides a common implementation for
        most of this setters in this mixin.
        @private
        @param {string|number} v
        @param {string} attrName
        @param {string|number} defaultValue
        @returns {undefined} */
    __s: function(v, attrName, defaultValue) {
        if (this[attrName] !== v) {
            this[attrName] = v;
            this.getInnerDomStyle()[attrName] = v || defaultValue || 'inherit';
            if (this.inited) {
                this.fireEvent(attrName, v);
                this.sizeViewToDom();
            }
        }
    },
    
    setUserUnselectable: function(v) {
        if (this.userUnselectable !== v) {
            this.userUnselectable = v;
            this[v ? 'addDomClass' : 'removeDomClass']('mytUnselectable');
            this.setCursor(v ? 'default' : 'text');
            if (this.inited) this.fireEvent('userUnselectable', v);
        }
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** Configures the attributes for this Text so that an ellipsis will be
        displayed. To actually see an ellipsis, an explicit width should be
        set on the Text so that overflow will occur.
        @returns {undefined} */
    enableEllipsis: function() {
        this.setWhiteSpace('nowrap');
        this.setOverflow('hidden');
        this.setTextOverflow('ellipsis');
    },
    
    /** Turns ellipsis off by setting overflow to 'visible'. Other CSS
        related changes for ellipsis are not undone such as whiteSpace and
        textOverflow.
        @returns {undefined} */
    disableEllipsis: function() {
        this.setOverflow('visible');
    },
    
    /** Turns on a text shadow.
        @param {number} [x] - The x offset in pixels of the shadow.
            Defaults to 0 if not provided.
        @param {number} [y] - The y offset in pixels of the shadow.
            Defaults to 0 if not provided.
        @param {number} [blur] - The bluriness in pixels of the shadow.
            Defaults to 2 if not provided.
        @param {string} [color] - The color of the shadow. Defaults
            to '#000000' if not provided.
        @param {number} [extraStrength] - The number of times to render 
            the shadow to give the shadow extra opacity.
        @returns {undefined} */
    showTextShadow: function(x, y, blur, color, extraStrength) {
        var shadow = (x || 0) + 'px ' + 
            (y || 0) + 'px ' + 
            (blur != null ? blur : 2) + 'px ' + 
            (color || '#000000');
            
        if (extraStrength > 0) {
            var value = [shadow];
            while (extraStrength--) value.push(shadow);
            shadow = value.join(',');
        }
        
        this.getInnerDomStyle().textShadow = shadow;
    },
    
    /** Turns off a text shadow.
        @returns {undefined} */
    hideTextShadow: function() {
        this.getInnerDomStyle().textShadow = 'none';
    }
});

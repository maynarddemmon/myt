(pkg => {
    const
        /*  A private setter function that provides a common implementation for
            most of this setters in the TextSupport mixin.
            @param {string|number} v
            @param {string} attrName
            @param {string|number} defaultValue
            @returns {undefined} */
        setAndSizeViewToDom = (textView, v, attrName, defaultValue) => {
            if (textView[attrName] !== v) {
                textView[attrName] = v;
                textView.getIDS()[attrName] = v || defaultValue || 'inherit';
                if (textView.inited) {
                    textView.fireEvent(attrName, v);
                    textView.sizeViewToDom();
                }
            }
        };
    
    /** Adds support for text display to a View.
        
        Requires:
            myt.SizeToDom super mixin.
        
        Events:
            text:string
            textOverflow:string
            textAlign:string
            whiteSpace:string
            overflowWrap:string
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
            textAlign:string How text will be aligned within the bounds. 
                Supported values: 'left', 'right', 'center', 'justify', 
                'inherit'.
            whiteSpace:string How white space is handled. Supported values: 
                'normal', 'nowrap', 'pre', 'pre-wrap', 'pre-line', 'break-spaces', inherit'.
            wordWrap:string How line wrapping is done. Supported 
                values: 'anywhere', 'break-word', 'normal'.
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
            fontWeight:string The font weight. Supported values: 'normal', 
                'bold', 'bolder', 'lighter', '100-900', 'inherit'.
            fontSize:string The size of the font. Supported values: 'normal, 
                '14px', '14pt', 'xx-small', 'x-small', 'small', 'medium', 
                'large', 'x-large', 'xx-large', 'smaller', 'larger', '75%', 
                'inherit'.
            userUnselectable:boolean If set to true the CSS property user-select 
                will be set to 'none' thus making text selection not work.
                Furthermore, the cursor will be set to the default so it no 
                longer appears as an i-beam.
        
        @class */
    pkg.TextSupport = new JS.Module('TextSupport', {
        // Accessors ///////////////////////////////////////////////////////////
        /** @overrides myt.View */
        setWidth: function(v, suppressEvent) {
            this.callSuper(v, suppressEvent);
            
            // Height can change with width change when wrapping occurs.
            if (v !== 'auto') {
                const ws = this.whiteSpace;
                if (ws === 'normal' || ws === 'pre-line' || ws === 'pre-wrap' || ws === 'break-spaces') {
                    this.sizeViewToDom();
                }
            }
        },
        
        setText: function(v) {
            if (!v) v = '';
            v = this.valueFromEvent(v);
            
            if (this.text !== v) {
                // Use innerHTML rather than textContent since this allows 
                // us to embed formatting markup.
                this.getIDE().innerHTML = this.text = v;
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
                this.getIDS().textOverflow = v || 'inherit';
                if (this.inited) this.fireEvent('textOverflow', v);
            }
        },
        
        setTextAlign: function(v) {
            if (this.textAlign !== v) {
                this.textAlign = v;
                this.getIDS().textAlign = v || 'inherit';
                if (this.inited) this.fireEvent('textAlign', v);
            }
        },
        
        setWhiteSpace: function(v) {setAndSizeViewToDom(this, v, 'whiteSpace');},
        setWordWrap: function(v) {setAndSizeViewToDom(this, v, 'wordWrap', 'normal');},
        setTextIndent: function(v) {setAndSizeViewToDom(this, v, 'textIndent');},
        setTextTransform: function(v) {setAndSizeViewToDom(this, v, 'textTransform');},
        setTextDecoration: function(v) {setAndSizeViewToDom(this, v, 'textDecoration');},
        setLineHeight: function(v) {setAndSizeViewToDom(this, v, 'lineHeight');},
        setLetterSpacing: function(v) {setAndSizeViewToDom(this, v, 'letterSpacing');},
        setWordSpacing: function(v) {setAndSizeViewToDom(this, v, 'wordSpacing');},
        
        // Font Attributes
        setFontFamily: function(v) {setAndSizeViewToDom(this, v, 'fontFamily');},
        setFontStyle: function(v) {setAndSizeViewToDom(this, v, 'fontStyle');},
        setFontVariant: function(v) {setAndSizeViewToDom(this, v, 'fontVariant');},
        setFontWeight: function(v) {setAndSizeViewToDom(this, v, 'fontWeight');},
        setFontSize: function(v) {setAndSizeViewToDom(this, v, 'fontSize');},
        
        setUserUnselectable: function(v) {
            if (this.userUnselectable !== v) {
                this.userUnselectable = v;
                this[v ? 'addDomClass' : 'removeDomClass']('mytUnselectable');
                if (this.cursor === 'default' || this.cursor === 'text') this.setCursor(v ? 'default' : 'text');
                if (this.inited) this.fireEvent('userUnselectable', v);
            }
        },
        
        
        // Methods /////////////////////////////////////////////////////////////
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
                to '#000' if not provided.
            @returns {undefined} */
        showTextShadow: function(x, y, blur, color) {
            this.getIDS().textShadow = 
                (x || 0) + 'px ' + 
                (y || 0) + 'px ' + 
                (blur != null ? blur : 2) + 'px ' + 
                (color || '#000');
        },
        
        /** Turns off a text shadow.
            @returns {undefined} */
        hideTextShadow: function() {
            this.getIDS().textShadow = 'none';
        }
    });
    
    const setPaddingAndSizeViewToDom = (textView, v, side) => {
            const attrName = 'padding' + side;
            v = Math.max(v, 0);
            
            if (textView[attrName] !== v) {
                textView[attrName] = v;
                textView.getIDS()[attrName] = v + 'px';
                textView.fireEvent(attrName, v);
                if (side === 'Left' || side === 'Right') {
                    updateDomWidthForPadding(textView);
                } else {
                    updateDomHeightForPadding(textView);
                }
            }
        },
        
        updateDomWidthForPadding = textView => {
            if (textView.__hasSetWidth) {
                textView.getODS().width = textView.width - (textView.paddingLeft || 0) - (textView.paddingRight || 0) + 'px';
                if (textView.inited) textView.sizeViewToDom();
            }
        },
        
        updateDomHeightForPadding = textView => {
            if (textView.__hasSetHeight) {
                textView.getODS().height = textView.height - (textView.paddingTop || 0) - (textView.paddingBottom || 0) + 'px';
                if (textView.inited) textView.sizeViewToDom();
            }
        };
    
    /** Adds support for padded text display to a View.
        
        Requires:
            myt.TextSupport super mixin.
        
        Events:
            paddingTop:number
            paddingLeft:number
            paddingBottom:number
            paddingRight:number
        
        Attributes:
            paddingTop:number The padding above the text.
            paddingRight:number The padding to the right of the text.
            paddingBottom:number The padding to the left of the text.
            paddingLeft:number The padding below the text.
        
        @class */
    pkg.PaddedTextSupport = new JS.Module('PaddedTextSupport', {
        setWidth: function(v, suppressEvent) {
            this.callSuper(v, suppressEvent);
            updateDomWidthForPadding(this);
        },
        
        setHeight: function(v, suppressEvent) {
            this.callSuper(v, suppressEvent);
            updateDomHeightForPadding(this);
        },
        
        // Padding Attributes
        setPadding: function(v) {
            let top,
                right,
                bottom,
                left;
            if (!v) v = 0;
            if (typeof v === 'object') {
                top = v.top || 0;
                right = v.right || 0;
                bottom = v.bottom || 0;
                left = v.left || 0;
            } else {
                top = right = bottom = left = v;
            }
            
            this.setPaddingTop(top);
            this.setPaddingRight(right);
            this.setPaddingBottom(bottom);
            this.setPaddingLeft(left);
        },
        setPaddingTop: function(v) {setPaddingAndSizeViewToDom(this, v, 'Top');},
        setPaddingRight: function(v) {setPaddingAndSizeViewToDom(this, v, 'Right');},
        setPaddingBottom: function(v) {setPaddingAndSizeViewToDom(this, v, 'Bottom');},
        setPaddingLeft: function(v) {setPaddingAndSizeViewToDom(this, v, 'Left');}
    });
})(myt);

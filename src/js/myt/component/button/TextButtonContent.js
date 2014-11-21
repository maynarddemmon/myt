/** A mixin that adds a text element to the inside of a button.
    
    Events:
        inset:number
        outset:number
        text:string
        shrinkToFit:boolean
        textY:number|string
    
    Attributes:
        inset:number The left padding before the text. Defaults to 0.
        outset:number The right padding after the text. Defaults to 0.
        text:string The text to display on the button.
        shrinkToFit:boolean When true the button will be as narrow as possible
            to fit the text, inset and outset. When false the button 
            will be as wide as the set width. Defaults to false.
        textY:number|string The y offset for the text. If a string it must be
            a valign value: 'top', 'middle' or 'bottom'.
        textView:myt.Text A reference to the child text view.
    
    Private Attributes:
        __updateContentPositionLoopBlock:boolean Used in __updateContentPosition
            to prevent infinite loops.
        __origHeight:number The height the button has after adoption. Used to
            keep a positive height for the button even when the textView is
            not shown.
*/
myt.TextButtonContent = new JS.Module('TextButtonContent', {
    // Life Cycle //////////////////////////////////////////////////////////////
    initNode: function(parent, attrs) {
        this.inset = this.outset = 0;
        
        if (attrs.shrinkToFit === undefined) attrs.shrinkToFit = false;
        
        // Use appropriate default based on mutliline text or not.
        this.textY = attrs.shrinkToFit ? 'middle' : 0;
        
        this.callSuper(parent, attrs);
        
        // Setup the constraint after adoption since the textView won't have
        // been sized to the dom until it's added in.
        var textView = this.textView;
        this.applyConstraint('__updateContentPosition', [
            this, 'inset', this, 'outset',
            this, 'width', this, 'shrinkToFit',
            textView, 'visible', textView, 'width',
            textView, 'height', textView, 'y'
        ]);
    },
    
    doAfterAdoption: function() {
        var textY = this.textY, 
            attrs = {
                name:'textView', 
                whiteSpace: this.shrinkToFit ? 'nowrap' : 'normal', 
                text:this.text, domClass:'myt-Text mytButtonText mytUnselectable'
            };
        if (typeof textY === 'string') {
            attrs.valign = textY;
        } else {
            attrs.y = textY;
        }
        new myt.Text(this, attrs);
        
        // Record original height
        this.__origHeight = this.height;
        
        this.callSuper();
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setInset: function(v) {
        // Adapt to event from syncTo
        if (v !== null && typeof v === 'object') v = v.value;
        
        if (this.inset !== v) {
            this.inset = v;
            if (this.inited) this.fireNewEvent('inset', v);
        }
    },
    
    setOutset: function(v) {
        // Adapt to event from syncTo
        if (v !== null && typeof v === 'object') v = v.value;
        
        if (this.outset !== v) {
            this.outset = v;
            if (this.inited) this.fireNewEvent('outset', v);
        }
    },
    
    setText: function(v) {
        if (this.text !== v) {
            this.text = v;
            if (this.inited) {
                this.textView.setText(v);
                this.fireNewEvent('text', v);
            }
        }
    },
    
    setShrinkToFit: function(v) {
        if (this.shrinkToFit !== v) {
            this.shrinkToFit = v;
            if (this.inited) {
                if (this.textView) this.textView.setWhiteSpace(v ? 'nowrap' : 'normal');
                this.fireNewEvent('shrinkToFit', v);
            }
        }
    },
    
    setTextY: function(v) {
        if (this.textY !== v) {
            this.textY = v;
            if (this.inited) {
                this.fireNewEvent('textY', v);
                if (typeof v === 'string') {
                    this.textView.setValign(v);
                } else {
                    this.textView.setValign('');
                    this.textView.setY(v);
                }
            }
        }
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    __updateContentPosition: function(v) {
        if (this.__updateContentPositionLoopBlock || this.destroyed) return;
        
        var inset = this.inset, 
            outset = this.outset, 
            textView = this.textView,
            textViewVisible = textView.visible && this.text;
        
        this.__updateContentPositionLoopBlock = true;
        if (this.shrinkToFit) {
            textView.setX(inset);
            this.setWidth(inset + (textViewVisible ? textView.width : 0) + outset);
            this.setHeight(this.__origHeight);
        } else {
            textView.setHeight('auto');
            textView.setWidth(this.width - inset - outset);
            textView.setX(inset);
            this.setHeight(textViewVisible ? textView.y + textView.height : this.__origHeight);
        }
        this.__updateContentPositionLoopBlock = false;
    }
});

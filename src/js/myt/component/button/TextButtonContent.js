/** A mixin that adds a text element to the inside of a button.
    
    Attributes:
        __updateContentPositionLoopBlock:boolean Used in __updateContentPosition
            to prevent infinite loops.
        text:string the text to display on the button.
        inset:number the left padding before the text. Defaults to 0.
        outset:number the right padding after the text. Defaults to 0.
        textY:number the y offset for the text.
        shrinkToFit:boolean when true the button will be as narrow as possible
            to fit the text, inset and outset. When false the button 
            will be as wide as the set width. Defaults to false.
        textView:myt.Text a reference to the child text view.
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
                text:this.text, domClass:'mytButtonText'
            };
        if (typeof textY === 'string') {
            attrs.valign = textY;
        } else {
            attrs.y = textY;
        }
        new myt.Text(this, attrs);
        
        // Record original height
        this.setOrigHeight(this.height);
        
        this.callSuper();
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setOrigHeight: function(v) {
        this.origHeight = v;
    },
    
    setInset: function(v) {
        // Adapt to event from syncTo
        if (typeof v === 'object') v = v.value;
        
        if (this.inset === v) return;
        this.inset = v;
        if (this.inited) this.fireNewEvent('inset', v);
    },
    
    setOutset: function(v) {
        // Adapt to event from syncTo
        if (typeof v === 'object') v = v.value;
        
        if (this.outset === v) return;
        this.outset = v;
        if (this.inited) this.fireNewEvent('outset', v);
    },
    
    setText: function(v) {
        if (this.text === v) return;
        this.text = v;
        if (this.inited) {
            this.textView.setText(v);
            this.fireNewEvent('text', v);
        }
    },
    
    setShrinkToFit: function(v) {
        if (this.shrinkToFit === v) return;
        this.shrinkToFit = v;
        if (this.inited) {
            if (this.textView) this.textView.setWhiteSpace(v ? 'nowrap' : 'normal');
            this.fireNewEvent('shrinkToFit', v);
        }
    },
    
    /** For fine tuning the y-position of the textView. */
    setTextY: function(v) {
        if (this.textY === v) return;
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
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    __updateContentPosition: function(v) {
        if (this.__updateContentPositionLoopBlock || this.destroyed) return;
        
        var inset = this.inset, 
            outset = this.outset, 
            textView = this.textView,
            textViewVisible = textView.visible && this.text;
        
        if (this.shrinkToFit) {
            textView.setX(inset);
            
            this.__updateContentPositionLoopBlock = true;
            this.setWidth(inset + (textViewVisible ? textView.width : 0) + outset);
            this.__updateContentPositionLoopBlock = false;
            
            this.setHeight(this.origHeight);
        } else {
            textView.setHeight('auto');
            textView.setWidth(this.width - inset - outset);
            textView.setX(inset);
            
            this.__updateContentPositionLoopBlock = true;
            this.setHeight(textViewVisible ? textView.y + textView.height : this.origHeight);
            this.__updateContentPositionLoopBlock = false;
        }
        
        this.updateUI();
    }
});

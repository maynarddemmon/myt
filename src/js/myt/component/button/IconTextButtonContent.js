/** A mixin that adds an icon and text to the inside of a button.
    
    Events:
        inset:number
        outset:number
        text:string
        shrinkToFit:boolean
        contentAlign:string
        iconUrl:string
        iconY:number|string
        iconSpacing:number
        textY:number|string
    
    Attributes:
        text:string The text to display on the button.
        iconUrl:string The url for an image to display in the button.
        inset:number The left padding before the icon. Defaults to 0.
        outset:number The right padding after the text/icon. Defaults to 0.
        textY:number|string The y offset for the text. If a string it must be
            a valign value: 'top', 'middle' or 'bottom'.
        iconY:number|string The y offset for the icon. If a string it must be
            a valign value: 'top', 'middle' or 'bottom'.
        iconSpacing:number The spacing between the iconView and the textView. 
            Defaults to 2.
        shrinkToFit:boolean When true the button will be as narrow as possible
            to fit the text, icon, inset and outset. When false the button 
            will be as wide as the set width. Defaults to false.
        contentAlign:string Determines how the icon and text will be 
            positioned when not in shrinkToFit mode. Allowed values are: 
            'left', 'center' and 'right'. Defaults to 'center'.
        textView:myt.Text A reference to the child text view.
        iconView:myt.Image A reference to the child image view.
        
    Private Attributes:
        __updateContentPositionLoopBlock:boolean Used in __updateContentPosition
            to prevent infinite loops.
*/
myt.IconTextButtonContent = new JS.Module('IconTextButtonContent', {
    // Life Cycle //////////////////////////////////////////////////////////////
    initNode: function(parent, attrs) {
        this.textY = this.iconY = 'middle';
        this.iconSpacing = 2;
        this.inset = this.outset = 0;
        
        if (attrs.shrinkToFit === undefined) attrs.shrinkToFit = false;
        if (attrs.contentAlign === undefined) attrs.contentAlign = 'center';
        
        this.callSuper(parent, attrs);
        
        // Setup the constraint after inited since the textView won't have
        // been sized to the dom until it's added in.
        var iconView = this.iconView, textView = this.textView;
        this.applyConstraint('__updateContentPosition', [
            this, 'inset', this, 'outset',
            this, 'width', this, 'shrinkToFit', this, 'iconSpacing',
            this, 'contentAlign',
            iconView, 'width', iconView, 'visible',
            textView, 'visible', textView, 'width'
        ]);
    },
    
    doAfterAdoption: function() {
        var attrs, iconY = this.iconY, textY = this.textY;
        
        // Setup iconView
        attrs = {
            name:'iconView', imageUrl:this.iconUrl
        };
        if (typeof iconY === 'string') {
            attrs.valign = iconY;
        } else {
            attrs.y = iconY;
        }
        new myt.Image(this, attrs);
        
        // Setup textView
        attrs = {
            name:'textView', whiteSpace:'nowrap', text:this.text, 
            domClass:'mytButtonText mytUnselectable'
        };
        if (typeof textY === 'string') {
            attrs.valign = textY;
        } else {
            attrs.y = textY;
        }
        new myt.Text(this, attrs);
        
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
            if (this.inited) this.fireNewEvent('shrinkToFit', v);
        }
    },
    
    setContentAlign: function(v) {
        if (this.contentAlign !== v) {
            this.contentAlign = v;
            if (this.inited) this.fireNewEvent('contentAlign', v);
        }
    },
    
    setIconUrl: function(v) {
        if (this.iconUrl !== v) {
            this.iconUrl = v;
            if (this.inited) {
                this.fireNewEvent('iconUrl', v);
                this.iconView.setImageUrl(v);
            }
        }
    },
    
    setIconY: function(v) {
        if (this.iconY !== v) {
            this.iconY = v;
            if (this.inited) {
                this.fireNewEvent('iconY', v);
                if (typeof v === 'string') {
                    this.iconView.setValign(v);
                } else {
                   this.iconView.setY(v);
                }
            }
        }
    },
    
    setIconSpacing: function(v) {
        if (this.iconSpacing !== v) {
            this.iconSpacing = v;
            if (this.inited) this.fireNewEvent('iconSpacing', v);
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
    /** @private */
    __updateContentPosition: function(v) {
        if (this.__updateContentPositionLoopBlock || this.destroyed) return;
        
        var inset = this.inset,
            outset = this.outset,
            iconView = this.iconView,
            textView = this.textView,
            textViewVisible = textView.visible && this.text,
            iconWidth = iconView.visible ? iconView.width : 0,
            iconExtent = iconWidth + (textViewVisible && iconWidth > 0 ? this.iconSpacing : 0),
            textWidth = textViewVisible ? textView.width : 0;
        
        if (this.shrinkToFit) {
            var totalWidth = inset;
            iconView.setX(totalWidth);
            totalWidth += iconExtent;
            textView.setX(totalWidth);
            totalWidth += textWidth + outset;
            
            this.__updateContentPositionLoopBlock = true;
            this.setWidth(totalWidth);
            this.__updateContentPositionLoopBlock = false;
        } else {
            var leftPos;
            if (this.contentAlign === 'left') {
                leftPos = inset;
            } else if (this.contentAlign === 'center') {
                var extraWidth = this.width - inset - iconExtent - textWidth - outset;
                leftPos = inset + (extraWidth / 2);
            } else {
                leftPos = this.width - iconExtent - textWidth - outset;
            }
            
            iconView.setX(leftPos);
            textView.setX(leftPos + iconExtent);
        }
    }
});

/** A mixin that adds an icon and text to the inside of a button.
    
    Attributes:
        __updateContentPositionLoopBlock:boolean Used in __updateContentPosition
            and __updateContentPositionAfterDelay to prevent infinite loops.
        text:string the text to display on the button.
        iconUrl:string the url to an image to display in the button.
        inset:number the left padding before the icon. Defaults to 0.
        outset:number the right padding after the text/icon. Defaults to 0.
        textY:number the y offset for the text.
        iconY:number the y offset for the icon.
        iconSpacing:number spacing between the icon and the text. Defaults
            to 2.
        shrinkToFit:boolean when true the button will be as narrow as possible
            to fit the text, icon, inset and outset. When false the button 
            will be as wide as the set width. Defaults to false.
        contentAlign: determines how the icon and text will be positioned when
            not in shrinkToFit mode. Allowed values are: 'left', 'center' and
            'right'. Defaults to 'center'.
        textView:myt.Text a reference to the child text view.
        iconView:myt.Image a reference to the child image view.
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
    },
    
    doBeforeAdoption: function() {
        this.callSuper();
        
        var attrs = {name:'iconView', imageUrl:this.iconUrl}
        var iconY = this.iconY;
        if (typeof iconY === 'string') {
            attrs.valign = iconY;
        } else {
            attrs.y = iconY;
        }
        new myt.Image(this, attrs);
    },
    
    doAfterAdoption: function() {
        // Setup the constraint after adoption since the textView won't have
        // been sized to the dom until it's added in.
        var attrs = {
            name:'textView', whiteSpace:'nowrap', text:this.text, domClass:'mytButtonText'
        };
        var textY = this.textY;
        if (typeof textY === 'string') {
            attrs.valign = textY;
        } else {
            attrs.y = textY;
        }
        var textView = new myt.Text(this, attrs);
        
        var iconView = this.iconView;
        this.applyConstraint('__updateContentPosition', [
            this, 'inset', this, 'outset',
            this, 'width', this, 'shrinkToFit', this, 'iconSpacing',
            this, 'contentAlign',
            iconView, 'width', iconView, 'visible',
            textView, 'visible', textView, 'width'
        ]);
        
        this.callSuper();
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
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
        if (this.inited) this.fireNewEvent('shrinkToFit', v);
    },
    
    setContentAlign: function(v) {
        if (this.contentAlign === v) return;
        this.contentAlign = v;
        if (this.inited) this.fireNewEvent('contentAlign', v);
    },
    
    /** The url for the iconView's image. */
    setIconUrl: function(v) {
        if (this.iconUrl === v) return;
        this.iconUrl = v;
        if (this.inited) {
            this.fireNewEvent('iconUrl', v);
            this.iconView.setImageUrl(v);
        }
    },
    
    /** For fine tuning the y-position of the iconView. */
    setIconY: function(v) {
        if (this.iconY === v) return;
        this.iconY = v;
        if (this.inited) {
            this.fireNewEvent('iconY', v);
            if (typeof v === 'string') {
                this.iconView.setValign(v);
            } else {
               this.iconView.setY(v);
            }
        }
    },
    
    /** Spacing between the iconView and the textView. */
    setIconSpacing: function(v) {
        if (this.iconSpacing === v) return;
        this.iconSpacing = v;
        if (this.inited) this.fireNewEvent('iconSpacing', v);
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
    /** Use a timeout to greatly reduce the number of spurious updates during
        initialization. */
    __updateContentPosition: function(v) {
        if (this.__updateContentPositionLoopBlock) return;
        if (this.__updateContentPositionTimerId) return;
        
        var self = this;
        this.__updateContentPositionTimerId = setTimeout(function() {
            self.__updateContentPositionAfterDelay();
        }, 40);
    },
    
    __updateContentPositionAfterDelay: function() {
        if (this.destroyed) return;
        
        this.__updateContentPositionTimerId = undefined;
        
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
            
            this.updateUI();
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

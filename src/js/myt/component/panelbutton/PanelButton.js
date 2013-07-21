/** An myt.BasePanelButton with contents that consist of an icon and text.
    
    Attributes:
        __updateContentPositionLoopBlock:boolean Used in __updateContentPosition
            and __updateContentPositionAfterDelay to prevent infinite loops.
        text:string the text to display on the button.
        iconUrl:string the url to an image to display in the button.
        textY:number the y offset for the text.
        iconY:number the y offset for the icon.
        iconSpacing:number spacing between the icon and the text. Defaults
            to 2.
        shrinkToFit:boolean when true the button will be as narrow as possible
            to fit the text, icon and panel end caps. When false the button 
            will be as wide as the set width. Defaults to false.
        textView:myt.Text a reference to the child text view.
        iconView:myt.Image a reference to the child image view.
*/
myt.PanelButton = new JS.Class('PanelButton', myt.BasePanelButton, {
    include: [myt.TooltipMixin],
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    initNode: function(parent, attrs) {
        this.textY = this.iconY = 'middle';
        this.iconSpacing = 2;
        
        if (attrs.shrinkToFit === undefined) attrs.shrinkToFit = false;
        
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
        this.callSuper();
        
        // Setup the constraint after adoption since the textView won't have
        // been sized to the dom until it's added in.
        var attrs = {
            name:'textView', whiteSpace:'nowrap', text:this.text, 
            fontSize:'12px', fontWeight:'bold'
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
            this.first, 'width', this.third, 'width',
            this, 'width', this, 'shrinkToFit', this, 'iconSpacing',
            iconView, 'width', iconView, 'visible',
            textView, 'visible', textView, 'width'
        ]);
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
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
        
        var firstWidth = this.first.width,
            thirdWidth = this.third.width,
            iconView = this.iconView,
            textView = this.textView,
            textViewVisible = textView.visible && this.text,
            iconWidth = iconView.visible ? iconView.width : 0,
            iconExtent = iconWidth + (textViewVisible && iconWidth > 0 ? this.iconSpacing : 0),
            textWidth = textViewVisible ? textView.width : 0;
        
        if (this.shrinkToFit) {
            var totalWidth = firstWidth;
            iconView.setX(totalWidth);
            totalWidth += iconExtent;
            textView.setX(totalWidth);
            totalWidth += textWidth + thirdWidth;
            
            this.__updateContentPositionLoopBlock = true;
            this.setWidth(totalWidth);
            this.__updateContentPositionLoopBlock = false;
        } else {
            var extraWidth = this.width - firstWidth - iconExtent - textWidth - thirdWidth;
            var leftPos = firstWidth + (extraWidth / 2);
            
            iconView.setX(leftPos);
            textView.setX(leftPos + iconExtent);
        }
    }
});

((pkg) => {
    const defAttr = pkg.AccessorSupport.defAttr;
    
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
        
        @class */
    pkg.IconTextButtonContent = new JS.Module('IconTextButtonContent', {
        // Life Cycle //////////////////////////////////////////////////////////
        initNode: function(parent, attrs) {
            const self = this;
            let iconView,
                textView;
            
            self.textY = self.iconY = 'middle';
            self.iconSpacing = 2;
            self.inset = self.outset = 0;
            
            defAttr(attrs, 'shrinkToFit', false);
            defAttr(attrs, 'contentAlign', 'center');
            
            self.callSuper(parent, attrs);
            
            // Setup the constraint after inited since the textView won't have
            // been sized to the dom until it's added in.
            iconView = self.iconView;
            textView = self.textView;
            self.constrain('__updateContentPosition', [
                self, 'inset', self, 'outset',
                self, 'width', self, 'shrinkToFit', self, 'iconSpacing',
                self, 'contentAlign',
                iconView, 'width', iconView, 'visible',
                textView, 'width', textView, 'visible'
            ]);
        },
        
        doAfterAdoption: function() {
            const self = this,
                iconY = self.iconY,
                textY = self.textY;
            let attrs = {
                    name:'iconView',
                    imageUrl:self.iconUrl
                };
            
            // Setup iconView
            if (typeof iconY === 'string') {
                attrs.valign = iconY;
            } else {
                attrs.y = iconY;
            }
            new pkg.Image(self, attrs);
            
            // Setup textView
            attrs = {
                name:'textView',
                whiteSpace:'nowrap',
                text:self.text, 
                domClass:'myt-Text mytButtonText'
            };
            if (typeof textY === 'string') {
                attrs.valign = textY;
            } else {
                attrs.y = textY;
            }
            new pkg.Text(self, attrs);
            
            self.callSuper();
        },
        
        
        // Accessors ///////////////////////////////////////////////////////////
        setInset: function(v) {
            this.set('inset', this.valueFromEvent(v), true);
        },
        
        setOutset: function(v) {
            this.set('outset', this.valueFromEvent(v), true);
        },
        
        setText: function(v) {
            if (this.text !== v) {
                this.text = v;
                if (this.inited) {
                    this.textView.setText(v);
                    this.fireEvent('text', v);
                }
            }
        },
        
        setShrinkToFit: function(v) {this.set('shrinkToFit', v, true);},
        setContentAlign: function(v) {this.set('contentAlign', v, true);},
        setIconSpacing: function(v) {this.set('iconSpacing', v, true);},
        
        setIconUrl: function(v) {
            if (this.iconUrl !== v) {
                this.iconUrl = v;
                if (this.inited) {
                    this.fireEvent('iconUrl', v);
                    this.iconView.setImageUrl(v);
                }
            }
        },
        
        setIconY: function(v) {
            const self = this,
                iconView = self.iconView;
            if (self.iconY !== v) {
                self.iconY = v;
                if (self.inited) {
                    self.fireEvent('iconY', v);
                    if (typeof v === 'string') {
                        iconView.setValign(v);
                    } else {
                        iconView.setY(v);
                    }
                }
            }
        },
        
        setTextY: function(v) {
            const self = this,
                textView = self.textView;
            if (self.textY !== v) {
                self.textY = v;
                if (self.inited) {
                    self.fireEvent('textY', v);
                    if (typeof v === 'string') {
                        textView.setValign(v);
                    } else {
                        textView.setValign('');
                        textView.setY(v);
                    }
                }
            }
        },
        
        
        // Methods /////////////////////////////////////////////////////////////
        /** @private */
        __updateContentPosition: function(v) {
            const self = this;
            
            if (self.__updateContentPositionLoopBlock || self.destroyed) return;
            
            const inset = self.inset,
                outset = self.outset,
                iconView = self.iconView,
                textView = self.textView,
                textViewVisible = textView.visible && self.text,
                iconWidth = iconView.visible ? iconView.width : 0,
                iconExtent = iconWidth + (textViewVisible && iconWidth > 0 ? self.iconSpacing : 0),
                textWidth = textViewVisible ? textView.width : 0;
            let totalWidth,
                leftPos,
                extraWidth;
            
            if (self.shrinkToFit) {
                totalWidth = inset;
                iconView.setX(totalWidth);
                totalWidth += iconExtent;
                textView.setX(totalWidth);
                totalWidth += textWidth + outset;
                
                self.__updateContentPositionLoopBlock = true;
                self.setWidth(totalWidth);
                self.__updateContentPositionLoopBlock = false;
            } else {
                if (self.contentAlign === 'left') {
                    leftPos = inset;
                } else if (self.contentAlign === 'center') {
                    extraWidth = self.width - inset - iconExtent - textWidth - outset;
                    leftPos = inset + (extraWidth / 2);
                } else {
                    leftPos = self.width - iconExtent - textWidth - outset;
                }
                
                iconView.setX(leftPos);
                textView.setX(leftPos + iconExtent);
            }
        }
    });
    
    /** An myt.PanelButton with contents that consist of an icon and text. */
    pkg.IconTextPanelButton = new JS.Class('IconTextPanelButton', pkg.PanelButton, {
        include: [pkg.IconTextButtonContent],
        
        
        // Life Cycle //////////////////////////////////////////////////////////
        doAfterAdoption: function() {
            this.syncTo(this.first, 'setInset', 'width');
            this.syncTo(this.third, 'setOutset', 'width');
            
            this.callSuper();
        }
    });
})(myt);

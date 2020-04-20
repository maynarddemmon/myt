((pkg) => {
    var JSClass = JS.Class,
        JSModule = JS.Module,
        defaultDisabledOpacity = 0.5,
        defaultFocusShadowPropertyValue = [0, 0, 7, '#666666'],
        
        /** Provides button functionality to an myt.View. Most of the functionality 
            comes from the mixins included by this mixin. This mixin resolves issues 
            that arise when the various mixins are used together.
            
            By default myt.Button instances are focusable.
            
            Events:
                None
            
            Attributes:
                None
            
            Private Attributes:
                __restoreCursor:string The cursor to restore to when the button is
                    no longer disabled.
        */
        Button = pkg.Button = new JSModule('Button', {
            include: [
                pkg.Activateable, 
                pkg.UpdateableUI, 
                pkg.Disableable, 
                pkg.MouseOverAndDown, 
                pkg.KeyActivation
            ],
            
            
            // Class Methods and Attributes ////////////////////////////////////
            extend: {
                DEFAULT_FOCUS_SHADOW_PROPERTY_VALUE: defaultFocusShadowPropertyValue,
                DEFAULT_DISABLED_OPACITY: defaultDisabledOpacity
            },
            
            
            // Life Cycle //////////////////////////////////////////////////////
            /** @overrides */
            initNode: function(parent, attrs) {
                if (attrs.focusable == null) attrs.focusable = true;
                if (attrs.cursor == null) attrs.cursor = 'pointer';
                
                this.callSuper(parent, attrs);
            },
            
            
            // Accessors ///////////////////////////////////////////////////////
            /** @overrides myt.FocusObservable */
            setFocused: function(v) {
                var self = this,
                    existing = self.focused;
                self.callSuper(v);
                if (self.inited && self.focused !== existing) self.updateUI();
            },
            
            
            // Methods /////////////////////////////////////////////////////////
            /** @overrides myt.KeyActivation. */
            doActivationKeyDown: function(key, isRepeat) {
                // Prevent unnecessary UI updates when the activation key is repeating.
                if (!isRepeat) this.updateUI();
            },
            
            /** @overrides myt.KeyActivation. */
            doActivationKeyUp: function(key) {
                this.callSuper(key);
                this.updateUI();
            },
            
            /** @overrides myt.KeyActivation. */
            doActivationKeyAborted: function(key) {
                this.callSuper(key);
                this.updateUI();
            },
            
            /** @overrides myt.UpdateableUI. */
            updateUI: function() {
                var self = this;
                
                if (self.disabled) {
                    // Remember the cursor to change back to, but don't re-remember
                    // if we're already remembering one.
                    if (self.__restoreCursor == null) self.__restoreCursor = self.cursor;
                    self.setCursor('not-allowed');
                    self.drawDisabledState();
                } else {
                    var rc = self.__restoreCursor;
                    if (rc) {
                        self.setCursor(rc);
                        self.__restoreCursor = null;
                    }
                    
                    if (self.activateKeyDown !== -1 || self.mouseDown) {
                        self.drawActiveState();
                    } else if (self.focused) {
                        self.drawFocusedState();
                    } else if (self.mouseOver) {
                        self.drawHoverState();
                    } else {
                        self.drawReadyState();
                    }
                }
            },
            
            /** Draw the UI when the component has focus. The default implementation
                calls drawHoverState.
                @returns void */
            drawFocusedState: function() {
                this.drawHoverState();
            },
            
            /** Draw the UI when the component is on the verge of being interacted 
                with. For mouse interactions this corresponds to the over state.
                @returns void */
            drawHoverState: () => {
                // Subclasses to implement as needed.
            },
            
            /** Draw the UI when the component has a pending activation. For mouse
                interactions this corresponds to the down state.
                @returns void */
            drawActiveState: () => {
                // Subclasses to implement as needed.
            },
            
            /** Draw the UI when the component is ready to be interacted with. For
                mouse interactions this corresponds to the enabled state when the
                mouse is not over the component.
                @returns void */
            drawReadyState: () => {
                // Subclasses to implement as needed.
            },
            
            /** Draw the UI when the component is in the disabled state.
                @returns void */
            drawDisabledState: () => {
                // Subclasses to implement as needed.
            },
            
            /** @overrides myt.FocusObservable */
            showFocusEmbellishment: function() {
                this.hideDefaultFocusEmbellishment();
                this.setBoxShadow(defaultFocusShadowPropertyValue);
            },
            
            /** @overrides myt.FocusObservable */
            hideFocusEmbellishment: function() {
                this.hideDefaultFocusEmbellishment();
                this.setBoxShadow();
            }
        }),
        
        /** A mixin that provides activeColor, hoverColor and readyColor
            attributes to fill the view.
            
            Events:
                None
            
            Attributes:
                activeColor:string A color string such as '#ff0000' or 'transparent'.
                    Used when the button is in the active state.
                hoverColor:string A color string such as '#ff0000' or 'transparent'.
                    Used when the button is in the hover state.
                readyColor:string A color string such as '#ff0000' or 'transparent'.
                    Used when the button is in the ready or disabled state.
        */
        SimpleButtonStyle = pkg.SimpleButtonStyle = new JSModule('SimpleButtonStyle', {
            include: [Button],
            
            
            // Accessors ///////////////////////////////////////////////////////
            setActiveColor: function(v) {
                if (this.activeColor !== v) {
                    this.activeColor = v;
                    // No event needed
                    if (this.inited) this.updateUI();
                }
            },
            
            setHoverColor: function(v) {
                if (this.hoverColor !== v) {
                    this.hoverColor = v;
                    // No event needed
                    if (this.inited) this.updateUI();
                }
            },
            
            setReadyColor: function(v) {
                if (this.readyColor !== v) {
                    this.readyColor = v;
                    // No event needed
                    if (this.inited) this.updateUI();
                }
            },
            
            
            // Methods /////////////////////////////////////////////////////////
            /** @overrides myt.Button */
            drawDisabledState: function() {
                this.setOpacity(defaultDisabledOpacity);
                this.setBgColor(this.readyColor);
            },
            
            /** @overrides myt.Button */
            drawHoverState: function() {
                this.setOpacity(1);
                this.setBgColor(this.hoverColor);
            },
            
            /** @overrides myt.Button */
            drawActiveState: function() {
                this.setOpacity(1);
                this.setBgColor(this.activeColor);
            },
            
            /** @overrides myt.Button */
            drawReadyState: function() {
                this.setOpacity(1);
                this.setBgColor(this.readyColor);
            }
        }),
        
        /** An myt.Button that makes use of activeColor, hoverColor and readyColor
            attributes to fill the button. */
        SimpleButton = pkg.SimpleButton = new JSClass('SimpleButton', pkg.View, {
            include: [SimpleButtonStyle],
            
            // Life Cycle //////////////////////////////////////////////////////
            initNode: function(parent, attrs) {
                this.activeColor = this.hoverColor = this.readyColor = 'transparent';
                
                this.callSuper(parent, attrs);
            }
        });
    
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
    pkg.IconTextButtonContent = new JSModule('IconTextButtonContent', {
        // Life Cycle //////////////////////////////////////////////////////////
        initNode: function(parent, attrs) {
            var self = this,
                iconView,
                textView;
            
            self.textY = self.iconY = 'middle';
            self.iconSpacing = 2;
            self.inset = self.outset = 0;
            
            if (attrs.shrinkToFit == null) attrs.shrinkToFit = false;
            if (attrs.contentAlign == null) attrs.contentAlign = 'center';
            
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
            var self = this,
                iconY = self.iconY,
                textY = self.textY,
                attrs = {
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
            // Adapt to event from syncTo
            if (v != null && typeof v === 'object') v = v.value;
            this.set('inset', v, true);
        },
        
        setOutset: function(v) {
            // Adapt to event from syncTo
            if (v != null && typeof v === 'object') v = v.value;
            this.set('outset', v, true);
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
            var self = this,
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
            var self = this,
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
            var self = this;
            
            if (self.__updateContentPositionLoopBlock || self.destroyed) return;
            
            var inset = self.inset,
                outset = self.outset,
                iconView = self.iconView,
                textView = self.textView,
                textViewVisible = textView.visible && self.text,
                iconWidth = iconView.visible ? iconView.width : 0,
                iconExtent = iconWidth + (textViewVisible && iconWidth > 0 ? self.iconSpacing : 0),
                textWidth = textViewVisible ? textView.width : 0,
                totalWidth,
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
    pkg.TextButtonContent = new JSModule('TextButtonContent', {
        // Life Cycle //////////////////////////////////////////////////////////
        initNode: function(parent, attrs) {
            var self = this,
                textView;
            
            self.inset = self.outset = 0;
            
            if (attrs.shrinkToFit == null) attrs.shrinkToFit = false;
            
            // Use appropriate default based on mutliline text or not.
            self.textY = attrs.shrinkToFit ? 'middle' : 0;
            
            self.callSuper(parent, attrs);
            
            // Setup the constraint after adoption since the textView won't have
            // been sized to the dom until it's added in.
            textView = self.textView;
            self.constrain('__updateContentPosition', [
                self, 'inset', self, 'outset',
                self, 'width', self, 'shrinkToFit',
                textView, 'visible', textView, 'width',
                textView, 'height', textView, 'y'
            ]);
        },
        
        doAfterAdoption: function() {
            var self = this,
                textY = self.textY, 
                attrs = {
                    name:'textView', 
                    whiteSpace: self.shrinkToFit ? 'nowrap' : 'normal', 
                    text:self.text,
                    domClass:'myt-Text mytButtonText'
                };
            if (typeof textY === 'string') {
                attrs.valign = textY;
            } else {
                attrs.y = textY;
            }
            new pkg.Text(self, attrs);
            
            // Record original height
            self.__origHeight = self.height;
            
            self.callSuper();
        },
        
        
        // Accessors ///////////////////////////////////////////////////////////
        setInset: function(v) {
            // Adapt to event from syncTo
            if (v != null && typeof v === 'object') v = v.value;
            this.set('inset', v, true);
        },
        
        setOutset: function(v) {
            // Adapt to event from syncTo
            if (v != null && typeof v === 'object') v = v.value;
            this.set('outset', v, true);
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
        
        setShrinkToFit: function(v) {
            var self = this,
                textView = self.textView;
            if (self.shrinkToFit !== v) {
                self.shrinkToFit = v;
                if (self.inited) {
                    if (textView) textView.setWhiteSpace(v ? 'nowrap' : 'normal');
                    self.fireEvent('shrinkToFit', v);
                }
            }
        },
        
        setTextY: function(v) {
            var self = this,
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
        __updateContentPosition: function(v) {
            var self = this;
            
            if (self.__updateContentPositionLoopBlock || self.destroyed) return;
            
            var inset = self.inset, 
                outset = self.outset, 
                textView = self.textView,
                textViewVisible = textView.visible && self.text;
            
            self.__updateContentPositionLoopBlock = true;
            if (self.shrinkToFit) {
                textView.setX(inset);
                self.setWidth(inset + (textViewVisible ? textView.width : 0) + outset);
                self.setHeight(self.__origHeight);
            } else {
                textView.setHeight('auto');
                textView.setWidth(self.width - inset - outset);
                textView.setX(inset);
                self.setHeight(textViewVisible ? textView.y + textView.height : self.__origHeight);
            }
            self.__updateContentPositionLoopBlock = false;
        }
    });
    
    /** A simple button with support for an icon, text and a tooltip. */
    pkg.SimpleIconTextButton = new JSClass('SimpleIconTextButton', SimpleButton, {
        include: [pkg.IconTextButtonContent]
    });
    
    /** A simple button with support for text and a tooltip. */
    pkg.SimpleTextButton = new JSClass('SimpleTextButton', SimpleButton, {
        include: [pkg.TextButtonContent]
    });
})(myt);

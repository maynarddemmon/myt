(pkg => {
    const {Class:JSClass, Module:JSModule} = JS,
        
        {NOOP, View, KeyActivation, theme:THEME} = pkg,
        
        /** Provides button functionality to an myt.View. Most of the functionality comes from the 
            mixins included by this mixin. This mixin resolves issues that arise when the various 
            mixins are used together.
            
            By default myt.Button instances are focusable.
            
            Private Attributes:
                __restoreCursor:string The cursor to restore to when the button is no 
                    longer disabled.
            
            @class */
        Button = pkg.Button = new JSModule('Button', {
            include: [
                pkg.Activateable, 
                pkg.UpdateableUI, 
                pkg.Disableable, 
                pkg.MouseOverAndDown, 
                KeyActivation
            ],
            
            
            // Life Cycle //////////////////////////////////////////////////////
            /** @overrides */
            initNode: function(parent, attrs) {
                attrs.focusable ??= true;
                attrs.cursor ??= 'pointer';
                
                this.callSuper(parent, attrs);
            },
            
            
            // Accessors ///////////////////////////////////////////////////////
            /** @overrides myt.FocusObservable */
            setFocused: function(v) {
                const self = this,
                    existing = self.focused;
                self.callSuper(v);
                if (self.inited && self.focused !== existing) self.updateUI();
            },
            
            
            // Methods /////////////////////////////////////////////////////////
            /** @overrides myt.KeyActivation. */
            doActivationKeyDown: function(code, isRepeat) {
                // Prevent unnecessary UI updates when the activation key is repeating.
                if (!isRepeat) this.updateUI();
            },
            
            /** @overrides myt.KeyActivation. */
            doActivationKeyUp: function(code) {
                this.callSuper(code);
                this.updateUI();
            },
            
            /** @overrides myt.KeyActivation. */
            doActivationKeyAborted: function(code) {
                this.callSuper(code);
                this.updateUI();
            },
            
            /** @overrides myt.UpdateableUI. */
            updateUI: function() {
                const self = this;
                
                if (self.disabled) {
                    // Remember the cursor to change back to, but don't re-remember if we're 
                    // already remembering one.
                    self.__restoreCursor ??= self.cursor;
                    self.setCursor('not-allowed');
                    self.drawDisabledState();
                } else {
                    const rc = self.__restoreCursor;
                    if (rc) {
                        self.setCursor(rc);
                        self.__restoreCursor = null;
                    }
                    
                    if (self.activateKeyDown !== KeyActivation.NO_KEY_DOWN || self.mouseDown) {
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
                @returns {void} */
            drawFocusedState: function() {
                this.drawHoverState();
            },
            
            /** Draw the UI when the component is on the verge of being interacted with. For mouse 
                interactions this corresponds to the over state.
                @returns {void} */
            drawHoverState: NOOP, // () => {/* Subclasses to implement as needed. */},
            
            /** Draw the UI when the component has a pending activation. For mouse interactions 
                this corresponds to the down state.
                @returns {void} */
            drawActiveState: NOOP, // () => {/* Subclasses to implement as needed. */},
            
            /** Draw the UI when the component is ready to be interacted with. For mouse 
                interactions this corresponds to the enabled state when the mouse is not over 
                the component.
                @returns {void} */
            drawReadyState: NOOP, // () => {/* Subclasses to implement as needed. */},
            
            /** Draw the UI when the component is in the disabled state.
                @returns {void} */
            drawDisabledState: NOOP, // () => {/* Subclasses to implement as needed. */},
            
            /** @overrides myt.FocusObservable */
            showFocusIndicator: function() {
                this.hideDefaultFocusIndicator();
            },
            
            /** @overrides myt.FocusObservable */
            hideFocusIndicator: function() {
                this.hideDefaultFocusIndicator();
            }
        }),
        
        /** A mixin that provides activeColor, hoverColor and readyColor attributes to fill 
            the view.
            
            Attributes:
                activeColor:string A color string such as '#ff0000' or 'transparent'. Used when the 
                    button is in the active state.
                hoverColor:string A color string such as '#ff0000' or 'transparent'. Used when the 
                    button is in the hover state.
                readyColor:string A color string such as '#ff0000' or 'transparent'. Used when the 
                    button is in the ready or disabled state.
            
            @class */
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
                this.draw(this.readyColor, THEME.disabledOpacity);
            },
            
            /** @overrides myt.Button */
            drawHoverState: function() {
                this.draw(this.hoverColor);
            },
            
            /** @overrides myt.Button */
            drawActiveState: function() {
                this.draw(this.activeColor);
            },
            
            /** @overrides myt.Button */
            drawReadyState: function() {
                this.draw(this.readyColor);
            },
            
            draw: function(color, opacity=1) {
                this.setOpacity(opacity);
                this.setBgColor(color);
            }
        }),
        
        /** An myt.Button that makes use of activeColor, hoverColor and readyColor attributes to 
            fill the button.
            
            @class */
        SimpleButton = pkg.SimpleButton = new JSClass('SimpleButton', View, {
            include: [SimpleButtonStyle],
            
            // Life Cycle //////////////////////////////////////////////////////
            initNode: function(parent, attrs) {
                this.activeColor = this.hoverColor = this.readyColor = 'transparent';
                
                this.callSuper(parent, attrs);
            }
        });
    
    /** A simple button with support for text and a tooltip. Adds a text element to the inside of 
        the button.
        
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
            shrinkToFit:boolean When true the button will be as narrow as possible to fit the text, 
                inset and outset. When false the button will be as wide as the set width. Defaults 
                to false.
            textY:number|string The y offset for the text. If a string it must be a valign 
                value: 'top', 'middle' or 'bottom'.
            textView:myt.Text A reference to the child text view.
        
        Private Attributes:
            __updateContentLoopBlock:boolean Used in __updateContent to prevent infinite loops.
        
        @class */
    pkg.SimpleTextButton = new JSClass('SimpleTextButton', SimpleButton, {
        // Life Cycle //////////////////////////////////////////////////////////
        initNode: function(parent, attrs) {
            const self = this;
            
            self.inset = self.outset = 0;
            
            attrs.shrinkToFit ??= false;
            attrs.height ??= 24;
            attrs.textY ??= 'middle';
            
            self.callSuper(parent, attrs);
            
            // Build UI
            const textY = self.textY,
                textAttrs = {
                    whiteSpace: self.shrinkToFit ? 'nowrap' : 'normal', 
                    text:self.text,
                    domClass:'myt-Text mytButtonText'
                };
            if (typeof textY === 'string') {
                textAttrs.valign = textY;
            } else {
                textAttrs.y = textY;
            }
            const textView = self.textView = new pkg.Text(self, textAttrs);
            
            // Setup the constraint after adoption since the textView won't have been sized to the 
            // dom until it's added in.
            self.constrain('__updateContent', [
                self, 'inset', self, 'outset',
                self, 'width', self, 'shrinkToFit',
                textView, 'visible', textView, 'width',
                textView, 'height', textView, 'y'
            ]);
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
        
        setShrinkToFit: function(v) {
            const self = this;
            if (self.shrinkToFit !== v) {
                self.shrinkToFit = v;
                if (self.inited) {
                    self.textView.setWhiteSpace(v ? 'nowrap' : 'normal');
                    self.fireEvent('shrinkToFit', v);
                }
            }
        },
        
        setTextY: function(v) {
            const self = this;
            if (self.textY !== v) {
                self.textY = v;
                if (self.inited) {
                    const textView = self.textView;
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
        __updateContent: function(_v) {
            const self = this;
            if (!self.__updateContentLoopBlock && !self.destroyed) {
                const {inset, outset, textView} = self;
                self.__updateContentLoopBlock = true;
                textView.setX(inset);
                if (self.shrinkToFit) {
                    self.setWidth(inset + (textView.visible && self.text ? textView.width : 0) + outset);
                } else {
                    textView.setWidth(self.width - inset - outset);
                }
                self.__updateContentLoopBlock = false;
            }
        }
    });
    
    /** A minimalist button that uses a single View with TextSupport.
        
        @class */
    pkg.TextButton = new JSClass('TextButton', pkg.PaddedText, {
        include: [SimpleButtonStyle],
        
        // Life Cycle //////////////////////////////////////////////////////////
        initNode: function(parent, attrs) {
            attrs.focusIndicator ??= false;
            attrs.roundedCorners ??= 3;
            attrs.textAlign ??= 'center';
            attrs.paddingTop ??= 1;
            attrs.height ??= 23 - (attrs.paddingTop ?? 0);
            attrs.activeColor ??= THEME.TextButtonActive;
            attrs.hoverColor ??= THEME.TextButtonHover;
            attrs.readyColor ??= THEME.TextButtonReady;
            
            this.callSuper(parent, attrs);
        }
    });
})(myt);

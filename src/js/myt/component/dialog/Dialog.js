((pkg) => {
    const JSClass = JS.Class,
        View = pkg.View,
        Text = pkg.Text,
        ModalPanel = pkg.ModalPanel,
        SizeToChildren = pkg.SizeToChildren,
        
        
        /* Hide spinner related elements. */
        hideSpinner = (dialog) => {
            if (dialog.spinner) {
                dialog.spinner.setVisible(false);
                dialog.spinner = undefined;
            }
        },
        
        /* The class used as the DEFAULT_BUTTON_CLASS in myt.Dialog. */
        DialogButton = new JSClass('DialogButton', pkg.SimpleButton, {
            // Life Cycle //////////////////////////////////////////////////////
            /** @overrides */
            initNode: function(parent, attrs) {
                if (attrs.height == null) attrs.height = 20;
                if (attrs.shrinkToFit == null) attrs.shrinkToFit = true;
                if (attrs.inset == null) attrs.inset = 10;
                if (attrs.outset == null) attrs.outset = 10;
                if (attrs.textY == null) attrs.textY = 3;
                if (attrs.roundedCorners == null) attrs.roundedCorners = 5;
                
                if (attrs.activeColor == null) attrs.activeColor = '#bbbbbb';
                if (attrs.hoverColor == null) attrs.hoverColor = '#dddddd';
                if (attrs.readyColor == null) attrs.readyColor = '#cccccc';
                if (attrs.textColor == null) attrs.textColor = '#000000';
                
                const fontSize = attrs.fontSize,
                    shrinkToFit = attrs.shrinkToFit,
                    text = attrs.text || '';
                delete attrs.fontSize;
                delete attrs.shrinkToFit;
                delete attrs.text;
                
                this.callSuper(parent, attrs);
                
                const textView = this.textView = new Text(this, {
                    x:this.inset, 
                    y:this.textY, 
                    text:text,
                    fontSize:fontSize,
                    whiteSpace:'nowrap',
                    domClass:'myt-Text mytButtonText'
                });
                if (shrinkToFit) this.constrain('__update', [this, 'inset', this, 'outset', textView, 'width']);
            },
            
            
            // Accessors ///////////////////////////////////////////////////////
            setText: function(v) {
                if (this.inited) this.textView.setText(v);
            },
            
            setTooltip: function(v) {
                this.getInnerDomElement().title = v;
            },
            
            
            // Methods /////////////////////////////////////////////////////////
            /** @private */
            __update: function(v) {
                if (!this.destroyed) {
                    const inset = this.inset,
                        textView = this.textView;
                    textView.setX(inset);
                    this.setWidth(inset + textView.width + this.outset);
                }
            }
        }),
    
        /** A modal panel that contains a Dialog.
            
            Attributes:
                displayMode:string (read only) Indicates what kind of dialog this 
                    component is currently configured as. Allowed values are: 'blank',
                    'message', 'spinner', 'color_picker', 'date_picker' and 'confirm'.
                callbackFunction:function (read only) A function that gets called when 
                    the dialog is about to be closed. A single argument is passed in 
                    that indicates the UI element interacted with that should close the 
                    dialog. Supported values are: 'closeBtn', 'cancelBtn' and 
                    'confirmBtn'. The function should return true if the close should 
                    be aborted.
            
            @class */
        Dialog = pkg.Dialog = new JSClass('Dialog', ModalPanel, {
            // Class Methods and Attributes ////////////////////////////////////
            extend: {
                DEFAULT_RADIUS: 12,
                DEFAULT_SHADOW: [0, 4, 20, '#666666'],
                DEFAULT_BORDER: [1, 'solid', '#ffffff'],
                DEFAULT_BGCOLOR: '#ffffff',
                DEFAULT_BUTTON_CLASS: DialogButton,
                
                /** Makes the text wrap at 200px and the dialog will be at
                    least 200px wide. */
                WRAP_TEXT_DEFAULTS: {
                    width:200,
                    fontWeight:'bold',
                    whiteSpace:'normal',
                    wordWrap:'break-word'
                },
                
                /** Makes the text stay on a single line and the dialog sizes 
                    to fit. */
                NO_WRAP_TEXT_DEFAULTS: {
                    width:'auto',
                    fontWeight:'bold',
                    whiteSpace:'nowrap',
                    wordWrap:'break-word'
                },
                
                /** Defaults used in a confirm dialog. */
                CONFIRM_DEFAULTS: {
                    cancelTxt:'Cancel',
                    confirmTxt:'Confirm',
                    maxContainerHeight:300,
                    showClose:false
                },
                
                /** Defaults used in a color picker dialog. */
                PICKER_DEFAULTS: {
                    cancelTxt:'Cancel',
                    confirmTxt:'Choose',
                    titleText:'Choose a Color',
                    color:'#000000'
                },
                
                /** Defaults used in a date picker dialog. */
                DATE_PICKER_DEFAULTS: {
                    cancelTxt:'Cancel',
                    confirmTxt:'Choose',
                    titleText:'Choose a Date',
                    timeOnlyTitleText:'Choose a Time',
                    color:'#000000'
                }
            },
            
            
            // Life Cycle //////////////////////////////////////////////////////
            /** @overrides */
            initNode: function(parent, attrs) {
                if (attrs.buttonClass == null) attrs.buttonClass = Dialog.DEFAULT_BUTTON_CLASS;
                
                this.callSuper(parent, attrs);
                
                const content = this.content;
                content.setRoundedCorners(Dialog.DEFAULT_RADIUS);
                content.setBgColor(Dialog.DEFAULT_BGCOLOR);
                content.setBoxShadow(Dialog.DEFAULT_SHADOW);
                content.setBorder(Dialog.DEFAULT_BORDER);
                content.setFocusCage(true);
                
                this.createCloseButton(content, this);
            },
            
            
            // Accessors ///////////////////////////////////////////////////////
            setButtonClass: function(v) {this.buttonClass = v;},
            setDisplayMode: function(v) {this.displayMode = v;},
            setCallbackFunction: function(v) {this.callbackFunction = v;},
            
            
            // Methods /////////////////////////////////////////////////////////
            /** Creates a close button on the provided targetView.
                @param {!Object} targetView - The myt.View to create the 
                    button on.
                @param {!Object} callbackTarget - An object with a doCallback 
                    method that will get called when the close button is activated.
                @param {string} [hoverColor] - The color used when the mouse 
                    hovers over the button. Defaults to '#666666'.
                @param {string} [activeColor] - The color used when the button 
                    is active. Defaults to '#000000'.
                @param {string} [readyColor] - The color used when the button 
                    is ready to be activated. Defaults to '#333333'.
                @param {string} [iconColor] - The color used to draw the 
                    close icon. Defaults to '#ffffff'.
                @returns {!Object} - The created myt.Button. */
            createCloseButton: function(
                targetView, callbackTarget, hoverColor, activeColor, readyColor, iconColor
            ) {
                return new this.buttonClass(targetView, {
                    name:'closeBtn',
                    ignoreLayout:true, width:16, height:16, y:4, align:'right', alignOffset:4,
                    inset:4, textY:2, shrinkToFit:false,
                    roundedCorners:8,
                    activeColor:activeColor || '#cc0000',
                    hoverColor:hoverColor || '#ff3333',
                    readyColor:readyColor || '#ff0000',
                    textColor:'#ffffff',
                    fontSize:'11px',
                    text:pkg.FontAwesome.makeTag(['times']),
                    tooltip:'Close Dialog.',
                }, [{
                    doActivated: function() {callbackTarget.doCallback(this);}
                }]);
            },
            
            /** @overrides myt.Dimmer */
            hide: function(ignoreRestoreFocus) {
                hideSpinner(this);
                
                this.callSuper(ignoreRestoreFocus);
            },
            
            /** @overrides myt.Dimmer */
            eatMouseEvent: function(event) {
                if (this.displayMode === 'message') this.content.closeBtn.focus();
                return this.callSuper(event);
            },
            
            /** Called before a dialog is shown to reset state and cleanup 
                UI elements from the previous display of the Dialog.
                @returns {undefined} */
            destroyContent: function() {
                hideSpinner(this);
                
                const content = this.content, 
                    stc = content.sizeToChildren,
                    svs = content.getSubviews();
                let i = svs.length,
                    sv;
                
                // Destroy all children except the close button since that gets reused.
                while (i) {
                    sv = svs[--i];
                    if (sv.name !== 'closeBtn') sv.destroy();
                }
                
                // The blank dialog sets this.
                content.setVisible(true);
                this.overlay.setBgColor(pkg.Dimmer.DEFAULT_COLOR);
                
                // Message and Confirm dialogs set this.
                this.setCallbackFunction();
                
                // The confirm dialog modifies this.
                stc.setPaddingY(ModalPanel.DEFAULT_PADDING_Y);
                
                // The confirm content dialog modifies this.
                stc.setPaddingX(ModalPanel.DEFAULT_PADDING_X);
                
                // Any opts could modify this
                content.setRoundedCorners(Dialog.DEFAULT_RADIUS);
                content.setBgColor(Dialog.DEFAULT_BGCOLOR);
                content.setBoxShadow(Dialog.DEFAULT_SHADOW);
                content.setBorder(Dialog.DEFAULT_BORDER);
            },
            
            /** Called by each of the buttons that can trigger the dialog to 
                be hidden.
                @param {!Object} sourceView - The myt.View that triggered 
                    the hiding of the dialog.
                @returns {undefined} */
            doCallback: function(sourceView) {
                const cbf = this.callbackFunction;
                if (!cbf || !cbf.call(this, sourceView.name)) this.hide();
            },
            
            /** Shows this dialog as a regular dimmer.
                @param {?Object} opts - If opts.bgColor is provided it will 
                    be used for the bgColor of the overlay.
                @returns {undefined} */
            showBlank: function(opts) {
                this.destroyContent();
                
                this.content.setVisible(false);
                if (opts && opts.bgColor) this.overlay.setBgColor(opts.bgColor);
                
                this.show();
                
                this.setDisplayMode('blank');
            },
            
            /** Shows a dialog with a message and the standard cancel button.
                @param {string} msg - The message to show.
                @param {?Function} [callbackFunction] - A function that gets 
                    called when the close button is activated. A single 
                    argument is passed in that indicates the UI element 
                    interacted with that should close the dialog. Supported 
                    values are: 'closeBtn', 'cancelBtn' and 'confirmBtn'. The 
                    function should return true if the close should be aborted.
                @param {?Object} [opts] - Options that modify how the message 
                    is displayed. Supports: fontWeight, whiteSpace, wordWrap 
                    and width.
                @returns {undefined} */
            showMessage: function(msg, callbackFunction, opts) {
                const self = this,
                    content = self.content, 
                    closeBtn = content.closeBtn;
                
                opts = Object.assign({}, Dialog.WRAP_TEXT_DEFAULTS, opts);
                
                self.destroyContent();
                
                self.setCallbackFunction(callbackFunction);
                
                const msgView = new Text(content, {
                    name:'msg',
                    text:msg,
                    whiteSpace:opts.whiteSpace,
                    wordWrap:opts.wordWrap,
                    fontWeight:opts.fontWeight,
                    x:opts.msgX == null ? ModalPanel.DEFAULT_PADDING_X : opts.msgX,
                    y:opts.msgY == null ? ModalPanel.DEFAULT_PADDING_Y : opts.msgY,
                    width:opts.width
                });
                
                if (opts.titleText) {
                    self.setupTitle(content, opts.titleText, Dialog.DEFAULT_RADIUS);
                    msgView.setY(msgView.y + 24);
                }
                
                self.show();
                
                if (opts.showClose === false) {
                    closeBtn.setVisible(false);
                } else {
                    closeBtn.setVisible(true);
                    closeBtn.focus();
                }
                
                self.setDisplayMode('message');
            },
            
            showSimple: function(contentBuilderFunc, callbackFunction, opts) {
                opts = opts || {};
                
                const self = this,
                    content = self.content,
                    closeBtn = content.closeBtn,
                    maxHeight = opts.maxContainerHeight;
                
                self.destroyContent();
                
                if (opts.bgColor) content.setBgColor(opts.bgColor);
                if (opts.roundedCorners) content.setRoundedCorners(opts.roundedCorners);
                if (opts.boxShadow) content.setBoxShadow(opts.boxShadow);
                if (opts.border) content.setBorder(opts.border);
                
                content.sizeToChildren.setPaddingX(1);
                self.setCallbackFunction(callbackFunction);
                
                const contentContainer = new View(content, {
                    name:'contentContainer', x:1, y:25, overflow:'auto'
                }, [{
                    setHeight: function(v) {
                        if (v > maxHeight) v = maxHeight;
                        this.callSuper(v);
                    }
                }]);
                
                contentBuilderFunc.call(self, contentContainer);
                
                new SizeToChildren(contentContainer, {axis:'both'});
                
                self.show();
                
                closeBtn.setVisible(true);
                closeBtn.focus();
                
                self.setDisplayMode('content');
                
                // Set initial focus
                if (contentContainer.initialFocus) contentContainer.initialFocus.focus();
            },
            
            /** Shows a dialog with a spinner and a message and no standard 
                cancel button.
                @param {string} msg - the message to show.
                @param {?Objecft} opts - Options that modify how the message 
                    is displayed. Supports: fontWeight, whiteSpace, wordWrap 
                    and width.
                @returns {undefined} */
            showSpinner: function(msg, opts) {
                const self = this,
                    content = self.content;
                
                opts = Object.assign({}, Dialog.NO_WRAP_TEXT_DEFAULTS, opts);
                
                self.destroyContent();
                
                const spinner = self.spinner = new pkg.Spinner(content, {
                    align:'center', visible:true,
                    borderColor:'#cccccc',
                    size:50, y:opts.msgY == null ? ModalPanel.DEFAULT_PADDING_Y : opts.msgY,
                });
                if (msg) {
                    new Text(content, {
                        text:msg,
                        whiteSpace:opts.whiteSpace,
                        wordWrap:opts.wordWrap,
                        fontWeight:opts.fontWeight,
                        x:opts.msgX == null ? ModalPanel.DEFAULT_PADDING_X : opts.msgX,
                        y:spinner.y + spinner.size + ModalPanel.DEFAULT_PADDING_Y,
                        width:opts.width
                    });
                }
                
                self.show();
                
                content.closeBtn.setVisible(false);
                self.focus(); // Focus on the dimmer itself to prevent user interaction.
                
                self.setDisplayMode('spinner');
            },
            
            showColorPicker: function(callbackFunction, opts) {
                const self = this,
                    content = self.content,
                    closeBtn = content.closeBtn,
                    r = Dialog.DEFAULT_RADIUS;
                
                opts = Object.assign({}, Dialog.PICKER_DEFAULTS, opts);
                
                self.destroyContent();
                
                // Set the callback function to one wrapped to handle each button type.
                self.setCallbackFunction(action => {
                    switch (action) {
                        case 'closeBtn':
                        case 'cancelBtn':
                            callbackFunction.call(self, action);
                            break;
                        case 'confirmBtn':
                            const colorAsHex = colorPickerView.getColor();
                            colorPickerView.addToPalette(colorAsHex);
                            callbackFunction.call(self, action, colorAsHex);
                            break;
                    }
                    colorPickerView.destroy();
                });
                
                // Build Picker
                const picker = new View(content, {
                        name:'picker',
                        x:ModalPanel.DEFAULT_PADDING_X,
                        y:ModalPanel.DEFAULT_PADDING_Y + 24,
                        width:337,
                        height:177
                    }),
                    colorPickerView = new pkg.ColorPicker(picker, {
                        color:opts.color,
                        palette:['#000000','#111111','#222222','#333333','#444444','#555555','#666666','#777777','#888888','#999999','#aaaaaa','#bbbbbb','#cccccc','#dddddd','#eeeeee','#ffffff']
                    });
                
                self.show();
                
                closeBtn.setVisible(true);
                closeBtn.focus();
                
                self.setupFooterButtons(picker, opts);
                self.setupTitle(content, opts.titleText, r);
                
                self.setDisplayMode('color_picker');
            },
            
            showDatePicker: function(callbackFunction, opts) {
                const self = this,
                    content = self.content,
                    closeBtn = content.closeBtn,
                    r = Dialog.DEFAULT_RADIUS;
                
                opts = Object.assign({}, Dialog.DATE_PICKER_DEFAULTS, opts);
                
                self.destroyContent();
                
                content.sizeToChildren.setPaddingX(0);
                
                // Set the callback function to one wrapped to handle each button type.
                self.setCallbackFunction(function(action) {
                    switch(action) {
                        case 'closeBtn':
                        case 'cancelBtn':
                            callbackFunction.call(this, action);
                            break;
                        case 'confirmBtn':
                            callbackFunction.call(this, action, this._pickedDateTime);
                            break;
                    }
                });
                
                // Build Picker
                const picker = new View(content, {
                    name:'picker',
                    x:ModalPanel.DEFAULT_PADDING_X,
                    y:ModalPanel.DEFAULT_PADDING_Y + 24,
                    width:opts.dateOnly ? 200 : (opts.timeOnly ? 150 : 260),
                    height:193
                });
                const pickerView = new View(picker);
                
                $(pickerView.getInnerDomElement()).dtpicker({
                    current:new Date(opts.initialDate || Date.now()),
                    dateOnly:opts.dateOnly || false,
                    timeOnly:opts.timeOnly || false,
                    dialog:self
                });
                
                self.show();
                
                closeBtn.setVisible(true);
                closeBtn.focus();
                
                self.setupFooterButtons(picker, opts);
                self.setupTitle(content, opts.timeOnly ? opts.timeOnlyTitleText : opts.titleText, r);
                
                self.setDisplayMode('date_picker');
            },
            
            /** Called by the simple-dtpicker.
                @param {!Object} dtpicker
                @returns {undefined} */
            _dtpickerCallback: function(dtpicker) {
                this._pickedDateTime = dtpicker;
            },
            
            showConfirm: function(msg, callbackFunction, opts) {
                const self = this;
                
                opts = Object.assign({}, Dialog.CONFIRM_DEFAULTS, opts);
                
                self.showMessage(msg, callbackFunction, opts);
                self.setupFooterButtons(self.content.msg, opts);
                
                self.setDisplayMode('confirm');
            },
            
            showContentConfirm: function(contentBuilderFunc, callbackFunction, opts) {
                opts = Object.assign({}, Dialog.CONFIRM_DEFAULTS, opts);
                
                const self = this,
                    content = self.content,
                    closeBtn = content.closeBtn,
                    r = Dialog.DEFAULT_RADIUS,
                    maxHeight = opts.maxContainerHeight;
                
                self.destroyContent();
                
                content.sizeToChildren.setPaddingX(1);
                self.setCallbackFunction(callbackFunction);
                
                // Setup form
                const contentContainer = new View(content, {
                    name:'contentContainer', x:1, y:25, overflow:'auto'
                }, [{
                    setHeight: function(v) {
                        this.callSuper(v > maxHeight ? maxHeight : v);
                    }
                }]);
                
                contentBuilderFunc.call(self, contentContainer);
                
                new SizeToChildren(contentContainer, {axis:'both'});
                
                self.show();
                
                closeBtn.setVisible(true);
                closeBtn.focus();
                
                self.setupTitle(content, opts.titleText, r);
                contentContainer.setY(self.header.height + 1);
                self.setupFooterButtons(contentContainer, opts);
                
                self.setDisplayMode('content');
                
                // Set initial focus
                if (contentContainer.initialFocus) contentContainer.initialFocus.focus();
            },
            
            setupTitle: function(content, titleTxt, r) {
                (this.header = new View(content, {
                    ignoreLayout:true,
                    width:content.width,
                    height:24,
                    bgColor:'#eeeeee',
                    roundedTopLeftCorner:r,
                    roundedTopRightCorner:r
                })).sendToBack();
                
                new Text(content, {
                    name:'title', x:r, y:4, text:titleTxt, fontWeight:'bold'
                });
            },
            
            /** @private 
                @param {!Object} mainView
                @param {!Object} opts
                @returns {undefined} */
            setupFooterButtons: function(mainView, opts) {
                const self = this,
                    content = self.content, 
                    DPY = ModalPanel.DEFAULT_PADDING_Y,
                    r = Dialog.DEFAULT_RADIUS,
                    BUTTON_CLASS = self.buttonClass,
                    btnContainer = new View(content, {
                        y:mainView.y + mainView.height + DPY, align:'center'
                    });
                
                // Cancel Button
                let attrs = opts.cancelAttrs || {};
                if (attrs.name == null) attrs.name = 'cancelBtn';
                if (attrs.text == null) attrs.text = opts.cancelTxt;
                if (opts.activeColor != null) attrs.activeColor = opts.activeColor;
                if (opts.hoverColor != null) attrs.hoverColor = opts.hoverColor;
                if (opts.readyColor != null) attrs.readyColor = opts.readyColor;
                if (opts.textColor != null) attrs.textColor = opts.textColor;
                const cancelBtn = new BUTTON_CLASS(btnContainer, attrs, [{
                    doActivated: function() {self.doCallback(this);}
                }]);
                
                // Confirm Button
                attrs = opts.confirmAttrs || {};
                if (attrs.name == null) attrs.name = 'confirmBtn';
                if (attrs.text == null) attrs.text = opts.confirmTxt;
                if (opts.activeColorConfirm != null) attrs.activeColor = opts.activeColorConfirm;
                if (opts.hoverColorConfirm != null) attrs.hoverColor = opts.hoverColorConfirm;
                if (opts.readyColorConfirm != null) attrs.readyColor = opts.readyColorConfirm;
                if (opts.textColorConfirm != null) attrs.textColor = opts.textColorConfirm;
                new BUTTON_CLASS(btnContainer, attrs, [{
                    doActivated: function() {self.doCallback(this);}
                }]);
                
                // Additional Buttons
                const buttons = opts.buttons;
                if (buttons) {
                    const len = buttons.length;
                    for (let i = 0; len > i; i++) {
                        attrs = buttons[i];
                        if (attrs.name == null) attrs.name = 'btn_' + i;
                        new BUTTON_CLASS(btnContainer, attrs, [{
                            doActivated: function() {self.doCallback(this);}
                        }]);
                    }
                }
                
                new SizeToChildren(btnContainer, {axis:'y'});
                new pkg.SpacedLayout(btnContainer, {spacing:4, collapseParent:true});
                
                content.sizeToChildren.setPaddingY(DPY / 2);
                
                const bg = new View(content, {
                    ignoreLayout:true,
                    y:btnContainer.y - (DPY / 2),
                    width:content.width,
                    bgColor:'#eeeeee',
                    roundedBottomLeftCorner:r,
                    roundedBottomRightCorner:r
                });
                bg.setHeight(content.height - bg.y); // WHY: is this not in the attrs?
                bg.sendToBack();
                
                if (opts.showClose === false) cancelBtn.focus();
            }
        });
})(myt);

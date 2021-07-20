((pkg) => {
    const JSClass = JS.Class,
        View = pkg.View,
        Text = pkg.Text,
        ModalPanel = pkg.ModalPanel,
        SizeToChildren = pkg.SizeToChildren,
        
        objectAssign = Object.assign,
        
        /* Hide spinner related elements. */
        hideSpinner = (dialog) => {
            if (dialog.spinner) {
                dialog.spinner.setVisible(false);
                dialog.spinner = undefined;
            }
        },
        
        /* The class used as the DEFAULT_BUTTON_CLASS in myt.Dialog. */
        DialogButton = new JSClass('DialogButton', pkg.SimpleTextButton, {
            /** @overrides */
            initNode: function(parent, attrs) {
                if (attrs.height == null) attrs.height = 20;
                if (attrs.shrinkToFit == null) attrs.shrinkToFit = true;
                if (attrs.inset == null) attrs.inset = 10;
                if (attrs.outset == null) attrs.outset = 10;
                if (attrs.textY == null) attrs.textY = 3;
                if (attrs.roundedCorners == null) attrs.roundedCorners = 3;
                if (attrs.activeColor == null) attrs.activeColor = '#bbbbbb';
                if (attrs.hoverColor == null) attrs.hoverColor = '#dddddd';
                if (attrs.readyColor == null) attrs.readyColor = '#cccccc';
                
                this.callSuper(parent, attrs);
            }
        }),
        
        /** A modal panel that contains a Dialog.
            
            Attributes:
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
                COLOR_PICKER_DEFAULTS: {
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
                    color:'#000000',
                    locales:{
                        en: {
                            days: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
                            months: [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ],
                            sep: '-',
                            prevMonth: 'Previous month',
                            nextMonth: 'Next month',
                            today: 'Today'
                        }
                    }
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
                
                this.makeCloseButton(content);
            },
            
            
            // Accessors ///////////////////////////////////////////////////////
            setButtonClass: function(v) {this.buttonClass = v;},
            setCallbackFunction: function(v) {this.callbackFunction = v;},
            
            
            // Methods /////////////////////////////////////////////////////////
            /** Make a standard button for a Dialog.
                @param {!Object} btnContainer - The myt.View to create the 
                    button on.
                @param {!Object} attrs - The attributes for the new button.
                @returns {!Object} - The created button.*/
            makeButton: function(btnContainer, attrs) {
                const self = this;
                return new self.buttonClass(btnContainer, attrs, [{
                    doActivated: function() {self.doCallback(this);}
                }]);
            },
            
            /** Creates a close button on the provided targetView.
                @param {!Object} targetView - The myt.View to create the 
                    button on.
                @returns {!Object} - The created myt.Button. */
            makeCloseButton: function(targetView) {
                return this.makeButton(targetView, {
                    name:'closeBtn',
                    ignoreLayout:true,
                    y:2,
                    align:'right',
                    alignOffset:2,
                    height:19,
                    inset:5,
                    outset:14,
                    roundedCorners:9,
                    activeColor:'#cc0000',
                    hoverColor:'#ff3333',
                    readyColor:'#ff0000',
                    textColor:'#ffffff',
                    text:pkg.FontAwesome.makeTag(['times']),
                    tooltip:'Close Dialog.',
                });
            },
            
            /** @overrides myt.Dimmer */
            hide: function(ignoreRestoreFocus) {
                hideSpinner(this);
                
                this.callSuper(ignoreRestoreFocus);
            },
            
            /** Called before a dialog is shown to reset state and cleanup 
                UI elements from the previous display of the Dialog.
                @returns {undefined} */
            destroyContent: function() {
                hideSpinner(this);
                
                const content = this.content, 
                    stc = content.sizeToChildren,
                    svs = content.getSubviews();
                
                // Destroy all children except the close button since that gets reused.
                let i = svs.length;
                while (i) {
                    const sv = svs[--i];
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
                
                opts = objectAssign({}, Dialog.WRAP_TEXT_DEFAULTS, opts);
                
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
                    self.setupTitle(content, opts.titleText);
                    msgView.setY(msgView.y + 24);
                }
                
                self.show();
                
                if (opts.showClose === false) {
                    closeBtn.setVisible(false);
                } else {
                    closeBtn.setVisible(true);
                    closeBtn.focus();
                }
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
                
                // Set initial focus
                if (contentContainer.initialFocus) contentContainer.initialFocus.focus();
            },
            
            showConfirm: function(msg, callbackFunction, opts) {
                const self = this;
                
                opts = objectAssign({}, Dialog.CONFIRM_DEFAULTS, opts);
                
                self.showMessage(msg, callbackFunction, opts);
                self.setupFooterButtons(self.content.msg, opts);
            },
            
            showContentConfirm: function(contentBuilderFunc, callbackFunction, opts) {
                opts = objectAssign({}, Dialog.CONFIRM_DEFAULTS, opts);
                
                const self = this,
                    content = self.content,
                    closeBtn = content.closeBtn,
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
                
                self.setupTitle(content, opts.titleText);
                contentContainer.setY(self.header.height + 1);
                self.setupFooterButtons(contentContainer, opts);
                
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
                
                opts = objectAssign({}, Dialog.NO_WRAP_TEXT_DEFAULTS, opts);
                
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
            },
            
            showColorPicker: function(callbackFunction, opts) {
                const self = this,
                    content = self.content,
                    closeBtn = content.closeBtn;
                opts = objectAssign({}, Dialog.COLOR_PICKER_DEFAULTS, opts);
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
                const colorPickerView = new pkg.ColorPicker(content, {
                    x:ModalPanel.DEFAULT_PADDING_X,
                    y:ModalPanel.DEFAULT_PADDING_Y + 24,
                    width:337,
                    height:177,
                    color:opts.color,
                    palette:['#000000','#111111','#222222','#333333','#444444','#555555','#666666','#777777','#888888','#999999','#aaaaaa','#bbbbbb','#cccccc','#dddddd','#eeeeee','#ffffff']
                });
                self.show();
                closeBtn.setVisible(true);
                closeBtn.focus();
                self.setupFooterButtons(colorPickerView, opts);
                self.setupTitle(content, opts.titleText);
            },
            
            showDatePicker: function(callbackFunction, opts) {
                const self = this,
                    content = self.content,
                    closeBtn = content.closeBtn;
                opts = objectAssign({}, Dialog.DATE_PICKER_DEFAULTS, opts);
                self.destroyContent();
                
                //content.sizeToChildren.setPaddingX(0);
                
                // Set the callback function to one wrapped to handle each button type.
                self.setCallbackFunction(action => {
                    switch (action) {
                        case 'closeBtn':
                        case 'cancelBtn':
                            callbackFunction.call(self, action);
                            break;
                        case 'confirmBtn':
                            callbackFunction.call(self, action, datePickerView.getPickedDate());
                            break;
                    }
                    datePickerView.destroy();
                });
                
                // Build Picker
                const datePickerView = new pkg.DatePicker(content, {
                    x:ModalPanel.DEFAULT_PADDING_X,
                    y:ModalPanel.DEFAULT_PADDING_Y + 24,
                    height:195,
                    opt: {
                        current:new Date(opts.initialDate || Date.now()),
                        dateOnly:opts.dateOnly || false,
                        timeOnly:opts.timeOnly || false,
                        locales:opts.locales,
                        locale:'en'
                    }
                });
                self.show();
                closeBtn.setVisible(true);
                closeBtn.focus();
                self.setupFooterButtons(datePickerView, opts);
                self.setupTitle(content, opts.timeOnly ? opts.timeOnlyTitleText : opts.titleText);
            },
            
            setupTitle: function(content, titleTxt) {
                const R = Dialog.DEFAULT_RADIUS;
                (this.header = new View(content, {
                    ignoreLayout:true,
                    width:content.width,
                    height:24,
                    bgColor:'#eeeeee',
                    roundedTopLeftCorner:R,
                    roundedTopRightCorner:R
                })).sendToBack();
                new Text(content, {name:'title', x:R, y:4, text:titleTxt, fontWeight:'bold'});
            },
            
            /** @private 
                @param {!Object} mainView
                @param {!Object} opts
                @returns {undefined} */
            setupFooterButtons: function(mainView, opts) {
                const self = this,
                    content = self.content, 
                    DPY = ModalPanel.DEFAULT_PADDING_Y,
                    HALF_DPY = DPY / 2,
                    btnContainer = new View(content, {y:mainView.y + mainView.height + DPY, align:'center'});
                
                // Cancel Button
                let attrs = opts.cancelAttrs || {};
                if (attrs.name == null) attrs.name = 'cancelBtn';
                if (attrs.text == null) attrs.text = opts.cancelTxt;
                if (opts.activeColor != null) attrs.activeColor = opts.activeColor;
                if (opts.hoverColor != null) attrs.hoverColor = opts.hoverColor;
                if (opts.readyColor != null) attrs.readyColor = opts.readyColor;
                if (opts.textColor != null) attrs.textColor = opts.textColor;
                const cancelBtn = self.makeButton(btnContainer, attrs);
                
                // Confirm Button
                attrs = opts.confirmAttrs || {};
                if (attrs.name == null) attrs.name = 'confirmBtn';
                if (attrs.text == null) attrs.text = opts.confirmTxt;
                if (opts.activeColorConfirm != null) attrs.activeColor = opts.activeColorConfirm;
                if (opts.hoverColorConfirm != null) attrs.hoverColor = opts.hoverColorConfirm;
                if (opts.readyColorConfirm != null) attrs.readyColor = opts.readyColorConfirm;
                if (opts.textColorConfirm != null) attrs.textColor = opts.textColorConfirm;
                self.makeButton(btnContainer, attrs);
                
                // Additional Buttons
                (opts.buttons || []).forEach(buttonAttrs => {self.makeButton(btnContainer, buttonAttrs);});
                
                new SizeToChildren(btnContainer, {axis:'y'});
                new pkg.SpacedLayout(btnContainer, {spacing:4, collapseParent:true});
                
                content.sizeToChildren.setPaddingY(HALF_DPY);
                
                const r = Dialog.DEFAULT_RADIUS,
                    bgY = btnContainer.y - HALF_DPY;
                (new View(content, {
                    ignoreLayout:true,
                    y:bgY,
                    width:content.width,
                    height:content.height - bgY,
                    bgColor:'#eeeeee',
                    roundedBottomLeftCorner:r,
                    roundedBottomRightCorner:r
                })).sendToBack();
                
                if (opts.showClose === false) cancelBtn.focus();
            }
        });
})(myt);

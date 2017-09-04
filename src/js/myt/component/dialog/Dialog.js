/** The class used as the DEFAULT_BUTTON_CLASS in myt.Dialog.
    
    Events:
        None
    
    Attributes:
        None
*/
myt.DialogButton = new JS.Class('DialogButton', myt.SimpleButton, {
    // Life Cycle //////////////////////////////////////////////////////////////
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
        
        var fontSize = attrs.fontSize,
            shrinkToFit = attrs.shrinkToFit,
            text = attrs.text || '';
        delete attrs.fontSize;
        delete attrs.shrinkToFit;
        delete attrs.text;
        
        this.callSuper(parent, attrs);
        
        var textView = this.textView = new myt.Text(this, {
            x:this.inset, 
            y:this.textY, 
            text:text,
            fontSize:fontSize,
            whiteSpace:'nowrap',
            domClass:'myt-Text mytButtonText'
        });
        if (shrinkToFit) this.applyConstraint('__update', [this, 'inset', this, 'outset', textView, 'width']);
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setText: function(v) {
        if (this.inited) this.textView.setText(v);
    },
    
    setTooltip: function(v) {
        this.domElement.title = v;
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** @private */
    __update: function(v) {
        if (!this.destroyed) {
            var inset = this.inset,
                textView = this.textView;
            textView.setX(inset);
            this.setWidth(inset + textView.width + this.outset);
        }
    }
});


/** A modal panel that contains a Dialog.
    
    Events:
        None
    
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
*/
myt.Dialog = new JS.Class('Dialog', myt.ModalPanel, {
    // Class Methods and Attributes ////////////////////////////////////////////
    extend: {
        DEFAULT_RADIUS: 12,
        DEFAULT_SHADOW: [0, 4, 20, '#666666'],
        DEFAULT_BORDER: [1, 'solid', '#ffffff'],
        DEFAULT_BGCOLOR: '#ffffff',
        DEFAULT_BUTTON_CLASS: myt.DialogButton,
        
        /** Makes the text wrap at 200px and the dialog will be at
            least 200px wide. */
        WRAP_TEXT_DEFAULTS: {
            width:200,
            fontWeight:'bold',
            whiteSpace:'normal',
            wordWrap:'break-word'
        },
        
        /** Makes the text stay on a single line and the dialog sizes to fit. */
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
            maxContainerHeight:300
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
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides */
    initNode: function(parent, attrs) {
        if (attrs.buttonClass == null) attrs.buttonClass = myt.Dialog.DEFAULT_BUTTON_CLASS;
        
        this.callSuper(parent, attrs);
    },
    
    doAfterAdoption: function() {
        this.setupDialog();
        
        this.callSuper();
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setButtonClass: function(v) {this.buttonClass = v;},
    setDisplayMode: function(v) {this.displayMode = v;},
    setCallbackFunction: function(v) {this.callbackFunction = v;},
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** Does basic styling of a dialog and creates a close button.
        @returns void */
    setupDialog: function() {
        var D = myt.Dialog,
            content = this.content;
        content.setRoundedCorners(D.DEFAULT_RADIUS);
        content.setBgColor(D.DEFAULT_BGCOLOR);
        content.setBoxShadow(D.DEFAULT_SHADOW);
        content.setBorder(D.DEFAULT_BORDER);
        content.setFocusCage(true);
        
        this.createCloseButton(content, this);
    },
    
    /** Creates a close button on the provided targetView.
        @param targetView:myt.View The view to create the button on.
        @param callbackTarget:object An object with a doCallback method
            that will get called when the close button is activated.
        @param hoverColor:color (optional) The color used when the mouse 
            hovers over the button. Defaults to '#666666'.
        @param activeColor:color (optional) The color used when the button 
            is active. Defaults to '#000000'.
        @param readyColor:color (optional) The color used when the button 
            is ready to be activated. Defaults to '#333333'.
        @param iconColor:color (optional) The color used to draw the 
            close icon. Defaults to '#ffffff'.
        @returns myt.Button: The created button. */
    createCloseButton: function(
        targetView, callbackTarget, hoverColor, activeColor, readyColor, iconColor
    ) {
        return new this.buttonClass(targetView, {
            name:'closeBtn',
            ignoreLayout:true, width:16, height:16, y:4, align:'right', alignOffset:4,
            inset:3, textY:1, shrinkToFit:false,
            roundedCorners:8,
            activeColor:activeColor || '#cc0000',
            hoverColor:hoverColor || '#ff3333',
            readyColor:readyColor || '#ff0000',
            textColor:'#ffffff',
            fontSize:'12.5px',
            text:myt.FontAwesome.makeTag(['close']),
            tooltip:'Close Dialog.',
        }, [{
            doActivated: function() {callbackTarget.doCallback(this);}
        }]);
    },
    
    /** @overrides myt.Dimmer */
    hide: function(ignoreRestoreFocus) {
        this.__hideSpinner();
        
        this.callSuper(ignoreRestoreFocus);
    },
    
    /** Hide spinner related elements.
        @private
        @returns void */
    __hideSpinner: function() {
        if (this.spinner) {
            this.spinner.setVisible(false);
            this.spinner = undefined;
        }
    },
    
    /** @overrides myt.Dimmer */
    eatMouseEvent: function(event) {
        if (this.displayMode === 'message') this.content.closeBtn.focus();
        return this.callSuper(event);
    },
    
    /** Called before a dialog is shown to reset state and cleanup UI elements
        from the previous display of the Dialog.
        @private
        @returns void */
    __destroyContent: function() {
        this.__hideSpinner();
        
        var M = myt,
            MP = M.ModalPanel, 
            MD = M.Dialog,
            content = this.content, 
            stc = content.sizeToChildren,
            svs = content.getSubviews(), 
            i = svs.length,
            sv;
        
        // Destroy all children except the close button since that gets reused.
        while (i) {
            sv = svs[--i];
            if (sv.name !== 'closeBtn') sv.destroy();
        }
        
        // The blank dialog sets this.
        content.setVisible(true);
        this.overlay.setBgColor(M.Dimmer.DEFAULT_COLOR);
        
        // Message and Confirm dialogs set this.
        this.setCallbackFunction();
        
        // The confirm dialog modifies this.
        stc.setPaddingY(MP.DEFAULT_PADDING_Y);
        
        // The confirm content dialog modifies this.
        stc.setPaddingX(MP.DEFAULT_PADDING_X);
        
        // Any opts could modify this
        content.setRoundedCorners(MD.DEFAULT_RADIUS);
        content.setBgColor(MD.DEFAULT_BGCOLOR);
        content.setBoxShadow(MD.DEFAULT_SHADOW);
        content.setBorder(MD.DEFAULT_BORDER);
    },
    
    /** Called by each of the buttons that can trigger the dialog to be hidden.
        @param sourceView:myt.View the view that triggered the hiding 
            of the dialog.
        @returns void */
    doCallback: function(sourceView) {
        var cbf = this.callbackFunction;
        if (!cbf || !cbf.call(this, sourceView.name)) this.hide();
    },
    
    /** Shows this dialog as a regular dimmer.
        @param opts:object If opts.bgColor is provided it will be used for
            the bgColor of the overlay.
        @returns void */
    showBlank: function(opts) {
        this.__destroyContent();
        
        this.content.setVisible(false);
        if (opts && opts.bgColor) this.overlay.setBgColor(opts.bgColor);
        
        this.show();
        
        this.setDisplayMode('blank');
    },
    
    /** Shows a dialog with a message and the standard cancel button.
        @param msg:string the message to show.
        @param callbackFunction:function (optional) A function that gets 
            called when the close button is activated. A single argument is
            passed in that indicates the UI element interacted with that should
            close the dialog. Supported values are: 'closeBtn', 'cancelBtn' and
            'confirmBtn'. The function should return true if the close should 
            be aborted.
        @param opts:object (optional) options that modify how the message is 
            displayed. Supports: fontWeight, whiteSpace, wordWrap and width.
        @returns void */
    showMessage: function(msg, callbackFunction, opts) {
        var self = this,
            M = myt,
            MP = M.ModalPanel,
            content = self.content, 
            closeBtn = content.closeBtn;
        
        opts = M.extend({}, M.Dialog.WRAP_TEXT_DEFAULTS, opts);
        
        self.__destroyContent();
        
        self.setCallbackFunction(callbackFunction);
        
        new M.Text(content, {
            name:'msg',
            text:msg,
            whiteSpace:opts.whiteSpace,
            wordWrap:opts.wordWrap,
            fontWeight:opts.fontWeight,
            x:opts.msgX == null ? MP.DEFAULT_PADDING_X : opts.msgX,
            y:opts.msgY == null ? MP.DEFAULT_PADDING_Y : opts.msgY,
            width:opts.width
        });
        
        self.show();
        
        closeBtn.setVisible(true);
        closeBtn.focus();
        
        self.setDisplayMode('message');
    },
    
    showSimple: function(contentBuilderFunc, callbackFunction, opts) {
        var self = this,
            M = myt,
            content = self.content,
            closeBtn = content.closeBtn,
            opts = opts || {},
            maxHeight = opts.maxContainerHeight;
        
        self.__destroyContent();
        
        if (opts.bgColor) content.setBgColor(opts.bgColor);
        if (opts.roundedCorners) content.setRoundedCorners(opts.roundedCorners);
        if (opts.boxShadow) content.setBoxShadow(opts.boxShadow);
        if (opts.border) content.setBorder(opts.border);
        
        content.sizeToChildren.setPaddingX(1);
        self.setCallbackFunction(callbackFunction);
        
        var contentContainer = new M.View(content, {
            name:'contentContainer', x:1, y:25, overflow:'auto'
        }, [{
            setHeight: function(v) {
                if (v > maxHeight) v = maxHeight;
                this.callSuper(v);
            }
        }]);
        
        contentBuilderFunc.call(self, contentContainer);
        
        new M.SizeToChildren(contentContainer, {axis:'both'});
        
        self.show();
        
        closeBtn.setVisible(true);
        closeBtn.focus();
        
        self.setDisplayMode('content');
        
        // Set initial focus
        if (contentContainer.initialFocus) contentContainer.initialFocus.focus();
    },
    
    /** Shows a dialog with a spinner and a message and no standard cancel
        button.
        @param msg:string the message to show.
        @param opts:object options that modify how the message is displayed.
            Supports: fontWeight, whiteSpace, wordWrap and width.
        @returns void */
    showSpinner: function(msg, opts) {
        var self = this,
            M = myt,
            MP = M.ModalPanel,
            content = self.content;
        
        opts = M.extend({}, M.Dialog.NO_WRAP_TEXT_DEFAULTS, opts);
        
        self.__destroyContent();
        
        var spinner = self.spinner = new M.Spinner(content, {
            align:'center', visible:true,
            radius:10, lines:12, length:14, lineWidth:3,
            y:opts.msgY == null ? MP.DEFAULT_PADDING_Y : opts.msgY,
        });
        if (msg) {
            new M.Text(content, {
                text:msg,
                whiteSpace:opts.whiteSpace,
                wordWrap:opts.wordWrap,
                fontWeight:opts.fontWeight,
                x:opts.msgX == null ? MP.DEFAULT_PADDING_X : opts.msgX,
                y:spinner.y + spinner.getSize() + MP.DEFAULT_PADDING_Y,
                width:opts.width
            });
        }
        
        self.show();
        
        content.closeBtn.setVisible(false);
        self.focus(); // Focus on the dimmer itself to prevent user interaction.
        
        self.setDisplayMode('spinner');
    },
    
    showColorPicker: function(callbackFunction, opts) {
        var self = this,
            M = myt,
            V = M.View,
            MP = M.ModalPanel,
            content = self.content,
            closeBtn = content.closeBtn,
            r = M.Dialog.DEFAULT_RADIUS;
        
        opts = M.extend({}, M.Dialog.PICKER_DEFAULTS, opts);
        
        self.__destroyContent();
        
        // Set the callback function to one wrapped to handle each button type.
        self.setCallbackFunction(function(action) {
            switch(action) {
                case 'closeBtn':
                case 'cancelBtn':
                    callbackFunction.call(this, action);
                    break;
                case 'confirmBtn':
                    var color = this._spectrum.get();
                    this._spectrum.addColorToSelectionPalette(color);
                    callbackFunction.call(this, action, color ? color.toHexString() : 'transparent');
                    break;
            }
            this._spectrum.destroy();
        });
        
        // Build Picker
        var picker = new V(content, {
            name:'picker',
            x:MP.DEFAULT_PADDING_X,
            y:MP.DEFAULT_PADDING_Y + 24,
            width:337,
            height:177
        });
        var spectrumView = new V(picker);
        $(spectrumView.domElement).spectrum({
            color:opts.color,
            palette: [['#000000','#111111','#222222','#333333','#444444','#555555','#666666','#777777'],
                      ['#888888','#999999','#aaaaaa','#bbbbbb','#cccccc','#dddddd','#eeeeee','#ffffff']],
            localStorageKey: "myt.default",
            dialog:self
        });
        
        self.show();
        
        closeBtn.setVisible(true);
        closeBtn.focus();
        
        self.setupFooterButtons(picker, opts);
        self.setupTitle(content, opts.titleText, r);
        
        self.setDisplayMode('color_picker');
    },
    
    _spectrumCallback: function(spectrum) {
        this._spectrum = spectrum;
    },
    
    showDatePicker: function(callbackFunction, opts) {
        var self = this,
            M = myt,
            MP = M.ModalPanel, 
            V = M.View,
            content = self.content,
            closeBtn = content.closeBtn,
            r = M.Dialog.DEFAULT_RADIUS;
        
        opts = M.extend({}, M.Dialog.DATE_PICKER_DEFAULTS, opts);
        
        self.__destroyContent();
        
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
        var picker = new V(content, {
            name:'picker',
            x:MP.DEFAULT_PADDING_X,
            y:MP.DEFAULT_PADDING_Y + 24,
            width:opts.dateOnly ? 195 : (opts.timeOnly ? 150 : 240),
            height:185
        });
        var pickerView = new V(picker);
        
        $(pickerView.domElement).dtpicker({
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
    
    _dtpickerCallback: function(dtpicker) {
        this._pickedDateTime = dtpicker;
    },
    
    showConfirm: function(msg, callbackFunction, opts) {
        var self = this,
            M = myt,
            D = M.Dialog,
            content = self.content;
        
        opts = M.extend({}, D.CONFIRM_DEFAULTS, opts);
        
        self.showMessage(msg, callbackFunction, opts);
        
        var msg = content.msg;
        
        if (opts.titleText) {
            self.setupTitle(content, opts.titleText, D.DEFAULT_RADIUS);
            msg.setY(msg.y + 24);
        }
        self.setupFooterButtons(msg, opts);
        
        self.setDisplayMode('confirm');
    },
    
    showContentConfirm: function(contentBuilderFunc, callbackFunction, opts) {
        var self = this,
            M = myt,
            V = M.View,
            content = self.content,
            closeBtn = content.closeBtn,
            r = M.Dialog.DEFAULT_RADIUS,
            maxHeight = opts.maxContainerHeight;
        
        opts = M.extend({}, M.Dialog.CONFIRM_DEFAULTS, opts);
        
        self.__destroyContent();
        
        content.sizeToChildren.setPaddingX(1);
        self.setCallbackFunction(callbackFunction);
        
        // Setup form
        var contentContainer = new V(content, {
            name:'contentContainer', x:1, y:25, overflow:'auto'
        }, [{
            setHeight: function(v) {
                this.callSuper(v > maxHeight ? maxHeight : v);
            }
        }]);
        
        contentBuilderFunc.call(self, contentContainer);
        
        new M.SizeToChildren(contentContainer, {axis:'both'});
        
        self.show();
        
        closeBtn.setVisible(true);
        closeBtn.focus();
        
        self.setupFooterButtons(contentContainer, opts);
        self.setupTitle(content, opts.titleText, r);
        
        self.setDisplayMode('content');
        
        // Set initial focus
        if (contentContainer.initialFocus) contentContainer.initialFocus.focus();
    },
    
    setupTitle: function(content, titleTxt, r) {
        (new myt.View(content, {
            ignoreLayout:true,
            width:content.width,
            height:24,
            bgColor:'#eeeeee',
            roundedTopLeftCorner:r,
            roundedTopRightCorner:r
        })).sendToBack();
        
        new myt.Text(content, {
            name:'title', x:r, y:4, text:titleTxt, fontWeight:'bold'
        });
    },
    
    /** @private */
    setupFooterButtons: function(mainView, opts) {
        var self = this,
            M = myt,
            V = M.View,
            content = self.content, 
            DPY = M.ModalPanel.DEFAULT_PADDING_Y,
            r = M.Dialog.DEFAULT_RADIUS,
            BUTTON_CLASS = self.buttonClass,
            attrs,
            buttons;
        
        var btnContainer = new V(content, {
            y:mainView.y + mainView.height + DPY, align:'center'
        });
        
        // Cancel Button
        attrs = opts.cancelAttrs || {};
        if (attrs.name == null) attrs.name = 'cancelBtn';
        if (attrs.text == null) attrs.text = opts.cancelTxt;
        if (opts.activeColor != null) attrs.activeColor = opts.activeColor;
        if (opts.hoverColor != null) attrs.hoverColor = opts.hoverColor;
        if (opts.readyColor != null) attrs.readyColor = opts.readyColor;
        if (opts.textColor != null) attrs.textColor = opts.textColor;
        new BUTTON_CLASS(btnContainer, attrs, [{
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
        buttons = opts.buttons;
        if (buttons) {
            for (var i = 0, len = buttons.length; len > i; i++) {
                attrs = buttons[i];
                if (attrs.name == null) attrs.name = 'btn_' + i;
                new BUTTON_CLASS(btnContainer, attrs, [{
                    doActivated: function() {self.doCallback(this);}
                }]);
            }
        }
        
        new M.SizeToChildren(btnContainer, {axis:'y'});
        new M.SpacedLayout(btnContainer, {spacing:4, collapseParent:true});
        
        content.sizeToChildren.setPaddingY(DPY / 2);
        
        var bg = new V(content, {
            ignoreLayout:true,
            y:btnContainer.y - (DPY / 2),
            width:content.width,
            bgColor:'#eeeeee',
            roundedBottomLeftCorner:r,
            roundedBottomRightCorner:r
        });
        bg.setHeight(content.height - bg.y); // WHY: is this not in the attrs?
        bg.sendToBack();
    }
});

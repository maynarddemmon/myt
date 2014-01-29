/** A modal panel that contains a Dialog.
    
    Events:
        None
    
    Attributes:
        displayMode:string (read only) Indicates what kind of dialog this 
            component is currently configured as. Allowed values are: 'message',
            'spinner' and 'confirm'.
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
        DEFAULT_BGCOLOR: '#ffffff',
        
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
        
        /** Does basic styling of a dialog and creates a close button.
            @param dialog:myt.Dialog The dialog to apply the styling to.
            @returns void */
        setupDialog: function(dialog) {
            var content = dialog.content;
            content.setRoundedCorners(this.DEFAULT_RADIUS);
            content.setBgColor(this.DEFAULT_BGCOLOR);
            content.setBoxShadow(this.DEFAULT_SHADOW);
            content.setFocusCage(true);
            
            this.createCloseButton(content, dialog);
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
            hoverColor = hoverColor || '#666666';
            activeColor = activeColor || '#000000';
            readyColor = readyColor || '#333333';
            iconColor = iconColor || '#ffffff';
            
            return new myt.DrawButton(targetView, {
                name:'closeBtn', width:16, height:16, y:4,
                roundedCorners:8, tooltip:'Close Dialog.',
                ignoreLayout:true, align:'right', alignOffset:4
            }, [myt.TooltipMixin, {
                doActivated: function() {callbackTarget.doCallback(this);},
                
                draw: function(canvas, config) {
                    canvas.clear();
                    
                    var b = config.bounds;
                    if (b.w == 0 || b.h == 0) return;
                    
                    var fillColor;
                    switch (config.state) {
                        case 'hover':
                            fillColor = hoverColor;
                            break;
                        case 'active':
                            fillColor = activeColor;
                            break;
                        case 'ready':
                        case 'disabled':
                        default:
                            fillColor = readyColor;
                            break;
                    }
                    
                    canvas.beginPath();
                    canvas.circle(8, 8, 8);
                    canvas.closePath();
                    canvas.setFillStyle(fillColor);
                    canvas.fill();
                    
                    // Draw white X
                    canvas.beginPath();
                    canvas.moveTo(8,6);
                    canvas.lineTo(11,3);
                    canvas.lineTo(13,5);
                    canvas.lineTo(10,8);
                    canvas.lineTo(13,11);
                    canvas.lineTo(11,13);
                    canvas.lineTo(8,10);
                    canvas.lineTo(5,13);
                    canvas.lineTo(3,11);
                    canvas.lineTo(6,8);
                    canvas.lineTo(3,5);
                    canvas.lineTo(5,3);
                    canvas.closePath();
                    canvas.setFillStyle(iconColor);
                    canvas.fill();
                }
            }]);
        }
    },
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    doAfterAdoption: function() {
        myt.Dialog.setupDialog(this);
        
        this.callSuper();
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setDisplayMode: function(v) {this.displayMode = v;},
    setCallbackFunction: function(v) {this.callbackFunction = v;},
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** @overrides myt.Dimmer */
    hide: function() {
        this.__hideSpinner();
        
        this.callSuper();
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
        
        var content = this.content, MP = myt.ModalPanel,
            stc = content.sizeToChildren,
            svs = content.getSubviews(), 
            i = svs.length, sv;
        
        // Destroy all children except the close button since that gets reused.
        while (i) {
            sv = svs[--i];
            if (sv.name !== 'closeBtn') sv.destroy();
        }
        
        // Message and Confirm dialogs set this.
        this.setCallbackFunction();
        
        // Confirm dialog modifies this.
        stc.setPaddingY(MP.DEFAULT_PADDING_Y);
        
        // Confirm content dialog modifies this.
        stc.setPaddingX(MP.DEFAULT_PADDING_X);
    },
    
    /** Called by each of the buttons that can trigger the dialog to be hidden.
        @param sourceView:myt.View the view that triggered the hiding 
            of the dialog.
        @returns void */
    doCallback: function(sourceView) {
        var cbf = this.callbackFunction;
        if (!cbf || !cbf.call(this, sourceView.name)) this.hide();
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
        opts = $.extend({}, myt.Dialog.WRAP_TEXT_DEFAULTS, opts);
        var content = this.content, MP = myt.ModalPanel;
        
        this.__destroyContent();
        
        this.setCallbackFunction(callbackFunction);
        
        new myt.Text(content, {
            name:'msg',
            text:msg,
            whiteSpace:opts.whiteSpace,
            wordWrap:opts.wordWrap,
            fontWeight:opts.fontWeight,
            x:MP.DEFAULT_PADDING_X,
            y:MP.DEFAULT_PADDING_Y,
            width:opts.width
        });
        
        this.show();
        
        var closeBtn = content.closeBtn;
        closeBtn.setVisible(true);
        closeBtn.focus();
        
        this.setDisplayMode('message');
    },
    
    /** Shows a dialog with a spinner and a message and no standard cancel
        button.
        @param msg:string the message to show.
        @param opts:object options that modify how the message is displayed.
            Supports: fontWeight, whiteSpace, wordWrap and width.
        @returns void */
    showSpinner: function(msg, opts) {
        opts = $.extend({}, myt.Dialog.NO_WRAP_TEXT_DEFAULTS, opts);
        var content = this.content, MP = myt.ModalPanel;
        
        this.__destroyContent();
        
        var spinner = this.spinner = new myt.Spinner(content, {
            align:'center', visible:true,
            radius:10, lines:12, length:14, lineWidth:3,
            y:MP.DEFAULT_PADDING_Y
        });
        if (msg) {
            new myt.Text(content, {
                text:msg,
                whiteSpace:opts.whiteSpace,
                wordWrap:opts.wordWrap,
                fontWeight:opts.fontWeight,
                x:MP.DEFAULT_PADDING_X,
                y:spinner.y + spinner.getSize() + MP.DEFAULT_PADDING_Y,
                width:opts.width
            });
        }
        
        this.show();
        
        content.closeBtn.setVisible(false);
        this.focus(); // Focus on the dimmer itself to prevent user interaction.
        
        this.setDisplayMode('spinner');
    },
    
    showConfirm: function(msg, callbackFunction, opts) {
        opts = $.extend({}, myt.Dialog.CONFIRM_DEFAULTS, opts);
        
        this.showMessage(msg, callbackFunction, opts);
        
        this.__setupConfirmButtons(this.content.msg, opts);
        
        this.setDisplayMode('confirm');
    },
    
    showContentConfirm: function(contentBuilderFunc, callbackFunction, opts) {
        var MP = myt.ModalPanel, content = this.content;
        
        opts = $.extend({}, myt.Dialog.CONFIRM_DEFAULTS, opts);
        
        this.__destroyContent();
        
        content.sizeToChildren.setPaddingX(1);
        this.setCallbackFunction(callbackFunction);
        
        // Setup form
        var maxHeight = opts.maxContainerHeight;
        var contentContainer = new myt.Text(content, {
            name:'contentContainer',
            x:1, y:25, overflow:'auto'
        }, [{
            setHeight: function(v) {
                if (v > maxHeight) v = maxHeight;
                this.callSuper(v);
            }
        }]);
        
        contentBuilderFunc.call(this, contentContainer);
        
        new myt.SizeToChildren(contentContainer, {axis:'both'});
        
        this.show();
        
        var closeBtn = content.closeBtn;
        closeBtn.setVisible(true);
        closeBtn.focus();
        
        this.__setupConfirmButtons(contentContainer, opts);
        
        var r = myt.Dialog.DEFAULT_RADIUS;
        var bg = new myt.View(content, {
            ignoreLayout:true,
            x:0, y:0,
            width:content.width, height:24,
            bgColor:'#eeeeee',
            roundedTopLeftCorner:r,
            roundedTopRightCorner:r
        });
        bg.sendToBack();
        
        new myt.Text(content, {
            name:'title', x:r, y:4, text:opts.titleText,
            fontWeight:'bold'
        });
        
        this.setDisplayMode('content');
    },
    
    /** @private */
    __setupConfirmButtons: function(mainView, opts) {
        var self = this, content = this.content, 
            MP = myt.ModalPanel,
            MP_DPY = MP.DEFAULT_PADDING_Y;
        
        var btnContainer = new myt.View(content, {
            y:mainView.y + mainView.height + MP_DPY, align:'center'
        });
        
        var attrs = {
            name:'cancelBtn', text:opts.cancelTxt, shrinkToFit:true,
            height:20, inset:10, outset:10, roundedCorners:5,
            activeColor:'#bbbbbb', hoverColor:'#dddddd', readyColor:'#cccccc'
        };
        if (opts.activeColor !== undefined) attrs.activeColor = opts.activeColor;
        if (opts.hoverColor !== undefined) attrs.hoverColor = opts.hoverColor;
        if (opts.readyColor !== undefined) attrs.readyColor = opts.readyColor;
        if (opts.textColor !== undefined) attrs.textColor = opts.textColor;
        
        new myt.SimpleIconTextButton(btnContainer, attrs, [{
            doActivated: function() {self.doCallback(this);}
        }]);
        
        attrs.name = 'confirmBtn';
        attrs.text = opts.confirmTxt;
        new myt.SimpleIconTextButton(btnContainer, attrs, [{
            doActivated: function() {self.doCallback(this);}
        }]);
        
        new myt.SizeToChildren(btnContainer, {axis:'y'});
        new myt.SpacedLayout(btnContainer, {spacing:4, axis:'x', collapseParent:true});
        
        content.sizeToChildren.setPaddingY(MP_DPY / 2);
        
        var r = myt.Dialog.DEFAULT_RADIUS;
        var bg = new myt.View(content, {
            ignoreLayout:true,
            x:0,
            y:btnContainer.y - (MP_DPY / 2),
            width:content.width,
            bgColor:'#eeeeee',
            roundedBottomLeftCorner:r,
            roundedBottomRightCorner:r
        });
        bg.setHeight(content.height - bg.y);
        bg.sendToBack();
    }
});

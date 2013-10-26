/** A modal panel that contains a Dialog.
    
    Attributes:
        displayMode:string (read only) Indicates what kind of dialog this 
            component is currently configured as. Allowed values are: 'message',
            'spinner' and 'confirm'.
*/
myt.Dialog = new JS.Class('Dialog', myt.ModalPanel, {
    // Class Methods and Attributes ////////////////////////////////////////////
    extend: {
        DEFAULT_RADIUS:12,
        DEFAULT_SHADOW:[0, 4, 20, '#666666'],
        DEFAULT_BGCOLOR:'#ffffff',
        
        /** Makes the text will wrap at 200px and the dialog will be at
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
            confirmTxt:'Confirm'
        },
        
        createCloseButton: function(targetView, callbackTarget, hoverColor, activeColor, readyColor, iconColor) {
            hoverColor = hoverColor || '#666666';
            activeColor = activeColor || '#000000';
            readyColor = readyColor || '#333333';
            iconColor = iconColor || '#ffffff';
            
            return new myt.DrawButton(targetView, {
                name:'closeBtn', width:16, height:16, y:4,
                roundedCorners:8, tooltip:'Close Dialog.',
                ignoreLayout:true, align:'right', alignOffset:4
            }, [myt.TooltipMixin, {
                doActivated: function() {callbackTarget._doCallback(this);},
                
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
                    canvas.arc(8, 8, 8, 0, Math.PI * 2);
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
        var D = myt.Dialog, content = this.content;
        content.setRoundedCorners(D.DEFAULT_RADIUS);
        content.setBgColor(D.DEFAULT_BGCOLOR);
        content.setBoxShadow(D.DEFAULT_SHADOW);
        content.setFocusCage(true);
        
        myt.Dialog.createCloseButton(content, this);
        
        this.callSuper();
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setDisplayMode: function(v) {
        this.displayMode = v;
    },
    
    setCallbackFunction: function(v) {
        this.callbackFunction = v;
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** @overrides myt.Dimmer */
    hide: function() {
        // Hide spinner related elements
        if (this.spinner) {
            this.spinner.setVisible(false);
            this.spinner = undefined;
        }
        
        this.callSuper();
    },
    
    /** @overrides myt.Dimmer */
    eatMouseEvent: function(event) {
        if (this.displayMode === 'message') this.content.closeBtn.focus();
        return this.callSuper(event);
    },
    
    /** Called before a dialog is shown to reset state and cleanup UI elements
        from the previous display of the Dialog.
        @returns void */
    _destroyContent: function() {
        var content = this.content, svs = content.getSubviews(), 
            i = svs.length, sv;
        while (i) {
            sv = svs[--i];
            if (sv.name === 'closeBtn') continue;
            sv.destroy();
        }
        
        // Message and Confirm dialogs set this.
        this.setCallbackFunction();
        
        // Confirm dialog modifies this.
        content.sizeToChildren.setPaddingY(myt.ModalPanel.DEFAULT_PADDING_Y);
    },
    
    /** Called by each of the buttons that can trigger the dialog to be hidden.
        @param sourceView:myt.View the view that triggered the hiding 
            of the dialog.
        @returns void */
    _doCallback: function(sourceView) {
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
        
        this._destroyContent();
        
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
        
        this._destroyContent();
        
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
        
        this.setDisplayMode('spinner');
    },
    
    showConfirm: function(msg, callbackFunction, opts) {
        opts = $.extend({}, myt.Dialog.CONFIRM_DEFAULTS, opts);
        
        this.showMessage(msg, callbackFunction, opts);
        
        var self = this, content = this.content, MP = myt.ModalPanel,
            MP_DPY = MP.DEFAULT_PADDING_Y,
            msg = content.msg;
        
        var btnContainer = new myt.View(content, {
            y:msg.y + msg.height + MP_DPY, align:'center'
        });
        
        var attrs = {
            name:'cancelBtn', text:opts.cancelTxt, shrinkToFit:true,
            height:20, inset:10, outset:10, roundedCorners:5,
            activeColor:'#bbbbbb', hoverColor:'#dddddd', readyColor:'#cccccc'
        };
        new myt.SimpleIconTextButton(btnContainer, attrs, [{
            doActivated: function() {self._doCallback(this);}
        }]);
        
        attrs.name = 'confirmBtn';
        attrs.text = opts.confirmTxt;
        new myt.SimpleIconTextButton(btnContainer, attrs, [{
            doActivated: function() {self._doCallback(this);}
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
        
        this.setDisplayMode('confirm');
    }
});

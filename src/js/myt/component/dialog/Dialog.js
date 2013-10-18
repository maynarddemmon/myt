/** A modal panel that contains a Dialog. */
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
        }
    },
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    doAfterAdoption: function() {
        var D = myt.Dialog, content = this.content;
        content.setRoundedCorners(D.DEFAULT_RADIUS);
        content.setBgColor(D.DEFAULT_BGCOLOR);
        content.setBoxShadow(D.DEFAULT_SHADOW);
        content.setFocusCage(true);
        
        var self = this;
        new myt.DrawButton(content, {
            name:'standardCancelBtn', width:16, height:16, y:4,
            roundedCorners:8, tooltip:'Close Dialog.',
            ignoreLayout:true, align:'right', alignOffset:4
        }, [myt.TooltipMixin, {
            doActivated: function() {
                self.doCancel();
            },
            
            draw: function(canvas, config) {
                canvas.clear();
                
                var b = config.bounds;
                if (b.w == 0 || b.h == 0) return;
                
                var fillColor;
                switch (config.state) {
                    case 'hover':
                        fillColor = '#666666';
                        break;
                    case 'active':
                        fillColor = '#000000';
                        break;
                    case 'ready':
                    case 'disabled':
                    default:
                        fillColor = '#333333';
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
                canvas.setFillStyle('#ffffff');
                canvas.fill();
            }
        }]);
        
        this.callSuper();
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////,
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
        this.content.standardCancelBtn.focus();
        return this.callSuper(event);
    },
    
    /** Called when the standard cancel button is activated.
        @returns void */
    doCancel: function() {
        this.hide();
    },
    
    /** Called before a dialog is shown to cleanup UI elements from the
        previous state of the Dialog.
        @returns void */
    _destroyContent: function() {
        var svs = this.content.getSubviews(), i = svs.length, sv;
        while (i) {
            sv = svs[--i];
            if (sv.name === 'standardCancelBtn') continue;
            sv.destroy();
        }
    },
    
    /** Shows a dialog with a message and the standard cancel button.
        @param msg:string the message to show.
        @param opts:object options that modify how the message is displayed.
            Supports: fontWeight, whiteSpace, wordWrap and width.
        @returns void */
    showMessage: function(msg, opts) {
        opts = $.extend({}, myt.Dialog.WRAP_TEXT_DEFAULTS, opts);
        var content = this.content, MP = myt.ModalPanel;
        
        this._destroyContent();
        
        new myt.Text(content, {
            text:msg,
            whiteSpace:opts.whiteSpace,
            wordWrap:opts.wordWrap,
            fontWeight:opts.fontWeight,
            x:MP.DEFAULT_PADDING_X,
            y:MP.DEFAULT_PADDING_Y,
            width:opts.width
        });
        
        this.show();
        
        var cancelBtn = content.standardCancelBtn;
        cancelBtn.setVisible(true);
        cancelBtn.focus();
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
        
        content.standardCancelBtn.setVisible(false);
    }
});

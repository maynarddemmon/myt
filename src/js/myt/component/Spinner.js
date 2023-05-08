(pkg => {
    const
        spin = spinner => {
            spinner[spinner.visible ? 'addDomClass' : 'removeDomClass']('mytCenterSpin');
        },
        
        /*  Remove the border from the dom element width and height so that the spinner doesn't 
            take up more space that the size. */
        updateSize = spinner => {
            const size = spinner.size,
                ids = spinner.getIDS();
            spinner.setWidth(size);
            spinner.setHeight(size);
            ids.width = ids.height = (size - 2*spinner.borderWidth) + 'px';
        };
    
    /** A spinner that uses the CSS border property and a CSS rotation animation to create the 
        appearance of a spinner.
        
        Events:
            spinColor
        
        Attributes:
            size:number The width and height of the spinner.
            spinColor:color_string The color spinning quarter of the border.
        
        @class */
    pkg.Spinner = new JS.Class('Spinner', pkg.View, {
        // Life Cycle //////////////////////////////////////////////////////////
        /** @overrides myt.View */
        initNode: function(parent, attrs) {
            const self = this;
            
            self.lateAttrs = ['spinColor'];
            
            attrs.visible ??= false;
            attrs.borderWidth ??= 5;
            attrs.borderColor ??= '#fff';
            attrs.borderStyle ??= 'solid';
            attrs.spinColor ??= '#000';
            
            self.callSuper(parent, attrs);
            
            self.getIDS().borderRadius = '50%';
            
            updateSize(self);
            spin(self);
        },
        
        
        // Accessors ///////////////////////////////////////////////////////////
        setSize: function(v) {
            if (this.size !== v) {
                this.size = v;
                if (this.inited) updateSize(this);
            }
        },
        
        setSpinColor: function(v) {
            if (this.spinColor !== v) {
                this.getIDS().borderTopColor = this.spinColor = v;
                if (this.inited) this.fireEvent('spinColor', v);
            }
        },
        
        /** @overrides myt.View */
        setBorderWidth: function(v) {
            if (this.borderWidth !== v) {
                this.callSuper(v);
                if (this.inited) updateSize(this);
            }
        },
        
        /** @overrides myt.View */
        setVisible: function(v) {
            if (this.visible !== v) {
                this.callSuper(v);
                if (this.inited) spin(this);
            }
        }
    });
})(myt);

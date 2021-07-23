((pkg) => {
    const STYLE_SOLID = 'solid',
        STYLE_OUTLINE = 'outline',
        DEFAULT_STYLE = STYLE_OUTLINE,
        
        defAttr = pkg.AccessorSupport.defAttr,
        
        updateUI = checkbox => {
            const label = checkbox.label || '',
                checkboxStyle = checkbox.checkboxStyle || DEFAULT_STYLE;
            checkbox.setText(
                '<i class="' + 
                (checkboxStyle === STYLE_SOLID ? 'fas' : 'far') + 
                ' fa-' + (checkbox.isChecked() ? 'check-' : '') + 'square"></i>' +
                (label.length > 0 ? ' ' : '') + label
            );
        };
    
    /** A checkbox component.
        
        Attributes:
            label:string
            checkboxStyle:string Determines what style of checkbox to display.
                Supported values are "solid" and "outline".
        
        @class */
    pkg.Checkbox = new JS.Class('Checkbox', pkg.Text, {
        include: [pkg.SimpleButtonStyle, pkg.ValueComponent],
        
        
        // Life Cycle //////////////////////////////////////////////////////////
        initNode: function(parent, attrs) {
            defAttr(attrs, 'value', false);
            defAttr(attrs, 'focusEmbellishment', false);
            defAttr(attrs, 'checkboxStyle', DEFAULT_STYLE);
            defAttr(attrs, 'activeColor', 'inherits');
            defAttr(attrs, 'hoverColor', 'inherits');
            defAttr(attrs, 'readyColor', 'inherits');
            
            this.callSuper(parent, attrs);
            
            pkg.FontAwesome.registerForNotification(this);
            
            updateUI(this);
        },
        
        
        // Accessors ///////////////////////////////////////////////////////////
        /** @overrides myt.ValueComponent */
        setValue: function(v) {
            if (this.value !== v) {
                this.callSuper(v);
                if (this.inited) updateUI(this);
            }
        },
        
        setLabel: function(v) {
            if (this.label !== v) {
                this.set('label', v, true);
                if (this.inited) updateUI(this);
            }
        },
        
        setCheckboxStyle: function(v) {
            if (this.checkboxStyle !== v) {
                this.set('checkboxStyle', v, true);
                if (this.inited) updateUI(this);
            }
        },
        
        
        // Methods /////////////////////////////////////////////////////////////
        isChecked: function() {
            return this.value === true;
        },
        
        /** @overrides myt.Button
            Toggle the value attribute when activated. */
        doActivated: function() {
            this.setValue(!this.value);
        },
        
        /** @overrides myt.SimpleButtonStyle */
        drawDisabledState: function() {
            this.setOpacity(pkg.Button.DEFAULT_DISABLED_OPACITY);
            this.setTextColor(this.readyColor);
        },
        
        /** @overrides myt.SimpleButtonStyle */
        drawHoverState: function() {
            this.setOpacity(1);
            this.setTextColor(this.hoverColor);
        },
        
        /** @overrides myt.SimpleButtonStyle */
        drawActiveState: function() {
            this.setOpacity(1);
            this.setTextColor(this.activeColor);
        },
        
        /** @overrides myt.SimpleButtonStyle */
        drawReadyState: function() {
            this.setOpacity(1);
            this.setTextColor(this.readyColor);
        }
    });
})(myt);

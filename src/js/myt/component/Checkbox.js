(pkg => {
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
            // Ensures the "pointer" cursor shows up rather than the
            // "default" cursor.
            this.appendToEarlyAttrs('userUnselectable');
            
            defAttr(attrs, 'value', false);
            defAttr(attrs, 'focusIndicator', false);
            defAttr(attrs, 'checkboxStyle', DEFAULT_STYLE);
            defAttr(attrs, 'activeColor', 'inherit');
            defAttr(attrs, 'hoverColor', 'inherit');
            defAttr(attrs, 'readyColor', 'inherit');
            
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
        draw: function(color, opacity=1) {
            this.setOpacity(opacity);
            this.setTextColor(color);
        }
    });
})(myt);

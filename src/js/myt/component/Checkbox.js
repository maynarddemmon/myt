((pkg) => {
    var STYLE_SOLID = 'solid',
        STYLE_OUTLINE = 'outline',
        DEFAULT_STYLE = STYLE_OUTLINE,
        
        updateUI = (checkbox) => {
            var label = checkbox.label || '',
                checkboxStyle = checkbox.checkboxStyle || DEFAULT_STYLE;
            checkbox.setText(
                '<i class="' + 
                (checkboxStyle === STYLE_SOLID ? 'fas' : 'far') + 
                ' fa-' + (checkbox.value === true ? 'check-' : '') + 'square"></i>' +
                (label.length > 0 ? ' ' : '') + label
            );
        };
    
    /** A checkbox component.
        
        Attributes:
            label:string
            checkboxStyle:string Determines what style of checkbox to display.
                Supported values are "solid" and "outline".
    */
    pkg.Checkbox = new JS.Class('Checkbox', pkg.Text, {
        include: [pkg.SimpleButtonStyle, pkg.ValueComponent],
        
        
        // Life Cycle //////////////////////////////////////////////////////////
        initNode: function(parent, attrs) {
            if (attrs.value == null) attrs.value = false;
            if (attrs.focusEmbellishment == null) attrs.focusEmbellishment = false;
            if (attrs.checkboxStyle == null) attrs.checkboxStyle = DEFAULT_STYLE;
            
            if (attrs.activeColor == null) attrs.activeColor = 'inherits';
            if (attrs.hoverColor == null) attrs.hoverColor = 'inherits';
            if (attrs.readyColor == null) attrs.readyColor = 'inherits';
            
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

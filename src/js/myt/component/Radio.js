((pkg) => {
    const BAGAttrName = 'selected',
        
        updateUI = (radio) => {
            const label = radio.label || '';
            radio.setText(
                '<i class="far fa-' + (radio.selected === true ? 'dot-' : '') + 'circle"></i>' +
                (label.length > 0 ? ' ' : '') + label
            );
        },
        
        /*  Search the radio group for a matching node and make that one the
            true node.
            @param {!Object} radio
            @param {*} value
            @returns {undefined} */
        updateGroupValue = (radio, value) => {
            const bag = getBooleanAttributeGroup(radio);
            if (bag) {
                const nodes = bag.getNodes();
                let i = nodes.length, 
                    node;
                while (i) {
                    node = nodes[--i];
                    if (node.optionValue === value) {
                        bag.setTrue(node);
                        break;
                    }
                }
            }
        },
        
        getBooleanAttributeGroup = (radio) => radio.getBAG(BAGAttrName, radio.groupId);
    
    /** A radio component.
        
        Attributes:
            label:string
            radioStyle:string Determines what style of radio to display.
                Supported values are "solid" and "outline".
        
        @class
    */
    pkg.Radio = new JS.Class('Radio', pkg.Text, {
        include: [pkg.SimpleButtonStyle, pkg.BAGMembership],
        
        
        // Life Cycle //////////////////////////////////////////////////////////
        initNode: function(parent, attrs) {
            if (attrs.selected == null) attrs.selected = false;
            if (attrs.groupId == null) attrs.groupId = pkg.generateGuid();
            if (attrs.focusEmbellishment == null) attrs.focusEmbellishment = false;
            
            if (attrs.activeColor == null) attrs.activeColor = 'inherits';
            if (attrs.hoverColor == null) attrs.hoverColor = 'inherits';
            if (attrs.readyColor == null) attrs.readyColor = 'inherits';
            
            const value = attrs.value;
            delete attrs.value;
            
            this.callSuper(parent, attrs);
            
            this.setValue(value);
            
            if (this.selected) {
                const bag = getBooleanAttributeGroup(this);
                if (bag) bag.setTrue(this);
            }
            
            pkg.FontAwesome.registerForNotification(this);
            
            updateUI(this);
        },
        
        
        // Accessors ///////////////////////////////////////////////////////////
        setOptionValue: function(v) {
            this.set('optionValue', v, true);
        },
        
        /** Sets the value of the radio group. Calling this method on any
            radio button in the group should have the same effect.
            @param {*} v
            @returns {undefined} */
        setValue: function(v) {
            if (this.inited) updateGroupValue(this, v);
        },
        
        /** Gets the value of the 'selected' radio button in the group.
            @returns {*} The value of the selected radio button. */
        getValue: function() {
            // Get selected radio
            const bag = getBooleanAttributeGroup(this),
                selectedRadio = bag ? bag.trueNode : null;
            return selectedRadio ? selectedRadio.optionValue : null;
        },
        
        setSelected: function(v) {
            if (this.selected !== v) {
                this.selected = v;
                if (this.inited) {
                    this.fireEvent(BAGAttrName, v);
                    updateUI(this);
                }
            }
        },
    
        setGroupId: function(v) {
            if (this.groupId !== v) {
                const oldGroupId = this.groupId;
                this.groupId = v;
                if (oldGroupId) this.removeFromBAG(BAGAttrName, oldGroupId);
                if (v) this.addToBAG(BAGAttrName, v);
                if (this.inited) this.fireEvent('groupId', v);
            }
        },
        
        setLabel: function(v) {
            if (this.label !== v) {
                this.set('label', v, true);
                if (this.inited) updateUI(this);
            }
        },
        
        
        // Methods /////////////////////////////////////////////////////////////
        /** @overrides myt.Button */
        doActivated: function() {
            if (!this.selected) this.setValue(this.optionValue);
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

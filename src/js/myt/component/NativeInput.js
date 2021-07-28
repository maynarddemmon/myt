((pkg) => {
    const JSClass = JS.Class,
        SizeToDom = pkg.SizeToDom,
        View = pkg.View,
        Disableable = pkg.Disableable,
        
        defAttr = pkg.AccessorSupport.defAttr,
        
        DEFAULT_FOCUS_SHADOW_PROPERTY_VALUE = pkg.Button.DEFAULT_FOCUS_SHADOW_PROPERTY_VALUE,
        
        setEditableTextAttr = (editableText, v, propName) => {
            if (editableText[propName] !== v) {
                editableText[propName] = v;
                editableText.getInnerDomStyle()[propName] = v + 'px';
                if (editableText.inited) {
                    editableText.fireEvent(propName, v);
                    editableText.sizeViewToDom();
                }
            }
        },
        
        setDomAttr = (inputView, attrName, value) => {
            if (inputView[attrName] !== value) {
                inputView.getInnerDomElement()[attrName] = inputView[attrName] = value;
                if (inputView.inited) inputView.fireEvent(attrName, value);
            }
        },
        
        /** A wrapper around a native HTML input element.
            
            Events:
                value:* Fired when the setValue setter is called.
            
            Attributes:
                value:* the current value of the input element.
                inputType:string (read only) the type of the input element to 
                    create. Changing this value after initialization will modify
                    the type of the underlying dom element and is not generally 
                    supported. See https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#attr-type
                    for more info and a list of allowed values.
            
            @class */
        NativeInputWrapper = pkg.NativeInputWrapper = new JSClass('NativeInputWrapper', View, {
            include: [Disableable, pkg.InputObservable],
            
            
            // Life Cycle //////////////////////////////////////////////////////
            /** @overrides myt.View */
            initNode: function(parent, attrs) {
                defAttr(attrs, 'tagName', 'input');
                defAttr(attrs, 'focusable', true);
                
                this.callSuper(parent, attrs);
                
                // Set a css class to allow scoping of CSS rules
                this.addDomClass('mytNativeInput');
            },
            
            /** @overrides myt.View */
            createOurDomElement: function(parent) {
                const elements = this.callSuper(parent);
                if (this.inputType) (Array.isArray(elements) ? elements[1] : elements).type = this.inputType;
                return elements;
            },
            
            
            // Accessors ///////////////////////////////////////////////////////
            /** @overrides myt.Disableable */
            setDisabled: function(v) {
                if (this.disabled !== v) {
                    this.getInnerDomElement().disabled = v;
                    this.callSuper(v);
                }
            },
            
            setValue: function(v) {
                if (this.value !== v) {
                    this.value = v;
                    this.setDomValue(v);
                    if (this.inited) this.fireEvent('value', v);
                }
            },
            
            
            // Methods /////////////////////////////////////////////////////////
            /** Gets the value from the DOM.
                @returns * The value */
            getDomValue: function() {
                return this.getInnerDomElement().value;
            },
            
            /** Sets the value on the DOM.
                @param v:* The value to set.
                @returns {undefined} */
            setDomValue: function(v) {
                const de = this.getInnerDomElement();
                if (de.value !== v) de.value = v;
            }
        }),
        
        /** An option in a native HTML select element.
            
            Events:
                value:*
                label:string
            
            Attributes:
                value:* the value of the option.
                label:string the text label for the option.
            
            @class */
        InputSelectOption = pkg.InputSelectOption = new JSClass('InputSelectOption', View, {
            include: [Disableable, pkg.Selectable],
            
            
            // Life Cycle //////////////////////////////////////////////////////
            /** @overrides myt.Input */
            createOurDomElement: parent => document.createElement('option'),
            
            
            // Accessors ///////////////////////////////////////////////////////
            /** @overrideds myt.Selectable */
            setSelected: function(v) {
                v = this.valueFromEvent(v);
                const de = this.getInnerDomElement();
                if (de.selected !== v) de.selected = v;
            },
            
            /** @overrides myt.Disableable */
            setDisabled: function(v) {
                if (this.disabled !== v) {
                    this.getInnerDomElement().disabled = v;
                    this.callSuper(v);
                }
            },
            
            setValue: function(v) {setDomAttr(this, 'value', v);},
            
            setLabel: function(v) {
                if (this.label !== v) {
                    this.getInnerDomElement().textContent = this.label = v;
                    if (this.inited) this.fireEvent('label', v);
                }
            },
            
            
            // Methods /////////////////////////////////////////////////////////
            /** @overrideds myt.Selectable */
            isSelected: function() {
                return this.getInnerDomElement().selected;
            },
            
            /** @overrideds myt.Selectable */
            canSelect: function(selectionManager) {
                return !this.disabled && !this.getInnerDomElement().selected && this.parent === selectionManager;
            },
            
            /** @overrideds myt.Selectable */
            canDeselect: function(selectionManager) {
                return !this.disabled && this.getInnerDomElement().selected && this.parent === selectionManager;
            }
        }),
        
        /** A base class for input:text and textarea components.
            
            Events:
                spellcheck:boolean
                maxLength:int
                placeholder:string
            
            Attributes:
                spellcheck:boolean Turns browser spellchecking on and off. 
                    Defaults to false.
                maxLength:int Sets a maximum number of input characters. Set to
                    a negative number to turn off max length. Defaults to 
                    undefined which is equivalent to a negative number.
                allowedChars:string Each character in the string is an allowed
                    input character. If not set or empty all characters are 
                    allowed. Defaults to undefined.
                placeholder:string Text that will be shown if the value 
                    is empty.
            
            @class */
        BaseInputText = pkg.BaseInputText = new JSClass('BaseInputText', NativeInputWrapper, {
            include: [pkg.TextSupport],
            
            
            // Life Cycle //////////////////////////////////////////////////////
            /** @overrides myt.NativeInputWrapper */
            initNode: function(parent, attrs) {
                const self = this;
                
                defAttr(attrs, 'bgColor', 'transparent');
                defAttr(attrs, 'spellcheck', false);
                
                self.callSuper(parent, attrs);
                
                self.attachToDom(self, '__syncToDom', 'input');
                
                // Allow filtering of input
                self.attachToDom(self, '__filterInputPress', 'keypress');
                self.attachToDom(self, '__filterInput', 'keyup');
            },
            
            
            // Accessors ///////////////////////////////////////////////////////
            /** @overrides myt.TextSupport
                Alias setText to setValue. */
            setText: function(v) {
                this.callSuper(v);
                this.setValue(v);
            },
            
            setSpellcheck: function(v) {setDomAttr(this, 'spellcheck', v);},
            setMaxLength: function(v) {setDomAttr(this, 'maxLength', v == null || v < 0 ? undefined : v);},
            setAllowedChars: function(v) {this.allowedChars = v;},
            setPlaceholder: function(v) {setDomAttr(this, 'placeholder', v);},
            
            
            // Methods /////////////////////////////////////////////////////////
            /** @overrides myt.FocusObservable */
            showFocusIndicator: function() {
                this.hideDefaultFocusIndicator();
                this.setBoxShadow(DEFAULT_FOCUS_SHADOW_PROPERTY_VALUE);
            },
            
            /** @overrides myt.FocusObservable */
            hideFocusIndicator: function() {
                this.hideDefaultFocusIndicator();
                this.setBoxShadow();
            },
            
            /** @private
                @param {!Object} event
                @returns {undefined} */
            __filterInput: function(event) {
                this.setDomValue(this.filterInput(this.getDomValue()));
            },
            
            /** @private
                @param {!Object} event
                @returns {undefined} */
            __filterInputPress: function(event) {
                const domEvent = event.value,
                    charCode = domEvent.which;
                
                // Firefox fires events for arrow keys and backspace which should be
                // ignored completely.
                switch (charCode) {
                    case 8: // backspace key
                    case 0: // arrow keys have a "charCode" of 0 in firefox.
                        return;
                }
                
                // Filter for allowed characters
                const allowedChars = this.allowedChars;
                if (allowedChars && allowedChars.indexOf(String.fromCharCode(charCode)) === -1) domEvent.preventDefault();
                
                this.filterInputPress(domEvent);
            },
            
            /** A hook for subclasses/instances to do input filtering. The default
                implementation returns the value unchanged.
                @param {string} v - the current value of the form element.
                @returns {string} The new value of the form element. */
            filterInput: v => v,
            
            /** A hook for subclasses/instances to do input filtering during key press.
                The default implementation does nothing.
                @param {!Object} domEvent - The dom key press event.
                @returns {undefined} */
            filterInputPress: domEvent => {},
            
            /** @private
                @param {!Object} event
                @returns {undefined} */
            __syncToDom: function(event) {
                this.setValue(this.getDomValue());
            },
            
            /** Gets the location of the caret.
                @returns {number} An integer. */
            getCaretPosition: function() {
                // IE Support
                if (document.selection) {
                    const selection = document.selection.createRange();
                    selection.moveStart('character', -this.getDomValue().length);
                    return selection.text.length;
                }
                
                return this.getInnerDomElement().selectionStart || 0;
            },
            
            /** Sets the caret and selection.
                @param start:int the start of the selection or location of the caret
                    if no end is provided.
                @param end:int (optional) the end of the selection.
                @returns {undefined} */
            setCaretPosition: function(start, end) {
                if (end == null || start === end) {
                    // Don't update if the current position already matches.
                    if (this.getCaretPosition() === start) return;
                    
                    end = start;
                }
                const elem = this.getInnerDomElement();
                
                if (elem.setSelectionRange) {
                    elem.setSelectionRange(start, end);
                } else if (elem.createTextRange) {
                    const range = elem.createTextRange();
                    range.collapse(true);
                    range.moveEnd('character', end);
                    range.moveStart('character', start);
                    range.select();
                }
            },
            
            /** Sets the caret to the start of the text input.
                @returns {undefined} */
            setCaretToStart: function() {
                this.setCaretPosition(0);
            },
            
            /** Sets the caret to the end of the text input.
                @returns {undefined} */
            setCaretToEnd: function() {
                this.setCaretPosition(this.getDomValue().length);
            },
            
            // Selection //
            /** Selects all the text in the input element.
                @returns {undefined} */
            selectAll: function() {
                this.getInnerDomElement().select();
            },
            
            getSelection: function() {
                const de = this.getInnerDomElement();
                return {
                    start:de.selectionStart,
                    startElem:de,
                    end:de.selectionEnd,
                    endElem:de
                };
            },
            
            setSelection: function(selection) {
                if (selection) this.setCaretPosition(selection.start, selection.end);
            },
            
            saveSelection: function(selection) {
                this._selRange = selection || this.getSelection() || this._selRange;
            },
            
            restoreSelection: function() {
                this.setSelection(this._selRange);
            }
        }),
        
        /** A view that accepts single line user text input.
            
            @class */
        InputText = pkg.InputText = new JSClass('InputText', BaseInputText, {
            include: [pkg.SizeHeightToDom],
            
            
            // Life Cycle //////////////////////////////////////////////////////
            /** @overrides myt.Input */
            initNode: function(parent, attrs) {
                this.inputType = attrs.password === true ? 'password' : 'text';
                
                this.callSuper(parent, attrs);
                
                this.setCaretToEnd();
            },
            
            // Accessors ///////////////////////////////////////////////////////
            setPassword: function(v) {this.password = v;}
        });
    
    /** Text content that can be edited.
        
        Events:
            contentEditable:boolean
            minWidth:number
        
        Attributes:
            contentEditble:boolean Makes the text editable or not.
            minWidth:number The minimum width for the component. Defaults to 
                undefined which is effectively 0.
            minHeight:number The minimum height for the component. Defaults to 
                undefined which is effectively 0.
        
        Private Attributes:
            _selRange:object Stores the start and end of the selection.
        
        @class */
    pkg.EditableText = new JSClass('EditableText', BaseInputText, {
        include: [SizeToDom],
        
        
        // Life Cycle //////////////////////////////////////////////////////////
        /** @overrides myt.BaseInputText */
        initNode: function(parent, attrs) {
            const self = this;
            
            defAttr(attrs, 'tagName', 'div');
            attrs.inputType = null;
            
            defAttr(attrs, 'whiteSpace', 'pre');
            defAttr(attrs, 'contentEditable', true);
            
            self.callSuper(parent, attrs);
            
            self.attachToDom(self, '__cleanInput', 'keydown');
            self.attachToDom(self, '__userInteraction', 'keyup');
            self.attachToDom(self, '__userInteraction', 'mouseup');
            
            self.setCaretToEnd();
        },
        
        
        // Attributes //////////////////////////////////////////////////////////
        setMinWidth: function(v) {setEditableTextAttr(this, v, 'minWidth');},
        setMinHeight: function(v) {
            if (BrowserDetect.browser === 'Firefox') v += 2;
            setEditableTextAttr(this, v, 'minHeight');
        },
        setPadding: function(v) {
            this.setPaddingTop(v);
            this.setPaddingRight(v);
            this.setPaddingBottom(v);
            this.setPaddingLeft(v);
        },
        setPaddingTop: function(v) {setEditableTextAttr(this, v, 'paddingTop');},
        setPaddingRight: function(v) {setEditableTextAttr(this, v, 'paddingRight');},
        setPaddingBottom: function(v) {setEditableTextAttr(this, v, 'paddingBottom');},
        setPaddingLeft: function(v) {setEditableTextAttr(this, v, 'paddingLeft');},
        setContentEditable: function(v) {setDomAttr(this, 'contentEditable', v);},
        
        
        // Methods /////////////////////////////////////////////////////////////
        /** @overrides myt.BaseInputText */
        filterInputPress: function(domEvent) {
            // Implement maxLength
            const maxLength = this.maxLength;
            if (maxLength >= 0 && this.getCharacterCount() === maxLength) domEvent.preventDefault();
            
            this.callSuper(domEvent);
        },
        
        /** @overrides myt.NativeInputWrapper */
        getDomValue: function() {
            return this.getInnerDomElement().innerHTML;
        },
        
        /** @overrides myt.NativeInputWrapper */
        setDomValue: function(v) {
            const de = this.getInnerDomElement();
            if (de.innerHTML !== v) {
                de.innerHTML = v;
                this.sizeViewToDom();
                this.restoreSelection();
            }
        },
        
        /** @private
            @param {!Object} event
            @returns {undefined} */
        __cleanInput: function(event) {
            // Prevent enter key from inserting a div
            if (pkg.KeyObservable.getKeyCodeFromEvent(event) === 13) {
                event.value.preventDefault();
                
                // Instead, insert a linefeed if wrapping is allowed.
                if (this.whitespace !== 'nowrap') {
                    document.execCommand('insertHTML', false, this.isCaretAtEnd() ? '\n\n' : '\n');
                }
            }
        },
        
        /** @overrides myt.BaseInputText */
        __syncToDom: function(event) {
            this.callSuper(event);
            
            this.saveSelection();
            this.sizeViewToDom();
            this.restoreSelection();
        },
        
        // Caret handling
        getCharacterCount: function() {
            const elem = this.getInnerDomElement().firstChild;
            return elem ? elem.length : 0;
        },
        
        isCaretAtEnd: function() {
            return this.getCaretPosition() === this.getCharacterCount();
        },
        
        /** @overrides myt.BaseInputText */
        getCaretPosition: function() {
            const selection = this.getSelection();
            return selection ? selection.end : 0;
        },
        
        /** @overrides myt.BaseInputText */
        setCaretPosition: function(start, end) {
            if (end == null || start === end) {
                // Don't update if the current position already matches.
                if (this.getCaretPosition() === start) return;
                
                end = start;
            }
            this.saveSelection({
                start:start,
                startElem:this.getInnerDomElement().firstChild,
                end:end,
                endElem:this.getInnerDomElement().firstChild
            });
        },
        
        // Selection handling
        /** @overrides myt.FocusObservable */
        doFocus: function() {
            this.callSuper();
            this.restoreSelection();
        },
        
        /** @private
            @param {!Object} event
            @returns {undefined} */
        __userInteraction: function(event) {
            this.saveSelection();
            return true;
        },
        
        /** @overrides myt.BaseInputText */
        getSelection: function() {
            let range;
            if (window.getSelection) {
                const sel = window.getSelection();
                if (sel.rangeCount > 0) {
                    // Sometimes when deleting we get an unexpected node
                    if (sel.extentNode === this.getInnerDomElement()) return null;
                    
                    range = sel.getRangeAt(0);
                }
            } else if (document.selection) {
                range = document.selection.createRange();
            }
            
            return {
                start:range ? range.startOffset : 0,
                startElem:range ? range.startContainer : this.getInnerDomElement().firstChild,
                end:range ? range.endOffset : 0,
                endElem:range ? range.endContainer : this.getInnerDomElement().firstChild
            };
        },
        
        /** @overrides myt.BaseInputText */
        setSelection: function(selection) {
            if (selection) {
                const startElem = selection.startElem,
                    endElem = selection.endElem;
                if (startElem && startElem.parentNode && endElem && endElem.parentNode) {
                    const range = document.createRange();
                    range.setStart(startElem, Math.min(selection.start, startElem.length));
                    range.setEnd(endElem, Math.min(selection.end, endElem.length));
                    
                    if (window.getSelection) {
                        const sel = window.getSelection();
                        if (sel.rangeCount > 0) sel.removeAllRanges();
                        sel.addRange(range);
                    } else if (document.selection) {
                        range.select();
                    }
                }
            }
        }
    });
    
    /** A view that accepts multi line user text input.
        
        Events:
            resize:string
            wrap:string
        
        Attributes:
            resize:string Sets how the textarea can be resized. Defaults to 'none'.
                Allowed values: 'none', 'both', 'horizontal', 'vertical'.
            wrap:string Sets how text will wrap. Defaults to 'soft'.
                Allowed values: 'off', 'hard', 'soft'.
        
        @class */
    pkg.InputTextArea = new JSClass('InputTextArea', BaseInputText, {
        // Life Cycle //////////////////////////////////////////////////////////
        /** @overrides myt.BaseInputText */
        initNode: function(parent, attrs) {
            defAttr(attrs, 'tagName', 'textarea');
            attrs.inputType = null;
            defAttr(attrs, 'resize', 'none');
            defAttr(attrs, 'wrap', 'soft');
            
            this.callSuper(parent, attrs);
        },
        
        
        // Accessors ///////////////////////////////////////////////////////////
        setResize: function(v) {
            if (this.resize !== v) {
                this.resize = this.getInnerDomStyle().resize = v || 'none';
                if (this.inited) this.fireEvent('resize', v);
            }
        },
        
        setWrap: function(v) {setDomAttr(this, 'wrap', v);}
    });
    
    /** A text input with select list.
        
        Attributes:
            filterItems:boolean Indicates if the list items should be filtered
                down based on the current value. Defaults to true.
            fullItemConfig:array The full list of items that can be shown in the
                list. The actual itemConfig used will be filtered based on the
                current value of the input text.
        
        @class */
    pkg.ComboBox = new JSClass('ComboBox', InputText, {
        include: [
            pkg.Activateable,
            pkg.KeyActivation,
            pkg.ListViewAnchor
        ],
        
        
        // Life Cycle //////////////////////////////////////////////////////////
        /** @overrides myt.Input */
        initNode: function(parent, attrs) {
            this.filterItems = true;
            
            defAttr(attrs, 'activationKeys', [13,27,38,40]);
            defAttr(attrs, 'bgColor', '#fff');
            defAttr(attrs, 'borderWidth', 1);
            defAttr(attrs, 'borderStyle', 'solid');
            defAttr(attrs, 'floatingAlignOffset', attrs.borderWidth);
            defAttr(attrs, 'listViewAttrs', {maxHeight:99});
            defAttr(attrs, 'fullItemConfig', []);
            
            this.callSuper(parent, attrs);
        },
        
        
        // Accessors ///////////////////////////////////////////////////////////
        setFullItemConfig: function(v) {this.fullItemConfig = v;},
        setFilterItems: function(v) {this.filterItems = v;},
        
        
        // Methods /////////////////////////////////////////////////////////////
        /** @overrides
            Show floating panel if the value has changed during during
            user interaction. */
        __syncToDom: function(event) {
            const existing = this.value;
            this.callSuper(event);
            if (existing !== this.value) this.showFloatingPanel();
        },
        
        /** @overrides */
        showFloatingPanel: function(panelId) {
            const fp = this.getFloatingPanel(panelId);
            if (fp) {
                // Filter config
                let itemConfig;
                if (this.filterItems) {
                    itemConfig = [];
                    
                    const curValue = this.value,
                        normalizedCurValue = curValue == null ? '' : ('' + curValue).toLowerCase(),
                        fullItemConfig = this.fullItemConfig,
                        len = fullItemConfig.length;
                    for (let i = 0; len > i;) {
                        const item = fullItemConfig[i++],
                            normalizedItemValue = item.attrs.text.toLowerCase(),
                            idx = normalizedItemValue.indexOf(normalizedCurValue);
                        if (idx === 0) {
                            if (normalizedItemValue !== normalizedCurValue) itemConfig.push(item);
                        } else if (idx > 0) {
                            itemConfig.push(item);
                        }
                    }
                } else {
                    itemConfig = this.fullItemConfig;
                }
                
                if (itemConfig.length > 0) {
                    fp.setMinWidth(this.width - 2 * this.borderWidth); // Must be set before setItemConfig
                    this.setItemConfig(itemConfig);
                    this.callSuper(panelId);
                } else {
                    this.hideFloatingPanel(panelId);
                }
            }
        },
        
        /** @overrides */
        doItemActivated: function(itemView) {
            this.setValue(itemView.text);
            this.callSuper(itemView);
        },
        
        /** @overrides */
        doActivated: function() {
            this.toggleFloatingPanel();
        }
    });
    
    /** A wrapper around a native HTML select component.
        
        Events:
            multiple:boolean
            size:int
            value:string
        
        Attributes:
            multiple:boolean Indicates if multiple options can be selected or not.
                Defaults to false.
            size:int The number of options to show. The default value is 4 for
                multiple == true and 1 for multiple == false. It is recommended
                that a size of at least 4 be used when multiple is 2.
            options:array (write only) Adds a list of options to this select list.
                The value should be an array of myt.InputSelectOptions attrs that 
                will be used to instantiate new myt.InputSelectOption instances on
                this select list.
        
        @class */
    pkg.InputSelect = new JSClass('InputSelect', NativeInputWrapper, {
        include: [SizeToDom],
        
        
        // Life Cycle //////////////////////////////////////////////////////////
        /** @overrides myt.NativeInputWrapper */
        initNode: function(parent, attrs) {
            defAttr(attrs, 'tagName', 'select');
            attrs.inputType = null;
            defAttr(attrs, 'multiple', false);
            defAttr(attrs, 'size', attrs.multiple ? 4 : 1);
            this.callSuper(parent, attrs);
            
            this.attachToDom(this, '__syncToDom', 'change');
            
            // Make sure initial value is in sync with the UI
            this.__syncToDom();
        },
        
        
        // Accessors ///////////////////////////////////////////////////////////
        setMultiple: function(v) {setDomAttr(this, 'multiple', v);},
        setSize: function(v) {setDomAttr(this, 'size', v);},
        
        setOptions: function(v) {
            this.destroyAllOptions();
            if (Array.isArray(v)) v.forEach(option => {this.addOption(option);});
        },
        
        /** The options are just the subviews.
            @returns an array of options for this select list. */
        getOptions: function() {
            return this.getSubviews().concat();
        },
        
        /** @overrides myt.NativeInputWrapper
            Does not update the dom since the dom element's 'value' attribute
            doesn't support lists. */
        setValue: function(v) {
            if (Array.isArray(v) && pkg.areArraysEqual(v, this.value)) return;
            
            if (this.value !== v) {
                this.value = v;
                if (this.inited) this.fireEvent('value', v);
            }
        },
        
        
        // Methods /////////////////////////////////////////////////////////////
        /** @overrides myt.View */
        subviewAdded: function(sv) {
            // Destroy subview if it's not supported.
            if (!(sv instanceof InputSelectOption)) {
                pkg.dumpStack("Subview not supported. Destroying it.");
                sv.destroy();
            }
        },
        
        /** @overrides myt.FocusObservable */
        showFocusIndicator: function() {
            this.hideDefaultFocusIndicator();
            this.setBoxShadow(DEFAULT_FOCUS_SHADOW_PROPERTY_VALUE);
        },
        
        /** @overrides myt.FocusObservable */
        hideFocusIndicator: function() {
            this.hideDefaultFocusIndicator();
            this.setBoxShadow();
        },
        
        // Options //
        /** Gets an array of selected myt.InputSelectOptions.
            @returns {!Array} - An array of selected myt.InputSelectOptions. */
        getSelectedOptions: function() {
            return this.getOptions().filter(option => option.isSelected());
        },
        
        /** Gets an array of selected myt.InputSelectOption values.
            @returns {!Array} - An array of selected option values. */
        getSelectedOptionValues: function() {
            return this.getSelectedOptions().map(option => option.value);
        },
        
        /** Gets the myt.InputSelectOption with the provided value.
            @param {*} value - The value of the option to get.
            @returns {?Object} - The matching myt.InputSelectOption option 
                or undefined if not found. */
        getOptionForValue: function(value) {
            return this.getOptions().find(option => option.value === value);
        },
        
        /** Adds a new myt.InputSelectionOption to this select list.
            @param attrs:object The attrs for the new option
            @returns myt.InputSelectOption: The newly created option. */
        addOption: function(attrs) {
            return new InputSelectOption(this, attrs);
        },
        
        destroyAllOptions: function() {
            this.getOptions().forEach(option => {option.destroy();});
        },
        
        /** Destroys an option that has the provided value.
            @param value:* The value of the option to remove.
            @returns boolean: true if the option is destroyed, false otherwise. */
        destroyOptionWithValue: function(value) {
            const option = this.getOptionForValue(value);
            if (option) {
                option.destroy();
                if (option.destroyed) return true;
            }
            return false;
        },
        
        // Selection //
        /** Deselects all selected options included disabled options.
            @returns {undefined} */
        deselectAll: function() {
            let changed = false;
            this.getOptions().forEach(option => {
                if (option.isSelected()) {
                    option.setSelected(false);
                    changed = true;
                }
            });
            if (changed) this.__doChanged();
        },
        
        selectValues: function(values) {
            (Array.isArray(values) ? values : [values]).forEach(value => {this.selectValue(value);});
        },
        
        /** Selects the option that has the provided value.
            @param value:* The value of the option to select.
            @returns {undefined} */
        selectValue: function(value) {
            this.select(this.getOptionForValue(value));
        },
        
        /** Selects the provided option.
            @param option:myt.InputSelectOption The option to select.
            @returns {undefined} */
        select: function(option) {
            if (option && option.canSelect(this)) {
                option.setSelected(true);
                this.__syncToDom();
            }
        },
        
        /** Deselects the option that has the provided value.
            @param {*} value - The value of the option to deselect.
            @returns {undefined} */
        deselectValue: function(value) {
            this.deselect(this.getOptionForValue(value));
        },
        
        /** Deselects the provided option.
            @param option:myt.InputSelectOption The option to deselect.
            @returns {undefined} */
        deselect: function(option) {
            if (option && option.canDeselect(this)) {
                option.setSelected(false);
                this.__syncToDom();
            }
        },
        
        /** @private
            @param {!Object} event
            @returns {undefined} */
        __doChanged: function(event) {
            this.__syncToDom();
            this.doChanged();
        },
        
        /** Called whenever the underlying dom element fires a "change" event.
            @returns {undefined} */
        doChanged: () => {},
        
        /** @private
            @returns {undefined} */
        __syncToDom: function() {
            this.setValue(this.multiple ? this.getSelectedOptionValues() : this.getDomValue());
        }
    });
})(myt);

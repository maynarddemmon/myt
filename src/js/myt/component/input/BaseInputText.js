/** A base class for input:text and textarea components.
    
    Events:
        spellcheck:boolean
        maxLength:int
        placeholder:string
    
    Attributes:
        spellcheck:boolean Turns browser spellchecking on and off. Defaults
            to false.
        maxLength:int Sets a maximum number of input characters. Set to a
            negative number to turn off max length. Defaults to undefined
            which is equivalent to a negative number.
        allowedChars:string Each character in the string is an allowed
            input character. If not set or empty all characters are allowed. 
            Defaults to undefined.
        placeholder:string Text that will be shown if the value is empty.
    
    @class
*/
myt.BaseInputText = new JS.Class('BaseInputText', myt.NativeInputWrapper, {
    include: [myt.TextSupport],
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides myt.NativeInputWrapper */
    initNode: function(parent, attrs) {
        var self = this;
        
        if (attrs.bgColor == null) attrs.bgColor = 'transparent';
        if (attrs.spellcheck == null) attrs.spellcheck = false;
        
        self.callSuper(parent, attrs);
        
        self.attachToDom(self, '__syncToDom', 'input');
        
        // Allow filtering of input
        self.attachToDom(self, '__filterInputPress', 'keypress');
        self.attachToDom(self, '__filterInput', 'keyup');
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    /** @overrides myt.TextSupport
        Alias setText to setValue. */
    setText: function(v) {
        this.callSuper(v);
        
        this.setValue(v);
    },
    
    setSpellcheck: function(v) {
        if (this.spellcheck !== v) {
            this.spellcheck = this.getInnerDomElement().spellcheck = v;
            if (this.inited) this.fireEvent('spellcheck', v);
        }
    },
    
    setMaxLength: function(v) {
        if (v == null || 0 > v) v = undefined;
        
        if (this.maxLength !== v) {
            this.maxLength = this.getInnerDomElement().maxLength = v;
            if (this.inited) this.fireEvent('maxLength', v);
        }
    },
    
    setAllowedChars: function(v) {this.allowedChars = v;},
    
    setPlaceholder: function(v) {
        if (this.placeholder !== v) {
            this.getInnerDomElement().placeholder = this.placeholder = v;
            if (this.inited) this.fireEvent('placeholder', v);
        }
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** @overrides myt.FocusObservable */
    showFocusEmbellishment: function() {
        this.hideDefaultFocusEmbellishment();
        this.setBoxShadow(myt.Button.DEFAULT_FOCUS_SHADOW_PROPERTY_VALUE);
    },
    
    /** @overrides myt.FocusObservable */
    hideFocusEmbellishment: function() {
        this.hideDefaultFocusEmbellishment();
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
        var domEvent = event.value,
            charCode = domEvent.which;
        
        // Firefox fires events for arrow keys and backspace which should be
        // ignored completely.
        switch (charCode) {
            case 8: // backspace key
            case 0: // arrow keys have a "charCode" of 0 in firefox.
                return;
        }
        
        // Filter for allowed characters
        var allowedChars = this.allowedChars;
        if (allowedChars && allowedChars.indexOf(String.fromCharCode(charCode)) === -1) domEvent.preventDefault();
        
        this.filterInputPress(domEvent);
    },
    
    /** A hook for subclasses/instances to do input filtering. The default
        implementation returns the value unchanged.
        @param {string} v - the current value of the form element.
        @returns {string} The new value of the form element. */
    filterInput: function(v) {
        return v;
    },
    
    /** A hook for subclasses/instances to do input filtering during key press.
        The default implementation does nothing.
        @param {!Object} domEvent - The dom key press event.
        @returns {undefined} */
    filterInputPress: function(domEvent) {},
    
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
            var selection = document.selection.createRange();
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
        var elem = this.getInnerDomElement();
        
        if (elem.setSelectionRange) {
            elem.setSelectionRange(start, end);
        } else if (elem.createTextRange) {
            var range = elem.createTextRange();
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
        var de = this.getInnerDomElement();
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
});

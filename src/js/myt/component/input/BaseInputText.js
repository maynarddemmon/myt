/** A base class for input:text and textarea components.
    
    Attributes:
        spellcheck:boolean turns browser spellchecking on and off.
        maxLength:int sets a maximum number of input characters. Set to -1 to
            turn of max length.
*/
myt.BaseInputText = new JS.Class('BaseInputText', myt.NativeInputWrapper, {
    include: [myt.TextSupport],
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides myt.NativeInputWrapper */
    initNode: function(parent, attrs) {
        if (attrs.bgColor === undefined) attrs.bgColor = 'transparent';
        if (attrs.spellcheck === undefined) attrs.spellcheck = false;
        
        this.callSuper(parent, attrs);
        
        this.attachToDom(this, '_handleInput', 'input');
        
        // Allow filtering of input
        this.attachToDom(this, '_filterInput', 'keypress');
        this.attachToDom(this, '_filterInput', 'keyup');
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    /** @overrides myt.TextSupport
        Alias setText to setValue. */
    setText: function(v) {
        this.callSuper(v);
        
        this.setValue(v);
    },
    
    setSpellcheck: function(v) {
        if (this.spellcheck === v) return;
        this.spellcheck = this.domElement.spellcheck = v;
        if (this.inited) this.fireNewEvent('spellcheck', v);
    },
    
    setMaxLength: function(v) {
        if (v === null || v === undefined || 0 > v) v = undefined;
        
        if (this.maxLength === v) return;
        this.maxLength = this.domElement.maxLength = v;
        if (this.inited) this.fireNewEvent('maxLength', v);
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    _filterInput: function(v) {
        var de = this.domElement;
        var curValue = de.value;
        var newValue = this.filterInput(curValue);
        if (curValue !== newValue) de.value = newValue;
    },
    
    filterInput: function(v) {
        return v;
    },
    
    _handleInput: function(event) {
        this.setValue(this.domElement.value);
    },
    
    /** Gets the location of the caret.
        @returns int. */
    getCaretPosition: function() {
        var elem = this.domElement;
        
        if (document.selection) {
            // IE Support
            var selection = document.selection.createRange();
            selection.moveStart('character', -elem.value.length);
            return selection.text.length;
        } else if (elem.selectionStart || elem.selectionStart === 0) {
            return elem.selectionStart;
        }
        return 0;
    },
    
    /** Sets the caret and selection.
        @param start:int the start of the selection or location of the caret
            if no end is provided.
        @param end:int (optional) the end of the selection.
        @returns void */
    setCaretPosition: function(start, end) {
        if (end === undefined || start === end) {
            // Don't update if the current position already matches.
            var curPos = this.getCaretPosition();
            if (curPos === start) return;
            
            end = start;
        }
        var elem = this.domElement;
        
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
        @returns void */
    setCaretToStart: function() {
        this.setCaretPosition(0);
    },
    
    /** Sets the caret to the end of the text input.
        @returns void */
    setCaretToEnd: function() {
        this.setCaretPosition(this.domElement.value.length);
    },
    
    /** Selects all the text in the input element.
        @returns void */
    selectAll: function() {
        this.domElement.select();
    }
});

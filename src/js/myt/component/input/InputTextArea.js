/** A view that accepts multi line user text input.
    
    Events:
        resize:string
        wrap:string
    
    Attributes:
        resize:string Sets how the textarea can be resized. Defaults to 'none'.
            Allowed values: 'none', 'both', 'horizontal', 'vertical'.
        wrap:string Sets how text will wrap. Defaults to 'soft'.
            Allowed values: 'off', 'hard', 'soft'.
*/
myt.InputTextArea = new JS.Class('InputTextArea', myt.BaseInputText, {
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides myt.BaseInputText */
    initNode: function(parent, attrs) {
        if (attrs.tagName == null) attrs.tagName = 'textarea';
        attrs.inputType = null;
        
        if (attrs.resize == null) attrs.resize = 'none';
        if (attrs.wrap == null) attrs.wrap = 'soft';
        
        this.callSuper(parent, attrs);
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setResize: function(v) {
        if (this.resize !== v) {
            this.resize = this.getInnerDomStyle().resize = v || 'none';
            if (this.inited) this.fireEvent('resize', v);
        }
    },
    
    setWrap: function(v) {
        if (this.wrap !== v) {
            this.wrap = this.getInnerDomElement().wrap = v;
            if (this.inited) this.fireEvent('wrap', v);
        }
    }
});

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
        if (attrs.resize === undefined) attrs.resize = 'none';
        if (attrs.wrap === undefined) attrs.wrap = 'soft';
        
        this.callSuper(parent, attrs);
    },
    
    /** @overrides myt.NativeInputWrapper */
    createOurDomElement: function(parent) {
        var elem = document.createElement('textarea');
        elem.style.position = 'absolute';
        return elem;
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setResize: function(v) {
        if (this.resize !== v) {
            this.resize = this.deStyle.resize = v ? v : 'none';
            if (this.inited) this.fireNewEvent('resize', v);
        }
    },
    
    setWrap: function(v) {
        if (this.wrap !== v) {
            this.wrap = this.domElement.wrap = v;
            if (this.inited) this.fireNewEvent('wrap', v);
        }
    }
});

/** A view that accepts multi line user text input.
    
    Attributes:
        resize:string sets how the textarea can be resized. Defaults to 'none'.
            Allowed values: 'none', 'both', 'horizontal', 'vertical'.
        wrap:string sets how text will wrap. Defaults to 'soft'.
            Allowed values: 'off', 'hard', 'soft'.
*/
myt.InputTextArea = new JS.Class('InputTextArea', myt.BaseInputText, {
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides myt.BaseInputText */
    initNode: function(parent, attrs) {
        // Modify attrs so setter gets called.
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
        if (this.resize === v) return;
        this.resize = v
        this.deStyle.resize = v ? v : 'none';
        if (this.inited) this.fireNewEvent('resize', v);
    },
    
    setWrap: function(v) {
        if (this.wrap === v) return;
        this.wrap = this.domElement.wrap = v;
        if (this.inited) this.fireNewEvent('wrap', v);
    }
});

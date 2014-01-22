/** Mix onto a view to make it behave as a checkbox button. Use setValue to 
    set the checked state of the checkbox.
    
    Requires:
        Should be used on: myt.DrawButton or subclass thereof.
    
    Events:
        None
    
    Attributes:
        None
*/
myt.CheckboxMixin = new JS.Module('CheckboxMixin', {
    include: [myt.ValueComponent, myt.CheckboxStyleMixin],
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    initNode: function(parent, attrs) {
        if (attrs.value === undefined) attrs.value = false;
        if (attrs.drawingMethodClassname === undefined) attrs.drawingMethodClassname = 'myt.CheckboxDrawingMethod';
        
        this.callSuper(parent, attrs);
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    /** @overrides myt.ValueComponent */
    setValue: function(v) {
        if (this.value !== v) {
            this.callSuper(v);
            
            if (this.inited) this.redraw();
        }
    },
    
    /** @overrides myt.CheckboxStyleMixin */
    getDrawConfig: function(state) {
        var config = this.callSuper(state);
        config.checked = this.value;
        return config;
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** @overrides myt.DrawButton
        Toggle the value attribute when activated. */
    doActivated: function() {
        this.setValue(!this.value);
    }
});

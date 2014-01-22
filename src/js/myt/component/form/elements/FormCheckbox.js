/** An myt.Checkbox that is also a FormElement.
    
    Events:
        None
    
    Attributes:
        None
*/
myt.FormCheckbox = new JS.Class('FormCheckbox', myt.Checkbox, {
    include: [myt.FormElement],
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides */
    initNode: function(parent, attrs) {
        this.rollbackValue = this.defaultValue = false;
        
        this.callSuper(parent, attrs);
    }
});

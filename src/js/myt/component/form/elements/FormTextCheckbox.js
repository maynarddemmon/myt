/** An myt.TextCheckbox that is also a FormElement.
    
    Events:
        None
    
    Attributes:
        None
*/
myt.FormTextCheckbox = new JS.Class('FormTextCheckbox', myt.TextCheckbox, {
    include: [myt.FormElement],
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides */
    initNode: function(parent, attrs) {
        this.rollbackValue = this.defaultValue = false;
        
        this.callSuper(parent, attrs);
    }
});

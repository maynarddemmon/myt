/** Provides additional common functionality for a root level form.
    
    Accelerators:
        submit: Invokes the doSubmit function which in turn may invoke the
            doValidSubmit or doInvalidSubmit function.
        cancel: Invokes the doCancel function.
    
    Events:
        None
    
    Attributes:
        None
*/
myt.RootForm = new JS.Module('RootForm', {
    include: [myt.Form],
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    initNode: function(parent, attrs) {
        this.callSuper(parent, attrs);
        
        this.addAccelerator('submit', this.doSubmit);
        this.addAccelerator('cancel', this.doCancel);
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    doSubmit: function() {
        if (this.isChanged) {
            if (this.doValidation()) {
                this.doValidSubmit(this.getValue());
            } else {
                this.doInvalidSubmit();
            }
        }
    },
    
    /** Called when the form is submitted and it is valid.
        @returns {undefined} */
    doValidSubmit: function(value) {},
    
    /** Called when the form is submitted and it is not valid.
        @returns {undefined} */
    doInvalidSubmit: function() {},
    
    /** Rolls back the form and revalidates it.
        @returns {undefined} */
    doCancel: function() {
        this.rollbackForm();
        this.doValidation();
    }
});

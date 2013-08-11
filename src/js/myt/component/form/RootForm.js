/** Provides additional common functionality for a root level form. */
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
        if (this.doValidation()) {
            this.doValidSubmit(this.getValue());
        } else {
            this.doInvalidSubmit();
        }
    },
    
    /** Called when the form is submitted and it is valid.
        @returns void */
    doValidSubmit: function(value) {},
    
    /** Called when the form is submitted and it is not valid.
        @returns void */
    doInvalidSubmit: function() {},
    
    /** Rolls back the form and revalidates it.
        @returns void */
    doCancel: function() {
        this.rollbackForm();
        this.doValidation();
    }
});

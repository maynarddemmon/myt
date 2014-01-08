/** Adds the capability to be "disabled" to an myt.Node. When an myt.Node is 
    disabled the user should typically not be able to interact with it.
    
    When disabled becomes true an attempt will be made to give away the focus
    using myt.FocusObservable's giveAwayFocus method.
    
    Events:
        disabled:boolean Fired when the disabled attribute is modified
            via setDisabled.
    
    Attributes:
        disabled:boolean Indicates that this component is disabled.
*/
myt.Disableable = new JS.Module('Disableable', {
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides */
    initNode: function(parent, attrs) {
        if (attrs.disabled === undefined) attrs.disabled = false;
        
        this.callSuper(parent, attrs);
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setDisabled: function(v) {
        if (this.disabled !== v) {
            this.disabled = v;
            if (this.inited) this.fireNewEvent('disabled', v);
            
            this.doDisabled();
        }
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** Called after the disabled attribute is set. Default behavior attempts
        to give away focus and calls the updateUI method of myt.UpdateableUI if 
        it is defined.
        @returns void */
    doDisabled: function() {
        if (this.inited) {
            // Give away focus if we become disabled and this instance is
            // a FocusObservable
            if (this.disabled && this.giveAwayFocus) this.giveAwayFocus();
            
            if (this.updateUI) this.updateUI();
        }
    }
});

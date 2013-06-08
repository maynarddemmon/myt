/** Adds the capability to be "disabled" to a node. When a node is disabled
    the user can not interact with it.
    
    Attributes:
        disabled:boolean (Fires Event) Indicates that this component 
            is disabled.
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
        if (this.disabled === v) return;
        this.disabled = v;
        if (this.inited) this.fireNewEvent('disabled', v);
        
        // Give away focus if we become disabled and this instance is
        // a FocusObservable
        if (v && this.giveAwayFocus) this.giveAwayFocus();
        
        this.doDisabled();
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** Called after the disabled attribute is set. Subclasses should call
        super if they want the default behavior of calling 'updateUI'.
        @returns void */
    doDisabled: function() {
        if (this.inited && this.updateUI) this.updateUI();
    }
});

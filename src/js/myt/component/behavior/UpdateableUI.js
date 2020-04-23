/** Adds an udpateUI method that should be called to update the UI. Various
    mixins will rely on the updateUI method to trigger visual updates.
    
    Events:
        None
    
    Attributes:
        None
*/
myt.UpdateableUI = new JS.Module('UpdateableUI', {
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides */
    initNode: function(parent, attrs) {
        this.callSuper(parent, attrs);
        
        // Call updateUI one time after initialization is complete to give
        // this View a chance to update itself.
        this.updateUI();
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** Updates the UI whenever a change occurs that requires a visual update.
        Subclasses should implement this as needed.
        @returns {undefined} */
    updateUI: function() {
        // Subclasses to implement as needed.
    }
});

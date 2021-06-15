/** Adds the capability for an myt.View to be "activated". A doActivated method
    is added that gets called when the view is "activated". */
myt.Activateable = new JS.Module('Activateable', {
    // Methods /////////////////////////////////////////////////////////////////
    /** Called when this view should be activated.
        @returns {undefined} */
    doActivated: () => {
        // Subclasses to implement as needed.
    }
});

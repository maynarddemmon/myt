/** Use this to implement more complex transitions in a PanelStack. */
myt.PanelStackTransition = new JS.Class('PanelStackTransition', myt.Node, {
    // Methods /////////////////////////////////////////////////////////////////
    /** Called when transitioning to the provided panel.
        @param panel:myt.StackablePanel
        @returns a promise object that has a next function. */
    to: function(panel) {
        // Default implementation keeps the promise right away.
        return myt.promise(panel).keep();
    },
    
    /** Called when transitioning from the provided panel.
        @param panel:myt.StackablePanel
        @returns a promise object that has a next function. */
    from: function(panel) {
        // Default implementation keeps the promise right away.
        return myt.promise(panel).keep();
    }
});

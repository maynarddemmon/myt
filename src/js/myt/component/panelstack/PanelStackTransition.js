/** Use this to implement more complex transitions in a PanelStack. */
myt.PanelStackTransition = new JS.Class('PanelStackTransition', myt.Node, {
    // Methods /////////////////////////////////////////////////////////////////
    /** Called when transitioning to the provided panel.
        The default implementation keeps the promise right away.
        @param panel:myt.StackablePanel
        @returns a promise object that has a next function. */
    to: (panel) => Promise.resolve(panel),
    
    /** Called when transitioning from the provided panel.
        The default implementation keeps the promise right away.
        @param panel:myt.StackablePanel
        @returns a promise object that has a next function. */
    from: (panel) => Promise.resolve(panel)
});

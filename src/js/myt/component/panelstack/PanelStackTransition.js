/** Use this to implement more complex transitions in a PanelStack. */
myt.PanelStackTransition = new JS.Class('PanelStackTransition', myt.Node, {
    // Methods /////////////////////////////////////////////////////////////////
    /** Called when transitioning to the provided panel.
        @param panel:myt.StackablePanel
        @returns a promise object that has a next function. */
    to: function(panel) {
        // Default implementation keeps the promise right away.
        var promise = this._makePromise(panel);
        promise.keep();
        return promise;
    },
    
    /** Called when transitioning from the provided panel.
        @param panel:myt.StackablePanel
        @returns a promise object that has a next function. */
    from: function(panel) {
        // Default implementation keeps the promise right away.
        var promise = this._makePromise(panel);
        promise.keep();
        return promise;
    },
    
    /** @private */
    _makePromise: function(panel) {
        var promise = {
            next:function(nextFunc) {
                if (promise.kept) {
                    // Execute next immediately since the promise has
                    // already been kept
                    nextFunc(panel);
                } else {
                    // Store the next function so it can be called later once
                    // the promise is kept
                    promise._nextFunc = nextFunc;
                }
            },
            
            keep:function() {
                promise.kept = true;
                
                // If a next function exists then execute it since now the
                // promise has been kept.
                if (promise._nextFunc) promise._nextFunc(panel);
            }
        };
        return promise;
    }
});

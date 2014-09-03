/** Exposes browser history events generated by history.js.
    
    Events:
        statechange: Fired when the state of the page 
            changes (does not include hash changes)
        anchorchange: Fired when the anchor of the page 
            changes (does not include state hashes)
    
    Private Attributes:
        _notFirstTime:boolean Indicates if this is the first time an attempt
            is made to update the state. This prevents an extra state from
            being inserted when first navigating to the app.
*/
new JS.Singleton('GlobalHistory', {
    include: [myt.Observable],
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    initialize: function() {
        myt.global.register('history', this);
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    updateState: function(data, title, url) {
        if (this._notFirstTime) {
            History.pushState(data, title, url);
        } else {
            History.replaceState(data, title, url);
            this._notFirstTime = true;
        }
    },
    
    startMonitoringState: function(monitor) {
        monitor.attachTo(this, 'handleStateChange', 'statechange');
        var state = History.getState();
        monitor.handleStateChange({value:state});
        History.setTitle(state); // Title doesn't get updated for the initial page load.
    }
});

if (!global.mytNoHistoryShim) { // FIXME: remove conditional once old code has been updated.
    History.Adapter.bind(window, 'statechange', function(event) {
        myt.global.history.fireNewEvent('statechange', History.getState());
    });
    
    History.Adapter.bind(window, 'anchorchange', function(event) {
        myt.global.history.fireNewEvent('anchorchange', History.getState());
    });
}

/** Provides global touch events by listening to touch events on the the
    document. Registered with myt.global as 'touch'.
    
    @class */
new JS.Singleton('GlobalTouch', {
    include: [myt.DomElementProxy, myt.DomObservable, myt.TouchObservable],
    
    
    // Constructor /////////////////////////////////////////////////////////////
    initialize: function() {
        this.setDomElement(document);
        
        myt.global.register('touch', this);
    }
});

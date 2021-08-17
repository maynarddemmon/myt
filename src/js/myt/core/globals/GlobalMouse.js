/** Provides global mouse events by listening to mouse events on the 
    document. Registered with myt.global as 'mouse'.
    
    @class */
new JS.Singleton('GlobalMouse', {
    include: [myt.DomElementProxy, myt.DomObservable, myt.MouseObservable],
    
    
    // Constructor /////////////////////////////////////////////////////////////
    initialize: function() {
        this.setDomElement(document);
        
        myt.global.register('mouse', this);
    }
});

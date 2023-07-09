(pkg => {
    const JSSingleton = JS.Singleton,
        doc = document,
        register = pkg.global.register,
        {DomElementProxy, DomObservable} = pkg;
    
    /** Provides global mouse events by listening to mouse events on the document. Registered with 
        myt.global as 'mouse'.
        
        @class */
    new JSSingleton('GlobalMouse', {
        include: [DomElementProxy, DomObservable, pkg.MouseObservable],
        
        
        // Constructor /////////////////////////////////////////////////////////
        initialize: function() {
            this.setDomElement(doc);
            register('mouse', this);
        }
    });
    
    /** Provides global touch events by listening to touch events on the the document. 
        Registered with myt.global as 'touch'.
        
        @class */
    new JSSingleton('GlobalTouch', {
        include: [DomElementProxy, DomObservable, pkg.TouchObservable],
        
        
        // Constructor /////////////////////////////////////////////////////////
        initialize: function() {
            this.setDomElement(doc);
            register('touch', this);
        }
    });
})(myt);

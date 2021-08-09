/** An object that provides accessors, events and simple lifecycle management.
    Useful as a light weight alternative to myt.Node when parent child
    relationships are not needed.
    
    Attributes:
        inited:boolean Set to true after this Eventable has completed 
            initializing.
    
    @class */
myt.Eventable = new JS.Class('Eventable', {
    include: [
        myt.AccessorSupport, 
        myt.Destructible, 
        myt.Observable, 
        myt.Observer
    ],
    
    
    // Constructor /////////////////////////////////////////////////////////////
    /** The standard JSClass initializer function.
        @param {?Object} [attrs] - A map of attribute names and values.
        @param {?Array} [mixins] - A list of mixins to be added onto
            the new instance.
        @returns {undefined} */
    initialize: function(attrs, mixins) {
        const self = this;
        if (mixins) {
            const len = mixins.length;
            for (let i = 0, mixin; len > i;) {
                if (mixin = mixins[i++]) {
                    self.extend(mixin);
                } else {
                    console.warn('Missing mixin in:' + self.klass.__displayName);
                }
            }
        }
        
        self.inited = false;
        self.init(attrs || {});
    },
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    /** Called during initialization. Calls setter methods and lastly, sets 
        inited to true. Subclasses must callSuper.
        @param {?Object} attrs - A map of attribute names and values.
        @returns {undefined} */
    init: function(attrs) {
        this.callSetters(attrs);
        this.inited = true;
    },
    
    /** @overrides myt.Destructible. */
    destroy: function() {
        this.releaseAllConstraints();
        this.detachFromAllObservables();
        this.detachAllObservers();
        
        this.callSuper();
    }
});

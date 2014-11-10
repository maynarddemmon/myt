/** An object that provides accessors, events and simple lifecycle management.
    Useful as a light weight alternative to myt.Node when parent child
    relationships are not needed.
    
    Events:
        None.
    
    Attributes:
        inited:boolean Set to true after this Eventable has completed 
            initializing.
*/
myt.Eventable = new JS.Class('Eventable', {
    include: [myt.AccessorSupport, myt.Destructible, myt.Observable, myt.Constrainable],
    
    
    // Constructor /////////////////////////////////////////////////////////////
    /** The standard JSClass initializer function.
        @param attrs:object (Optional) A map of attribute names and values.
        @param mixins:array (Optional) a list of mixins to be added onto
            the new instance.
        @returns void */
    initialize: function(attrs, mixins) {
        if (mixins) {
            for (var i = 0, len = mixins.length; len > i;) this.extend(mixins[i++]);
        }
        
        this.inited = false;
        this.init(attrs || {});
    },
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    /** Called during initialization. Calls setter methods and lastly, sets 
        inited to true. Subclasses must callSuper.
        @param attrs:object A map of attribute names and values.
        @returns void */
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
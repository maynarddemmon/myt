/** A single node within a tree data structure. A node has zero or one parent 
    node and zero or more child nodes. If a node has no parent it is a 'root' 
    node. If a node has no child nodes it is a 'leaf' node. Parent nodes and 
    parent of parents, etc. are referred to as ancestors. Child nodes and 
    children of children, etc. are referred to as descendants.
    
    Lifecycle management is also provided via the 'initNode', 'doBeforeAdoption',
    'doAfterAdoption', 'destroy', 'destroyBeforeOrphaning' and
    'destroyAfterOrphaning' methods.
    
    Attributes:
        inited:boolean set to true after this Node has completed initializing.
        parent:Node the parent of this Node.
        name:string the name of this node. Used to reference this Node from
            its parent Node.
        __animPool:array An myt.TrackActivesPool used by the 'animate' method.
*/
myt.Node = new JS.Class('Node', {
    include: [myt.AccessorSupport, myt.Destructible, myt.Observable, myt.Constrainable],
    
    
    // Class Methods and Attributes ////////////////////////////////////////////
    extend: {
        /** Get the closest ancestor of the provided Node or the Node itself for 
            which the matcher function returns true.
            @param n:myt.Node the Node to start searching from.
            @param matcher:function the function to test for matching Nodes with.
            @returns Node or null if no match is found. */
        getMatchingAncestorOrSelf: function(n, matcherFunc) {
            if (n && matcherFunc) {
                while (n) {
                    if (matcherFunc(n)) return n;
                    n = n.parent;
                }
            }
            return null;
        },
        
        /** Get the youngest ancestor of the provided Node for which the 
            matcher function returns true.
            @param n:myt.Node the Node to start searching from. This Node is not
                tested, but its parent is.
            @param matcher:function the function to test for matching Nodes with.
            @returns Node or null if no match is found. */
        getMatchingAncestor: function(n, matcherFunc) {
            return myt.Node.getMatchingAncestorOrSelf(n ? n.parent : null, matcherFunc);
        }
    },
    
    
    // Constructor /////////////////////////////////////////////////////////////
    /** The standard JSClass initializer function. Subclasses should not
        override this function.
        @param parent:Node (or dom element for RootViews) (Optional) the parent 
            of this Node.
        @param attrs:object (Optional) A map of attribute names and values.
        @param mixins:array (Optional) a list of mixins to be added onto
            the new instance.
        @returns void */
    initialize: function(parent, attrs, mixins) {
        if (mixins) {
            for (var i = 0, len = mixins.length; len > i; ++i) {
                this.extend(mixins[i]);
            }
        }
        
        this.inited = false;
        this.initNode(parent, attrs ? attrs : {});
    },
    
    // Life Cycle //////////////////////////////////////////////////////////////
    /** Called during initialization. Sets initial state for life cycle attrs,
        calls setter methods, sets parent and lastly, sets inited to true.
        Subclasses must callSuper.
        @param parent:Node (or dom element for RootViews) the parent of 
            this Node.
        @param attrs:object A map of attribute names and values.
        @returns void */
    initNode: function(parent, attrs) {
        this.callSetters(attrs);
        
        this.doBeforeAdoption();
        this.setParent(parent);
        this.doAfterAdoption();
        
        this.inited = true;
    },
    
    /** Provides a hook for subclasses to do things before this Node has its
        parent assigned. This would be the ideal place to create subviews
        so as to avoid unnecessary dom reflows. However, text size can't
        be measured until insertion into the DOM so you may want to use
        doAfterAdoption for creating subviews since it will give you less
        trouble though it will be slower.
        @returns void */
    doBeforeAdoption: function() {},
    
    /** Provides a hook for subclasses to do things after this Node has its
        parent assigned.
        @returns void */
    doAfterAdoption: function() {},
    
    /** @overrides myt.Destructible. */
    destroy: function() {
        // Destroy subnodes depth first
        var subs = this.subnodes;
        if (subs) {
            var i = subs.length;
            while (i) subs[--i].destroy();
        }
        
        if (this.__animPool) this.__animPool.destroy();
        
        this.destroyBeforeOrphaning();
        if (this.parent) this.setParent(null);
        this.destroyAfterOrphaning();
        
        this.callSuper();
    },
    
    /** Provides a hook for subclasses to do destruction of their internals.
        This method is called after subnodes have been destroyed but before
        the parent has been unset.
        Subclasses should call super.
        @returns void */
    destroyBeforeOrphaning: function() {},
    
    /** Provides a hook for subclasses to do destruction of their internals.
        This method is called after the parent has been unset.
        Subclasses must call super.
        @returns void */
    destroyAfterOrphaning: function() {
        this.releaseAllConstraints();
        this.detachFromAllObservables();
        this.detachAllObservers();
    },
    
    
    // Structural Accessors ////////////////////////////////////////////////////
    /** The name of the subnode to add nodes to when setParent is called.
        Placement can be nested using '.' For example 'foo.bar'. The special
        value of '*' means use the default placement. For example 'foo.*'
        means place in the foo subnode and then in the default placement for
        foo. */
    setPlacement: function(v) {
        this.placement = v;
    },
    
    /** The name of the subnode to add nodes to when no placement is 
        specified. */
    setDefaultPlacement: function(v) {
        this.defaultPlacement = v;
    },
    
    /** If set to true placement will not be processed for this Node when
        it is added to a parent Node. */
    setIgnorePlacement: function(v) {
        this.ignorePlacement = v;
    },
    
    /** Sets the provided Node as the new parent of this Node. This is the
        most direct method to do reparenting. You can also use the addSubnode
        method but it's just a wrapper around this setter. */
    setParent: function(newParent) {
        // Use placement if indicated
        if (newParent && !this.ignorePlacement) {
            var placement = this.placement || newParent.defaultPlacement;
            if (placement) newParent = newParent.determinePlacement(placement);
        }
        
        // Abort if parent isn't changing
        if (this.parent === newParent) return;
        
        // Abort if the new parent is in the destroyed life-cycle state.
        if (newParent && newParent.destroyed) return;
        
        // Remove ourselves from our existing parent if we have one.
        var curParent = this.parent;
        if (curParent) {
            var idx = curParent.getSubnodeIndex(this);
            if (idx !== -1) {
                if (this.name) curParent.__removeNameRef(this);
                curParent.subnodes.splice(idx, 1);
                curParent.subnodeRemoved(this);
            }
        }
        
        this.parent = newParent;
        
        // Add ourselves to our new parent
        if (newParent) {
            newParent.getSubnodes().push(this);
            if (this.name) newParent.__addNameRef(this);
            newParent.subnodeAdded(this);
        }
        
        // Fire an event
        if (this.inited) this.fireNewEvent('parent', newParent);
    },
    
    /** The 'name' of a Node allows it to be referenced by name from its
        parent node. For example a Node named 'foo' that is a child of a
        Node stored in the var 'bar' would be referenced like this: bar.foo or
        bar['foo']. */
    setName: function(name) {
        if (this.name === name) return;
        
        // Remove "name" reference from parent.
        var p = this.parent;
        if (p && this.name) p.__removeNameRef(this);
        
        this.name = name;
        
        // Add "name" reference to parent.
        if (p && name) p.__addNameRef(this);
    },
    
    /** Gets the subnodes for this Node and does lazy instantiation of the 
        subnodes array if no child Nodes exist.
        @returns array of subnodes. */
    getSubnodes: function() {
        return this.subnodes ? this.subnodes : this.subnodes = [];
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** Called from setParent to determine where to insert a subnode in the node
        hierarchy. Subclasses will not typically override this method, but if
        they do, they probably won't need to call super.
        @param placement:string the placement path to use.
        @returns the Node to place a subnode into. */
    determinePlacement: function(placement) {
        // Parse "active" placement and remaining placement.
        var idx = placement.indexOf('.'), remainder, loc;
        if (idx !== -1) {
            remainder = placement.substring(idx + 1);
            placement = placement.substring(0, idx);
        }
        
        // Evaluate placement of '*' as defaultPlacement.
        if (placement === '*') {
            placement = this.defaultPlacement;
            
            // Default placement may be compound and thus require splitting
            if (placement) {
                idx = placement.indexOf('.');
                if (idx !== -1) {
                    remainder = placement.substring(idx + 1) + (remainder ? '.' + remainder : '');
                    placement = placement.substring(0, idx);
                }
            }
            
            // It's possible that a placement of '*' comes out here if a
            // Node has its defaultPlacement set to '*'. This should result
            // in a null loc when the code below runs which will end up
            // returning 'this'.
        }
        
        loc = this[placement];
        return loc ? (remainder ? loc.determinePlacement(remainder) : loc) : this;
    },
    
    /** Adds a named reference to a subnode.
        @param node:Node the node to add the name reference for.
        @returns void */
    __addNameRef: function(node) {
        var name = node.name;
        if (this[name] === undefined) {
            this[name] = node;
        } else {
            console.log("Named reference already in use: " + name);
        }
    },
    
    /** Removes a named reference to a subnode.
        @param node:Node the node to remove the name reference for.
        @returns void */
    __removeNameRef: function(node) {
        var name = node.name;
        if (this[name] === node) {
            delete this[name];
        } else {
            console.log("Named reference not in use for subnode: " + name);
        }
    },
    
    // Tree Methods //
    /** Gets the root Node for this Node. The root Node is the oldest
        ancestor or self that has no parent.
        @returns Node */
    getRoot: function() {
        return this.parent ? this.parent.getRoot() : this;
    },
    
    /** Checks if this Node is a root Node.
        @returns boolean */
    isRoot: function() {
        return this.parent == null;
    },
    
    /** Tests if this Node is a descendant of the provided Node or is the
        node itself.
        @returns boolean */
    isDescendantOf: function(node) {
        if (!node) return false;
        if (node === this) return true;
        if (!this.parent) return false;
        
        // Optimization: use the dom element contains function if both nodes 
        // are DomElementProxy instances.
        if (this.domElement && node.domElement) {
            return node.domElement.contains(this.domElement);
        } else {
            return this.parent.isDescendantOf(node);
        }
    },
    
    /** Tests if this Node is an ancestor of the provided Node or is the
        node itself.
        @param node:Node the node to check for.
        @returns boolean */
    isAncestorOf: function(node) {
        return node ? node.isDescendantOf(this) : false;
    },
    
    /** Gets the youngest common ancestor of this node and the provided node.
        @param node:myt.Node The node to look for a common ancestor with.
        @returns The youngest common Node or null if none exists. */
    getLeastCommonAncestor: function(node) {
        while (node) {
            if (this.isDescendantOf(node)) return node;
            node = node.parent;
        }
        return null;
    },
    
    /** Find the youngest ancestor Node that is an instance of the class.
        @param klass the Class to search for.
        @returns Node or null if no klass is provided or match found. */
    searchAncestorsForClass: function(klass) {
        return klass ? this.searchAncestors(function(n) {return n instanceof klass;}) : null;
    },
    
    /** Get the youngest ancestor of this Node for which the matcher function 
        returns true. This is a simple wrapper around 
        myt.Node.getMatchingAncestor(this, matcherFunc).
        @param matcherFunc:function the function to test for matching 
            Nodes with.
        @returns Node or null if no match is found. */
    searchAncestors: function(matcherFunc) {
        return myt.Node.getMatchingAncestor(this, matcherFunc);
    },
    
    /** Get the youngest ancestor of this Node or the Node itself for which 
        the matcher function returns true. This is a simple wrapper around 
        myt.Node.getMatchingAncestorOrSelf(this, matcherFunc).
        @param matcherFunc:function the function to test for matching 
            Nodes with.
        @returns Node or null if no match is found. */
    searchAncestorsOrSelf: function(matcherFunc) {
        return myt.Node.getMatchingAncestorOrSelf(this, matcherFunc);
    },
    
    // Subnode Methods //
    /** Checks if this Node has the provided Node in the subnodes array.
        @param node:Node the subnode to check for.
        @returns true if the subnode is found, false otherwise. */
    hasSubnode: function(node) {
        return this.getSubnodeIndex(node) !== -1;
    },
    
    /** Gets the index of the provided Node in the subnodes array.
        @param node:Node the subnode to get the index for.
        @returns the index of the subnode or -1 if not found. */
    getSubnodeIndex: function(node) {
        return this.getSubnodes().indexOf(node);
    },
    
    /** A convienence method to make a Node a child of this Node. The
        standard way to do this is to call the setParent method on the
        prospective child Node.
        @param node:Node the subnode to add.
        @returns void */
    addSubnode: function(node) {
        node.setParent(this);
    },
    
    /** A convienence method to make a Node no longer a child of this Node. The
        standard way to do this is to call the setParent method with a value
        of null on the child Node.
        @param node:Node the subnode to remove.
        @returns the removed Node or null if removal failed. */
    removeSubnode: function(node) {
        if (node.parent !== this) return null;
        node.setParent(null);
        return node;
    },
    
    /** Called when a subnode is added to this node. Provides a hook for
        subclasses. No need for subclasses to call super. Do not call this
        method to add a subnode. Instead call addSubnode or setParent.
        @param node:Node the subnode that was added.
        @returns void */
    subnodeAdded: function(node) {},
    
    /** Called when a subnode is removed from this node. Provides a hook for
        subclasses. No need for subclasses to call super. Do not call this
        method to remove a subnode. Instead call removeSubnode or setParent.
        @param node:Node the subnode that was removed.
        @returns void */
    subnodeRemoved: function(node) {},
    
    // Animation
    /** Animates an attribute using the provided parameters.
        @param attribute:string/object the name of the attribute to animate. If
            an object is provided it should be the only argument and its keys
            should be the params of this method. This provides a more concise
            way of passing in sparse optional parameters.
        @param to:number the target value to animate to.
        @param from:number the target value to animate from. (optional)
        @param relative:boolean (optional)
        @param callback:function (optional)
        @param duration:number (optional)
        @param revers:boolean (optional)
        @param repeat:number (optional)
        @param easingFunction:function (optional)
        @returns The Animator being run. */
    animate: function(attribute, to, from, relative, callback, duration, reverse, repeat, easingFunction) {
        var animPool = this.__animPool;
        if (!animPool) animPool = this.__animPool = new myt.TrackActivesPool(myt.Animator, this);
        
        // ignorePlacement ensures the animator is directly attached to this node
        var anim = animPool.getInstance({ignorePlacement:true});
        
        if (typeof attribute === 'object') {
            // Handle a single map argument if provided
            callback = attribute.callback;
            delete attribute.callback;
            anim.callSetters(attribute);
        } else {
            // Handle individual arguments
            anim.attribute = attribute;
            anim.setTo(to);
            anim.setFrom(from);
            if (duration != null) anim.duration = duration;
            if (relative != null) anim.relative = relative;
            if (repeat != null) anim.repeat = repeat;
            if (reverse != null) anim.setReverse(reverse);
            if (easingFunction != null) anim.setEasingFunction(easingFunction);
        }
        
        // Release the animation when it completes.
        anim.next(function(success) {animPool.putInstance(anim);});
        if (callback) anim.next(callback);
        
        anim.setRunning(true);
        return anim;
    },
    
    /** Gets an array of the currently running animators that were created
        by calls to the animate method.
        @returns an array of active animators. */
    getActiveAnimators: function() {
        var animPool = this.__animPool;
        if (!animPool) animPool = this.__animPool = new myt.TrackActivesPool(myt.Animator, this);
        
        return animPool.getActives();
    },
    
    // Timing and Delay
    /** A convienence method to execute a method once on idle.
        @param methodName:string the name of the method to execute on
            this object.
        @returns void */
    doOnceOnIdle: function(methodName) {
        this.attachTo(myt.global.idle, methodName, 'idle', true);
    },
    
    /** A convienence method to execute a method once after a delay.
        @param methodName:string the name of the method on this object
            to execute.
        @param delay:number (optional) the time to wait in millis. Defaults 
            to 0.
        @param arguments Remaining arguments will be passed to the called
            method in the order provided.
        @returns number The timer ID if the timer is started, othewise
            undefined is returned. */
    doOnceLater: function() {
        var params = Array.prototype.slice.call(arguments),
            methodName = params.shift(),
            delay = params.shift();
            
        var method = this[methodName];
        if (method) {
            params.unshift(this);
            return setTimeout(method.bind.apply(method, params), delay >= 0 ? delay : 0);
        }
    }
});

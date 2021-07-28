((pkg) => {
    const
        /*  Get the closest ancestor of the provided Node or the Node itself for 
            which the matcher function returns true. Returns a Node or null if 
            no match is found.
                param node:myt.Node the Node to start searching from.
                param matcher:function the function to test for matching 
                    Nodes with. */
        getMatchingAncestorOrSelf = (node, matcherFunc) => {
            if (matcherFunc) {
                while (node) {
                    if (matcherFunc(node)) return node;
                    node = node.parent;
                }
            }
            return null;
        },
        
        /*  Get the youngest ancestor of the provided Node for which the 
            matcher function returns true. Returns a Node or null if no 
            match is found.
                param node:myt.Node the Node to start searching from. This Node 
                    is not tested, but its parent is.
                param matcher:function the function to test for matching 
                    Nodes with. */
        getMatchingAncestor = (node, matcherFunc) => getMatchingAncestorOrSelf(node ? node.parent : null, matcherFunc),
        
        /*  Adds a named reference to a subnode.
                param node:Node the node to add the name reference to.
                param nodeToAdd:Node the node to add the name reference for. */
        addNameRef = (node, nodeToAdd) => {
            const name = nodeToAdd.name;
            if (node[name] === undefined) {
                node[name] = nodeToAdd;
            } else {
                console.log("Name in use:" + name);
            }
        },
        
        /*  Removes a named reference to a subnode.
                param node:Node the node to remove the name reference from.
                param nodeToRemove:Node the node to remove the name reference for. */
        removeNameRef = (node, nodeToRemove) => {
            const name = nodeToRemove.name;
            if (node[name] === nodeToRemove) {
                delete node[name];
            } else {
                console.log("Name not in use:" + name);
            }
        },
        
        /*  Gets the animation pool if it exists, or lazy instantiates it first
            if necessary. Returns a myt.TrackActivesPool */
        getAnimPool = node => node.__animPool || (node.__animPool = new pkg.TrackActivesPool(pkg.Animator, node));
        
    /** A single node within a tree data structure. A node has zero or one parent 
        node and zero or more child nodes. If a node has no parent it is a 'root' 
        node. If a node has no child nodes it is a 'leaf' node. Parent nodes and 
        parent of parents, etc. are referred to as ancestors. Child nodes and 
        children of children, etc. are referred to as descendants.
        
        Lifecycle management is also provided via the 'initNode', 'doBeforeAdoption',
        'doAfterAdoption', 'destroy', 'destroyBeforeOrphaning' and
        'destroyAfterOrphaning' methods.
        
        Events:
            parent:myt.Node Fired when the parent is set.
        
        Attributes:
            inited:boolean Set to true after this Node has completed initializing.
            parent:myt.Node The parent of this Node.
            name:string The name of this node. Used to reference this Node from
                its parent Node.
            isBeingDestroyed:boolean Indicates that this node is in the process
                of being destroyed. Set to true at the beginning of the destroy
                lifecycle phase. Undefined before that.
            placement:string The name of the subnode of this Node to add nodes to 
                when setParent is called on the subnode. Placement can be nested 
                using '.' For example 'foo.bar'. The special value of '*' means 
                use the default placement. For example 'foo.*' means place in the 
                foo subnode and then in the default placement for foo.
            defaultPlacement:string The name of the subnode to add nodes to when 
                no placement is specified. Defaults to undefined which means add
                subnodes directly to this node.
            ignorePlacement:boolean If set to true placement will not be processed 
                for this Node when it is added to a parent Node.
        
        Private Attributes:
            __animPool:array An myt.TrackActivesPool used by the 'animate' method.
            subnodes:array The array of child nodes for this node. Should be
                accessed through the getSubnodes method.
        
        @class */
    pkg.Node = new JS.Class('Node', {
        include: [
            pkg.AccessorSupport, 
            pkg.Destructible, 
            pkg.Observable, 
            pkg.Observer
        ],
        
        
        // Class Methods and Attributes ////////////////////////////////////////
        extend: {
            getMatchingAncestorOrSelf: getMatchingAncestorOrSelf,
            getMatchingAncestor: getMatchingAncestor
        },
        
        
        // Constructor /////////////////////////////////////////////////////////
        /** The standard JSClass initializer function. Subclasses should not
            override this function.
            @param {?Object} [parent] - The myt.Node (or dom element for 
                RootViews) that will be set as the parent of this myt.Node.
            @param {?Object} [attrs] - A map of attribute names and values.
            @param {?Array} [mixins] - A list of mixins to be added onto
                the new instance.
            @returns {undefined} */
        initialize: function(parent, attrs, mixins) {
            const self = this;
            if (mixins) {
                const len = mixins.length;
                for (let i = 0, mixin; len > i;) {
                    if (mixin = mixins[i++]) {
                        self.extend(mixin);
                    } else {
                        console.warn("Missing mixin in:" + self.klass.__displayName);
                    }
                }
            }
            
            self.inited = false;
            self.initNode(parent, attrs || {});
        },
        
        
        // Life Cycle //////////////////////////////////////////////////////////
        /** Called during initialization. Sets initial state for life cycle attrs,
            calls setter methods, sets parent and lastly, sets inited to true.
            Subclasses must callSuper.
            @param {?Object} parent - The myt.Node (or dom element for 
                RootViews) the parent of this Node.
            @param {?Object} attrs - A map of attribute names and values.
            @returns {undefined} */
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
            @returns {undefined} */
        doBeforeAdoption: () => {},
        
        /** Provides a hook for subclasses to do things after this Node has its
            parent assigned.
            @returns {undefined} */
        doAfterAdoption: () => {},
        
        /** @overrides myt.Destructible. */
        destroy: function() {
            const self = this,
                subs = self.subnodes;
            
            // Allows descendants to know destruction is in process
            self.isBeingDestroyed = true;
            
            // Destroy subnodes depth first
            if (subs) {
                let i = subs.length;
                while (i) subs[--i].destroy();
            }
            
            if (self.__animPool) {
                self.stopActiveAnimators();
                self.__animPool.destroy();
            }
            
            self.destroyBeforeOrphaning();
            if (self.parent) self.setParent(null);
            self.destroyAfterOrphaning();
            
            self.callSuper();
        },
        
        /** Provides a hook for subclasses to do destruction of their internals.
            This method is called after subnodes have been destroyed but before
            the parent has been unset.
            Subclasses should call super.
            @returns {undefined} */
        destroyBeforeOrphaning: () => {},
        
        /** Provides a hook for subclasses to do destruction of their internals.
            This method is called after the parent has been unset.
            Subclasses must call super.
            @returns {undefined} */
        destroyAfterOrphaning: function() {
            this.releaseAllConstraints();
            this.detachFromAllObservables();
            this.detachAllObservers();
        },
        
        
        // Structural Accessors ////////////////////////////////////////////////
        setPlacement: function(v) {this.placement = v;},
        setDefaultPlacement: function(v) {this.defaultPlacement = v;},
        setIgnorePlacement: function(v) {this.ignorePlacement = v;},
        
        /** Sets the provided Node as the new parent of this Node. This is the
            most direct method to do reparenting. You can also use the addSubnode
            method but it's just a wrapper around this setter.
            @param {?Object} newParent
            @returns {undefined} */
        setParent: function(newParent) {
            const self = this;
            
            // Use placement if indicated
            if (newParent && !self.ignorePlacement) {
                let placement = self.placement || newParent.defaultPlacement;
                if (placement) newParent = newParent.determinePlacement(placement, self);
            }
            
            if (self.parent !== newParent) {
                // Abort if the new parent is in the destroyed life-cycle state.
                if (newParent && newParent.destroyed) return;
                
                // Remove ourselves from our existing parent if we have one.
                let curParent = self.parent;
                if (curParent) {
                    let idx = curParent.getSubnodeIndex(self);
                    if (idx !== -1) {
                        if (self.name) removeNameRef(curParent, self);
                        curParent.subnodes.splice(idx, 1);
                        curParent.subnodeRemoved(self);
                    }
                }
                
                self.parent = newParent;
                
                // Add ourselves to our new parent
                if (newParent) {
                    newParent.getSubnodes().push(self);
                    if (self.name) addNameRef(newParent, self);
                    newParent.subnodeAdded(self);
                }
                
                // Fire an event
                if (self.inited) self.fireEvent('parent', newParent);
            }
        },
        
        /** The 'name' of a Node allows it to be referenced by name from its
            parent node. For example a Node named 'foo' that is a child of a
            Node stored in the variable 'bar' would be referenced like 
            this: bar.foo or bar['foo'].
            @param {string} name
            @returns {undefined} */
        setName: function(name) {
            if (this.name !== name) {
                // Remove "name" reference from parent.
                const p = this.parent;
                if (p && this.name) removeNameRef(p, this);
                
                this.name = name;
                
                // Add "name" reference to parent.
                if (p && name) addNameRef(p, this);
            }
        },
        
        /** Gets the subnodes for this Node and does lazy instantiation of the 
            subnodes array if no child Nodes exist.
            @returns {!Array} - An array of subnodes. */
        getSubnodes: function() {
            return this.subnodes || (this.subnodes = []);
        },
        
        
        // Methods /////////////////////////////////////////////////////////////
        /** Called from setParent to determine where to insert a subnode in the node
            hierarchy. Subclasses will not typically override this method, but if
            they do, they probably won't need to call super.
            @param {string} placement - The placement path to use.
            @param {!Object} subnode - The sub myt.Node being placed.
            @returns {!Object} - The Node to place a subnode into. */
        determinePlacement: function(placement, subnode) {
            // Parse "active" placement and remaining placement.
            let idx = placement.indexOf('.'),
                remainder;
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
            
            const loc = this[placement];
            return loc ? (remainder ? loc.determinePlacement(remainder, subnode) : loc) : this;
        },
        
        // Tree Methods //
        /** Gets the root Node for this Node. The root Node is the oldest
            ancestor or self that has no parent.
            @returns {!Object} - The root myt.Node. */
        getRoot: function() {
            return this.parent ? this.parent.getRoot() : this;
        },
        
        /** Checks if this Node is a root Node.
            @returns {boolean} */
        isRoot: function() {
            return this.parent == null;
        },
        
        /** Tests if this Node is a descendant of the provided Node or is the
            node itself.
            @param {!Object} node - The myt.Node to check for descent from.
            @returns {boolean} */
        isDescendantOf: function(node) {
            const self = this;
            if (node) {
                if (node === self) return true;
                if (self.parent) {
                    // Optimization: use the dom element contains function if 
                    // both nodes are DomElementProxy instances.
                    if (self.getInnerDomElement && node.getInnerDomElement) return node.getInnerDomElement().contains(self.getInnerDomElement());
                    return self.parent.isDescendantOf(node);
                }
            }
            return false;
        },
        
        /** Tests if this Node is an ancestor of the provided Node or is the
            node itself.
            @param {!Object} node - The myt.Node to check for.
            @returns {boolean} */
        isAncestorOf: function(node) {
            return node ? node.isDescendantOf(this) : false;
        },
        
        /** Gets the youngest common ancestor of this node and the provided node.
            @param {!Object} node - The myt.Node to look for a common ancestor with.
            @returns {?Object} The youngest common Node or null if none exists. */
        getLeastCommonAncestor: function(node) {
            while (node) {
                if (this.isDescendantOf(node)) return node;
                node = node.parent;
            }
            return null;
        },
        
        /** Find the youngest ancestor Node that is an instance of the class.
            @param {?Function} klass - The Class to search for.
            @returns {?Object} - The myt.Node or null if no klass is provided 
                or match found. */
        searchAncestorsForClass: function(klass) {
            return klass ? this.searchAncestors(node => node instanceof klass) : null;
        },
        
        /** Get the youngest ancestor of this Node for which the matcher function 
            returns true. This is a simple wrapper around 
            myt.Node.getMatchingAncestor(this, matcherFunc).
            @param {!Function} matcherFunc - The function to test for matching 
                Nodes with.
            @returns {?Object} - The myt.Node or null if no match is found. */
        searchAncestors: function(matcherFunc) {
            return getMatchingAncestor(this, matcherFunc);
        },
        
        /** Get the youngest ancestor of this Node or the Node itself for which 
            the matcher function returns true. This is a simple wrapper around 
            myt.Node.getMatchingAncestorOrSelf(this, matcherFunc).
            @param {!Function} matcherFunc - The function to test for matching 
                Nodes with.
            @returns {?Object} - The myt.Node or null if no match is found. */
        searchAncestorsOrSelf: function(matcherFunc) {
            return getMatchingAncestorOrSelf(this, matcherFunc);
        },
        
        /** Gets an array of ancestor nodes including the node itself. The
            oldest ancestor will be at the end of the list and the node will
            be at the front of the list.
            @returns {!Array} - The array of ancestor nodes. */
        getAncestors: function() {
            const ancestors = [];
            let node = this;
            while (node) {
                ancestors.push(node);
                node = node.parent;
            }
            return ancestors;
        },
        
        // Subnode Methods //
        /** Checks if this Node has the provided Node in the subnodes array.
            @param {!Object} node - The sub myt.Node to check for.
            @returns {boolean} true if the subnode is found, false otherwise. */
        hasSubnode: function(node) {
            return this.getSubnodeIndex(node) !== -1;
        },
        
        /** Gets the index of the provided Node in the subnodes array.
            @param {!Object} node - The sub myt.Node to get the index for.
            @returns {number} - The index of the subnode or -1 if not found. */
        getSubnodeIndex: function(node) {
            return this.getSubnodes().indexOf(node);
        },
        
        /** A convienence method to make a Node a child of this Node. The
            standard way to do this is to call the setParent method on the
            prospective child Node.
            @param {!Object} node - The sub myt.Node to add.
            @returns {undefined} */
        addSubnode: function(node) {
            node.setParent(this);
        },
        
        /** A convienence method to make a Node no longer a child of this Node. The
            standard way to do this is to call the setParent method with a value
            of null on the child Node.
            @param {!Object} node - The sub myt.Node to remove.
            @returns {?Object} - The removed myt.Node or null if removal failed. */
        removeSubnode: function(node) {
            if (node.parent !== this) return null;
            node.setParent(null);
            return node;
        },
        
        /** Called when a subnode is added to this node. Provides a hook for
            subclasses. No need for subclasses to call super. Do not call this
            method to add a subnode. Instead call addSubnode or setParent.
            @param {!Object} node - The sub myt.Node that was added.
            @returns {undefined} */
        subnodeAdded: node => {},
        
        /** Called when a subnode is removed from this node. Provides a hook for
            subclasses. No need for subclasses to call super. Do not call this
            method to remove a subnode. Instead call removeSubnode or setParent.
            @param {!Object} node - The sub myt.Node that was removed.
            @returns {undefined} */
        subnodeRemoved: node => {},
        
        // Animation
        /** A wrapper on Node.animate that will only animate one time and that 
            provides a streamlined list of the most commonly used arguments.
            @param {!Object|string} attribute - The name of the attribute to 
                animate. If an object is provided it should be the only argument 
                and its keys should be the params of this method. This provides 
                a more concise way of passing in sparse optional parameters.
            @param {number} to - The target value to animate to.
            @param {number} [from] - The target value to animate from.
            @param {number} [duration]
            @param {?Function} [easingFunction]
            @returns {!Object} - The Animator being run. */
        animateOnce: function(attribute, to, from, duration, easingFunction) {
            return this.animate(attribute, to, from, false, null, duration, false, 1, easingFunction);
        },
        
        /** Animates an attribute using the provided parameters.
            @param {!Object|string} attribute - The name of the attribute to 
                animate. If an object is provided it should be the only argument 
                and its keys should be the params of this method. This provides 
                a more concise way of passing in sparse optional parameters.
            @param {number} to - The target value to animate to.
            @param {number} [from] - The target value to animate from.
            @param {boolean} [relative]
            @param {?Function} [callback]
            @param {number} [duration]
            @param {boolean} [reverse]
            @param {boolean} [repeat]
            @param {?Function} [easingFunction]
            @returns {!Object} - The Animator being run. */
        animate: function(attribute, to, from, relative, callback, duration, reverse, repeat, easingFunction) {
            const animPool = getAnimPool(this),
                anim = animPool.getInstance({ignorePlacement:true}); // ignorePlacement ensures the animator is directly attached to this node
            
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
            anim.next((success) => {animPool.putInstance(anim);});
            if (callback) anim.next(callback);
            
            anim.setRunning(true);
            return anim;
        },
        
        /** Gets an array of the currently running animators that were created
            by calls to the animate method.
            @param {?Function|string} [filterFunc] - The function that filters
                which animations get stopped. The filter should return true for 
                functions to be included. If the provided values is a string it will
                be used as a matching attribute name.
            @returns {!Array} - An array of active animators. */
        getActiveAnimators: function(filterFunc) {
            if (typeof filterFunc === 'string') {
                const attrName = filterFunc;
                filterFunc = anim => anim.attribute === attrName;
            }
            return getAnimPool(this).getActives(filterFunc);
        },
        
        /** Stops all active animations.
            @param {?Function|string} [filterFunc] - The function that filters 
                which animations get stopped. The filter should return true for 
                functions to be stopped. If the provided values is a string it 
                will be used as a matching attribute name.
            @param {boolean} [executeCallbacks] - If true animator 
                callbacks will be executed if they exist.
            @returns {undefined} */
        stopActiveAnimators: function(filterFunc, executeCallbacks=false) {
            const activeAnims = this.getActiveAnimators(filterFunc);
            let i = activeAnims.length;
            if (i > 0) {
                const animPool = getAnimPool(this);
                while (i) {
                    const anim = activeAnims[--i];
                    anim.reset(executeCallbacks);
                    if (!executeCallbacks) animPool.putInstance(anim);
                }
            }
        },
        
        // Timing and Delay
        /** A convienence method to execute a method once on idle.
            @param {string} methodName - The name of the method to execute on
                this object.
            @returns {undefined} */
        doOnceOnIdle: function(methodName) {
            this.attachTo(pkg.global.idle, methodName, 'idle', true);
        }
    });
})(myt);

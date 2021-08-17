(pkg => {
    const AccessorSupport = pkg.AccessorSupport,
        
        /*  A data structure of groups stored as a map of maps. First 
            level is attribute name second level is group ID. */
        BAGsByAttrName = {},
        
        /** Manages a boolean attribute on a collection of Nodes. Ensures 
            that no more than one of the Nodes has the attribute set to 
            true at one time.
            
            Events:
                attrName:string
                groupId:string
                trueNode:myt.Node
            
            Attributes:
                attrName:string The name of the boolean attribute to 
                    monitor and update.
                groupId:string The unqiue ID of the group.
                trueNode:myt.Node The node that is currently true. Will 
                    be null if no node is true.
            
            Private Attributes:
                __nodes:array A list of the currently registered nodes.
            
            @class */
        BAG = pkg.BAG = new JS.Class('BAG', {
            include: [AccessorSupport, pkg.Destructible, pkg.Observable],
            
            
            // Class Methods and Attributes ////////////////////////////////////
            extend: {
                /** Gets a BAG for the attribute name and group ID.
                    @param attrName:string the name of the attribute to monitor.
                    @param groupId:string the unique ID of the group.
                    @returns the BAG */
                getGroup: (attrName, groupId) => {
                    if (attrName && groupId) {
                        const groupIdMap = BAGsByAttrName[attrName] || (BAGsByAttrName[attrName] = {});
                        return groupIdMap[groupId] || (groupIdMap[groupId] = new BAG(attrName, groupId));
                    }
                    return null;
                },
                
                /** Removes a BAG for the attribute name and group id.
                    @param attrName:string the name of the attribute to monitor.
                    @param groupId:string the unique ID of the group.
                    @returns the removed BAG */
                removeGroup: (attrName, groupId) => {
                    if (attrName && groupId) {
                        const groupIdMap = BAGsByAttrName[attrName];
                        if (groupIdMap) {
                            const group = groupIdMap[groupId];
                            if (group) delete groupIdMap[groupId];
                            return group;
                        }
                    }
                    return null;
                }
            },
            
            
            // Constructor /////////////////////////////////////////////////////
            initialize: function(attrName, groupId) {
                this.__nodes = [];
                this.trueNode = null;
                
                this.attrName = attrName;
                this.groupId = groupId;
            },
        
            
            // Life Cycle //////////////////////////////////////////////////////
            /** @overrides myt.Destructible */
            destroy: function() {
                if (this.trueNode) this.setTrueNode(null);
                
                if (this.__nodes.length === 0) BAG.removeGroup(this.attrName, this.groupId);
                
                this.__nodes.length = 0;
                this.detachAllObservers();
                this.callSuper();
            },
            
            
            // Accessors ///////////////////////////////////////////////////////
            setGroupId: function(v) {this.set('groupId', v, true);},
            setAttrName: function(v) {this.set('attrName', v, true);},
            setTrueNode: function(v) {this.set('trueNode', v, true);},
            getNodes: function() {return this.__nodes;},
            
            
            // Methods /////////////////////////////////////////////////////////
            /** Registeres a node with this group.
                @param node:myt.Node the node to register with this group.
                @returns {undefined} */
            register: function(node) {
                if (node && !this.isRegistered(node)) {
                    this.__nodes.push(node);
                    
                    // If node is true then update for this.
                    if (node[this.attrName]) this.setTrue(node);
                }
            },
            
            /** Unregisteres a node from this group.
                @param node:myt.Node the node to unregister from this group.
                @returns {undefined} */
            unregister: function(node) {
                if (node) {
                    const nodes = this.__nodes;
                    let i = nodes.length;
                    while (i) {
                        if (node === nodes[--i]) {
                            nodes.splice(i, 1);
                            break;
                        }
                    }
                    
                    if (this.trueNode === node) this.setTrueNode(null);
                    
                    if (nodes.length === 0) this.destroy();
                }
            },
            
            /** Sets the attribute to true on the provided registered node 
                and sets it to false on all other registered nodes.
                @param node:myt.Node the node to set the attribute to true on.
                @returns {undefined} */
            setTrue: function(node) {
                if (node && this.trueNode !== node && this.isRegistered(node)) {
                    const attrName = this.attrName,
                        setterName = AccessorSupport.generateSetterName(attrName),
                        nodes = this.__nodes;
                    let i = nodes.length;
                    
                    this.setTrueNode(node);
                    
                    while (i) {
                        const n = nodes[--i];
                        if (node === n) {
                            if (!n[attrName]) n[setterName](true);
                        } else {
                            if (n[attrName]) n[setterName](false);
                        }
                    }
                    
                }
            },
            
            /** Sets the attribute to false on the provided registered node.
                @param node:myt.Node the node to set the attribute to false on.
                @returns {undefined} */
            setFalse: function(node) {
                if (node && this.trueNode === node) {
                    node[AccessorSupport.generateSetterName(this.attrName)](false);
                    this.setTrueNode(null);
                }
            },
            
            /** Checks if a node is already registered or not.
                @param node:myt.Node the node to test.
                @returns {undefined} */
            isRegistered: function(node) {
                const nodes = this.__nodes;
                let i = nodes.length;
                while (i) {
                    if (node === nodes[--i]) return true;
                }
                return false;
            }
        });
    
    /** Provides the capability for a Node to participate in a BAG.
        
        Private Attributes:
            __bags:array A list of BAGs this node is a member of.
        
        @class */
    pkg.BAGMembership = new JS.Module('BAGMembership', {
        // Life Cycle //////////////////////////////////////////////////////////
        /** @overrides myt.Node */
        initNode: function(parent, attrs) {
            this.__bags = [];
            
            this.callSuper(parent, attrs);
        },
        
        /** @overrides myt.Node */
        destroyAfterOrphaning: function() {
            this.callSuper();
            
            const groups = this.__bags;
            let i = groups.length;
            while (i) {
                const group = groups[--i];
                this.removeFromBAG(group.attrName, group.groupId);
            }
        },
        
        
        // Methods /////////////////////////////////////////////////////////////
        isRegisteredWithBAG: function(group) {
            const groups = this.__bags;
            let i = groups.length;
            while (i) {
                if (groups[--i] === group) return true;
            }
            return false;
        },
        
        getBAG: (attrName, groupId) => BAG.getGroup(attrName, groupId),
        
        /** Adds this node to the BAG for the groupId and
            attribute name.
            @param attrName:string
            @param groupId:string
            @returns {undefined} */
        addToBAG: function(attrName, groupId) {
            const group = this.getBAG(attrName, groupId);
            if (!this.isRegisteredWithBAG(group)) {
                this.__bags.push(group);
                group.register(this);
                
                // Monitor attribute
                if (!this.isAttachedTo(this, '__updateForBAG', attrName)) {
                    this.attachTo(this, '__updateForBAG', attrName);
                }
            }
        },
        
        /** Removes this node from the BAG for the groupId and
            attribute name.
            @param attrName:string
            @param groupId:string
            @returns {undefined} */
        removeFromBAG: function(attrName, groupId) {
            const group = this.getBAG(attrName, groupId);
            if (this.isRegisteredWithBAG(group)) {
                const groups = this.__bags;
                let i = groups.length,
                    detach = true;
                while (i) {
                    const g = groups[--i];
                    if (g === group) {
                        groups.splice(i, 1);
                        group.unregister(this);
                    } else if (g.attrName === attrName) {
                        // Don't detach if another group is listening to 
                        // the same attr.
                        detach = false;
                    }
                }
                
                if (detach) this.detachFrom(this, '__updateForBAG', attrName);
            }
        },
        
        /** Called whenever an event for the attrName is fired.
            @private 
            @param {!Object} event
            @returns {undefined} */
        __updateForBAG: function(event) {
            this.__bags.forEach(bag => {
                if (bag.attrName === event.type) bag[event.value ? 'setTrue' : 'setFalse'](this);
            });
        }
    });
})(myt);

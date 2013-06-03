/** Manages a boolean attribute on a collection of Nodes. Ensures that no more
    than one of the Nodes has the attribute set to true at one time. */
myt.BAG = new JS.Class('BAG', {
    include: [myt.Destructible, myt.Observable],
    
    
    // Class Methods and Attributes ////////////////////////////////////////////
    extend: {
        /** Generates a unique group id
            @return number */
        generateUniqueGroupId: function() {
            return myt.generateGuid();
        },
        
        /** Creates a new BAG.
            @param attrName:string
            @returns a new BAG. */
        createGroup: function(attrName) {
            return new BAG(attrName, this.generateUniqueGroupId());
        },
        
        /** Gets a BAG for the attribute name and group ID.
            @param attrName:string the name of the attribute to monitor.
            @param groupId:string the unique ID of the group.
            @returns the BAG */
        getGroup: function(attrName, groupId) {
            if (!attrName || !groupId) return null;
            
            // A data structure of groups stored as a map of maps. First level 
            // is attribute name second level is group ID.
            var groups = myt.BAG._groups;
            if (!groups) groups = myt.BAG._groups = {};
            
            var groupIdMap = groups[attrName];
            if (!groupIdMap) {
                groupIdMap = {};
                groups[attrName] = groupIdMap;
            }
            
            var group = groupIdMap[groupId];
            if (!group) {
                group = new myt.BAG(attrName, groupId);
                groupIdMap[groupId] = group;
            }
            
            return group;
        },
        
        /** Removes a BAG for the attribute name and group id.
            @param attrName:string the name of the attribute to monitor.
            @param groupId:string the unique ID of the group.
            @returns the removed BAG */
        removeGroup: function(attrName, groupId) {
            if (attrName && groupId) {
                var groups = myt.BAG._groups;
                if (groups) {
                    var groupIdMap = groups[attrName];
                    if (groupIdMap) {
                        var group = groupIdMap[groupId];
                        if (group) delete groupIdMap[groupId];
                        return group;
                    }
                }
            }
            return null;
        }
    },
    
    
    // Constructor /////////////////////////////////////////////////////////////
    initialize: function(attrName, groupId) {
        // A list of the currently registered nodes.
        this._nodes = [];
        
        this.attrName = attrName;
        this.groupId = groupId;
        this.trueNode = null;
    },

    
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides myt.Destructible */
    destroy: function() {
        if (this.trueNode) this.setTrueNode(null);
        
        if (this._nodes.length === 0) {
            myt.BAG.removeGroup(this.attrName, this.groupId);
        }
        
        this._nodes.length = 0;
        this.detachAllObservers();
        this.callSuper();
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    /** The unique ID of this group. */
    setGroupId: function(v) {
        if (this.groupId === v) return;
        this.groupId = v;
        this.fireNewEvent('groupId', v);
    },
    
    /** The name of the boolean attribute to update. */
    setAttrName: function(v) {
        if (this.attrName === v) return;
        this.attrName = v;
        this.fireNewEvent('attrName', v);
    },
    
    /** A reference to the node that currently has a true value for 
        the attribute. */
    setTrueNode: function(v) {
        if (this.trueNode === v) return;
        this.trueNode = v;
        this.fireNewEvent('trueNode', v);
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** Registeres a node with this group.
        @param node:myt.Node the node to register with this group.
        @returns void */
    register: function(node) {
        if (!node) return;
        if (this.isRegistered(node)) return;
        
        this._nodes.push(node);
        
        // If node is true then update for this.
        if (node[this.attrName]) this.setTrue(node);
    },
    
    /** Unregisteres a node from this group.
        @param node:myt.Node the node to unregister from this group.
        @returns void */
    unregister: function(node) {
        if (!node) return;
        
        var nodes = this._nodes;
        var i = nodes.length;
        while (i) {
            if (node === nodes[--i]) {
                nodes.splice(i, 1);
                break;
            }
        }
        
        if (this.trueNode === node) this.setTrueNode(null);
        
        if (nodes.length === 0) this.destroy();
    },
    
    /** Sets the attribute to true on the provided registered node and sets 
        it to false on all other registered nodes.
        @param node:myt.Node the node to set the attribute to true on.
        @returns void */
    setTrue: function(node) {
        if (node && this.trueNode !== node && this.isRegistered(node)) {
            var attrName = this.attrName;
            var setterName = myt.AccessorSupport.generateSetterName(attrName);
            var nodes = this._nodes;
            var n, i = nodes.length;
            while (i) {
                n = nodes[--i];
                if (node === n) {
                    if (!n[attrName]) n[setterName](true);
                } else {
                    if (n[attrName]) n[setterName](false);
                }
            }
            
            this.setTrueNode(node);
        }
    },
    
    /** Sets the attribute to false on the provided registered node.
        @param node:myt.Node the node to set the attribute to false on.
        @returns void */
    setFalse: function(node) {
        if (node && this.trueNode === node) {
            var setterName = myt.AccessorSupport.generateSetterName(this.attrName);
            node[setterName](false);
            this.setTrueNode(null);
        }
    },
    
    /** Checks if a node is already registered or not.
        @param node:myt.Node the node to test.
        @returns void */
    isRegistered: function(node) {
        var nodes = this._nodes;
        var i = nodes.length;
        while (i) {
            if (node === nodes[--i]) return true;
        }
        return false;
    }
});

/** Manages a boolean attribute on a collection of Nodes. Ensures that no more
    than one of the Nodes has the attribute set to true at one time.
    
    Events:
        attrName:string
        groupId:string
        trueNode:myt.Node
    
    Attributes:
        attrName:string The name of the boolean attribute to monitor and update.
        groupId:string The unqiue ID of the group.
        trueNode:myt.Node The node that is currently true. Will be null if no
            node is true.
    
    Private Attributes:
        __nodes:array A list of the currently registered nodes.
*/
myt.BAG = new JS.Class('BAG', {
    include: [myt.AccessorSupport, myt.Destructible, myt.Observable],
    
    
    // Class Methods and Attributes ////////////////////////////////////////////
    extend: {
        /** A data structure of groups stored as a map of maps. First level 
            is attribute name second level is group ID.
            @private */
        __groups: {},
        
        /** Generates a unique group id
            @return number */
        generateUniqueGroupId: function() {
            return myt.generateGuid();
        },
        
        /** Creates a new BAG.
            @param attrName:string
            @returns a new BAG. */
        createGroup: function(attrName) {
            return new myt.BAG(attrName, this.generateUniqueGroupId());
        },
        
        /** Gets a BAG for the attribute name and group ID.
            @param attrName:string the name of the attribute to monitor.
            @param groupId:string the unique ID of the group.
            @returns the BAG */
        getGroup: function(attrName, groupId) {
            if (attrName && groupId) {
                const groups = this.__groups,
                    groupIdMap = groups[attrName] || (groups[attrName] = {});
                return groupIdMap[groupId] || (groupIdMap[groupId] = new myt.BAG(attrName, groupId));
            }
            return null;
        },
        
        /** Removes a BAG for the attribute name and group id.
            @param attrName:string the name of the attribute to monitor.
            @param groupId:string the unique ID of the group.
            @returns the removed BAG */
        removeGroup: function(attrName, groupId) {
            if (attrName && groupId) {
                const groups = this.__groups;
                if (groups) {
                    const groupIdMap = groups[attrName];
                    if (groupIdMap) {
                        const group = groupIdMap[groupId];
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
        this.__nodes = [];
        this.trueNode = null;
        
        this.attrName = attrName;
        this.groupId = groupId;
    },

    
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides myt.Destructible */
    destroy: function() {
        if (this.trueNode) this.setTrueNode(null);
        
        if (this.__nodes.length === 0) myt.BAG.removeGroup(this.attrName, this.groupId);
        
        this.__nodes.length = 0;
        this.detachAllObservers();
        this.callSuper();
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setGroupId: function(v) {this.set('groupId', v, true);},
    setAttrName: function(v) {this.set('attrName', v, true);},
    setTrueNode: function(v) {this.set('trueNode', v, true);},
    getNodes: function() {return this.__nodes;},
    
    
    // Methods /////////////////////////////////////////////////////////////////
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
    
    /** Sets the attribute to true on the provided registered node and sets 
        it to false on all other registered nodes.
        @param node:myt.Node the node to set the attribute to true on.
        @returns {undefined} */
    setTrue: function(node) {
        if (node && this.trueNode !== node && this.isRegistered(node)) {
            const attrName = this.attrName,
                setterName = myt.AccessorSupport.generateSetterName(attrName),
                nodes = this.__nodes;
            let i = nodes.length,
                n;
            
            this.setTrueNode(node);
            
            while (i) {
                n = nodes[--i];
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
            const setterName = myt.AccessorSupport.generateSetterName(this.attrName);
            node[setterName](false);
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

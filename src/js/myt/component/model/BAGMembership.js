/** Provides the capability for a Node to participate in a BAG.
    
    Events:
        None
    
    Attributes:
        None
    
    Private Attributes:
        __bags:array A list of BAGs this node is a member of.
*/
myt.BAGMembership = new JS.Module('BAGMembership', {
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides myt.Node */
    initNode: function(parent, attrs) {
        this.__bags = [];
        
        this.callSuper(parent, attrs);
    },
    
    /** @overrides myt.Node */
    destroyAfterOrphaning: function() {
        this.callSuper();
        
        var groups = this.__bags, i = groups.length, group;
        while (i) {
            group = groups[--i];
            this.removeFromBAG(group.attrName, group.groupId);
        }
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    isRegisteredWithBAG: function(group) {
        var groups = this.__bags, i = groups.length;
        while (i) {
            if (groups[--i] === group) return true;
        }
        return false;
    },
    
    getBAG: function(attrName, groupId) {
        return myt.BAG.getGroup(attrName, groupId);
    },
    
    /** Adds this node to the BAG for the groupId and
        attribute name.
        @param attrName:string
        @param groupId:string
        @returns void */
    addToBAG: function(attrName, groupId) {
        var group = this.getBAG(attrName, groupId);
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
        @returns void */
    removeFromBAG: function(attrName, groupId) {
        var group = this.getBAG(attrName, groupId);
        if (this.isRegisteredWithBAG(group)) {
            var groups = this.__bags, i = groups.length, g, detach = true;
            while (i) {
                g = groups[--i];
                if (g === group) {
                    groups.splice(i, 1);
                    group.unregister(this);
                } else if (g.attrName === attrName) {
                    // Don't detach if another group is listening to the same attr.
                    detach = false;
                }
            }
            
            if (detach) this.detachFrom(this, '__updateForBAG', attrName);
        }
    },
    
    /** Called whenever an event for the attrName is fired.
        @private 
        @returns void */
    __updateForBAG: function(event) {
        var type = event.type,
            value = event.value,
            groups = this.__bags, i = groups.length, group;
        while (i) {
            group = groups[--i];
            if (group.attrName === type) {
                if (value) {
                    group.setTrue(this);
                } else {
                    group.setFalse(this);
                }
            }
        }
    }
});

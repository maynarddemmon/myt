/** Provides the capability for a Node to participate in 
    a BAG. */
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
        
        var groups = this.__bags;
        var group, i = groups.length;
        while (i) {
            group = groups[--i];
            this.removeFromBAG(group.attrName, group.groupId);
        }
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    isRegisteredWithBAG: function(group) {
        var groups = this.__bags;
        var i = groups.length;
        while (i) {
            if (groups[--i] === group) return true;
        }
        return false;
    },
    
    /** Adds this node to the BAG for the groupId and
        attribute name.
        @param attrName:string
        @param groupId:string
        @returns void */
    addToBAG: function(attrName, groupId) {
        var group = myt.BAG.getGroup(attrName, groupId);
        if (this.isRegisteredWithBAG(group)) return;
        
        this.__bags.push(group);
        group.register(this);
        
        // Monitor attribute
        if (!this.isAttachedTo(this, '__updateForBAG', attrName)) {
            this.attachTo(this, '__updateForBAG', attrName);
        }
    },
    
    /** Removes this node from the BAG for the groupId and
        attribute name.
        @param attrName:string
        @param groupId:string
        @returns void */
    removeFromBAG: function(attrName, groupId) {
        var group = myt.BAG.getGroup(attrName, groupId);
        if (!this.isRegisteredWithBAG(group)) return;
        
        var groups = this.__bags;
        var g, i = groups.length;
        var detach = true;
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
    },
    
    /** Called whenever an event for the attrName is fired.
        @returns void */
    __updateForBAG: function(event) {
        var type = event.type;
        var value = event.value;
        var groups = this.__bags;
        var group, i = groups.length;
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

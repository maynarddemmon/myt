/** Objects that can be replicated should include this mixin and implemment
    the replicate method. The myt.Reusable mixin is also included and the
    clean method should also be implemented. The methods replicate and clean
    should perform setup and teardown of the object respectively.
    
    Attributes:
        replicationData:* the data provided during replication.
        replicationIndex:number the replication index provided 
            during replication.
*/
myt.Replicable = new JS.Module('Replicable', {
    include: [myt.Reusable],
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** Called to configure the replicable object with data. Subclasses should
        call super.
        @param data:object the data being replicated for this instance.
        @param idx:number the index of the data in the replicated list.
        @returns void */
    replicate: function(data, idx) {
        this.replicationData = data;
        this.replicationIndex = idx;
    },
    
    /** @overrides myt.Reusable
        Subclasses should call super. */
    clean: function() {
        this.replicationData = null;
        this.replicationIndex = -1;
    },
    
    /** Called by an myt.Replicator to check if this replicable needs to be
        updated or not.
        @param data:object the data being replicated for this instance.
        @param idx:number the index of the data in the replicated list.
        @returns boolean true if the provided data is already set on this
            replicable, false otherwise. */
    alreadyHasReplicationData: function(data, idx) {
        return idx === this.replicationIndex && data === this.replicationData;
    }
});
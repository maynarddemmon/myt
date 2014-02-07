/** Makes an myt.View support being a source for myt.Dropable instances. Makes
    use of myt.Draggable for handling drag initiation but this view is not
    itself, actually draggable.
    
    Events:
        None
    
    Attributes:
        dropParent:myt.View The view to make the myt.Dropable instances in.
            Defaults to the myt.RootView that contains this drop source.
        dropClass:JS.Class The myt.Dropable class that gets created in the
            default implementation of makeDropable.
        dropClassAttrs:object The attrs to use when making the dropClass
            instance.
        dropable:mytDropable (read only) The dropable that was most 
            recently created. Once the dropable has been dropped this will
            be set to null.
*/
myt.DropSource = new JS.Module('DropSource', {
    include: [myt.Draggable],
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides */
    initNode: function(parent, attrs) {
        if (attrs.distanceBeforeDrag === undefined) attrs.distanceBeforeDrag = 2;
        if (attrs.dropParent === undefined) attrs.dropParent = parent.getRoot();
        
        this.callSuper(parent, attrs);
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setDropClass: function(v) {this.dropClass = v;},
    setDropClassAttrs: function(v) {this.dropClassAttrs = v;},
    setDropParent: function(v) {this.dropParent = v;},
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** @overrides myt.Draggable */
    startDrag: function(event) {
        var dropable = this.dropable = this.makeDropable();
        
        // Emulate mouse down on the dropable
        if (dropable) {
            dropable.doMouseDown(event);
            dropable.__doMouseDown(event);
        }
    },
    
    /** @overrides myt.MouseDown */
    doMouseUp: function(event) {
        this.callSuper(event);
        
        // Emulate mouse up on the dropable
        var dropable = this.dropable;
        if (dropable) {
            dropable.__doMouseUp(event);
            dropable.doMouseUp(event);
            this.dropable = null;
        }
    },
    
    /** Called by startDrag to make a dropable.
        @returns myt.Dropable or undefined if one can't be created. */
    makeDropable: function() {
        var dropClass = this.dropClass,
            dropParent = this.dropParent;
        if (dropClass && dropParent) {
            var pos = myt.DomElementProxy.getPagePosition(this.domElement, dropParent.domElement),
                attrs = this.dropClassAttrs || {};
            attrs.x = pos.x || 0;
            attrs.y = pos.y || 0;
            return new dropClass(dropParent, attrs);
        }
    },
});

/** Provides browser drag and drop support.
    
    Requires myt.Disableable as a super mixin. */
myt.DragDropSupport = new JS.Module('DragDropSupport', {
    include: [myt.DragDropObservable],
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides myt.View */
    initNode: function(parent, attrs) {
        this.callSuper(parent, attrs);
        
        if (!this.disabled) this.setupDragListeners();
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    /** @overrides myt.Disableable */
    setDisabled: function(v) {
        if (this.disabled !== v) {
            this.domElement.disabled = v;
            this.callSuper(v);
            
            if (this.inited) {
                if (v) {
                    this.teardownDragListeners();
                } else {
                    this.setupDragListeners();
                }
            }
        }
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** @private */
    setupDragListeners: function() {
        this.attachToDom(this, 'doDragOver', 'dragover', true);
        this.attachToDom(this, 'doDragEnter', 'dragenter', true);
        this.attachToDom(this, 'doDragLeave', 'dragleave', true);
        this.attachToDom(this, 'doDrop', 'drop', true);
    },
    
    /** @private */
    teardownDragListeners: function() {
        this.detachFromDom(this, 'doDragOver', 'dragover', true);
        this.detachFromDom(this, 'doDragEnter', 'dragenter', true);
        this.detachFromDom(this, 'doDragLeave', 'dragleave', true);
        this.detachFromDom(this, 'doDrop', 'drop', true);
    },
    
    doDragOver: function(event) {},
    
    doDragEnter: function(event) {},
    
    doDragLeave: function(event) {},
    
    doDrop: function(event) {
        this.handleFiles(event.value.dataTransfer.files);
    },
    
    /** @private */
    handleFiles: function(files) {
        if (files !== undefined) {
            var i = files.length, file;
            while (i) {
                file = files[--i];
                if (this.filterFiles(file)) this.handleDroppedFile(file);
            }
        } else {
            myt.dumpStack("Browser doesn't support the File API");
        }
    },
    
    filterFiles: function(file) {
        return true;
    },
    
    handleDroppedFile: function(file) {},
});

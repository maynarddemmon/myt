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
            this.getInnerDomElement().disabled = v;
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
        this.attachToDom(this, 'doDragOver', 'dragover', false);
        this.attachToDom(this, 'doDragEnter', 'dragenter', false);
        this.attachToDom(this, 'doDragLeave', 'dragleave', false);
        this.attachToDom(this, 'doDrop', 'drop', false);
    },
    
    /** @private */
    teardownDragListeners: function() {
        this.detachFromDom(this, 'doDragOver', 'dragover', false);
        this.detachFromDom(this, 'doDragEnter', 'dragenter', false);
        this.detachFromDom(this, 'doDragLeave', 'dragleave', false);
        this.detachFromDom(this, 'doDrop', 'drop', false);
    },
    
    doDragOver: function(event) {},
    
    doDragEnter: function(event) {},
    
    doDragLeave: function(event) {},
    
    doDrop: function(event) {
        this.handleFiles(event.value.dataTransfer.files, event);
    },
    
    /** @private */
    handleFiles: function(files, event) {
        if (files !== undefined) {
            var i = files.length, file;
            while (i) {
                file = files[--i];
                if (this.filterFiles(file)) this.handleDroppedFile(file, event);
            }
        } else {
            myt.dumpStack("Browser doesn't support the File API");
        }
    },
    
    filterFiles: function(file) {
        return true;
    },
    
    handleDroppedFile: function(file, event) {}
});

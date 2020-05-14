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
    
    /** @param {!Object} event
        @returns {undefined} */
    doDragOver: function(event) {},
    
    /** @param {!Object} event
        @returns {undefined} */
    doDragEnter: function(event) {},
    
    /** @param {!Object} event
        @returns {undefined} */
    doDragLeave: function(event) {},
    
    /** @param {!Object} event
        @returns {undefined} */
    doDrop: function(event) {
        this.handleFiles(event.value.dataTransfer.files, event);
    },
    
    /** @param {?Array} files
        @param {!Object} event
        @returns {undefined} */
    handleFiles: function(files, event) {
        if (files !== undefined) {
            let i = files.length,
                file;
            while (i) {
                file = this.filterFiles(files[--i]);
                if (file) this.handleDroppedFile(file, event);
            }
        } else {
            myt.dumpStack("Browser doesn't support the File API");
        }
    },
    
    /** Provides an opportunity to prevent a file from being handled. The
        default implementation returns the provided file argument.
        @param file:File the file to be checked for handleability.
        @returns file:File the file to be handled (possibly modified by this
            function) or something falsy if the file should not be handled. */
    filterFiles: function(file) {
        return file;
    },
    
    /** @param {!Object} file
        @param {!Object} event
        @returns {undefined} */
    handleDroppedFile: function(file, event) {}
});

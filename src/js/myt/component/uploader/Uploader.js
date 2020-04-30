/** Component to upload files. */
myt.Uploader = new JS.Class('Uploader', myt.View, {
    include: [myt.DragDropSupport, myt.Disableable, myt.FormElement],
    
    
    // Class Methods and Attributes ////////////////////////////////////////////
    extend: {
        /** The attribute key used in a file to store the path for the file
            on the server. */
        FILE_ATTR_SERVER_PATH: 'serverPath',
        
        MIME_TYPES_BY_EXTENSION: {
            gif:'image/gif',
            png:'image/png',
            jpg:'image/jpeg',
            jpeg:'image/jpeg'
        },
        
        readFile: function(file, handlerFunc) {
            if (FileReader !== undefined) {
                var reader = new FileReader();
                reader.onload = handlerFunc;
                reader.readAsDataURL(file);
            }
        },
        
        isSameFile: function(f1, f2) {
            if (f1 == null || f2 == null) return false;
            return f1.name === f2.name && f1.type === f2.type && f1.size === f2.size;
        },
        
        createFile: function(urlStr) {
            var fileName = (new myt.URI(urlStr)).file;
            return {
                name: fileName,
                serverPath: urlStr,
                size: -1,
                type: this.MIME_TYPES_BY_EXTENSION[myt.getExtension(fileName)]
            };
        }
    },
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides myt.View */
    initNode: function(parent, attrs) {
        var self = this;
        
        self.files = [];
        
        // Modify attrs so setter gets called.
        if (attrs.requestFileParam == null) attrs.requestFileParam = 'file';
        if (attrs.maxFiles == null) attrs.maxFiles = -1;
        
        self.callSuper(parent, attrs);
        
        // Support click to upload too.
        new myt.NativeInputWrapper(self, {
            name:'fileInput', percentOfParentWidth:100, percentOfParentHeight:100,
            opacity:0.01, disabled:self.disabled, overflow:'hidden'
        }, [myt.SizeToParent, {
            initNode: function(parent, attrs) {
                this.inputType = 'file';
                this.callSuper(parent, attrs);
                this.attachToDom(this, '_handleInput', 'change');
                
                this.domElement.multiple = self.maxFiles > 1;
            },
            
            _handleInput: function(event) {
                self.handleFiles(this.domElement.files, event);
            }
        }]);
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    /** Add a "remote" file when the value is set.
        @param {string} v - the URI for a remote image file.
        @returns {string} */
    setValue: function(v) {
        this.clearFiles();
        
        if (v) {
            if (!Array.isArray(v)) v = [v];
            var len = v.length, i = 0;
            for(; len > i; ++i) this.addFile(myt.Uploader.createFile(v[i]));
        }
        
        return this.callSuper ? this.callSuper(v) : v;
    },
    
    /** @returns {string} The path to the uploaded files. */
    getValue: function() {
        return this.value;
    },
    
    /** @overrides myt.Disableable */
    setDisabled: function(v) {
        this.callSuper(v);
        
        if (this.fileInput) this.fileInput.setDisabled(v);
    },
    
    setMaxFiles: function(v) {
        if (this.maxFiles !== v) {
            this.maxFiles = v;
            if (this.inited) this.fireEvent('maxFiles', v);
            if (this.fileInput) this.fileInput.domElement.multiple = v > 1;
        }
    },
    
    setUploadUrl: function(v) {this.set('uploadUrl', v, true);},
    setRequestFileParam: function(v) {this.set('requestFileParam', v, true);},
    
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** @overrides myt.View */
    bringSubviewToFront: function(sv) {
        if (sv === this.fileInput) {
            this.callSuper(sv);
        } else {
            this.sendSubviewBehind(sv, this.fileInput);
        }
    },
    
    /** @overrides myt.View */
    subviewAdded: function(sv) {
        this.callSuper(sv);
        
        if (this.fileInput) this.bringSubviewToFront(this.fileInput);
    },
    
    handleDroppedFile: function(file, event) {
        this.addFile(file);
    },
    
    /** @overrides myt.DragDropSupport */
    filterFiles: function(file) {
        // Prevent max files from being exceeded.
        return this.maxFiles >= 0 && this.files.length >= this.maxFiles ? null : file;
    },
    
    uploadFiles: function(url, fileParam) {
        url = url || this.uploadUrl;
        
        var files = this.files, i = files.length;
        while (i) this.uploadFile(files[--i], url, fileParam);
    },
    
    uploadFile: function(file, url, fileParam) {
        var self = this,
            formData = new FormData();
        formData.append(fileParam || self.requestFileParam, file, file.name);
        myt.doFetch(
            url || self.uploadUrl,
            {
                method:'POST',
                body:formData
            },
            false,
            data => {
                self.handleUploadSuccess(file, data);
            },
            error => {
                self.handleUploadFailure(file, error);
            }
        );
    },
    
    handleUploadSuccess: function(file, data) {
        file[myt.Uploader.FILE_ATTR_SERVER_PATH] = this.parseServerPathFromResponse(file, data);
        this.updateValueFromFiles();
    },
    
    handleUploadFailure: (file, error) => {
        myt.dumpStack("Upload failure: " + error.status + " : " + error.message);
    },
    
    /** Subclasses must implement this to extract the uploaded file path from
        the response. By default this return null.
        @param {!Object} file
        @param {!Object} data
        @returns {undefined} */
    parseServerPathFromResponse: (file, data) => null,
    
    addFile: function(file) {
        this.files.push(file);
        this.updateValueFromFiles();
        this.fireEvent('addFile', file);
    },
    
    removeFile: function(file) {
        var files = this.files, i = files.length;
        while (i) {
            if (myt.Uploader.isSameFile(files[--i], file)) {
                files.splice(i, 1);
                this.updateValueFromFiles();
                this.fireEvent('removeFile', file);
                break;
            }
        }
    },
    
    updateValueFromFiles: function() {
        var value = [], files = this.files, i = files.length, serverPath;
        while (i) {
            serverPath = files[--i][myt.Uploader.FILE_ATTR_SERVER_PATH];
            if (serverPath) value.push(serverPath);
        }
        
        var len = value.length;
        this.value = len === 1 ? value[0] : (len === 0 ? undefined : value);
        
        // Reset the form element if empty. Otherwise uploading the 
        // same file again won't trigger a change event.
        if (!this.value) this.fileInput.domElement.value = '';
        
        this.verifyChangedState(); // FIXME: mimics what happens in myt.FormElement setValue
        if (this.form) this.form.notifyValueChanged(this); // FIXME: mimics what happens in myt.Form setValue
        
        this.fireEvent('value', this.value);
    },
    
    clearFiles: function() {
        var files = this.files, i = files.length;
        while (i) this.removeFile(files[--i]);
    }
});

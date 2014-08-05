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
                reader = new FileReader();
                reader.onload = handlerFunc;
                reader.readAsDataURL(file);
            }
        },
        
        isSameFile: function(f1, f2) {
            if (f1 == null || f2 == null) return false;
            return f1.name === f2.name && f1.type === f2.type && f1.size === f2.size;
        },
        
        createFile: function(urlStr) {
            var uri = new myt.URI(urlStr), name = uri.file, ext = name.split('.')[1];
            return {
                name: name,
                serverPath: urlStr,
                size: -1,
                type: this.MIME_TYPES_BY_EXTENSION[ext]
            };
        }
    },
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides myt.View */
    initNode: function(parent, attrs) {
        this.files = [];
        
        // Modify attrs so setter gets called.
        if (attrs.requestFileParam === undefined) attrs.requestFileParam = 'file';
        if (attrs.maxFiles === undefined) attrs.maxFiles = -1;
        
        this.callSuper(parent, attrs);
        
        var self = this;
        
        // Support click to upload too.
        new myt.NativeInputWrapper(this, {
            name:'fileInput', percentOfParentWidth:100, percentOfParentHeight:100,
            opacity:0.01, disabled:this.disabled, overflow:'hidden'
        }, [myt.SizeToParent, {
            initNode: function(parent, attrs) {
                this.inputType = 'file';
                this.callSuper(parent, attrs);
                this.attachToDom(this, '_handleInput', 'change');
                
                this.domElement.multiple = self.maxFiles > 1;
            },
            
            _handleInput: function(event) {
                self.handleFiles(this.domElement.files);
            }
        }]);
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    /** Add a "remote" file when the value is set.
        @param v:string the URI for a remote image file. */
    setValue: function(v) {
        this.clearFiles();
        
        if (v) {
            if (!Array.isArray(v)) v = [v];
            var len = v.length, i = 0;
            for(; len > i; ++i) this.addFile(myt.Uploader.createFile(v[i]));
        }
        
        if (this.callSuper) {
            return this.callSuper(v);
        } else {
            return v;
        }
    },
    
    /** @returns the path to the uploaded files. */
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
            if (this.inited) this.fireNewEvent('maxFiles', v);
            if (this.fileInput) this.fileInput.domElement.multiple = v > 1;
        }
    },
    
    setUploadUrl: function(v) {
        if (this.uploadUrl !== v) {
            this.uploadUrl = v;
            if (this.inited) this.fireNewEvent('uploadUrl', v);
        }
    },
    
    setRequestFileParam: function(v) {
        if (this.requestFileParam !== v) {
            this.requestFileParam = v;
            if (this.inited) this.fireNewEvent('requestFileParam', v);
        }
    },
    
    
    
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
    
    handleDroppedFile: function(file) {
        this.addFile(file);
    },
    
    /** @overrides myt.DragDropSupport */
    filterFiles: function(file) {
        var maxFiles = this.maxFiles;
        if (maxFiles >= 0 && this.files.length >= maxFiles) return false;
        
        return true;
    },
    
    uploadFiles: function(url, fileParam) {
        url = url || this.uploadUrl;
        
        var files = this.files, i = files.length;
        while (i) this.uploadFile(files[--i], url, fileParam);
    },
    
    uploadFile: function(file, url, fileParam) {
        url = url || this.uploadUrl;
        fileParam = fileParam || this.requestFileParam;
        
        var self = this;
        var ajax = new myt.Ajax(this, {
            url:url, requestMethod:'post', responseType:'json'
        }, [{
            handleSuccess: function(data, status, jqxhr) {
                this.callSuper(data, status, jqxhr);
                self.handleUploadSuccess(file, data, status, jqxhr);
            },
            
            handleFailure: function(jqxhr, status, exception) {
                this.callSuper(jqxhr, status, exception);
                self.handleUploadFailure(file, jqxhr, status, exception);
            }
        }]);
        
        var formData = new FormData();
        formData.append(fileParam, file, file.name);
        ajax.setRequestData(formData);
        
        ajax.doRequest({
            contentType:false,
            cache: false,
            processData: false
        });
    },
    
    handleUploadSuccess: function(file, data, status, jqxhr) {
        file[myt.Uploader.FILE_ATTR_SERVER_PATH] = this.parseServerPathFromResponse(data);
        this.updateValueFromFiles();
    },
    
    handleUploadFailure: function(file, jqxhr, status, exception) {
        myt.dumpStack("XHR failure: " + status + " : " + exception);
    },
    
    /** Subclasses must implement this to extract the uploaded file path from
        the response. By default this return null. */
    parseServerPathFromResponse: function(data) {
        return null;
    },
    
    addFile: function(file) {
        this.files.push(file);
        this.updateValueFromFiles();
        this.fireNewEvent('addFile', file);
    },
    
    removeFile: function(file) {
        var files = this.files, i = files.length;
        while (i) {
            if (myt.Uploader.isSameFile(files[--i], file)) {
                files.splice(i, 1);
                this.updateValueFromFiles();
                this.fireNewEvent('removeFile', file);
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
        
        this.verifyChangedState(); // FIXME: mimics what happens in myt.FormElement setValue
        if (this.form) this.form.notifyValueChanged(this); // FIXME: mimics what happens in myt.Form setValue
        
        this.fireNewEvent('value', this.value);
    },
    
    clearFiles: function() {
        var files = this.files, i = files.length;
        while (i) this.removeFile(files[--i]);
    }
});

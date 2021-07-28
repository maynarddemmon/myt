((pkg) => {
    const JSClass = JS.Class,
        
        MIME_TYPES_BY_EXTENSION = {
            gif:'image/gif',
            png:'image/png',
            jpg:'image/jpeg',
            jpeg:'image/jpeg'
        },
        
        /** Provides browser drag and drop support.
            
            Requires myt.Disableable as a super mixin.
            
            @class */
        DragDropSupport = pkg.DragDropSupport = new JS.Module('DragDropSupport', {
            include: [pkg.DragDropObservable],
            
            
            // Life Cycle //////////////////////////////////////////////////////
            /** @overrides myt.View */
            initNode: function(parent, attrs) {
                this.callSuper(parent, attrs);
                
                if (!this.disabled) this.setupDragListeners();
            },
            
            
            // Accessors ///////////////////////////////////////////////////////
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
            
            
            // Methods /////////////////////////////////////////////////////////
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
            doDragOver: event => {},
            
            /** @param {!Object} event
                @returns {undefined} */
            doDragEnter: event => {},
            
            /** @param {!Object} event
                @returns {undefined} */
            doDragLeave: event => {},
            
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
                    let i = files.length;
                    while (i) {
                        const file = this.filterFiles(files[--i]);
                        if (file) this.handleDroppedFile(file, event);
                    }
                } else {
                    pkg.dumpStack('File API not supported.');
                }
            },
            
            /** Provides an opportunity to prevent a file from being handled. The
                default implementation returns the provided file argument.
                @param file:File the file to be checked for handleability.
                @returns file:File the file to be handled (possibly modified by this
                    function) or something falsy if the file should not be handled. */
            filterFiles: file => file,
            
            /** @param {!Object} file
                @param {!Object} event
                @returns {undefined} */
            handleDroppedFile: (file, event) => {}
        }),
        
        /** Component to upload files.
            
            @class */
        Uploader = pkg.Uploader = new JSClass('Uploader', pkg.View, {
            include: [DragDropSupport, pkg.Disableable, pkg.FormElement],
            
            
            // Class Methods and Attributes ////////////////////////////////////
            extend: {
                /** The attribute key used in a file to store the path for the file
                    on the server. */
                FILE_ATTR_SERVER_PATH: 'serverPath',
                
                readFile: (file, handlerFunc) => {
                    if (FileReader !== undefined) {
                        const reader = new FileReader();
                        reader.onload = handlerFunc;
                        reader.readAsDataURL(file);
                    }
                },
                
                isSameFile: (f1, f2) => f1 != null && f2 != null && f1.name === f2.name && f1.type === f2.type && f1.size === f2.size,
                
                createFile: urlStr => {
                    const fileName = (new pkg.URI(urlStr)).file;
                    return {
                        name: fileName,
                        serverPath: urlStr,
                        size: -1,
                        type: MIME_TYPES_BY_EXTENSION[pkg.getExtension(fileName)]
                    };
                }
            },
            
            
            // Life Cycle //////////////////////////////////////////////////////
            /** @overrides myt.View */
            initNode: function(parent, attrs) {
                const self = this;
                
                self.files = [];
                
                // Modify attrs so setter gets called.
                if (attrs.requestFileParam == null) attrs.requestFileParam = 'file';
                if (attrs.maxFiles == null) attrs.maxFiles = -1;
                
                self.callSuper(parent, attrs);
                
                // Support click to upload too.
                new pkg.NativeInputWrapper(self, {
                    name:'fileInput', percentOfParentWidth:100, percentOfParentHeight:100,
                    opacity:0.01, disabled:self.disabled, overflow:'hidden'
                }, [pkg.SizeToParent, {
                    initNode: function(parent, attrs) {
                        this.inputType = 'file';
                        this.callSuper(parent, attrs);
                        this.attachToDom(this, '_handleInput', 'change');
                        
                        this.getInnerDomElement().multiple = self.maxFiles > 1;
                    },
                    
                    _handleInput: function(event) {
                        self.handleFiles(this.getInnerDomElement().files, event);
                    }
                }]);
            },
            
            
            // Accessors ///////////////////////////////////////////////////////
            /** Add a "remote" file when the value is set.
                @param {string} v - the URI for a remote file.
                @returns {string} */
            setValue: function(v) {
                this.clearFiles();
                
                if (v) {
                    if (!Array.isArray(v)) v = [v];
                    v.forEach(urlStr => {this.addFile(Uploader.createFile(urlStr));});
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
                    if (this.fileInput) this.fileInput.getInnerDomElement().multiple = v > 1;
                }
            },
            
            setUploadUrl: function(v) {this.set('uploadUrl', v, true);},
            setRequestFileParam: function(v) {this.set('requestFileParam', v, true);},
            
            
            
            // Methods /////////////////////////////////////////////////////////
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
                
                const files = this.files;
                let i = files.length;
                while (i) this.uploadFile(files[--i], url, fileParam);
            },
            
            uploadFile: function(file, url, fileParam) {
                const self = this,
                    formData = new FormData();
                formData.append(fileParam || self.requestFileParam, file, file.name);
                pkg.doFetch(
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
                file[Uploader.FILE_ATTR_SERVER_PATH] = this.parseServerPathFromResponse(file, data);
                this.updateValueFromFiles();
            },
            
            handleUploadFailure: (file, error) => {
                pkg.dumpStack('Upload failure:' + error.status + ':' + error.message);
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
                const files = this.files;
                let i = files.length;
                while (i) {
                    if (Uploader.isSameFile(files[--i], file)) {
                        files.splice(i, 1);
                        this.updateValueFromFiles();
                        this.fireEvent('removeFile', file);
                        break;
                    }
                }
            },
            
            updateValueFromFiles: function() {
                const value = [],
                    files = this.files;
                let i = files.length;
                while (i) {
                    const serverPath = files[--i][Uploader.FILE_ATTR_SERVER_PATH];
                    if (serverPath) value.push(serverPath);
                }
                
                const len = value.length;
                this.value = len === 1 ? value[0] : (len === 0 ? undefined : value);
                
                // Reset the form element if empty. Otherwise uploading the 
                // same file again won't trigger a change event.
                if (!this.value) this.fileInput.getInnerDomElement().value = '';
                
                this.verifyChangedState(); // FIXME: mimics what happens in myt.FormElement setValue
                if (this.form) this.form.notifyValueChanged(this); // FIXME: mimics what happens in myt.Form setValue
                
                this.fireEvent('value', this.value);
            },
            
            clearFiles: function() {
                const files = this.files;
                let i = files.length;
                while (i) this.removeFile(files[--i]);
            }
        }),
        
        /** Component to upload image files.
            
            @class */
        ImageUploader = pkg.ImageUploader = new JSClass('ImageUploader', Uploader, {
            // Class Methods and Attributes ////////////////////////////////////
            extend: {
                isImageFile: file => (/image/i).test(file.type)
            },
            
            
            // Life Cycle //////////////////////////////////////////////////////
            /** @overrides myt.View */
            initNode: function(parent, attrs) {
                attrs.maxFiles = 1;
                
                this.callSuper(parent, attrs);
            },
            
            
            // Attributes //////////////////////////////////////////////////////
            setWidth: function(v, supressEvent) {
                this.callSuper(v, supressEvent);
                if (this.inited) this.updateImageSize();
            },
            
            setHeight: function(v, supressEvent) {
                this.callSuper(v, supressEvent);
                if (this.inited) this.updateImageSize();
            },
            
            
            // Methods /////////////////////////////////////////////////////////
            filterFiles: function(file) {
                if (ImageUploader.isImageFile(file)) {
                    // Remove existing file
                    while (this.files.length > 0) this.removeFile(this.files[0]);
                    return this.callSuper(file);
                }
            },
            
            addFile: function(file) {
                const self = this;
                
                self.callSuper(file);
                
                const image = self.image = new pkg.Image(self, {useNaturalSize:false, align:'center', valign:'middle'});
                
                image.file = file;
                
                // Read into image
                if (file.size === -1) {
                    const img = new Image();
                    img.onload = function() {
                        file.width = this.width;
                        file.height = this.height;
                        
                        if (!image || image.destroyed) return;
                        
                        self.updateImage(file, image, this.src);
                    };
                    img.src = file.serverPath;
                } else if (FileReader !== undefined && ImageUploader.isImageFile(file)) {
                    Uploader.readFile(file, function(event) {
                        const img = new Image();
                        img.onload = function() {
                            file.width = this.width;
                            file.height = this.height;
                            
                            if (!image || image.destroyed) return;
                            
                            self.updateImage(file, image, this.src);
                        };
                        img.src = event.target.result;
                    });
                }
            },
            
            scaleToFit: (boundsWidth, boundsHeight, imgWidth, imgHeight) => {
                const boundsRatio = boundsWidth / boundsHeight,
                    imgRatio = imgWidth / imgHeight;
                if (imgRatio > boundsRatio) {
                    return [boundsWidth, imgHeight * boundsWidth / imgWidth];
                } else {
                    return [imgWidth * boundsHeight / imgHeight, boundsHeight];
                }
            },
            
            removeFile: function(file) {
                this.callSuper(file);
                
                const images = this.getSubviews();
                let i = images.length;
                while (i) {
                    const image = images[--i];
                    if (Uploader.isSameFile(image.file, file)) {
                        image.destroy();
                        break;
                    }
                }
            },
            
            handleDroppedFile: function(file, event) {
                this.callSuper(file, event);
                
                this.uploadFile(file, this.uploadUrl);
            },
            
            updateImage: function(file, image, src) {
                this.nativeWidth = file.width;
                this.nativeHeight = file.height;
                
                this.updateImageSize();
                
                image.setImageUrl(src);
            },
            
            updateImageSize: function() {
                const image = this.image;
                if (image && !image.destroyed) {
                    const size = this.scaleToFit(this.width, this.height, this.nativeWidth, this.nativeHeight),
                        w = Math.round(size[0]), 
                        h = Math.round(size[1]);
                    image.setImageSize(w + 'px ' + h + 'px');
                    image.setWidth(w);
                    image.setHeight(h);
                }
            },
            
            getImageSize: function() {
                return this.files.length ? {width:this.nativeWidth, height:this.nativeHeight} : null;
            }
        });
})(myt);

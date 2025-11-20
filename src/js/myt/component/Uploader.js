(pkg => {
    const JSClass = JS.Class,
        
        {NOOP, dumpStack} = pkg,
        
        MIME_TYPES_BY_EXTENSION = {
            gif:'image/gif',
            png:'image/png',
            jpg:'image/jpeg',
            jpeg:'image/jpeg',
            svg:'image/svg+xml',
            webp:'image/webp',
            ico:'image/vnd.microsoft.icon'
        },
        
        doDragListeners = (target, funcName) => {
            target[funcName](target, 'doDragOver', 'dragover', false);
            target[funcName](target, 'doDragEnter', 'dragenter', false);
            target[funcName](target, 'doDragLeave', 'dragleave', false);
            target[funcName](target, 'doDrop', 'drop', false);
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
                    this.getIDE().disabled = v;
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
                doDragListeners(this, 'attachToDom');
            },
            
            /** @private */
            teardownDragListeners: function() {
                doDragListeners(this, 'detachFromDom');
            },
            
            /** @param {!Object} event
                @returns {void} */
            doDragOver: NOOP, // event => {},
            
            /** @param {!Object} event
                @returns {void} */
            doDragEnter: NOOP, // event => {},
            
            /** @param {!Object} event
                @returns {void} */
            doDragLeave: NOOP, // event => {},
            
            /** @param {!Object} event
                @returns {void} */
            doDrop: function(event) {
                this.handleFiles(event.value.dataTransfer.files, event);
            },
            
            /** @param {?Array} files
                @param {!Object} event
                @returns {void} */
            handleFiles: function(files, event) {
                if (files !== undefined) {
                    let i = files.length;
                    while (i) {
                        const file = this.filterFiles(files[--i]);
                        if (file) this.handleDroppedFile(file, event);
                    }
                } else {
                    dumpStack('No File API');
                }
            },
            
            /** Provides an opportunity to prevent a file from being handled. The default 
                implementation returns the provided file argument.
                @param file:File the file to be checked for handleability.
                @returns file:File the file to be handled (possibly modified by this function) or 
                    something falsy if the file should not be handled. */
            filterFiles: file => file,
            
            /** @param {!Object} file
                @param {!Object} event
                @returns {void} */
            handleDroppedFile: NOOP // (file, event) => {}
        }),
        
        FileInput = pkg.FileInput = new JSClass('FileInput', pkg.NativeInputWrapper, {
            // Life Cycle //////////////////////////////////////////////////////
            initNode: function(parent, attrs) {
                this.inputType = 'file';
                this.callSuper(parent, attrs);
                this.attachToDom(this, '_onChange', 'change');
            },
            
            
            // Accessors ///////////////////////////////////////////////////////
            setAccept: function(v) {
                this.set('accept', v, true);
                this.getIDE().accept = this.accept;
            },
            
            setMaxFiles: function(v) {
                if (this.maxFiles !== v) {
                    this.set('maxFiles', v, true);
                    this.getIDE().multiple = this.maxFiles > 1;
                }
            },
            
            
            // Methods /////////////////////////////////////////////////////////
            clearValue: function() {
                this.getIDE().value = '';
            },
            
            _onChange: NOOP, // event => {/* Subclasses to implement. */}
        }),
        
        /** Component to upload files.
            
            @class */
        Uploader = pkg.Uploader = new JSClass('Uploader', pkg.View, {
            include: [DragDropSupport, pkg.Disableable, pkg.FormElement],
            
            
            // Class Methods and Attributes ////////////////////////////////////
            extend: {
                /** The attribute key used in a file to store the path for the file on 
                    the server. */
                FILE_ATTR_SERVER_PATH: 'serverPath',
                
                readFile: (file, handlerFunc, readAs) => {
                    if (FileReader !== undefined) {
                        const reader = new FileReader();
                        reader.onload = event => {handlerFunc(event.target.result);};
                        
                        switch (readAs) {
                            case 'text':
                                reader.readAsText(file);
                                break;
                            case 'arrayBuffer':
                                reader.readAsArrayBuffer(file);
                                break;
                            case 'dataURL':
                            default:
                                reader.readAsDataURL(file);
                                break;
                        }
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
                attrs.requestFileParam ??= 'file';
                attrs.maxFiles ??= -1;
                attrs.responseIsRaw ??= false;
                
                const accept = attrs.accept;
                delete attrs.accept;
                
                self.callSuper(parent, attrs);
                
                // Support click to upload too.
                self.fileInput = new FileInput(self, {
                    maxFiles:self.maxFiles, accept:accept,
                    percentOfParentWidth:100, percentOfParentHeight:100,
                    opacity:0.01, disabled:self.disabled, overflow:'hidden'
                }, [pkg.SizeToParent, {
                    _onChange: function(event) {
                        self.handleFiles(this.getIDE().files, event);
                    }
                }]);
            },
            
            
            // Accessors ///////////////////////////////////////////////////////
            setAccept: function(_v) {this.fileInput?.setAccept(this.accept);},
            getAccept: function() {return this.fileInput?.accept;},
            
            setMaxFiles: function(_v) {this.fileInput?.setMaxFiles(this.maxFiles);},
            getMaxFiles: function() {return this.fileInput?.maxFiles;},
            
            /** Add a "remote" file when the value is set.
                @param {string} v - the URI for a remote file.
                @returns {string} */
            setValue: function(v) {
                this.clearFiles();
                
                if (v) {
                    if (!Array.isArray(v)) v = [v];
                    for (const urlStr of v) this.addFile(Uploader.createFile(urlStr));
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
                this.fileInput?.setDisabled(v);
            },
            
            setUploadUrl: function(v) {this.set('uploadUrl', v, true);},
            setRequestFileParam: function(v) {this.set('requestFileParam', v, true);},
            setResponseIsRaw: function(v) {this.set('responseIsRaw', v, true);},
            
            
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
            
            handleDroppedFile: function(file, _event) {
                this.addFile(file);
            },
            
            /** @overrides myt.DragDropSupport */
            filterFiles: function(file) {
                // Prevent max files from being exceeded.
                return this.maxFiles >= 0 && this.files.length >= this.maxFiles ? null : file;
            },
            
            uploadFiles: function(url, fileParam) {
                url ??= this.uploadUrl;
                
                const files = this.files;
                let i = files.length;
                while (i) this.uploadFile(files[--i], url, fileParam);
            },
            
            makeFetchOptionsForUpload: formData => ({method:'POST', body:formData}),
            
            uploadFile: function(file, url, fileParam) {
                const self = this,
                    formData = new FormData();
                formData.append(fileParam ?? self.requestFileParam, file, file.name.replaceAll('%20', ' '));
                pkg.doFetch(
                    url ?? self.uploadUrl,
                    self.makeFetchOptionsForUpload(formData),
                    self.responseIsRaw,
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
                dumpStack('Upload failure:' + error.status + ':' + error.message);
            },
            
            /** Subclasses must implement this to extract the uploaded file path from the response. 
                By default this returns null.
                @param {!Object} _file
                @param {!Object} _data
                @returns {void} */
            parseServerPathFromResponse: (_file, _data) => null,
            
            addFile: function(file) {
                this.files.push(file);
                this.updateValueFromFiles();
                this.fireEvent('addFile', file);
            },
            
            removeFile: function(file) {
                const self = this,
                    files = self.files;
                let i = files.length;
                while (i) {
                    if (Uploader.isSameFile(files[--i], file)) {
                        files.splice(i, 1);
                        self.updateValueFromFiles();
                        self.fireEvent('removeFile', file);
                        break;
                    }
                }
            },
            
            updateValueFromFiles: function() {
                const self = this,
                    value = [],
                    files = self.files;
                let i = files.length;
                while (i) {
                    const serverPath = files[--i][Uploader.FILE_ATTR_SERVER_PATH];
                    if (serverPath) value.push(serverPath);
                }
                
                const len = value.length;
                self.value = len === 1 ? value[0] : (len === 0 ? undefined : value);
                
                // Reset the form element if empty. Otherwise uploading the 
                // same file again won't trigger a change event.
                if (!self.value) self.fileInput.clearValue();
                
                self.verifyChangedState(); // FIXME: mimics what happens in myt.FormElement setValue
                self.form?.notifyValueChanged(self); // FIXME: mimics what happens in myt.Form setValue
                
                self.fireEvent('value', self.value);
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
            
            
            // Methods /////////////////////////////////////////////////////////
            filterFiles: function(file) {
                if (ImageUploader.isImageFile(file) || this.allowNonImages) {
                    // Remove existing file
                    while (this.files.length > 0) this.removeFile(this.files[0]);
                    return this.callSuper(file);
                }
            },
            
            addFile: function(file) {
                const self = this,
                    isImageFile = ImageUploader.isImageFile(file);
                
                self.callSuper(file);
                
                const imageView = self.imageView = new pkg.Image(self, {
                    percentOfParentWidth:100, percentOfParentHeight:100,
                    useNaturalSize:false, imageSize:'contain', imagePosition:'center'
                }, [pkg.SizeToParent]);
                
                imageView.file = file;
                
                // Read into image
                const readImageFunc = src => {
                    const img = new Image();
                    img.onload = () => {
                        file.width = img.width;
                        file.height = img.height;
                        if (imageView && !imageView.destroyed) self.updateImage(file, imageView, img.src);
                    };
                    img.src = src;
                };
                if (isImageFile) {
                    if (file.size === -1) {
                        readImageFunc(file.serverPath);
                    } else if (ImageUploader.isImageFile(file)) {
                        Uploader.readFile(file, readImageFunc);
                    }
                } else {
                    if (file.size === -1) {
                        self.updateImage(file, imageView, file.serverPath);
                    } else {
                        Uploader.readFile(file, result => {self.updateImage(file, imageView, result);});
                    }
                }
                
                return imageView;
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
                image.setImageUrl(src);
            },
            
            getImageSize: function() {
                return this.files.length ? {width:this.nativeWidth, height:this.nativeHeight} : null;
            }
        });
})(myt);

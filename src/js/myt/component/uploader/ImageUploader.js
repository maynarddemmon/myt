/** Component to upload image files. */
myt.ImageUploader = new JS.Class('ImageUploader', myt.Uploader, {
    // Class Methods and Attributes ////////////////////////////////////////////
    extend: {
        isImageFile: function(file) {
            return (/image/i).test(file.type);
        }
    },
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides myt.View */
    initNode: function(parent, attrs) {
        attrs.maxFiles = 1;
        
        this.callSuper(parent, attrs);
    },
    
    
    // Attributes //////////////////////////////////////////////////////////////
    setWidth: function(v, supressEvent) {
        this.callSuper(v, supressEvent);
        if (this.inited) this.updateImageSize();
    },
    
    setHeight: function(v, supressEvent) {
        this.callSuper(v, supressEvent);
        if (this.inited) this.updateImageSize();
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    filterFiles: function(file) {
        if (!myt.ImageUploader.isImageFile(file)) return null;
        
        // Remove existing file
        while (this.files.length > 0) this.removeFile(this.files[0]);
        
        return this.callSuper(file);
    },
    
    addFile: function(file) {
        var self = this;
        
        self.callSuper(file);
        
        var image = self.image = new myt.Image(self, {useNaturalSize:false, align:'center', valign:'middle'});
        
        image.file = file;
        
        // Read into image
        if (file.size === -1) {
            var img = new Image();
            img.onload = function() {
                file.width = this.width;
                file.height = this.height;
                
                if (!image || image.destroyed) return;
                
                self.updateImage(file, image, this.src);
            };
            img.src = file.serverPath;
        } else if (FileReader !== undefined && myt.ImageUploader.isImageFile(file)) {
            myt.Uploader.readFile(file, function(event) {
                var img = new Image();
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
    
    scaleToFit: function(boundsWidth, boundsHeight, imgWidth, imgHeight) {
        var boundsRatio = boundsWidth / boundsHeight;
        var imgRatio = imgWidth / imgHeight;
        
        if (imgRatio > boundsRatio) {
            return [boundsWidth, imgHeight * boundsWidth / imgWidth];
        } else {
            return [imgWidth * boundsHeight / imgHeight, boundsHeight];
        }
    },
    
    removeFile: function(file) {
        this.callSuper(file);
        
        var images = this.getSubviews(),
            i = images.length,
            image;
        while (i) {
            image = images[--i];
            if (myt.Uploader.isSameFile(image.file, file)) {
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
        var image = this.image;
        if (image && !image.destroyed) {
            var size = this.scaleToFit(this.width, this.height, this.nativeWidth, this.nativeHeight),
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

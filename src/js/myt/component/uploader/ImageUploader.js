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
    
    
    // Methods /////////////////////////////////////////////////////////////////
    filterFiles: function(file) {
        if (!myt.ImageUploader.isImageFile(file)) return false;
        
        // Remove existing file
        while (this.files.length > 0) this.removeFile(this.files[0]);
        
        retval = this.callSuper(file);
        if (!retval) return false;
        
        return true;
    },
    
    addFile: function(file) {
        this.callSuper(file);
        
        var image = this.getImageToReadInto();
        if (image) {
            image.file = file;
            this.readImageInto(file, image);
        }
    },
    
    getImageToReadInto: function() {
        return new myt.Image(this, {
            useNaturalSize:false, align:'center', valign:'middle'
        });
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
        
        var images = this.getSubviews(), i = images.length, image;
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
    
    readImageInto: function(file, image) {
        var self = this;
        if (file.size === -1) {
            var img = new Image();
            img.onload = function() {
                file.width = this.width;
                file.height = this.height;
                
                if (!image || image.destroyed) return
                
                self.updateImage(file, image, this.src);
            };
            img.src = file.serverPath;
        } else if (FileReader !== undefined && myt.ImageUploader.isImageFile(file)) {
            myt.Uploader.readFile(file, function(event) {
                var img = new Image();
                img.onload = function() {
                    file.width = this.width;
                    file.height = this.height;
                    
                    if (!image || image.destroyed) return
                    
                    self.updateImage(file, image, this.src);
                };
                img.src = event.target.result;
            });
        }
    },
    
    updateImage: function(file, image, src) {
        var size = this.scaleToFit(this.width, this.height, file.width, file.height),
            w = Math.round(size[0]), 
            h = Math.round(size[1]);
        image.setImageSize(w + 'px ' + h + 'px');
        image.setWidth(w);
        image.setHeight(h);
        image.setImageUrl(src);
    }
});

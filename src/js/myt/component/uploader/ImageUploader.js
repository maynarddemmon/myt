/** Component to upload image files. */
myt.ImageUploader = new JS.Class('ImageUploader', myt.Uploader, {
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides myt.View */
    initNode: function(parent, attrs) {
        attrs.maxFiles = 1;
        
        this.callSuper(parent, attrs);
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    filterFiles: function(file) {
        if (!this.isImageFile(file)) return false;
        
        // Remove existing file
        while (this.files.length > 0) this.removeFile(this.files[0]);
        
        retval = this.callSuper(file);
        if (!retval) return false;
        
        return true;
    },
    
    addFile: function(file) {
        this.callSuper(file);
        
        var image = new myt.Image(this, {
            useNaturalSize:false, align:'center', valign:'middle'
        });
        image.file = file;
        
        this.readImageInto(file, image);
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
        
        var images = this.subviews, i = images.length, image;
        while (i) {
            image = images[--i];
            if (this.isSameFile(image.file, file)) {
                image.destroy();
                break;
            }
        }
    },
    
    handleDroppedFile: function(file) {
        this.callSuper(file);
        
        this.uploadFile(file, this.uploadUrl);
    },
    
    readImageInto: function(file, image) {
        if (FileReader !== undefined && this.isImageFile(file)) {
            var self = this;
            this.readFile(file, function(event) {
                if (!image || image.destroyed) return
                
                var img = new Image();
                img.onload = function() {
                    file.width = this.width;
                    file.height = this.height;
                    
                    var size = self.scaleToFit(self.width, self.height, file.width, file.height),
                        w = Math.round(size[0]), 
                        h = Math.round(size[1]);
                    image.setImageSize(w + 'px ' + h + 'px');
                    image.setWidth(w);
                    image.setHeight(h);
                    image.setImageUrl(this.src);
                };
                img.src = event.target.result;
            });
        }
    },
    
    isImageFile: function(file) {
        return (/image/i).test(file.type);
    }
});

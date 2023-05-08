(pkg => {
    const 
        /*  Stores widths and heights of images by URL so we don't have to reload them to 
            get sizes. */
        sizeCache = {},
        
        /*  Tracks requests to get the width and height of an image. Used to prevent multiple 
            requests being made for the same image URL. */
        openQueryCache = {},
        
        getSizeFromCache = imgUrl => sizeCache[imgUrl],
        
        /*  Loads an image to measure its size. */
        loadImageAndMeasureIt = imageView => {
            const imgUrl = imageView.imageUrl;
            if (imageView.calculateNaturalSize && imgUrl) {
                const cachedSize = getSizeFromCache(imgUrl);
                if (cachedSize) {
                    // Cache hit
                    imageView.setNaturalWidth(cachedSize.width);
                    imageView.setNaturalHeight(cachedSize.height);
                } else {
                    // Cache miss
                    let openQuery = openQueryCache[imgUrl];
                    if (!openQuery) {
                        // Lazy instantiate the open query array.
                        openQueryCache[imgUrl] = openQuery = [];
                        
                        // Start a size query
                        const img = new Image();
                        img.onerror = err => {
                            // Notify all ImageSupport instances that are waiting for a natural 
                            // size that an error has occurred.
                            const openQueries = openQueryCache[imgUrl];
                            if (openQueries) {
                                let i = openQueries.length;
                                while (i) openQueries[--i].setImageLoadingError(true);
                                
                                // Cleanup
                                openQueries.length = 0;
                                delete openQueryCache[imgUrl];
                            }
                        };
                        img.onload = () => {
                            // Notify all ImageSupport instances that are waiting for a 
                            // natural size.
                            const w = img.width,
                                h = img.height,
                                openQueries = openQueryCache[imgUrl];
                            if (openQueries) {
                                let i = openQueries.length;
                                while (i) {
                                    const imageSupportInstance = openQueries[--i];
                                    if (imageSupportInstance.imageUrl === imgUrl) {
                                        imageSupportInstance.setNaturalWidth(w);
                                        imageSupportInstance.setNaturalHeight(h);
                                    }
                                }
                                
                                // Cleanup
                                openQueries.length = 0;
                                delete openQueryCache[imgUrl];
                            }
                            
                            // Store size in cache.
                            sizeCache[imgUrl] = {width:w, height:h};
                        };
                        img.src = imgUrl;
                    }
                    
                    openQuery.push(imageView);
                }
            }
        };
    
    /** Adds support for image display to a View.
        
        Events:
            imageUrl:string
            imageSize:string
            imageRepeat:string
            imagePosition:string
            imageAttachment:string
            calculateNaturalSize:boolean
            naturalWidth:number
            naturalHeight:number
            useNaturalSize:boolean
            imageLoadingError:boolean
        
        Attributes:
            imageUrl:string The URL to load the image data from.
            imageSize:string Determines the size of the image. Allowed values are: 'auto', 'cover', 
                'contain', absolute ('20px 10px') and percentage ('100% 50%').
            imageRepeat:string Determines if an image is repeated or not. Allowed values: 'repeat', 
                'repeat-x', 'repeat-y', 'no-repeat', 'inherit'. Defaults to 'no-repeat'.
            imagePosition:string Determines where an image is positioned.
            imageAttachment:string Determines how an image is attached to the view. Allowed values 
                are: 'scroll', 'fixed', 'inherit'. The default value is 'scroll'.
            calculateNaturalSize:boolean Determines if the natural size should be automatically 
                calculated or not. Defaults to undefined which is equivalent to false.
            naturalWidth:number The natural width of the image. Only set if calculateNaturalWidth 
                is true.
            naturalHeight:number The natural height of the image. Only set if calculateNaturalWidth 
                is true.
            useNaturalSize:boolean If true this image view will be sized to the naturalWidth and 
                naturalHeight and calculateNaturalSize will be set to true.
            imageLoadingError:boolean Gets set to true when an error occurs loading the image. The 
                image will be loaded whenever the calculateNaturalSize attribute is set to true.
        
        @class */
    pkg.ImageSupport = new JS.Module('ImageSupport', {
        // Class Methods and Attributes ////////////////////////////////////////
        extend: {
            getSizeFromCache: getSizeFromCache
        },
        
        
        // Life Cycle //////////////////////////////////////////////////////////
        /** @overrides myt.Node */
        initNode: function(parent, attrs) {
            attrs.imageRepeat ??= 'no-repeat';
            attrs.imageAttachment ??= 'scroll';
            
            this.callSuper(parent, attrs);
        },
        
        
        // Accessors ///////////////////////////////////////////////////////////
        setImageUrl: function(v) {
            if (this.imageUrl !== v) {
                this.imageUrl = v;
                this.getIDS().backgroundImage = v ? 'url("' + v + '")' : 'none';
                if (this.inited) {
                    this.fireEvent('imageUrl', v);
                    this.setNaturalWidth();
                    this.setNaturalHeight();
                    
                    // Collapse size if no url and we are using natural size
                    if (!v && this.useNaturalSize) {
                        this.setWidth(0);
                        this.setHeight(0);
                    }
                }
                loadImageAndMeasureIt(this);
            }
        },
        
        setImageLoadingError: function(v) {this.set('imageLoadingError', v, true);},
        
        setImageSize: function(v) {
            if (this.imageSize !== v) {
                this.imageSize = v;
                this.getIDS().backgroundSize = v || 'auto';
                if (this.inited) this.fireEvent('imageSize', v);
            }
        },
        
        setImageRepeat: function(v) {
            if (this.imageRepeat !== v) {
                this.getIDS().backgroundRepeat = this.imageRepeat = v;
                if (this.inited) this.fireEvent('imageRepeat', v);
            }
        },
        
        setImagePosition: function(v) {
            if (this.imagePosition !== v) {
                this.getIDS().backgroundPosition = this.imagePosition = v;
                if (this.inited) this.fireEvent('imagePosition', v);
            }
        },
        
        setImageAttachment: function(v) {
            if (this.imageAttachment !== v) {
                this.getIDS().backgroundAttachment = this.imageAttachment = v;
                if (this.inited) this.fireEvent('imageAttachment', v);
            }
        },
        
        setCalculateNaturalSize: function(v) {
            if (this.calculateNaturalSize !== v) {
                this.calculateNaturalSize = v;
                if (this.inited) this.fireEvent('calculateNaturalSize', v);
                loadImageAndMeasureIt(this);
            }
        },
        
        setNaturalWidth: function(v) {
            if (this.naturalWidth !== v) {
                this.naturalWidth = v;
                if (this.inited) this.fireEvent('naturalWidth', v);
                if (this.useNaturalSize && v) this.setWidth(v);
            }
        },
        
        setNaturalHeight: function(v) {
            if (this.naturalHeight !== v) {
                this.naturalHeight = v;
                if (this.inited) this.fireEvent('naturalHeight', v);
                if (this.useNaturalSize && v) this.setHeight(v);
            }
        },
        
        setUseNaturalSize: function(v) {
            if (this.useNaturalSize !== v) {
                this.useNaturalSize = v;
                if (this.inited) this.fireEvent('useNaturalSize', v);
                
                // Sync width and height
                if (v) {
                    if (this.naturalWidth) this.setWidth(this.naturalWidth);
                    if (this.naturalHeight) this.setHeight(this.naturalHeight);
                }
                
                // Turn on calculation of natural size if we're going to use natural size.
                if (v && !this.calculateNaturalSize) this.setCalculateNaturalSize(true);
            }
        }
    });
})(myt);

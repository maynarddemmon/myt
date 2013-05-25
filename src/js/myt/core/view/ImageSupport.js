/** Adds support for image display to a View. */
myt.ImageSupport = new JS.Module('ImageSupport', {
    // Class Methods ///////////////////////////////////////////////////////////
    extend: {
        /** Stores widths and heights of images by URL so we don't have to
            reload them to get sizes. */
        SIZE_CACHE:{},
        
        /** Tracks requests to get the width and height of an image. Used to
            prevent multiple requests being made for the same image URL. */
        OPEN_SIZE_QUERIES:{}
    },
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides myt.Node */
    initNode: function(parent, attrs) {
        if (attrs.imageRepeat === undefined) attrs.imageRepeat = 'no-repeat';
        if (attrs.imageAttachment === undefined) attrs.imageAttachment = 'scroll';
        
        this.callSuper(parent, attrs);
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setImageUrl: function(v) {
        if (this.imageUrl === v) return;
        this.imageUrl = v;
        this.deStyle.backgroundImage = v ? "url('" + v + "')" : 'none';
        if (this.inited) {
            this.fireNewEvent('imageUrl', v);
            this.setNaturalWidth(undefined);
            this.setNaturalHeight(undefined);
        }
        this.__calculateNaturalSize();
    },
    
    setImageSize: function(v) {
        if (this.imageSize === v) return;
        this.imageSize = v;
        this.deStyle.backgroundSize = v ? v : 'auto';
        if (this.inited) this.fireNewEvent('imageSize', v);
    },
    
    /** Allowed values: repeat, repeat-x, repeat-y, no-repeat, inherit */
    setImageRepeat: function(v) {
        if (this.imageRepeat === v) return;
        this.deStyle.backgroundRepeat = this.imageRepeat = v;
        if (this.inited) this.fireNewEvent('imageRepeat', v);
    },
    
    setImagePosition: function(v) {
        if (this.imagePosition === v) return;
        this.deStyle.backgroundPosition = this.imagePosition = v;
        if (this.inited) this.fireNewEvent('imagePosition', v);
    },
    
    /** Allowed values: scroll, fixed, inherit */
    setImageAttachment: function(v) {
        if (this.imageAttachment === v) return;
        this.deStyle.backgroundAttachment = this.imageAttachment = v;
        if (this.inited) this.fireNewEvent('imageAttachment', v);
    },
    
    /** Determines if the natural size should be automatically calculated 
        or not. */
    setCalculateNaturalSize: function(v) {
        if (this.calculateNaturalSize === v) return;
        this.calculateNaturalSize = v;
        if (this.inited) this.fireNewEvent('calculateNaturalSize', v);
        this.__calculateNaturalSize();
    },
    
    /** The natural width of the image. */
    setNaturalWidth: function(v) {
        if (this.naturalWidth === v) return;
        this.naturalWidth = v;
        if (this.inited) this.fireNewEvent('naturalWidth', v);
        if (this.useNaturalSize && v) this.setWidth(v);
    },
    
    /** The natural width of the image. */
    setNaturalHeight: function(v) {
        if (this.naturalHeight === v) return;
        this.naturalHeight = v;
        if (this.inited) this.fireNewEvent('naturalHeight', v);
        if (this.useNaturalSize && v) this.setHeight(v);
    },
    
    /** Indicates if this view should be sized to the natural size of the
        image. If set to true, calculateNaturalSize will also be set to true. */
    setUseNaturalSize: function(v) {
        if (this.useNaturalSize === v) return;
        this.useNaturalSize = v;
        if (this.inited) this.fireNewEvent('useNaturalSize', v);
        
        // Sync width and height
        if (v) {
            if (this.naturalWidth) this.setWidth(this.naturalWidth);
            if (this.naturalHeight) this.setHeight(this.naturalHeight);
        }
        
        // Turn on calculation of natural size if we're going to use
        // natural size.
        if (v && !this.calculateNaturalSize) this.setCalculateNaturalSize(true);
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** Loads an image to measure its size.
        @returns void */
    __calculateNaturalSize: function() {
        var imgUrl = this.imageUrl;
        if (this.calculateNaturalSize && imgUrl) {
            var sizeCache = myt.ImageSupport.SIZE_CACHE;
            var cachedSize = sizeCache[imgUrl];
            if (cachedSize) {
                // Cache hit
                this.setNaturalWidth(cachedSize.width);
                this.setNaturalHeight(cachedSize.height);
            } else {
                // Cache miss
                var openQueryCache = myt.ImageSupport.OPEN_SIZE_QUERIES;
                var openQuery = openQueryCache[imgUrl];
                if (!openQuery) {
                    // Lazy instantiate the open query array.
                    openQueryCache[imgUrl] = openQuery = [];
                    
                    // Start a size query
                    var img = new Image();
                    img.onload = function() {
                        var w = this.width, h = this.height;
                        
                        // Notify all ImageSupport instances that are waiting
                        // for a natural size.
                        var openQueries = openQueryCache[imgUrl];
                        if (openQueries) {
                            var i = openQueries.length;
                            var imageSupportInstance;
                            while (i) {
                                imageSupportInstance = openQueries[--i];
                                imageSupportInstance.setNaturalWidth(w);
                                imageSupportInstance.setNaturalHeight(h);
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
                
                openQuery.push(this);
            }
        }
    }
});

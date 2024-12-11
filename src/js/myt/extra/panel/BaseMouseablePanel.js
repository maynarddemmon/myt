/** A base class for MouseableH3Panel and MouseableV3Panel.
    Includes the myt.Button mixin.
    
    Events:
        None
    
    Attributes:
        imageRoot:string The path to the directory with the images.
        extension:string The file extension for the images.
        firstPrefix:string The filename for the top/left panel image.
        secondPrefix:string The filename for the middle/center panel image.
        thirdPrefix:string The filename for the bottom/right panel image.
*/
myt.BaseMouseablePanel = new JS.Module('BaseMouseablePanel', {
    include: [myt.Button],
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    initNode: function(parent, attrs) {
        this.extension = 'png';
        
        // @overrides behavior from HorizontalThreePanel and VerticalThreePanel
        // mixins which will be used with this mixin in MouseableH3Panel
        // and MouseableV3Panel respectively.
        attrs.repeat ??= false;
        
        this.callSuper(parent, attrs);
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setImageRoot: function(v) {
        if (this.imageRoot !== v) {
            this.imageRoot = v;
            if (this.inited) updateUI();
        }
    },
    
    setExtension: function(v) {
        if (this.extension !== v) {
            this.extension = v;
            if (this.inited) updateUI();
        }
    },
    
    setFirstPrefix: function(v) {
        if (this.firstPrefix !== v) {
            this.firstPrefix = v;
            if (this.inited) updateUI();
        }
    },
    
    setSecondPrefix: function(v) {
        if (this.secondPrefix !== v) {
            this.secondPrefix = v;
            if (this.inited) updateUI();
        }
    },
    
    setThirdPrefix: function(v) {
        if (this.thirdPrefix !== v) {
            this.thirdPrefix = v;
            if (this.inited) updateUI();
        }
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** @overrides myt.Button */
    drawDisabledState: function() {
        this.setOpacity(myt.theme.disabledOpacity);
        this.__updateImageUrls('up');
    },
    
    /** @overrides myt.Button */
    drawHoverState: function() {
        this.setOpacity(1);
        this.__updateImageUrls('mo');
    },
    
    /** @overrides myt.Button */
    drawActiveState: function() {
        this.setOpacity(1);
        this.__updateImageUrls('dn');
    },
    
    /** @overrides myt.Button */
    drawReadyState: function() {
        this.setOpacity(1);
        this.__updateImageUrls('up');
    },
    
    /** @private */
    __updateImageUrls: function(mouseState) {
        const suffix = '_' + mouseState + '.' + this.extension,
            imageRoot = this.imageRoot;
        
        this.first.setImageUrl(imageRoot + this.firstPrefix + suffix);
        this.second.setImageUrl(imageRoot + this.secondPrefix + suffix);
        this.third.setImageUrl(imageRoot + this.thirdPrefix + suffix);
    }
});

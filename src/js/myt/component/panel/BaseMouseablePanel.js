/** A base class for MouseableH3Panel and MouseableV3Panel.
    Includes the myt.Button mixin. */
myt.BaseMouseablePanel = new JS.Module('BaseMouseablePanel', {
    include: [myt.Button],
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    initNode: function(parent, attrs) {
        this.extension = 'png';
        
        // @overrides behavior from HorizontalThreePanel and VerticalThreePanel
        // mixins which will be used in with this mixin in MouseableH3Panel
        // and MouseableV3Panel respectively.
        if (attrs.repeat === undefined) attrs.repeat = false;
        
        this.callSuper(parent, attrs);
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setImageRoot: function(v) {
        if (this.imageRoot === v) return;
        this.imageRoot = v;
        if (this.inited) updateUI();
    },
    
    setExtension: function(v) {
        if (this.extension === v) return;
        this.extension = v;
        if (this.inited) updateUI();
    },
    
    setFirstPrefix: function(v) {
        if (this.firstPrefix === v) return;
        this.firstPrefix = v;
        if (this.inited) updateUI();
    },
    
    setSecondPrefix: function(v) {
        if (this.secondPrefix === v) return;
        this.secondPrefix = v;
        if (this.inited) updateUI();
    },
    
    setThirdPrefix: function(v) {
        if (this.thirdPrefix === v) return;
        this.thirdPrefix = v;
        if (this.inited) updateUI();
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** @overrides myt.Button */
    drawDisabledState: function() {
        this.setOpacity(0.5);
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
    
    __updateImageUrls: function(mouseState) {
        var suffix = '_' + mouseState + '.' + this.extension;
        var imageRoot = this.imageRoot;
        
        this.first.setImageUrl(imageRoot + this.firstPrefix + suffix);
        this.second.setImageUrl(imageRoot + this.secondPrefix + suffix);
        this.third.setImageUrl(imageRoot + this.thirdPrefix + suffix);
    }
});

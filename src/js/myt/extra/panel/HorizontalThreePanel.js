/** Must be mixed onto a View.
    
    A set of three images where the middle images resizes to fill the
    available space. This component lays out the views horizontally.
    
    Events:
        repeat:boolean
    
    Attributes:
        firstImageUrl:string
        secondImageUrl:string
        thirdImageUrl:string
        repeat:boolean Determines if the second image is stretched(false) or 
            repeated(true). Defaults to true.
*/
myt.HorizontalThreePanel = new JS.Module('HorizontalThreePanel', {
    // Life Cycle //////////////////////////////////////////////////////////////
    initNode: function(parent, attrs) {
        this.repeat = true;
        
        this.callSuper(parent, attrs);
    },
    
    doBeforeAdoption: function() {
        var self = this;
        
        self.callSuper();
        
        var m = myt;
        new m.Image(self, {
            name:'first', imageUrl:self.firstImageUrl, ignoreLayout:true
        });
        
        var second = new m.Image(self, {
            name:'second', layoutHint:1, imageUrl:self.secondImageUrl, 
            ignoreLayout:true, useNaturalSize:false, calculateNaturalSize:true
        });
        self.attachTo(second, '__updateSize', 'naturalHeight');
        self.attachTo(second, '__updateImageSize', 'width');
        
        new m.Image(self, {
            name:'third', imageUrl:self.thirdImageUrl, ignoreLayout:true
        });
        
        var ignoreMixin = [m.ThreePanel.IGNORE_FUNCTION_MIXIN];
        new m.ResizeLayout(self, {name:'resizeLayout'}, ignoreMixin);
        new m.SizeToChildren(self, {axis:'y'}, ignoreMixin);
        
        self.__updateRepeat();
        self.__updateSize();
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setFirstImageUrl: function(v) {
        if (this.firstImageUrl !== v) {
            this.firstImageUrl = v;
            if (this.inited) this.first.setImageUrl(v);
        }
    },
    
    setSecondImageUrl: function(v) {
        if (this.secondImageUrl !== v) {
            this.secondImageUrl = v;
            if (this.inited) this.second.setImageUrl(v);
        }
    },
    
    setThirdImageUrl: function(v) {
        if (this.thirdImageUrl !== v) {
            this.thirdImageUrl = v;
            if (this.inited) this.third.setImageUrl(v);
        }
    },
    
    setRepeat: function(v) {
        if (this.repeat !== v) {
            this.repeat = v;
            if (this.inited) {
                this.fireEvent('repeat', v);
                this.__updateRepeat();
            }
        }
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** @private */
    __updateSize: function(event) {
        var v = this.second;
        v.setHeight(v.naturalHeight);
        this.__updateImageSize();
    },
    
    /** @private */
    __updateImageSize: function(event) {
        var v = this.second;
        v.setImageSize(this.repeat ? undefined : v.width + 'px ' + v.height + 'px');
    },
    
    /** @private */
    __updateRepeat: function() {
        this.second.setImageRepeat(this.repeat ? 'repeat-x' : 'no-repeat');
    }
});

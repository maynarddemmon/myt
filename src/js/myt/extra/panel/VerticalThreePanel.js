/** Must be mixed onto a View.
    
    A set of three images where the middle images resizes to fill the
    available space. This component lays out the views vertically.
    
    Events:
        repeat:boolean
    
    Attributes:
        firstImageUrl:string
        secondImageUrl:string
        thirdImageUrl:string
        repeat:boolean Determines if the second image is stretched(false) or 
            repeated(true). Defaults to true.
*/
myt.VerticalThreePanel = new JS.Class('VerticalThreePanel', {
    // Life Cycle //////////////////////////////////////////////////////////////
    initNode: function(parent, attrs) {
        this.repeat = false;
        
        this.callSuper(parent, attrs);
    },
    
    doBeforeAdoption: function() {
        const self = this,
            m = myt;
            
        self.callSuper();
        
        new m.Image(self, {
            name:'first', imageUrl:self.firstImageUrl, ignoreLayout:true
        });
        
        const second = new m.Image(self, {
            name:'second', layoutHint:1, imageUrl:self.secondImageUrl, 
            ignoreLayout:true, useNaturalSize:false, calculateNaturalSize:true
        });
        self.attachTo(second, '__updateSize', 'naturalWidth');
        self.attachTo(second, '__updateImageSize', 'height');
        
        new m.Image(self, {
            name:'third', imageUrl:self.thirdImageUrl, ignoreLayout:true
        });
        
        const ignoreMixin = [m.ThreePanel.IGNORE_FUNCTION_MIXIN];
        new m.ResizeLayout(self, {name:'resizeLayout', axis:'y'}, ignoreMixin);
        new m.SizeToChildren(self, {axis:'x'}, ignoreMixin);
        
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
    /** @private
        @param {!Object} _event
        @returns {void} */
    __updateSize: function(_event) {
        const v = this.second;
        v.setWidth(v.naturalWidth);
        this.__updateImageSize();
    },
    
    /** @private
        @param {!Object} _event
        @returns {void} */
    __updateImageSize: function(_event) {
        const v = this.second;
        v.setImageSize(this.repeat ? undefined : v.width + 'px ' + v.height + 'px');
    },
    
    /** @private
        @returns {void} */
    __updateRepeat: function() {
        this.second.setImageRepeat(this.repeat ? 'repeat-y' : 'no-repeat');
    }
});

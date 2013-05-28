/** Must be mixed onto a View.
    
    A set of three images where the middle images resizes to fill the
    available space. This component lays out the views vertically. */
myt.VerticalThreePanel = new JS.Class('VerticalThreePanel', {
    // Life Cycle //////////////////////////////////////////////////////////////
    initNode: function(parent, attrs) {
        if (attrs.repeat === undefined) attrs.repeat = false;
        
        this.callSuper(parent, attrs);
    },
    
    doBeforeAdoption: function() {
        this.callSuper();
        
        new myt.Image(this, {
            name:'first', imageUrl:this.firstImageUrl, ignoreLayout:true
        });
        
        new myt.Image(this, {
            name:'second', layoutHint:1, imageUrl:this.secondImageUrl, ignoreLayout:true,
            useNaturalSize:false, calculateNaturalSize:true
        });
        this.attachTo(this.second, '__updateSize', 'naturalWidth');
        this.attachTo(this.second, '__updateImageSize', 'height');
        
        new myt.Image(this, {
            name:'third', imageUrl:this.thirdImageUrl, ignoreLayout:true
        });
        
        new myt.ResizeLayout(this, {name:'resizeLayout', axis:'y'}, [{
            ignore: function(sv) {
                switch (sv.name) {
                    case 'first': case 'second': case 'third': return false;
                    default: return true;
                }
            }
        }]);
        new myt.SizeToChildren(this, {axis:'x'}, [{
            ignore: function(sv) {
                switch (sv.name) {
                    case 'first': case 'second': case 'third': return false;
                    default: return true;
                }
            }
        }]);
        
        this.__updateRepeat();
        this.__updateSize();
        this.__updateImageSize();
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setFirstImageUrl: function(v) {
        if (this.firstImageUrl === v) return;
        this.firstImageUrl = v;
        if (this.inited) this.first.setImageUrl(v);
    },
    
    setSecondImageUrl: function(v) {
        if (this.secondImageUrl === v) return;
        this.secondImageUrl = v;
        if (this.inited) this.second.setImageUrl(v);
    },
    
    setThirdImageUrl: function(v) {
        if (this.thirdImageUrl === v) return;
        this.thirdImageUrl = v;
        if (this.inited) this.third.setImageUrl(v);
    },
    
    /** Determines if the second image is stretched(false) or 
        repeated(true). The default is stretched. */
    setRepeat: function(v) {
        if (this.repeat === v) return;
        this.repeat = v;
        if (this.inited) {
            this.fireNewEvent('repeat', v);
            this.__updateRepeat();
        }
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    __updateSize: function(e) {
        var v = this.second;
        v.setWidth(v.naturalWidth);
        this.__updateImageSize();
    },
    
    __updateImageSize: function(e) {
        var v = this.second;
        v.setImageSize(this.repeat ? undefined : v.width + 'px ' + v.height + 'px');
    },
    
    __updateRepeat: function(e) {
        this.second.setImageRepeat(this.repeat ? 'repeat-y' : 'no-repeat');
    }
});

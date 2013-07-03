/** Must be mixed onto a View.
    
    A set of three images where the middle images resizes to fill the
    available space. If you only need support for a single axis you should
    instead use HorizontalThreePanel or VerticalThreePanel since they are
    a bit more optimized.
    
    Attribute: axis
        Determines if the views are layed out along the x-axis or y-axis.
        This value can be changed at runtime and the component will update
        itself. You will need to setWidth/setHeight appropriately for the
        new axis. The default axis is 'x'.
        
    Attribute: repeat
        If true the image on the middle view will be repeated rather than
        stretched. The default is stretched(false).
*/
myt.ThreePanel = new JS.Module('ThreePanel', {
    // Class Methods and Attributes ////////////////////////////////////////////
    extend: {
        /** The common ignore function used in the myt.ResizeLayout and 
            myt.SizeToChildren in all myt.ThreePanel, myt.HorizontalThreePanel 
            and myt.VerticalThreePanel instances. */
        IGNORE_FUNCTION_MIXIN: {
            ignore: function(sv) {
                switch (sv.name) {
                    case 'first': case 'second': case 'third': return false;
                    default: return true;
                }
            }
        }
    },
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    initNode: function(parent, attrs) {
        if (attrs.axis === undefined) attrs.axis = 'x';
        if (attrs.repeat === undefined) attrs.repeat = false;
        
        this.callSuper(parent, attrs);
    },
    
    doBeforeAdoption: function() {
        this.callSuper();
        
        new myt.Image(this, {
            name:'first', imageUrl:this.firstImageUrl, ignoreLayout:true
        });
        
        var second = new myt.Image(this, {
            name:'second', layoutHint:1, imageUrl:this.secondImageUrl, 
            ignoreLayout:true, useNaturalSize:false, calculateNaturalSize:true,
        });
        this.attachTo(second, '__updateSize', 'naturalWidth');
        this.attachTo(second, '__updateSize', 'naturalHeight');
        this.attachTo(second, '__updateImageSize', 'width');
        this.attachTo(second, '__updateImageSize', 'height');
        
        new myt.Image(this, {
            name:'third', imageUrl:this.thirdImageUrl, ignoreLayout:true
        });
        
        var axis = this.axis;
        var otherAxis = axis === 'x' ? 'y' : 'x';
        var ignoreMixin = [myt.ThreePanel.IGNORE_FUNCTION_MIXIN];
        new myt.ResizeLayout(this, {name:'resizeLayout', axis:axis}, ignoreMixin);
        new myt.SizeToChildren(this, {name:'sizeToChildren', axis:otherAxis}, ignoreMixin);
        
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
    
    setAxis: function(v) {
        if (this.axis === v) return;
        this.axis = v;
        
        if (this.inited) {
            this.__updateRepeat();
            if (v === 'x') {
                this.first.setY(0);
                this.second.setY(0);
                this.third.setY(0);
            } else {
                this.first.setX(0);
                this.second.setX(0);
                this.third.setX(0);
            }
            this.__updateSize();
            this.resizeLayout.setAxis(v);
            this.sizeToChildren.setAxis(v === 'x' ? 'y' : 'x');
            this.fireNewEvent('axis', v);
        }
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
        if (this.axis === 'x') {
            v.setHeight(v.naturalHeight);
        } else {
            v.setWidth(v.naturalWidth);
        }
    },
    
    __updateImageSize: function(e) {
        var v = this.second;
        if (this.repeat) {
            v.setImageSize();
        } else {
            v.setImageSize(v.width + 'px ' + v.height + 'px');
        }
    },
    
    __updateRepeat: function(e) {
        var v = this.second;
        if (this.repeat) {
            if (this.axis === 'x') {
                v.setImageRepeat('repeat-x');
            } else {
                v.setImageRepeat('repeat-y');
            }
        } else {
            v.setImageRepeat('no-repeat');
        }
    }
});

(pkg => {
    const {Class:JSClass, Module:JSModule} = JS,
        
        {View, Text} = pkg,
        
        FA_TIMES = pkg.FontAwesome.makeTag(['times']);
    
    pkg.GrowlManager = new JSClass('GrowlManager', View, {
        include:[pkg.RootView],
        
        
        // Life Cycle //////////////////////////////////////////////////////////
        initNode: function(parent, attrs) {
            const self = this;
            
            attrs.margin ??= 8;
            attrs.spacing ??= 4;
            attrs.reverse ??= true;
            attrs.width ??= 300;
            attrs.visible ??= false;
            attrs.pointerEvents ??= 'none';
            
            attrs.moveDuration ??= 300;
            
            self.quickSet(['moveDuration'], attrs);
            
            self.callSuper(parent, attrs);
            
            self.doAlignment();
            
            const moveDuration = self.moveDuration;
            new pkg.SpacedLayout(self, {
                axis:'y', reverse:self.reverse, spacing:self.spacing, collapseParent:true
            }, [{
                updateParent: function(setterName, value) {
                    if (moveDuration > 0) {
                        self.stopActiveAnimators('height');
                        self.animate({attribute:'height', to:value + this.outset - this.spacing, duration:moveDuration});
                    } else {
                        this.callSuper(setterName, value);
                    }
                },
                updateSubview: function(count, sv, setterName, value) {
                    if (moveDuration > 0) {
                        sv.stopActiveAnimators('y');
                        sv.animate({attribute:'y', to:value, duration:moveDuration});
                        return value + sv.height + this.spacing;
                    } else {
                        return this.callSuper(count, sv, setterName, value);
                    }
                }
            }]);
        },
        
        
        // Accessors ///////////////////////////////////////////////////////////
        /** @overrides */
        setVisible: function(v) {
            const self = this;
            if (self.visible !== v) {
                self.visible = v;
                self.getODS().display = v ? 'block' : 'none';
                if (self.inited) self.fireEvent('visible', v);
            }
        },
        
        setMargin: function(v) {
            this.set('margin', v, true);
            this.getODS().margin = v + 'px';
        },
        setSpacing: function(v) {this.set('spacing', v, true);},
        setReverse: function(v) {this.set('reverse', v, true);},
        
        
        // Methods /////////////////////////////////////////////////////////////
        doAlignment: function() {
            const ods = this.getODS();
            ods.left = null;
            ods.right = '0px';
        },
        
        notifyChanged: function() {
            this.setVisible(this.getSubviews().length > 0);
        },
        
        /** @overrides */
        subviewAdded: function(sv) {
            this.callSuper(sv);
            this.notifyChanged();
        },
        
        /** @overrides */
        subviewRemoved: function(sv) {
            this.callSuper(sv);
            this.notifyChanged();
        },
        
        addGrowl: function(growl) {
            growl.setParent(this);
            growl.setVisible(true);
        },
        
        removeGrowl: function(growl, destroy) {
            if (destroy) {
                growl.destroy();
            } else {
                growl.setParent(null);
            }
        },
        
        // Convience Methods
        addSimpleGrowl: function(msg, attrs) {
            this.addGrowl(new pkg.SimpleGrowl(this, {
                text:msg, 
                ...(attrs ?? {})
            }));
        }
    });
    
    /** A mixin used to keep a floating panel open when mousing over the floating panel and 
        possibly other Views.
        
        @class */
    pkg.KeepShowingMixin = new JSModule('KeepShowingMixin', {
        include: [pkg.MouseOver],
        
        
        // Life Cycle //////////////////////////////////////////////////////////
        initNode: function(parent, attrs) {
            attrs.initialKeepDuration ??= -1; // Forever
            attrs.keepDuration ??= -1; // Forever
            
            this.quickSet(['initialKeepDuration','keepDuration'], attrs);
            
            this.callSuper(parent, attrs);
            
            const initialKeepDuration = this.initialKeepDuration;
            if (initialKeepDuration >= 0) this.keepShowing(false, initialKeepDuration);
        },
        
        
        // Methods ////////////////////////////////////////////////////////////
        keepShowing: function(v, duration=-1) {
            const self = this;
            
            self.__keepShowing = v;
            if (v && self.__timerIdKS) clearTimeout(self.__timerIdKS);
            
            if (duration >= 0 && !v) {
                self.__timerIdKS = setTimeout(() => {
                    const isShown = typeof self.isShown === 'function' ? self.isShown() : self.visible;
                    if (isShown && !self.__keepShowing) {
                        if (typeof self.hide === 'function') {
                            self.hide(true);
                        } else {
                            self.setVisible(false);
                        }
                    }
                }, duration);
            }
        },
        
        /** @overrides myt.MouseOver */
        doMouseOver: function(event) {
            this.keepShowing(true, this.keepDuration);
            this.callSuper(event);
        },
        
        /** @overrides myt.MouseOver */
        doMouseOut: function(event) {
            this.keepShowing(false, this.keepDuration);
            this.callSuper(event);
        }
    });
    
    pkg.KeepShowingChildMixin = new JSModule('KeepShowingChildMixin', {
        doMouseOver: function(event) {
            this.callSuper(event);
            return true;
        },
        doMouseOut: function(event) {
            this.callSuper(event);
            return true;
        }
    });
    
    pkg.GrowlMixin = new JSModule('GrowlMixin', {
        include:[pkg.SizeToParent, pkg.KeepShowingMixin],
        
        
        // Life Cycle //////////////////////////////////////////////////////////
        initNode: function(parent, attrs) {
            attrs.percentOfParentWidth ??= 100;
            attrs.pointerEvents ??= 'auto';
            attrs.overflow ??= 'hidden';
            attrs.bgColor ??= '#fff';
            attrs.roundedCorners ??= 3;
            attrs.boxShadow ??= [0, 0, 8, '#00000088'];
            
            attrs.initialKeepDuration ??= 5000;
            attrs.keepDuration ??= 1000;
            
            attrs.showDuration ??= 300;
            attrs.hideDuration ??= 300;
            this.quickSet(['showDuration','hideDuration'], attrs);
            
            attrs.opacity = 0;
            attrs.visible = false;
            
            this.callSuper(parent, attrs);
        },
        
        
        // Accessors ///////////////////////////////////////////////////////////
        setVisible: function(v) {
            const self = this;
            if (self.inited) {
                self.stopActiveAnimators('opacity');
                if (v) {
                    self.animate({attribute:'opacity', to:1, duration:self.showDuration});
                    self.callSuper(v);
                } else {
                    self.animate({attribute:'opacity', to:0, duration:self.hideDuration}).next(success => {
                        self.parent.removeGrowl(self, true);
                    });
                }
            } else {
                self.callSuper(v);
            }
        }
    });
    
    pkg.SimpleGrowl = new JSClass('SimpleGrowl', View, {
        include:[pkg.GrowlMixin],
        
        
        // Life Cycle //////////////////////////////////////////////////////////
        initNode: function(parent, attrs) {
            const self = this,
                params = {};
            
            attrs.spacing ??= 6;
            attrs.padding ??= 12;
            attrs.whiteSpace ??= 'normal';
            attrs.iconSize ??= '24px';
            attrs.showCloseButton ??= false;
            if (attrs.showCloseButton) {
                attrs.closeIcon ??= FA_TIMES;
                attrs.closeOnly ??= false;
                
            }
            
            for (const name of ['icon','iconSize','text','padding','spacing','whiteSpace','showCloseButton','closeIcon','closeOnly']) {
                params[name] = attrs[name];
                delete attrs[name];
            }
            
            if (params.closeOnly) {
                attrs.initialKeepDuration = attrs.keepDuration = -1;
            }
            
            self.callSuper(parent, attrs);
            
            const {padding} = params;
            
            if (params.icon) new Text(self, {y:padding, text:params.icon, fontSize:params.iconSize});
            new Text(self, {y:padding, text:params.text, whiteSpace:params.whiteSpace, layoutHint:1});
            if (params.showCloseButton) self.makeCloseButton(params);
            
            new pkg.ResizeLayout(self, {inset:padding, spacing:params.spacing, outset:padding});
            new pkg.SizeToChildren(self, {axis:'y', paddingY:padding});
        },
        
        makeCloseButton: function(params) {
            const self = this;
            new pkg.TextButton(self, {
                y:params.padding, text:params.closeIcon, width:24, height:24,
                paddingTop:4,
                activeColor:'#ccc',
                hoverColor:'#ddd',
                readyColor :'#eee'
            }, [pkg.KeepShowingChildMixin, {
                doActivated: () => {
                    self.parent.removeGrowl(self, true);
                }
            }]);
        }
    });
})(myt);

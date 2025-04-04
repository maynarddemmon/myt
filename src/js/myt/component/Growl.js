(pkg => {
    const {Class:JSClass, Module:JSModule} = JS,
        
        {
            View, Text,
            FontAwesome:{makeTag}
        } = pkg,
        
        FA_TIMES = makeTag(['times']);
    
    pkg.GrowlManager = new JSClass('GrowlManager', View, {
        include:[pkg.SizeToWindowHeight],
        
        
        // Life Cycle //////////////////////////////////////////////////////////
        initNode: function(parent, attrs) {
            const self = this;
            
            self.growlCount = 0;
            
            attrs.overflow ??= 'visible autoy';
            attrs.margin ??= 8;
            attrs.spacing ??= 4;
            attrs.reverse ??= true;
            attrs.width ??= 300;
            attrs.visible ??= false;
            attrs.pointerEvents ??= 'none';
            
            attrs.moveDuration ??= 300;
            attrs.dedupe ??= true;
            attrs.clearAllThreshold ??= 0;
            
            attrs.simpleGrowlClass ??= pkg.SimpleGrowl;
            
            self.quickSet(['moveDuration','dedupe'], attrs);
            
            self.callSuper(parent, attrs);
            
            self.doAlignment();
            
            const moveDuration = self.moveDuration;
            new pkg.SpacedLayout(self, {
                axis:'y', reverse:self.reverse, spacing:self.spacing
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
        setHeight: function(v) {
            this.callSuper(v - 2*this.margin);
        },
        
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
            const self = this;
            if (self.dedupe) {
                const hash = growl.getHash(),
                    svs = self.getSubviews();
                let i = svs.length;
                while (i) {
                    const sv = svs[--i];
                    if (sv !== growl && sv.getHash?.() === hash) {
                        self.removeGrowl(sv);
                        break;
                    }
                }
            }
            
            this.growlCount++;
            growl.setVisible(true);
            this.updateClearAll();
        },
        
        removeGrowl: function(growl) {
            growl.destroy();
            this.growlCount--;
            this.updateClearAll();
        },
        
        updateClearAll: function() {
            const self = this,
                clearAllThreshold = self.clearAllThreshold;
            if (clearAllThreshold > 0 && self.growlCount >= clearAllThreshold) {
                self._clearAllBtn ??= self.makeClearAll();
                self._clearAllBtn.setVisible(true);
            } else {
                self._clearAllBtn?.setVisible(false);
            }
        },
        
        makeClearAll: function() {
            const self = this;
            return new pkg.TextButton(self, {
                width:self.width, height:28, text:FA_TIMES + ' Dismiss All', fontWeight:'bold',
                paddingTop:5, zIndex:1,
                visible:false, ignoreLayout:true, pointerEvents:'auto'
            }, [{
                setVisible: function(v) {
                    this.callSuper(v);
                    self.getFirstLayout().setInset(this.visible ? this.height + self.spacing : 0);
                },
                doActivated: function() {
                    const layout = self.getFirstLayout();
                    layout.incrementLockedCounter();
                    self.growlCount = 0;
                    delete self._clearAllBtn;
                    layout.setInset(0);
                    self.destroyAllSubviews();
                    layout.decrementLockedCounter();
                }
            }]);
        },
        
        // Convience Methods
        addSimpleGrowl: function(msg, attrs) {
            this.addGrowl(new this.simpleGrowlClass(this, {text:msg, ...(attrs ?? {})}));
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
        keepShowing: function(v, duration) {
            const self = this;
            
            duration ??= self.keepDuration;
            
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
            this.keepShowing(true);
            this.callSuper(event);
        },
        
        /** @overrides myt.MouseOver */
        doMouseOut: function(event) {
            this.keepShowing(false);
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
                        self.parent.removeGrowl(self);
                    });
                }
            } else {
                self.callSuper(v);
            }
        },
        
        getHash: function() {
            return this.hash ??= pkg.hash(this.getHashableString());
        },
        
        /** Subclasses that support deduping should implement this. This implementation more or
            less guarantees that every Growl will be unique. */
        getHashableString: () => '' + pkg.generateGuid()
    });
    
    const FA_CLIPBOARD = makeTag(['clipboard-check']),
        
        SIMPLE_GROWL_PARAM_NAMES = [
            'maxHeight','icon','iconSize','text','padding','spacing','whiteSpace',
            'showCloseButton','closeIcon','closeOnly',
            'showCopyButton','copyIcon',
            'activeColor','hoverColor','readyColor'
        ],
        
        LocalTxtBtn = new JSClass('LocalTxtBtn', pkg.TextButton, {
            include:[pkg.KeepShowingChildMixin],
            
            initNode: function(parent, attrs) {
                attrs.width ??= 24;
                attrs.height ??= 24;
                attrs.paddingTop ??= 4;
                attrs.activeColor ??= '#ccc';
                attrs.hoverColor ??= '#ddd';
                attrs.readyColor ??= '#eee';
                
                this.callSuper(parent, attrs);
            }
        });
    
    pkg.SimpleGrowl = new JSClass('SimpleGrowl', View, {
        include:[pkg.GrowlMixin],
        
        
        // Life Cycle //////////////////////////////////////////////////////////
        initNode: function(parent, attrs) {
            const self = this,
                params = {};
            
            attrs.maxHeight ??= 100;
            
            attrs.spacing ??= 6;
            attrs.padding ??= 12;
            attrs.whiteSpace ??= 'normal';
            attrs.iconSize ??= '24px';
            attrs.showCloseButton ??= false;
            if (attrs.showCloseButton) {
                attrs.closeIcon ??= FA_TIMES;
                attrs.closeOnly ??= false;
            }
            attrs.showCopyButton ??= false;
            if (attrs.showCopyButton) {
                attrs.copyIcon ??= FA_CLIPBOARD;
            }
            
            for (const name of SIMPLE_GROWL_PARAM_NAMES) {
                params[name] = attrs[name];
                delete attrs[name];
            }
            
            if (params.closeOnly) {
                attrs.initialKeepDuration = attrs.keepDuration = -1;
            }
            
            self.callSuper(parent, attrs);
            
            const {maxHeight, padding, icon} = params;
            
            if (icon) self.iconTxt = new Text(self, {y:padding, text:icon, fontSize:params.iconSize});
            const msgTxt = self.msgTxt = new Text(self, {y:padding, text:params.text, whiteSpace:params.whiteSpace, layoutHint:1});
            if (maxHeight > 0) {
                msgTxt.setOverflow('auto');
                msgTxt.getIDS().maxHeight = maxHeight + 'px';
            }
            if (params.showCopyButton) {
                self.copyBtn = self.makeCopyButton(params);
                msgTxt.setUserUnselectable(false);
            }
            if (params.showCloseButton) self.closeBtn = self.makeCloseButton(params);
            
            new pkg.ResizeLayout(self, {inset:padding, spacing:params.spacing, outset:padding});
            new pkg.SizeToChildren(self, {axis:'y', paddingY:padding});
        },
        
        
        // Methods /////////////////////////////////////////////////////////////
        makeCloseButton: function(params) {
            const self = this;
            new LocalTxtBtn(self, {
                y:params.padding, text:params.closeIcon, tooltip:'Dismiss this notification.',
                activeColor:params.activeColor, hoverColor:params.hoverColor, readyColor:params.readyColor
            }, [{
                doActivated: () => {
                    self.parent.removeGrowl(self);
                }
            }]);
        },
        makeCopyButton: function(params) {
            const self = this;
            new LocalTxtBtn(self, {
                y:params.padding, text:params.copyIcon, tooltip:'Copy to system clipboard.',
                activeColor:params.activeColor, hoverColor:params.hoverColor, readyColor:params.readyColor
            }, [{
                doActivated: () => {
                    if (global.isSecureContext) {
                        navigator.clipboard.writeText(pkg.removeMarkup(self.msgTxt.text, {brToLineFeed:true}));
                    } else {
                        console.warn('access to clipboard blocked because of insecure context.');
                    }
                }
            }]);
        },
        
        /** @overrides */
        getHashableString: function() {
            return this.iconTxt?.text + ' | ' + this.msgTxt.text;
        }
    });
})(myt);

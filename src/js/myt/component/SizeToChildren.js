(pkg => {
    const updateMonitoringSubview = (stc, sv, func) => {
            const axis = stc.axis;
            func = func.bind(stc);
            if (axis !== 'y') {
                func(sv, 'update', 'x');
                func(sv, 'update', 'boundsWidth');
            }
            if (axis !== 'x') {
                func(sv, 'update', 'y');
                func(sv, 'update', 'boundsHeight');
            }
            func(sv, 'update', 'visible');
        };
    
    /** A special "layout" that resizes the parent to fit the children rather than laying out 
        the children.
        
        Events:
            axis:string
            paddingX:number
            paddingY:number
        
        Attributes:
            axis:string The axis along which to resize this view to fit its children. Supported 
                values are 'x', 'y' and 'both'. Defaults to 'x'.
            paddingX:number Additional space added on the child extent along the x-axis. 
                Defaults to 0.
            paddingY:number Additional space added on the child extent along the y-axis. 
                Defaults to 0.
        
        @class */
    pkg.SizeToChildren = new JS.Class('SizeToChildren', pkg.Layout, {
        // Life Cycle //////////////////////////////////////////////////////////
        /** @overrides myt.Node */
        initNode: function(parent, attrs) {
            this.axis = 'x';
            this.paddingX = this.paddingY = 0;
            
            this.callSuper(parent, attrs);
        },
        
        
        // Acessors ////////////////////////////////////////////////////////////
        setAxis: function(v) {
            if (this.axis !== v) {
                if (this.inited) {
                    this.stopMonitoringAllSubviews();
                    this.axis = v;
                    this.startMonitoringAllSubviews();
                    this.fireEvent('axis', v);
                    this.update();
                } else {
                    this.axis = v;
                }
            }
        },
        
        setPaddingX: function(v) {
            if (this.paddingX !== v) {
                this.paddingX = v;
                if (this.inited) {
                    this.fireEvent('paddingX', v);
                    this.update();
                }
            }
        },
        
        setPaddingY: function(v) {
            if (this.paddingY !== v) {
                this.paddingY = v;
                if (this.inited) {
                    this.fireEvent('paddingY', v);
                    this.update();
                }
            }
        },
        
        
        // Methods /////////////////////////////////////////////////////////////
        /** @overrides myt.ConstantLayout */
        update: function() {
            if (this.canUpdate()) {
                // Prevent inadvertent loops
                this.incrementLockedCounter();
                
                if (!this.parent.isBeingDestroyed) {
                    const svs = this.subviews, 
                        len = svs.length,
                        axis = this.axis;
                    let i,
                        max;
                    if (axis !== 'y') {
                        i = len;
                        max = 0;
                        while (i) {
                            const sv = svs[--i];
                            if (sv.visible) max = Math.max(max, sv.x + (sv.boundsWidth > 0 ? sv.boundsWidth : 0));
                        }
                        this.updateSize(max + this.paddingX, true);
                    }
                    if (axis !== 'x') {
                        i = len;
                        max = 0;
                        while (i) {
                            const sv = svs[--i];
                            if (sv.visible) max = Math.max(max, sv.y + (sv.boundsHeight > 0 ? sv.boundsHeight : 0));
                        }
                        this.updateSize(max + this.paddingY, false);
                    }
                }
                
                this.decrementLockedCounter();
            }
        },
        
        updateSize: function(v, isWidth) {
            this.parent[isWidth ? 'setWidth' : 'setHeight'](v);
        },
        
        /** @overrides myt.Layout
            Provides a default implementation that calls update when the visibility of a 
            subview changes. */
        startMonitoringSubview: function(sv) {
            updateMonitoringSubview(this, sv, this.attachTo);
        },
        
        /** @overrides myt.Layout
            Provides a default implementation that calls update when the visibility of a 
            subview changes. */
        stopMonitoringSubview: function(sv) {
            updateMonitoringSubview(this, sv, this.detachFrom);
        }
    });
})(myt);

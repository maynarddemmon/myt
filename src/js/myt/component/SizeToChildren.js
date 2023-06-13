(pkg => {
    const updateMonitoringSubview = (stc, sv, func, targetFuncName) => {
            func = func.bind(stc);
            if (stc.axis !== 'y') {
                func(sv, targetFuncName, 'x');
                func(sv, targetFuncName, 'boundsWidth');
            }
            if (stc.axis !== 'x') {
                func(sv, targetFuncName, 'y');
                func(sv, targetFuncName, 'boundsHeight');
            }
            func(sv, targetFuncName, 'visible');
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
                
                const parent = this.parent;
                if (!parent.isBeingDestroyed) {
                    const svs = this.subviews, 
                        len = svs.length,
                        axis = this.axis,
                        mathMax = Math.max;
                    let i,
                        max;
                    if (axis !== 'y') {
                        i = len;
                        max = 0;
                        while (i) {
                            const sv = svs[--i];
                            if (sv.visible) max = mathMax(max, sv.x + (sv.boundsWidth > 0 ? sv.boundsWidth : 0));
                        }
                        parent.setWidth(max + this.paddingX);
                    }
                    if (axis !== 'x') {
                        i = len;
                        max = 0;
                        while (i) {
                            const sv = svs[--i];
                            if (sv.visible) max = mathMax(max, sv.y + (sv.boundsHeight > 0 ? sv.boundsHeight : 0));
                        }
                        parent.setHeight(max + this.paddingY);
                    }
                }
                
                this.decrementLockedCounter();
            }
        },
        
        /** @overrides myt.Layout
            Provides a default implementation that calls update when the visibility or extent of a 
            subview changes. */
        startMonitoringSubview: function(sv) {
            updateMonitoringSubview(this, sv, this.attachTo, 'update');
        },
        
        /** @overrides myt.Layout
            Provides a default implementation that calls update when the visibility or extent of a 
            subview changes. */
        stopMonitoringSubview: function(sv) {
            updateMonitoringSubview(this, sv, this.detachFrom, 'update');
        }
    });
})(myt);

/** A special "layout" that resizes the parent to fit the children rather than
    laying out the children.
    
    Events:
        axis:string
        paddingX:number
        paddingY:number
    
    Attributes:
        axis:string The axis along which to resize this view to fit its
            children. Supported values are 'x', 'y' and 'both'. Defaults to 'x'.
        paddingX:number Additional space added on the child extent along the
            x-axis. Defaults to 0.
        paddingY:number Additional space added on the child extent along the
            y-axis. Defaults to 0.
*/
myt.SizeToChildren = new JS.Class('SizeToChildren', myt.Layout, {
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides myt.Node */
    initNode: function(parent, attrs) {
        this.axis = 'x';
        this.paddingX = this.paddingY = 0;
        
        this.callSuper(parent, attrs);
    },
    
    
    // Acessors ////////////////////////////////////////////////////////////////
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
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** @overrides myt.ConstantLayout */
    update: function() {
        if (this.canUpdate()) {
            // Prevent inadvertent loops
            this.incrementLockedCounter();
            
            var p = this.parent;
            
            if (!p.isBeingDestroyed) {
                var svs = this.subviews, len = svs.length, i, sv,
                    max, bound,
                    axis = this.axis,
                    maxFunc = Math.max;
                if (axis !== 'y') {
                    i = len;
                    max = 0;
                    while(i) {
                        sv = svs[--i];
                        if (sv.visible) {
                            bound = sv.boundsWidth;
                            bound = bound > 0 ? bound : 0;
                            max = maxFunc(max, sv.x + bound);
                        }
                    }
                    p.setWidth(max + this.paddingX);
                }
                if (axis !== 'x') {
                    i = len;
                    max = 0;
                    while(i) {
                        sv = svs[--i];
                        if (sv.visible) {
                            bound = sv.boundsHeight;
                            bound = bound > 0 ? bound : 0;
                            max = maxFunc(max, sv.y + bound);
                        }
                    }
                    p.setHeight(max + this.paddingY);
                }
            }
            
            this.decrementLockedCounter();
        }
    },
    
    /** @overrides myt.Layout
        Provides a default implementation that calls update when the
        visibility of a subview changes. */
    startMonitoringSubview: function(sv) {
        this.__updateMonitoringSubview(sv, this.attachTo);
    },
    
    /** @overrides myt.Layout
        Provides a default implementation that calls update when the
        visibility of a subview changes. */
    stopMonitoringSubview: function(sv) {
        this.__updateMonitoringSubview(sv, this.detachFrom);
    },
    
    /** Wrapped by startMonitoringSubview and stopMonitoringSubview.
        @private
        @param {!Object} sv
        @param {!Function} func
        @returns {undefined} */
    __updateMonitoringSubview: function(sv, func) {
        var axis = this.axis;
        func = func.bind(this);
        if (axis !== 'y') {
            func(sv, 'update', 'x');
            func(sv, 'update', 'boundsWidth');
        }
        if (axis !== 'x') {
            func(sv, 'update', 'y');
            func(sv, 'update', 'boundsHeight');
        }
        func(sv, 'update', 'visible');
    }
});

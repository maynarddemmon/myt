/** A special "layout" that resizes the parent to fit the children rather than
    laying out the children. */
myt.SizeToChildren = new JS.Class('SizeToChildren', myt.Layout, {
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides myt.Node */
    initNode: function(parent, attrs) {
        if (attrs.axis === undefined) attrs.axis = 'x';
        if (attrs.paddingX === undefined) attrs.paddingX = 0;
        if (attrs.paddingY === undefined) attrs.paddingY = 0;
        
        this.callSuper(parent, attrs);
    },
    
    
    // Acessors ////////////////////////////////////////////////////////////////
    setAxis: function(v) {
        if (this.axis === v) return;
        
        if (this.inited) {
            this.stopMonitoringAllSubviews();
            this.axis = v;
            this.startMonitoringAllSubviews();
            this.fireNewEvent('axis', v);
            this.update();
        } else {
            this.axis = v;
        }
    },
    
    setPaddingX: function(v) {
        if (this.paddingX === v) return;
        this.paddingX = v;
        if (this.inited) {
            this.fireNewEvent('paddingX', v);
            this.update();
        }
    },
    
    setPaddingY: function(v) {
        if (this.paddingY === v) return;
        this.paddingY = v;
        if (this.inited) {
            this.fireNewEvent('paddingY', v);
            this.update();
        }
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** @overrides myt.ConstantLayout */
    update: function() {
        if (!this.canUpdate()) return;
        
        // Prevent inadvertent loops
        this.incrementLockedCounter();
        
        var svs = this.subviews, i = svs.length, sv,
            xMax, yMax,
            p = this.parent,
            axis = this.axis,
            maxFunc = Math.max,
            bw, bh;
        
        if (axis === 'x') {
            xMax = 0;
            while(i) {
                sv = svs[--i];
                bw = sv.boundsWidth;
                bw = bw > 0 ? bw : 0;
                if (sv.visible) xMax = maxFunc(xMax, sv.x + bw);
            }
            p.setWidth(xMax + this.paddingX);
        } else if (axis === 'y') {
            yMax = 0;
            while(i) {
                sv = svs[--i];
                bh = sv.boundsHeight;
                bh = bh > 0 ? bh : 0;
                if (sv.visible) yMax = maxFunc(yMax, sv.y + bh);
            }
            p.setHeight(yMax + this.paddingY);
        } else {
            xMax = yMax = 0;
            while(i) {
                sv = svs[--i];
                if (sv.visible) {
                    bw = sv.boundsWidth;
                    bw = bw > 0 ? bw : 0;
                    xMax = maxFunc(xMax, sv.x + bw);
                    bh = sv.boundsHeight;
                    bh = bh > 0 ? bh : 0;
                    yMax = maxFunc(yMax, sv.y + bh);
                }
            }
            p.setWidth(xMax + this.paddingX);
            p.setHeight(yMax + this.paddingY);
        }
        
        this.decrementLockedCounter();
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
        @private */
    __updateMonitoringSubview: function(sv, func) {
        var axis = this.axis, func = func.bind(this);
        if (axis === 'x') {
            func(sv, 'update', 'x');
            func(sv, 'update', 'boundsWidth');
        } else if (axis === 'y') {
            func(sv, 'update', 'y');
            func(sv, 'update', 'boundsHeight');
        } else {
            func(sv, 'update', 'x');
            func(sv, 'update', 'boundsWidth');
            func(sv, 'update', 'y');
            func(sv, 'update', 'boundsHeight');
        }
        func(sv, 'update', 'visible');
    }
});

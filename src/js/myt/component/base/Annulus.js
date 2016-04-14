/** An annulus component. */
myt.Annulus = new JS.Class('Annulus', myt.View, {
    // Life Cycle //////////////////////////////////////////////////////////////
    initNode: function(parent, attrs) {
        this.radius = this.thickness = this.startAngle = this.endAngle = 0;
        
        this.callSuper(parent, attrs);
        
        this._updateSize();
    },
    
    /** @overrides myt.View */
    createOurDomElement: function(parent) {
        var e = this.callSuper(parent),
            namespace = "http://www.w3.org/2000/svg",
            svg = this.__svg = document.createElementNS(namespace, 'svg'),
            path = this.__path = document.createElementNS(namespace, 'path');
        svg.appendChild(path);
        e.appendChild(svg);
        return e;
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setRadius: function(v) {
        if (this.radius !== v) {
            this.radius = v = Math.max(0, v);
            if (this.inited) {
                this._updateSize();
                this.fireNewEvent('radius', v);
            }
        }
    },
    
    setThickness: function(v) {
        if (this.thickness !== v) {
            this.thickness = v = Math.max(0, v);
            if (this.inited) {
                this._updateSize();
                this.fireNewEvent('thickness', v);
            }
        }
    },
    
    setStartAngle: function(v) {
        if (this.startAngle !== v) {
            this.startAngle = v;
            if (this.inited) {
                this._redraw();
                this.fireNewEvent('startAngle', v);
            }
        }
    },
    
    setEndAngle: function(v) {
        if (this.endAngle !== v) {
            this.endAngle = v;
            if (this.inited) {
                this._redraw();
                this.fireNewEvent('endAngle', v);
            }
        }
    },
    
    setColor: function(v) {
        if (this.color !== v) {
            this.color = v;
            if (this.inited) {
                this._redraw();
                this.fireNewEvent('color', v);
            }
        }
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** Prevent views from being sent behind the __svg. This allows us to
        add child views to an Annulus which is not directly supported in HTML.
        @overrides myt.View */
    sendSubviewToBack: function(sv) {
        if (sv.parent === this) {
            var de = this.domElement,
                firstChild = de.childNodes[1];
            if (sv.domElement !== firstChild) {
                var removedElem = de.removeChild(sv.domElement);
                if (removedElem) de.insertBefore(removedElem, firstChild);
            }
        }
    },
    
    /** @private */
    _updateSize: function() {
        var size = 2*(this.radius + this.thickness);
        this.setWidth(size);
        this.setHeight(size);
        
        var svg = this.__svg;
        svg.setAttribute('viewBox', '0 0 ' + size + ' ' + size);
        svg.setAttribute('width', size);
        svg.setAttribute('height', size);
        
        this._redraw();
    },
    
    /** @private */
    _redraw: function() {
        var startAngle = myt.Geometry.degreesToRadians(this.startAngle),
            endAngle = myt.Geometry.degreesToRadians(this.endAngle),
            r1 = this.radius,
            r2 = r1 + this.thickness,
            c = this.width / 2;
        
        if (startAngle > endAngle) {
            var tmp = startAngle;
            startAngle = endAngle;
            endAngle = tmp;
        }
        
        var angleDiff = endAngle - startAngle,
            isFull = angleDiff >= 2 * Math.PI;
        
        if (isFull) {
            startAngle = 0;
            endAngle = Math.PI;
        }
        
        var points = [
                [c + r2 * Math.cos(startAngle), c + r2 * Math.sin(startAngle)],
                [c + r2 * Math.cos(endAngle),   c + r2 * Math.sin(endAngle)],
                [c + r1 * Math.cos(endAngle),   c + r1 * Math.sin(endAngle)],
                [c + r1 * Math.cos(startAngle), c + r1 * Math.sin(startAngle)]
            ],
            commands = [];
        
        commands.push("M" + points[0].join());
        if (isFull) {
            commands.push("A" + [r2, r2, 0, 1, 1, points[1]].join());
            commands.push("A" + [r2, r2, 0, 1, 1, points[0]].join());
            commands.push("L" + points[2].join());
            commands.push("A" + [r1, r1, 0, 1, 0, points[3]].join());
            commands.push("A" + [r1, r1, 0, 1, 0, points[2]].join());
        } else {
            var largeArc = (angleDiff % (2 * Math.PI)) > Math.PI ? 1 : 0;
            commands.push("A" + [r2, r2, 0, largeArc, 1, points[1]].join());
            commands.push("L" + points[2].join());
            commands.push("A" + [r1, r1, 0, largeArc, 0, points[3]].join());
        }
        commands.push("z");
        
        var path = this.__path;
        path.setAttribute('d', commands.join(' '));
        path.setAttribute('fill', this.color);
    }
});


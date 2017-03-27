/** An annulus component. */
myt.Annulus = new JS.Class('Annulus', myt.View, {
    // Class Methods and Attributes ////////////////////////////////////////////
    extend: {
        /** Draws an annulus using the provided path.
            @param path:svg path object
            @param startAngle:number The start angle in radians.
            @param endAngle:number The end angle in radians.
            @param thickness:number The difference between the inner and outer
                radius.
            @param r1:number The inner radius.
            @param c:number The center of the annulus
            @param color:hex string The color to fill with.
            @param startCapRounding:boolean If true the starting cap will
                be drawn as a semicircle.
            @param endCapRounding:boolean If true the ending cap will be
                drawn as a semicircle.
            @returns void */
        draw: function(path, startAngle, endAngle, thickness, r1, c, color, startCapRounding, endCapRounding) {
            // Ensure endAngle is greater than or equal to startAngle
            if (startAngle > endAngle) {
                var tmp = startAngle;
                startAngle = endAngle;
                endAngle = tmp;
            }
            
            var r2 = r1 + thickness,
                PI = Math.PI,
                angleDiff = endAngle - startAngle,
                isFull = angleDiff + 0.0001 >= 2 * PI; // 0.0001 is to handle floating point errors
            
            // Will use two arcs for a full circle
            if (isFull) {
                startAngle = 0;
                endAngle = PI;
            }
            
            var COS = Math.cos,
                SIN = Math.sin,
                points = [
                    [c + r2 * COS(startAngle), c + r2 * SIN(startAngle)],
                    [c + r2 * COS(endAngle),   c + r2 * SIN(endAngle)],
                    [c + r1 * COS(endAngle),   c + r1 * SIN(endAngle)],
                    [c + r1 * COS(startAngle), c + r1 * SIN(startAngle)]
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
                var largeArc = (angleDiff % (2 * PI)) > PI ? 1 : 0;
                commands.push("A" + [r2, r2, 0, largeArc, 1, points[1]].join());
                if (endCapRounding) {
                    commands.push("A" + [thickness / 2, thickness / 2, 0, 0, 1, points[2]].join());
                } else {
                    commands.push("L" + points[2].join());
                }
                commands.push("A" + [r1, r1, 0, largeArc, 0, points[3]].join());
                if (startCapRounding) commands.push("A" + [thickness / 2, thickness / 2, 0, 0, 1, points[0]].join());
            }
            commands.push("z");
            
            path.setAttribute('d', commands.join(' '));
            path.setAttribute('fill', color);
        },
        
        makeSVG: function(elementName, parentElem) {
            var svgElem = document.createElementNS("http://www.w3.org/2000/svg", elementName);
            if (parentElem) parentElem.appendChild(svgElem);
            return svgElem;
        }
    },
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    initNode: function(parent, attrs) {
        var self = this;
        
        self.radius = self.thickness = self.startAngle = self.endAngle = 0;
        self.startCapRounding = self.endCapRounding = false;
        
        self.callSuper(parent, attrs);
        
        self._updateSize();
    },
    
    /** @overrides myt.View */
    createOurDomElement: function(parent) {
        var e = this.callSuper(parent),
            MSVG = myt.Annulus.makeSVG,
            svg = this.__svg = MSVG('svg', e);
        this.__path = MSVG('path', svg);
        
        // Let the view handle mouse events
        svg.style.pointerEvents = 'none';
        
        return e;
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setRadius: function(v) {
        if (this.radius !== v) {
            this.radius = v = Math.max(0, v);
            if (this.inited) {
                this._updateSize();
                this.fireEvent('radius', v);
            }
        }
    },
    
    setThickness: function(v) {
        if (this.thickness !== v) {
            this.thickness = v = Math.max(0, v);
            if (this.inited) {
                this._updateSize();
                this.fireEvent('thickness', v);
            }
        }
    },
    
    setStartAngle: function(v) {
        if (this.startAngle !== v) {
            this.startAngle = v;
            if (this.inited) {
                this._redraw();
                this.fireEvent('startAngle', v);
            }
        }
    },
    
    setEndAngle: function(v) {
        if (this.endAngle !== v) {
            this.endAngle = v;
            if (this.inited) {
                this._redraw();
                this.fireEvent('endAngle', v);
            }
        }
    },
    
    setStartCapRounding: function(v) {
        if (this.startCapRounding !== v) {
            this.startCapRounding = v;
            if (this.inited) {
                this._redraw();
                this.fireEvent('startCapRounding', v);
            }
        }
    },
    
    setEndCapRounding: function(v) {
        if (this.endCapRounding !== v) {
            this.endCapRounding = v;
            if (this.inited) {
                this._redraw();
                this.fireEvent('endCapRounding', v);
            }
        }
    },
    
    setColor: function(v) {
        if (this.color !== v) {
            this.color = v;
            if (this.inited) {
                this._redraw();
                this.fireEvent('color', v);
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
    
    /** @overrides myt.View */
    isColorAttr: function(attrName) {
        return attrName === 'color' || this.callSuper(attrName);
    },
    
    /** Ensures the size of the view exactly fits the annulus.
        @private */
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
        var self = this,
            DTR = myt.Geometry.degreesToRadians;
        myt.Annulus.draw(
            self.__path, 
            DTR(self.startAngle), 
            DTR(self.endAngle), 
            self.thickness, 
            self.radius, 
            self.width / 2, 
            self.color, 
            self.startCapRounding, 
            self.endCapRounding
        );
    }
});


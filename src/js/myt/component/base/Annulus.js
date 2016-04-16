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
                isFull = angleDiff >= 2 * PI;
            
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
        this.radius = this.thickness = this.startAngle = this.endAngle = 0;
        this.startCapRounding = this.endCapRounding = false;
        
        this.callSuper(parent, attrs);
        
        this._updateSize();
    },
    
    /** @overrides myt.View */
    createOurDomElement: function(parent) {
        var e = this.callSuper(parent),
            MSVG = myt.Annulus.makeSVG;
        this.__path = MSVG('path', this.__svg = MSVG('svg', e));
        
        // Let the view handle mouse events
        this.__svg.style.pointerEvents = 'none';
        
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
    
    setStartCapRounding: function(v) {
        if (this.startCapRounding !== v) {
            this.startCapRounding = v;
            if (this.inited) {
                this._redraw();
                this.fireNewEvent('startCapRounding', v);
            }
        }
    },
    
    setEndCapRounding: function(v) {
        if (this.endCapRounding !== v) {
            this.endCapRounding = v;
            if (this.inited) {
                this._redraw();
                this.fireNewEvent('endCapRounding', v);
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
        var DTR = myt.Geometry.degreesToRadians;
        myt.Annulus.draw(
            this.__path, 
            DTR(this.startAngle), 
            DTR(this.endAngle), 
            this.thickness, 
            this.radius, 
            this.width / 2, 
            this.color, 
            this.startCapRounding, 
            this.endCapRounding
        );
    }
});


((pkg) => {
    const degreesToRadians = pkg.Geometry.degreesToRadians,
        
        /*  Redraws the annulus
            @param {!Object} annulus - The Annulus to redraw.
            @returns {undefined} */
        redraw = (annulus) => {
            pkg.Annulus.draw(
                annulus.__path, 
                degreesToRadians(annulus.startAngle), 
                degreesToRadians(annulus.endAngle), 
                annulus.thickness, 
                annulus.radius, 
                annulus.width / 2, 
                annulus.color, 
                annulus.startCapRounding, 
                annulus.endCapRounding
            );
        },
        
        /*  Ensures the size of the view exactly fits the annulus.
            @param {!Object} annulus - The Annulus to update.
            @returns {undefined} */
        updateSize = (annulus) => {
            const size = 2*(annulus.radius + annulus.thickness),
                svg = annulus.__svg;
            annulus.setWidth(size);
            annulus.setHeight(size);
            
            svg.setAttribute('viewBox', '0 0 ' + size + ' ' + size);
            svg.setAttribute('width', size);
            svg.setAttribute('height', size);
            
            redraw(annulus);
        };
     
    /** An annulus component.
        
        @class */
    pkg.Annulus = new JS.Class('Annulus', pkg.View, {
        // Class Methods and Attributes ////////////////////////////////////////
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
                @returns {undefined} */
            draw: (path, startAngle, endAngle, thickness, r1, c, color, startCapRounding, endCapRounding) => {
                // Ensure endAngle is greater than or equal to startAngle
                if (startAngle > endAngle) {
                    const tmp = startAngle;
                    startAngle = endAngle;
                    endAngle = tmp;
                }
                
                const r2 = r1 + thickness,
                    PI = Math.PI,
                    angleDiff = endAngle - startAngle,
                    isFull = angleDiff + 0.0001 >= 2 * PI; // 0.0001 is to handle floating point errors
                
                // Will use two arcs for a full circle
                if (isFull) {
                    startAngle = 0;
                    endAngle = PI;
                }
                
                const COS = Math.cos,
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
                    const largeArc = (angleDiff % (2 * PI)) > PI ? 1 : 0;
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
            
            makeSVG: (elementName, parentElem) => {
                const svgElem = document.createElementNS("http://www.w3.org/2000/svg", elementName);
                if (parentElem) parentElem.appendChild(svgElem);
                return svgElem;
            }
        },
        
        
        // Life Cycle //////////////////////////////////////////////////////////
        initNode: function(parent, attrs) {
            const self = this;
            
            self.radius = self.thickness = self.startAngle = self.endAngle = 0;
            self.startCapRounding = self.endCapRounding = false;
            
            self.callSuper(parent, attrs);
            
            updateSize(self);
        },
        
        /** @overrides myt.View */
        createOurDomElement: function(parent) {
            const elements = this.callSuper(parent),
                MSVG = pkg.Annulus.makeSVG;
            let svg,
                innerElem;
            if (Array.isArray(elements)) {
                innerElem = elements[1];
            } else {
                innerElem = elements;
            }
            
            svg = this.__svg = MSVG('svg', innerElem);
            this.__path = MSVG('path', svg);
            
            // Let the view handle mouse events
            svg.style.pointerEvents = 'none';
            
            return elements;
        },
        
        
        // Accessors ///////////////////////////////////////////////////////////
        setRadius: function(v) {
            if (this.radius !== v) {
                this.radius = v = Math.max(0, v);
                if (this.inited) {
                    updateSize(this);
                    this.fireEvent('radius', v);
                }
            }
        },
        
        setThickness: function(v) {
            if (this.thickness !== v) {
                this.thickness = v = Math.max(0, v);
                if (this.inited) {
                    updateSize(this);
                    this.fireEvent('thickness', v);
                }
            }
        },
        
        setStartAngle: function(v) {
            if (this.startAngle !== v) {
                this.startAngle = v;
                if (this.inited) {
                    redraw(this);
                    this.fireEvent('startAngle', v);
                }
            }
        },
        
        setEndAngle: function(v) {
            if (this.endAngle !== v) {
                this.endAngle = v;
                if (this.inited) {
                    redraw(this);
                    this.fireEvent('endAngle', v);
                }
            }
        },
        
        setStartCapRounding: function(v) {
            if (this.startCapRounding !== v) {
                this.startCapRounding = v;
                if (this.inited) {
                    redraw(this);
                    this.fireEvent('startCapRounding', v);
                }
            }
        },
        
        setEndCapRounding: function(v) {
            if (this.endCapRounding !== v) {
                this.endCapRounding = v;
                if (this.inited) {
                    redraw(this);
                    this.fireEvent('endCapRounding', v);
                }
            }
        },
        
        setColor: function(v) {
            if (this.color !== v) {
                this.color = v;
                if (this.inited) {
                    redraw(this);
                    this.fireEvent('color', v);
                }
            }
        },
        
        
        // Methods /////////////////////////////////////////////////////////////
        /** Prevent views from being sent behind the __svg. This allows us to
            add child views to an Annulus which is not directly supported in HTML.
            @overrides */
        sendSubviewToBack: function(sv) {
            if (sv.parent === this) {
                const de = this.getInnerDomElement(),
                    firstChild = de.childNodes[1];
                if (sv.getOuterDomElement() !== firstChild) {
                    const removedElem = de.removeChild(sv.getOuterDomElement());
                    if (removedElem) de.insertBefore(removedElem, firstChild);
                }
            }
        },
        
        /** @overrides myt.View */
        isColorAttr: function(attrName) {
            return attrName === 'color' || this.callSuper(attrName);
        }
    });
})(myt);

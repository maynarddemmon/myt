(pkg => {
    const math = Math,
        degreesToRadians = pkg.Geometry.degreesToRadians,
        
        /*  Redraws the annulus
            @param {!Object} annulus - The Annulus to redraw.
            @returns {undefined} */
        redraw = annulus => {
            Annulus.draw(
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
        updateSize = annulus => {
            const size = 2*(annulus.radius + annulus.thickness),
                svg = annulus.__svg;
            annulus.setWidth(size);
            annulus.setHeight(size);
            
            svg.setAttribute('viewBox', '0 0 ' + size + ' ' + size);
            svg.setAttribute('width', size);
            svg.setAttribute('height', size);
            
            redraw(annulus);
        },
        
        setAndRedraw = (annulus, attrName, value) => {
            if (annulus[attrName] !== value) {
                annulus[attrName] = value;
                if (annulus.inited) {
                    redraw(annulus);
                    annulus.fireEvent(attrName, value);
                }
            }
        },
        
        setAndUpdateSize = (annulus, attrName, value) => {
            if (annulus[attrName] !== value) {
                annulus[attrName] = value = math.max(0, value);
                if (annulus.inited) {
                    updateSize(annulus);
                    annulus.fireEvent(attrName, value);
                }
            }
        },
        
        makeSVG = (elementName, parentElem) => {
            const svgElem = document.createElementNS("http://www.w3.org/2000/svg", elementName);
            if (parentElem) parentElem.appendChild(svgElem);
            return svgElem;
        },
         
        /** An annulus component.
            
            @class */
        Annulus = pkg.Annulus = new JS.Class('Annulus', pkg.View, {
            // Class Methods and Attributes ////////////////////////////////////
            extend: {
                makeSVG: makeSVG,
                
                /** Draws an annulus using the provided path.
                    @param path:svg path object
                    @param startAngle:number The start angle in radians.
                    @param endAngle:number The end angle in radians.
                    @param thickness:number The difference between the inner 
                        and outer radius.
                    @param r1:number The inner radius.
                    @param c:number The center of the annulus
                    @param color:hex string The color to fill with.
                    @param startCapRounding:boolean If true the starting cap 
                        will be drawn as a semicircle.
                    @param endCapRounding:boolean If true the ending cap will 
                        be drawn as a semicircle.
                    @returns {undefined} */
                draw: (path, startAngle, endAngle, thickness, r1, c, color, startCapRounding, endCapRounding) => {
                    // Ensure endAngle is greater than or equal to startAngle
                    if (startAngle > endAngle) {
                        const tmp = startAngle;
                        startAngle = endAngle;
                        endAngle = tmp;
                    }
                    
                    const r2 = r1 + thickness,
                        PI = math.PI,
                        angleDiff = endAngle - startAngle,
                        isFull = angleDiff + 0.0001 >= 2 * PI; // 0.0001 is to handle floating point errors
                    
                    // Will use two arcs for a full circle
                    if (isFull) {
                        startAngle = 0;
                        endAngle = PI;
                    }
                    
                    const COS = math.cos,
                        SIN = math.sin,
                        points = [
                            [c + r2 * COS(startAngle), c + r2 * SIN(startAngle)],
                            [c + r2 * COS(endAngle),   c + r2 * SIN(endAngle)],
                            [c + r1 * COS(endAngle),   c + r1 * SIN(endAngle)],
                            [c + r1 * COS(startAngle), c + r1 * SIN(startAngle)]
                        ],
                        commands = [];
                    
                    commands.push('M' + points[0].join());
                    if (isFull) {
                        commands.push('A' + [r2, r2, 0, 1, 1, points[1]].join());
                        commands.push('A' + [r2, r2, 0, 1, 1, points[0]].join());
                        commands.push('L' + points[2].join());
                        commands.push('A' + [r1, r1, 0, 1, 0, points[3]].join());
                        commands.push('A' + [r1, r1, 0, 1, 0, points[2]].join());
                    } else {
                        const largeArc = (angleDiff % (2 * PI)) > PI ? 1 : 0,
                            halfThickness = thickness / 2;
                        commands.push('A' + [r2, r2, 0, largeArc, 1, points[1]].join());
                        if (endCapRounding) {
                            commands.push('A' + [halfThickness, halfThickness, 0, 0, 1, points[2]].join());
                        } else {
                            commands.push('L' + points[2].join());
                        }
                        commands.push('A' + [r1, r1, 0, largeArc, 0, points[3]].join());
                        if (startCapRounding) commands.push('A' + [halfThickness, halfThickness, 0, 0, 1, points[0]].join());
                    }
                    commands.push('z');
                    
                    path.setAttribute('d', commands.join(' '));
                    path.setAttribute('fill', color);
                }
            },
            
            
            // Life Cycle //////////////////////////////////////////////////////
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
                    innerElem = Array.isArray(elements) ? elements[1] : elements,
                    svg = this.__svg = makeSVG('svg', innerElem);
                this.__path = makeSVG('path', svg);
                
                // Let the view handle mouse events
                svg.style.pointerEvents = 'none';
                
                return elements;
            },
            
            
            // Accessors ///////////////////////////////////////////////////////
            setRadius: function(v) {setAndUpdateSize(this, 'radius', v);},
            setThickness: function(v) {setAndUpdateSize(this, 'thickness', v);},
            setStartAngle: function(v) {setAndRedraw(this, 'startAngle', v);},
            setEndAngle: function(v) {setAndRedraw(this, 'endAngle', v);},
            setStartCapRounding: function(v) {setAndRedraw(this, 'startCapRounding', v);},
            setEndCapRounding: function(v) {setAndRedraw(this, 'endCapRounding', v);},
            setColor: function(v) {setAndRedraw(this, 'color', v);},
            
            
            // Methods /////////////////////////////////////////////////////////
            /** Prevent views from being sent behind the __svg. This allows us 
                to add child views to an Annulus which is not directly supported 
                in HTML.
                @overrides */
            sendSubviewToBack: function(sv) {
                if (sv.parent === this) {
                    const ide = this.getIDE(),
                        firstChild = ide.childNodes[1];
                    if (sv.getODE() !== firstChild) {
                        const removedElem = ide.removeChild(sv.getODE());
                        if (removedElem) ide.insertBefore(removedElem, firstChild);
                    }
                }
            },
            
            /** @overrides myt.View */
            isColorAttr: function(attrName) {
                return attrName === 'color' || this.callSuper(attrName);
            }
        });
})(myt);

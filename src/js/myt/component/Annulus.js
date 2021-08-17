(pkg => {
    const math = Math,
        degreesToRadians = pkg.Geometry.degreesToRadians,
        
        /*  Redraws the annulus
            @param {!Object} annulus - The Annulus to redraw.
            @returns {undefined} */
        redraw = annulus => {
            // Ensure endAngle is greater than or equal to startAngle
            let startAngle = degreesToRadians(annulus.startAngle), 
                endAngle = degreesToRadians(annulus.endAngle);
            if (startAngle > endAngle) {
                const tmp = startAngle;
                startAngle = endAngle;
                endAngle = tmp;
            }
            
            const path = annulus.__path,
                center = annulus.width / 2,
                thickness = annulus.thickness,
                innerRadius = annulus.radius,
                outerRadius = innerRadius + thickness,
                PI = math.PI,
                angleDiff = endAngle - startAngle,
                isFull = angleDiff + 0.0001 >= 2 * PI; // 0.0001 is to handle floating point errors
            
            // Will use two arcs for a full circle
            if (isFull) {
                startAngle = 0;
                endAngle = PI;
            }
            
            const mathCos = math.cos,
                mathSin = math.sin,
                points = [
                    [center + outerRadius * mathCos(startAngle), center + outerRadius * mathSin(startAngle)],
                    [center + outerRadius * mathCos(endAngle),   center + outerRadius * mathSin(endAngle)],
                    [center + innerRadius * mathCos(endAngle),   center + innerRadius * mathSin(endAngle)],
                    [center + innerRadius * mathCos(startAngle), center + innerRadius * mathSin(startAngle)]
                ],
                commands = ['M' + points[0].join()];
            if (isFull) {
                commands.push(
                    'A' + [outerRadius, outerRadius, 0, 1, 1, points[1]].join(),
                    'A' + [outerRadius, outerRadius, 0, 1, 1, points[0]].join(),
                    'L' + points[2].join(),
                    'A' + [innerRadius, innerRadius, 0, 1, 0, points[3]].join(),
                    'A' + [innerRadius, innerRadius, 0, 1, 0, points[2]].join()
                );
            } else {
                const largeArc = (angleDiff % (2 * PI)) > PI ? 1 : 0,
                    halfThickness = thickness / 2;
                commands.push(
                    'A' + [outerRadius, outerRadius, 0, largeArc, 1, points[1]].join(),
                    annulus.endCapRounding ? 'A' + [halfThickness, halfThickness, 0, 0, 1, points[2]].join() : 'L' + points[2].join(),
                    'A' + [innerRadius, innerRadius, 0, largeArc, 0, points[3]].join(),
                    annulus.startCapRounding ? 'A' + [halfThickness, halfThickness, 0, 0, 1, points[0]].join() : ''
                );
            }
            commands.push('z');
            
            path.setAttribute('d', commands.join(' '));
            path.setAttribute('fill', annulus.color);
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
            const svgElem = document.createElementNS('http://www.w3.org/2000/svg', elementName);
            if (parentElem) parentElem.appendChild(svgElem);
            return svgElem;
        },
         
        /** An annulus component.
            
            @class */
        Annulus = pkg.Annulus = new JS.Class('Annulus', pkg.View, {
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
            /** The outer radius of the Annulus. */
            setRadius: function(v) {setAndUpdateSize(this, 'radius', v);},
            
            /** The difference between the inner and outer radius. */
            setThickness: function(v) {setAndUpdateSize(this, 'thickness', v);},
            
            /** The start angle in radians. */
            setStartAngle: function(v) {setAndRedraw(this, 'startAngle', v);},
            
            /** The end angle in radians. */
            setEndAngle: function(v) {setAndRedraw(this, 'endAngle', v);},
            
            /** If true the starting cap will be drawn as a semicircle. */
            setStartCapRounding: function(v) {setAndRedraw(this, 'startCapRounding', v);},
            
            /** If true the ending cap will be drawn as a semicircle. */
            setEndCapRounding: function(v) {setAndRedraw(this, 'endCapRounding', v);},
            
            /** The hex color string to fill the Annulus with. */
            setColor: function(v) {setAndRedraw(this, 'color', v);},
            
            
            // Methods /////////////////////////////////////////////////////////
            /** Prevent views from being sent behind the __svg. This allows 
                child views to be added to an Annulus which is not directly 
                supported in HTML.
                @overrides */
            sendSubviewToBack: function(sv) {
                if (sv.parent === this) {
                    const ide = this.getIDE(),
                        firstChild = ide.childNodes[1],
                        svOde = sv.getODE();
                    if (svOde !== firstChild) {
                        const removedElem = ide.removeChild(svOde);
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

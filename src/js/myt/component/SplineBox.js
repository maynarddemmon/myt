(pkg => {
    const JSClass = JS.Class,
        
        consoleWarn = console.warn,
        {abs:mathAbs, cos:mathCos, sin:mathSin, sqrt:mathSqrt, round:mathRound, min:mathMin, max:mathMax} = Math,
        isArray = Array.isArray,
        {generateGuid, Geometry:{degreesToRadians}, SVG:{makeSVG}} = pkg,
        
        EAST = 0,
        SOUTH = 90,
        WEST = 180,
        NORTH = 270,
        
        /*  The style used for any property not provided by a Spline style or by the defaultStyle 
            of the SplineBox the Spline lives in. */
        DEFAULT_STYLE = {
            color:'#000000',
            thickness:1,
            opacity:1,
            cap:'round',
            join:'round',
            dash:null,
            dashOffset:0,
            
            offsetX:0,
            offsetY:0,
            
            // The direction the curve leaves each endpoint. May be a number of degrees or one of 
            // the keywords: 'north', 'south', 'east', 'west', 'horizontal', 'vertical', 'auto'.
            startAngle:'horizontal',
            endAngle:'horizontal',
            
            // How far the curve is pulled in the direction of the angle. 0 is a straight line, 
            // 1 pulls the control point out by the full distance between the endpoints.
            startCurvature:0.5,
            endCurvature:0.5,
            
            // Optional pixel clamps applied to the calculated control point distance. Useful for 
            // keeping very short lines from looking limp and very long ones from ballooning.
            minCurveDistance:0,
            maxCurveDistance:Infinity,
            
            // An arrowhead shape name, or null for none. One of "triangle", "open" or "dot".
            startArrow:null,
            endArrow:null,
            
            // A short straight run in pixels at each end before the curve begins. Gives 
            // arrowheads a straight segment to sit on and makes the line leave the endpoint 
            // cleanly.
            startStub:0,
            endStub:0,
            
            // A gap in pixels between the endpoint and where the line actually starts. Lets the 
            // line stop short of the view it connects to.
            startGap:0,
            endGap:0
        },
        
        /*  Arrowhead marker definitions. All dimensions are in stroke-width units since the 
            markers use markerUnits="strokeWidth", so an arrowhead always scales with the layer 
            that draws it. */
        ARROW_SHAPES = {
            triangle:{width:4, height:4, refX:4, refY:2, elem:'path', attrs:{
                d:'M0,0 L4,2 L0,4 z', fill:'context-stroke', stroke:'none'
            }},
            open:{width:4, height:4, refX:3.6, refY:2, elem:'path', attrs:{
                d:'M0.5,0.5 L3.5,2 L0.5,3.5', fill:'none', stroke:'context-stroke',
                'stroke-width':1, 'stroke-linecap':'round', 'stroke-linejoin':'round'
            }},
            dot:{width:3, height:3, refX:1.5, refY:1.5, elem:'circle', attrs:{
                cx:1.5, cy:1.5, r:1.2, fill:'context-stroke', stroke:'none'
            }}
        },
        
        /*  Sets an attribute on a dom element only if the value differs from the last value set 
            by this function. Avoids dom writes for the properties that did not change which is 
            the common case while dragging since only the "d" attribute changes.
            @param {!Object} elem - The dom element to set an attribute on.
            @param {string} name - The attribute name.
            @param {*} value - The attribute value. A null or undefined value removes the attribute.
            @returns {void} */
        setAttr = (elem, name, value) => {
            const cache = elem.__attrCache ??= {};
            if (cache[name] !== value) {
                cache[name] = value;
                if (value == null) {
                    elem.removeAttribute(name);
                } else {
                    elem.setAttribute(name, value);
                }
            }
        },
        
        /*  Rounds to two decimal places. Shorter path data strings parse faster and the extra 
            precision is not visible. */
        round2 = v => mathRound(v * 100) / 100,
        
        /*  Resolves an angle value from a style into a number of degrees.
            @param {number|string} value - Degrees or an angle keyword.
            @param {boolean} isStart - True when resolving the angle for the start point.
            @param {number} dx - The x distance from the start point to the end point.
            @param {number} dy - The y distance from the start point to the end point.
            @returns {number} - The angle in degrees. */
        resolveAngle = (value, isStart, dx, dy) => {
            if (typeof value === 'number') return value;
            
            switch (value) {
                case 'horizontal':
                    // When the end point is to the left of the start point both directions flip 
                    // so the curve always leaves each point heading toward the other one. Equal x 
                    // values fall through to the "end is to the right" case, which pulls the two 
                    // control points past each other and produces a symmetric S curve.
                    return dx < 0 ? (isStart ? WEST : EAST) : (isStart ? EAST : WEST);
                case 'vertical':
                    // Equal y values give a symmetric S curve for the same reason as above.
                    return dy < 0 ? (isStart ? NORTH : SOUTH) : (isStart ? SOUTH : NORTH);
                case 'auto':
                    // Use whichever axis the endpoints are further apart on.
                    return resolveAngle(mathAbs(dx) >= mathAbs(dy) ? 'horizontal' : 'vertical', isStart, dx, dy);
                case 'north': return NORTH;
                case 'south': return SOUTH;
                case 'east': return EAST;
                case 'west': return WEST;
                default:
                    consoleWarn('Unknown spline angle', value);
                    return isStart ? EAST : WEST;
            }
        },
        
        /*  Converts a curvature into a control point distance in pixels.
            @param {number} curvature - Typically 0 to 1 though larger values are allowed.
            @param {number} distance - The distance between the two endpoints.
            @param {!Object} style - The resolved style. Provides the optional clamps.
            @returns {number} */
        resolveCurveDistance = (curvature, distance, style) => mathMin(style.maxCurveDistance, mathMax(style.minCurveDistance, curvature * distance)),
        
        /*  The style properties that affect the shape of the curve. Two layers that agree on all of 
            them produce identical path data, so it only needs to be built once. Note that offsetX and 
            offsetY are deliberately absent — an offset layer is a translate of the same curve. */
        GEOMETRY_KEYS = ['startAngle', 'endAngle', 'startCurvature', 'endCurvature', 'minCurveDistance', 'maxCurveDistance', 'startStub', 'endStub', 'startGap', 'endGap'],
        
        sameGeometry = (a, b) => {
            if (a) {
                for (const key of GEOMETRY_KEYS) if (a[key] !== b[key]) return false;
                return true;
            }
            return false;
        },
        
        /*  Builds the svg path data for a Spline drawn with the provided style.
            @param {!Object} spline - The myt.Spline to build path data for.
            @param {!Object} style - A fully resolved style object.
            @returns {string} - An svg "d" attribute value. */
        makePathData = (spline, style) => {
            const {startX:sx, startY:sy, endX:ex, endY:ey} = spline,
                dx = ex - sx,
                dy = ey - sy,
                {startCurvature, endCurvature} = style,
                
                // Cap each stub at a fraction of the endpoint separation.
                budget = mathSqrt(dx * dx + dy * dy) * 0.4,
                startStub = mathMin(style.startStub, budget),
                endStub = mathMin(style.endStub, budget),
                
                startGap = mathMin(style.startGap, budget),
                endGap = mathMin(style.endGap, budget);
            
            // Fast path for a plain straight line.
            if (!startCurvature && !endCurvature && !startStub && !endStub && !startGap && !endGap) return 'M' + round2(sx) + ',' + round2(sy) + 'L' + round2(ex) + ',' + round2(ey);
            
            // Angles are resolved from the original endpoints so the relative position of the two views 
            // governs the "horizontal", "vertical" and "auto" keywords rather than the stub geometry.
            const startAngle = degreesToRadians(resolveAngle(spline.startAngle ?? style.startAngle, true, dx, dy)),
                endAngle = degreesToRadians(resolveAngle(spline.endAngle ?? style.endAngle, false, dx, dy)),
                startCos = mathCos(startAngle),
                startSin = mathSin(startAngle),
                endCos = mathCos(endAngle),
                endSin = mathSin(endAngle),
                
                // The gap moves where the line actually begins. Nothing is drawn between the endpoint 
                // and here.
                gsx = sx + startCos * startGap,
                gsy = sy + startSin * startGap,
                gex = ex + endCos * endGap,
                gey = ey + endSin * endGap,
                
                // The stub then runs from there before the curve takes over.
                csx = gsx + startCos * startStub,
                csy = gsy + startSin * startStub,
                cex = gex + endCos * endStub,
                cey = gey + endSin * endStub,
                
                curveDx = cex - csx,
                curveDy = cey - csy,
                distance = mathSqrt(curveDx * curveDx + curveDy * curveDy),
                startDistance = resolveCurveDistance(startCurvature, distance, style),
                endDistance = resolveCurveDistance(endCurvature, distance, style);
            
            return 'M' + round2(gsx) + ',' + round2(gsy) +
                (startStub ? 'L' + round2(csx) + ',' + round2(csy) : '') +
                'C' + round2(csx + startCos * startDistance) + ',' + round2(csy + startSin * startDistance) +
                ' ' + round2(cex + endCos * endDistance) + ',' + round2(cey + endSin * endDistance) +
                ' ' + round2(cex) + ',' + round2(cey) +
                (endStub ? 'L' + round2(gex) + ',' + round2(gey) : '');
        },
        
        /*  A common setter implementation for the geometry attributes of a Spline.
            @param {!Object} spline
            @param {string} attrName
            @param {number} value
            @returns {void} */
        setAndRedraw = (spline, attrName, value) => {
            if (spline[attrName] !== value) {
                spline[attrName] = value;
                if (spline.inited) {
                    spline.redraw();
                    spline.fireEvent(attrName, value);
                }
            }
        },
        
        /** Models a single curved line drawn by an myt.SplineBox. Extends Node rather than View 
            since a Spline is not backed by a dom element of its own. It owns an svg "g" element 
            that the SplineBox inserts into its svg element.
            
            Events:
                startX:number
                startY:number
                endX:number
                endY:number
                splineId:string
                style:object|array
            
            Attributes:
                startX:number The x position the line starts at.
                startY:number The y position the line starts at.
                endX:number The x position the line ends at.
                endY:number The y position the line ends at.
                splineId:string A unique ID used to look this Spline up on its SplineBox. One is 
                    generated if none is provided.
                style:object|array A style object, or an array of them, describing how to draw this 
                    Spline. When an array is provided the line is drawn once per entry in array 
                    order so entry zero ends up underneath. Falls back to the defaultStyle of the 
                    SplineBox when not provided.
            
            Private Attributes:
                __g:object The svg "g" dom element holding the path elements for this Spline.
                __paths:array The svg "path" dom elements. One per style.
            
            @class */
        Spline = pkg.Spline = new JSClass('Spline', pkg.Node, {
            // Life Cycle //////////////////////////////////////////////////////
            /** @overrides myt.Node */
            initNode: function(parent, attrs) {
                const self = this;
                
                self.startX = self.startY = self.endX = self.endY = 0;
                self.startAngle = self.endAngle = null;
                
                // A Spline must be a direct child of the SplineBox that draws it.
                attrs.ignorePlacement ??= true;
                
                attrs.splineId ??= 'spline_' + generateGuid();
                
                self.__g = makeSVG('g');
                self.__paths = [];
                
                self.callSuper(parent, attrs);
            },
            
            /** @overrides myt.Node */
            destroyAfterOrphaning: function() {
                this.__g?.remove();
                this.callSuper();
            },
            
            
            // Accessors ///////////////////////////////////////////////////////
            setStartX: function(v) {setAndRedraw(this, 'startX', v);},
            setStartY: function(v) {setAndRedraw(this, 'startY', v);},
            setEndX: function(v) {setAndRedraw(this, 'endX', v);},
            setEndY: function(v) {setAndRedraw(this, 'endY', v);},
            setStartAngle: function(v) {setAndRedraw(this, 'startAngle', v);},
            setEndAngle: function(v) {setAndRedraw(this, 'endAngle', v);},
            
            setSplineId: function(v) {
                const self = this,
                    existing = self.splineId;
                if (existing !== v) {
                    self.splineId = v;
                    if (self.inited) {
                        // Re-index
                        const splines = self.parent?.__splinesById;
                        if (splines) {
                            if (splines[existing] === self) delete splines[existing];
                            splines[v] = self;
                        }
                        
                        self.fireEvent('splineId', v);
                    }
                }
            },
            
            setStyle: function(v) {
                const self = this;
                if (self.style !== v) {
                    self.style = v;
                    if (self.inited) {
                        self.redraw();
                        self.fireEvent('style', v);
                    }
                }
            },
            
            /** Gets the svg "g" dom element that holds the path elements for this Spline.
                @returns {?Object} */
            getGroupElement: function() {
                return this.__g;
            },
            
            
            // Methods /////////////////////////////////////////////////////////
            /** Sets all four endpoint coordinates at once. Preferable to four individual setter 
                calls while dragging since it results in a single redraw.
                @param {number} startX
                @param {number} startY
                @param {number} endX
                @param {number} endY
                @returns {void} */
            setPoints: function(startX, startY, endX, endY) {
                const self = this;
                
                let startXChanged = false,
                    startYChanged = false,
                    endXChanged = false,
                    endYChanged = false;
                if (self.startX !== startX) {
                    self.startX = startX;
                    startXChanged = true;
                }
                if (self.startY !== startY) {
                    self.startY = startY;
                    startYChanged = true;
                }
                if (self.endX !== endX) {
                    self.endX = endX;
                    endXChanged = true;
                }
                if (self.endY !== endY) {
                    self.endY = endY;
                    endYChanged = true;
                }
                
                if (self.inited) {
                    if (startXChanged || startYChanged || endXChanged || endYChanged) {
                        self.redraw();
                        if (startXChanged) self.fireEvent('startX', startX);
                        if (startYChanged) self.fireEvent('startY', startY);
                        if (endXChanged) self.fireEvent('endX', endX);
                        if (endYChanged) self.fireEvent('endY', endY);
                    }
                }
            },
            
            redraw: function() {
                const self = this,
                    paths = self.__paths;
                if (paths) {
                    // Resolve styles
                    const box = self.parent,
                        style = self.style ?? box?.defaultStyle ?? DEFAULT_STYLE,
                        layers = isArray(style) ? style : [style],
                        styles = layers.map(layer => ({...DEFAULT_STYLE, ...layer})),
                        stylesLen = styles.length;
                    
                    // Sync the number of path elements with the number of styles.
                    while (paths.length < stylesLen) paths.push(makeSVG('path', self.__g));
                    while (paths.length > stylesLen) paths.pop().remove();
                    
                    let prevStyle,
                        pathData;
                    for (let i = 0; i < stylesLen; i++) {
                        // Apply style
                        const style = styles[i],
                            pathElem = paths[i],
                            {dash, opacity, offsetX, offsetY, startArrow, endArrow} = style;
                        setAttr(pathElem, 'fill', 'none');
                        setAttr(pathElem, 'stroke', style.color);
                        setAttr(pathElem, 'stroke-width', style.thickness);
                        setAttr(pathElem, 'stroke-linecap', style.cap);
                        setAttr(pathElem, 'stroke-linejoin', style.join);
                        setAttr(pathElem, 'stroke-opacity', opacity === 1 ? null : opacity);
                        setAttr(pathElem, 'stroke-dasharray', dash == null ? null : (isArray(dash) ? dash.join(' ') : dash));
                        setAttr(pathElem, 'stroke-dashoffset', style.dashOffset || null);
                        setAttr(pathElem, 'marker-start', startArrow ? box?.getArrowMarker(startArrow) : null);
                        setAttr(pathElem, 'marker-end', endArrow ? box?.getArrowMarker(endArrow) : null);
                        setAttr(pathElem, 'transform', (offsetX || offsetY) ? 'translate(' + offsetX + ',' + offsetY + ')' : null);
                        
                        // Reuse the path data when this layer has the same shape as the one below it.
                        if (!sameGeometry(prevStyle, style)) pathData = makePathData(self, style);
                        prevStyle = style;
                        
                        setAttr(pathElem, 'd', pathData);
                    }
                }
            }
        }),
        
        /** A view that draws myt.Splines into a single svg element.
            
            Attributes:
                defaultStyle:object|array The style used to draw any Spline that does not define a 
                    style of its own.
            
            Private Attributes:
                __splinesById:object A map of the Splines in this SplineBox by splineId.
            
            @class */
        SplineBox = pkg.SplineBox = new JSClass('SplineBox', pkg.SVG, {
            // Life Cycle //////////////////////////////////////////////////////
            /** @overrides myt.View */
            initNode: function(parent, attrs) {
                this.__splinesById = {};
                
                this.callSuper(parent, attrs);
            },
            
            
            // Accessors ///////////////////////////////////////////////////////
            /** @overrides myt.View
                Needed because the svg element must also be resized. */
            setWidth: function(v) {
                if (0 > v) v = 0;
                this.getSVG().setAttribute('width', v);
                this.callSuper(v);
            },
            
            /** @overrides myt.View
                Needed because the svg element must also be resized. */
            setHeight: function(v) {
                if (0 > v) v = 0;
                this.getSVG().setAttribute('height', v);
                this.callSuper(v);
            },
            
            setDefaultStyle: function(v) {
                const self = this;
                if (self.defaultStyle !== v) {
                    self.defaultStyle = v;
                    if (self.inited) {
                        // Only Splines without a style of their own are affected.
                        for (const spline of self.getSplines()) {
                            if (spline.style == null) spline.redraw();
                        }
                        self.fireEvent('defaultStyle', v);
                    }
                }
            },
            
            
            // Methods /////////////////////////////////////////////////////////
            /** @overrides myt.View */
            subnodeAdded: function(node) {
                this.callSuper(node);
                
                if (node instanceof Spline) {
                    this.__splinesById[node.splineId] = node;
                    this.getSVG().appendChild(node.getGroupElement());
                    node.redraw();
                }
            },
            
            /** @overrides myt.View */
            subnodeRemoved: function(node) {
                this.callSuper(node);
                
                if (node instanceof Spline) {
                    if (this.__splinesById) delete this.__splinesById[node.splineId];
                    node.getGroupElement()?.remove();
                }
            },
            
            /** Adds a Spline to this SplineBox. May be called in three ways:
                    addSpline(startX, startY, endX, endY, splineId, style)
                    addSpline(attrs) where attrs is a map of Spline attributes.
                    addSpline(spline) where spline is an existing myt.Spline. It will be reparented 
                        from its existing parent if it has one.
                @param {number|!Object} startX - The x position of the start of the line. 
                    Alternately an myt.Spline or a map of Spline attributes.
                @param {number} [startY] - The y position of the start of the line.
                @param {number} [endX] - The x position of the end of the line.
                @param {number} [endY] - The y position of the end of the line.
                @param {string} [splineId] - A unique ID for the line. Generated if not provided.
                @param {!Object|!Array} [style] - A style object or an array of them.
                @returns {!Object} - The created myt.Spline or the one that was provided. */
            addSpline: function(startX, startY, endX, endY, splineId, style) {
                if (startX instanceof Spline) {
                    startX.setParent(this);
                    return startX;
                } else {
                    const attrs = (startX !== null && typeof startX === 'object') ? {...startX} : {startX:startX, startY:startY, endX:endX, endY:endY};
                    if (splineId != null) attrs.splineId = splineId;
                    if (style != null) attrs.style = style;
                    attrs.splineId ??= 'spline_' + generateGuid();
                    
                    const existing = this.getSpline(attrs.splineId);
                    if (existing) {
                        consoleWarn('Replacing spline with duplicate id', attrs.splineId);
                        existing.destroy();
                    }
                    
                    return new Spline(this, attrs);
                }
            },
            
            /** Removes a Spline from this SplineBox without destroying it. The Spline can be 
                added to another SplineBox afterward.
                @param {string|!Object} v - A spline ID or an myt.Spline.
                @returns {?Object} - The removed myt.Spline or undefined if it was not found. */
            removeSpline: function(v) {
                const spline = typeof v === 'string' ? this.getSpline(v) : v;
                if (spline?.parent === this) {
                    spline.setParent();
                    return spline;
                }
            },
            
            /** Gets a Spline by ID.
                @param {string} splineId
                @returns {?Object} - An myt.Spline or undefined if not found. */
            getSpline: function(splineId) {
                return this.__splinesById?.[splineId];
            },
            
            /** Checks if a Spline with the provided ID exists in this SplineBox.
                @param {string} splineId
                @returns {boolean} */
            hasSpline: function(splineId) {
                return this.getSpline(splineId) != null;
            },
            
            /** Gets all the Splines in this SplineBox in the order they are drawn.
                @returns {!Array} - An array of myt.Splines. */
            getSplines: function() {
                return this.getSubnodes().filter(node => node instanceof Spline);
            },
            
            /** Destroys every Spline in this SplineBox.
                @returns {void} */
            clear: function() {
                // Iterate over a copy since destroying a Spline modifies the subnodes array.
                for (const spline of this.getSplines()) spline.destroy();
            },
            
            /** Gets a url reference to an arrowhead marker, creating the marker if this is the 
                first use of that shape in this SplineBox.
                @param {string} shape - One of the keys of ARROW_SHAPES.
                @returns {?string} - A url() reference for a marker-start or marker-end attribute. */
            getArrowMarker: function(shape) {
                const self = this,
                    markers = self.__markers ??= {};
                let markerUrl = markers[shape];
                
                if (!markerUrl) {
                    const def = ARROW_SHAPES[shape];
                    if (!def) {
                        consoleWarn('Unknown spline arrow shape', shape);
                        return null;
                    }
                    
                    let defs = self.__defs;
                    if (!defs) {
                        const svg = self.getSVG();
                        defs = self.__defs = makeSVG('defs');
                        svg.insertBefore(defs, svg.firstChild);
                    }
                    
                    const id = 'splinearrow_' + shape + '_' + generateGuid(),
                        marker = makeSVG('marker', defs);
                    marker.setAttribute('id', id);
                    marker.setAttribute('viewBox', '0 0 ' + def.width + ' ' + def.height);
                    marker.setAttribute('markerWidth', def.width);
                    marker.setAttribute('markerHeight', def.height);
                    marker.setAttribute('refX', def.refX);
                    marker.setAttribute('refY', def.refY);
                    marker.setAttribute('markerUnits', 'strokeWidth');
                    
                    // auto-start-reverse flips the marker for marker-start so a start arrow points out of 
                    // the start view rather than along the direction of travel.
                    marker.setAttribute('orient', 'auto-start-reverse');
                    
                    const shapeElem = makeSVG(def.elem, marker);
                    for (const attrName in def.attrs) shapeElem.setAttribute(attrName, def.attrs[attrName]);
                    
                    markerUrl = markers[shape] = 'url(#' + id + ')';
                }
                
                return markerUrl;
            }
        }),
        
        /*  Maps an attachment side to the direction a curve leaves that side. */
        SIDE_ANGLES = {
            top:'north',
            bottom:'south',
            left:'west',
            right:'east'
        },
        
        /*  Reused rather than allocated per update since endpoints are recalculated on every 
            move of every connected View. */
        SCRATCH_START = {x:0, y:0},
        SCRATCH_END = {x:0, y:0},
        
        /*  Resolves a position along one side of a View into a pixel offset from the start of 
            that side.
            @param {number|string} position - A pixel offset, a percentage string such as "25%", 
                or one of the keywords "start", "middle" or "end". A negative number is an offset 
                back from the end of the side. Defaults to "middle".
            @param {number} extent - The length of the side being positioned along.
            @returns {number} */
        resolvePosition = (position, extent) => {
            if (position != null) {
                if (typeof position === 'number') return 0 > position ? extent + position : position;
                
                switch (position) {
                    case 'start': return 0;
                    case 'middle': return extent / 2;
                    case 'end': return extent;
                }
                
                if (typeof position === 'string' && position.endsWith('%')) {
                    const percent = parseFloat(position);
                    if (!isNaN(percent)) return extent * percent / 100;
                }
                
                consoleWarn('Unknown spline connection position', position);
            }
            return extent / 2;
        },
        
        /*  Calculates the anchor point for one end of a connection in the coordinate space of the 
            SplineFlow.
            @param {!Object} view - The myt.View being connected to.
            @param {string} side - One of "top", "bottom", "left" or "right".
            @param {number|string} position - Where along that side to attach.
            @param {!Object} scratch - The object to write the x and y results into.
            @returns {void} */
        getAnchor = (view, side, position, scratch) => {
            const {x, y, width, height} = view;
            switch (side) {
                case 'top':
                    scratch.x = x + resolvePosition(position, width);
                    scratch.y = y;
                    return;
                case 'bottom':
                    scratch.x = x + resolvePosition(position, width);
                    scratch.y = y + height;
                    return;
                case 'left':
                    scratch.x = x;
                    scratch.y = y + resolvePosition(position, height);
                    return;
                case 'right':
                    scratch.x = x + width;
                    scratch.y = y + resolvePosition(position, height);
                    return;
                default:
                    // No side means attach to the center and let the style govern the angle.
                    scratch.x = x + width / 2;
                    scratch.y = y + height / 2;
            }
        },
        
        /*  A common setter implementation for the endpoint description attributes of a 
            SplineConnection.
            @param {!Object} connection
            @param {string} attrName
            @param {*} value
            @returns {void} */
        setAndUpdate = (connection, attrName, value) => {
            if (connection[attrName] !== value) {
                connection[attrName] = value;
                if (connection.inited) {
                    connection.updateEndpoints();
                    connection.fireEvent(attrName, value);
                }
            }
        },
        
        /** A Spline whose endpoints are derived from two other Views rather than set directly. The 
            endpoints update automatically whenever either View is moved or resized.
            
            Do not set startX, startY, endX or endY on a SplineConnection. They are recalculated 
            from the connected Views and any value written to them will be overwritten on the 
            next update.
            
            Events:
                startView:object
                startSide:string
                startPosition:number|string
                endView:object
                endSide:string
                endPosition:number|string
            
            Attributes:
                startView:object The myt.View the line starts at.
                startSide:string Which side of startView to attach to. One of "top", "bottom", 
                    "left" or "right". When not provided the line attaches to the center of the 
                    View and the exit angle is left to the style.
                startPosition:number|string Where along startSide to attach. A pixel offset, a 
                    percentage string such as "25%", or one of "start", "middle" or "end". A 
                    negative number offsets back from the end of the side. Defaults to "middle".
                endView:object The myt.View the line ends at.
                endSide:string Which side of endView to attach to.
                endPosition:number|string Where along endSide to attach.
            
            @class */
        SplineConnection = pkg.SplineConnection = new JSClass('SplineConnection', Spline, {
            // Life Cycle //////////////////////////////////////////////////////
            /** @overrides myt.Spline */
            initNode: function(parent, attrs) {
                this.callSuper(parent, attrs);
                this.updateEndpoints();
            },
            
            
            // Accessors ///////////////////////////////////////////////////////
            setStartView: function(v) {
                if (this.startView !== v) {
                    if (this.startView) this.__detach(this.startView);
                    this.startView = v;
                    if (v) this.__attach(v);
                    if (this.inited) {
                        this.updateEndpoints();
                        this.fireEvent('startView', v);
                    }
                }
            },
            setEndView: function(v) {
                if (this.endView !== v) {
                    if (this.endView) this.__detach(this.endView);
                    this.endView = v;
                    if (v) this.__attach(v);
                    if (this.inited) {
                        this.updateEndpoints();
                        this.fireEvent('endView', v);
                    }
                }
            },
            
            setStartSide: function(v) {
                setAndUpdate(this, 'startSide', v);
                this.setStartAngle(SIDE_ANGLES[v] ?? null);
            },
            
            setEndSide: function(v) {
                setAndUpdate(this, 'endSide', v);
                this.setEndAngle(SIDE_ANGLES[v] ?? null);
            },
            
            setStartPosition: function(v) {setAndUpdate(this, 'startPosition', v);},
            setEndPosition: function(v) {setAndUpdate(this, 'endPosition', v);},
            
            
            // Methods /////////////////////////////////////////////////////////
            __detach: function(sv) {
                this.detachFrom(sv, 'updateEndpoints', 'x');
                this.detachFrom(sv, 'updateEndpoints', 'y');
                this.detachFrom(sv, 'updateEndpoints', 'width');
                this.detachFrom(sv, 'updateEndpoints', 'height');
            },
            
            __attach: function(sv) {
                this.attachTo(sv, 'updateEndpoints', 'x');
                this.attachTo(sv, 'updateEndpoints', 'y');
                this.attachTo(sv, 'updateEndpoints', 'width');
                this.attachTo(sv, 'updateEndpoints', 'height');
            },
            
            /** Recalculates both endpoints from the connected Views. Wired to the position and 
                size events of every View in both chains.
                @returns {void} */
            updateEndpoints: function() {
                const self = this,
                    {startView, endView} = self;
                if (startView && endView) {
                    getAnchor(startView, self.startSide, self.startPosition, SCRATCH_START);
                    getAnchor(endView, self.endSide, self.endPosition, SCRATCH_END);
                    self.setPoints(SCRATCH_START.x, SCRATCH_START.y, SCRATCH_END.x, SCRATCH_END.y);
                }
            }
        });
    
    /** A SplineBox that draws connections between its other subviews. The connected Views are 
        ordinary Views, so they keep their own text, focus and mouse handling, while the lines 
        between them are drawn into the single svg element inherited from myt.SVG.
        
        Connections are drawn behind the Views they connect, since myt.BackView keeps the svg 
        element at the back of the flow's dom element.
        
        @class */
    pkg.SplineFlow = new JSClass('SplineFlow', SplineBox, {
        // Methods /////////////////////////////////////////////////////////////
        /** @overrides myt.View */
        subviewRemoved: function(sv) {
            this.callSuper(sv);
            if (!this.isBeingDestroyed) this.disconnectAll(sv);
        },
        
        /** Creates a connection between two Views.
                connect({
                    start:{view:boxA, side:'right', position:'middle'},
                    end:{view:boxB, side:'left', position:'25%'},
                    splineId:'a_to_b',
                    style:{color:'#3388cc', thickness:2}
                })
            @param {!Object} config - Requires "start" and "end", each an object with a "view" and 
                optional "side" and "position". Any other key is passed through to the 
                SplineConnection, so splineId and style work as they do on addSpline.
            @returns {!Object} - The created myt.SplineConnection. */
        connect: function(config) {
            const {start, end, ...attrs} = config;
            
            if (!start?.view || !end?.view) {
                consoleWarn('A spline connection requires a start view and an end view');
                return;
            }
            
            if (start.view.parent !== this || end.view.parent !== this) {
                consoleWarn('Spline connections require views that are immediate subviews of the flow');
                return;
            }
            
            attrs.startView = start.view;
            attrs.startSide = start.side;
            attrs.startPosition = start.position;
            
            attrs.endView = end.view;
            attrs.endSide = end.side;
            attrs.endPosition = end.position;
            
            attrs.splineId ??= 'connection_' + generateGuid();
            
            const existing = this.getSpline(attrs.splineId);
            if (existing) {
                consoleWarn('Replacing connection with duplicate id', attrs.splineId);
                existing.destroy();
            }
            
            return new SplineConnection(this, attrs);
        },
        
        /** Destroys a connection.
            @param {string|!Object} v - A spline ID or an myt.SplineConnection.
            @returns {boolean} - True if a connection was destroyed. */
        disconnect: function(v) {
            const connection = typeof v === 'string' ? this.getSpline(v) : v;
            if (connection instanceof SplineConnection && connection.parent === this) {
                connection.destroy();
                return true;
            }
            return false;
        },
        
        /** Destroys every connection touching the provided View.
            @param {!Object} view - An myt.View.
            @returns {number} - How many connections were destroyed. */
        disconnectAll: function(view) {
            const connections = this.getConnections(view);
            for (const connection of connections) connection.destroy();
            return connections.length;
        },
        
        /** Gets every connection touching the provided View, or all of them when no View is given.
            @param {!Object} [view] - An myt.View to filter by.
            @returns {!Array} - An array of myt.SplineConnections. */
        getConnections: function(view) {
            return this.getSubnodes().filter(node => 
                node instanceof SplineConnection && (view == null || node.startView === view || node.endView === view)
            );
        }
    });
})(myt);

(pkg => {
    const JSClass = JS.Class,
        
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
            maxCurveDistance:Infinity
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
                    console.warn('Unknown spline angle', value);
                    return isStart ? EAST : WEST;
            }
        },
        
        /*  Converts a curvature into a control point distance in pixels.
            @param {number} curvature - Typically 0 to 1 though larger values are allowed.
            @param {number} distance - The distance between the two endpoints.
            @param {!Object} style - The resolved style. Provides the optional clamps.
            @returns {number} */
        resolveCurveDistance = (curvature, distance, style) => mathMin(style.maxCurveDistance, mathMax(style.minCurveDistance, curvature * distance)),
        
        /*  Builds the svg path data for a Spline drawn with the provided style.
            @param {!Object} spline - The myt.Spline to build path data for.
            @param {!Object} style - A fully resolved style object.
            @returns {string} - An svg "d" attribute value. */
        makePathData = (spline, style) => {
            const {startX:sx, startY:sy, endX:ex, endY:ey} = spline,
                dx = ex - sx,
                dy = ey - sy,
                {startCurvature, endCurvature} = style;
            
            // Fast path for straight lines.
            if (!startCurvature && !endCurvature) return 'M' + round2(sx) + ',' + round2(sy) + 'L' + round2(ex) + ',' + round2(ey);
            
            const distance = mathSqrt(dx * dx + dy * dy),
                startAngle = degreesToRadians(resolveAngle(style.startAngle, true, dx, dy)),
                endAngle = degreesToRadians(resolveAngle(style.endAngle, false, dx, dy)),
                startDistance = resolveCurveDistance(startCurvature, distance, style),
                endDistance = resolveCurveDistance(endCurvature, distance, style);
            
            return 'M' + round2(sx) + ',' + round2(sy) +
                'C' + round2(sx + mathCos(startAngle) * startDistance) + ',' + round2(sy + mathSin(startAngle) * startDistance) +
                ' ' + round2(ex + mathCos(endAngle) * endDistance) + ',' + round2(ey + mathSin(endAngle) * endDistance) +
                ' ' + round2(ex) + ',' + round2(ey);
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
        };
    
    /** Models a single curved line drawn by an myt.SplineBox. Extends Node rather than View since 
        a Spline is not backed by a dom element of its own. It owns an svg "g" element that the 
        SplineBox inserts into its svg element.
        
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
                Spline. When an array is provided the line is drawn once per entry in array order 
                so entry zero ends up underneath. Falls back to the defaultStyle of the SplineBox 
                when not provided.
        
        Private Attributes:
            __g:object The svg "g" dom element holding the path elements for this Spline.
            __paths:array The svg "path" dom elements. One per style.
        
        @class */
    const Spline = pkg.Spline = new JSClass('Spline', pkg.Node, {
        // Life Cycle //////////////////////////////////////////////////////////
        /** @overrides myt.Node */
        initNode: function(parent, attrs) {
            const self = this;
            
            self.startX = self.startY = self.endX = self.endY = 0;
            
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
        
        
        // Accessors ///////////////////////////////////////////////////////////
        setStartX: function(v) {setAndRedraw(this, 'startX', v);},
        setStartY: function(v) {setAndRedraw(this, 'startY', v);},
        setEndX: function(v) {setAndRedraw(this, 'endX', v);},
        setEndY: function(v) {setAndRedraw(this, 'endY', v);},
        
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
        
        
        // Methods /////////////////////////////////////////////////////////////
        /** Sets all four endpoint coordinates at once. Preferable to four individual setter calls 
            while dragging since it results in a single redraw.
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
                const style = self.style ?? self.parent?.defaultStyle ?? DEFAULT_STYLE,
                    layers = isArray(style) ? style : [style],
                    styles = layers.map(layer => ({...DEFAULT_STYLE, ...layer})),
                    stylesLen = styles.length;
                
                // Sync the number of path elements with the number of styles.
                while (paths.length < stylesLen) paths.push(makeSVG('path', self.__g));
                while (paths.length > stylesLen) paths.pop().remove();
                
                for (let i = 0; i < stylesLen; i++) {
                    // Apply style
                    const style = styles[i],
                        pathElem = paths[i],
                        {dash, opacity} = style;
                    setAttr(pathElem, 'fill', 'none');
                    setAttr(pathElem, 'stroke', style.color);
                    setAttr(pathElem, 'stroke-width', style.thickness);
                    setAttr(pathElem, 'stroke-linecap', style.cap);
                    setAttr(pathElem, 'stroke-linejoin', style.join);
                    setAttr(pathElem, 'stroke-opacity', opacity === 1 ? null : opacity);
                    setAttr(pathElem, 'stroke-dasharray', dash == null ? null : (isArray(dash) ? dash.join(' ') : dash));
                    setAttr(pathElem, 'stroke-dashoffset', style.dashOffset || null);
                    
                    setAttr(pathElem, 'd', makePathData(self, style));
                }
            }
        }
    });
    
    /** A view that draws myt.Splines into a single svg element.
        
        Attributes:
            defaultStyle:object|array The style used to draw any Spline that does not define a 
                style of its own.
        
        Private Attributes:
            __splinesById:object A map of the Splines in this SplineBox by splineId.
        
        @class */
    pkg.SplineBox = new JSClass('SplineBox', pkg.SVG, {
        // Life Cycle //////////////////////////////////////////////////////////
        /** @overrides myt.View */
        initNode: function(parent, attrs) {
            this.__splinesById = {};
            
            this.callSuper(parent, attrs);
        },
        
        
        // Accessors ///////////////////////////////////////////////////////////
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
        
        
        // Methods /////////////////////////////////////////////////////////////
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
            @param {number|!Object} startX - The x position of the start of the line. Alternately 
                an myt.Spline or a map of Spline attributes.
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
                    console.warn('Replacing spline with duplicate id', attrs.splineId);
                    existing.destroy();
                }
                
                return new Spline(this, attrs);
            }
        },
        
        /** Removes a Spline from this SplineBox without destroying it. The Spline can be added to 
            another SplineBox afterward.
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
        }
    });
})(myt);

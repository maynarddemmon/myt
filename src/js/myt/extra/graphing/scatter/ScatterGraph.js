/** A graph of points.
    
    Attributes:
        allowSelection:boolean If true selecting graph points is allowed.
            Defaults to true.
        scaleDataX:number The number of pixels per data unit in the x-axis.
        scaleDataY:number The number of pixels per data unit in the y-axis.
        originX:number The origin of the graph in pixels along the x-axis.
        originY:number The origin of the graph in pixels along the y-axis.
        data:array An array of myt.ScatterGraphPoints this graph is displaying.
        _animating:array An array of myt.ScatterGraphPoints this graph is
            displaying and that are currently animating.
        filter:function a filter function that reduces what gets drawn. The 
            function should be of the form function(point, graph) and return 
            true if the point should not be drawn or false if the point
            should be drawn.
*/
// TODO: Replace scale and origin with just the conversion functions.
myt.ScatterGraph = new JS.Class('ScatterGraph', myt.Canvas, {
    include: [myt.SelectionManager],
    
    
    // Class Methods and Attributes ////////////////////////////////////////////
    extend: {
        createCircleTemplate: function(radius, color, opacity, strokeWidth, strokeColor, strokeOpacity) {
            const strokeWidth = strokeWidth == null ? 0 : strokeWidth,
                center = radius + strokeWidth + 1, // 1 is extra space for antialiasing
                offscreen = new myt.Canvas(myt.global.roots.getRoots()[0], {
                    width:2 * center, height:2 * center, visible:false
                });
            
            offscreen.beginPath();
            offscreen.circle(center, center, radius);
            offscreen.closePath();
            offscreen.setFillStyle(color);
            offscreen.setGlobalAlpha(opacity == null ? 1 : opacity);
            offscreen.fill();
            
            if (strokeWidth > 0) {
                offscreen.setGlobalAlpha(strokeOpacity == null ? 1 : strokeOpacity);
                offscreen.setStrokeStyle(strokeColor == null ? color : strokeColor);
                offscreen.setLineWidth(strokeWidth);
                offscreen.stroke();
            }
            
            const retval = offscreen.__canvas;
            retval.centerX = retval.centerY = center;
            
            offscreen.destroy();
            return retval;
        },
        
        convertXPixelToValue: function(px, graph) {return (px - graph.originX) / graph.scaleDataX;},
        convertYPixelToValue: function(py, graph) {return (py - graph.originY) / graph.scaleDataY;},
        
        convertXValueToPixel: function(x, graph) {return Math.round((x * graph.scaleDataX) + graph.originX);},
        convertYValueToPixel: function(y, graph) {return Math.round((y * graph.scaleDataY) + graph.originY);},
        
        /** A filter to prevent drawing points outside the bounds of
            the scatter graph. */
        BASE_FILTER: function(p, graph) {
            return p.px < 0 || p.px > graph.width || p.py < 0 || p.py > graph.height;
        }
    },
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    initNode: function(parent, attrs) {
        const self = this,
            SG = myt.ScatterGraph;
        
        self._pointTemplates = {};
        self._animating = [];
        self._maxTemplateSizeSquared = 0;
        
        self.drawnCount = self.drawnAnimatingCount = self.drawnCountTotal = 0;
        
        if (attrs.data == null) attrs.data = [];
        
        if (attrs.scaleDataX == null) attrs.scaleDataX = 1;
        if (attrs.scaleDataY == null) attrs.scaleDataY = 1;
        if (attrs.originX == null) attrs.originX = 0;
        if (attrs.originY == null) attrs.originY = 0;
        
        if (attrs.xConversionFuncPxToV == null) attrs.xConversionFuncPxToV = SG.convertXPixelToValue;
        if (attrs.yConversionFuncPxToV == null) attrs.yConversionFuncPxToV = SG.convertYPixelToValue;
        if (attrs.xConversionFuncVToPx == null) attrs.xConversionFuncVToPx = SG.convertXValueToPixel;
        if (attrs.yConversionFuncVToPx == null) attrs.yConversionFuncVToPx = SG.convertYValueToPixel;
        
        if (attrs.highlightColor == null) attrs.highlightColor = '#000';
        if (attrs.highlightSelectedColor == null) attrs.highlightSelectedColor = '#000';
        if (attrs.highlightWidth == null) attrs.highlightWidth = 1;
        if (attrs.highlightOffset == null) attrs.highlightOffset = 2;
        
        if (attrs.allowSelection == null) attrs.allowSelection = true;
        
        self.callSuper(parent, attrs);
        
        self.redrawPointsDelayed = myt.debounce(self.redrawPoints);
        self.redrawAnimatingPointsDelayed = myt.debounce(self.redrawAnimatingPoints);
        
        const w = self.width, 
            h = self.height, 
            al = self.animationLayer, 
            hl = self.highlightLayer;
        al.setWidth(w);
        hl.setWidth(w);
        al.setHeight(h);
        hl.setHeight(h);
        
        self.redrawPointsDelayed();
        self.redrawAnimatingPointsDelayed();
        
        self.attachToDom(self, '_doMouseMove', 'mousemove');
    },
    
    doBeforeAdoption: function() {
        this.callSuper();
        
        new myt.Canvas(this, {name:'animationLayer'});
        new myt.Canvas(this, {name:'highlightLayer'});
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    /** @overrides myt.View */
    setWidth: function(v) {
        this.callSuper(v);
        
        if (this.inited) {
            this.animationLayer.setWidth(v);
            this.highlightLayer.setWidth(v);
        }
    },
    
    /** @overrides myt.View */
    setHeight: function(v) {
        this.callSuper(v);
        
        if (this.inited) {
            this.animationLayer.setHeight(v);
            this.highlightLayer.setHeight(v);
        }
    },
    
    setAllowSelection: function(v) {
        if (this.allowSelection !== v) {
            this.allowSelection = v;
            if (this.inited) this.fireEvent('allowSelection', v);
            
            if (v) {
                this.attachToDom(this, '_doClick', 'click');
            } else {
                if (this.inited) this.detachFromDom(this, '_doClick', 'click');
            }
        }
    },
    
    setXConversionFuncPxToV: function(v) {this.xConversionFuncPxToV = v},
    setYConversionFuncPxToV: function(v) {this.yConversionFuncPxToV = v},
    setXConversionFuncVToPx: function(v) {this.xConversionFuncVToPx = v},
    setYConversionFuncVToPx: function(v) {this.yConversionFuncVToPx = v},
    
    setScaleDataX: function(v) {this._s('scaleDataX', v);},
    setScaleDataY: function(v) {this._s('scaleDataY', v);},
    setOriginX: function(v) {this._s('originX', v);},
    setOriginY: function(v) {this._s('originY', v);},
    
    /** @private */
    _s: function(attrName, v) {
        if (this[attrName] !== v) {
            this[attrName] = v;
            if (this.inited) {
                this.fireEvent(attrName, v);
                this.redrawPointsDelayed();
                this.redrawAnimatingPointsDelayed();
            }
        }
    },
    
    setScaleAndOrigin: function(scaleDataX, scaleDataY, originX, originY) {
        const self = this;
        let changed = false;
        
        if (self.scaleDataX !== scaleDataX) {
            self.scaleDataX = scaleDataX;
            changed = true;
        }
        if (self.scaleDataY !== scaleDataY) {
            self.scaleDataY = scaleDataY;
            changed = true;
        }
        if (self.originX !== originX) {
            self.originX = originX;
            changed = true;
        }
        if (self.originY !== originY) {
            self.originY = originY;
            changed = true;
        }
        
        if (changed) {
            self.redrawPoints();
            self.redrawAnimatingPoints();
        }
    },
    
    setData: function(v) {
        this.data = v;
        this._kdtree = v ? new myt.KDTree(v, myt.KDTree.EUCLIDEAN_METRIC, ["x", "y"]) : null;
        if (this.inited) this.redrawPointsDelayed();
    },
    
    setAnimating: function(v) {
        if (this.animating === v) return;
        this.animating = v;
        if (this.inited) {
            if (v) {
                this.attachTo(myt.global.idle, '__animate', 'idle');
            } else {
                this.detachFrom(myt.global.idle, '__animate', 'idle');
            }
        }
    },
    
    setHighlightedPoint: function(v) {
        if (this.highlightedPoint === v) return;
        this.highlightedPoint = v;
        if (this.inited) {
            this.fireEvent('highlightedPoint', v);
            this.drawHighlightedPoint();
        }
    },
    
    setHighlightColor: function(v) {this.highlightColor = v;},
    setHighlightSelectedColor: function(v) {this.highlightSelectedColor = v;},
    setHighlightWidth: function(v) {this.highlightWidth = v;},
    setHighlightOffset: function(v) {this.highlightOffset = v;},
    
    setFilter: function(func) {
        this.filter = func;
        if (this.inited) {
            this.redrawPointsDelayed();
            this.redrawAnimatingPointsDelayed();
        }
    },
    
    setDrawnCount: function(v) {
        this.drawnCount = v;
        this.setDrawnCountTotal(v + this.drawnAnimatingCount);
    },
    
    setDrawnAnimatingCount: function(v) {
        this.drawnAnimatingCount = v;
        this.setDrawnCountTotal(v + this.drawnCount);
    },
    
    setDrawnCountTotal: function(v) {this.set('drawnCountTotal', v, true);},
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** @overrides myt.SelectionManager */
    getManagedItems: function() {
        return this.data.concat(this.animating);
    },
    
    getMinX: function() {return this.convertXPixelToValue(0);},
    getMinY: function() {return this.convertYPixelToValue(0);},
    getMaxX: function() {return this.convertXPixelToValue(this.width);},
    getMaxY: function() {return this.convertYPixelToValue(this.height);},
    
    /** @private
        @param {!Object} event
        @returns {void} */
    _doClick: function(event) {
        const hp = this.highlightedPoint, 
            isToggle = this.isToggleMode(), 
            isAdd = this.isAddMode();
        if (hp) {
            if (isToggle) {
                hp.selected ? this.deselect(hp) : this.select(hp);
            } else if (isAdd) {
                this.select(hp);
            } else {
                this.deselectAll();
                this.select(hp);
            }
            
            this.redrawPointsDelayed();
            this.redrawAnimatingPointsDelayed();
        } else if (this.selectedCount > 0 && !isToggle && !isAdd) {
            this.deselectAll();
            this.redrawPointsDelayed();
            this.redrawAnimatingPointsDelayed();
        }
        return true;
    },
    
    // Hit testing
    /** @private
        @param {!Object} event
        @returns {void} */
    _doMouseMove: function(event) {
        const pos = myt.MouseObservable.getMouseFromEventRelativeToView(event, this);
        pos.x = this.convertXPixelToValue(pos.x);
        pos.y = this.convertYPixelToValue(pos.y);
        const maxSize = this._maxTemplateSizeSquared / this.scaleDataX; // FIXME: assumes uniform scale
        
        const nearest = this.nearest(pos, 1000, maxSize);
        
        // Filter down to list that we're actually inside
        const len = nearest.length, 
            BASE_FILTER = myt.ScatterGraph.BASE_FILTER;
        let i = len, 
            item, 
            point, 
            distance, 
            template, 
            templateSize,
            smallestRadius = 0;
        while (i) {
            item = nearest[--i];
            point = item[0];
            distance = item[1];
            template = point.getTemplate(this);
            templateSize = Math.max(template.centerX, template.centerY) / this.scaleDataX;
            if (distance > (templateSize * templateSize) ||
                BASE_FILTER(point, this) || (this.filter && this.filter(point, this))
            ) {
                nearest.splice(i, 1);
            } else {
                smallestRadius = smallestRadius === 0 ? templateSize : Math.min(smallestRadius, templateSize);
            }
        }
        
        // Filter down to smallest radius
        i = nearest.length;
        while (i) {
            item = nearest[--i];
            point = item[0];
            template = point.getTemplate(this);
            templateSize = Math.max(template.centerX, template.centerY) / this.scaleDataX;
            if (templateSize !== smallestRadius) nearest.splice(i, 1);
        }
        
        // Take closest
        let nearestPoint;
        if (nearest.length > 0) {
            nearest.sort(function(a,b) {return a[1] - b[1];});
            nearestPoint = nearest[0][0];
        }
        this.setHighlightedPoint(nearestPoint);
        
        return true;
    },
    
    nearest: function(point, count, maxDistance) {
        if (this._kdtree) {
            return this._kdtree.nearest(point, count, maxDistance);
        } else {
            return null;
        }
    },
    
    drawHighlightedPoint: function() {
        const layer = this.highlightLayer, 
            hp = this.highlightedPoint;
        layer.clear();
        if (hp) {
            if (myt.ScatterGraph.BASE_FILTER(hp, this) || (this.filter && this.filter(hp, this))) return;
            
            const template = hp.getTemplate(this);
            layer.beginPath();
            layer.circle(hp.px, hp.py, template.centerX + this.highlightOffset);
            layer.closePath();
            layer.setLineWidth(this.highlightWidth);
            layer.setStrokeStyle(hp.selected ? this.highlightSelectedColor : this.highlightColor);
            layer.stroke();
        }
    },
    
    // Data
    /** Adds a single myt.ScatterGraphPoint
        @param dataPoint:myt.ScatterGraphPoint the point to add.
        @returns {void} */
    addDataPoint: function(dataPoint) {
        this.data.push(dataPoint);
        this._kdtree.insert(dataPoint);
        this.drawPoint(dataPoint);
    },
    
    /** Adds multiple data points.
        @param dataPoints:array of myt.ScatterGraphPoint
        @returns {void} */
    addDataPoints: function(dataPoints) {
        this.data = this.data.concat(dataPoints);
        this.drawPoints(dataPoints);
        if (!this._lockRebuild) this._kdtree.rebuildTree(this.data);
    },
    
    // Get points
    /** Gets one or more myt.ScatterGraphPoints that match the provided
        matcher function which are not currently animating.
        @param matchFunc:function the match function to use.
        @param multiple:boolean (optional) indicates if only the first point 
            found or all points found should be returned. Defaults to false.
        @returns a single point or an array of points. */
    getDataPoint: function(matchFunc, multiple) {
        return this._getDataPoint(this.data, matchFunc, multiple);
    },
    
    /** Gets one or more myt.ScatterGraphPoints that match the provided
        matcher function which are currently animating.
        @param matchFunc:function the match function to use.
        @param multiple:boolean (optional) indicates if only the first point 
            found or all points found should be returned. Defaults to false.
        @returns a single point or an array of points. */
    getAnimatingDataPoint: function(matchFunc, multiple) {
        return this._getDataPoint(this._animating, matchFunc, multiple);
    },
    
    /** Gets all data points that match the provided match function.
        @param matchFunc:function (optional) A function that filters the
            returned points.
        @param invert:boolean (optional) If true the points that don't match
            will be returned.
        @returns array */
    getAllDataPoints: function(matchFunc, invert) {
        const retval = [];
        
        if (matchFunc) {
            const data = this.data;
            let i = data.length, 
                dataPoint;
            while (i) {
                dataPoint = data[--i];
                if (matchFunc.call(this, dataPoint, i) === !invert) retval.push(dataPoint);
            }
            
            data = this._animating;
            i = data.length;
            
            while (i) {
                dataPoint = data[--i];
                if (matchFunc.call(this, dataPoint, i) === !invert) retval.push(dataPoint);
            }
        } else {
            retval = this.data.concat(this._animating);
        }
        
        return retval;
    },
    
    _getDataPoint: function(data, matchFunc, multiple) {
        const retval = [];
        let i = data.length, 
            dataPoint;
        while (i) {
            dataPoint = data[--i];
            if (matchFunc.call(this, dataPoint, i)) {
                if (!multiple) return dataPoint;
                retval.push(dataPoint);
            }
        }
        
        if (retval.length === 0) return null;
        return retval;
    },
    
    /** Gets an myt.ScatterGraphPoint with the matching ID.
        @param id:string the id to match.
        @param type:string (optional) indicates if 'animating', 'still' or 
            'both' types of points should be searched. Defaults to 'both'.
        @returns the data point or null if not found. */
    getDataPointById: function(id, type) {
        return this._getDataPointsBy(function(p, i) {return p.id === id;}, type);
    },
    
    _getDataPointsBy: function(func, type, multiple) {
        if (type === 'animating') {
            return this.getDataPoint(func, multiple);
        } else if (type === 'still') {
            return this.getAnimatingDataPoint(func, multiple);
        } else {
            // Check both
            if (multiple) {
                return this._getDataPoint(this.getAllDataPoints(), func, true);
            } else {
                return this.getDataPoint(func, multiple) || this.getAnimatingDataPoint(func, multiple);
            }
        }
    },
    
    getDataPointsInsideCircle: function(centerX, centerY, radius, isLatLng, points) {
        let func = myt.Geometry[isLatLng ? 'circleContainsLatLng' : 'circleContainsPoint'];
        func = func.bind(myt.Geometry);
        
        if (!points) points = this.getAllDataPoints();
        
        return this._getDataPoint(points, function(p, i) {
            return func(p.y, p.x, centerY, centerX, radius);
        }, true);
    },
    
    /** @param path:myt.Path */
    getDataPointsInsidePolygon: function(path, points) {
        const bounds = path.getBoundingBox(), pathData = path.vectors;
        
        if (!points) points = this.getAllDataPoints();
        
        return this._getDataPoint(points, function(p, i) {
            return myt.Geometry.isPointInPath(p.x, p.y, bounds, pathData);
        }, true);
    },
    
    // Remove points
    /** Remove all data points from this graph.
        @returns {void} */
    removeAllDataPoints: function() {
        const data = this.data;
        data.length = 0;
        this._animating.length = 0;
        this._kdtree.rebuildTree(data);
        
        this.setHighlightedPoint(null);
        this.deselectAll();
        this.redrawPoints(true);
        this.redrawAnimatingPoints(true);
    },
    
    removeDataPoint: function(matchFunc, multiple) {
        const retval = this._removeDataPoint(this.data, matchFunc, multiple);
        if (retval) this.redrawPoints(true);
        return retval;
    },
    
    removeAnimatingDataPoint: function(matchFunc, multiple) {
        const retval = this._removeDataPoint(this._animating, matchFunc, multiple);
        if (retval) this.redrawAnimatingPoints(true);
        return retval;
    },
    
    /** Removes one or more myt.ScatterGraphPoint that the provided matcher
        function returns true for.
        @param data:array the data to search on.
        @param matchFunc:function
        @param multiple:boolean (optional) If true all matching points will
            be removed.
        @returns the removed point or null if not found. If multiple is true
            an array of removed mytScatterGraphPoints will be returned. */
    _removeDataPoint: function(data, matchFunc, multiple) {
        const retval = [];
        let i = data.length,
            dataPoint;
        while (i) {
            dataPoint = data[--i];
            if (matchFunc.call(this, dataPoint, i)) {
                data.splice(i, 1);
                
                if (!this._lockRebuild && this.data === data) this._kdtree.rebuildTree(this.data);
                
                if (this.highlightedPoint === dataPoint) this.setHighlightedPoint(null);
                if (!multiple) return dataPoint;
                retval.push(dataPoint);
            }
        }
        
        return retval.length === 0 ? null : retval;
    },
    
    removeDataPointById: function(id, type) {
        return this._removeDataPointBy(function(p, i) {return p.id === id;}, type);
    },
    
    /** Removes a list of data points that match the provided list of IDs.
        Both still and animating points will be removed if they match.
        @param idList:array an array of IDs to remove.
        @returns {void} */
    removeDataPointsById: function(idList) {
        let i = idList.length, 
            id, 
            func, 
            atLeastOneRemoval = false, 
            atLeastOneAnimatingRemoval = false;
        
        this._lockDraw = this._lockRebuild = true;
        while (i) {
            id = idList[--i];
            func = function(p, i) {return p.id === id;};
            
            if (this.removeDataPoint(func)) {
                atLeastOneRemoval = true;
            } else if (this.removeAnimatingDataPoint(func)) {
                atLeastOneAnimatingRemoval = true;
            }
        }
        this._lockDraw = this._lockRebuild = false;
        
        if (atLeastOneRemoval) {
            this.redrawPoints(true);
            this._kdtree.rebuildTree(this.data);
        }
        if (atLeastOneAnimatingRemoval) {
            this.redrawAnimatingPoints(true);
        }
    },
    
    removeDataPointByIndex: function(idx, type) {
        return this._removeDataPointBy(function(p, i) {return i === idx;}, type);
    },
    
    removeDataPointByEquality: function(point, type) {
        return this._removeDataPointBy(function(p, i) {return p === point;}, type);
    },
    
    _removeDataPointBy: function(func, type) {
        if (type === 'animating') {
            return this.removeDataPoint(func);
        } else if (type === 'still') {
            return this.removeAnimatingDataPoint(func);
        } else {
            // Check both
            return this.removeDataPoint(func) || this.removeAnimatingDataPoint(func);
        }
    },
    
    removeDataPointInsideBounds: function(x, y, w, h, includeBounds) {
        return this.removeDataPoint(function(p, i) {
            if (includeBounds) {
                return (p.x >= x) && (p.x <= x + w) && (p.y >= y) && (p.y <= y + h);
            } else {
                return (p.x > x) && (p.x < x + w) && (p.y > y) && (p.y < y + h);
            }
        }, true);
    },
    
    removeDataPointOutsideBounds: function(x, y, w, h, includeBounds) {
        return this.removeDataPoint(function(p, i) {
            if (includeBounds) {
                return (p.x <= x) || (p.x >= x + w) || (p.y <= y) || (p.y >= y + h);
            } else {
                return (p.x < x) || (p.x > x + w) || (p.y < y) || (p.y > y + h);
            }
        }, true);
    },
    
    // Drawing Templates
    /** Adds an image data object to use as a template for a point.
        @param key:string the key to store the template under.
        @param template:object the template for a point.
        @returns {void} */
    addPointTemplate: function(key, template) {
        this._pointTemplates[key] = template;
        this._recalcMaxTemplateSizeSquared();
    },
    
    /** Gets a point template.
        @param key:string the key to get.
        @returns image data object or undefined if not found. */
    getPointTemplate: function(key) {
        return this._pointTemplates[key];
    },
    
    /** Removes a point template.
        @param key:string the key to remove.
        @returns image data object or undefined if not found. */
    removePointTemplate: function(key) {
        const retval = this._pointTemplates[key];
        delete this._pointTemplates[key];
        this._recalcMaxTemplateSizeSquared();
        return retval;
    },
    
    _recalcMaxTemplateSizeSquared: function() {
        const templates = this._pointTemplates;
        let v = 0, 
            key, 
            template;
        
        for (key in templates) {
            template = templates[key];
            v = Math.max(v, Math.max(template.centerX, template.centerY));
        }
        
        this._maxTemplateSizeSquared = v * v;
    },
    
    // Value Conversion
    convertXPixelToValue: function(px) {return this.xConversionFuncPxToV(px, this);},
    convertYPixelToValue: function(py) {return this.yConversionFuncPxToV(py, this);},
    
    convertXValueToPixel: function(x) {return this.xConversionFuncVToPx(x, this);},
    convertYValueToPixel: function(y) {return this.yConversionFuncVToPx(y, this);},
    
    /** Modifies the provided point so the value is in pixels.
        @param p:object with a x and y properties each of which is a number.
        @returns void */
    convertPointToPixels: function(p) {
        p.setPx(this.convertXValueToPixel(p.x));
        p.setPy(this.convertYValueToPixel(p.y));
    },
    
    /** Modifies the provided array of points so the value is in pixels.
        @param points:array an array of object with a x and y properties each 
            of which is a number.
        @returns void */
    convertPointsToPixels: function(points) {
        let i = points.length;
        while (i) this.convertPointToPixels(points[--i]);
    },
    
    // Drawing
    drawPoint: function(p, context, skipConversion) {
        if (!this._lockDraw) {
            if (!context) context = this.__ctx;
            if (!skipConversion) this.convertPointToPixels(p);
            
            if (myt.ScatterGraph.BASE_FILTER(p, this) || (this.filter && this.filter(p, this))) return;
            
            const template = p.getTemplate(this);
            context.drawImage(template, p.px - template.centerX, p.py - template.centerY);
        }
    },
    
    drawPoints: function(data, context, skipConversion) {
        let drawnCount = 0;
        if (!this._lockDraw) {
            const templates = this._pointTemplates, 
                w = this.width, 
                h = this.height,
                BASE_FILTER = myt.ScatterGraph.BASE_FILTER;
            let i = data.length, 
                p, 
                template;
            if (!context) context = this.__ctx;
            
            if (!skipConversion) this.convertPointsToPixels(data);
            
            while (i) {
                p = data[--i];
                
                if (BASE_FILTER(p, this) || (this.filter && this.filter(p, this))) continue;
                
                template = p.getTemplate(this);
                context.drawImage(template, p.px - template.centerX, p.py - template.centerY);
                ++drawnCount;
            }
        }
        return drawnCount;
    },
    
    redrawPoints: function(skipConversion) {
        this.clear();
        const drawnCount = this.drawPoints(this.data, this.__ctx, skipConversion);
        this.drawHighlightedPoint();
        this.setDrawnCount(drawnCount);
    },
    
    redrawAnimatingPoints: function(skipConversion) {
        this.animationLayer.clear();
        const drawnCount = this.drawPoints(this._animating, this.animationLayer.__ctx, skipConversion);
        this.drawHighlightedPoint();
        this.setDrawnAnimatingCount(drawnCount);
    },
    
    // Animating
    animatePoints: function(triplets) {
        this._lockDraw = this._lockRebuild = true;
        
        const animatingCount = this._animating.length,
            len = triplets.length;
        let i = 0;
        if (len % 3 === 0) {
            while (len > i) this.animatePoint(triplets[i++], triplets[i++], triplets[i++]);
        }
        
        this._lockDraw = this._lockRebuild = false;
        
        this.redrawAnimatingPoints(true);
        if (this._animating.length !== animatingCount) this.redrawPoints(true);
        
        if (this._kdtree) this._kdtree.rebuildTree(this.data);
    },
    
    /** Animates the provided ScatterGraphPoint to the new x and y */
    animatePoint: function(p, x, y) {
        if (p) {
            p.prepareForAnimation(x, y);
            
            this.removeDataPointByEquality(p);
            
            // Add animating point
            this._animating.push(p);
            this.setAnimating(true);
        }
    },
    
    __animate: function(idleEvent) {
        const points = this._animating,
            delta = idleEvent.value.delta;
        let i = points.length, point;
        while (i) {
            point = points[--i];
            if (!point.updateForAnimation(delta)) {
                // Remove point since it no longer needs to animate
                points.splice(i, 1);
                this.addDataPoint(point);
            }
        }
        
        this.redrawAnimatingPoints();
        
        if (points.length === 0) this.setAnimating(false);
    },
    
    // Metrics
    countDataPoints: function(func) {
        if (func) {
            return this.getAllDataPoints(func).length;
        } else {
            return this._animating.length + this.data.length;
        }
    }
});

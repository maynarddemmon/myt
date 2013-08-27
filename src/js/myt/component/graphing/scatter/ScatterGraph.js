/** A graph of points.
    
    Attributes:
        scaleX:number The number of pixels per data unit in the x-axis.
        scaleY:number The number of pixels per data unit in the y-axis.
        originX:number The origin of the graph in pixels along the x-axis.
        originY:number The origin of the graph in pixels along the y-axis.
        data:array An array of myt.ScatterGraphPoints this graph is displaying.
        _animating:array An array of myt.ScatterGraphPoints this graph is
            displaying and that are currently animating.
*/
// TODO: mouseclick to "select" a point.
// TODO: Polygon bounds testing
// TODO: Replace scale and origin with just the conversion functions.
myt.ScatterGraph = new JS.Class('ScatterGraph', myt.Canvas, {
    // Class Methods and Attributes ////////////////////////////////////////////
    extend: {
        createCircleTemplate: function(radius, color, opacity, strokeWidth, strokeColor, strokeOpacity) {
            var strokeWidth = strokeWidth == null ? 0 : strokeWidth,
                center = radius + strokeWidth + 1,
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
            
            var retval = offscreen.__canvas;
            retval.centerX = retval.centerY = center;
            
            offscreen.destroy();
            return retval;
        },
        
        convertXPixelToValue: function(px, graph) {return (px - graph.originX) / graph.scaleX;},
        convertYPixelToValue: function(py, graph) {return (py - graph.originY) / graph.scaleY;},
        
        convertXValueToPixel: function(x, graph) {return Math.round((x * graph.scaleX) + graph.originX);},
        convertYValueToPixel: function(y, graph) {return Math.round((y * graph.scaleY) + graph.originY);}
    },
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    initNode: function(parent, attrs) {
        this._pointTemplates = {};
        this._animating = [];
        this._maxTemplateSizeSquared = 0;
        
        if (attrs.data === undefined) attrs.data = [];
        
        if (attrs.scaleX === undefined) attrs.scaleX = 1;
        if (attrs.scaleY === undefined) attrs.scaleY = 1;
        if (attrs.originX === undefined) attrs.originX = 0;
        if (attrs.originY === undefined) attrs.originY = 0;
        
        var SG = myt.ScatterGraph;
        if (attrs.xConversionFuncPxToV === undefined) attrs.xConversionFuncPxToV = SG.convertXPixelToValue;
        if (attrs.yConversionFuncPxToV === undefined) attrs.yConversionFuncPxToV = SG.convertYPixelToValue;
        if (attrs.xConversionFuncVToPx === undefined) attrs.xConversionFuncVToPx = SG.convertXValueToPixel;
        if (attrs.yConversionFuncVToPx === undefined) attrs.yConversionFuncVToPx = SG.convertYValueToPixel;
        
        this.callSuper(parent, attrs);
        
        this.redrawPointsDelayed();
        this.redrawAnimatingPointsDelayed();
        
        this.attachToDom(this, '_doMouseMove', 'mousemove');
    },
    
    doBeforeAdoption: function() {
        this.callSuper();
        
        new myt.Canvas(this, {
            name:'animationLayer', percentOfParentWidth:100, percentOfParentHeight:100
        }, [myt.SizeToParent])
        
        new myt.Canvas(this, {
            name:'highlightLayer', percentOfParentWidth:100, percentOfParentHeight:100
        }, [myt.SizeToParent])
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setXConversionFuncPxToV: function(v) {this.xConversionFuncPxToV = v},
    setYConversionFuncPxToV: function(v) {this.yConversionFuncPxToV = v},
    setXConversionFuncVToPx: function(v) {this.xConversionFuncVToPx = v},
    setYConversionFuncVToPx: function(v) {this.yConversionFuncVToPx = v},
    
    setScaleX: function(v) {
        if (this.scaleX === v) return;
        this.scaleX = v;
        if (this.inited) {
            this.fireNewEvent('scaleX', v);
            this.redrawPointsDelayed();
            this.redrawAnimatingPointsDelayed();
        }
    },
    
    setScaleY: function(v) {
        if (this.scaleY === v) return;
        this.scaleY = v;
        if (this.inited) {
            this.fireNewEvent('scaleY', v);
            this.redrawPointsDelayed();
            this.redrawAnimatingPointsDelayed();
        }
    },
    
    setOriginX: function(v) {
        if (this.originX === v) return;
        this.originX = v;
        if (this.inited) {
            this.fireNewEvent('originX', v);
            this.redrawPointsDelayed();
            this.redrawAnimatingPointsDelayed();
        }
    },
    
    setOriginY: function(v) {
        if (this.originY === v) return;
        this.originY = v;
        if (this.inited) {
            this.fireNewEvent('originY', v);
            this.redrawPointsDelayed();
            this.redrawAnimatingPointsDelayed();
        }
    },
    
    setScaleAndOrigin: function(scaleX, scaleY, originX, originY) {
        var changed = false;
        
        if (this.scaleX !== scaleX) {
            this.scaleX = scaleX;
            changed = true;
        }
        if (this.scaleY !== scaleY) {
            this.scaleY = scaleY;
            changed = true;
        }
        if (this.originX !== originX) {
            this.originX = originX;
            changed = true;
        }
        if (this.originY !== originY) {
            this.originY = originY;
            changed = true;
        }
        
        if (changed) {
            this.redrawPoints();
            this.redrawAnimatingPoints();
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
            this.fireNewEvent('highlightedPoint', v);
            this.drawHighlightedPoint();
        }
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    getMinX: function() {return this.convertXPixelToValue(0);},
    getMinY: function() {return this.convertYPixelToValue(0);},
    getMaxX: function() {return this.convertXPixelToValue(this.width);},
    getMaxY: function() {return this.convertYPixelToValue(this.height);},
    
    // Hit testing
    _doMouseMove: function(event) {
        var pos = myt.MouseObservable.getMouseFromEventRelativeToView(event, this);
        pos.x = this.convertXPixelToValue(pos.x);
        pos.y = this.convertYPixelToValue(pos.y);
        var maxSize = this._maxTemplateSizeSquared / this.scaleX; // FIXME: assumes uniform scale
        
        var nearest = this.nearest(pos, 1000, maxSize);
        
        // Filter down to list that we're actually inside
        var len = nearest.length, i = len, item, point, distance, template, templateSize;
        var smallestRadius = 0;
        while (i) {
            item = nearest[--i];
            point = item[0];
            distance = item[1];
            template = this._pointTemplates[point.config.templateKey];
            templateSize = Math.max(template.centerX, template.centerY) / this.scaleX;
            if (distance > (templateSize * templateSize)) {
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
            template = this._pointTemplates[point.config.templateKey];
            templateSize = Math.max(template.centerX, template.centerY) / this.scaleX;
            if (templateSize !== smallestRadius) nearest.splice(i, 1);
        }
        
        // Take closest
        var nearestPoint;
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
        var layer = this.highlightLayer, hp = this.highlightedPoint;
        layer.clear();
        if (hp) {
            if ((hp.px < 0) || (hp.px > this.width) || (hp.py < 0) || (hp.py > this.height)) return;
            
            var template = this._pointTemplates[hp.config.templateKey];
            layer.beginPath();
            layer.circle(hp.px, hp.py, template.centerX + 2);
            layer.closePath();
            layer.setLineWidth(2);
            layer.setStrokeStyle('#000000');
            layer.stroke();
        }
    },
    
    // Data
    /** Adds a single myt.ScatterGraphPoint
        @returns void */
    addDataPoint: function(dataPoint) {
        this.data.push(dataPoint);
        this._kdtree.insert(dataPoint);
        this.drawPoint(dataPoint);
    },
    
    addDataPoints: function(dataPoints) {
        this.data = this.data.concat(dataPoints);
        this.drawPoints(dataPoints);
        if (!this._lockRebuild) this._kdtree.rebuildTree(this.data);
    },
    
    getDataPoint: function(matchFunc, multiple) {
        return this._getDataPoint(this.data, matchFunc, multiple);
    },
    
    getAnimatingDataPoint: function(matchFunc, multiple) {
        return this._getDataPoint(this._animating, matchFunc, multiple);
    },
    
    _getDataPoint: function(data, matchFunc, multiple) {
        var i = data.length, dataPoint, retval = [];
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
    
    getDataPointById: function(id, type) {
        return this._getDataPointBy(function(p, i) {return p.id === id;}, type);
    },
    
    _getDataPointBy: function(func, type) {
        if (type === 'animating') {
            return this.getDataPoint(func);
        } else if (type === 'still') {
            return this.getAnimatingDataPoint(func);
        } else {
            // Check both
            return this.getDataPoint(func) || this.getAnimatingDataPoint(func);
        }
    },
    
    removeDataPoint: function(matchFunc, multiple) {
        var retval = this._removeDataPoint(this.data, matchFunc, multiple);
        if (retval) this.redrawPoints(true);
        return retval;
    },
    
    removeAnimatingDataPoint: function(matchFunc, multiple) {
        var retval = this._removeDataPoint(this._animating, matchFunc, multiple);
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
        var i = data.length, dataPoint, retval = [];
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
        @returns void */
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
        var retval = this._pointTemplates[key];
        delete this._pointTemplates[key];
        this._recalcMaxTemplateSizeSquared();
        return retval;
    },
    
    _recalcMaxTemplateSizeSquared: function() {
        var v = 0, key, templates = this._pointTemplates, template;
        
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
        @return void */
    convertPointToPixels: function(p) {
        p.setPx(this.convertXValueToPixel(p.x));
        p.setPy(this.convertYValueToPixel(p.y));
    },
    
    /** Modifies the provided array of points so the value is in pixels.
        @param points:array an array of object with a x and y properties each 
            of which is a number.
        @return void */
    convertPointsToPixels: function(points) {
        var i = points.length;
        while (i) this.convertPointToPixels(points[--i]);
    },
    
    // Drawing
    drawPoint: function(p, context, skipConversion) {
        if (this._lockDraw) return;
        
        if (!context) context = this.__ctx;
        if (!skipConversion) this.convertPointToPixels(p);
        
        if ((p.px < 0) || (p.px > this.width) || (p.py < 0) || (p.py > this.height)) return;
        
        var template = this._pointTemplates[p.config.templateKey];
        context.drawImage(template, p.px - template.centerX, p.py - template.centerY);
    },
    
    drawPoints: function(data, context, skipConversion) {
        if (this._lockDraw) return;
        
        var i = data.length, p, templates = this._pointTemplates, template, 
            w = this.width, h = this.height;
        if (!context) context = this.__ctx;
        
        if (!skipConversion) this.convertPointsToPixels(data);
        
        while (i) {
            p = data[--i];
            
            if ((p.px < 0) || (p.px > w) || (p.py < 0) || (p.py > h)) continue;
            
            template = templates[p.config.templateKey];
            context.drawImage(template, p.px - template.centerX, p.py - template.centerY);
        }
    },
    
    redrawPoints: function(skipConversion) {
        this.clear();
        this.drawPoints(this.data, this.__ctx, skipConversion);
        
        this.drawHighlightedPoint();
    },
    
    redrawAnimatingPoints: function(skipConversion) {
        this.animationLayer.clear();
        this.drawPoints(this._animating, this.animationLayer.__ctx, skipConversion);
        
        this.drawHighlightedPoint();
    },
    
    // Animating
    animatePoints: function(triplets) {
        this._lockDraw = this._lockRebuild = true;
        
        var animatingCount = this._animating.length,
            len = triplets.length, i = 0;
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
        var points = this._animating, i = points.length, point,
            delta = idleEvent.value.delta;
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
    }
});

myt.DelayedMethodCall.createDelayedMethodCall(myt.ScatterGraph, 0, 'redrawPoints');
myt.DelayedMethodCall.createDelayedMethodCall(myt.ScatterGraph, 0, 'redrawAnimatingPoints');

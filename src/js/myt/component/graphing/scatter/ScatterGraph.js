/** A graph of points.
    
    Attributes:
        scaleX:number The number of pixels per data unit in the x-axis.
        scaleY:number The number of pixels per data unit in the y-axis.
        originX:number The origin of the graph in pixels along the x-axis.
        originY:number The origin of the graph in pixels along the y-axis.
*/
myt.ScatterGraph = new JS.Class('ScatterGraph', myt.Canvas, {
    // Class Methods and Attributes ////////////////////////////////////////////
    extend: {
        createCircleTemplate: function(radius, color, opacity, strokeWidth, strokeColor, strokeOpacity) {
            var twiceRadius = radius * 2,
                strokeWidth = strokeWidth == null ? 0 : strokeWidth,
                x = radius + strokeWidth, 
                y = radius + strokeWidth,
                size = twiceRadius + 2 * strokeWidth,
                rootView = myt.global.roots.getRoots()[0],
                offscreen = new myt.Canvas(rootView, {width:size, height:size, visible:false});
            
            offscreen.beginPath();
            offscreen.circle(x, y, radius);
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
            retval.centerX = radius;
            retval.centerY = radius;
            
            offscreen.destroy();
            return retval;
        }
    },
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    initNode: function(parent, attrs) {
        this._pointTemplates = {};
        
        if (attrs.scaleX === undefined) attrs.scaleX = 1;
        if (attrs.scaleY === undefined) attrs.scaleY = 1;
        if (attrs.originX === undefined) attrs.originX = 0;
        if (attrs.originY === undefined) attrs.originY = 0;
        
        this.callSuper(parent, attrs);
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setScaleX: function(v) {
        if (this.scaleX === v) return;
        this.scaleX = v;
        if (this.inited) this.fireNewEvent('scaleX', v);
    },
    
    setScaleY: function(v) {
        if (this.scaleY === v) return;
        this.scaleY = v;
        if (this.inited) this.fireNewEvent('scaleY', v);
    },
    
    setOriginX: function(v) {
        if (this.originX === v) return;
        this.originX = v;
        if (this.inited) this.fireNewEvent('originX', v);
    },
    
    setOriginY: function(v) {
        if (this.originY === v) return;
        this.originY = v;
        if (this.inited) this.fireNewEvent('originY', v);
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** Adds an image data object to use as a template for a point.
        @param key:string the key to store the template under.
        @param template:object the template for a point.
        @returns void */
    addPointTemplate: function(key, template) {
        this._pointTemplates[key] = template;
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
        return retval;
    },
    
    getMinX: function() {return this.convertXPixelToValue(0);},
    getMinY: function() {return this.convertYPixelToValue(0);},
    getMaxX: function() {return this.convertXPixelToValue(this.width);},
    getMaxY: function() {return this.convertYPixelToValue(this.height);},
    
    convertXPixelToValue: function(px) {return (px - this.originX) / this.scaleX;},
    convertYPixelToValue: function(py) {return (py - this.originY) / this.scaleY;},
    
    convertXValueToPixel: function(x) {return (x * this.scaleX) + this.originX;},
    convertYValueToPixel: function(y) {return (y * this.scaleY) + this.originY;},
    
    /** Modifies the provided point so the value is in pixels.
        @param p:object with a x and y properties each of which is a number.
        @return void */
    convertPointToPixels: function(p) {
        p.px = this.convertXValueToPixel(p.x);
        p.py = this.convertYValueToPixel(p.y);
    },
    
    /** Modifies the provided array of points so the value is in pixels.
        @param points:array an array of object with a x and y properties each 
            of which is a number.
        @return void */
    convertPointsToPixels: function(points) {
        var i = points.length, p, 
            scaleX = this.scaleX, scaleY = this.scaleY
            originX = this.originX, originY = this.originY;
        while (i) {
            p = points[--i];
            p.px = (p.x * scaleX) + originX;
            p.py = (p.y * scaleY) + originY;
        }
    },
    
    drawPoint: function(p, skipConversion) {
        if (!skipConversion) this.convertPointToPixels(p);
        
        var template = this._pointTemplates[p.config.key];
        this.__ctx.drawImage(template, p.px - template.centerX, p.py - template.centerY);
    },
    
    drawPoints: function(data, skipConversion) {
        var i = data.length, p, templates = this._pointTemplates, template
            ctx = this.__ctx;
        
        if (!skipConversion) this.convertPointsToPixels(data);
        
        while (i) {
            p = data[--i];
            template = templates[p.config.key];
            ctx.drawImage(template, p.px - template.centerX, p.py - template.centerY);
        }
    }
});

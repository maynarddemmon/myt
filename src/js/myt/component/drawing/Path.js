/** An ordered collection of points that can be applied to a canvas.
    
    Attributes:
        vectors:array The data is stored in a single array with the x coordinate
            first and the y coordinate second.
        _boundingBox:object the cached bounding box if it has been calculated.
*/
myt.Path = new JS.Class('Path', {
    // Constructor /////////////////////////////////////////////////////////////
    /** Create a new Path. */
    initialize: function(vectors) {
        this.setVectors(vectors || []);
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setVectors: function(v) {
        this._boundingBox = null;
        this.vectors = v;
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** Copy the data from the provided Path into this one.
        @param path:myt.Path
        @returns void */
    copyFrom: function(path) {
        this.vectors = path.vectors.slice();
        this._boundingBox = null;
    },
    
    /** Draws this path into the provided drawview. */
    drawInto: function(canvas) {
        canvas.beginPath();
        var vecs = this.vectors, len = vecs.length, i = 0;
        canvas.moveTo(vecs[i++], vecs[i++]);
        for (; len > i;) canvas.lineTo(vecs[i++], vecs[i++]);
        canvas.closePath();
    },
    
    /** Shift this path by the provided x and y amount. */
    translate: function(dx, dy) {
        var vecs = this.vectors, i = vecs.length;
        while (i) {
            vecs[--i] += dy;
            vecs[--i] += dx;
        }
        this._boundingBox = null;
    },
    
    /** Rotates this path around 0,0 by the provided angle in radians. */
    rotate: function(a) {
        var cosA = Math.cos(a), sinA = Math.sin(a),
            vecs = this.vectors, len = vecs.length,
            xNew, yNew, i = 0;
        for (; len > i;) {
            xNew = vecs[i] * cosA - vecs[i + 1] * sinA;
            yNew = vecs[i] * sinA + vecs[i + 1] * cosA;
            
            vecs[i++] = xNew;
            vecs[i++] = yNew;
        }
        this._boundingBox = null;
    },
    
    /** Rotates this path around the provided origin by the provided angle 
        in radians.
        @param angle:number the angle in radians
        @param xOrigin:number the x coordinate to rotate around.
        @param yOrigin:number the y coordinate to rotate around.
        @returns void */
    rotateAroundOrigin: function(angle, xOrigin, yOrigin) {
        this.translate(-xOrigin, -yOrigin);
        this.rotate(angle);
        this.translate(xOrigin, yOrigin);
    },
    
    /** Gets the bounding box for this path.
        @return object with properties x, y, width and height or null
            if no bounding box could be calculated. */
    getBoundingBox: function() {
        if (this._boundingBox) return this._boundingBox;
        
        var vecs = this.vectors, i = vecs.length, x, y, minX, maxX, minY, maxY;
        if (i >= 2) {
            minY = maxY = vecs[--i];
            minX = maxX = vecs[--i];
            while (i) {
                y = vecs[--i];
                x = vecs[--i];
                minY = Math.min(y, minY);
                maxY = Math.max(y, maxY);
                minX = Math.min(x, minX);
                maxX = Math.max(x, maxX);
            }
            return this._boundingBox = {x:minX, y:minY, width:maxX - minX, height:maxY - minY};
        }
        
        return this._boundingBox = null;
    },
    
    /** Gets the center point of the bounding box for the path.
        @returns object with properties x and y or null if no bounding box
            could be calculated. */
    getCenter: function() {
        var box = this.getBoundingBox();
        return box ? {
            x:box.x + (box.width - box.x) / 2,
            y:box.y + (box.height - box.y) / 2
        } : null;
    },
    
    /** Tests if the provided point is inside this path.
        @param x:number the x coordinate to test.
        @param y:number the y coordinate to test.
        
        Alternate params:
        @param x:object A point object with x and y properties.
        
        @return true if inside, false otherwise. */
    isPointInPath: function(x, y) {
        if (typeof x === 'object') {
            y = x.y;
            x = x.x;
        }
        return myt.Geometry.isPointInPath(x, y, this.getBoundingBox(), this.vectors);
    }
});

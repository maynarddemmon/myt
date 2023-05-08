(pkg => {
    const math = Math;
    
    /** An ordered collection of points that can be applied to a canvas.
        
        Attributes:
            vectors:array The data is stored in a single array with the x coordinate first and 
                the y coordinate second.
            _boundingBox:object the cached bounding box if it has been calculated.
        
        @class */
    pkg.Path = new JS.Class('Path', {
        // Constructor /////////////////////////////////////////////////////////
        /** Create a new Path.
            @param {?Array} vectors
            @returns {undefined} */
        initialize: function(vectors) {
            this.setVectors(vectors ?? []);
        },
        
        
        // Accessors ///////////////////////////////////////////////////////////
        setVectors: function(v) {
            this._boundingBox = null;
            this.vectors = v;
        },
        
        
        // Methods /////////////////////////////////////////////////////////////
        /** Copy the data from the provided Path into this one.
            @param {!Object} path - An myt.Path
            @returns {undefined} */
        copyFrom: function(path) {
            this.vectors = path.vectors.slice();
            this._boundingBox = null;
        },
        
        /** Draws this path into the provided drawview.
            @param {!Object} canvas
            @returns {undefined} */
        drawInto: function(canvas) {
            canvas.beginPath();
            const vecs = this.vectors;
            let len = vecs.length, 
                i = 0;
            canvas.moveTo(vecs[i++], vecs[i++]);
            for (; len > i;) canvas.lineTo(vecs[i++], vecs[i++]);
            canvas.closePath();
        },
        
        /** Shift this path by the provided x and y amount.
            @param {number} dx
            @param {number} dy
            @returns {undefined} */
        translate: function(dx, dy) {
            const vecs = this.vectors;
            let i = vecs.length;
            while (i) {
                vecs[--i] += dy;
                vecs[--i] += dx;
            }
            this._boundingBox = null;
        },
        
        /** Rotates this path around 0,0 by the provided angle in radians.
            @param {number} a
            @returns {undefined} */
        rotate: function(a) {
            const cosA = math.cos(a),
                sinA = math.sin(a),
                vecs = this.vectors,
                len = vecs.length;
            for (let i = 0; len > i;) {
                const xNew = vecs[i] * cosA - vecs[i + 1] * sinA,
                    yNew = vecs[i] * sinA + vecs[i + 1] * cosA;
                vecs[i++] = xNew;
                vecs[i++] = yNew;
            }
            this._boundingBox = null;
        },
        
        /** Rotates this path around the provided origin by the provided angle in radians.
            @param {number} angle - The angle in radians
            @param {number} xOrigin - The x coordinate to rotate around.
            @param {number} yOrigin - The y coordinate to rotate around.
            @returns {undefined} */
        rotateAroundOrigin: function(angle, xOrigin, yOrigin) {
            this.translate(-xOrigin, -yOrigin);
            this.rotate(angle);
            this.translate(xOrigin, yOrigin);
        },
        
        /** Gets the bounding box for this path.
            @return {!Object} with properties x, y, width and height or null if no bounding box 
                could be calculated. */
        getBoundingBox: function() {
            if (this._boundingBox) return this._boundingBox;
            
            const vecs = this.vectors;
            let i = vecs.length, minX, maxX, minY, maxY;
            if (i >= 2) {
                minY = maxY = vecs[--i];
                minX = maxX = vecs[--i];
                while (i) {
                    const y = vecs[--i],
                        x = vecs[--i];
                    minY = math.min(y, minY);
                    maxY = math.max(y, maxY);
                    minX = math.min(x, minX);
                    maxX = math.max(x, maxX);
                }
                return this._boundingBox = {x:minX, y:minY, width:maxX - minX, height:maxY - minY};
            }
            
            return this._boundingBox = null;
        },
        
        /** Gets the center point of the bounding box for the path.
            @returns {!Object} with properties x and y or null if no bounding box could 
                be calculated. */
        getCenter: function() {
            const box = this.getBoundingBox();
            return box ? {
                x:box.x + box.width / 2,
                y:box.y + box.height / 2
            } : null;
        },
        
        /** Tests if the provided point is inside this path.
            @param {number|!Object} x - The x coordinate to test. Or a point object with x and 
                y properties.
            @param {number} y - The y coordinate to test.
            @returns {boolean} true if inside, false otherwise. */
        isPointInPath: function(x, y) {
            if (typeof x === 'object') {
                y = x.y;
                x = x.x;
            }
            return pkg.Geometry.isPointInPath(x, y, this.getBoundingBox(), this.vectors);
        }
    });
})(myt);

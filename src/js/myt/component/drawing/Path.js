/** An ordered collection of points that can be applied to a canvas.
    
    Attributes:
        vectors:array The data is stored in a single array with the x coordinate
            first and the y coordinate second.
*/
myt.Path = new JS.Class('Path', {
    // Constructor /////////////////////////////////////////////////////////////
    /** Create a new Path. */
    initialize: function(vectors) {
        this.setVectors(vectors || []);
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setVectors: function(v) {
        this.vectors = v;
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** Copy the data from the provided Path into this one.
        @param path:myt.Path
        @returns void */
    copyFrom: function(path) {
        this.vectors = path.vectors.slice();
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
        var vecs = this.vectors, len = vecs.length, i = 0;
        
        for (; len > i;) {
            vecs[i++] += dx;
            vecs[i++] += dy;
        }
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
    }
});

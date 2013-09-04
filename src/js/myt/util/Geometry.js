/** Provides common geometry related functions. */
myt.Geometry = {
    // Methods /////////////////////////////////////////////////////////////////
    /** Checks if the provided point is inside or on the edge of the provided 
        rectangle.
        @param pX:number the x coordinate of the point to test.
        @param pY:number the y coordinate of the point to test.
        @param rX:number the x coordinate of the rectangle.
        @param rY:number the y coordinate of the rectangle.
        @param rW:number the width of the rectangle.
        @param rH:number the height of the rectangle.
        
        Alternate Params:
        @param pX:object a point object with properties x and y.
        @param rX:object a rect object with properties x, y, width and height.
        
        @returns boolean True if the point is inside or on the rectangle. */
    rectContainsPoint: function(pX, pY, rX, rY, rW, rH) {
        if (typeof pX === 'object') {
            rH = rW;
            rW = rY;
            rY = rX;
            rX = pY;
            pY = pX.y;
            pX = pX.x;
        }
        
        if (typeof rX === 'object') {
            rH = rX.height;
            rW = rX.width;
            rY = rX.y;
            rX = rX.x;
        }
        
        return pX >= rX && pY >= rY && pX <= rX + rW && pY <= rY + rH;
    },
    
    /** Checks if the provided point lies inside or on the edge of the
        provided circle.
        @param pX:number the x coordinate of the point to test.
        @param pY:number the y coordinate of the point to test.
        @param cX:number the x coordinate of the center of the circle.
        @param cY:number the y coordinate of the center of the circle.
        @param cR:number the radius of the circle.
        @return boolean True if the point is inside or on the circle. */
    circleContainsPoint: function(pX, pY, cX, cY, cR) {
        return this.measureDistance(pX, pY, cX, cY) <= cR;
    },
    
    /** Measure the distance between two points.
        @param x1:number the x position of the first point.
        @param y1:number the y position of the first point.
        @param x2:number the x position of the second point.
        @param y2:number the y position of the second point.
        @returns number the distance between the two points. */
    measureDistance: function(x1, y1, x2, y2) {
        var diffX = x2 - x1, diffY = y2 - y1
        return Math.sqrt(diffX * diffX + diffY * diffY);
    }
};

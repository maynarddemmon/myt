(pkg => {
    const {PI, cos:mathCos, sin:mathSin, sqrt:mathSqrt, abs:mathAbs} = Math,
        
        /*  Convert radians to degrees.
            @param {number} deg - The degrees to convert.
            @returns {number} - The converted radians. */
        degreesToRadians = deg => deg * PI / 180,
        
        /*  Convert degrees to radians.
            @param {number} rad - The radians to convert.
            @returns {number} The converted degrees. */
        radiansToDegrees = rad => rad * 180 / PI,
        
        /*  Checks if the provided point is inside or on the edge of the provided rectangle.
            @param {number|!Object} pX - The x coordinate of the point to test or alternately a 
                point object with properties x and y.
            @param {number} pY - The y coordinate of the point to test.
            @param {number|!Object} rX - The x coordinate of the rectangle or alternately a rect 
                object with properties x, y, width and height.
            @param {number} rY - The y coordinate of the rectangle.
            @param {number} rW - The width of the rectangle.
            @param {number} rH - The height of the rectangle.
            @returns {boolean} - True if the point is inside or on the rectangle. */
        rectContainsPoint = (pX, pY, rX, rY, rW, rH) => {
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
        
        /*  Measure the distance between two points.
            @param {number} x1 - The x position of the first point.
            @param {number} y1 - The y position of the first point.
            @param {number} x2 - The x position of the second point.
            @param {number} y2 - The y position of the second point.
            @param {boolean} [squared] - If true, the squared distance will be returned.
            @returns {number} - The distance between the two points. */
        measureDistance = (x1, y1, x2, y2, squared) => {
            const diffX = x2 - x1, 
                diffY = y2 - y1, 
                diffSquared = diffX * diffX + diffY * diffY;
            return squared ? diffSquared : mathSqrt(diffSquared);
        },
        
        /*  Measures the distance between two points on a sphere using latitude and longitude.
            @param {number} lat1 - the latitude of the first point.
            @param {number} lng1 - the longitude of the first point.
            @param {number} lat2 - the latitude of the second point.
            @param {number} lng2 - the longitude of the second point.
            @param {number} [sphereRadius] - The radius of the sphere the measurement is being 
                taken on in kilometers. If not provided the radius of the earth is used.
            @returns {number} - The distance between the points in kilometers. */
        measureLatLngDistance = (lat1, lng1, lat2, lng2, sphereRadius) => {
            // Taken from: http://www.movable-type.co.uk/scripts/latlong.html
            if (sphereRadius == null) sphereRadius = 6371; // kilometers for earth
            lat1 = degreesToRadians(lat1);
            lat2 = degreesToRadians(lat2);
            return sphereRadius * math.acos(
                mathSin(lat1) * mathSin(lat2) + 
                mathCos(lat1) * mathCos(lat2) * mathCos(degreesToRadians(lng2) - degreesToRadians(lng1))
            );
        },
        
        /*  Measures the area of a simple polygon using the shoelace formula.
            @param {?Array} vertices - The vertices of the polygon. If null/undefined 0 will
                be returned.
            @param {?boolean} ignoreWinding - Indicates if the winding order of the vertices should
                be ignored and thus the returned area will be non-negative.
            @param {?string} xAttrName - The name used to lookup the x-coordinate of each vertex.
            @param {?string} yAttrName - The name used to lookup the y-coordinate of each vertex.
            @returns {number} - The area of the polygon. */
        getAreaOfPolygon = (vertices, ignoreWinding=true, xAttrName='x', yAttrName='y') => {
            let len = vertices?.length;
            if (len < 3 || !Array.isArray(vertices)) return 0;
            
            // Drop duplicate closing vertex
            if (vertices[0][xAttrName] === vertices[len - 1][xAttrName] && vertices[0][yAttrName] === vertices[len - 1][yAttrName]) len--;
            
            // Use shoelace formula.
            let area = 0,
                prev = vertices[len - 1];
            for (let i = 0; i < len; i++) {
                const cur = vertices[i];
                area += prev[xAttrName] * cur[yAttrName] - cur[xAttrName] * prev[yAttrName];
                prev = cur;
            }
            
            return (ignoreWinding ? mathAbs(area) : area) / 2;
        };
    
    /** Provides common geometry related functions. */
    pkg.Geometry = {
        // Methods /////////////////////////////////////////////////////////
        /** Get the closest point on a line, or segment, to a given point.
            @param {number} Ax - The x-coordinate of the first endpoint that defines the segment.
            @param {number} Ay - The y-coordinate of the first endpoint that defines  the segment.
            @param {number} Bx - The x-coordinate of the second endpoint that defines the segment.
            @param {number} By - The y-coordinate of the second endpoint that defines the segment.
            @param {number} Px - The x-coordinate of the point.
            @param {number} Py - The y-coordinate of the point.
            @param {boolean} [isSegment] - If true the endpoints will be treated as a segment 
                rather than an infinitely long line.
            @returns {!Object} - A position object with x and y properties. */
        getClosestPointOnALineToAPoint: (Ax, Ay, Bx, By, Px, Py, isSegment) => {
            const APx = Px - Ax,
                APy = Py - Ay,
                ABx = Bx - Ax,
                ABy = By - Ay,
                magAB2 = ABx * ABx + ABy * ABy,
                ABdotAP = ABx * APx + ABy * APy;
            let t = ABdotAP / magAB2;
            if (isSegment) t = math.min(1, math.max(0, t));
            return {x:Ax + ABx * t, y:Ay + ABy * t};
        },
        
        /** Tests if the provided point is inside this path.
            @param {number|!Object} x - The x coordinate to test or alternately a point object 
                with x and y properties.
            @param {number} y - The y coordinate to test.
            @param {!Object} boundingBox - A bounding box object that bounds the path.
            @param {!Araay} path - An array of points where the index 0,2,4,... are the x 
                values and index 1,3,5,... are the y values.
            @return {boolean} - True if inside, false otherwise. */
        isPointInPath: (x, y, boundingBox, path) => {
            if (typeof x === 'object') {
                path = boundingBox;
                boundingBox = y;
                y = x.y;
                x = x.x;
            }
            
            // First test bounding box
            if (rectContainsPoint(x, y, boundingBox)) {
                // Test using Jordan Curve Theorem
                let len = path.length;
                
                // Must at least be a triangle to have an inside.
                if (len >= 6) {
                    let c = false, 
                        x1 = path[0], 
                        y1 = path[1], 
                        x2, 
                        y2;
                    while (len) {
                        y2 = path[--len];
                        x2 = path[--len];
                        if (((y2 > y) !== (y1 > y)) && (x < (x1 - x2) * (y - y2) / (y1 - y2) + x2)) c = !c;
                        x1 = x2;
                        y1 = y2;
                    }
                    return c;
                }
            }
            return false;
        },
        
        measureDistance: measureDistance,
        measureLatLngDistance: measureLatLngDistance,
        degreesToRadians: degreesToRadians,
        radiansToDegrees: radiansToDegrees,
        rectContainsPoint: rectContainsPoint,
        
        /** Checks if the provided point lies inside or on the edge of the provided circle.
            @param {number} pX - The x coordinate of the point to test.
            @param {number} pY - The y coordinate of the point to test.
            @param {number} cX - The x coordinate of the center of the circle.
            @param {number} cY - The y coordinate of the center of the circle.
            @param {number} cR - The radius of the circle.
            @return {boolean} - True if the point is inside or on the circle. */
        circleContainsPoint: (pX, pY, cX, cY, cR) => measureDistance(pX, pY, cX, cY, true) <= cR * cR,
        
        // Geometry on a sphere
        /** Checks if the provided lat/lng point lies inside or on the edge of the provided circle.
            @param {number} pLat - The latitude of the point to test.
            @param {number} pLng - The longitude of the point to test.
            @param {number} cLat - The latitude of the center of the circle.
            @param {number} cLng - The longitude of the center of the circle.
            @param {number} cR - The radius of the circle in kilometers.
            @param {number} [sphereRadius] - The radius of the sphere the measurement is being 
                taken on in kilometers. If not provided the radius of the earth is used.
            @return {boolean} - True if the point is inside or on the circle. */
        circleContainsLatLng: (pLat, pLng, cLat, cLng, cR, sphereRadius) => measureLatLngDistance(pLat, pLng, cLat, cLng, sphereRadius) <= cR,
        
        /** Convert from polar to cartesian coordinates.
            @param {number} radius - The radius of the point to convert relative to the circle.
            @param {number} degrees - The angle coordinate of the point to convert.
            @param {number} [cx] - The x coordinate of the center of the circle.
            @param {number} [cy] - The y coordinate of the center of the circle.
            @returns {!Array} - Where index 0 is the x coordinate and index 1 is the y coordinate. */
        polarToCartesian: (radius, degrees, cx, cy) => {
            cx ??= 0;
            cy ??= 0;
            degrees = degrees % 360;
            
            let x, 
                y;
            if (degrees === 0) {
                x = radius;
                y = 0;
            } else if (degrees === 90) {
                x = 0;
                y = radius;
            } else if (degrees === 180) {
                x = -radius;
                y = 0;
            } else if (degrees === 270) {
                x = 0;
                y = -radius;
            } else {
                const radians = degreesToRadians(degrees);
                x = radius * mathCos(radians);
                y = radius * mathSin(radians);
            }
            
            return [cx + x, cy + y];
        },
        
        /** Convert from cartesian to polar coordinates.
            @param {number} x - The x coordinate to transform.
            @param {number} y - The y coordinate to transform.
            @param {number} [cx] - The x coordinate of the center of the circle.
            @param {number} [cy] - The y coordinate of the center of the circle.
            @param {boolean} [useRadians] - If true the angle returned will be in radians 
                otherwise it will be degrees.
            @return {!Array} An array where index 0 is the radius and index 1 is angle in 
                degrees (or radians if userRadians is true). */
        cartesianToPolar: (x, y, cx, cy, useRadians) => {
            cx ??= 0;
            cy ??= 0;
            
            const diffX = x - cx,
                diffY = y - cy,
                radius = mathSqrt(diffX*diffX + diffY*diffY);
            let radians = math.atan2(diffY, diffX);
            if (radians < 0) radians += 2 * PI;
            return [radius, useRadians ? radians : radiansToDegrees(radians)];
        },
        
        getAreaOfPolygon:getAreaOfPolygon,
        isClockwisePolygon: (vertices, xAttrName, yAttrName) => getAreaOfPolygon(vertices, false, xAttrName, yAttrName) < 0
    };
})(myt);

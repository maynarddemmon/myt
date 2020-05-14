/** A collection of common drawing routines. */
myt.DrawingUtil = {
    // Methods /////////////////////////////////////////////////////////////////
    /** Draws a rounded rect into the provided drawview.
        @param {!Object} canvas
        @param {number} r - The radius of the corners.
        @param {number} thickness - The thickness of the line. If thickness is
            zero or less a fill will be done rather than an outline.
        @param {number} left
        @param {number} top
        @param {number} w
        @param {number} h
        @returns {undefined} */
    drawRoundedRect: (canvas, r, thickness, left, top, w, h) => {
        const PI = Math.PI;
        let bottom = top + h,
            right = left + w;
        
        // We create a single path for both an outer and inner rounded rect.
        // The reason for this is that filling looks much better than stroking.
        canvas.beginPath();
        
        canvas.moveTo(left, top + r);
        
        canvas.lineTo(left, bottom - r);
        canvas.arc(left + r, bottom - r, r, PI, PI / 2, true);
        
        canvas.lineTo(right - r, bottom);
        canvas.arc(right - r, bottom - r, r, PI / 2, 0, true);
        
        canvas.lineTo(right, top + r);
        canvas.arc(right - r, top + r, r, 0, PI * 3 / 2, true);
        
        canvas.lineTo(left + r, top);
        canvas.arc(left + r, top + r, r, PI * 3 / 2, PI, true);
        
        canvas.closePath();
        
        if (thickness > 0) {
            r -= thickness;
            left += thickness;
            right -= thickness;
            top += thickness;
            bottom -= thickness;
            
            canvas.moveTo(left, top + r);
            
            canvas.arc(left + r, top + r, r, PI, PI * 3 / 2);
            
            canvas.lineTo(right - r, top);
            canvas.arc(right - r, top + r, r, PI * 3 / 2, 0);
            
            canvas.lineTo(right, bottom - r);
            canvas.arc(right - r, bottom - r, r, 0, PI / 2);
            
            canvas.lineTo(left + r, bottom);
            canvas.arc(left + r, bottom - r, r, PI / 2, PI);
            
            canvas.closePath();
        }
    },
    
    /** Draws a rect outline into the provided drawview.
        @param {!Object} canvas
        @param {number} thickness - The thickness of the line.
        @param {number} left
        @param {number} top
        @param {number} w
        @param {number} h
        @returns {undefined} */
    drawRectOutline: (canvas, thickness, left, top, w, h) => {
        const bottom = top + h, 
            right = left + w,
            ileft = left + thickness,
            iright = right - thickness,
            itop = top + thickness,
            ibottom = bottom - thickness;
        
        canvas.beginPath();
        
        canvas.moveTo(left, top);
        canvas.lineTo(left, bottom);
        canvas.lineTo(right, bottom);
        canvas.lineTo(right, top);
        canvas.lineTo(left, top);
        
        canvas.lineTo(ileft, itop);
        canvas.lineTo(iright, itop);
        canvas.lineTo(iright, ibottom);
        canvas.lineTo(ileft, ibottom);
        canvas.lineTo(ileft, itop);
        
        canvas.closePath();
    },
    
    /** Draws a rounded rect with one or more flat corners.
        @param {!Object} canvas
        @param {number} rTL - the radius for the top left corner.
        @param {number} rTR - the radius for the top right corner.
        @param {number} rBL - the radius for the bottom left corner.
        @param {number} rBR - the radius for the bottom right corner.
        @param {number} left
        @param {number} top
        @param {number} w
        @param {number} h
        @returns {undefined} */
    drawPartiallyRoundedRect: (canvas, rTL, rTR, rBL, rBR, left, top, w, h) => {
        const bottom = top + h, 
            right = left + w;
        
        canvas.beginPath();
        
        canvas.moveTo(left, top + rTL);
        
        canvas.lineTo(left, bottom - rBL);
        if (rBL > 0) canvas.quadraticCurveTo(left, bottom, left + rBL, bottom);
        
        canvas.lineTo(right - rBR, bottom);
        if (rBR > 0) canvas.quadraticCurveTo(right, bottom, right, bottom - rBR);
        
        canvas.lineTo(right, top + rTR);
        if (rTR > 0) canvas.quadraticCurveTo(right, top, right - rTR, top);
        
        canvas.lineTo(left + rTL, top);
        if (rTL > 0) canvas.quadraticCurveTo(left, top, left, top + rTL);
        
        canvas.closePath();
    },
    
    drawGradientArc: (canvas, centerX, centerY, r, ir, startAngle, endAngle, colors, segments) => {
        if (segments == null) segments = 60;
        
        let angleDelta = Math.PI / segments,
        
        // Antialiasing issues means we need to draw each polygon with a small 
        // overlap to fill the gap.
            angleOverlap =  Math.PI / 360,
        
        // Calculate Colors
            len = colors.length,
            i = 0, 
            angleDiff, 
            slices, 
            diff;
        for (; len > i + 1; i++) {
            angleDiff = colors[i + 1].angle - colors[i].angle;
            slices = Math.round(angleDiff / angleDelta);
            diff = colors[i].color.getDiffFrom(colors[i + 1].color);
            colors[i].colorDelta = {red:diff.red / slices, green:diff.green / slices, blue:diff.blue / slices};
        }
        
        const path = new myt.Path([centerX + r, centerY, centerX + ir, centerY]);
        let prevAngle, ix1, iy1, x1, y1,
            angle = startAngle;
        
        path.rotateAroundOrigin(angle, centerX, centerY);
        const vectors = path.vectors;
        let x2 = vectors[0], y2 = vectors[1],
            ix2 = vectors[2], iy2 = vectors[3],
            diffCount = 0;
        
        i = 0;
        
        while (endAngle > angle) {
            // Shift angle and points
            x1 = x2;
            y1 = y2;
            ix1 = ix2;
            iy1 = iy2;
            prevAngle = angle;
            
            // Calculate new angle and points
            angle += angleDelta;
            if (angle > endAngle) {
                angleDelta += endAngle - angle;
                angleOverlap = 0;
                angle = endAngle;
            }
            path.rotateAroundOrigin(angleDelta + angleOverlap, centerX, centerY);
            x2 = vectors[0];
            y2 = vectors[1];
            ix2 = vectors[2];
            iy2 = vectors[3];
            
            // Draw part
            canvas.beginPath();
            canvas.moveTo(x1, y1);
            canvas.lineTo(ix1, iy1);
            canvas.lineTo(ix2, iy2);
            canvas.lineTo(x2, y2);
            canvas.closePath();
            
            const c = colors[i].color,
                colorDelta = colors[i].colorDelta;
            canvas.fillStyle = myt.Color.makeColorNumberFromChannels(
                c.red + (diffCount * colorDelta.red),
                c.green + (diffCount * colorDelta.green),
                c.blue + (diffCount * colorDelta.blue)
            );
            canvas.fill();
            
            if (angleOverlap > 0) {
                path.rotateAroundOrigin(-angleOverlap, centerX, centerY);
                x2 = vectors[0];
                y2 = vectors[1];
                ix2 = vectors[2];
                iy2 = vectors[3];
            }
            
            // Increment color
            diffCount++;
            if (angle >= colors[i + 1].angle) {
                diffCount = 0;
                i++;
            }
        }
    }
};

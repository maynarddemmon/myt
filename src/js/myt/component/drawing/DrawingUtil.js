/** A collection of common drawing routines. */
myt.DrawingUtil = {
    // Methods /////////////////////////////////////////////////////////////////
    /** Draws a rounded rect into the provided drawview.
        @param r:Number the radius of the corners.
        @param thickness:Number the thickness of the line. If thickness is
            zero or less a fill will be done rather than an outline. */
    drawRoundedRect: function(canvas, r, thickness, left, top, w, h) {
        var bottom = top + h, right = left + w;
        
        // We create a single path for both an outer and inner rounded rect.
        // The reason for this is that filling looks much better than stroking.
        canvas.beginPath();
        
        canvas.moveTo(left, top + r);
        
        canvas.lineTo(left, bottom - r);
        canvas.quadraticCurveTo(left, bottom, left + r, bottom);
        
        canvas.lineTo(right - r, bottom);
        canvas.quadraticCurveTo(right, bottom, right, bottom - r);
        
        canvas.lineTo(right, top + r);
        canvas.quadraticCurveTo(right, top, right - r, top);
        
        canvas.lineTo(left + r, top);
        canvas.quadraticCurveTo(left, top, left, top + r);
        
        if (thickness > 0) {
            var ir = r - thickness,
                ileft = left + thickness,
                iright = right - thickness,
                itop = top + thickness,
                ibottom = bottom - thickness;
            
            canvas.lineTo(ileft, itop + ir);
            
            canvas.quadraticCurveTo(ileft, itop, ileft + ir, itop);
            
            canvas.lineTo(iright - ir, itop);
            canvas.quadraticCurveTo(iright, itop, iright, itop + ir);
            
            canvas.lineTo(iright, ibottom - ir);
            canvas.quadraticCurveTo(iright, ibottom, iright - ir, ibottom);
            
            canvas.lineTo(ileft + ir, ibottom);
            canvas.quadraticCurveTo(ileft, ibottom, ileft, ibottom - ir);
            
            canvas.lineTo(ileft, itop + ir);
            
            canvas.closePath();
        }
    },
    
    /** Draws a rounded rect with one or more flat corners.
        @param rTL:Number the radius for the top left corner.
        @param rTR:Number the radius for the top right corner.
        @param rBL:Number the radius for the bottom left corner.
        @param rBR:Number the radius for the bottom right corner. */
    drawPartiallyRoundedRect: function(canvas, rTL, rTR, rBL, rBR, left, top, w, h) {
        var bottom = top + h, right = left + w;
        
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
    
    drawGradientArc: function(canvas, centerX, centerY, r, ir, startAngle, endAngle, colors, segments) {
        if (segments == null) segments = 60;
        
        var angleDelta = Math.PI / segments,
        
        // Antialiasing issues means we need to draw each polygon with a small 
        // overlap to fill the gap.
            angleOverlap =  Math.PI / 360,
        
        // Calculate Colors
            len = colors.length, i = 0, angleDiff, slices, diff;
        for (; len > i + 1; i++) {
            angleDiff = colors[i + 1].angle - colors[i].angle;
            slices = Math.round(angleDiff / angleDelta);
            diff = colors[i].color.getDiffFrom(colors[i + 1].color);
            colors[i].colorDelta = {red:diff.red / slices, green:diff.green / slices, blue:diff.blue / slices};
        }
        
        var path = new myt.Path([centerX + r, centerY, centerX + ir, centerY]),
            prevAngle, ix1, iy1, x1, y1,
            angle = startAngle;
        
        path.rotateAroundOrigin(angle, centerX, centerY);
        var vectors = path.vectors,
            x2 = vectors[0], y2 = vectors[1],
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
            
            var c = colors[i].color;
            var colorDelta = colors[i].colorDelta
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

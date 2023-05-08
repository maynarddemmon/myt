(pkg => {
    const PI = Math.PI,
        HALF_PI = PI / 2,
        ONE_AND_A_HALF_PI = PI * 3 / 2,
        AccessorSupport = pkg.AccessorSupport,
        
        mixin = {};
    
    [
        'save','restore','scale','rotate','translate','transform','setTransform',
        'clearRect','fillRect','strokeRect','beginPath','closePath','moveTo','lineTo',
        'quadraticCurveTo','bezierCurveTo','arcTo','rect','arc','fill','stroke','clip','isPointInPath',
        'fillText','strokeText','drawImage','createImageData','putImageData'
    ].forEach(funcName => {
        mixin[funcName] = function() {
            this.__ctx[funcName].apply(this.__ctx, arguments);
        };
    });
    
    [
        'createLinearGradient','createRadialGradient','createPattern',
        'measureText','getImageData'
    ].forEach(funcName => {
        mixin[funcName] = function() {
            return this.__ctx[funcName].apply(this.__ctx, arguments);
        };
    });
    
    [
        'fillStyle','strokeStyle','shadowColor','shadowBlur','shadowOffsetX','shadowOffsetY',
        'lineWidth','lineCap','lineJoin','miterLimit','font','textAlign','textBaseline',
        'globalAlpha','globalCompositeOperation'
    ].forEach(propName => {
        mixin[AccessorSupport.generateSetterName(propName)] = function(v) {
            this.__ctx[propName] = v;
        };
        mixin[AccessorSupport.generateGetterName(propName)] = function() {
            return this.__ctx[propName];
        };
    });
    
    /** A view for programatic drawing. This view is backed by an html canvas element.
        
        Attributes:
            Same as HTML canvas element.
        
        Private Attributes:
            __cvs: A reference to the canvas dom element.
            __ctx: A reference to the 2D drawing context.
        
        @class */
    pkg.Canvas = new JS.Class('Canvas', pkg.BackView, {
        include:[mixin],
        
        
        // Life Cycle //////////////////////////////////////////////////////////
        /** @overrides myt.View */
        createOurDomElement: function(parent) {
            const elements = this.callSuper(parent),
                innerElem = Array.isArray(elements) ? elements[1] : elements,
                canvas = this.__cvs = document.createElement('canvas');
            canvas.className = 'mytUnselectable';
            innerElem.appendChild(canvas);
            canvas.style.position = 'absolute';
            
            this.__ctx = canvas.getContext('2d');
            
            return elements;
        },
        
        
        // Accessors ///////////////////////////////////////////////////////////
        /** @overrides myt.View
            Needed because canvas must also set width/height attribute.
            See: http://www.whatwg.org/specs/web-apps/current-work/multipage/the-canvas-element.html#attr-canvas-width */
        setWidth: function(v, suppressEvent) {
            if (0 > v) v = 0;
            this.__cvs.setAttribute('width', v);
            this.callSuper(v, suppressEvent);
        },
        
        /** @overrides myt.View
            Needed because canvas must also set width/height attribute.
            See: http://www.whatwg.org/specs/web-apps/current-work/multipage/the-canvas-element.html#attr-canvas-width */
        setHeight: function(v, suppressEvent) {
            if (0 > v) v = 0;
            this.__cvs.setAttribute('height', v);
            this.callSuper(v, suppressEvent);
        },
        
        
        // Methods /////////////////////////////////////////////////////////////
        /** Clears the drawing context. Anything currently drawn will be erased. */
        clear: function() {
            // Store the current transform matrix, then apply the identity matrix to make clearing 
            // simpler then restore the transform.
            const ctx = this.__ctx;
            ctx.save();
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.clearRect(0, 0, this.width, this.height);
            ctx.restore();
        },
        
        dataURItoBlob: function(dataURI, dataTYPE) {
            const binary = atob(dataURI.split(',')[1]), 
                len = binary.length,
                array = [];
            for (let i = 0; i < len;) array.push(binary.charCodeAt(i++));
            return new Blob([new Uint8Array(array)], {type: dataTYPE});
        },
        
        getDataURL: function(mimeType, opt) {
            return this.__cvs.toDataURL(mimeType, opt);
        },
        
        getImageFile: function(imageType, filename, opt) {
            let extension;
            switch (imageType) {
                case 'png': case 'PNG':
                    extension = 'png';
                    break;
                case 'jpg': case 'JPG': case 'jpeg': case 'JPEG':
                    extension = 'jpeg';
                    // opt should be a quality number between 0.0 (worst) and 1.0 (best)
                    opt ??= 0.5;
                    break;
                default:
                    console.warn('Unexpected image type', imageType);
                    extension = imageType.toLowerCase();
            }
            const mimeType = 'image/' + extension,
                blob = this.dataURItoBlob(this.getDataURL(mimeType, opt), mimeType);
            if (filename) blob.name = filename + '.' + extension;
            return blob;
        },
        
        /** Draws a circle
            @param x:number the x location of the center of the circle.
            @param y:number the y location of the center of the circle.
            @param radius:number the radius of the circle.
            @returns {undefined} */
        circle: function(x, y, radius) {
            this.__ctx.arc(x, y, radius, 0, 2 * PI);
        },
        
        /** Draws a rounded rect into the provided drawview.
            @param {number} r - The radius of the corners.
            @param {number} thickness - The thickness of the line. If thickness is zero or less a 
                fill will be done rather than an outline.
            @param {number} left
            @param {number} top
            @param {number} w
            @param {number} h
            @returns {!Object} The canvas for function chaining. */
        drawRoundedRect: function(r, thickness, left, top, w, h) {
            const self = this,
                lineTo = self.lineTo.bind(self),
                arc = self.arc.bind(self);
            
            let bottom = top + h,
                right = left + w;
            
            // We create a single path for both an outer and inner rounded rect. The reason for 
            // this is that filling looks much better than stroking.
            self.beginPath();
            
            self.moveTo(left, top + r);
            
            lineTo(left, bottom - r);
            arc(left + r, bottom - r, r, PI, HALF_PI, true);
            
            lineTo(right - r, bottom);
            arc(right - r, bottom - r, r, HALF_PI, 0, true);
            
            lineTo(right, top + r);
            arc(right - r, top + r, r, 0, ONE_AND_A_HALF_PI, true);
            
            lineTo(left + r, top);
            arc(left + r, top + r, r, ONE_AND_A_HALF_PI, PI, true);
            
            self.closePath();
            
            if (thickness > 0) {
                r -= thickness;
                left += thickness;
                right -= thickness;
                top += thickness;
                bottom -= thickness;
                
                self.moveTo(left, top + r);
                
                arc(left + r, top + r, r, PI, ONE_AND_A_HALF_PI);
                
                lineTo(right - r, top);
                arc(right - r, top + r, r, ONE_AND_A_HALF_PI, 0);
                
                lineTo(right, bottom - r);
                arc(right - r, bottom - r, r, 0, HALF_PI);
                
                lineTo(left + r, bottom);
                arc(left + r, bottom - r, r, HALF_PI, PI);
                
                self.closePath();
            }
            return self;
        },
        
        /** Draws a rect outline into the provided drawview.
            @param {number} thickness - The thickness of the line.
            @param {number} left
            @param {number} top
            @param {number} w
            @param {number} h
            @returns {!Object} The canvas for function chaining. */
        drawRectOutline: function(thickness, left, top, w, h) {
            const self = this,
                bottom = top + h, 
                right = left + w,
                ileft = left + thickness,
                iright = right - thickness,
                itop = top + thickness,
                ibottom = bottom - thickness,
                lineTo = self.lineTo.bind(self);
            
            self.beginPath();
            
            self.moveTo(left, top);
            lineTo(left, bottom);
            lineTo(right, bottom);
            lineTo(right, top);
            lineTo(left, top);
            
            lineTo(ileft, itop);
            lineTo(iright, itop);
            lineTo(iright, ibottom);
            lineTo(ileft, ibottom);
            lineTo(ileft, itop);
            
            self.closePath();
            
            return self;
        },
        
        /** Draws a rounded rect with one or more flat corners.
            @param {number} rTL - the radius for the top left corner.
            @param {number} rTR - the radius for the top right corner.
            @param {number} rBL - the radius for the bottom left corner.
            @param {number} rBR - the radius for the bottom right corner.
            @param {number} left
            @param {number} top
            @param {number} w
            @param {number} h
            @returns {!Object} The canvas for function chaining. */
        drawPartiallyRoundedRect: function(rTL, rTR, rBL, rBR, left, top, w, h) {
            const self = this,
                bottom = top + h, 
                right = left + w,
                lineTo = self.lineTo.bind(self),
                quadraticCurveTo = self.quadraticCurveTo.bind(self);
            
            self.beginPath();
            
            self.moveTo(left, top + rTL);
            
            lineTo(left, bottom - rBL);
            if (rBL > 0) quadraticCurveTo(left, bottom, left + rBL, bottom);
            
            lineTo(right - rBR, bottom);
            if (rBR > 0) quadraticCurveTo(right, bottom, right, bottom - rBR);
            
            lineTo(right, top + rTR);
            if (rTR > 0) quadraticCurveTo(right, top, right - rTR, top);
            
            lineTo(left + rTL, top);
            if (rTL > 0) quadraticCurveTo(left, top, left, top + rTL);
            
            self.closePath();
            return self;
        },
        
        /** Draws an annulus filled with a gradient.
            @param {number} centerX - The x location of the origin of the annulus.
            @param {number} centerY - The y location of the origin of the annulus.
            @param {number} r - The outer radius of the annulus in pixels.
            @param {number} ir - The inner radius of the annulus in pixels.
            @param {number} startAngle - The start of the annulus in radians.
            @param {number} endAngle - The end of the annulus in radians.
            @param {!Array} colors - An array of objects that contains the colors to blend between 
                and the angle they occur at. The object has two properties, "angle" (in radians) 
                and "color". The "color" may be either a hex color string or a myt.Color object.
            @param {number} [segments] - The number of segments to draw for half a circle. 
                Defaults to 60.
            @returns {!Object} The canvas for function chaining. */
        drawAnnulus: function(centerX, centerY, r, ir, startAngle, endAngle, colors, segments=60) {
            const self = this,
                Color = pkg.Color;
            
            // Convert string based hex colors to myt.Color objects.
            colors.forEach(config => {
                if (typeof config.color === 'string') config.color = Color.makeColorFromHexString(config.color);
            });
            
            // Calculate Colors
            let angleDelta = PI / segments,
                i = 0;
            
            for (const limit = colors.length - 1; i < limit;) {
                const config = colors[i++],
                    nextConfig = colors[i],
                    angleDiff = nextConfig.angle - config.angle,
                    slices = Math.round(angleDiff / angleDelta),
                    diff = config.color.getDiffFrom(nextConfig.color);
                config.colorDelta = {red:diff.red / slices, green:diff.green / slices, blue:diff.blue / slices};
            }
            
            const path = new pkg.Path([centerX + r, centerY, centerX + ir, centerY]);
            path.rotateAroundOrigin(startAngle, centerX, centerY);
            const vectors = path.vectors;
            let angle = startAngle,
                ix1,
                iy1,
                x1,
                y1,
                [x2, y2, ix2, iy2] = vectors,
                diffCount = 0,
                
                // Antialiasing issues means we need to draw each polygon with a small overlap to 
                // fill the gap.
                angleOverlap =  PI / 360;
            
            i = 0;
            
            while (endAngle > angle) {
                // Shift angle and points
                x1 = x2;
                y1 = y2;
                ix1 = ix2;
                iy1 = iy2;
                
                // Calculate new angle and points
                angle += angleDelta;
                if (angle > endAngle) {
                    angleDelta += endAngle - angle;
                    angleOverlap = 0;
                    angle = endAngle;
                }
                path.rotateAroundOrigin(angleDelta + angleOverlap, centerX, centerY);
                [x2, y2, ix2, iy2] = vectors;
                
                // Draw part
                self.beginPath();
                self.moveTo(x1, y1);
                self.lineTo(ix1, iy1);
                self.lineTo(ix2, iy2);
                self.lineTo(x2, y2);
                self.closePath();
                
                const c = colors[i].color,
                    colorDelta = colors[i].colorDelta;
                self.setFillStyle(Color.rgbToHex(
                    c.red + (diffCount * colorDelta.red),
                    c.green + (diffCount * colorDelta.green),
                    c.blue + (diffCount * colorDelta.blue),
                    true
                ));
                self.fill();
                
                if (angleOverlap > 0) {
                    path.rotateAroundOrigin(-angleOverlap, centerX, centerY);
                    [x2, y2, ix2, iy2] = vectors;
                }
                
                // Increment color
                diffCount++;
                if (angle >= colors[i + 1].angle) {
                    diffCount = 0;
                    i++;
                }
            }
            return self;
        }
    });
})(myt);

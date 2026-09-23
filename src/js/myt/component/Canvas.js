(pkg => {
    const consoleWarn = console.warn,
        
        PI = Math.PI,
        AccessorSupport = pkg.AccessorSupport,
        
        mixin = {};
    
    for (const funcName of [
        'save','restore','scale','rotate','translate','transform','setTransform',
        'clearRect','fillRect','strokeRect','beginPath','closePath','moveTo','lineTo',
        'quadraticCurveTo','bezierCurveTo','arcTo','rect','roundRect','arc','fill','stroke','clip',
        'isPointInPath','fillText','strokeText','drawImage','createImageData','putImageData'
    ]) {
        mixin[funcName] = function(...args) {
            this.__ctx[funcName](...args);
        };
    }
    
    for (const funcName of [
        'createLinearGradient','createRadialGradient','createPattern','measureText','getImageData'
    ]) {
        mixin[funcName] = function(...args) {
            return this.__ctx[funcName](...args);
        };
    }
    
    for (const propName of [
        'fillStyle','strokeStyle','shadowColor','shadowBlur','shadowOffsetX','shadowOffsetY',
        'lineWidth','lineCap','lineJoin','miterLimit','font','textAlign','textBaseline',
        'globalAlpha','globalCompositeOperation'
    ]) {
        mixin[AccessorSupport.generateSetterName(propName)] = function(v) {
            this.__ctx[propName] = v;
        };
        mixin[AccessorSupport.generateGetterName(propName)] = function() {
            return this.__ctx[propName];
        };
    }
    
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
        initNode: function(parent, attrs) {
            this.quickSet(['willReadFrequently'], attrs);
            this.callSuper(parent, attrs);
        },
        
        /** @overrides myt.View */
        createOurDomElement: function(parent) {
            const elements = this.callSuper(parent),
                innerElem = Array.isArray(elements) ? elements[1] : elements,
                canvas = this.__cvs = document.createElement('canvas');
            canvas.className = 'mytUnselectable';
            innerElem.appendChild(canvas);
            canvas.style.position = 'absolute';
            
            const params = {};
            if (this.willReadFrequently) params.willReadFrequently = true;
            this.__ctx = canvas.getContext('2d', params);
            
            return elements;
        },
        
        
        // Accessors ///////////////////////////////////////////////////////////
        /** @overrides myt.View
            Needed because canvas must also set width/height attribute.
            See: http://www.whatwg.org/specs/web-apps/current-work/multipage/the-canvas-element.html#attr-canvas-width */
        setWidth: function(v) {
            if (0 > v) v = 0;
            this.__cvs.setAttribute('width', v);
            this.callSuper(v);
        },
        
        /** @overrides myt.View
            Needed because canvas must also set width/height attribute.
            See: http://www.whatwg.org/specs/web-apps/current-work/multipage/the-canvas-element.html#attr-canvas-width */
        setHeight: function(v) {
            if (0 > v) v = 0;
            this.__cvs.setAttribute('height', v);
            this.callSuper(v);
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
                // Note:Browsers don't seem to be planning to support avif.
                default:
                    consoleWarn('Unexpected image type', imageType);
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
            @returns {void} */
        circle: function(x, y, radius) {
            this.__ctx.arc(x, y, radius, 0, 2 * PI);
        },
        
        /*  A wrapper on roundRect that draws with the reversed winding order. This is useful
            for punching rounded rectangular holes in a path. */
        roundRectReversed: function(x, y, width, height, radii) {
            if (Array.isArray(radii) && radii.length > 1) {
                const [tl, tr, br, bl] = radii;
                radii = [tr, tl, bl, br];
            }
            this.__ctx.roundRect(x + width, y, -width, height, radii);
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
                A computed value "colorDelta" will be pushed onto it during the execution of
                this function.
            @param {number} [segments] - The number of segments to draw for half a circle. 
                Defaults to 60.
            @returns {!Object} The canvas for function chaining. */
        drawAnnulus: function(centerX, centerY, r, ir, startAngle, endAngle, colors, segments=60) {
            const self = this,
                Color = pkg.Color;
            
            // Convert string based hex colors to myt.Color objects.
            for (const config of colors) {
                if (typeof config.color === 'string') config.color = Color.makeColorFromHexString(config.color);
            }
            
            // Calculate Colors
            if (segments < 1) {
                consoleWarn('Invalid segements', segments);
                segments = 60;
            }
            
            let angleDelta = PI / segments,
                i = 0;
            
            for (const limit = colors.length - 1; i < limit;) {
                const config = colors[i++],
                    {angle:curAngle, color:curColor} = config,
                    {angle:nextAngle, color:nextColor} = colors[i],
                    angleDiff = nextAngle - curAngle,
                    slices = Math.round(angleDiff / angleDelta),
                    diff = curColor.getDiffFrom(nextColor);
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
                
                const {color, colorDelta} = colors[i];
                self.setFillStyle(Color.rgbToHex(
                    color.red + (diffCount * colorDelta.red),
                    color.green + (diffCount * colorDelta.green),
                    color.blue + (diffCount * colorDelta.blue),
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
/** A view for programatic drawing. This view is backed by an html 
    canvas element.
    
    Events:
        None
    
    Attributes:
        Same as HTML canvas element.
    
    Private Attributes:
        __canvas: A reference to the canvas dom element.
        __ctx: A reference to the 2D drawing context.
    
    @class */
myt.Canvas = new JS.Class('Canvas', myt.View, {
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides myt.View */
    createOurDomElement: function(parent) {
        const elements = this.callSuper(parent);
        let innerElem;
        if (Array.isArray(elements)) {
            innerElem = elements[1];
        } else {
            innerElem = elements;
        }
        
        const canvas = this.__canvas = document.createElement('canvas');
        canvas.className = 'mytUnselectable';
        innerElem.appendChild(canvas);
        canvas.style.position = 'absolute';
        
        this.__ctx = canvas.getContext('2d');
        
        return elements;
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    /** @overrides myt.View
        Needed because canvas must also set width/height attribute.
        See: http://www.whatwg.org/specs/web-apps/current-work/multipage/the-canvas-element.html#attr-canvas-width */
    setWidth: function(v, supressEvent) {
        if (0 > v) v = 0;
        this.__canvas.setAttribute('width', v);
        this.callSuper(v, supressEvent);
    },
    
    /** @overrides myt.View
        Needed because canvas must also set width/height attribute.
        See: http://www.whatwg.org/specs/web-apps/current-work/multipage/the-canvas-element.html#attr-canvas-width */
    setHeight: function(v, supressEvent) {
        if (0 > v) v = 0;
        this.__canvas.setAttribute('height', v);
        this.callSuper(v, supressEvent);
    },
    
    setFillStyle: function(v) {this.__ctx.fillStyle = v;},
    getFillStyle: function() {return this.__ctx.fillStyle;},
    
    setStrokeStyle: function(v) {this.__ctx.strokeStyle = v;},
    getStrokeStyle: function() {return this.__ctx.strokeStyle;},
    
    setShadowColor: function(v) {this.__ctx.shadowColor = v;},
    getShadowColor: function() {return this.__ctx.shadowColor;},
    
    setShadowBlur: function(v) {this.__ctx.shadowBlur = v;},
    getShadowBlur: function() {return this.__ctx.shadowBlur;},
    
    setShadowOffsetX: function(v) {this.__ctx.shadowOffsetX = v;},
    getShadowOffsetX: function() {return this.__ctx.shadowOffsetX;},
    
    setShadowOffsetY: function(v) {this.__ctx.shadowOffsetY = v;},
    getShadowOffsetY: function() {return this.__ctx.shadowOffsetY;},
    
    setLineWidth: function(v) {this.__ctx.lineWidth = v;},
    getLineWidth: function() {return this.__ctx.lineWidth;},
    
    setLineCap: function(v) {this.__ctx.lineCap = v;},
    getLineCap: function() {return this.__ctx.lineCap;},
    
    setLineJoin: function(v) {this.__ctx.lineJoin = v;},
    getLineJoin: function() {return this.__ctx.lineJoin;},
    
    setMiterLimit: function(v) {this.__ctx.miterLimit = v;},
    getMiterLimit: function() {return this.__ctx.miterLimit;},
    
    setFont: function(v) {this.__ctx.font = v;},
    getFont: function() {return this.__ctx.font;},
    
    setTextAlign: function(v) {this.__ctx.textAlign = v;},
    getTextAlign: function() {return this.__ctx.textAlign;},
    
    setTextBaseline: function(v) {this.__ctx.textBaseline = v;},
    getTextBaseline: function() {return this.__ctx.textBaseline;},
    
    setGlobalAlpha: function(v) {this.__ctx.globalAlpha = v;},
    getGlobalAlpha: function() {return this.__ctx.globalAlpha;},
    
    setGlobalCompositeOperation: function(v) {this.__ctx.globalCompositeOperation = v;},
    getGlobalCompositeOperation: function() {return this.__ctx.globalCompositeOperation;},
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** @overrides
        Prevent views from being sent behind the __canvas. This allows us to
        add child views to a Canvas which is not directly supported in HTML. */
    sendSubviewToBack: function(sv) {
        if (sv.parent === this) {
            const de = this.domElement,
                firstChild = de.childNodes[1];
            if (sv.domElement !== firstChild) {
                const removedElem = de.removeChild(sv.domElement);
                if (removedElem) de.insertBefore(removedElem, firstChild);
            }
        }
    },
    
    /** Clears the drawing context. Anything currently drawn will be erased. */
    clear: function() {
        // Store the current transform matrix, then apply the identity matrix
        // to make clearing simpler then restore the transform.
        const ctx = this.__ctx;
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, this.width, this.height);
        ctx.restore();
    },
    
    dataURItoBlob: function(dataURI, dataTYPE) {
        const binary = atob(dataURI.split(',')[1]), 
            array = [];
        for (let i = 0; i < binary.length; i++) array.push(binary.charCodeAt(i));
        return new Blob([new Uint8Array(array)], {type: dataTYPE});
    },
    
    getDataURL: function(mimeType, opt) {
        return this.__canvas.toDataURL(mimeType, opt);
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
                if (opt == null) opt = 0.5;
                break;
            default:
                console.warn('Unexpected image type: ', imageType);
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
        this.__ctx.arc(x, y, radius, 0, 2 * Math.PI);
    },
    
    save: function() {const ctx = this.__ctx; ctx.save.apply(ctx, arguments);},
    restore: function() {const ctx = this.__ctx; ctx.restore.apply(ctx, arguments);},
    
    scale: function() {const ctx = this.__ctx; ctx.scale.apply(ctx, arguments);},
    rotate: function() {const ctx = this.__ctx; ctx.rotate.apply(ctx, arguments);},
    translate: function() {const ctx = this.__ctx; ctx.translate.apply(ctx, arguments);},
    transform: function() {const ctx = this.__ctx; ctx.transform.apply(ctx, arguments);},
    setTransform: function() {const ctx = this.__ctx; ctx.setTransform.apply(ctx, arguments);},
    
    createLinearGradient: function() {const ctx = this.__ctx; return ctx.createLinearGradient.apply(ctx, arguments);},
    createRadialGradient: function() {const ctx = this.__ctx; return ctx.createRadialGradient.apply(ctx, arguments);},
    createPattern: function() {const ctx = this.__ctx; return ctx.createPattern.apply(ctx, arguments);},
    
    clearRect: function() {const ctx = this.__ctx; ctx.clearRect.apply(ctx, arguments);},
    fillRect: function() {const ctx = this.__ctx; ctx.fillRect.apply(ctx, arguments);},
    strokeRect: function() {const ctx = this.__ctx; ctx.strokeRect.apply(ctx, arguments);},
    
    beginPath: function() {const ctx = this.__ctx; ctx.beginPath.apply(ctx, arguments);},
    closePath: function() {const ctx = this.__ctx; ctx.closePath.apply(ctx, arguments);},
    moveTo: function() {const ctx = this.__ctx; ctx.moveTo.apply(ctx, arguments);},
    lineTo: function() {const ctx = this.__ctx; ctx.lineTo.apply(ctx, arguments);},
    
    quadraticCurveTo: function() {const ctx = this.__ctx; ctx.quadraticCurveTo.apply(ctx, arguments);},
    bezierCurveTo: function() {const ctx = this.__ctx; ctx.bezierCurveTo.apply(ctx, arguments);},
    arcTo: function() {const ctx = this.__ctx; ctx.arcTo.apply(ctx, arguments);},
    rect: function() {const ctx = this.__ctx; ctx.rect.apply(ctx, arguments);},
    arc: function() {const ctx = this.__ctx; ctx.arc.apply(ctx, arguments);},
    
    fill: function() {const ctx = this.__ctx; ctx.fill.apply(ctx, arguments);},
    stroke: function() {const ctx = this.__ctx; ctx.stroke.apply(ctx, arguments);},
    clip: function() {const ctx = this.__ctx; ctx.clip.apply(ctx, arguments);},
    isPointInPath: function() {const ctx = this.__ctx; ctx.isPointInPath.apply(ctx, arguments);},
    
    fillText: function() {const ctx = this.__ctx; ctx.fillText.apply(ctx, arguments);},
    strokeText: function() {const ctx = this.__ctx; ctx.strokeText.apply(ctx, arguments);},
    measureText: function() {const ctx = this.__ctx; return ctx.measureText.apply(ctx, arguments);},
    
    drawImage: function() {const ctx = this.__ctx; ctx.drawImage.apply(ctx, arguments);},
    createImageData: function() {const ctx = this.__ctx; ctx.createImageData.apply(ctx, arguments);},
    getImageData: function() {const ctx = this.__ctx; return ctx.getImageData.apply(ctx, arguments);},
    putImageData: function() {const ctx = this.__ctx; ctx.putImageData.apply(ctx, arguments);}
});


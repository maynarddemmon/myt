(pkg => {
    const makeSVG = (elementName, parentElem) => {
        const svgElem = document.createElementNS('http://www.w3.org/2000/svg', elementName);
        parentElem?.appendChild(svgElem);
        return svgElem;
    };
     
    /** A base class for SVG components.
        
        @class */
    pkg.SVG = new JS.Class('SVG', pkg.BackView, {
        // Class Methods ///////////////////////////////////////////////////////
        extend: {
            makeSVG:makeSVG
        },
        
        
        // Life Cycle //////////////////////////////////////////////////////////
        /** @overrides myt.View */
        createOurDomElement: function(parent) {
            const elements = this.callSuper(parent),
                innerElem = Array.isArray(elements) ? elements[1] : elements,
                svg = this.__svg = makeSVG('svg', innerElem);
            
            // Let the view handle mouse events
            svg.style.pointerEvents = 'none';
            
            return elements;
        },
        
        
        // Accessors ///////////////////////////////////////////////////////////
        getSVG: function() {
            return this.__svg;
        }
    });
})(myt);

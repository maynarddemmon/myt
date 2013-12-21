/** Provides a dom element for this instance. Also assigns a reference to this
    DomElementProxy to a property named "model" on the dom element.
    
    Attributes:
        domElement:domElement the dom element hidden we are a proxy for.
        deStyle:object a shortcut reference to the style attribute of 
            the dom element.
*/
myt.DomElementProxy = new JS.Module('DomElementProxy', {
    // Class Methods ///////////////////////////////////////////////////////////
    extend: {
        /** Creates a new dom element.
            @param tagname:string the name of the element to create.
            @param styles:object (optional) a map of style keys and values to 
                add to the style property of the new element.
            @param props:object (optional) a map of keys and values to add to 
                the new element.
            @returns the created element. */
        createDomElement: function(tagname, styles, props) {
            var de = document.createElement(tagname), key;
            if (props) for (key in props) de[key] = props[key];
            if (styles) for (key in styles) de.style[key] = styles[key];
            return de;
        },
        
        /** Gets the computed style for a dom element.
            @param elem:dom element the dom element to get the style for.
            @returns object the style object. */
        getComputedStyle: function(elem) {
            // getComputedStyle is IE's proprietary way.
            return global.getComputedStyle ? global.getComputedStyle(elem, '') : elem.currentStyle;
        },
        
        /** Tests if a dom element is visible or not.
            @param elem:DomElement the element to check visibility for.
            @returns boolean True if visible, false otherwise. */
        isDomElementVisible: function(elem) {
            // Special Case: hidden input elements should be considered not visible.
            if (elem.nodeName === 'INPUT' && elem.type === 'hidden') return false;
            
            var style;
            while (elem) {
                if (elem === document) return true;
                
                style = this.getComputedStyle(elem);
                if (style.display === 'none' || style.visibility === 'hidden') break;
                
                elem = elem.parentNode;
            }
            return false;
        },
        
        /** Gets the z-index of a dom element relative to an ancestor dom
            element.
            @returns int */
        getZIndexRelativeToAncestor: function(elem, ancestor) {
            if (elem && ancestor) {
                var ancestors = this.getAncestorsArray(elem, ancestor),
                    i = ancestors.length - 1, style, zIdx, isAuto;
                
                while (i) {
                    style = this.getComputedStyle(ancestors[--i]);
                    zIdx = style.zIndex;
                    isAuto = zIdx === 'auto';
                    
                    if (i !== 0 && isAuto && parseInt(style.opacity, 10) === 1) {
                        continue;
                    } else {
                        return isAuto ? 0 : parseInt(zIdx, 10);
                    }
                }
            }
            return 0;
        },
        
        /** Gets an array of ancestor dom elements including the element
            itself.
            @param elem:DomElement the element to start from.
            @param ancestor:DomElement (optional) The dom element to stop
                getting ancestors at.
            @returns an array of ancestor dom elements. */
        getAncestorsArray: function(elem, ancestor) {
            var ancestors = [];
            while (elem) {
                ancestors.push(elem);
                if (elem === ancestor) break;
                elem = elem.parentNode;
            }
            return ancestors;
        },
        
        /** Gets the z-index of the dom element or, if it does not define a 
            stacking context, the highest z-index of any of the dom element's 
            descendants.
            @param elem:DomElement
            @returns int */
        getHighestZIndex: function(elem) {
            // See https://developer.mozilla.org/en-US/docs/Web/Guide/CSS/Understanding_z_index/The_stacking_context
            var style = this.getComputedStyle(elem),
                zIdx = style.zIndex, 
                isAuto = zIdx === 'auto';
            if (isAuto && parseInt(style.opacity, 10) === 1) {
                // No new stacking context.
                zIdx = 0;
                var children = elem.childNodes, i = children.length, child;
                while (i) {
                    child = children[--i];
                    if (child.nodeType === 1) zIdx = Math.max(zIdx, this.getHighestZIndex(child));
                }
            } else {
                zIdx = isAuto ? 0 : parseInt(zIdx, 10);
            }
            return zIdx;
        },
        
        /** Gets the x and y position of the dom element relative to the page.
            @param elem:domElement the dom element to get the position for.
            @param ancestorElem:domElement (optional) An ancestor dom element
                that if encountered will halt the page position calculation
                thus giving the position of elem relative to ancestorElem.
            @returns object with 'x' and 'y' keys or null if an error has
                occurred. */
        getPagePosition: function(elem, ancestorElem) {
            if (!elem) return null;
            
            var x = y = 0,
                borderMultiplier = BrowserDetect.browser === 'Firefox' ? 2 : 1; // I have no idea why firefox needs it twice, but it does.
            
            // elem.nodeName !== "BODY" test prevents looking at the body
            // which causes problems when the document is scrolled on webkit.
            while (elem && elem.nodeName !== "BODY" && 
                elem !== ancestorElem &&
                !isNaN(elem.offsetLeft) && !isNaN(elem.offsetTop)
            ) {
                x += elem.offsetLeft;
                y += elem.offsetTop;
                elem = elem.offsetParent;
                if (elem && elem.nodeName !== "BODY") {
                    x -= elem.scrollLeft;
                    y -= elem.scrollTop;
                    
                    // Handle borders
                    var s = this.getComputedStyle(elem);
                    x += borderMultiplier * parseInt(s.borderLeftWidth, 10);
                    y += borderMultiplier * parseInt(s.borderTopWidth, 10);
                }
            }
            
            // JQuery $(elem).offset() works with transforms
            
            return {x:x, y:y};
        },
        
        /** Generates a dom event on a dom element. Adapted from:
                http://stackoverflow.com/questions/6157929/how-to-simulate-mouse-click-using-javascript
            @param elem:domElement the element to simulate the event on.
            @param eventName:string the name of the dom event to generate.
            @param customOpts:Object (optional) a map of options that will
                be added onto the dom event object.
            @returns void */
        simulateDomEvent: function(elem, eventName, customOpts) {
            if (elem) {
                var opts = {
                    pointerX:0, pointerY:0, button:0,
                    ctrlKey:false, altKey:false, shiftKey:false, metaKey:false,
                    bubbles:true, cancelable:true
                };
                
                if (customOpts) {
                    for (var p in customOpts) opts[p] = customOpts[p];
                }
                
                var eventType,
                    eventMatchers = {
                        'HTMLEvents': /^(?:load|unload|abort|error|select|change|submit|reset|focus|blur|resize|scroll)$/,
                        'MouseEvents': /^(?:click|dblclick|mouse(?:down|up|over|move|out))$/
                    };
                for (var name in eventMatchers) {
                    if (eventMatchers[name].test(eventName)) {eventType = name; break;}
                }
                if (!eventType) throw new SyntaxError('Only HTMLEvent and MouseEvent interfaces supported');
                
                var domEvent;
                if (document.createEvent) {
                    domEvent = document.createEvent(eventType);
                    if (eventType === 'HTMLEvents') {
                        domEvent.initEvent(eventName, opts.bubbles, opts.cancelable);
                    } else {
                        domEvent.initMouseEvent(
                            eventName, opts.bubbles, opts.cancelable, document.defaultView,
                            opts.button, opts.pointerX, opts.pointerY, opts.pointerX, opts.pointerY,
                            opts.ctrlKey, opts.altKey, opts.shiftKey, opts.metaKey, 
                            opts.button, null
                        );
                    }
                    elem.dispatchEvent(domEvent);
                } else {
                    opts.clientX = opts.pointerX;
                    opts.clientY = opts.pointerY;
                    domEvent = document.createEventObject();
                    for (var key in opts) domEvent[key] = opts[key];
                    elem.fireEvent('on' + eventName, domEvent);
                }
            }
        }
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    /** Sets the dom element to the provided one. */
    setDomElement: function(v) {
        this.domElement = v;
        
        // Store a reference to domElement.style since it is accessed often.
        this.deStyle = v.style;
        
        // Setup a reference from the domElement to this model. This will allow
        // access to the model from code that uses JQuery or some other
        // mechanism to select dom elements.
        v.model = this;
    },
    
    /** Removes this DomElementProxy's dom element from its parent node.
        @returns void */
    removeDomElement: function() {
        var de = this.domElement;
        de.parentNode.removeChild(de);
    },
    
    /** Called when this DomElementProxy is destroyed.
        @returns void */
    disposeOfDomElement: function() {
        delete this.domElement.model;
        delete this.deStyle;
        delete this.domElement;
    },
    
    /** Sets the dom "class" attribute on the dom element.
        @param v:string the dom class name.
        @returns void */
    setDomClass: function(v) {
        this.domElement.className = this.domClass = v;
    },
    
    /** Adds a dom "class" to the existing dom classes on the dom element.
        @param v:string the dom class to add.
        @returns void */
    addDomClass: function(v) {
        var existing = this.domElement.className;
        this.setDomClass((existing ? existing + ' ' : '') + v);
    },
    
    /** Removes a dom "class" from the dom element.
        @param v:string the dom class to remove.
        @returns void */
    removeDomClass: function(v) {
        var existing = this.domElement.className;
        if (existing) {
            var parts = existing.split(' '), i = parts.length;
            while (i) {
                if (parts[--i] === v) parts.splice(i, 1);
            }
            this.setDomClass(parts.join(' '));
        }
    },
    
    /** Clears the dom "class".
        @returns void */
    clearDomClass: function() {
        this.setDomClass('');
    },
    
    /** Sets the dom "id" attribute on the dom element.
        @param v:string the dom id name.
        @returns void */
    setDomId: function(v) {
        this.domElement.id = this.domId = v;
    },
    
    /** Set the z-index of the dom element.
        @param v:number the z-index to set.
        @returns void */
    setZIndex: function(v) {
        this.deStyle.zIndex = v;
    },
    
    /** Set an arbitrary CSS style on the dom element.
        @param propertyName:string the name of the CSS property to set.
        @param v:* the value to set.
        @returns void */
    setStyleProperty: function(propertyName, v) {
        this.deStyle[propertyName] = v;
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** Gets the x and y position of the underlying dom element relative to
        the page.
        @returns object with 'x' and 'y' keys or null if no dom element exists
            for this proxy. */
    getPagePosition: function() {
        return myt.DomElementProxy.getPagePosition(this.domElement);
    },
    
    /** Generates a dom event on this proxy's dom element.
        @param eventName:string the name of the dom event to generate.
        @param customOpts:Object (optional) a map of options that will
            be added onto the dom event object.
        @returns void */
    simulateDomEvent: function(eventName, customOpts) {
        myt.DomElementProxy.simulateDomEvent(this.domElement, eventName, customOpts);
    },
    
    /** Gets the highest z-index of the dom element.
        @returns int */
    getHighestZIndex: function() {
        return myt.DomElementProxy.getHighestZIndex(this.domElement);
    }
});

(pkg => {
    const GLOBAL = global,
        getComputedStyle = GLOBAL.getComputedStyle,
        DOCUMENT_ELEMENT = document,
        
        mathMax = Math.max,
        
        /*  Gets the z-index of the dom element or, if it does not define a stacking context, 
            the highest z-index of any of the dom element's descendants.
            @param {!Object} elem - A dom element
            @returns {number} - An int */
        getHighestZIndex = elem => {
            // See https://developer.mozilla.org/en-US/docs/Web/Guide/CSS/Understanding_z_index/The_stacking_context
            const {zIndex, opacity} = getComputedStyle(elem);
            if (zIndex === 'auto') {
                if (parseInt(opacity, 10) === 1) {
                    // No new stacking context.
                    let zIdx = 0;
                    const children = elem.childNodes;
                    let i = children.length;
                    while (i) {
                        const child = children[--i];
                        if (child.nodeType === 1) zIdx = mathMax(zIdx, getHighestZIndex(child));
                    }
                    return zIdx;
                } else {
                    return 0;
                }
            } else {
                return parseInt(zIndex, 10);
            }
        },
        
        /*  Gets an array of ancestor dom elements including the element itself.
            @param {!Object} elem - The dom element to start from.
            @param {?Object} ancestor - The dom element to stop getting ancestors at.
            @returns {!Array} - An array of ancestor dom elements. */
        getAncestorArray = (elem, ancestor) => {
            const ancestors = [];
            while (elem) {
                ancestors.push(elem);
                if (elem === ancestor) break;
                elem = elem.parentNode;
            }
            return ancestors;
        };
    
    /** Provides dom elements for this instance. Typically only a single dom element will exist but 
        some components will make use of two nested elements: an inner dom element and an outer 
        dom element. Also assigns a reference to this DomElementProxy to a property named "model" 
        on the dom elements.
        
        @class */
    const DomElementProxy = pkg.DomElementProxy = new JS.Module('DomElementProxy', {
        // Class Methods ///////////////////////////////////////////////////////
        extend: {
            /** Creates a new dom element.
                @param {string} tagname - The name of the element to create.
                @param {?Object} [styles] - A map of style keys and values to add to the style 
                    property of the new element.
                @param {?Object} [props] - A map of keys and values to add to the new element.
                @returns {!Object} the created element. */
            createElement: (tagname, styles, props) => {
                const elem = DOCUMENT_ELEMENT.createElement(tagname);
                for (const key in props) elem[key] = props[key];
                for (const key in styles) elem.style[key] = styles[key];
                return elem;
            },
            
            /** Tests if a dom element is visible or not.
                @param {!Object} elem - The dom element to check visibility for.
                @returns {boolean} - True if visible, false otherwise. */
            isDomElementVisible: elem => {
                // Special Case: hidden input elements should be considered not visible.
                if (elem.nodeName !== 'INPUT' || elem.type !== 'hidden') {
                    // Walk upwards in the dom until a non-visible element is found or the
                    // document element is reached.
                    while (elem) {
                        if (elem === DOCUMENT_ELEMENT) return true;
                        
                        const {display, visibility} = getComputedStyle(elem);
                        if (display === 'none' || visibility === 'hidden') break;
                        
                        elem = elem.parentNode;
                    }
                }
                return false;
            },
            
            /** Gets the z-index of a dom element relative to an ancestor dom element.
                @param {?Object} elem
                @param {?Object} ancestor
                @returns {number} */
            getZIndexRelativeToAncestor: (elem, ancestor) => {
                if (elem && ancestor) {
                    const ancestors = getAncestorArray(elem, ancestor);
                    let i = ancestors.length - 1;
                    while (i) {
                        const style = getComputedStyle(ancestors[--i]),
                            zIdx = style.zIndex,
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
            
            getAncestorArray: getAncestorArray,
            getHighestZIndex: getHighestZIndex,
            
            /** Gets the x and y position of the dom element relative to the ancestor dom element 
                or the page. Transforms are not supported. Use getTruePosition if you need support 
                for transforms.
                @param {!Object} elem - The dom element to get the position for.
                @param {?Object} [ancestorElem] - The ancestor dom element that if encountered will 
                    halt the page position calculation thus giving the position of elem relative 
                    to ancestorElem.
                @returns {?Object} - An object with 'x' and 'y' keys or undefined if an error 
                    has occurred. */
            getRelativePosition: (elem, ancestorElem) => {
                if (elem) {
                    // elem.nodeName !== 'BODY' test prevents looking at the body which causes 
                    // problems when the document is scrolled on webkit.
                    let x = 0, 
                        y = 0;
                    while (elem && elem.nodeName !== 'BODY' && elem !== ancestorElem) {
                        x += elem.offsetLeft;
                        y += elem.offsetTop;
                        elem = elem.offsetParent;
                        if (elem && elem.nodeName !== 'BODY') {
                            const {borderLeftWidth, borderTopWidth} = getComputedStyle(elem);
                            x += parseInt(borderLeftWidth, 10) - elem.scrollLeft;
                            y += parseInt(borderTopWidth, 10) - elem.scrollTop;
                        }
                    }
                    return {x:x, y:y};
                }
            },
            
            /** Gets the x and y position of the dom element relative to the page with support 
                for transforms.
                @param {!Object} elem - The dom element to get the position for.
                @returns {?Object} - An object with 'x' and 'y' keys or undefined if an error 
                    has occurred. */
            getTruePosition: elem => {
                if (elem) {
                    const pos = elem.getBoundingClientRect();
                    pos.left += GLOBAL.scrollX;
                    pos.top += GLOBAL.scrollY;
                    return pos;
                }
            },
            
            /** Generates a dom event on a dom element. Adapted from:
                    http://stackoverflow.com/questions/6157929/how-to-simulate-mouse-click-using-javascript
                @param {!Object} elem - The dom element to simulate the event on.
                @param {string} eventName - The name of the dom event to generate.
                @param {?Object} [customOpts] - A map of options that will be added onto the dom 
                    event object.
                @returns {undefined} */
            simulateDomEvent: (elem, eventName, customOpts) => {
                if (elem) {
                    const opts = {
                            pointerX:0, pointerY:0, button:0,
                            ctrlKey:false, altKey:false, shiftKey:false, metaKey:false,
                            bubbles:true, cancelable:true
                        },
                        eventMatchers = {
                            'HTMLEvents': /^(?:load|unload|abort|error|select|change|submit|reset|focus|blur|resize|scroll)$/,
                            'MouseEvents': /^(?:click|dblclick|mouse(?:down|up|over|move|out))$/
                        };
                    
                    if (customOpts) {
                        for (const p in customOpts) opts[p] = customOpts[p];
                    }
                    
                    let eventType;
                    for (const name in eventMatchers) {
                        if (eventMatchers[name].test(eventName)) {
                            eventType = name;
                            break;
                        }
                    }
                    if (!eventType) throw new SyntaxError('Only supports HTMLEvent and MouseEvent interfaces');
                    
                    let domEvent;
                    if (DOCUMENT_ELEMENT.createEvent) {
                        domEvent = DOCUMENT_ELEMENT.createEvent(eventType);
                        if (eventType === 'HTMLEvents') {
                            domEvent.initEvent(eventName, opts.bubbles, opts.cancelable);
                        } else {
                            domEvent.initMouseEvent(
                                eventName, opts.bubbles, opts.cancelable, DOCUMENT_ELEMENT.defaultView,
                                opts.button, opts.pointerX, opts.pointerY, opts.pointerX, opts.pointerY,
                                opts.ctrlKey, opts.altKey, opts.shiftKey, opts.metaKey, 
                                opts.button, null
                            );
                        }
                        elem.dispatchEvent(domEvent);
                    } else {
                        opts.clientX = opts.pointerX;
                        opts.clientY = opts.pointerY;
                        domEvent = DOCUMENT_ELEMENT.createEventObject();
                        for (const key in opts) domEvent[key] = opts[key];
                        elem.fireEvent('on' + eventName, domEvent);
                    }
                }
            },
            
            getScrollbarSize: pkg.memoize(() => {
                // Detect if scrollbars take up space or not
                const body = DOCUMENT_ELEMENT.body,
                    elem = DomElementProxy.createElement('div', {width:'100px', height:'100px', overflow:'scroll'});
                body.appendChild(elem);
                const scrollbarSize = elem.offsetWidth - elem.clientWidth;
                body.removeChild(elem);
                return scrollbarSize;
            })
        },
        
        
        // Accessors ///////////////////////////////////////////////////////////
        /** Gets the inner dom element. If only one dom element exists then this will be the same 
            as the outer dom element.
            @returns {?Object} */
        getIDE: function() {return this.__iE;},
        
        /** Gets the outer dom element. If only one dom element exists then this will be the same 
            as the inner dom element.
            @returns {?Object} */
        getODE: function() {return this.__oE;},
        
        /** Gets the style attribute of the inner dom element. If only one dom element exists then 
            this will be the same as the outer dom style.
            @returns {?Object} */
        getIDS: function() {return this.__iS;},
        
        /** Gets the style attribute of the outer dom element. If only one dom element exists then 
            this will be the same as the inner dom style.
            @returns {?Object} */
        getODS: function() {return this.__oS;},
        
        /** Sets the dom element(s) to the provided ones. To set the inner and outer dom elements 
            to different dom elements provide an array of two dom elements.
            @param {?Object} v
            @returns {undefined} */
        setDomElement: function(v) {
            const self = this;
            if (Array.isArray(v)) {
                // Support an inner and outer dom element if an array of elements is provided.
                const [outerElem, innerElem] = v;
                self.__oE = outerElem;
                self.__iE = innerElem;
                
                // Store a reference to the dom element style property since it is accessed often.
                self.__iS = innerElem.style;
                self.__oS = outerElem.style;
                
                // Setup a reference from the dom element to this model. This will allow access to 
                // the model from code that uses some other mechanism to select dom elements.
                innerElem.model = outerElem.model = self;
            } else {
                // The inner and outer dom element are the same element since an array of elements
                // was not provided.
                self.__oE = self.__iE = v;
                
                // Store a reference to the dom element style property since it is accessed often.
                self.__iS = self.__oS = v.style;
                
                // Setup a reference from the dom element to this model. This will allow access to 
                // the model from code that uses some other mechanism to select dom elements.
                v.model = self;
            }
        },
        
        /** Removes this DomElementProxy's outer dom element from its parent node.
            @returns {undefined} */
        removeDomElement: function() {
            this.__oE.parentNode.removeChild(this.__oE);
        },
        
        /** Called when this DomElementProxy is destroyed.
            @returns {undefined} */
        disposeOfDomElement: function() {
            delete this.__iE.model;
            delete this.__iS;
            delete this.__iE;
            delete this.__oE.model;
            delete this.__oS;
            delete this.__oE;
        },
        
        /** Sets the dom "class" attribute on the inner dom element.
            @param {string} v - The dom class name.
            @returns {undefined} */
        setDomClass: function(v) {
            this.__iE.className = this.domClass = v;
        },
        
        /** Adds a dom "class" to the existing dom classes on the inner dom element.
            @param {string} v - The dom class to add.
            @returns {undefined} */
        addDomClass: function(v) {
            const existing = this.__iE.className;
            this.setDomClass((existing ? existing + ' ' : '') + v);
        },
        
        /** Removes a dom "class" from the inner dom element.
            @param {string} v - The dom class to remove.
            @returns {undefined} */
        removeDomClass: function(v) {
            const existing = this.__iE.className;
            if (existing) {
                const parts = existing.split(' ');
                let i = parts.length;
                while (i) {
                    if (parts[--i] === v) parts.splice(i, 1);
                }
                this.setDomClass(parts.join(' '));
            }
        },
        
        /** Clears the dom "class" from the inner dom element.
            @returns {undefined} */
        clearDomClass: function() {
            this.setDomClass('');
        },
        
        /** Sets the dom "id" attribute on the inner dom element.
            @param {string} v - The dom id name.
            @returns {undefined} */
        setDomId: function(v) {
            this.__iE.id = this.domId = v;
        },
        
        /** Set the z-index of the outer dom element.
            @param {number} v - The z-index to set.
            @returns {undefined} */
        setZIndex: function(v) {
            this.__oS.zIndex = v;
        },
        
        /** Set an arbitrary CSS style on the inner dom element style.
            @param {string} propertyName - The name of the CSS property to set.
            @param {*} v - The value to set.
            @returns {undefined} */
        setStyleProperty: function(propertyName, v) {
            this.__iS[propertyName] = v;
        },
        
        
        // Methods /////////////////////////////////////////////////////////////
        /** Gets the x and y position of the underlying inner dom element relative to the page. 
            Transforms are not supported by default.
            @param {boolean} [transformSupport] If true then transforms applied to the dom elements 
                are supported.
            @returns {?Object} - An object with 'x' and 'y' keys or undefined if an error 
                has occurred. */
        getPagePosition: function(transformSupport) {
            return DomElementProxy['get' + (transformSupport ? 'True' : 'Relative') + 'Position'](this.__iE);
        },
        
        /** Generates a dom event "click" on this DomElementProxy's inner dom element.
            @returns {undefined} */
        simulateClick: function() {
            DomElementProxy.simulateDomEvent(this.__iE, 'click');
        },
        
        /** Gets the highest z-index of the inner dom element.
            @returns {number} - An int */
        getHighestZIndex: function() {
            return getHighestZIndex(this.__iE);
        },
        
        /** Gets the highest z-index of any of the descendant dom elements of the inner dom element 
            of this DomElementProxy.
            @param {boolean} [skipChild] - A dom element to skip over when determining the z-index.
            @returns {number} - An int. */
        getHighestChildZIndex: function(skipChild) {
            const children = this.__iE.childNodes;
            let i = children.length, 
                zIdx = 0;
            while (i) {
                const child = children[--i];
                if (child.nodeType === 1 && child !== skipChild) zIdx = mathMax(zIdx, getHighestZIndex(child));
            }
            return zIdx;
        },
        
        /** Makes this DomElementProxy's outer dom element the one with the highest z-index 
            relative to its sibling dom elements.
            @returns {undefined} */
        makeHighestZIndex: function() {
            this.setZIndex(this.parent.getHighestChildZIndex(this.__iE) + 1);
        },
        
        /** Scrolls the dom element to the provided position or zero if no value is provided.
            @param {number} [value] - The value to scroll to.
            @param {boolean} [scrollInner] - Indicates if the inner dom element should be used 
                instead of the outer dom element.
            @returns {undefined} */
        scrollYTo: function(value, scrollInner) {
            (scrollInner ? this.__iE : this.__oE).scrollTop = value || 0;
        }
    });
})(myt);
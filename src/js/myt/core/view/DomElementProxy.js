((pkg) => {
    const GLOBAL = global;
    
    /** Provides a dom element for this instance. Also assigns a reference to this
        DomElementProxy to a property named "model" on the dom element.
        
        Events:
            None
        
        Attributes:
            domElement:domElement the dom element hidden we are a proxy for.
            deStyle:object a shortcut reference to the style attribute of 
                the dom element.
        
        @class */
    const DomElementProxy = pkg.DomElementProxy = new JS.Module('DomElementProxy', {
        // Class Methods ///////////////////////////////////////////////////////
        extend: {
            /** Creates a new dom element.
                @param {string} tagname - The name of the element to create.
                @param {?Object} [styles] - A map of style keys and values to 
                    add to the style property of the new element.
                @param {?Object} [props] - A map of keys and values to add to 
                    the new element.
                @returns {!Object} the created element. */
            createDomElement: (tagname, styles, props) => {
                const de = document.createElement(tagname);
                let key;
                if (props) for (key in props) de[key] = props[key];
                if (styles) for (key in styles) de.style[key] = styles[key];
                return de;
            },
            
            /** Tests if a dom element is visible or not.
                @param {!Object} elem - The domElement to check visibility for.
                @returns {boolean} - True if visible, false otherwise. */
            isDomElementVisible: (elem) => {
                // Special Case: hidden input elements should be considered not visible.
                if (elem.nodeName === 'INPUT' && elem.type === 'hidden') return false;
                
                while (elem) {
                    if (elem === document) return true;
                    
                    const style = GLOBAL.getComputedStyle(elem);
                    if (style.display === 'none' || style.visibility === 'hidden') break;
                    
                    elem = elem.parentNode;
                }
                return false;
            },
            
            /** Gets the z-index of a dom element relative to an ancestor dom
                element.
                @param {?Object} elem
                @param {?Object} ancestor
                @returns {number} */
            getZIndexRelativeToAncestor: (elem, ancestor) => {
                if (elem && ancestor) {
                    const ancestors = DomElementProxy.getAncestorArray(elem, ancestor);
                    let i = ancestors.length - 1;
                    while (i) {
                        const style = GLOBAL.getComputedStyle(ancestors[--i]),
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
            
            /** Gets an array of ancestor dom elements including the element
                itself.
                @param {!Object} elem - The domElement to start from.
                @param {?Object} ancestor - The domElement to stop
                    getting ancestors at.
                @returns {!Array} - An array of ancestor dom elements. */
            getAncestorArray: (elem, ancestor) => {
                const ancestors = [];
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
                @param {!Object} elem - A domElement
                @returns {number} - An int */
            getHighestZIndex: (elem) => {
                // See https://developer.mozilla.org/en-US/docs/Web/Guide/CSS/Understanding_z_index/The_stacking_context
                const style = GLOBAL.getComputedStyle(elem);
                let zIdx = style.zIndex;
                const isAuto = zIdx === 'auto';
                if (isAuto && parseInt(style.opacity, 10) === 1) {
                    // No new stacking context.
                    zIdx = 0;
                    const children = elem.childNodes;
                    let i = children.length;
                    while (i) {
                        const child = children[--i];
                        if (child.nodeType === 1) zIdx = Math.max(zIdx, DomElementProxy.getHighestZIndex(child));
                    }
                } else {
                    zIdx = isAuto ? 0 : parseInt(zIdx, 10);
                }
                return zIdx;
            },
            
            /** Gets the x and y position of the dom element relative to the 
                ancestor dom element or the page. Transforms are not supported.
                Use getTruePagePosition if you need support for transforms.
                @param {!Object} elem - The domElement to get the position for.
                @param {?Object} [ancestorElem] - The ancestor domElement
                    that if encountered will halt the page position calculation
                    thus giving the position of elem relative to ancestorElem.
                @returns {?Object} - An object with 'x' and 'y' keys or null 
                    if an error has occurred. */
            getPagePosition: (elem, ancestorElem) => {
                if (!elem) return null;
                
                const borderMultiplier = BrowserDetect.browser === 'Firefox' ? 2 : 1; // I have no idea why firefox needs it twice, but it does.
                let x = 0, 
                    y = 0;
                
                // elem.nodeName !== "BODY" test prevents looking at the body
                // which causes problems when the document is scrolled on webkit.
                while (elem && elem.nodeName !== "BODY" && elem !== ancestorElem) {
                    x += elem.offsetLeft;
                    y += elem.offsetTop;
                    elem = elem.offsetParent;
                    if (elem && elem.nodeName !== "BODY") {
                        const s = GLOBAL.getComputedStyle(elem);
                        x += borderMultiplier * parseInt(s.borderLeftWidth, 10) - elem.scrollLeft;
                        y += borderMultiplier * parseInt(s.borderTopWidth, 10) - elem.scrollTop;
                    }
                }
                
                return {x:x, y:y};
            },
            
            /** Gets the x and y position of the dom element relative to the page
                with support for transforms.
                @param {!Object} elem - The domElement to get the position for.
                @returns {?Object} - An object with 'x' and 'y' keys or null 
                    if an error has occurred. */
            getTruePagePosition: (elem) => {
                if (!elem) return null;
                const pos = $(elem).offset();
                return {x:pos.left, y:pos.top};
            },
            
            /** Generates a dom event on a dom element. Adapted from:
                    http://stackoverflow.com/questions/6157929/how-to-simulate-mouse-click-using-javascript
                @param {!Object} elem - The domElement to simulate the event on.
                @param {string} eventName - The name of the dom event to generate.
                @param {?Object} [customOpts] - A map of options that will
                    be added onto the dom event object.
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
                        for (let p in customOpts) opts[p] = customOpts[p];
                    }
                    
                    let eventType;
                    for (let name in eventMatchers) {
                        if (eventMatchers[name].test(eventName)) {
                            eventType = name;
                            break;
                        }
                    }
                    if (!eventType) throw new SyntaxError('Only HTMLEvent and MouseEvent interfaces supported');
                    
                    let domEvent;
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
                        for (let key in opts) domEvent[key] = opts[key];
                        elem.fireEvent('on' + eventName, domEvent);
                    }
                }
            }
        },
        
        
        // Accessors ///////////////////////////////////////////////////////////
        getInnerDomElement: function() {
            return this.domElement;
        },
        
        getOuterDomElement: function() {
            return this.__oE;
        },
        
        getInnerDomStyle: function() {
            return this.deStyle;
        },
        
        getOuterDomStyle: function() {
            return this.__oS;
        },
        
        /** Sets the dom element(s) to the provided one.
            @param {?Object} v
            @returns {undefined} */
        setDomElement: function(v) {
            // Support an inner and outer dom element if an array of elements is
            // provided.
            const self = this;
            let outerElem,
                innerElem;
            if (Array.isArray(v)) {
                outerElem = v[0];
                innerElem = v[1];
            } else {
                outerElem = innerElem = v;
            }
            
            self.domElement = innerElem;
            self.__oE = outerElem;
            
            // Store a reference to domElement.style since it is accessed often.
            self.deStyle = innerElem.style;
            self.__oS = outerElem.style;
            
            // Setup a reference from the domElement to this model. This will allow
            // access to the model from code that uses JQuery or some other
            // mechanism to select dom elements.
            innerElem.model = outerElem.model = self;
        },
        
        /** Removes this DomElementProxy's dom element from its parent node.
            @returns {undefined} */
        removeDomElement: function() {
            const ode = this.getOuterDomElement();
            ode.parentNode.removeChild(ode);
        },
        
        /** Called when this DomElementProxy is destroyed.
            @returns {undefined} */
        disposeOfDomElement: function() {
            delete this.domElement.model;
            delete this.deStyle;
            delete this.domElement;
            
            delete this.__oE.model;
            delete this.__oS;
            delete this.__oE;
        },
        
        /** Sets the dom "class" attribute on the dom element.
            @param {string} v - The dom class name.
            @returns {undefined} */
        setDomClass: function(v) {
            this.domElement.className = this.domClass = v;
        },
        
        /** Adds a dom "class" to the existing dom classes on the dom element.
            @param {string} v - The dom class to add.
            @returns {undefined} */
        addDomClass: function(v) {
            const existing = this.domElement.className;
            this.setDomClass((existing ? existing + ' ' : '') + v);
        },
        
        /** Removes a dom "class" from the dom element.
            @param {string} v - The dom class to remove.
            @returns {undefined} */
        removeDomClass: function(v) {
            const existing = this.domElement.className;
            if (existing) {
                const parts = existing.split(' ');
                let i = parts.length;
                while (i) {
                    if (parts[--i] === v) parts.splice(i, 1);
                }
                this.setDomClass(parts.join(' '));
            }
        },
        
        /** Clears the dom "class".
            @returns {undefined} */
        clearDomClass: function() {
            this.setDomClass('');
        },
        
        /** Sets the dom "id" attribute on the dom element.
            @param {string} v - The dom id name.
            @returns {undefined} */
        setDomId: function(v) {
            this.domElement.id = this.domId = v;
        },
        
        /** Set the z-index of the dom element.
            @param {number} v - The z-index to set.
            @returns {undefined} */
        setZIndex: function(v) {
            this.deStyle.zIndex = v;
        },
        
        /** Set an arbitrary CSS style on the dom element.
            @param {string} propertyName - The name of the CSS property to set.
            @param {*} v - The value to set.
            @returns {undefined} */
        setStyleProperty: function(propertyName, v) {
            this.deStyle[propertyName] = v;
        },
        
        
        // Methods /////////////////////////////////////////////////////////////
        /** Gets the x and y position of the underlying dom element relative to
            the page. Transforms are not supported.
            @returns {?Object} - An object with 'x' and 'y' keys or null 
                if an error has occurred. */
        getPagePosition: function() {
            return DomElementProxy.getPagePosition(this.domElement);
        },
        
        /** Gets the x and y position of the underlying dom element relative 
            to the page with support for transforms.
            @returns {?Object} - An object with 'x' and 'y' keys or null 
                if an error has occurred. */
        getTruePagePosition: function() {
            return DomElementProxy.getTruePagePosition(this.domElement);
        },
        
        /** Generates a dom event "click" on this proxy's dom element.
            @returns {undefined} */
        simulateClick: function() {
            DomElementProxy.simulateDomEvent(this.domElement, 'click');
        },
        
        /** Gets the highest z-index of the dom element.
            @returns {number} - An int */
        getHighestZIndex: function() {
            return DomElementProxy.getHighestZIndex(this.domElement);
        },
        
        /** Gets the highest z-index of any of the descendant dom elements of
            the domElement of this DomElementProxy.
            @param {boolean} [skipChild] - A domElement to skip over
                when determining the z-index.
            @returns {number} - An int. */
        getHighestChildZIndex: function(skipChild) {
            const children = this.domElement.childNodes;
            let i = children.length, 
                zIdx = 0;
            while (i) {
                const child = children[--i];
                if (child.nodeType === 1 && child !== skipChild) zIdx = Math.max(zIdx, DomElementProxy.getHighestZIndex(child));
            }
            return zIdx;
        },
        
        /** Makes this dom element proxy the one with the highest z-index 
            relative to its sibling dom elements.
            @returns {undefined} */
        makeHighestZIndex: function() {
            this.setZIndex(this.parent.getHighestChildZIndex(this.domElement) + 1);
        },
        
        /** Scrolls the dom element to the provided position or zero if no
            value is provided.
            @param {number} [value] - The value to scroll to.
            @param {boolean} [scrollInner] - Indicates if the inner dom element
                should be used instead of the outer dom element.
            @returns {undefined} */
        scrollYTo: function(value, scrollInner) {
            (scrollInner ? this.getInnerDomElement() : this.getOuterDomElement()).scrollTop = value || 0;
        }
    });
})(myt);

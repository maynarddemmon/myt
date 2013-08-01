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
            @param styles:object a map of style keys and values to add to the
                new element.
            @returns the created element. */
        createDomElement: function(tagname, styles) {
            var elem = document.createElement(tagname);
            if (styles) {
                var style = elem.style;
                for (var key in styles) style[key] = styles[key];
            }
            return elem;
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
                
                style = elem.style;
                if (!style) {
                    // Try the computed style in a standard way, or get the 
                    // computed style using IE's silly proprietary way
                    style = window.getComputedStyle ? window.getComputedStyle(elem, "") : elem.currentStyle;
                }
                if (style.display === 'none' || style.visibility === 'hidden') return false;
                
                elem = elem.parentNode;
            }
            return false;
        },
        
        /** Gets the x and y position of the underlying dom element relative to
            the page.
            @param elem:domElement the dom element to get the position for.
            @returns object with 'x' and 'y' keys. */
        getPagePosition: function(elem) {
            var x = y = 0;
            
            // de.nodeName !== "BODY" test prevents us from looking at the body
            // which causes problems when the document is scrolled on webkit.
            while (elem && elem.nodeName !== "BODY" && !isNaN(elem.offsetLeft) && !isNaN(elem.offsetTop)) {
                x += elem.offsetLeft - elem.scrollLeft;
                y += elem.offsetTop - elem.scrollTop;
                elem = elem.offsetParent;
            }
            
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
    
    /** Removes this DomElementProxy's dom element from its parent node. */
    removeDomElement: function() {
        var de = this.domElement;
        de.parentNode.removeChild(de);
    },
    
    /** Called when this DomElementProxy is destroyed. */
    disposeOfDomElement: function() {
        delete this.domElement.model;
        delete this.deStyle;
        delete this.domElement;
    },
    
    /** Sets the dom "class" attribute on the dom element.
        @param v:string the dom class name. */
    setDomClass: function(v) {
        this.domElement.className = this.domClass = v;
    },
    
    // TODO: test this
    addDomClass: function(v) {
        this.domClass += v;
        this.domElement.className = this.domClass;
    },
    
    // TODO: test this
    removeDomClass: function(v) {
        var regex = new RegExp('(?:^|\s)' + v + '(?!\S)', 'g');
        this.domClass.replace(regex, '');
        this.domElement.className = this.domClass;
    },
    
    /** Sets the dom "id" attribute on the dom element.
        @param v:string the dom id name. */
    setDomId: function(v) {
        this.domElement.id = this.domId = v;
    },
    
    // Misc CSS Accesors ///////////////////////////////////////////////////////
    /** A convienence method for setting a CSS border.
        @param v:Array where index 0 is the size, index 1 is the type and
            index 2 is the color. */
    setCSSBorder: function(v) {
        this.CSSBorder = v;
        if (v) {
            var size = v[0] || 0,
                type = v[1] || '',
                color = v[2] || '';
            this.deStyle.border = size + 'px' + ' ' + type + ' ' + color;
        } else {
            this.deStyle.border = '0px';
        }
    },
    
    /** A convienence method for setting a CSS outline.
        @param v:Array where index 0 is the size, index 1 is the type and
            index 2 is the color. */
    setCSSOutline: function(v) {
        this.CSSOutline = v;
        if (v) {
            var size = v[0] || 0,
                type = v[1] || '',
                color = v[2] || '';
            this.deStyle.outline = size + 'px' + ' ' + type + ' ' + color;
        } else {
            this.deStyle.outline = '0px';
        }
    },
    
    /** A convienence method to set rounded corners on an element.
        @param radius:number the radius of the corners.
        @returns void */
    setRoundedCorners: function(radius) {
        this.setStyleProperty('borderRadius', radius + 'px');
    },
    
    /** Set an arbitrary css style on the dom element. */
    setStyleProperty: function(propertyName, value) {
        this.deStyle[propertyName] = value;
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** Gets the x and y position of the underlying dom element relative to
        the page.
        @returns object with 'x' and 'y' keys or null if no dom element exists
            for this proxy. */
    getPagePosition: function() {
        var elem = this.domElement;
        if (elem) {
            return myt.DomElementProxy.getPagePosition(elem);
        } else {
            return null;
        }
    },
    
    /** Generates a dom event on this proxy's dom element. Adapted from:
            http://stackoverflow.com/questions/6157929/how-to-simulate-mouse-click-using-javascript
        @param eventName:string the name of the dom event to generate.
        @param customOpts:Object (optional) a map of options that will
            be added onto the dom event object.
        @returns void */
    simulateDomEvent: function(eventName, customOpts) {
        var elem = this.domElement;
        if (elem) myt.DomElementProxy.simulateDomEvent(elem, eventName, customOpts);
    }
});

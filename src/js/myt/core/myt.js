/**
 * Myt: A simple javascript UI framework
 * http://github.com/maynarddemmon/myt
 * Copyright (c) 2012-2013 Maynard Demmon and contributors
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * Parts of the Software incorporates code and/or design patterns from various
 * public domain sources and has been noted as such in the source.
 * 
 * Parts of the Software incorporates code from the following open-source 
 * projects:
 * * JS.Class, (c) 2007-2012 James Coglan and contributors (MIT License)
 * * Easing Functions, (c) 2001 Robert Penner (BSD License)
 * * jQuery Easing v1.3, (c) 2008 George McGinley Smith (BSD License)
 * * jQuery Cookie Plugin v1.3.1, (c) 2013 Klaus Hartl (MIT License)
 * * parseUri 1.2.2, (c) Steven Levithan <stevenlevithan.com> (MIT License)
 * * Spin.js 1.3.0 (c) 2011-2013 Felix Gnass (the MIT license)
 * * k-d Tree JavaScript - v1.0 (c) Mircea Pricop <pricop@ubilabs.net>,
 *                                  Martin Kleppe <kleppe@ubilabs.net>,
 *                                  Ubilabs http://ubilabs.net (MIT License)
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
myt = {
    /** The root path to image assets for the myt package. MYT_IMAGE_ROOT
        should be set by the page that includes this script. */
    IMAGE_ROOT: global.MYT_IMAGE_ROOT || '',
    
    /** Used to generate globally unique IDs. */
    __GUID_COUNTER: 0,
    
    /** Generates a globally unique id, (GUID).
        @return number */
    generateGuid: function() {
        return ++this.__GUID_COUNTER;
    },
    
    /** Event listener code Adapted from:
            http://javascript.about.com/library/bllisten.htm
        A more robust solution can be found here:
            http://msdn.microsoft.com/en-us/magazine/ff728624.aspx */
    addEventListener: function() {
        if (window.addEventListener) {
            /** Adds an event listener to a dom element. 
                @param elem:DomElement the dom element to listen to.
                @param type:string the name of the event to listen to.
                @param callback:function the callback function that will be
                    registered for the event.
                @param capture:boolean (optional) indicates if the listener is 
                    registered during the capture phase or bubble phase.
                @returns void */
            return function(elem, type, callback, capture) {
                elem.addEventListener(type, callback, capture !== undefined ? capture : false);
            };
        } else {
            return function(elem, type, callback) {
                var prop = type + callback;
                elem['e' + prop] = callback;
                elem[prop] = function(){elem['e' + prop](window.event);}
                elem.attachEvent('on' + type, elem[prop]);
            };
        }
    }(),
    removeEventListener: function() {
        if (window.addEventListener) {
            return function(elem, type, callback, capture) {
                elem.removeEventListener(type, callback, capture !== undefined ? capture : false);
            };
        } else {
            return function(elem, type, callback) {
                var prop = type + callback;
                elem.detachEvent('on' + type, elem[prop]);
                elem[prop] = null;
                elem["e" + prop] = null;
            };
        }
    }(),
    
    /** Takes a '.' separated string such as "foo.bar.baz" and resolves it
        into the value found at that location relative to a starting scope.
        If no scope is provided global scope is used.
        @param objName:string|array the name to resolve or an array of path
            parts in descending order.
        @param scope:Object (optional) the scope to resolve from. If not
            provided global scope is used.
        @returns the referenced object or undefined if resolution failed. */
    resolveName: function(objName, scope) {
        if (!objName || objName.length === 0) return undefined;
        
        var scope = scope || global;
        var parts = Array.isArray(objName) ? objName : objName.split(".");
        for (var i = 0, len = parts.length; i < len; i++) {
            scope = scope[parts[i]];
            if (!scope) {
                console.warn("resolveName failed for ", objName, " at part: ", i, parts[i]);
                return undefined;
            }
        }
        return scope;
    },
    
    // Text Templating
    /** Populates a text "template" with 1 or more arguments. The
        template consists of a string with text interspersed with 
        curly-braced indices. The arguments are replaced in order one at
        a time into the template. For example:
        
            myt.fillTextTemplate("{0}/{2}/{1} hey {0}", 1, 2, 3) 
            will return "1/3/2 hey 1".
        
        @param (first arg):string The template to use.
        @param (remaining args):(coerced to string) The parameters for the
            template.
        @returns A populated string. */
    fillTextTemplate: function() {
        var params = Array.prototype.slice.call(arguments),
            template = params.shift();
        
        if (template == null) return '';
        
        var param, i = 0, len = params.length;
        for (; len > i; ++i) {
            param = params[i];
            template = template.split("{" + i + "}").join(param == null ? '' : param);
        }
        return template;
    },
    
    /** Generates the text for an "a href" html element that when clicked on
        executes a provided callback method name. To resolve the callback
        method name, an ancestor search is performed on the dom starting with
        the link element. The first myt managed dom element encountered is
        used as the scope for the method.
        @param text:string the text to put inside the link.
        @param callbackMethodName:string the name of the method to execute.
        @param attrs:object (optional) a map of additional attributes that
            will be inserted into the tag.
        @param data:object (optional) Data that will be serialized as JSON
            and provided to the link handler.
        @returns void */
    generateLink: function(text, callbackMethodName, attrs, data) {
        var optAttrs = '';
        if (attrs) {
            for (var name in attrs) optAttrs += ' ' + name + '="' + attrs[name] + '"';
        }
        
        return this.fillTextTemplate(
            '<a href="#" onclick=\'myt._handleGeneratedLink(this, "{0}", &apos;{3}&apos;); return false;\'{2}>{1}</a>', 
            callbackMethodName, text, optAttrs, JSON.stringify(data)
        );
    },
    
    /** See myt.generateLink for documentation.
        @returns void */
    _handleGeneratedLink: function(elem, callbackMethodName, data) {
        var model;
        while (elem) {
            model = elem.model;
            if (model) {
                var value;
                try {
                    if (data) value = JSON.parse(data);
                } catch(e) {
                    myt.dumpStack(e);
                }
                
                model[callbackMethodName].call(model, value);
                break;
            }
            elem = elem.parentNode;
        }
    },
    
    /** Dynamically load a script into the dom.
        @param src:string the URL to the script file.
        @param callback:function a callback when the script loads.
        @returns void */
    loadScript: function(src, callback) {
        // Prevent reloading the same script
        if (!this._loadedScripts) this._loadedScripts = {};
        if (this._loadedScripts[src]) {
            console.warn("script already loaded for src", src);
            return;
        }
        this._loadedScripts[src] = true;
        
        var s = document.createElement('script');
        s.type = 'text/javascript';
        s.src = src + '?cacheBust=' + Date.now();
        if (callback) {
            var r = false;
            s.onload = s.onreadystatechange = function() {
                if (!r && (!this.readyState || this.readyState == 'complete')) {
                    r = true; // Prevent refiring callback
                    callback();
                }
            };
        }
        this.getElement('head').appendChild(s);
    },
    
    /** Used to wrap the first function with the second function. The first
        function is exposed as this.callSuper within the wrapper function.
        @param fn:function the function to wrap.
        @param wrapperFn:function the wrapper function.
        @returns a wrapped function. */
    wrapFunction: function(fn, wrapperFn) {
        return function() {
            // Store existing callSuper function so we can put it back later.
            var oldSuper = this.callSuper;
            
            // Assign new callSuper and execute wrapperFn
            this.callSuper = fn;
            var retval = wrapperFn.apply(this, arguments);
            
            // Restore existing callSuper or delete new callSuper
            if (oldSuper !== undefined) {
                this.callSuper = oldSuper;
            } else {
                delete this.callSuper;
            }
            
            return retval;
        };
    },
    
    /** Dumps a stacktrace to the console.
        @param err: Error:string the error or message to dump stack for.
        @param type:string (optional) the type of console message to write.
            Allowed values are 'error', 'warn', 'log' and 'debug'. Defaults to
            'error'.
        @returns void */
    dumpStack: function(err, type) {
        if (typeof err === 'string') err = new Error(err);
        console[type ? type : 'error'](err.stack || err.stacktrace)
    },
    
    // Collection Utilities
    /** Removes an item or items from the provided array that matches based 
        on the provided search function.
        @param arr:array the array to search.
        @param search:function|object (optional) the function used to determine
            a match or an object to search for. If not provided all undefined
            array values will be removed. The search function takes two
            arguments: the first is the index of the item in the array and
            the second is the item to match against, and should return true 
            if the item should be removed.
        @param multiple:boolean (optional) if true all items matching the
            search will be removed and returned. Defaults to false.
        @returns the removed item or null if not found, or an array of removed
            items if multiple is true. */
    filterArray: function(arr, search, multiple) {
        var retval = multiple ? [] : null;
        
        if (Array.isArray(arr)) {
            var i = arr.length, value,
                matchFunc = (search == null || typeof search !== 'function') ? function(i, v) {return v === search;} : search;
            while (i) {
                value = arr[--i];
                if (matchFunc(i, value)) {
                    arr.splice(i, 1);
                    if (multiple) {
                        retval.push(value);
                    } else {
                        return value;
                    }
                }
            }
        }
        
        return retval;
    },
    
    /** Removes an item or items from the provided object that matches based 
        on the provided search function.
        @param obj:object the object to search.
        @param search:function|object (optional) the function used to determine
            a match or an object to search for. If not provided all undefined
            object values will be removed. The search function takes two 
            arguments, the object and the value for that key, and should 
            return true if the item should be removed.
        @param multiple:boolean (optional) if true all items matching the
            search will be removed and returned. Defaults to false.
        @returns the removed item or null if not found, or an array of removed
            items if multiple is true. */
    filterObject: function(obj, search, multiple) {
        var retval = multiple ? [] : null;
        
        if (obj && typeof obj === 'object') {
            var keys = Object.keys(obj), i = keys.length, key, value,
                matchFunc = (search == null || typeof search !== 'function') ? function(k, v) {return v === search;} : search;
            while (i) {
                key = keys[--i];
                value = obj[key];
                if (matchFunc(key, value)) {
                    delete obj[key];
                    if (multiple) {
                        retval.push(value);
                    } else {
                        return value;
                    }
                }
            }
        }
        
        return retval;
    },
    
    // Random numbers
    /** @returns a random number between 0 (inclusive) and 1 (exclusive)
        @param func:function (optional) a distribution function for the
            random numbers. The function should map a number between 0 and 1
            to another number between 0 (inclusive) and 1 (exclusive). If not 
            provided a flat distribution will be used. Example functions:
                - function(v) {return v * v;} will skew the value towards 0.
                - function(v) {return 0.9999999999 - v * v;} will skew the 
                  value towards a value very close to 1.
        @returns number: a random number between 0 and almost 1. */
    getRandom: function(func) {
        var v = Math.random();
        if (func) {
            v = func(v);
            
            // Correct for badly behaved skew functions.
            if (v >= 1) {
                v = 0.9999999999;
            } else if (v < 0) {
                v = 0;
            }
        }
        return v;
    },
    
    /** @returns a random number between min (inclusive) and max (exclusive).
        @param min:number the minimum value returned.
        @param max:number the maximum value returned.
        @param func:function a skew function. See myt.getRandom for more info.
        @returns number: between min and max. */
    getRandomArbitrary: function(min, max, func) {
        if (min > max) {
            var tmp = min;
            min = max;
            max = tmp;
        }
        return this.getRandom(func) * (max - min) + min;
    },
    
    /** @returns a random integer between min (inclusive) and max (inclusive)
        @param min:number the minimum value returned.
        @param max:number the maximum value returned.
        @param func:function a skew function. See myt.getRandom for more info.
        @returns number: an integer between min and max. */
    getRandomInt: function(min, max, func) {
        if (min > max) {
            var tmp = min;
            min = max;
            max = tmp;
        }
        return Math.floor(this.getRandom(func) * (max - min + 1) + min);
    },
    
    // Equality
    /** Tests if two floats are essentially equal to each other.
        @param a:float
        @param b:float
        @param epsilon:float (optional) the percent of difference allowed
            between a and b. Defaults to 0.000001 if not provided.
        @return true if equal, false otherwise. */
    areFloatsEqual: function(a, b, epsilon) {
        var A = Math.abs(a), B = Math.abs(b);
        epsilon = epsilon ? Math.abs(epsilon) : 0.000001;
        return Math.abs(a - b) <= (A > B ? B : A) * epsilon;
    },
    
    /** Tests if two array are equal. For a more complete deep equal
        implementation use underscore.js */
    areArraysEqual: function(a, b) {
        if (a === b) return true;
        if (a == null || b == null) return false;
        if (a.length !== b.length) return false;
        
        var i = a.length;
        while (i) {
            if (a[--i] !== b[i]) return false;
        }
        return true;
    },
    
    // DOM
    /** Gets the dom element of the provided tagname and index.
        @param tagname:string (optional) the name of the tag to search for.
            Defaults to 'body' if not provided
        @param index:int (optional) the index of the tag to get. Defaults to
            0 if not provided.
        @returns a dom element or undefined if none exist. */
    getElement: function(tagname, index) {
        return document.getElementsByTagName(tagname ? tagname : 'body')[index > 0 ? index : 0];
    },
    
    // Misc
    /** Make a deep copy of an object.
        @param obj:object the object to copy.
        @returns object a copy of the object. */
    clone: function(obj) {
        return JSON.parse(JSON.stringify(obj));
    }
};

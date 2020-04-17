/**
 * http://github.com/maynarddemmon/myt
 * Maynard Demmon <maynarddemmon@gmail.com.
 * @copyright Copyright (c) 2012-2018 Maynard Demmon and contributors
 * Myt: A simple javascript UI framework
 * Version: 20170326.2144
 * MIT License
 * 
 * Parts of the Software incorporates code from the following open-source projects:
 * * JS.Class, (c) 2007-2012 James Coglan and contributors (MIT License)
 * * Easing Functions, (c) 2001 Robert Penner (BSD License)
 * * jQuery Easing v1.3, (c) 2008 George McGinley Smith (BSD License)
 * * jQuery Cookie Plugin v1.3.1, (c) 2013 Klaus Hartl (MIT License)
 * * parseUri 1.2.2, (c) Steven Levithan <stevenlevithan.com> (MIT License)
 * * Spin.js 1.3.0 (c) 2011-2013 Felix Gnass (the MIT license)
 * * date.format Date:03/10/15, Copyright (c) 2005 Jacob Wright https://github.com/jacwright/date.format
 * * k-d Tree JavaScript - v1.0 (c) Mircea Pricop <pricop@ubilabs.net>,
 *                                  Martin Kleppe <kleppe@ubilabs.net>,
 *                                  Ubilabs http://ubilabs.net (MIT License)
 */
myt = (() => {
    class FetchError extends Error {
        constructor(status, url, ...params) {
            super(...params);
            this.name = 'FetchError';
            this.status = status;
            this.url = url;
        }
    }
    
    var 
        /** Used to generate globally unique IDs. */
        GUID_COUNTER = 0,
        
        exports = {
            /** A version number based on the time this distribution of myt was
                created. */
            version:20200416.1227,
            
            /** The root path to image assets for the myt package. MYT_IMAGE_ROOT
                should be set by the page that includes this script. */
            IMAGE_ROOT: global.MYT_IMAGE_ROOT || '',
            
            /** Generates a globally unique id, (GUID).
                @return number */
            generateGuid: () => ++GUID_COUNTER,
            
            /** Adds an event listener to a dom element. 
                @param elem:DomElement the dom element to listen to.
                @param type:string the name of the event to listen to.
                @param callback:function the callback function that will be
                    registered for the event.
                @param capture:boolean (optional) indicates if the listener is 
                    registered during the capture phase or bubble phase.
                @returns void */
            addEventListener: (elem, type, callback, capture, passive) => {
                elem.addEventListener(type, callback, {
                    capture:capture || false,
                    passive:passive || false
                });
            },
            removeEventListener: (elem, type, callback, capture) => {
                elem.removeEventListener(type, callback, capture || false);
            },
            
            /** Takes a '.' separated string such as "foo.bar.baz" and resolves it
                into the value found at that location relative to a starting scope.
                If no scope is provided global scope is used.
                @param objName:string|array The name to resolve or an array of path
                    parts in descending order.
                @param scope:Object (optional) The scope to resolve from. If not
                    provided global scope is used.
                @returns The referenced object or undefined if resolution failed. */
            resolveName: (objName, scope) => {
                if (!objName || objName.length === 0) return undefined;
                
                var scope = scope || global,
                    parts = Array.isArray(objName) ? objName : objName.split("."),
                    i = 0, len = parts.length;
                for (; i < len; ++i) {
                    scope = scope[parts[i]];
                    if (scope === undefined) {
                        console.warn("resolveName failed for:", objName, "at part:", i, parts[i]);
                        return undefined;
                    }
                }
                return scope;
            },
            
            /** Resolves a provided string into a JS.Class object. If a non-string 
                value is provided it is verified to be a JS.Class object.
                @param value:string:* The value to resolve and/or verify.
                @returns a JS.Class object or null if the string could not be resolved
                    or the value was not a JS.Class object. */
            resolveClassname: (value) => {
                if (typeof value === 'string') value = exports.resolveName(value);
                
                // Make sure what we found is really a JS.Class otherwise return null.
                return (value && typeof value.isA === 'function' && value.isA(JS.Class)) ? value : null;
            },
            
            /** Gets the file extension from a file name.
                @param fileName:string The filename to extract the extension from.
                @returns a string of the file extension or null if a falsy fileName
                    argument was provided. */
            getExtension: function(fileName) {
                return fileName ? fileName.split('.')[1] : null;
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
            fillTextTemplate: function(...params) {
                var template = params.shift(),
                    param,
                    i,
                    len;
                
                if (template == null) return '';
                
                i = 0;
                len = params.length;
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
            generateLink: (text, callbackMethodName, attrs, data) => {
                var optAttrs = '',
                    name;
                if (attrs) {
                    for (name in attrs) optAttrs += ' ' + name + '="' + attrs[name] + '"';
                }
                
                return exports.fillTextTemplate(
                    '<a href="#" onclick=\'myt.__handleGeneratedLink(this, "{0}", &apos;{3}&apos;); return false;\'{2}>{1}</a>', 
                    callbackMethodName, text, optAttrs, JSON.stringify(data)
                );
            },
            
            /** See myt.generateLink for documentation.
                @private
                @returns void */
            __handleGeneratedLink: (elem, callbackMethodName, data) => {
                var model,
                    value;
                while (elem) {
                    model = elem.model;
                    if (model) {
                        try {
                            if (data) value = JSON.parse(data);
                        } catch(e) {
                            exports.dumpStack(e);
                        }
                        
                        model[callbackMethodName].call(model, value);
                        break;
                    }
                    elem = elem.parentNode;
                }
            },
            
            /** Dynamically load a script into the dom.
                @param src:string the URL to the script file.
                @param callback:function (optional) A function that will be called
                    when the script loads.
                @param noCacheBust:boolean (optional) If true, not cacheBust query
                    param will be added. Defaults to undefined which is equivalent
                    to false.
                @returns The created script element or null if the script has already
                    been loaded. */
            loadScript: function(src, callback, noCacheBust) {
                // Prevent reloading the same script
                var loadedScripts = this._loadedScripts || (this._loadedScripts = {});
                if (loadedScripts[src]) {
                    console.warn("script already loaded for src", src);
                    return null;
                } else {
                    loadedScripts[src] = true;
                    
                    var s = document.createElement('script');
                    s.type = 'text/javascript';
                    s.async = false;
                    
                    if (callback) {
                        var r = false;
                        s.onload = s.onreadystatechange = function() {
                            if (!r && (!this.readyState || this.readyState === 'complete')) {
                                // Prevent refiring callback
                                r = true;
                                
                                // Prevent later events from this script for example
                                // if the src is changed.
                                s.onload = s.onreadystatechange = null;
                                
                                callback();
                            }
                        };
                    }
                    
                    // Must set src AFTER adding onreadystatechange listener otherwise
                    // we’ll miss the loaded event for cached scripts
                    s.src = src + (noCacheBust ? '' : (src.indexOf('?') !== -1 ? '&' : '?') + 'cacheBust=' + Date.now());
                    
                    this.getElement('head').appendChild(s);
                    
                    return s;
                }
            },
            
            /** UNUSED SO COMMENTING OUT FOR NOW.
                
                Used to wrap the first function with the second function. The first
                function is exposed as this.callSuper within the wrapper function.
                @param fn:function the function to wrap.
                @param wrapperFn:function the wrapper function.
                @returns a wrapped function.
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
            },*/
            
            /** A wrapper on myt.global.error.notify
                @param err:Error/string The error or message to dump stack for.
                @param type:string (optional) The type of console message to write.
                    Allowed values are 'error', 'warn', 'log' and 'debug'. Defaults to
                    'error'.
                @returns void */
            dumpStack: (err, type) => {
                var msg;
                if (typeof err === 'string') {
                    msg = err;
                    err = null;
                }
                exports.global.error.notify(type || 'error', null, msg, err);
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
            getRandom: (func) => {
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
            getRandomArbitrary: (min, max, func) => {
                if (min > max) {
                    var tmp = min;
                    min = max;
                    max = tmp;
                }
                return exports.getRandom(func) * (max - min) + min;
            },
            
            /** @returns a random integer between min (inclusive) and max (inclusive)
                @param min:number the minimum value returned.
                @param max:number the maximum value returned.
                @param func:function a skew function. See myt.getRandom for more info.
                @returns number: an integer between min and max. */
            getRandomInt: (min, max, func) => {
                if (min > max) {
                    var tmp = min;
                    min = max;
                    max = tmp;
                }
                return Math.floor(exports.getRandom(func) * (max - min + 1) + min);
            },
            
            // Equality
            /** Tests if two floats are essentially equal to each other.
                @param a:float
                @param b:float
                @param epsilon:float (optional) the percent of difference allowed
                    between a and b. Defaults to 0.000001 if not provided.
                @return true if equal, false otherwise. */
            areFloatsEqual: (a, b, epsilon) => {
                var A = Math.abs(a), B = Math.abs(b);
                epsilon = epsilon ? Math.abs(epsilon) : 0.000001;
                return Math.abs(a - b) <= (A > B ? B : A) * epsilon;
            },
            
            /** Tests if two array are equal. For a more complete deep equal
                implementation use underscore.js */
            areArraysEqual: (a, b) => {
                if (a !== b) {
                    if (a == null || b == null) return false;
                    var i = a.length;
                    if (i !== b.length) return false;
                    
                    while (i) {
                        if (a[--i] !== b[i]) return false;
                    }
                }
                return true;
            },
            
            /** Tests if two objects are shallowly equal. */
            areObjectsEqual: (a, b) => {
                if (a !== b) {
                    if (a == null || b == null) return false;
                    for (var key in a) if (a[key] !== b[key]) return false;
                    for (key in b) if (a[key] !== b[key]) return false;
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
            getElement: (tagname, index) => document.getElementsByTagName(tagname || 'body')[index > 0 ? index : 0],
            
            // CSS
            loadCSSFonts: fontUrls => {
                (fontUrls || []).forEach(fontUrl => {
                    var link = document.createElement("link");
                    link.appendChild(document.createTextNode("")); // Webkit workaround
                    link.rel = 'stylesheet';
                    link.href = fontUrl;
                    document.head.appendChild(link);
                });
            },
            
            createStylesheet: () => {
                var style = document.createElement("style");
                style.appendChild(document.createTextNode("")); // Webkit workaround
                document.head.appendChild(style);
                return style.sheet;
            },
            
            addCSSRule: (sheet, selector, rules, index) => {
                if ("insertRule" in sheet) {
                    sheet.insertRule(selector + "{" + rules + "}", index);
                } else if("addRule" in sheet) {
                    sheet.addRule(selector, rules, index);
                }
            },
            
            removeCSSRules: (sheet) => {
                var i = sheet.cssRules.length;
                while (i) {
                    i--;
                    if ("deleteRule" in sheet) {
                        sheet.deleteRule(i);
                    } else if ("removeRule" in sheet) {
                        sheet.removeRule(i);
                    }
                }
            },
            
            createInputPlaceholderCSSRule: (view, color, fontFamily) => {
                // Make sure the view has a dom ID for rule targeting
                var domId = view.getOuterDomElement().id || (view.getOuterDomElement().id = 'id' + exports.generateGuid()),
                    sheet = view.__sheet,
                    rules = [];
                
                // Clear existing sheet if it exists or create a new sheet
                if (sheet) {
                    exports.removeCSSRules(sheet);
                } else {
                    sheet = view.__sheet = exports.createStylesheet();
                }
                
                // Write rules
                if (color) rules.push('color:' + color);
                if (fontFamily) rules.push('font-family:' + fontFamily);
                rules = rules.join('; ');
                
                switch (BrowserDetect.browser) {
                    case 'Chrome':
                    case 'Safari':
                        exports.addCSSRule(sheet, '#' + domId + '::-webkit-input-placeholder', rules, 0);
                        break;
                    case 'Firefox':
                        exports.addCSSRule(sheet, '#' + domId + ':-moz-placeholder', 'opacity:1; ' + rules, 0);
                        exports.addCSSRule(sheet, '#' + domId + '::-moz-placeholder', 'opacity:1; ' + rules, 0);
                        break;
                    case 'Explorer':
                        exports.addCSSRule(sheet, '#' + domId + ':-ms-input-placeholder', rules, 0);
                        break;
                }
            },
            
            // Misc
            /** Memoize a function.
                @param f:function The function to memoize
                @returns function: The memoized function. */
            memoize: (f) => {
                return function() {
                    var hash = JSON.stringify(arguments),
                        cache = f.__cache || (f.__cache = {});
                    return (hash in cache) ? cache[hash] : cache[hash] = f.apply(this, arguments);
                };
            },
            
            /** Returns a function that wraps the provided function and that, as long 
                as it continues to be invoked, will not invoke the wrapped function. 
                The wrapped function will be called after the returned function stops 
                being called for "wait" milliseconds. If "immediate" is passed, the
                wrapped function will be invoked on the leading edge instead of 
                the trailing edge.
                @param func:function The function to wrap.
                @param wait:number (optional) The time in millis to delay invocation by.
                    If not provided 0 is used.
                @param immediate:boolean (optional) If true the function will be
                    invoked immediately and then the wait time will be used to block
                    subsequent calls. */
            debounce: function(func, wait, immediate) {
                var timeout;
                return function() {
                    var context = this,
                        args = arguments,
                        later = function() {
                            timeout = null;
                            if (!immediate) func.apply(context, args);
                        },
                        callNow = immediate && !timeout;
                    clearTimeout(timeout);
                    timeout = setTimeout(later, wait);
                    if (callNow) func.apply(context, args);
                };
            },
            
            makeURLSearchParams: (params={}) => {
                var urlSearchParams = new URLSearchParams(),
                    key,
                    value;
                for (key in params) {
                    value = params[key];
                    if (value !== undefined) urlSearchParams.set(key, value);
                }
                return urlSearchParams;
            },
            
            doFetch: (url, options, raw, successFunc, errorFunc, finallyFunc) => fetch(url, options).then(
                // Throw normal HTTP errors to the catch clause below
                response => {
                    if (!response.ok) throw new FetchError(response.status, url, response.statusText);
                    return response;
                }
            ).then(
                // Convert the response to JSON or text
                response => raw ? response.text() : response.json()
            ).then(
                response => {
                    if (successFunc) {
                        try {
                            if (raw) {
                                successFunc(response);
                            } else {
                                // Throw application errors to the catch clause below
                                if (response.success === false) throw new FetchError(200, url, response.message);
                                successFunc(response.data);
                            }
                        } catch (ex) {
                            // Ensure errors from successFunc get rethrown as
                            // FetchError with the original stack trace.
                            var fetchError = new FetchError(200, url, ex.message);
                            fetchError.stack = ex.stack;
                            throw fetchError;
                        }
                    }
                }
            ).catch(
                error => {
                    if (errorFunc) {
                        // Convert non FetchErrors into FetchErrors
                        if (error.name !== 'FetchError') {
                            var fetchError = new FetchError(0, url, error.message);
                            fetchError.stack = error.stack;
                            error = fetchError
                        }
                        
                        errorFunc(error);
                    }
                }
            ).finally(
                _ => {if (finallyFunc) finallyFunc();}
            )
        };
    return exports;
})();

((pkg) => {
    /*
     * http://github.com/maynarddemmon/myt
     * Maynard Demmon <maynarddemmon@gmail.com>
     * @copyright Copyright (c) 2012-2020 Maynard Demmon and contributors
     * Myt: A simple javascript UI framework
     * Version: 20200416.1227
     * MIT License
     * 
     * Parts of the Software incorporates code from the following open-source projects:
     * * JS.Class, (c) 2007-2012 James Coglan and contributors (MIT License)
     * * Easing Functions, (c) 2001 Robert Penner (BSD License)
     * * jQuery Easing v1.3, (c) 2008 George McGinley Smith (BSD License)
     * * jQuery Cookie Plugin v1.3.1, (c) 2013 Klaus Hartl (MIT License)
     * * parseUri 1.2.2, (c) Steven Levithan <stevenlevithan.com> (MIT License)
     * * date.format Date:03/10/15, Copyright (c) 2005 Jacob Wright https://github.com/jacwright/date.format
     * * k-d Tree JavaScript - v1.0 (c) Mircea Pricop <pricop@ubilabs.net>,
     *                                  Martin Kleppe <kleppe@ubilabs.net>,
     *                                  Ubilabs http://ubilabs.net (MIT License)
     */
    
    class FetchError extends Error {
        constructor(status, url, ...params) {
            super(...params);
            this.name = 'FetchError';
            this.status = status;
            this.url = url;
        }
    }
    
    var 
        /* Used to generate globally unique IDs. */
        GUID_COUNTER = 0,
        
        /* Font functionality */
        fontTargets = {},
        fontLoaded = {
            // Empty entry is so that notifyInstanceThatFontLoaded will get 
            // triggered for registerForFontNotification when an empty
            // font name is provided. This should be done when a built in
            // font will be used.
            '':true
        },
        docFonts = document.fonts,
        
        notifyFontLoaded = (fontFace) => {
            var fontName = fontFace.family + ' ' + fontFace.weight,
                targets;
            
            // Fix for Firefox and FontAwesome because of garbage returned in
            // the font family name.
            if (fontName.indexOf('\\35 ') >= 0) fontName = fontName.replace(/\\35 /g, '5');
            
            if (!fontLoaded[fontName]) {
                fontLoaded[fontName] = true;
                targets = fontTargets[fontName] || [];
                while (targets.length) notifyInstanceThatFontLoaded(targets.pop());
            }
        },
        
        notifyInstanceThatFontLoaded = (instance) => {
            instance.sizeViewToDom();
        },
        
        myt = pkg.myt = {
            /** A version number based on the time this distribution of myt was
                created. */
            version:20200416.1227,
            
            /** The root path to image assets for the myt package. MYT_IMAGE_ROOT
                should be set by the page that includes this script. */
            IMAGE_ROOT: global.MYT_IMAGE_ROOT || '',
            
            /** Generates a globally unique id, (GUID).
                @returns {number} */
            generateGuid: () => ++GUID_COUNTER,
            
            /** Adds an event listener to a dom element. 
                @param elem:DomElement The dom element to listen to.
                @param {string} type - The name of the event to listen to.
                @param {Function} callback - The callback function that will be
                    registered for the event.
                @param {boolean} [capture] indicates if the listener is 
                    registered during the capture phase or bubble phase.
                @returns {undefined} */
            addEventListener: (elem, type, callback, capture, passive) => {
                elem.addEventListener(type, callback, {
                    capture:capture || false,
                    passive:passive || false
                });
            },
            
            /** Removes an event listener from a dom element. 
                @param elem:DomElement The dom element to listen to.
                @param {string} type - The name of the event to listen to.
                @param {Function} callback - The callback function that will be
                    registered for the event.
                @param {boolean} [capture] indicates if the listener is 
                    registered during the capture phase or bubble phase.
                @returns {undefined} */
            removeEventListener: (elem, type, callback, capture) => {
                elem.removeEventListener(type, callback, capture || false);
            },
            
            /** Takes a '.' separated string such as "foo.bar.baz" and resolves it
                into the value found at that location relative to a starting scope.
                If no scope is provided global scope is used.
                @param {string|Array} objName - The name to resolve or an array of path
                    parts in descending order.
                @param {Object} [scope] - The scope to resolve from. If not
                    provided global scope is used.
                @returns {?Object} The referenced object or undefined if 
                    resolution failed. */
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
                if (typeof value === 'string') value = myt.resolveName(value);
                
                // Make sure what we found is really a JS.Class otherwise return null.
                return (value && typeof value.isA === 'function' && value.isA(JS.Class)) ? value : null;
            },
            
            /** Gets the file extension from a file name.
                @param {string} fileName - The filename to extract the extension from.
                @returns {string) The file extension or null if a falsy fileName
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
                
                @param {string} template - The template to use.
                @param {...*} [params] - The parameters for the template.
                @returns {string} A populated string. */
            fillTextTemplate: function(template, ...params) {
                var param,
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
                @param {string} text - The text to put inside the link.
                @param {string) callbackMethodName - The name of the method to execute.
                @param {?Object} [attrs] - a map of additional attributes that
                    will be inserted into the tag.
                @param {?Object} [data] - Data that will be serialized as JSON
                    and provided to the link handler.
                @returns {string} */
            generateLink: (text, callbackMethodName, attrs, data) => {
                var optAttrs = '',
                    name;
                if (attrs) {
                    for (name in attrs) optAttrs += ' ' + name + '="' + attrs[name] + '"';
                }
                
                return myt.fillTextTemplate(
                    '<a href="#" onclick=\'myt.__handleGeneratedLink(this, "{0}", &apos;{3}&apos;); return false;\'{2}>{1}</a>', 
                    callbackMethodName, text, optAttrs, JSON.stringify(data)
                );
            },
            
            /** See myt.generateLink for documentation.
                @private
                @param {?Object} elem
                @param {string} callbackMethodName
                @param {string} data
                @returns {undefined} */
            __handleGeneratedLink: (elem, callbackMethodName, data) => {
                var model,
                    value;
                while (elem) {
                    model = elem.model;
                    if (model) {
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
                @param {string} src - The URL to the script file.
                @param {Function} [callback] - A function that will be called
                    when the script loads.
                @param {boolean} [noCacheBust] - If true, not cacheBust query
                    param will be added. Defaults to undefined which is equivalent
                    to false.
                @returns {?Objecd} The created script element or null if the 
                    script has already been loaded. */
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
            
            /** A wrapper on myt.global.error.notify
                @param {string|Error} err - The error or message to dump stack for.
                @param {string} [type] - The type of console message to write.
                    Allowed values are 'error', 'warn', 'log' and 'debug'. 
                    Defaults to 'error'.
                @returns {undefined} */
            dumpStack: (err, type) => {
                var msg;
                if (typeof err === 'string') {
                    msg = err;
                    err = null;
                }
                myt.global.error.notify(type || 'error', null, msg, err);
            },
            
            // Random numbers
            /** Generates a random number between 0 (inclusive) and 1 (exclusive)
                @param {?Function} [func] - A distribution function for the
                    random numbers. The function should map a number between 0 and 1
                    to another number between 0 (inclusive) and 1 (exclusive). If not 
                    provided a flat distribution will be used. Example functions:
                        - function(v) {return v * v;} will skew the value towards 0.
                        - function(v) {return 0.9999999999 - v * v;} will skew the 
                          value towards a value very close to 1.
                @returns {number} a random number between 0 and almost 1. */
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
                @param {number} min - the minimum value returned.
                @param {number} max - the maximum value returned.
                @param {?Function} [func] - A distribution function. 
                    See myt.getRandom for more info.
                @returns {number} a number between min and max. */
            getRandomArbitrary: (min, max, func) => {
                if (min > max) {
                    var tmp = min;
                    min = max;
                    max = tmp;
                }
                return myt.getRandom(func) * (max - min) + min;
            },
            
            /** Generates a random integer between min (inclusive) and max (inclusive)
                @param {number} min - the minimum value returned.
                @param {number} max - the maximum value returned.
                @param {?Function} [func] - A distribution function. 
                    See myt.getRandom for more info.
                @returns {number} a number between min and max. */
            getRandomInt: (min, max, func) => {
                if (min > max) {
                    var tmp = min;
                    min = max;
                    max = tmp;
                }
                return Math.floor(myt.getRandom(func) * (max - min + 1) + min);
            },
            
            // Equality
            /** Tests if two floats are essentially equal to each other.
                @param {number} a - A float
                @param {number} b - A float
                @param {numer} [epsilon] - The percent of difference allowed
                    between a and b. Defaults to 0.000001 if not provided.
                @return {boolean} true if equal, false otherwise. */
            areFloatsEqual: (a, b, epsilon) => {
                var A = Math.abs(a), B = Math.abs(b);
                epsilon = epsilon ? Math.abs(epsilon) : 0.000001;
                return Math.abs(a - b) <= (A > B ? B : A) * epsilon;
            },
            
            /** Tests if two array are equal. For a more complete deep equal
                implementation use underscore.js
                @param {?Array} a
                @param {?Array} b
                @returns {boolean} */
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
            
            /** Tests if two objects are shallowly equal.
                @param {?Object} a
                @param {?Object} b
                @returns {boolean} */
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
                @param {string} [tagname] - The name of the tag to search for.
                    Defaults to 'body' if not provided
                @param {number} [index] - The index of the tag to get. Defaults to
                    0 if not provided.
                @returns {?Object} a dom element or undefined if none exist. */
            getElement: (tagname, index) => document.getElementsByTagName(tagname || 'body')[index > 0 ? index : 0],
            
            // Fonts
            loadFontFaces: (fontList, callback) => {
                var fonts = [];
                fontList.forEach(fontInfo => {
                    var fontFace = new FontFace(fontInfo.family, 'url(' + fontInfo.url + ')', fontInfo.options);
                    fonts.push(fontFace.load());
                });
                
                Promise.all(fonts).then(loadedFonts => {
                    loadedFonts.forEach(font => {
                        docFonts.add(font);
                        notifyFontLoaded(font);
                    });
                    if (callback) callback(loadedFonts);
                });
            },
            
            loadFontFace: (fontName, fontUrl, fontOptions={}, callback) => {
                var fontFace = new FontFace(fontName, 'url(' + fontUrl + ')', fontOptions);
                fontFace.loaded.then((loadedFontFace) => {
                    docFonts.add(loadedFontFace);
                    notifyFontLoaded(loadedFontFace);
                    if (callback) callback(loadedFontFace);
                });
                fontFace.load();
            },
            
            registerForFontNotification: (textView, fontName) => {
                if (fontLoaded[fontName]) {
                    notifyInstanceThatFontLoaded(textView);
                } else {
                    (fontTargets[fontName] || (fontTargets[fontName] = [])).push(textView);
                }
            },
            
            /** Create a CSS rule that defines the base font for 
                the document.
                @param {string} fontFamily
                @returns {undefined} */
            createBaseFontCSSRule: (fontFamily) => {
                myt.addCSSRule(myt.createStylesheet(), 'body, input', 'font-family:' + fontFamily, 0);
            },
            
            /** @param {Array} fontUrls
                @returns {undefined} */
            loadCSSFonts: (fontUrls) => {
                (fontUrls || []).forEach(fontUrl => {
                    var link = document.createElement('link');
                    link.rel = 'stylesheet';
                    link.href = fontUrl;
                    document.head.appendChild(link);
                });
            },
            
            // CSS
            /** @returns {Object} */
            createStylesheet: () => {
                var style = document.createElement('style');
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
                var domId = view.getOuterDomElement().id || (view.getOuterDomElement().id = 'id' + myt.generateGuid()),
                    sheet = view.__sheet,
                    rules = [];
                
                // Clear existing sheet if it exists or create a new sheet
                if (sheet) {
                    myt.removeCSSRules(sheet);
                } else {
                    sheet = view.__sheet = myt.createStylesheet();
                }
                
                // Write rules
                if (color) rules.push('color:' + color);
                if (fontFamily) rules.push('font-family:' + fontFamily);
                rules = rules.join('; ');
                
                switch (BrowserDetect.browser) {
                    case 'Chrome':
                    case 'Safari':
                        myt.addCSSRule(sheet, '#' + domId + '::-webkit-input-placeholder', rules, 0);
                        break;
                    case 'Firefox':
                        myt.addCSSRule(sheet, '#' + domId + ':-moz-placeholder', 'opacity:1; ' + rules, 0);
                        myt.addCSSRule(sheet, '#' + domId + '::-moz-placeholder', 'opacity:1; ' + rules, 0);
                        break;
                    case 'Explorer':
                        myt.addCSSRule(sheet, '#' + domId + ':-ms-input-placeholder', rules, 0);
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
            
            /** Mixes threshold counter functionality with a fixed threshold 
                onto the provided scope. A threshold is exceeded when the
                counter value equals the threshold value.
                @param scope:Observable|Class|Module the scope to mix onto.
                @param thresholdValue:number the fixed threshold value.
                @param exceededAttrName:string the name of the boolean attribute
                    that will indicate if the threshold is exceeded or not.
                @param counterAttrName:string (Optional) the name of the number
                    attribute that will get adjusted up and down. If not provided
                    the 'exceeded' attribute name will be used with 'Counter'
                    appended to it. For example if the exceeded
                    attribute was 'locked' this would be 'lockedCounter'.
                @returns boolean True if creation succeeded, false otherwise. */
            createFixedThresholdCounter: (scope, thresholdValue, exceededAttrName, counterAttrName) => {
                var genNameFunc = myt.AccessorSupport.generateName,
                    incrName,
                    decrName,
                    isModuleOrClass = typeof scope === 'function' || scope instanceof JS.Module,
                    mod = {};
                counterAttrName = counterAttrName || genNameFunc('counter', exceededAttrName);
                
                incrName = genNameFunc(counterAttrName, 'increment');
                decrName = genNameFunc(counterAttrName, 'decrement');
                
                // Prevent clobbering
                if ((isModuleOrClass ? scope.instanceMethod(incrName) : scope[incrName]) !== undefined) {
                    console.warn("Can't clobber existing property during setup of increment function.", incrName, scope);
                    return false;
                }
                if ((isModuleOrClass ? scope.instanceMethod(decrName) : scope[decrName]) !== undefined) {
                    console.warn("Can't clobber existing property during setup of decrement function.", decrName, scope);
                    return false;
                }
                
                // Define the "module".
                /** Increments the counter attribute on the scope object by 1.
                    @returns {undefined} */
                mod[incrName] = function() {
                    var value = this[counterAttrName] + 1;
                    this[counterAttrName] = value;
                    this.fireEvent(counterAttrName, value);
                    if (value === thresholdValue) this.set(exceededAttrName, true);
                };
                
                /** Decrements the counter attribute on the scope object by 1.
                    @returns {undefined} */
                mod[decrName] = function() {
                    var curValue = this[counterAttrName];
                    if (curValue === 0) return;
                    var value = curValue - 1;
                    this[counterAttrName] = value;
                    this.fireEvent(counterAttrName, value);
                    if (curValue === thresholdValue) this.set(exceededAttrName, false);
                };
                
                // Mixin in the "module"
                scope[isModuleOrClass ? 'include' : 'extend'](mod);
                
                return true;
            },
            
            // Fetch
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
                            error = fetchError;
                        }
                        
                        errorFunc(error);
                    }
                }
            ).finally(
                _ => {if (finallyFunc) finallyFunc();}
            )
        };
    
    docFonts.onloadingdone = (fontFaceSetEvent) => {
        fontFaceSetEvent.fontfaces.forEach(fontFace => {notifyFontLoaded(fontFace);});
    };
})(global);

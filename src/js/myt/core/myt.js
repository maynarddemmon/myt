(pkg => {
    /*
     * http://github.com/maynarddemmon/myt
     * Maynard Demmon <maynarddemmon@gmail.com>
     * @copyright Copyright (c) 2012-2023 Maynard Demmon and contributors
     * Myt: A simple javascript UI framework
     * Version: 20220118.1318
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
    
    
    let 
        // Used to generate globally unique IDs.
        GUID_COUNTER = 0,
        
        // The current locale for the user.
        currentLocale;
    
    const math = Math,
        mathAbs = math.abs,
        mathMin = math.min,
        mathMax = math.max,
        mathPow = math.pow,
        
        documentElem = document,
        headElem = documentElem.head,
        createElement = documentElem.createElement.bind(documentElem),
        
        /* Font functionality */
        fontTargets = {},
        fontLoaded = {
            // Empty entry is so that notifyInstanceThatFontLoaded will get triggered for 
            // registerForFontNotification when an empty font name is provided. This should be 
            // done when a built in font will be used.
            '':true
        },
        docFonts = documentElem.fonts,
        
        notifyFontLoaded = fontFace => {
            // Fix for Firefox and FontAwesome because of double quotes returned in the font family 
            // name. Seems OK to just do it for all fonts since double quotes in a font name is 
            // most likely going to be confusing anyhow.
            const familyName = fontFace.family.split('"').join('');
            [familyName, familyName + ' ' + fontFace.weight].forEach(fontName => {
                if (!fontLoaded[fontName]) {
                    fontLoaded[fontName] = true;
                    const targets = fontTargets[fontName] ?? [];
                    while (targets.length) notifyInstanceThatFontLoaded(targets.pop());
                }
            });
        },
        
        notifyInstanceThatFontLoaded = instance => {
            if (instance && !instance.destroyed) instance.sizeViewToDom();
        },
        
        // The default locale for I18N.
        defaultLocale = 'en',
        
        // The localization dictionaries for I18N
        dictionaries = {},
        
        memoize = func => {
            const cache = {};
            return (...args) => {
                const hash = JSON.stringify(args);
                return hash in cache ? cache[hash] : cache[hash] = func(...args);
            };
        },
        
        I18N_PLURAL_REGEX = /\{\{plural:\$(.*?)\|(.*?)\|(.*?)\}\}/g,
        I18N_NUMERIC_ARG_REGEX = /\$(\d+)/g, 
        
        myt = pkg.myt = {
            /** A version number based on the time this distribution of myt was created. */
            version:20230602.1558,
            
            /** Generates a globally unique id, (GUID).
                @returns {number} */
            generateGuid: () => ++GUID_COUNTER,
            
            /** Creates a non-secure hash of a string.
                @param {string} s - The string to hash.
                @returns {number} */
            hash: s => s.split('').reduce((a, b) => {a = ((a << 5) - a) + b.charCodeAt(0); return a&a;}, 0),
            
            /** Adds an event listener to a dom element. 
                @param {!Object} elem - The DomElement to listen to.
                @param {string} type - The name of the event to listen to.
                @param {!Function} callback - The callback function that will be registered for 
                    the event.
                @param {boolean} [capture] - Indicates if the listener is registered during the 
                    capture phase or bubble phase.
                @param {boolean} passive
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
                @param {!Function} callback - The callback function that will be registered for 
                    the event.
                @param {boolean} [capture] indicates if the listener is registered during the 
                    capture phase or bubble phase.
                @returns {undefined} */
            removeEventListener: (elem, type, callback, capture) => {
                elem.removeEventListener(type, callback, capture || false);
            },
            
            /** Takes a '.' separated string such as "foo.bar.baz" and resolves it into the value 
                found at that location relative to a starting scope. If no scope is provided global 
                scope is used.
                @param {string|?Array} objName - The name to resolve or an array of path parts in 
                    descending order.
                @param {?Object} [scope] - The scope to resolve from. If not provided global scope 
                    is used.
                @returns {?Object} The referenced object or undefined if resolution failed. */
            resolveName: (objName, scope) => {
                if (!objName || objName.length === 0) return undefined;
                
                scope = scope ?? global;
                
                const parts = Array.isArray(objName) ? objName : objName.split('.'), 
                    len = parts.length;
                for (let i = 0; i < len; i++) {
                    scope = scope[parts[i]];
                    if (scope == null) {
                        console.warn('resolveName failed for', objName, 'at part', i, parts[i]);
                        return undefined;
                    }
                }
                return scope;
            },
            
            /** Resolves a provided string into a JS.Class object. If a non-string value is 
                provided it is verified to be a JS.Class object.
                @param {*} value - The value to resolve and/or verify.
                @returns {?Function} - A JS.Class or null if the string could not be resolved or 
                    the value was not a JS.Class object. */
            resolveClassname: value => {
                if (typeof value === 'string') value = myt.resolveName(value);
                
                // Make sure what we found is really a JS.Class otherwise return null.
                return (value && typeof value.isA === 'function' && value.isA(JS.Class)) ? value : null;
            },
            
            /** Gets the file extension from a file name.
                @param {string} fileName - The filename to extract the extension from.
                @returns {string) The file extension or null if a falsy fileName argument was 
                    provided. */
            getExtension: fileName => {
                if (fileName) {
                    const parts = fileName.split('.');
                    return parts.length > 1 ? parts.pop() : null;
                } else {
                    return null;
                }
            },
            
            /** Dynamically load a script into the dom.
                @param {string} src - The URL to the script file.
                @param {?Function} [callback] - A function called when the script loads.
                @param {boolean} [noCacheBust] - If true, not cacheBust query param will be added. 
                    Defaults to undefined which is equivalent to false.
                @returns {?Object} The created script element or null if the script has already 
                    been loaded. */
            loadScript: function(src, callback, noCacheBust) {
                // Prevent reloading the same script
                const loadedScripts = this._loadedScripts ??= {};
                if (loadedScripts[src]) {
                    console.warn('script already loaded for src', src);
                    return null;
                } else {
                    loadedScripts[src] = true;
                    
                    const scriptElem = createElement('script');
                    scriptElem.type = 'text/javascript';
                    scriptElem.async = false;
                    
                    if (callback) {
                        let fired = false;
                        scriptElem.onload = scriptElem.onreadystatechange = () => {
                            if (!fired && (!scriptElem.readyState || scriptElem.readyState === 'complete')) {
                                // Prevent refiring callback
                                fired = true;
                                
                                // Prevent later events from this script. For example, if the src 
                                // is changed.
                                scriptElem.onload = scriptElem.onreadystatechange = null;
                                
                                callback();
                            }
                        };
                    }
                    
                    // Must set src AFTER adding onreadystatechange listener otherwise we’ll miss 
                    // the loaded event for cached scripts
                    scriptElem.src = src + (noCacheBust ? '' : (src.includes('?') ? '&' : '?') + 'cacheBust=' + Date.now());
                    
                    headElem.appendChild(scriptElem);
                    
                    return scriptElem;
                }
            },
            
            /** A wrapper on myt.global.error.notify
                @param {string|?Error} err - The error or message to dump stack for.
                @param {string} [type] - The type of console message to write. Allowed values are 
                    'error', 'warn', 'log' and 'debug'. Defaults to 'error'.
                @returns {undefined} */
            dumpStack: (err, type) => {
                let msg;
                if (typeof err === 'string') {
                    msg = err;
                    err = null;
                }
                myt.global.error.notify(type || 'error', null, msg, err);
            },
            
            // Random numbers
            /** Generates a random number between 0 (inclusive) and 1 (exclusive)
                @param {?Function} [func] - A distribution function for the random numbers. The 
                    function should map a number between 0 and 1 to another number between 0 
                    (inclusive) and 1 (exclusive). If not provided a flat distribution will be 
                    used. Example functions:
                        - function(v) {return v * v;} will skew the value towards 0.
                        - function(v) {return 0.9999999999 - v * v;} will skew the value towards a 
                          value very close to 1.
                @returns {number} a random number between 0 and almost 1. */
            getRandom: func => {
                const v = math.random();
                // Min and max is to correct for badly behaved skew functions.
                return func ? mathMax(0, mathMin(func(v), 0.9999999999)) : v;
            },
            
            /** @returns a random number between min (inclusive) and max (exclusive).
                @param {number} min - the minimum value returned.
                @param {number} max - the maximum value returned.
                @param {?Function} [func] - A distribution function. See myt.getRandom for more.
                @returns {number} a number between min and max. */
            getRandomArbitrary: (min, max, func) => {
                const actualMin = mathMin(min, max);
                return myt.getRandom(func) * (mathMax(min, max) - actualMin) + actualMin;
            },
            
            /** Generates a random integer between min (inclusive) and max (inclusive).
                @param {number} min - the minimum value returned.
                @param {number} max - the maximum value returned.
                @param {?Function} [func] - A distribution function. See myt.getRandom for more.
                @returns {number} a number between min and max. */
            getRandomInt: (min, max, func) => {
                const actualMin = mathMin(min, max);
                return math.floor(myt.getRandom(func) * (mathMax(min, max) - actualMin + 1) + actualMin);
            },
            
            // Equality
            /** Tests if two floats are essentially equal to each other.
                @param {number} a - A float
                @param {number} b - A float
                @param {number} [epsilon] - The percent of difference of the smaller magnitude 
                    number allowed between a and b. Defaults to 0.000001 if not provided.
                @returns {boolean} true if equal, false otherwise. */
            areFloatsEqual: (a, b, epsilon) => {
                const absA = mathAbs(a),
                    absB = mathAbs(b);
                return mathAbs(a - b) <= (absA > absB ? absB : absA) * (epsilon == null ? 0.000001 : mathAbs(epsilon));
            },
            
            /** Tests if two array are equal. For a more complete deep equal implementation 
                use underscore.js
                @param {?Array} a
                @param {?Array} b
                @returns {boolean} */
            areArraysEqual: (a, b) => {
                if (a !== b) {
                    if (a == null || b == null) return false;
                    let i = a.length;
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
                    for (const key in a) if (a[key] !== b[key]) return false;
                    for (const key in b) if (a[key] !== b[key]) return false;
                }
                return true;
            },
            
            // DOM
            /** Gets the dom element of the provided tagname and index.
                @param {string} [tagname] - The name of the tag to search for. 
                    Defaults to 'body' if not provided
                @param {number} [index] - The index of the tag to get. 
                    Defaults to 0 if not provided.
                @returns {?Object} a dom element or undefined if none exist. */
            getElement: (tagname, index) => documentElem.getElementsByTagName(tagname || 'body')[index > 0 ? index : 0],
            
            // Fonts
            loadFontFaces: (fontList, callback) => {
                const fonts = [];
                fontList.forEach(fontInfo => {
                    const fontFace = new FontFace(fontInfo.family, 'url(' + fontInfo.url + ')', fontInfo.options);
                    fonts.push(fontFace.load());
                });
                
                Promise.all(fonts).then(loadedFonts => {
                    loadedFonts.forEach(font => {
                        docFonts.add(font);
                        notifyFontLoaded(font);
                    });
                    callback?.(loadedFonts);
                });
            },
            
            loadFontFace: (fontName, fontUrl, fontOptions={}, callback) => {
                const fontFace = new FontFace(fontName, 'url(' + fontUrl + ')', fontOptions);
                fontFace.loaded.then(loadedFontFace => {
                    docFonts.add(loadedFontFace);
                    notifyFontLoaded(loadedFontFace);
                    callback?.(loadedFontFace);
                });
                fontFace.load();
            },
            
            registerForFontNotification: (textView, fontName) => {
                if (fontLoaded[fontName]) {
                    notifyInstanceThatFontLoaded(textView);
                } else {
                    (fontTargets[fontName] ??= []).push(textView);
                }
            },
            
            /** Create a CSS rule that defines the base font for the document.
                @param {string} fontFamily
                @returns {undefined} */
            createBaseFontCSSRule: fontFamily => {
                myt.addCSSRule(myt.createStylesheet(), 'body, input', 'font-family:' + fontFamily, 0);
            },
            
            /** @param {?Array} fontUrls
                @returns {undefined} */
            loadCSSFonts: fontUrls => {
                fontUrls?.forEach(myt.createStylesheetLink);
            },
            
            // CSS
            /** Creates a "link" dom element.
                @param {string} [href] The href attribute for the link.
                @returns {!Object} */
            createStylesheetLink: href => {
                const link = createElement('link');
                link.rel = 'stylesheet';
                if (href) link.href = href;
                headElem.appendChild(link);
                return link;
            },
            
            /** Creates a "style" dom element.
                @returns {!Object} */
            createStylesheet: () => {
                const style = createElement('style');
                headElem.appendChild(style);
                return style.sheet;
            },
            
            addCSSRule: (sheet, selector, rules, index) => {
                if ('insertRule' in sheet) {
                    sheet.insertRule(selector + '{' + rules + '}', index);
                } else if('addRule' in sheet) {
                    sheet.addRule(selector, rules, index);
                }
            },
            
            removeCSSRules: sheet => {
                let i = sheet.cssRules.length;
                while (i) {
                    i--;
                    if ('deleteRule' in sheet) {
                        sheet.deleteRule(i);
                    } else if ('removeRule' in sheet) {
                        sheet.removeRule(i);
                    }
                }
            },
            
            createInputPlaceholderCSSRule: (view, color, fontFamily, opacity=1) => {
                // Make sure the view has a dom ID for rule targeting
                const ode = view.getODE(),
                    domId = ode.id || (ode.id = 'id' + myt.generateGuid());
                
                // Clear existing sheet if it exists or create a new sheet
                let sheet = view.__sheet;
                if (sheet) {
                    myt.removeCSSRules(sheet);
                } else {
                    sheet = view.__sheet = myt.createStylesheet();
                }
                
                // Write rules
                const rules = [];
                if (color) rules.push('color:' + color);
                if (fontFamily) rules.push('font-family:' + fontFamily);
                if (opacity) rules.push('opacity:' + opacity);
                myt.addCSSRule(sheet, '#' + domId + '::placeholder', rules.join('; '), 0);
            },
            
            // Sort Util
            chainSortFunc: (funcPrimary, funcSecondary) => {
                return (a, b) => {
                    const retval = funcPrimary(a, b);
                    return retval === 0 ? funcSecondary(a, b) : retval;
                };
            },
            
            /** Gets an alphanumeric sort function for sorting Objects by a named property or
                Arrays by an index. Object property values that are falsy are coerced to "" if 
                fixNonStrings is false.
                @param {string|number} propName - The name of the property to sort by or an index
                    if the things being sorted are Arrays.
                @param {boolean} ascending
                @param {boolean} caseInsensitive
                @param {boolean} fixNonStrings When true non-string values will be converted to 
                    strings by concatenating them with "".
                @returns {!Function} */
            getAlphaObjSortFunc: memoize((propName, ascending, caseInsensitive, fixNonStrings) => {
                const order = ascending ? 1 : -1;
                return (a, b) => {
                    a = a[propName];
                    b = b[propName];
                    if (fixNonStrings) {
                        // Fix non-string values
                        if (typeof a !== 'string') a = '' + a;
                        if (typeof b !== 'string') b = '' + b;
                    } else {
                        // Otherwise, only fix falsy values, typically null or undefined.
                        a = a || '';
                        b = b || '';
                    }
                    if (caseInsensitive) {
                        a = a.toLowerCase();
                        b = b.toLowerCase();
                    }
                    return a.localeCompare(b) * order;
                };
            }),
            
            /** Gets a numeric sort function for sorting Objects by a named property. Object 
                property values that are falsy are coerced to 0.
                @param {string} propName
                @param {boolean} ascending
                @returns {!Function} */
            getNumericObjSortFunc: memoize((propName, ascending) => {
                const order = ascending ? 1 : -1;
                return (a, b) => {
                    // Fix falsy values, typically null or undefined.
                    a = a[propName] || 0;
                    b = b[propName] || 0;
                    return (a - b) * order;
                };
            }),
            
            // Misc
            dataURIToBlob: dataURI => {
                const idx = dataURI.indexOf(','),
                    mimeStr = dataURI.slice(0, idx).split(':')[1].split(';')[0];
                let data = dataURI.slice(idx + 1);
                if (mimeStr.startsWith('text/')) {
                    data = decodeURIComponent(data);
                } else {
                    const binStr = atob(data);
                    let i = binStr.length;
                    const intArr = new Uint8Array(i);
                    while (i) intArr[--i] = binStr.charCodeAt(i);
                    data = intArr;
                }
                return new Blob([data], {type:mimeStr});
            },
            
            /** Format a number between 0 and 1 as a percentage.
                @param {number} num The number to convert.
                @param {number} [fixed] The number of decimal places to use during formatting. If 
                    the percentage is a whole number no decimal places will be used. For example,
                    0.55781 -> 55.78% and 0.55 -> 55%
                @returns {string} */
            formatAsPercentage: (num, fixed=2) => {
                if (typeof num === 'number') {
                    fixed = mathMin(16, mathMax(0, fixed));
                    const percent = math.round(mathMax(0, mathMin(1, num)) * mathPow(10, 2+fixed)) / mathPow(10, fixed);
                    return (percent % 1 === 0 ? percent : percent.toFixed(fixed)) + '%';
                } else if (typeof num === 'string') {
                    // Assume a string passed to this function is already correctly formatted so 
                    // pass it through unchanged.
                    return num;
                } else {
                    console.warn('formatAsPercentage: expects a number');
                    return num;
                }
            },
            
            /** Memoize a function.
                @param {!Function} func - The function to memoize
                @returns {!Function} - The memoized function. */
            memoize: memoize,
            
            /** Returns a function that wraps the provided function and that, as long as it 
                continues to be invoked, will not invoke the wrapped function. The wrapped function 
                will be called after the returned function stops being called for "wait" 
                milliseconds. If "immediate" is passed, the wrapped function will be invoked on the 
                leading edge instead of the trailing edge.
                @param {!Function} func - The function to wrap.
                @param {number} [wait] - The time in millis to delay invocation by. If not 
                    provided 0 is used.
                @param {boolean} [immediate] - If true the function will be invoked immediately and 
                    then the wait time will be used to block subsequent calls.
                @returns {!Function} - The debounced function. */
            debounce: function(func, wait, immediate) {
                const timeoutKey = '__DBTO' + '_' + this.generateGuid();
                return function() {
                    const context = this,
                        timeout = context[timeoutKey],
                        args = arguments,
                        later = function() {
                            context[timeoutKey] = null;
                            if (!immediate) func.apply(context, args);
                        },
                        callNow = immediate && !timeout;
                    clearTimeout(timeout);
                    context[timeoutKey] = setTimeout(later, wait);
                    if (callNow) func.apply(context, args);
                };
            },
            
            /** Mixes threshold counter functionality with a fixed threshold onto the provided 
                scope. A threshold is exceeded when the counter value equals the threshold value.
                @param {!Object|!Function} scope - Either an myt.Observable, JS.Class or JS.Module 
                    to mix onto.
                @param {number} thresholdValue - The fixed threshold value.
                @param {string} exceededAttrName - The name of the boolean attribute that will 
                    indicate if the threshold is exceeded or not.
                @param {string} [counterAttrName] - The name of the number attribute that will get 
                    adjusted up and down. If not provided the 'exceeded' attribute name will be 
                    used with 'Counter' appended to it. For example if the exceeded attribute was 
                    'locked' this would be 'lockedCounter'.
                @returns {boolean} - True if creation succeeded, false otherwise. */
            createFixedThresholdCounter: (scope, thresholdValue, exceededAttrName, counterAttrName) => {
                const genNameFunc = myt.AccessorSupport.generateName,
                    isModuleOrClass = typeof scope === 'function' || scope instanceof JS.Module,
                    mod = {};
                counterAttrName = counterAttrName || genNameFunc('counter', exceededAttrName);
                
                const incrName = genNameFunc(counterAttrName, 'increment'),
                    decrName = genNameFunc(counterAttrName, 'decrement');
                
                // Prevent clobbering
                if ((isModuleOrClass ? scope.instanceMethod(incrName) : scope[incrName]) !== undefined) {
                    console.warn('Increment: Abort clobber', incrName, scope);
                    return false;
                }
                if ((isModuleOrClass ? scope.instanceMethod(decrName) : scope[decrName]) !== undefined) {
                    console.warn('Decrement: Abort clobber', decrName, scope);
                    return false;
                }
                
                // Define the "module".
                /** Increments the counter attribute on the scope object by 1.
                    @returns {undefined} */
                mod[incrName] = function() {
                    const value = this[counterAttrName] + 1;
                    this[counterAttrName] = value;
                    this.fireEvent(counterAttrName, value);
                    if (value === thresholdValue) this.set(exceededAttrName, true);
                };
                
                /** Decrements the counter attribute on the scope object by 1.
                    @returns {undefined} */
                mod[decrName] = function() {
                    const curValue = this[counterAttrName];
                    if (curValue === 0) return;
                    const value = curValue - 1;
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
                const urlSearchParams = new URLSearchParams();
                for (const key in params) {
                    const value = params[key];
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
                            // Ensure errors from successFunc get rethrown as FetchError with the 
                            // original stack trace.
                            const fetchError = new FetchError(200, url, ex.message);
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
                            const fetchError = new FetchError(0, url, error.message);
                            fetchError.stack = error.stack;
                            error = fetchError;
                        }
                        
                        errorFunc(error);
                    }
                }
            ).finally(
                () => {finallyFunc?.();}
            ),
            
            // I18N
            I18N: {
                setLocale: locale => {
                    currentLocale = locale;
                },
                getLocale: () => currentLocale,
                addDictionary: (dictionary, locale) => {
                    dictionaries[locale] = Object.assign(dictionaries[locale] ?? {}, dictionary);
                },
                setDictionary: (dictionary, locale) => {
                    dictionaries[locale] = dictionary ?? {};
                },
                get: (key, ...args) => {
                    const locale = currentLocale ?? (currentLocale = (navigator.language ?? defaultLocale).split('-')[0].toLowerCase()),
                        value = (dictionaries[locale] ?? dictionaries[defaultLocale] ?? {})[key];
                    if (value != null) {
                        if (args.length > 0) {
                            return value.replaceAll(
                                // Process each {{plural:$n|single|multiple}} replacement
                                I18N_PLURAL_REGEX, (m, p1, p2, p3) => (p2 && p3) ? (args[parseInt(p1)] == 1 ? p2 : p3) : ''
                            ).replaceAll(
                                // Process $n replacement for every arg
                                I18N_NUMERIC_ARG_REGEX, (m, idx) => args[idx]
                            );
                        } else {
                            return value;
                        }
                    }
                    return key;
                }
            }
        };
    
    docFonts.onloadingdone = fontFaceSetEvent => {
        fontFaceSetEvent.fontfaces.forEach(fontFace => {notifyFontLoaded(fontFace);});
    };
})(global);

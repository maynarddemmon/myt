(pkg => {
    /*
     * http://github.com/maynarddemmon/myt
     * Maynard Demmon <maynarddemmon@gmail.com>
     * @copyright Copyright (c) 2012-2025 Maynard Demmon and contributors
     * Myt: A simple javascript UI framework
     * Version: 20250119.1526
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
     * * NameCase Copyright (C) 2013-2014 Mason Gravitt (MIT License)
     * *   Original PERL version Copyright (c) Mark Summerfield 1998-2008. All Rights Reserved.
     * *   This program is free software; you can redistribute it and/or modify it under the same terms as Perl itself.
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
        currentLocale,
        
        // The dictionary for the current locale.
        activeDictionary = {},
        
        // The resource (Functions, Arrays, Objects, etc.) dictionary for the current locale.
        activeResourceDictionary = {};
    
    const consoleWarn = console.warn,
        
        math = Math,
        {abs:mathAbs, min:mathMin, max:mathMax, pow:mathPow} = math,
        
        isArray = Array.isArray,
        
        documentElem = document,
        headElem = documentElem.head,
        createElement = documentElem.createElement.bind(documentElem),
        
        /* Start:resource loading */
        RESOURCE_TYPE_SCRIPT = 'script',
        RESOURCE_TYPE_CSS = 'css',
        
        // Used to prevent loading the same resource more than once.
        loadedResources = {},
        
        // Holds references to the DOM elements that loaded a resource.
        resourceElemsByHref = {},
        
        /*  Dynamically load a resource into the dom.
            @param {string} type - The type of resource to load. This will be either "script"
                or "css".
            @param {string} src - The URL to the resource.
            @param {?Function} [callback] - A function called when the resource loads. A boolean
                is passed to it indicating success or failure.
            @param {boolean} [noCacheBust] - If true, no cacheBust query param will be added. 
                Defaults to undefined which is equivalent to false.
            @param {string} [integrity] - If provided, an integrity, crossorigin check and 
                no-referrer policy will be set on the dom element.
            @returns {?Object} - The DOM element for the resource or undefined if no src was
                provided. */
        loadResource = (type, src, callback, noCacheBust, integrity) => {
            if (!src) return;
            
            // Prevent reloading the same resource
            let loadedResourceState = loadedResources[src],
                elem = resourceElemsByHref[src];
            if (loadedResourceState === true) {
                // Resource already loaded successfully
                callback?.(true);
            } else if (loadedResourceState === false) {
                // Resource already loaded unsuccessfully
                callback?.(false);
            } else if (isArray(loadedResourceState)) {
                // Resource is currently loading so store callback for later resolution.
                if (callback) loadedResourceState.push(callback);
            } else {
                // Load the resource
                loadedResourceState = loadedResources[src] = [];
                if (callback) loadedResourceState.push(callback);
                
                let srcPropName;
                switch (type) {
                    case RESOURCE_TYPE_SCRIPT:
                        elem = createElement('script');
                        elem.type = 'text/javascript';
                        elem.async = false;
                        srcPropName = 'src';
                        break;
                    case RESOURCE_TYPE_CSS:
                        elem = createElement('link');
                        elem.rel = 'stylesheet';
                        srcPropName = 'href';
                        break;
                }
                
                if (integrity) {
                    elem.integrity = integrity;
                    elem.crossOrigin = 'anonymous';
                    elem.referrerpolicy = 'no-referrer';
                }
                
                const executeCallbacks = success => {
                    // Prevent later events from this script. For example, if the src is changed.
                    elem.onload = elem.onerror = null;
                    
                    for (const callbackFunc of loadedResourceState) callbackFunc(success);
                    loadedResources[src] = success;
                };
                elem.onerror = () => {executeCallbacks(false);};
                elem.onload = () => {executeCallbacks(true);};
                
                // Must set src AFTER adding onreadystatechange listener otherwise we’ll miss 
                // the loaded event for cached scripts
                elem[srcPropName] = src + (noCacheBust ? '' : (src.includes('?') ? '&' : '?') + 'cacheBust=' + Date.now());
                
                headElem.appendChild(elem);
                
                resourceElemsByHref[src] = elem;
            }
            
            return elem;
        },
        /* End:resource loading */
        
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
            for (const fontName of [familyName, familyName + ' ' + fontFace.weight]) {
                if (!fontLoaded[fontName]) {
                    fontLoaded[fontName] = true;
                    const targets = fontTargets[fontName] ?? [];
                    while (targets.length) notifyInstanceThatFontLoaded(targets.pop(), familyName);
                }
            }
        },
        
        notifyInstanceThatFontLoaded = (instance, familyName) => {
            if (instance && !instance.destroyed && instance.isVisible()) {
                instance.sizeViewToDom();
                instance.notifyFontLoaded?.(familyName);
            }
        },
        
        // Start:I18N //
        // The localization dictionaries for I18N
        dictionaries = {},
        
        // The localization resource dictionaries for I18N
        resourceDictionaries = {},
        
        // Matches plural replacements of the form: {{plural:$<index>|<singular>|<plural>}}
        I18N_PLURAL_REGEX = /\{\{plural:\$(\d+)\|([^|]+)\|([^}]+)\}\}/g,
        
        // Matches numeric placeholders such as $0, $1, etc.
        I18N_NUMERIC_ARG_REGEX = /\$(\d+)/g,
        // End:I18N //
        
        /*  Creates a memoized version of the provided function.
            @param {!Function} func - The function to memoize.
            @param {Function} [keyResolver] - Optional function to generate custom keys. Defaults to JSON.stringify.
            @param {number} [cacheLimit] - Optional maximum size of the cache. Defaults to unlimited.
            @returns {!Function} - The memoized function. */
        memoize = (func, keyResolver=JSON.stringify, cacheLimit=Infinity) => {
            const cache = new Map();
            return (...args) => {
                const key = keyResolver(args);
                if (cache.has(key)) return cache.get(key);
                
                const result = func(...args);
                cache.set(key, result);
                
                if (cache.size > cacheLimit) {
                    const firstKey = cache.keys().next().value;
                    cache.delete(firstKey);
                }
                return result;
            };
        },
        
        /*  Generates a globally unique id, (GUID).
            @returns {number} */
        generateGuid = () => ++GUID_COUNTER,
        
        /*  Test if two values are deeply equal to each other. Handles primitives, Dates, Objects
            and Arrays. Tracks Objects it has seen to prevent stack overflows from cycles. */
        deepEqual = (a, b, seenA=new WeakMap(), seenB=new WeakMap()) => {
            // First do a quick reference check and tests primitives.
            if (a !== b) {
                // Make Dates something easy to compare.
                if (a instanceof Date && b instanceof Date) return a.getTime() === b.getTime();
                
                // Ensure we're now dealing with two Objects (or Arrays).
                if (a === null || b === null || typeof a !== 'object' || typeof b !== 'object') return false;
                
                // Prevent cycles
                if (seenA.has(a)) return seenB.get(b) === seenA.get(a);
                seenA.set(a, b);
                seenB.set(b, a);
                
                // Quick check for Array vs Object.
                const isArrA = isArray(a),
                    isArrB = isArray(b);
                if (isArrA !== isArrB) return false;
                
                // Check Arrays
                if (isArrA) {
                    const lenA = a.length;
                    if (lenA !== b.length) return false;
                    for (let i = 0; i < lenA; i++) {
                        if (!deepEqual(a[i], b[i], seenA, seenB)) return false;
                    }
                    return true;
                }
                
                // Check Objects
                const keysA = Object.keys(a),
                    keysB = Object.keys(b);
                if (keysA.length !== keysB.length) return false;
                for (const key of keysA) {
                    if (!Object.prototype.hasOwnProperty.call(b, key)) return false;
                    if (!deepEqual(a[key], b[key], seenA, seenB)) return false;
                }
            }
            return true;
        },
        
        CURLY_BRACES_WITH_ESCAPES_REGEX = /\\([{}])|\{([^{}]+)\}/g,
        CSV_OBJECT_REGEX = /(\,|\r?\n|\r|^)(?:"((?:\\.|""|[^\\"])*)"|([^\,"\r\n]*))/gi,
        CSV_UNESCAPE_REGEX = /[\\"](.)/g,
        
        myt = pkg.myt = {
            /** A version number based on the time this distribution of myt was created. */
            version:20250728.1019,
            
            generateGuid: generateGuid,
            
            TRUE_FUNC: () => true,
            FALSE_FUNC: () => false,
            NOOP: () => {},
            
            /** Theme properties for various components.
                IMPORTANT! Don't import these directly into packages. That would make them
                    difficult to override in projects that use myt. It is OK to import the
                    entire theme, just don't do theme:{foo, bar, baz}.
            */
            theme:{
                TextButtonActive:'#ddd',
                TextButtonHover:'#eee',
                TextButtonReady:'#fff',
                
                /* The default corner radius for a Dialog. */
                DialogRadius:12,
                /* The default background color for a Dialog. */
                DialogBgColor:'#fff',
                DialogInputFgColor:'#333',
                /* The default box shadow for a Dialog. */
                DialogShadow:[0, 4, 20, '#666'],
                /* The default border for a Dialog */
                DialogBorder:[1, 'solid', '#fff'],
                
                DialogDayBtnBorder:[1, 'solid', '#fff'], // Must be a separate instance from DialogBorder to allow independent partial overrides.
                DialogDayBtnBorderColor:'#fff',
                DialogDayBtnBorderColorToday:'#090',
                
                DimmerOpacity:0.35,
                DimmerColor:'#000',
                
                /* The default horizontal padding for a ModalPanel. */
                ModalPanelPaddingX:20,
                /* The default vertical padding for a ModalPanel. */
                ModalPanelPaddingY:15,
                /* The default margin to for a ModalPanelp. */
                ModalPanelMarginTop:40,
                /* The default margin left for a ModalPanel. */
                ModalPanelMarginLeft:40,
                /* The default margin bottom for a ModalPanel. */
                ModalPanelMarginBottom:40,
                /* The default margin right for a ModalPanel. */
                ModalPanelMarginRight:40,
                
                TabSliderContainerSpacing:1,
                
                TabInset:8,
                TabOutset:8,
                
                TabContainerInset:0,
                TabContainerSpacing:1,
                
                /* The default length of time in millis before the tooltip is shown. */
                BaseTooltipDelay:500,
                /* The default length of time in millis before the tooltip is hidden. */
                BaseTooltipHideDelay:100,
                
                TooltipEdgeColor:'#444',
                TooltipBgColor:'#444',
                TooltipTextColor:'#eee',
                TooltipShadowColor:'#00000033', // Extra nums are opacity
                TooltipEdgeSize:0,
                TooltipShadowSize:2,
                TooltipHInset:6,
                TooltipVInset:3,
                
                focusShadow:[0, 0, 7, '#666'],
                disabledOpacity:0.5,
                
                border1s3:[1, 'solid', '#333'],
                border1s9:[1, 'solid', '#999']
            },
            
            
            // Object Utility Functions ////////////////////////////////////////
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
                
                const parts = isArray(objName) ? objName : objName.split('.'), 
                    len = parts.length;
                for (let i = 0; i < len; i++) {
                    scope = scope[parts[i]];
                    if (scope == null) {
                        consoleWarn('resolveName failed for', objName, 'at part', i, parts[i]);
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
            
            /** Set a value deep into an Object tree creating any missing objects as needed.
                @param {?Object} root - The Object to set the value on. If falsy no action will
                    be taken.
                @param {string|?Array} path - The path into the Object structure. Either an array 
                    of names or a string with "." delimiters between names. If not falsy nothing 
                    will be set.
                @param {*} [value] - The value to set. If not provided undefined will be used.
                @returns {*} - The value that was set or undefined if the operation failed. And yes,
                    this means determining the success of setting undefined might be confusing. */
            setDeepValue: (root, path, value) => {
                if (root && path) {
                    const keys = isArray(path) ? path : String(path ?? '').split('.'),
                        len  = keys.length - 1;
                    let curr = root;
                    for (let i = 0; i < len; i++) {
                        const key = keys[i];
                        curr[key] ??= {};
                        curr = curr[key];
                    }
                    return curr[keys[len]] = value;
                }
            },
            
            stableStringify: obj => JSON.stringify(obj, (key_ignored, value) => {
                /* Only re-order plain objects; leave arrays and primitives untouched.
                   This works because iteration order is insertion order of String based keys.
                   Note: you can't have both a numeric and string key in an Object that serializes
                   to the same value, eg. 2 and "2" can't both exist. */
                if (value && typeof value === 'object' && !isArray(value)) {
                    const sorted = {};
                    for (const key of Object.keys(value).sort()) sorted[key] = value[key];
                    return sorted;
                }
                return value;
            }),
            
            
            // Equality Tests //////////////////////////////////////////////////
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
            
            /** Tests if two Arrays are shallowly equal.
                @param {?Array} a
                @param {?Array} b
                @returns {boolean} */
            areArraysEqual: (a, b) => {
                // First do a quick reference check and tests primitives.
                if (a !== b) {
                    // Ensure we're now dealing with two Objects (or Arrays).
                    if (a === null || b === null || typeof a !== 'object' || typeof b !== 'object') return false;
                    
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
            shallowEqual: (a, b) => {
                // First do a quick reference check and tests primitives.
                if (a !== b) {
                    // Ensure we're now dealing with two Objects (or Arrays).
                    if (a === null || b === null || typeof a !== 'object' || typeof b !== 'object') return false;
                    
                    // Quick test using key counts.
                    const keysA = Object.keys(a),
                        keysB = Object.keys(b);
                    if (keysA.length !== keysB.length) return false;
                    
                    // Shallow compare values for each key
                    for (const key of keysA) {
                        if (a[key] !== b[key]) return false;
                    }
                }
                return true;
            },
            
            deepEqual:deepEqual,
            
            
            // Random numbers //////////////////////////////////////////////////
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
            
            
            // DOM /////////////////////////////////////////////////////////////
            /** Gets the dom element of the provided tagname and index.
                @param {string} [tagname] - The name of the tag to search for. 
                    Defaults to 'body' if not provided
                @param {number} [index] - The index of the tag to get. 
                    Defaults to 0 if not provided.
                @returns {?Object} a dom element or undefined if none exist. */
            getElement: (tagname, index) => documentElem.getElementsByTagName(tagname || 'body')[index > 0 ? index : 0],
            
            /** Adds an event listener to a dom element. 
                @param {!Object} elem - The DomElement to listen to.
                @param {string} type - The name of the event to listen to.
                @param {!Function} callback - The callback function that will be registered for 
                    the event.
                @param {boolean} [capture] - Indicates if the listener is registered during the 
                    capture phase or bubble phase.
                @param {boolean} passive
                @returns {void} */
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
                @returns {void} */
            removeEventListener: (elem, type, callback, capture) => {
                elem.removeEventListener(type, callback, capture || false);
            },
            
            
            // Fonts ///////////////////////////////////////////////////////////
            loadFontFaces: (fontList, callback) => {
                Promise.all(fontList.map(
                    ({family, url, options}) => new FontFace(family, 'url(' + url + ')', options).load()
                )).then(loadedFonts => {
                    if (docFonts) {
                        for (const font of loadedFonts) {
                            docFonts.add(font);
                            notifyFontLoaded(font);
                        }
                        callback?.(loadedFonts);
                    }
                });
            },
            
            loadFontFace: (fontName, fontUrl, fontOptions={}, callback) => {
                const fontFace = new FontFace(fontName, 'url(' + fontUrl + ')', fontOptions);
                fontFace.loaded.then(loadedFontFace => {
                    if (docFonts) {
                        docFonts.add(loadedFontFace);
                        notifyFontLoaded(loadedFontFace);
                        callback?.(loadedFontFace);
                    }
                });
                fontFace.load();
            },
            
            registerForFontNotification: (textView, fontName) => {
                if (fontLoaded[fontName]) {
                    notifyInstanceThatFontLoaded(textView, fontName);
                } else {
                    (fontTargets[fontName] ??= []).push(textView);
                }
            },
            
            /** Create a CSS rule that defines the base font for the document.
                @param {string} fontFamily
                @returns {void} */
            createBaseFontCSSRule: fontFamily => {
                myt.addCSSRule(myt.createStylesheet(), 'body, input', 'font-family:' + fontFamily);
            },
            
            /** @param {?Array} fontUrls
                @returns {void} */
            loadCSSFonts: fontUrls => {
                fontUrls?.forEach(myt.loadCSS);
            },
            
            
            // CSS and Script Loading //////////////////////////////////////////
            loadScript: (...args) => loadResource(RESOURCE_TYPE_SCRIPT, ...args),
            
            loadCSS: (...args) => loadResource(RESOURCE_TYPE_CSS, ...args),
            
            /** Creates a "style" dom element.
                @returns {!Object} */
            createStylesheet: () => {
                const style = createElement('style');
                headElem.appendChild(style);
                return style.sheet;
            },
            
            addCSSRule: (sheet, selector, rules, index) => {
                sheet.insertRule(selector + '{' + rules + '}', index ?? 0);
            },
            
            removeCSSRules: sheet => {
                let i = sheet.cssRules.length;
                while (i) sheet.deleteRule(--i);
            },
            
            createInputPlaceholderCSSRule: (view, color, fontFamily, opacity=1) => {
                // Clear existing sheet if it exists or create a new sheet
                let sheet = view.__sheet;
                if (sheet) {
                    myt.removeCSSRules(sheet);
                } else {
                    sheet = view.__sheet = myt.createStylesheet();
                }
                
                // Make sure the view has a dom ID for rule targeting and then write the CSS rules.
                const ode = view.getODE(),
                    domId = ode.id || (ode.id = 'id' + generateGuid()),
                    rules = [];
                if (color) rules.push('color:' + color);
                if (fontFamily) rules.push('font-family:' + fontFamily);
                if (opacity) rules.push('opacity:' + opacity);
                myt.addCSSRule(sheet, '#' + domId + '::placeholder', rules.join('; '));
            },
            
            
            // Sort Utility ////////////////////////////////////////////////////
            /** Checks if the provided array is sorted according to the provided comparator function.
                @param {!Array} arr - The array to check.
                @param {!Function} comparatorFunc - The comparator function to use for sorting checks.
                @returns {boolean} - True if the array is sorted, false otherwise. */
            isSorted: (arr, comparatorFunc) => {
                const len = arr.length;
                for (let i = 1; i < len; i++) {
                    if (comparatorFunc(arr[i - 1], arr[i]) > 0) return false;
                }
                return true;
            },
            
            /** Chains together N comparator functions into a new comparator function such that 
                calls each in order of descending priority.
                @param {...!Function} comparatorFunctions - The comparator functions to call.
                @returns {!Function} - The new composite comparator function. */
            chainSortFunc: (...comparatorFunctions) => {
                return (a, b) => {
                    for (const comparatorFunc of comparatorFunctions) {
                        const retval = comparatorFunc(a, b);
                        if (retval !== 0) return retval;
                    }
                    return 0;
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
                const order = ascending ? 1 : -1,
                    locale = myt.I18N.getLocale(),
                    options = {sensitivity:caseInsensitive ? 'accent' : 'variant'};
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
                    return a.localeCompare(b, locale, options) * order;
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
            
            
            // String Utility Functions ////////////////////////////////////////
            /** Creates a non-secure hash of a string.
                @param {string} s - The string to hash.
                @returns {number} */
            hash: s => s.split('').reduce((a, b) => {a = ((a << 5) - a) + b.charCodeAt(0); return a&a;}, 0),
            
            /** Gets the file extension from a file name.
                @param {string} fileName - The filename to extract the extension from.
                @returns {string) - The file extension, or null if a falsy fileName argument was 
                    provided. */
            getExtension: fileName => {
                if (fileName) {
                    const parts = fileName.split('.');
                    return parts.length > 1 ? parts.pop() : null;
                } else {
                    return null;
                }
            },
            
            /** Format a number between 0 and 1 as a percentage.
                @param {number} num The number to convert.
                @param {number} [fixed] The number of decimal places to use during formatting. If 
                    the percentage is a whole number no decimal places will be used. For example,
                    0.55781 -> 55.78% and 0.55 -> 55%
                @returns {string} */
            formatAsPercentage: (num, fixed=2) => {
                switch (typeof num) {
                    case 'number':
                        fixed = mathMin(16, mathMax(0, fixed));
                        const percent = math.round(mathMax(0, mathMin(1, num)) * mathPow(10, 2+fixed)) / mathPow(10, fixed);
                        return (percent % 1 === 0 ? percent : percent.toFixed(fixed)) + '%';
                    case 'string':
                        // Assume a string passed to this function is already correctly formatted 
                        // so pass it through unchanged.
                        return num;
                    default:
                        consoleWarn('formatAsPercentage expects a number');
                        return num;
                }
            },
            
            /** Replace data by key into a string template where the template uses {key} to 
                indicate where the replacement occurs. The \ character can be used to escape
                curly braces that should not be treated as a replacement target.
                @param {string} template - The template to do replacements on and return. If not
                    provided or falsy, empty string will be returned.
                @param {!Object= data - The data to use for replacements in the template.
                @returns {string} - The interpolated string.
                */
            interpolateString: (template, data={}) => {
                return template ? template.replace(
                    CURLY_BRACES_WITH_ESCAPES_REGEX,
                    (match, escapedChar, key) => {
                        // If we encounter \{ or \}, `escapedChar` is "{" or "}", so return it.
                        if (escapedChar) return escapedChar;
                        
                        // Otherwise it was a real {key}—replace if found, or leave "{key}" intact.
                        return myt.resolveName(key, data) ?? match;
                        //return key in data ? myt.resolveName(key, data) : match;
                    }
                ) : '';
            },
            
            /** Convert a number to a string of a minimum length. Zero or more
                of a padding character are prepended to achieve the minimum
                length.
                @param {number} num - The number to format.
                @param {number} length - The minimum length of the formatted
                    return string.
                @param {string} [padChar] - The character to left pad with.
                    Defaults to the string "0".
                @param {number} [base] - The base for the formatted number.
                    Defaults to base 10.
                @returns {string} - The formatted number. */
            leftPadNumber: (num, length, padChar='0', base=10) => {
                const numStr = num.toString(base);
                return padChar.repeat(mathMax(length - numStr.length, 0)) + numStr;
            },
            
            /** Remove HTML markup from the provided string.
                @param {string} str - The string to remove the markup from.
                @param {?Objet} [cfg] - Provides additional information about how to do the
                    conversion. The only supported config parameter is the boolean
                    brToLineFeed which converts <br> tags to \n characters.
                @returns {string} - The string with markup removed or empty string if something
                    falsy was provided. */
            removeMarkup: (str, cfg) => {
                if (!str) return '';
                if (cfg?.brToLineFeed) str = str.replace(/<br\s*\/?>/gi, '\n');
                return str.replace(/<\/?[^>]+(>|$)/g, '');
            },
            
            escapeMarkup: (() => {
                const REGEX = new RegExp('[&<>"\']', 'g'),
                    MAP = {
                        '&':'&amp;',
                        '<':'&lt;',
                        '>':'&gt;',
                        '"':'&quot;',
                        "'":'&#039;'
                    },
                    MATCH_FUNC = match => MAP[match];
                return str => str.replace(REGEX, MATCH_FUNC);
            })(),
            
            
            // Function Utility Functions //////////////////////////////////////
            /** Memoize a function.
                @param {!Function} func - The function to memoize
                @returns {!Function} - The memoized function. */
            memoize: memoize,
            
            /** Creates a debounced function that delays invoking the provided function until after
                the specified wait time has elapsed since the last time it was invoked.
                @param {!Function} func - The function to debounce.
                @param {number} [wait] - The number of milliseconds to delay.
                @param {boolean} [immediate=false] - Whether to invoke the function immediately on the leading edge.
                @returns {!Function} - A debounced version of the provided function. */
            debounce: (func, wait, immediate=false) => {
                let timeout;
                return function(...args) {
                    const context = this,
                        later = () => {
                            timeout = null;
                            if (!immediate) func.apply(context, args);
                        },
                        callNow = immediate && !timeout;
                    clearTimeout(timeout);
                    timeout = setTimeout(later, wait);
                    if (callNow) func.apply(context, args);
                };
            },
            
            
            // Misc ////////////////////////////////////////////////////////////
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
            
            /** Runs code in a Worker for better encapsulation.
                @param {string} funcBody - The javascript code to run. The provided dataObj will be
                    exposed to the funcBody as a variable named by dataObjName. Here is an
                    example function body: "return 100 * data.foo / data.bar;" and 
                    dataObj {foo:123, bar:456}
                @param {?Object} dataObj - The data to pass to the function created from funcBody.
                @param {string}[dataObjName] - The name to expose the dataObj with to the funcBody.
                    Defaults to "data".
                @returns {!Promise} - The Promise that will be resolved or rejected once the code
                    has run. */
            runInWorker: (funcBody, dataObj, dataObjName='data') => new Promise((resolve, reject) => {
                const url = URL.createObjectURL(
                        /* self.onmessage = e => {
                            try {
                                const result = (function(${dataObjName}) {"use strict";${funcBody}})(e.data);
                                self.postMessage({result});
                            } catch (err) {
                                self.postMessage({error:err.message});
                            }
                        }; */
                        new Blob([
                            'self.onmessage=e=>{try{const result=(function(' + dataObjName + '){"use strict";' + funcBody + '})(e.data);self.postMessage({result});}catch(e){self.postMessage({error:e.message});}};'
                        ], {type:'application/javascript'})
                    ),
                    worker = new Worker(url),
                    cleanup = () => {
                        worker.terminate();
                        URL.revokeObjectURL(url);
                    };
                worker.onmessage = event => {
                    const {result, error} = event.data;
                    if (error) {
                        reject(new Error(error));
                    } else {
                        resolve(result);
                    }
                    cleanup();
                };
                worker.onerror = err => {
                    reject(err);
                    cleanup();
                };
                worker.postMessage(dataObj);
            }),
            
            /** A wrapper on myt.global.error.notify
                @param {string|?Error} err - The error or message to dump stack for.
                @param {string} [type] - The type of console message to write. Allowed values are 
                    'error', 'warn', 'log' and 'debug'. Defaults to 'error'.
                @returns {void} */
            dumpStack: (err, type) => {
                let msg;
                if (typeof err === 'string') {
                    msg = err;
                    err = null;
                }
                myt.global.error.notify(type || 'error', null, msg, err);
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
                    consoleWarn('Increment: Abort clobber', incrName, scope);
                    return false;
                }
                if ((isModuleOrClass ? scope.instanceMethod(decrName) : scope[decrName]) !== undefined) {
                    consoleWarn('Decrement: Abort clobber', decrName, scope);
                    return false;
                }
                
                // Define the "module".
                /** Increments the counter attribute on the scope object by 1.
                    @returns {void} */
                mod[incrName] = function() {
                    const value = this[counterAttrName] + 1;
                    this[counterAttrName] = value;
                    this.fireEvent(counterAttrName, value);
                    if (value === thresholdValue) this.set(exceededAttrName, true);
                };
                
                /** Decrements the counter attribute on the scope object by 1.
                    @returns {void} */
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
            
            
            // CSV /////////////////////////////////////////////////////////////
            /** Converts a CSV string to an array of arrays or an array of objects.
                Code from: https://gist.github.com/plbowers/7560ae793613ee839151624182133159
                @param {string} [strData]
                @param {boolean} [header] - If true each row will be converted to an object with 
                    keys based on the first row being treated as an array of header strings.
                @returns {!Array} An array of arrays or an array of objects if the header param 
                    is true. */
            csvStringToArray: (strData, header) => {
                if (!strData) return [];
                
                const arrData = [[]];
                let arrMatches;
                while (arrMatches = CSV_OBJECT_REGEX.exec(strData)) {
                    if (arrMatches[1].length && arrMatches[1] !== ',') arrData.push([]);
                    arrData[arrData.length - 1].push(arrMatches[2] !== undefined ? arrMatches[2].replace(CSV_UNESCAPE_REGEX, '$1') : arrMatches[3]);
                }
                
                if (header) {
                    const headerData = arrData.shift();
                    return arrData.map(row => {
                        let i = 0;
                        return headerData.reduce((acc, key) => {acc[key] = row[i++]; return acc;}, {});
                    });
                } else {
                    return arrData;
                }
            },
            
            /** Prepare a CSV data URI according to RFC 4180.
                @param {?Array} rows
                @param {?Array} [headerNames]
                @returns {string} */
            prepareCSVDataURI: (rows, headerNames) => {
                const prepareRow = row => {
                        if (row && isArray(row)) {
                            const colAccum = [],
                                len = row.length;
                            for (let i = 0, col; len > i; i++) {
                                col = row[i];
                                
                                // All columns must have a value.
                                col = col == null ? '' : col.toString();
                                
                                // " are escaped as ""
                                col = col.replace(/"/g, '""');
                                
                                // If the column contains reserved characters it must be wrapped in 
                                // double quotes.
                                if (col.search(/("|,|\n)/g) >= 0) col = '"' + col + '"';
                                
                                colAccum.push(col);
                            }
                            return colAccum.join(',');
                        } else {
                            consoleWarn('Unexpected row', row);
                            return null;
                        }
                    },
                    rowAccum = [];
                
                if (headerNames) {
                    const row = prepareRow(headerNames);
                    if (row) rowAccum.push(row);
                }
                
                if (rows) {
                    if (isArray(rows)) {
                        const len = rows.length;
                        for (let i = 0; len > i; i++) {
                            const row = prepareRow(rows[i]);
                            if (row) rowAccum.push(row);
                        }
                    } else {
                        consoleWarn('Rows were not an array');
                    }
                }
                
                return myt.encodeCSVDataURI(rowAccum.join('\r\n'), headerNames);
            },
            
            encodeCSVDataURI: (csvData, headerNames) => {
                const header = headerNames == null ? '' : ';header=' + (headerNames ? 'present' : 'absent');
                return 'data:text/csv;charset=utf-8' + 
                    header + ',' + 
                    encodeURIComponent(csvData);
            },
            
            
            // Fetch ///////////////////////////////////////////////////////////
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
                                if (response.success === false) throw new FetchError(200, url, response.message ?? response.data?.message);
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
            
            
            // String Processing ///////////////////////////////////////////////
            toNameCase: (nameStr, individualFields) => {
                if (!nameStr) return '';
                
                // Split names on regex whitespace, dash or apostrophe, workaround for
                // Javascript regex word boundary \b splitting on unicode characters
                // http://stackoverflow.com/questions/5311618/javascript-regular-expression-problem-with-b-and-international-characters
                nameStr = nameStr.trim().toLowerCase().split(/([\s\-'’"“”().,\/])/).reduce(
                    (accumulator, token) => accumulator + (token[0] ?? '').toUpperCase() + token.slice(1), ''
                );
                
                // Name case Mcs and Macs
                // Exclude names with 1-2 letters after prefix like Mack, Macky, Mace
                // Exclude names ending in a,c,i,o, or j are typically Polish or Italian
                if (
                    /\bMac[A-Za-z]{2,}[^aciozj]\b/.test(nameStr) || /\bMc/.test(nameStr)
                ) {
                    nameStr = nameStr.replace(
                        /\b(Ma?c)([A-Za-z]+)/,
                        (x, y, z) => y + (z[0] ?? '').toUpperCase() + z.slice(1)
                    );
                    
                    // Now correct for "Mac" exceptions
                    nameStr = nameStr
                        .replace(/\bMacEvicius\b/, 'Macevicius')
                        .replace(/\bMacHado\b/, 'Machado')
                        .replace(/\bMacHar\b/, 'Machar')
                        .replace(/\bMacHin\b/, 'Machin')
                        .replace(/\bMacHlin\b/, 'Machlin')
                        .replace(/\bMacIas\b/, 'Macias')
                        .replace(/\bMacIulis\b/, 'Maciulis')
                        .replace(/\bMacKie\b/, 'Mackie')
                        .replace(/\bMacKle\b/, 'Mackle')
                        .replace(/\bMacKlin\b/, 'Macklin')
                        .replace(/\bMacQuarie\b/, 'Macquarie')
                        .replace(/\bMacOmber\b/, 'Macomber')
                        .replace(/\bMacIn\b/, 'Macin')
                        .replace(/\bMacKintosh\b/, 'Mackintosh')
                        .replace(/\bMacKen\b/, 'Macken')
                        .replace(/\bMacHen\b/, 'Machen')
                        .replace(/\bMacHiel\b/, 'Machiel')
                        .replace(/\bMacIol\b/, 'Maciol')
                        .replace(/\bMacKell\b/, 'Mackell')
                        .replace(/\bMacKlem\b/, 'Macklem')
                        .replace(/\bMacKrell\b/, 'Mackrell')
                        .replace(/\bMacLin\b/, 'Maclin')
                        .replace(/\bMacKey\b/, 'Mackey')
                        .replace(/\bMacKley\b/, 'Mackley')
                        .replace(/\bMacHell\b/, 'Machell')
                        .replace(/\bMacHon\b/, 'Machon')
                        .replace(/\bMacAyla\b/, 'Macayla');
                }
                
                // And correct Mac exceptions otherwise missed
                nameStr = nameStr
                    .replace(/\bMacmurdo/, 'MacMurdo')
                    .replace(/\bMacisaac/, 'MacIsaac')
                    
                    // Fixes for "son (daughter) of" etc. in various languages.
                    .replace(/\bAl(?=\s+\w)\b/g,  'al')     // al Arabic or forename Al.
                    .replace(/\bAp\b/g,           'ap')     // ap Welsh.
                    .replace(/\bBen(?=\s+\w)\b/g, 'ben')    // ben Hebrew or forename Ben.
                    .replace(/\bDell([ae])\b/g,   'dell$1') // della and delle Italian.
                    .replace(/\bD([aeiu])\b/g,    'd$1')    // da, de, di Italian; du French.
                    .replace(/\bDe([lr])\b/g,     'de$1')   // del Italian; der Dutch/Flemish.
                    .replace(/\bEl\b/g,           'el')     // el Greek
                    .replace(/\bLa\b/g,           'la')     // la French
                    .replace(/\bLe(?=\s+\w)\b/g,  'le')     // le French
                    .replace(/\bLo\b/g,           'lo')     // lo Italian
                    .replace(/\bVan(?=\s+\w)\b/g, 'van')    // van German or forename Van.
                    .replace(/\bVon\b/g,          'von')    // von Dutch/Flemish
                    .replace(/\bD['’]/g,          'd\'')    // d’Orsay
                    
                    // Fixes for roman numeral names, e.g. Henry VIII
                    .replace(/\b(?:\d{4}|(?:[IVX])(?:X{0,3}I{0,3}|X{0,2}VI{0,3}|X{0,2}I?[VX]))$/i, v => v.toUpperCase())
                    
                    // Nation of Islam 2X, 3X, etc. names
                    .replace(/\b[0-9](x)\b/, v => v.toUpperCase())
                    
                    // Somewhat arbitrary rule where two letter combos not containing vowels should be capitalized
                    // fixes /JJ Abrams/ and /JD Salinger/
                    // With some exceptions
                    .replace(/(?:^|\\s)[bcdfghjklmnpqrstvwxzBCDFGHJKLMNPQRSTVWXZ]{2}\s/, v => v.toUpperCase())
                    .replace(/\bMR\.?\b/, 'Mr')
                    .replace(/\bMS\.?\b/, 'Ms')
                    .replace(/\bDR\.?\b/, 'Dr')
                    .replace(/\bST\.?\b/, 'St')
                    .replace(/\bJR\.?\b/, 'Jr')
                    .replace(/\bSR\.?\b/, 'Sr')
                    .replace(/\bLT\.?\b/, 'Lt')
                    
                    // lowercase words
                    .replace(/\bThe\b/g, 'the')
                    .replace(/\bOf\b/g, 'of')
                    .replace(/\bAnd\b/g, 'and')
                    .replace(/\bY\s/g, 'y')
                    
                    // strip extra spaces
                    .replace(/\s{2,}/g, ' ');
                
                // Check if we should force the first character to caps
                if (individualFields) {
                    // First character may be lowercase
                    return nameStr;
                } else {
                    // Force first character to be uppercase
                    return (nameStr[0] ?? '').toUpperCase() + nameStr.slice(1);
                }
            },
            
            
            // I18N ////////////////////////////////////////////////////////////
            I18N: {
                // Set the locale and update the active dictionary cache.
                setLocale: locale => {
                    currentLocale = locale ?? (navigator.language || 'en').split('-')[0].toLowerCase(); // English is the default locale.
                    activeDictionary = dictionaries[currentLocale];
                    activeResourceDictionary = resourceDictionaries[currentLocale];
                },
                
                // Get the current locale, detect one if missing.
                getLocale: () => currentLocale,
                
                // Add or merge dictionary data for a given locale.
                addDictionary: (dictionary, locale) => {
                    dictionaries[locale] = Object.assign(dictionaries[locale] ?? {}, dictionary);
                    if (locale === currentLocale) activeDictionary = dictionaries[locale];
                },
                
                // Replace the dictionary for the specified locale.
                setDictionary: (dictionary, locale) => {
                    dictionaries[locale] = dictionary ?? {};
                    if (locale === currentLocale) activeDictionary = dictionaries[locale];
                },
                
                // Add or merge resource dictionary data for a given locale.
                addResourceDictionary: (resourceDictionary, locale) => {
                    resourceDictionaries[locale] = Object.assign(resourceDictionaries[locale] ?? {}, resourceDictionary);
                    if (locale === currentLocale) activeResourceDictionary = resourceDictionaries[locale];
                },
                
                // Replace the resource dictionary for the specified locale.
                setResourceDictionary: (resourceDictionary, locale) => {
                    resourceDictionaries[locale] = resourceDictionary ?? {};
                    if (locale === currentLocale) activeResourceDictionary = resourceDictionaries[locale];
                },
                
                // Lookup translation for a key with optional arguments for substitutions.
                get: (key, ...args) => {
                    const value = activeDictionary[key];
                    if (value != null) {
                        if (args.length > 0) {
                            return value.replaceAll(
                                // Process each {{plural:$n|single|multiple}} replacement
                                I18N_PLURAL_REGEX, (m, p1, p2, p3) => (p2 && p3) ? (args[parseInt(p1)] == 1 ? p2 : p3) : ''
                            ).replaceAll(
                                // Process $n replacement for every arg
                                I18N_NUMERIC_ARG_REGEX, (m, idx) => args[idx]
                            );
                        }
                        return value;
                    }
                    return key;
                },
                
                // Lookup translation for a key with no argument support.
                getRaw: key => activeDictionary[key] ?? key,
                
                // Lookup a resource for a key.
                getResource: key => activeResourceDictionary[key]
            }
        };
    
    if (docFonts) {
        docFonts.onloadingdone = fontFaceSetEvent => {
            for (const fontFace of fontFaceSetEvent.fontfaces) notifyFontLoaded(fontFace);
        };
    }
})(global);

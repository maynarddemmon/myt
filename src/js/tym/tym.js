/* eslint-disable no-cond-assign */ // if(a = b)
/* eslint-disable no-unused-vars */
(pkg => {
    /*
     * http://github.com/maynarddemmon/myt
     * Maynard Demmon <maynarddemmon@gmail.com>
     * @copyright Copyright (c) 2012-2023 Maynard Demmon and contributors
     * Tym: A simple javascript framework for use in NodeJS
     * Version: 20240721.2035
     * MIT License
     * 
     * Parts of the Software incorporates code from the following open-source projects:
     * * JS.Class, (c) 2007-2012 James Coglan and contributors (MIT License)
     */
    
    let 
        // Used to generate globally unique IDs.
        GUID_COUNTER = 0,
        
        // The current locale for the user.
        currentLocale;
    
    const consoleWarn = console.warn,
        
        math = Math,
        {abs:mathAbs, min:mathMin, max:mathMax, pow:mathPow} = math,
        
        isArray = Array.isArray,
        
        // The default locale for I18N.
        defaultLocale = 'en-US',
        
        // The localization dictionaries for I18N
        dictionaries = {},
        
        memoize = func => {
            const cache = {};
            return (...args) => {
                const hash = JSON.stringify(args);
                return hash in cache ? cache[hash] : cache[hash] = func(...args);
            };
        },
        
        /*  Generates a globally unique id, (GUID).
            @returns {number} */
        generateGuid = () => ++GUID_COUNTER,
        
        I18N_PLURAL_REGEX = /\{\{plural:\$(.*?)\|(.*?)\|(.*?)\}\}/g,
        I18N_NUMERIC_ARG_REGEX = /\$(\d+)/g,
        
        CSV_OBJECT_REGEX = /(\,|\r?\n|\r|^)(?:"((?:\\.|""|[^\\"])*)"|([^\,"\r\n]*))/gi,
        CSV_UNESCAPE_REGEX = /[\\"](.)/g,
        
        tym = pkg.tym = {
            /** A version number based on the time this distribution of tym was created. */
            version:20230602.1558,
            
            generateGuid: generateGuid,
            
            /** Creates a non-secure hash of a string.
                @param {string} s - The string to hash.
                @returns {number} */
            hash: s => s.split('').reduce((a, b) => {a = ((a << 5) - a) + b.charCodeAt(0); return a&a;}, 0),
            
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
                if (typeof value === 'string') value = tym.resolveName(value);
                
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
                @param {?Function} [func] - A distribution function. See tym.getRandom for more.
                @returns {number} a number between min and max. */
            getRandomArbitrary: (min, max, func) => {
                const actualMin = mathMin(min, max);
                return tym.getRandom(func) * (mathMax(min, max) - actualMin) + actualMin;
            },
            
            /** Generates a random integer between min (inclusive) and max (inclusive).
                @param {number} min - the minimum value returned.
                @param {number} max - the maximum value returned.
                @param {?Function} [func] - A distribution function. See tym.getRandom for more.
                @returns {number} a number between min and max. */
            getRandomInt: (min, max, func) => {
                const actualMin = mathMin(min, max);
                return math.floor(tym.getRandom(func) * (mathMax(min, max) - actualMin + 1) + actualMin);
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
            
            // Sort Util
            /** Tests if the provided array is already sorted according to the provided comparator
                function.
                @param {!Array} arr - The array to check.
                @param {!Function} comparatorFunc - The comparator function to check with.
                @returns {boolean} - True if the array is not sorted, false if it is. */
            isNotSorted: (arr, comparatorFunc) => {
                const len = arr.length;
                for (let i = 1; i < len; i++) {
                    if (comparatorFunc(arr[i - 1], arr[i]) > 0) return true;
                }
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
            
            // CSV
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
                    arrData[arrData.length - 1].push(arrMatches[2] ? arrMatches[2].replace(CSV_UNESCAPE_REGEX, '$1') : arrMatches[3]);
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
                
                return tym.encodeCSVDataURI(rowAccum.join('\r\n'), headerNames);
            },
            
            encodeCSVDataURI: (csvData, headerNames) => {
                const header = headerNames == null ? '' : ';header=' + (headerNames ? 'present' : 'absent');
                return 'data:text/csv;charset=utf-8' + 
                    header + ',' + 
                    encodeURIComponent(csvData);
            },
            
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
                switch (typeof num) {
                    case 'number': {
                        fixed = mathMin(16, mathMax(0, fixed));
                        const percent = math.round(mathMax(0, mathMin(1, num)) * mathPow(10, 2+fixed)) / mathPow(10, fixed);
                        return (percent % 1 === 0 ? percent : percent.toFixed(fixed)) + '%';
                    }
                    case 'string':
                        // Assume a string passed to this function is already correctly formatted 
                        // so pass it through unchanged.
                        return num;
                    default:
                        consoleWarn('formatAsPercentage: expects a number');
                        return num;
                }
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
            debounce: (func, wait, immediate) => {
                const timeoutKey = '__DBTO' + '_' + generateGuid();
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
                @param {!Object|!Function} scope - Either an tym.Observable, JS.Class or JS.Module 
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
                const genNameFunc = tym.AccessorSupport.generateName,
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
                    const locale = currentLocale ?? (currentLocale = defaultLocale.split('-')[0].toLowerCase()),
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
})(global);

const JS = global.JS,
    tym = global.tym;

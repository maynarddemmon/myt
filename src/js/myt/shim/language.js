// Object
/** Provides support for Object.keys in IE8 and earlier.
    Taken from: http://whattheheadsaid.com/2010/10/a-safer-object-keys-compatibility-implementation */
Object.keys = Object.keys || (function() {
    var hasOwnProperty = Object.prototype.hasOwnProperty,
        hasDontEnumBug = !{toString:null}.propertyIsEnumerable("toString"),
        DontEnums = [
            'toString',
            'toLocaleString',
            'valueOf',
            'hasOwnProperty',
            'isPrototypeOf',
            'propertyIsEnumerable',
            'constructor'
        ],
        DontEnumsLength = DontEnums.length;
    
    return function(o) {
        if (typeof o !== "object" && typeof o !== "function" || o === null)
            throw new TypeError("Object.keys called on non-object");
        
        var result = [], n;
        for (n in o) {
            if (hasOwnProperty.call(o, n)) result.push(n);
        }
        
        if (hasDontEnumBug) {
            for (var i = 0; i < DontEnumsLength; ++i) {
                if (hasOwnProperty.call(o, DontEnums[i])) result.push(DontEnums[i]);
            }
        }
        
        return result
    }
})();

// Array
/** Provides support for Array.isArray in IE8 and earlier.
    Taken from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/isArray */
Array.isArray = Array.isArray || function(v) {
    return Object.prototype.toString.call(v) === "[object Array]"
};

// Number
Number.parseInt = Number.parseInt || parseInt;
Number.parseFloat = Number.parseFloat || parseFloat;

// String
/** Provides support for String.trim in IE8 and earlier.
    Taken from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/Trim */
if (!String.prototype.trim) {
    String.prototype.trim = function() {
        return this.replace(/^\s+|\s+$/g,'')
    };
    String.prototype.trimLeft = function() {
        return this.replace(/^\s+/,'')
    };
    String.prototype.trimRight = function() {
        return this.replace(/\s+$/,'')
    };
};

// Date
/** Provides support for Date.now in IE8 and ealier.
    Taken from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/now */
Date.now = Date.now || function() {
    return new Date().getTime()
};

/** Formats a date using a pattern.
  * Implementation from: https://github.com/jacwright/date.format
  * 
  * Copyright (c) 2005 Jacob Wright
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
  * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
  * THE SOFTWARE
  */
Date.prototype.format = Date.prototype.format || (function() {
    Date.shortMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    Date.longMonths = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    Date.shortDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    Date.longDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    // defining patterns
    var replaceChars = {
        // Day
        d: function() {return (this.getDate() < 10 ? '0' : '') + this.getDate();},
        D: function() {return Date.shortDays[this.getDay()];},
        j: function() {return this.getDate();},
        l: function() {return Date.longDays[this.getDay()];},
        N: function() {return (this.getDay() == 0 ? 7 : this.getDay());},
        S: function() {return (this.getDate() % 10 == 1 && this.getDate() != 11 ? 'st' : (this.getDate() % 10 == 2 && this.getDate() != 12 ? 'nd' : (this.getDate() % 10 == 3 && this.getDate() != 13 ? 'rd' : 'th')));},
        w: function() {return this.getDay();},
        z: function() {var d = new Date(this.getFullYear(),0,1); return Math.ceil((this - d) / 86400000);}, // Fixed now
        // Week
        W: function() {
            var target = new Date(this.valueOf());
            var dayNr = (this.getDay() + 6) % 7;
            target.setDate(target.getDate() - dayNr + 3);
            var firstThursday = target.valueOf();
            target.setMonth(0, 1);
            if (target.getDay() !== 4) {
                target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
            }
            return 1 + Math.ceil((firstThursday - target) / 604800000);
        },
        // Month
        F: function() {return Date.longMonths[this.getMonth()];},
        m: function() {return (this.getMonth() < 9 ? '0' : '') + (this.getMonth() + 1);},
        M: function() {return Date.shortMonths[this.getMonth()];},
        n: function() {return this.getMonth() + 1;},
        t: function() {var d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 0).getDate()}, // Fixed now, gets #days of date
        // Year
        L: function() {var year = this.getFullYear(); return (year % 400 == 0 || (year % 100 != 0 && year % 4 == 0));}, // Fixed now
        o: function() {var d  = new Date(this.valueOf());  d.setDate(d.getDate() - ((this.getDay() + 6) % 7) + 3); return d.getFullYear();}, //Fixed now
        Y: function() {return this.getFullYear();},
        y: function() {return ('' + this.getFullYear()).substr(2);},
        // Time
        a: function() {return this.getHours() < 12 ? 'am' : 'pm';},
        A: function() {return this.getHours() < 12 ? 'AM' : 'PM';},
        B: function() {return Math.floor((((this.getUTCHours() + 1) % 24) + this.getUTCMinutes() / 60 + this.getUTCSeconds() / 3600) * 1000 / 24);}, // Fixed now
        g: function() {return this.getHours() % 12 || 12;},
        G: function() {return this.getHours();},
        h: function() {return ((this.getHours() % 12 || 12) < 10 ? '0' : '') + (this.getHours() % 12 || 12);},
        H: function() {return (this.getHours() < 10 ? '0' : '') + this.getHours();},
        i: function() {return (this.getMinutes() < 10 ? '0' : '') + this.getMinutes();},
        s: function() {return (this.getSeconds() < 10 ? '0' : '') + this.getSeconds();},
        u: function() {var m = this.getMilliseconds(); return (m < 10 ? '00' : (m < 100 ? '0' : '')) + m;},
        // Timezone
        e: function() {return /\((.*)\)/.exec(new Date().toString())[1];},
        I: function() {
            var DST = null;
                for (var i = 0; i < 12; ++i) {
                    var d = new Date(this.getFullYear(), i, 1);
                    var offset = d.getTimezoneOffset();

                    if (DST === null) {
                        DST = offset;
                    } else if (offset < DST) {
                        DST = offset; break;
                    } else if (offset > DST) {
                        break;
                    }
                }
                return (this.getTimezoneOffset() == DST) | 0;
            },
        O: function() {return (-this.getTimezoneOffset() < 0 ? '-' : '+') + (Math.abs(this.getTimezoneOffset() / 60) < 10 ? '0' : '') + (Math.abs(this.getTimezoneOffset() / 60)) + '00';},
        P: function() {return (-this.getTimezoneOffset() < 0 ? '-' : '+') + (Math.abs(this.getTimezoneOffset() / 60) < 10 ? '0' : '') + (Math.abs(this.getTimezoneOffset() / 60)) + ':00';}, // Fixed now
        T: function() {return this.toTimeString().replace(/^.+ \(?([^\)]+)\)?$/, '$1');},
        Z: function() {return -this.getTimezoneOffset() * 60;},
        // Full Date/Time
        c: function() {return this.format("Y-m-d\\TH:i:sP");}, // Fixed now
        r: function() {return this.toString();},
        U: function() {return this.getTime() / 1000;}
    };

    return function(format) {
        var date = this;
        return format.replace(/(\\?)(.)/g, function(_, esc, chr) {
            return (esc === '' && replaceChars[chr]) ? replaceChars[chr].call(date) : chr;
        });
    };
})();

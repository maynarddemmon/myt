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
Date.prototype.format = Date.prototype.format || (() => {
    const math = Math,
        mathAbs = math.abs,
        mathFloor = math.floor,
        mathCeil = math.ceil,
        
        shortMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        longMonths = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
        shortDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        longDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        
        zeroPad = value => (value < 10 ? '0' : '') + value,
        timezoneOffsetFunc = (date, useColon) => {
            const offset = date.getTimezoneOffset();
            return (offset > 0 ? '-' : '+') + zeroPad(mathFloor(mathAbs(offset / 60))) + (useColon ? ':' : '') + (mathAbs(offset % 60) == 0 ? '00' : zeroPad(mathAbs(offset % 60)));
        },
        
        replaceChars = {
            // Day
            d: date => zeroPad(date.getDate()),
            D: date => shortDays[date.getDay()],
            j: date => date.getDate(),
            l: date => longDays[date.getDay()],
            N: date => (date.getDay() == 0 ? 7 : date.getDay()),
            S: date => {
                const dayOfMonth = date.getDate();
                return (dayOfMonth % 10 == 1 && dayOfMonth != 11 ? 'st' : (dayOfMonth % 10 == 2 && dayOfMonth != 12 ? 'nd' : (dayOfMonth % 10 == 3 && dayOfMonth != 13 ? 'rd' : 'th')));
            },
            w: date => date.getDay(),
            z: date => {
                const d = new Date(date.getFullYear(), 0, 1);
                return mathCeil((date - d) / 86400000);
            },
            // Week
            W: date => {
                const target = new Date(date.valueOf()), dayNr = (date.getDay() + 6) % 7;
                target.setDate(target.getDate() - dayNr + 3);
                const firstThursday = target.valueOf();
                target.setMonth(0, 1);
                if (target.getDay() !== 4) target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
                return zeroPad(1 + mathCeil((firstThursday - target) / 604800000));
            },
            // Month
            F: date => longMonths[date.getMonth()],
            m: date => zeroPad(date.getMonth() + 1),
            M: date => shortMonths[date.getMonth()],
            n: date => date.getMonth() + 1,
            t: date => {
                let year = date.getFullYear(),
                    nextMonth = date.getMonth() + 1;
                if (nextMonth === 12) {
                    year = year++;
                    nextMonth = 0;
                }
                return new Date(year, nextMonth, 0).getDate();
            },
            // Year
            L: date => {
                const year = date.getFullYear();
                return (year % 400 == 0 || (year % 100 != 0 && year % 4 == 0));
            },
            o: date => {
                const d = new Date(date.valueOf());
                d.setDate(d.getDate() - ((date.getDay() + 6) % 7) + 3);
                return d.getFullYear();
            },
            Y: date => date.getFullYear(),
            y: date => ('' + date.getFullYear()).substr(2),
            // Time
            a: date => date.getHours() < 12 ? 'am' : 'pm',
            A: date => date.getHours() < 12 ? 'AM' : 'PM',
            B: date => mathFloor((((date.getUTCHours() + 1) % 24) + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600) * 1000 / 24),
            g: date => date.getHours() % 12 || 12,
            G: date => date.getHours(),
            h: date => zeroPad(date.getHours() % 12 || 12),
            H: date => zeroPad(date.getHours()),
            i: date => zeroPad(date.getMinutes()),
            s: date => zeroPad(date.getSeconds()),
            // Timezone
            e: date => /\((.*)\)/.exec(new Date().toString())[1],
            I: date => {
                let DST = null, i = 0;
                for (; i < 12;) {
                    const d = new Date(date.getFullYear(), i++, 1),
                        offset = d.getTimezoneOffset();
                    if (DST === null) {
                        DST = offset;
                    } else if (offset < DST) {
                        DST = offset; break;
                    } else if (offset > DST) {
                        break;
                    }
                }
                return (date.getTimezoneOffset() == DST) | 0;
            },
            O: date => timezoneOffsetFunc(date, false),
            P: date => timezoneOffsetFunc(date, true),
            T: date => Intl.DateTimeFormat().resolvedOptions().timeZone,
            Z: date => -date.getTimezoneOffset() * 60,
            // Full Date/Time
            c: date => date.format('Y-m-d\\TH:i:sP'),
            r: date => date.toString(),
            U: date => date.getTime() / 1000
        };
    
    return function(format) {
        return format.replace(/(\\?)(.)/g, (_, esc, chr) => (esc === '' && replaceChars[chr]) ? replaceChars[chr](this) : chr);
    };
})();

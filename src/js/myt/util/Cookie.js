(pkg => {
    const objectAssign = Object.assign,
        
        /*  Function to convert a stored cookie value into a value that can
            be returned. */
        converted = (s, useJson) => {
            // This is a quoted cookie as according to RFC2068, unescape
            if (s.indexOf('"') === 0) s = s.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, '\\');
            
            try {return useJson ? JSON.parse(s) : s;} catch(ex) {}
        },
        
        /** Browser cookie utility functions.
            
            Ported from:
                jQuery Cookie Plugin v1.3.1
                https://github.com/carhartl/jquery-cookie
                Copyright 2013 Klaus Hartl
                Released under the MIT license
            
            @class */
        Cookie = pkg.Cookie = {
            // Attributes //////////////////////////////////////////////////////
            /* Default cookie properties and settings. */
            defaults: {
                raw:false, // If true, don't use encodeURIComponent/decodeURIComponent
                json:false // If true, do JSON stringify and parse
            },
            
            
            // Methods /////////////////////////////////////////////////////////
            /** Reads a cookie.
                @param {string} key - The name of the cookie to read.
                @param {?Object} options - Options that determine how the 
                    cookie is read and/or parsed. Supported options are:
                        raw:boolean If true the cookie key and value will be 
                            used as is. Otherwise decodeURIComponent will 
                            be used.
                        json:boolean If true JSON.parse will be used to 
                            parse the cookie value before it is returned.
                @returns {*} - The cookie value string or a parsed 
                    cookie value. */
            read: (key, options) => {
                options = objectAssign({}, Cookie.defaults, options);
                
                const decodeFunc = options.raw ? str => str : str => decodeURIComponent(str.split('+').join(' ')),
                    useJson = options.json,
                    cookies = document.cookie.split('; '),
                    len = cookies.length,
                    retval = key ? undefined : {};
                for (let i = 0; i < len;) {
                    const parts = cookies[i++].split('='),
                        name = decodeFunc(parts.shift()),
                        cookie = decodeFunc(parts.join('='));
                    if (key) {
                        if (key === name) return converted(cookie, useJson);
                    } else {
                        retval[name] = converted(cookie, useJson);
                    }
                }
                return retval;
            },
            
            /** Stores a cookie.
                @param {string} key - the name of the cookie to store.
                @param {*} value - The value to store.
                @param {?Object} options - The options that determine how the 
                    cookie is written and stored. Supported options are:
                        expires:number the number of days until the 
                            cookie expires.
                        path:string the path scope for the cookie.
                        domain:string the domain scope for the cookie.
                        secure:boolean the cookie must be secure.
                        raw:boolean If true the cookie key and value will be 
                            used as is. Otherwise encodeURIComponent will 
                            be used.
                        json:boolean If true JSON.stringify will be used to 
                            encode the cookie value.
                @returns {undefined} */
            write: (key, value, options) => {
                options = objectAssign({}, Cookie.defaults, options);
                
                if (typeof options.expires === 'number') {
                    const days = options.expires,
                        t = options.expires = new Date();
                    t.setDate(t.getDate() + days);
                }
                
                value = options.json ? JSON.stringify(value) : String(value);
                
                return (document.cookie = [
                    options.raw ? key : encodeURIComponent(key),
                    '=',
                    options.raw ? value : encodeURIComponent(value),
                    options.expires ? '; expires=' + options.expires.toUTCString() : '', // use expires attribute, max-age is not supported by IE
                    options.path    ? '; path=' + options.path : '',
                    options.domain  ? '; domain=' + options.domain : '',
                    options.secure  ? '; secure' : ''
                ].join(''));
            },
            
            /** Removes a stored cookie by setting its expires option 
                to -1 days.
                @param {string} key - the name of the cookie to remove.
                @param {?Object} options - Options used to read/write the 
                    cookie.
                @returns {boolean} - true if a cookie was removed, 
                    false otherwise. */
            remove: (key, options) => {
                if (Cookie.read(key, options) !== undefined) {
                    // Must not alter options, thus extending a fresh object.
                    Cookie.write(key, '', objectAssign({}, options, {expires: -1}));
                    return true;
                }
                return false;
            }
        };
})(myt);

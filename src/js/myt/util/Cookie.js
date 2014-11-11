/** Browser cookie utility functions.
    
    Ported from:
        jQuery Cookie Plugin v1.3.1
        https://github.com/carhartl/jquery-cookie
        Copyright 2013 Klaus Hartl
        Released under the MIT license
*/
myt.Cookie = {
    // Attributes //////////////////////////////////////////////////////////////
    _pluses: /\+/g,
    
    /** Default cookie properties and settings. */
    defaults: {
        raw:false, // If true, don't use encodeURIComponent/decodeURIComponent
        json:false // If true, do JSON stringify and parse
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** Function to return a raw cookie name/value. */
    _raw: function(s) {
        return s;
    },
    
    /** Function to return a URI decoded cookie name/value. */
    _decoded: function(s) {
        return decodeURIComponent(s.replace(this._pluses, ' '));
    },
    
    /** Function to convert a stored cookie value into a value that can
        be returned. */
    _converted: function(s, useJson) {
        if (s.indexOf('"') === 0) {
            // This is a quoted cookie as according to RFC2068, unescape
            s = s.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, '\\');
        }
        
        try {
            return useJson ? JSON.parse(s) : s;
        } catch(er) {}
    },
    
    /** Reads a cookie.
        @param key:string the name of the cookie to read.
        @param options:object options that determine how the cookie is read
            and/or parsed. Supported options are:
                raw:boolean If true the cookie key and value will be used as is.
                    Otherwise decodeURIComponent will be used.
                json:boolean If true JSON.parse will be used to parse the
                    cookie value before it is returned.
        @returns The cookie value string or a parsed cookie value. */
    read: function(key, options) {
        options = myt.extend({}, this.defaults, options);
        
        var decodeFunc = options.raw ? this._raw : this._decoded,
            useJson = options.json,
            cookies = document.cookie.split('; '),
            result = key ? undefined : {},
            parts, name, cookie, i, len = cookies.length;
        for (i = 0; i < len; i++) {
            parts = cookies[i].split('=');
            name = decodeFunc(parts.shift());
            cookie = decodeFunc(parts.join('='));
            
            if (key && key === name) {
                result = this._converted(cookie, useJson);
                break;
            }
            
            if (!key) {
                result[name] = this._converted(cookie, useJson);
            }
        }
        
        return result;
    },
    
    /** Stores a cookie.
        @param key:string the name of the cookie to store.
        @param value:* the value to store.
        @param options:object options that determine how the cookie is
            written and stored. Supported options are:
                expires:number the number of days until the cookie expires.
                path:string the path scope for the cookie.
                domain:string the domain scope for the cookie.
                secure:boolean the cookie must be secure.
                raw:boolean If true the cookie key and value will be used as is.
                    Otherwise encodeURIComponent will be used.
                json:boolean If true JSON.stringify will be used to encode
                    the cookie value.
        @returns void */
    write: function(key, value, options) {
        options = myt.extend({}, this.defaults, options);
        
        if (typeof options.expires === 'number') {
            var days = options.expires;
            var t = options.expires = new Date();
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
    
    /** Removes a stored cookie by setting it's expires option to -1 days.
        @param key:string the name of the cookie to remove.
        @param options:object options used to read/write the cookie.
        @returns true if a cookie was removed, false otherwise. */
    remove: function(key, options) {
        if (this.read(key, options) !== undefined) {
            // Must not alter options, thus extending a fresh object.
            this.write(key, '', myt.extend({}, options, {expires: -1}));
            return true;
        }
        return false;
    }
};

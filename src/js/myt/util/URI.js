/** Models a URI and provides parsing of strings into URIs.
    
    Makes use of:
        parseUri 1.2.2
        (c) Steven Levithan <stevenlevithan.com>
        MIT License
        See: http://blog.stevenlevithan.com/archives/parseuri
        
    When more complex URI parsing is needed, perhaps try URI.js which can be
    found at: http://medialize.github.io/URI.js/
*/
myt.URI = new JS.Class('URI', {
    // Constructor /////////////////////////////////////////////////////////////
    initialize: function(str, loose) {
        if (str) this.parse(str, loose);
    },
    
    
    // Attributes and Setters/Getters //////////////////////////////////////////
    setSource: function(v) {this.source = v;},
    setProtocol: function(v) {this.protocol = v;},
    setAuthority: function(v) {this.authority = v;},
    setUserInfo: function(v) {this.userInfo = v;},
    setUser: function(v) {this.user = v;},
    setPassword: function(v) {this.password = v;},
    setHost: function(v) {this.host = v;},
    setPort: function(v) {this.port = v;},
    setRelative: function(v) {this.relative = v;},
    setPath: function(v) {this.path = v;},
    setDirectory: function(v) {this.directory = v;},
    setFile: function(v) {this.file = v;},
    setQuery: function(v) {this.query = v;},
    setAnchor: function(v) {this.anchor = v;},
    
    
    // Methods /////////////////////////////////////////////////////////////////
    parse: function(str, loose) {
        // match order: "source", "protocol", "authority", "userInfo", "user",
        //              "password", "host", "port", "relative", "path", 
        //              "directory", "file", "query", "anchor".
        var m = myt.URI[loose ? "_looseParser" : "_strictParser"].exec(str);
        
        this.setSource(m[0] || "");
        
        this.setProtocol(m[1] || "");
        this.setAuthority(m[2] || "");
        this.setUserInfo(m[3] || "");
        this.setUser(m[4] || "");
        this.setPassword(m[5] || "");
        this.setHost(m[6] || "");
        this.setPort(m[7] || "");
        this.setRelative(m[8] || "");
        this.setPath(m[9] || "");
        this.setDirectory(m[10] || "");
        this.setFile(m[11] || "");
        this.setQuery(m[12] || "");
        this.setAnchor(m[13] || "");
        
        this.queryPairs = {};
        
        var self = this;
        this.query.replace(myt.URI._queryParser, function ($0, $1, $2) {
            if ($1) self.queryPairs[$1] = $2;
        });
    },
    
    /** Unescape a query param value. */
    decodeQueryParam: function(v) {
        v = decodeURIComponent(v);
        return v.replace('+', ' ');
    },
    
    getQuery: function() {
        var pairs = this.queryPairs;
        var parts = [];
        for (var key in pairs) {
            parts.push(key + '=' + encodeURIComponent(pairs[key]));
        }
        var s = parts.join('&');
        return s.length > 0 ? '?' + s : s;
    },
    
    getQueryParam: function(name) {
        var v = this.queryPairs[name];
        return v == null ? undefined : this.decodeQueryParam(v);
    },
    
    getPathParts: function(allowEmpties) {
        var parts = this.path.split('/');
        
        if (!allowEmpties) {
            var i = parts.length;
            while (i) if (parts[--i].length === 0) parts.splice(i, 1);
        }
        
        return parts;
    },
    
    toString: function() {
        var protocol = this.protocol;
        var host = this.host;
        var userInfo = this.userInfo;
        var port = this.port;
        var path = this.path;
        var query = this.getQuery();
        var anchor = this.anchor;
        
        var s = '';
        
        if (protocol) s += protocol + '://';
        if (userInfo && host) s += userInfo + '@';
        
        if (host) {
            s += host;
            if (port) s += ':' + port;
        }
        
        if (path) {
            s += path;
        } else if (host && (query || anchor)) {
            s += '/';
        }
        
        if (query) s += query;
        if (anchor) s += '#' + anchor;
        
        return s;
    }
});
myt.URI._queryParser = /(?:^|&)([^&=]*)=?([^&]*)/g;
myt.URI._strictParser = /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/;
myt.URI._looseParser = /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/;

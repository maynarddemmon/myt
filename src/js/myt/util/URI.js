(pkg => {
    const queryParser = /(?:^|&)([^&=]*)=?([^&]*)/g,
        strictParser = /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
        looseParser = /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/;
    
    /** Models a URI and provides parsing of strings into URIs.
        
        Makes use of:
            parseUri 1.2.2
            (c) Steven Levithan <stevenlevithan.com>
            MIT License
            See: http://blog.stevenlevithan.com/archives/parseuri
            
        When more complex URI parsing is needed, perhaps try URI.js which can be
        found at: http://medialize.github.io/URI.js/
        
        @class */
    pkg.URI = new JS.Class('URI', {
        // Constructor /////////////////////////////////////////////////////////
        initialize: function(str, loose) {
            if (str) this.parse(str, loose);
        },
        
        
        // Attributes and Setters/Getters //////////////////////////////////////
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
        
        
        // Methods /////////////////////////////////////////////////////////////
        parse: function(str, loose) {
            // match order: "source", "protocol", "authority", "userInfo", 
            //              "user", "password", "host", "port", "relative", 
            //              "path", "directory", "file", "query", "anchor".
            const self = this,
                m = (loose ? looseParser : strictParser).exec(str);
            
            self.setSource(m[0] || '');
            
            self.setProtocol(m[1] || '');
            self.setAuthority(m[2] || '');
            self.setUserInfo(m[3] || '');
            self.setUser(m[4] || '');
            self.setPassword(m[5] || '');
            self.setHost(m[6] || '');
            self.setPort(m[7] || '');
            self.setRelative(m[8] || '');
            self.setPath(m[9] || '');
            self.setDirectory(m[10] || '');
            self.setFile(m[11] || '');
            self.setQuery(m[12] || '');
            self.setAnchor(m[13] || '');
            
            // Parse the query into pairs
            self.queryPairs = {};
            self.query.replace(queryParser, ($0, $1, $2) => {
                if ($1) self.queryPairs[$1] = $2;
            });
        },
        
        /** Unescape a query param value.
            @param {string} paramValue
            @returns {string} */
        decodeQueryParam: paramValue => decodeURIComponent(paramValue).split('+').join(' '),
        
        getQuery: function() {
            const pairs = this.queryPairs,
                parts = [];
            for (const key in pairs) parts.push(key + '=' + encodeURIComponent(this.getQueryParam(key)));
            const s = parts.join('&');
            return s.length > 0 ? '?' + s : s;
        },
        
        getQueryParam: function(name) {
            const v = this.queryPairs[name];
            return v == null ? undefined : this.decodeQueryParam(v);
        },
        
        getPathParts: function(allowEmpties) {
            const parts = this.path.split('/');
            
            if (!allowEmpties) {
                let i = parts.length;
                while (i) if (parts[--i].length === 0) parts.splice(i, 1);
            }
            
            return parts;
        },
        
        toString: function(originalRawQuery) {
            const self = this,
                protocol = self.protocol,
                host = self.host,
                userInfo = self.userInfo,
                port = self.port,
                path = self.path,
                query = originalRawQuery ? (self.query ? '?' + self.query : '') : self.getQuery(),
                anchor = self.anchor;
            let s = '';
            
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
})(myt);

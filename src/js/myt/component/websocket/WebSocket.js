/** Provides WebSocket functionality. */
myt.WebSocket = new JS.Class('WebSocket', myt.Node, {
    // Life Cycle //////////////////////////////////////////////////////////////
    initNode: function(parent, attrs) {
        this.status = 'disconnected';
        this.useJSON = true;
        this.callSuper();
    },
    
    destroy: function() {
        this.close(1000, 'destroyed');
        this.callSuper();
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setUseJSON: function(v) {
        if (this.useJSON !== v) {
            this.useJSON = v;
            if (this.inited) this.fireNewEvent('useJSON', v);
        }
    },
    
    setStatus: function(v) {
        if (this.status !== v) {
            this.status = v;
            if (this.inited) this.fireNewEvent('status', v);
        }
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    connect: function(url, protocols) {
        if (!this._ws) {
            // Support myt.URI for the url param.
            if (typeof url === 'object' && typeof url.isA === 'function' && url.isA(myt.URI)) url = url.toString();
            
            try {
                var ws = this._ws = new WebSocket(url, protocols);
                this.url = url;
                this.protocols = protocols;
                ws.onopen = this.onOpen.bind(this);
                ws.onerror = this.onError.bind(this);
                ws.onmessage = this.onMessage.bind(this);
                ws.onclose = this.onClose.bind(this);
            } catch (ex) {
                this.onError(ex);
            }
        }
    },
    
    send: function(msg) {
        var ws = this._ws;
        if (ws && this.status === 'open') {
            if (this.useJSON) {
                try {
                    msg = JSON.stringify(msg);
                } catch (ex) {
                    this.onError(ex);
                }
            }
            ws.send(msg);
            return true;
        }
        return false;
    },
    
    close: function(code, reason) {
        var ws = this._ws;
        if (ws) {
            ws.close(code || 1000, reason || 'close');
            delete this._ws;
        }
    },
    
    onOpen: function(event) {
        this.setStatus('open');
    },
    
    onError: function(event) {
        console.error(event);
        
        var ws = this._ws;
        if (ws && ws.readyState !== 1) this.close();
    },
    
    onMessage: function(event) {
        var msg = event.data;
        
        if (this.useJSON) {
            try {
                msg = JSON.parse(msg);
            } catch (ex) {
                this.onError(ex);
            }
        }
        
        return msg; // Useful for subclassing
    },
    
    onClose: function(event) {
        this.setStatus('closed');
    }
});

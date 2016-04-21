/** Provides WebSocket functionality. */
myt.WebSocket = new JS.Class('WebSocket', myt.Node, {
    // Life Cycle //////////////////////////////////////////////////////////////
    initNode: function(parent, attrs) {
        this.status = 'disconnected';
        this.callSuper();
    },
    
    destroy: function() {
        this.close(1000, 'destroyed');
        this.callSuper();
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
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
                this._onError(ex);
            }
        }
    },
    
    send: function(msg) {
        var ws = this._ws;
        if (ws && this.status === 'open') {
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
        console.log('open', event); // FIXME
    },
    
    onError: function(event) {
        console.log('error', event); // FIXME
    },
    
    onMessage: function(event) {
        console.log('message', event); // FIXME
    },
    
    onClose: function(event) {
        this.setStatus('closed');
        console.log('close', event); // FIXME
    }
});

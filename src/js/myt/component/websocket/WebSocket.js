/** Provides WebSocket functionality. */
myt.WebSocket = new JS.Class('WebSocket', myt.Node, {
    // Life Cycle //////////////////////////////////////////////////////////////
    initNode: function(parent, attrs) {
        this.status = 'closed';
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
            if (this.inited) this.fireEvent('useJSON', v);
        }
    },
    
    setStatus: function(v) {
        if (this.status !== v) {
            this.status = v;
            if (this.inited) this.fireEvent('status', v);
        }
    },
    
    setUrl: function(v) {
        // Support myt.URI for the url param.
        if (typeof v === 'object' && typeof v.isA === 'function' && v.isA(myt.URI)) v = v.toString();
        
        this.url = v;
    },
    
    setProtocols: function(v) {
        this.protocols = v;
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** Connects the WebSocket to the currently configured URL.
        @param {?Function} [afterOpenCallback] - This callback will be
            executed once after the connection is established and the onOpen
            method has been called.
        @returns {undefined} */
    connect: function(afterOpenCallback) {
        if (!this._ws && this.url) {
            try {
                const ws = this._ws = new WebSocket(this.url, this.protocols);
                
                const openFunc = this.onOpen.bind(this);
                if (afterOpenCallback) {
                    // Execute an afterOpenCallback one time
                    ws.onopen = function(event) {
                        openFunc(event);
                        afterOpenCallback(event);
                        
                        // Reassign handler
                        ws.onopen = openFunc;
                    };
                } else {
                    ws.onopen = openFunc;
                }
                
                ws.onerror = this.onError.bind(this);
                ws.onmessage = this.onMessage.bind(this);
                ws.onclose = this.onClose.bind(this);
            } catch (ex) {
                this.onError(ex);
            }
        }
    },
    
    /** Sends a message over the WebSocket.
        @param {*} msg - The message to send.
        @param {boolean} [doNotTryToConnect] - If falsy an attempt will
            be made to connect if the WebSocket is not currently connected
            before sending the message.
        @returns {boolean|undefined} Indicating if the message was sent
            or not. Undefined is returned when the connection has to be opened
            before sending. */
    send: function(msg, doNotTryToConnect) {
        const self = this,
            ws = self._ws;
        if (ws && self.status === 'open') {
            if (self.useJSON) {
                try {
                    msg = JSON.stringify(msg);
                } catch (ex) {
                    self.onError(ex);
                }
            }
            ws.send(msg);
            return true;
        } else if (!doNotTryToConnect) {
            // Try to connect first and then send
            self.connect(function(event) {self.send(msg, true);});
        } else {
            return false;
        }
    },
    
    /** Attempts to close the connection.
        @param code:number (optional) Should be a WebSocket CloseEvent.code 
            value. Defaults to 1000 CLOSE_NORMAL.
        @param reason:string (optional) An explanation of why the close is
            occurring. Defaults to "close".
        @returns {undefined} */
    close: function(code, reason) {
        if (this._ws) this._ws.close(code || 1000, reason || 'close');
    },
    
    /** Invoked when after the WebSocket is opened.
        @param {!Object} event -  The open event fired by the WebSocket.
        @returns {undefined} */
    onOpen: function(event) {
        this.setStatus('open');
    },
    
    /** Invoked when an error occurs in the WebSocket.
        @param {!Object} event -  The error event fired by the WebSocket.
        @returns {undefined} */
    onError: function(event) {
        console.error(event);
        
        const ws = this._ws;
        if (ws && ws.readyState !== 1) this.close();
    },
    
    /** Invoked when a message is received over the WebSocket.
        @param {!Object} event -  The message event fired by the WebSocket.
        @returns msg:* The message received. */
    onMessage: function(event) {
        let msg = event.data;
        
        if (this.useJSON) {
            try {
                msg = JSON.parse(msg);
            } catch (ex) {
                this.onError(ex);
            }
        }
        
        return msg; // Useful for subclassing
    },
    
    /** Invoked when the WebSocket is closed.
        @param {!Object} event - The close event fired by the WebSocket.
        @returns {undefined} */
    onClose: function(event) {
        if (this._ws) delete this._ws;
        this.setStatus('closed');
    }
});

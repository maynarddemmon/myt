(pkg => {
    const JSClass = JS.Class,
        CLOSE_NORMAL = 1000,
        
        /** Provides WebSocket functionality.
            
            @class */
        WebSocketClass = pkg.WebSocket = new JSClass('WebSocket', pkg.Node, {
            // Life Cycle //////////////////////////////////////////////////////
            initNode: function(parent, attrs) {
                this.status = 'closed';
                this.useJSON = true;
                this.callSuper();
            },
            
            destroy: function() {
                this.close(CLOSE_NORMAL, 'destroyed');
                this.callSuper();
            },
            
            
            // Accessors ///////////////////////////////////////////////////////
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
                if (typeof v === 'object' && typeof v.isA === 'function' && v.isA(pkg.URI)) v = v.toString();
                
                this.url = v;
            },
            
            setProtocols: function(v) {
                this.protocols = v;
            },
            
            
            // Methods /////////////////////////////////////////////////////////
            /** Connects the WebSocket to the currently configured URL.
                @param {?Function} [afterOpenCallback] - This callback will be
                    executed once after the connection is established and the 
                    onOpen method has been called.
                @returns {undefined} */
            connect: function(afterOpenCallback) {
                if (!this._ws && this.url) {
                    try {
                        const ws = this._ws = new WebSocket(this.url, this.protocols);
                        
                        const openFunc = this.onOpen.bind(this);
                        if (afterOpenCallback) {
                            // Execute an afterOpenCallback one time
                            ws.onopen = event => {
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
                    be made to connect if the WebSocket is not currently 
                    connected before sending the message.
                @returns {boolean|undefined} Indicating if the message was sent
                    or not. Undefined is returned when the connection has to 
                    be opened before sending. */
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
                    self.connect(event => {self.send(msg, true);});
                } else {
                    return false;
                }
            },
            
            /** Attempts to close the connection.
                @param code:number (optional) Should be a WebSocket 
                    CloseEvent.code value. Defaults to 1000 CLOSE_NORMAL.
                @param reason:string (optional) An explanation of why the 
                    close is occurring. Defaults to "close".
                @returns {undefined} */
            close: function(code, reason) {
                if (this._ws) this._ws.close(code || CLOSE_NORMAL, reason || 'close');
            },
            
            /** Invoked when after the WebSocket is opened.
                @param {!Object} event -  The open event fired by the WebSocket.
                @returns {undefined} */
            onOpen: function(event) {
                this.setStatus('open');
            },
            
            /** Invoked when an error occurs in the WebSocket.
                @param {!Object} event -  The error event fired by the 
                    WebSocket.
                @returns {undefined} */
            onError: function(event) {
                console.error(event);
                
                if (this._ws && this._ws.readyState !== WebSocket.OPEN) this.close();
            },
            
            /** Invoked when a message is received over the WebSocket.
                @param {!Object} event -  The message event fired by the 
                    WebSocket.
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
        }),
        
        matcherFunctionsByKey = {},
        
        /*  @param {string|?Function} matcher
            @return {?Function} */
        makeMatcherFunction = matcher => {
            let matcherFunc;
            if (typeof matcher === 'string') {
                // Use the provided string as an exact match function. We must
                // generate a unique function for each string key (and reuse it)
                // so that the === tests will work in the registerListener and
                // unregisterListener functions.
                matcherFunc = matcherFunctionsByKey[matcher] || (matcherFunctionsByKey[matcher] = type => type === matcher);
            } else if (typeof matcher === 'function') {
                matcherFunc = matcher;
            } else if (matcher == null) {
                // Use a unique match anything function
                matcherFunc = type => true;
            } else {
                // Invalid matcherFunc
            }
            return matcherFunc;
        };
    
    /** A WebSocket where messages are JSON objects with the following
        structure:
            type:string The type of the message. This will allow registered 
                listeners to be notified when a message they are interested 
                in arrives.
            msg:json The message payload.
            date:number The time in milliseconds when the message was sent.
        
        @class */
    pkg.MessageTypeWebSocket = new JSClass('MessageTypeWebSocket', WebSocketClass, {
        // Life Cycle //////////////////////////////////////////////////////////
        /** @overrides */
        initNode: function(parent, attrs) {
            this._listeners = [];
            
            if (attrs.protocols == null) attrs.protocols = 'typedMessage';
            
            this.callSuper();
        },
        
        
        // Methods /////////////////////////////////////////////////////////////
        /** Registers a listener function that will get called for messages with
            a type that is matched by the provided matcher.
            @param {?Function} listenerFunc The function that will get invoked. 
                The message is provided as the sole argument to the function.
            @param {string|?Function} matcher (optional) A matcher function 
                that takes the type as the sole argument and must return true 
                or false indicating if the type is matched or not. If a string 
                is provided it will be converted into an exact match function. 
                If not provided (or something falsy) is provided a promiscuous 
                matcher function will be used.
            @returns {undefined} */
        registerListener: function(listenerFunc, matcher) {
            if (listenerFunc) {
                const matcherFunc = makeMatcherFunction(matcher);
                if (matcherFunc) {
                    // Register for existing listenr
                    const listeners = this._listeners;
                    let i = listeners.length;
                    while (i) {
                        const listenerInfo = listeners[--i];
                        if (listenerInfo.func === listenerFunc) {
                            const patternMatchers = listenerInfo.patternMatchers; 
                            let j = patternMatchers.length;
                            while (j) {
                                // Abort since the patternMatcher is 
                                // already registered
                                if (patternMatchers[--j] === matcherFunc) return;
                            }
                            patternMatchers.push(matcherFunc);
                            
                            // Prevent fall through to "add" below since we 
                            // found a listener.
                            return;
                        }
                    }
                    
                    // Add a new listenerFunc
                    listeners.push({
                        func:listenerFunc,
                        patternMatchers:[matcherFunc]
                    });
                }
            }
        },
        
        /** Removed the provided listener function and matcher.
            @param {!Function} listenerFunc
            @param {string|?Function} matcher
            @returns {undefined} */
        unregisterListener: function(listenerFunc, matcher) {
            if (listenerFunc) {
                const matcherFunc = makeMatcherFunction(matcher);
                if (matcherFunc) {
                    const listeners = this._listeners;
                    let i = listeners.length;
                    while (i) {
                        const listenerInfo = listeners[--i];
                        if (listenerInfo.func === listenerFunc) {
                            // Try to remove the matcherFunc
                            const patternMatchers = listenerInfo.patternMatchers;
                            let j = patternMatchers.length;
                            while (j) {
                                if (patternMatchers[--j] === matcherFunc) {
                                    patternMatchers.splice(j, 1);
                                    break;
                                }
                            }
                            
                            // Remove entire entry if there are no more matchers
                            if (patternMatchers.length === 0) listeners.splice(i, 1);
                            break;
                        }
                    }
                }
            }
        },
        
        /** Sends a message with a type. Use this method instead of send.
            @param {string} type The type of the message to send.
            @param {*} msg The message value. Must be convertible to JSON.
            @param {boolean} doNotTryToConnect
            @returns {undefined} The sent message. */
        sendTypedMessage: function(type, msg, doNotTryToConnect) {
            msg = this.createMessage(type, msg);
            if (msg) return this.send(msg, doNotTryToConnect);
        },
        
        /** Creates a new message to be sent. May be overridden by subclasses, 
            but should not be used externally.
            @param type:string The type of the message to send.
            @param msg:* The message value. Must be convertible to JSON.
            @returns string The message to be sent or undefined if an
                exception occurs during JSON.stringify. */
        createMessage: (type, msg) => {
            let jsonMsg;
            try {
                jsonMsg = JSON.stringify(msg);
            } catch (ex) {
                console.error(ex);
                return;
            }
            
            return {
                type:type || '',
                msg:jsonMsg,
                date:Date.now()
            };
        },
        
        /** @overrides */
        onMessage: function(event) {
            const msg = this.callSuper(event);
            
            // Parse msg.msg JSON
            try {
                msg.msg = JSON.parse(msg.msg);
            } catch (ex) {
                this.onError(msg);
                return;
            }
            
            // Notify Listeners
            const type = msg.type;
            this._listeners.forEach(listenerInfo => {
                listenerInfo.patternMatchers.every(patternMatcher => {
                    if (patternMatcher(type)) {
                        listenerInfo.func(msg);
                        return false;
                    }
                    return true;
                });
            });
            
            return msg;
        }
    });
})(myt);

/** A WebSocket where messages are JSON objects with the following structure:
    type:string The type of the message. This will allow registered listeners
        to be notified when a message they are interested in arrives.
    msg:json The message payload.
    date:number The time in milliseconds when the message was sent.
*/
myt.MessageTypeWebSocket = new JS.Class('MessageTypeWebSocket', myt.WebSocket, {
    // Class Methods and Attributes ////////////////////////////////////////////
    extend: {
        MATCH_ANYTHING:function(type) {return true;},
        matcherFunctionsByKey:{}
    },
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides */
    initNode: function(parent, attrs) {
        this._listeners = [];
        
        if (attrs.protocols == null) attrs.protocols = 'typedMessage';
        
        this.callSuper();
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** Registers a listener function that will get called for messages with
        a type that is matched by the provided matcher.
        @param {?Function} listenerFunc The function that will get invoked. The
            message is provided as the sole argument to the function.
        @param {string|?Function} matcher (optional) A matcher function that takes
            the type as the sole argument and must return true or false
            indicating if the type is matched or not. If a string is provided
            it will be converted into an exact match function. If not provided
            (or something falsy) is provided a promiscuous matcher function
            will be used.
        @returns {undefined} */
    registerListener: function(listenerFunc, matcher) {
        if (listenerFunc) {
            const matcherFunc = this._makeMatcherFunction(matcher);
            if (matcherFunc) {
                // Register for existing listenr
                const listeners = this._listeners;
                let i = listeners.length, 
                    listenerInfo;
                while (i) {
                    listenerInfo = listeners[--i];
                    if (listenerInfo.func === listenerFunc) {
                        const patternMatchers = listenerInfo.patternMatchers; 
                        let j = patternMatchers.length;
                        while (j) {
                            // Abort since patternMatcher is already registered
                            if (patternMatchers[--j] === matcherFunc) return;
                        }
                        patternMatchers.push(matcherFunc);
                        
                        // Prevent fall through to "add" below since we found
                        // a listener.
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
            const matcherFunc = this._makeMatcherFunction(matcher);
            if (matcherFunc) {
                const listeners = this._listeners;
                let i = listeners.length, 
                    listenerInfo;
                while (i) {
                    listenerInfo = listeners[--i];
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
    
    /** @private
        @param {string|?Function} matcher
        @return {?Function} */
    _makeMatcherFunction: function(matcher) {
        let matcherFunc,
            funcsByKey;
        if (typeof matcher === 'string') {
            // Use the provided string as an exact match function. We must
            // generate a unique function for each string key (and reuse it)
            // so that the === tests will work in the registerListener and
            // unregisterListener functions.
            funcsByKey = myt.MessageTypeWebSocket.matcherFunctionsByKey;
            matcherFunc = funcsByKey[matcher] || (funcsByKey[matcher] = (type) => type === matcher);
        } else if (typeof matcher === 'function') {
            matcherFunc = matcher;
        } else if (matcher == null) {
            // Use a unique match anything function
            matcherFunc = myt.MessageTypeWebSocket.MATCH_ANYTHING;
        } else {
            // Invalid matcherFunc
        }
        return matcherFunc;
    },
    
    /** @private
        @param {string} type
        @returns {!Array} */
    _getListenersForType: function(type) {
        const retval = [],
            listeners = this._listeners;
        let i = listeners.length,
            listenerInfo, 
            patternMatchers, 
            j;
        while (i) {
            listenerInfo = listeners[--i];
            patternMatchers = listenerInfo.patternMatchers;
            j = patternMatchers.length;
            while (j) if (patternMatchers[--j](type)) retval.push(listenerInfo.func);
        }
        return retval;
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
    
    /** Creates a new message to be sent. May be overridden by subclasses, but
        should not be used externally.
        @param type:string The type of the message to send.
        @param msg:* The message value. Must be convertible to JSON.
        @returns string The message to be sent or undefined if an
            exception occurs during JSON.stringify. */
    createMessage: function(type, msg) {
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
        const listeners = this._getListenersForType(msg.type);
        let i = listeners.length;
        while (i) listeners[--i](msg);
        
        return msg;
    }
});

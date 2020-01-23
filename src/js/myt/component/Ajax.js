((pkg) => {
    var 
        /** A specialized setter function used by the setters. */
        optsSetter = (ajax, key, value) => {
            var opts = ajax._opts || (ajax._opts = {});
            if (value) {
                opts[key] = value;
            } else {
                delete opts[key];
            }
        };
    
    /** Provides AJAX functionality. This is a wrapper around JQuery's ajax
        request.
        
        Private Attributes:
            _opts:object Lazily instantiated options object.
    */
    pkg.Ajax = new JS.Class('Ajax', pkg.Node, {
        // Accessors ///////////////////////////////////////////////////////////
        setUrl: function(v) {
            optsSetter(this, 'url', v);
        },
        
        /** The request type.
            Supported values: 'GET' or 'POST'. */
        setRequestMethod: function(v) {
            optsSetter(this, 'type', v);
        },
        
        /** A map of name value pairs for the request. */
        setRequestData: function(v) {
            optsSetter(this, 'data', v);
        },
        
        /** The response type.
            Supported values: 'xml', 'html', 'json', 'jsonp', 'script', or 'text'. */
        setResponseType: function(v) {
            optsSetter(this, 'datatype', v);
        },
        
        
        // Methods /////////////////////////////////////////////////////////////
        doRequest: function(opts, successCallback, failureCallback) {
            return $.ajax(
                    // Convert from myt.Ajax opts to JQuery.ajax opts.
                    pkg.extend(
                        {
                            context:this,
                            
                            // Store url and anything stored under the "callbackData" and
                            // "requestData" key on the jqxhr so we can read it in response 
                            // handling code.
                            beforeSend: (jqxhr, settings) => {
                                jqxhr.callbackData = opts.callbackData;
                                jqxhr.requestData = opts.requestData;
                                jqxhr.requestURL = settings.url;
                            }
                        },
                        this._opts,
                        opts,
                        (key, target, source) => {
                            var targetKey = key;
                            switch (key) {
                                case 'requestData': targetKey = 'data'; break;
                                case 'requestMethod': targetKey = 'type'; break;
                                case 'responseType': targetKey = 'datatype'; break;
                            }
                            target[targetKey] = source[key];
                        }
                    )
                ).done(
                    successCallback || this.handleSuccess
                ).fail(
                    failureCallback || this.handleFailure
                );
        },
        
        /** Handles request successes.
            @param data: The response data
            @param status: String the response status
            @param jqxhr: The request object */
        handleSuccess: function(data, status, jqxhr) {
            this.fireEvent('success', {data:data, status:status, xhr:jqxhr});
        },
        
        /** Handles request failures.
            @param jqxhr: The request object
            @param status: String the response status
            @param exception: XMLHttpRequestException */
        handleFailure: function(jqxhr, status, exception) {
            this.fireEvent('failure', {exception:exception, status:status, xhr:jqxhr});
        }
    });
})(myt);

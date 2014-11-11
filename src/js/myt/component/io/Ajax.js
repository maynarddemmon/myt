/** Provides AJAX functionality. This is a wrapper around JQuery's ajax
    request. */
myt.Ajax = new JS.Class('Ajax', myt.Node, {
    // Class Methods ///////////////////////////////////////////////////////////
    extend: {
        doRequest: function(opts, successCallback, failureCallback) {
            return $.ajax(opts).done(successCallback).fail(failureCallback);
        }
    },
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    initNode: function(parent, attrs) {
        this.opts = {};
        
        this.callSuper();
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setUrl: function(v) {
        this.__s('url', v);
    },
    
    /** The request type.
        Supported values: 'GET' or 'POST'. */
    setRequestMethod: function(v) {
        this.__s('type', v);
    },
    
    /** A map of name value pairs for the request. */
    setRequestData: function(v) {
        this.__s('data', v);
    },
    
    /** The response type.
        Supported values: 'xml', 'html', 'json', 'jsonp', 'script', or 'text'. */
    setResponseType: function(v) {
        this.__s('datatype', v);
    },
    
    /** A specialized setter function used by the setters.
        @private */
    __s: function(key, value) {
        if (value) {
            this.opts[key] = value;
        } else {
            delete this.opts[key];
        }
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    doRequest: function(opts, successCallback, failureCallback) {
        var mappedOpts = {
            context:this,
            
            // Store url and anything stored under the "callbackData" and
            // "requestData" key on the jqxhr so we can read it in response 
            // handling code.
            beforeSend: function(jqxhr, settings) {
                jqxhr.callbackData = opts.callbackData;
                jqxhr.requestData = opts.requestData;
                
                jqxhr.requestURL = settings.url;
            }
        };
        
        // Convert from myt.Ajax opts to JQuery.ajax opts.
        $.each(opts, function(key, value) {
            switch (key) {
                case 'requestData': key = 'data'; break;
                case 'requestMethod': key = 'type'; break;
                case 'responseType': key = 'datatype'; break;
            }
            mappedOpts[key] = value;
        });
        
        return myt.Ajax.doRequest(
            myt.extend({}, this.opts, mappedOpts), 
            successCallback || this.handleSuccess, 
            failureCallback || this.handleFailure
        );
    },
    
    /** Handles request successes.
        @param data: The response data
        @param status: String the response status
        @param jqxhr: The request object */
    handleSuccess: function(data, status, jqxhr) {
        this.fireNewEvent('success', {data:data, status:status, xhr:jqxhr});
    },
    
    /** Handles request failures.
        @param jqxhr: The request object
        @param status: String the response status
        @param exception: XMLHttpRequestException */
    handleFailure: function(jqxhr, status, exception) {
        this.fireNewEvent('failure', {exception:exception, status:status, xhr:jqxhr});
    }
});

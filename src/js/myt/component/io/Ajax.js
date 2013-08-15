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
        if (!v) {
            delete this.opts.url;
        } else {
            this.opts.url = v;
        }
    },
    
    /** The request type.
        Supported values: 'GET' or 'POST'. */
    setRequestMethod: function(v) {
        if (!v) {
            delete this.opts.type;
        } else {
            this.opts.type = v;
        }
    },
    
    /** A map of name value pairs for the request. */
    setRequestData: function(v) {
        if (v === undefined || v === null) {
            delete this.opts.data;
        } else {
            this.opts.data = v;
        }
    },
    
    /** The response type.
        Supported values: 'xml', 'html', 'json', 'jsonp', 'script', or 'text'. */
    setResponseType: function(v) {
        if (!v) {
            delete this.opts.datatype;
        } else {
            this.opts.dataType = v;
        }
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    doRequest: function(opts, successCallback, failureCallback) {
        if (successCallback === undefined) successCallback = this.handleSuccess;
        if (failureCallback === undefined) failureCallback = this.handleFailure;
        
        // Convert from myt.Ajax opts to JQuery.ajax opts.
        var mappedOpts = {context:this};
        $.each(opts, function(key, value) {
            switch (key) {
                case 'requestData': key = 'data'; break;
                case 'requestMethod': key = 'type'; break;
                case 'responseType': key = 'datatype'; break;
            }
            mappedOpts[key] = value;
        });
        
        // Store url on jqxhr so we can read it in response handling code.
        this.opts.beforeSend = function(jqxhr, settings) {jqxhr.requestURL = settings.url;};
        
        return myt.Ajax.doRequest(
            $.extend([true], {}, this.opts, mappedOpts), successCallback, failureCallback
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

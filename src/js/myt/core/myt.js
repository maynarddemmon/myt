/**
 * Myt: A simple javascript UI framework
 * http://github.com/maynarddemmon/myt
 * Copyright (c) 2012-2013 Maynard Demmon and contributors
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * Parts of the Software incorporates code and/or design patterns from various
 * public domain sources and has been noted as such in the source.
 * 
 * Parts of the Software incorporates code from the following open-source 
 * projects:
 * * JS.Class, (c) 2007-2012 James Coglan and contributors (MIT License)
 * * Easing Functions, (c) 2001 Robert Penner (BSD License)
 * * jQuery Easing v1.3, (c) 2008 George McGinley Smith (BSD License)
 * * jQuery Cookie Plugin v1.3.1, (c) 2013 Klaus Hartl (MIT License)
 * * parseUri 1.2.2, (c) Steven Levithan <stevenlevithan.com> (MIT License)
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
myt = {
    /** The root path to image assets for the myt package. MYT_IMAGE_ROOT
        should be set by the page that includes this script. */
    IMAGE_ROOT:global.MYT_IMAGE_ROOT || '',
    
    /** Used to generate globally unique IDs. */
    __GUID_COUNTER: 0,
    
    /** Generates a globally unique id, (GUID).
        @return number */
    generateGuid: function() {
        return ++this.__GUID_COUNTER;
    },
    
    /** Event listener code Adapted from:
            http://javascript.about.com/library/bllisten.htm
        A more robust solution can be found here:
            http://msdn.microsoft.com/en-us/magazine/ff728624.aspx */
    addEventListener: function() {
        if (window.addEventListener) {
            /** Adds an event listener to a dom element. 
                @param elem:DomElement the dom element to listen to.
                @param type:string the name of the event to listen to.
                @param callback:function the callback function that will be
                    registered for the event.
                @param capture:boolean (optional) indicates if the listener is 
                    registered during the capture phase or bubble phase.
                @returns void */
            return function(elem, type, callback, capture) {
                elem.addEventListener(type, callback, capture !== undefined ? capture : false);
            };
        } else {
            return function(elem, type, callback) {
                var prop = type + callback;
                elem['e' + prop] = callback;
                elem[prop] = function(){elem['e' + prop](window.event);}
                elem.attachEvent('on' + type, elem[prop]);
            };
        }
    }(),
    removeEventListener: function() {
        if (window.addEventListener) {
            return function(elem, type, callback, capture) {
                elem.removeEventListener(type, callback, capture !== undefined ? capture : false);
            };
        } else {
            return function(elem, type, callback) {
                var prop = type + callback;
                elem.detachEvent('on' + type, elem[prop]);
                elem[prop] = null;
                elem["e" + prop] = null;
            };
        }
    }(),
    
    /** Takes a '.' separated string such as "foo.bar.baz" and resolves it
        into the value found at that location relative to a starting scope.
        If no scope is provided global scope is used.
        @param objName:string the name to resolve.
        @param scope:Object (optional) the scope to resolve from. If not
            provided global scope is used.
        @returns the referenced object or undefined if resolution failed. */
    resolveName: function(objName, scope) {
        if (!objName || objName.length === 0) return undefined;
        
        var scope = scope || global;
        var parts = objName.split(".");
        for (var i = 0, len = parts.length; i < len; i++) {
            scope = scope[parts[i]];
            if (!scope) {
                console.warn("resolveName failed for ", objName, " at part: ", i, parts[i]);
                return undefined;
            }
        }
        return scope;
    },
    
    // Text Templating
    /** Populates a text "template" with 1 or more arguments. The
        template consists of a string with text interspersed with 
        curly-braced indices. The arguments are replaced in order one at
        a time into the template. For example:
        
            myt.fillTextTemplate("{0}/{2}/{1} hey {0}", 1, 2, 3) 
            will return "1/3/2 hey 1".
        
        @param (first arg):string The template to use.
        @param (remaining args):(coerced to string) The parameters for the
            template.
        @returns A populated string. */
    fillTextTemplate: function() {
        var params = Array.prototype.slice.call(arguments),
            template = params.shift();
        
        if (template == null) return '';
        var i = params.length, param;
        while (i) {
            param = params[--i];
            template = template.split("{" + i + "}").join(param == null ? '' : param);
        }
        return template;
    },
    
    /** Generates the text for an "a href" html element that when clicked on
        executes a provided callback method name. To resolve the callback
        method name, an ancestor search is performed on the dom starting with
        the link element. The first myt managed dom element encountered is
        used as the scope for the method.
        @param text:string the text to put inside the link.
        @param callbackMethodName:string the name of the method to execute.
        @returns void */
    generateLink: function(text, callbackMethodName, attrs) {
        var optAttrs = '';
        if (attrs) {
            for (var name in attrs) optAttrs += ' ' + name + '="' + attrs[name] + '"';
        }
        
        var template = '<a href="#" onclick="myt._handleGeneratedLink(this, \'{1}\'); return false;"' + optAttrs + '>{0}</a>';
        return this.fillTextTemplate(template, text, callbackMethodName);
    },
    
    /** See myt.generateLink for documentation.
        @returns void */
    _handleGeneratedLink: function(elem, callbackMethodName) {
        var model;
        while (elem) {
            model = elem.model;
            if (model) {
                model[callbackMethodName].call(model);
                break;
            }
            elem = elem.parentNode;
        }
    },
    
    /** Dynamically load a script into the dom.
        @param src:string the URL to the script file.
        @param callback:function a callback when the script loads.
        @returns void */
    loadScript: function(src, callback) {
        // Prevent reloading the same script
        if (!this._loadedScripts) this._loadedScripts = {};
        if (this._loadedScripts[src]) {
            console.warn("script already loaded for src", src);
            return;
        }
        this._loadedScripts[src] = true;
        
        var s = document.createElement('script');
        s.type = 'text/javascript';
        s.src = src + '?cacheBust=' + (new Date()).getTime();
        if (callback) {
            var r = false;
            s.onload = s.onreadystatechange = function() {
                if (!r && (!this.readyState || this.readyState == 'complete')) {
                    r = true; // Prevent refiring callback
                    callback();
                }
            };
        }
        var t = document.getElementsByTagName('script')[0];
        t.parentNode.insertBefore(s, t);
    },
    
    /** Used to wrap the first function with the second function. The first
        function is exposed as this.callSuper within the wrapper function.
        @param fn:function the function to wrap.
        @param wrapperFn:function the wrapper function.
        @returns a wrapped funcion. */
    wrapFunction: function(fn, wrapperFn) {
        var callSuper = function() {
            return fn.apply(this, arguments);
        }
        
        return function() {
            // Store existing callSuper function so we can put it back later.
            var oldSuper = this.callSuper;
            
            // Assign new callSuper and execute wrapperFn
            this.callSuper = callSuper;
            var retval = wrapperFn.apply(this, arguments);
            
            // Restore existing callSuper or delete new callSuper
            if (oldSuper !== undefined) {
                this.callSuper = oldSuper;
            } else {
                delete this.callSuper;
            }
            
            return retval;
        };
    },
    
    dumpStack: function(msg) {
        console.log((new Error(msg)).stack);
    }
};

var JS=void 0===this.JS?{}:this.JS;JS.Date=Date,function(e){var t="object"==typeof this.global?this.global:this,n="object"==typeof exports;n?(exports.JS=exports,JS=exports):t.JS=JS,e(t,JS)}(function(global,exports){"use strict";var Package=function(e){Package._index(this),this._loader=e,this._names=new OrderedSet,this._deps=new OrderedSet,this._uses=new OrderedSet,this._styles=new OrderedSet,this._observers={},this._events={}};Package.displayName="Package",Package.toString=function(){return Package.displayName},Package.log=function(e){exports.debug&&"undefined"!=typeof window&&("object"==typeof global.runtime&&runtime.trace(e),global.console&&console.info&&console.info(e))};var resolve=function(e){if(/^https?:/.test(e))return e;var t=exports.ROOT;return t&&(e=(t+"/"+e).replace(/\/+/g,"/")),e},OrderedSet=function(e){if(this._members=this.list=[],this._index={},e)for(var t=0,n=e.length;n>t;t++)this.push(e[t])};OrderedSet.prototype.push=function(e){var t=void 0!==e.id?e.id:e,n=this._index;n.hasOwnProperty(t)||(n[t]=this._members.length,this._members.push(e))};var Deferred=Package.Deferred=function(){this._status="deferred",this._value=null,this._callbacks=[]};Deferred.prototype.callback=function(e,t){"succeeded"===this._status?e.call(t,this._value):this._callbacks.push([e,t])},Deferred.prototype.succeed=function(e){this._status="succeeded",this._value=e;for(var t;t=this._callbacks.shift();)t[0].call(t[1],e)},Package.ENV=exports.ENV=global,Package.onerror=function(e){throw e},Package._throw=function(e){Package.onerror(Error(e))};for(var instance=Package.prototype,methods=[["requires","_deps"],["uses","_uses"]],i=methods.length;i--;)!function(e){var t=e[0],n=e[1];instance[t]=function(){var e,t=arguments.length;for(e=0;t>e;e++)this[n].push(arguments[e]);return this}}(methods[i]);instance.provides=function(){var e,t=arguments.length;for(e=0;t>e;e++)this._names.push(arguments[e]),Package._getFromCache(arguments[e]).pkg=this;return this},instance.styling=function(){for(var e=0,t=arguments.length;t>e;e++)this._styles.push(resolve(arguments[e]))},instance.setup=function(e){return this._onload=e,this},instance._on=function(e,t,n){if(this._events[e])return t.call(n);var r=this._observers[e]=this._observers[e]||[];r.push([t,n]),this._load()},instance._fire=function(e){if(this._events[e])return!1;this._events[e]=!0;var t=this._observers[e];if(!t)return!0;delete this._observers[e];for(var n=0,r=t.length;r>n;n++)t[n][0].call(t[n][1]);return!0},instance._isLoaded=function(e){if(!e&&void 0!==this.__isLoaded)return this.__isLoaded;for(var t,n,r=this._names.list,i=r.length;i--;)if(t=r[i],n=Package._getObject(t,this._exports),void 0===n)return e?Package._throw("Expected package at "+this._loader+" to define "+t):this.__isLoaded=!1;return this.__isLoaded=!0},instance._load=function(){if(this._fire("request")){this._isLoaded()||this._prefetch();var e=this._deps.list.concat(this._uses.list),t=this._source||[],n=(this._loader||{}).length,r=this;Package.when({load:e}),Package.when({complete:this._deps.list},function(){Package.when({complete:e,load:[this]},function(){this._fire("complete")},this);var i=function(e){if(0===n)return a(e);n-=1;var s=r._loader.length-n-1;Package.loader.loadFile(r._loader[s],i,t[s])},a=function(e){r._exports=e,r._onload&&r._onload(),r._isLoaded(!0),r._fire("load")};if(this._isLoaded())return this._fire("download"),this._fire("load");if(void 0===this._loader)return Package._throw("No load path found for "+this._names.list[0]);if("function"==typeof this._loader?this._loader(a):i(),Package.loader.loadStyle){for(var s=this._styles.list,o=s.length;o--;)Package.loader.loadStyle(s[o]);this._fire("download")}},this)}},instance._prefetch=function(){if(!this._source&&this._loader instanceof Array&&Package.loader.fetch){this._source=[];for(var e=0,t=this._loader.length;t>e;e++)this._source[e]=Package.loader.fetch(this._loader[e])}},instance.toString=function(){return"Package:"+this._names.list.join(",")},Package.when=function(e,t,n){var r,i,a,s=[],o={};for(r in e)if(e.hasOwnProperty(r))for(o[r]=[],i=new OrderedSet(e[r]),a=i.list.length;a--;)s.push([r,i.list[a],a]);var l=a=s.length;if(0===l)return t&&t.call(n,o);for(;a--;)!function(e){var r=Package._getByName(e[1]);r._on(e[0],function(){o[e[0]][e[2]]=Package._getObject(e[1],r._exports),l-=1,0===l&&t&&t.call(n,o)})}(s[a])};var globalPackage=(global.JS||{}).Package||{};Package._autoIncrement=globalPackage._autoIncrement||1,Package._indexByPath=globalPackage._indexByPath||{},Package._indexByName=globalPackage._indexByName||{},Package._autoloaders=globalPackage._autoloaders||[],Package._index=function(e){e.id=this._autoIncrement,this._autoIncrement+=1},Package._getByPath=function(e){var t=""+e,n=this._indexByPath[t];return n?n:("string"==typeof e&&(e=[].slice.call(arguments)),n=this._indexByPath[t]=new this(e))},Package._getByName=function(e){if("string"!=typeof e)return e;var t=this._getFromCache(e);if(t.pkg)return t.pkg;var n=this._manufacture(e);if(n)return n;var r=new this;return r.provides(e),r},Package.remove=function(e){var t=this._getByName(e);delete this._indexByName[e],delete this._indexByPath[t._loader]},Package._autoload=function(e,t){this._autoloaders.push([e,t])},Package._manufacture=function(e){var t,n,r,i=this._autoloaders,a=i.length;for(t=0;a>t;t++)if(n=i[t],n[0].test(e)){r=n[1].from+"/"+e.replace(/([a-z])([A-Z])/g,function(e,t,n){return t+"_"+n}).replace(/\./g,"/").toLowerCase()+".js";var s=new this([r]);return s.provides(e),(r=n[1].require)&&s.requires(e.replace(n[0],r)),s}return null},Package._getFromCache=function(e){return this._indexByName[e]=this._indexByName[e]||{}},Package._getObject=function(e,t){if("string"!=typeof e)return void 0;var n=t?{}:this._getFromCache(e);if(void 0!==n.obj)return n.obj;for(var r,i=t||this.ENV,a=e.split(".");r=a.shift();)i=i&&i[r];return t&&void 0===i?this._getObject(e):n.obj=i},Package.CommonJSLoader={usable:function(){return"function"==typeof require&&"object"==typeof exports},__FILE__:function(){return this._currentPath},loadFile:function(e,t){var n,r;"undefined"!=typeof process?(r=e.replace(/\.[^\.]+$/g,""),n=require("path").resolve(r)):"undefined"!=typeof phantom&&(n=phantom.libraryPath.replace(/\/$/,"")+"/"+e.replace(/^\//,"")),this._currentPath=n+".js";var r=require(n);return t(r),r}},Package.BrowserLoader={HOST_REGEX:/^(https?\:)?\/\/[^\/]+/i,usable:function(){return!!Package._getObject("window.document.getElementsByTagName")&&"undefined"==typeof phantom},__FILE__:function(){var e=document.getElementsByTagName("script"),t=e[e.length-1].src,n=window.location.href;return/^\w+\:\/+/.test(t)?t:/^\//.test(t)?window.location.origin+t:n.replace(/[^\/]*$/g,"")+t},cacheBust:function(e){if(exports.cache!==!1)return e;var t=(new JS.Date).getTime();return e+(/\?/.test(e)?"&":"?")+t},fetch:function(e){var t=e;e=this.cacheBust(e),this.HOST=this.HOST||this.HOST_REGEX.exec(window.location.href);var n=this.HOST_REGEX.exec(e);if(!this.HOST||n&&n[0]!==this.HOST[0])return null;Package.log("[FETCH] "+e);var r=new Package.Deferred,i=this,a=window.ActiveXObject?new ActiveXObject("Microsoft.XMLHTTP"):new XMLHttpRequest;return a.open("GET",e,!0),a.onreadystatechange=function(){4===a.readyState&&(a.onreadystatechange=i._K,r.succeed(a.responseText+"\n//@ sourceURL="+t),a=null)},a.send(null),r},loadFile:function(e,t,n){n||(e=this.cacheBust(e));var r=this,i=document.getElementsByTagName("head")[0],a=document.createElement("script");return a.type="text/javascript",n?n.callback(function(n){Package.log("[EXEC]  "+e);var r=Function("code","eval(code)");r(n),t()}):(Package.log("[LOAD] "+e),a.src=e,a.onload=a.onreadystatechange=function(){var e=a.readyState,n=a.status;(!e||"loaded"===e||"complete"===e||4===e&&200===n)&&(t(),a.onload=a.onreadystatechange=r._K,i=null,a=null)},i.appendChild(a),void 0)},loadStyle:function(e){var t=document.createElement("link");t.rel="stylesheet",t.type="text/css",t.href=this.cacheBust(e),document.getElementsByTagName("head")[0].appendChild(t)},_K:function(){}},Package.RhinoLoader={usable:function(){return"object"==typeof java&&"function"==typeof require},__FILE__:function(){return this._currentPath},loadFile:function(e,t){var n=java.lang.System.getProperty("user.dir"),r=e.replace(/\.[^\.]+$/g,""),i=""+new java.io.File(n,r);this._currentPath=i+".js";var r=require(i);return t(r),r}},Package.ServerLoader={usable:function(){return"function"==typeof Package._getObject("load")&&"function"==typeof Package._getObject("version")},__FILE__:function(){return this._currentPath},loadFile:function(e,t){this._currentPath=e,load(e),t()}},Package.WshLoader={usable:function(){return!!Package._getObject("ActiveXObject")&&!!Package._getObject("WScript")},__FILE__:function(){return this._currentPath},loadFile:function(path,fireCallbacks){this._currentPath=path;var fso=new ActiveXObject("Scripting.FileSystemObject"),file,runner;try{file=fso.OpenTextFile(path),runner=function(){eval(file.ReadAll())},runner(),fireCallbacks()}finally{try{file&&file.Close()}catch(e){}}}},Package.XULRunnerLoader={jsloader:"@mozilla.org/moz/jssubscript-loader;1",cssservice:"@mozilla.org/content/style-sheet-service;1",ioservice:"@mozilla.org/network/io-service;1",usable:function(){try{var e=(Components||{}).classes;return!!(e&&e[this.jsloader]&&e[this.jsloader].getService)}catch(t){return!1}},setup:function(){var e=Components.classes,t=Components.interfaces;this.ssl=e[this.jsloader].getService(t.mozIJSSubScriptLoader),this.sss=e[this.cssservice].getService(t.nsIStyleSheetService),this.ios=e[this.ioservice].getService(t.nsIIOService)},loadFile:function(e,t){Package.log("[LOAD] "+e),this.ssl.loadSubScript(e),t()},loadStyle:function(e){var t=this.ios.newURI(e,null,null);this.sss.loadAndRegisterSheet(t,this.sss.USER_SHEET)}};var candidates=[Package.XULRunnerLoader,Package.RhinoLoader,Package.BrowserLoader,Package.CommonJSLoader,Package.ServerLoader,Package.WshLoader],n=candidates.length,i,candidate;for(i=0;n>i;i++)if(candidate=candidates[i],candidate.usable()){Package.loader=candidate,candidate.setup&&candidate.setup();break}var DSL={__FILE__:function(){return Package.loader.__FILE__()},pkg:function(e,t){var n=t?Package._getByPath(t):Package._getByName(e);return n.provides(e),n},file:function(){for(var e=[],t=arguments.length;t--;)e[t]=resolve(arguments[t]);return Package._getByPath.apply(Package,e)},load:function(e,t){Package.loader.loadFile(e,t)},autoload:function(e,t){Package._autoload(e,t)}};DSL.files=DSL.file,DSL.loader=DSL.file;var packages=function(e){e.call(DSL)},parseLoadArgs=function(e){for(var t=[],n=0;"string"==typeof e[n];)t.push(e[n]),n+=1;return{files:t,callback:e[n],context:e[n+1]}};exports.load=function(){var e=parseLoadArgs(arguments),t=e.files.length,n=function(r){return r===t?e.callback.call(e.context):(Package.loader.loadFile(e.files[r],function(){n(r+1)}),void 0)};n(0)},exports.require=function(){var e=parseLoadArgs(arguments);return Package.when({complete:e.files},function(t){e.callback&&e.callback.apply(e.context,t&&t.complete)}),this},exports.Package=Package,exports.Packages=exports.packages=packages,exports.DSL=DSL});
//@ sourceMappingURL=package.js.map
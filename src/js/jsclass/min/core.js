var JS=void 0===this.JS?{}:this.JS;!function(t){var e="object"==typeof this.global?this.global:this,n="object"==typeof exports;n?(exports.JS=exports,JS=exports):e.JS=JS,t(e,JS)}(function(t,e){"use strict";var n={ENV:t};n.END_WITHOUT_DOT=/([^\.])$/,n.array=function(t){for(var e=[],n=t.length;n--;)e[n]=t[n];return e},n.bind=function(t,e){return function(){return t.apply(e,arguments)}},n.Date=n.ENV.Date,n.extend=function(t,e,n){if(!t||!e)return t;for(var i in e)t[i]!==e[i]&&(n===!1&&t.hasOwnProperty(i)||(t[i]=e[i]));return t},n.indexOf=function(t,e){if(t.indexOf)return t.indexOf(e);for(var n=t.length;n--;)if(t[n]===e)return n;return-1},n.isType=function(t,e){return"string"==typeof e?typeof t===e:null===t||void 0===t?!1:"function"==typeof e&&t instanceof e||t.isA&&t.isA(e)||t.constructor===e},n.makeBridge=function(t){var e=function(){};return e.prototype=t.prototype,new e},n.makeClass=function(t){t=t||Object;var e=function(){return this.initialize?this.initialize.apply(this,arguments)||this:this};return e.prototype=n.makeBridge(t),e.superclass=t,e.subclasses=[],t.subclasses&&t.subclasses.push(e),e},n.match=function(t,e){return void 0===e?!1:"function"==typeof t.test?t.test(e):t.match(e)},n.Method=n.makeClass(),n.extend(n.Method.prototype,{initialize:function(t,e,n){if(this.module=t,this.name=e,this.callable=n,this._words={},"function"==typeof n){this.arity=n.length;for(var i=(""+n).match(/\b[a-z\_\$][a-z0-9\_\$]*\b/gi),r=i.length;r--;)this._words[i[r]]=!0}},setName:function(t){this.callable.displayName=this.displayName=t},contains:function(t){return this._words.hasOwnProperty(t)},call:function(){return this.callable.call.apply(this.callable,arguments)},apply:function(t,e){return this.callable.apply(t,e)},compile:function(t){for(var i,r=this,s=r.module.__trace__||t.__trace__,o=r.callable,_=r._words,a=n.Method._keywords,u=a.length,l=[];u--;)i=a[u],_[i.name]&&l.push(i);if(0===l.length&&!s)return o;var h=function(){for(var e,n,i,s=l.length,_=s,a={};_--;)e=l[_],n=this[e.name],(!n||n.__kwd__)&&(a[e.name]={_value:n,_own:this.hasOwnProperty(e.name)},i=e.filter(r,t,this,arguments),i&&(i.__kwd__=!0),this[e.name]=i);for(var u=o.apply(this,arguments),_=s;_--;)e=l[_],a[e.name]&&(a[e.name]._own?this[e.name]=a[e.name]._value:delete this[e.name]);return u},c=s&&(e.StackTrace||require("./stack_trace").StackTrace);return s?c.wrap(h,r,t):h},toString:function(){var t=this.displayName||""+this.module+"#"+this.name;return"#<Method:"+t+">"}}),n.Method.create=function(t,e,n){if(n&&n.__inc__&&n.__fns__)return n;var i="function"!=typeof n?n:new this(t,e,n);return this.notify(i),i},n.Method.compile=function(t,e){return t instanceof this?t.compile(e):t},n.Method.__listeners__=[],n.Method.added=function(t,e){this.__listeners__.push([t,e])},n.Method.notify=function(t){for(var e,n=this.__listeners__,i=n.length;i--;)e=n[i],e[0].call(e[1],t)},n.Method._keywords=[],n.Method.keyword=function(t,e){this._keywords.push({name:t,filter:e})},n.Method.tracing=function(t,n,i){var r=e.require?e:require("./loader");r.require("JS.StackTrace",function(e){var r=e.logger,s=r.active;t=[].concat(t),this.trace(t),r.active=!0,n.call(i),this.untrace(t),r.active=s},this)},n.Method.trace=function(t){for(var e=t.length;e--;)t[e].__trace__=!0,t[e].resolve()},n.Method.untrace=function(t){for(var e=t.length;e--;)t[e].__trace__=!1,t[e].resolve()},n.Module=n.makeClass(),n.Module.__queue__=[],n.extend(n.Module.prototype,{initialize:function(t,e,i){"string"!=typeof t&&(i=arguments[1],e=arguments[0],t=void 0),i=i||{},this.__inc__=[],this.__dep__=[],this.__fns__={},this.__tgt__=i._target,this.__anc__=null,this.__mct__={},this.setName(t),this.include(e,{_resolve:!1}),n.Module.__queue__&&n.Module.__queue__.push(this)},setName:function(t){this.displayName=t||"";for(var e in this.__fns__)this.__name__(e);t&&this.__meta__&&this.__meta__.setName(t+".")},__name__:function(t){if(this.displayName){var e=this.__fns__[t];if(e)return t=this.displayName.replace(n.END_WITHOUT_DOT,"$1#")+t,"function"==typeof e.setName?e.setName(t):("function"==typeof e&&(e.displayName=t),void 0)}},define:function(t,e,i){var r=n.Method.create(this,t,e),s=(i||{})._resolve;this.__fns__[t]=r,this.__name__(t),s!==!1&&this.resolve()},include:function(t,e){if(!t)return this;var n,i,r,s,o,_,e=e||{},a=e._resolve!==!1,u=t.extend,l=t.include;if(t.__fns__&&t.__inc__)this.__inc__.push(t),(t.__dep__||{}).push&&t.__dep__.push(this),(n=e._extended)?"function"==typeof t.extended&&t.extended(n):"function"==typeof t.included&&t.included(this);else{if(this.shouldIgnore("extend",u))for(s=[].concat(u),o=0,_=s.length;_>o;o++)this.extend(s[o]);if(this.shouldIgnore("include",l))for(s=[].concat(l),o=0,_=s.length;_>o;o++)this.include(s[o],{_resolve:!1});for(i in t)t.hasOwnProperty(i)&&(r=t[i],this.shouldIgnore(i,r)||this.define(i,r,{_resolve:!1}));t.hasOwnProperty("toString")&&this.define("toString",t.toString,{_resolve:!1})}return a&&this.resolve(),this},alias:function(t){for(var e in t)t.hasOwnProperty(e)&&this.define(e,this.instanceMethod(t[e]),{_resolve:!1});this.resolve()},resolve:function(t){var e,i,r,s,t=t||this,o=t.__tgt__,_=this.__inc__,a=this.__fns__;if(t===this)for(this.__anc__=null,this.__mct__={},e=this.__dep__.length;e--;)this.__dep__[e].resolve();if(o){for(e=0,i=_.length;i>e;e++)_[e].resolve(t);for(r in a)s=n.Method.compile(a[r],t),o[r]!==s&&(o[r]=s);a.hasOwnProperty("toString")&&(o.toString=n.Method.compile(a.toString,t))}},shouldIgnore:function(t,e){return("extend"===t||"include"===t)&&("function"!=typeof e||e.__fns__&&e.__inc__)},ancestors:function(t){var e=!t,t=t||[],i=this.__inc__;if(e&&this.__anc__)return this.__anc__.slice();for(var r=0,s=i.length;s>r;r++)i[r].ancestors(t);return n.indexOf(t,this)<0&&t.push(this),e&&(this.__anc__=t.slice()),t},lookup:function(t){var e=this.__mct__[t];if(e&&e.slice)return e.slice();for(var n,i=this.ancestors(),r=[],s=0,o=i.length;o>s;s++)n=i[s].__fns__,n.hasOwnProperty(t)&&r.push(n[t]);return this.__mct__[t]=r.slice(),r},includes:function(t){if(t===this)return!0;for(var e=this.__inc__,n=0,i=e.length;i>n;n++)if(e[n].includes(t))return!0;return!1},instanceMethod:function(t){return this.lookup(t).pop()},instanceMethods:function(t,e){var i,r=e||[],s=this.__fns__;for(i in s)n.isType(this.__fns__[i],n.Method)&&(n.indexOf(r,i)>=0||r.push(i));if(t!==!1)for(var o=this.ancestors(),_=o.length;_--;)o[_].instanceMethods(!1,r);return r},match:function(t){return t&&t.isA&&t.isA(this)},toString:function(){return this.displayName}}),n.Kernel=new n.Module("Kernel",{__eigen__:function(){if(this.__meta__)return this.__meta__;var t=""+this+".";return this.__meta__=new n.Module(t,null,{_target:this}),this.__meta__.include(this.klass,{_resolve:!1})},equals:function(t){return this===t},extend:function(t,e){var n=(e||{})._resolve;return this.__eigen__().include(t,{_extended:this,_resolve:n}),this},hash:function(){return n.Kernel.hashFor(this)},isA:function(t){return"function"==typeof t&&this instanceof t||this.__eigen__().includes(t)},method:function(t){var e=this.__mct__=this.__mct__||{},i=e[t],r=this[t];if("function"!=typeof r)return r;if(i&&r===i._value)return i._bound;var s=n.bind(r,this);return e[t]={_value:r,_bound:s},s},methods:function(){return this.__eigen__().instanceMethods()},tap:function(t,e){return t.call(e,this),this},toString:function(){if(this.displayName)return this.displayName;var t=this.klass.displayName||""+this.klass;return"#<"+t+":"+this.hash()+">"}}),function(){var t=1;n.Kernel.hashFor=function(e){return void 0!==e.__hash__?e.__hash__:(e.__hash__=((new n.Date).getTime()+t).toString(16),t+=1,e.__hash__)}}(),n.Class=n.makeClass(n.Module),n.extend(n.Class.prototype,{initialize:function(t,e,i,r){"string"!=typeof t&&(r=arguments[2],i=arguments[1],e=arguments[0],t=void 0),"function"!=typeof e&&(r=i,i=e,e=Object),n.Module.prototype.initialize.call(this,t),r=r||{};var s=n.makeClass(e);n.extend(s,this),s.prototype.constructor=s.prototype.klass=s,s.__eigen__().include(e.__meta__,{_resolve:r._resolve}),s.setName(t),s.__tgt__=s.prototype;var o=e===Object?{}:e.__fns__?e:new n.Module(e.prototype,{_resolve:!1});return s.include(n.Kernel,{_resolve:!1}).include(o,{_resolve:!1}).include(i,{_resolve:!1}),r._resolve!==!1&&s.resolve(),"function"==typeof e.inherited&&e.inherited(s),s}}),function(){var t=function(t){var e={},i=t.prototype;for(var r in i)i.hasOwnProperty(r)&&(e[r]=n.Method.create(t,r,i[r]));return e},e=function(e,i){var r=n[e],s=n[i];r.__inc__=[],r.__dep__=[],r.__fns__=t(r),r.__tgt__=r.prototype,r.prototype.constructor=r.prototype.klass=r,n.extend(r,n.Class.prototype),r.include(s||n.Kernel),r.setName(e),r.constructor=r.klass=n.Class};e("Method"),e("Module"),e("Class","Module");var i=n.Kernel.instanceMethod("__eigen__");i.call(n.Method).resolve(),i.call(n.Module).resolve(),i.call(n.Class).include(n.Module.__meta__)}(),n.NotImplementedError=new n.Class("NotImplementedError",Error),n.Method.keyword("callSuper",function(t,e,i,r){var s=e.lookup(t.name),o=s.length-1,_=n.array(r);if(0===o)return void 0;var a=function(){for(var t=arguments.length;t--;)_[t]=arguments[t];o-=1,0===o&&delete i.callSuper;var e=s[o].apply(i,_);return i.callSuper=a,o+=1,e};return a}),n.Method.keyword("blockGiven",function(t,e,n,i){var r=Array.prototype.slice.call(i,t.arity),s="function"==typeof r[0];return function(){return s}}),n.Method.keyword("yieldWith",function(t,e,n,i){var r=Array.prototype.slice.call(i,t.arity);return function(){return"function"==typeof r[0]?r[0].apply(r[1]||null,arguments):void 0}}),n.Interface=new n.Class("Interface",{initialize:function(t){this.test=function(e,n){for(var i=t.length;i--;)if("function"!=typeof e[t[i]])return n?t[i]:!1;return!0}},extend:{ensure:function(){for(var t,e,i=n.array(arguments),r=i.shift();t=i.shift();)if(e=t.test(r,!0),e!==!0)throw Error("object does not implement "+e+"()")}}}),n.Singleton=new n.Class("Singleton",{initialize:function(t,e,i){return new new n.Class(t,e,i)}}),n.extend(e,n),t.JS&&n.extend(t.JS,n)});
//# sourceMappingURL=core.js.map